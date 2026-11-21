# F4 import development for milestone 0.4.0

**Development history and implementation notes.** Public release remains 0.3.0. The unpublished 0.4.0-preview.0 candidate now exports a shared Node/browser API, JSON CLI and bounded native extraction. Start with the [current API guide](import-api.md) for installation and support. Historical test counts and source-only prototype descriptions below record earlier stages, not current candidate availability.

## Full-source development adapter

`src/import-document.mjs` provides source-only `partitionImportDocument(source, { startLine: "auto", endLine: null })` and `analyzeImportDocument(source, { style: "auto", bibliography: {} })`. These portable helpers are now re-exported by the candidate import entry. The demo requests `mode: "document"`, rejecting detached record/reference inputs in that mode. Boundaries, extracted citation fragments and raw reference entries map to the full canonical source. Code, quotes and raw HTML are excluded from heading detection; actual Markdown blocks bound bibliography entries. Ambiguous headings require a manual boundary.

Reference IDs hash raw entry content: reordering preserves identity, while changing the entry creates a new identity. Records retain source range/hash evidence and raw authored `citationParts`; partial APA/Chicago/numeric rules propose fields without backfilling fixture metadata. The explicit APA `Anonymous.` byline is retained as a literal author, not a fabricated person name. Complex unparsed bylines stay raw. The GUI clears decisions after source changes; source/context hashes still reject stale requests.

Explicit `state: "partial"` records with nonempty valid authored `citationParts` now retain partial state even without a parsed title. Empty parts and missing titles in other states remain unresolved. This permits clean consumers to render exported raw references without inventing title metadata; it does not promote incomplete provider records to resolved.

The [demo guide](import-demo.md) documents file budgets, canonical newline preservation, manual boundaries and paired Markdown/cache export. The [flow design](import-document-flow.md) records the source flow and subsequent native/completion adapters.

## Browser completion adapter

`src/import-enrichment.mjs` supplies the candidate browser completion primitives, re-exported by the import entry and bundled for the demo. `createBrowserEnrichment` accepts injected fetch/clock/sleep for deterministic tests and exposes `lookup`, `cancel` and `reset`. `compareIdentity`, `automaticCandidate` and `ENRICHMENT_POLICY` implement deterministic strict DOI acceptance; ISBN proposals stay manual. `mergeCompletion` adds identifiers/provenance and missing fields while retaining conflicting curator fields. The local demo validates source/context before applying accepted completion IDs and normalizes the portable cache. Full raw responses remain session evidence rather than cache fields.

