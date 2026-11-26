# Zotero metadata handoff — 0.6 preview

This developer API converts a selected Zotero item into an offline bibliographic record. It does not connect an account, search a library, save an article or update Zotero. Draft owns those connection and editor interactions. Authors continue to write ordinary cite notation; they do not maintain reference JSON.

## Select, convert and review

Request the selected Zotero API v3 item with `include=csljson` (or `include=data,csljson` if the host needs additional editable metadata). The adapter accepts Zotero's per-item CSL export string or an already parsed single CSL item/one-item array. It does not copy native `data`, notes, personal tags, collection membership, abstracts or the CSL `id` into the portable record.

Node:

```js
import {fromZotero, reconcileZoteroItem} from 'cite-inator/zotero';
const selected = fromZotero(zoteroItem, {
  recordId: 'host-selected-work', // allocated by the host, not the author
  transport: 'web'
});
const proposal = reconcileZoteroItem(selected, siteCache);
```

Copied browser files:

```js
import {fromZotero, reconcileZoteroItem} from './citation-manager.mjs';
```

Copy that same-version module and its license notices. The module performs no network requests. Use `fromCSLJSON(cslItem, {recordId})` from the same entry for a selected item without a Zotero envelope. It is not yet a multi-item file parser.

`selected.record` is the only part intended for the portable citation cache. `selected.source` is host-side manager-address/version data; keep it outside reader caches, source text and exports. A separate object is not a secret store. Browser-local bindings are optional disposable acceleration state, never a prerequisite to saving source and records.

`selected.requiresReview` and `diagnostics` identify unsupported/lossy metadata before insertion. A valid local reference needs no DOI or ISBN. `state:'resolved'` means the selected bibliographic fields are available; it is not independent provider verification of identifiers. Unknown types, uncertain/range dates, name particles, unsupported creator roles and unsupported title markup carry review diagnostics rather than a lossless-conversion claim. Exact numeric CSL date strings are normalized; free-form text is not guessed into a year.

Structured `editors` and `translators` remain distinct from `authors`, and round-trip through `toCSL`. Edited books use editors for their citation byline without rewriting their author identity. Chicago author-date and APA have initial book/chapter role handling. Other presets emit `citation-creator-role-style-review-required` for these roles; full CSL/style conformance is not claimed. Software release version is `releaseVersion`, distinct from the existing publication-version category, and exports as CSL `version`.

HTTP or otherwise unsupported URLs require review under the current HTTPS-only link contract; the adapter does not upgrade addresses or claim a reading copy is open. Rich title markup is converted to safe text with a formatting-review diagnostic. No executable source markup is retained.

## Existing site records and collisions

`reconcileZoteroItem` returns candidate evidence using the existing import identity/edition policy. It does not merge records, write the cache or apply a binding. States are `new`, `candidate-review` or `id-collision`; `requiresReview` also carries metadata warnings. Allocate another stable ID or deliberately select a site identity when required. Similarity is a proposal, not proof.

Multiple selected items may claim the same DOI/ISBN. Each can be inspected separately, but do not combine them into a cache that gives the identifier multiple owners. Present the conflict and make an explicit reuse/identity decision. Do not silently assign the identifier to the first item or strip it from the others.

After an accepted choice, use canonical marker helpers and save the source plus reference snapshot atomically. A typical author result remains:

```text
{cite host-selected-work locator:12}
```

Cancel/Undo, cursor revisions, save recovery and cache lifetime belong to the host. No first-loop integration acceptance is claimed by this API alone.

## Local version boundaries

For local metadata, pass `transport:'local'` and the real `serverId` when provided. A client without that header needs a session-scoped `connectionId`; the returned source marks `versionComparable:false`. Do not compare those versions across sessions, machines or the web API. No simulated server identity is generated.

The connected test machine runs Zotero 9.0.4, whose enabled API supports local application reads but rejects ordinary browser-origin reads. A direct hosted-browser connection is therefore not supported by that observed setup. No origin/security bypass or local bridge has been introduced. Hosted Web API search remains draft's first-prototype route; private authentication and second-session onboarding still need host verification.

## Reproduce bounded evidence

```sh
node scripts/probe-zotero.mjs https://korazonresearch.org/
node --test test/zotero.test.mjs
node test/zotero-browser.mjs
node scripts/check-zotero-library.mjs /private/path/selected-items.json
```

The connection probe reads only a public item template and local service root, uses a dedicated managed browser and tests a deliberately invalid key. It never accepts credentials or reads library items. Its two fresh browser contexts establish public CORS/error behavior, not authenticated daily-use acceptance.

The library probe reads a caller-supplied response containing selected bibliographic items and prints aggregate counts only. Its transient `probe-*` IDs are measurement IDs, not persistent work identities. Keep private input files outside the repository and web-served paths.

On 25 November 2026, the authorized BEST collection supplied 34 items: 26 articles, 7 books and 1 software item. All rendered individually in Chicago/APA; 3 editor arrays matched their CSL source after normalization/export. Eight records required review: 7 unsupported URLs and 2 formatted titles (one overlap). One shared-identifier group prevents an unreviewed aggregate cache. This is a mapping/field-preservation rehearsal, not a claim that the library is bibliographically correct, all formatting is faithful or draft has adopted the adapter. Real data and identifiers were not committed.

