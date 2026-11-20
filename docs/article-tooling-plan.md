# Article editing, site bibliographies and citation import

20 November 2026. **Proposed implementation plan; these APIs and features are not available in 0.1.4.** No next milestone version has been chosen. This plan responds to four adopter requests: cross-page return links (F1), record tags (F2), editor queries and marker notes (F3), and formatted-document import (F4).

## Design direction

Keep three things distinct: a bibliographic record describes a particular work or edition; an occurrence describes where an article uses it; editor metadata helps a contributor manage the source. A site-wide bibliography joins records to occurrences without changing an article's own bibliography, year letters or reference numbering.

The library supplies portable record/query functions, compiler output and browser presentation. The host supplies page routes, the published-page inventory, authoring UI, authentication, file storage and review/publication workflow. Import functions propose changes for review; they do not open pull requests, publish articles or silently replace a source.

## What exists today

- `compileCitations`, the HTML/Markdown adapters and the JSON CLI compile authored notation. Structured occurrence plans provide stable occurrence IDs and anchor IDs for application-rendered citations.
- Reading lists have `data-ci-list-record` hooks. Return links currently refer to uses in the same compiled fragment. The record normalizer does not retain a `tags` field.
- The reporting API finds unused records, unresolved notation, duplicate candidates and year conflicts. It does not yet produce a site-wide occurrence index with page URLs.
- Crossref resolves a supplied DOI; Open Library resolves a supplied ISBN and separately searches for book candidates by title/author. Search proposals do not update the cache.
- **`note:` is not an editor-only option today.** The current parser can interpret it as the legacy display hint, which appears for an unresolved citation. Editors must wait for explicit note support before relying on it to stay out of rendered output. This was reproduced locally with `{citation missing-work | note:"Editor only"}`.

## F3 first: query and annotation tools for editors

Add an explicit quoted `note:` option that is separate from `label:`, the legacy unresolved hint, and a record's bibliographic `note` field. It must have no effect on HTML, accessible names, return-link context, diagnostics or returned bibliographic records, including when a source is unresolved. Editor notes are an authoring aid, not a place to store secrets: hosts may publish source files.

Proposed public functions, with final signatures settled before implementation:

```js
describeCitation(identifierOrMarker, cache, options)
annotateMarkers(source, cache, options)
```

`describeCitation` should provide a plain-text description plus structured status/diagnostics for host tools. A convenience text field can be `Cox 1995` in Chicago or `Cox, 1995` in APA. Support identifiers and full markers explicitly; malformed notation, missing records and unresolved records must be distinguishable. A missing record must not acquire a plausible author/year from its old note.

`annotateMarkers` should return source, proposed edits and diagnostics. A dry-run/check CLI reports stale notes without writing files; an explicit transformation mode returns the edited source. The host owns saving it. Repeated annotation is idempotent. Unknown or malformed markers remain intact with diagnostics rather than being partially rewritten.

Use the compiler's own style, reprint, author-disambiguation and suffix logic. Standalone descriptions cannot infer a page's year letters or numeric citation order. Source annotation must use that document's complete citation context; any context-free fallback must be documented. Never use cached editor notes as formatting input.

The current grammar attaches options to individual items in a group. Prefer one note per cited item, for example `{citation bell | note:"Bell 1992"; turner | note:"Turner 1969"}`. A whole-marker query can still return `Bell 1992; Turner 1969`. Confirm and document this scope before shipping rather than introducing an ambiguous group option.

Preserve bytes outside changed note ranges, including whitespace, CRLF, escaped braces, quoted separators, custom citation keywords and Unicode. Format-aware annotation needs source offsets: skip code fences, code spans, HTML attributes, scripts and other excluded regions. Do not annotate by compiling and reserializing the whole article. Stage plain-text notation support separately if HTML/Markdown fidelity needs more work, and document each supported input format.

Expose the same core functions in Node and a documented browser build. A browser source-module import and the existing self-contained inspector bundle are different distribution paths; provide and test an explicit tool entry point. Add JSON CLI operations for descriptions, annotation and stale-note checks so non-JavaScript build systems need no custom Node adapter.

