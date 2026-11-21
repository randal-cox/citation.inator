# Reviewed import API · 0.4.0 candidate

This API is implemented on the import development branch. It is not part of the published 0.3.0 artifacts. Final 0.4.0 release and draft.inator host agreement are pending.

## Load the library

Node requires 22.13 or later. In an installed 0.4.0 candidate:

```js
import { processImportRequest } from 'citation-inator/import';
```

For a browser without npm, copy `dist/citation-import.mjs` and `dist/THIRD_PARTY_LICENSES.txt` from the same candidate:

```js
import { processImportRequest } from './citation-import.mjs';
```

The import bundle is self-contained and has no required UI, network request, storage or framework. Bundlers can use `citation-inator/import-browser`. The demo is one host of this API; its full-page layout is not required in another editor.

## Analyze, review, preview

```js
const source = `A claim (Rivera, 2020, p. 4).

## References

Rivera, R. (2020). A paper. Journal, 1(1), 4–8.`;
const context = {
  mode: 'document', source, style: 'auto',
  citationKeyword: 'cite', namespace: 'essay-import',
  limits: { references: 300 }
};
const analysis = processImportRequest(context);

// In a UI, the reader accepts or rejects each proposed target.
const decisions = [{
  citationIndex: 0, action: 'accept',
  targets: [{ recordId: analysis.referenceRecords[0].id }]
}];
const result = processImportRequest({
  ...context, action: 'preview',
  review: analysis.review, reviewId: analysis.review.reviewId, decisions
});
console.log(result.source); // Markdown with a {cite local:...} marker
console.log(result.cache);  // Supply this cache when compiling local-ID markers.
```

