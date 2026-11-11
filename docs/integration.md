# Integrate citation.inator

## Load and initialize

Copy `citation-inspector.mjs` and its adjacent `citation-inspector.css` to your site's public assets. Both files are in the standalone ZIP, the downloaded repository’s `dist/` directory, and `node_modules/citation-inator/dist/` after installing the npm tarball. A static site can use the browser files without npm or Node. Place the compiled HTML fragment in the custom element and point `data-cache` to the matching JSON on the same origin.

```html
<link rel="stylesheet" href="./citation-inspector.css">
<script type="module" src="./citation-inspector.mjs"></script>

<citation-inspector data-cache="./article.html.json">
  <!-- Paste the generated article.html fragment here. -->
</citation-inspector>
```

The module registers the element in the browser. Use one component version per document. Load it on the client. The compiler, markup, records and resolver modules can be imported from server-side JavaScript.

Set options with attributes such as `class-prefix="my-site-citation"` or from your browser module.

```js
import { initializeCitationInspector } from "./citation-inspector.mjs";

const inspector = document.querySelector("citation-inspector");
initializeCitationInspector(inspector, {
  classPrefix: "my-site-citation",
  activation: "hover",
  panelTitle: "Source details",
  panelIcon: "/assets/logo.svg",
  evidenceTitle: "Metadata trail",
  evidenceIcon: "/assets/evidence.svg",
  creditTitle: "Software credits",
  creditIcon: "none"
});
```

Generated classes default to names such as `citation-cite`, `citation-endnotes` and `citation-panel`. Set `classPrefix` to replace `citation` in those names. The built-in stylesheet still works with the new names. The prefix accepts 1–32 lowercase ASCII letters, digits or hyphens, starting with a letter. Set the same option when compiling if you want your class names in the HTML before JavaScript loads.

## Try the standalone HTML

