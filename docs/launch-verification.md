# Launch verification

Assay date 2026-11-10. Build 0.1.0. The checked artifacts were freshly built, with the plain HTML directory copied outside the checkout and served independently. Chrome 156.0.8078.80 ran headless. The zoom assay used actual tab zoom in Chrome for Testing. The demo servers were temporary.

Run `npm test` for compiler, schema, identifier and resolver tests. Run `npm run build && npm run test:browser` for browser checks. The browser script starts temporary loopback servers, uses the installed Google Chrome by default, and cleans up on exit. Set `CITATION_CHROME` to another Chromium executable, `CITATION_ZOOM_CHROME` to a Chrome for Testing executable that supports temporary extensions, `CITATION_LIVE_CHECK=1` for one Crossref request through the form, and `CITATION_EVIDENCE` to a screenshot directory.

## Adversarial evidence for 0.1.0

| Scenario | Result and coverage |
| --- | --- |
| Vanishing preview | No hover preview. Pointer entered the desktop click-open pane in steps and the pane remained open. The copied page made no requests on hover or inspect after the cache loaded. |
| Keyboard prisoner | On the copied page, Enter and Space opened the pane, Tab and Shift+Tab navigated it, desktop focus could leave, and Escape returned focus to the originating citation. |
| Thumb reader | Chrome touch emulation at exactly 390 CSS px opened the native modal, jumped to an endnote, and reopened and closed at the rotated viewport. Physical devices and iOS Safari remain untested. |
| Magnifier | The copied hostile fixture reflowed at 320 CSS px. Actual 200% and 400% Chrome tab zoom preserved viewport bounds, long identifiers and access to the copy and close controls. |
| Hostile CSS | A copied host used clipped content, sticky navigation, global button declarations and a global rule hiding dialogs. The panel remained visible and its internal button styles stayed isolated. |
| Impatient reader | A slow A request finished after a cached B request. B stayed visible and closing either inspector did not cause a later response to reopen it. An update was deferred while focus was in the reader. |
| Misleading button | The synthetic PMID-only example exposed the PubMed link while PDF and PubMed Central showed visible reasons for being unavailable. The author PDF in the reading room showed its version. Consumer-specific library access was not exercised. |
| Disconnected scholar | The copied HTML navigated to endnotes and back with JavaScript disabled. An already-loaded copied page still opened cached citations when set offline. The dynamic 503 simulation showed stale age and retained the citation. Offline enhanced reload depends on host caching. |
| Exhaustive metadata | The copied hostile record displayed bidirectional text, disclosed 100 authors, wrapped its long identifier and copied the citation through the 100th author. |
| Screen-reader scholar | Chrome exposed the named dialog and labelled controls. The static page and copied inspector produced zero violations under the selected axe WCAG 2 A/AA and 2.1 AA rules. VoiceOver and other screen readers remain untested. |
| Endnote boomerang | The second occurrence returned to its own anchor in the copied page with and without JavaScript. Synthetic `2020a` and `2020b` suffixes agreed with bibliography ordering. |
| Reluctant animator | Reduced-motion and forced-colors emulation were exercised. The widget uses no motion. Physical high-contrast device settings remain untested. |
| Accidental dragger | Drag/resize is outside this release. |
| Print and share | Chrome print media hid the active inspector and kept endnotes visible. No physical printer was used. |
| Skeptical deployer | The separately copied ESM and CSS were byte-identical to `dist/`. The copied origin passed the restrictive CSP and remove/reinsert checks. The browser made only same-origin asset and cache requests for the copied consumer. |
| Untrusted metadata | Literal markup and scientific inequalities remained text. A supplied JavaScript URL did not become a link. DOI mismatch, identifier collisions and malformed records were exercised in the core suite. |

## Live and simulated resolution in 0.1.0

