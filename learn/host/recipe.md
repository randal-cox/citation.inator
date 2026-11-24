# Mount the editor and citation tools

This working example uses unmodified draft.inator editor files from its accepted cite.inator 0.4.0 integration at commit `36c79b1`. Its [source manifest](./SOURCE.json) records exact Git blob identities and its [license](./DRAFT_LICENSE.txt) accompanies the files. It demonstrates the real `mountEditor` API, not a replacement editor invented for this tutorial. See draft's [accepted recipe](https://github.com/randal-cox/draft.inator/blob/36c79b1/docs/editor.md) and [integration example](https://github.com/randal-cox/draft.inator/blob/36c79b1/demo/editor/editor.mjs).

Load the editor CSS, forms, works data and Cite block first. Then import your initialization module:

```html
<link rel="stylesheet" href="./editor.css">
<script src="./forms.js"></script>
<script src="./works.js"></script>
<script src="./citation.js"></script>
<script type="module" src="./bootstrap.mjs"></script>
<div id="editor"></div>
```

The [bootstrap](./bootstrap.mjs) catches module/data load failures and keeps export disabled until ready. The [complete initialization source](./integration-source.mjs) includes all imports, validated cache/source loading, preview sanitization, record staging and bundle download. The public host bundles `marked` and DOMPurify; the draft files themselves have no required framework or provider service. Serve the generated site over HTTP.

## Try the transaction boundary

1. Choose Import citations, then Find citations. Review Bell as an existing site work and Turner as a new work. The library proposes identities; the writer authorizes conversion.
2. Cancel. Neither article text nor the staged reference cache should change.
3. Open import again, choose the intended identities and convert. The editor applies accepted text in one undoable step. The host stages only new works actually cited by converted markers.
4. Use the editor's Undo. At this pinned draft version, Undo reverses text; it does not remove staged records or undo an external persistence callback. This example retains staged records in memory for reuse, but download includes only staged works still referenced by the final Markdown. It always preserves the original site library. A host that requires cache undo must include that state in its own transaction policy.
5. Download article bundle to capture the current source and cache together. After Undo, the new Turner record is omitted; redo or a later citation includes it again. This example writes no server data. A production host should save both through the same transaction or pull request and handle conflicts before acknowledging success.

The example starts with two site records, including one not used by this article. Import must preserve that existing library. Adding a partial imported reference must not overwrite the curated version of a reused work. An identifier proposal is not a verified canonical identifier merely because it appears in extracted text.

The download handler compiles the final Markdown against the staged cache and takes the record IDs from `result.cache.records`. It preserves every original site record and adds only referenced staged records. The compiler handles bare IDs, `local:` IDs and canonical identifiers, and excludes code examples. Stage freely; persist what the final text references.

## Revisions and persistence

The headless API binds its review to the source, bibliography, style, keyword, namespace, limits and site-cache context. A stale context is rejected. The pinned draft importer also checks the live editor text before conversion. Hosts with asynchronous collaboration or changing reference settings must additionally bind the review to their own revision token and use compare-and-swap at commit time. Checking once before a network call does not protect a later write.

`onRecords(records, cache)` is a staging callback, not an atomic database transaction. Do not write unrelated remote files from it and assume the editor's text undo covers them. Buffer new records, then publish text and records together through your existing save workflow. If that workflow cannot be atomic, retain a recoverable draft and report the partial operation explicitly.

This example has no saved-draft storage. If you enable draft.inator's `storageKey`, save staged metadata alongside the kept text, or restore it before compiling/saving the draft. Restoring text alone can leave unresolved markers after a reload.

## Fit the host

The editor receives `render`, `citations`, `importer`, `previewClass` and its own theme variables. cite.inator supplies compilation, identities, review evidence and reference data; draft owns forms, layout, selection, undo and persistence hooks. The [host stylesheet](./host.css) changes the editor box without changing the library's citation format. The learning site's editable preview is sanitized separately from the library's trusted-authored-HTML compiler contract.

`DRAFT_WORKS` must be generated from the same cache and citation style as the build; its picker labels and editor notes must describe the same records. Keep one citation style across the site build, `describeCitation`, editor notes and preview. For notes read by editors, use `noteContext:'work'` with `annotateMarkers` so article-local year letters do not fight with context-free descriptions. Use `markerKind` and `formatRecordId` instead of copying marker/directive rules.

The core [headless API guide](../reference/import-api.html) documents full requests, site identity decisions, host-assigned IDs, failure states and native working-copy extraction. This tutorial does not promise native Word/PDF editing, authentication or automatic publication.
