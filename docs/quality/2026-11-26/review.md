# Code-health review — 26 November 2026

The reviewed baseline is cite `1f73d336bf666382c142ea170bfa06aae4d386de`
(`0.6.0-preview.7`). Repairs are prepared as the distinct `0.6.0-preview.8`
candidate. Commons discovery used `c802bb4d58337c56207278b485c7a990923b4441`.
No final release, deployment, main merge or authenticated host acceptance is
implied. This is the current code-quality review record; raw reports are evidence,
not competing status documents.

## Findings and disposition

| Finding | Consequence | Disposition |
| --- | --- | --- |
| Narrative author expansion crossed an opaque range | An accepted citation could rewrite protected author bytes | Recheck the completed span; narrative overlap regressions; independent re-assay passed |
| Classifier omitted implicit placeholder allocation | It could say ready while preview rejected the same decisions | Share target normalization/allocation in host decision order; both orders tested and independently passed |
| Failed HTTP responses left a streaming body open | A failed request could outlive cancellation and its timeout | Abort and cancel error bodies; unfinished 400/429/503 specimens and success/cache controls independently passed |
| Encoded annotation quote delimiters were malformed | A normal HTML-rendered `cue:` broke real host preview | Quote-origin-aware projection; encoded/literal equivalence regression and independent 686-case comparison passed |
| Non-element HTML markup shortened annotation ownership | Private suffix text entered reader output and occurrence context | Protect comment/doctype token spans, including declarations dropped by tree construction; independent re-assay passed |
| Excluded HTML/code and escaped examples poisoned later markers | Later citations could be lost, with annotation disclosure in one HTML path | Keep candidate activation in eligible contexts; preserve excluded HTML as whole literal tokens; independent re-assay passed |
| Dependency scan filtered away forbidden targets and trusted a zero JSON-report exit | A broken architecture check could report success | Keep target edges, interpret structured errors and permanently run positive/negative production-adapter controls |
| Scanner descendant survived output overflow | The development check could leave work running | Own and clean a POSIX process group, bound output and preserve failure status; independent overflow/heartbeat re-assay passed |
| Numbered-copy exclusions were inconsistent | Duplicate local files could contaminate observations | Align multi-digit/extension exclusions; independently checked |

The original reports remain unchanged:
[code health](raw-code-health.md), [test critic](raw-test-critic.md),
[encoded HTML](raw-encoded-html.md), and
[first encoded-HTML re-assay](re-assay-encoded-html.md).
The later independent PASS reports and exact tooling evidence are retained with
the local Commons assay and these durable reports:
[code-health re-assay](re-assay-code-health.md),
[test-critic re-assay](re-assay-test-critic.md),
[tooling discovery](raw-tooling-verifier.md),
[tooling re-assay](re-assay-tooling-verifier.md), and
[final encoded-HTML re-assay](final-re-assay-encoded-html.md).
They do not retroactively change the original reports.

## Verification

The initial repaired import candidate passed 429 tests on Node26.13.1 and
minimum22.13.0, then the browser suite on dedicated Chromium159.0.8154.6.
Encoded-annotation changes subsequently added three regression tests; final
candidate verification is recorded in the milestone record. The original three
regressions were observed failing before their repairs.

Four deliberate faults in a disposable, tracked-source snapshot were detected:
remove final narrative protection, stop reserving placeholder IDs, omit HTTP
error cleanup, and omit revision binding. These establish fault sensitivity for
those failures, not exhaustive mutation coverage. Stryker produced no startup
output within its bounded attempt and was stopped; it supplies no mutation-score
evidence. The direct specimens and logs remain at
`/private/tmp/cite-quality-mutations-preview8`.

The full Commons profile actually ran. Correctness lint, module boundaries,
architecture controls, CSS, duplication discovery and Node coverage completed.
Biome, Knip and whole-tree formatting retain attention results; the manual review
entry stays not run by automation. The report therefore does not claim an
all-green quality state. The corrected duplication inventory identified three
small candidates, not the sync-copy-driven nine from the initial survey.

Node coverage over executed source modules measured 98.16% lines and 88.97%
branches in that observation. This is Node test coverage, not a universal
correctness, browser or usefulness measure. No global percentage gate was added.
The final correctness lint observation covers168 authored files with zero errors
and88 review warnings. The clean package contains125 files and24 export targets;
a fresh offline consumer passed source/browser privacy, cue, protection, transport
and migration assertions on both supported Node versions. Maintainer quality
transcripts are excluded from that consumer archive; packaged policy documents
link to their repository records.

## Composed-import and adopter evidence

The exact synthetic DOCX fixture at draft
`778954a860e47497a84f17f677f7da26564e485a`, paired with the Figure reader from
PR58 `67df4cc9a91726539238af168a656fb2dd69df70`, passed an independent rehearsal:
byte-exact projection, affiliation superscripts, original image bytes, five math
regions, three citation edits including a caption, two disjoint cross-references,
caption round trip and stale source/revision/protection rejection. Both supported
Node versions and dedicated Chromium with native DOMParser, self-only CSP and no
external requests were exercised. This pair is not represented as a merged host.

The original mixed `(Eq. 1; Bell, 1992)` remains unchanged with an explicit
unparsed diagnostic. Claude acknowledged Draft was hiding it and reported its
attention UI fix at `2a7770e05db79e84ab8ea3443adb77abe6febd04`.

The exact cue block at draft
`2a2d7d99e00d272e65adb9b6ac6257eec55209b9` independently passed its 20 block tests
in an isolated, Git-blob-verified snapshot. Completing the public fixture and
using preview.8 compiler/tools bundles then passed47 exact upstream block,
editor and migration tests on both Node26.13.1 and minimum22.13.0, including the
previously failing HTML compiler/editor case. This remains separate from a real
authenticated editor, KR/Zotero and Randal's host approval. No vendored worked-host
pin is silently changed by these tests.

## Remaining work and limits

`processImportRequest` still combines several domain stages. Shared decision,
allocation and source-span rules now remove demonstrated drift; a later focused
change can name the completion, allocation/remapping, cache and reader stages
while preserving source hashes, wire results and failure semantics. Do not use
file-length targets as its acceptance criteria.

Review the remaining complexity, naming/assignment, formatting and dynamic-entry
signals in coherent maintenance batches. Knip's retained enrichment re-exports
and dynamically built/copied assets are not safe-deletion instructions. Do not
mass-reformat generated/vendor files or change public interfaces to satisfy a
scanner. The original API's documented null site-decision adapter is a footgun,
not a newly discovered contract violation.

Windows descendant cleanup, forced-timeout timing, independently detached
sessions, physical devices and assistive technology were outside the current
tool-lifetime proof. Raw-text annotation quotes still require explicit escaping;
this review does not promise confidentiality for arbitrary malformed raw text.
The new parse5 token-location dependency is internal to this adapter and covered
by regression tests; recheck it when upgrading the pinned parser.

Actual Zotero application import, authenticated host/KR integration, quote policy,
full staged-record/media Save/Cancel/Undo and final approvals remain separate
gates. Further source changes require relevant checks, not a reset of every
accepted review.
