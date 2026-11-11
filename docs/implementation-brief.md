# citation.inator implementation brief

## Build the smallest real vertical slice

Do not begin with every provider or Commons drag behavior. Prove the portable contract first.

### Slice 1: static compiler and plain HTML consumer

Input:

```md
Empathic concern can intensify partisan polarization {cite doi:10.1017/S0003055419000534}.

Moral reframing can improve cross-partisan persuasion {cite doi:10.1111/spc3.12501}.

{endnotes}
```

Output:

- semantic inline citation controls
- a conventional bibliography
- stable backlinks
- cached normalized JSON
- fully readable no-JavaScript HTML
- progressive enhancement hooks

Use the fixture records first; provider calls may be introduced after deterministic rendering works.

### Slice 2: portable Web Component

Implement a framework-neutral custom element that:

- enhances existing inline citation markup;
- opens one citation inspector at a time;
- supports mouse, keyboard, touch, reduced motion, and screen readers;
- uses an anchored inspector on desktop and bottom sheet/dialog on mobile;
- initially avoids drag/resize until the accessible open/close/focus lifecycle is proven;
- leaves endnotes and stable links working if enhancement fails.

### Slice 3: build-time resolver

Add provider adapters in this order:

1. Crossref for DOI metadata
2. OpenAlex for identifier reconciliation, open-access locations, and status context
3. NCBI for PMID/PMCID and biomedical records
4. arXiv
5. Unpaywall
6. DataCite for datasets/software and non-Crossref DOIs

Store every raw provider payload and a deterministic merge log.

### Slice 4: dynamically served demo

Demonstrate explicit runtime resolution and refresh:

- no requests on hover
- visible loading/partial/failure states
- last-known-good cache retention
- 24-hour default refresh policy
- negative-result caching
- provider rate-limit compliance

### Slice 5: Commons adapter

Only after the standalone component works:

- adopt Commons pane conventions
- add draggable/resizable behavior
- verify that visual movement does not alter accessible reading/focus order
- preserve the framework-neutral package and plain HTML demonstration

## Proposed repository shape

```text
packages/
  core/
  providers/
  cli/
  web-component/
  commons-adapter/
demos/
  static/
  dynamic/
  drop-in/
fixtures/
docs/
```

## Early technical decisions to spike

- Citation.js versus direct citeproc-js integration
- directive parser grammar and escaping
- normalized record schema versioning
- browser-safe cache format
- Shadow DOM versus light DOM for accessibility and theming
- Popover API support versus robust dialog fallback
- abstract caching/display terms by provider
- correction/retraction source and license

## Recommended first distribution

Offer both:

1. an npm package for normal development; and
2. a versioned ESM bundle plus CSS and cache JSON for copy/drop-in use.

Make the assets available for adopters to host locally.

## Demo pages

### Static

- all metadata pre-resolved
- script optional
- intentionally disable network during verification
- show DOI article, ISBN-only book, repository dissertation, and unresolved citation

### Dynamic

- accept a citation directive or identifier
- resolve on explicit action
- show raw provider and merged record views in a developer panel
- simulate provider outage and stale cache
- never overwrite a last-known-good record with a failed refresh

### Drop-in

- separate plain HTML directory with no monorepo imports
- concise integration instructions
- one script, one stylesheet, one data file
- use this exact artifact for integration testing on an adopting site

## First questions the implementation should answer empirically

1. Can a static page retain useful citation inspection without runtime APIs?
2. Does a compact hover preview help, or merely create interaction noise?
3. Can the anchored inspector remain legible at 200–400% zoom?
4. Is drag/resize useful enough to justify its complexity?
5. How often do providers disagree on titles, dates, authors, and abstracts?
6. How should book-level DOIs and ISBN editions coexist?
7. How should author preprints differ visually from versions of record?
8. What is the smallest integration an adopting site can deploy confidently?


## Adversarial UX acceptance

Use [UX adversaries](ux-adversaries.md) alongside the citation/data adversaries. Start with the first eight scenarios in the initial vertical slice and complete the applicable matrix against the actual standalone artifact before sharing it with adopters. Record failures and untested cases explicitly.
