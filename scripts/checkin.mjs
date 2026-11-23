import { execFileSync } from "node:child_process";
import { readFile } from "node:fs/promises";
import { resolve, posix } from "node:path";

const staged = process.argv.includes("--staged");
const git = (...args) => execFileSync("git", args, { encoding: "utf8", maxBuffer: 16 * 1024 * 1024, stdio: ["pipe", "pipe", "pipe"] });
const root = git("rev-parse", "--show-toplevel").trim();
const listing = staged ? ["ls-files", "-z"] : ["ls-files", "--cached", "--others", "--exclude-standard", "-z"];
const files = new Set(git(...listing).split("\0").filter(Boolean));
const failures = [];
const read = path => staged
  ? Promise.resolve(git("show", ":" + path))
  : readFile(resolve(root, path), "utf8");
const fail = message => failures.push(message);

try {
  git("diff", "--cached", "--check");
  if (!staged) git("diff", "--check");
} catch (error) {
  fail(error.stdout?.toString().trim() || error.message);
}

try {
  const pkg = JSON.parse(await read("package.json"));
  const lock = JSON.parse(await read("package-lock.json"));
  if (pkg.version !== lock.version || pkg.version !== lock.packages?.[""]?.version) fail("Manifest and lockfile versions differ.");
  const cff = await read("CITATION.cff");
  const cffVersion = cff.match(/^version:\s*["']?([^"'\n]+)["']?$/m)?.[1]?.trim();
  if (cffVersion !== pkg.version) fail("CITATION.cff version differs from package.json.");
  const banner = "/*! citation-inator v" + pkg.version + " |";
  for (const path of ["dist/citation-inspector.mjs", "demos/drop-in/citation-inspector.mjs"]) {
    if (!(await read(path)).startsWith(banner)) fail(path + " has a stale version banner. Run npm run build.");
  }
  for (const path of ["dist/citation-tools.mjs", "demos/drop-in/citation-tools.mjs"]) {
    if (!(await read(path)).startsWith("/*! citation-inator tools v" + pkg.version + " |")) fail(path + " has a stale tools version banner. Run npm run build.");
  }
  for(const path of ['dist/citation-compiler.mjs','demos/drop-in/citation-compiler.mjs'])if(!(await read(path)).startsWith('/*! citation-inator compiler v'+pkg.version+' |'))fail(path+' has a stale compiler banner. Run npm run build.');
  for (const [source, copy] of [
    ["src/citation-inspector.css", "dist/citation-inspector.css"],
    ["dist/citation-inspector.css", "demos/drop-in/citation-inspector.css"],
    ["dist/citation-inspector.mjs", "demos/drop-in/citation-inspector.mjs"],
    ["dist/citation-tools.mjs", "demos/drop-in/citation-tools.mjs"],
    ...["citation-compiler.mjs","citation-import.mjs","citation-import-files.mjs","citation-pdf.worker.mjs"].map(name=>["dist/"+name,"demos/drop-in/"+name]),
    ["dist/THIRD_PARTY_LICENSES.txt", "demos/drop-in/THIRD_PARTY_LICENSES.txt"],
    ["CITATION.cff", "demos/drop-in/CITATION.cff"],
    ...["integration.md", "reader-access.md", "media-support.md", "article-tools.md", "citation-styles.md", "import-api.md"].map(name => ["docs/" + name, "demos/drop-in/" + name])
  ]) {
    if (await read(source) !== await read(copy)) fail(copy + " differs from " + source + ". Run npm run build.");
  }
  const milestone = "docs/milestones/" + pkg.version.split("-")[0] + ".md";
  if (!files.has(milestone)) fail("Add the milestone record " + milestone + ".");
  else {
    const record = await read(milestone);
    for (const heading of ["Delivered", "Acceptance and evidence", "Known limits and follow-up"]) {
      if (!record.includes("## " + heading)) fail(milestone + " needs a " + heading + " section.");
    }
    if (!(await read("ROADMAP.md")).includes(milestone)) fail("Link the current milestone record from ROADMAP.md.");
  }
} catch (error) {
  fail("Could not check release metadata: " + error.message);
}

for (const path of files) {
  if (!path.endsWith(".md")) continue;
  try {
    const markdown = (await read(path)).replace(/^\s*```[^]*?^\s*```[^\n]*$/gm, "");
    for (const [, target] of markdown.matchAll(/\]\(([^\s)]+)\)/g)) {
      if (target.startsWith("#") || /^[a-z][a-z0-9+.-]*:/i.test(target) || target.startsWith("//")) continue;
      const raw = target.split("#")[0];
      if (!raw) continue;
      const destination = posix.normalize(posix.join(posix.dirname(path), decodeURIComponent(raw)));
      if (!files.has(destination)) fail(path + " links to missing tracked file " + target + ".");
    }
  } catch (error) {
    fail("Could not check " + path + ": " + error.message);
  }
}

if (failures.length) {
  console.error(failures.map(message => "- " + message).join("\n"));
  process.exitCode = 1;
} else {
  console.log((staged ? "Staged" : "Working-tree") + " check passed: versions, copied assets, milestone structure, local documentation files and whitespace.");
  console.log("Review milestone status, roadmap, evidence and applicable documentation before committing.");
}
