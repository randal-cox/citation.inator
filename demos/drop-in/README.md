# citation.inator in plain HTML

Serve this folder from the downloaded repository or extracted ZIP as a static site. On a development machine with Python, run this command from the folder and open http://127.0.0.1:8080/:

```sh
python3 -m http.server --bind 127.0.0.1 8080
```

On Windows with the Python launcher, use `py -3` in place of `python3`. Click a citation to inspect it. Opening `index.html` directly also gives you the static citations and endnotes.

The exact markup used to generate the example is in `reading.txt`. To change the generated HTML, compile that text with the npm package, or use `node scripts/compile.mjs` from the repository root and replace the fragment and cache together. Editing the source text alone leaves the generated page as it was. The included `citation-inspector.mjs`, adjacent stylesheet and JSON cache are ready to copy into another static site. Keep the MIT license with the software. Third-party source material retains its own terms.

Citation evidence and Citation credit in the example open supplementary panels. The credit includes a suggested citation for the software. The source records carry their own attribution.
