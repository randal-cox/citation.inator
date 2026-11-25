# Marker keyword in 0.5.1

The default keyword is `cite` for every marker:

```text
{cite doi:10.1371/journal.pmed.0020124}
{cite endnote}
{cite list source-one; source-two}
{cite nocite source-three}
{cite evidence}
{cite credit}
```

Set `citationKeyword:"reference"` to use `reference` instead for both works and directives. There is one configured spelling; neither `cite` nor `citation` is an automatic alias when another keyword is configured. You may explicitly choose `citationKeyword:"citation"` if that is your site's chosen notation.

## Moving existing source

Before 0.5.1 the default keyword was `citation`, with a work-only `cite` short form and legacy `{endnotes}`. Choose your site's keyword and update every marker consistently, including endnote/list/nocite/evidence/credit directives. Replace `{endnotes}` with the configured endnote directive. Update editor/build options together, rebuild, and check reference counts, grouping and return links. Keep code examples and escaped literal notation separate from active markers when editing source.

Unconfigured marker spellings are ordinary text, without a diagnostic; they are not silently converted. Review the rendered article and source after migration. The change is intentional in this pre1.0 patch and requires the current adopter's explicit approval.

The keyword change does not rename `citation-inator.cache.v1`, `<citation-inspector>`, `initializeCitationInspector`, browser assets, `citation-*` classes or `data-citation-part` hooks. Metadata records and compiled reference APIs retain their contracts. Old released tags and archives preserve their original behavior.
