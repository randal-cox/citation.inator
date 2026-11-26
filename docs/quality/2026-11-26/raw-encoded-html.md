# Independent encoded-HTML annotation adversary

Reviewed 2026-11-26 against the current 0.6.0-preview.8 working tree. No product files changed. Source review and bounded direct Node probes only; no build, browser launch, or full suite. Read AGENTS.md and learn/notation.md (the requested docs/notation.md does not exist).

Verdict: **FAIL pending two concrete ownership defects.** The adopter's original encoded-cue defect is fixed in the ordinary cases below. The ownership mechanism still publishes annotations through non-element markup and lets excluded examples corrupt subsequent real citations.

## P1: non-element HTML atoms terminate private annotations

Location: src/markup.mjs:99-100, annotationAtoms. Only element nodes with startTag locations become opaque atoms. HTML comment and doctype/bogus-comment source spans are ignored, although their quotes/braces can terminate the provisional marker scan.

Minimal reproductions, for either compileHTML or compileMarkdown with a resolved `work` in makeCache:

```js
'{cite work comment:"<!-- " } --> PRIVATE_CANARY"}'
'{cite work comment:&quot;<!-- &quot; } --> PRIVATE_CANARY&quot;}'
```

Observed: one resolved citation, no diagnostics, PRIVATE_CANARY present in `result.html`, `result.citationDescriptions`, and `result.occurrences`. It does not enter `result.cache`. Thus both publication and generated context expose the suffix the author placed after an opaque HTML comment atom inside their annotation. This is the same markup-shaped ownership class already protected for `<span title="}">`; it is not a universal claim that unescaped ordinary text quotes remain within a comment.

Additional reproductions:

```js
'{cite work comment:"<?pi " } ?> PRIVATE_CANARY"}'
'{cite work comment:"<![CDATA[ " } ]]> PRIVATE_CANARY"}'
'{cite work comment:"<!DOCTYPE html PUBLIC \'x\' "}">PRIVATE_CANARY"}'
```

Recommendation: include source-located non-element markup atoms, or conservatively fail closed when ownership crosses them. Retain literal behavior outside actual annotations.

## P2: excluded code/attribute notation poisons later encoded fields

Location: src/markup.mjs:81-92, projectMarkerBraces. The global `active` and `quoteOrigin` state traverses source in excluded HTML regions and Markdown literal regions before eligible text-node boundaries are applied. An unmatched quote in an example consequently injects backslashes into a later real citation's entity quotes.

Minimal HTML reproduction:

```js
compileHTML('<code>{cite work comment:"</code><p>{cite work cue:&quot;Cox 1995&quot; locator:12}</p>', cache)
```

Observed: zero citations and a citation-malformed diagnostic. The trailing `<p>` becomes `<p><code>{cite …}</code></p>`. The equivalent standalone paragraph resolves normally. A preceding attribute containing `{cite work comment:&quot;` also corrupts a following valid real annotation.

Markdown reproductions:

```js
compileMarkdown('`{cite work comment:"`\n\n{cite work cue:&quot;Cox 1995&quot; locator:12}', cache)
compileMarkdown('```text\n{cite work comment:"\n```\n\n{cite work cue:&quot;Cox 1995&quot; locator:12}', cache)
```

Both give zero citations and a malformed diagnostic. This contradicts the documented isolation of Markdown code regions and excluded HTML. A related HTML case with a real `comment:&quot;PRIVATE_CANARY&quot;` and `<p>Following</p>` also discards that following paragraph under fail-closed recovery.

Recommendation: keep quote-origin ownership local to a candidate in an eligible source region; an excluded example must not seed the next candidate's lexical state.

## Positive coverage

- 686 valid independent delimiter combinations across compileHTML and compileMarkdown: cue, locator and comment independently used literal quotes, `&quot;`, `&#34;`, `&#x22;`, `&#X22;`, `&#00034;`, or semicolonless `&#34`. All produced one resolved citation, no diagnostics, and no PRIVATE_CANARY anywhere in the serialized result.
- Tested literal inner quotes inside entity-delimited annotations and entity quotes inside literal-delimited annotations; private text remained absent.
- Tested nested span attributes with quote/brace payloads, including entity quotes, malformed attributes, and SVG/title children; private text remained absent.
- Tested encoded backslashes, encoded annotation field letters/colon, malformed comments, and numeric entities without semicolons; private text remained absent in the applicable cases.
- Completed encoded markers in inline code and indented Markdown code remained literal while a following valid citation compiled normally.
- Verified HTML-comment disclosure against every top-level result field, rather than only visible HTML.

The initial 1,024-case exploratory matrix also included semicolonless hex immediately followed by `Cox`; those 128 cases decode the leading C as part of the numeric entity and do not represent quote delimiters. They are excluded from the 686 valid-combination count and are not reported as product defects.

## Limits

This is a bounded source/compiler adversary, not browser, packaged-distribution, cache-provider, or release acceptance. It does not extend annotation ownership to ordinary unescaped raw-text quotes. Existing suite/browser evidence was not rerun. A parent patch needs focused reproduction checks before these findings can be closed.
