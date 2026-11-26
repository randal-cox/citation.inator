# Final independent encoded-HTML re-assay

2026-11-26. Reviewed the parent's second repair. The two earlier reports remain unchanged as historical evidence. No product files changed. This is a bounded direct-source/compiler review, not a browser, distribution or release verdict.

Verdict: **PASS for the reviewed encoded-delimiter, annotation-ownership and exclusion boundaries.** All previously reported reproductions now pass. No remaining actionable defect was found in the final omitted-context challenge.

## Independent evidence

- Replayed all 686 valid combinations of cue, locator and comment delimiters across compileHTML and compileMarkdown: literal quotes, named entities, decimal entities, hexadecimal entities, uppercase hex, padded decimal and semicolonless decimal. Every complete serialized result equals that compiler's literal-quote baseline: **686 comparisons, zero differences**. Each result contains one citation, no diagnostics and no private annotation canary anywhere.
- Replayed the five original HTML-comment/bogus-comment/doctype disclosure forms through both compilers: **10 passing cases**. Each now compiles one citation without exposing the canary in HTML, metadata, descriptions, occurrences or diagnostics.
- Replayed excluded HTML prefixes containing unmatched notation quotes in code, pre, textarea, script, template, SVG text, attributes, role=button, contenteditable, links, nested code and nested template: **24 passing cases** across HTML and Markdown. The later real citation compiles, its private annotation is absent and Following remains present.
- Replayed Markdown code spans, fences, indented code, blockquoted fences, list code spans, literal escaped braces and entity-quoted escaped examples: **7 passing cases**. No malformed diagnostics or loss of Following.
- Challenged omitted contexts once more: multiline code/template/role=button inside blockquotes, template/role=button inside lists, a strong-wrapped template, Markdown link and image labels, HTML and bogus-comment prefixes, and triple-backslash literal braces: **11 passing cases**. Every later real citation compiles with no diagnostics, no canary and Following intact.
- Independently verified encoded unresolved cues through both compilers: the cue and locator remain reader-visible, the expected citation-unresolved-placeholder diagnostic remains, and the private comment is absent.

The raw-inline-HTML privacy failure in the first re-assay is closed: code/template wrappers preserve their authored structure, so following real annotations no longer fall into an accidentally unclosed excluded element. The escaped-literal failure is also closed: literal braces no longer seed ownership for the next real marker.

## Scope and limits

These probes verify complete compiler result objects, not only citation counts or visible HTML. They do not claim confidentiality for ordinary unescaped raw-text inner quotes, comments deliberately present in published source, or notation intentionally shown in excluded literal examples. They do not establish browser behavior, packaged artifact synchronization or release acceptance. The parent owns broader suite/browser checks; no duplicate whole-suite, build or browser run was performed here.
