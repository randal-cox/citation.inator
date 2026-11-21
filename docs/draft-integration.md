# draft.inator integration boundary

This is an integration note for the separate public [draft.inator repository](https://github.com/randal-cox/draft.inator), inspected read-only on 20 November 2026. It is not a claim of installed integration or editor acceptance. Its files are changing; this snapshot used `docs/data-contract.md` blob `1a0dd87682c19b7292bbc3b6f0f0549c890372b2` and the current Cite block.

## Current host surface

The [data contract](https://github.com/randal-cox/draft.inator/blob/main/docs/data-contract.md) supplies `window.DRAFT_WORKS` entries with `id`, `note`, `title` and optional `year`, plus `window.DRAFT_TOPICS`. The [Cite block](https://github.com/randal-cox/draft.inator/blob/main/src/blocks/citation.js) reads/writes marker groups, preserves unseen options/order and refreshes editor notes from the supplied work lookup. Its public contract describes this editor behavior; no reviewed-import transaction/revision interface was observed in those files.

## Boundary to agree and test

- citation.inator proposes extracted text, fields, matches, diagnostics and revision-bound decisions. draft.inator owns editor selection, transaction/undo, user authorization, persistence, authentication and publishing.
- The experimental Node review API is not directly browser-loadable. A browser protocol needs equivalent revision guarantees before a browser editor uses it.
- Generated import markers use `local:<record-id>` to avoid reserved-command collisions. The current Cite block looks up the whole marker identifier directly in its works table. The host adapter must normalize local identifiers to record IDs for lookup/picker selection while preserving a valid marker on write. Test both bare and explicit local identifiers, reserved names, DOI aliases and missing works.
- Reuse `describeCitation`/`annotateMarkers` for notes. Import decisions must not manufacture a competing description or author/year identity system.
- A matched reference may not yet exist in `DRAFT_WORKS`. Review and add curated records explicitly, then refresh host choices; do not make raw provider results selectable publication records automatically.
- Preserve source style, locators, prefixes, narrative forms, topics and unfamiliar options. Exact marker text is less useful than a tested semantic round-trip where intentional note refresh is the only change.
- Reject stale review decisions after article edits. Apply accepted changes and new records in one host-controlled transaction where supported, preserving undo and cancellation. Bibliography removal requires separate explicit review and accounting for uncited entries.
- Linked/noncontiguous/decoded text and uncertain author boundaries remain accepted-but-pending-adapter in the prototype; an editor must not turn these into destructive broad replacements.

## Milestone placement

0.3.0 supplies the reusable parsing/matching/review foundations and records compatibility constraints. 0.4.0 adds the worked draft.inator integration, annotated developer tutorials and live demonstration. The next useful coordination point is the editor's revision/transaction contract, not a request to change its current Cite block blindly.
