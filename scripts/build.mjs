import { build } from "esbuild";
import { cp, mkdir, readFile, writeFile } from "node:fs/promises";
import { compileCitations, escapeHTML } from "../src/compiler.mjs";
import { makeCache } from "../src/records.mjs";
import { demoCache } from "./demo-cache.mjs";

const version = JSON.parse(await readFile("package.json", "utf8")).version;
const fixtures = JSON.parse(await readFile("fixtures/citation-demo-cases.json", "utf8"));
const cache = demoCache(fixtures);
const prose = await readFile("demos/static/reading.txt", "utf8");
const article = compileCitations(prose, cache, { namespace: "reading" });
const json = value => JSON.stringify(value, null, 2) + "\n";
const simas = "doi:10.1017/s0003055419000534";
const seed = compileCitations(`Start with the journal article {citation ${simas}}.\n\n{citation evidence} · {citation credit}\n\n{citation endnote}`, cache, { namespace: "live" });

await mkdir("dist", { recursive: true });
await build({
  entryPoints: ["src/browser.mjs"], bundle: true, format: "esm", target: "es2022",
  outfile: "dist/citation-inspector.mjs",
  banner: { js: `/*! citation-inator v${version} | MIT | See LICENSE */` }
});
await Promise.all([
  cp("src/citation-inspector.css", "dist/citation-inspector.css"),
  cp("LICENSE", "dist/LICENSE"),
  writeFile("dist/citations.json", json(cache))
]);

const preferences = `<div class="demo-preferences" data-demo-preferences role="group" aria-label="Demo preferences" hidden>
  <label><input type="checkbox" name="activation"> Hover</label>
  <label>Style
    <select name="theme">
      <option value="reading">Reading room</option>
      <option value="field">Field notes</option>
      <option value="midnight">Midnight</option>
    </select>
  </label>
</div>`;

