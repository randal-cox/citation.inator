import assert from "node:assert/strict";
import { execFile } from "node:child_process";
import { mkdtemp, mkdir, writeFile, copyFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { promisify } from "node:util";
import { projectRoot, commonsRoot, sharedTool } from "./toolchain.mjs";

const execute = promisify(execFile);
const root = await mkdtemp(path.join(tmpdir(), "cite-boundary-control-"));
const scanner = await sharedTool(
  "tools/adversary-lab/node_modules/dependency-cruiser/bin/dependency-cruiser.mjs",
);
const config = path.join(root, "dependency-cruiser.cjs");
await copyFile(
  path.join(projectRoot, "scripts/quality/dependency-cruiser.cjs"),
  config,
);
const args = [scanner, "--config", config, "--output-type", "json", "src"];
try {
  await mkdir(path.join(root, "src"));
  await mkdir(path.join(root, "scripts"));
  await writeFile(path.join(root, "src/helper.mjs"), "export const value=1;\n");
  await writeFile(
    path.join(root, "scripts/adapter.mjs"),
    "export const value=1;\n",
  );
  const file = path.join(root, "src/portable.mjs");
  await writeFile(
    file,
    "import {value} from './helper.mjs'; export {value};\n",
  );
  const positive = await execute(process.execPath, args, {
    cwd: root,
    timeout: 20000,
    maxBuffer: 2 * 1024 * 1024,
  });
  assert.equal(JSON.parse(positive.stdout).summary.violations.length, 0);
  await writeFile(file, "import '../scripts/adapter.mjs'; import 'node:fs';\n");
  const negative = JSON.parse(
    (
      await execute(process.execPath, args, {
        cwd: root,
        timeout: 20000,
        maxBuffer: 2 * 1024 * 1024,
      })
    ).stdout,
  );
  const rules = new Set(
    negative.summary.violations.map((violation) => violation.rule.name),
  );
  assert(rules.has("library-does-not-import-tooling"));
  assert(rules.has("portable-library-has-no-node-builtins"));
  // Exercise the actual status adapter too: the scanner's JSON reporter itself exits zero on errors.
  await mkdir(path.join(root, "scripts/quality"), { recursive: true });
  for (const relative of [
    "scripts/quality.mjs",
    "scripts/quality/toolchain.mjs",
    "scripts/quality/dependency-cruiser.cjs",
  ])
    await copyFile(path.join(projectRoot, relative), path.join(root, relative));
  await execute("git", ["init", "--quiet"], { cwd: root, timeout: 10000 });
  await execute("git", ["add", "src", "scripts"], {
    cwd: root,
    timeout: 10000,
  });
  let rejected = false;
  try {
    await execute(
      process.execPath,
      [path.join(root, "scripts/quality.mjs"), "scan", "dependencies"],
      {
        cwd: root,
        env: { ...process.env, INATOR_COMMONS_ROOT: commonsRoot },
        timeout: 20000,
        maxBuffer: 2 * 1024 * 1024,
      },
    );
  } catch (error) {
    if (error.code !== 1) throw error;
    rejected = true;
  }
  assert(
    rejected,
    "Quality adapter must propagate dependency violations as failure.",
  );
  console.log(
    "Boundary controls PASS: portable source accepted; Node builtin and tooling imports rejected.",
  );
} finally {
  await rm(root, { recursive: true, force: true });
}
