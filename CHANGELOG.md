# Changelog

## Unreleased

- Develop 0.2.0-preview.0 with editor-only marker notes, query/annotation APIs and JSON CLI checks; site occurrence indexes and cross-page bibliography returns; record tags, per-list roles and build/browser filters. Include browser tools, static multi-page examples and integration documentation. Candidate acceptance is pending; formatted-citation import remains planned.
- Document proposed article-editor query tools, cross-page bibliography links, tags and reviewed citation import; implementation scope and version are pending.
- Add browser regression coverage for unboxed inspector headings, visible keyboard control focus and isolation from host focus styling.
- Establish a repository check-in and milestone procedure with staged consistency checks, a local hook and a milestone record template.

## 0.1.4 · 2026-11-18

- Add reader access profiles, service catalogues, grouped destinations, built-in and host settings, translated wording and plural counts.
- Add preferred title destinations, library proxy/OpenURL links and saved verification dates while preserving canonical citation text.
- Add structured occurrences, stable identifiers, trigger bindings, host theme controls and route dismissal.
- Add artwork/image metadata, rights, attribution, literal dates, source/served checksums and CSL graphic export. Chicago is the initial media formatting target.
- Add compact inspect controls and custom icon masks that follow text colour. Omit empty trailing action boxes.
- Expand the Reading room, Plain HTML, Guide and packaged documentation.

## 0.1.4-access.1 · Preview · 2026-11-18

- Omit empty trailing action containers when an inspect control leads the reference.
- Add `inspectIconMode: "mask"` for custom icons that inherit text colour in light and dark themes.

## 0.1.4-access.0 · Preview · 2026-11-18

- Add browser-local reader profiles, service catalogues, grouped access destinations, built-in or host settings, translated wording and plural counts.
- Add preferred title destinations, OpenURL/proxy library links and saved verification dates.
- Add artwork/image metadata, rights, attributed creators, literal dates and source/served checksums, with CSL graphic export.
- Add compact inspect actions and examples in both demos.
- Include the tested structured, host-theme, route-dismissal and webpage-reference preview work.

## 0.1.4-structured.2 · Preview

- Plan citations for app-rendered captions, tables, and dialogs from stable occurrence IDs. Render one endnote per cited record with a backlink for each occurrence, including without JavaScript in light DOM.
- Bind existing controls to the inspector with explicit endnote targets, update and disposal, and a focus fallback for removed controls.
- Keep structured anchors distinct from legacy compiled IDs. Preserve separate editions that share a catalog number using display-only related identifiers.
- Add host-scoped panel font, compact-sheet radius, and modal backdrop settings. Expose dismissal for hosts that reuse citation controls during navigation.
- Coordinate Escape with surrounding dialogs. The Reading room and Plain HTML demos show both a nested inspector and unresolved reference handling.

## 0.1.3 · 2026-11-10

- Accept curated personal author IDs for Chicago surname disambiguation across variant bylines.
- Report when cache-wide year letters have companion works outside a page’s endnotes.

## 0.1.2 · 2026-11-10

- Limit Chicago surname disambiguation to authors shown in competing bylines.
- Preserve author suffixes and mark partial author lists in the inspector.
- Support scoped endnotes in definition entries, list items, and table cells, with custom or omitted headings and diagnostics for misplaced markers.
- Add cache-wide year letters and reading-list summaries with per-record hooks.

- Compile isolated citations for reusable excerpts, scoped endnotes for entries, and standalone reading lists with optional uncited endnotes.
- Add Chicago house-style dates, organization short names, surname initials, grouped years, and U.S. legislation reference fields.
- Preserve HTTPS links in formatted reference parts and report citation gaps across multiple fragments.
- Rank ISBN candidates, accept the `hiddenProviders` alias, and share a cache load across inspectors on the same page.
- Credit Randal Cox in the software citation and link his ORCID and the repository.

- Preserve original publication and edition dates and display both in reprint citations.
- Hide selected access services in panels and endnotes, independently of preferred order.
- Suggest edition ISBNs from title-and-author searches for curator review.

- Added Chicago author–date, APA, MLA, Cite Them Right Harvard and Vancouver formats for common books and journal articles.
- Added prefix and locator syntax, editable endnote headings, formatted reference parts and lettered occurrence links.
- Added HTML and Markdown compilation, fragment rebasing and a JSON command for build tools.
- Added library and full-text locations, provider preference ordering and ISBN edition resolution through Open Library.
- Added a reflected panel open state, a default mark and separate panel title and icon settings.
- Added separate CSS and citation Style previews, configuration help, and examples of page locators, prefixes and library links.
- Documented npm-free use, existing-site integration and recurring adversarial testing.

## 0.1.1 · 2026-11-10

- Added a configurable citation keyword with endnote, evidence and credit directives. The original `{cite …}` and `{endnotes}` syntax remains supported.
- Added opt-in hover, panels that drag from blank areas, compact action icons, contextual endnote return links and three demo styles.
- Scoped theme changes to citation content and added a configurable class prefix.
- Added a source and notation guide, and visible cache and provider outcomes on the Resolution bench.
- Added an attributed abstract excerpt and the software citation. The local release includes the exact reading-room source.

## 0.1.0 · 2026-11-10

- First local preview with an author–year compiler, pre-rendered endnotes, a portable citation inspector, and a Crossref resolution demo.
