# Changelog

## 0.5.1-preview.5 — In development

- Preserve unmatched citations as explicit unresolved placeholders, with original wording, collision-safe IDs, host allocation and an atomic source/cache result.
- Add unresolved fallback text and a dedicated compiler/tools diagnostic that remains until the reference is resolved.
- Offer Keep as unresolved in import review; unsafe expanded/noncontiguous groups remain for span review.

## 0.5.1-preview.4 — In development

- Allow whitespace between named fields; pipes remain optional visual separators, including mixed notation and safe editor-note updates.
- Add author topic declarations and per-list filter controls, moving the reading-list demo out of JavaScript.
- Style code in example intros as italic monospace and align copy-link explanations with the demonstrated source.
- Correct the artwork attribution example to qualify its existing creator without repeating the name.

## 0.5.1-preview.3 — In development

- Keep new identifier markers with author fields available to metadata resolution before their record exists.

## 0.5.1-preview.2 — In development

- Put article-specific year, formatted-reference, artwork and reading-copy details in cite notation, with document-wide consistency, safe formatting and author provenance.
- Resolve exact PubMed-to-DOI/PMCID aliases through the npm starter, preserving curated identity and rejecting conflicting mappings.
- Group 22 Playground cards as Everyday, Intermediate and Advanced; grow Source with its text.
- Establish the author/site boundary in project instructions, Guide and adversarial review criteria.
- Alphabetize accented names/titles with their base letters when ordering references and assigning year letters.

## 0.5.1-preview.1 — In development

- Replace the long reader-settings prompt with a compact gear-and-label Reading services control, retaining localization and host settings hooks.
- Use a single vector chevron for matching learning-page selectors.

## 0.5.1-preview.0 — In development

- Use one configured marker keyword, default `cite`, for both works and directives. Remove implicit alternate spellings; this intentional notation migration requires draft approval before release.
- Explain website citation maintenance and headline features in the overview, with tabbed citation/JavaScript/HTML setup snippets.
- Share one footer across learning pages with author/ORCID left and MIT/license-backed software-credit hover right.
- Place ISO checked dates beneath reading buttons and prevent card-title padding from affecting bold excerpts.

## 0.5.0 — Developer learning and live demos · 25 November 2026

- Add a concise masthead overview, group Playground/Import/Guide navigation and place GitHub with its version at the far right.
- Publish a static learning site with 21 editable examples, a visual Playground gallery, default Hover, five citation-format presets and component-scoped CSS choices.
- Provide a coherent starter-first Guide, complete notation/API references, copied-file and npm starters, and a downloadable offline learning site.
- Demonstrate real draft.inator editor integration, reviewed imports, tags/filters, shared bibliographies, reader access, media/provenance and failure cases.
- Add shared English/Spanish UI messages, locale-aware values and configurable translations.
- Rename the project/repository/package to cite.inator/cite-inator while preserving citation markup, browser assets, CSS/data contracts, schemas and the old CLI alias.
- Keep direct reading/PDF actions visible, clarify optional access services, add leading endnote-icon examples and pill-shaped tags, and unify the learning/import appearance.
- Correct Markdown endnote placement and save only staged references still used by the final editor document, including after Undo.
- Document generated note replacement, provider-metadata review, identifier evidence and host-owned revision/persistence boundaries. The structured occurrence planner remains a Node/build-time API requiring a namespace.

Earlier previews and their evidence remain below; published 0.4.0 artifacts are unchanged.

## 0.5.0-preview.3 — In development

- Save only still-referenced staged editor additions alongside the existing site library, including after Undo or later deletion.
- Clarify generated note ownership, keyword changes, diagnostics, new-identifier resolution, tools imports and host-owned import persistence in the Guide and integration recipe.
- Distinguish intact source identifiers from provider-verified metadata; recovered proposals remain withheld until accepted.

## 0.5.0-preview.2 — Preview

- Verify completion of the GitHub, physical-folder and Codex project/attachment rename to cite.inator; retain existing browser/data compatibility contracts.
- Prepare the cite.inator repository/project/folder name and cite-inator package; preserve browser/data contracts and the old CLI alias.
- Keep gallery cards alongside their editable details, align the Playground heading, add leading endnote icons and pill-shaped topic/filter labels, and remove the Endnotes title rule.
- Remove remaining dark-theme rules from the learning import host. Keep direct reading/download actions visibly labelled and outside optional-source disclosures, with a contextual settings label.
- Provide a starter-first Guide and runnable metadata resolver, reviewed independently for English and developer/LLM comprehensibility.


