# Code quality and independent review

The aim is readable, dependable code: clear names and responsibilities, explicit
invariants, safe failure and cleanup, meaningful tests, and portable library
boundaries. File length, function length and statement counts are not quality
gates. Complexity and duplication identify places to read; they are not orders
to split code or combine concepts that happen to look alike.

## Shared tooling

The optional maintainer checks reuse Inator Commons' quality collector,
adversarial packets and installed adversary-lab tools. They add no runtime
dependency, product interface, scheduler or network scan. By default the tools
come from the sibling `../inator` checkout; set `INATOR_COMMONS_ROOT` to use
another installed Commons checkout. Missing tools fail explicitly. Install or
update that shared toolkit in Commons rather than copying its implementation
into this library.

```sh
npm run quality          # unit tests, correctness lint, module boundaries and controls
npm run quality:full     # broader code-health observations
npm run quality:history  # saved Commons quality records
npm run quality:prepare  # shared independent-review packet and critic prompts
```

The inventory is [quality.config.json](../quality.config.json). The full profile
adds CSS checks, a second JavaScript rules engine, dead-code candidates,
formatting discovery, exact-duplication discovery and Node source coverage.
`node scripts/quality.mjs scan TOOL` runs one tool: `eslint`, `dependencies`,
`stylelint`, `biome`, `knip`, `formatting`, `duplicates`, or `coverage`.

Results live in ignored `.inator/quality/` and `.inator/quality-tools/` directories.
Commons retains its structured outcomes and source/policy identity; scanner
details remain local. These files are excluded from releases. The collector may
complete successfully while recording failed or incomplete checks: inspect its
per-check states. A successful collection command is not a clean-quality verdict.
Static-tool failure remains visible until adjudicated; no catch-all baseline
converts historical warnings into a pass. Manual review is deliberately recorded
as not run by automation, even when a separately identified review exists.

Scanners use tracked authored inputs, exclude generated/vendor assets and
numbered sync copies, and preserve all public/browser/CLI entry points. Knip's
candidate discovery has its own declared project/entry inventory. Review its
results before removing any export, dynamically loaded module or dependency.
Commons' source identity covers the explicit paths in the configuration,
including untracked files within those paths; that identity is broader than the
scanner inventory and is not a release-package attestation.

ESLint separates portable modules, browser adapters, Node tools and Playwright
callbacks. There are no size rules. Its complexity/nesting warnings and the
formatting survey remain review signals. Control-character rejection regexes and
documented injected demo/test bindings have narrow, explained policy exceptions.

The architecture check rejects cycles, library imports from product/tooling
folders and Node builtins in portable source. Its positive and negative controls
exercise both the actual rules and the production status adapter. Dependency-
cruiser's JSON reporter itself exits zero on rule errors, so the adapter checks
the structured error results. A missing or incomplete report cannot pass.

The scanner wrapper bounds execution and retained output. On POSIX it owns and
cleans up a process group; Windows uses direct-child cleanup and has not received
the descendant-lifetime acceptance recorded for macOS. It is a foreground
development tool, not a scheduler or a sandbox for untrusted executables.

## Independent adversaries

Use Commons' code-health critic, test critic and independent verifier alongside
the existing [milestone roles](adversarial-testing.md). Give each reviewer an
identified source snapshot, governing contracts and bounded scope. Preserve raw
reports before synthesis. Discovery, remediation and independent re-assay are
separate: a new finding is not closed by the builder's explanation or by an
unrelated passing test. Tool success never substitutes for semantic review.

Review names, coherent responsibilities, hidden state transitions, duplicated
contract knowledge, error propagation, resource lifetime, reversibility and
whether tests detect consequential faults. Keep positive and negative controls;
coverage percentages alone do not measure fault sensitivity. Reuse accepted
browser evidence when a source-only review can answer the question.

The [26 November review](quality/2026-11-26/review.md) records the initial findings,
repairs, independent re-assays and remaining readability debt. It also separates
library checks from the composed draft host and final publication approval.
The committed reports retain their original Markdown hard breaks; the narrow
whitespace attribute for this evidence directory preserves those report bytes.
Source-file whitespace checks retain their usual policy.
