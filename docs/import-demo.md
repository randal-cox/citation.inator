# Import-review development demo

Run from the `codex/citation-import` checkout with Node 22.13 or later:

```sh
npm ci
npm run build
npm start
```

Open [http://127.0.0.1:4187/demos/import/](http://127.0.0.1:4187/demos/import/), or choose Import review from the Reading room navigation. This is the example host for the 0.4.0 import API, included in the source checkout. The [headless API guide](import-api.md) documents integration independently of this layout.

## Import Document

Import Document and Resolve Citations are independent accordion disclosures, open by default. Headers and revealed content share one bordered panel; the other main disclosures use the same style; closing a section preserves its source and decisions. Lookups continue in the background while sections are closed.

Choose an example, paste a complete document into Raw Document, or choose/drop a UTF-8 text/Markdown or a PDF, DOCX or ODT file. Body and bibliography share one editable source. The selector shows **Dropped file** or **Chosen file** after a successful import, and the filename appears beside Choose file. Unsupported files leave the previous document intact.

Citation format starts at **Detected format** and is inferred from the visible body, not an example-specific answer. APA, Chicago author–date and bracket-numeric modes have manual overrides. Mixed or insufficient evidence requires a choice. Format changes analyze immediately; raw edits analyze after a short pause.

The source parser detects References, Bibliography and Works cited headings, excluding code, quoted blocks and raw HTML. Multiple headings require a boundary choice under Raw Document → Bibliography boundary; custom start/end lines and No bibliography are also available. A later Markdown heading ends the bibliography unless an explicit end line is supplied. Blank-separated or list entries work best; unsupported reference prose remains a raw local entry. Numeric labels come from the document, never from list order.

Numbered journal references can supply author/title/year and publication fields for background discovery when no DOI is given. Explicit DOI line wraps use a bounded recovery rule; ambiguous continuations stay reviewable. Original references remain visible in Bibliography and Raw Document. PDF line hyphenation and unusual bylines can still require a manual correction. See the [field/identifier support details](import-api.md) and [public PDF audit](evidence/import-plos-0294391-2026-11-23.json).

The APA example uses three real Einstein papers from 1905: light quanta, Brownian motion and special relativity. Two ambiguous citations have topical clues but the same short author/year label. Planck’s 1901 paper supplies a unique reference; Missing is deliberately absent. Chicago reuses these works with narrative/page citations; the numeric example includes known DOIs and a missing number. The book and original/correction examples exercise edition choices and distinct publication identities. Invented Avery/Bennett works and undated-rule cases remain test fixtures, not live lookup examples. The four physics references were checked against publisher/Crossref metadata; [verification and answer key](evidence/import-physics-references-2026-11-21.json). All matching records derive from the bibliography text. Editing its titles, authors, dates or labels changes matching. Reanalysis clears previous choices rather than transferring them by position.

## Resolve Citations

Hover or click a highlighted citation; with a keyboard, focus it and press Enter or Space. Radio choices apply immediately; Don’t fix keeps its text unchanged. Unique, sufficiently supported local candidates are selected automatically. Green means an existing, manually entered or accepted valid identifier, or an explicit Keep without identifier decision. Red needs a work/span choice; gray is unmatched or skipped; orange means a selected work still needs identifier completion. Lookup starts automatically; conversion can use a local reference while it is orange, without waiting for successful completion. A green reference does not verify the claim it supports. A similar title can identify a book review rather than the book: compare author and publication type as well as year. Reprints and provider dates can differ; a one-year discrepancy is never automatically forgiven.

Previous/Next and Left/Right follow the same Needs review decisions as the counter, skipping ready/skipped references and queued/running work. A selected bibliography match alone is not a navigation destination; an unresolved identifier choice is. Reaching either end closes the panel like Escape. Up/Down select radio choices. Text fields keep their normal caret keys, and Tab retains its normal focus order. Paste a DOI, ISBN or URL to override a target. DOI/ISBN metadata is fetched automatically after typing pauses; failed retrievals can be retried together from the progress display. Valid entered identifiers work directly offline without requiring metadata retrieval. Other supported identifiers and safe HTTPS URLs remain usable without arbitrary URL fetching. Invalid identifiers do not turn green.

A popup moves when dragged from blank space; controls and text selection retain their normal behavior. Drag its lower-right corner to resize. Moving or resizing keeps it open until Escape or an outside click; reopening the same citation retains its geometry. With the popup itself focused, Alt+arrow keys move it; focus the resize corner and use arrow keys to change its size. On touch screens, use blank header space to move it or the corner to resize; the contents still scroll. Popup bounds adapt to the viewport.

## Converted Document

Open Converted Document to see literal `{cite …}` Markdown. It stays open and updates as choices change. Conversion preserves unaccepted text and the original bibliography. **Use source** explicitly replaces the working source; preview alone does not edit it.

Download both **Markdown** (`reviewed-citations.md`) and **references** (`citations.json`) when local-ID markers are present. Supply that cache to the compiler in your project; the Markdown alone does not embed local records. Reading Preview is a separate disclosure beside Converted Document, with the same heading style. Either can open independently and refresh live. It renders the converted body with generated endnotes without duplicating the original bibliography in that preview. The exported Markdown still retains the original bibliography.

Uploaded original bytes remain separately available through Download original, even after working-source edits. Textarea display normalizes line endings; unchanged source ranges and exported bibliography retain their original line endings. New lines follow the source’s initial newline convention. Files must be UTF-8, at most 18 MB, and decode to at most 1,500,000 UTF-16 characters. PDF/DOCX/ODT produce an editable text working copy with extraction diagnostics and retained metadata; original native bytes remain separately downloadable. See the [native support matrix](import-api.md#native-file-extraction).

## Real references and lookup development

The real example includes Ioannidis’s 2005 article, its separate 2022 correction, and Feinberg and Willer’s 2019 article. The source in [document-examples.mjs](../demos/import/document-examples.mjs) omits identifiers. Metadata was checked against the [original](https://journals.plos.org/plosmedicine/article?id=10.1371/journal.pmed.0020124), [correction](https://journals.plos.org/plosmedicine/article?id=10.1371/journal.pmed.1004085) and [Wiley article](https://compass.onlinelibrary.wiley.com/doi/10.1111/spc3.12501) on 21 November 2026. Demonstration prose is not quoted from them.

The [answer key](../demos/import/real-reference-answer-key.json) retains the legacy fixture IDs and publisher-checked DOIs; match its entries by title/year when using the new source-derived IDs. It is never loaded by the demo or matcher. This is a development set, not an independent search benchmark. DOI suggestions start automatically for selected references. Books: ISBN edition choices adds a public book reference with its ISBN omitted. This example is not an ISBN accuracy benchmark.

## Automatic identifier lookup

Lookup is always automatic in the demo. Selecting a reference, or finding one unambiguous match, sends its title, authors and available publication details to Crossref/Open Library. The document body, filenames, surrounding sentences and editor notes are not sent to those providers. No switch or per-reference Find action is needed. Network errors leave manual identifiers and Keep without identifier usable.

Three metrics beside Resolve Citations separate conversion readiness, machine work and human decisions. **Ready citations** counts complete highlighted citation groups, with a fixed total and percentage; a partly resolved multi-work group is not ready, and skipped groups stay in the total. Format or bibliography-boundary choices block readiness. Click the ready count to open the first ready citation. Readiness means convertible, not independently verified. **Looking up** counts queued/running selected reference lookups; a returned result no longer counts there. **Needs review** counts unselected/invalid work targets, source-span issues, and identifier choices or failed unknown-identifier lookups requiring a decision. Repeated mentions of one reference share its metadata task/decision, while ambiguous in-text work choices remain occurrence-specific. These are reference tasks, not HTTP request totals. Existing valid identifiers remain usable if optional metadata retrieval fails. Nonzero counters are colored; zero uses the normal text color. Click a colored number to open the first corresponding item. All metrics use 13px type and remain available when Resolve is collapsed. Retry failed lookups retries selected failures as a batch.

A DOI/ISBN already present in the bibliography, or entered manually, bypasses discovery and goes directly to metadata resolution. Its hover contains no discovery controls or suggestions; background progress stays in the overall display, and response evidence is under Diagnostics → Identifier evidence. If retrieved metadata conflicts with the supplied reference, a concise identity-review section appears and conversion waits for explicit acceptance or correction. Known bibliography identifiers remain usable when retrieval fails; failure is different from an observed conflict.

Selected journal entries search Crossref; books search Open Library; unknown publication types search both. Selecting a bibliography target starts its lookup automatically; there are no per-reference Find buttons. An unambiguous selected item starts even if another item in the same citation group still needs a work choice. Searches are shared only for the same complete query/identity fingerprint, including available edition constraints. Results stay in page memory. Source edits invalidate pending applications; changing sources cancels requests and rejects late responses. Accepted metadata stays available during review until the source changes.

A DOI is chosen automatically only under the versioned **exact-identity-v1** policy: exact normalized full title, compatible complete author sequence, exact cited year, known matching publication type and agreement with every supplied journal/publisher/volume/issue/page/edition field. Meaningful title symbols and notice prefixes survive comparison. Any same-title competing DOI, preprint/version flag or correction/retraction relation prevents automatic acceptance. The DOI is independently resolved before applying the automatic result. This conservative rule is not a probability or proof of global uniqueness.

Other candidates appear as radios with author/year, identifiers and fields to check. Candidates more than two years from a supplied citation year sit under Less likely results. Missing years remain visible, and a selected result always stays visible. This is presentation only: all candidates and evidence remain available, and the automatic acceptance policy is unchanged. One selection resolves that DOI/ISBN and updates output immediately when supplied fields agree. Conflicting or missing supplied metadata stays red and needs an explicit Use this identifier anyway decision; the old override does not survive source changes. Provider errors keep a previous good identifier available; Retry or Keep without identifier lets you continue.

ISBNs always need an edition choice in this increment. Open Library search checks at most three works and five editions per work, displaying at most fifteen distinct ISBNs and combining ISBN-10/13 aliases. This limited window may omit the cited edition. Author names can come from the work rather than the edition; dates, publishers, edition/format/language clues are shown for review. A lone result is not automatically the right edition. No results does not prove no ISBN exists.

Accepted metadata fills missing session-record fields and adds identifiers/provenance. Conflicting authored titles, dates, authors and reference text remain intact. Canonical markers and the exported cache carry accepted identifiers; repeated mentions share reference metadata while keeping their own locators. Duplicate canonical identifiers have one cache owner, with original local reference records retained separately. Full raw provider evidence is inspectable during the session under Diagnostics → Identifier evidence, and in discovery popups where applicable; the portable cache carries normalized metadata and provenance, not the entire response log.

Provider requests use allowlisted HTTPS origins, omitted credentials and no referrer. They are queued separately, spaced at least 1.1 seconds apart, bounded to ten seconds/2 MB per response and a 20 MB response budget per page session, and honor rate-limit pauses without automatic retry loops. Search result counts are bounded. A new example/file resets the memory cache/budget. Source-only browser transport and manual fallback are implemented; a static HTTPS deployment of the complete review/apply flow is not.

## Processing and limits

By default the page analyzes and converts working text locally in the browser through `processImportRequest`; it does not post the full document to a review server. Only selected bibliographic fields go directly to metadata providers. Uploaded original bytes remain in browser memory, and no persistent documents or project files are changed. The optional `processing: "server"` configuration uses the local `/demos/import/review` adapter for the same protocol. `npm start` also supplies the private local catalogue. Static public HTTPS deployment remains to be verified.

The document path is bounded to 300 references, 300 citation groups and 900 cited items. Review also limits total candidate choices to 3,000 and requests to 12 MB. Oversized work is rejected rather than partly applied. The server checks loopback host, same-origin browser requests and JSON content type.

Diagnostics contains optional conversion and parsing evidence. Partial parsing, conservative Markdown source mapping and unsupported bylines can leave citations requiring review. No broad extraction or metadata accuracy claim follows from the synthetic tests. Bounded native extraction and browser-native review/apply are implemented; native-format round trips, host editor transactions and general PDF reading-order accuracy are not claimed. ISBN automation and broader identifier providers remain future work. See [development](import-development.md), [full-document flow](import-document-flow.md) and [draft integration](draft-integration.md).

## Local manuscript examples

The Examples menu can add a **Your documents** group from a local, gitignored `.citation-import-local/examples.json` manifest. Each entry supplies `id`, `label` and a `file` relative to that directory:

```json
[{"id":"my-paper","label":"My paper — text export","file":"my-paper.txt"}]
```

The local server lists only registered labels and reads an example only when selected. Source files must stay inside the corpus directory (symlink/path escapes are rejected), be UTF-8 text, and fit the 18 MB/1,500,000-character defaults. `CITATION_IMPORT_EXAMPLES_DIR` can select another private directory. The native menu is populated before it becomes enabled, rather than replacing its options while open. Public/static distributions have no manuscript catalogue.

Register complete extracted text when experimenting with Word, OpenDocument or PDF material; this does not turn those formats into supported native imports. Manuscript/configuration files stay outside Git and releases. The selected source is analyzed in the browser by default; automatic provider queries contain selected bibliographic fields. The optional server-processing mode posts source to its local analysis endpoint. A failed load preserves the previous document, review and original-file download. Parsing accuracy and large-paper responsiveness need separate review, even when loading succeeds.

## Configure import limits

The experimental source importer accepts ordinary JavaScript options, including options read from JSON:

```js
import { createDocumentImporter } from './src/import-document.mjs';
const preferences = JSON.parse('{"limits":{"sourceCharacters":3000000,"references":600,"citationGroups":600,"citedItems":1800}}');
const importer = createDocumentImporter(preferences);
const analysis = importer.analyze(source);
```

This analyzer is also exported by the candidate import entry point, separate from the stable citation renderer's `init`. It analyzes text/Markdown without changing the source. Omitted limits retain their defaults; unknown keys, noninteger values and nonpositive values are rejected. `analyzeImportDocument(source, options)` accepts the same options.

For the local demo, edit the inert JSON configuration in `demos/import/index.html` before loading it:

```html
<script type="application/json" id="citation-import-config">
{"limits":{"sourceCharacters":3000000,"fileBytes":12000000,"references":600,"citationGroups":600,"citedItems":1800}}
</script>
```

The demo uses these limits for intake, analysis, preview and review-context validation. When using `processing: "server"`, the local server separately enforces ceilings: set `CITATION_IMPORT_LIMITS` to a JSON limits object when starting `npm start` to raise them. Server-processed values are clamped to those host ceilings; a browser preference cannot raise a server ceiling. Browser-only processing uses its configured local limits. Local catalogue reads use the host ceilings too.

Defaults are 1,500,000 source characters, 18,000,000 file bytes, 300,000 serialized characters per reference record, 12,000,000 request bytes, 300 references, 300 citation groups, 900 cited items and 3,000 candidate choices. `parallelLookups` defaults to four active reference jobs; provider lanes also have their own queues and timing rules. `titleCharacters` defaults to 1,500 and `authorsPerRecord` to 150 for supplied records. These are protective budgets, not measured performance guarantees. Native defaults also include 500 PDF pages and 24,000,000 bytes per selected office XML entry (`pdfPages`, `archiveEntryBytes`); source-derived bounds may be smaller. Provider response/metadata safety bounds remain separate.

A synthetic single bibliography with 51 distinct works and 57 citation groups exercises three times BEST's measured reference/group counts, including a large embedded-image definition. The local BEST text, paste, Word-extracted, OpenDocument-extracted, Markdown and PDF-extracted versions each produce 17 reference blocks and 19 citation groups in the current development check. This does not certify their bibliographic accuracy. The earlier local PDF text was prepared separately. Native intake now performs its own bounded extraction, retains excluded material in metadata and reports reading-order review. Zotero-linked citations in TXT/Markdown can remain `accepted-needs-adapter`, with source unchanged. Embedded image data is hidden in the reading surface but retained in Raw Document and exports.

Combined citations show the number of references and a separate, initially open disclosure named for each cited work. Each work has its own status and choices. Leaving a combined citation unchanged applies to the entire group. The popup title and navigation sit above the scrolling body, so long results cannot overlap them. Conflicting identifiers show the retrieved title, authors, year and publication details before the explicit override action.

The metrics have different units: Ready counts citation groups, Looking up counts shared background reference tasks, and Needs review counts decisions. They are not additive. A known identifier can be usable while optional metadata is still loading.

Known bibliography identifiers are shown beside their reference candidate, even while discovery controls stay hidden. Missing works in a combined citation expose their identifier and leave-unchanged controls directly, rather than an empty choice disclosure. Review popups use neutral header, work and inset evidence surfaces in light/dark modes; citation-state colors remain separate.
