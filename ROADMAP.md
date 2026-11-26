# Roadmap

Version 0.4.0 adds reviewed document import, native working-copy extraction and a browser compiler. Version 0.3.0 added editor integration and reader polish. Version 0.2.0 introduced article editor tools, cross-page bibliographies and tag contributions alongside reader access, media records and structured citations. See the [changelog](CHANGELOG.md).

## Agreed next milestones

On 21 November 2026 the maintainer separated stable editor integration from the larger import project:

| Milestone | Scope | Status |
| --- | --- | --- |
| [0.3.0](docs/milestones/0.3.0.md) | Shared marker classification, stable work notes, reference-prefix hook, once-per-list help and usage docs/tests | Released 21 November 2026; tagged-artifact adoption reported by draft in issue 8 |
| [0.4.0](docs/milestones/0.4.0.md) | Reviewed import: PDF/paste/text/Markdown/native document adapters, recognition, reference parsing, review UI, revision-bound edits and measurement | Shared API/native extraction and review fixes implemented; headless host boundary agreed; Released 23 November 2026; final release files verified by draft (91 tests); technical sign-off complete |
| [0.5.0](docs/milestones/0.5.0.md) | Comprehensive developer documentation, annotated/live demos, worked draft.inator integration and translation/i18n | Released 25 November 2026; adopter conditions met, final checks/deployment and all published downloads verified |
| [0.5.1](docs/milestones/0.5.1.md) | One configured cite keyword, author-level reference details, adopter migration and learning-page polish | Released 25 November 2026; both approvals recorded, five published archives downloaded and verified |
| [0.6.0](docs/milestones/0.6.0.md) | Zotero-first writer integration, interchange formats and source maintenance | Local bibliography workspace plus file import, reviewed refresh, source checks and bibliography exports; draft picker independently rehearsed; two host safety fixes independently verified; authenticated integration pending |

