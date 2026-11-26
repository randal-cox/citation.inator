# Build and deploy the learning site

```sh
npm ci
npm run build:learn
npm start
```

Open `http://127.0.0.1:4187/site/`. The build regenerates `site/`; keep authored files in `learn/`, not the output directory. Its explicit public inputs include lessons/reference records, documented examples, freshly authored native sample files and pinned draft editor files. It does not copy the private import catalogue or arbitrary repository files. Npm starter packing copies only tracked files admitted by the package manifest, excluding untracked duplicate files and private corpus material.

The playground compiles Markdown locally. Its editable HTML preview uses DOMPurify; this is a host boundary, not a compiler sanitization guarantee. Core examples, fixed import metadata and the editor recipe need no provider account. The separate live import page sends bibliographic reference details to Crossref/Open Library and retains the normal rate-limit/manual/local-record fallbacks.

## Authoring and navigation

The gallery starts with DOI/ISBN markers and optional source-only `note:` text; metadata is preloaded for offline examples. The advanced metadata editor supports curated records and identifier-free sources. It is not a required authoring format. The Guide documents resolving new identifiers before compilation; the playground does not silently fetch provider metadata.

All generated HTML pages group Playground, Import and Guide together, with GitHub and its version subtitle at the far right. The masthead opens `about.html`, a concise overview of the library, getting started and its free MIT license. Source and Result are independently collapsible and open by default; advanced reference metadata and Configuration sit below the workbench just before Diagnostics. Card titles come first; excerpts follow with an ellipsis and a complete-line clamp. The Guide combines the quick start, worked examples, notation links and API reference. `tutorials.html` remains a compatibility redirect. The generated import shell uses the same light appearance; the standalone import demo retains its separate dark-mode support.

The Import area has Document and Bibliography views. Bibliography review adds local interchange-file import, metadata comparison, explicit source checks and recoverable working copies; its dedicated browser regression runs with `npm run test:learn`.

## Downloads

The Playground also downloads the current document’s bibliography in CSL-JSON, BibTeX or RIS. These contain the used references, not every cached library item. Format-loss warnings link to Diagnostics. [Export API and limits](zotero.md#bibliography-files).

The generated site includes a copied-file first-citation ZIP, an npm build starter ZIP with its library tarball, and the full offline learning-site ZIP. Each includes source/configuration and notices. Npm installs the build starter's dependencies and creates its lockfile; the copied-file starter and full learning site need no install. Run `npm start` or `node server.mjs` inside their extracted folders. Modules require HTTP, not `file://`.

`BUILD.json` records the base source commit and whether tracked changes were present. Publish from a clean accepted candidate so that its source commit identifies the actual tree. Native sample attribution/checksums are under `documents/manifest.json`. The pinned draft source manifest records exact Git blob identities; preserve its MIT license.

## GitHub Pages

The workflow `.github/workflows/learning-pages.yml` follows [GitHub's custom Pages workflow](https://docs.github.com/en/pages/getting-started-with-github-pages/using-custom-workflows-with-github-pages). It pins official action commits, uses Node 22.13.0, runs unit/build/browser/learning checks and uploads only `site/`. Deployment has separate Pages/OIDC permissions and uses the `github-pages` environment. No provider credentials or private corpus are required. The browser suite installs Playwright's dedicated headless browser rather than using a maintainer's personal Chrome.

Set the repository's Pages source to GitHub Actions. Push to `main`, or dispatch the workflow for an authorized candidate. The completed preview branch no longer deploys on push; final releases deploy from main. Project-relative links work under `/cite.inator/`; no custom domain is required. The [public learning site](https://randal-cox.github.io/cite.inator/) is deployed and verified; see [milestone evidence](milestones/0.5.0.md) for the exact accepted build and downloads. Check the run, live assets and downloaded projects after deployment. The preview branch trigger was removed for the 0.5.0 closeout so subsequent work cannot overwrite the published learning site merely by pushing that old branch.

## Verify a candidate

`npm run test:learn` rebuilds the learning output and runs a browser flow under a project subdirectory. Set `CITATION_CHROME` only when intentionally selecting another test executable. The flow exercises source/configuration/reset, invalid JSON, sanitizer negatives, missing assets, shared bibliography anchors, saved import, native intake, real editor cancellation/import/staging/undo and a downloaded copied-file starter. Full baseline tests and clean npm/minimum-Node checks remain part of the milestone procedure.

Native examples are prebuilt public assets, so ordinary site builds need only npm. To regenerate them, use `scripts/make-learning-documents.py` with python-docx/reportlab and export `learn/documents/sample.md` through Pandoc to ODT. Re-render and visually inspect every native artifact after changes. Their checksums are generated from the delivered bytes.

## Overview and shared credits

The overview explains website citation maintenance and headline features, then exposes the minimal article, JavaScript and HTML in keyboard-accessible tabs. Every generated page uses one shared footer: author/ORCID on the left, MIT license and the library's own software-credit hover on the right. Footer credits are compiled with the same configured marker grammar as the examples.

## Recipe mechanisms

Each card introduction names the mechanism and where to inspect it: marker fields in Source, metadata/configuration/tools in JavaScript, or generated structure in HTML. JavaScript and pretty-printed HTML sit side by side before the download buttons; relevant disclosures open on example selection and retain the reader’s choice during edits. Metadata-driven recipes include complete cited records, with the demonstrated fields first. Everyday examples precede the Advanced group.
