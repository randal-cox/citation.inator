# Load, compile, initialize

Copy `citation-compiler.mjs`, `citation-inspector.mjs`, `citation-inspector.css`, `LICENSE` and `THIRD_PARTY_LICENSES.txt` from the same release into your site. Serve the folder over HTTP. There is no required framework or runtime service.

```html
<link rel="stylesheet" href="./citation-inspector.css">
<citation-inspector id="references"></citation-inspector>
<script type="module" src="./article.mjs"></script>
```

```js
// article.mjs — source and cache are your article and reference data.
import {compileMarkdown} from './citation-compiler.mjs';
import {initializeCitationInspector} from './citation-inspector.mjs';
const source = 'A claim {citation ioannidis-2005}.\n\n{citation endnote}';
const cache = await fetch('./citations.json').then(r => r.json());
const options = {citationStyle:'chicago-author-date', namespace:'article'};
const result = compileMarkdown(source, cache, options);
const element = document.querySelector('#references');
element.innerHTML = result.html; // Trusted authored content only.
initializeCitationInspector(element, {cache:result.cache, activation:'click'});
```

For untrusted or editable HTML, sanitize the final compiled output with an established sanitizer before insertion. The compiler preserves authored HTML; it is not a sanitizer. The playground uses DOMPurify and passes the cache explicitly after embedded scripts are removed. Keep library-generated SVG icons when choosing a sanitizer profile.

Download the [copied-file starter](./citation-starter.zip) for the first complete example: run `npm start` without an install, or `node server.mjs` without npm. Download the [npm build starter](./citation-npm-starter.zip) for a pinned library tarball and static build: run `npm install`, then `npm start`. Both serve at `http://127.0.0.1:4188/` and include their source, cache, configuration and notices.

The [offline learning site](./citation-learning-site.zip) includes the whole playground, tutorials, saved import metadata, public native samples and pinned editor example. Run `npm start` or `node server.mjs` in its extracted folder; no install is required. Live lookup remains a separate online page.

With npm, import `compileMarkdown` from `citation-inator/markup` in your build, and import the browser module from `citation-inator/browser` through your bundler. The release is available as a GitHub asset; an npm registry publication is not implied. Node requires 22.13.0 or later. Copy the bundled CSS and notices alongside browser assets.

## First citation

The [complete notation reference](./notation.html) covers every marker option, directive, escape rule, scope and compatibility form.

