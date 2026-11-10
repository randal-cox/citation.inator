# Integrate citation.inator

## Load and initialize

Copy `citation-inspector.mjs` and its adjacent `citation-inspector.css` to your site's public assets. Both files are in the standalone ZIP and in `node_modules/citation-inator/dist/` after installing the npm tarball. Place the compiled HTML fragment in the custom element and point `data-cache` to the matching JSON on the same origin.

```html
<link rel="stylesheet" href="./citation-inspector.css">
<script type="module" src="./citation-inspector.mjs"></script>

<citation-inspector data-cache="./article.html.json">
  <!-- Paste the generated article.html fragment here. -->
</citation-inspector>
```

The module registers the element in the browser. Use one component version per document. Load it on the client. The compiler, records and Crossref modules can be imported from server-side JavaScript.

Set options with attributes such as `class-prefix="my-site-citation"` or from your browser module.

```js
import { initializeCitationInspector } from "./citation-inspector.mjs";

const inspector = document.querySelector("citation-inspector");
initializeCitationInspector(inspector, {
  classPrefix: "my-site-citation",
  activation: "hover"
});
```

Generated classes default to names such as `citation-cite`, `citation-endnotes` and `citation-panel`. Set `classPrefix` to replace `citation` in those names. The built-in stylesheet still works with the new names. The prefix accepts 1–32 lowercase ASCII letters, digits or hyphens, starting with a letter. Set the same option when compiling if you want your class names in the HTML before JavaScript loads.

## Try the standalone HTML

