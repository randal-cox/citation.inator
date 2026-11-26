# Code health critic re-assay

Verdict: **PASS for the bounded repaired import-decision and source-span scope.** The original placeholder-allocation finding is closed by independent reproduction. This is a re-assay using the prior findings, not blind discovery and not release, adopter or whole-library acceptance.

Candidate: working-tree source snapshot `b03de7e8259f18e5339a2b84a4d2824d0f81b60c0b956890adc077c89f7f4234`, based on `1f73d336bf666382c142ea170bfa06aae4d386de`. The packet identifies `mode: re-assay`; the historical generated critic prompt still says Discovery, so this report follows the current packet and explicit bounded re-assay assignment. All 59 per-file snapshot SHA-256 values were independently checked against current bytes and agreed.

## Findings

No new actionable defect was found within this bounded re-assay. The prior P2 concerning implicit placeholder IDs is repaired: classifier and planner now use `createPlaceholderAllocator` and reserve IDs in the same host decision order.

The original reproduction was independently rerun in both orders. Automatic first, then a colliding explicit ID: classification refuses readiness and preview rejects the collision. Explicit first, then automatic: classification permits readiness and preview produces two edits with distinct IDs, `pending-dc17456ecf970789b22a` and `pending-dc17456ecf970789b22a-1`. Thus the fix retains existing planner allocation semantics instead of silently imposing source order.

## Coverage

Inspected source: `src/import-decisions.mjs` in full; `src/import-classifier.mjs` in full; affected `src/import-review.mjs` paths for target selection, allocation, source checking and atomic application; affected `src/import-api.mjs` decision handling and preview responsibilities; the new regression in `test/import-composition.test.mjs:173`; and the packet/source-snapshot records. The earlier read-only review remains preserved in `docs/quality/2026-11-26/raw-code-health.md`.

Executed independent Node checks:

- Verified every file hash recorded in the supplied source snapshot.
- Replayed the original two-group collision with automatic-first and explicit-first host decisions, checking readiness, preview behavior, edit count and distinct resulting record IDs.
- Exercised the shared span predicate against eight unsafe shapes: empty fragments, negative start, infinite end, fractional boundaries, decoded/inexact fragment, linked fragment, a gap between fragments, and an end beyond the document. Each returned `safe:false`; classifier readiness was false and the planner emitted zero edits for the affected group.
- Checked a same-length changed raw citation against exact original source: the planner-side helper refuses it. The classifier intentionally lacks original source bytes; it shares structural checks while preview remains the authoritative exact-source check, as documented.
- Checked supported target normalization for implicit placeholders and legacy `recordIds`, without changing their public wire representation.

| Obligation | Independently observed artifact behavior | Submitted evidence sufficiency |
| --- | --- | --- |
| Original implicit/explicit collision | Proved repaired by both host-order reproductions | Proved for this defect: the submitted regression covers both orders with explicit outcomes |
| Shared placeholder reservation semantics | Proved by source inspection and preview record-ID outputs | Proved for the claimed bounded sharing: classifier and planner import the same allocator |
| Shared structural source-span checks | Proved on eight negative specimens and an exact positive specimen | Proved for the claimed helper adoption by direct source inspection; this report supplies the additional independently executed negative specimens |
| Exact source ownership before edits | Proved: planner passes original source to the shared helper; a changed raw value is refused | Proved for the inspected contract; no claim that the source-free classifier independently checks byte identity |
| Readability repair without a new framework or size quota | Proved by inspecting named helpers and formatted decision/control-flow paths | Proved for the bounded change itself; formatting and static metrics do not establish general maintainability |

Existing parent evidence of 429 current/minimum-Node tests and Node/Chromium combined-fixture checks was accepted as supplied context; this critic did not re-run or independently certify those suites. No browser control was in this source/API re-assay, so interactive-control lifecycle obligations are outside this assigned scope rather than inferred from source presence.

No product files were edited. Only this raw report was written. No build, browser launch, full-suite run, package installation, network scan, private-corpus inspection, external write or release action occurred. No in-scope test was blocked or left unexecuted.

## Nonblocking follow-up

`processImportRequest` still combines validation, analysis, completion reconciliation, allocation/remapping, cache construction and reading-preview generation. Its responsibility boundaries could be made clearer with named domain helpers and documented decision/result shapes during a future focused change. This remains maintainability work, not a newly demonstrated correctness defect or a prerequisite for closing the repaired collision. The shared target and source-span helpers materially reduce the specific duplicated knowledge identified in the original report; a broader refactor would need its own behavioral scope and evidence.