The current release is [0.5.1](https://github.com/randal-cox/cite.inator/releases/tag/v0.5.1), published 25 November 2026. The previous release is [0.5.0](https://github.com/randal-cox/cite.inator/releases/tag/v0.5.0), published 25 November 2026. Older 0.3.0 packages do not include import. The import branch keeps the work already built; its document-first review prototype is a 0.4.0 experiment. Version changes and publication follow the check-in/review procedure.

Version 0.4.0 is released and its final files are verified by draft.inator with 91 passing tests. Its PR merge and remaining issue closure belong to draft. [The adopter receipt](docs/milestones/0.4.0.md#adopter-receipt) records exactly what was checked.

Milestone [0.5.0 — Developer learning and live demos](docs/milestones/0.5.0.md) is complete: public examples/Guide, clean downloads, worked editor integration and UI translation. The [feature/example matrix](docs/learning-coverage.md) maps the delivered features. The 0.5.1 correction is released with its own [publication receipt](docs/milestones/0.5.1.md#publication-receipt). The next larger agreed milestone is [0.6.0](docs/milestones/0.6.0.md), bibliography-manager integration and source maintenance; its [Zotero plan](docs/plans/zotero-integration.md) has been critically reviewed; the maintainer endorsed its narrow preview, now under implementation and host integration. Stable 0.4.0 artifacts remain unchanged.

## Completed milestone 0.2.0 — Article tooling

The adopter accepted `0.2.0-preview.0` at `77461de`. Version 0.2.0 adds its seven polish fixes and per-citation marker tag contributions (F5). F1–F3 provide editor tools, cross-page bibliography returns and topic filters. See [the milestone record](docs/milestones/0.2.0.md) and [the API guide](docs/article-tools.md). Final checks and independent closeout reviews passed; the release was published on 20 November and its downloaded assets verified. The milestone record distinguishes adopter and local evidence.

F4 became the separate reviewed-import milestone 0.4.0. Current implementation, evidence and remaining gates are recorded once in [its milestone record](docs/milestones/0.4.0.md); earlier design stages remain in the linked plans and Git history.

## Completed milestone 0.1.4

**We have a citation for that**, released 18 November 2026. The [milestone record](docs/milestones/0.1.4.md) links the release, delivered scope, acceptance evidence and remaining work.

- Reader access profiles, built-in or host settings, copy-level access, grouped destinations, translated wording and plural counts.
- Preferred title destinations, library proxy/OpenURL links, and saved verification dates.
- Artwork/image records, explicit creator attribution, literal dates, reuse terms and source/served checksums.
- Chicago media formatting and generic media fallbacks for other presets. Exact house styles can supply curated reference text.
- Compact inspect icons, structured occurrences, host appearance tokens, route dismissal and webpage URL fixes, demonstrated in the Reading room and Plain HTML.

Native Safari, VoiceOver and physical-phone checks remain open. The milestone record describes these limits and the scope of verification.

## Check-in practice

Review the milestone record and roadmap before every check-in. The [repository procedure](docs/checkin-procedure.md) defines the fast staged checks, milestone verification, independent review and release record. The local pre-commit hook runs the fast checks.

## Earlier completed work

- [x] Provide a standalone HTML ZIP and an npm tarball with separate compiler and browser entry points.
- [x] Let readers move the inspector with a mouse or touch without dragging.
- [x] Provide five named citation styles for common books and journal articles, formatted reference text, HTML and Markdown input, and a JSON CLI.
- [x] Carry curated access links and reader-supplied provider preferences into the panel and endnotes. Resolve ISBN editions through Open Library.

## Import and later follow-up

The local import-review demo is runnable now; see [its guide](docs/import-demo.md). The development tools/browser bundles also expose shared marker classification and work-context editor notes for draft.inator. Neither is an update to the released 0.2.0 archives.


- Measure reviewed import on additional public documents and extend partial reference rules from observed failures before expanding backends. The [article-tooling plan](docs/article-tooling-plan.md) retains its review and fallback requirements.
- Verify the implemented once-per-list unknown-profile help across additional host integrations; each inspector retains settings access.
- Extend the documented text-only referenceItemPrefix hook through host integration tests; richer content should use explicit APIs rather than generated-HTML string matching.
- Maintain and extend the [style catalogue and support matrix](docs/citation-styles.md), including its link to the maintained broad style registry. Cover author–date, author–page, numeric, and notes and bibliography styles, including disciplinary and publisher variants. Record each style's edition or variant, link to its governing guide where available, and show what cite.inator can format today by source type and citation form. Use real migration examples to identify which gaps matter most and whether a broader style engine would help.
- Extend the reported host-site verification to additional integrations and retain regression checks for formatted references, year letters, service preferences and return links.
- Test on a physical phone and with Safari and VoiceOver. Cover opening the inspector, moving it, dismissing it, and returning from an endnote.

## Naming migration in 0.5.0

The maintainer brought the **cite.inator** rename into this milestone. Repository, physical folder and Codex project/attachment are separate activation checks. The prepared package name is `cite-inator`; browser/data compatibility and legacy installs are documented in [the migration guide](docs/naming-migration.md). GitHub, physical-folder and Codex project/attachment renames are all verified in the [milestone](docs/milestones/0.5.0.md).

## Near-term research revisit

- **Scholarly writing environment — working name write.inator.** Draft’s [assessment and planning discussion](https://github.com/randal-cox/draft.inator/issues/35) recommends useful draft features assembled as a scholarly preset first; its docs-only exploration is in [PR36](https://github.com/randal-cox/draft.inator/pull/36). A separate write.inator product would be reconsidered if the unit becomes a local manuscript project with chapters, assets and review history, chiefly exported to PDF/Word. Experiment order still needs maintainer selection. Candidate capabilities: project/nested asset folders; original and derived figures with captions, alt text, credits and rights; LaTeX/formula editing; numbered equations/figures/tables with stable labels and automatic cross-references; manuscript integrity checks; claim/evidence navigation; anchored human and optional AI criticism; reviewer comments linked to author responses and the specific addressing revisions, with review-round status and response-letter export; portable Markdown with web/PDF/Word outputs. Keep authoring choices in document notation and shared behavior in configuration. Prioritize useful criticism and transparent assistance records; AI detection needs its own evidence of usefulness. Ask draft for its code-level assessment, responsibilities and interfaces needed from cite, and record the exploration on its roadmap too. This is planning, with no new repository, implementation or milestone assignment; cite's 0.6.0 bibliography-manager plan remains separate.

- **Public bibliography auditor — revisit soon.** Do a hands-on comparison of Recite, Edifix and relevant manuscript checkers before deciding whether another product is worthwhile. Compare actual prices and free-tier limits, accuracy, review effort, privacy and export/source preservation on the same rights-cleared examples. Free access may itself justify an offering even with feature parity; measure the operating costs and constraints. Recommending an existing product is an acceptable outcome. The agreed direction, if pursued, is a useful algorithmic checker without an account or LLM requirement, with optional user-funded AI that stops when consent, funds or quota are unavailable. See the [research brief](docs/research/bibliography-auditor-2026-11-23.md). No milestone assignment or expansion of 0.4.0 is implied.

## Later wishlist

- **Curator-confirmed reuse of unresolved placeholders.** Let an editor explicitly identify a later missing citation as the same work as an earlier placeholder within one reviewed import. Keep separate identities until that assertion; never merge from equal author/year text alone. Also use measured examples to improve common narrative author-boundary cases without consuming surrounding prose. These are nonblocking follow-ups from [draft issue34](https://github.com/randal-cox/draft.inator/issues/34).

- **Bibliography manager integration (0.6.0).** Start with importing BibTeX, RIS, and CSL-JSON exports from Zotero and other reference managers so authors can reuse curated records across pages. Then explore an opt-in, read-only Zotero connector for importing selected items or collections, with a web-first draft picker and optional hybrid local/Web API access. Direct connectors to other managers are deferred; preserve interoperability through file formats. Keep source identifiers where available, preview changes on reimport, and preserve local edits and edition distinctions. [Zotero export guide](https://www.zotero.org/support/kb/exporting) and [Zotero API documentation](https://www.zotero.org/support/dev/web_api/v3/basics).
- **Citations for specific versions of research artifacts.** Cite a particular dataset release, code commit, archived webpage, or notebook revision. For example, a chart based on dataset v2.3 should link to that release even after v2.4 comes out. Support locators such as a table, section, or timestamp so readers can find the exact material a claim depends on.
- **Evidence linked to claims.** Let authors record what a source supports, qualifies, or challenges, with an optional excerpt and locator. Show that relationship in the inspector and let readers navigate from a source back to the claims that use it.
- **Retraction and correction notices (0.6.0 source maintenance).** The inspector and endnotes already display a supplied status. Add a short, sourced note and a link to the official notice when available, with distinct labels for retractions, corrections, and expressions of concern. Verify that provider evidence applies to the cited work, flag newly discovered notices for editorial review, and preserve the original citation.
- **Source maintenance (0.6.0).** Give editors a review queue for broken links and newer editions. Show the proposed change alongside the cited record and keep the original edition and the editor's decision traceable.
- **More ways to find and access sources.** Use recurring ISBN misses and gaps in full-text or library access to prioritize additional providers. Preserve edition identity and provider provenance when comparing candidates.

The [verification history](docs/launch-verification.md) preserves the earlier assays and links to the released milestone. The [product brief](https://github.com/randal-cox/cite.inator/blob/main/docs/prd-citation-inspector.md#milestones) describes the longer-term feature sequence.

A separate [public bibliography-auditor product hypothesis](docs/research/bibliography-auditor-2026-11-23.md) records existing competitors and optional user-funded AI routes. It is queued above for a near-term research revisit, with no milestone assignment or implementation commitment; it does not expand 0.4.0 release gates.

Current import follow-ups after the bounded parser pass: measure additional genuinely new public papers, handle PDF word hyphenation without silently changing titles, and extend unusual bylines and book/report field rules from measured cases. The [current public audit](docs/evidence/import-plos-0294391-2026-11-23.json) records 15 exact DOI records plus 12 recovered proposals, not 27 provider-verified identities. Recovered proposals remain outside canonical output until accepted completion. Broader format/edition coverage does not block the documented 0.4.0 boundary.

## Composable scholarly tools — discussion

Randal requests exploring a separate formula.inator around draft's equation work, with import integration alongside cite. The [draft discussion](https://github.com/randal-cox/draft.inator/issues/35#issuecomment-7198344135) asks which parsing/rendering/numbering pieces are reusable. Proposed boundary: draft owns the manuscript revision, combined review, assets, Undo and publication; cite owns citations/references; a formula module owns reusable math conversion/rendering. Shared extraction and revision-bound proposals should avoid successive widgets flattening or rewriting one another's source. This is a design proposal awaiting Claude's code-informed response, not a new repository/framework or prerequisite to the0.6 citation loop.
