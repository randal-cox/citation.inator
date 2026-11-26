import { spawn, execFileSync } from "node:child_process";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import {
  projectRoot,
  commonsRoot,
  sharedTool,
  toolManifest,
} from "./quality/toolchain.mjs";

const [action = "run", selection = "quick"] = process.argv.slice(2);
const tracked = () =>
  execFileSync("git", ["ls-files", "-z"], {
    cwd: projectRoot,
    encoding: "utf8",
    timeout: 10000,
  })
    .split("\0")
    .filter(Boolean);
const authored = (file) =>
  /^(src|scripts|test|learn)\//.test(file) &&
  !/(?:^|\/)vendor\//.test(file) &&
  !/ [0-9]+\.[^.]+$/.test(file);
const sourceFiles = tracked().filter(
  (file) => authored(file) && /\.[cm]?js$/.test(file),
);
let command = process.execPath,
  args;
if (action === "run" || action === "history") {
  const cli = await sharedTool("packages/dev-tools/bin/inator.mjs");
  args = [
    cli,
    "quality",
    action,
    ...(action === "run" ? [selection] : []),
    "--project",
    projectRoot,
  ];
} else if (action === "prepare") {
  const cli = await sharedTool("packages/dev-tools/bin/inator.mjs");
  args = [
    cli,
    "adversary",
    "prepare",
    "code-health-critic",
    "test-critic",
    "verifier",
    "--project",
    projectRoot,
    "--target",
    projectRoot,
    "--scope",
    "Authored portable library, CLI, examples and meaningful tests; readability, responsibilities, failure/resource handling and dependency boundaries. No code size quotas.",
    "--claim",
    "Public source contracts, classifier readiness, protected spans and transport ownership agree with executed behavior.",
    "--output",
    ".inator/adversary/cite-code-quality",
  ];
} else if (action === "scan") {
  const scans = {
    eslint: [
      "eslint/bin/eslint.js",
      [
        "--config",
        "scripts/quality/eslint.config.mjs",
        "--format",
        "json",
        ...sourceFiles,
      ],
    ],
    dependencies: [
      "dependency-cruiser/bin/dependency-cruiser.mjs",
      [
        "--config",
        "scripts/quality/dependency-cruiser.cjs",
        "--output-type",
        "json",
        ...sourceFiles.filter((file) => file.startsWith("src/")),
      ],
    ],
    knip: [
      "knip/bin/knip.js",
      [
        "--config",
        "scripts/quality/knip.json",
        "--reporter",
        "json",
        "--no-progress",
      ],
    ],
    stylelint: [
      "stylelint/bin/stylelint.mjs",
      [
        "--config",
        "scripts/quality/stylelint.config.mjs",
        "--formatter",
        "json",
        ...tracked().filter((file) => authored(file) && file.endsWith(".css")),
      ],
    ],
    formatting: ["prettier/bin/prettier.cjs", ["--check", ...sourceFiles]],
    biome: [
      "@biomejs/biome/bin/biome",
      ["lint", "--reporter=json", "--max-diagnostics=none", ...sourceFiles],
    ],
    duplicates: [
      "jscpd/run-jscpd.js",
      [
        "--reporters",
        "json",
        "--output",
        ".inator/quality-tools/duplicates",
        "--threshold",
        "100",
        "--ignore",
        "**/* [0-9]*.*,**/node_modules/**",
        "src",
      ],
    ],
    coverage: [
      "c8/bin/c8.js",
      [
        "--reporter",
        "text-summary",
        "--reporter",
        "json-summary",
        "--reports-dir",
        ".inator/quality-tools/coverage",
        "--include=src/**/*.mjs",
        process.execPath,
        "--test",
        ...tracked().filter((file) => /^test\/[^/]+\.test\.mjs$/.test(file)),
      ],
    ],
  };
  const scan = scans[selection];
  if (!scan) throw Error("Unknown quality scan: " + selection);
  command = process.execPath;
  args = [
    await sharedTool(path.join("tools/adversary-lab/node_modules", scan[0])),
    ...scan[1],
  ];
} else throw Error("Use run, history, prepare, or scan with an explicit tool.");

