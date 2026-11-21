# F4 import development for milestone 0.3.0

**In progress.** The current release remains 0.2.0. The initial prototype is source-only and is not exposed by the package exports, browser bundle or CLI. No 0.3.0 package or release is claimed.

## First implementation

`src/import-matcher.mjs` contains experimental `parseInTextCitations(text, options)` and `matchCitations(detection, references)` functions. They accept already-extracted visible plain text and supplied bibliographic records. They make no network requests, modify no records and produce no article edits.

Detection returns UTF-16 source ranges, original text, parenthetical/narrative form and item fields for initial APA/Chicago author-date shapes. Groups, simple prefixes/page locators, year letters, original/edition date pairs and known author initials have synthetic regressions. The `range` option explicitly bounds the body under examination; reference-list boundaries are not guessed or removed. Existing citation.inator notation is protected.

Matching returns `unique`, `ambiguous` or `unmatched` proposals, all requiring review. It uses supplied author/year information and optional document-specific `sourceSuffix` metadata. It never computes imported year letters from global cache ordering. Incomplete bylines and uncertain narrative boundaries cannot become unique evidence. Candidate identity does not establish that a source supports a manuscript's claim.

Narrative boundaries are still experimental. Capitalized prose, organizations and comma-separated author lists can have multiple plausible starts. Alternatives retain their offsets and carry uncertainty. Weak alternatives are labelled `uncertain-narrative-span`, not exact byline evidence. No rewrite adapter should apply these proposals until a user has accepted the author span and record identity.

This prototype is not a style-compliance validator. It does not yet support undated references, bracket-numeric citations, broader locators or every valid author spelling. Literal full-person names are not heuristically split into family names. The detector itself rejects raw Markdown, HTML and document files; it expects already-extracted text. The initial HTML extraction adapter below supplies that text with source provenance. Markdown and native file adapters remain unfinished.

## Initial extraction adapter

`src/import-extraction.mjs` provides experimental `extractImportText(source, { format: "text" | "html" })`, `detectExtractedCitations(extraction, options)` and `mapImportRange(extraction, { start, end })`. These are source-only functions, with no package export or CLI command yet.

HTML extraction reads eligible text across inline formatting and ordinary links, including citation labels inside bibliography-manager hyperlinks. It excludes code, scripts, controls, explicit hidden/ARIA-hidden elements, closed native details/dialogs, editable regions and generated citation UI. Paragraphs and skipped regions introduce boundaries so detection cannot bridge them. Link targets are opaque provenance: extraction neither follows them nor treats them as work identities.

Offsets use UTF-16 code units. Each extracted text segment retains its original HTML text-node range. Unchanged text maps precisely; entity decoding and newline normalization conservatively map to the whole original text node with `exact: false`. Citation proposals retain separate `sourceFragments`, including link indexes where applicable. These fragments are evidence for review, not an edit plan: replacing the span from the first fragment to the last could erase formatting or links. No replacement API is provided.

The adapter parses HTML without executing it and does not model CSS visibility or visual reading order; it always reports that limitation. It does not sanitize or render HTML. Markdown, DOCX, ODT and PDF extraction remain separate future adapters.

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

A first developer-labelled text case contains 19 citation groups / 25 cited items: 21 proposals match the supplied bibliography and four correctly remain unmatched because their entries are absent. Transferred labels give the same candidate results across four extracted text views. The same proposals also survive a local Markdown-to-HTML rendering check; its source maps refer to the intermediate HTML, not to the original Markdown. These are development results from one document, not independent curator acceptance, a held-out accuracy estimate or verification of the cited claims. The labels and source content remain private.

The local corpus is excluded from Git across branch changes. No manuscript text or opaque document tokens are copied into public tests, and no metadata provider is contacted by intake/detection. The original documents remain untouched. The corpus audit, extracted text views and preliminary checked matching results are local working evidence.

## Structured reference sources

A matching Zotero CSL-JSON export is useful for identity and author/date checks. Preserve native citation fields when present; inspect DOCX field instructions and ODT reference marks rather than assuming formatted text remains editable citation data. A normal export can flatten that structure into hyperlinks or visible text.

The original authoring document should remain intact. A future adapter should use structured citation identities and locators where available, retain provenance and fall back to a reviewed text match when they are absent. It must not unlink or overwrite live Zotero fields as an incidental part of importing an article.

## Next slices

- Expand developer-checked citation matches into independently checked and held-out cases; separate extraction failures from recognition and matching failures.
- Extend the initial HTML adapter with Markdown extraction and more precise decoded-entity maps; preserve citation-looking hyperlinks while protecting code/attribute regions.
- Add reviewable Crossref bibliographic search with field agreement/conflicts, rate limits, recorded evidence and no automatic cache mutation. Send references only when the host explicitly invokes lookup, not the manuscript.
- Measure a small rule-based reference parser against real reference lists. Expand only after recording field accuracy and error cases.
- Add DOCX/ODT adapters, numeric/reference-number mapping, and PDF extraction/reading-order tests as independent components. OCR is a later, separately measured path.
- Build a review UI and an explicit accepted-edit plan tied to the original source revision. No unsupported text or bibliography entry is silently discarded.

Crossref search and local matching remain separate operations. Any later AI adapter is optional and behind the rules; import must work offline without it. Zotero and other bibliography-manager integrations should reuse the same records/provenance model rather than introducing a competing citation identity system.

## Evidence and scope

The current source-only test run passes 84 unit tests on Node 22.23.3, including ten matcher and six extraction tests. Independent review challenged narrative boundaries, incomplete bylines, control boundaries, native visibility and link-role handling; regression tests now constrain those cases. The extraction reviewer returned PASS for the experimental development check-in after rechecking the fixes. This is approval to continue experimenting, not acceptance of a public 0.3.0 API. Browser/runtime assets are unchanged, so existing browser verification is not represented as evidence for unimplemented file adapters.

Before a preview is shared, run the [milestone checks and independent reviews](checkin-procedure.md), provide installed Node/browser APIs and JSON CLI equivalents, update the Guide/README, and document measured format/style coverage. Corpus breadth, matching quality and preservation of review decisions determine confidence; a green synthetic test suite alone does not.

## Primary references

- [Zotero field-code storage](https://www.zotero.org/support/kb/word_field_codes): explains the reference data hidden behind rendered Word fields and LibreOffice reference marks.
- [Zotero document troubleshooting](https://www.zotero.org/support/kb/existing_citations_not_detected): active citation data can be lost by document transformations.
- [Crossref reference-matching guidance](https://github.com/CrossRef/rest-api-doc/blob/master/api_tips.md): recommends bibliographic queries and comparison of returned candidates.
