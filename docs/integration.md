# Integrate cite.inator

## Load and initialize

Copy `citation-inspector.mjs` and its adjacent `citation-inspector.css` to your site's public assets. Both files are in the standalone ZIP, the downloaded repository’s `dist/` directory, and `node_modules/cite-inator/dist/` after installing the npm tarball. A static site can use the browser files without npm or Node. Place the compiled HTML fragment in the custom element and point `data-cache` to the matching JSON on the same origin.

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

For assets served with a long cache lifetime, put each tested checkout in a path such as `/assets/citation-inator-0.1.3-<short-commit>/`. Copy the module and stylesheet into that same directory and update both URLs in your template. The module also loads its adjacent stylesheet. Publish the corresponding HTML and cache together under fresh URLs, or configure them to revalidate.

## Try the standalone HTML

Run `npm start` from the repository root and open [Plain HTML](http://127.0.0.1:4187/demos/drop-in/). For a copied-file preview, run `node server.mjs` inside `demos/drop-in/` or the extracted ZIP and open `http://127.0.0.1:4188/`. The included server requires Node 22.13.0 or later; any static HTTP server also works.

Serve `.mjs` as JavaScript and `.json` as JSON. Static links and endnotes work when opening the HTML directly from disk. The inspector uses a same-origin HTTP or HTTPS host to load its cache. Keep the MIT license with the JavaScript and CSS.

For pre-0.5 packages, use the original package/import name; [migration details](naming-migration.md) distinguish those archives from current examples. The tarball filename below matches the current preview; use the actual filename printed by `npm pack` when building another version.

## Compile and add a page

Build the current tarball by running `npm ci` and `npm pack` in the downloaded library checkout with Node.js 22.13.0 or later. Install that tarball in your project. Copy `reading.txt` and `citations.json` from the ZIP into this directory for the example.

```sh
npm install ./cite-inator-0.5.0-preview.2.tgz
npm exec -- cite-inator reading.txt citations.json article.html my-article
```

The command writes an HTML fragment and `article.html.json` with the records used by that fragment. The example intentionally emits one unresolved-reference diagnostic. It still writes both files. For each independently compiled fragment on a page, supply a distinct namespace such as `my-article`.

From a downloaded source checkout, plain-text compilation works with Node.js alone. Run the following command from the repository root.

```sh
node scripts/compile.mjs --style chicago-author-date --endnotes-heading References \
  demos/drop-in/reading.txt demos/drop-in/citations.json article.html my-article
```

## Migrate references on an existing site

Find the source files and the site’s build commands. Review the existing citations, endnotes, and bibliography. Start with a representative page and verify that each migrated reference still points to the intended work and supports the surrounding claim. Reuse verified records, and flag uncertain matches or missing metadata for review.

For HTML or Markdown sites, use the markup compiler below and keep the site layout in its existing templates. Regenerate the fragment and its JSON together when changing citations. Keep the prose and cache inputs with the site’s authoring files, and record the cite.inator commit used by the site.

Run the site’s build and preview the changed pages over HTTP before rolling out the change. Check the reference destinations, the endnotes, and their return links. Open the inspector by click and keyboard, and test **Move panel** in a narrow viewport. Disable JavaScript and check that the endnotes still work. Check the browser console and network panel for missing assets. Report which pages and references were checked and which still need review.

## Write citations

Write `{cite doi:10.1017/S0003055419000534}` for an inline author–year reference. The compiler accepts DOI, ISBN, PMID, PMCID, arXiv, dataset, software and HTTPS URL identifiers, plus bare DOIs and stable local record IDs. It normalizes recognized resolver URLs to their identifier.

| Syntax | Effect |
| --- | --- |
| `{cite DOI; ISBN}` | Group parenthetical citations. Substitute real identifiers for DOI and ISBN. |
| `{cite DOI \| label:"the original study"}` | Choose the visible citation text. |
| `{cite DOI \| fallback words}` | Supply the visible citation text if the record is unresolved. |
| `prefix:see also` | Add words before the citation inside its parentheses. |
| `locator:34` | Add a page or other location. Write `locator:"pp. 34–36"` to include a label. |
| `form:parenthetical` | Show author and year in parentheses. This is the default. |
| `form:narrative` | Show the author as part of the sentence and the year in parentheses. |
| `form:author-only` | Show only the author, without parentheses. |
| `form:suppress-author` | Show the year in parentheses. |
| `form:suppress-year` | Show the author in parentheses. |
| `{cite endnote}` | Place the endnotes in their own paragraph. With no marker, the compiler appends them. |
| `{cite evidence}` | Show source metadata. An application can add the provider response and merge decisions for a lookup. |
| `{cite credit}` | Show the software credit and suggested citation. |

Keep each directive on one line. A pipe introduces an option, such as `{cite isbn:9780593656433 | form:narrative}`. Quoted labels can include pipes and semicolons. Write `\{` and `\}` for literal braces. Inside a directive, backslashes can escape braces, semicolons, pipes, quotes and backslashes. The default keyword is `cite` for works and directives. Set `citationKeyword` to choose another keyword consistently; there are no implicit alternate spellings.

Set the keyword while compiling. The browser element stays `<citation-inspector>`. This Chicago example keeps the author in the sentence and adds a second work to the same group.

```text
Schechner {cite local:schechner1979 | form:suppress-author; local:schechner1985 | prefix:see also}.
```

Provide both local IDs in your cache to render “Schechner (1979; see also Schechner 1985).” A literal `label` overrides the generated citation text, including affixes.

```js
import { createCitationCompiler } from "cite-inator";

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
| `default` | Original cite.inator author–year format | (Ostrom, 1990) |

Use `locator:34` for a page or `locator:"34–36"` for a range. APA, Harvard and Vancouver supply `p.` or `pp.` for bare numbers and ranges. You can write a labeled locator such as `locator:"chap. 2"` to keep that wording. Vancouver numbers references by first mention and reuses that number for repeat mentions. Chicago, APA, Harvard and the default format add deterministic year suffixes where author–year labels collide. The named styles focus on books and journal articles. Titles keep their supplied spelling and capitalization. Set `apaTitle` for a sentence-cased title in APA while keeping the source title in `title`. Use editorial text for style-specific edge cases such as APA citations whose different author lists shorten to the same names. Check venue-specific rules and supply editorial formatting for source types or metadata beyond the built-in fields. For Vancouver, supply a journal’s established abbreviation as `containerAbbreviation` and a book’s publication city as `publisherPlace` where known.

### Shared excerpts, scoped endnotes, and reading lists

Compile a reusable card with `references: "isolated"`, or mark individual items with `| isolated`. These citations retain their configured style and inspector metadata. They emit no citation IDs, backlinks, or endnotes. Set `isolatedHref: "/references#{id}"` to link each citation to a host-provided fallback target. Without a template, cite.inator uses a known identifier URL or source location when available. Isolated fragments omit interactive evidence and credit links. Multiple inspectors with the same-origin `data-cache` URL share one fetch per page.

Place `{cite endnote | scope:since-last}` on its own line or paragraph at the end of each entry. Its list and backlinks belong to that entry. When scoped markers are used, each endnote marker closes a scope and any trailing citations get a final list. The compiler assigns author-year suffixes across the fragment. A standalone marker works inside definition entries, list items, table cells and other prose containers. A marker left in running prose produces a `misplaced-directive` diagnostic. Use `{cite endnote | scope:since-last | heading:"Sources" | level:4}` for a local heading, or `heading:none` to omit it. Heading levels run from 1 through 6.

Keep the default `suffixScope: "fragment"` for separate articles or essays with their own reference lists, even if they share a source cache. Each compiled article gets year letters based on its own works.

Use `suffixScope: "cache"` for a single work published across pages that share one bibliography, such as the chapters of an online book. Compile each page with the same complete input cache and style options. The cache returned for an individual page contains that page’s records. If a work in the page’s endnotes has a cache-wide year letter and a companion work is absent from those endnotes, the compiler returns a `cache-suffix-missing-companions` diagnostic. Its `records` and `missingRecords` fields list the record IDs present and absent, respectively. The diagnostic leaves the year letters intact, which is useful when the companions are listed in the shared bibliography elsewhere.

Place `{cite list id1; id2; id3}` on its own line or paragraph to render a reading list. The list uses the chosen style, reference formatting, access links, and an **Inspect** action for each record. It preserves input order unless you add `| sort:author` or `| sort:year`. A list leaves the endnotes alone. Set `listAnnotationParts` on a record to show a summary under its reference. Parts use the same `text`, `emphasis`, and HTTPS `href` fields as `citationParts`. Each reading-list item has a `data-ci-list-record` attribute with its record ID so the site can attach its own tags. Use `{cite nocite id1}` to add a source to the current endnotes without an inline citation.

### Chicago names, groups, and legislation

A literal author can supply an inline short form, for example `{"literal": "Office of the Director of National Intelligence", "short": "ODNI"}`. Chicago keeps the full name in references. It adds initials when the visible bylines of different works include different people with the same surname. Store a personal suffix in the author’s `suffix` field, for example `{"family":"Behrens","given":"William W.","suffix":"III"}`. Set `authorsComplete: false` on a record to have the panel append “et al.” to its listed authors. Set `inlineAuthor` on a record to override the inline byline. Adjacent Chicago citations of the same author in a group share the author name where the items have no locator, prefix, or custom label. Adjacent `form:suppress-author` items join their years with commas.

When two records spell the same person’s name differently, give the structured author the same `id` in both records. For example, give `{"family":"Wrangham","given":"Richard","id":"person:richard-wrangham"}` and `{"family":"Wrangham","given":"Richard W.","id":"person:richard-wrangham"}` the same ID. You can use a verified ORCID URL as the ID. Use the exact same string on every occurrence. Chicago uses it when deciding whether surname initials are needed, and the bibliography keeps each record’s own spelling. Authors without an ID are still compared by name.

For an act or bill, use `type: "legislation"`, `title`, and `issued`. Supply `jurisdiction`, `number`, and `session` as applicable. Use `legalCitation` for a complete legal locator such as `Pub. L. No. 103-43, 107 Stat. 122` and an HTTPS identifier for the official text. The Chicago author-date preset uses the law's name and year in prose and puts the locator in the reference. Use `inlineAuthor` for a familiar short title or `citationParts` for an editorial reference that follows local legal citation practice. [Chicago on laws, bills, and state legislation](https://www.chicagomanualofstyle.org/book/ed18/part3/ch14/toc.html)

## Compile existing HTML or Markdown

For source-only editor notes, `describeCitation` / `annotateMarkers`, the JSON editor CLI, cross-page occurrence indexes, site bibliographies, record/usage tags and list filters, see [Article tools](article-tools.md). The tools have separate Node and self-contained browser entry points; reader panels still load the inspector module and stylesheet described above. These additions require 0.2.0 or later; 0.1.4 does not include them.

With npm dependencies installed, use these Node imports. From a source checkout, the same functions are available in `src/markup.mjs`.

```js
import { compileHTML, compileMarkdown, rebaseCitationFragment } from "cite-inator/markup";

const options = { namespace: "consent-essay", citationStyle: "chicago-author-date", endnotesHeading: "References" };
const result = compileHTML('<p><em>Consent</em> has a history {cite local:consent}.</p><p>{cite endnote}</p>', cache, options);
const markdownResult = compileMarkdown('*Consent* has a history {cite local:consent}.', cache, options);
const secondCopy = rebaseCitationFragment(result.html, "consent-essay", "consent-excerpt");
```

Use source you trust. HTML and raw HTML in Markdown retain author markup. The compiler looks for directives in prose text nodes, skips code, links, editing hosts and interactive or raw-text elements, and leaves markup around those nodes in place. Keep each directive within a single text node. Use a standalone paragraph to place endnotes. If you compile a full HTML document, add the inspector wrapper around the relevant content within its body.

Reuse the same compiled fragment on separate pages when it appears only once per page. For more than one copy on a page, compile with distinct namespaces or rebase a generated fragment before inserting it. Rebasing adjusts the generated citation, endnote and annotation targets, and each fragment copy can use the same cache.

## Call the compiler from Python

Run the CLI with `--json` and send one object on standard input. It returns `html`, `cache` and `diagnostics` together. Each request compiles one document, so repeated works share an endnote and year suffixes are computed together. Python launches Node.js 22.13.0 or later. Run this example from the cite.inator checkout.

```python
import json
import subprocess
from pathlib import Path

cache = json.loads(Path("demos/drop-in/citations.json").read_text(encoding="utf-8"))
request = {
    "paragraphs": ["{cite isbn:9780593656433 | locator:34}", "{cite endnote}"],
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

## Bind citations to controls you render

This API is available in version `0.1.4`. Try it in the [Reading room](http://127.0.0.1:4187/demos/static/#structured-preview) or [Plain HTML](http://127.0.0.1:4187/demos/drop-in/#structured-preview) after running `npm start`. The two captions share an endnote and have distinct return links. The earlier release shares a sample collection code and keeps its own record. The station log has an explicit unresolved record, so it still has an anchor and can be inspected. An unknown record ID is a planning error.

Use `planCitationOccurrences` when your application renders its own chart captions, table cells, or other controls. Give each reference list a document namespace. Use an occurrence ID tied to the content or control that cites the record. An occurrence keeps its ID when you move it within the list. Numeric styles still follow the order you supply.

```js
import { planCitationOccurrences } from "cite-inator";
import { bindCitationTrigger, initializeCitationInspector } from "cite-inator/browser";

const plan = planCitationOccurrences([
  { occurrenceId: "map-caption", recordId: "field-atlas", locator: "42", context: "Map caption" }
], cache, { namespace: "survey-map", citationStyle: "apa" });
const [occurrence] = plan.occurrences;

initializeCitationInspector(inspector, { cache });
const binding = bindCitationTrigger(inspector, trigger, occurrence, {
  endnote,
  focusFallback: () => captionHeading
});
```

The planner returns labels, formatted bibliography parts, and endnotes with safe destinations and backlinks. Treat the IDs it returns as opaque. An example document-level fallback looks like this:

```html
<citation-inspector>
  <a id="citation_10-survey-map-occurrence-map-caption"
     href="#citation_10-survey-map-note-field-atlas">Field atlas</a>
  <ol>
    <li id="citation_10-survey-map-note-field-atlas" tabindex="-1">
      <cite>Field atlas</cite>
      <a href="#citation_10-survey-map-occurrence-map-caption">Return to map caption</a>
    </li>
  </ol>
</citation-inspector>
```

Fragment links work before enhancement when the anchors and endnotes are in the document's light DOM. Inside a shadow root, use a host-provided fallback link to a reachable reference or a document-level bibliography. A native button also works where a link fallback is unnecessary.

Pass the actual endnote element to make **Go to endnote** focus it. This works inside a shadow root and leaves host routing in control. The inspector reads the in-memory cache supplied at initialization. Each mounted control has one binding. Call `binding.update(nextOccurrence, { endnote })` after the host updates its markup for the same occurrence ID. Dispose a binding before reusing its control for a different occurrence. `binding.dispose()` restores the original accessibility attributes. If the control is removed while its inspector is open, focus returns to the connected element supplied by `focusFallback`. In metadata reports, `occurrence` is the namespaced anchor ID and `occurrenceId` is the host's local key.

## Reader access and media

Use the built-in access sheet, grouped links, cross-inspector profile updates, preferred title destinations, or host settings integration. Mark openness on individual locations, using service IDs to associate subscriptions. [Reader access configuration and strings](reader-access.md)

For artwork and images, preserve attribution, date ranges, medium, institution, rights and source/served checksums. [Media support matrix and compact actions](media-support.md)

## Supply the cache

The ZIP includes an example `citations.json`. The npm package exports a larger sample cache at `cite-inator/citations.json`. Its local path is `node_modules/cite-inator/dist/citations.json`.

Use `makeCache(records)` from `cite-inator/records` to produce the versioned cache and reject duplicate IDs and identifier collisions. Records can include structured authors, dates, identifiers, locations, version and integrity metadata, and provenance. Give PDF and preprint locations an HTTPS URL, a named source and a valid `verifiedAt` timestamp. Record the document version when known.

Use `relatedIdentifiers: [{ label, value, authority }]` for identifiers such as a catalog or application number that can describe multiple editions or versions. The inspector displays them as text. They travel with the cache record and stay out of the identifier lookup index.

### Original publication and edition dates

Use `originalIssued` for the original work and `issued` for the edition you consulted. Both accept date-part arrays. CSL export maps them to `original-date` and `issued`. An existing note can remain as provenance or be removed if the fields already convey its information.

```json
{
  "title": "The Elementary Forms of Religious Life",
  "authors": [{"given": "Émile", "family": "Durkheim"}],
  "originalIssued": [1912],
  "issued": [1995]
}
```

The Chicago preset produces `(Durkheim [1912] 1995)` inline and `Durkheim, Émile. (1912) 1995.` at the start of the reference. APA produces `(Durkheim, 1912/1995)` and an original-publication note. For Chicago, set `reprintYear: "original"` for `(Durkheim 1912)`, `"edition"` for `(Durkheim 1995)`, or `"both"` for the default bracketed form. The reference keeps both dates. Supply `label` or `citationParts` for a house style with different punctuation.

For editorial bibliography text, provide `citationParts` in the style the page uses. In the development checkout, an explicitly `partial` record with nonempty valid `citationParts` can omit an unparsed title and still render that authored reference; missing titles in other states remain unresolved. Each part has `text` and optional `emphasis: "italic"` or `"bold"`. Add an HTTPS `href` to link that part in both the reference and panel. Other schemes leave the text unlinked. Text is escaped and the same formatting appears in the panel and endnotes. For an author–date suffix, write the year as `1990.` in Chicago or `(1990)` in the other author–date formats so the compiler can insert the letter.

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

Use `full-text` for a link you have verified leads to the work’s full text, and `library` for a catalog, lending, or subscription service. These are fields on a record alongside its identifier and other metadata. Both kinds appear in the panel and static endnotes. Pass `accessProviders: ["Open Library", "WorldCat"]` to the initializer, assign `element.accessProviders`, or use `access-providers="Open Library,WorldCat"` on the element. Use the site’s own reader settings to store or load preferences. An empty order list restores the supplied order.

Use `hiddenAccessProviders` independently to hide named services from both the inspector and endnotes. Names match case-insensitively. The attribute `hidden-providers`, property `hiddenProviders`, and initializer option `hiddenProviders` are aliases. The shorter attribute takes precedence if both are present. Assign `element.hiddenAccessProviders = ["JSTOR", "WorldCat"]`, pass that option to the initializer, or write `hidden-access-providers="JSTOR,WorldCat"` on the element. Assign an empty list to show them again. Hiding WorldCat also disables the ISBN catalog shortcut. The ISBN remains visible and can still be copied. Static endnotes without JavaScript show all supplied links.

For an abstract, provide an object with `text`, `source`, an optional HTTPS `url`, and optional `kind: "excerpt"`. The browser reads the text from the cache. Use excerpts or full text you have rights to distribute.

## Customize the inspector

Use `activation="hover"` on the element to enable mouse previews. Click or keyboard activation can keep a preview open. Touch uses tap. The setting also applies to Citation evidence and Citation credit. Choose **Move panel** from **Panel options**, then click or tap where the panel’s top-left corner should go. Escape or **Cancel move** exits without moving it. You can also drag from a blank area of the panel. Use the arrow keys while the panel heading has focus. Home resets its position. Press Escape or click or tap outside to dismiss the panel.

On compact screens the sheet uses up to 60% of the visible height and scrolls internally, leaving room to move it and reveal the page underneath.

The citation panel defaults to `cite.inator` and the built-in mark. Set `panel-title` and `panel-icon`, `evidence-title` and `evidence-icon`, or `credit-title` and `credit-icon` for each panel. Evidence and Credit inherit the main icon if you supply one. Use a same-origin icon URL or `none` to hide it. Allow `img-src 'self'` for custom icons. The title settings apply to the panel headings. Directive labels and software credit remain part of the compiled content.

The component reflects a boolean `open` attribute while any inspector panel is visible. Site tests can assert `citation-inspector[open]` after activation and wait for it to disappear after dismissal. Endnote backlinks are lettered in occurrence order. Their tooltips and accessible names identify the surrounding passage.

Set the CSS properties `--citation-paper`, `--citation-ink`, `--citation-accent`, `--citation-line`, `--citation-wash`, `--citation-panel-radius`, `--citation-icon-radius`, `--citation-heading-font` and `--citation-endnote-font` on the custom element to scope the theme to its citation content. Use `--citation-inline-color` and `--citation-inline-active` for the inline links.

Source icons show destinations as tooltips. Publisher links open in a separate tab or window. The PDF icon requests a download. A cross-origin PDF host may serve the document inline.

To support a library resolver, assign `element.institutionalURL = record => "https://…"`. Set `data-report` on the element to enable a bubbling `citation-report` event, or assign `element.report = handler`. The payload includes the canonical record, document URL and occurrence ID. Your application decides whether to send a report.

### Use the inspector in a host dialog

Validate keyboard behavior in the browsers your host supports. The 0.5.0 verification harness uses a maintained, dedicated Chromium build. The previously bundled Chromium 140 was observed to skip forward focus from the panel menu; it is not included in keyboard acceptance. Static reference/endnote links remain a separate fallback. Platform-specific verification and remaining gaps are recorded in the milestone evidence.

In version 0.1.4, mount the inspector inside its owning dialog and pass the actual endnote element. Provide `focusFallback` for a trigger that can disappear during an update. An Escape from the active inspector or its trigger dismisses it first. An Escape from a host dialog above it remains available to the host. The **Map details** demo exercises nested dismissal and focus return. Desktop opens an anchored popover when supported. Compact viewports and browsers without popover support use the modal presentation.

Set `--citation-*` tokens on the inspector or a containing element to match a local theme. The demo’s dark switch changes the preview section and its inspector independently of the rest of the page. In version 0.1.4, `--citation-panel-font` sets the panel’s body font family, `--citation-sheet-radius` sets the compact modal’s border radius, and `--citation-panel-backdrop` sets the modal backdrop background. The anchored panel still uses `--citation-panel-radius`.

Use the `open` attribute to observe panel visibility. If navigation reuses an inspector and its trigger, call `inspector.dismiss()` to dismiss the panel and restore focus to the trigger or its binding’s focus fallback. When the destination view owns focus, dismiss with `restoreFocus: false` and focus the new destination after dismissal. The browser may still perform its native dialog focus restoration while closing. A dismiss call also cancels a pending hover preview.

```js
// In the host's navigation callback, once the destination heading is mounted.
inspector.dismiss({ restoreFocus: false });
destinationHeading.focus({ preventScroll: true });
```

## Network and host behavior

The browser component loads its CSS and JSON from the same origin. Use `script-src 'self'; style-src 'self'; connect-src 'self'` with those assets. An already loaded page can keep using its cache offline. Offline reload with enhancement depends on host caching.

For server-side resolution, import `createCrossrefResolver` from `cite-inator/crossref`. The source checkout’s Resolution bench uses it on explicit Resolve or Force refresh requests. Resolve can reuse a fresh cache. Force refresh attempts a DOI lookup subject to Crossref backoff. A provider attempt supplies raw response and merge information. Static and cache-only records may have only normalized metadata.

Import `createOpenLibraryResolver` from `cite-inator/openlibrary` for ISBN editions. Call it server-side. It uses the same cache, attempt and force-refresh contract as Crossref. Open Library supplies edition metadata and an edition link when available. A lookup can also return a partial record, a miss, or a provider error. Preserve the result state and review the edition before replacing curated metadata.

```js
import { createOpenLibraryResolver } from "cite-inator/openlibrary";

const books = createOpenLibraryResolver({ mailto: "citations@example.org" });
const result = await books.resolve("isbn:9780140328721");
```

Equivalent ISBN-10 and ISBN-13 values refer to the same edition in the cache and resolver. Other edition identifiers stay distinct.

The demo uses Crossref for DOI requests and Open Library for ISBN requests. The bench opens with a prefilled ISBN and its bundled citation. **Resolve** uses that cached record. **Force refresh** attempts the live ISBN lookup. Use **a live ISBN** to try a book outside the demo cache.


### Find ISBN candidates by title and author

Use the search API from a server or build tool. Candidates are ranked on a 0–100 similarity score based on title, author, and requested year. The result includes catalog-listed ISBNs, publisher and date when available, the matched work and edition URLs, and provider evidence. The author names come from the matched work. Check that the candidate matches the edition and binding you consulted before adding its ISBN to your own cache. A catalog record can list more than one ISBN.

```js
import { createOpenLibrarySearch } from "cite-inator/openlibrary";

const finder = createOpenLibrarySearch({ mailto: "citations@example.org" });
const result = await finder.search({
  title: "The Elementary Forms of Religious Life",
  author: "Durkheim",
  year: 1995,
  language: "eng"
});
for (const candidate of result.candidates) {
  console.log(candidate.publicationDate, candidate.identifiers, candidate.editionURL);
}
```

Supply the title and author. An edition year and three-letter language code are optional. Open Library proposes a matching edition per work. Follow the work link to inspect other editions when needed. The client serializes its requests, caches repeated searches, and respects provider retry intervals. Results can be empty or partial. A provider failure can return previously cached candidates for review.

For a list, save a JSON object with a `books` array of search inputs and an optional `mailto`. The CLI queries the list sequentially and writes a result for each input. Save the output to keep the curator evidence.

```json
{
  "books": [
    {"title": "The Elementary Forms of Religious Life", "author": "Émile Durkheim", "year": 1995, "language": "eng"}
  ]
}
```

```sh
node scripts/compile.mjs --find-isbns --json < books.json > isbn-candidates.json
```

With the npm package installed, use `npm exec -- cite-inator --find-isbns --json` in place of `node scripts/compile.mjs --find-isbns --json`.


### Audit citations across a site

Pass a shared cache and the citation-bearing source files to the report command:

```sh
node scripts/compile.mjs --report citations.json essay.html lexicon.md bibliography.txt
```

The JSON report lists unused records, unresolved and malformed directives by fragment, duplicate DOI and ISBN claims, and same-title records by the same first author. It also identifies those title groups with differing edition years. The report flags records for review and leaves the source and cache intact. When a duplicate identifier appears in the input, the first claim supplies the lookup used by the report.

For custom notation or mixed build inputs, use `--report --json` and send `{ cache, fragments }` on standard input. Each fragment can supply `name`, `source` or `paragraphs`, `format`, and compiler `options`.

## 0.3.0 integration additions

Development tools and both browser bundles export `markerKind` for canonical/legacy/custom marker classification. `annotateMarkers(..., { noteContext: "work" })` keeps notes consistent with an editor works picker built from standalone `describeCitation`. See [the compatibility contract](article-tools.md#030-draftinator-compatibility-additions). These additions are not present in released 0.2.0 artifacts.

The [experimental import demo](https://github.com/randal-cox/cite.inator/blob/codex/citation-import/docs/import-demo.md) lives on the separate import branch. Its modules and local service are excluded from this candidate.


The source checkout includes a text-only `referenceItemPrefix` callback for host badges before reference items; see [the callback contract](article-tools.md#030-host-prefix-hook). Unknown access-profile help now appears once per owned list while inspector help remains available. These changes are not in the published 0.2.0 artifacts.

See the [style catalogue and coverage matrix](citation-styles.md) to distinguish reference formatting from experimental import recognition. Reviewed import remains source-only: [development APIs and measured limits](https://github.com/randal-cox/cite.inator/blob/codex/citation-import/docs/import-development.md).

## Author details and PubMed resolution

Authors describe the source and its use; site configuration controls shared behavior. Prefer the [author notation](authoring.md) for article-specific years, formatted references, artwork attribution and reading-copy links. Structured record fields remain available for integrations.

`createPubMedResolver` from `cite-inator/pubmed` performs exact MED identifier lookups through Europe PMC, retaining explicit DOI/PMCID aliases and provider evidence. Resolve with `await resolver.resolve('pmid:16060722')`; check the result state before merging. `mergeResolvedRecord(cache, result.record)` from `cite-inator/records` returns a validated new cache, preserves curated identity/fields, and rejects ambiguous owners or conflicting DOI/PMID/PMCID mappings. Do not replace the cache on provider error. The npm starter's resolver implements this workflow.