## 0.5.0-preview.1 — In development

- Lead authoring examples and the guide with DOI/ISBN markers and source-only notes; keep generated reference metadata in an advanced disclosure.
- Replace the example selector with a preview gallery, enable Hover by default and group Hover/CSS/Style/Reset in one toolbar.
- Share one navigation shell across all learning pages, merge tutorials into the Guide with a compatibility redirect, and match import styling and introductory guidance to the learning site.
- Place Markdown endnotes at a directive on its own line even when the next paragraph has no separating blank line; keep code and escaped notation literal.
- Give source alternatives named links in a contained disclosure and reserve a consistent dropdown-arrow gutter. Include the editor-tool data file in the public download.

## 0.5.0-preview.0 — First learning preview

- Add an editable static learning playground with source, reference JSON, configuration, five citation presets, component-only CSS examples, reset and Markdown/cache downloads. Sanitize editable previews with DOMPurify in the host.
- Add 20 progressive lessons, a load/init-first guide, rendered API guides and copied-file/npm/offline-site downloads. The npm starter includes a pinned library tarball; copied-file projects use a dependency-free Node server.
- Add distinct saved-metadata/live import hosts, rights-cleared native sample files, actual cross-page links and a worked integration using pinned, unmodified draft editor files with their license. Fixture exports retain explicit example provenance.
- Add shared English/Spanish UI messages for compiler, inspector and access settings, with configurable labels, plural categories, locale formatting and English fallback. Authored metadata and citation-style conventions remain separate.
- Avoid an extra Chicago period after a final author initial. Browser checks now default to a dedicated Playwright test browser; system Chrome requires an explicit path.
- Update the test-only Playwright driver and pin the CI runner instead of relying on a drifting Ubuntu image; retain strict keyboard focus assertions and document the older Chromium 140 gap.
- Make the selector regression test independent of platform-specific native menu Arrow/Escape behavior while checking element identity and focus during background completion.
- Write learning-test screenshots to the operating system's temporary directory.
- Publish and verify the GitHub Pages learning preview, including all 82 public assets and clean downloaded projects. Independent reviews and clean milestone/CI checks pass; adopter tutorial acceptance and final library publication remain pending in the milestone checklist.

## Project metadata — 24 November 2026

- Rename the GitHub project to cite.inator; at that point the default branch retained 0.4.0. Released 0.4.0 tags and archives remain unchanged.

## 0.4.0 — 23 November 2026

- Recover supported explicit DOI line wraps with source evidence; withhold ambiguous numeric/metadata/prose continuations and prevent autolinks from restoring partial IDs. Keep recovered proposals out of canonical identifiers/cache/Ready until accepted metadata. Public regression sample now accounts for all 27 publisher DOI values (15 exact, 12 recovered proposals) without extras.
- Parse common numbered journal bylines/title/date/publication fields, preserve incomplete `et al.` authors and flag ambiguous title boundaries; keep unsupported fields raw.
- Compute unresolved-review navigation once per refresh instead of repeatedly per citation, improving larger document interaction and avoiding the observed in-app selection timeout. Add a 180-group browser/lookup regression.

- Add shared `formatRecordId` in tools/import entries, minimal safe local-ID spelling by default and an explicit mode; note refresh preserves existing spelling. Document directive-name compatibility.
- Keep site identity proposals when main titles agree but subtitles, work types or given-name spelling differ, retaining the differences as evidence and requiring approval.
- Fix narrative multi-year preview encoding and detect the second narrative citation in the same sentence; re-scan generated multi-work markers before returning edits.

- Add reviewable site-cache record reuse, stale-site checks, host-assigned record IDs and new/reused record mappings to the shared import API. Preserve existing site metadata and reject allocation collisions.
- Recognize same-author multiple-year groups and institutional authors; keep inferred acronyms and secondary-source relationships reviewable. Report unrecognized balanced year-like citation spans with source ranges.
- Add a self-contained browser article compiler (`citation-compiler.mjs`, `citation-inator/compiler-browser`) with Node parity, CSP coverage and bundled dependency notices.

- Show existing identifiers beside import candidates and expose unmatched-work controls directly. Separate popup header/work/evidence surfaces with neutral light/dark colors.
- Fix Node Buffer PDF intake, repeated page/total URL footers and wrapped-year phantom references. Withhold observed punctuation-ended wrapped DOI fragments instead of marking their partial identifiers Ready; retain a diagnostic and original text.

