# Zotero integration: implementation plan and critical review

Status: revised after a fresh-agent critical discussion, 25 November 2026; Randal subsequently endorsed the modest loop and authorized feasibility work; the first adapter preview is implemented with the limits below. The API sketch below is planning context; see the [adapter guide](../zotero.md) for the implemented preview interface. No final release or connected-editor acceptance is claimed. Section 17 records what changed after criticism. This is the authoritative current plan; milestone status belongs in the milestone record.

## 1. Outcome, scope and exclusions

Randal keeps Zotero as his library. While writing in draft, he opens Cite, searches that library, chooses a work and locator, and inserts an ordinary cite marker. The saved article contains enough bibliographic data to render when Zotero and the network are unavailable. Reusing a work is easy. Library updates do not erase site curation, article-specific assertions or edition choices.

The first usable deliverable is one complete selection-to-save loop, not a comprehensive synchronization system. It comprises a limited metadata adapter in cite and a read-only connection/picker in draft. A first-person rehearsal with a real library and real paragraph is the integration acceptance test; fixture tests alone establish only library behavior.

First-loop completion criteria:

1. Connect to one explicitly chosen library without publishing its credentials.
2. Search for a known work and see enough author/title/date/edition information to choose it.
3. Choose one work, add a page locator, and insert a normal marker using the site's configured keyword.
4. Save source and reference snapshot coherently. Manager bindings are optional disposable acceleration state; failure to save them does not block a valid article save. Cancel writes no article/reference data; Undo has a defined scope.
5. Reload offline and render that citation and its reference correctly.
6. Insert the same unchanged work again on the same browser, including after reload, without a duplicate reference or redundant identity interrogation. Explicitly test the cache-cleared fallback; cross-device no-ID reuse is not guaranteed without a durable binding.
7. Reuse an existing site work when deliberately matched; report uncertain or conflicting identities. When replacing an existing citation’s work, preview the disposition of all source-dependent options instead of silently transferring them.
8. Disconnect or revoke access without breaking already saved articles.

Not in the first loop: whole-library mirroring, background writes to Zotero, automatic local/web failover, a new local service, desktop citation-dialog integration, attachment ingestion, OCR, footnote-style manuscript import, annotation extraction, AI work or a separate write.inator product.

The wider agreed 0.6 milestone still includes interchange files, bibliography export, reviewed refresh, link maintenance and source-integrity notices. Starting with Zotero does not silently remove those commitments. Quote support is agreed in principle but not yet implemented. Direct connectors for other managers are deferred; files remain the interoperability route.

## 2. Current state and evidence

- cite 0.5.1 is released at `1bbee6573fc0fdf10deca9fccd6e59ea175a7f6a`. Draft verified the release tarball and merged PR43; coordination issue33 is closed as verified.
- A separate matched-placeholder extension exists at `13caf74`, with planning additions at `fc92520`. Its 352 tests pass on current and minimum Node. Draft has not yet reported adopting that extension; issue34 remains open for it.
- The working branch `codex/cite-0.6-zotero` starts from release-receipt commit `25ee2d8`. Its uncommitted preparation changes preview metadata and carries forward the already-reviewed placeholder source changes. There is no new Zotero adapter, network client or connected library yet. Generated assets have not been rebuilt for these preparatory edits.
- `src/records.mjs` provides normalized portable records, stable local IDs, persistent identifiers, cache construction and per-record `toCSL`. It does not provide complete CSL-JSON/BibTeX/RIS bibliography exporters or manager file parsers.
- `src/import-sites.mjs` proposes existing-site candidates and allocates records from explicit decisions. It already carries edition/author/year assessment, rejects collisions and preserves site records. It was designed for document imports, not established manager bindings.
- Existing marker formatting, descriptions, configured-keyword grammar and offline compiler should be reused. Authors should not maintain aliases or edit reference JSON manually.
- Draft's current data contract provides DRAFT_WORKS and Cite-block marker editing. Its issue40 identifies addWorks, onRecords, picker and staged-save seams. The exact transaction required for adding private manager state still needs a fresh adopter verification; do not equate existing source/cache staging with proven three-part persistence.
- No credentials or private Zotero content have been accessed. A public item-template HTTP probe returned200 and CORS headers allowing the test Origin, API-key/version headers and exposed pagination/version headers. This is evidence for that endpoint only, not an authenticated browser or OAuth integration test.

