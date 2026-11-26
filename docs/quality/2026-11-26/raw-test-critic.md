Verdict: changes required. Reviewed exact HEAD `1f73d336bf666382c142ea170bfa06aae4d386de`; no files edited.

1. **[P1] Narrative expansion crosses protected opaque regions.** [import-matcher.mjs:117](/Users/randal/Documents/Projects/inators/cite.inator/src/import-matcher.mjs:117) expands the citation start to include its author after the protected-range check at line 87. It never checks the completed span again.

   Confirmed reproduction:
   ```js
   parseInTextCitations('Bell (1992) said so.', {
     opaque: [{start: 0, end: 4}]
   })
   ```
   Returns `Bell (1992)` at `[0,11)`. Accepting its `bell` candidate through `processImportRequest` produces `{cite bell | form:narrative} said so.`, replacing protected bytes. This violates the documented whole-group exclusion contract. The partial-intersection test at [import-composition.test.mjs:25](/Users/randal/Documents/Projects/inators/cite.inator/test/import-composition.test.mjs:25) covers parenthetical citations only. Add narrative author-only and author-tail overlap cases, checking detection exclusion and unchanged source.

2. **[P2] Failed HTTP responses escape transport cleanup.** [import-enrichment.mjs:127](/Users/randal/Documents/Projects/inators/cite.inator/src/import-enrichment.mjs:127) throws for non-OK status before acquiring or cancelling the body. Its `finally` then clears the timeout and removes the controller. An unfinished error response therefore survives timeout and subsequent `client.cancel()`.

   Confirmed with an injected `Response(new ReadableStream(...), {status:429})`: after rejection, a 30 ms wait with `timeout:10`, and `client.cancel()`, both `streamCancelled` and `signal.aborted` remained false. Actual network/resource consequences were not measured. Centralize failed-response cleanup and test an unfinished error body; the existing [429 test:59](/Users/randal/Documents/Projects/inators/cite.inator/test/import-enrichment-adversary.test.mjs:59) uses an empty body and checks throttling only.

The notation tests meaningfully check source-comment confidentiality across complete results, literal-code preservation, migration boundaries and unresolved/resolved behavior. I found no additional confirmed notation defect. Cross-form comparisons at [notation-readability.test.mjs:9](/Users/randal/Documents/Projects/inators/cite.inator/test/notation-readability.test.mjs:9) would be clearer with one explicit expected citation/locator assertion, but that alone is not a blocking finding.

Portable import and optional native-file extraction remain separate entry points; the reviewed headless dependency paths showed no new Node-only runtime dependency. Existing browser/full-suite evidence was reused. I ran only the two bounded Node reproductions above; no browser, build, full-suite, live-provider or physical-device checks. Tracked working tree remained unchanged. No release approval given.
