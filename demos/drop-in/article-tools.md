# Article editor tools, site bibliographies and tags

These features are available in 0.2.0 and later. They are absent from 0.1.4; see the [milestone record](https://github.com/randal-cox/citation.inator/blob/main/docs/milestones/0.2.0.md). Formatted-citation import remains [planned work](https://github.com/randal-cox/citation.inator/blob/main/docs/article-tooling-plan.md#f4-reviewed-import-delivered-in-smaller-stages).

<a id="unreleased-draftinator-compatibility-additions"></a>
<a id="030-draftinator-compatibility-additions"></a>

## Compile an article in a browser (0.4.0 preview)

For a static editor preview, copy `dist/citation-compiler.mjs` and `dist/THIRD_PARTY_LICENSES.txt` into your site. This self-contained ES module exports `compileMarkdown`, `compileHTML` and `compileCitations`; it needs no npm installation or compiler server in the browser. Serve it over HTTP(S), including a local server, rather than a `file:` page. With npm use `citation-inator/compiler-browser`.

```js
import { compileMarkdown } from './citation-compiler.mjs';
const result = compileMarkdown(
  'Practice comes first {citation bell-1992-ritual | locator:12}.\n\n{citation endnote}',
  cache,
  { citationStyle: 'chicago-author-date', namespace: 'editor-preview' }
);
// Render result.html in your preview; initialize the inspector separately.
```

Supply a normal citation.inator cache containing the marker's IDs. The three entry points have the same results/options as their Node counterparts, including custom keyword, namespace and class configuration. The compiler performs no provider lookup, persistence or publication. It runs under `script-src 'self'` without eval or `new Function`; your host controls other preview assets and sanitization. Markdown/HTML compilation preserves author-supplied HTML according to the normal markup contract: sanitize untrusted document HTML before inserting it into a live page. Use `citation-inspector.mjs` separately for interactive reader panels and its styles. Published 0.3.0 archives do not contain this new compiler bundle.

## Marker classification and work-context notes (0.3.0)

The 0.3.0 release adds `markerKind` to `citation-inator/tools`, the self-contained `citation-tools.mjs` and the main `citation-inspector.mjs` browser bundle. These additions are not in the published 0.2.0 artifacts.

```js
import { markerKind } from './citation-tools.mjs'; // also citation-inspector.mjs
markerKind('{citation list-2001}'); // "citation"
markerKind('{citation list alpha}'); // "list"
markerKind('{citation evidence}'); // "annotation"
markerKind('{ref endnote}', { citationKeyword: 'ref' }); // "endnote"
```

The result is `citation`, `endnote`, `list`, `nocite`, `annotation`, or `malformed`. It delegates to the compiler grammar and classifies exactly one complete trimmed marker, without a cache or network. Leading/trailing prose, multiple markers, escaped literal examples and malformed options are `malformed`; invalid configuration or non-string input throws. Legacy `{cite …}` and `{endnotes}` follow their actual compiler meanings, so callers need no duplicate reserved-word regex. For example `{cite evidence}` is a work citation, whereas `{citation evidence}` is an annotation directive. `local:` explicitly addresses record IDs that collide with directive names.

For a works picker whose descriptions come from `describeCitation`, keep editor/build notes in the same context:

```js
const result = annotateMarkers(source, cache, {
  citationStyle: 'chicago-author-date',
  noteContext: 'work'
});
```

`noteContext: 'article'` is the unchanged default, using the full source's disambiguation. `work` describes each work independently with fragment scope, so two same-author/year works both get `note:"Cox 1995"`, matching standalone descriptions. It overrides cache-wide suffix scope for note text, not reader formatting. Use the same style/reprint options for the picker and annotation. Reader-facing suffixes still come from normal compilation. Partial records, escaping, protected regions and unresolved-group behavior retain their existing contracts. JSON CLI annotation and stale-note checks accept `options.noteContext` too; use the same value for writing and checking notes.

## Write local record IDs (0.4.0 preview)

`formatRecordId` is shared by the compiler, `citation-inator/tools`, `citation-inator/import` and their self-contained browser tools/import bundles. Give it a bare local record ID, not a DOI or another persistent identifier:

```js
import { formatRecordId } from './citation-tools.mjs';
formatRecordId('bell-1992-ritual'); // 'bell-1992-ritual'
formatRecordId('list-2001');        // 'list-2001'
formatRecordId('endnote');          // 'local:endnote'
formatRecordId('bell-1992-ritual', { identifierForm: 'explicit' });
// 'local:bell-1992-ritual'
const marker = `{ref ${formatRecordId('bell-1992-ritual', { citationKeyword: 'ref' })}}`;
```

The default `identifierForm: 'minimal'` writes the shortest spelling that re-scans to the same local identity, with the directive names `endnote`, `list`, `nocite`, `evidence` and `credit` always explicit. `identifierForm: 'explicit'` writes every local ID with `local:`. The import API accepts the same option. Existing markers are preserved: `annotateMarkers` refreshes notes without changing an identifier's bare or explicit spelling, regardless of this option. Both spellings resolve to the same record. Invalid local IDs, unsupported writer modes and invalid citation keywords throw.

The cache's local-ID syntax is lowercase letters, digits, periods and hyphens, starting with a letter or digit, at most 160 characters. IDs containing scheme prefixes, slashes or notation punctuation are invalid local IDs; use the corresponding persistent-identifier notation for DOI/ISBN/URL values. The helper does not convert persistent identifiers into local record IDs.

The directive names and their interpretation are part of the notation's compatibility contract. Introducing a new directive that changes the meaning of an existing valid bare marker requires a breaking grammar change and a migration path. Sites may choose explicit IDs to avoid future collisions; readers accept both spellings.

## Load the tools

For a Node build, editor service or command-line adapter:

```js
import { compileCitations } from 'citation-inator';
import { describeCitation, annotateMarkers, collectMarkerTags, createSiteOccurrenceIndex } from 'citation-inator/tools';
```

For an editor running in a browser, copy the prebuilt `dist/citation-tools.mjs` to your site and import it directly:

```js
import { describeCitation, annotateMarkers, collectMarkerTags, createSiteOccurrenceIndex } from './citation-tools.mjs';
```

An installed package also exports `citation-inator/tools-browser` as a self-contained browser module. A bare package specifier needs a bundler or import map in browsers. Tools do not register the inspector; load `citation-inspector.mjs` and its adjacent stylesheet separately for reader panels. Browser tools include their parsing dependencies and need no npm install on the serving machine. The JSON cache is an ordinary argument to the functions. None of these functions fetches providers or writes files.

Keep the library LICENSE and the bundled dependency notices with distributed assets. The tools module carries the parse5, marked and entities notices in its header, and `THIRD_PARTY_LICENSES.txt` is included beside it in `dist/` and the standalone folder.

Run `npm start` in the repository and open [the shared bibliography example](http://127.0.0.1:4187/demos/static/bibliography.html) or [the editor example](http://127.0.0.1:4187/demos/static/editor-tools.html). Both also ship in the standalone folder as `bibliography.html` and `editor-tools.html`.

## Editor-only notes

```text
{citation source-one | note:"Cox 1995"}
{citation source-one | note:"Cox 1995a"; source-two | note:"Cox 1995b"}
```

A quoted `note:` belongs to one cited item. A group can have one per item. It does not change reader HTML, accessible names, return-link context, diagnostics or returned bibliographic records, even when the work is unresolved. It is different from `label:` (which changes reader text), the legacy unresolved display hint, and a bibliographic record's `note` field. Empty notes are accepted; duplicate/malformed note options follow the usual malformed-notation diagnostics. Notes are not supported on list/endnote/evidence/credit directives.

Notes help editors read raw source. They are not confidential comments: a host can publish source files, and a no-compilation fallback may display literal notation. A stale note never becomes authoritative metadata for readers.

```js
const description = describeCitation('source-one', cache, {
  citationStyle: 'chicago-author-date'
});
console.log(description.text); // Cox 1995
console.log(description.state); // resolved, partial, unresolved, or malformed
console.log(description.items); // recordId, identifier, text, state, anchorId, context
console.log(description.diagnostics);
```

The first argument accepts an identifier, a semicolon-separated identifier group, or a full citation marker. A full marker is interpreted as notation, not as prose or Markdown. Descriptions identify the work using the selected style; custom reader labels, prefixes, locators and narrative forms do not replace that identity description. The returned `anchorId` belongs to a synthetic one-marker query, not an existing article. Never use it as a published return target; use full article compilation or structured-plan occurrences for indexing. Without a complete source document, descriptions cannot know that document's year letters or citation numbering. Pass the whole article to annotation for its formatting context.

```js
const result = annotateMarkers(source, cache, {
  citationStyle: 'chicago-author-date',
  citationKeyword: 'citation',
  format: 'markdown' // text (default), html, or markdown
});
// result.source: transformed source
// result.edits: { start, end, text } source edits in ascending order
// result.changed: whether any note edits were proposed
// result.diagnostics: unresolved/malformed citations and skipped regions
```

Edits use zero-based JavaScript UTF-16 offsets, with an exclusive end. Outside those ranges the original source is retained, including line endings and whitespace. The host owns saving, undo and checking that the editor has not changed the source since analysis. A second run with the same cache/options makes no edits. A changed year, author or style refreshes the notes on the next run. Notes use single-line text and quote/escape notation delimiters. HTML/Markdown insertions escape markup characters in note content.

HTML skips the compiler's excluded elements and interactive/editable regions, including scripts, attributes and code. Markdown additionally protects fenced/indented code, code spans, links and raw HTML regions excluded by the HTML compiler. When a Markdown token cannot be located exactly in the original source, its containing region is left intact and `annotation-region-skipped` is returned. Unsupported or ambiguous input is not rewritten by guesswork. Use literal brace notation in source; entity-encoded braces are not an annotation target and return `annotation-encoded-marker-skipped`. Review diagnostics when mixing unusual HTML/Markdown structures. Rich-text paste and DOCX parsing are not included.

A group containing an unresolved work is left unchanged and reported, retaining its existing notes for editorial review. Malformed markers remain intact. Use the compiler's `suffixScope`, `reprintYear` and style options consistently with the site's build. Separate articles keep the default `suffixScope: 'fragment'`.

## JSON CLI for editors and non-JavaScript builds

All operations read one JSON request on standard input and emit one JSON result. They do not modify files. Shell redirection or the host saves an accepted result.

```sh
citation-inator --describe --json < describe-request.json
citation-inator --annotate --json < article-request.json
citation-inator --check-notes --json < article-request.json
```

A description request is `{ "citation": "source-one", "cache": CACHE, "options": { "citationStyle": "chicago-author-date" } }`. An annotation/check request replaces `citation` with a `source` string and can include `format` in `options`. These examples use `CACHE` as a placeholder for the complete cache object, not a literal JSON token. `--style` and `--format` override corresponding options. `--check-notes` returns exit code 1 for stale notes or diagnostics and 0 for current notes without diagnostics; it still emits its JSON result. Other invalid requests return a nonzero status and an error on standard error. The same commands are available as `node scripts/compile.mjs …` in a source checkout.

## Tags contributed by citation markers

```text
{citation source-one | note:"Cox 1995" | tags:ritual-theory,consent-ethics}
```

`tags:` is per cited item, like `note:`. It contributes metadata without changing reader output or diagnostics by default; `annotateMarkers` retains it when refreshing notes. IDs follow the same syntax as record tags. Repeated IDs within one item count once. Invalid or duplicate `tags:` options make the marker malformed under the normal notation rules. List-directive `tags:` continues to mean build-time filtering, not a contribution.

```js
const result = collectMarkerTags([
  { name: 'essay-one.md', format: 'markdown', source: firstSource },
  { name: 'essay-two.html', format: 'html', source: secondSource }
], cache, { includeDiagnostics: true });
// result.counts: { 'source-one': { 'ritual-theory': 2, 'consent-ethics': 1 } }
// result.diagnostics: source-labelled skipped/malformed/unresolved regions
```

Sources can be strings (text by default) or objects with `source`, optional `name`, `format` and `options` such as a custom `citationKeyword`. With a cache, aliases such as a local ID and DOI are counted under the same stable record ID. Without a cache, local identifiers use their local IDs and external identifiers use canonical keys such as `doi:10.1234/example`; the helper cannot invent record IDs. Unknown cached identifiers retain those fallback keys and produce unresolved diagnostics in detailed mode.

`collectMarkerTags(sources)` returns the counts object directly, matching the simple API shape. **Use `includeDiagnostics: true` in build/import tools** so conservative Markdown skips or encoded notation cannot look like a complete count. The collector shares annotation's HTML/Markdown exclusions, including code, attributes, excluded elements and diagnosed unlocatable regions. It counts valid tagged citation items across sources; it does not count list filters, fetch metadata, mutate records, enforce a topic catalogue, identify voters or apply curator decisions. The host owns allowed topics, totals, manual additions/blocks and any voting policy; pass the resulting accepted topic IDs back as record `tags`.

Set `inlineTags: 'marker'` to display only the tags contributed at each in-text citation. A mention with no contributed tags shows none inline. Reference lists and inspector panels retain the work's accumulated record tags. `inlineTags: true` instead displays accumulated tags beside each mention; `false` (default) keeps marker contributions out of reader output entirely. Displayed marker tags use the supplied catalogue and its normal unknown-tag fallback.

The JSON CLI supports `citation-inator --collect-tags --json`, with `{ "sources": SOURCES, "cache": CACHE, "options": { "includeDiagnostics": true } }`. `cache` is optional; `SOURCES` and `CACHE` are placeholders for actual JSON values. The result uses the same plain/detailed shape as the JavaScript function. Inspect detailed diagnostics; a syntactically valid collection request does not fail solely because some contributions need review.

## Cross-page occurrence index

Each normal compilation now returns `occurrences` and `citationDescriptions` alongside `html`, `cache` and `diagnostics`. `occurrences` includes actual in-text anchors, record IDs and surrounding text context; list Inspect actions and unanchored isolated citations do not create uses. Structured plans already return stable `occurrenceId`, `anchorId` and `recordId` values and can feed the same helper. Explicit host context can be supplied in structured occurrences.

Use a two-pass static build:

```js
const first = compileCitations(firstSource, cache, {
  namespace: 'essay-one', citationStyle: 'chicago-author-date'
});
const second = compileCitations(secondSource, cache, {
  namespace: 'essay-two', citationStyle: 'chicago-author-date'
});
const siteOccurrences = createSiteOccurrenceIndex([
  { href: '/essays/one/', label: 'Essay one', occurrences: first.occurrences },
  { href: '/essays/two/', label: 'Essay two', occurrences: second.occurrences }
]);
const bibliography = compileCitations('{citation list source-one; source-two}', cache, {
  namespace: 'site-bibliography', siteOccurrences
});
```

Publish the first-pass article HTML together with the bibliography built from its anchors. Rebuild the index when a page moves, changes or is removed. Do not predict counter-based IDs or scrape generated HTML. Hosts with persistent passage IDs should use structured occurrences so inserting another citation does not change the IDs of existing passages.

The index is keyed by record ID. A host may construct it directly:

```js
const siteOccurrences = {
  'source-one': [
    { href: '/essays/one/#essay-one-cite-source-one-1',
      label: 'Essay one', context: 'As Cox argues…' }
  ]
};
```

An occurrence can carry `kind: 'listed'` when a work is only included in a reference list. Compiling `nocite` emits a listed occurrence targeting the actual endnote; it does not invent an in-text citation. The helper retains that distinction, preferring real citations when the same work is both cited and listed on a page. Lists use **Listed in** and panels use **Listed on this site** for listing-only pages. The default kind is cited for backward compatibility. Rebuild your site index to obtain the new `nocite` entries; an old index cannot infer whether a use was only a listing.

`occurrences` is accepted as a compiler-option alias for `siteOccurrences`; supply one, not both. Use `siteOccurrences` to distinguish the site index from the compiler result's local `occurrences`. URLs need a fragment, a nonempty label and a safe same-site destination. Relative paths, root-relative paths and local fragments are allowed. For absolute URLs, supply `siteOrigin` and use that origin only. Unsafe/off-site entries are omitted with `invalid-site-occurrence` diagnostics; exact duplicate targets are omitted. Distinct relative path spellings are preserved because their meaning depends on the host page's base path. Use consistent root-relative routes in a site-wide index, or construct paths relative to each destination page when compiling. The helper does not rewrite routes for you.

The compiler emits grouped `Cited in` links under references and carries the accepted index on Inspect triggers. The panel shows `Cited on this site`. Both use contextual `Return to … (occurrence a)` accessible names. Static links work without JavaScript. Local endnote return links remain available independently; the site-use section intentionally provides the broader page grouping as well. A page must not export its private/draft occurrences into a public index. Index data belongs to the host build, not to a source's canonical bibliographic identity.

Panel site-use sections follow the formatted reference and identifiers. Bibliography action icons precede site-use lines and can sit beside the reference when space allows. Reading lists retain their `reference-list` class inside a dedicated `reading-list` wrapper when filters are enabled; endnote-specific styles do not apply to that wrapper.

When rendering your own controls, pass `siteOccurrences` to `planCitationOccurrences`; its occurrence bindings carry that data into the panel. Alternatively configure the browser directly:

```js
initializeCitationInspector(element, { cache, siteOccurrences, tagCatalogue });
```

The inspector validates destinations against its current page origin. Cross-origin absolute links supplied for a production site are not shown in a different-origin local preview; use relative routes for portable previews. No index is fetched or crawled automatically. Copied citations and bibliographic exports retain their canonical work URLs.

## Record tags, usage roles and filtering

Add curated topic IDs to records:

```js
const record = { /* bibliographic fields */, tags: ['theory', 'praxis'] };
const tagCatalogue = [
  { id: 'theory', label: 'Theory', icon: '/assets/book.svg' },
  { id: 'praxis', label: 'Praxis' }
];
const options = { tagCatalogue, listFilters: true };
const result = compileCitations('{citation list source-one; source-two}', cache, options);
```

Tag IDs are 1–64 lowercase ASCII letters/digits/hyphens, starting with a letter or digit. Record normalization drops invalid IDs and removes duplicates. The catalogue needs unique valid IDs and nonempty labels. Unknown record tags fall back to their IDs as text and produce `unknown-tag` diagnostics. Invalid icon URLs fall back to text with `invalid-tag-icon` diagnostics. Mask icons use `currentColor`; labels remain visible if a file fails to load, CSP blocks the image, or forced colours hide the icon. No inline SVG/HTML catalogue input is accepted. Include icon assets in `img-src` under your CSP. Absolute icon URLs need a matching `siteOrigin`; relative same-origin paths work directly.

Tags are retained in the library JSON cache and through provider refresh. Bibliographic CSL, BibTeX and RIS exports do not carry these application-specific tags. A library record's topics and an article's use of that record can differ. Use `listItemTags: { 'source-one': ['praxis'] }` to replace tags for that compilation's list items and their Inspect panels without changing the record. Compile separate lists independently when the same source has different roles. Existing `data-ci-list-record` hooks remain available for host-specific badges and other content. This does not introduce an arbitrary HTML insertion hook.

Tags appear on references and in the panel. Set `inlineTags: true` to also show them beside ordinary in-text citation triggers. Set a custom `classPrefix` normally; all new rendered parts use `data-citation-part` and the configured prefix. Common parts are `tags`, `tag`, `site-returns` and `tag-filters`. Library CSS remains scoped to those parts.

Each tag has `data-ci-tag="theory"` (using its own ID), in static HTML and panel content. For example, scope a host rule to `[data-ci-tag="theory"]` to style one tag. Panel content lives in Shadow DOM: set an inherited colour variable on the inspector and use the shared component stylesheet if you need tag-specific panel rules; ordinary host selectors style the static list, not Shadow DOM contents. Panel badges also expose `part="tag tag-theory"` (using the actual ID), so a host can style `citation-inspector::part(tag-theory)` without editing the shared stylesheet.

Build-time filters apply only to the explicitly named list:

```text
{citation list source-one; source-two | tags:theory}
{citation list source-one; source-two | tags:theory,praxis | tag-mode:any}
{citation list source-one; source-two | tags:theory,praxis | tag-mode:all | sort:author}
```

The default is any-of. `tag-mode:all` requires every listed tag. Filtering happens before record-use and year-letter planning. An empty selection has an explicit empty-result message. It does not pull additional records out of the cache or change other citations/endnotes. Browser hiding after compilation preserves the already-compiled reference labels.

With `listFilters: true`, supported inspectors reveal native checkboxes above each tagged reading list. No filters checked shows all of that list's compiled entries. Multiple checked filters use any-of; the legend states this. A live, plural-aware shown/total count updates without moving keyboard focus. Lists are independent, and a no-match state is explicit. The initial English controls/count wording is not yet connected to the reader-access translation catalogue. The controls stay hidden without JavaScript, leaving the build-selected list and all static return links usable. Filters are local UI state and are not persisted as reader access preferences.

Use `listFilters: { minItems: 6, minTags: 2 }` to show controls only for lists with at least six build-selected entries and two distinct effective tags. Both thresholds are nonnegative integers. An empty options object uses those same defaults; `true` retains the original behavior of showing controls for any nonempty tagged list, and `false` disables them. Thresholds control whether the filter UI is generated, not which references are selected. Short and single-tag lists retain the same reference-list styling.

## Diagnostic codes

Unresolved diagnostics carry `code: 'citation-unresolved'`; malformed-citation diagnostics carry `code: 'citation-malformed'`. The existing `state` values stay `unresolved` and `malformed`. These additive codes are present in compiler, editor-query/annotation and JSON CLI results, including unresolved/malformed entries in the cross-fragment report. Hosts can key on `code` without parsing message text. Other diagnostic states retain their existing contracts.

<a id="unreleased-030-host-prefix-hook"></a>
<a id="030-host-prefix-hook"></a>

## Host reference-prefix hook (0.3.0)

In 0.3.0, `referenceItemPrefix` is a synchronous compiler callback that adds escaped text before each reference item. It is not part of the older 0.2.0 package and cannot be supplied through JSON CLI requests. This is separate from record tags and per-list tag overrides.

```js
const result = compileCitations(source, cache, {
  referenceItemPrefix({ record, tags, namespace, number, kind }) {
    return kind === "reading-list" && tags.some(tag => tag.id === "theory") ? "Theory · " : "";
  }
});
```

The callback receives `{ record, tags, namespace, number, kind }`; `kind` is `reading-list` or `endnote`. Metadata is cloned so changing it cannot mutate the cache. Return a string, `null` or `undefined`. Text is escaped and wrapped in the configurable `reference-prefix` class/part. HTML/object results are rejected. Prefix text is presentation only: it does not enter copied citations, bibliographic records, exports or source marker notes.
