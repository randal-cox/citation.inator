# Moving to cite.inator in 0.5.0

The public project, GitHub repository and physical project folder are renamed from **citation.inator** to **cite.inator**. The Codex project name and folder attachment are also verified as `cite.inator`. Activation and verification are recorded in the [milestone](https://github.com/randal-cox/cite.inator/blob/main/docs/milestones/0.5.0.md). The migration does not rewrite released tags or archives.

## Current names

- Repository: `https://github.com/randal-cox/cite.inator`
- Learning site: `https://randal-cox.github.io/cite.inator/`
- Package: `cite-inator`, beginning with 0.5.0 previews.
- CLI: `cite-inator`; `citation-inator` remains an executable alias.
- Physical project folder: `cite.inator`.
- Codex project/attachment: `cite.inator`, verified at the renamed physical folder.

GitHub redirects the old repository's web and Git URLs. GitHub Pages project URLs do not receive that redirect: update old `/citation.inator/` demo links to `/cite.inator/`. Do not create another repository at the old name, because that would remove the repository redirect. See [GitHub's rename behavior](https://docs.github.com/en/repositories/creating-and-managing-repositories/renaming-a-repository).

## Package imports

New installations use imports such as `cite-inator/markup`, `cite-inator/tools` and `cite-inator/browser`. Downloaded npm starters include their pinned tarball. No npm registry publication is implied.

Earlier archives keep their original `citation-inator` package name and filenames. Existing installations keep working. To retain old import spelling while installing a new downloaded tarball, an npm project's dependencies can use a local alias:

```json
{
  "dependencies": {
    "citation-inator": "file:./cite-inator-0.5.0.tgz"
  }
}
```

Install from that project folder with `npm install`, using the actual tarball filename you downloaded or packed. This installs the package under `node_modules/citation-inator`, so existing `citation-inator/markup` imports can resolve. Prefer the new package name for new integrations.

## Browser and stored-data compatibility

The rename preserves the `citation-inspector` custom element, `initializeCitationInspector` and the `citation-inspector.mjs`, `citation-inspector.css`, `citation-compiler.mjs`, `citation-tools.mjs`, `citation-import.mjs`, `citation-import-files.mjs` and `citation-pdf.worker.mjs` asset names. The cache schema remains `citation-inator.cache.v1`. Default `citation-*` classes, configurable keywords/class prefixes, `data-citation-part` hooks, events, cache schemas and existing storage keys retain their meaning. Existing `{cite ...}` and `{citation ...}` source requires no rewrite.

These names describe citation functions and remain integration contracts. The default panel branding and software citation change to cite.inator. A host's explicitly configured title/icon still takes precedence. Pinned upstream teaching files and historical release evidence retain their original bytes and names.

Draft's adoption is coordinated in [draft.inator issue 31](https://github.com/randal-cox/draft.inator/issues/31). Draft owns its changes and reports its tested candidate there.