The demo CSP permits only Crossref and Open Library in addition to its own origin. Other demos retain their original connect-src restriction. No proxy, secret or provider credential is required. See the [completion guide](import-demo.md#automatic-identifier-lookup) and [design/evidence](import-enrichment-plan.md) for current coverage and limits. The shared review/apply protocol is now browser-safe; see the candidate API guide.

## First implementation

`src/import-matcher.mjs` contains experimental `parseInTextCitations(text, options)` and `matchCitations(detection, references)` functions. They accept already-extracted visible plain text and supplied bibliographic records. They make no network requests, modify no records and produce no article edits.

Detection returns UTF-16 source ranges, original text, parenthetical/narrative form and item fields for initial APA/Chicago author-date and Vancouver bracket-numeric shapes. Groups, simple prefixes/page locators, year letters, original/edition date pairs and known author initials have synthetic regressions. The `range` option explicitly bounds the body under examination; reference-list boundaries are not guessed or removed. Existing citation.inator notation is protected.

Matching returns `unique`, `ambiguous` or `unmatched` proposals, all requiring review. It uses supplied author/year information and optional document-specific `sourceSuffix` metadata. It never computes imported year letters from global cache ordering. Incomplete bylines and uncertain narrative boundaries cannot become unique evidence. Candidate identity does not establish that a source supports a manuscript's claim.

Narrative boundaries are still experimental. Capitalized prose, organizations and comma-separated author lists can have multiple plausible starts. Alternatives retain their offsets and carry uncertainty. Weak alternatives are labelled `uncertain-narrative-span`, not exact byline evidence. No rewrite adapter should apply these proposals until a user has accepted the author span and record identity.

This prototype is not a style-compliance validator. It does not yet support superscript numeric citations, broader locators or every valid author spelling. Literal full-person names are not heuristically split into family names. The detector itself rejects raw Markdown, HTML and document files; it expects already-extracted text. The initial HTML/Markdown extraction adapters below supply that text with source provenance. Native file adapters remain unfinished.

### Numeric proposals

Set `style: "vancouver"` to recognize bracketed numbers, comma groups and ranges such as `[1, 3–5]`. Each item retains its `referenceNumber`. Ranges expand to at most 100 items per group; descending, malformed or excessive ranges are diagnosed without partial import. Repeated numbers are retained with a diagnostic. Numeric-looking brackets can also be arrays or other prose notation, so these are review proposals rather than a claim of perfect citation recognition.

Supply explicit `referenceNumber` metadata on each reference record. Array/cache order is never used as numbering. Missing labels remain unmatched and duplicate labels produce ambiguous candidates. A unique label links to one local reference entry; it does not verify its metadata, DOI or claim support. Body/reference boundaries remain caller-reviewed. Escaped numeric labels inside Markdown links can still be skipped with a source-location diagnostic; this is a known extraction gap. Markdown reference links may consume bracket syntax: inspect extraction diagnostics and source context rather than assuming every bracket is a citation.

Undated author–date citations such as `(Avery, n.d., p. 5)` are recognized, including case variants and source letters such as `n.d.-a`. Unsupported no-date/locator forms retain diagnostics. A record with no issued date remains only an ambiguous candidate (`date-not-recorded`); omission of a date is not proof of an undated work. Per-import input metadata `undated: true` can explicitly affirm that distinction, yielding `explicitly-undated` evidence. It cannot coexist with an issued date, and is not a new canonical cache/export field. Known issued dates do not match `n.d.`. All proposals still require review.

## Citation-format inference

`src/import-format.mjs` provides experimental `detectCitationFormat(source)` for the local demo. It returns a supported mode or `null`, a detected/ambiguous/mixed/unknown state, counted source cues and `ignoredNumericRanges`. It infers only among the current APA-like, Chicago author–date and bracketed-numeric shapes; it does not identify arbitrary named styles. Narrative-only and mixed clues stay uncertain. The demo blocks conversion in automatic mode until the editor chooses a format when inference is inconclusive. Manual overrides reanalyze immediately.

Bracketed reprint years inside plausible author–date contexts are excluded from numeric proposals, even when the full author–date locator is unsupported. The service carries these exclusions into numeric reparsing, including manual numeric mode, so a later parse cannot restore an original year as a numbered reference. Source and requested-format context remain bound to the reviewed snapshot. This helper is source-only and not a public installed export.

## Reference rules and review/edit protocol

`src/import-references.mjs` exposes experimental `parseReference(text, { style })` and `parseReferences(entries, options)`. Entries must be separated explicitly by the caller. They are not full-document bibliography splitters. Each result retains `raw`, partial proposed `fields`, source `evidence`, diagnostics and `requiresReview: true`.

Initial APA rules propose initial-based personal bylines, issued dates, source suffixes and a first title segment. Complex/omitted/corporate bylines stay as raw author text rather than becoming complete invented people. Chicago rules propose an explicit date boundary and a title segment; numeric rules propose a leading reference number and explicit DOI text. Publication containers, editions, full bylines, undated entries and title-boundary edge cases still need review. DOI trailing punctuation/wrappers can be ambiguous; extracted identifiers are proposals, not verified identities. No parsing result enters the citation cache automatically.

`src/import-review.mjs` is a Node-only experimental protocol using SHA-256 revision checks:

```js
import { createImportReview, planImportEdits, applyImportEdits } from "./src/import-review.mjs";

const review = createImportReview(originalSource, matchedProposals);
// Populate decisions only after the host has presented proposals for explicit review.
const plan = planImportEdits(originalSource, review, {
  reviewId: review.reviewId,
  decisions: [{ citationIndex: 0, action: "accept", recordIds: ["chosen-record-id"] }]
});
const changed = applyImportEdits(originalSource, plan);
```

Decisions address whole citation groups: accept one supplied candidate per item, reject, or defer. Groups without decisions stay pending. Unmatched entries must first be curated/rematched before acceptance. The protocol validates the entire plan before applying any edit to the same source revision; changed source, snapshots, invalid candidates, overlapping edits or changed plans fail closed. Hashes detect revision changes/accidental corruption; they are not signatures or an authorization service. The host owns user authorization and persistence. The core snapshot covers source and proposal data; hosts must also bind their full reference/style context when those can change independently. The local demo adds a separate context digest and rejects changes to record metadata, style or raw reference input.

Generated markers use explicit `local:` IDs to avoid collisions with commands such as `endnote` and `evidence`. Prefixes, locators and narrative form are retained. Uncertain author boundaries yield `accepted-needs-span` without edits. Linked, decoded or noncontiguous source yields `accepted-needs-adapter` without edits, so acceptance cannot erase markup or strand notation inside an existing link. These accepted decisions remain available to a future editor adapter. The API never deletes the original bibliography or writes records, files or Git commits. A first [plaintext browser review demo](import-demo.md) uses the local Node server protocol. Browser-native hashing, rich-text/editor transactions and richer review UI remain unfinished.

For manual corrections, an accepted decision can use `targets` instead of `recordIds`:

```js
decisions: [{
  citationIndex: 0,
  action: "accept",
  targets: [{ recordId: "chosen-record-id" }, { identifier: "https://doi.org/10.1234/example" }]
}]
```

Supply one target per item. Each target has either a supplied candidate `recordId` or a manually chosen `identifier`. Bare DOI strings and ISBN-10/13 (including hyphens) are accepted, as are HTTPS URLs and prefixed DOI/ISBN/PMID/PMCID/arXiv identifiers. ISBN check digits are validated. Series identifiers such as ISSNs and arbitrary local IDs cannot serve as manual work overrides. Output targets contain normalized identifiers; input records and proposals remain unchanged. This records a curator's explicit choice without verifying identity or fetching metadata. Existing source, whole-group and span checks still apply. Identifier punctuation is escaped and the generated marker is reparsed before an edit is returned.

Hosts can pass positive `maxCitations` and `maxItems` recognition budgets. Exceeding a budget throws instead of returning a partial detection result. The local demo sets explicit group/item budgets before matching and also caps candidate fanout.

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

## Milestone boundary

All five import tracks are authorized for 0.4.0: recognition/matching, measured reference rules, extraction, review/edit decisions and quality evaluation. Stable editor/reader fixes are separated into 0.3.0; comprehensive learning follows in 0.5.0. See the [milestone scope](milestones/0.4.0.md#agreed-scope-and-active-tracks). Preserving existing embedded Zotero metadata belongs here; external bibliography-file ingestion/connectors and source maintenance are planned for [0.6.0](milestones/0.6.0.md).

## Next slices

- Expand developer-checked citation matches into independently checked and held-out cases; separate extraction failures from recognition and matching failures.
- Broaden Markdown quote/list/table/raw-HTML coverage and improve decoded HTML entity maps without losing protected regions or source fidelity.
- Measure automatic browser completion across more public reference types and deliver installed APIs separately. The demo now starts selected-reference lookups automatically; keep the documented bibliographic-only query boundary and avoid persistent cache mutation.
- Expand the initial partial reference rules through measured fields and error cases; explicit entry boundaries remain required.
- Add DOCX/ODT adapters, numeric/reference-number mapping, and PDF extraction/reading-order tests as independent components. OCR is a later, separately measured path.
- Expand the initial local plaintext review demo with a browser-native protocol and rich-text/editor adapters around the revision-bound edit plan. No unsupported text or bibliography entry is silently discarded.

Crossref search and local matching remain separate operations. Any later AI adapter is optional and behind the rules; import must work offline without it. Zotero and other bibliography-manager integrations should reuse the same records/provenance model rather than introducing a competing citation identity system.

## Evidence and scope

The earlier source-only test run passed 138 unit tests on Node 22.23.3, including recognition, extraction, search, reference-rule, review/edit and evaluator regressions. Independent review challenged narrative boundaries, incomplete bylines, control boundaries, native visibility and link-role handling; regression tests now constrain those cases. The extraction/search reviewer returned PASS after independently running all 107 tests and rechecking Markdown offsets, entities, protected notation and persisted search-cache validation. This is approval to continue experimenting, not acceptance of a public 0.4.0 API. The rebuilt browser suite verifies reader-help/host-hook behavior and the local plaintext import demo. It does not verify native file adapters or a browser-native import API; reusable import modules still have no installed exports.

Two bounded live searches used only the supplied public article: bibliographic title search returned its expected DOI first with exact title/year/DOI comparisons; using the DOI alone as bibliographic query text returned unrelated candidates, all marked with DOI conflicts. These checks establish request/response behavior for that sample, not general retrieval accuracy. No private manuscript data was sent.

### Independent challenge results

An independent reviewer authored [12 synthetic cases](../test/fixtures/import-challenge.json) without inspecting the importer or private corpus. Its sealed SHA-256 is recorded in the [evaluation report](evidence/import-challenge-2026-11-20.json). Run `node scripts/evaluate-import.mjs` to evaluate the current implementation; it makes no provider calls. Earlier reports below remain historical snapshots.

With explicitly documented input adapters, 7/7 baseline and 4/5 challenge cases meet the detection/candidate targets: 10/11 expected groups and 15/16 candidate sets, with zero observed false unique predictions. The remaining miss is `n.d.` recognition. A first contract run omitted record states and therefore left many references unresolved; the [initial report](evidence/import-challenge-initial-contract-2026-11-20.json) is retained rather than overwritten. The adapter translates metadata completeness, numeric style names and explicit year-suffix vocabulary without consulting expected answers. The [first adapted report](evidence/import-challenge-first-adapted-2026-11-20.json) is also retained before scorer hardening.

The scorer pairs spans one-to-one, checks exact item counts and includes unique predictions in unexpected spans/extra items in the unsafe-uniqueness count. Candidate-set agreement permits conservative ambiguity. These measurements cover recognition and association against supplied records, not reference parsing, locators, reprint preservation, claims or general accuracy. After evaluation this fixture is regression material, not an unseen holdout. Future evaluation needs fresh cases.

After the initial evaluation, `n.d.` recognition was added with an explicit unknown-date/undated distinction. The [post-fix regression report](evidence/import-challenge-after-undated-2026-11-20.json) now has 7/7 baseline, 5/5 challenge, 11/11 spans and 16/16 candidate-set agreement. The undated case remains conservatively ambiguous because the fixture has no explicit undated-record assertion. This is improvement against known cases, not a second independent validation or evidence of general perfect accuracy.

Separately, reference rules on the private developer-labelled reference list propose all 17 issued years and 16 of 17 expected bylines, retaining all raw entries. The subsequent explicit Anonymous parser fix proposes the remaining literal byline too. This is same-document development evidence; title accuracy and independently checked field accuracy are not claimed.

Before a preview is shared, run the [milestone checks and independent reviews](checkin-procedure.md), provide installed Node/browser APIs and JSON CLI equivalents, update the Guide/README, and document measured format/style coverage. Corpus breadth, matching quality and preservation of review decisions determine confidence; a green synthetic test suite alone does not.

## Primary references

- [Zotero field-code storage](https://www.zotero.org/support/kb/word_field_codes): explains the reference data hidden behind rendered Word fields and LibreOffice reference marks.
- [Zotero document troubleshooting](https://www.zotero.org/support/kb/existing_citations_not_detected): active citation data can be lost by document transformations.
- [Crossref reference-matching guidance](https://github.com/CrossRef/rest-api-doc/blob/master/api_tips.md): recommends bibliographic queries and comparison of returned candidates.

Earlier full-source follow-up: 163 unit tests, build and full Chrome browser suite passed with Node 26.13.1; see the [0.4.0 milestone evidence](milestones/0.4.0.md). This supersedes earlier test-count snapshots without changing their historical scope.

Earlier identifier-completion follow-up: **184 unit tests**, build and the full Chrome 158.0.8127.36 browser suite passed on Node 26.13.1. Independent identity/API/testing and UX/reader-copy/docs reviews returned scoped PASS. See the [milestone evidence](milestones/0.4.0.md) for scope and remaining platform/release checks.

Current real-example/review follow-up: **204 unit tests**, build and the full Chrome 158.0.8127.36 suite passed on Node 26.13.1. Coverage includes queued-vs-human navigation, shared review counts, clickable colored counter accessibility, distant-year results, local corpus boundaries and native selector stability during background updates, draggable/resizable popups, text selection and narrow scrolling. [Current milestone evidence](milestones/0.4.0.md).

The source importer now offers `createDocumentImporter({limits})`; options can come from JSON. Effective budgets reach format detection, parsing, matching and preview context validation. See [configuration and defaults](import-demo.md#configure-import-limits). Native-format extraction and safe rewriting of linked Zotero citations remain unfinished.

## 0.4.0 candidate integration update

The implementation now exposes the headless pipeline through `src/import-api.mjs`, `dist/citation-import.mjs` and the JSON import CLI. Portable SHA-256 retains source/context identity across Node and browser. The example host defaults to browser processing; its optional local server is an adapter, rather than the only implementation. Bounded native extraction lives separately in `src/import-files.mjs`, with an optional browser bundle/worker and preserved original files/opaque citation metadata. See the [current API and support matrix](import-api.md). Historical source-only statements above describe earlier evidence, not current candidate availability. No final 0.4.0 release is claimed.
