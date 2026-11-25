# Reviewed import API · 0.4.0

The Node/browser import API and native extraction are included in 0.4.0. The headless host contract is agreed and accepted by draft.inator. Published 0.3.0 artifacts do not include import.

## Load the library

Node requires 22.13 or later. With the current `cite-inator` preview package (the original 0.4.0 release uses the `citation-inator` name):

```js
import { processImportRequest } from 'cite-inator/import';
```

For a browser without npm, copy `dist/citation-import.mjs` and `dist/THIRD_PARTY_LICENSES.txt` from the same release:

```js
import { processImportRequest } from './citation-import.mjs';
```

The import bundle is self-contained and has no required UI, network request, storage or framework. Bundlers can use `cite-inator/import-browser`. The demo is one host of this API; its full-page layout is not required in another editor.

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
console.log(result.source); // Markdown with a {cite ref-...} marker
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
import { extractImportFile } from 'cite-inator/import-files';
const extracted = await extractImportFile(bytes, { filename: 'paper.docx' });
const analysis = processImportRequest({
  mode: 'document', source: extracted.text, style: 'auto'
});
```

In a browser, copy `citation-import-files.mjs`, its adjacent `citation-pdf.worker.mjs` and the license notices. Import `./citation-import-files.mjs`, or use `cite-inator/import-files-browser` with a bundler and configure `pdfWorkerSrc` to the copied worker URL. The page must permit the same-origin module worker under its CSP (`worker-src 'self'`). `File`, `Blob`, `Uint8Array` and `ArrayBuffer` inputs are accepted. No URL is fetched as a document input.

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

Hosts can render their own document decorations and review controls from the headless result. No citation-owned full-page CSS or DOM structure is imposed. The example host uses scoped classes; it is not yet a generic mountable editor component. Draft.inator agrees that the headless API is the 0.4.0 integration boundary; reusable styled views remain separate. Existing-site record reuse and host-assigned new record IDs are implemented; draft has integrated and accepted these APIs; final release-file re-vendoring is separate. Comprehensive teaching demos and translation/i18n configuration are planned for 0.5.0; do not treat the current English diagnostic messages as a localization API. Stable diagnostic codes are the integration hook.

Crossref titles include supplied subtitles, decode text entities and remove formatting-only wrappers before identity comparison. Meaningful mathematical markup remains distinct; raw provider evidence is retained. Open Library discovery retries once with the main title when a subtitle query returns no works, retaining the author constraint and the same three-work/five-edition bounds. This widens suggestions without automatically accepting a book edition or changing the source title/year.

Native PDF extraction accepts Node Buffers as byte arrays without changing caller bytes. Repeated edge footers containing a consistent page/total fraction can be excluded after matching the actual page number, document total and repeated prefix on at least three and half the pages; excluded text remains in metadata. A bare wrapped year continues a numeric bibliography entry before record-limit enforcement.

Explicit DOI text can cross a single line break in the resolver prefix (`https://` / `doi.org/` / `10.…`) or at a supported punctuation boundary within the identifier. Recovery is bounded to four continuations and requires DOI-shaped evidence; arbitrary whitespace is not removed. Metadata labels, reference labels, ordinary prose and ambiguous bare numbers are not appended. Numeric-only continuations are restricted to zero-leading suffix segments after a numeric segment. Unsupported fragments remain withheld with `import-wrapped-identifier-review-required`; recovered proposals use `import-wrapped-identifier-recovered` and `explicit-doi-line-wrap` evidence with `exact: false`. Original text and source ranges remain available. Recovered values appear in `referenceRecords[].identifierProposals`, separate from exact `identifiers`; they are not promoted automatically into the portable cache or canonical markers. They remain local until accepted completion metadata or an explicit manual identifier decision. The demo resolves them directly but keeps them orange until accepted. Syntactic recovery does not establish work identity; provider conflict checks and editorial choices still apply. Markdown autolinks cannot restore a withheld partial identifier.

