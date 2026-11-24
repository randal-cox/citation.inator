# Learning coverage — 0.5.0

This is the active feature-to-example inventory for [milestone 0.5.0](milestones/0.5.0.md). The implementation column identifies the working 0.5.0 candidate; baseline links retain the released 0.4.0 documentation. Build and run the candidate using [the learning-site instructions](learning-site.md). Local implementation/verification does not imply public deployment or adopter acceptance; those gates remain in the milestone record.

## Feature inventory

| Topic | Existing documentation/example | 0.5.0 teaching deliverable | Current implementation |
| --- | --- | --- | --- |
| Load and initialize | [README](../README.md#load-and-initialize), [integration](integration.md) | Minimal runnable npm and copied-file starters; loading/init at the top | Guide + copied-file/npm ZIPs; both clean starters exercised |
| First citation and endnotes | [Reading room](../demos/static/index.html), [Plain HTML](../demos/drop-in/index.html) | First working citation with source and output together | Playground first; notation, source/cache/config and result together |
| Complete notation and directives | [Guide source](../scripts/build.mjs), [rendered Guide](../demos/static/guide.html) | Searchable notation reference; literals clearly distinguished from processed examples | Complete notation page; identifiers/scopes/groups/names/evidence lessons |
| Citation styles | [Style catalogue](citation-styles.md) | Five presets, supported source/form examples and explicit house-style limits | Five presets in every lesson; support limits and style guide |
| Formatted references and locators | [Integration](integration.md), [article tools](article-tools.md) | Italics/parts, prefix, page/chapter/timestamp locators and narrative/group forms | reference-parts, locators, forms, group; source JSON/editable output |
| Dates, editions and author identities | [Style catalogue](citation-styles.md), [import API](import-api.md) | Original/reprint years, year letters within a reference list and careful edition choices | editions and letters; identity/edition caveats in API guides |
| HTML, Markdown and structured records | [Article tools](article-tools.md), [structured demo](../demos/static/structured-preview.mjs) | Editable source/record tabs with matching rendered output | html, reference-parts and editable record JSON; structured API reference |
| Reader panel behavior | [Integration](integration.md), [Guide](../demos/static/guide.html) | Hover/click, evidence/credit, dragging, resizing/movement where supported, dismiss/focus/returns | Hover control/help; live panels, brand configuration, Guide keyboard/movement recipe |
| Names, icons and styles | [Integration](integration.md), [Reading room](../demos/static/index.html) | Keyword/class prefix, title/icon configuration and component-scoped light/dark CSS | names and branding; Paper/Ink/Compact scoped to result |
| Reader access and services | [Access guide](reader-access.md), [access demo](../demos/static/access-preview.mjs) | Unknown/none/preferences, hidden services, copy-level access, host settings and canonical versus access URLs | access fixture, full access guide and host settings reference |
| Artwork and media | [Media support](media-support.md) | Creator uncertainty, literal dates, institution/accession, rights and source/served checksums | media fixture; attribution/rights/checksums and support matrix |
| Evidence and software credit | [Reading room](../demos/static/index.html), [software citation](../CITATION.cff) | Inspect provenance and integrity notices; configure branding and cite the software | evidence and language; source JSON and software attribution panels |
| Editor notes and identifier spelling | [Article tools](article-tools.md), [editor demo](../demos/static/editor-tools.html) | Describe/annotate/classify, stable work-context notes, minimal/explicit local IDs and round trips | notes + live editor tools; actual draft integration and tools API |
| Tags and reading-list filters | [Article tools](article-tools.md), [bibliography demo](../demos/static/bibliography.html) | Marker tag contributions, work tags, individual styling, filters and empty results | filters + tag-contribution tool; data-ci-tag and threshold docs |
| Shared bibliographies and returns | [Article tools](article-tools.md), [two-article bibliography](../demos/static/bibliography.html) | Site index, cited/listed uses, multiple mentions, page namespaces and contextual return links | site + actual two-article anchors; full shared bibliography tool |
| Import intake and extraction | [Import guide](import-demo.md), [import demo](../demos/import/index.html) | Complete public documents in paste/text/Markdown/PDF/DOCX/ODT paths, source evidence and original-file preservation | Saved/live hosts; public TXT/MD/PDF/DOCX/ODT files, manifest and preserved originals |
| Import review and identifiers | [Import API](import-api.md), [public audit](evidence/import-plos-0294391-2026-11-23.json) | Ambiguous/unmatched groups, DOI/ISBN choices, recovered proposals, local/identifier-free completion and exported Markdown/cache | Fixed DOI teaching metadata; separate live discovery, edition/manual/local completion docs |
| Editor/host integration | [Draft integration](draft-integration.md), [headless API](import-api.md) | Actual draft recipe, host appearance, site-cache reuse, IDs, stale revisions, undo and atomic text/record persistence | Pinned actual draft editor; cancel/convert/site reuse/staging/bundle/text Undo tested; adopter review pending |
| Static sites, builds and browser compiler | [Article tools](article-tools.md), [integration](integration.md) | Static/build recipes and self-contained browser compiler with CSP/source-sanitization guidance | npm static build + copied browser compile; complete offline site ZIP; Pages preview deployed and verified |
| Translation and locale | [Existing access labels](reader-access.md) | Consistent configurable UI catalogue, English fallback, plural rules, locale-aware values and an example translation | language lesson; shared en/es catalogue, twelve independent tests, dynamic inspector/settings checks |
| Failure and offline cases | [Import API](import-api.md), [UX scenarios](ux-adversaries.md) | Missing references, unavailable providers, malformed input, skipped regions, identity conflicts, stale results and safe offline paths | missing lesson; JSON/bootstrap/host404 guards, fixed fixture provenance, cancellation/stale-context tests |

## Shared acceptance checklist

- [x] Clean-consumer checks complete the first citation with npm and copied files using their supplied commands; independent preview archive review passes for `4c7f568`.
- [x] Source notation, reference data and initialization/configuration correspond to the visible result; the 20-lesson browser run and independent documentation review pass. Supported options link to runnable examples or documented limits in the inventory above.
- [x] Playground edits/reset, npm/copied downloads and library-version metadata are exercised locally.
- [x] Public examples use authored teaching prose, attributed bibliographic facts and pinned MIT code; independent provenance review passes.
- [x] Core lessons and fixed import metadata run without external requests; live lookup is separate and fixture exports retain explicit provenance.
- [x] Static deployment works under the GitHub Pages project base path; all 82 public assets and downloaded projects are verified for `4c7f568`, with exact archive checksums in the milestone record.
- [x] Keyboard/focus and emulated touch/narrow layouts pass browser checks; actual desktop/phone-size screenshots and source readability passed independent UX review. This does not claim physical-device or new Safari acceptance.
- [x] Translation covers labels, plurals, values, fallback and escaped overrides; English/Spanish runtime changes preserve unsaved fields.
- [ ] The standard milestone checks and independent reviews pass; worked draft integration receives adopter review.

## Boundaries

The learning site explains the supported library and its experimental limits; it does not certify every citation manual, reconstruct arbitrary native layouts or edit native document formats. Manager connections and ongoing source maintenance remain in 0.6.0. A generic reusable import-review component is a possible host-UI follow-up, not an additional prerequisite silently added to this learning milestone.