Sources: [Zotero API basics](https://www.zotero.org/support/dev/web_api/v3/basics), [local API](https://www.zotero.org/support/dev/web_api/v3/local_api). The installed 9.0.4 server implementation and actual browser requests were also inspected; newer local versions may behave differently.

## Replacing a work: shared option policy (preview.2)

Import `citationOptionPolicy` and `CITATION_OPTION_POLICIES` from `cite-inator/tools`, the tools browser module, compiler browser module or manager module. All use the same definition. This helper classifies options; it neither rewrites a marker nor decides whether two identifiers describe the same work.

```js
const policy = citationOptionPolicy('locator');
// {known:true, action:'review', category:'source'}
```

| Action | Fields | Host behavior when the work changes |
| --- | --- | --- |
| retain | form, isolated | Keep the presentation setting |
| recompute | note | Generate the note from the new target |
| replace-fallback | unresolved | Remove the old work’s fallback; use the new target’s own wording if it is unresolved |
| review | locator, label, prefix, tags and all author-field assertions | Offer explicit keep/change/remove; do not transfer silently |
| review | Every unknown field | Conservative default; no guessed semantics |

Pass an option name without a colon. Pass `null` for the bare legacy display fallback. Returned policy objects and the known-field table are immutable. `known` describes this policy vocabulary, not whether a marker using the field parses. For example, future `quote` currently receives unknown/review; this does not implement quote notation.

The source field list derives from the same `authorFields` definition used by the grammar. Use the function for unknown-field fallback rather than treating the table as an exhaustive future grammar. Apply it only to an actual work replacement. A note refresh, alias spelling change or same-work edit must retain the existing round-trip behavior.

## Bibliography files

To take a manuscript’s references into another manager, use the Playground’s Bibliography format control and Download bibliography button. It includes cited works and explicit further reading, once per work; unused cached records are excluded. Downloads stop while edits are awaiting compilation or the preview has an error.

Host integration:

```js
import {exportBibliography} from 'cite-inator/bibliography';
const file = exportBibliography(compiled.cache, {format:'bibtex'});
// file.text, file.extension, file.mimeType, file.recordCount, file.diagnostics
```

The function is also exported from tools/manager and their self-contained browser modules. It accepts a citation cache, not a compiled-result wrapper or a Zotero envelope. Pass the compiler’s returned cache for the document’s selected works. Passing a whole library cache deliberately exports that entire cache. Serialization performs no fetches, file writes, Zotero updates or record merges.

Formats are `csl-json` (default), `bibtex` and `ris`. Output preserves cache order and record IDs. CSL-JSON retains structured editors/translators, original and edition dates, software version and supported title emphasis. BibTeX/RIS have narrower field models: unsupported types, roles, dates, formatting and additional identifiers produce diagnostics identifying the affected record and field. Generic theses use a BibTeX misc fallback; no degree is inferred. Unicode is retained, so BibTeX consumers need UTF-8 support. The complete title is case-protected in BibTeX. Corporate-name structure in BibTeX, and corporate/suffix names in RIS, can vary by importer; test important names in the receiving application.

Explicit work URLs are retained alongside DOI fields. Only the first identifier per scheme is serialized; additional values are diagnosed. Custom-formatted reference text is not a substitute for structured fields and is diagnosed when omitted. Editorial notes, occurrence text, quote excerpts, topic tags, abstracts, access preferences and manager envelopes are excluded. Record IDs and bibliographic URLs are public export fields: hosts must allocate portable IDs, not private library addresses. This is interchange export, not lossless project backup or synchronization.

Diagnostics contain codes, record IDs and optional field names. Hosts must present them when offering files. The Playground reports the number of downloaded references and directs readers to Diagnostics when details could not be preserved. `export-incomplete-record` marks unresolved/titleless records, `export-record-review-required` marks partial records, and `export-custom-reference-omitted`, `export-additional-identifiers-omitted`, `export-type-fallback`, `export-field-omitted`, `export-contributor-detail-omitted`, `export-title-formatting-omitted` and `export-creator-role-reader-dependent` identify known format restrictions.

Independent Citation.js 0.9.0 BibTeX/RIS parsers have checked synthetic title, creator, chapter, edition, date and identifier round trips, including hostile field contents. This is parser evidence, not a live Zotero import receipt. Actual Zotero application import remains an acceptance step; no test writes to the maintainer’s library.

## Formatted bibliographic titles

Selected CSL titles and container titles retain italic/bold runs from `i`, `em`, `b` and `strong` tags without attributes. Searchable `title` and `containerTitle` remain plain text; optional `titleParts` and `containerTitleParts` contain text/emphasis data whose concatenation must match that text. A title override invalidates mismatched runs. Reader HTML is generated and escaped from those runs, never copied from source HTML. Whole-title italics reverse source italics; a bold run inside an italic title keeps both styles. This is generated reference metadata, not extra JS for article authors.

Attributes, other tags and mixed nested emphasis require review and fall back to safe plain text. CSL export reconstructs supported markup; BibTeX/RIS export plain titles with a formatting-loss diagnostic. Explicit APA title or Vancouver abbreviation overrides retain their own plain text rather than applying mismatched runs. Custom citationParts/citationText remain deliberate complete-reference overrides.
