# Complete notation

These code blocks show literal source. The [working examples](./guide.html#examples) show the corresponding rendered citations. Load the compiler and generated metadata as shown in the [Guide](./guide.html#load-compile-initialize) before compiling.

## A work or a group

```text
{cite doi:10.1371/journal.pmed.0020124 | note:"Ioannidis 2005"}
{cite isbn:9780029079379 | locator:"p. 34"}
{cite doi:10.1371/journal.pmed.0020124; isbn:9780029079379}
```

Each semicolon starts another work. Options after a pipe belong to that work, not the whole group. The build/editor resolves identifiers and saves their bibliographic metadata. You do not need to write a JSON reference for each DOI. Compilation itself does not perform a provider lookup.

| Identifier | Meaning |
| --- | --- |
| `doi:10.1371/journal.pmed.0020124` | DOI; a bare DOI or its HTTPS doi.org URL also normalizes |
| `isbn:9780029079379` | ISBN-13 or valid ISBN-10; hyphens/spaces normalize |
| `pmid:16060722` | PubMed record |
| `pmcid:PMC1182327` | PubMed Central record |
| `arxiv:1706.03762` | arXiv identifier, including supported version suffixes |
| `url:https://example.org/work` | A safe HTTPS source URL; HTTPS URLs can also be written bare |
| `dataset:10.6073/pasta/98b16d7d563f265cb52372c8ca99e60f` | Dataset DOI or HTTPS URL alias |
| `software:10.5281/zenodo.3960218` | Software DOI or HTTPS URL alias |
| `interview-one` or `local:interview-one` | A curated source without a universal identifier |

An identifier names what it actually identifies. An ISBN selects an edition, an ISSN identifies a serial and an ORCID identifies a person. They are not interchangeable article identifiers. ISSNs are accepted metadata identifiers but do not by themselves identify an article; author identity belongs in author metadata. New local IDs should use `formatRecordId`, especially for reserved directive names such as `local:endnote`.

## Per-work options

```text
{cite isbn:9780029079379 | prefix:"see also" | locator:"p. 34"}
{cite doi:10.1371/journal.pmed.0020124 | form:narrative}
{cite doi:10.1371/journal.pmed.0020124 | note:"Ioannidis 2005" | tags:methods,reliability}
```

| Option | Effect |
| --- | --- |
| `prefix:"see also"` | Adds text before this work's formatted citation |
| `locator:"p. 34"` | Identifies a page, chapter, section, figure or timestamp |
| `form:parenthetical` | Default parenthetical citation |
| `form:narrative` | Places the author's name in the sentence |
| `form:author-only` | Author without year |
| `form:suppress-author` | Year/locator when the author is already supplied |
| `form:suppress-year` | Author/locator without year |
| `label:"your wording"` | Explicit nonempty reader label; overrides generated in-text wording |
| `note:"editor description"` | Source-only editor note; quoted and allowed to be empty |
| `tags:methods,reliability` | Source-only tag contributions; no reader text by default |
| `isolated` | Omits citation IDs, backlinks and endnote membership for this item |

The selected citation style controls punctuation and interpretation of forms. MLA and Vancouver do not use author/year exactly like Chicago or APA. A group can combine parenthetical-family forms, or all narrative forms; incompatible mixtures are malformed. Use separate markers for those cases. A legacy bare segment such as `| missing source` is an unresolved fallback hint; it is not a general metadata option. Do not use it instead of structured records.

Tags use lowercase letters/digits/hyphens, start with a letter or digit and contain at most 64 characters. `collectMarkerTags` totals contributions; the host's curated record tags remain separate. `inlineTags:'marker'` can display the contribution at that particular mention. See [article tools](./reference/article-tools.html) for note refresh, tag curation and supported reading-list filters.

## Quotes and literal punctuation

Quote values containing notation separators. Escape a literal backslash, brace, semicolon, pipe or double quote with a backslash.

```text
{cite doi:10.1371/journal.pmed.0020124 | label:"A label with \"quotes\" and a \; separator"}
\{cite doi:10.1371/journal.pmed.0020124\}
```

The second line displays literal braces rather than a processed citation. Labels require nonempty double-quoted text. Prefixes/locators can be unquoted when they contain no separators. Do not put newlines inside a marker. Duplicate or invalid options can make the marker malformed; inspect diagnostic codes and retain the original source when uncertain.

Markdown code spans/fences and excluded HTML/interactive regions remain literal when using the markup compilers. Plain-text compilation has no Markdown code-region semantics; choose the entry point appropriate to your input.

## Endnotes and scopes

```text
{cite endnote}
{cite endnote | heading:"References" | level:3}
{cite endnote | scope:since-last | heading:none}
```

Place endnote directives on their own line or paragraph. In Markdown prose, the following text does not need a separating blank line. Inside a list item, put a blank line before and after the directive and indent it to match the item’s text; an inline directive remains literal with a diagnostic. `heading` overrides the configured `endnotesHeading`; `heading:none` keeps an accessible section without a visible heading. `level` accepts 1 through 6. `scope:since-last` closes the current local reference scope, useful for separate entries on one page. A trailing unclosed scope receives its final list. Running-prose placement is diagnosed rather than guessed.

Repeated mentions share one work entry in their scope, with contextual lettered return links. Use separate document namespaces for separate compiled fragments. Year suffixes normally belong to the current reference list; `suffixScope:'cache'` suits one work split over pages sharing a bibliography, not independent articles.

## Reading lists and uncited works

```text
{cite list doi:10.1371/journal.pmed.0020124; isbn:9780029079379 | sort:author}
{cite list doi:10.1371/journal.pmed.0020124; doi:10.6073/pasta/98b16d7d563f265cb52372c8ca99e60f | tags:methods,data | tag-mode:any}
{cite nocite isbn:9780029079379}
```

`list` emits the supplied works as a reading list without inventing in-text mentions. `sort` accepts `author` or `year`. `tags` filters the supplied list by curated effective tags; `tag-mode` is `any` or `all`. Runtime `listFilters` adds reader checkboxes separately from this build-time selection.

`nocite` adds the named works to endnotes without a visible in-text citation. It takes identifiers separated by semicolons, with no list options. Site indexes preserve the distinction between cited and listed-only uses. Inspect the original bibliography before replacing it: uncited references may otherwise disappear.

## Evidence and credit

```text
{cite evidence}
{cite credit}
```

Evidence shows source metadata and provenance; credit identifies the software and how to cite it. Both remain hoverable when ordinary citations use click. Their titles/icons can be configured separately. In isolated-reference output, supplementary interactive annotations are omitted.

## Custom keyword and compatibility

Set `citationKeyword:'ref'` on the compiler, then write `{ref doi:10.1371/journal.pmed.0020124}`, `{ref endnote}`, `{ref list ...}`, `{ref evidence}` and `{ref credit}`. This changes notation, independently of `classPrefix` for CSS and `panelTitle` for reader branding.

Every marker uses the configured keyword, `cite` by default. With `citationKeyword:"reference"`, write `{reference doi:…}` and `{reference endnote}`. Other spellings, including unconfigured `citation` and legacy `{endnotes}`, are ordinary text. `markerKind` classifies the configured grammar; editors should not copy a list of reserved words or infer kind from an ID’s prefix. For example, `list-2001` is a work ID, not a list directive.
