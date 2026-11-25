# Authoring citations

**Authors describe the source and its use; site configuration controls shared behavior.**

An article author writes citation markers. Spaces separate named fields; pipes are optional visual separators. These are equivalent:

```text
{cite isbn:9780029079379 original-year:1912 locator:"p. 34"}
{cite isbn:9780029079379 original-year:1912 | locator:"p. 34"}
```

Quote values containing spaces or marker punctuation. Existing pipe-separated fields remain valid; quoted pipes and semicolons stay inside the value. Tools preserve existing marker text when updating notes.

An article author writes citation markers. The site sets up the compiler and reader once. JavaScript is for shared appearance, interactions and integrations; it is not required for the article-specific details below. These fields are part of the 0.5.1 development candidate, not released 0.5.0.

## Dates and formatted references

```text
{cite isbn:9780029079379 | original-year:1912}
{cite isbn:9780029079379 | original-year:1912 | edition-year:1995}
{cite isbn:9780029079379 | reference:"Durkheim, É. (1995). *The elementary forms of religious life*. Free Press."}
```

The resolved ISBN normally supplies the edition date. Use `edition-year:` to correct it. Years are four-digit integers from 1000 through 9999; an original year cannot follow the edition year. A changed edition year replaces the old date, including its month/day. An unchanged year retains the known month/day.

`reference:` replaces the full reference text in endnotes and panels. Single asterisks mean italic; double asterisks mean bold. This is a limited text format: HTML, links and nested emphasis are not interpreted. In HTML source, encode literal `<`, `>` and `&` as usual. Backslash-escape literal marker delimiters inside values (`\"`, `\|`, `\;`, `\{`, `\}`). Year letters still come from the chosen citation style; for custom references, include the work's date as ordinary text so the formatter can locate it.

## Artwork and copy details

```text
{cite museum-work | attribution:"Attributed to" | display-date:"c. 1500" | medium:"Oil on panel" | dimensions:"30 × 40 cm" | institution:"Example museum" | accession:"A-12" | rights:"CC BY-SA" | photographer:"Example photographer" | uploader:"Example uploader"}

{cite doi:10.1371/journal.pmed.0020124 | read-url:"https://journals.plos.org/plosmedicine/article?id=10.1371/journal.pmed.0020124" | access:open}

{cite museum-work | pdf:"https://example.org/work.pdf" | checked:2026-11-25 | access:open}
```

`museum-work` must identify an existing record; these options supplement its metadata. They do not manufacture a new work or a creator identity. `attribution:` is a qualifier before the creator already named in the record (for example, `"Attributed to"`); photographer and uploader are separate contributor roles. `display-date:` accepts a literal date or range. `rights:` names the license or rights statement; it is an author assertion, not a legal verification.

`read-url:` adds an online copy; `pdf:` adds a PDF copy. URLs must be HTTPS. A PDF requires a real `checked:YYYY-MM-DD` date. Do not fill in a date unless you checked the link. `access:` is `open`, `subscription`, `purchase`, `loan` or `unknown` (the default). It applies only to the supplied copy URLs, never to every PDF or to the work as a whole. Adding a copy does not replace the DOI in copied citations or exports. Both URLs in a single marker share its access/check date; use shared metadata for copies needing distinct properties.

## Consistency and provenance

Declarations apply to the resolved work throughout one compilation, including mentions that use another identifier alias. Repeat identical declarations freely; contradictory declarations fail with an actionable error. Input caches are unchanged. The returned cache contains the effective metadata and Document author provenance, preserving the provider trail and prior changed values.

Date corrections conflict with pre-authored reference text or literal display dates unless the author also supplies `reference:`. The library does not rewrite curated prose. For `suffixScope:"cache"`, put date changes in shared records first, so separate pages agree about year letters.

## Identifier discovery

The npm starter's `npm run resolve` resolves DOI, ISBN and PMID markers and saves the generated metadata. PubMed lookups use Europe PMC's exact MED identifier endpoint. Its explicit DOI/PMCID fields connect aliases; matching titles never establishes identity. `mergeResolvedRecord(cache, record)` merges a uniquely shared identifier while preserving existing curated fields. Conflicting mappings require review. Provider errors leave the prior cache file unchanged; retry later or use import review/curated metadata.

Existing partial records are not automatically completed by this starter; review them through import or curated metadata.

The compiler itself remains offline. The Playground uses saved example metadata, so selecting an example does not trigger live provider calls. The copied-file starter also uses saved metadata; run the npm resolver before copying updated data if you need fresh identifiers.

For integrations, import `createPubMedResolver` from `cite-inator/pubmed` and `mergeResolvedRecord` from `cite-inator/records`. The resolver shares the bounded timeout, retry/backoff, cache and evidence contract of the Crossref/ISBN resolvers. Exact provider behavior and coverage: [Europe PMC REST service](https://dev.europepmc.org/RestfulWebService).

## Author-defined reading-list topics

```text
{cite tags doi:10.1371/journal.pmed.0020124 methods:"Methods"}

{cite tags isbn:9780029079379 theory:"Theory"}

{cite list doi:10.1371/journal.pmed.0020124; isbn:9780029079379 filters:true}
```

A `tags` block assigns topics to a work and gives each topic its reader-facing label. It is not an in-text citation and does not add the work to an endnote list by itself. Repeated declarations accumulate topics; conflicting labels for the same topic ID fail. Aliases refer to the same record. Topic IDs use lowercase letters, digits and hyphens (up to 64 characters). Put declarations in separate paragraphs/blocks; code and excluded elements do not declare topics.

The list's `filters:true` enables checkboxes for that list even when site defaults disable them or impose a length threshold. `filters:false` disables them for that list. Existing `tags:` and `tag-mode:` list options select a subset at compile time; they are different from assigning topics.

Site `tagCatalogue` and `listItemTags` configuration remain available for shared vocabularies and icons. Author labels must agree with any configured label for the same ID. Declared topics are retained in the effective records with author provenance; labels remain in the document's declarations. `collectMarkerTags` counts topics on citation mentions, not these non-citing declarations.
