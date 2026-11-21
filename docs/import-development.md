# F4 import development for milestone 0.3.0

**In progress.** The current release remains 0.2.0. The initial prototype is source-only and is not exposed by the package exports, browser bundle or CLI. No 0.3.0 package or release is claimed.

## First implementation

`src/import-matcher.mjs` contains experimental `parseInTextCitations(text, options)` and `matchCitations(detection, references)` functions. They accept already-extracted visible plain text and supplied bibliographic records. They make no network requests, modify no records and produce no article edits.

Detection returns UTF-16 source ranges, original text, parenthetical/narrative form and item fields for initial APA/Chicago author-date shapes. Groups, simple prefixes/page locators, year letters, original/edition date pairs and known author initials have synthetic regressions. The `range` option explicitly bounds the body under examination; reference-list boundaries are not guessed or removed. Existing citation.inator notation is protected.

Matching returns `unique`, `ambiguous` or `unmatched` proposals, all requiring review. It uses supplied author/year information and optional document-specific `sourceSuffix` metadata. It never computes imported year letters from global cache ordering. Incomplete bylines and uncertain narrative boundaries cannot become unique evidence. Candidate identity does not establish that a source supports a manuscript's claim.

Narrative boundaries are still experimental. Capitalized prose, organizations and comma-separated author lists can have multiple plausible starts. Alternatives retain their offsets and carry uncertainty. Weak alternatives are labelled `uncertain-narrative-span`, not exact byline evidence. No rewrite adapter should apply these proposals until a user has accepted the author span and record identity.

This prototype is not a style-compliance validator. It does not yet support undated references, bracket-numeric citations, broader locators or every valid author spelling. Literal full-person names are not heuristically split into family names. The detector itself rejects raw Markdown, HTML and document files; it expects already-extracted text. The initial HTML/Markdown extraction adapters below supply that text with source provenance. Native file adapters remain unfinished.

## Initial extraction adapter

`src/import-extraction.mjs` provides experimental `extractImportText(source, { format: "text" | "html" | "markdown", citationKeyword: "citation" })`, `detectExtractedCitations(extraction, options)` and `mapImportRange(extraction, { start, end })`. These are source-only functions, with no package export or CLI command yet.

HTML extraction reads eligible text across inline formatting and ordinary links, including citation labels inside bibliography-manager hyperlinks. It excludes code, scripts, controls, explicit hidden/ARIA-hidden elements, closed native details/dialogs, editable regions and generated citation UI. Paragraphs and skipped regions introduce boundaries so detection cannot bridge them. Link targets are opaque provenance: extraction neither follows them nor treats them as work identities.

Offsets use UTF-16 code units. Each extracted text segment retains its original HTML text-node range. Unchanged text maps precisely; entity decoding and newline normalization conservatively map to the whole original text node with `exact: false`. Citation proposals retain separate `sourceFragments`, including link indexes where applicable. These fragments are evidence for review, not an edit plan: replacing the span from the first fragment to the last could erase formatting or links. No replacement API is provided.

The HTML adapter does not model CSS visibility or visual reading order; it always reports that limitation. It does not sanitize or render HTML. DOCX, ODT and PDF extraction remain separate future adapters.

Markdown extraction uses parser tokens and maps normalized line endings back to original UTF-16 offsets. It reads inline/reference-link labels, emphasis, escaped delimiters and semicolon-terminated entities. Link destinations, image content, code, reference definitions and URL-shaped link labels are excluded. Containers containing raw HTML, tables, transformed quote/list contents that cannot be located, and ambiguous repeated source substrings are skipped with `import-markdown-region-skipped` diagnostics. This is conservative partial coverage; a skipped region is not evidence that it contains no citations. Raw, escaped and entity-encoded citation notation is protected using original source ranges before inline transformations. Set the same `citationKeyword` during extraction and detection; detection inherits it by default.

For a source-checkout experiment:

```js
import { extractImportText, detectExtractedCitations } from "./src/import-extraction.mjs";
import { matchCitations } from "./src/import-matcher.mjs";

const extraction = extractImportText(articleMarkdown, { format: "markdown" });
// Choose bodyStart/bodyEnd in extraction.text; bibliography boundaries require review.
const detected = detectExtractedCitations(extraction, {
  style: "apa", range: { start: bodyStart, end: bodyEnd }
});
const proposals = matchCitations(detected, suppliedRecords);
// Review proposals and diagnostics. This API does not apply edits.
```

