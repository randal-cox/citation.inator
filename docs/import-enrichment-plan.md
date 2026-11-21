# Browser identifier and metadata completion

Status: proposed 0.4.0 implementation, 21 November 2026. This document describes the next step; the demo currently uses green for a selected bibliography target and does not perform background provider lookups. The [development milestone](milestones/0.4.0.md) records delivered behavior separately.

## Reader-facing model

Keep work selection and metadata retrieval as separate underlying states. Present four colors and a short label, rather than giving every network condition a new color:

| Color | Meaning | Examples of short labels |
| --- | --- | --- |
| Gray | No identified work, or explicitly skipped | Unmatched · Skipped |
| Red | Work identity needs a choice | 2 bibliography matches |
| Orange | Work selected; reference needs completion | Queued · Looking up… · 3 identifier matches · Choose an edition · Lookup unavailable · No identifier found |
| Green | Reference ready for this import | DOI matched · ISBN matched · Kept without identifier |

Use a question mark for unmatched and a dash for skipped, with distinct accessible names. Skipped means leave the source untouched; it is not successful identification. An unmatched reference still offers manual entry and reference editing.

Orange always means completing an identified reference. Its short label distinguishes background activity from a choice that needs the editor. A spinner is only for a live request, never an error, paused queue or unknown-duration wait. The popup contains details and candidate choices; the document needs only color and a small status cue. Announce settled status changes without narrating every queued request to screen readers. Meaning survives forced colors and is available without hover.

A DOI is not a universal requirement. Ready means sufficient bibliographic fields for the chosen source type and an accepted identity, not that every possible field is filled. Missing optional fields do not prevent completion. Allow **Keep without identifier** for a usable selected reference when no identifier exists or the editor wants to finish manually. Record this decision honestly; do not label it provider-verified. Keep **Don't fix** as the separate choice that retains the original citation.

Previous/Next should visit unresolved gray/red and orange items requiring an editor's decision, skipping background-only work, ready references and explicit skips. This changes today's red-only navigation and must be documented with the color change. A small page summary can show “3 choices · 2 looking up · 8 ready” without forcing an editor to wait in each popup.

## Trigger and ownership

1. Local analysis finds bibliography candidates without a network request.
2. A unique unambiguous local match, or an editor's radio choice, identifies a work. Its citation becomes orange if completion is needed.
3. With online lookup enabled for this import, queue a request for that work. Search once per complete query/identity fingerprint and share the result across compatible mentions. Include edition, language and format constraints; a common title, author or local ID alone is not a safe coalescing key. Do not search ambiguous work identities speculatively.
4. One sufficiently supported identifier can be accepted automatically; otherwise show identifier or edition radios. A manually pasted identifier enters the same validation/enrichment path.
5. Merge accepted metadata into an import-session record and show green when ready. Source files, the article, persistent records and publication remain unchanged until the existing explicit preview/apply or host transaction.

Keep selection, enrichment status and edit-boundary safety independent internally. A metadata-complete work with an uncertain author span still requires source-span review; ready metadata cannot authorize an unsafe edit. Navigation and accessible labels must surface that outstanding work.

## Automatic acceptance policy

One returned result is not by itself a clear match. Provider scores are relevance evidence, not confidence probabilities. Deduplicate DOI variants and ISBN-10/13 aliases before counting choices.

For DOI discovery, require a strong normalized title match, compatible author identity, compatible publication year and publication type, and no conflict with supplied bibliographic fields. Compare journal/volume/pages where supplied. Missing necessary identity evidence, near ties, title-only queries, chapter-versus-book differences, translations, preprint-versus-published versions and correction-versus-original differences stay for review. A bounded result set cannot prove global uniqueness; record which results and criteria supported the automatic decision, and expose its automatic origin and an undo/change choice.

Normalization may ignore case and harmless punctuation; it must not erase subtitles, edition markers, correction/retraction prefixes or other identity-bearing words merely to force agreement. Alternative online/print years can be evidence, not a silent replacement of the cited edition year. Preserve original and edition dates separately.

Resolve a proposed DOI and verify the returned identifier before accepting its metadata. Preserve provider response/provenance, field comparisons, retrieval time and the decision basis. Before implementation, freeze a versioned deterministic acceptance policy with explicit required fields, normalization rules and near-tie/conflict thresholds. Challenge it with independent negative fixtures before claiming automatic-match quality. No automatic field merge should overwrite conflicting curator text, titles, authors, notes or edition information. Add missing corroborated fields; retain conflicts for review. Do not discard correction/retraction notices or imply that an identifier match verifies a cited claim.

For books, first find a work, then candidate editions. ISBNs belong to editions; a single work result or the provider's first edition does not establish the cited edition. Require edition-level title/author, year, publisher, edition/language information where supplied, and a valid ISBN. Different formats can legitimately have different ISBNs. Unknown edition or competing eligible editions requires a choice. Existing Open Library search code returns curator proposals and must be audited for edition coverage before powering automatic acceptance.

A valid pasted DOI/ISBN can still identify a different work. Validate syntax and ISBN check digits locally; fetch metadata only when online lookup is enabled. Conflicts remain visible for the editor. A generic HTTPS URL must never trigger arbitrary fetching by the library; only recognized identifiers go to allowlisted metadata providers.

## Metadata scope

Retrieve corroborated title, authors and available author identifiers, publication dates, journal/container, volume/issue/pages or article number, publisher, edition/language, canonical URL, DOI/ISBN and related correction/retraction information. Preserve originals and per-field source evidence. Abstracts, licenses and access locations can be optional enrichments when actually supplied; missing optional metadata never turns a ready reference back into a blocking state. A format or location alone does not establish open access. Do not scrape full text or start downloads to fill missing fields.

