# Import-review development demo

Run from the `codex/citation-import` checkout with Node 22 or later:

```sh
npm ci
npm run build
npm start
```

Open [http://127.0.0.1:4187/demos/import/](http://127.0.0.1:4187/demos/import/), or choose Import review from the Reading room navigation. This is a development demonstration for 0.4.0, not a completed milestone or a public import API.

## Import Document

Choose an example, paste a complete document into Raw Document, or choose/drop a UTF-8 `.txt`, `.md` or `.markdown` file. Body and bibliography share one editable source. The selector shows **Dropped file** or **Chosen file** after a successful import, and the filename appears beside Choose file. Unsupported files leave the previous document intact.

Citation format starts at **Detected format** and is inferred from the visible body, not an example-specific answer. APA, Chicago author–date and bracket-numeric modes have manual overrides. Mixed or insufficient evidence requires a choice. Format changes analyze immediately; raw edits analyze after a short pause.

The source parser detects References, Bibliography and Works cited headings, excluding code, quoted blocks and raw HTML. Multiple headings require a boundary choice under Raw Document → Bibliography boundary; custom start/end lines and No bibliography are also available. A later Markdown heading ends the bibliography unless an explicit end line is supplied. Blank-separated or list entries work best; unsupported reference prose remains a raw local entry. Numeric labels come from the document, never from list order.

The examples cover APA ambiguity/missing works, Chicago narrative/reprint dates, nonsequential numeric labels, missing versus explicit undated years, and real publications with identifiers withheld. All matching records derive from the bibliography text. Editing its titles, authors, dates or labels changes matching. Reanalysis clears previous choices rather than transferring them by position.

## Resolve Citations

Hover or click a highlighted citation; with a keyboard, focus it and press Enter or Space. Radio choices apply immediately; Don’t fix keeps its text unchanged. Unique, sufficiently supported local candidates are selected automatically. Green currently means a selected local reference, not provider verification. Red needs review; gray remains unchanged; orange is reserved for planned metadata completion.

Previous/Next and Left/Right move between red citations; reaching either end closes the panel like Escape. Up/Down select radio choices. Text fields keep their normal caret keys, and Tab retains its normal focus order. Paste a DOI, ISBN or URL to override a target; syntax validation is not an online identity check.

## Converted Document

Open Converted Document to see literal `{cite …}` Markdown. It stays open and updates as choices change. Conversion preserves unaccepted text and the original bibliography. **Use source** explicitly replaces the working source; preview alone does not edit it.

Download both **Markdown** (`reviewed-citations.md`) and **references** (`citations.json`) when local-ID markers are present. Supply that cache to the compiler in your project; the Markdown alone does not embed local records. Optional Reading preview renders the converted body with generated endnotes without duplicating the original bibliography in that preview. The exported Markdown still retains the original bibliography.

Uploaded original bytes remain separately available through Download original, even after working-source edits. Textarea display normalizes line endings; unchanged source ranges and exported bibliography retain their original line endings. New lines follow the source’s initial newline convention. Files must be UTF-8, at most 400 KB, and decode to at most 100,000 UTF-16 characters. PDF, DOCX and ODT imports are not supported yet; paste extracted text instead.

## Real references and lookup development

The real example includes Ioannidis’s 2005 article, its separate 2022 correction, and Feinberg and Willer’s 2019 article. The source in [document-examples.mjs](../demos/import/document-examples.mjs) omits identifiers. Metadata was checked against the [original](https://journals.plos.org/plosmedicine/article?id=10.1371/journal.pmed.0020124), [correction](https://journals.plos.org/plosmedicine/article?id=10.1371/journal.pmed.1004085) and [Wiley article](https://compass.onlinelibrary.wiley.com/doi/10.1111/spc3.12501) on 21 November 2026. Demonstration prose is not quoted from them.

The [answer key](../demos/import/real-reference-answer-key.json) retains the legacy fixture IDs and publisher-checked DOIs; match its entries by title/year when using the new source-derived IDs. It is never loaded by the demo or matcher. This is a development set, not an independent search benchmark. Automatic DOI/ISBN suggestions remain [planned](import-enrichment-plan.md); manual DOI entry works now.

## Processing and limits

The page posts the working text to its local `/demos/import/review` endpoint. No provider calls, persistent documents, external uploads or project-file changes occur. Uploaded original bytes remain in browser memory. This requires `npm start`; it is not a static GitHub Pages service or an installed import API.

The document path is bounded to 100 references, 100 citation groups and 300 cited items. Review also limits total candidate choices to 1,000 and requests to 1 MB. Oversized work is rejected rather than partly applied. The server checks loopback host, same-origin browser requests and JSON content type.

Diagnostics contains optional conversion and parsing evidence. Partial parsing, conservative Markdown source mapping and unsupported bylines can leave citations requiring review. No broad extraction or metadata accuracy claim follows from the synthetic tests. Native-file adapters, automatic provider completion, browser-native import APIs and host transactions remain unfinished. See [development](import-development.md), [full-document flow](import-document-flow.md) and [draft integration](draft-integration.md).