Run `npm start` from the repository root and open [Plain HTML](http://127.0.0.1:4187/demos/drop-in/). For an npm-free preview, serve `demos/drop-in/` or the extracted ZIP with any static server. For example, run `python3 -m http.server --bind 127.0.0.1 8080` in that folder and open [the example](http://127.0.0.1:8080/). With the Windows Python launcher, use `py -3` in place of `python3`.

Serve `.mjs` as JavaScript and `.json` as JSON. Static links and endnotes work when opening the HTML directly from disk. The inspector uses a same-origin HTTP or HTTPS host to load its cache. Keep the MIT license with the JavaScript and CSS.

## Compile and add a page

Build the current tarball by running `npm ci` and `npm pack` in the downloaded library checkout with Node.js 22 or later. Install that tarball in your project. Copy `reading.txt` and `citations.json` from the ZIP into this directory for the example.

```sh
npm install ./citation-inator-0.1.1.tgz
npm exec -- citation-inator reading.txt citations.json article.html my-article
```

The command writes an HTML fragment and `article.html.json` with the records used by that fragment. The example intentionally emits one unresolved-reference diagnostic. It still writes both files. For each independently compiled fragment on a page, supply a distinct namespace such as `my-article`.

From a downloaded source checkout, plain-text compilation works with Node.js alone. Run the following command from the repository root.

```sh
node scripts/compile.mjs --style chicago-author-date --endnotes-heading References \
  demos/drop-in/reading.txt demos/drop-in/citations.json article.html my-article
```

## Migrate references on an existing site

Find the source files and the site’s build commands. Review the existing citations, endnotes, and bibliography. Start with a representative page and verify that each migrated reference still points to the intended work and supports the surrounding claim. Reuse verified records, and flag uncertain matches or missing metadata for review.

For HTML or Markdown sites, use the markup compiler below and keep the site layout in its existing templates. Regenerate the fragment and its JSON together when changing citations. Keep the prose and cache inputs with the site’s authoring files, and record the citation.inator commit used by the site.

Run the site’s build and preview the changed pages over HTTP before rolling out the change. Check the reference destinations, the endnotes, and their return links. Open the inspector by click and keyboard, and test **Move panel** in a narrow viewport. Disable JavaScript and check that the endnotes still work. Check the browser console and network panel for missing assets. Report which pages and references were checked and which still need review.

## Write citations

Write `{citation doi:10.1017/S0003055419000534}` for an inline author–year reference. The compiler accepts DOI, ISBN, PMID, PMCID, arXiv, dataset, software and HTTPS URL identifiers, plus bare DOIs and stable local record IDs. It normalizes recognized resolver URLs to their identifier.

| Syntax | Effect |
| --- | --- |
| `{citation DOI; ISBN}` | Group parenthetical citations. Substitute real identifiers for DOI and ISBN. |
| `{citation DOI \| label:"the original study"}` | Choose the visible citation text. |
| `{citation DOI \| fallback words}` | Supply the visible citation text if the record is unresolved. |
| `prefix:see also` | Add words before the citation inside its parentheses. |
| `locator:34` | Add a page or other location. Write `locator:"pp. 34–36"` to include a label. |
| `form:parenthetical` | Show author and year in parentheses. This is the default. |
| `form:narrative` | Show the author as part of the sentence and the year in parentheses. |
| `form:author-only` | Show only the author, without parentheses. |
| `form:suppress-author` | Show the year in parentheses. |
| `form:suppress-year` | Show the author in parentheses. |
| `{citation endnote}` | Place the endnotes in their own paragraph. With no marker, the compiler appends them. |
| `{citation evidence}` | Show source metadata. An application can add the provider response and merge decisions for a lookup. |
| `{citation credit}` | Show the software credit and suggested citation. |

Keep each directive on one line. A pipe introduces an option, such as `{citation isbn:9780593656433 | form:narrative}`. Quoted labels can include pipes and semicolons. Write `\{` and `\}` for literal braces. Inside a directive, backslashes can escape braces, semicolons, pipes, quotes and backslashes. Legacy `{cite …}` and `{endnotes}` also work.

Set the keyword while compiling. The browser element stays `<citation-inspector>`. This Chicago example keeps the author in the sentence and adds a second work to the same group.

```text
Schechner {citation local:schechner1979 | form:suppress-author; local:schechner1985 | prefix:see also}.
```

Provide both local IDs in your cache to render “Schechner (1979; see also Schechner 1985).” A literal `label` overrides the generated citation text, including affixes.

```js
import { createCitationCompiler } from "citation-inator";

const compiler = createCitationCompiler({
  citationKeyword: "ref",
  classPrefix: "my-site-citation",
  citationStyle: "chicago-author-date",
  endnotesHeading: "References"
});
const result = compiler.compile(
  "{ref isbn:9780593656433}\n\n{ref evidence} · {ref credit}\n\n{ref endnote}",
  cache,
  { namespace: "my-article" }
);
```

The keyword accepts 1–32 lowercase ASCII letters, digits or hyphens, starting with a letter. Pass the optional notation keyword and class prefix after the namespace on the CLI.

## Choose a citation style

Set `citationStyle` in the compiler options, or pass `--style` on the CLI. Set `endnotesHeading` or `--endnotes-heading` independently.

| Setting | Family | Example |
| --- | --- | --- |
| `chicago-author-date` | Chicago 18 author–date | (Ostrom 1990, 34) |
| `apa` | APA 7 | (Ostrom, 1990, p. 34) |
| `mla` | MLA 9 author–page | (Ostrom 34) |
| `harvard` | Cite Them Right Harvard | (Ostrom, 1990, p. 34) |
| `vancouver` | Vancouver (ICMJE/NLM) | (1) |
| `default` | Original citation.inator author–year format | (Ostrom, 1990) |

Use `locator:34` for a page or `locator:"34–36"` for a range. APA, Harvard and Vancouver supply `p.` or `pp.` for bare numbers and ranges. You can write a labeled locator such as `locator:"chap. 2"` to keep that wording. Vancouver numbers references by first mention and reuses that number for repeat mentions. Chicago, APA, Harvard and the default format add deterministic year suffixes where author–year labels collide. The named styles focus on books and journal articles. Titles keep their supplied spelling and capitalization. Set `apaTitle` for a sentence-cased title in APA while keeping the source title in `title`. Use editorial text for style-specific edge cases such as APA citations whose different author lists shorten to the same names. Check venue-specific rules and supply editorial formatting for source types or metadata beyond the built-in fields. For Vancouver, supply a journal’s established abbreviation as `containerAbbreviation` and a book’s publication city as `publisherPlace` where known.

## Compile existing HTML or Markdown

With npm dependencies installed, use these Node imports. From a source checkout, the same functions are available in `src/markup.mjs`.

```js
import { compileHTML, compileMarkdown, rebaseCitationFragment } from "citation-inator/markup";

const options = { namespace: "consent-essay", citationStyle: "chicago-author-date", endnotesHeading: "References" };
const result = compileHTML('<p><em>Consent</em> has a history {citation local:consent}.</p><p>{citation endnote}</p>', cache, options);
const markdownResult = compileMarkdown('*Consent* has a history {citation local:consent}.', cache, options);
const secondCopy = rebaseCitationFragment(result.html, "consent-essay", "consent-excerpt");
```

Use source you trust. HTML and raw HTML in Markdown retain author markup. The compiler looks for directives in prose text nodes, skips code, links, editing hosts and interactive or raw-text elements, and leaves markup around those nodes in place. Keep each directive within a single text node. Use a standalone paragraph to place endnotes. If you compile a full HTML document, add the inspector wrapper around the relevant content within its body.

Reuse the same compiled fragment on separate pages when it appears only once per page. For more than one copy on a page, compile with distinct namespaces or rebase a generated fragment before inserting it. Rebasing adjusts the generated citation, endnote and annotation targets, and each fragment copy can use the same cache.

## Call the compiler from Python

Run the CLI with `--json` and send one object on standard input. It returns `html`, `cache` and `diagnostics` together. Each request compiles one document, so repeated works share an endnote and year suffixes are computed together. Python launches Node.js 22 or later. Run this example from the citation.inator checkout.

```python
import json
import subprocess
from pathlib import Path

cache = json.loads(Path("demos/drop-in/citations.json").read_text(encoding="utf-8"))
request = {
    "paragraphs": ["{citation isbn:9780593656433 | locator:34}", "{citation endnote}"],
    "cache": cache,
    "options": {
        "namespace": "example-page",
        "citationStyle": "chicago-author-date",
        "endnotesHeading": "References",
    },
}
process = subprocess.run(
    ["node", "scripts/compile.mjs", "--json"],
    input=json.dumps(request), text=True, capture_output=True, check=True,
)
result = json.loads(process.stdout)
```

For HTML or Markdown, replace `paragraphs` with a `source` string and set `format` to `"html"` or `"markdown"`. An invalid request exits with a nonzero status and writes an error to standard error.

## Supply the cache

The ZIP includes an example `citations.json`. The npm package exports a larger sample cache at `citation-inator/citations.json`. Its local path is `node_modules/citation-inator/dist/citations.json`.

Use `makeCache(records)` from `citation-inator/records` to produce the versioned cache and reject duplicate IDs and identifier collisions. Records can include structured authors, dates, identifiers, locations, version and integrity metadata, and provenance. Give PDF and preprint locations an HTTPS URL, a named source and a valid `verifiedAt` timestamp. Record the document version when known.

For editorial bibliography text, provide `citationParts` in the style the page uses. Each part has `text` and optional `emphasis: "italic"` or `"bold"`. Text is escaped and the same formatting appears in the panel and endnotes. For an author–date suffix, write the year as `1990.` in Chicago or `(1990)` in the other author–date formats so the compiler can insert the letter.

```json
{
  "citationParts": [
    {"text": "Ostrom, Elinor. 1990. "},
    {"text": "Governing the Commons", "emphasis": "italic"},
    {"text": ". Cambridge University Press."}
  ],
  "locations": [
    {"kind": "library", "provider": "WorldCat", "url": "https://search.worldcat.org/search?q=bn%3A9780521405997"},
    {"kind": "library", "provider": "Open Library", "url": "https://openlibrary.org/isbn/9780521405997"}
  ]
}
```

Use `full-text` for a link you have verified leads to the work’s full text, and `library` for a catalog, lending, or subscription service. These are fields on a record alongside its identifier and other metadata. Both kinds appear in the panel and static endnotes. Pass `accessProviders: ["Open Library", "WorldCat"]` to the initializer, assign `element.accessProviders`, or use `access-providers="Open Library,WorldCat"` on the element. Use the site’s own reader settings to store or load preferences. A preference orders supplied links, and an empty list restores their original order.

For an abstract, provide an object with `text`, `source`, an optional HTTPS `url`, and optional `kind: "excerpt"`. The browser reads the text from the cache. Use excerpts or full text you have rights to distribute.

## Customize the inspector

Use `activation="hover"` on the element to enable mouse previews. Click or keyboard activation can keep a preview open. Touch uses tap. The setting also applies to Citation evidence and Citation credit. Choose **Move panel** from **Panel options**, then click or tap where the panel’s top-left corner should go. Escape or **Cancel move** exits without moving it. You can also drag from a blank area of the panel. Use the arrow keys while the panel heading has focus. Home resets its position. Press Escape or click or tap outside to dismiss the panel.

On compact screens the sheet uses up to 60% of the visible height and scrolls internally, leaving room to move it and reveal the page underneath.

The citation panel defaults to `citation.inator` and the built-in mark. Set `panel-title` and `panel-icon`, `evidence-title` and `evidence-icon`, or `credit-title` and `credit-icon` for each panel. Evidence and Credit inherit the main icon if you supply one. Use a same-origin icon URL or `none` to hide it. Allow `img-src 'self'` for custom icons. The title settings apply to the panel headings. Directive labels and software credit remain part of the compiled content.

The component reflects a boolean `open` attribute while any inspector panel is visible. Site tests can assert `citation-inspector[open]` after activation and wait for it to disappear after dismissal. Endnote backlinks are lettered in occurrence order. Their tooltips and accessible names identify the surrounding passage.

Set the CSS properties `--citation-paper`, `--citation-ink`, `--citation-accent`, `--citation-line`, `--citation-wash`, `--citation-panel-radius`, `--citation-icon-radius`, `--citation-heading-font` and `--citation-endnote-font` on the custom element to scope the theme to its citation content. Use `--citation-inline-color` and `--citation-inline-active` for the inline links.

Source icons show destinations as tooltips. Publisher links open in a separate tab or window. The PDF icon requests a download. A cross-origin PDF host may serve the document inline.

To support a library resolver, assign `element.institutionalURL = record => "https://…"`. Set `data-report` on the element to enable a bubbling `citation-report` event, or assign `element.report = handler`. The payload includes the canonical record, document URL and occurrence ID. Your application decides whether to send a report.

## Network and host behavior

The browser component loads its CSS and JSON from the same origin. Use `script-src 'self'; style-src 'self'; connect-src 'self'` with those assets. An already loaded page can keep using its cache offline. Offline reload with enhancement depends on host caching.

For server-side resolution, import `createCrossrefResolver` from `citation-inator/crossref`. The source checkout’s Resolution bench uses it on explicit Resolve or Force refresh requests. Resolve can reuse a fresh cache. Force refresh attempts a DOI lookup subject to Crossref backoff. A provider attempt supplies raw response and merge information. Static and cache-only records may have only normalized metadata.

Import `createOpenLibraryResolver` from `citation-inator/openlibrary` for ISBN editions. Call it server-side. It uses the same cache, attempt and force-refresh contract as Crossref. Open Library supplies edition metadata and an edition link when available. A lookup can also return a partial record, a miss, or a provider error. Preserve the result state and review the edition before replacing curated metadata.

```js
import { createOpenLibraryResolver } from "citation-inator/openlibrary";

const books = createOpenLibraryResolver({ mailto: "citations@example.org" });
const result = await books.resolve("isbn:9780140328721");
```

Equivalent ISBN-10 and ISBN-13 values refer to the same edition in the cache and resolver. Other edition identifiers stay distinct.

The demo uses Crossref for DOI requests and Open Library for ISBN requests. The bench opens with a prefilled ISBN and its bundled citation. **Resolve** uses that cached record. **Force refresh** attempts the live ISBN lookup. Use **a live ISBN** to try a book outside the demo cache.