await mkdir(path.join(projectRoot, ".inator/quality-tools"), {
  recursive: true,
});
const manifest = await toolManifest();
await writeFile(
  path.join(projectRoot, ".inator/quality-tools/toolchain.json"),
  JSON.stringify(
    {
      commonsRoot,
      commonsRevision: execFileSync("git", ["rev-parse", "HEAD"], {
        cwd: commonsRoot,
        encoding: "utf8",
        timeout: 10000,
      }).trim(),
      node: process.version,
      labVersion: manifest.version,
      tools: { ...manifest.dependencies, ...manifest.devDependencies },
    },
    null,
    2,
  ),
);
const output =
  action === "scan"
    ? path.join(projectRoot, ".inator/quality-tools", selection)
    : null;
const child = spawn(command, args, {
  cwd: projectRoot,
  detached: process.platform !== "win32",
  stdio: ["ignore", output ? "pipe" : "inherit", output ? "pipe" : "inherit"],
});
let stdout = "",
  stderr = "",
  timedOut = false,
  outputLimitExceeded = false;
const budget =
  action === "run" ? 600000 : selection === "coverage" ? 300000 : 120000;
let forceTimer;
let stopRequested = false;
const cleanupErrors = [];
function stopOwnedProcesses(signal) {
  if (!Number.isInteger(child.pid)) return;
  try {
    if (process.platform === "win32") child.kill(signal);
    else process.kill(-child.pid, signal);
  } catch (error) {
    if (error.code !== "ESRCH") {
      cleanupErrors.push(error.code || error.message);
      child.kill(signal);
    }
  }
}
const interrupted = () => {
  timedOut = true;
  stopOwnedProcesses("SIGKILL");
};
process.once("SIGTERM", interrupted);
process.once("SIGINT", interrupted);
function requestStop() {
  if (stopRequested) return;
  stopRequested = true;
  stopOwnedProcesses("SIGTERM");
  forceTimer ??= setTimeout(() => stopOwnedProcesses("SIGKILL"), 2000);
}
const timer = setTimeout(() => {
  timedOut = true;
  requestStop();
}, budget);
child.on("error", (error) => {
  stderr += error.message;
});
child.stdout?.on("data", (chunk) => {
  if (Buffer.byteLength(stdout) + chunk.length > 8 * 1024 * 1024) {
    outputLimitExceeded = true;
    requestStop();
  } else stdout += chunk;
});
child.stderr?.on("data", (chunk) => {
  if (Buffer.byteLength(stderr) + chunk.length > 8 * 1024 * 1024) {
    outputLimitExceeded = true;
    requestStop();
  } else stderr += chunk;
});
let code = await new Promise((resolve) => child.on("close", resolve));
clearTimeout(timer);
clearTimeout(forceTimer);
process.removeListener("SIGTERM", interrupted);
process.removeListener("SIGINT", interrupted);
stopOwnedProcesses("SIGKILL");
// This tool's JSON reporter exits zero even when its graph contains error violations.
if (action === "scan" && selection === "dependencies" && code === 0) {
  try {
    const report = JSON.parse(stdout),
      summary = report.summary;
    if (
      !report.modules?.length ||
      !Array.isArray(summary?.violations) ||
      !Number.isInteger(summary.error)
    )
      throw Error("Incomplete dependency report.");
    if (
      summary.error > 0 ||
      summary.violations.some((item) => item.rule?.severity === "error")
    )
      code = 1;
  } catch (error) {
    stderr += "\n" + error.message;
    code = 2;
  }
}
if (output) {
  await writeFile(output + ".stdout", stdout);
  await writeFile(output + ".stderr", stderr);
  console.log(
    JSON.stringify({
      tool: selection,
      exitCode: code,
      timedOut,
      outputLimitExceeded,
      cleanupErrors,
      stdoutBytes: Buffer.byteLength(stdout),
      stderrBytes: Buffer.byteLength(stderr),
      evidence: path.relative(projectRoot, output),
    }),
  );
}
process.exitCode =
  timedOut || outputLimitExceeded || cleanupErrors.length || code === null
    ? 2
    : code;
