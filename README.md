# cite.inator

Write DOI or ISBN markers in your article and turn them into linked references, endnotes and source panels.

```text
A claim {cite doi:10.1371/journal.pmed.0020124 | note:"Ioannidis 2005"}.

{cite endnote}
```

The optional `note:` is a generated work label for editors; tools may replace it, and it does not appear in the reader’s citation. A build or import step resolves bibliographic metadata and keeps a generated cache. Authors normally write identifiers, rather than reference JSON. Curated records remain useful for sources without identifiers and for site-specific metadata. [Load and initialize](#load-and-initialize) · [Overview](https://randal-cox.github.io/cite.inator/about.html) · [Try the examples](https://randal-cox.github.io/cite.inator/).

**Release 0.5.1 — Author notation and learning tools.** [Release and downloads](https://github.com/randal-cox/cite.inator/releases/tag/v0.5.1) · [Live playground and Guide](https://randal-cox.github.io/cite.inator/). Includes 22 editable examples, copied-file/npm/offline starters, a worked draft.inator editor integration, UI language configuration and the established compiler/import/reader tools.

**0.6 preview:** [File import, reviewed refresh and source checks](docs/library-maintenance.md) are available in an optional library module. Selected Zotero/CSL metadata and document-only CSL-JSON, BibTeX and RIS downloads are available on the development branch. [API and limitations](docs/zotero.md). Final 0.6 is not released.

**Article tooling, introduced in 0.2.0.** Editor notes, a site-wide bibliography and tag filters are included. See [the milestone record](docs/milestones/0.2.0.md) and [GitHub releases](https://github.com/randal-cox/cite.inator/releases).

The 0.5.0 project name is **cite.inator**; released 0.4.0 archives retain their original `citation-inator` package name. Existing browser assets, markup and stored-data contracts remain compatible; see [the naming migration](docs/naming-migration.md).

**0.5.1 notation:** the default marker is `cite` for both works and directives; there are no automatic aliases. [Migration instructions](docs/notation-migration.md). Published with maintainer approval and draft integration sign-off.

**Authoring principle:** authors describe the source and its use; site configuration controls shared behavior. The development candidate adds year, formatted-reference, artwork and copy-link fields in `{cite …}` and exact PMID-to-DOI discovery in the npm resolver. See [author notation and examples](docs/authoring.md); site-wide setup remains in JavaScript or configuration. Spaces separate named fields, with optional pipes for visual grouping. Author `tags` blocks and list `filters:true` provide topic filtering without JavaScript. Unmatched imported citations can become flagged unresolved placeholders that retain their wording until the reference is completed; see [the import contract](docs/import-api.md#unmatched-citations-as-unresolved-placeholders-051-development).

**0.6 development preview:** selected Zotero/CSL metadata conversion and non-destructive site matching are available as [developer APIs](docs/zotero.md). Account connection and the editor picker remain host integration work.


## Load and initialize

Try the [live learning playground](https://randal-cox.github.io/cite.inator/): 22 editable examples, annotated examples, import review, a worked editor integration and downloadable starter projects. Version 0.5.0 also adds shared [UI language configuration](docs/i18n.md). To run it locally, use `npm ci`, `npm run build:learn`, then `npm start` and open [the playground](http://127.0.0.1:4187/site/). See the [milestone record](docs/milestones/0.5.0.md) for acceptance and release evidence.

To serve the demos from the checkout, run `npm start` from the repository root.

**Without npm.** Start with [the standalone demo](https://github.com/randal-cox/cite.inator/tree/main/demos/drop-in), or copy `dist/citation-inspector.mjs`, `dist/citation-inspector.css`, and `dist/LICENSE` into your public assets. The browser uses the two adjacent assets and the compiled page’s JSON cache. Serve them from the same origin over HTTP or HTTPS.

**With npm.** Run `npm ci` and `npm pack` in the downloaded checkout to build the current local tarball. Copy the tarball whose filename `npm pack` prints into your project, then pass that file to `npm install`. Its version follows the checkout; use tag `v0.5.1` to reproduce this release. The same browser assets are in `node_modules/cite-inator/dist/`. Import the compiler from `cite-inator`.

```html
<link rel="stylesheet" href="./citation-inspector.css">
<script type="module" src="./citation-inspector.mjs"></script>

<citation-inspector data-cache="./article.html.json" class-prefix="essay"
  panel-title="Source details" panel-icon="/assets/logo.svg"
  evidence-title="Metadata trail" credit-title="Software credits">
  <!-- Insert the compiled article fragment here. -->
</citation-inspector>
```

To write `{ref …}` instead of `{cite …}` and emit classes such as `essay-cite`, set `citationKeyword: "ref"` and `classPrefix: "essay"` when compiling. Match the browser’s `class-prefix` to the compiler’s setting. The browser initializer also accepts `classPrefix`, `panelTitle`, `panelIcon`, `evidenceTitle`, `evidenceIcon`, `creditTitle` and `creditIcon`. [Configuration examples](docs/integration.md#load-and-initialize)

## Try programmatic citations

In the source checkout, run `npm start` and open the [Reading room](http://127.0.0.1:4187/demos/static/#structured-preview) or [Plain HTML](http://127.0.0.1:4187/demos/drop-in/#structured-preview). Open the map and table citations, then use their separate return links from the same reference. Try the unresolved station log and open a citation inside **Map details**. Press Escape twice to see focus return through both layers. The page’s reference links and backlinks also work with JavaScript disabled.

Use `planCitationOccurrences` and `bindCitationTrigger` to add the inspector to app-rendered controls. The example runs alongside the regular compiled citations on both pages. See the [integration guide](docs/integration.md#bind-citations-to-controls-you-render).

## Article editors and a site-wide bibliography

Version 0.2.0 adds source-only `note:"Cox 1995"` metadata, `describeCitation` and `annotateMarkers` editor APIs, and JSON CLI operations to describe, refresh or check notes. Per-item `tags:theory,praxis` contributions are collected with `collectMarkerTags` (or `--collect-tags --json`); the host aggregates and curates record topics. Use `includeDiagnostics: true` in build tools. The self-contained `citation-tools.mjs` also works in a browser without npm.

Compiler results expose actual citation occurrences, including listing-only `nocite` entries. `createSiteOccurrenceIndex` joins those anchors to published page routes; pass the resulting `siteOccurrences` into a bibliography to get static **Cited in** / **Listed in** return links and corresponding inspector sections. Records can carry `tags`, with a `tagCatalogue`, per-list usage overrides, build-time filters and optional keyboard-operated browser filters. `listFilters: { minItems: 6, minTags: 2 }` limits controls to longer multi-topic lists. `inlineTags: "marker"` displays the tags contributed at a particular mention.

Run `npm start` and try [the shared bibliography](http://127.0.0.1:4187/demos/static/bibliography.html) and [editor tools](http://127.0.0.1:4187/demos/static/editor-tools.html). Both examples are also in the standalone folder. See [the complete API, CLI and configuration guide](docs/article-tools.md). The [0.4.0 import API](docs/import-api.md) provides reviewed import and native working-copy extraction separately from these stable tools.

## Reader access and media

Try **Reader access and artwork** in the Reading room or Plain HTML. The built-in settings sheet remembers a reader’s services on this site, prioritizes explicitly open copies, and can use a library proxy or OpenURL resolver. Hosts can replace the settings UI and translate its text. Copied citations keep their canonical bibliographic URL. [Reader access API and wording](docs/reader-access.md)

Artwork and image records support creator attribution, literal date ranges, rights, institutions, accession numbers, contributors, and separate source/served checksums. The demo also shows an inline inspect icon. Custom icons can follow the text colour with `inspectIconMode: "mask"`. [Media fields and style support](docs/media-support.md)

## Write a citation

```text
Empathic concern can deepen partisan polarization {cite doi:10.1017/S0003055419000534}.

{cite evidence} · {cite credit}

{cite endnote}
```

![An open citation window beside the reading and its linked endnotes](docs/citation-example.png)

## Compile a page

With Node.js 22.13 or later, run this command from the downloaded repository. It writes `article.html` and its matching `article.html.json` cache.

```sh
node scripts/compile.mjs --style chicago-author-date --endnotes-heading References \
  demos/drop-in/reading.txt demos/drop-in/citations.json article.html my-article
```

The named styles are `chicago-author-date`, `apa`, `mla`, `harvard` and `vancouver`. Existing integrations can keep the `default` style. For prose that already has markup, install dependencies and use `--format html` or `--format markdown`. For Python and other build tools, `--json` reads a request from standard input and writes one JSON result.

For Chicago author–date, use the same `authors[].id` on variant spellings of one person's name to avoid spurious initials in inline citations. [Chicago author options](docs/integration.md#chicago-names-groups-and-legislation)

Keep the default `suffixScope: "fragment"` for articles with their own reference lists. Use `suffixScope: "cache"` for a work split across pages that share a bibliography. [Year-letter options](docs/integration.md#shared-excerpts-scoped-endnotes-and-reading-lists)

Write `{cite isbn:9780593656433 | prefix:see also | locator:34}` for an affix and locator. Use `citationParts` for editorial italics or bold. Use `originalIssued` and `issued` for the original and edition dates. Use `library` and `full-text` locations for access links. Apply reader preferences with `accessProviders` and `hiddenAccessProviders`. The panel exposes an `open` attribute while visible.

See the [citation-style catalogue and support matrix](docs/citation-styles.md). Version 0.3.0 also includes the host reference-prefix hook and once-per-list access help, documented in the integration guide.

See the [integration guide](docs/integration.md) for HTML and Markdown examples, reused fragments, the Python command, ISBN lookup and title-and-author search, and the browser API. See the [roadmap](ROADMAP.md) for follow-up work.

Static editor previews can copy `dist/citation-compiler.mjs` and import `compileMarkdown`, `compileHTML` or `compileCitations` directly, without a compiler server. With npm use `cite-inator/compiler-browser`. See the [browser compiler example](docs/article-tools.md#compile-an-article-in-a-browser-040-preview). The import API also supports reviewable existing-site record reuse and host-chosen new IDs; see [site integration](docs/import-api.md#reuse-site-records-and-choose-new-ids-040-preview).

## Try the import-review development demo

Common numbered journal references provide author/title/year proposals for lookup, and explicit DOI text supports bounded line-wrap recovery. Raw text and uncertainty remain available for review; [support details and public PDF results](docs/import-api.md).

New import markers use bare local IDs when safe; set `identifierForm: 'explicit'` to keep `local:`. Tools and import entries export the shared [`formatRecordId` helper](docs/article-tools.md#write-local-record-ids-040-preview). Existing marker spelling is preserved when notes are refreshed. Site reuse proposals retain subtitle/name/type differences for review; narrative multi-year groups preserve all work identities.

From a checkout of `v0.4.0`, run `npm ci`, `npm run build` and `npm start`, then open [Import review](http://127.0.0.1:4187/demos/import/). Choose an example, paste a complete document, or choose/drop a UTF-8 TXT/Markdown file. Raw Document includes its bibliography; edits rebuild references and matches. Format is detected from the source with a manual override. Radio choices update Converted Document live. Import popups can be dragged from blank space and resized at the lower-right corner. Download both Markdown and the reference cache for local-ID citations; the original bibliography is preserved.

This example demo saves no documents and uses the shared import API in the browser; `npm start` serves its files and optional private catalogue. Selected references automatically receive Crossref DOI and Open Library ISBN suggestions; known identifiers fetch metadata directly. Ready citations shows complete-group totals and a percentage; Looking up and Needs review separate background activity from human decisions; click a colored count to jump to its first item. Real Einstein/Planck examples exercise same-year ambiguity and DOI lookup. Optional local manuscript examples load from a gitignored catalogue; private examples appear only when a local catalogue is configured. Import limits accept JavaScript/JSON configuration; see [configuration and defaults](docs/import-demo.md#configure-import-limits). Strict DOI matches can complete automatically; ISBNs need an edition choice. Manual identifiers and completion without an identifier work offline. Bounded PDF/DOCX/ODT extraction and browser-native review/apply are implemented in 0.4.0; native-format round trips and editor integration remain separate. See the [import API guide](docs/import-api.md) for Node, copied-browser and JSON CLI use. See [the demo guide](docs/import-demo.md) for boundaries, keyboard controls and limits. Older published artifacts are unchanged.

## Work on the source checkout

Clone the [GitHub repository](https://github.com/randal-cox/cite.inator) and use Node.js 22.13 or later.

```sh
git clone https://github.com/randal-cox/cite.inator.git
cd cite.inator
npm ci
npm run build
npm test
```

Run `npm start` to open the [reading room](http://127.0.0.1:4187/) and find the notation guide and Resolution bench. The reading room’s **CSS** and **Style** selectors preview appearance and citation formatting separately. The help buttons beside **Hover**, **CSS**, and **Style** show the corresponding configuration. Install the dedicated browser with `npx playwright-core install chromium --only-shell`, then run `npm run test:browser`. Tests use Playwright’s isolated browser by default; `CITATION_CHROME` explicitly selects another test executable. Run the [adversarial review](https://github.com/randal-cox/cite.inator/blob/main/docs/adversarial-testing.md) at every milestone and when a change warrants it.

Before a check-in, follow the [check-in procedure](docs/checkin-procedure.md) and review the milestone record and roadmap. Install the local staged-check hook with `npm run hooks:install`. Use `npm run checkin:check` for the fast checks and `npm run milestone:check` when closing a milestone.

## Credit and license

Randal Cox maintains cite.inator. [ORCID](https://orcid.org/0009-0002-3427-7190) · [GitHub repository](https://github.com/randal-cox/cite.inator)

The software uses the MIT license. The optional tools bundle includes parser dependencies with their own notices, retained in its header and [THIRD_PARTY_LICENSES.txt](dist/THIRD_PARTY_LICENSES.txt). Third-party source material retains its own terms. See [CITATION.cff](CITATION.cff) for the software citation and [CHANGELOG.md](CHANGELOG.md) for release changes. Source records carry their own attribution.
