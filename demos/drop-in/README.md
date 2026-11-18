# citation.inator in plain HTML

From the repository root, run `npm start` and open [Plain HTML](http://127.0.0.1:4187/demos/drop-in/).

If you have only the standalone ZIP or want to run without npm, serve the extracted folder with a static server. For example, run this command from the folder and open [the local example](http://127.0.0.1:8080/).

```sh
python3 -m http.server --bind 127.0.0.1 8080
```

On Windows with the Python launcher, use `py -3` in place of `python3`. Click a citation to inspect it. Opening `index.html` directly also gives you the static citations and endnotes.

The exact markup used to generate the example is in `reading.txt`. To change the generated HTML, compile that text with the npm package, or use `node scripts/compile.mjs` from the repository root and replace the fragment and cache together. Editing the source text alone leaves the generated page as it was. The included `citation-inspector.mjs`, adjacent stylesheet and JSON cache are ready to copy into another static site. Keep the MIT license with the software. Third-party source material retains its own terms.

Citation evidence and Citation credit in the example open supplementary panels. The credit includes a suggested citation for the software. The source records carry their own attribution.

In the programmatic example, **Programmatic citations** uses a prebuilt example and a local module. The map and table share a reference with two return links. Try **Map details** to open an inspector inside a dialog. The example module and its stylesheet are adjacent to `index.html`.

The **Reader access and artwork** example demonstrates open copies, subscriptions, library links, rights and source/served checksums. Its records and destinations are synthetic. The adjacent [reader access guide](reader-access.md), [media support matrix](media-support.md), and [integration guide](integration.md) cover configuration and host settings. The example’s access module is bundled as `access-preview.mjs`.