`source` is the complete text/Markdown working document, including its bibliography. `style` supports `auto`, `apa`, `chicago-author-date` and `vancouver`. Detection is a citation-shape inference; mixed/unknown formats need a human choice. `citationKeyword` configures output notation and protects existing markers of that keyword; `namespace` configures reading-preview IDs. Both participate in context validation. Limits are ordinary JS options and can be loaded from JSON; see [defaults and configuration](#limits-and-configuration).

Analysis returns the revision-bound `review`, source-derived `referenceRecords` and raw `referenceEntries`, bibliography boundaries, format inference and diagnostics. Matching proposals are `unique`, `ambiguous` or `unmatched`; a unique bibliography match is not provider verification.

Each decision names a distinct zero-based `citationIndex`. Use `accept` with one target per item, `reject` to keep the group unchanged, or `defer` to leave it for review. A target is either `{recordId}` from that item's candidates or `{identifier: 'doi:10.…'}`. DOI, ISBN, safe URL, PMID, PMCID and arXiv identifiers are supported; only DOI/ISBN have built-in provider lookup. Source prefixes, page locators and narrative forms remain separate from identifiers.

Preview returns `source`, `edits`, `outcomes`, portable `cache`, reading `html` and diagnostics. It does not modify the input, apply editor transactions, remove the original bibliography or write files. Unaccepted and unsupported spans remain unchanged. Linked/noncontiguous/decoded citations can return `accepted-needs-adapter`; uncertain author spans return `accepted-needs-span`. Numeric reading output is withheld while unresolved original numbers could mislead; reviewed Markdown is still available.

A changed source, source-derived records, bibliography boundary, citation format, keyword, namespace or effective limits invalidates the old context. The protocol detects accidental staleness/tampering; it is not an authentication signature. Hosts must also check their own current document revision before applying any accepted edits, including after asynchronous lookups. The host owns undo, cancellation, record persistence, permissions and publishing. Apply text and reference-cache changes together in one editor transaction where possible.

## Limits and configuration

`limits` is an ordinary object, including one loaded with `JSON.parse`. Omitted keys retain defaults; values must be positive safe integers and unknown keys are rejected. The same effective settings participate in analysis and preview context validation.

| Key | Default |
| --- | ---: |
| `sourceCharacters` | 1,500,000 UTF-16 characters |
| `fileBytes` | 18,000,000 |
| `recordCharacters` | 300,000 serialized characters |
| `requestBytes` | 12,000,000 (CLI/server JSON intake) |
| `references` | 300 |
| `citationGroups` | 300 |
| `citedItems` | 900 |
| `candidateChoices` | 3,000 |
| `parallelLookups` | 4 reference jobs in the example host |
| `titleCharacters` | 1,500 |
| `authorsPerRecord` | 150 |
| `pdfPages` | 500 |
| `archiveEntryBytes` | 24,000,000 (also bounded by source characters × 12) |

These are protective budgets, not throughput guarantees. Provider lanes have separate response, queue and timing bounds. A host controls its own scheduling; `parallelLookups` is consumed by the example host rather than the low-level transport. Browser-only processing uses its local options. Optional server processing separately clamps requests to `CITATION_IMPORT_LIMITS` host ceilings.

## Provider completion and conflicting identities

Reference parsing currently recognizes explicit DOI text/links; other identifier kinds can be supplied through reviewed targets or records. Do not assume every identifier mentioned inside a review title identifies the reviewed work.

The headless import API does not start provider requests. Hosts may use `createBrowserEnrichment` for Crossref/Open Library discovery and resolution, then pass deliberately accepted `{recordId, record}` entries as `completions` during preview. Metadata cannot change the source-derived matching context. Authored fields remain intact; accepted identifiers and missing metadata are merged with provenance.

Use `assessImportCandidate` and `rankImportCandidates` to separate plausible works from reviews, chapters, notices and author/type conflicts. `importSearchTitle` removes only explicit trailing edition/reprint qualifiers for search, without editing the authored title. Ranking is heuristic, never acceptance. Strict article automation requires exact identity and a separate DOI resolution; books/ISBNs require an edition decision. A one-year difference is never automatically forgiven.

The example host keeps conflicting retrieved metadata red and out of conversion until an explicit **Use this identifier anyway** decision. Normal matching radios apply immediately. A pasted identifier without a supplied bibliography record remains an editor assertion, not a verified identity. An existing identifier can work offline; a provider failure is different from observed conflicting metadata.

If distinct imported references claim the same canonical DOI/ISBN, `import-conflicting-source-identifier` identifies the contested key/record IDs. The normalized records withhold that identifier from every claimant; their raw entries and field evidence are retained. No record receives arbitrary ownership or silently absorbs another reference.

## Native file extraction

This is a separate optional bundle, so ordinary parsing/compiling does not load PDF code:

```js
import { extractImportFile } from 'citation-inator/import-files';
const extracted = await extractImportFile(bytes, { filename: 'paper.docx' });
const analysis = processImportRequest({
  mode: 'document', source: extracted.text, style: 'auto'
});
```

In a browser, copy `citation-import-files.mjs`, its adjacent `citation-pdf.worker.mjs` and the license notices. Import `./citation-import-files.mjs`, or use `citation-inator/import-files-browser` with a bundler and configure `pdfWorkerSrc` to the copied worker URL. The page must permit the same-origin module worker under its CSP (`worker-src 'self'`). `File`, `Blob`, `Uint8Array` and `ArrayBuffer` inputs are accepted. No URL is fetched as a document input.

| Input | Working copy and limits |
| --- | --- |
| TXT / Markdown | Strict UTF-8; original bytes remain with the host. |
| DOCX | Main-document paragraphs; visible insertions retained, deleted text excluded. XML is namespace-aware; external entities/declarations are rejected. |
| ODT | Main-document paragraphs/headings, tabs and space runs; drawing/annotation material is excluded from body traversal. |
| PDF | Extractable horizontal text with page accounting. No OCR, rendering or execution of PDF scripts. Reading order needs review, especially columns, equations and tables. |

Native extraction returns a **text working copy**, not an edited native document. Range proposals address that working text, never binary offsets. Keep the original file for download/undo; native-format round trips are not supported. DOCX instruction fields, simple fields and ODT managed reference markers are retained as opaque `metadata.citationFields`; link targets stay in `metadata.links`. They are not converted into trusted records or sent to a manager. PDF rotated text and proposed sequential margin furniture remain recoverable in `metadata.excludedText`; diagnostics report their exclusion. Layout, images, tables and auxiliary office parts are not faithfully reconstructed as Markdown.

The result includes `format`, `text`, `sourceHash`, `original` filename/size, `metadata` and diagnostic codes. Cancellation accepts `signal`; stale results must still be ignored by the host. No document-linked files, remote relationships or external document resources are opened. Bounds cover file bytes, extracted text, office XML entries, metadata and PDF pages; oversize/unreadable material fails without replacing the host's prior document.

## JSON CLI

```sh
citation-inator import --file paper.docx > extracted.json
citation-inator import --json < analysis-request.json > analysis.json
citation-inator import --json < preview-request.json > preview.json
```

`--file` performs local extraction only. `--json` accepts one request object from stdin and returns the same API result. Use `--limits '{"fileBytes":24000000}'` to override intake bounds; request JSON can carry its own `limits`. Errors return one JSON `error` with exit status 1. The CLI never writes the manuscript, performs provider requests or applies editor changes.

## Host appearance and language

Hosts can render their own document decorations and review controls from the headless result. No citation-owned full-page CSS or DOM structure is imposed. The example host uses scoped classes; it is not yet a generic mountable editor component. Draft.inator agrees that the headless API is the 0.4.0 integration boundary; reusable styled views remain separate. Existing-site record reuse and host-assigned new record IDs remain integration requests before release. Comprehensive teaching demos and translation/i18n configuration are planned for 0.5.0; do not treat the current English diagnostic messages as a localization API. Stable diagnostic codes are the integration hook.

Crossref titles include supplied subtitles, decode text entities and remove formatting-only wrappers before identity comparison. Meaningful mathematical markup remains distinct; raw provider evidence is retained. Open Library discovery retries once with the main title when a subtitle query returns no works, retaining the author constraint and the same three-work/five-edition bounds. This widens suggestions without automatically accepting a book edition or changing the source title/year.