Acceptance: compiling with/without a note gives identical results for resolved, missing and partial records; editing a year refreshes its note; a second run makes no edits; grouped citations, escaping, reprints, page-local year letters, custom keywords and excluded code regions behave as documented. Test the CLI and clean browser/Node consumers too.

## F1 next: site-wide bibliography and return links

Use a host-supplied occurrence index keyed by stable record ID. A proposed `siteOccurrences` compiler option avoids confusing this index with `planCitationOccurrences`' ordered input. Each entry should carry a page identifier/title, an occurrence identifier, the final published `href` and a short text context. Keep page-dependent usage outside canonical bibliographic records.

Support a two-pass build:

1. Compile each published article with a unique namespace and collect its actual emitted anchors and record IDs. Prefer stable structured occurrence IDs when the host has them. The compiler must expose occurrence information rather than forcing the host to scrape generated HTML or predict counter-based IDs.
2. The host combines those results with published routes and supplies the index when compiling its site-wide list and inspector data. Rebuild affected bibliography output when an article is removed or renamed.

Render ordinary anchors under each reading-list/bibliography entry, grouped by page with distinguishable mention letters and contextual accessible names such as `Return to Consent — as Bell argues… (occurrence b)`. The inspector uses the same accepted data for a `Cited on this site` section. Existing local return links stay local. Do not duplicate a mention just because it appears in both inputs, or count a list's Inspect action as a new citation occurrence.

Validate link schemes and site origin/base path; allow documented relative paths for static deployments, reject unsafe URLs and off-site entries in a same-site index. Escape labels and context as text. Omit invalid entries with diagnostics; retain usable ones. The host should include only pages appropriate for publication. A remote index must be opt-in, with failures leaving static links usable; a global scan or background crawl is unnecessary.

Acceptance: two pages and repeated mentions of one record produce correct distinct targets in both the list and panel; links work with JavaScript disabled; page-local year letters stay unchanged; duplicate, invalid, renamed, deleted and base-path cases are tested. Include a two-page standalone demo and an index-build example in the Guide/README.

## F2: record tags and accessible list filtering

Add validated, deduplicated tag IDs on records and a host-supplied catalogue with ID, label and optional icon. Unknown IDs remain inspectable as text with a diagnostic. Use safe same-origin icon paths/URLs, render them as a current-colour mask when requested, and show a text fallback when loading or CSP blocks the image. Do not accept arbitrary HTML/SVG markup as a catalogue icon.

Distinguish a source's topical tags from how a particular article uses it. Theory/Praxis/Creative might be usage roles. Keep the existing host hook and design an occurrence/list-item override rather than requiring every page to assign the same role to a work. Decide this with adopters before migrating their badges.

Display tags in lists and the inspector first, with inline display opt-in. Names must remain available to screen readers and sighted readers; meaning must survive colour, icon failure and forced colours. Preserve curated tags through record normalization, cache round trips and provider refresh; specify whether each export carries them.

Build-time filtering applies to the explicitly supplied list, not every record in the cache. Document any/all semantics; start browser selection with an explicitly labelled any-of filter. No chosen filters shows all entries; a real empty result shows a clear message. Browser toggles use native keyboard-operable controls, announce a plural-aware shown/total count, retain focus on the toggle and leave citations/endnotes outside that list alone. Static/no-JavaScript output remains a complete usable list for its build-time selection.

Acceptance: tags survive normalization/refresh, icon and text names render, missing icons have a fallback, both filter stages agree on their documented rules, multiple lists remain independent, and zero results/keyboard/forced-colour/no-JavaScript cases pass. Keep host insertion hooks available for other content.

## F4: reviewed import, delivered in smaller stages

The reusable pipeline is extraction, reference parsing, in-text recognition, local matching, optional identifier search, review, and an explicit edit plan. Each stage retains original text, source ranges, diagnostics and provenance. Unrecognized references stay available as raw local records; provider failure must not lose the document. No network call is required for local parsing and matching.

