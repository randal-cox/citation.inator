import { createIdentifierResolver } from "./identifier-resolver.mjs";
import { cleanText, httpsURL, canonicalIdentifierKey, localRecordId, normalizeIdentifier, normalizeRecord } from "./records.mjs";

const provider = "Open Library";
const bookKey = identifier => canonicalIdentifierKey(identifier).toUpperCase();
const endpoint = identifier => new URL(`https://openlibrary.org/api/books?${new URLSearchParams({
  bibkeys: bookKey(identifier), format: "json", jscmd: "data"
})}`);

function bookRecord(raw, identifier, retrievedAt, url) {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) throw new Error("Open Library returned an invalid payload.");
  const book = raw[bookKey(identifier)];
  if (!book) return null;
  const values = name => Array.isArray(book.identifiers?.[name]) ? book.identifiers[name] : [];
  const isbns = [...values("isbn_10"), ...values("isbn_13")].map(value => normalizeIdentifier(`isbn:${value}`)).filter(Boolean);
  if (!isbns.some(item => canonicalIdentifierKey(item) === canonicalIdentifierKey(identifier))) {
    throw new Error("Open Library did not verify this ISBN on the returned edition.");
  }
  const title = [cleanText(book.title), cleanText(book.subtitle)].filter(Boolean).join(": ");
  const authors = (Array.isArray(book.authors) ? book.authors : [])
    .map(author => ({ literal: cleanText(author?.name) })).filter(author => author.literal);
  const years = cleanText(book.publish_date).match(/\b[1-9]\d{3}\b/g);
  const issued = years?.length === 1 ? [Number(years[0])] : null;
  // Books API records can still carry a legacy HTTP link to their Open Library edition.
  const safe = httpsURL(cleanText(book.url).replace(/^http:\/\/openlibrary\.org\//i, "https://openlibrary.org/"));
  const edition = safe && new URL(safe);
  const editionURL = edition?.origin === "https://openlibrary.org" &&
    /^\/books\/OL\d+M(?:\/|$)/.test(edition.pathname) ? safe : null;
  return normalizeRecord({
    id: localRecordId("openlibrary", canonicalIdentifierKey(identifier)), type: "book",
    state: title && authors.length && issued ? "resolved" : "partial", title, authors, issued,
    publisher: book.publishers?.[0]?.name, publisherPlace: book.publish_places?.[0]?.name, identifiers: [identifier],
    retrievedAt,
    locations: [{ kind: "library", provider, url: editionURL, verifiedAt: retrievedAt }],
    provenance: [{ provider, url, retrievedAt }]
  });
}

export function createOpenLibraryResolver(options) {
  return createIdentifierResolver({
    provider, scheme: "isbn", fields: ["title", "authors", "issued", "publisher", "publisherPlace"], locationKind: "library",
    endpoint, metadata: bookRecord,
    missMessage: "Open Library has no edition for this ISBN.",
    unsupportedMessage: "Open Library resolves ISBN records. Other sources use the supplied cache."
  }, options);
}
