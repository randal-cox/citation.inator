# PRD: Portable Citation Inspector

Status: draft v0.1, 2026-11-10

## Product summary

The Portable Citation Inspector is a permissively licensed, framework-neutral citation system for Markdown, static sites, dynamic applications, and Inator Commons consumers. Authors place readable citation directives in source text. The system resolves scholarly metadata algorithmically, renders accessible inline author-year citations, generates endnotes, and opens a rich citation inspector with bibliographic metadata, abstract, status, provenance, and lawful access destinations.

It must remain useful without a server, an account, an LLM, or Inator Commons.

## Problem

Ordinary web citations force readers to choose between two poor experiences:

- opaque links or DOI strings that interrupt reading, or
- endnotes that require leaving the claim and hunting through a bibliography.

Authors also repeatedly hand-assemble metadata and access links even though mature scholarly services already expose them. Existing tools solve parts of the problem—citation formatting, metadata lookup, open-access resolution, or hover previews—but do not provide the complete portable interaction envisioned here.

## Goals

1. Keep source authoring readable and portable.
2. Resolve DOI, PMID/PMCID, arXiv, ISBN, URL, dataset, software, and other identifiers through provider adapters.
3. Render correct inline citations and a collated endnote bibliography.
4. Provide a compact, accessible citation inspector with full metadata and useful destinations.
5. Preserve raw provider evidence and deterministic merge decisions.
6. Work at build time, runtime, offline from cache, and in degraded static form.
7. Be framework-neutral and adoptable outside the Inator ecosystem.
8. Support an optional Commons adapter with draggable/resizable inspection behavior.
9. Detect and display corrections, retractions, expressions of concern, and version status when reliable data are available.
10. Be given away under a permissive open-source license.

## Non-goals

- LLM-generated summaries or abstracts
- Citation recommendation or automatic claim generation
- A full reference manager replacing Zotero
- Paywall circumvention
- Automated discovery, rotation, or health monitoring of Sci-Hub mirrors or IP addresses
- Analytics on reader citation opens or outbound clicks
- Requiring Commons, React, a CMS, or a hosted service

The core may expose a generic administrator-configured external-destination adapter. Such adapters are disabled by default, are not populated from document syntax, and remain the adopting site's legal and security responsibility.

## Users

### Author

Writes readable Markdown or CMS content, inserts citations, optionally supplies human-readable hints, and expects deterministic output.

### Reader

Reads without interruption, inspects a source when desired, understands its status and version, and reaches the best available lawful destination.

### Editor/reviewer

Audits metadata, resolves conflicts, corrects records, and inspects raw provider responses.

### Site/application developer

Installs the framework-neutral core, selects providers and policies, and optionally supplies a site-specific UI adapter.

### Institution/user with academic access

Configures an OpenURL resolver or library proxy without changing the document source.

## Authoring grammar

The exact grammar will be finalized during implementation. Required capabilities:

```md
{cite doi:10.1234/example}
{cite doi:10.1234/example | Cox, 1993}
{cite cox-1993}
{cite pmid:12345678}
{cite pmcid:PMC1234567}
{cite arxiv:2401.12345}
{cite isbn:9780000000000}
{cite url:https://example.org/work}
{cite dataset:https://doi.org/10.1234/dataset}
{cite software:https://doi.org/10.5281/zenodo.example}
```

Multiple citations:

```md
{cite doi:10.1234/one; doi:10.1234/two}
```

Narrative citation:

```md
{cite doi:10.1234/example | form:narrative}
```

Possible output:

```md
*Cox et al.* wrote in 1993 that ...
```

Author-controlled display override:

```md
{cite doi:10.1234/example | label:"the original Cox study"}
```

Endnote insertion:

```md
{endnotes}
```

Principles:

- DOI is the default identifier when no scheme is supplied and the value parses as a DOI.
- URL identifiers are inspected for recognizable DOI, PubMed, PMC, arXiv, ISBN, repository, dataset, or software patterns before remaining generic URLs.
- Human-readable hints are optional and never become identity keys.
- Citation identity comes from normalized persistent identifiers, not author-year text.
- Source syntax must remain intact and useful if the rich renderer is unavailable.
- Escaping and literal-brace behavior must be formally specified.

## Citation forms

Required v1 forms:

- Parenthetical: `(Cox, 1993)`
- Narrative author: `Cox (1993)`
- Narrative author-only for prose-controlled year placement
- Suppress author
- Suppress year
- Multiple citation cluster
- Custom visible label

APA is the initial default. The architecture must use CSL-compatible records so additional styles can be added without changing document syntax.

Same-author/same-year `a`, `b`, and later suffixes are computed across the document's final bibliography order. Persistent identifiers remain the actual disambiguators.

