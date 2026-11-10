# Launch decisions

The 0.1.0 slice ships one MIT npm package, a copied browser ESM, and a plain HTML consumer. Commons checkout `c802bb4` has a Trust citation registry in `packages/ui/src/citation-registry.js` with structured contributors, identifiers and CSL export. A later adapter can map shared fields into that registry and retain citation.inator's editorial evidence and document-occurrence semantics. The core, resolver, compiler, and browser component currently have no Commons dependency.

## Source and identity

The source preparation came from `social.inator/handoffs/citation.inator`. Both project directories lack Git metadata at launch. The original PRD, handoff, fixtures, and misspelled original source filename remain as supplied. `scripts/demo-cache.mjs` adapts the mixed fixture values into a versioned cache with typed arrays and separate date parts.

- JSTOR's own record gives the title, author, copyright year and DOI `10.2307/j.ctv2wr4wbd`. The demo keeps that digital DOI record separate from Princeton's ISBN record. The publisher page surfaces the same ISBN across formats, so the normalized record leaves Farneth's edition label unspecified. [JSTOR book record](https://www.jstor.org/stable/j.ctv2wr4wbd) and [Princeton University Press record](https://press.princeton.edu/books/paperback/9780691198927/the-politics-of-ritual).
- The Feiler record uses the publisher-confirmed hardcover ISBN. The Givens handoff retains its additional identifiers for edition review, while the demo indexes its publisher DOI. [Penguin Random House record](https://www.penguinrandomhouse.com/books/738772/a-time-to-gather-by-bruce-feiler/9780593656433/).
- Simas and colleagues published online on October 31, 2019, with the journal issue in February 2020. The demo cites 2020 and keeps the author-hosted PDF distinct from the journal version of record. [Cambridge article](https://www.cambridge.org/core/journals/american-political-science-review/article/how-empathic-concern-fuels-political-polarization/8115DB5BDE548FF6AB04DA661F83785E) and [author's preprint PDF](https://scottaclifford.com/wp-content/uploads/2012/02/SimasCliffordKirkland_Empathy-and-Polarization_Preprint.pdf).
- Frost's source is a repository PDF. The record uses a local key and keeps the download URL as a location. The negative examples retain the supplied wording and the state “unresolved.” [University of Minnesota dissertation](https://conservancy.umn.edu/bitstreams/a9ef5019-29d1-45ad-9bb1-a8d97bde44f5/download).

## Formatting and interaction

The Citation.js CSL plugin formats citations through citeproc-js. Its dependency offers CPAL or AGPL licensing. This release uses the supplied curated references for the demo, a bounded author-year formatter for newly resolved records, and a CSL-JSON export seam for consumers with a style engine. It does not claim full APA or CSL conformance. Year suffixes are assigned across the emitted bibliography, including collisions where different author lists display the same `et al.` form. [Citation.js CSL integration](https://citation.js.org/index.html) and [citeproc-js license](https://app.unpkg.com/citeproc%402.4.11/files/LICENSE).

The inspector uses a nonmodal top-layer pane on desktop and a native modal sheet on narrow, touch, or short viewports. Browsers with dialog support and without popovers use the sheet. Click or keyboard activation opens the full pane. Hover previews and drag/resize are deferred. The DOI is linked from the formatted reference when present and from provenance. The publisher action stays in its slot and points to a distinct publisher page when one is recorded.

## Resolution and access

Crossref is the first live adapter. Resolution is explicit. The adapter serializes requests, coalesces concurrent requests for a DOI, observes `Retry-After` on 429 and 503, and uses a 24-hour successful cache window and a five-minute negative cache window. A 404 means the DOI was unresolved by Crossref. Partial responses and transport failures retain complete prior records. Conflicts, rejected identity mismatches and raw responses are retained in the local developer cache. Other identifier schemes use the shipped or supplied cache. [Crossref REST API](https://www.crossref.org/documentation/retrieve-metadata/rest-api) and [API etiquette](https://www.crossref.org/documentation/retrieve-metadata/rest-api/tips-for-using-the-crossref-rest-api/).

Crossref abstracts remain in local provider evidence when supplied. The adapter does not republish them by default while redistribution terms are unresolved. The component accepts attributed plain-text abstracts from an authorized cache. Integrity status requires sourced evidence and is not inferred from Crossref's update relation alone. Additional provider adapters, automated status reconciliation, and institution-specific configuration remain separate work.


## Reader interface revision

Click stays the default, with opt-in mouse hover previews and three theme examples in both demos. Source actions are compact, labelled icons and are omitted when unavailable. Endnote return icons show an excerpt of the surrounding prose and keep their original anchors. The Simas record includes a short excerpt from the publisher's abstract with a source link. The demo keeps its raw provider payload in local evidence. [Cambridge abstract](https://www.cambridge.org/core/journals/american-political-science-review/article/how-empathic-concern-fuels-political-polarization/8115DB5BDE548FF6AB04DA661F83785E#abstract).