## Explicit Crossref search

`src/import-crossref.mjs` provides experimental `createCrossrefSearch(options)`. It is a separate source-only API, not an installed export, browser control or CLI command. Constructing it and running local extraction/matching make no requests. Calling `search()` explicitly sends one supplied reference string and optional `mailto` contact to Crossref. The host must decide which reference may be sent; never pass the manuscript by default.

```js
import { createCrossrefSearch } from "./src/import-crossref.mjs";

const search = createCrossrefSearch();
const result = await search.search({
  reference: referenceText,
  title: expectedTitle, author: expectedAuthor, year: expectedYear,
  // Optional known DOI value for comparison, not selection:
  doi: expectedDOI,
  limit: 3
});
```

Omit optional comparison fields when unknown. Requests use `query.bibliographic` with 1–5 results, following [Crossref's reference-matching guidance](https://github.com/CrossRef/rest-api-doc/blob/master/api_tips.md). Only `reference`, `limit` and optional contact affect the provider query. Comparison fields are local evidence. A known DOI should normally use the existing DOI resolver; bibliographic search is not an identifier lookup.

Results retain provider order/rank, raw relevance score, normalized candidate records, raw retrieval evidence and field comparisons. Scores are not probabilities. Comparisons distinguish `exact`, `different`, `missing` and `not-supplied`; a year matching an alternative online/print date is `alternative-date`. Title comparisons normalize case/punctuation. Author comparisons mean an exact label for **any listed author**, including a family-name label; they do not verify author order, a complete byline or person identity. DOI-only entries retain unknown bibliographic fields and remain review proposals rather than verified references. Every candidate requires review, including exact DOI matches. No result is selected or merged into the citation cache.

The search serializes requests per instance (one-second default minimum interval), coalesces identical in-flight queries, bounds the pending queue to four and reads at most 2 MB per response. Requests have an eight-second timeout and reject redirects. HTTP 429/server errors honor Retry-After, and network failures pause subsequent calls. There are no automatic retries. Use a shared search instance for one host's workload; independently constructed instances do not coordinate rate limits.

An optional `store` supplies `get`/`set`; its namespaced search entries are separate from bibliographic records. Successful candidates cache for one day by default, empty results for five minutes. Cached envelopes are validated; invalid data triggers a fresh request. `search(query, { force: true })` refreshes subject to pacing/backoff. On refresh failure, previous candidates remain explicitly `stale` alongside last-known-good and failed-attempt evidence. Cache failures leave search usable in memory for the current call and carry diagnostics. Injected `fetch`, `now`, `sleep`, `minInterval` and `freshFor` support deterministic tests; this is not a persistent/offline metadata catalogue.

## Corpus design

Use two layers:

1. Paired complete documents test extraction and end-to-end preservation: native text, clipboard paste, Markdown, DOCX/ODT and selectable-text PDFs of the same work when available.
2. Small, independently checked cases isolate detection, author/date matching, ambiguity and safe source ranges. Public tests use synthetic or appropriately licensed material. Author-supplied unpublished content stays in an ignored local corpus until specific excerpts are approved.

Each input needs its original bytes/hash, origin, format, style/variant, bibliography boundaries, expected citation spans and intended reference IDs. Retain an explicit noncitation/ambiguous/unsupported label where appropriate. Keep development examples separate from held-out evaluation examples. A source paragraph's presence in two exports is consistency evidence, not two independent examples of successful matching.

Initial intake has demonstrated why these layers matter:

- Google Docs exports can contain Zotero hyperlinks without native Word fields or ODT reference marks. Links identifying an entire bibliography must not be treated as per-work IDs.
- Markdown can contain linked citation labels, escaped delimiters and embedded image data. A raw-text citation regex is not a Markdown extraction adapter.
- Text export and clipboard paste can differ in equation representations while retaining comparable citation text. Imports must preserve unrelated manuscript content.
- PDF extractors can produce different line boundaries and include rotated/overlay text. Extraction quality must be evaluated before scoring citation matching.
- A bracket-numeric article is needed alongside author-date material; its reference numbers must be mapped using its own ordered bibliography, never a global reference cache.

A first developer-labelled text case contains 19 citation groups / 25 cited items: 21 proposals match the supplied bibliography and four correctly remain unmatched because their entries are absent. Transferred labels give the same candidate results across four extracted text views. The same proposals survive both a local Markdown-to-HTML rendering check and direct Markdown extraction with original-source fragments. Exact fragments round-trip to the source; escapes retain conservative maps. Several unrelated regions remain explicitly skipped. These are development results from one document, not independent curator acceptance, a held-out accuracy estimate or verification of the cited claims. The labels and source content remain private.

The local corpus is excluded from Git across branch changes. No manuscript text or opaque document tokens are copied into public tests, and no metadata provider is contacted by intake/detection. The original documents remain untouched. The corpus audit, extracted text views and preliminary checked matching results are local working evidence.

## Structured reference sources

A matching Zotero CSL-JSON export is useful for identity and author/date checks. Preserve native citation fields when present; inspect DOCX field instructions and ODT reference marks rather than assuming formatted text remains editable citation data. A normal export can flatten that structure into hyperlinks or visible text.

The original authoring document should remain intact. A future adapter should use structured citation identities and locators where available, retain provenance and fall back to a reviewed text match when they are absent. It must not unlink or overwrite live Zotero fields as an incidental part of importing an article.

## Next slices

- Expand developer-checked citation matches into independently checked and held-out cases; separate extraction failures from recognition and matching failures.
- Broaden Markdown quote/list/table/raw-HTML coverage and improve decoded HTML entity maps without losing protected regions or source fidelity.
- Integrate the experimental Crossref search into a review UI/installed API and measure candidate retrieval across more public reference types. Preserve explicit lookup consent and avoid automatic cache mutation.
- Measure a small rule-based reference parser against real reference lists. Expand only after recording field accuracy and error cases.
- Add DOCX/ODT adapters, numeric/reference-number mapping, and PDF extraction/reading-order tests as independent components. OCR is a later, separately measured path.
- Build a review UI and an explicit accepted-edit plan tied to the original source revision. No unsupported text or bibliography entry is silently discarded.

Crossref search and local matching remain separate operations. Any later AI adapter is optional and behind the rules; import must work offline without it. Zotero and other bibliography-manager integrations should reuse the same records/provenance model rather than introducing a competing citation identity system.

## Evidence and scope

The current source-only test run passes 107 unit tests on Node 22.23.3, including ten matcher, seventeen extraction and twelve Crossref-search tests. Independent review challenged narrative boundaries, incomplete bylines, control boundaries, native visibility and link-role handling; regression tests now constrain those cases. The extraction/search reviewer returned PASS after independently running all 107 tests and rechecking Markdown offsets, entities, protected notation and persisted search-cache validation. This is approval to continue experimenting, not acceptance of a public 0.3.0 API. Browser/runtime assets are unchanged, so existing browser verification is not represented as evidence for unimplemented file adapters.

Two bounded live searches used only the supplied public article: bibliographic title search returned its expected DOI first with exact title/year/DOI comparisons; using the DOI alone as bibliographic query text returned unrelated candidates, all marked with DOI conflicts. These checks establish request/response behavior for that sample, not general retrieval accuracy. No private manuscript data was sent.

Before a preview is shared, run the [milestone checks and independent reviews](checkin-procedure.md), provide installed Node/browser APIs and JSON CLI equivalents, update the Guide/README, and document measured format/style coverage. Corpus breadth, matching quality and preservation of review decisions determine confidence; a green synthetic test suite alone does not.

## Primary references

- [Zotero field-code storage](https://www.zotero.org/support/kb/word_field_codes): explains the reference data hidden behind rendered Word fields and LibreOffice reference marks.
- [Zotero document troubleshooting](https://www.zotero.org/support/kb/existing_citations_not_detected): active citation data can be lost by document transformations.
- [Crossref reference-matching guidance](https://github.com/CrossRef/rest-api-doc/blob/master/api_tips.md): recommends bibliographic queries and comparison of returned candidates.