## Content model

Each canonical citation record contains:

- stable local record ID
- normalized identifiers: DOI, PMID, PMCID, arXiv, ISBN, OpenAlex, DataCite, URL, others
- work type
- title and subtitle
- authors with structured given/family names and ORCID when available
- editors and other contributors
- issued, online, print, and accessed dates
- journal/container, volume, issue, pages/article number
- publisher
- abstract and abstract source
- language
- license
- version type: version of record, accepted manuscript, preprint, dataset, software release, unknown
- retraction/correction/expression-of-concern status and evidence
- access locations with provider, URL, format, version, license, and verification time
- formatted CSL-JSON
- manual overrides
- raw provider payload references
- merge log and conflict record
- retrieved/refreshed timestamps
- cache policy

## Metadata providers

Initial adapters:

1. Crossref: DOI metadata and publisher-deposited bibliographic records
2. DataCite: DOI metadata, especially datasets and software
3. OpenAlex: connected scholarly metadata, topics, identifiers, open-access status, and available lawful full text
4. Unpaywall: lawful DOI-level open-access locations
5. NCBI E-utilities/PubMed/PMC: biomedical records, abstracts, identifier conversion, and PMC access
6. arXiv: preprint metadata and PDFs
7. DOI content negotiation
8. Open Library or equivalent ISBN provider in a later milestone
9. Configurable OpenURL institutional resolver
10. Crossmark/Retraction Watch-compatible status source where licensing and access permit

These are the third-party APIs implicated by browser/runtime resolution. Sending a DOI to them discloses that a particular visitor or site requested that DOI. Build-time resolution avoids per-reader disclosure and is preferred by default.

## Resolution modes

### Build-time mode

Recommended default for public publishing.

- Parse directives during site generation.
- Resolve and merge metadata once.
- Store normalized records and raw provider payloads with the build artifact or local cache.
- Emit progressively enhanced HTML.
- Readers do not contact scholarly metadata APIs merely by opening or hovering over a citation.

### Runtime mode

Optional for applications and newly entered citations.

- Resolve on explicit user activation, not hover.
- Observe provider rate limits.
- Cache successful and negative results.
- Expose loading, partial, stale, and failure states.

### Hybrid mode

- Ship cached build-time data.
- Refresh stale records asynchronously according to site policy.
- Never replace a complete working record with a failed or less complete refresh.
- Surface meaningful status changes such as a retraction.

### Static/degraded mode

- Render readable author-year text and conventional endnotes.
- Link persistent identifiers through stable resolvers.
- No JavaScript dependency for basic citation access.

## Merge and precedence

The system retains every provider response but creates one canonical display record.

Initial precedence is field-specific rather than provider-global:

- persistent identifier registration: DOI agency/Crossref/DataCite
- biomedical indexing and PMID/PMCID relationships: NCBI
- publisher bibliographic fields: Crossref/DataCite or publisher content negotiation
- open-access location: OpenAlex/Unpaywall/PMC/arXiv, retaining version and license
- correction/retraction status: Crossmark, Crossref relations/updates, PubMed publication types, Retraction Watch-compatible data

Conflicting values are recorded. The default reader interface remains uncluttered; a small provenance/status control opens technical details. Raw responses are available to editors/developers.

Manual overrides are phase 2. Once set, an override remains authoritative until explicitly removed. Automatic refreshes may flag disagreement but do not silently overwrite it.

## Abstract policy

- Display only an abstract supplied by a named bibliographic provider or manually entered by an authorized editor.
- Never synthesize an abstract with an LLM in this product.
- Label the abstract source with a small unobtrusive control.
- Preserve provider text faithfully except for safe markup normalization.
- If no abstract is available, state that plainly.
- Account for provider licensing/terms when caching or redisplaying abstracts.

## Reader interaction

### Inline control

- The rendered author-year citation is an accessible interactive control.
- It remains visually citation-like rather than becoming a large conventional button.
- Hover and keyboard focus may show a compact preview: title, lead author(s), year, and status.
- Click, Enter, or Space opens the full inspector.
- A secondary endnote action moves focus to the corresponding bibliography entry.

### Desktop inspector

- Opens adjacent to the activated citation when space permits.
- Repositions to remain within the viewport.
- Initially sizes itself from content within configured minimum and maximum dimensions.
- May be dragged and resized temporarily.
- Returns to citation-relative placement on every new open.
- Position and size are not persisted after close in v1.
- Only one inspector is open at a time in v1.
- No pinning in v1. Pinning's main use case would be comparing multiple sources, which the endnote bibliography better serves initially.

### Touch/mobile

