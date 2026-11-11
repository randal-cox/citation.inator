# Roadmap

Version 0.1.3 adds author IDs for Chicago and a diagnostic for cache-wide year letters. See the [changelog](CHANGELOG.md).

## Local preview

- [x] Provide a standalone HTML ZIP and an npm tarball with separate compiler and browser entry points.
- [x] Let readers move the inspector with a mouse or touch without dragging.
- [x] Provide five named citation styles for common books and journal articles, formatted reference text, HTML and Markdown input, and a JSON CLI.
- [x] Carry curated access links and reader-supplied provider preferences into the panel and endnotes. Resolve ISBN editions through Open Library.

## Current milestone

- Build a comprehensive catalog of citation styles and variants. Cover author–date, author–page, numeric, and notes and bibliography styles, including disciplinary and publisher variants. Record each style's edition or variant, link to its governing guide where available, and show what citation.inator can format today by source type and citation form. Use real migration examples to identify which gaps matter most and whether a broader style engine would help.
- Run the integration walkthrough on one actual host page using direct HTML compilation and the Chicago preset. Verify one page end to end, including italic titles, year suffixes, access-service preferences and endnote return links.
- Test on a physical phone and with Safari and VoiceOver. Cover opening the inspector, moving it, dismissing it, and returning from an endnote.

## Wishlist

- **Bibliography manager integration.** Start with importing BibTeX, RIS, and CSL-JSON exports from Zotero and other reference managers so authors can reuse curated records across pages. Then explore an opt-in, read-only Zotero connector for importing selected items or collections. Keep source identifiers where available, preview changes on reimport, and preserve local edits and edition distinctions. [Zotero export guide](https://www.zotero.org/support/kb/exporting) and [Zotero API documentation](https://www.zotero.org/support/dev/web_api/v3/basics).
- **Citations for specific versions of research artifacts.** Cite a particular dataset release, code commit, archived webpage, or notebook revision. For example, a chart based on dataset v2.3 should link to that release even after v2.4 comes out. Support locators such as a table, section, or timestamp so readers can find the exact material a claim depends on.
- **Evidence linked to claims.** Let authors record what a source supports, qualifies, or challenges, with an optional excerpt and locator. Show that relationship in the inspector and let readers navigate from a source back to the claims that use it.
- **Retraction and correction notices.** The inspector and endnotes already display a supplied status. Add a short, sourced note and a link to the official notice when available, with distinct labels for retractions, corrections, and expressions of concern. Verify that provider evidence applies to the cited work, flag newly discovered notices for editorial review, and preserve the original citation.
- **Source maintenance.** Give editors a review queue for broken links and newer editions. Show the proposed change alongside the cited record and keep the original edition and the editor's decision traceable.
- **More ways to find and access sources.** Use recurring ISBN misses and gaps in full-text or library access to prioritize additional providers. Preserve edition identity and provider provenance when comparing candidates.

The [launch verification](https://github.com/randal-cox/citation.inator/blob/main/docs/launch-verification.md) records the checks for the local preview. The [product brief](https://github.com/randal-cox/citation.inator/blob/main/docs/prd-citation-inspector.md#milestones) describes the longer-term feature sequence.
