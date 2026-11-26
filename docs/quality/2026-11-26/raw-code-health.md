Verdict: **focused changes needed for classifier readiness; existing import safety evidence remains valid.** Reviewed exact preview.7 source read-only; ran two small Node reproductions, no builds/browser/full-suite reruns.

1. **P2 — implicit placeholder IDs are absent from classifier collision checking.**  
   [import-classifier.mjs:28](/Users/randal/Documents/Projects/inators/cite.inator/src/import-classifier.mjs:28) reserves explicit placeholder IDs, while [import-review.mjs:56](/Users/randal/Documents/Projects/inators/cite.inator/src/import-review.mjs:56) also allocates implicit ones. Consequently valid-looking decisions can return `canApply:true` but fail preview.

   Reproduction:

   ```js
   const input = {
     source: 'A (Rivera, 2020). B (Okafor, 2021).',
     style: 'apa',
     records: []
   };
   const a = processImportRequest(input);
   const id = 'pending-' +
     importHash(a.review.sourceHash + ':0:0').slice(0, 20);
   const decisions = [
     {citationIndex: 0, action: 'placeholder'},
     {
       citationIndex: 1, action: 'placeholder',
       targets: [{placeholder: true, recordId: id}]
     }
   ];
   ```

   Classifier returns ready; preview throws `Placeholder IDs must be valid and distinct from existing records.` Prefer one shared allocation/validation rule. Add both decision orders to the regression.

2. **Maintainability — decision semantics are repeated across three layers.**  
   [import-api.mjs:63](/Users/randal/Documents/Projects/inators/cite.inator/src/import-api.mjs:63), classifier line23 and planner line49 separately unpack `targets`, `recordIds` and placeholder actions. A named normalization helper and documented discriminated decision shapes would make the invariant reviewable and address the demonstrated divergence. Preserve wire/hash semantics.

3. **Maintainability — source-span safety has two implementations.**  
   [import-classifier.mjs:41](/Users/randal/Documents/Projects/inators/cite.inator/src/import-classifier.mjs:41) repeats part of [import-review.mjs:95](/Users/randal/Documents/Projects/inators/cite.inator/src/import-review.mjs:95). The planner additionally verifies integer bounds and exact original text. No legitimate generated-input bypass was demonstrated, but a shared reason-producing predicate would prevent future readiness drift.

4. **Readability — separate the import request’s domain stages.**  
   [import-api.mjs:16](/Users/randal/Documents/Projects/inators/cite.inator/src/import-api.mjs:16) combines validation, analysis, completion selection, original planning, identity allocation, remapping, portable-cache assembly and reader rendering. Named helpers for these stages would expose the important contracts without adding architecture or imposing size quotas.

5. **Testing — test composition between APIs.**  
   [import-composition.test.mjs:72](/Users/randal/Documents/Projects/inators/cite.inator/test/import-composition.test.mjs:72) checks explicit placeholder IDs, but misses their interaction with implicit allocation. Add table-driven classifier→preview specimens covering target combinations, decision order and unsafe spans, with explicit expected outcomes.

A provisional concern was **withdrawn**: classifier permits `siteRecordId:null`, whereas preview rejects it, but [import-api.md:273](/Users/randal/Documents/Projects/inators/cite.inator/docs/import-api.md:273) explicitly requires hosts to omit null decisions before preview. This is documented adapter burden, not a correctness violation. A named conversion helper or distinct type would nevertheless reduce confusion.

No release or adopter acceptance is implied.

## Appended coverage record

Candidate: `1f73d336bf666382c142ea170bfa06aae4d386de` (`0.6.0-preview.7`). The report above is preserved verbatim from the independent reviewer’s final response; paths and line numbers refer to that inspected candidate.

Files inspected:

- `AGENTS.md` and `docs/adversarial-testing.md` for review scope and repository boundaries.
- `src/import-api.mjs`, `src/import-document.mjs`, `src/import-review.mjs`, `src/import-classifier.mjs`, `src/import-opaque.mjs`, `src/import-matcher.mjs`, `src/import-sites.mjs`, and `src/import-extraction.mjs` for analysis, decisions, source mapping, allocation and application.
- Relevant identifier/identity helpers in `src/import-enrichment.mjs` and `src/records.mjs`.
- `test/import-composition.test.mjs` in full and targeted searches of import matcher, extraction, sites and placeholder tests.
- Relevant readiness, preview, diagnostics and site-decision documentation in `docs/import-api.md`, with targeted searches of the integration documentation.

Two executable Node reproductions were run against the inspected source:

1. A supplied Bell record and matching site record, accepted citation and `siteRecordId:null` decision. The classifier returned `canApply:true`; preview rejected the null decision. Further documentation inspection established that callers must omit null decisions for preview, so the provisional correctness finding was withdrawn and retained only as adapter/readability debt.
2. Two unmatched author–date groups with an automatic placeholder for group 0 and an explicit placeholder ID equal to group 0’s deterministic automatic ID for group 1. The classifier returned `canApply:true`; preview threw the duplicate-placeholder-ID error. This is the confirmed P2 finding above.

Limits: source/API review and those two small runtime reproductions only. No product files were edited during the review. No build, package installation, browser launch, full unit suite, authenticated integration, private-corpus run, release check or adopter acceptance was performed. Existing parent browser/milestone evidence was reused as context, not independently re-certified. No code-size quota or line-count target was used.