Start with plain text and explicitly delimited reference lists in APA and Chicago author-date. Heading detection can suggest a boundary for review; a heading or hanging indent alone is insufficient grounds to delete source. Rich-text paste and DOCX extraction are separate adapters, with explicit support for footnote/endnote relationships before promising notes-and-bibliography import.

Proposed functions:

```js
parseReference(text, { style, backend })
parseInTextCitations(text, { style })
matchCitations(inText, references, options)
createCrossrefSearch(options)
```

Keep the local parser synchronous when possible and give asynchronous parser-service adapters an explicit contract. An optional external adapter is caller-supplied and never enabled by parsing a document. A future language-model adapter uses the same result schema and review path, with host-managed consent, credentials and budgets. Adding it depends on measured need; it is not initial scope.

Surname/year matching is useful but not conclusive, even with a reference list: author collisions, abbreviated organizations, `et al.`, repeated years, editions and supplied year letters can remain ambiguous. Preserve imported suffixes as matching evidence; recompute final display letters in the target bibliography. Keep `see also`, locators, grouped citations and narrative forms instead of flattening them into a label. Skip citation-looking text in code, references and already-marked notation. A bare citation without a reference list yields an unresolved item or candidate choices, not a selected work.

Crossref search should return ranked proposals with provider relevance score, field agreement/conflicts, query and retrieval evidence. A relevance score is not a probability of correctness. Existing identifiers, title/author/year conflicts, missing metadata, near ties, book editions and chapters all need explicit handling. Reuse pacing, bounded requests, caching, retry/backoff and last-known-good evidence from the resolver/search infrastructure. Provider order must never silently choose or mutate a record.

Crossref recommends `query.bibliographic` for reference matching; see its [API tips](https://github.com/CrossRef/rest-api-doc/blob/master/api_tips.md). Open Library distinguishes work and edition metadata in its [search API](https://openlibrary.org/dev/docs/api/search). Preserve that distinction: a book-level match does not establish which edition or ISBN was used.

An exact identifier is evidence for record identity, not proof that the essay cited the right work or that the source supports its claim. Review should show the original reference beside proposed fields, reasons, conflicts and alternatives. Importing a citation and validating a claim are separate editorial acts.

Only accepted matches become a proposed source/cache change. Preserve rejected and unresolved text. Remove the old bibliography only through an explicitly reviewed source-range edit after every entry is accounted for, including uncited entries. Apply source edits against the same input revision/hash they were reviewed against, so an article edit cannot send a citation to the wrong passage.

Acceptance uses a versioned, curated fixture corpus with expected fields, spans and links. Include a ten-citation APA essay as a smoke test, plus Chicago narrative/groups, ambiguous surnames/years, reprints, diacritics, organizations, missing identifiers, malformed entries, noncitations, chapters, offline operation and provider failures. Report detection precision/recall, field accuracy, matching accuracy, ambiguity rate and identifier top-three retrieval separately. Use saved provider responses for deterministic regression tests; report live retrieval checks separately. Do not promise that ten successful examples establish general import coverage.

## Delivery and documentation

Recommended sequence: F3, F1, F2, then local F4 parsing/matching and optional search, followed by richer extraction/backends only as justified. Treat each as a bounded candidate with focused acceptance and adopter review; agree milestone scope/version before packaging a shared preview.

For every delivered part, update the README, generated Guide, integration documentation, JSON CLI examples and runnable demos in the same change. Show which functions work offline and which optional adapters use the network. Keep unavailable plans linked from the roadmap rather than presenting them as installed APIs.

At milestone closure run the [check-in procedure](checkin-procedure.md) and [adversarial reviews](adversarial-testing.md). Include API/distribution, source-edit fidelity, unsafe links/text, no-JavaScript navigation, accessibility, scholarly identity/edition accuracy, documentation and measured import coverage. Record outstanding native-device checks honestly.
