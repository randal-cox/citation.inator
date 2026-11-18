import { cleanText, httpsURL, identifierURL } from "./records.mjs";

export const DEFAULT_ACCESS_STORAGE_KEY = "citation-inator.access.v1";
export const accessKinds = ["free", "publisher", "subscription", "library", "lending", "accessibility", "discovery"];
export const defaultAccessCatalog = [
  { id: "open-access", label: "Open-access copy", kind: "free" },
  { id: "author-preprint", label: "Author’s preprint", kind: "free" },
  { id: "jstor", label: "JSTOR", kind: "subscription" },
  { id: "project-muse", label: "Project MUSE", kind: "subscription" },
  { id: "perlego", label: "Perlego", kind: "subscription" },
  { id: "worldcat", label: "WorldCat", kind: "library" },
  { id: "internet-archive", label: "Internet Archive", kind: "lending" },
  { id: "open-library", label: "Open Library", kind: "lending" },
  { id: "bookshare", label: "Bookshare", kind: "accessibility" },
  { id: "google-scholar", label: "Google Scholar", kind: "discovery" }
].map(Object.freeze);
Object.freeze(defaultAccessCatalog);

export function accessCatalog(overrides = []) {
  if (!Array.isArray(overrides)) throw new TypeError("Supply an access catalogue array.");
  const catalog = new Map(defaultAccessCatalog.map(item => [item.id, { ...item }]));
  for (const item of overrides) {
    if (!item || !/^[a-z0-9][a-z0-9-]{0,63}$/.test(item.id)) throw new TypeError("Supply a stable service id.");
    if (item.remove) catalog.delete(item.id);
    else {
      const entry = { ...catalog.get(item.id), ...item };
      if (!cleanText(entry.label) || !accessKinds.includes(entry.kind)) throw new TypeError("Supply a service label and kind.");
      catalog.set(item.id, { id: item.id, label: cleanText(entry.label), kind: entry.kind });
    }
  }
  return [...catalog.values()];
}

export function normalizeAccessProfile(value) {
  if (value === null) return null;
  if (!value || !Array.isArray(value.services) || value.services.some(id => typeof id !== "string" || !/^[a-z0-9][a-z0-9-]{0,63}$/.test(id))) {
    throw new TypeError("Supply services as an array of service ids, or null to clear the profile.");
  }
  const services = [...new Set(value.services)];
  const preferred = cleanText(value.preferred);
  if (preferred && !services.includes(preferred)) throw new TypeError("Choose a preferred service from your services.");
  let library = null;
  if (value.library) {
    const { kind, base } = value.library;
    const safe = httpsURL(base);
    if (!["proxy", "openurl"].includes(kind) || !safe || new URL(safe).hash) {
      throw new TypeError("Supply an HTTPS proxy or OpenURL address without a fragment.");
    }
    library = { kind, base: safe };
  }
  return { services, preferred: preferred || null, library, updatedAt: value.updatedAt && Number.isFinite(Date.parse(value.updatedAt)) ? new Date(value.updatedAt).toISOString() : new Date().toISOString() };
}

export function accessProfileState(profile) {
  return profile === null ? "unknown" : profile.services.length ? [...profile.services] : "none";
}

export function serviceFor(location, catalog = defaultAccessCatalog) {
  const original = defaultAccessCatalog.find(item => item.label.toLowerCase() === location.provider?.toLowerCase());
  return catalog.find(item => item.id === location.service) ||
    catalog.find(item => item.label.toLowerCase() === location.provider?.toLowerCase()) ||
    catalog.find(item => item.id === original?.id) ||
    { id: location.service || location.provider?.toLowerCase() || "publisher", label: location.provider || "Publisher", kind: "publisher" };
}

export function libraryURL(record, library) {
  if (!library) return "";
  const best = identifierURL(record.identifiers.find(id => id.scheme === "doi")) ||
    identifierURL(record.identifiers.find(id => id.scheme === "url")) ||
    record.locations.find(location => location.kind === "publisher")?.url;
  if (library.kind === "proxy") return best ? httpsURL(library.base + encodeURIComponent(best)) : "";
  const url = new URL(library.base);
  url.searchParams.set("url_ver", "Z39.88-2004");
  url.searchParams.set("ctx_ver", "Z39.88-2004");
  const book = ["book", "chapter"].includes(record.type);
  url.searchParams.set("rft_val_fmt", "info:ofi/fmt:kev:mtx:" + (book ? "book" : "journal"));
  url.searchParams.set("rft.genre", record.type === "chapter" ? "bookitem" : book ? "book" : record.type === "article-journal" ? "article" : "unknown");
  for (const id of record.identifiers) {
    if (id.scheme === "doi") url.searchParams.append("rft_id", "info:doi/" + id.value);
    if (id.scheme === "isbn") url.searchParams.append("rft.isbn", id.value);
    if (id.scheme === "issn") url.searchParams.append("rft.issn", id.value);
  }
  if (record.title) url.searchParams.set(record.type === "book" ? "rft.btitle" : "rft.atitle", record.title);
  if (record.containerTitle) url.searchParams.set(book ? "rft.btitle" : "rft.jtitle", record.containerTitle);
  if (record.issued?.[0]) url.searchParams.set("rft.date", String(record.issued[0]));
  const author = record.authors[0];
  if (author?.literal) url.searchParams.set("rft.au", author.literal);
  else if (author) {
    url.searchParams.set("rft.aulast", author.family);
    if (author.given) url.searchParams.set("rft.aufirst", author.given);
  }
  return url.href;
}

export function groupAccess(items, profile) {
  const free = [], selected = [], other = [];
  for (const item of items) {
    if (item.access === "open") free.push(item);
    else if (item.service === "reader-library" || profile?.services.includes(item.service)) selected.push(item);
    else other.push(item);
  }
  selected.sort((a, b) => Number(b.service === profile?.preferred) - Number(a.service === profile?.preferred));
  return { free, selected, other };
}
