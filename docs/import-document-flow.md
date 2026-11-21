# Full-document import flow

Status: text/Markdown source loop implemented in the 0.4.0 development checkout, 21 November 2026. Native files and automatic identifier enrichment remain planned; no import release or installed API is claimed.

## Implemented text flow

The default demo derives every reference from the bibliography in one Raw Document. Examples, paste, chosen files and dropped UTF-8 TXT/Markdown files use the same path. Source edits recompute boundaries, fields and matches and clear earlier choices conservatively. Download Markdown plus Download references produces a portable pair; original file bytes remain downloadable. See the [demo guide](import-demo.md) for controls and limits.

The sections below retain the design requirements for this flow and its later adapters. Stable source-content entry IDs survive reordering, but this first interface deliberately resets decisions after edits rather than attempting occurrence remapping. Partial rules preserve unsupported entries without inventing fields. Steps 1–4 of the recommended sequence below are implemented and regression-tested; steps 5–6 remain future work.

## One input path

Examples, paste and file selection/drop should be alternative ways to populate the same import session:

1. Obtain the source: choose an example, paste an entire document or select/drop a supported file.
2. Preserve the original and create an editable working representation.
3. Identify article and bibliography regions, with source ranges and an adjustable boundary when uncertain.
4. Segment bibliography entries, retaining each raw entry and proposing fields. Unparsed entries remain available; no invisible supplied-record oracle makes the demonstration succeed.
5. Match in-text citations against references derived from that bibliography. Offer work choices beside the citations.
6. Complete selected references through the [identifier-enrichment flow](import-enrichment-plan.md), while retaining manual correction and completion without an identifier.
7. Show the converted Markdown with literal citation markers and export the data required to use it.

Choosing an example must exercise those same stages. A separately held answer key can test the result but must not populate matching records or fill fields in the running example. Existing record-JSON fixtures can remain in an explicitly separate developer fixture tool; they are not the default user-facing input model.

Do not implement this merely by concatenating the fixture's body and reference strings while continuing to match against detached JSON. The edited bibliography must be the source of its derived reference records.

## Views and editing

- **Document:** the working document rendered for review, including its bibliography under the existing disclosure. Citation controls are derived annotations, not edits to the original source.
- **Converted Document:** generated Markdown and citation markers, updated as decisions change. Unsupported or unresolved material remains present.
- **Raw Document:** one editable full-document working source containing both body and bibliography. Labels/boundary controls may expose which region is treated as references.
- **Diagnostics:** optional extraction, segmentation, field and matching evidence.

Edits to Raw Document recompute every affected projection: region boundaries, reference entries, proposed records, citation matches, completion requirements and converted output. An author/title/year/edition change in a reference must affect suggestions. Editing a bibliographic entry must not leave its old detached metadata in use. Article detection excludes the identified bibliography region, so dates in a reference list do not become spurious in-text citations.

Derived field corrections and explicit source edits are different operations. Keep both tied to the entry's source revision. Do not silently rewrite original reference prose when a provider supplies metadata; expose conflicts in the review data and apply source edits through the reviewed conversion.

Retain existing decisions only when their referenced work, citation identity and mapped source span can be revalidated. Do not transfer choices by array position after an insertion, deletion, bibliography reorder or numbering change. Use stable session entry/occurrence identities, source revisions and explicit mappings; ambiguous remapping goes back to review. Late matching/enrichment responses cannot overwrite a newer source edit or manual choice.

Opening Converted Document and choosing radio targets still does not mutate Raw Document. An explicit Use source/host transaction can replace the working source after review. Original uploaded bytes remain separately preserved.

## Boundaries and parsing

Start with complete pasted text and Markdown-compatible source, plus an explicit References/Bibliography heading and clearly separated entries. A detected heading suggests a boundary; let the editor correct it rather than pretending arbitrary academic layouts are solved. Preserve the text before and after every range exactly.

Wrapped references, footnotes/endnotes, multiple bibliographies, headings inside quoted text, numeric page headers and ambiguous entry breaks need diagnostics and review. Keep unsupported references as raw local entries. In numeric styles, document-local reference numbers remain explicit, never inferred from array order. A citation's position in a paragraph is not enough to choose a different same-author/same-year work automatically.

The current reference parser is partial: APA initials/date/title rules, some Chicago boundaries and numeric labels/explicit DOI text. Those results are proposals. A new full-document pipeline must expose incomplete fields and unsupported bylines; it must not backfill them from the old synthetic fixture records. Extend rules only with measured cases and keep no-identifier/manual completion usable.

## File input

Add file input and a drag/drop well only for formats with a working adapter. Keep keyboard-accessible Choose file alongside drag/drop. File input should populate the same session as paste/examples, not a separate review application.

- Text/Markdown: preserve source, encoding/newline evidence and Markdown structure. Avoid treating citation-looking code as prose.
- PDF: preserve the original file and page evidence; the editable text is extracted text, not the raw PDF. Reading order, columns, hyphenation and bibliography wraps need review. Image-only PDFs need an explicit OCR path or a usable unsupported-format fallback.
- DOCX/ODT: preserve original bytes, document structure and existing bibliography-manager metadata through the separate adapter work. Do not flatten field codes or footnote/endnote relationships and claim lossless import.

Do not upload the document to a provider to make a drop work. Extraction is local; any later metadata lookup has the separate, explicit bibliographic-query permission boundary. If a type is unsupported, reject it clearly and offer paste; do not display a working-looking PDF option that silently ignores layout or citations.

## Converted output

The first full-source implementation preserves the original bibliography by default while applying reviewed citation-span edits. Removal/replacement of that bibliography is a separate reviewed operation only after all entries, including uncited and unresolved ones, are accounted for. It must not happen because a heading was detected.

The portable result needs both converted Markdown and its usable citation records whenever markers use local IDs. Export the reference cache alongside the Markdown, or provide a documented self-contained bundle; a `.md` file containing local IDs alone is insufficient. Canonical DOI/ISBN markers can be used when the accepted identity supports them, while still preserving the metadata/provenance needed for offline rendering. Choose the library's configured directive/keyword when later offering generated bibliography replacement.

Draft.inator should receive a document/references/occurrences model plus revision-bound edit proposals. It owns rich-text positions, transactions, undo, storage and publishing. The demo's textarea representation must not become draft's mandatory editor UI. No host API is committed by this planning document; coordinate source-range and transaction contracts before integration.

## Recommended sequence and acceptance

1. Replace the default fixture-fed demonstration with complete text examples whose bibliography is in Raw Document. Parse explicitly separated references into session records with retained source evidence. Keep unknowns visible.
2. Prove the edit loop before adding provider automation: modify a bibliography title, author and year; insert/reorder/delete entries; renumber a numeric list; edit an in-text locator. Matching, displayed bibliography and converted Markdown must all reflect the working source. Reordering must not transfer a previous choice to a different work.
3. Export Markdown plus the required cache. Verify a clean compiler consumer can render the exported artifact without the demo's hidden fixture state.
4. Add local TXT/Markdown file selection/drop through the same path. Identical input via example/paste/file must yield equivalent review data, apart from honest input provenance.
5. Wire DOI/ISBN completion onto the selected source-derived references, preserving edition distinctions and graceful no-identifier completion.
6. Add PDF/native adapters with the actual public/private development corpus, explicit extraction gaps and fresh independent challenge cases. Native-file quality is a separate claim from a successful drop event.

This prioritizes a coherent text-to-citation workflow before automating enrichment against potentially detached records. The state/colors and current interaction work remain reusable.
