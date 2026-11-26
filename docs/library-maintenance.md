# Bibliography files, metadata refresh and source review

These host APIs are available in 0.6.0-preview.4. Authors continue to describe sources and their use in cite blocks. A host handles file selection, review controls, network consent and saving. This module neither changes an editor nor writes to a reference manager.

```js
import {
  inspectBibliography, applyBibliographyImport,
  reviewMetadataRefresh, applyMetadataRefresh,
  checkSourceLink, reviewCrossrefNotices, applyNoticeReview
} from 'cite-inator/library';
```

For copied files use `./citation-library.mjs`, alongside its same-version `THIRD_PARTY_LICENSES.txt`. It is a separate self-contained optional module; existing reader/compiler pages do not need it. The bundle uses maintained Citation.js BibTeX/RIS parsers, parse5 and the existing cite identity/hash helpers. No worker, account, backend service or LLM is required for local inspection. Copied browser modules must be served over HTTP(S), including a local static server; file:// is not supported. The Node engine remains at least22.13.0.

## Writer workspace

The generated learning site includes `import/bibliography.html`, linked from Import → Bibliography. It presents these APIs as a local file/review workflow, with explicit browser storage, portable working copies, metadata field choices and permission-gated checks. Run `npm run build:learn`, then `npm start` and open `/site/import/bibliography.html`. The offline learning archive includes the same workspace. See the [corpus review](https://github.com/randal-cox/cite.inator/blob/codex/cite-0.6-zotero/docs/corpus-review-0.6.md) for measured fidelity and remaining limits. This interface does not connect to a private Zotero account or write to a Zotero library.

## Import a bibliography file

```js
const options = {format:'csl-json', siteCache};
const review = inspectBibliography(fileText, options);
// Show review.items (including each item.diagnostics), conflicts and siteMatches.
const result = applyBibliographyImport(fileText, review, {
  ...options,
  decisions: [
    {index:0, action:'import', recordId:'host-allocated-id'},
    {index:1, action:'reuse', siteRecordId:'existing-work'},
    {index:2, action:'skip'}
  ]
});
// Save result.cache with the article only after review.
```

Choose `csl-json`, `bibtex` or `ris` explicitly. CSL-JSON must be an array; a source file is text, not a path or URL. Parsing forces a local format and never resolves DOI/URL text. Input bytes/characters, record counts and field sizes use the existing configurable import limits. Manager IDs and raw notes are not portable record IDs; new rows receive temporary review IDs, then the host allocates stable public IDs on acceptance.

Every row needs exactly one decision. Invalid rows can be skipped or corrected, not imported. Lossy items require `acceptDiagnostics:true` after the host presents their diagnostics. BibTeX/RIS always carry a projection-review diagnostic: variants, macros, names, roles and unsupported fields can be interpreted differently by managers. This is supported interchange parsing, not a claim of lossless all-field conversion. Preserve the original file separately when its unsupported details matter.

`review.conflicts` exposes shared identifiers among imported rows. Do not delete identifiers to force a combination. Site reuse is restricted to proposed candidates and retains the site's curated record; it does not merge fields. New records must have distinct IDs and nonconflicting identifier ownership. Whole-cache validation rejects an unresolved combination. Duplicate input works can be explicitly reused or skipped. Source text, format, limits and site-cache changes invalidate the review and require another inspection.

## Refresh metadata without overwriting curation

```js
const review = reviewMetadataRefresh(currentRecord, incomingRecord);
// Present review.identity and every review.changes entry.
const result = applyMetadataRefresh(siteCache, incomingRecord, review, {
  confirmIdentity:true,
  decisions: review.changes.map(change => ({field:change.field, action:'keep'}))
});
```

A real host offers `keep`, `take` and `clear` for each changed field; the example keeps everything. The comparison is current versus incoming, not a three-way merge or an inference about which editor changed a field. An absent incoming value is visible as a proposed removal and is never automatically preferred. Stable record ID, curator provenance, integrity decisions, notes and article-specific text are retained. Accepted incoming fields add a source receipt naming those fields; arbitrary incoming source notes are not copied. Title formatting runs must continue to match their title.

Shared identifiers are identity evidence for review. Contradictory DOI/ISBN/PMID/PMCID sets block refresh and require a separate-work/identity resolution. A title or matching local ID alone cannot prove identity. Even a shared identifier requires explicit `confirmIdentity:true`; a record lacking identifiers can be reviewed as the same work by the editor. Validate such choices against editions rather than accepting the flag mechanically. Decisions are tied to both normalized snapshots and the configured limits, and the completed cache is revalidated for ownership conflicts. Saving remains host-owned.

## Observe a source link

```js
const observation = await checkSourceLink(record, {
  url: 'https://doi.org/10.1234/example',
  fetch: authorizedFetch,
  timeoutMs:8000,
  checkedAt:new Date().toISOString()
});
```

The URL must belong to this reference's identifiers or locations. Supplying `fetch` is required; this API never silently uses global fetch. A host obtains network consent and applies its origin/egress policy. Server transports must enforce their own network-address and DNS restrictions. No credentials or referring page are sent, and redirects are not automatically followed. The timeout bounds waiting even if an injected transport ignores cancellation; an uncooperative transport may continue its own underlying work, so it should honor the supplied signal too.

The result is an observation: `reachable`, `redirect`, `not-found`, `restricted`, `rate-limited`, `head-unsupported` or `indeterminate`. A 404/410 describes this URL at this time; it does not prove the work is unavailable. A successful HEAD does not prove that a PDF is readable, authentic, or the correct edition. Readable HTTP restrictions, rate limits, unsupported HEAD and timeouts have separate results. CORS and other network failures remain indeterminate transport errors; the browser cannot reliably distinguish them. The function does not remove a location, change integrity status or silently retry with GET. It returns the record hash, check time and requested URL for the host's inspectable history.

## Review correction and retraction evidence

```js
const review = reviewCrossrefNotices(record, crossrefNoticeEnvelopes, {
  checkedAt:new Date().toISOString()
});
// Show each review.proposals item and the original citation.
const result = applyNoticeReview(siteCache, crossrefNoticeEnvelopes, review, {
  action:'accept', proposalIndex:0
});
```

The host explicitly acquires Crossref metadata and supplies its envelopes. These functions do not fetch or authenticate that input. They verify the structural relationship: a separate notice DOI has a supported `update-to` relation targeting the exact DOI of the cited work. A notice relating to a different paper, or the cited record itself describing a notice, is not accepted as evidence against this work. Supported states are retraction, correction and expression of concern. Duplicate proposals are removed and the candidate budget is enforced.

Acceptance is explicit and bound to the current cited record, evidence and check time. It preserves the original reference and identifiers while recording the notice link/source and supplied check time in provenance. Multiple notices remain choices rather than an invented automatic ranking. Default `action:'retain'` preserves the prior editorial decision. No match cannot clear an existing warning, and this path does not handle same-DOI in-situ updates.

No supplied notice means only “no confirmed notice in this metadata.” Provider coverage and freshness are incomplete. On25November2026, [Crossref reported a Retraction Watch ingestion gap](https://status.crossref.org/); that incident illustrates why absence cannot certify a clean record. Check current provider status during live audits. [Crossref's update documentation](https://www.crossref.org/documentation/register-maintain-records/maintaining-your-metadata/registering-updates/) explains notice versus original-work direction; [its filters](https://www.crossref.org/documentation/retrieve-metadata/rest-api/rest-api-filters/) describe explicit update queries. These APIs make no exhaustive retraction-detection or scientific truth claim.

## Run the local example

In a clean source checkout, first run `npm ci` and install the dedicated browser with `npx playwright-core install chromium --only-shell`. Then:

```sh
node scripts/library-workflow-example.mjs
node --test test/library-maintenance.test.mjs
node test/library-browser.mjs
```

The example uses synthetic metadata and no network or file writes. It exercises import, export, a selected publisher refresh and explicit correction acceptance. The browser test uses Playwright's dedicated Chromium under strict CSP; no everyday Chrome is launched. These are library/fixture checks. Actual Zotero application import, authenticated draft/KR integration and final milestone approval remain separate acceptance steps.