function document({ title, intro, content, active, showPreferences = active && active !== "guide", assets = "../../dist/", style = "../static/demo.css", script = "", nav = true }) {
  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${title} | citation.inator</title>
  <link rel="stylesheet" href="${assets}citation-inspector.css">
  ${style ? `<link rel="stylesheet" href="${style}">` : ""}
  <script type="module" src="${assets}citation-inspector.mjs"></script>
${showPreferences ? '  <script type="module" src="../static/preferences.mjs"></script>\n' : ""}${script ? `  ${script}\n` : ""}</head>
<body>
  <header class="site"><a class="brand" href="./">citation.inator</a>
  ${nav ? `<nav aria-label="Demos">
    <a href="../static/" ${active === "static" ? 'aria-current="page"' : ""}>Reading room</a>
    <a href="../dynamic/" ${active === "dynamic" ? 'aria-current="page"' : ""}>Resolution bench</a>
    <a href="../christopher-drop-in/">Plain HTML</a>
    <a class="guide-link" href="../static/guide.html" ${active === "guide" ? 'aria-current="page"' : ""}>Guide</a>
  </nav>` : ""}</header>
  <main>
    <h1>${title}</h1>
    <p class="intro">${intro}</p>
${showPreferences ? `    ${preferences}\n` : ""}    ${content}
  </main>
  <footer class="site">citation.inator · Portable Citation Inspector ${version}</footer>
</body>
</html>
`;
}

await writeFile("demos/static/index.html", document({
  title: "Follow the source.",
  intro: "Open a citation in the reading below to inspect its source. The endnotes also work when JavaScript is off.",
  active: "static",
  content: `<article class="reading" aria-labelledby="reading-title">
    <h2 id="reading-title">A short reading on empathy and shared ritual</h2>
    <citation-inspector data-cache="./citations.json">${article.html}</citation-inspector>
  </article>`
}));
await writeFile("demos/static/citations.json", json(article.cache));

await writeFile("demos/dynamic/index.html", document({
  title: "Resolution bench.",
  intro: "Resolve a DOI on demand or rehearse what a reader sees when the provider sends incomplete metadata or goes offline.",
  active: "dynamic",
  script: '<script type="module" src="./dynamic.mjs"></script>',
  content: `<form id="resolve-form">
    <label for="identifier">Identifier or single citation directive</label>
    <input id="identifier" name="identifier" required maxlength="2048" value="${simas}" spellcheck="false" autocapitalize="off">
    <p class="resolve-examples">Try <button type="button" data-example="doi:10.1111/spc3.12501">another article</button> or <button type="button" data-example="isbn:9780593656433">a cached book</button>.</p>
    <div class="controls">
      <div><label for="mode">Provider mode</label>
      <select name="mode" id="mode">
        <option value="live">Live Crossref</option>
        <option value="offline">Simulate outage with stale cache</option>
        <option value="partial">Simulate partial metadata</option>
        <option value="slow">Simulate slow cached response</option>
      </select></div>
      <button type="submit" name="intent" value="resolve" disabled>Resolve</button>
      <button type="submit" name="intent" value="refresh" disabled>Force refresh</button>
    </div>
    <noscript><p>Enable JavaScript to request a refresh. The sample and endnote are ready to read below.</p></noscript>
  </form>
  <div class="resolution-result">
    <p id="resolution-status" class="runtime-status" role="status">Ready to resolve. The reader shows a sample from the editorial cache.</p>
    <button type="button" id="show-result" hidden>Show updated citation</button>
  </div>
  <article class="reading" aria-labelledby="live-title">
    <h2 id="live-title">Reader view</h2>
    <citation-inspector id="live-reader" data-cache="./citations.json">${seed.html}</citation-inspector>
  </article>`
}));
await writeFile("demos/dynamic/citations.json", json(seed.cache));

const notation = [
  ["{citation doi:10.1017/S0003055419000534}", "An inline author–year citation. Replace DOI with an identifier or a local record key."],
  ["{citation DOI; ISBN}", "Group parenthetical citations. A semicolon separates items."],
  ['{citation DOI | label:"the study"}', "Supply the words readers see. Quoted labels can contain pipes and semicolons."],
  ["{citation DOI | fallback words}", "Supply the text to show when the identifier cannot be resolved."],
  ["{citation DOI | form:parenthetical}", "Author and year inside parentheses. This is the default."],
  ["{citation DOI | form:narrative}", "Author in the sentence, followed by the year in parentheses."],
  ["{citation DOI | form:author-only}", "Author with no date and no parentheses."],
  ["{citation DOI | form:suppress-author}", "Year alone in parentheses."],
  ["{citation DOI | form:suppress-year}", "Author alone in parentheses."],
  ["{citation endnote}", "Place the bibliography. Give it its own paragraph. The compiler appends endnotes when this marker is absent."],
  ["{citation evidence}", "Show cited source metadata or the Resolution bench’s latest provider response and merge decisions when available."],
  ["{citation credit}", "Show the software credit, license and suggested citation."]
];

const loadingExample = `<link rel="stylesheet" href="./citation-inspector.css">
<script type="module" src="./citation-inspector.mjs"></script>

<citation-inspector data-cache="./citations.json" class-prefix="my-site-citation">
  <!-- Paste the compiled HTML fragment here. -->
</citation-inspector>`;

const initExample = `import { initializeCitationInspector } from "./citation-inspector.mjs";

initializeCitationInspector(document.querySelector("citation-inspector"), {
  classPrefix: "my-site-citation",
  activation: "hover"
});`;

await writeFile("demos/static/guide.html", document({
  title: "Citation guide",
  intro: "See the markup behind the reading room, then use the same notation in your own document.",
  active: "guide",
  content: `<article class="reading guide">
    <section aria-labelledby="guide-load">
      <h2 id="guide-load">Load and initialize</h2>
      <p>Copy the browser module and its adjacent CSS to your site. Serve the compiled citation fragment and its cache from the same origin. The module registers the element when it loads.</p>
      <pre><code>${escapeHTML(loadingExample)}</code></pre>
      <p>Set options on the element or in your site's browser module. The default classes start with <code>citation-</code>. Use <code>class-prefix</code> or <code>classPrefix</code> to give them your own prefix.</p>
      <pre><code>${escapeHTML(initExample)}</code></pre>
    </section>
    <section aria-labelledby="guide-use">
      <h2 id="guide-use">Using the demo</h2>
      <p>Click a reference to inspect it. Enable <strong>Hover</strong> to preview citations, evidence, and credit with the mouse. To reposition the panel, choose <strong>Move panel</strong> from the three-dot menu and click or tap the destination. You can also drag from a blank area. You can still select text and use links and buttons. When the panel opens from a click or keyboard activation, its heading has focus. Use the arrow keys to move it or Home to reset. Press Escape or click or tap outside to dismiss it. Each return arrow in the endnotes leads to its own occurrence in the text.</p>
      <p>On the <a href="../dynamic/">Resolution bench</a>, enter an identifier or choose a sample. <strong>Resolve</strong> can reuse a fresh cache. <strong>Force refresh</strong> asks Crossref again for a DOI. Open <strong>Citation evidence</strong> to see the provider response and how the result was assembled.</p>
    </section>
    <section aria-labelledby="guide-source">
      <h2 id="guide-source">Exact source of the reading room</h2>
      <p>The compiler turns the directives below into references, endnotes, and supplementary panels. <a href="./reading.txt">Open the plain-text source</a>.</p>
      <pre><code>${escapeHTML(prose.trim())}</code></pre>
    </section>
    <section aria-labelledby="guide-notation">
      <h2 id="guide-notation">Complete notation</h2>
      <dl>${notation.map(([syntax, explanation]) => `<dt><code>${escapeHTML(syntax)}</code></dt><dd>${explanation}</dd>`).join("")}</dl>
      <p>Use <code>doi:</code>, <code>isbn:</code>, <code>pmid:</code>, <code>pmcid:</code>, <code>arxiv:</code>, <code>url:</code>, <code>dataset:</code>, <code>software:</code>, a recognized HTTPS URL or an ID from the local cache. Bare DOIs also work. A missing record is marked unresolved.</p>
      <p>Keep each directive on one line. Use a backslash to escape literal braces. Inside a directive, a backslash escapes a semicolon, pipe, quote, brace or backslash. Legacy <code>{cite …}</code> and <code>{endnotes}</code> also work.</p>
      <h3>Set your keyword</h3>
      <p>The default keyword is <code>citation</code>. To use <code>ref</code>, create a compiler with <code>createCitationCompiler({ citationKeyword: "ref" })</code>. Then write <code>{ref DOI}</code>, <code>{ref endnote}</code>, <code>{ref evidence}</code>, and <code>{ref credit}</code>. Use 1–32 lowercase ASCII letters, digits or hyphens, starting with a letter.</p>
    </section>
  </article>`
}));

const portable = "demos/christopher-drop-in/";
await Promise.all(["citation-inspector.mjs", "citation-inspector.css", "LICENSE"].map(name => cp(`dist/${name}`, portable + name)));
await writeFile(portable + "citations.json", json(article.cache));
await Promise.all([
  cp("demos/static/reading.txt", portable + "reading.txt"),
  cp("CITATION.cff", portable + "CITATION.cff")
]);
await writeFile(portable + "index.html", `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Sources in plain HTML</title>
  <link rel="stylesheet" href="./citation-inspector.css">
  <script type="module" src="./citation-inspector.mjs"></script>
</head>
<body>
  <main>
    <h1>Sources in plain HTML</h1>
    <p>Click a citation to inspect it. Without JavaScript, it links directly to its endnote.</p>
    <citation-inspector data-cache="./citations.json">${article.html}</citation-inspector>
  </main>
</body>
</html>
`);

const longRecord = {
  id: "synthetic-long", type: "article-journal", state: "resolved", issued: [2020],
  title: "اختبار الاستشهادات · 微細構造と記録 · <img src=x onerror=alert(1)> · p < 0.01 · " + "unbroken".repeat(18),
  authors: Array.from({ length: 100 }, (_, i) => ({ literal: `研究者 ${i + 1}` })),
  identifiers: [{ scheme: "pmid", value: "12345678" }, { scheme: "doi", value: `10.99999/${"x".repeat(110)}` }],
  locations: [{ kind: "publisher", provider: "PubMed", url: "javascript:alert(1)" }],
  abstract: { text: "Synthetic safety fixture. x < 1; x > 0. <script>alert(1)</script>", source: "Local test fixture" },
  provenance: [{ provider: "Local test fixture", note: "Synthetic record. External identifiers are illustrative and should not be followed." }]
};
const related = { ...longRecord, id: "synthetic-related", title: "Zebra test of same-year ordering", identifiers: [], abstract: null, integrity: { state: "retracted", source: "Simulated status evidence" } };
const hard = compileCitations(`Open the first synthetic record {cite synthetic-long} and the second {cite synthetic-related}.

Repeated as a group {cite synthetic-long; synthetic-related}. In narrative form, {cite synthetic-long | form:narrative} is cited again.

A malformed directive stays readable {cite pmid:zero}.

{citation evidence}

{endnotes}`, makeCache([longRecord, related]), { namespace: "adversary" });
await writeFile("demos/static/adversaries.json", json(hard.cache));
await writeFile("demos/static/adversaries.html", document({
  title: "Hostile host assay.",
  intro: "This synthetic fixture has 100 authors, bidirectional text, missing destinations, a simulated retraction and literal markup.",
  style: "./hostile.css",
  content: `<div class="clipped"><citation-inspector data-cache="./adversaries.json">${hard.html}</citation-inspector></div>`
}));
