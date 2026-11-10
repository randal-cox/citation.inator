#!/usr/bin/env node
import { readFile, writeFile } from "node:fs/promises";
import { compileCitations } from "../src/compiler.mjs";

const [sourcePath, cachePath, outputPath, namespace = "cit", citationKeyword = "citation", classPrefix = "citation"] = process.argv.slice(2);
if (!sourcePath || !cachePath || !outputPath) {
  console.error("Usage: citation-inator prose.txt input-cache.json output.html [document-namespace] [citation-keyword] [class-prefix]");
  process.exitCode = 1;
} else {
  const source = await readFile(sourcePath, "utf8");
  const cache = JSON.parse(await readFile(cachePath, "utf8"));
  const output = compileCitations(source, cache, { namespace, citationKeyword, classPrefix });
  await writeFile(outputPath, output.html + "\n");
  await writeFile(outputPath + ".json", JSON.stringify(output.cache, null, 2) + "\n");
  for (const diagnostic of output.diagnostics) console.error(diagnostic);
}