[Open the playground](./index.html#playground), select **First citation**, and edit its sentence. The identifier after `citation` names a cached record. Download both Markdown and reference cache when using local IDs: the marker alone does not contain the bibliography.

```text
A claim {citation ioannidis-2005}.

{citation endnote}
```

The last marker emits the references cited in this scope. It is literal source notation in this code block; the playground's Result shows the processed version. A DOI or ISBN can identify a cached record too. Compilation does not fetch missing metadata automatically; the import workflow proposes identifiers separately.

## Formatting and appearance

The **Style** selector changes `citationStyle`: `chicago-author-date`, `apa`, `mla`, `harvard`, or `vancouver`. These are library presets, not a complete CSL engine or a claim of exhaustive manual conformity. Compare the same source in each preset before choosing a house style. **CSS** changes only the citation result in this example host. It does not change the citation manual.

```js
const options = {
  citationStyle:'chicago-author-date',
  citationKeyword:'reference',
  classPrefix:'research',
  namespace:'essay-one',
  endnotesHeading:'References'
};
```

With `citationKeyword:'reference'`, write `{reference ioannidis-2005}` and `{reference endnote}`. `classPrefix` changes generated class names; `data-citation-part` remains the stable styling hook. Pass the same prefix to the inspector. Give separate article fragments separate namespaces so citation/endnote IDs cannot collide.

```css
/* Keep host styling confined to the component. */
citation-inspector [data-citation-part~="endnotes"] { border-top:1px solid #bbb; }
citation-inspector::part(panel) { --citation-paper:#fff; }
```

Use the properties and parts supported by the distributed stylesheet; a host should not depend on the private shadow DOM structure. Configure reader behavior independently:

```js
initializeCitationInspector(element, {
  cache:result.cache, classPrefix:'research', activation:'hover',
  panelTitle:'Sources', panelIcon:'./source.svg',
  evidenceTitle:'Source evidence', creditTitle:'About this tool',
  accessStorageKey:'my-site-reading-profile'
});
```

Evidence and credit remain hoverable when ordinary references use click. Click, keyboard and touch also open panels. Escape or clicking outside closes them; panel movement is available through its menu and keyboard. Drag from non-control areas without selecting text. Supply same-origin icon URLs; `none` hides an icon. Compiler reading-list inspection supports `inspectAppearance:'icon'`, `inspectPlacement:'before'`, and `inspectIconMode:'mask'` for a custom icon that follows text color.

## Locators, groups and source formatting

```text
{citation durkheim-1995-fields | prefix:"see also" | locator:"p. 34"}
{citation vaswani-2017-arxiv | locator:"§ 3" | form:narrative}
{citation adelie-penguins-2020; palmerpenguins-2020-software}
```

Locators can name pages, chapters, sections or timestamps. They are text, not a promise that every medium has a universal fragment-address standard. The selected citation style determines the surrounding punctuation. Use `compileHTML` to compile within existing authored HTML, or `compileMarkdown` for Markdown; code blocks and excluded interactive elements are skipped. Structured editors can use `planCitationOccurrences` and stable occurrence IDs instead of splicing compiled HTML by position.

Record `citationParts` retain italics, bold text and safe links in authored reference formatting. Keep source bibliographic data in structured fields when you want presets to format it automatically. `originalIssued` and `issued` distinguish original publication from the cited edition. `reprintYear` chooses `both`, `original` or `edition`. Year letters normally belong to one reference list. Use `suffixScope:'cache'` only for one work split across pages sharing a bibliography, not independent essays.

## Access, rights and evidence

Record `locations` distinguish publisher, PDF, repository, library and full-text copies. Openness belongs to a location: set `access:'open'` and its checked date only when supported by evidence. A PDF format alone does not imply free access. Reader settings distinguish unknown preferences from none chosen and can hide services. Canonical citation URLs remain bibliographic, preferring the DOI, even when a reading link follows a preferred service.

Use `accessSettings:'host'` to hand settings off to your own panel. Reader choices stay in the configured site's browser storage, with an in-memory fallback if storage fails. See the complete access guide for profile state, events, hidden-provider settings, proxies and OpenURL. The playground uses its own storage key.

Artwork records can retain uncertain creators, literal dates, medium, institution/accession, rights and separate source/served-copy checksums. These fields do not justify inferring a photographer from an uploader. Chicago has specific artwork formatting; the other presets preserve these fields generically. Inspect source provenance through `{citation evidence}`. `{citation credit}` identifies the software, author, license and citation.

## Notes, tags and shared bibliographies

Editor notes are invisible to readers:

```text
{citation ioannidis-2005 | note:"Ioannidis 2005" | tags:methods,reliability}
```

Use `markerKind` to distinguish citations from directives. `describeCitation` makes a context-free work label; `annotateMarkers(source, cache, {noteContext:'work'})` keeps editor notes consistent with it, without changing reader-facing year letters. `collectMarkerTags` totals contributions; curators still decide which accumulated tags become record topics.

Reading-list directives, `tagCatalogue`, `inlineTags` and `listFilters` produce topic badges and filters. `data-ci-tag` supports per-tag styling. `referenceItemPrefix` adds escaped text before each item. Cross-page links use `createSiteOccurrenceIndex` from actual compiled anchors, never guessed article positions. Supply `siteOccurrences` and a trusted `siteOrigin`; listed-only entries retain their distinct “Listed in” meaning.

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

The API separates analysis from preview. Bind review decisions to the exact source/reference/style context. The host checks its own revision again before applying text and record changes atomically. Cancellation leaves the source/cache untouched. Bibliography removal is an additional reviewed action, including uncited works.

## Translation

Pass the same `locale` and `strings` to compiler and inspector. English is the fallback; Spanish supplies the example catalogue. Values use `Intl` rules, and overrides can use plural categories:

```js
const options = {
  locale:'es',
  strings:{'access.more':{one:'{countLabel} más',other:'{countLabel} más'}}
};
```

Explicit authored headings and panel titles win. Source titles/authors, citation-style conventions and editor-authored labels are not translated. The learning shell and import host remain English; locale configuration translates library UI. Host pages own their language and direction. Use `createCitationMessages` and `citationLocales` from `citation-inator/i18n` to inspect/extend the catalogue without modifying shared defaults.

## Next recipes

Browse the [annotated working examples and API guides](./tutorials.html), try the [editor-note and tag tools](./tools/editor-tools.html), or explore the [shared bibliography](./tools/bibliography.html). The [worked draft integration](./host/) runs the accepted editor code, with [source, staging, revision, undo and persistence notes](./host/recipe.html). These are separate hosts of the same library; the import API does not require a particular page layout or CSS framework.