- Separate the popup header from its scrolling body. Name each work in combined citations, keep its review disclosure open initially, show retrieved reference details for identifier conflicts and label distant hits Less likely results.
- Add complete-citation readiness totals/percentages alongside lookup tasks and review decisions. Preserve disclosure choices during live updates.
- Include Crossref subtitles/readable formatting in title comparison, fixing false identity conflicts; retry empty Open Library subtitle searches once with the main title while keeping edition choices manual.

- Promote reviewed import into a shared Node/browser API and JSON CLI, with configurable notation/preview namespace and revision/context validation. The demo becomes an example browser host.
- Add bounded native PDF/DOCX/ODT extraction to a text working copy, retaining original files, opaque citation fields, links and excluded-text evidence.
- Rank identity evidence ahead of title resemblance, clean edition qualifiers for search, keep book editions manual and require explicit acceptance of conflicting retrieved metadata. Withhold identifiers contested by distinct imported records instead of arbitrarily merging them.

- Make import-review popups draggable and resizable, with retained geometry, keyboard controls and scrollable narrow-screen content. Recognize the explicit Anonymous author byline, including original/edition year matching.

- Centralize configurable import budgets through JavaScript/JSON, raise defaults for larger documents and bound concurrent reference jobs. Fix formatted/wrapped bibliography segmentation, DOI-only bibliography links and stale document display after failed analysis; exercise all six private BEST text representations without publishing them.

- Separate queued/running lookup counts from human review decisions; stack equal-size colored counters with jump actions, and make arrow navigation use that same review set.
- Replace live invented bibliography examples with publisher-verified Einstein/Planck references, including three Einstein works from 1905; retain synthetic cases only in tests. Group distant-year provider hits under More results without changing acceptance policy.
- Contain disclosure headers and contents in one panel, improve selector arrow spacing and initialization, and rename the menu Examples. Support an optional private local-document catalogue; add BEST text representations locally without publishing manuscripts.

- Start DOI/ISBN lookups automatically for selected/unambiguous references; add live remaining/progress/choice counts and batch retry. Known or pasted identifiers bypass discovery and have no search UI in their hover.
- Add automatic direct browser DOI/ISBN lookup to import review, conservative resolved-DOI automatic acceptance, edition radios, metadata/provenance in portable caches, manual/no-identifier fallback and privacy/race/rate-limit guards. Unknown reference types search both providers; ISBN choices remain manual within bounded edition coverage.
- Style demo disclosures as accordion bars; make Import Document and Resolve Citations open-by-default disclosures, with Lookups left aligned beside Resolve.
- Make Reading Preview a parallel disclosure matching Converted Document, refresh either live, remove the redundant Document heading and tighten bibliography spacing. Map completion evidence to reader labels and preserve focused lookup controls as results arrive.

- Replace default detached import fixtures with one full document and source-derived bibliography records. Add adjustable bibliography boundaries, live edits, UTF-8 TXT/Markdown selection/drop, preserved original downloads and portable Markdown/cache exports. Retain unsupported references as raw partial records without invented titles.
- Group source inputs under Import Document and review under Resolve Citations, separated by a rule. Show Dropped file or Chosen file in the example selector after importing, infer citation format from the source, and close review at either navigation endpoint. Label manual targets DOI, ISBN or URL.

- Remove the remaining Analyze button; raw document/reference edits now reanalyze automatically after a short pause, alongside immediate selector analysis.

- Keep Converted Document open with live choice updates and stale-response/export protection. Auto-load examples and reanalyze format changes; add conservative source-based Detected format mode with manual override for uncertainty. Match the key to citation tints, including reserved orange; align disclosure headings as Converted Document, Raw Document and Diagnostics.

- Remove maintainer-facing narration from import review. Converted Document is now a disclosure that generates raw Markdown on opening; technical evidence is grouped under Diagnostics. Add a standard reader-copy pass and independent review for substantial cleanup.

- Make raw Markdown with `{cite …}` markers the primary import result; export `.md` and place the rendered reading preview under a disclosure.

- Plan browser-only identifier/metadata completion, including proposed gray/red/orange/green statuses, conservative automatic matching, edition-aware ISBN selection and manual/offline fallback. Record bounded provider HTTP/CORS observations; runtime enrichment remains unimplemented.

