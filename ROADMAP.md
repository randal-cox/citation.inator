# Roadmap

Stable release 0.3.0 adds editor integration and reader polish. Version 0.2.0 introduced article editor tools, cross-page bibliographies and tag contributions alongside reader access, media records and structured citations. See the [changelog](CHANGELOG.md).

## Agreed next milestones

On 21 November 2026 the maintainer separated stable editor integration from the larger import project:

| Milestone | Scope | Status |
| --- | --- | --- |
| [0.3.0](docs/milestones/0.3.0.md) | Shared marker classification, stable work notes, reference-prefix hook, once-per-list help and usage docs/tests | Released 21 November 2026; tagged-artifact adoption reported by draft in issue 8 |
| [0.4.0](docs/milestones/0.4.0.md) | Reviewed import: PDF/paste/text/Markdown/native document adapters, recognition, reference parsing, review UI, revision-bound edits and measurement | Shared API/native extraction and review fixes implemented; headless host boundary agreed; site-cache reuse, host IDs, edge fixes and browser compiler implemented, adopter recheck pending |
| [0.5.0](docs/milestones/0.5.0.md) | Comprehensive developer documentation, annotated/live demos, worked draft.inator integration and translation/i18n | Planned; current-feature usage docs remain part of every release |
| [0.6.0](docs/milestones/0.6.0.md) | Zotero/other managers, interchange formats and source maintenance | Planned after learning milestone |

The current public release is 0.3.0. No import API or demo is promised in the stable 0.3.0 package. The import branch keeps the work already built; its document-first review prototype is a 0.4.0 experiment. Version changes and publication follow the check-in/review procedure.

Current 0.4.0 candidate: shared Node/browser import API and JSON CLI, bounded native PDF/DOCX/ODT working-copy extraction, metadata preservation, identity-aware suggestion ranking and explicit conflict review are implemented. The demo uses that API as an example host. Complete clean-consumer/minimum-runtime/browser checks and independent reviews, then obtain draft’s recheck of the implemented site-cache reuse and host-assigned IDs before final release. Draft agrees that it owns the UI through the headless API. Public 0.3.0 artifacts remain unchanged. See the [current milestone gates](docs/milestones/0.4.0.md#release-gates-still-open).

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


- Continue F4 with the in-text matcher and optional Crossref bibliographic search; measure rule-based reference parsing before expanding backends. The [article-tooling plan](docs/article-tooling-plan.md) retains its review and fallback requirements.
- Verify the implemented once-per-list unknown-profile help across additional host integrations; each inspector retains settings access.
- Extend the documented text-only referenceItemPrefix hook through host integration tests; richer content should use explicit APIs rather than generated-HTML string matching.
- Maintain and extend the [style catalogue and support matrix](docs/citation-styles.md), including its link to the maintained broad style registry. Cover author–date, author–page, numeric, and notes and bibliography styles, including disciplinary and publisher variants. Record each style's edition or variant, link to its governing guide where available, and show what citation.inator can format today by source type and citation form. Use real migration examples to identify which gaps matter most and whether a broader style engine would help.
- Extend the reported host-site verification to additional integrations and retain regression checks for formatted references, year letters, service preferences and return links.
- Test on a physical phone and with Safari and VoiceOver. Cover opening the inspector, moving it, dismissing it, and returning from an endnote.

## Near-term research revisit

- **Public bibliography auditor — revisit soon.** Do a hands-on comparison of Recite, Edifix and relevant manuscript checkers before deciding whether another product is worthwhile. Compare actual prices and free-tier limits, accuracy, review effort, privacy and export/source preservation on the same rights-cleared examples. Free access may itself justify an offering even with feature parity; measure the operating costs and constraints. Recommending an existing product is an acceptable outcome. The agreed direction, if pursued, is a useful algorithmic checker without an account or LLM requirement, with optional user-funded AI that stops when consent, funds or quota are unavailable. See the [research brief](docs/research/bibliography-auditor-2026-11-23.md). No milestone assignment or expansion of 0.4.0 is implied.

## Later wishlist

- **Bibliography manager integration (0.6.0).** Start with importing BibTeX, RIS, and CSL-JSON exports from Zotero and other reference managers so authors can reuse curated records across pages. Then explore an opt-in, read-only Zotero connector for importing selected items or collections. Keep source identifiers where available, preview changes on reimport, and preserve local edits and edition distinctions. [Zotero export guide](https://www.zotero.org/support/kb/exporting) and [Zotero API documentation](https://www.zotero.org/support/dev/web_api/v3/basics).
- **Citations for specific versions of research artifacts.** Cite a particular dataset release, code commit, archived webpage, or notebook revision. For example, a chart based on dataset v2.3 should link to that release even after v2.4 comes out. Support locators such as a table, section, or timestamp so readers can find the exact material a claim depends on.
- **Evidence linked to claims.** Let authors record what a source supports, qualifies, or challenges, with an optional excerpt and locator. Show that relationship in the inspector and let readers navigate from a source back to the claims that use it.
- **Retraction and correction notices (0.6.0 source maintenance).** The inspector and endnotes already display a supplied status. Add a short, sourced note and a link to the official notice when available, with distinct labels for retractions, corrections, and expressions of concern. Verify that provider evidence applies to the cited work, flag newly discovered notices for editorial review, and preserve the original citation.
- **Source maintenance (0.6.0).** Give editors a review queue for broken links and newer editions. Show the proposed change alongside the cited record and keep the original edition and the editor's decision traceable.
- **More ways to find and access sources.** Use recurring ISBN misses and gaps in full-text or library access to prioritize additional providers. Preserve edition identity and provider provenance when comparing candidates.

The [verification history](docs/launch-verification.md) preserves the earlier assays and links to the released milestone. The [product brief](https://github.com/randal-cox/citation.inator/blob/main/docs/prd-citation-inspector.md#milestones) describes the longer-term feature sequence.

The fresh [20-page public PDF check](docs/evidence/import-plos-0294391-2026-11-21.json) agrees with the publisher’s 52 references and ordered 62 cited items after extraction fixes. Remaining import work includes wrapped DOI recovery, structured numeric reference fields and investigating sidebar lookup progress observed in this run; these are not source-author errors. Host site-cache reuse and host-assigned IDs remain separate integration requirements.

Draft integration preview.3 implements the requests in issues 16, 22 and 14; draft acceptance remains pending. Optional shared match-state/action descriptions and structured pending-format preview responses remain follow-ups, alongside the 0.5.0 worked host integration.

A separate [public bibliography-auditor product hypothesis](docs/research/bibliography-auditor-2026-11-23.md) records existing competitors and optional user-funded AI routes. It is queued above for a near-term research revisit, with no milestone assignment or implementation commitment; it does not expand 0.4.0 release gates.
