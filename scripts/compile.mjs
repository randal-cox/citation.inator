#!/usr/bin/env node
import { readFile, writeFile } from "node:fs/promises";
import { parseArgs } from "node:util";
import { compileCitations } from "../src/compiler.mjs";

async function compile(source, cache, options, format = "text") {
  if (format === "text") return compileCitations(source, cache, options);
  if (format !== "html" && format !== "markdown") throw new TypeError("Use text, html, or markdown format.");
  const { compileHTML, compileMarkdown } = await import("../src/markup.mjs");
  return (format === "html" ? compileHTML : compileMarkdown)(source, cache, options);
}

try {
  const { positionals, values } = parseArgs({
    allowPositionals: true,
    options: {
      json: { type: "boolean" }, format: { type: "string" },
      style: { type: "string" }, "endnotes-heading": { type: "string" }
    }
  });
  const overrides = {
    ...(values.style !== undefined && { citationStyle: values.style }),
    ...(values["endnotes-heading"] !== undefined && { endnotesHeading: values["endnotes-heading"] })
  };
  if (values.json) {
    if (positionals.length) throw new TypeError("--json reads one request from standard input.");
    process.stdin.setEncoding("utf8");
    let input = "";
    for await (const chunk of process.stdin) input += chunk;
    const { paragraphs, source, cache, options, format } = JSON.parse(input);
    if ((paragraphs === undefined) === (source === undefined) ||
        paragraphs !== undefined && !Array.isArray(paragraphs)) {
      throw new TypeError("Supply either a source string or an array of paragraphs.");
    }
    const output = await compile(paragraphs ?? source, cache, { ...options, ...overrides }, values.format ?? format);
    process.stdout.write(JSON.stringify(output) + "\n");
  } else {
    const [sourcePath, cachePath, outputPath, namespace = "cit", citationKeyword = "citation", classPrefix = "citation"] = positionals;
    if (!outputPath || positionals.length > 6) {
      throw new TypeError("Usage: citation-inator [--format text|html|markdown] [--style default|chicago-author-date|apa|mla|harvard|vancouver] [--endnotes-heading HEADING] SOURCE CACHE OUTPUT [NAMESPACE] [KEYWORD] [CLASS-PREFIX], or citation-inator --json");
    }
    const [source, data] = await Promise.all([readFile(sourcePath, "utf8"), readFile(cachePath, "utf8")]);
    const output = await compile(source, JSON.parse(data), { namespace, citationKeyword, classPrefix, ...overrides }, values.format);
    await writeFile(outputPath, output.html + "\n");
    await writeFile(outputPath + ".json", JSON.stringify(output.cache, null, 2) + "\n");
    for (const diagnostic of output.diagnostics) console.error(diagnostic);
  }
} catch (error) {
  console.error(error.message);
  process.exitCode = 1;
}
