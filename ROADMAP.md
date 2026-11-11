# Roadmap

Version 0.1.2 includes the site migration features. See the [changelog](CHANGELOG.md).

## Local preview

- [x] Provide a standalone HTML ZIP and an npm tarball with separate compiler and browser entry points.
- [x] Let readers move the inspector with a mouse or touch without dragging.
- [x] Provide five named citation styles for common books and journal articles, formatted reference text, HTML and Markdown input, and a JSON CLI.
- [x] Carry curated access links and reader-supplied provider preferences into the panel and endnotes. Resolve ISBN editions through Open Library.

## Next steps

1. Run the integration walkthrough on one actual host page using direct HTML compilation and the Chicago preset. Verify one page end to end, including italic titles, year suffixes, access-service preferences and endnote return links.
2. Test on a physical phone and with Safari and VoiceOver. Cover opening the inspector, moving it, dismissing it, and returning from an endnote.
3. Collect failing real-world style examples. Use them to decide which new source types, disambiguation rules or venue variants justify a broader style engine.
4. Evaluate whether repeated ISBN misses or access gaps justify an additional ISBN or access provider. Preserve edition identity and provider provenance when comparing candidates.

The [launch verification](https://github.com/randal-cox/citation.inator/blob/main/docs/launch-verification.md) records the checks for the local preview. The [product brief](https://github.com/randal-cox/citation.inator/blob/main/docs/prd-citation-inspector.md#milestones) describes the longer-term feature sequence.