## 3. What Zotero makes possible

Official Web API v3 supports library/collection/item reads, structured metadata, search, exports and change versions. Its default search is title/creator/year; `qmode=everything` can include indexed full text. A full-text result is attachment-derived indexed content, not proof of complete PDF text or an exact quoted passage. Saved-search definitions exist on the web API, but execution is a local-API capability.

Public libraries permit unauthenticated reads. Private libraries need an API key. Zotero documents OAuth1.0a key exchange using registered client credentials; the resulting user key is used for ordinary API requests. Do not assume an OAuth2 PKCE flow or embed a client secret into a static browser bundle.

The desktop local API can expose local, unsynced content and operates offline after the user enables it. Zotero 10+ local object versions are scoped to that instance and expose a server ID; older clients need an explicit conservative policy when that identity evidence is absent. They are not comparable to web versions. Browser-to-localhost behavior must be tested in the actual hosted draft origin and browser; a successful shell request would not prove it.

Source references: [Web API](https://www.zotero.org/support/dev/web_api/v3/basics), [item types/fields](https://www.zotero.org/support/dev/web_api/v3/types_and_fields), [OAuth](https://www.zotero.org/support/dev/web_api/v3/oauth), [local API](https://www.zotero.org/support/dev/web_api/v3/local_api), [full text](https://www.zotero.org/support/dev/web_api/v3/fulltext_content), [interchange formats](https://www.zotero.org/support/dev/data_formats). These describe capability; they do not establish our implementation acceptance.

## 4. Responsibilities and integration shape

| Concern | cite | draft / host |
| --- | --- | --- |
| Bibliographic conversion | Pure adapter, supported-field matrix, diagnostics | Supply only selected item data |
| Identity and editions | Candidate evidence, conflicts, diff, portable snapshots | Present meaningful choices and preserve accepted decisions |
| Connection | No required network client in first slice | Web transport, library selection, permissions, credentials, disconnect |
| Search | Receive selected results; avoid provider-specific UI assumptions | Query, debounce, cancellation, pagination, keyboard results |
| Citation writing | Canonical marker helpers and rendering | Cursor/selection, Cite dialog, grouped citations, one transaction |
| Manager bindings | Define source/target identity semantics; no private-store requirement | Persistent browser-local disposable cache, never required for rendering or saving |
| Persistence | Return proposed data, never save the article itself | Source+records are the durable transaction; binding cache is best-effort |
| Refresh | Field-level proposed diff and identity warnings | Review UI, field choices, commit, ignored-change state |
| Bibliography downloads | Reusable serializers, own Playground demonstration | Editor buttons, manuscript selection, file downloads |
| Quotes | Occurrence notation/rendering/export rules | Capture/edit, effective visibility, private source/storage policy |

No unilateral draft edits. Coordinate exact proposals and adoption through labelled issues. Extract a shared transport adapter only if a second host needs it; it is not a prerequisite.

## 5. Connection alternatives: decision before UX commitment

A. Web API with a dedicated read-only key entered by the writer. Smallest static-host-compatible prototype. Session-only retention is the initial proposal. Avoid URL query keys and export/log leakage. Disadvantages: key creation is cumbersome; browser-origin script compromise can access a key available to that origin. Browser storage is not a secret vault.

B. Web API with OAuth-based Connect Zotero. Better potential onboarding, but investigate Zotero registration and secret handling with draft. A trusted callback/credential exchange may require host infrastructure. Do not build a new service merely to make the demo elegant; record its ownership, hosting and maintenance cost first.

C. Local API. Useful for unsynced/offline work and may avoid web-account setup, but requires desktop Zotero running, opt-in local access and viable hosted-browser permissions. File URL redirects do not imply that a web page can open/read attachment files.

D. Import a Zotero-exported file. No account or key flow and works offline. It proves conversion and selection, but is not acceptance of the requested rapid live-library picker.

Revised sequence: perform a bounded feasibility comparison of Web API and explicitly enabled local access in the actual draft origin, then select ONE first connection route. Include a second writing session: a key that works once may still make daily use cumbersome. Public-template testing requires no private library; a selected private-library rehearsal follows explicit connection. Prefer a dedicated session key for a bounded web prototype, but do not declare it the shipping onboarding before this comparison. No new OAuth service, full-library mirror or automatic failover is implied. Preserve file import as fallback, without mislabelling it live integration.

Connection state model: disconnected → connecting → connected; connected may become offline, permission-denied, revoked, rate-limited or unsupported. Saved references are independent of that state. Distinguish wrong library, insufficient scope and empty results where evidence permits; do not expose a forbidden item's existence by guessing.

Minimal request family, not a final client implementation:

- Public template/schema request for mapping validation.
- Library metadata and optional group list to identify the chosen library.
- `<library>/items/top?q=...` for top-level bibliography items; collections optional in the first UI.
- `<library>/items/<key>` for a fresh selected snapshot if needed.
- Later, versions/conditional requests for the subset actually cited.

Use API v3 explicitly, request only necessary representations and fields, honor pagination, cancellation and Backoff/Retry-After. A stale result must not replace a newer query or insert into a changed document. Do not scan notes, attachment bytes or full text to satisfy a normal citation search.

## 6. Metadata adapter alternatives and fidelity

There are two credible initial representations:

1. Native Zotero data → cite record, with a small explicit type/field mapping. Direct control and easy source identity retention; risks duplicating Zotero's CSL mapping and mishandling dates/roles.
2. Ask Zotero for CSL-JSON plus item identity, then use a general CSL-JSON → cite adapter. Reuses Zotero's mapping and helps interchange imports; risks relying on a response envelope not yet probed, losing manager-only edition/provenance fields or expanding the first task into a general CSL engine.

Revised recommendation: use Zotero-generated CSL-JSON as the first bibliographic input, with a thin manager-identity wrapper. The documented `include` parameter supports requesting data and CSL-JSON together; authenticated browser response details still need verification. Project through an allowlist into ONE portable bibliographic model, not a parallel raw-CSL truth store. Native fields supplement only identified gaps. This also supplies a reusable basis for the later CSL-JSON file route without requiring a full CSL engine.

Fields to exercise explicitly:

| Case | Required handling |
| --- | --- |
| Journal article | Title, ordered creators, date, journal, volume/issue/pages, DOI |
| Book | Title, authors/editors, publication year, publisher/place, edition, ISBN variants |
| Chapter | Chapter author/title distinct from container editors/book title; pages and edition retained |
| Report / thesis | Institution/type/number where supported; no article-shaped invention |
| Dataset / software | Version distinctions retained or reported unsupported; release identity must not become book edition |
| Corporate creator | Literal name, not split into invented given/family fields |
| Edited/translated work | Preserve roles; never silently turn an editor into the original author |
| Unusual / undated date | Retain literal source date and uncertainty; do not turn accessed/modified date into publication year |
| Missing DOI/ISBN | Valid selectable local work, not forced identifier invention or empty lookup |
| Multiple identifiers | Retain safe aliases but expose incompatible edition/work identity; do not infer that all ISBNs describe one edition |
| Rich titles | Decide supported emphasis/subscript/superscript representation; no execution of source HTML |
| Unsupported type/field | Stable diagnostic and preserved selected evidence; no silent claim of lossless import |

Do not interpret private `extra` text as a source of arbitrary identifiers/claims by default. If Extra support is needed, use documented field semantics and named supported keys. A notes/annotation/attachment item is not itself an ordinary article reference.

The portable model currently collapses non-author roles into generic contributor text, including in toCSL. Merely choosing CSL input does not repair that loss. Add the smallest structured creator-role/date support required by3–5 realistic writer fixtures. Include an edited/translated book and a chapter in rendering acceptance, alongside an ordinary article. Retain one model and test its normalization→render→export behavior; do not promise all CSL types. Dates before1000 remain a documented boundary unless a relevant fixture makes them necessary. Avoid requiring an author to hand-correct JavaScript to restore source facts.

## 7. Proposed API seam and data separation

Names below are reviewable sketches, not an API promise:

```js
const selected = fromZotero(item, {
  library: {type: 'user', id: '12345'},
  transport: 'web',
  recordId: 'host-chosen-record-id'
});
// {record, source, diagnostics}
const proposals = reconcileZoteroItem(selected, siteCache, {bindings});
const diff = compareForRefresh(currentRecord, selected.record);
```

`record` contains selected public-facing bibliographic facts. It excludes keys, library membership, connection credentials, personal tags, private notes and unrelated child records. Provenance can say it was selected from Zotero without putting a private library URL into reader assets.

`source` is a host-side manager-address wrapper: library type/ID, item key, transport/version partition and local server identity when applicable. It is not a second bibliographic truth store and contains no credential. The first loop uses a persistent browser-local binding from that address to the chosen stable site record ID, with only enough consistency evidence to detect radical identity/edition drift.

The binding cache is deliberately disposable for article correctness. It survives an ordinary same-browser reload, but storage rejection, cache clearing or another device may require reconnection and deliberate matching again. Citation Save must succeed if this cache write fails. Do not include source/library identifiers or cache data in reader exports by default; acknowledge that browser-local storage is not a secure secret vault and that the host still needs an explicit credential policy.

No private durable project store is required. Do not invent an encrypted Git sidecar or new storage service for this loop. A JSON sidecar in a public repository is public. Durable cross-device bindings or opt-in public provenance are separate product decisions, not necessary conditions of offline citation rendering.

Record ID policy is also open. Avoid minting a new Zotero-key identity system in author text. Reuse the site's chosen record ID when possible. For new works, compare DOI-first notation, host-allocated stable local IDs with identifier aliases, and a transient adapter ID. Item keys are manager addresses, not global work identities. A work without a DOI still needs a durable local identity.

Do not hash private identifiers and call them secret. Hashes can provide stable opaque IDs; they do not establish confidentiality or prevent source identity guessing.

## 8. Identity, Already cited and duplicate handling

Separate three questions:

1. Is this the same manager item in a known library/instance?
2. Does it describe the same bibliographic work and edition as a site record?
3. Has this manuscript already cited that record?

Known accepted binding + unchanged snapshot: offer immediate reuse with no repeated matching dialog. Already cited is a manuscript property, not merely an item existing somewhere on the site. It should be derived using canonical marker classification and identifier aliases, not string searches.

Exact DOI/ISBN/PMID overlap gives strong candidate evidence but cannot override observed edition/type/identity contradictions. Title/author/year resemblance is a review proposal, never an automatic merge. A DOI for a review of a book is not that book's identity. An ISBN is edition-specific evidence; different ISBNs may be formats of the same edition or different editions, requiring a documented policy.

One manager item may already map to a site record whose current fields differ because of site corrections. Reuse can preserve that record without applying source changes. A newer manager version should not force a refresh in the insertion path; a clear optional update action can show differences.

Handle ambiguous duplicates, record-ID collisions, manually removed records, deleted/restored Zotero items, group vs personal-library copies and a moved/recreated item. No silent rebinding. The first loop need not solve automatic cross-library deduplication.

The existing importSiteContext/allocateImportRecords mechanisms are candidates for reuse. Reconciliation should use their evidence and collision rules without blindly inheriting every document-import question or its source assumptions. Extending them is preferable to making a second contradictory identity authority.

## 9. Review and refresh: later than first-loop acceptance

Defer source-refresh application until insertion, Save, reload and repeated use are accepted. Repeated selection can keep the existing site record and offer an optional “saved reference differs” comparison; it must not force a field-administration dialog on every citation. Manager-item address reuse never silently applies incoming fields.

The first review mechanism should be an explicit two-way current/incoming diff, preserving current values by default and requiring intentional field choices. It can show differences but cannot infer who edited which value. Identity/edition contradictions precede a normal field update. Missing incoming values, deleted identifiers and reordered creators are material, not no-ops.

Only build three-way refresh after a real curator workflow justifies it. A last-observed source snapshot, last-applied field values, current site state and ignored decisions are different things. A single “accepted version” does not define a merge base after some fields were rejected. A publication-safe bibliographic baseline may eventually live with the public record without manager keys, but that is not a prerequisite now.

When refresh is implemented, bind its decisions to the actual source/site revisions, recompute stale proposals and leave saving available during provider failure. Review source and site changes rather than silently choosing either. Never conflate item version, library version, publication edition and software release version.

## 10. Writer UX and transactions

Reuse draft's existing Cite dialog. A writer sees This site / Zotero selection, search results, a selected-work summary and normal locator/form controls. Preserve keyboard type/arrows/Enter behavior and existing grouped-marker editing. Do not make connection setup reappear for every citation.

Avoid a fixed promise of instantaneous network search. Show useful progress, retain prior results while updating where safe, distinguish no hits from connection failure, and permit choosing saved site works offline. Start with one selected library; a library/collection picker can expand when it materially helps navigation.

For an unchanged work, preserve unexposed options, ordering, separators, configured keyword, tags and explicit local spelling. REPLACING the work is different: locator, original-year, formatted reference, copy links, attribution, unresolved fallback and future quote are source-dependent assertions. Preview their keep/change/remove disposition, or clear safely with an intentional visible choice. Unknown fields cannot be assumed valid for a different work. Do not use the same-work round-trip guarantee to transfer an old work’s claims to a new one. This is first-loop acceptance if replacement is exposed, not deferred refresh work.

Transaction boundary to prove with draft:

1. Select work and acquire snapshot; nothing persisted yet.
2. Choose reuse or new record; prepare marker using canonical helpers.
3. Revalidate editor and cache revisions.
4. Apply source and any record additions as one undoable editor operation.
5. Update the disposable manager binding cache best-effort; cache failure is not an article-save failure.
6. Save source/reference with defined failure recovery.
7. Cancel leaves all persisted data unchanged. Undo must not delete a shared site record used by another article; distinguish reversing an insertion from garbage collection.

Offline acceptance requires reloading the saved article, not just keeping the preview visible in memory. Include a saved bundle or site build that proves enough metadata was persisted. Explicitly distinguish offline rendering/reuse of SAVED works from discovering UNCITED works across the Zotero library. The first is proposed for this preview; the second needs a viable local connection or broader cache and remains a maintainer product decision.

## 11. Quotes, locators and annotation opportunities

Randal chose a site setting for quote visibility: reader hover by default, private mode available. The quote belongs to a citation occurrence, not a reference abstract. Locator identifies a page/chapter/time position; it is not proof that the excerpt appears there. Draft captures and edits; cite parses, renders and controls reader exports.

The `quote:` field is not yet implemented. Agree escaping, multiline behavior, grouping, length limits, round-trip behavior and source changes before either project emits it. An author-supplied excerpt is not automatically PDF-verified. Automatic retrieval from annotations or full text is a later capability requiring explicit selection and provenance.

A private quote in a literal cite block can still leak if the Markdown source is public on GitHub or downloadable. Compiler omission cannot retroactively make public authoring source private. Decide whether private quotes require a host-private occurrence store, a publication transform that never publishes private source, or a narrower promise limited to compiled outputs. The site must know which model it actually offers. Never rely on CSS hiding, hidden DOM, data attributes or an omitted hover to claim confidentiality.

Test private text absence in HTML, endnotes, reader caches/data, downloads, bibliography export, logs and diagnostic excerpts where applicable. Treat explicit private author-project export as a separate consent boundary. Support works without quotes normally; quote work must not block the first Zotero citation loop.

## 12. Interchange and manuscript exports

Implement reusable selected/cited-work serialization in CSL-JSON, BibTeX and RIS; make it usable from the Playground and draft. The current per-record toCSL is a starting point, not a complete serializer. Use Zotero's own API exports as an interoperability oracle or connected convenience, not as a mandatory network dependency of offline export.

File import should share the same normalization and review model. Define type/date/creator/edition fidelity and explicit unsupported-field diagnostics before promising round trips. Compare semantic fields after an actual Zotero import/export; container-byte equality is not the criterion.

Choose manuscript records from canonical citation occurrences, including aliases and deliberate nocite/list semantics. Resolve whether section lists, further-reading lists and uncited site-cache records belong in each download. Do not silently export the whole library because the article cache contains it.

Mark unresolved placeholders and let the writer decide whether to export incomplete records. Omit private connection details and private quote content. Standard formats do not preserve every cite annotation; document losses.

## 13. Security, privacy and failure behavior

- Pure adapters perform no I/O, do not read browser storage and never accept a credential to construct a reference.
- Connection credentials stay in the host boundary; no URL query keys, public globals, article source, bundled config, diagnostics or downloaded caches.
- A public static site cannot securely keep a bundled OAuth client secret. A new server/bridge requires an explicit scope and ownership decision.
- Request the selected library/read permission needed for the loop, not notes/files/writes by habit. Verify grants; a UI label saying read-only is not evidence of actual key scope.
- Do not silently bulk-read a private library or preload all notes to improve search. Set bounded query/page/item budgets and use source cancellation.
- Treat returned titles/creator names/URLs as untrusted metadata; normalize/sanitize before rendering. Refuse executable/credential-bearing destinations; do not mark a URL as an open reading copy merely because Zotero stores it.
- Invalid/missing identifiers do not justify arbitrary title search or inventing a DOI. Further discovery remains an explicit scoped behavior.
- Rate limits, server outages, revocation, stale sessions, wrong library, local-server changes and unavailable items leave the article and saved references intact.
- Honor reduced storage expectations on shared machines; disconnect clears host credentials and defined private cache state, not the author's saved citations.

## 14. Verification matrix and evidence ownership

| Area | Library fixtures / tests | Host or real-service acceptance |
| --- | --- | --- |
| Mapping | Article/book/chapter/corporate creator/edited book/non-ISO date/no ID/unsupported type | Compare selected actual Zotero items with rendered references |
| Identity | Shared DOI conflicts, edition differences, multiple candidates, group/personal namespaces, collisions | Insert twice; reuse existing site work; deliberate conflict review |
| Curation | First loop preserves current records; later explicit two-way diff covers deletion, missing fields and creator order | No first-loop edit-preserving refresh claim; later review against a real curator correction |
| Privacy | Unknown/raw/private fields excluded; private quote absence across outputs | Inspect actual project Git storage, downloads, reader network payloads and browser credentials |
| Transactions | Immutable outputs, revision invalidation, article/reference atomicity, binding-cache failure | Cancel, insert, Save, Undo, reload; cache loss does not orphan content; replacement reviews source-bound fields |
| Network | Injected mock transport for timeout/race/revocation/pagination/rate cases | Hosted-origin public+private Web API and supported browser behavior |
| Offline | Saved snapshot renders without resolvers | Close Zotero/disconnect network; reopen saved article and insert saved site work |
| Export | Deterministic selected-work outputs, escaping, loss diagnostics | Actual Zotero CSL-JSON/BibTeX/RIS semantic round trips |
| Version partitions | Web vs local-server identities/versions never cross-compared | Local enable/disable/database replacement only when local access is undertaken |
| Accessibility | Library returns stable state/codes without UI prose | Keyboard selection, readable result distinctions, focus/Cancel, narrow layout |

Use the dedicated Playwright browser, never everyday Chrome. Adversaries must check the author/site boundary, edition fidelity and actual usefulness, not just valid JSON. Keep source/API verification, browser simulation, connected-service tests, adopter acceptance and final publication separate. Reuse accepted unchanged evidence.

Fixtures should be synthetic or publicly redistributable. A private real library rehearsal does not authorize committing its responses. Record sanitized field-level discrepancies and permitted minimal cases.

## 15. Proposed stages and stop conditions

| Stage | Deliverable | Observable exit | Exclusion / stop condition |
| --- | --- | --- | --- |
| P0 | This plan + fresh-agent critique + Randal discussion | Major alternatives and decisions are explicit | No further integration implementation during requested planning review |
| P1 | Bounded Web-v-local feasibility, choose one connection route | Actual-origin reads and second-session rehearsal; private library only after connection | Do not create an auth service or ship both routes by default |
| P2 | CSL-based adapter + minimal portable-model fixes + reuse candidate | Actual writer fixtures, offline record, optional browser bindings, edition/privacy tests | No parallel raw-CSL store, generic manager framework or refresh baseline |
| P3 | Draft’s separately reviewable insertion preview | Right edition, locator, Save/Undo/reload, second session, repeated selection and safe replacement | Do not call fixture tests integrated acceptance; cache-cleared/no-ID limitations explicit |
| P4 | Optional explicit two-way review after insertion acceptance | Current/incoming choices preserve site values by default; tested failures | No edit-origin inference or automatic three-way merge; Already cited/Open in Zotero can be earlier |
| P5 | File interoperability and downloads | Three formats with real semantic round trips and visible downloads | No claim of lossless all-field interchange |
| P6 | Quote occurrence support | Contract, reader default, tested private publication boundary | Do not promise privacy for a public source repository |
| P7 | Remaining source-maintenance scope | Separate link/notice fixtures and reviewed evidence | Avoid absorbing every Zotero-adjacent writing feature |

Order P1/P2 can overlap on independent fixtures; P3 is the earliest user-value acceptance point. That preview gets its own explicit acceptance and publication decision; it is not shorthand for delivering the whole0.6 milestone. P4–P7 are not prerequisites to demonstrating basic insertion. If first-loop integration stalls, prefer an import-file fallback and a narrower support claim over building an unrelated infrastructure project. About90minutes of active work triggers the repository checkpoint; report useful delivery and exact remaining gates.

## 16. Questions for the fresh reviewer

Challenge the premise as well as the implementation. In particular:

1. Is native-data conversion the wrong first abstraction given Zotero's CSL-JSON support?
2. Are we inventing needless envelope/binding infrastructure or promising privacy the host cannot offer?
3. Is Web API first actually the fastest useful route for this writer, or should files/local access lead?
4. Does the plan force too much review or author-side JavaScript for ordinary citation insertion?
5. Are manager identity, work identity, editions and manuscript usage separated clearly enough?
6. What is the minimum durable state for correct reuse and a genuinely useful reviewed refresh?
7. Which supported cases will fail because the current portable record model is too narrow?
8. Should exports be the first independent usable slice, or would that postpone the actual writing need?
9. What should be cut, reordered or explicitly excluded to avoid an overgrown0.6?
10. What important writer workflow has this plan missed?

## 17. Review discussion and decisions

A fresh agent read this plan without the conversation history, inspected current records/toCSL and official Zotero docs, and challenged the architecture. Two follow-up exchanges tested its recommendations rather than merely accepting a review checklist.

| Initial proposal | Criticism and discussion | Revised recommendation |
| --- | --- | --- |
| Start with native Zotero mapping | Duplicates existing Zotero CSL semantics; neither route fixes current role loss | CSL-JSON input, thin manager address, one narrow portable model |
| Private source envelope in durable save | A separate object is not privacy; draft has not established a private cross-device store | Browser-local persistent but disposable bindings; article/reference save remains sufficient |
| Early generic reconciliation/three-way refresh | Too much infrastructure before repeated insertion; a partially accepted source version is not a merge baseline | Defer refresh; later honest current/incoming review before considering three-way |
| Web-first session key | Successful first connect can conceal painful daily reconnect; local route might fit this writer better | One bounded actual-origin/two-session comparison, then choose one route |
| Offline writing | Could imply uncited-library discovery that a saved article cannot provide | Explicit saved-work offline claim; ask whether broader discovery is needed |
| Preserve hidden marker options | Correct for same work, unsafe when replacing identity | Review source-dependent assertions on replacement, including unknown fields |

Parent pushback: retaining CSL alongside a normalized record risks two sources of truth; reviewer agreed to projection into one model. Ancient-date support should not grow the first task absent a relevant fixture; reviewer agreed to record that boundary. The parent asked whether disposable bindings could support no-ID works after reload; the reviewer clarified persistent same-browser cache, with explicit cache-loss fallback and no universal cross-device no-duplicate promise.

Final reviewer verdict: SUPPORT THE REVISED NARROW PLAN; no further architecture-planning prerequisite. This is a planning verdict only, not implementation verification, adopter acceptance or release approval. No code, credentials, private library or browser session was used by the reviewer.

Bring Randal into four product decisions with recommendations, not an implementation questionnaire:

1. Proposed first-preview offline scope: saved references render and can be reused; uncited-library discovery waits unless a viable local route is selected. Does daily writing require the broader scope immediately?
2. Evaluate Web/session-key and local access briefly before choosing one. The recommendation is no new OAuth service or automatic hybrid in the first preview, and no claim of smooth onboarding before the second-session rehearsal.
3. Choose3–5 real writing fixtures, including an ordinary article, an edited/translated book and a chapter, to define metadata fidelity. Missing identifiers and edition ambiguity should appear among them if they occur in Randal’s work.
4. Give the insertion/Save/offline/reuse loop its own reviewable preview. Keep refresh, exports, quote privacy and source maintenance on the roadmap without making them all prerequisites to trying that loop. This does not silently reduce the agreed0.6 scope.

Randal endorsed the modest first loop, said offline uncited-library discovery is not immediately required, offered the BEST library and selected connecting running Zotero. He asked us to investigate the connection alternatives and recommend a route; no additional implementation-scope approval is needed for that bounded work. The current implementation/evidence and remaining host gates are recorded in the [milestone](../milestones/0.6.0.md), and the [adapter guide](../zotero.md) describes the proposed handoff. Private web authentication and actual daily-use acceptance remain pending.
