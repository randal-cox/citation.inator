import { build } from "esbuild";
import { cp, mkdir, readFile, writeFile } from "node:fs/promises";
import { compileCitations, escapeHTML } from "../src/compiler.mjs";
import { brandIconMarkup } from "../src/icons.mjs";
import { makeCache } from "../src/records.mjs";
import { demoCache } from "./demo-cache.mjs";
import { compileDemoStyles, demoStyles } from "./demo-styles.mjs";

const version = JSON.parse(await readFile("package.json", "utf8")).version;
const fixtures = JSON.parse(await readFile("fixtures/citation-demo-cases.json", "utf8"));
const notationRecords = JSON.parse(await readFile("fixtures/notation-records.json", "utf8"));
const cache = makeCache([...demoCache(fixtures).records, ...notationRecords]);
const prose = await readFile("demos/static/reading.txt", "utf8");
const article = compileDemoStyles(prose, cache, "reading");
const json = value => JSON.stringify(value, null, 2) + "\n";
const simas = "doi:10.1017/s0003055419000534";
const book = "isbn:9780593656433";
const seed = compileDemoStyles(`Open this book from the bundled cache {citation ${book}}. The ISBN is already filled in above.

{citation evidence} · {citation credit}

{citation endnote}`, cache, "live");

const alternateSource = String.raw`Custom keyword {ref isbn:9780593656433} and legacy citation {cite isbn:9780593656433}. Escaped characters can appear in a label {ref isbn:9780593656433 | label:"book\; edition\| \"hardcover\" \{example\} \\"}.

{ref evidence} · {ref credit}

{ref endnote}`;
const legacyEndnotesSource = "{cite isbn:9780593656433}\n\n{endnotes}";
const alternateOptions = { citationKeyword: "ref", classPrefix: "notation-example" };
const alternate = compileCitations(alternateSource, article.cache, { ...alternateOptions, namespace: "alternate" });
const legacyEndnotes = compileCitations(legacyEndnotesSource, article.cache, { ...alternateOptions, namespace: "legacy" });
const notationExamples = `<details class="notation-examples">
  <summary>Custom keyword and legacy notation</summary>
  <h3>Custom keyword</h3>
  <pre><code>${escapeHTML(alternateSource)}</code></pre>
  <section aria-label="Rendered custom keyword example">${alternate.html}</section>
  <h3>Legacy endnotes marker</h3>
  <pre><code>${escapeHTML(legacyEndnotesSource)}</code></pre>
  <section aria-label="Rendered legacy endnotes example">${legacyEndnotes.html}</section>
</details>`;

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

const preferenceHelp = (id, label, code, note = "") => `<span class="demo-help">
    <button type="button" aria-label="Configure ${label}" aria-describedby="demo-help-${id}">?</button>
    <span role="tooltip" id="demo-help-${id}"><code>${escapeHTML(code)}</code>${note ? `<span>${note}</span>` : ""}</span>
  </span>`;

