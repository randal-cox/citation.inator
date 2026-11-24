# Learning coverage — 0.5.0

This is the active feature-to-example inventory for [milestone 0.5.0](milestones/0.5.0.md). Existing links identify the released **0.4.0** baseline; they do not claim that a new tutorial, downloadable starter or hosted playground has been delivered. Each new example must show its library version, complete source/configuration, visible output, reset/download controls where relevant and support limits.

## Feature inventory

| Topic | Existing documentation/example | 0.5.0 teaching deliverable |
| --- | --- | --- |
| Load and initialize | [README](../README.md#load-and-initialize), [integration](integration.md) | Minimal runnable npm and copied-file starters; loading/init at the top |
| First citation and endnotes | [Reading room](../demos/static/index.html), [Plain HTML](../demos/drop-in/index.html) | First working citation with source and output together |
| Complete notation and directives | [Guide source](../scripts/build.mjs), [rendered Guide](../demos/static/guide.html) | Searchable notation reference; literals clearly distinguished from processed examples |
| Citation styles | [Style catalogue](citation-styles.md) | Five presets, supported source/form examples and explicit house-style limits |
| Formatted references and locators | [Integration](integration.md), [article tools](article-tools.md) | Italics/parts, prefix, page/chapter/timestamp locators and narrative/group forms |
| Dates, editions and author identities | [Style catalogue](citation-styles.md), [import API](import-api.md) | Original/reprint years, year letters within a reference list and careful edition choices |
| HTML, Markdown and structured records | [Article tools](article-tools.md), [structured demo](../demos/static/structured-preview.mjs) | Editable source/record tabs with matching rendered output |
| Reader panel behavior | [Integration](integration.md), [Guide](../demos/static/guide.html) | Hover/click, evidence/credit, dragging, resizing/movement where supported, dismiss/focus/returns |
| Names, icons and styles | [Integration](integration.md), [Reading room](../demos/static/index.html) | Keyword/class prefix, title/icon configuration and component-scoped light/dark CSS |
| Reader access and services | [Access guide](reader-access.md), [access demo](../demos/static/access-preview.mjs) | Unknown/none/preferences, hidden services, copy-level access, host settings and canonical versus access URLs |
| Artwork and media | [Media support](media-support.md) | Creator uncertainty, literal dates, institution/accession, rights and source/served checksums |
| Evidence and software credit | [Reading room](../demos/static/index.html), [software citation](../CITATION.cff) | Inspect provenance and integrity notices; configure branding and cite the software |
| Editor notes and identifier spelling | [Article tools](article-tools.md), [editor demo](../demos/static/editor-tools.html) | Describe/annotate/classify, stable work-context notes, minimal/explicit local IDs and round trips |
| Tags and reading-list filters | [Article tools](article-tools.md), [bibliography demo](../demos/static/bibliography.html) | Marker tag contributions, work tags, individual styling, filters and empty results |
| Shared bibliographies and returns | [Article tools](article-tools.md), [two-article bibliography](../demos/static/bibliography.html) | Site index, cited/listed uses, multiple mentions, page namespaces and contextual return links |
| Import intake and extraction | [Import guide](import-demo.md), [import demo](../demos/import/index.html) | Complete public documents in paste/text/Markdown/PDF/DOCX/ODT paths, source evidence and original-file preservation |
| Import review and identifiers | [Import API](import-api.md), [public audit](evidence/import-plos-0294391-2026-11-23.json) | Ambiguous/unmatched groups, DOI/ISBN choices, recovered proposals, local/identifier-free completion and exported Markdown/cache |
| Editor/host integration | [Draft integration](draft-integration.md), [headless API](import-api.md) | Actual draft recipe, host appearance, site-cache reuse, IDs, stale revisions, undo and atomic text/record persistence |
| Static sites, builds and browser compiler | [Article tools](article-tools.md), [integration](integration.md) | Static/build recipes and self-contained browser compiler with CSP/source-sanitization guidance |
| Translation and locale | [Existing access labels](reader-access.md) | Consistent configurable UI catalogue, English fallback, plural rules, locale-aware values and an example translation |
| Failure and offline cases | [Import API](import-api.md), [UX scenarios](ux-adversaries.md) | Missing references, unavailable providers, malformed input, skipped regions, identity conflicts, stale results and safe offline paths |

## Shared acceptance checklist

- [ ] A new developer completes the first citation from a clean download, with and without npm, using only the supplied instructions.
- [ ] Source notation, reference data and initialization/configuration correspond to the visible result; existing supported options link to a runnable example or an explicit documented limit.
- [ ] Playground edits, reset and downloaded projects work; examples identify the tested library version.
- [ ] Public examples use rights-cleared material and contain no private manuscripts, credentials or telemetry.
- [ ] Core lessons work with local compilation and saved provider fixtures. Fixture evidence and optional live lookup are distinguishable.
- [ ] Static deployment works under the GitHub Pages project base path; deployed links/assets and downloadable projects are verified.
- [ ] Keyboard, focus, touch/narrow layouts, contrast and source readability are checked on the actual output. Platform evidence remains specific.
- [ ] Translation example covers labels, plural categories, values and English fallback, including actionable failures.
- [ ] The standard milestone checks and independent reviews pass; worked draft integration receives adopter review.

## Boundaries

The learning site explains the supported library and its experimental limits; it does not certify every citation manual, reconstruct arbitrary native layouts or edit native document formats. Manager connections and ongoing source maintenance remain in 0.6.0. A generic reusable import-review component is a possible host-UI follow-up, not an additional prerequisite silently added to this learning milestone.