- Make Left/Right navigate red citations even from radio choices; keep Up/Down for selecting a radio and preserve text-field caret keys. Add a real-publication import example with withheld DOIs and a separate publisher-checked answer key.

- Apply import radio decisions immediately, make Don’t fix a radio choice, and add Previous/Next red-citation arrows with keyboard navigation that preserves native control keys. Strengthen unresolved red highlighting.

- Use subdued green for selected import targets, muted red for citations needing review and gray for Don’t fix. Automatically select unique candidates; incomplete evidence and uncertain spans remain for review.
- Simplify import review to suggested-target counts and radio choices, with manual DOI/ISBN/URL corrections, an explicit Don’t fix action, clearer fictional examples and a collapsed supplied bibliography. Identifier entry validates syntax/check digits without provider lookups.

- Analyze supplied import-demo examples automatically so hover targets appear on first load; edited inputs still require explicit reanalysis.
- Prototype document-first import review: visible supplied bibliography, highlighted in-text citations and hover/click/keyboard candidate comparisons with human matching reasons.
- Prioritize a dedicated developer-learning milestone before external bibliography connections; retain proposed labels pending maintainer agreement.

- Add markerKind to tools and both browser bundles so editors classify complete markers with the compiler grammar, including legacy/custom forms and directive-like record IDs.
- Add opt-in work-context annotation notes matching standalone work descriptions; preserve default article notes and reader year letters.
- Add a runnable local plaintext import-review demo with synthetic examples, explicit decisions, stale-context checks, bounded workloads, safe previews and downloadable reviewed text. Native files and browser-native import remain unfinished.

- Recognize undated author–date citations while keeping absent dates ambiguous unless per-import metadata explicitly affirms an undated work. Preserve the original challenge miss and later regression report separately.

- Add source-only partial reference rules and explicit revision-bound review/edit planning. Preserve unsupported entries, uncertain spans and rich-text/linked conversion decisions without destructive replacement.
- Add an independently authored synthetic challenge set, evaluation runner and retained reports, with explicit unsupported cases and small-corpus limits.
- Show unknown-profile access help once per owned list while retaining inspector settings, and add a synchronous escaped-text referenceItemPrefix host hook.
- Add the citation-style catalogue/support matrix, source-development API documentation and initial draft.inator compatibility notes.

- Add experimental bracket-numeric import proposals and matching against explicit document-local reference numbers; malformed groups stay unimported and duplicate labels stay ambiguous.
- Plan a 0.4.0 developer learning site, live playground, annotated feature documentation and draft.inator integration.
- Confirm 0.3.0 scope as reviewed import plus outstanding reader/host/style-documentation fixes; plan external bibliography integration and source maintenance separately for 0.4.0.

- Begin source-only F4/0.3.0 author-date detection and reviewable matching experiments, paired-format corpus analysis and synthetic regressions. Add text/HTML/Markdown extraction with conservative original-source fragments, developer-checked local matching cases and explicit Crossref bibliographic search proposals with field comparisons, pacing, validated search caching and failure evidence. No new installed API or document-file import is exposed in 0.2.0.

## 0.2.0 · 2026-11-20

- Add editor-only marker notes, structured query/annotation APIs, a self-contained browser tools bundle and JSON CLI description, annotation and stale-note checks.
- Expose emitted occurrence inventories and build site-wide Cited in / Listed in return links, with static anchors and inspector sections after the formatted reference.
- Add curated record topics, per-list usage roles, same-origin masked icons, per-tag styling hooks, any/all build filters and keyboard-operated browser filters. Filter thresholds can limit controls to longer lists with multiple topics; reading-list classes remain intact.
- Accept per-item marker tags without changing reader output by default. Collect contribution counts across text/HTML/Markdown with cache alias resolution and detailed diagnostics; optionally display marker-local tags inline. Hosts own topic curation and aggregation policy.
- Add stable unresolved/malformed diagnostic codes. Keep bibliography controls beside the reference and before site-use lines when space allows.
- Include multi-page standalone examples, the editor/tag-count demo, README/Guide/API documentation and retained parser dependency license notices. Formatted-citation import remains planned.
- Establish the check-in/milestone procedure and add header/control focus regression coverage.

## 0.1.4 · 2026-11-18

