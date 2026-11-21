# Import-review development demo

Run from the `codex/citation-import` checkout with Node 22 or later:

```sh
npm ci
npm run build
npm start
```

Open [http://127.0.0.1:4187/demos/import/](http://127.0.0.1:4187/demos/import/), or choose Import review from the Reading room navigation. This is a development demonstration for 0.4.0, not a completed milestone or a public import API.

## Citation format

The format selector starts in **Detected format** mode. Detection reads citation shapes in the current source, not the example name or its stored style. Among the three supported modes, comma-before-year parentheticals suggest APA, space-before-year parentheticals suggest Chicago author–date, and standalone numbered brackets suggest numeric. Narrative-only forms can fit both author–date modes; mixed or inconclusive patterns require a manual format choice before conversion. This is conservative shape inference, not identification of every academic style. It does not establish that a bracketed number actually names a work. Plausible reprint-year brackets are excluded from numeric proposals even when their surrounding locator cannot be parsed. Mixed numeric/unsupported author–date shapes require an explicit format; choosing numeric still preserves those year brackets.

Selecting a manual format immediately reanalyzes the source. Selecting **Detected format** again restores source-based inference. Text and reference-data edits reanalyze automatically after a short typing pause. Reanalysis clears previous review decisions so they cannot attach to changed citation groups. The key uses the same tint as document citations; orange is reserved for the upcoming metadata-completion step and is not assigned to current entries yet.

## What to try

1. The initial APA example analyzes automatically, as does each example selected in **Example**; no load button is needed. Hover or click a highlighted citation, or Tab to it and press Enter. The popup shows a count and radio choices. **Supplied bibliography** is a collapsed disclosure below the document; it shows where suggestions came from.

   These are fictional books for testing. The two Avery books share author and year, so either can fit the short citation. Red citations stay unchanged until you choose a target. Green citations are selected for conversion, including automatic choices where matching finds one unambiguous candidate. Green does not mean independently verified; hover to inspect or change the choice.

2. Select a radio choice; it takes effect immediately. There is no separate confirmation button. For a missing or incorrect suggestion, paste a DOI, ISBN or HTTPS URL into **Use an identifier**; typing selects that option immediately. ISBN check digits and identifier syntax are validated when opening Converted Document; a syntax-valid identifier is not proof it names the right work. There is no online lookup yet, so no title or author metadata is invented. Prefixed `pmid:`, `pmcid:` and `arxiv:` identifiers also work. The **Don’t fix** radio explicitly keeps the original citation and marks it neutral gray. An untouched red citation also stays unchanged; an untouched green citation is included in Converted Document. Single unique candidates are preselected; whole groups are automatically accepted only when every item is unique and has no uncertain author boundary. One-candidate matches with incomplete/unknown evidence remain red. Multi-work groups require one target for every item. Choosing Don’t fix for any item retains that entire citation group, so the original group is not partly rewritten.
**Previous/Next:** the upper-right arrows visit only red citations and stop at either end. Left/Right do the same when the popup, a radio choice, its buttons or an in-text citation has focus. In radio groups, Up/Down changes the choice; in identifier fields, they move the caret. Tab follows the normal focus order.

3. Open **Converted Document**. Opening the disclosure generates the full-width raw source with literal `{cite …}` markers. This is the primary review artifact. It stays open and refreshes as you change citation choices; hovering alone does not change the conversion. Downloads are unavailable while a changed result is being regenerated. Source edits trigger fresh analysis after a short pause. The optional **Reading preview** starts collapsed; expand it to check reader behavior. Manually entered identifiers without supplied metadata remain unresolved in that preview; the reviewed marker retains the identifier for later resolution. The two accepted Avery works can receive reader-facing year letters even though their identities were ambiguous during import. Open an inspector or follow endnote links. Unmatched/deferred/rejected text remains unchanged.
4. Try Chicago. The reprint retains original/edition evidence. Accepting the uncertain multi-author narrative identity keeps its source intact and asks for span review; identity acceptance does not authorize a guessed text boundary.
5. Try numeric. Reference numbers are supplied explicitly out of record-array order. The group is selected for conversion once every item has a target. Missing 99 stays untouched. A partial numeric import withholds the reading preview until all numeric groups are converted, so old and newly assigned reference numbers cannot masquerade as one consistent bibliography. The reviewed source remains available to inspect.
6. Try undated. A missing date remains ambiguous; an explicitly undated record has different evidence. The unknown-date match stays red; the explicitly undated, unambiguous match is selected green.
7. Edit the source, style or supplied record data after analysis. Existing review controls/output become unavailable; wait for the automatic reanalysis before converting. Stale snapshots are also rejected by the local service.

The original article above is unchanged by conversion. Use source explicitly replaces that textarea; Download Markdown exports the exact reviewed result as `reviewed-citations.md`. Plain-text paragraphs are valid Markdown; this demo does not convert rich-text/native files to Markdown. Markers using `local:` IDs need the supplied reference cache when compiled; the Markdown file alone does not embed those records. Neither writes a file or record on the server. The bibliography is never deleted automatically. The interface keeps task labels, color state and actionable errors; development boundaries and processing details live in this guide. Below Document, the main disclosures are Converted Document, Raw Document and Diagnostics, with matching heading sizes. Nested diagnostics are smaller and indented. Diagnostics collects conversion and extraction evidence.

## Real references for DOI lookup work

Choose **Real references: DOIs omitted**. It contains Ioannidis’s 2005 article, its separate 2022 correction, and Feinberg and Willer’s 2019 moral-reframing article. Metadata was checked against the [original PLOS article](https://journals.plos.org/plosmedicine/article?id=10.1371/journal.pmed.0020124), the [PLOS correction](https://journals.plos.org/plosmedicine/article?id=10.1371/journal.pmed.1004085) and the [Wiley article](https://compass.onlinelibrary.wiley.com/doi/10.1111/spc3.12501) on 21 November 2026. The document’s prose is a demonstration, not an excerpt from these papers.

The [input module](../demos/import/real-reference-example.mjs) deliberately omits identifiers. The [separate answer key](../demos/import/real-reference-answer-key.json) records the expected DOI and publisher source for each work; it is not loaded by the demo or matcher. This is a small development set, not an independent search benchmark. Automatic DOI suggestions are still upcoming; the [browser enrichment plan](import-enrichment-plan.md) describes the proposed states, automatic matching and manual fallback. You can paste an answer-key DOI into a citation’s identifier field to exercise manual correction now.

## Reference data

Expand Raw Document to inspect/edit the supplied record JSON and separate raw reference lines. The field parser proposes partial fields and retains raw entries; those proposals are not silently inserted into the curated records used by matching. Keep one reference per line for this demonstration. Optional matching JSON is inside each popup; reference-rule evidence is below the form.

## Processing and limits

This demo serves a local JSON POST endpoint at `/demos/import/review`; it is not a static-only GitHub Pages demo. All processing stays in that local server's memory. There are no provider lookups, saved documents, credentials, uploads to external services or project-file mutations. The endpoint is a development surface, not a production service.

The input is plain text only, up to 100,000 source characters, 100 records, 100 citation groups, 300 expanded cited items and 1,000 total candidate choices. Reference titles are limited to 500 characters, bylines to 50 authors and individual input records to 8,000 serialized characters. Requests are bounded to 1 MB. Excessive work is rejected with an error, not partially edited. The service checks loopback host, same-origin browser requests and JSON content type.

Native Word/ODT/PDF files, rich-text conversion, editable author-span selection, record creation and host transactions remain unfinished. The browser reading preview safely renders the plain source through the existing compiler. It is not a demonstration of native-document layout preservation. Full developer tutorials and a static live learning site remain planned for 0.5.0.

For algorithmic coverage, source-only APIs and evaluation evidence, read [import development](import-development.md). For the host integration boundary, read [draft.inator integration](draft-integration.md).