Extract the ZIP and serve its folder from a static site. For a local preview, run `python3 -m http.server --bind 127.0.0.1 8080` in the extracted folder and open [the example](http://127.0.0.1:8080/). With the Windows Python launcher, use `py -3` in place of `python3`.

Serve `.mjs` as JavaScript and `.json` as JSON. Static links and endnotes work when opening the HTML directly from disk. The inspector uses a same-origin HTTP or HTTPS host to load its cache. Keep the MIT license with the JavaScript and CSS.

## Compile and add a page

Install the local tarball with Node.js 22 or later. Copy `reading.txt` and `citations.json` from the ZIP into this directory for the example.

```sh
npm install ./citation-inator-0.1.1.tgz
npm exec -- citation-inator reading.txt citations.json article.html my-article
```

The command writes an HTML fragment and `article.html.json` with the records used by that fragment. The example intentionally emits one unresolved-reference diagnostic. It still writes both files. For each independently compiled fragment on a page, supply a distinct namespace such as `my-article`.

From a built source checkout, you can run the same compiler directly with `node scripts/compile.mjs`. This example uses the source and cache supplied with the demo.

```sh
node scripts/compile.mjs demos/christopher-drop-in/reading.txt dist/citations.json /tmp/citation-example.html my-article
```

## Migrate references on an existing site

Find the source files and the site’s build commands. Review the existing citations, endnotes, and bibliography. Start with a representative page and verify that each migrated reference still points to the intended work and supports the surrounding claim. Reuse verified records, and flag uncertain matches or missing metadata for review.

The compiler treats its input as plain text. For a site that already uses Markdown or HTML, keep the layout in the existing templates and compile the citation-bearing prose blocks into fragments. Regenerate the fragment and its JSON together when changing citations. Keep the prose and cache inputs with the site’s authoring files, and record the citation.inator commit used by the site.

Run the site’s build and preview the changed pages over HTTP before rolling out the change. Check the reference destinations, the endnotes, and their return links. Open the inspector by click and keyboard, and test **Move panel** in a narrow viewport. Disable JavaScript and check that the endnotes still work. Check the browser console and network panel for missing assets. Report which pages and references were checked and which still need review.

## Write citations

Write `{citation doi:10.1017/S0003055419000534}` for an inline author–year reference. The compiler accepts DOI, ISBN, PMID, PMCID, arXiv, dataset, software and HTTPS URL identifiers, plus bare DOIs and stable local record IDs. It normalizes recognized resolver URLs to their identifier.

| Syntax | Effect |
| --- | --- |
| `{citation DOI; ISBN}` | Group parenthetical citations. Substitute real identifiers for DOI and ISBN. |
| `{citation DOI \| label:"the original study"}` | Choose the visible citation text. |
| `{citation DOI \| fallback words}` | Supply the visible citation text if the record is unresolved. |
| `form:parenthetical` | Show author and year in parentheses. This is the default. |
| `form:narrative` | Show the author as part of the sentence and the year in parentheses. |
| `form:author-only` | Show only the author, without parentheses. |
| `form:suppress-author` | Show the year in parentheses. |
| `form:suppress-year` | Show the author in parentheses. |
| `{citation endnote}` | Place the endnotes in their own paragraph. With no marker, the compiler appends them. |
| `{citation evidence}` | Show source metadata. An application can add the provider response and merge decisions for a lookup. |
| `{citation credit}` | Show the software credit and suggested citation. |

Keep each directive on one line. A pipe introduces an option, such as `{citation isbn:9780593656433 | form:narrative}`. Quoted labels can include pipes and semicolons. Write `\{` and `\}` for literal braces. Inside a directive, backslashes can escape braces, semicolons, pipes, quotes and backslashes. Legacy `{cite …}` and `{endnotes}` also work.

Set the keyword while compiling. The browser element stays `<citation-inspector>`.

```js
import { createCitationCompiler } from "citation-inator";

const compiler = createCitationCompiler({ citationKeyword: "ref", classPrefix: "my-site-citation" });
const result = compiler.compile(
  "{ref isbn:9780593656433}\n\n{ref evidence} · {ref credit}\n\n{ref endnote}",
  cache,
  { namespace: "my-article" }
);
```

The keyword accepts 1–32 lowercase ASCII letters, digits or hyphens, starting with a letter. Pass the optional notation keyword and class prefix after the namespace on the CLI.

## Supply the cache

The ZIP includes an example `citations.json`. The npm package exports a larger sample cache at `citation-inator/citations.json`. Its local path is `node_modules/citation-inator/dist/citations.json`.

Use `makeCache(records)` from `citation-inator/records` to produce the versioned cache and reject duplicate IDs and identifier collisions. Records can include structured authors, dates, identifiers, locations, version and integrity metadata, and provenance. Give PDF and preprint locations an HTTPS URL, a named source and a valid `verifiedAt` timestamp. Record the document version when known.

For an abstract, provide an object with `text`, `source`, an optional HTTPS `url`, and optional `kind: "excerpt"`. The browser reads the text from the cache. Use excerpts or full text you have rights to distribute.

## Customize the inspector

Use `activation="hover"` on the element to enable mouse previews. Click or keyboard activation can keep a preview open. Touch uses tap. The setting also applies to Citation evidence and Citation credit. Choose **Move panel** from **Panel options**, then click or tap where the panel’s top-left corner should go. Escape or **Cancel move** exits without moving it. You can also drag from a blank area of the panel. Use the arrow keys while the panel heading has focus. Home resets its position. Press Escape or click or tap outside to dismiss the panel.

On compact screens the sheet uses up to 60% of the visible height and scrolls internally, leaving room to move it and reveal the page underneath.

The panel title defaults to `citation.inator`. Set `panel-title="Your publication"` and `panel-icon="/assets/logo.svg"` on the element to supply a custom title and a same-origin icon. Allow `img-src 'self'` in your content security policy when using an icon.

Set the CSS properties `--citation-paper`, `--citation-ink`, `--citation-accent`, `--citation-line`, `--citation-wash`, `--citation-panel-radius`, `--citation-icon-radius`, `--citation-heading-font` and `--citation-endnote-font` on the custom element to scope the theme to its citation content. Use `--citation-inline-color` and `--citation-inline-active` for the inline links.

Source icons show destinations as tooltips. Publisher links open in a separate tab or window. The PDF icon requests a download. A cross-origin PDF host may serve the document inline.

To support a library resolver, assign `element.institutionalURL = record => "https://…"`. Set `data-report` on the element to enable a bubbling `citation-report` event, or assign `element.report = handler`. The payload includes the canonical record, document URL and occurrence ID. Your application decides whether to send a report.

## Network and host behavior

The browser component loads its CSS and JSON from the same origin. Use `script-src 'self'; style-src 'self'; connect-src 'self'` with those assets. An already loaded page can keep using its cache offline. Offline reload with enhancement depends on host caching.

For server-side resolution, import `createCrossrefResolver` from `citation-inator/crossref`. The source checkout’s Resolution bench uses it on explicit Resolve or Force refresh requests. Resolve can reuse a fresh cache. Force refresh attempts a DOI lookup subject to Crossref backoff. A provider attempt supplies raw response and merge information. Static and cache-only records may have only normalized metadata.