- Citation remains tappable.
- Full inspector becomes an accessible bottom sheet or full-width dialog.
- Dragging/resizing is omitted.
- Endnote navigation and destination buttons remain available.

### Keyboard and screen readers

- Native button/link semantics or equivalent correct ARIA semantics
- Meaningful accessible name, e.g. `Inspect citation: Cox et al., 1993`
- Enter/Space opens; Escape closes
- Focus moves into the inspector on open and returns to the triggering citation on close
- Focus is contained appropriately while modal on small screens
- Screen readers receive the formatted citation and status without needing hover
- Status changes such as loading or resolution failure use restrained live-region announcements
- Reading order does not depend on the pane's dragged visual position
- Reduced-motion preferences are honored
- All controls have visible focus and meet target-size and contrast requirements

## Inspector information architecture

1. Status strip: retracted, corrected, expression of concern, preprint, accepted manuscript, version of record, or unknown
2. APA-formatted citation
3. Title
4. Authors
5. Publication/container metadata
6. Abstract
7. Divider
8. Destination button bar
9. Compact provenance/retrieval details control

The status strip takes priority over decorative metadata. A retraction must not be visually buried.

## Destination buttons

Buttons occupy stable positions. Unavailable buttons remain present but disabled with an explanation.

Initial button classes:

- Open PDF
- PubMed record
- PubMed Central full text
- DOI resolver
- Publisher/journal page
- arXiv/preprint
- Institutional access/OpenURL resolver
- Endnote
- Copy formatted citation
- Copy DOI/persistent identifier
- Status/correction record
- Report metadata problem

PubMed and PMC remain separate: PubMed is an authoritative bibliographic/index record; PMC is a full-text repository. Conflating them obscures both availability and version.

The PDF button prefers a lawful provider-confirmed PDF from PMC, arXiv, OpenAlex, Unpaywall, an institutional repository, or an explicit publisher location. It records and displays version type where known.

Version badges remain explicit. A preprint, accepted manuscript, and version of record may share title/author metadata while differing materially in review status and text.

Institutional access uses a configurable OpenURL base or consumer-supplied resolver. Anonymous users see a neutral configuration/help state or a site-provided default—not embedded credentials.

Destination controls expose recognizable provider names and, where useful, the destination domain in accessible description or tooltip. Raw domains need not clutter the visible button label.

## Link security

Even when adapters are written by us, URLs arrive through external metadata and may be stale, malformed, compromised, or unexpectedly redirected.

Requirements:

- allow only `https:` destinations by default
- reject script/data/file schemes
- normalize and validate identifiers before interpolation
- route DOI through `doi.org` rather than blindly trusting arbitrary publisher URLs where appropriate
- apply provider-specific domain rules for PubMed, PMC, arXiv, and known services
- visibly distinguish arbitrary publisher/repository domains
- use safe external-link attributes and prevent opener access
- never expose API keys or institutional credentials in generated public HTML
- store link provenance and verification time

## Endnotes

`{endnotes}` renders the document's deduplicated bibliography using the selected CSL style.

Requirements:

- deterministic ordering
- same-author/same-year suffixes synchronized with inline citations
- backlinks to every in-text occurrence
- stable anchors
- status badges
- conventional printable output
- functional no-JavaScript links
- optional grouping by section or chapter later

## Reporting incorrect metadata

The core dispatches a structured `citation-report` event/callback containing:

- citation record ID
- persistent identifiers
- page URL and citation location
- current canonical metadata
- provider timestamps
- optional user message

The consuming site decides whether this opens:

- a configured email draft
- a feedback form
- a GitHub issue template
- an internal queue
- nothing

Contact information belongs in site configuration, never inside `{cite ...}` source directives. This avoids publishing private phone numbers or email addresses throughout content.

## Caching and refresh

- Default freshness target: 24 hours when refresh cost and provider terms permit
- Configurable per provider and deployment
- Retain last-known-good records through outages
- Automatic refresh in hosted/hybrid environments
- Build command for static sites
- Manual force-refresh for debugging
- Negative-result caching with shorter TTL
- Status-sensitive refresh may be more frequent than stable bibliographic metadata
- Cache is exportable and portable

## Package architecture

Proposed packages:

### `@citation-inspector/core`

- directive grammar and parser
- normalized schema
- identifier recognition
- deterministic merge engine
- cache interfaces
- provider adapter contract
- CSL-JSON output
- framework-independent events

### `@citation-inspector/providers`

- Crossref
- DataCite
- OpenAlex
- Unpaywall
- NCBI/PubMed/PMC
- arXiv
- DOI content negotiation
- OpenURL adapter

### `@citation-inspector/cli`

- scan Markdown/content
- resolve citations
- emit cache and HTML/JSON artifacts
- refresh and audit
- validate unresolved/conflicting/status-changed records

