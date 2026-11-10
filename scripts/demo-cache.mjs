import { makeCache } from "../src/records.mjs";

const publisherByCase = {
  "farneth-2023-politics-ritual": "Princeton University Press",
  "feiler-2026-time-gather": "Penguin Random House",
  "simas-clifford-kirkland-2020-empathy-polarization": "Cambridge University Press",
  "feinberg-willer-2019-moral-reframing": "Wiley",
  "givens-2021-radical-empathy": "Policy Press",
  "norton-2024-ritual-effect": "Simon & Schuster"
};

export function demoCache(fixtures) {
  const verifiedAt = `${fixtures.verifiedAt}T00:00:00Z`;
  return makeCache(fixtures.cases.flatMap(item => {
    const publisher = item.urls?.publisher || item.urls?.publisherRecord;
    const provider = publisherByCase[item.id];
    const ids = Object.entries(item.identifiers || {}).flatMap(([scheme, values]) =>
      [values].flat().map(value => ({ scheme, value }))
    );
    const resolved = item.status !== "unresolved";
    const record = {
      id: item.id, title: item.title, authors: item.authors,
      issued: item.issued ? String(item.issued).split("-").map(Number) : null,
      type: ({ "journal-article": "article-journal", "doctoral-dissertation": "thesis" })[item.type] || item.type,
      state: resolved ? (item.status === "verified-partial-identifier" ? "partial" : "resolved") : "unresolved",
      original: item.original, note: item.note, citationText: item.apa,
      publisher: item.publisher || item.institution, containerTitle: item.containerTitle, volume: item.volume,
      issue: item.issue, pages: item.pages, articleNumber: item.articleNumber,
      identifiers: ids, retrievedAt: resolved ? verifiedAt : null,
      locations: [
        ...(publisher ? [{ kind: "publisher", provider, url: publisher, verifiedAt }] : []),
        ...(item.urls?.jstor ? [{ kind: "repository", provider: "JSTOR", url: item.urls.jstor, verifiedAt }] : [])
      ],
      provenance: [
        { provider: "citation.inator editorial handoff", retrievedAt: resolved ? verifiedAt : null, note: "Original citation and curation preserved in the source fixtures." },
        ...(publisher ? [{ provider, url: publisher, retrievedAt: verifiedAt }] : [])
      ]
    };
    if (item.id.startsWith("simas-")) {
      record.online = [2019, 10, 31];
      record.print = [2020, 2];
      record.version = "version of record";
      record.abstract = {
        kind: "excerpt", source: provider, url: publisher,
        text: "Over the past two decades, there has been a marked increase in partisan social polarization, leaving scholars in search of solutions to partisan conflict."
      };
      record.locations.push({ kind: "preprint", url: item.urls.authorPreprintPdf, provider: "Author website", version: "author preprint", verifiedAt });
      record.provenance.push({ provider: "Author website", url: item.urls.authorPreprintPdf, note: "Separate author preprint PDF. The DOI identifies the journal article." });
    }
    if (item.urls?.repositoryPdf) {
      record.version = "repository dissertation";
      record.locations.push({ kind: "pdf", url: item.urls.repositoryPdf, provider: "University of Minnesota Digital Conservancy", version: record.version, verifiedAt });
      record.provenance.push({ provider: "University of Minnesota Digital Conservancy", url: item.urls.repositoryPdf, retrievedAt: verifiedAt });
    }
    if (item.id.startsWith("farneth-")) {
      const doi = ids.find(item => item.scheme === "doi");
      record.identifiers = ids.filter(item => item.scheme === "isbn");
      record.citationText = item.apa.split(" https://doi.org/")[0];
      record.locations = record.locations.filter(item => item.kind === "publisher");
      record.note = "Publisher ISBN record. JSTOR assigns a separate DOI to its digital book record.";
      const digital = {
        ...record, id: `${record.id}-jstor`, identifiers: [doi], citationText: item.apa,
        locations: [{ kind: "repository", provider: "JSTOR", url: item.urls.jstor, verifiedAt }],
        provenance: [record.provenance[0], { provider: "JSTOR book metadata", url: item.urls.jstor, retrievedAt: verifiedAt }],
        note: "Digital book record identified by JSTOR. The print ISBN is tracked separately."
      };
      return [record, digital];
    }
    if (item.id.startsWith("givens-")) {
      // The editorial seed collects candidate identifiers. Only the publisher DOI
      // is indexed here until the edition/platform mapping is independently reviewed.
      record.identifiers = ids.filter(item => item.scheme === "doi" && item.value.startsWith("10.46692/"));
      record.locations = record.locations.filter(item => item.kind === "publisher");
      record.note = "Additional ISBNs and the JSTOR DOI remain in the original fixtures for edition review.";
    }
    if (item.id.startsWith("feiler-")) record.edition = "Hardcover";
    return [record];
  }));
}