const preferences = `<div class="demo-preferences" data-demo-preferences role="group" aria-label="Demo preferences" hidden>
  <span class="demo-setting">
    <label><input type="checkbox" name="activation"> Hover</label>
    ${preferenceHelp("hover", "Hover", 'initializeCitationInspector(element, { activation: "hover" })')}
  </span>
  <span class="demo-setting">
    <label for="demo-css">CSS</label>
    <select name="theme" id="demo-css">
      <option value="reading">Reading room</option>
      <option value="field">Field notes</option>
      <option value="midnight">Midnight</option>
    </select>
    ${preferenceHelp("css", "CSS", '<citation-inspector data-citation-theme="reading">', "Use with demos/static/demo.css. For a custom theme, set the --citation-* properties on the element.")}
  </span>
  <span class="demo-setting">
    <label for="demo-style">Style</label>
    <select name="citation-style" id="demo-style">
      ${Object.entries(demoStyles).map(([value, label]) => `<option value="${value}">${label}</option>`).join("\n      ")}
    </select>
    ${preferenceHelp("style", "Style", 'createCitationCompiler({ citationStyle: "default" })')}
  </span>
  <span data-style-status role="status"></span>
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
  <header class="site"><a class="brand" href="./">${brandIconMarkup}<span>citation.inator</span></a>
  ${nav ? `<nav aria-label="Demos">
    <a href="../static/" ${active === "static" ? 'aria-current="page"' : ""}>Reading room</a>
    <a href="../dynamic/" ${active === "dynamic" ? 'aria-current="page"' : ""}>Resolution bench</a>
    <a href="../drop-in/">Plain HTML</a>
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
    <h2 id="reading-title">Citation examples</h2>
    <citation-inspector data-cache="./citations.json">${article.html}</citation-inspector>
    ${notationExamples}
  </article>`
}));
await writeFile("demos/static/citations.json", json(article.cache));
await writeFile("demos/static/styles.json", json(article.styles));

await writeFile("demos/dynamic/index.html", document({
  title: "Resolution bench.",
  intro: "Resolve a DOI or ISBN on demand, or rehearse what a reader sees when the provider sends incomplete metadata or goes offline.",
  active: "dynamic",
  script: '<script type="module" src="./dynamic.mjs"></script>',
  content: `<form id="resolve-form">
    <label for="identifier">Identifier or single citation directive</label>
    <input id="identifier" name="identifier" required maxlength="2048" value="${book}" spellcheck="false" autocapitalize="off">
    <p>The prefilled ISBN and the book below come from the bundled cache. Click <strong>Resolve</strong> to use that record without calling Open Library.</p>
    <p class="resolve-examples">Try <button type="button" data-example="${book}">the cached book</button>, <button type="button" data-example="${simas}">the journal article</button>, <button type="button" data-example="doi:10.1111/spc3.12501">another article</button>, or <button type="button" data-example="isbn:9780140328721">a live ISBN</button>.</p>
    <div class="controls">
      <div><label for="mode">Provider mode</label>
      <select name="mode" id="mode">
        <option value="live">Live DOI or ISBN</option>
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
await writeFile("demos/dynamic/styles.json", json(seed.styles));

const notation = [
  ["{citation doi:10.1017/S0003055419000534}", "An inline citation with a DOI."],
  ["{citation isbn:9780593656433 | form:narrative}", "A cached ISBN with the author in the sentence and the year in parentheses."],
  ["{citation doi:10.1017/S0003055419000534; doi:10.1111/spc3.12501}", "Group citations. A semicolon separates items."],
  ['{citation isbn:9780691198927; isbn:9780593656433 | prefix:see also | locator:"p. 34"}', "Add a prefix and a locator to one item in a group. A bare page number adapts to the selected style."],
  ['{citation doi:10.1017/S0003055419000534 | label:"the study | journal article; preprint available"}', "Choose the visible label. Quotes protect literal pipes and semicolons."],
  ["{citation local:unresolved-ritual-politics-reconciliation-2022 | ritual and reconciliation reference pending}", "Supply a fallback to display for an unresolved record."],
  ["{citation isbn:9780691198927 | form:parenthetical}", "Put the author and year in parentheses. This is the default."],
  ["{citation isbn:9780691198927 | form:author-only}", "Show only the author, without parentheses."],
  ["{citation isbn:9780691198927 | form:suppress-author}", "Show only the year, in parentheses."],
  ["{citation isbn:9780691198927 | form:suppress-year}", "Show only the author, in parentheses."],
  ["{citation endnote}", "Place the endnotes on their own paragraph. The compiler appends them when the marker is absent."],
  ["{citation evidence}", "Show cited source metadata or the Resolution bench’s provider evidence."],
  ["{citation credit}", "Show the software credit, license and suggested citation."]
];

if (notation.some(([syntax]) => !prose.includes(syntax))) throw new Error("Each notation example must appear in the shared reading.");

const loadingExample = `<link rel="stylesheet" href="./citation-inspector.css">
<script type="module" src="./citation-inspector.mjs"></script>

<citation-inspector data-cache="./citations.json" class-prefix="my-site-citation">
  <!-- Paste the compiled HTML fragment here. -->
</citation-inspector>`;

const initExample = `import { initializeCitationInspector } from "./citation-inspector.mjs";

initializeCitationInspector(document.querySelector("citation-inspector"), {
  classPrefix: "my-site-citation",
  activation: "hover",
  panelTitle: "Source details",
  panelIcon: "/assets/logo.svg",
  evidenceTitle: "Metadata trail",
  evidenceIcon: "/assets/evidence.svg",
  creditTitle: "Software credits",
  creditIcon: "none",
  accessProviders: ["WorldCat", "Open Library"],
  hiddenAccessProviders: ["JSTOR"]
});`;

const demoServer = `cd citation.inator
npm start`;

const compileExample = `import { createCitationCompiler } from "citation-inator";

const compiler = createCitationCompiler({
  citationKeyword: "ref",
  classPrefix: "my-site-citation",
  citationStyle: "chicago-author-date",
  endnotesHeading: "References"
});
const result = compiler.compile(
  "{ref isbn:9780593656433}\\n\\n{ref endnote}", cache, { namespace: "article-one" }
);`;