### `<citation-inspector>` Web Component

- framework-neutral inline control and inspector
- progressive enhancement
- accessibility behavior
- desktop and mobile layouts
- theming through CSS custom properties and parts

### Commons adapter

- optional integration with Commons draggable/resizable pane conventions
- shared typography, controls, status patterns, and lifecycle
- does not become a dependency of the portable core

### Markdown integration

The core owns the citation directive parser and an abstract syntax representation. Ecosystem-specific adapters integrate with Markdown/MDX/static-site pipelines. This prevents each consumer from implementing a subtly incompatible grammar.

## Offline behavior

- Previously resolved citations work fully from local cache.
- Unresolved citations render readable fallback text and identifier links.
- Inspector clearly distinguishes offline, stale, unresolved, and provider-error states.
- No network request is required to read cached metadata or endnotes.
- Portable export includes normalized records necessary to reproduce the rendered document.

## Theming

- Sensible neutral default theme
- CSS custom properties and shadow-part hooks
- no dependence on site fonts or brand colors
- consumer controls motion, elevation, borders, typography, and status colors within accessibility constraints
- print stylesheet renders inline citations and endnotes without interactive chrome

## Privacy

- No product analytics
- No click tracking
- Build-time resolution preferred
- Runtime requests occur only on explicit activation or application-controlled prefetch, never mere hover
- Document which identifiers are sent to which providers
- Do not include logged-in institutional URLs, tokens, or personal resolver credentials in public artifacts

## Testing

### Grammar

- each identifier type
- multiple citations
- narrative/suppressed/custom forms
- malformed and escaped directives
- duplicate records
- same-author/same-year disambiguation

### Metadata

- provider conflict fixtures
- missing authors/dates/abstracts
- Unicode and structured names
- corrections/retractions
- preprint-to-version-of-record relationships
- raw payload preservation
- manual override protection in phase 2

### Interaction

- mouse, keyboard, touch, and screen reader flows
- focus restoration
- viewport collision and dynamic sizing
- drag/resize boundaries
- one-inspector lifecycle
- mobile bottom sheet
- reduced motion and zoom

### Reliability/security

- offline and provider outage
- stale cache refresh
- rate limits
- malicious URLs and unsafe schemes
- redirects
- API schema drift
- negative-cache recovery
- static no-JavaScript rendering

### Accessibility

- automated WCAG checks
- keyboard-only assay
- VoiceOver on Safari/macOS and iOS
- screen reader names/status/order
- 200% and 400% zoom
- touch target and contrast checks
- forced colors and reduced motion

## Milestones

The original phases below describe planned sequencing. See the roadmap for current progress.

### Deterministic core

- grammar
- DOI/PMID/arXiv/URL recognition
- normalized schema
- Crossref, OpenAlex, NCBI, and arXiv adapters
- Citation.js/CSL formatting decision and spike
- cache and raw payload storage
- CLI resolution
- static inline citations and endnotes

### Portable inspector

- Web Component
- accessible click/focus interaction
- compact preview
- desktop anchored inspector
- mobile bottom sheet
- destination buttons
- offline/degraded state

### Access and integrity

- Unpaywall and PMC full-text resolution
- version badges
- institutional OpenURL configuration
- correction/retraction pipeline
- security validation
- report callback/event

### Commons adoption

- Commons pane adapter
- drag/resize behavior
- shared status and control patterns
- adoption in an independent website and one Inator consumer

### Later

- manual metadata editing and durable overrides
- broader source classes and additional book catalogs
- comparison/pinning if real use demands it
- collaborative correction workflow
- citation graph and related-work exploration

## Open decisions

1. Final directive grammar and escape rules
2. Whether narrative form controls typography or only citation structure
3. Citation.js versus direct citeproc-js integration
4. Exact abstract caching/display permissions by provider
5. Correction/retraction data source and license
6. Default static-site artifact format
7. Whether compact hover preview survives usability testing
8. Email, form, or issue-tracker implementation for first adopter
9. MIT versus Apache-2.0 license
10. Product/package name

## Existing work to reuse

- Citation.js for identifier/format conversion and CSL output
- CSL/citeproc-js for citation formatting
- Crossref and DataCite for DOI metadata
- OpenAlex and Unpaywall for scholarly graph and open-access locations
- NCBI E-utilities and PMC services for biomedical metadata and full text
- arXiv metadata and PDFs
- DataCite's unsupported citation widget as a narrow prior implementation to inspect, not adopt blindly

The product's original contribution is the portable authoring grammar, deterministic multi-provider record, integrity/status layer, accessible reader interaction, offline/export behavior, and optional Commons inspection experience.
