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

`selected.requiresReview` and `diagnostics` identify unsupported/lossy metadata before insertion. A valid local reference needs no DOI or ISBN. `state:'resolved'` means the selected bibliographic fields are available; it is not independent provider verification of identifiers. Unknown types, uncertain/range dates, name particles, unsupported creator roles and formatted titles carry review diagnostics rather than a lossless-conversion claim. Exact numeric CSL date strings are normalized; free-form text is not guessed into a year.

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
