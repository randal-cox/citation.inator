# Import-review development demo

Run from the `codex/citation-import` checkout with Node 22 or later:

```sh
npm ci
npm run build
npm start
```

Open [http://127.0.0.1:4187/demos/import/](http://127.0.0.1:4187/demos/import/), or choose Import review from the Reading room navigation. This is a development demonstration for 0.4.0, not a completed milestone or a public import API.

## Import Document

Import Document and Resolve Citations are independent accordion disclosures, open by default. The other main disclosures use the same bar style; closing a section preserves its source and decisions. Lookups continue in the background while sections are closed.

Choose an example, paste a complete document into Raw Document, or choose/drop a UTF-8 `.txt`, `.md` or `.markdown` file. Body and bibliography share one editable source. The selector shows **Dropped file** or **Chosen file** after a successful import, and the filename appears beside Choose file. Unsupported files leave the previous document intact.

Citation format starts at **Detected format** and is inferred from the visible body, not an example-specific answer. APA, Chicago author–date and bracket-numeric modes have manual overrides. Mixed or insufficient evidence requires a choice. Format changes analyze immediately; raw edits analyze after a short pause.

The source parser detects References, Bibliography and Works cited headings, excluding code, quoted blocks and raw HTML. Multiple headings require a boundary choice under Raw Document → Bibliography boundary; custom start/end lines and No bibliography are also available. A later Markdown heading ends the bibliography unless an explicit end line is supplied. Blank-separated or list entries work best; unsupported reference prose remains a raw local entry. Numeric labels come from the document, never from list order.

The examples cover APA ambiguity/missing works, Chicago narrative/reprint dates, nonsequential numeric labels, missing versus explicit undated years, and real publications with identifiers withheld. All matching records derive from the bibliography text. Editing its titles, authors, dates or labels changes matching. Reanalysis clears previous choices rather than transferring them by position.

## Resolve Citations

Hover or click a highlighted citation; with a keyboard, focus it and press Enter or Space. Radio choices apply immediately; Don’t fix keeps its text unchanged. Unique, sufficiently supported local candidates are selected automatically. Green means an existing, manually entered or accepted valid identifier, or an explicit Keep without identifier decision. Red needs a work/span choice; gray is unmatched or skipped; orange means a selected work still needs identifier completion. Lookup is optional: conversion can use a local reference while it is orange. A green reference does not verify the claim it supports.

Previous/Next and Left/Right move between gray unmatched, red and orange citations needing a decision, skipping ready/skipped references and background-only lookups; reaching either end closes the panel like Escape. Up/Down select radio choices. Text fields keep their normal caret keys, and Tab retains its normal focus order. Paste a DOI, ISBN or URL to override a target. DOI/ISBN metadata is fetched automatically after typing pauses; failed retrievals can be retried together from the progress display. Valid entered identifiers work directly offline without requiring metadata retrieval. Other supported identifiers and safe HTTPS URLs remain usable without arbitrary URL fetching. Invalid identifiers do not turn green.

## Converted Document

Open Converted Document to see literal `{cite …}` Markdown. It stays open and updates as choices change. Conversion preserves unaccepted text and the original bibliography. **Use source** explicitly replaces the working source; preview alone does not edit it.

Download both **Markdown** (`reviewed-citations.md`) and **references** (`citations.json`) when local-ID markers are present. Supply that cache to the compiler in your project; the Markdown alone does not embed local records. Reading Preview is a separate disclosure beside Converted Document, with the same heading style. Either can open independently and refresh live. It renders the converted body with generated endnotes without duplicating the original bibliography in that preview. The exported Markdown still retains the original bibliography.

Uploaded original bytes remain separately available through Download original, even after working-source edits. Textarea display normalizes line endings; unchanged source ranges and exported bibliography retain their original line endings. New lines follow the source’s initial newline convention. Files must be UTF-8, at most 400 KB, and decode to at most 100,000 UTF-16 characters. PDF, DOCX and ODT imports are not supported yet; paste extracted text instead.

## Real references and lookup development

The real example includes Ioannidis’s 2005 article, its separate 2022 correction, and Feinberg and Willer’s 2019 article. The source in [document-examples.mjs](../demos/import/document-examples.mjs) omits identifiers. Metadata was checked against the [original](https://journals.plos.org/plosmedicine/article?id=10.1371/journal.pmed.0020124), [correction](https://journals.plos.org/plosmedicine/article?id=10.1371/journal.pmed.1004085) and [Wiley article](https://compass.onlinelibrary.wiley.com/doi/10.1111/spc3.12501) on 21 November 2026. Demonstration prose is not quoted from them.

The [answer key](../demos/import/real-reference-answer-key.json) retains the legacy fixture IDs and publisher-checked DOIs; match its entries by title/year when using the new source-derived IDs. It is never loaded by the demo or matcher. This is a development set, not an independent search benchmark. DOI suggestions start automatically for selected references. Books: ISBN edition choices adds a public book reference with its ISBN omitted. This example is not an ISBN accuracy benchmark.

## Automatic identifier lookup

Lookup is always automatic in the demo. Selecting a reference, or finding one unambiguous match, sends its title, authors and available publication details to Crossref/Open Library. The document body, filenames, surrounding sentences and editor notes are not sent to those providers. No switch or per-reference Find action is needed. Network errors leave manual identifiers and Keep without identifier usable.

The right-aligned Lookups left display beside Resolve Citations tracks unfinished selected references, with separate looking-up, choice and unavailable counts. Multiple mentions of the same source entry share one count. Choosing a different work, accepting an identifier, skipping a citation or keeping a reference without an identifier updates it immediately. Retry failed lookups retries the selected failures as a batch.

A DOI/ISBN already present in the bibliography, or entered manually, bypasses discovery and goes directly to metadata resolution. Its hover contains no identifier-search status, controls or suggestions; background progress stays in the overall display, and response evidence is under Diagnostics → Identifier evidence. Known bibliography identifiers are used in converted markers even if metadata retrieval fails.

Selected journal entries search Crossref; books search Open Library; unknown publication types search both. Selecting a bibliography target starts its lookup automatically; there are no per-reference Find buttons. An unambiguous selected item starts even if another item in the same citation group still needs a work choice. Searches are shared only for the same complete query/identity fingerprint, including available edition constraints. Results stay in page memory. Source edits invalidate pending applications; changing sources cancels requests and rejects late responses. Accepted metadata stays available during review until the source changes.

A DOI is chosen automatically only under the versioned **exact-identity-v1** policy: exact normalized full title, compatible complete author sequence, exact cited year, known matching publication type and agreement with every supplied journal/publisher/volume/issue/page/edition field. Meaningful title symbols and notice prefixes survive comparison. Any same-title competing DOI, preprint/version flag or correction/retraction relation prevents automatic acceptance. The DOI is independently resolved before applying the automatic result. This conservative rule is not a probability or proof of global uniqueness.

Other candidates appear as radios with author/year, identifiers and fields to check. One selection resolves that DOI/ISBN and updates the output when it succeeds; there is no second confirmation. Provider errors keep a previous good identifier available; Retry or Keep without identifier lets you continue.

ISBNs always need an edition choice in this increment. Open Library search checks at most three works and five editions per work, displaying at most fifteen distinct ISBNs and combining ISBN-10/13 aliases. This limited window may omit the cited edition. Author names can come from the work rather than the edition; dates, publishers, edition/format/language clues are shown for review. A lone result is not automatically the right edition. No results does not prove no ISBN exists.

Accepted metadata fills missing session-record fields and adds identifiers/provenance. Conflicting authored titles, dates, authors and reference text remain intact. Canonical markers and the exported cache carry accepted identifiers; repeated mentions share reference metadata while keeping their own locators. Duplicate canonical identifiers have one cache owner, with original local reference records retained separately. Full raw provider evidence is inspectable during the session under Diagnostics → Identifier evidence, and in discovery popups where applicable; the portable cache carries normalized metadata and provenance, not the entire response log.

Provider requests use allowlisted HTTPS origins, omitted credentials and no referrer. They are queued separately, spaced at least 1.1 seconds apart, bounded to ten seconds/2 MB per response and a 20 MB response budget per page session, and honor rate-limit pauses without automatic retry loops. Search result counts are bounded. A new example/file resets the memory cache/budget. Source-only browser transport and manual fallback are implemented; a static HTTPS deployment of the complete review/apply flow is not.

## Processing and limits

The page posts the working text to its local `/demos/import/review` endpoint. No persistent documents or project-file changes occur. Only the selected bibliographic fields go directly from the browser to the metadata providers. Uploaded original bytes remain in browser memory. This requires `npm start`; it is not a static GitHub Pages service or an installed import API.

The document path is bounded to 100 references, 100 citation groups and 300 cited items. Review also limits total candidate choices to 1,000 and requests to 1 MB. Oversized work is rejected rather than partly applied. The server checks loopback host, same-origin browser requests and JSON content type.

Diagnostics contains optional conversion and parsing evidence. Partial parsing, conservative Markdown source mapping and unsupported bylines can leave citations requiring review. No broad extraction or metadata accuracy claim follows from the synthetic tests. Native-file adapters, browser-native review/apply APIs and host transactions remain unfinished. ISBN automation and broader identifier providers remain future work. See [development](import-development.md), [full-document flow](import-document-flow.md) and [draft integration](draft-integration.md).