- Add reader access profiles, service catalogues, grouped destinations, built-in and host settings, translated wording and plural counts.
- Add preferred title destinations, library proxy/OpenURL links and saved verification dates while preserving canonical citation text.
- Add structured occurrences, stable identifiers, trigger bindings, host theme controls and route dismissal.
- Add artwork/image metadata, rights, attribution, literal dates, source/served checksums and CSL graphic export. Chicago is the initial media formatting target.
- Add compact inspect controls and custom icon masks that follow text colour. Omit empty trailing action boxes.
- Expand the Reading room, Plain HTML, Guide and packaged documentation.

## 0.1.4-access.1 · Preview · 2026-11-18

- Omit empty trailing action containers when an inspect control leads the reference.
- Add `inspectIconMode: "mask"` for custom icons that inherit text colour in light and dark themes.

## 0.1.4-access.0 · Preview · 2026-11-18

- Add browser-local reader profiles, service catalogues, grouped access destinations, built-in or host settings, translated wording and plural counts.
- Add preferred title destinations, OpenURL/proxy library links and saved verification dates.
- Add artwork/image metadata, rights, attributed creators, literal dates and source/served checksums, with CSL graphic export.
- Add compact inspect actions and examples in both demos.
- Include the tested structured, host-theme, route-dismissal and webpage-reference preview work.

## 0.1.4-structured.2 · Preview

- Plan citations for app-rendered captions, tables, and dialogs from stable occurrence IDs. Render one endnote per cited record with a backlink for each occurrence, including without JavaScript in light DOM.
- Bind existing controls to the inspector with explicit endnote targets, update and disposal, and a focus fallback for removed controls.
- Keep structured anchors distinct from legacy compiled IDs. Preserve separate editions that share a catalog number using display-only related identifiers.
- Add host-scoped panel font, compact-sheet radius, and modal backdrop settings. Expose dismissal for hosts that reuse citation controls during navigation.
- Coordinate Escape with surrounding dialogs. The Reading room and Plain HTML demos show both a nested inspector and unresolved reference handling.

## 0.1.3 · 2026-11-10

- Accept curated personal author IDs for Chicago surname disambiguation across variant bylines.
- Report when cache-wide year letters have companion works outside a page’s endnotes.

## 0.1.2 · 2026-11-10

- Limit Chicago surname disambiguation to authors shown in competing bylines.
- Preserve author suffixes and mark partial author lists in the inspector.
- Support scoped endnotes in definition entries, list items, and table cells, with custom or omitted headings and diagnostics for misplaced markers.
- Add cache-wide year letters and reading-list summaries with per-record hooks.

- Compile isolated citations for reusable excerpts, scoped endnotes for entries, and standalone reading lists with optional uncited endnotes.
- Add Chicago house-style dates, organization short names, surname initials, grouped years, and U.S. legislation reference fields.
- Preserve HTTPS links in formatted reference parts and report citation gaps across multiple fragments.
- Rank ISBN candidates, accept the `hiddenProviders` alias, and share a cache load across inspectors on the same page.
- Credit Randal Cox in the software citation and link his ORCID and the repository.

- Preserve original publication and edition dates and display both in reprint citations.
- Hide selected access services in panels and endnotes, independently of preferred order.
- Suggest edition ISBNs from title-and-author searches for curator review.

- Added Chicago author–date, APA, MLA, Cite Them Right Harvard and Vancouver formats for common books and journal articles.
- Added prefix and locator syntax, editable endnote headings, formatted reference parts and lettered occurrence links.
- Added HTML and Markdown compilation, fragment rebasing and a JSON command for build tools.
- Added library and full-text locations, provider preference ordering and ISBN edition resolution through Open Library.
- Added a reflected panel open state, a default mark and separate panel title and icon settings.
- Added separate CSS and citation Style previews, configuration help, and examples of page locators, prefixes and library links.
- Documented npm-free use, existing-site integration and recurring adversarial testing.

## 0.1.1 · 2026-11-10

- Added a configurable citation keyword with endnote, evidence and credit directives. The original `{cite …}` and `{endnotes}` syntax remains supported.
- Added opt-in hover, panels that drag from blank areas, compact action icons, contextual endnote return links and three demo styles.
- Scoped theme changes to citation content and added a configurable class prefix.
- Added a source and notation guide, and visible cache and provider outcomes on the Resolution bench.
- Added an attributed abstract excerpt and the software citation. The local release includes the exact reading-room source.

## 0.1.0 · 2026-11-10

- First local preview with an author–year compiler, pre-rendered endnotes, a portable citation inspector, and a Crossref resolution demo.
