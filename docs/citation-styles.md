# Citation styles and support

This catalogue separates citation systems, named presets, source types and import recognition. A shared system does not make two house styles interchangeable. This is an initial curated inventory, not certification of every rule or a static list of every journal variant.

## Current library support

Formatting presets below exist in released 0.2.0. All import recognition/reference rules described here are experimental source-checkout APIs for 0.4.0; they are absent from the released 0.2.0 exports, CLI and browser bundle.

| Preset | Reader citation form | Reference formatting | Import recognition / reference rules |
| --- | --- | --- | --- |
| `chicago-author-date` | Author–date, narrative and locators | Books/journal articles; initial artwork support | Experimental author–date recognition; partial date/title reference rules |
| `apa` | Author–date, narrative and locators | Common books/journal articles | Experimental author–date recognition and initial byline/date/title reference rules |
| `mla` | Author–page and narrative | Common books/journal articles | Not yet implemented |
| `harvard` | Author–date preset | Common books/journal articles; exact Cite Them Right/institutional conformity is not certified | Not yet implemented |
| `vancouver` | Numeric references | Common books/journal articles | Experimental bracketed numbers/ranges; reference labels/explicit DOIs only |
| `default` | Original compatibility format | Existing generic behavior | Not an import style |

Named presets are purpose-built formatters, not a CSL engine or a promise of exhaustive conformity to a published manual. Formatting a citation and recognizing an existing citation are different capabilities. Chapters, legislation, webpages, software, datasets and media need source-specific scrutiny; see [media coverage](media-support.md). Curated reference text/parts can preserve a required house form where automatic formatting is insufficient. Existing citation.inator endnotes are reference lists, not an implementation of Chicago shortened notes, ibid. or legal citation conventions.

## Systems and variants

- **Author–date:** names and publication dates connect prose to a reference list; APA, Chicago author–date and Harvard variants differ in punctuation, bylines and reference details.
- **Author–page:** names/titles and locators connect prose to a works-cited list.
- **Numeric:** a document-local reference number identifies a work. Brackets, parentheses, superscripts and numbering policy vary.
- **Notes and bibliography:** note numbers connect prose to notes, which can contain both citations and discussion; a bibliography is separate. Chicago documents [both of its systems](https://www.chicagomanualofstyle.org/tools_citationguide.html).
- **Legal and other specialist systems:** jurisdiction, authority hierarchy and specialized locators make a numeric or note-shaped label insufficient to determine full formatting.

## Named-style inventory

The following edition/variant labels and family classifications were read from the official [CSL style repository](https://github.com/citation-style-language/styles) on 20 November 2026. They describe those external style definitions, not editions certified by citation.inator. Linked definitions may evolve. The complete repository, including its dependent journal/publisher variants, is the maintained broad catalogue; this table highlights common choices for migration planning.

| External style definition | CSL family | citation.inator status |
| --- | --- | --- |
| [APA Style 7th edition](https://raw.githubusercontent.com/citation-style-language/styles/master/apa.csl) | author-date | Related named preset; exact edition/variant compliance not certified |
| [Chicago Manual of Style 18th edition (author-date)](https://raw.githubusercontent.com/citation-style-language/styles/master/chicago-author-date.csl) | author-date | Related named preset; exact edition/variant compliance not certified |
| [MLA Handbook 9th edition (in-text citations)](https://raw.githubusercontent.com/citation-style-language/styles/master/modern-language-association.csl) | author | Related named preset; exact edition/variant compliance not certified |
| [Cite Them Right 12th edition (author-date/Harvard)](https://raw.githubusercontent.com/citation-style-language/styles/master/harvard-cite-them-right.csl) | author-date | Related named preset; exact edition/variant compliance not certified |
| [IEEE Reference Guide version 11.29.2023](https://raw.githubusercontent.com/citation-style-language/styles/master/ieee.csl) | numeric | No dedicated preset |
| [AMA Manual of Style 11th edition](https://raw.githubusercontent.com/citation-style-language/styles/master/american-medical-association.csl) | numeric | No dedicated preset |
| [ACS Guide 2026 revision](https://raw.githubusercontent.com/citation-style-language/styles/master/american-chemical-society.csl) | numeric | No dedicated preset |
| [APSA Style Manual revised 2018 edition](https://raw.githubusercontent.com/citation-style-language/styles/master/american-political-science-association.csl) | author-date | No dedicated preset |
| [ASA Style Guide 6th/7th edition](https://raw.githubusercontent.com/citation-style-language/styles/master/american-sociological-association.csl) | author-date | No dedicated preset |
| [American Anthropological Association](https://raw.githubusercontent.com/citation-style-language/styles/master/american-anthropological-association.csl) | author-date | No dedicated preset |
| [OSCOLA 4th edition](https://raw.githubusercontent.com/citation-style-language/styles/master/oscola.csl) | note | No dedicated preset |
| [Australian Guide to Legal Citation 4th edition](https://raw.githubusercontent.com/citation-style-language/styles/master/australian-guide-to-legal-citation.csl) | note | No dedicated preset |
| [Nature](https://raw.githubusercontent.com/citation-style-language/styles/master/nature.csl) | numeric | No dedicated preset |
| [Science](https://raw.githubusercontent.com/citation-style-language/styles/master/science.csl) | numeric | No dedicated preset |
| [Public Library of Science](https://raw.githubusercontent.com/citation-style-language/styles/master/plos.csl) | numeric | No dedicated preset |
| [Association for Computing Machinery](https://raw.githubusercontent.com/citation-style-language/styles/master/association-for-computing-machinery.csl) | numeric | No dedicated preset |
| [ISO-690 (author-date, English)](https://raw.githubusercontent.com/citation-style-language/styles/master/iso690-author-date-en.csl) | author-date | No dedicated preset |
| [ISO-690 (numeric, English)](https://raw.githubusercontent.com/citation-style-language/styles/master/iso690-numeric-en.csl) | numeric | No dedicated preset |
| [Chicago notes and bibliography](https://www.chicagomanualofstyle.org/tools_citationguide.html) | note | No dedicated note-style formatter |

For normative examples consult the [APA author–date guide](https://apastyle.apa.org/style-grammar-guidelines/citations/basic-principles/author-date), [Chicago guide](https://www.chicagomanualofstyle.org/tools_citationguide.html) and [MLA source-format guide](https://style.mla.org/works-cited/citations-by-format/), then the particular publisher's requirements. The CSL inventory is a discovery aid, not a replacement for those authorities.

## Coverage maintenance

For each new formatter or import form, record the governing edition/variant, source types, locators, ambiguity/reprint rules, test fixtures and a runnable example. Keep recognition, field parsing, rendering and host integration evidence separate. More presets or a general style engine require measured demand rather than assuming all members of a citation family behave alike.
