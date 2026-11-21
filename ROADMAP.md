# Roadmap

Current release 0.2.0 provides article editor tools, cross-page bibliographies and tag contributions alongside reader access, media records and structured citations. See the [changelog](CHANGELOG.md).

## Milestone 0.3.0 — Reviewed import in development

F4 is the next substantial milestone, targeted at 0.3.0 once confidence is established. Initial work includes a source-only author-date detector/matcher, text/HTML/Markdown extraction with source provenance and an explicit Crossref search prototype, and developer-checked private paired-format matches. See [the milestone record](docs/milestones/0.3.0.md) and [corpus/development protocol](docs/import-development.md). Native file adapters, installed search/review workflows, reviewed edits and measured import accuracy remain unfinished. Released metadata/assets stay at 0.2.0 until a distinct preview is ready.

### Agreed 0.3.0 scope

The maintainer confirmed this split on 20 November 2026. Work starts now on all five import tracks: broader citation recognition, rule-based reference parsing, extraction adapters, reviewed revision-bound edits, and independently checked/held-out quality measurement. Current prototypes are foundations; these tracks are not marked complete.

The smaller work also belongs in 0.3.0: once-per-list unknown-profile help, a documented host insertion hook before reference items, the citation-style catalogue/support matrix, further host regression coverage, and native Safari/VoiceOver/physical-phone checks. Device checks require actual observations and remain pending until performed. Packaging, demos, documentation and full milestone reviews remain release gates.

Preserving embedded Zotero fields during document extraction is part of import fidelity in 0.3.0. Connecting to external bibliography managers or importing their collections belongs in 0.4.0.

## Planned milestone 0.4.0 — Connected bibliographies and source maintenance

External bibliography-system integration and ongoing source care form a separate milestone: BibTeX/RIS/CSL-JSON ingestion, opt-in bibliography-manager connections, broken-link review and related correction/retraction maintenance. See [the planned milestone](docs/milestones/0.4.0.md). This work is scoped, not implemented; the version is a future target rather than a package bump.

## Completed milestone 0.2.0 — Article tooling

The adopter accepted `0.2.0-preview.0` at `77461de`. Version 0.2.0 adds its seven polish fixes and per-citation marker tag contributions (F5). F1–F3 provide editor tools, cross-page bibliography returns and topic filters. See [the milestone record](docs/milestones/0.2.0.md) and [the API guide](docs/article-tools.md). Final checks and independent closeout reviews passed; the release was published on 20 November and its downloaded assets verified. The milestone record distinguishes adopter and local evidence.

F4 development targets 0.3.0. Prioritize in-text matching and Crossref bibliographic search, then measure rule-based reference parsing on real pasted documents before extending backends. Import must work without AI; any AI adapter remains optional. The [import plan](docs/article-tooling-plan.md#f4-reviewed-import-delivered-in-smaller-stages) records that sequence and its review requirements.

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

## Remaining 0.3.0 work

- Continue F4 with the in-text matcher and optional Crossref bibliographic search; measure rule-based reference parsing before expanding backends. The [article-tooling plan](docs/article-tooling-plan.md) retains its review and fallback requirements.
- Show the unknown-profile help once per reading list, while keeping a settings entry available from each inspector. Long lists currently repeat the help under every reading.
- Provide a documented hook for adding host content before each reference item, such as topic tags, without matching generated HTML strings.
- Build a comprehensive catalog of citation styles and variants. Cover author–date, author–page, numeric, and notes and bibliography styles, including disciplinary and publisher variants. Record each style's edition or variant, link to its governing guide where available, and show what citation.inator can format today by source type and citation form. Use real migration examples to identify which gaps matter most and whether a broader style engine would help.
- Extend the reported host-site verification to additional integrations and retain regression checks for formatted references, year letters, service preferences and return links.
- Test on a physical phone and with Safari and VoiceOver. Cover opening the inspector, moving it, dismissing it, and returning from an endnote.

## 0.4.0 and later wishlist

- **Bibliography manager integration (0.4.0).** Start with importing BibTeX, RIS, and CSL-JSON exports from Zotero and other reference managers so authors can reuse curated records across pages. Then explore an opt-in, read-only Zotero connector for importing selected items or collections. Keep source identifiers where available, preview changes on reimport, and preserve local edits and edition distinctions. [Zotero export guide](https://www.zotero.org/support/kb/exporting) and [Zotero API documentation](https://www.zotero.org/support/dev/web_api/v3/basics).
- **Citations for specific versions of research artifacts.** Cite a particular dataset release, code commit, archived webpage, or notebook revision. For example, a chart based on dataset v2.3 should link to that release even after v2.4 comes out. Support locators such as a table, section, or timestamp so readers can find the exact material a claim depends on.
- **Evidence linked to claims.** Let authors record what a source supports, qualifies, or challenges, with an optional excerpt and locator. Show that relationship in the inspector and let readers navigate from a source back to the claims that use it.
- **Retraction and correction notices (0.4.0 source maintenance).** The inspector and endnotes already display a supplied status. Add a short, sourced note and a link to the official notice when available, with distinct labels for retractions, corrections, and expressions of concern. Verify that provider evidence applies to the cited work, flag newly discovered notices for editorial review, and preserve the original citation.
- **Source maintenance (0.4.0).** Give editors a review queue for broken links and newer editions. Show the proposed change alongside the cited record and keep the original edition and the editor's decision traceable.
- **More ways to find and access sources.** Use recurring ISBN misses and gaps in full-text or library access to prioritize additional providers. Preserve edition identity and provider provenance when comparing candidates.

The [verification history](docs/launch-verification.md) preserves the earlier assays and links to the released milestone. The [product brief](https://github.com/randal-cox/citation.inator/blob/main/docs/prd-citation-inspector.md#milestones) describes the longer-term feature sequence.
