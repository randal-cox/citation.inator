import { createIdentifierResolver } from "./identifier-resolver.mjs";
import { cleanText, dateParts, identifierKey, localRecordId, normalizeIdentifier, normalizeRecord } from "./records.mjs";

const CROSSREF = "Crossref";
const works = "https://api.crossref.org/works/";
const bibliographicFields = ["title", "authors", "issued", "online", "print", "containerTitle", "publisher", "volume", "issue", "pages", "articleNumber"];
const crossrefType = type => ({
  "journal-article": "article-journal", book: "book", "book-chapter": "chapter",
  dissertation: "thesis", "posted-content": "article", dataset: "dataset", report: "report"
})[type] || "document";
const date = item => dateParts(item?.["date-parts"]?.[0]);

export function crossrefRecord(raw, identifier, retrievedAt, url) {
  const message = raw?.message;
  const actual = normalizeIdentifier(`doi:${cleanText(message?.DOI)}`);
  if (!actual || identifierKey(actual) !== identifierKey(identifier)) throw new Error("Crossref returned a different or missing DOI.");
  const authors = Array.isArray(message.author) ? message.author.map(author => ({
    family: cleanText(author?.family), given: cleanText(author?.given), literal: cleanText(author?.name)
  })).filter(author => author.family || author.literal) : [];
  const title = Array.isArray(message.title) ? cleanText(message.title[0]) : "";
  const online = date(message["published-online"]);
  const print = date(message["published-print"]);
  const issued = print || date(message.issued) || online;
  const updates = Array.isArray(message["update-to"]) ? message["update-to"] : [];
  const notice = updates.find(item => ["retraction", "correction", "expression-of-concern"].includes(item?.type));
  return normalizeRecord({
    id: localRecordId("crossref", identifierKey(identifier)),
    title, authors, issued, online, print, identifiers: [identifier],
    type: crossrefType(message.type), state: title && authors.length && issued ? "resolved" : "partial",
    version: message.type === "posted-content" && message.subtype === "preprint" ? "preprint" : null,
    publisher: message.publisher, containerTitle: Array.isArray(message["container-title"]) ? message["container-title"][0] : "",
    volume: message.volume, issue: message.issue, pages: message.page, articleNumber: message["article-number"],
    retrievedAt,
    locations: [{ kind: "publisher", provider: CROSSREF, url: message.resource?.primary?.URL }],
    provenance: [{ provider: CROSSREF, url, retrievedAt, note: notice ? "Update relation retained in raw metadata. This record may describe the notice itself." : "" }]
  });
}

export function createCrossrefResolver(options) {
  return createIdentifierResolver({
    provider: CROSSREF, scheme: "doi", fields: bibliographicFields, locationKind: "publisher",
    endpoint: identifier => new URL(works + encodeURIComponent(identifier.value)), metadata: crossrefRecord,
    missMessage: "Crossref has no record for this DOI. Other registration agencies may still have it.",
    unsupportedMessage: "Live resolution is available for DOI records. Other sources use the supplied cache."
  }, options);
}
