# Guide

[Quick start](#load-compile-initialize) · [Worked examples](#examples) · [Complete notation](./notation.html) · [API reference](#api-reference)

Write a source identifier directly in your article:

```text
A claim {cite doi:10.1371/journal.pmed.0020124 | cue:"Ioannidis 2005"}.

{cite endnote}
```

The DOI identifies the work. The optional `cue:` helps you recognize it while editing. See [readable citation blocks](#readable-citation-blocks) and [recognize-a-source cues](#recognize-a-source-with-cue). The formatted author/year text comes from the work’s bibliographic metadata. Use `isbn:` for a particular book edition. The endnote marker places the reference list at that point in the article. Use the same keyword for every marker: `{cite identifier}` cites a work and `{cite endnote}` places its reference list. The default keyword is `cite`; `citationKeyword` configures a different keyword for both works and directives. Without an endnote directive, the list is appended to the article.

## Core Ethic for cite.inator

**Authors describe the source and its use; site configuration controls shared behavior.** Write article-specific dates, reference text, attribution and reading-copy links in the citation marker. JavaScript configures the site's shared behavior once.

## Load, compile, initialize

This Guide documents `0.6.0-preview.7`. Start with a complete project. Both downloads include the article, saved bibliographic metadata, configuration and the matching library assets.

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

**Using a starter?** The browser setup is already included. Edit `article.md`, reload the copied-file starter, or run `npm start` in the npm starter. Continue with [First citation](#first-citation).

**Adding citations to an existing website?** If your build already produces the compiled article and matching reference cache, the reader panels initialize automatically when you load the browser module:

```html
<link rel="stylesheet" href="./citation-inspector.css">
<script type="module" src="./citation-inspector.mjs"></script>
<citation-inspector data-cache="./article.html.json">
  <!-- Your compiled article HTML goes here. -->
</citation-inspector>
```

The stylesheet supplies the appearance. The module opens the interactive panels. `data-cache` points to the saved reference metadata. See [site integration](./reference/integration.html#load-and-initialize) for configuration.

<details>
<summary>Compile Markdown in the browser: full JavaScript example</summary>

The copied-file starter uses this approach because its article is still Markdown. Its included `article.mjs` performs three steps: load your files, compile the citations, then display the article with interactive panels.

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

Its `index.html` loads this supplied file with `<script type="module" src="./article.mjs"></script>` and provides `<citation-inspector id="article"></citation-inspector>` for the result. Use this entry point in place of the direct browser-module script above when compiling Markdown in the browser.

The npm starter instead compiles during its build; its browser file adds reader interaction afterward. Applications can import `initializeCitationInspector` from `cite-inator/browser` when they need to set options programmatically.

This example inserts trusted authored HTML. For untrusted or editable content, sanitize the compiled output before insertion; the compiler preserves authored HTML. The playground demonstrates this with DOMPurify.

</details>

The [offline learning site](./citation-learning-site.zip) includes the playground, Guide, saved import examples, public sample files and editor example. Extract it and run `node server.mjs` or `npm start`; no package installation is needed. Online lookups require a connection.

## First citation

The [complete notation reference](./notation.html) covers every marker option, directive, escape rule, scope and compatibility form.

[Open the playground](./index.html#playground), select **First citation**, and edit its sentence. Write a DOI or ISBN in the marker; you do not need to invent a local record ID or type a JSON reference. The examples include saved metadata so they work offline.

```text
A claim {cite doi:10.1371/journal.pmed.0020124}.

{cite endnote}
```

The endnote marker becomes a formatted reference list. It is literal source notation in this code block; the playground's Result shows the processed version. Metadata supplies the author, title and publication details. Resolve identifiers once in your build or import workflow, then retain the generated metadata for reliable rendering. Compilation itself does not make network requests.

## Resolve source metadata

The starter already has the reference details for its example. When you add your own DOI, ISBN or PMID, the resolver can fetch the author, title and publication details for you.

1. Write the identifier in `article.md`, for example `{cite doi:10.1371/journal.pmed.0020124}`.
2. In the **npm starter** folder, run:

   ```sh
   npm run resolve
   npm start
   ```

3. Check the formatted reference in your browser. Review the fetched details before publishing, especially book editions and dates.

Run `npm install` once if you have not already. The resolve command saves the details in `citations.json`; later previews use that saved metadata, including offline. You do not need to write reference JSON or edit the resolver script.

### If a lookup fails

Check the identifier and try again, or use [import review](./import/) to investigate the reference. A failed run leaves your existing metadata file unchanged. Sources without a supported identifier, such as an interview or archival item, need a reviewed local reference.

### Using the copied-file starter

The copied-file starter can display saved references but does not include the Node resolver. Use the npm starter to fetch new metadata: copy `article.md`, `configuration.json` and `citations.json` into it, run `npm install` and `npm run resolve`, then copy the updated `citations.json` back.

<details>
<summary>How the resolver works: full JavaScript example</summary>

The included `resolve.mjs` finds missing identifiers, asks the matching provider for metadata and saves the file only after every missing identifier resolves. DOI uses Crossref, ISBN uses Open Library and PMID uses Europe PMC. A failed lookup discards that run’s proposed changes. Compilation itself makes no network requests.

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

Existing curated record IDs are preserved; new records receive provider-generated IDs. The DOI, ISBN or PMID in your marker remains the lookup key. Review provider metadata before publishing: a returned record can still have incomplete names, dates or edition details. See [resolver configuration](./reference/integration.html#network-and-host-behavior) to adapt persistence and refresh behavior.

</details>

### When to supply reference records

Sources without a DOI or ISBN still need citations: archival material, interviews, unpublished work and some artworks are examples. A site may also curate edition details, rights, access links, tags or authored reference formatting. These are legitimate uses for structured records and local IDs. Most authors should encounter the generated metadata through an editor, rather than write JSON by hand.

## Formatting and appearance

The smallest `configuration.json` is:

```json
{}
```

**Omit any setting whose default you want.** The library supplies defaults automatically; you do not need to repeat them. To choose Chicago formatting and hover panels, for example, the whole file can be:

```json
{"citationStyle":"chicago-author-date", "activation":"hover"}
```

The starter already chooses Chicago and hover. Replacing its configuration with `{}` uses the library’s default author–date preset and click activation. **Style** controls citation formatting; **CSS** controls appearance. The named presets cover common conventions rather than every rule of a style manual.

<details>
<summary>Configuration: defaults and choices</summary>

Edit only the settings you want to change. These are the options used in this Guide; [integration reference](./reference/integration.html) covers additional hooks and structured-editor setup.

<div class="configuration-table" role="region" aria-label="Configuration defaults and choices" tabindex="0">

| Setting | Default when omitted | Choices or accepted value |
| --- | --- | --- |
| `citationStyle` | `"default"` (author–date) | `default`, `chicago-author-date`, `apa`, `mla`, `harvard`, `vancouver` |
| `citationKeyword` | `"cite"` | Lowercase letter first, then letters/digits/hyphens; at most 32 characters |
| `classPrefix` | `"citation"` | Same naming rules as the keyword; use the compiler’s prefix in the reader |
| `namespace` | `"cit"` | Lowercase letter first, then letters/digits/hyphens; at most 40 characters; choose a unique value for each article fragment on one page |
| `endnotesHeading` | `"Endnotes"` in English | Nonempty text; the default follows `locale` |
| `activation` | `"click"` | `click` or `hover`; keyboard and touch work in both modes |
| `panelTitle` | `"cite.inator"` | Your text |
| `evidenceTitle` | `"Citation evidence"` in English | Your text; the default follows the compiled annotation’s language |
| `creditTitle` | `"Citation credit"` in English | Your text; the default follows the compiled annotation’s language |
| `accessStorageKey` | `"citation-inator.access.v1"` | Nonempty browser-storage key; change it to separate reader profiles |
| `accessLayout` | `"grouped"` | `grouped` or `flat` |
| `accessSettings` | `"builtin"` | `builtin`, `host` (your settings panel), or `off` |
| `accessCollapseAfter` | `3` | Nonnegative number of “Other source” destinations to show before collapsing the rest |
| `staleAfterDays` | No stale-link styling | Nonnegative number of days; `0` also disables styling |
| `reprintYear` | `"both"` | `both`, `original`, `edition` |
| `suffixScope` | `"fragment"` | `fragment` or `cache` |
| `inspectAppearance` | `"text"` | `text` or `icon` |
| `inspectPlacement` | `"after"` | `before` or `after` |
| `inspectIconMode` | `"image"` | `image` or `mask` |
| `listFilters` | `false` | `false`, `true`, or `{ "minItems":6, "minTags":2 }` with nonnegative whole-number thresholds |
| `inlineTags` | `false` | `false`, `true`, or `"marker"` |
| `locale` | `"en"` | English (`en`), Spanish (`es`), or another locale with English fallback and your string overrides |
| `strings` | Built-in language catalogue | Text or plural-category overrides; see [Translation](#translation) |

</div>

Pass the same configuration to compiler and reader initialization. Structured occurrence plans require an explicit namespace; the default above applies to ordinary article compilation. Optional custom icons (`panelIcon` and `inspectIcon`) take a safe icon URL; `panelIcon:"none"` hides the panel icon. Leave them out to use the built-in icons.

</details>

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

## Author-supplied reference details

```text
{cite isbn:9780029079379 | original-year:1912}
{cite isbn:9780029079379 | edition-year:1995}
```

The ISBN normally supplies the edition year. Year overrides apply to every mention of that work in the document; conflicting declarations fail. Custom reference text supports *italic* and **bold** with asterisks, not embedded HTML. A changed year cannot silently rewrite a previously authored reference; supply `reference:` too or correct the shared metadata. Cache-wide year letters require shared date corrections rather than per-page overrides.

Artwork fields are `attribution:`, `display-date:`, `medium:`, `dimensions:`, `institution:`, `accession:`, `rights:`, `photographer:` and `uploader:`. They supplement an existing work. Photographer and uploader are distinct from creator. Copy fields are `read-url:`, `pdf:`, `access:` and `checked:`. Quote text/URLs; years and ISO dates may be unquoted. PDF links require a checked date (`checked:2026-11-25`); supply a real date when you have checked the link. Access is `open`, `subscription`, `purchase`, `loan` or `unknown`; it describes only the supplied copy. Canonical DOI links remain unchanged.

The returned metadata records these as Document author assertions. The input cache stays unchanged. Identifier aliases share assertions. Repeat equal values freely; differing values for one work are errors. Supported years are 1000–9999, original no later than edition. A different edition year discards the old month/day.

The npm starter resolver accepts PMID as well as DOI and ISBN. An exact PubMed response from Europe PMC supplies DOI/PMCID aliases automatically, preserving curated records and rejecting identity conflicts. Ordinary compilation makes no network requests. The examples use saved metadata. See the [authoring reference](./reference/authoring.html) for syntax, provenance and limitations.

## Readable citation blocks

Pipes are optional separators for your eyes. The opening brace can sit beside `cite` or on its own line. Spaces, line breaks and indentation can separate fields too, so a long citation can stay readable while you edit. These two markers produce the same citation:

```text
{cite doi:10.1371/journal.pmed.0020124 locator:"p. 2"}

{
  cite
  doi:10.1371/journal.pmed.0020124
  locator:"p. 2"
  comment:"Compare this passage with the discussion."
}
```

Long reference text and reading-copy URLs especially benefit from separate lines:

```text
{cite isbn:9780029079379
  original-year:1912
  edition-year:1995
  reference:"Durkheim, É. (1995). *The elementary forms of religious life*. Free Press."
}

{cite doi:10.1371/journal.pmed.0020124
  read-url:"https://journals.plos.org/plosmedicine/article?id=10.1371/journal.pmed.0020124"
  access:open
}
```

Use `comment:` for reminders, questions or original import wording. Comments never appear in compiled citations, references or reader panels. They remain in your Markdown, so sharing or downloading the source also shares its comments. Quote comment text; escape an embedded double quote as `\"`. A comment does not supply bibliographic metadata or verify a source.

## Recognize a source with cue

A DOI is precise but hard to recognize while writing. A compact `cue:` lets you see which work a marker refers to without compiling it:

```text
{cite doi:10.1371/journal.pmed.0020124 cue:"Ioannidis, 2005"}
```

A cue is a specialized identity annotation. For a resolved reference, the reader citation comes from the metadata, not the cue. Until the target is resolved, the cue also supplies provisional reader wording with an unresolved warning. Editor tools can generate or refresh resolved-work cues; they preserve your `comment:` text. Use comments for your own thoughts and cues for recognizing the work.

## Author-defined topics

Build a filterable reading list in the article without editing JavaScript:

```text
{cite tags doi:10.1371/journal.pmed.0020124 methods:"Methods"}

{cite tags isbn:9780029079379 theory:"Theory"}

{cite list doi:10.1371/journal.pmed.0020124; isbn:9780029079379 filters:true}
```

The tags block assigns a topic and its label to a work without citing it in the prose. Put each block in a separate paragraph. Repeated assignments accumulate; conflicting topic labels fail. `filters:true` enables this list's checkboxes; `filters:false` disables them independently of the site default. Site configuration can still provide shared topic labels and icons. These declarations do not count as citation-mention tags in `collectMarkerTags`.

## Keep an unfinished citation visible

```text
{cite pending-rivera
  cue:"Rivera, 2020"
  comment:"Original: (Rivera, 2020). No matching bibliography entry."
}
```

If a reference is missing, `cue:` supplies provisional citation wording with an unresolved warning. `comment:` keeps the original wording and review context in the source; it never appears in compiled reader output. The compiler and editor tools report `citation-unresolved-placeholder`; it cannot disappear into ordinary prose unnoticed. Complete the same local record with reviewed metadata and mark it resolved, and normal citation formatting resumes automatically. Import review offers **Keep as unresolved** for an unmatched item. Complex groups without safe individual spans remain unchanged for manual review. See the [import placeholder contract](./reference/import-api.html#citations-as-unresolved-placeholders).

A custom `citationKeyword` must reach every stage: import, compiler and tools. For example, an import using `citationKeyword:"reference"` needs the same setting in `markerKind`, `describeCitation` and compilation. No call changes another call's default. Incomplete configured markers report `citation-malformed`; escaped examples, code and other keywords remain ordinary text. See [configuration propagation](./reference/notation-migration.html#pass-the-same-keyword-to-every-parsing-stage).

## Editor tools and shared bibliographies

Editors can generate cues and collect per-mention tags:

```text
{cite doi:10.1371/journal.pmed.0020124 | cue:"Ioannidis 2005" | tags:methods,reliability}
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

Use the same style/keyword configuration as your build. `annotateMarkers` replaces existing `cue:` text with a generated label; `noteContext:'work'` omits article-local year letters from those notes without changing reader-facing letters. `collectMarkerTags` counts contributions; curators decide which accumulated tags become record topics. Use only documented marker options; unknown fields are not an extensible metadata contract and may be treated as legacy hints or make the marker malformed. Editors must preserve source rather than reconstruct it from HTML.

Reading-list directives, `tagCatalogue`, `inlineTags` and `listFilters` produce topic badges and filters. `data-ci-tag` supports per-tag styling. `referenceItemPrefix` adds escaped text before each item. Cross-page links use `createSiteOccurrenceIndex` from actual compiled anchors, never guessed article positions; its input and output are in the [article tools reference](./reference/article-tools.html). Supply `siteOccurrences` and a trusted `siteOrigin`; listed-only entries retain their distinct “Listed in” meaning.

## Reviewed import

Turn an existing manuscript’s citations into editable `{cite ...}` markers. Try the saved Einstein example: select a highlighted citation, choose its paper, then compare Converted Document with Reading Preview.

<div class="guide-actions"><a href="./import/">Open document import</a></div>
<iframe class="guide-demo" src="./import/?embed=guide" title="Try document import with saved examples" loading="lazy"></iframe>

Download the converted Markdown and reference cache together. Your original file remains available. To try a file, use the public [Word](./documents/sample.docx), [PDF](./documents/sample.pdf) or [Markdown](./documents/sample.md) example.

Online reference lookups are optional and send reference details to Crossref and Open Library. Review ambiguous works and editions before accepting them; a metadata match does not verify the sentence’s claim. Extraction preserves a reviewable working copy rather than arbitrary document layout, and does not provide OCR.

<details>
<summary>Build import review into an editor</summary>

Use `processImportRequest` from `cite-inator/import`, or the browser `citation-import.mjs` bundle. Analyze the document, retain its review ID, then request a preview with the accepted decisions. The library returns proposed text and records. Your host owns saving, Cancel and Undo.

Re-check the document revision immediately before applying changes, including after asynchronous lookups. Commit accepted text and its new reference records together. The preview cache may also contain existing site records and uncited source entries; persist only the accepted additions used by the final document, preserving the site library. Removing an old bibliography is a separate reviewed edit.

See the [complete import API](./reference/import-api.html) and [worked editor recipe](./host/recipe.html) for request/response examples, staging, revision checks and persistence.

</details>

## Review a bibliography

Bring in a reference list from Zotero or another manager as CSL-JSON, BibTeX or RIS. Try **Article and translated book**, inspect the proposed entries, mark them with **Add entries without conflicts**, then choose **Apply reviewed references**.

<div class="guide-actions"><a href="./import/bibliography.html">Open bibliography review</a></div>
<iframe class="guide-demo" src="./import/bibliography.html?embed=guide" title="Try bibliography review" loading="lazy"></iframe>

Choose a reference to review its metadata or compare an updated snapshot. Keep or change fields explicitly. **Cancel** leaves the bibliography alone; **Undo** reverses an applied change. Shared identifiers do not automatically merge editions.

Download a bibliography for another tool, or a working copy to retain review history. **Keep in this browser** is optional. Files stay local until you request an online source check; a failed check or a search finding no notice cannot certify a work.

The [offline learning site](./citation-learning-site.zip) includes both workspaces. Extract it and run `node server.mjs` with Node 22.13 or newer. Import, comparison and downloads work offline; online checks need a connection. See the [bibliography APIs](./reference/library-maintenance.html) to integrate these operations into another editor.

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