Treat provider strings and links as untrusted input: render text safely, validate identifiers/URLs and do not inject remote HTML or JATS markup into the page. A browser transport must retain payload bounds and metadata normalization, not bypass them for convenience.

## Providers and browser feasibility

Start with [Crossref bibliographic search](https://github.com/CrossRef/rest-api-doc) for DOI candidates and [Open Library search/edition APIs](https://openlibrary.org/dev/docs/api/books) for books. Their coverage is incomplete; an empty response does not establish that no identifier exists. Keep provider adapters replaceable.

On 21 November 2026, one public-metadata HTTP GET to each provider returned status 200, three candidates and `Access-Control-Allow-Origin: *`, with an Origin header representing the local demo. The retained [probe record](evidence/import-enrichment-provider-probe-2026-11-21.json) gives the queries. This supports direct browser requests but is not a live browser/CSP test, an uptime promise or coverage evidence. Test actual browser requests from a static HTTPS host and the local demo before claiming the browser path works. CORS and network failures must degrade to manual entry; do not bypass them with an untrusted public proxy or JSONP.

Use simple CORS GETs with credentials omitted and referrer policy `no-referrer`. The browser controls User-Agent; do not depend on setting a server-style custom User-Agent, obtaining higher identified-client quotas or hiding an API secret in JavaScript. A publisher may optionally configure public application contact information; never insert the reader's email automatically. Host CSP must permit the explicitly configured provider origins in `connect-src`. Static hosting should need no application server or secret key. Browser-side matching and enrichment are distinct from the current Node-only review hashing/apply protocol; browser-native review/apply remains a separate 0.4.0 task.

A real browser probe must validate headers actually sent, redirects, response readability and timeout behavior. Current server-oriented resolver headers and package imports are not proof that an existing module is ready for direct browser use; bundle/test a dedicated browser transport.

## Privacy and reliability

Offer one clearly described online-lookup switch per import, or a host-controlled equivalent: “Send reference titles, authors and publication details to Crossref/Open Library to find identifiers.” Local matching and manual DOI/ISBN entry remain usable with it off. Send only selected bibliographic fields; do not send the manuscript, nearby prose, filenames, editor notes, credentials or private documents. References themselves may be sensitive, and the providers can log queries. Browser-only processing does not make an external search private.

Queue separately by provider, initially one request in flight and at most one request per second per provider. Honor stricter response limits and Retry-After when exposed; otherwise use conservative bounded backoff with jitter. Do not assume browser JavaScript can read every rate-limit header. Open Library [documents](https://openlibrary.org/developers/api) a default limit of one request per second; Crossref [recommends](https://www.crossref.org/documentation/retrieve-metadata/rest-api/tips-for-using-the-crossref-rest-api/) caching and backing off on 429 responses.

Coalesce duplicate requests, cache results in memory for the import, bound queue length/result counts/payloads/timeouts, and avoid automatic retry loops. Optional persistence belongs to the host's storage/privacy choice, not silent manuscript storage. If storage fails, continue in memory. Pausing or disabling online lookup cancels queued work, aborts in-flight requests where possible and invalidates their generation tokens so late responses cannot merge. Already accepted metadata stays available.

Attach each request to the selected record's identity, query fingerprint and import revision. Ignore responses after lookup is paused/disabled or the citation is changed, skipped, removed, reanalyzed or manually corrected. A background response must not overwrite a newer manual choice, move focus, close a popup or replace controls while the editor is typing. Share metadata across mentions without sharing occurrence-specific prefixes, locators or choices.

On offline, timeout, rate limit, blocked CORS/CSP or malformed provider data, keep the selected local reference and show “Lookup unavailable” with Retry and paste input. Keep errors distinct from “No identifier found.” Offer manual completion/Keep without identifier rather than stranding a usable reference forever in orange. Never undo a good match because an optional abstract, URL or other field was unavailable.

## First implementation and acceptance

1. Implement the state/status model and revised actionable-item navigation with injected/mock providers first. Cover two bibliography matches, no match, queued search, ambiguous identifiers, outage, skip, manual correction, source-span review and an identifier-free completed reference.
2. Add browser-native Crossref search and DOI resolution. Use the [real reference example](../demos/import/real-reference-example.mjs) without loading its [answer key](../demos/import/real-reference-answer-key.json) in the application; include the original/correction pair and independently authored near-match negatives. Verify actual CORS/CSP behavior on a static host.
3. Add edition-aware Open Library suggestions with public book fixtures whose exact edition/ISBNs were checked. Exercise same-title editions, translations, reprints, missing dates and ISBN aliases, including simultaneous mentions with different edition/language/format constraints; do not pick the first edition automatically.
4. Add deterministic race, pause/disable in-flight invalidation, cancellation, edition-safe deduplication, queue/backoff and privacy tests. Capture requests to prove no manuscript/context/notes are transmitted, cookies are omitted, no arbitrary URLs are fetched and the answer key is never loaded.
5. Run accessibility and independent scholarly/identity review before claiming automatic matching quality. Record live-provider observations separately from deterministic tests and fresh evaluation. Keep the manual path fully usable with all providers disabled or failing.

## Plan review

Independent API/testing review returned scoped PASS for this planning document. It requested explicit pause/disable invalidation of in-flight results, edition-safe request sharing, and versioned executable matching criteria before accuracy claims; those requirements are included above. This verdict is not runtime, browser or release acceptance.