The live resolution form returned HTTP 200 for the Simas DOI. The cache retained the raw Crossref response and the merge log. The response supplied separate 2019 online and 2020 print dates, while the curated citation kept the 2020 issue year. A publisher abstract was present in raw provider evidence and excluded from public redistribution. Outage, backoff, negative caching, partial metadata and identity mismatches were exercised with synthetic responses. Reconciliation across providers remains outside this slice.

Screenshots from the assay include the reading room, 390 px sheet and stale-cache simulation. VoiceOver, Safari and physical touch devices were outside the assay.


## Reader interface revision

Re-ran the copied-consumer and Chrome tab-zoom checks with compact icons, contextual endnote links and the attributed Cambridge abstract excerpt. The reading-room test toggled hover, crossed into the pane, confirmed it closed on departure, pinned it by clicking and verified no hover-time network requests. It also checked Field notes endnote typography, Midnight panel styling and axe on the reading room in Midnight. The PDF and publisher controls carry their respective download and new-context attributes. The author-hosted preprint response served `application/pdf` without an attachment header during the header check, so the browser can display the remote file inline.

## 0.1.1 local preview

The preview adds configurable notation, supplementary evidence and credit panels, and repositioning via drag or arrow keys. The release review used a clean Node 22 install of the npm tarball and an independent static host serving the extracted ZIP. The packaged compiler regenerated the standalone page fragment from its included `reading.txt` and cache. Local Chrome covered focus restoration, pointer and touch movement, visible copy feedback, no-JavaScript links, and 200% and 400% zoom. Live Crossref returned a record, then Resolve showed a cache hit and retained the previous provider evidence. Each browser run used an isolated provider cache.

The local preview keeps both archive names versioned and records their SHA-256 checksums. Future handoffs should rerun the consumer walkthrough and set `CITATION_DROP_IN_DIR` to the extracted ZIP before running `npm run test:browser`. Safari, Firefox, screen-reader and physical-device testing remain open for this release. The original planning milestones in the PRD describe feature sequencing.

The software credit uses the project collective and the package version. The MIT license covers the software. The bundled abstract excerpt is identified and attributed separately in the record. The archives contain normalized data and no raw provider responses.

The final interaction checks covered dragging from blank panel space on desktop and emulated touch, selecting abstract text without moving the panel, tapping outside the sheet, and keyboard dismissal. Evidence and credit follow the same hover setting as citations and remain available through click or keyboard activation. A custom same-origin icon loaded successfully with the configured panel title.

## Unreleased integration candidate

The Node 22 suite and Chromium browser suite covered named styles, HTML and Markdown, the JSON CLI, formatted references, branded panels, help controls, and the standalone divider. Chromium covered phone movement, placement after pinch zoom, and desktop popover sizing. A live Open Library lookup returned the same Farneth edition for the equivalent ISBNs, and the second lookup reused its cache entry.

| Review | Verdict and evidence |
| --- | --- |
| Distribution, deployment and versioning | Passed. A clean Node 22 offline install resolved the package exports. The installed compiler regenerated the extracted standalone fragment and cache. Browser assets matched between the archives. The earlier 0.1.1 archives remain the prior preview. |
| UX and accessibility | Passed the Chromium review, including keyboard focus, CSS and Style independence, phone pinch and placement, and occurrence links. |
| Testing | Passed the Node 22, CLI and Chromium checks. The reviewer reproduced issues with locators, HTML controls, APA suffixes and MLA titles. Regression tests cover the fixes. |
| Documentation and roadmap | Passed a fresh-checkout walkthrough and npm install. The project keeps existing-site and physical-device verification open. |
| Citation and authorship | Passed. Equivalent ISBNs identify the same print edition, the JSTOR DOI identifies its separate digital record, and the software credit matches the package and CFF. |
| Non sequitur | Passed. The public docs and generated Guide use the standalone demo name, distinguish historical behavior and omit one-off checkout logistics. |

Verification on an actual host site, physical phones, Safari, Firefox and screen readers remains open.
