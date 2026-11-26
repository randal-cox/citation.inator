# Independent verifier: cite Commons quality adoption

Mode: re-assay, same-chat verifier. Scope: current cite-owned quality tooling only; no blanket library/product acceptance. Base commit `1f73d336bf666382c142ea170bfa06aae4d386de`, dirty source declared. Commons source `c802bb4d58337c56207278b485c7a990923b4441`. Node 26.13.1. Read-only product inspection; disposable seeded fixtures under OS temporary storage. No network scans, full suite, browser, build, private corpus, or product-source edits.

## Findings

### QC-VERIFY-001: Architecture checker filters away both declared forbidden targets

Severity: serious. Confidence: confirmed. Status: reproduced, unresolved at inspection.

Requirement: module-boundary check must reject library imports of tooling and Node builtins. Preconditions: `scripts/quality/dependency-cruiser.cjs:25` sets `includeOnly: "^src/"`. Action: create a disposable `src/portable.mjs` importing `../scripts/adapter.mjs` and `node:fs`; run the exact adopted dependency-cruiser configuration. Observed: exit 0, zero violations, and the module has an empty dependencies array. Expected: both forbidden-boundary rules fire. `includeOnly` removes targets before forbidden-rule evaluation. The current clean scan cannot prove either stated boundary. This is an assurance defect, not evidence that current cite source violates those boundaries.

Evidence: `/var/folders/qk/6skdksws3j33wqn9h1wc8kmh0000gn/T/cite-quality-verifier-ksnpr0gw/result.json`. No fixture changes were made to cite source.

### QC-VERIFY-002: Output-budget termination leaves a scanner descendant running

Severity: warning. Confidence: confirmed. Status: reproduced, unresolved at inspection.

Requirement: bounded tool execution must not leave an unowned child workload after termination. Action: run exact copies of `scripts/quality.mjs` and its toolchain resolver in a disposable consumer/fake-Commons fixture. The fake scanner spawns a heartbeat child, then emits over 8 MiB. Observed: wrapper correctly returns exit 2 and `outputLimitExceeded:true`, but the descendant keeps running: heartbeat grew from 4 to 9 bytes after wrapper exit. Expected: all tool-owned descendants stop. Current `child.kill` calls target only the immediate scanner; closing that child clears the later kill timer. The fixture descendant was explicitly terminated after observation. The current exit status is truthful, but execution cleanup is incomplete.

Evidence: `/var/folders/qk/6skdksws3j33wqn9h1wc8kmh0000gn/T/cite-quality-lifetime-u6c9dmij/result.json`. Consumer/scanner sources are preserved in that fixture. No production scanner was terminated.

### QC-VERIFY-003: Several independent scanner inventories exclude only single-digit numbered copies

Severity: warning. Confidence: confirmed static inspection. Status: unresolved at inspection.

Requirement: generated/sync numbered duplicates are excluded from authored-code review. `authored()` excludes all digits, but jscpd's raw-directory scan uses `**/* [0-9].*`, dependency-cruiser uses `[0-9]`, and Knip's project/entry/ignore patterns use `[0-9]`. Files ending ` 10.mjs` therefore remain eligible in these independent inventories. Expected: the same all-digit boundary across tools. ESLint's explicit tracked-file input does provide a stronger primary boundary; its single-digit ignore alone is not the main defect.

Evidence: `scripts/quality.mjs` duplication args; `scripts/quality/dependency-cruiser.cjs:24`; `scripts/quality/knip.json` entry/project/ignore. No actual private data was scanned to establish this finding.

## Coverage

- Inspected quality config, wrapper, resolver and all scanner policies. No new product runtime/UI dependency. Compared current manifest with HEAD: package exports unchanged; runtime dependencies unchanged.
- Verified `.inator/` is Git-ignored. Scanner raw output/history stays developer-local. Commons collector still reports manual semantic review as not-run; scanner success is not asserted as semantic quality.
- Found no code-size quota; complexity/nesting are warnings. Prettier/Biome/Knip retain nonzero discovery outcomes, not a clean claim.
- Ran positive seeded forbidden-import control: failed sensitivity (QC-VERIFY-001).
- Ran exact-copy oversized-output/descendant control: truthful nonzero status, incomplete cleanup (QC-VERIFY-002).
- Reviewed duplicate-file patterns without scanning private/sync source contents (QC-VERIFY-003).
- Not run: full quality profile, scanner-wide product re-execution, browser/runtime suites, release/distribution acceptance, Commons internals audit, Windows/macOS cross-platform descendant handling. Those are outside this bounded verifier task.

Verdict: **FAIL adoption-check credibility/lifetime re-assay** until QC-VERIFY-001 is repaired and independently replayed; QC-VERIFY-002/003 also need repair or explicit documented limits. Existing broad runtime tests are reused only for their original product scope. This report does not invalidate those tests or assert product defects from tool failures.

## Inspected source identity

- `quality.config.json` SHA-256 `33f263537b3d359d9523cd2f1baeb8f71cc72023a53b6d1b300d20b95157886d`
- `scripts/quality.mjs` SHA-256 `c8c2f7f5f1be5c12c8c3d3f143a09f0cea3a65a9208940ce9ba15478d3c9da77`
- `scripts/quality/dependency-cruiser.cjs` SHA-256 `d72118be09dd99d895a89703e1488f0ba1ec278851a5dff32eb4350194d6103b`
- `scripts/quality/eslint.config.mjs` SHA-256 `a09eb444d0638e2a3f3bfdc96a38e6fab50cab2afeffb9c3ad53236af3b15f69`
- `scripts/quality/knip.json` SHA-256 `310c99b04417da08fc68e73a8711859ab01e0b5c0dbbbd7c3bd817fc60f8b067`
- `scripts/quality/toolchain.mjs` SHA-256 `cdcb18512a51bf190b56ec1cc71aeeeb6bd972e71f53770b525251fc959aa326`