Common numbered journal references now propose compact personal bylines, institutional bylines, title, journal, year, volume, issue and pages/article number from an explicit `year;volume(issue):pages` tail. `et al.` sets `authorsComplete: false`. Multiple title/journal boundaries carry `import-reference-title-boundary-review-required`; the type stays generic to prevent automatic identity approval from an uncertain split. Unsupported book/report/web fields and unusual bylines remain raw/partial, with coded diagnostics. Accessed dates are not treated as publication years. The [updated public PDF audit](https://github.com/randal-cox/cite.inator/blob/codex/citation-import/docs/evidence/import-plos-0294391-2026-11-23.json) separates canonical reference-field accuracy from native PDF hyphenation differences and records 15 exact DOI records plus 12 recovered proposals against all 27 publisher DOI values. This is one regression sample, not a general accuracy guarantee.

<a id="reuse-site-records-and-choose-new-ids-040-preview"></a>

## Reuse site records and choose new IDs (0.4.0)

Pass `siteCache`, a normal cite.inator cache, to analysis and preview. Source bibliography matches remain separate from site identity proposals. Analysis returns `siteMatches`: one `{ recordId, candidates }` entry per imported reference. Each candidate has the site record ID, title, evidence and `requiresReview: true`. Look up full metadata in the cache you supplied. Shared canonical identifiers or compatible bibliographic evidence produce proposals; neither automatically reuses a work. Matching main titles may propose a site work whose subtitle, type or given-name spelling differs, provided author and year evidence remains compatible. `evidence.mainTitleMatch` reports title agreement and `evidence.differences` lists differing fields (`title`, `authors`, `type`). Read their full values from `referenceRecords` and the supplied site cache; the full candidate assessment remains unchanged. This broader site proposal rule does not relax provider identifier verification.

```js
const context = { mode: 'document', source, style: 'apa', siteCache };
const analysis = processImportRequest(context);
const sourceId = analysis.referenceRecords[0].id;
const proposedSiteId = analysis.siteMatches[0].candidates[0].recordId;
// After the reader accepts that proposed site identity:
const result = processImportRequest({
  ...context, action: 'preview',
  review: analysis.review, reviewId: analysis.review.reviewId,
  decisions: [{ citationIndex: 0, action: 'accept', targets: [{ recordId: sourceId }] }],
  recordDecisions: [{ recordId: sourceId, siteRecordId: proposedSiteId }]
});
```

A source identity decision applies consistently to all accepted mentions of that imported reference. It cannot name an arbitrary unproposed site record. The returned cache preserves existing site metadata and includes the full supplied site cache, plus new source records. The original bibliography stays in the source; reusing a work does not overwrite site fields from a partial imported reference. Declining reuse leaves the source as a separate work. Existing site records retain canonical identifier ownership if a new work shares an identifier; the new record retains a provenance note rather than creating an invalid duplicate-identifier cache.

For new records, pass a JavaScript `recordId(record, { taken })` allocator to preview. It receives a copy of the normalized record and a read-only array of existing site/previously allocated IDs. Return a valid local record ID; duplicate, invalid, asynchronous and non-string results fail before edits are returned. Allocators may be called for uncited source bibliography records too, since the portable cache retains that bibliography. Callbacks are ordinary host code: keep them pure; external side effects are outside the library's transaction.

```js
const result = processImportRequest({
  ...previewRequest,
  recordId(record, { taken }) {
    const base = slugForYourSite(record); // Your own naming convention.
    let id = base, n = 2;
    while (taken.includes(id)) id = `${base}-${n++}`;
    return id;
  }
});
```

For JSON/CLI callers, use `recordIds: { [sourceRecordId]: 'your-new-id' }` instead. Omitted new IDs keep their source IDs if available; keys for unknown or reused records fail. Choose either `recordId` or `recordIds`. Explicit site reuse bypasses new-ID allocation. Source and manual-completion IDs must be distinct before allocation. Manual completion records also pass through the allocator; their explicit DOI/ISBN targets remain canonical notation. Record-ID targets use the allocated/reused local ID even when metadata has a DOI. The API handles notation escaping; hosts should not rewrite markers afterward.

Preview adds `recordMap` (source/completion ID to output ID), `newRecordIds` and `reusedRecordIds`. The returned `cache` can contain the existing site library and every source entry, including uncited works. `newRecordIds` identifies allocated additions, not a cited-only save set. Preserve the original site library and persist only additions referenced by accepted final markers; re-evaluate that set at save time after Undo or later deletion. Do not persist the whole preview cache as a replacement site library. Naming options are preview-time choices; identity review stays bound to the source, original proposals and the entire supplied site cache. Changing any site metadata invalidates the review. Hosts must still check the live editor revision and apply text/records together. Site cache size uses `limits.references`; returned identity proposals use `limits.candidateChoices`.

## Identifier evidence and canonical fields

Recovered `identifierProposals` are withheld from `identifiers`; merely selecting the bibliography entry does not promote them. An accepted completion or explicit identifier decision can supply canonical identifiers. However, an intact DOI extracted directly from the supplied bibliography can already appear in `identifiers` without a provider lookup. The field identifies the record's retained identifiers; it is not an independent verification certificate. Hosts that require provider verification must inspect source/provider evidence and require the corresponding review before saving. Do not equate a syntactically exact source identifier with a confirmed title/edition match.

## Additional author-date import forms

- `(Bell, 1992, 1997)` and `Bell (1992, 1997)` produce one group with one item per year. Year letters such as `(Cox, 1995a, 1995b)` stay attached to their items. Original/edition slash years retain their separate meaning.
- Recognizable institutional bylines are literal authors in APA/Chicago references. Organization words and common connectors support forms such as World Health Organization and Department of Health. This is heuristic coverage, not recognition of every institution. Inferred acronyms such as WHO yield reviewable candidates, never a unique automatic selection.
- `(Turner, 1969, as cited in Bell, 1992)` proposes Bell as the work actually read, retains Turner and the secondary relationship in the prefix/`secondarySource`, and reports `import-secondary-source-review-required`. A single candidate still needs a deliberate choice. This preserves the relationship; it does not establish that the secondary source supports the claim.
- Balanced citation-like parentheses containing an unrecognized year form produce `import-unparsed-author-date` with source offsets. Markdown/HTML excluded regions and existing configured-keyword markers remain excluded. This is a cue for review, not an exhaustive detector: unclosed parentheses and every possible house style are outside this pass.

The optional shared match-to-actions helper and structured pending-format preview response remain follow-ups. Preview still throws when citation format or bibliography boundary needs a choice; use the analysis flags before requesting it.

## Identifier spelling and narrative groups

New local identifiers use the shortest safe form by default: `{cite bell-1992-ritual}`. Set `identifierForm: 'explicit'` on `processImportRequest` or `planImportEdits` to write `{cite local:bell-1992-ritual}` instead. Reserved directive names stay explicit in either mode. Other identifier schemes keep their prefix. Existing source markers are left alone.

`formatRecordId(id, { citationKeyword, identifierForm })` is exported from both import entries (Node and browser) and the tools entries. Use it when creating or retargeting local markers; pass a cache record ID, not an already prefixed identifier. See [the shared writing rule](article-tools.md#write-local-record-ids-040-preview) for validation and grammar compatibility.

Narrative groups can contain multiple narrative items, such as `{cite bell-1992 | form:narrative; bell-1997 | form:narrative}`. Each item retains its own identity, affixes and narrative form. The compiler renders them as separate narrative references joined by a semicolon, without an outer pair of parentheses. Mixed narrative/parenthetical groups remain malformed. Import preview re-scans the encoded group before returning any edit.
