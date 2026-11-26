# Bibliography corpus review — 0.6 preview.5

This bounded review tested the authorized local BEST snapshot and three public PLOS PDFs. It separates file fidelity, reference segmentation and metadata proposals. None of these counts measures end-to-end citation correctness or certifies a paper's bibliography.

## Interchange fidelity

The private snapshot contained 34 records. No private records, library identifiers or files are included in this report or distribution. Exported bytes were parsed again and compared against the starting snapshot.

| Format | Imported | Exact titles | Exact creator text | Exact full dates | Exact editor counts |
| --- | ---: | ---: | ---: | ---: | ---: |
| CSL-JSON | 34 | 34 | 34 | 34 | 34 |
| RIS | 34 | 34 | 34 | 34 | 34 |
| BibTeX | 34 | 34 | 33 | 27 | 34 |

The one BibTeX creator-text difference was formatting, with no substantive letters or digits changed. Seven full-date differences lose day precision and are diagnosed. BibTeX/RIS projections require explicit acknowledgement; seven URL warnings and one shared-ISBN group still need identity review. Shared identifiers are not automatic merge decisions.

The review found and fixed RIS book-editor role loss and software/date precision loss. Book editors now use A3; full dates use Y1. Import preserves known editor roles and uses conservative date precision recovery. Regression tests cover book, chapter, journal and software records, including legacy ED input. This is a parser round trip, not a claim that the exported files have been imported into Zotero itself.

## Public PDF extraction

Publisher JATS reference lists supplied independent entry counts. The PDFs were text-extracted with the project's adapter; selected fields were compared to publisher references and wrapped tails were visually inspected in rendered PDF pages.

| Public source | PDF pages | Publisher references | Extracted bibliography rows | Rows with title/year proposals |
| --- | ---: | ---: | ---: | ---: |
| [Ioannidis 2005](https://doi.org/10.1371/journal.pmed.0020124) | 6 | 37 | 37 | 37 |
| [Wilson et al. 2014](https://doi.org/10.1371/journal.pbio.1001745) | 7 | 69 | 69 | 62 |
| [Wilson et al. 2017](https://doi.org/10.1371/journal.pcbi.1005510) | 20 | 20 | 20 | 8 |

Wilson 2014 originally produced 73 rows. Four false rows came from wrapped page ranges or DOI tails. The fix joins standalone numeric continuations only when the preceding entry has an open page range or partial DOI; regression fixtures retain three real numbered entries with their original labels. Compact PLOS author/year recognition now proposes titles and years while retaining partial state, source spans and required human review.

Sampled matches covered Ioannidis references 1, 2, 13 and 37; Wilson 2014 references 7 and 44 plus manual mixed-citation checks at 1, 28, 42, 61 and 62; Wilson 2017 references 1, 3, 5 and 15. The counts do not establish that every proposed field is correct. Organization guidelines with multi-sentence titles, PDF word hyphenation and book/web/conference boundaries remain imperfect. These failures belong to extraction/import, rather than necessarily to the source paper.

## Reproduce the regressions

Run `node --test test/import-document.test.mjs test/library-maintenance.test.mjs`. The synthetic regressions reproduce the failures without requiring private material or downloading publisher files during tests. Public comparison can be repeated with each linked publisher PDF and JATS XML using the document extraction API; compare reference counts separately from identity and field accuracy.

The independent corpus reviewer returned PASS after rechecking the runtime fixes. The writer workspace also has independent copy/integrity review and automated browser evidence, recorded in the [milestone](milestones/0.6.0.md). Real Zotero file import, authenticated editor integration and final release acceptance remain separate.
