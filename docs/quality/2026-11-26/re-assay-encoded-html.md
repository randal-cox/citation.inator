# Independent encoded-HTML re-assay

2026-11-26. Reviewed the parent's first repair of the encoded-HTML ownership findings. This report is separate from the immutable initial raw report. No product files changed; bounded direct Node probes only, no full suite, build or browser.

Verdict: **original findings repaired in their exact forms; FAIL pending omitted Markdown contexts.**

## Repairs independently confirmed

- Replayed all 686 valid cue/locator/comment quote-delimiter combinations across compileHTML and compileMarkdown. Zero failures: each produces one citation, no diagnostics, and no private canary anywhere in the result.
- Replayed all five initial non-element markup disclosures (ordinary comment, entity-delimited comment, bogus processing instruction, CDATA-shaped bogus comment, misplaced doctype) across both compilers. All ten cases now produce one citation, no diagnostics, and no canary anywhere in the result.
- Tested excluded HTML prefixes containing unmatched notation quotes in code, pre, textarea, script, template, SVG text, role=button, contenteditable, and attributes. compileHTML now compiles the following real citation and retains Following in all nine cases.
- Markdown code spans, fenced code, indented code, blockquoted fences and code spans within lists now isolate their unmatched example quotes. Each following real citation compiles, keeps Following and omits its private annotation.

## P1: raw inline HTML exclusion in Markdown can still publish the next annotation

Minimal reproduction:

```js
compileMarkdown('<code>{cite work comment:"</code>\n\n<p>{cite work comment:&quot;PRIVATE_CANARY&quot;}</p>', cache)
```

Observed output:

```html
<p><code><code>{cite …}</code></p>
<p>{cite work comment:&quot;PRIVATE_CANARY&quot;}</p>
```

There are zero citations and one malformed diagnostic. PRIVATE_CANARY appears in result.html only; it is absent from cache, descriptions, occurrences and diagnostics. The Markdown directive renderer consumes notation inside the raw inline excluded code element, dropping its authored closing code tag. The remaining unclosed outer code element causes compileHTML to regard the following paragraph as excluded. That paragraph's private annotation is consequently published unchanged.

A template prefix reproduces the same disclosure. Prefixes with SVG text, role=button or contenteditable preserve the following citation but emit a malformed diagnostic for the excluded example. Without the explicit p wrapper around the later real marker, a preceding code prefix still suppresses its citation, although Markdown preprocessing strips its annotation before the leak stage.

This is within the documented HTML exclusion contract, distinct from native Markdown code spans/fences, which now pass.

## P2: escaped literal braces still seed downstream malformed ownership

```js
compileMarkdown('\\{cite work comment:"\\}\n\n{cite work cue:&quot;Cox 1995&quot; locator:12}\n\nFollowing', cache)
```

Observed: zero citations, one malformed diagnostic; the intended real citation becomes `{cite …}`. Changing the real cue delimiters to literal double quotes also reproduces, as does using entity quotes in the escaped literal prefix. Thus this is a broader escaped-literal boundary defect, not an entity-decoding claim.

The documented escaped marker should remain literal and the next real citation should resolve. With a private comment in that real citation, conservative recovery also swallowed Following in one tested form; it did not expose the private canary.

## Limits

No universal privacy claim for ordinary unescaped raw-text inner quotes. No browser, package or release acceptance. Original exact findings can be recorded as repaired, but full Markdown raw-HTML/escaped-source isolation remains unaccepted until these focused reproductions pass.
