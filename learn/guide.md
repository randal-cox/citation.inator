# Guide

[Quick start](#load-compile-initialize) · [Worked examples](#examples) · [Complete notation](./notation.html) · [API reference](#api-reference)

Write a source identifier directly in your article:

```text
A claim {cite doi:10.1371/journal.pmed.0020124 | note:"Ioannidis 2005"}.

{cite endnote}
```

The DOI identifies the work. `note:` is a generated work label, hidden from readers; `annotateMarkers` and editor tools replace it when refreshing notes. Keep personal reminders in your article comments, outside the marker. The formatted author/year text comes from the work’s bibliographic metadata. Use `isbn:` for a particular book edition. The endnote marker places the reference list at that point in the article. Use the same keyword for every marker: `{cite identifier}` cites a work and `{cite endnote}` places its reference list. The default keyword is `cite`; `citationKeyword` configures a different keyword for both works and directives. Without an endnote directive, the list is appended to the article.

**Authors describe the source and its use; site configuration controls shared behavior.** Write article-specific dates, reference text, attribution and reading-copy links in the citation marker. JavaScript configures the site's shared behavior once.

## Load, compile, initialize

This Guide documents `0.5.1`. Start with a complete project. Both downloads include the article, saved bibliographic metadata, configuration and the matching library assets.

### Without a package installation

Download and extract the [copied-file starter](./citation-starter.zip). Open a terminal in its `citation-starter` folder, then run:

```sh
node server.mjs
```

This bundled server requires Node 22.13.0 or later. Alternatively, serve the extracted folder with any static HTTP server. Open `http://127.0.0.1:4188/`; opening `index.html` through `file://` will not load the browser modules.

### With npm

Download and extract the [npm starter](./citation-npm-starter.zip). Open a terminal in its `citation-npm-starter` folder, then run:

```sh
npm install
npm start
```

Use Node 22.13.0 or later. `npm install` uses the pinned library tarball included in the download and installs its dependencies. The library does not need to be published in the npm registry. `npm start` builds the article and serves it at `http://127.0.0.1:4188/`.

The rename keeps the cache schema `citation-inator.cache.v1`, `citation-*.mjs` asset filenames, `<citation-inspector>` and default `citation-*` classes. Use those documented names; they are compatibility contracts.

### Project files

- `article.md`: the article and its citation markers.
- `configuration.json`: citation style, names and reader behavior.
- `citations.json`: generated bibliographic metadata. The starter includes the metadata its example needs; see [resolving new identifiers](#resolve-source-metadata) when you add another source.

In the copied-file starter, reload after editing. In the npm starter, run `npm run build` and reload; `npm start` also rebuilds before serving.

### Browser: load and initialize

The copied-file starter's `index.html` loads the stylesheet and its browser entry point:

```html
<link rel="stylesheet" href="./citation-inspector.css">
<citation-inspector id="article"></citation-inspector>
<script type="module" src="./article.mjs"></script>
```

Its `article.mjs` reads the files supplied in the download, compiles the article and initializes its interactive citation panels:

```js
import {compileMarkdown} from './citation-compiler.mjs';
import {initializeCitationInspector} from './citation-inspector.mjs';
const [source,cache,options] = await Promise.all([
  fetch('./article.md').then(r => r.text()),
  fetch('./citations.json').then(r => r.json()),
  fetch('./configuration.json').then(r => r.json())
]);
const result = compileMarkdown(source, cache, options);
console.table(result.diagnostics); // citation-unresolved: metadata is missing or unresolved.
const element = document.querySelector('#article');
element.innerHTML = result.html; // Trusted authored content only.
initializeCitationInspector(element, {...options, cache:result.cache});
```

The npm starter compiles in Node through `build.mjs`, then `article.mjs` initializes the browser panels using the copied distribution file. Bundled applications can instead import `initializeCitationInspector` from `cite-inator/browser`. It uses the same options for both stages. Keep browser code and Node build code in their respective files.

For untrusted or editable HTML, sanitize the compiled output before inserting it. The compiler preserves authored HTML; it is not a sanitizer. The playground uses DOMPurify and keeps library-generated SVG icons. Its implementation is an example of this boundary.

The [offline learning site](./citation-learning-site.zip) includes the playground, Guide, saved import examples, public sample files and editor example. Extract it and run `node server.mjs` or `npm start` from its folder; no package installation is needed. Use a static HTTP server if you prefer. Live lookup remains an online page.

## First citation

The [complete notation reference](./notation.html) covers every marker option, directive, escape rule, scope and compatibility form.

[Open the playground](./index.html#playground), select **First citation**, and edit its sentence. Write a DOI or ISBN in the marker; you do not need to invent a local record ID or type a JSON reference. The examples include saved metadata so they work offline.

```text
A claim {cite doi:10.1371/journal.pmed.0020124}.

{cite endnote}
```

The endnote marker becomes a formatted reference list. It is literal source notation in this code block; the playground's Result shows the processed version. Metadata supplies the author, title and publication details. Resolve identifiers once in your build or import workflow, then retain the generated metadata for reliable rendering. Compilation itself does not make network requests.

## Resolve source metadata

The starter works offline with its saved metadata. When you add a new DOI or ISBN to `article.md`, the npm starter can fetch its bibliographic details and save them for rendering:

```sh
npm run resolve
npm start
```

Run these commands inside the extracted npm starter after `npm install`. The resolver runs in Node, not in the browser. It sends the new identifiers to Crossref or Open Library. It keeps existing metadata and saves the file only after every missing identifier resolves. A failed lookup leaves the existing metadata file in place and discards the other results from that run. Remove or fix the failing marker, then rerun; use [import review](./import/) to investigate it.

The included `resolve.mjs` is the complete script:

```js
import {readFile,writeFile} from 'node:fs/promises';
import {compileMarkdown} from 'cite-inator/markup';
import {readCache,mergeResolvedRecord} from 'cite-inator/records';
import {createCrossrefResolver} from 'cite-inator/crossref';
import {createOpenLibraryResolver} from 'cite-inator/openlibrary';
import {createPubMedResolver} from 'cite-inator/pubmed';

const source=await readFile('article.md','utf8');
let cache=JSON.parse(await readFile('citations.json','utf8'));
const options=JSON.parse(await readFile('configuration.json','utf8'));
const missing=compileMarkdown(source,cache,options).diagnostics
  .filter(item=>item.code==='citation-unresolved').map(item=>item.identifier);
const providers={doi:createCrossrefResolver(),isbn:createOpenLibraryResolver(),pmid:createPubMedResolver()};
for(const identifier of new Set(missing)){
  const provider=providers[identifier.split(':',1)[0]];
  if(!provider)throw new Error(`Add metadata for ${identifier} through import review or a curated record.`);
  const prior=readCache(cache).byIdentifier.get(identifier);
  if(prior?.state==='resolved')continue;
  const result=await provider.resolve(identifier,{seed:prior});
  if(result.record?.state!=='resolved')throw new Error(`Could not resolve ${identifier}. Review the identifier and try again.`);
  cache=mergeResolvedRecord(cache,result.record);
}
const checked=compileMarkdown(source,cache,options);
if(checked.diagnostics.some(item=>item.code==='citation-unresolved'))throw new Error('Review unresolved citations before saving metadata.');
await writeFile('citations.json',JSON.stringify(cache,null,2)+'\n');
console.log('Saved bibliographic metadata. Run npm start to build and view the article.');
```

This example resolves explicit DOI/ISBN markers. Archival sources, unsupported identifier types and incomplete provider records require import review or curated metadata. It does not guess missing identifiers. Review each new record in `citations.json` before publishing; ISBN records are often partial, with literal author names, sentence-case titles or missing original publication dates. For the copied-file starter, download the npm starter too: copy your `article.md`, `configuration.json` and `citations.json` into it, run `npm install` and `npm run resolve`, then copy the updated `citations.json` back. You need Node and npm for that metadata step; serving the copied-file site still needs no package installation. Seeded existing records keep their curated IDs; newly resolved records receive provider-generated IDs. The DOI/ISBN marker remains the stable lookup key. See [resolver configuration](./reference/integration.html#network-and-host-behavior) for persistence and refresh options.

### When to supply reference records

Sources without a DOI or ISBN still need citations: archival material, interviews, unpublished work and some artworks are examples. A site may also curate edition details, rights, access links, tags or authored reference formatting. These are legitimate uses for structured records and local IDs. Most authors should encounter the generated metadata through an editor, rather than write JSON by hand.

## Formatting and appearance

When omitted, `citationStyle` uses the legacy `default` author–date preset; choose a named preset explicitly for a house style. The starter selects Chicago author–date. The **Style** selector changes `citationStyle`: `chicago-author-date`, `apa`, `mla`, `harvard`, or `vancouver`. These are library presets, not a complete CSL engine or a claim of exhaustive manual conformity. Compare the same source in each preset before choosing a house style. **CSS** changes appearance; **Style** changes citation formatting. The CSS examples affect only the citation result.

In either starter, edit `configuration.json`. The compiler and inspector both receive these settings:

```json
{
  "citationStyle": "chicago-author-date",
  "citationKeyword": "reference",
  "classPrefix": "research",
  "namespace": "essay-one",
  "endnotesHeading": "References",
  "activation": "hover",
  "panelTitle": "Sources",
  "evidenceTitle": "Source evidence",
  "creditTitle": "About this tool",
  "accessStorageKey": "my-site-reading-profile"
}
```

With `citationKeyword:'reference'`, write `{reference doi:10.1371/journal.pmed.0020124}` and `{reference endnote}`. `classPrefix` changes generated class names; `data-citation-part` remains the stable styling hook. Pass the same configuration to compile, initialization and editor tools so style, locale and class names agree. With different prefixes, class-based host styling can miss generated elements; stable parts remain available. Changing the keyword leaves other marker spellings as ordinary text without a diagnostic; there is no always-on short-form alias. Misspelled keywords are also ordinary text. Give separate article fragments separate namespaces so citation/endnote IDs cannot collide.

```css
/* Keep host styling confined to the component. */
citation-inspector { --citation-accent:#007f9e; }
citation-inspector::part(panel) { --citation-paper:#fff; }
```

Use the properties and parts supported by the distributed stylesheet; a host should not depend on the private shadow DOM structure. Configure reader behavior in the same `configuration.json` file. To use a custom icon, copy the icon into your assets and set `panelIcon` to its URL.

Evidence and credit remain hoverable when ordinary references use click. Click, keyboard and touch also open panels. Escape or clicking outside closes them; panel movement is available through its menu and keyboard. Drag from non-control areas without selecting text. Supply same-origin icon URLs; `none` hides an icon. Compiler reading-list inspection supports `inspectAppearance:'icon'`, `inspectPlacement:'before'`, and `inspectIconMode:'mask'` for a custom icon that follows text color.

## Locators, groups and source formatting

```text
{cite isbn:9780029079379 | prefix:"see also" | locator:"p. 34"}
{cite arxiv:1706.03762 | locator:"§ 3" | form:narrative}
{cite doi:10.6073/pasta/98b16d7d563f265cb52372c8ca99e60f; doi:10.5281/zenodo.3960218}
```

Locators can name pages, chapters, sections or timestamps. A locator adds citation text; it does not by itself link to a particular page or timestamp. The selected citation style determines the surrounding punctuation. Use `compileHTML` to compile within existing authored HTML, or `compileMarkdown` for Markdown; code blocks and excluded interactive elements are skipped. Structured editors can import `planCitationOccurrences` from `cite-inator` and call `planCitationOccurrences(occurrences, cache, options)` with stable occurrence IDs instead of splicing compiled HTML by position; see the [structured occurrence contract](./reference/integration.html). `planCitationOccurrences` is a Node/build-time API and requires a document `namespace`, for example `{namespace:"essay-one"}`. It is not exported by the copied browser compiler bundle.

Authors can use `reference:` for formatted reference text and `original-year:` / `edition-year:` for publication dates; see [author-supplied details](./reference/authoring.html). Integrations can alternatively use record `citationParts`, `originalIssued` and `issued`. Keep source bibliographic data in structured fields when you want presets to format it automatically. `reprintYear` chooses `both`, `original` or `edition`. Year letters normally belong to one reference list. Use `suffixScope:'cache'` only for one work split across pages sharing a bibliography, not independent essays.

## Access, rights and evidence

Record `locations` distinguish publisher, PDF, repository, library and full-text copies. Set access for each copy separately: a repository copy may be open while the publisher copy requires a subscription. Set `access:'open'` and its checked date only when supported by evidence. A PDF format alone does not imply free access. Reader settings distinguish unknown preferences from none chosen and can hide services. Canonical citation URLs remain bibliographic, preferring the DOI, even when a reading link follows a preferred service.

Use `accessSettings:'host'` to hand settings off to your own panel. Reader choices stay in the configured site's browser storage, with an in-memory fallback if storage fails. See [the access guide](./reference/reader-access.html) for profile state, events, hidden-provider settings, proxies and OpenURL. The playground uses its own storage key.

Artwork records can retain uncertain creators, literal dates, medium, institution/accession, rights and separate source/served-copy checksums. These fields do not justify inferring a photographer from an uploader. Chicago has specific artwork formatting; the other presets preserve these fields generically. Inspect source provenance through `{cite evidence}`. `{cite credit}` identifies the software, author, license and citation.

## Notes, tags and shared bibliographies

Editor notes are invisible to readers:

```text
{cite doi:10.1371/journal.pmed.0020124 | note:"Ioannidis 2005" | tags:methods,reliability}
```

Import editor tools from `cite-inator/tools`, or copy `dist/citation-tools.mjs` from the same version for browser use; the minimal copied-file starter does not include this optional bundle. After installing the npm starter, find it at `node_modules/cite-inator/dist/citation-tools.mjs`.

```js
// Node build script: source, cache and options are read as in build.mjs above.
import {markerKind, describeCitation, annotateMarkers, collectMarkerTags,
  createSiteOccurrenceIndex} from 'cite-inator/tools';
const kind = markerKind(`{${options.citationKeyword ?? 'cite'} endnote}`, options);
const label = describeCitation('doi:10.1371/journal.pmed.0020124', cache, options).text;
const updated = annotateMarkers(source, cache, {...options, format:'markdown', noteContext:'work'});
const counts = collectMarkerTags([{source, format:'markdown'}], cache, options);
```

Use the same style/keyword configuration as your build. `annotateMarkers` replaces existing `note:` text with a generated label; `noteContext:'work'` omits article-local year letters from those notes without changing reader-facing letters. `collectMarkerTags` counts contributions; curators decide which accumulated tags become record topics. Use only documented marker options; unknown fields are not an extensible metadata contract and may be treated as legacy hints or make the marker malformed. Editors must preserve source rather than reconstruct it from HTML.

Reading-list directives, `tagCatalogue`, `inlineTags` and `listFilters` produce topic badges and filters. `data-ci-tag` supports per-tag styling. `referenceItemPrefix` adds escaped text before each item. Cross-page links use `createSiteOccurrenceIndex` from actual compiled anchors, never guessed article positions; its input and output are in the [article tools reference](./reference/article-tools.html). Supply `siteOccurrences` and a trusted `siteOrigin`; listed-only entries retain their distinct “Listed in” meaning.

## Reviewed import

Open the [saved-metadata import walkthrough](./import/). Its fixed example metadata works without contacting providers. The separate [live lookup demo](./import/live.html) sends bibliographic reference details to Crossref and Open Library; it does not upload the complete document. Saved examples demonstrate the review flow, not search accuracy or current provider availability.

Try the same small public document as [plain text](./documents/sample.txt), [Markdown](./documents/sample.md), [PDF](./documents/sample.pdf), [DOCX](./documents/sample.docx) or [ODT](./documents/sample.odt). Download one, then drop it into Import Document. One reference is real; the second deliberately has no bibliography entry. Original-file download should reproduce your input bytes. The [manifest](./documents/manifest.json) supplies checksums and attribution. These are newly authored public examples, not private manuscript exports.

1. In the Einstein example, open an ambiguous citation and choose the paper matching the sentence. Its identifier lookup starts automatically.
2. Compare the supplied bibliography with candidate metadata. Keep identity/edition conflicts for review; an automatic match is not a check of the sentence's claim.
3. For a missing source, paste a DOI/ISBN/URL or leave the citation unchanged. A reference without an identifier can finish as a local record.
4. Open Converted Document to inspect the actual `{cite ...}` notation, then Reading Preview. Download both converted Markdown and references.
5. Edit Raw Document and verify that stale choices cannot be applied to the changed source. The working copy includes its bibliography; choosing another example replaces that complete source.

Import starts with a complete document and its bibliography. Text, Markdown, PDF, DOCX and ODT adapters extract reviewable text while preserving the original file. They do not reconstruct arbitrary native layouts or provide OCR. Review ambiguity, combined citations, unmatched spans and edition differences before applying a conversion.

An identifier recovered from a wrapped URL is a proposal. It becomes a canonical identifier only after successful metadata completion or explicit acceptance. A work can finish with a local record and no DOI/ISBN. Keep the downloaded converted Markdown and cache together. Provider failure leaves manual identifier entry and local completion available; it must not invent metadata or silently accept an edition.

Use `processImportRequest` from `cite-inator/import`, or the browser `citation-import.mjs` bundle. Call it with `action:'analyze'`, retain the returned `review`, then submit `action:'preview'` with that review, its `reviewId` and your accepted `decisions`. The [headless API reference](./reference/import-api.html) supplies complete request and response examples.

The library never edits your document or cache: preview returns proposed text and records. Bind a host revision token when review begins; immediately before saving, re-check that revision (also after asynchronous lookups) and commit text and accepted new records together. Discard previews on cancel. The worked draft host stages records in memory; its Undo reverts text only.

Preview's `cache` can include the supplied site library and uncited source entries. `newRecordIds` means newly allocated, not necessarily cited. Preserve the original site records and persist only new records referenced by the accepted final text; do not replace your site library wholesale with `result.cache`. The [worked download handler](./host/integration-source.mjs) compiles the final Markdown and filters staged additions by the referenced record IDs, covering later deletion and Undo. Removing the old bibliography is a separate reviewed source edit owned by the host; the API does not remove it for you.

## Translation

Pass the same `locale` and `strings` to compiler and inspector. English is the fallback; Spanish supplies the example catalogue. Values use `Intl` rules, and overrides can use plural categories:

```js
const options = {
  locale:'es',
  strings:{'access.more':{one:'{countLabel} más',other:'{countLabel} más'}}
};
```

A heading or title you set explicitly overrides its translation. Source titles/authors, citation-style conventions and editor-authored labels are not translated. The learning shell and import host remain English; locale configuration translates library UI. Host pages own their language and direction. Use `createCitationMessages` and `citationLocales` from `cite-inator/i18n` to inspect/extend the catalogue without modifying shared defaults.

## Next recipes

Browse the [annotated working examples and API guides](./guide.html#examples), try the [editor-note and tag tools](./tools/editor-tools.html), or explore the [shared bibliography](./tools/bibliography.html). The [worked draft integration](./host/) runs the accepted editor code, with [source, staging, revision, undo and persistence notes](./host/recipe.html). These are separate hosts of the same library; the import API does not require a particular page layout or CSS framework.

## Author-supplied reference details

```text
{cite isbn:9780029079379 | original-year:1912}
{cite isbn:9780029079379 | edition-year:1995}
{cite isbn:9780029079379 | reference:"Durkheim, É. (1995). *The elementary forms of religious life*. Free Press."}
{cite doi:10.1371/journal.pmed.0020124 | read-url:"https://journals.plos.org/plosmedicine/article?id=10.1371/journal.pmed.0020124" | access:open}
```

The ISBN normally supplies the edition year. Year overrides apply to every mention of that work in the document; conflicting declarations fail. Custom reference text supports *italic* and **bold** with asterisks, not embedded HTML. A changed year cannot silently rewrite a previously authored reference; supply `reference:` too or correct the shared metadata. Cache-wide year letters require shared date corrections rather than per-page overrides.

Artwork fields are `attribution:`, `display-date:`, `medium:`, `dimensions:`, `institution:`, `accession:`, `rights:`, `photographer:` and `uploader:`. They supplement an existing work. Photographer and uploader are distinct from creator. Copy fields are `read-url:`, `pdf:`, `access:` and `checked:`. Quote text/URLs; years and ISO dates may be unquoted. PDF links require a checked date (`checked:2026-11-25`); supply a real date when you have checked the link. Access is `open`, `subscription`, `purchase`, `loan` or `unknown`; it describes only the supplied copy. Canonical DOI links remain unchanged.

The returned metadata records these as Document author assertions. The input cache stays unchanged. Identifier aliases share assertions. Repeat equal values freely; differing values for one work are errors. Supported years are 1000–9999, original no later than edition. A different edition year discards the old month/day.

The npm starter resolver accepts PMID as well as DOI and ISBN. An exact PubMed response from Europe PMC supplies DOI/PMCID aliases automatically, preserving curated records and rejecting identity conflicts. Ordinary compilation makes no network requests. The examples use saved metadata. See the [authoring reference](./reference/authoring.html) for syntax, provenance and limitations.

## Optional separators and author-defined topics

Spaces separate named fields; pipes are optional visual separators. Both spellings below work. Quote values containing spaces or marker punctuation.

```text
{cite isbn:9780029079379 original-year:1912 locator:"p. 34"}
{cite isbn:9780029079379 original-year:1912 | locator:"p. 34"}
```

Build a filterable reading list in the article without editing JavaScript:

```text
{cite tags doi:10.1371/journal.pmed.0020124 methods:"Methods"}

{cite tags isbn:9780029079379 theory:"Theory"}

{cite list doi:10.1371/journal.pmed.0020124; isbn:9780029079379 filters:true}
```

The tags block assigns a topic and its label to a work without citing it in the prose. Put each block in a separate paragraph. Repeated assignments accumulate; conflicting topic labels fail. `filters:true` enables this list's checkboxes; `filters:false` disables them independently of the site default. Site configuration can still provide shared topic labels and icons. These declarations do not count as citation-mention tags in `collectMarkerTags`.

## Keep an unfinished citation visible

```text
{cite pending-rivera unresolved:"(Rivera, 2020)"}
```

If a reference is missing, `unresolved:` keeps its original citation wording visible with an unresolved warning. The compiler and editor tools report `citation-unresolved-placeholder`; it cannot disappear into ordinary prose unnoticed. Complete the same local record with reviewed metadata and mark it resolved, and normal citation formatting resumes automatically. Import review offers **Keep as unresolved** for an unmatched item. Complex groups without safe individual spans remain unchanged for manual review. See the [import placeholder contract](./reference/import-api.html#unmatched-citations-as-unresolved-placeholders-051-development).

A custom `citationKeyword` must reach every stage: import, compiler and tools. For example, an import using `citationKeyword:"reference"` needs the same setting in `markerKind`, `describeCitation` and compilation. No call changes another call's default. Incomplete configured markers report `citation-malformed`; escaped examples, code and other keywords remain ordinary text. See [configuration propagation](./reference/notation-migration.html#pass-the-same-keyword-to-every-parsing-stage).
