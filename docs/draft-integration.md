# draft.inator integration boundary

This is an integration note for the separate public [draft.inator repository](https://github.com/randal-cox/draft.inator), inspected read-only on 20 November 2026. It is not a claim of installed integration or editor acceptance. Its files are changing; this snapshot used `docs/data-contract.md` blob `1a0dd87682c19b7292bbc3b6f0f0549c890372b2` and the current Cite block.

## Current host surface

The [data contract](https://github.com/randal-cox/draft.inator/blob/main/docs/data-contract.md) supplies `window.DRAFT_WORKS` entries with `id`, `note`, `title` and optional `year`, plus `window.DRAFT_TOPICS`. The [Cite block](https://github.com/randal-cox/draft.inator/blob/main/src/blocks/citation.js) reads/writes marker groups, preserves unseen options/order and refreshes editor notes from the supplied work lookup. Its public contract describes this editor behavior; no reviewed-import transaction/revision interface was observed in those files.

## Shared classification and work notes

The 0.3.0 release exports `markerKind(raw, { citationKeyword })` for work/directive classification, including legacy forms and identifiers such as `list-2001`. The Cite block can use this instead of copying compiler grammar.

Use `annotateMarkers(source, cache, { noteContext: "work", ...styleOptions })` for both build refresh and stale-note checks when the editor's picker uses standalone `describeCitation`. This prevents article-local year letters in notes from fighting with context-free picker descriptions. It does not change reader-facing citation letters. These features are released in 0.3.0; older 0.2.0 archives remain unchanged. See [the compatibility API guide](article-tools.md#unreleased-draftinator-compatibility-additions).

## Boundary to agree and test

- cite.inator proposes extracted text, fields, matches, diagnostics and revision-bound decisions. draft.inator owns editor selection, transaction/undo, user authorization, persistence, authentication and publishing.
- The 0.4.0 candidate exports the same revision/context-bound protocol in Node and a self-contained browser bundle. The editor must also validate its current document revision before applying proposals. See the [candidate API](import-api.md).
- Generated import markers use bare record IDs when unambiguous and `local:<record-id>` for reserved names; `identifierForm: 'explicit'` keeps all local IDs explicit. Use the shared `formatRecordId` helper rather than maintaining a directive-name list. The current Cite block looks up the whole marker identifier directly in its works table. The host adapter must normalize local identifiers to record IDs for lookup/picker selection while preserving a valid marker on write. Test both bare and explicit local identifiers, reserved names, DOI aliases and missing works.
- Reuse `describeCitation`/`annotateMarkers` for notes. Import decisions must not manufacture a competing description or author/year identity system.
- A matched reference may not yet exist in `DRAFT_WORKS`. Review and add curated records explicitly, then refresh host choices; do not make raw provider results selectable publication records automatically.
- Preserve source style, locators, prefixes, narrative forms, topics and unfamiliar options. Exact marker text is less useful than a tested semantic round-trip where intentional note refresh is the only change.
- Reject stale review decisions after article, reference-data or formatting changes. The core protocol binds source/proposals; the host must bind any additional record/style context, as the local demo does. Apply accepted changes and new records in one host-controlled transaction where supported, preserving undo and cancellation. Bibliography removal requires separate explicit review and accounting for uncited entries.
- Linked/noncontiguous/decoded text and uncertain author boundaries remain accepted-but-pending-adapter in the prototype; an editor must not turn these into destructive broad replacements.

## Milestone placement

0.4.0 supplies the reusable parsing/matching/review foundations and records compatibility constraints. The 0.5.0 developer-learning milestone adds the worked draft.inator integration, annotated tutorials and live demonstration before bibliography-manager connections. The next useful coordination point is the editor's revision/transaction contract, not a request to change its current Cite block blindly.

## Document-first review direction

The maintainer requested reading the whole document with its bibliography and opening choices on unresolved/ambiguous citation highlights. The local 0.4.0 demo now prototypes hover/click/keyboard review rather than a permanent side panel. The editor should own decorations, positioning and transactions; cite.inator should provide candidate references, supplied/provider provenance, match reasons, missing/conflicting fields and exact source-range uncertainty.

Questions for draft.inator:

- Which editor extension points provide inline decorations, current selection/anchor coordinates and stable passage identity? How are UTF-16 extraction ranges mapped to editor positions?
- What revision token invalidates choices after document/reference/style changes, and what transaction applies accepted changes with undo/cancel?
- Can candidate work data include a full readable reference, identifiers and where the candidate came from, rather than only a title/ID?
- How should ambiguous, unmatched, accepted-but-needing-span and unavailable-provider states appear without relying on color? Hover should inform; click, keyboard and touch must offer equivalent controls and explicit acceptance.
- How do multiple cited works and uncertain author spans get reviewed without silently accepting a text boundary with a record identity?

An explicit cross-project coordination proposal and issue draft are in [the coordination note](draft-coordination.md). The host appearance/interaction discussion and acceptance are recorded below; final release-file re-vendoring is a separate adopter receipt.

## 0.4.0 host discussion

The labelled discussion is [draft.inator#16](https://github.com/randal-cox/draft.inator/issues/16), opened with candidate `0.4.0-preview.0` at `dbdb4d502c4f4bc00d5d406aac0e0564112826a4`. It supplies exact copied-browser assets, the shared request protocol and five questions covering host UI ownership, styling/name hooks, source revisions/undo, input parity and the future language seam. “Localization” in this discussion means host appearance/interaction; translation/i18n is planned for 0.5.0. In [draft’s response](https://github.com/randal-cox/draft.inator/issues/16#issuecomment-7070494435), draft accepts the headless boundary: it owns canvas/popovers, styling, revision checks and undo; a reusable styled view can wait for 0.5.0. Those initial synthetic checks exercised the shared tools bundle. Draft subsequently integrated and accepted reviewable site-cache reuse, host-assigned IDs, the shared identifier writer, edge fixes and browser compiler on preview.4 (`d9b010b`), using them on PR 23 at `4ed92a3` with 91 passing tests. A state-description helper and structured pending-format response are optional suggestions. The API/host exchange is accepted. Draft has verified the final 0.4.0 release files on PR 23 at `36c79b1`, reporting 91 tests passing. See the [adopter receipt](milestones/0.4.0.md#adopter-receipt); PR merging and any remaining issue closure stay draft-owned.


## 23 November preview handoff

The next 0.4.0 preview implements the library portions of [issue 16](https://github.com/randal-cox/draft.inator/issues/16), [issue 22](https://github.com/randal-cox/draft.inator/issues/22) and [issue 14](https://github.com/randal-cox/draft.inator/issues/14). This is library implementation, not draft adoption or a final release.

For site reuse, supply the same `siteCache` at analysis/preview, show `analysis.siteMatches` separately from in-document matching, and send explicit `recordDecisions`. Use `recordId` or JSON `recordIds` to name new records. Preserve `result.cache`, use `newRecordIds` to identify additions and apply text/cache together after the host revision check. The [API guide](import-api.md#reuse-site-records-and-choose-new-ids-040-preview) defines full-cache preservation, collision rejection and preview-time naming. Hosts do not need to rewrite notation.

```js
import { processImportRequest } from './citation-import.mjs';
const siteCache = { schema: 'citation-inator.cache.v1', records: [{
  id: 'bell-1992-ritual', type: 'book', state: 'resolved',
  title: 'Ritual theory, ritual practice',
  authors: [{ family: 'Bell', given: 'Catherine' }], issued: [1992]
}] };
const context = {
  mode: 'document', style: 'apa', citationKeyword: 'citation', namespace: 'draft-import', siteCache,
  source: 'A claim (Bell, 1992).\n\nReferences\nBell, C. (1992). Ritual theory, ritual practice. Oxford University Press.'
};
const analysis = processImportRequest(context);
const sourceId = analysis.referenceRecords[0].id;
// This synthetic example represents a reader accepting the proposed site identity.
const result = processImportRequest({ ...context, action: 'preview',
  review: analysis.review, reviewId: analysis.review.reviewId,
  decisions: [{ citationIndex: 0, action: 'accept', targets: [{ recordId: sourceId }] }],
  recordDecisions: [{ recordId: sourceId, siteRecordId: 'bell-1992-ritual' }]
});
// result.source uses bell-1992-ritual; result.newRecordIds is empty.
```

Multiple-year, organizational-author/acronym and secondary-source cases now have documented handling. Possible unrecognized balanced citation spans carry source-ranged diagnostics; secondary relationships and inferred acronyms require review. See the [edge-form contract](import-api.md#additional-author-date-import-forms). Optional `describeMatch` and structured pending-format responses remain separate follow-ups; current flags/errors are documented.

For the static article preview, copy `citation-compiler.mjs` and its notices from the same candidate. Import `compileMarkdown`, `compileHTML` or `compileCitations`; initialize the reader inspector separately. The [compiler recipe](article-tools.md#compile-an-article-in-a-browser-040-preview) covers CSP and untrusted HTML. Draft still owns canvas/popover rendering, transactions, revision invalidation and publication. Adopter verification/issue closure remains with draft.
