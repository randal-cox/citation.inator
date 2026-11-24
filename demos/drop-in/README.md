# citation.inator in plain HTML

This distribution contains the 0.5.0-preview.0 development candidate. Earlier release archives remain unchanged.

From the repository root, run `npm start` and open [Plain HTML](http://127.0.0.1:4187/demos/drop-in/).

If you have only the standalone ZIP, run `npm start` in its extracted folder (no install required), then open http://127.0.0.1:4188/.

Without npm, run `node server.mjs` (Node 22.13.0 or later). Any static HTTP server also works. Click a citation to inspect it. Opening `index.html` directly still shows the static citations and endnotes, but browser modules require HTTP.

The exact markup used to generate the example is in `reading.txt`. To change the generated HTML, compile that text with the npm package, or use `node scripts/compile.mjs` from the repository root and replace the fragment and cache together. Editing the source text alone leaves the generated page as it was. The included `citation-inspector.mjs`, adjacent stylesheet and JSON cache are ready to copy into another static site. Keep the MIT license with the software. Third-party source material retains its own terms.

Citation evidence and Citation credit in the example open supplementary panels. The credit includes a suggested citation for the software. The source records carry their own attribution.

In the programmatic example, **Programmatic citations** uses a prebuilt example and a local module. The map and table share a reference with two return links. Try **Map details** to open an inspector inside a dialog. The example module and its stylesheet are adjacent to `index.html`.

The **Reader access and artwork** example demonstrates open copies, subscriptions, library links, rights and source/served checksums. Its records and destinations are synthetic. The adjacent [reader access guide](reader-access.md), [media support matrix](media-support.md), and [integration guide](integration.md) cover configuration and host settings. The example’s access module is bundled as `access-preview.mjs`.

Try [the site bibliography](bibliography.html), [Article one](article-1.html), [Article two](article-2.html) and [the editor tools](editor-tools.html). They demonstrate cross-page return links, accessible tag filters and source-only editor notes. The browser editor uses the included self-contained `citation-tools.mjs`; it makes no provider lookups and saves no files. The [article tools guide](article-tools.md) covers the APIs, CLI, index-build process, tag catalogue, source formats and limitations.

The [UI language guide](i18n.md) documents locale configuration, label overrides, plural categories and translation limits.
