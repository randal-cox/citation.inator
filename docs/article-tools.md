# Article editor tools, site bibliographies and tags

These features are in the 0.2.0 preview source. They are absent from the stable 0.1.4 release. The preview is being verified; see the [milestone record](https://github.com/randal-cox/citation.inator/blob/codex/article-tooling/docs/milestones/0.2.0.md). Formatted-citation import remains [planned work](https://github.com/randal-cox/citation.inator/blob/codex/article-tooling/docs/article-tooling-plan.md#f4-reviewed-import-delivered-in-smaller-stages).

## Load the tools

For a Node build, editor service or command-line adapter:

```js
import { compileCitations } from 'citation-inator';
import { describeCitation, annotateMarkers, createSiteOccurrenceIndex } from 'citation-inator/tools';
```

For an editor running in a browser, copy the prebuilt `dist/citation-tools.mjs` to your site and import it directly:

```js
import { describeCitation, annotateMarkers, createSiteOccurrenceIndex } from './citation-tools.mjs';
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

`occurrences` is accepted as a compiler-option alias for `siteOccurrences`; supply one, not both. Use `siteOccurrences` to distinguish the site index from the compiler result's local `occurrences`. URLs need a fragment, a nonempty label and a safe same-site destination. Relative paths, root-relative paths and local fragments are allowed. For absolute URLs, supply `siteOrigin` and use that origin only. Unsafe/off-site entries are omitted with `invalid-site-occurrence` diagnostics; exact duplicate targets are omitted. Distinct relative path spellings are preserved because their meaning depends on the host page's base path. Use consistent root-relative routes in a site-wide index, or construct paths relative to each destination page when compiling. The helper does not rewrite routes for you.

The compiler emits grouped `Cited in` links under references and carries the accepted index on Inspect triggers. The panel shows `Cited on this site`. Both use contextual `Return to … (occurrence a)` accessible names. Static links work without JavaScript. Local endnote return links remain available independently; the site-use section intentionally provides the broader page grouping as well. A page must not export its private/draft occurrences into a public index. Index data belongs to the host build, not to a source's canonical bibliographic identity.

When rendering your own controls, pass `siteOccurrences` to `planCitationOccurrences`; its occurrence bindings carry that data into the panel. Alternatively configure the browser directly:

```js
initializeCitationInspector(element, { cache, siteOccurrences, tagCatalogue });
```

The inspector validates destinations against its current page origin. Cross-origin absolute links supplied for a production site are not shown in a different-origin local preview; use relative routes for portable previews. No index is fetched or crawled automatically. Copied citations and bibliographic exports retain their canonical work URLs.

## Tags, usage roles and filtering

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

Build-time filters apply only to the explicitly named list:

```text
{citation list source-one; source-two | tags:theory}
{citation list source-one; source-two | tags:theory,praxis | tag-mode:any}
{citation list source-one; source-two | tags:theory,praxis | tag-mode:all | sort:author}
```

The default is any-of. `tag-mode:all` requires every listed tag. Filtering happens before record-use and year-letter planning. An empty selection has an explicit empty-result message. It does not pull additional records out of the cache or change other citations/endnotes. Browser hiding after compilation preserves the already-compiled reference labels.

With `listFilters: true`, supported inspectors reveal native checkboxes above each tagged reading list. No filters checked shows all of that list's compiled entries. Multiple checked filters use any-of; the legend states this. A live, plural-aware shown/total count updates without moving keyboard focus. Lists are independent, and a no-match state is explicit. The initial English controls/count wording is not yet connected to the reader-access translation catalogue. The controls stay hidden without JavaScript, leaving the build-selected list and all static return links usable. Filters are local UI state and are not persisted as reader access preferences.
