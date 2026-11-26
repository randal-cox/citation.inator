# Independent re-assay: Commons quality adoption repairs

Scope: repaired cite quality wrapper/configuration only. Base commit `1f73d336bf666382c142ea170bfa06aae4d386de`, dirty candidate declared. Same-chat verifier; macOS POSIX and Node 26.13.1. Earlier `raw-verifier.md` and `verifier-boundary-followup.md` remain unchanged, including their failed verdicts.

## Findings

No unresolved finding remains within the replayed tooling scope. This is not blanket product, security, portability or release acceptance.

QC-VERIFY-001 / QC-VERIFY-001A: repaired. Removing includeOnly retains prohibited targets. The wrapper now parses the JSON reporter's validation result rather than accepting its unconditional raw exit 0. Independently ran `node scripts/quality/verify-boundaries.mjs`: permitted local library import accepted; tooling and Node builtin imports both present under the intended error-rule names; exact copied production wrapper returns failure for the forbidden graph. Result: PASS.

QC-VERIFY-002: repaired for observed POSIX ownership cases. A first process-group implementation stopped the descendant but crashed twice on overflow from an uncaught kill EPERM. Those intermediate failures remain preserved in `repeat-results.json`. The final implementation makes stop requests idempotent, retains cleanup errors as failed evidence, and avoids throwing from stream callbacks. Replayed original fake-scanner specimen against exact current wrapper/resolver copies: scanner launches heartbeat child then emits 9 MiB; wrapper exits 2 with outputLimitExceeded true, stdout retained at 8 MiB, cleanupErrors empty, no stderr; heartbeat stays at 4 bytes and descendant is not alive after exit. Normal-exit and SIGTERM interruption controls had already stopped descendants and returned 0/2 respectively under the same group-ownership design; these accepted observations are reused. Result: PASS for the observed Mac POSIX specimen.

QC-VERIFY-003: repaired. A disposable `src/duplicate 12.mjs` containing a forbidden Node import is excluded while `src/valid.mjs` remains in the graph. Independent inventory patterns now admit multiple digits, and Knip exclusions cover every numbered extension rather than mjs alone. Result: PASS for active multi-digit architecture specimen plus source inspection of other scanner configurations.

## Coverage

- Architecture positive and negative controls: actual current configuration and exact copied status adapter, PASS.
- Output overflow child/descendant cleanup: current exact-copy specimen, PASS.
- Normal child exit and wrapper SIGTERM interruption: original accepted process-group controls reused, PASS; no change to group ownership in final patch.
- Multi-digit numbered-file exclusion: active dependency-graph control, PASS; ESLint/Knip/jscpd inventory policies source-inspected.
- Earlier source inspection: package exports/runtime dependencies unchanged, developer-only shared tooling, `.inator/` ignored, discovery red states retained, no code-size quotas. Parent owns final docs/package status.
- Not certified: Windows direct-child fallback/descendant cleanup, timeout forced-kill timing, malicious descendants deliberately creating independent sessions, whole-product correctness/security, browser behavior, full quality profile or release acceptance. No private corpus/network scans or broad tests were run for this re-assay.

Verdict: **PASS bounded quality-tooling integration re-assay**. Broad scanner discoveries and semantic code-quality findings retain their own open states; this verdict does not close them.

## Evidence

- Original architecture false green: `/var/folders/qk/6skdksws3j33wqn9h1wc8kmh0000gn/T/cite-quality-verifier-ksnpr0gw/result.json`.
- Reporter status comparison: same fixture `reporter-exit-results.json`.
- Original live descendant specimen: `/var/folders/qk/6skdksws3j33wqn9h1wc8kmh0000gn/T/cite-quality-lifetime-u6c9dmij/result.json`.
- Intermediate process-group failures and normal/interruption observations: `/var/folders/qk/6skdksws3j33wqn9h1wc8kmh0000gn/T/cite-quality-lifetime-reassay-4frkfo1_/repeat-results.json`.
- Final repaired overflow result: same fixture `final-overflow-result.json`.
- Multi-digit active control: `/var/folders/qk/6skdksws3j33wqn9h1wc8kmh0000gn/T/cite-quality-numbered-reassay-9n4lg17n/result.json`.

## Replayed source identity

- `scripts/quality.mjs` SHA-256 `6244d674feeb2272261bd869debafcae85cc83cca1e430fbbb83be9d7402c324`
- `scripts/quality/dependency-cruiser.cjs` SHA-256 `576bb410f8d03e481c2ad8993fe112096b3b408d21de320079d8f60f4e2cb16f`
- `scripts/quality/verify-boundaries.mjs` SHA-256 `d80310f7ad69b08d6dd0aaca70a4c4cce4f92d4835143f0b57be9850737c3aa6`
- `scripts/quality/knip.json` SHA-256 `1a52f27978f8c7f2819e3f7eba4571381f8c2b70e4e1d7fe94321d53ff9303d4`
- `scripts/quality/eslint.config.mjs` SHA-256 `ac7f36ed4a7e3db5eac4fbc3ae0eb85bab267551c377ce97098c7cff1c484650`
- `scripts/quality/toolchain.mjs` SHA-256 `cdcb18512a51bf190b56ec1cc71aeeeb6bd972e71f53770b525251fc959aa326`
