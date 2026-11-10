# citation.inator

A small, progressively enhanced citation library. Write citations in plain text, compile them into linked references and endnotes, and add an optional browser inspector.

## Load and initialize

Copy `citation-inspector.mjs` and `citation-inspector.css` from the ZIP or npm package to your public assets. Load them on the page, wrap the compiled fragment in `<citation-inspector>`, and point its `data-cache` attribute to your JSON. Set `class-prefix` on the element or pass `classPrefix` to the browser initializer if your site needs a different class prefix. [Loading and initialization examples](docs/integration.md#load-and-initialize)

## Write a citation

```text
Empathic concern can deepen partisan polarization {citation doi:10.1017/S0003055419000534}.

{citation evidence} · {citation credit}

{citation endnote}
```

## Try it

**Plain HTML.** Extract the standalone ZIP and serve the extracted directory with a static server. Its `index.html` and endnotes are also readable directly from disk.

**Compile your own text.** With Node.js 22 or later, install the local npm tarball. From the same directory, use the ZIP’s `reading.txt` and `citations.json` to compile your first page fragment.

```sh
npm install ./citation-inator-0.1.1.tgz
npm exec -- citation-inator reading.txt citations.json article.html
```

See the [integration guide](docs/integration.md) to assemble a page, change the notation keyword, and customize the inspector.

Use the [Claude handoff](docs/claude-handoff.md) to migrate references on an existing website.

See the [roadmap](ROADMAP.md) for the next integration and accessibility checks.

## Work on the source checkout

Clone the [GitHub repository](https://github.com/randal-cox/citation.inator) and use Node.js 22 or later.

```sh
git clone https://github.com/randal-cox/citation.inator.git
cd citation.inator
npm ci
npm run build
npm test
```

Run `npm start` to open the [reading room](http://127.0.0.1:4187/) and find the notation guide and Resolution bench. `npm run test:browser` runs the browser checks with a local Chrome installation.

## Credit and license

The software uses the MIT license. Third-party source material retains its own terms. See [CITATION.cff](CITATION.cff) for the software citation and [CHANGELOG.md](CHANGELOG.md) for release changes. Source records carry their own attribution.
