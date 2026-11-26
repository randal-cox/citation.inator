# Independent preview.8 distribution and adoption-boundary review

Verdict: **PASS for the bounded package, installed-consumer and API-documentation scope.** No actionable distribution or documentation defect was found. This is not final milestone acceptance, publication, deployment or authenticated host acceptance.

## Candidate and method

Reviewed 26 November 2026. Staged snapshot metadata: `/private/tmp/cite-preview8-review.json`, source tree `8996a0a247fd30832ee8c1552f4c4a98e8e574a9`. Archive: `/private/tmp/cite-preview8-review-er54c109/cite-inator-0.6.0-preview.8.tgz`; 125 regular files; SHA-256 `4a131d9e0b78ebc276cb900dcdaec9330de60c81fb2c44dbd20cb846b0b82f98`.

Independently inspected the archive manifest and member bytes, compared every packaged file with the reviewed working source and existing offline consumer, inspected relevant source/API contracts, and executed the existing offline consumer verifier on Node26.13.1. No build, installation, network request, browser launch or full-suite repetition. The default shell and Node REPL could not start because of the configured symlinked writable root; bounded local inspection and consumer execution used the working escalated shell context instead. No product files changed.

## Findings and verification

- Package, lockfile, standalone package and both CFF version records consistently identify `0.6.0-preview.8`. The engine floor is Node22.13.0. All24 declared export targets are present in the archive. The installed offline consumer matches every archive member byte for byte; every archive member also matched the current reviewed source at inspection time.
- The archive excludes numbered synchronization copies, `.inator` directories, private corpus material and maintainer quality reports, including `docs/quality.md`. Packaged check-in/adversarial policy documentation points to repository GitHub quality documents rather than absent local package paths. No private corpus content was read or copied during this review.
- All seven changed standalone JavaScript bundles in `demos/drop-in` match their `dist` counterparts byte for byte. This is synchronization evidence; independent runtime coverage is reused below.
- Independently reran `/private/tmp/cite-preview8-consumer-66tvffjk/verify.mjs`: **PASS on Node26.13.1**, reporting24exports, source/browser parity, encoded cues, private annotations, opaque narrative protection, failed-HTTP cleanup and source-aware migration. The verifier exercises installed package imports, not checkout imports. The parent's already completed minimum-Node22.13.0 consumer result is reused rather than rerun.
- `docs/import-api.md` accurately describes UTF-16/exclusive opaque ranges, validation and union, revision binding, whole-group exclusion, raw unparsed opaque references, classifier suggestions versus choices, and authoritative preview validation. The shared decision/placeholder/span helpers are internal implementation modules, with both classifier and planner consuming them; the guide does not promise them as public installed exports. Exact byte identity remains the planner's source-aware check; the classifier has only structural span context.
- The failed HTTP path aborts its transport and cancels the response body before reporting the HTTP error; the installed consumer independently exercises429cleanup. Broader400/503coverage is reused from the test-critic re-assay. The changelog's bounded cleanup statement matches this source.
- The encoded-cue/change-log and article-tools documentation match the inspected compiled-output and migration behavior. Source comments remain authored source; emitted reader artifacts omit them in the exercised cases. Retired marker `note:` remains malformed, the migration preserves code examples, and the JS `noteContext`/bibliographic-note names remain unchanged. Conservative annotation skips for entity-encoded marker braces remain documented; compiler support for encoded cue delimiters does not imply source annotation of encoded braces.

## Reused evidence and limits

Reused parent-reported current/minimum-Node432unit tests; dedicated Chromium reader/import/manager/library, learning, workspace and responsive suites; independent686full-output encoded-delimiter comparisons; the import/HTTP re-assays; and isolated draft `2a2d7d9` block/editor/migration47tests on both Node versions. These executions were not independently repeated by this distribution reviewer. Runtime acceptance belongs to their original bounded scope.

The milestone explicitly retains the previously accepted worked-host pin and identifies the updated draft checks as isolated host-module tests. It does not claim authenticated editor deployment, real Zotero application import, full saved-record/media Save/Undo rollback, quote-policy acceptance, final adopter acceptance or maintainer publication approval. Those exclusions are appropriate and do not block this library distribution verdict. Native Safari, VoiceOver and physical-device acceptance are also outside the supplied evidence.

The archive hash above identifies this inspected artifact. A subsequent documentation-only milestone/evidence update requires a new archive identity or member-delta check before handoff; unchanged runtime/source/bundle evidence can be reused. This report is intentionally excluded from the consumer package. Repository-link reachability and any future published registry artifact were not checked.


## Final documentation-only archive closure

Verdict remains **PASS** after an independent member-delta and hash check of the final refreshed artifact. Final snapshot tree: `8534a3dc2560f7d7d38aa140ad5d10d516d97006`. Archive: `/private/tmp/cite-preview8-review-4myaqtpi/cite-inator-0.6.0-preview.8.tgz`; 125 regular files; independently recomputed SHA-256 `815fef850d64b092b75ccf1949c5368084a0bd30eac16c3d885d6e1d3bb3c1a4`, matching the updated metadata.

Compared every regular member with the initially reviewed archive: no added or removed members; the only changed member is `docs/milestones/0.6.0.md`. Its delta replaces pending package/check results with the completed evidence, records the initial missing temporary fixture and remaining unrelated working-tree link failures, and preserves explicit host/adopter/final-release limits. All runtime, source, bundle, manifest and other documentation bytes are unchanged. Reuse the accepted consumer/runtime evidence above. No reinstallation or further runtime tests were needed or performed. This closes the archive-refresh condition in the initial report; no release or deployment acceptance is inferred.
