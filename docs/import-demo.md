# Import-review development demo

Run from the `codex/citation-import` checkout with Node 22 or later:

```sh
npm ci
npm run build
npm start
```

Open [http://127.0.0.1:4187/demos/import/](http://127.0.0.1:4187/demos/import/), or choose Import review from the Reading room navigation. This is a development demonstration for 0.3.0, not a completed milestone or a public import API.

## What to try

1. Load APA and analyze. Two Avery works share a year, one comparison has a single candidate, and another citation has no record. Choose a candidate for each item and explicitly accept the group. The tool never preselects a candidate.
2. Preview accepted changes. Check the new markers and the reading preview. The two accepted Avery works can receive reader-facing year letters even though their identities were ambiguous during import. Open an inspector or follow endnote links. Unmatched/deferred/rejected text remains unchanged.
3. Try Chicago. The reprint retains original/edition evidence. Accepting the uncertain multi-author narrative identity keeps its source intact and asks for span review; identity acceptance does not authorize a guessed text boundary.
4. Try numeric. Reference numbers are supplied explicitly out of record-array order. Group acceptance is available only after choosing every item. Missing 99 stays untouched. A partial numeric import withholds the reading preview until all numeric groups are converted, so old and newly assigned reference numbers cannot masquerade as one consistent bibliography. The reviewed source remains available to inspect.
5. Try undated. A missing date remains ambiguous; an explicitly undated record has different evidence. Neither is selected automatically.
6. Edit the source, style or supplied record data after analysis. Existing review controls/output become unavailable; analyze again before previewing. Stale snapshots are also rejected by the local service.

The original article above is unchanged by Preview. Use reviewed source explicitly replaces that textarea; Download text exports the reviewed result. Neither writes a file or record on the server. The bibliography is never deleted automatically.

## Reference data

Expand Reference data and parsing to inspect/edit the supplied record JSON and separate raw reference lines. The field parser proposes partial fields and retains raw entries; those proposals are not silently inserted into the curated records used by matching. Keep one reference per line for this demonstration. Matching and parsing evidence is available below the output.

## Processing and limits

This demo serves a local JSON POST endpoint at `/demos/import/review`; it is not a static-only GitHub Pages demo. All processing stays in that local server's memory. There are no provider lookups, saved documents, credentials, uploads to external services or project-file mutations. The endpoint is a development surface, not a production service.

The input is plain text only, up to 100,000 source characters, 100 records, 100 citation groups, 300 expanded cited items and 1,000 total candidate choices. Reference titles are limited to 500 characters, bylines to 50 authors and individual input records to 8,000 serialized characters. Requests are bounded to 1 MB. Excessive work is rejected with an error, not partially edited. The service checks loopback host, same-origin browser requests and JSON content type.

Native Word/ODT/PDF files, rich-text conversion, editable author-span selection, record creation and host transactions remain unfinished. The browser reading preview safely renders the plain source through the existing compiler. It is not a demonstration of native-document layout preservation. Full developer tutorials and a static live learning site remain planned for 0.4.0.

For algorithmic coverage, source-only APIs and evaluation evidence, read [import development](import-development.md). For the host integration boundary, read [draft.inator integration](draft-integration.md).