const checkoutCompile = `node scripts/compile.mjs --style chicago-author-date --endnotes-heading References \\
  demos/drop-in/reading.txt demos/drop-in/citations.json article.html my-article`;

const markupExample = `import { compileHTML, compileMarkdown, rebaseCitationFragment } from "citation-inator/markup";

const options = { namespace: "essay", citationStyle: "chicago-author-date", endnotesHeading: "References" };
const result = compileHTML("<p><em>Consent</em> has a history {citation local:consent}.</p>", cache, options);
const anotherCopy = rebaseCitationFragment(result.html, "essay", "essay-copy");
// For Markdown sources, call compileMarkdown(source, cache, options).`;

await writeFile("demos/static/guide.html", document({
  title: "Citation guide",
  intro: "See the markup behind the reading room, then use the same notation in your own document.",
  active: "guide",
  content: `<article class="reading guide">
    <section aria-labelledby="guide-load">
      <h2 id="guide-load">Load and initialize</h2>
      <p>Download or clone the <a href="https://github.com/randal-cox/citation.inator">repository</a>. Run <code>npm start</code> from the checkout to serve the demos, then open the <a href="http://127.0.0.1:4187/demos/drop-in/">Plain HTML example</a>.</p>
      <pre><code>${escapeHTML(demoServer)}</code></pre>
      <p>Without npm, serve the prebuilt <code>demos/drop-in/</code> directory or extracted ZIP with any static server. The standalone <a href="../drop-in/README.md">README</a> includes a Python command.</p>
      <p>Copy <code>dist/citation-inspector.mjs</code>, its adjacent <code>dist/citation-inspector.css</code>, and <code>dist/LICENSE</code> to your site. To build the current npm tarball, run <code>npm ci</code> then <code>npm pack</code> in the downloaded repository. That tarball includes the same browser assets under <code>node_modules/citation-inator/dist/</code>. Serve the compiled citation fragment and its cache from the same origin. The module registers the element when it loads.</p>
      <pre><code>${escapeHTML(loadingExample)}</code></pre>
      <p>Set options on the element or in your site's browser module. The default classes start with <code>citation-</code>. Use <code>class-prefix</code> or <code>classPrefix</code> to give them your own prefix.</p>
      <pre><code>${escapeHTML(initExample)}</code></pre>
      <p>The matching HTML attributes are <code>panel-title</code>, <code>panel-icon</code>, <code>evidence-title</code>, <code>evidence-icon</code>, <code>credit-title</code>, <code>credit-icon</code>, <code>access-providers</code>, and <code>hidden-access-providers</code>. Icons use a same-origin URL, the built-in mark, or <code>none</code>. The <code>open</code> attribute is present on the host while any panel is visible.</p>
      <p>To compile plain text directly from the checkout with Node.js 22 or later, run this from the repository root. The CLI writes <code>article.html</code> and <code>article.html.json</code>.</p>
      <pre><code>${escapeHTML(checkoutCompile)}</code></pre>
    </section>
    <section aria-labelledby="guide-use">
      <h2 id="guide-use">Using the demo</h2>
      <p>Use <strong>CSS</strong> to change the appearance of citation content and <strong>Style</strong> to change citation and endnote formatting. The help buttons beside the settings show the matching code. The demo also chooses References or Works Cited for named styles. Set <code>endnotesHeading</code> separately in your own site.</p>
      <p>Click a reference to inspect it. Enable <strong>Hover</strong> to preview citations, evidence, and credit with the mouse. To reposition the panel, choose <strong>Move panel</strong> from the three-dot menu and click or tap the destination. You can also drag from a blank area. You can still select text and use links and buttons. When the panel opens from a click or keyboard activation, its heading has focus. Use the arrow keys to move it or Home to reset. Press Escape or click or tap outside to dismiss it. Each lettered return link in the endnotes leads to its own occurrence. Its tooltip identifies the surrounding text.</p>
      <p>On the <a href="../dynamic/">Resolution bench</a>, enter an identifier or choose a sample. The prefilled ISBN and its displayed citation come from the bundled cache. <strong>Resolve</strong> uses that record locally. <strong>Force refresh</strong> asks Crossref for a DOI or Open Library for an ISBN. Open <strong>Citation evidence</strong> to see the provider response and how the result was assembled.</p>
    </section>
    <section aria-labelledby="guide-source">
      <h2 id="guide-source">Exact source of the reading room</h2>
      <p>The <a href="./">Reading room</a> and <a href="../drop-in/">Plain HTML</a> render these examples from the same source. <a href="./reading.txt">Open the plain-text source</a>.</p>
      <pre><code>${escapeHTML(prose.trim())}</code></pre>
    </section>
    <section aria-labelledby="guide-notation">
      <h2 id="guide-notation">Complete notation</h2>
      <dl>${notation.map(([syntax, explanation]) => `<dt><code>${escapeHTML(syntax)}</code></dt><dd>${explanation}</dd>`).join("")}</dl>
      <p>The reading also demonstrates <code>doi:</code>, <code>isbn:</code>, <code>pmid:</code>, <code>pmcid:</code>, <code>arxiv:</code>, <code>url:</code>, <code>dataset:</code>, <code>software:</code>, a recognized HTTPS URL or an ID from the local cache. Bare DOIs also work. A missing record is marked unresolved.</p>
      <p>Keep each directive on one line. To display <code>{citation endnote}</code> as literal text, put <code>\\{citation endnote\\}</code> in the source. Inside a directive, a backslash escapes a semicolon, pipe, quote, brace or backslash. Legacy <code>{cite …}</code> and <code>{endnotes}</code> also work. Expand <strong>Custom keyword and legacy notation</strong> below the reading in either demo to see both rendered alongside their source.</p>
      <h3>Set your keyword</h3>
      <p>With <code>citationKeyword: "ref"</code>, write <code>{ref DOI}</code>, <code>{ref endnote}</code>, <code>{ref evidence}</code>, and <code>{ref credit}</code>. The keyword and class prefix accept 1–32 lowercase ASCII letters, digits or hyphens, starting with a letter. Use the same class prefix in the browser if you initialize it separately.</p>
      <pre><code>${escapeHTML(compileExample)}</code></pre>
    </section>
    <section aria-labelledby="guide-formats">
      <h2 id="guide-formats">Styles and existing markup</h2>
      <p>Choose <code>chicago-author-date</code>, <code>apa</code>, <code>mla</code>, <code>harvard</code> (Cite Them Right), <code>vancouver</code>, or <code>default</code>. The named styles cover common books and journal articles. Set <code>endnotesHeading</code> to a heading such as References or Works Cited.</p>
      <p>With npm dependencies installed, compile trusted HTML or Markdown using <code>citation-inator/markup</code>, or pass <code>--format html</code> or <code>--format markdown</code> to the CLI. Each directive must stay inside one text node. Use a distinct namespace for each copy of a fragment on the same page.</p>
      <pre><code>${escapeHTML(markupExample)}</code></pre>
      <p>For a build tool such as Python, run the CLI with <code>--json</code> and send <code>{ paragraphs, cache, options }</code> on standard input. It returns <code>{ html, cache, diagnostics }</code>. For HTML or Markdown send <code>{ source, format, cache, options }</code>.</p>
    </section>
    <section aria-labelledby="guide-cache">
      <h2 id="guide-cache">Format references and add access links</h2>
      <p>For curated reference text, put <code>citationParts</code> on the record. Each part has <code>text</code> and optional <code>emphasis</code> set to <code>"italic"</code> or <code>"bold"</code>. Both the inspector and endnotes display the formatting.</p>
      <p>Supply record locations with <code>kind: "library"</code> or <code>kind: "full-text"</code>, a provider name and an HTTPS URL. Pass the reader’s preferred provider names in order using <code>accessProviders</code>. Set <code>hiddenAccessProviders</code> to hide services in the panel and endnotes. The application can reuse its own preference settings.</p>
      <p>Use <code>originalIssued: [1912]</code> and <code>issued: [1995]</code> to store both dates for a translated or reprinted work. Try the Durkheim citation in the reading room with Chicago and APA selected.</p>
      <p>The <a href="https://github.com/randal-cox/citation.inator/blob/main/docs/integration.md">integration guide</a> shows how to find ISBN candidates by title and author and review them before updating a cache.</p>
    </section>
  </article>`
}));

const portable = "demos/drop-in/";
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
    <h1 data-citation-part="brand">${brandIconMarkup}<span>Sources in plain HTML</span></h1>
    <p>Click a citation to inspect it. Without JavaScript, it links directly to its endnote.</p>
    <hr>
    <citation-inspector data-cache="./citations.json">${article.html}</citation-inspector>
    ${notationExamples}
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
