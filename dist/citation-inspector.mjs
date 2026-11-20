/*! citation-inator v0.2.0-preview.0 | MIT | See LICENSE */

// src/records.mjs
var CACHE_SCHEMA = "citation-inator.cache.v1";
var cleanText = (value) => typeof value === "string" ? value.trim() : "";
var normalizeTags = (value) => [...new Set((Array.isArray(value) ? value : []).filter((tag) => typeof tag === "string" && /^[a-z0-9][a-z0-9-]{0,63}$/.test(tag)))];
var stableId = /^[a-z0-9][a-z0-9.-]{0,159}$/;
var doi = (value) => /^10\.\d{4,9}\/[^\s\u0000-\u001f\u007f<>{}]+$/iu.test(value) && !value.split("/").some((part) => part === "." || part === "..");
var kinds = /* @__PURE__ */ new Set(["article-journal", "book", "thesis", "article", "dataset", "software", "webpage", "report", "chapter", "legislation", "document", "artwork", "image"]);
var versions = /* @__PURE__ */ new Set(["version of record", "accepted manuscript", "author preprint", "preprint", "repository dissertation", "dataset", "software release"]);
var integrityStates = /* @__PURE__ */ new Set(["retracted", "corrected", "expression of concern"]);
var locationKinds = /* @__PURE__ */ new Set(["publisher", "repository", "pdf", "preprint", "status", "full-text", "library"]);
function httpsURL(value) {
  try {
    const url = new URL(cleanText(value));
    if (url.protocol === "https:" && !url.username && !url.password) return url.href;
  } catch {
  }
  return "";
}
function validISBN10(value) {
  return /^\d{9}[\dX]$/.test(value) && [...value].reduce((sum, digit, index) => sum + (digit === "X" ? 10 : Number(digit)) * (10 - index), 0) % 11 === 0;
}
function isbn13CheckDigit(stem) {
  const total = [...stem].reduce((sum, digit, index) => sum + Number(digit) * (index % 2 ? 3 : 1), 0);
  return (10 - total % 10) % 10;
}
function normalizeIdentifier(input) {
  if (typeof input !== "string") return null;
  const raw = input.trim();
  if (!raw || raw.length > 2048) return null;
  if (doi(raw)) return { scheme: "doi", value: raw.toLowerCase() };
  if (/^https:\/\//i.test(raw)) return normalizeIdentifier(`url:${raw}`);
  const match = /^([a-z]+):(.*)$/i.exec(raw);
  if (!match) return stableId.test(raw) ? { scheme: "local", value: raw } : null;
  const scheme = match[1].toLowerCase();
  let value = match[2].trim();
  switch (scheme) {
    case "doi":
      return doi(value) ? { scheme, value: value.toLowerCase() } : null;
    case "pmid":
      return /^[1-9]\d{0,11}$/.test(value) ? { scheme, value } : null;
    case "pmcid":
      value = value.toUpperCase();
      return /^PMC[1-9]\d{0,11}$/.test(value) ? { scheme, value } : null;
    case "arxiv":
      value = value.replace(/^arxiv:/i, "");
      return /^(?:\d{4}\.\d{4,5}|[a-z][a-z0-9.-]*\/\d{7})(?:v[1-9]\d*)?$/i.test(value) ? { scheme, value } : null;
    case "issn":
      value = value.replace(/[-\s]/g, "").toUpperCase();
      if (!/^\d{7}[\dX]$/.test(value)) return null;
      if ([...value].reduce((sum, digit, index) => sum + (digit === "X" ? 10 : Number(digit)) * (8 - index), 0) % 11) return null;
      return { scheme, value: value.slice(0, 4) + "-" + value.slice(4) };
    case "isbn": {
      value = value.replace(/[\s-]/g, "").toUpperCase();
      if (/^97[89]\d{10}$/.test(value) && isbn13CheckDigit(value.slice(0, -1)) === Number(value.at(-1))) return { scheme, value };
      if (validISBN10(value)) return { scheme, value };
      return null;
    }
    case "dataset":
    case "software":
      if (doi(value)) return normalizeIdentifier(value);
      return normalizeIdentifier(`url:${value}`);
    case "url": {
      const safe = httpsURL(value);
      if (!safe) return null;
      const { hostname, pathname } = new URL(safe);
      if (["doi.org", "dx.doi.org"].includes(hostname)) {
        try {
          return normalizeIdentifier(`doi:${decodeURIComponent(pathname.slice(1))}`);
        } catch {
          return null;
        }
      }
      if (hostname === "pubmed.ncbi.nlm.nih.gov") {
        const pmid = /^\/(\d+)\/?$/.exec(pathname)?.[1];
        if (pmid) return normalizeIdentifier(`pmid:${pmid}`);
      }
      if (hostname === "pmc.ncbi.nlm.nih.gov" || hostname === "www.ncbi.nlm.nih.gov") {
        const pmc = /^\/(?:pmc\/)?articles\/(PMC\d+)\/?$/.exec(pathname)?.[1];
        if (pmc) return normalizeIdentifier(`pmcid:${pmc}`);
      }
      if (hostname === "arxiv.org") {
        const arxiv = /^\/(?:abs|pdf)\/(.+?)(?:\.pdf)?$/.exec(pathname)?.[1];
        if (arxiv) return normalizeIdentifier(`arxiv:${arxiv}`);
      }
      return { scheme, value: safe };
    }
    case "local":
      return stableId.test(value) ? { scheme, value } : null;
    default:
      return null;
  }
}
var identifierKey = ({ scheme, value }) => `${scheme}:${value}`;
function canonicalIdentifierKey(identifier) {
  const { scheme, value } = identifier;
  if (scheme !== "isbn" || !validISBN10(value)) return identifierKey(identifier);
  const stem = "978" + value.slice(0, -1);
  return `isbn:${stem}${isbn13CheckDigit(stem)}`;
}
function identifierURL(id) {
  if (!id) return "";
  const valid = normalizeIdentifier(identifierKey(id));
  if (!valid) return "";
  const path = valid.value.split("/").map(encodeURIComponent).join("/");
  return {
    doi: `https://doi.org/${path}`,
    pmid: `https://pubmed.ncbi.nlm.nih.gov/${path}/`,
    pmcid: `https://pmc.ncbi.nlm.nih.gov/articles/${path}/`,
    arxiv: `https://arxiv.org/abs/${path}`,
    isbn: `https://search.worldcat.org/search?q=bn%3A${path}`,
    url: valid.value
  }[valid.scheme] || "";
}
function dateParts(value) {
  if (!Array.isArray(value) || !value.length || value.length > 3 || !value.every(Number.isInteger)) return null;
  const [year, month = 1, day = 1] = value;
  if (year < 1e3 || year > 9999 || month < 1 || month > 12 || day < 1 || day > new Date(Date.UTC(year, month, 0)).getUTCDate()) return null;
  return [...value];
}
function stamp(value) {
  const date = cleanText(value);
  return date && Number.isFinite(Date.parse(date)) ? new Date(date).toISOString() : null;
}
function normalizeTextParts(parts) {
  return (Array.isArray(parts) ? parts : []).flatMap((part) => {
    if (typeof part?.text !== "string" || !part.text) return [];
    const href = httpsURL(part.href);
    return [{ text: part.text, ...["italic", "bold"].includes(part.emphasis) && { emphasis: part.emphasis }, ...href && { href } }];
  });
}
function fullAuthorName(author, inverted = false) {
  if (author.literal) return author.literal;
  return (inverted ? [author.family, author.given, author.suffix] : [author.given, author.family, author.suffix]).filter(Boolean).join(inverted ? ", " : " ");
}
function normalizeChecksum(value) {
  const algorithm = cleanText(value?.algorithm).toLowerCase().replace("-", "");
  const digest = cleanText(value?.value).toLowerCase();
  const lengths = { md5: 32, sha1: 40, sha256: 64, sha384: 96, sha512: 128 };
  if (!lengths[algorithm] || digest.length !== lengths[algorithm] || !/^[a-f0-9]+$/.test(digest)) return null;
  return { algorithm, value: digest, ...cleanText(value.role) && { role: cleanText(value.role) } };
}
function normalizeRecord(input) {
  if (!input || !stableId.test(cleanText(input.id))) throw new TypeError("A stable citation record ID is required.");
  const array = (value) => Array.isArray(value) ? value : [];
  const identifiers = /* @__PURE__ */ new Map();
  for (const item of array(input.identifiers)) {
    if (!item || typeof item.scheme !== "string" || typeof item.value !== "string") continue;
    const id = normalizeIdentifier(identifierKey(item));
    if (id && id.scheme !== "local") identifiers.set(identifierKey(id), id);
  }
  const relatedIdentifiers = array(input.relatedIdentifiers).flatMap((item) => {
    const label = cleanText(item?.label);
    const value = cleanText(item?.value);
    const authority = cleanText(item?.authority);
    return label && value && authority ? [{ label, value, authority }] : [];
  });
  const authors = array(input.authors).flatMap((author) => {
    const literal = cleanText(author?.literal);
    const family = cleanText(author?.family);
    const given = cleanText(author?.given);
    const short = cleanText(author?.short);
    const suffix = cleanText(author?.suffix);
    const id = cleanText(author?.id);
    return literal ? [{ literal, ...short && { short } }] : family ? [{ family, ...given && { given }, ...suffix && { suffix }, ...id && { id } }] : [];
  });
  const locations = array(input.locations).flatMap((location) => {
    const url = httpsURL(location?.url);
    const provider = cleanText(location?.provider);
    const verifiedAt = stamp(location?.verifiedAt);
    if (!url || !provider || !locationKinds.has(location.kind)) return [];
    if (["pdf", "preprint"].includes(location.kind) && !verifiedAt) return [];
    return [{
      kind: location.kind,
      url,
      provider,
      verifiedAt,
      version: versions.has(location.version) ? location.version : null,
      service: /^[a-z0-9][a-z0-9-]{0,63}$/.test(location.service || "") ? location.service : null,
      access: ["open", "subscription", "purchase", "loan"].includes(location.access) ? location.access : "unknown"
    }];
  });
  const provenance = array(input.provenance).flatMap((source) => {
    const provider = cleanText(source?.provider);
    return provider ? [{
      provider,
      url: httpsURL(source.url),
      retrievedAt: stamp(source.retrievedAt),
      note: cleanText(source.note),
      ...normalizeChecksum(source.checksum) && { checksum: normalizeChecksum(source.checksum) },
      ...Array.isArray(source.checksums) && { checksums: source.checksums.map(normalizeChecksum).filter(Boolean) }
    }] : [];
  });
  const title = cleanText(input.title);
  const abstract = cleanText(input.abstract?.text);
  const abstractSource = cleanText(input.abstract?.source);
  const optional = ["inlineAuthor", "jurisdiction", "number", "session", "legalCitation"];
  const originalIssued = dateParts(input.originalIssued);
  const state = ["resolved", "partial", "unresolved"].includes(input.state) ? input.state : "unresolved";
  const textFields = ["containerTitle", "publisher", "volume", "issue", "pages", "articleNumber", "edition", "publisherPlace", "containerAbbreviation", "apaTitle", "original", "note", "citationText", "medium", "dimensions", "holdingInstitution", "accession", "platform", "rightsHolder", "creatorAttribution", "displayDate"];
  return {
    id: input.id.trim(),
    type: kinds.has(input.type) ? input.type : "document",
    state: title ? state : "unresolved",
    ...input.license && cleanText(input.license.name) && {
      license: { name: cleanText(input.license.name), url: httpsURL(input.license.url) }
    },
    ...Array.isArray(input.contributors) && {
      contributors: input.contributors.flatMap((person) => {
        const name = cleanText(person?.name), role = cleanText(person?.role);
        return name && role ? [{ name, role }] : [];
      })
    },
    title,
    authors,
    identifiers: [...identifiers.values()],
    locations,
    provenance,
    ...Array.isArray(input.tags) && { tags: normalizeTags(input.tags) },
    ...relatedIdentifiers.length && { relatedIdentifiers },
    citationParts: normalizeTextParts(input.citationParts),
    ...input.authorsComplete === false && { authorsComplete: false },
    ...Array.isArray(input.listAnnotationParts) && { listAnnotationParts: normalizeTextParts(input.listAnnotationParts) },
    ...Object.fromEntries(optional.map((field) => [field, cleanText(input[field])]).filter(([, value]) => value)),
    issued: dateParts(input.issued),
    ...originalIssued && { originalIssued },
    online: dateParts(input.online),
    print: dateParts(input.print),
    retrievedAt: stamp(input.retrievedAt),
    version: versions.has(input.version) ? input.version : null,
    integrity: integrityStates.has(input.integrity?.state) && (httpsURL(input.integrity?.url) || cleanText(input.integrity?.source)) ? {
      state: input.integrity.state,
      source: cleanText(input.integrity.source),
      url: httpsURL(input.integrity.url)
    } : null,
    abstract: abstract && abstractSource ? {
      text: abstract,
      source: abstractSource,
      ...input.abstract.kind === "excerpt" && { kind: "excerpt" },
      ...httpsURL(input.abstract.url) && { url: httpsURL(input.abstract.url) }
    } : null,
    ...Object.fromEntries(textFields.map((field) => [field, cleanText(input[field])]))
  };
}
function readCache(input) {
  if (input?.schema !== CACHE_SCHEMA || !Array.isArray(input.records)) throw new TypeError("Unsupported citation cache schema.");
  const byId = /* @__PURE__ */ new Map();
  const byIdentifier = /* @__PURE__ */ new Map();
  for (const raw of input.records) {
    const record = normalizeRecord(raw);
    if (byId.has(record.id)) throw new Error(`Duplicate record ID ${record.id}.`);
    byId.set(record.id, record);
    for (const identifier of record.identifiers) {
      const key = canonicalIdentifierKey(identifier);
      const existing = byIdentifier.get(key);
      if (existing && existing !== record) throw new Error(`Conflicting records for ${key}.`);
      byIdentifier.set(key, record);
      byIdentifier.set(identifierKey(identifier), record);
    }
  }
  return { byId, byIdentifier };
}

// src/access.mjs
var DEFAULT_ACCESS_STORAGE_KEY = "citation-inator.access.v1";
var accessKinds = ["free", "publisher", "subscription", "library", "lending", "accessibility", "discovery"];
var defaultAccessCatalog = [
  { id: "open-access", label: "Open-access copy", kind: "free" },
  { id: "author-preprint", label: "Author\u2019s preprint", kind: "free" },
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
function accessCatalog(overrides = []) {
  if (!Array.isArray(overrides)) throw new TypeError("Supply an access catalogue array.");
  const catalog = new Map(defaultAccessCatalog.map((item) => [item.id, { ...item }]));
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
function normalizeAccessProfile(value) {
  if (value === null) return null;
  if (!value || !Array.isArray(value.services) || value.services.some((id) => typeof id !== "string" || !/^[a-z0-9][a-z0-9-]{0,63}$/.test(id))) {
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
  return { services, preferred: preferred || null, library, updatedAt: value.updatedAt && Number.isFinite(Date.parse(value.updatedAt)) ? new Date(value.updatedAt).toISOString() : (/* @__PURE__ */ new Date()).toISOString() };
}
function accessProfileState(profile) {
  return profile === null ? "unknown" : profile.services.length ? [...profile.services] : "none";
}
function serviceFor(location, catalog = defaultAccessCatalog) {
  const original = defaultAccessCatalog.find((item) => item.label.toLowerCase() === location.provider?.toLowerCase());
  return catalog.find((item) => item.id === location.service) || catalog.find((item) => item.label.toLowerCase() === location.provider?.toLowerCase()) || catalog.find((item) => item.id === original?.id) || { id: location.service || location.provider?.toLowerCase() || "publisher", label: location.provider || "Publisher", kind: "publisher" };
}
function libraryURL(record, library) {
  if (!library) return "";
  const best = identifierURL(record.identifiers.find((id) => id.scheme === "doi")) || identifierURL(record.identifiers.find((id) => id.scheme === "url")) || record.locations.find((location) => location.kind === "publisher")?.url;
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
function groupAccess(items, profile) {
  const free = [], selected = [], other = [];
  for (const item of items) {
    if (item.access === "open") free.push(item);
    else if (item.service === "reader-library" || profile?.services.includes(item.service)) selected.push(item);
    else other.push(item);
  }
  selected.sort((a, b) => Number(b.service === profile?.preferred) - Number(a.service === profile?.preferred));
  return { free, selected, other };
}

// src/access-profile.mjs
var stores = /* @__PURE__ */ new WeakMap();
function storeFor({ accessStorageKey = DEFAULT_ACCESS_STORAGE_KEY, window: view = globalThis.window } = {}) {
  if (!view) throw new TypeError("Access profiles need a browser window.");
  if (typeof accessStorageKey !== "string" || !accessStorageKey.trim()) throw new TypeError("Supply a nonempty access storage key.");
  let storesForWindow = stores.get(view);
  if (!storesForWindow) {
    storesForWindow = /* @__PURE__ */ new Map();
    stores.set(view, storesForWindow);
    view.addEventListener("storage", (event) => {
      for (const [key, store] of storesForWindow) {
        if (event.key === key || event.key === null) {
          store.profile = readProfile(view, key);
          for (const notify of store.listeners) notify();
        }
      }
    });
  }
  if (!storesForWindow.has(accessStorageKey)) storesForWindow.set(accessStorageKey, {
    profile: readProfile(view, accessStorageKey),
    listeners: /* @__PURE__ */ new Set(),
    view,
    key: accessStorageKey
  });
  return storesForWindow.get(accessStorageKey);
}
function readProfile(view, key) {
  try {
    const value = JSON.parse(view.localStorage.getItem(key));
    return value === null ? null : normalizeAccessProfile(value);
  } catch {
    return null;
  }
}
function getAccessProfile(options) {
  return structuredClone(storeFor(options).profile);
}
function setAccessProfile(profile, options) {
  const store = storeFor(options);
  store.profile = normalizeAccessProfile(profile === null ? null : { ...profile, updatedAt: (/* @__PURE__ */ new Date()).toISOString() });
  try {
    if (store.profile === null) store.view.localStorage.removeItem(store.key);
    else store.view.localStorage.setItem(store.key, JSON.stringify(store.profile));
  } catch {
  }
  for (const notify of store.listeners) notify();
  return structuredClone(store.profile);
}
function subscribeAccessProfile(callback, options) {
  const store = storeFor(options);
  const notify = () => callback({ profile: structuredClone(store.profile), state: accessProfileState(store.profile) });
  store.listeners.add(notify);
  return () => store.listeners.delete(notify);
}

// src/icons.mjs
var paths = {
  pdf: '<path d="M6 3h8l4 4v14H6z M14 3v5h4"/><path d="m8 17 3-5 2 4 3 1-4 1z"/>',
  publisher: '<path d="M3 9 12 4l9 5z M5 20h14 M7 11v7m5-7v7m5-7v7"/>',
  book: '<path d="M5 4h14v16H7a2 2 0 0 1-2-2z M5 17h14 M8 8h8m-8 3h6"/>',
  link: '<path d="m9 15 6-6 M8 16l-1 1a3 3 0 0 1-4-4l5-5a3 3 0 0 1 4 0 M16 8l1-1a3 3 0 0 1 4 4l-5 5a3 3 0 0 1-4 0"/>',
  repository: '<path d="M4 4h16v5H4z M6 9v11h12V9 M10 13h4"/>',
  article: '<path d="M6 4h12v16H6z M9 8h6m-6 4h6m-6 4h4"/>',
  external: '<path d="M13 4h7v7m0-7-9 9m7 0v7H4V6h7"/>',
  library: '<path d="M4 19V5h4v14zm4 0V5h4v14zm6-13 4-1 3 14-4 1z"/>',
  status: '<path d="M12 3 4 7v5c0 5 4 8 8 9 4-1 8-4 8-9V7z M12 8v5m0 3h.01"/>',
  back: '<path d="m10 6-6 6 6 6 M4 12h11a4 4 0 0 0 4-4"/>',
  endnote: '<path d="M4 5h16M4 10h10m-10 5h5m6-2v7m-3-3 3 3 3-3"/>',
  copy: '<rect x="8" y="8" width="12" height="12" rx="2"/><path d="M16 8V4H4v12h4"/>',
  more: '<circle cx="5" cy="12" r="1"/><circle cx="12" cy="12" r="1"/><circle cx="19" cy="12" r="1"/>'
};
function iconMarkup(name) {
  return `<svg viewBox="0 0 24 24" width="19" height="19" fill="none" stroke="currentColor" stroke-width="1.65" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">${Object.hasOwn(paths, name) ? paths[name] : paths.link}</svg>`;
}
var brandIconMarkup = '<svg viewBox="0 0 64 64" width="24" height="24" aria-hidden="true" focusable="false"><rect x="2" y="2" width="60" height="60" rx="14" fill="#082a66" stroke="#28cce6" stroke-width="4"/><path d="M25 21h-7v22h7m14-22h7v22h-7m-11-7h8m-8-8h8" fill="none" stroke="#b8f9ff" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round"/><circle cx="49" cy="15" r="4.5" fill="#ffbe53" stroke="#082a66" stroke-width="1.5"/></svg>';

// src/class-names.mjs
var defaultClassPrefix = "citation";
var partSelector = "[data-citation-part]";
function validClassPrefix(prefix) {
  return typeof prefix === "string" && /^[a-z][a-z0-9-]{0,31}$/.test(prefix);
}
function validateClassPrefix(prefix) {
  if (!validClassPrefix(prefix)) throw new TypeError("Use a lowercase citation class prefix.");
}
function partClassNames(prefix, parts) {
  return parts.split(" ").map((part) => `${prefix}-${part}`);
}

// src/access-view.mjs
var defaults = {
  "access.links": "Source links",
  "access.action.pdf": "Download PDF",
  "access.action.publisher": "Open publisher page",
  "access.action.repository": "Open repository",
  "access.action.preprint": "Open preprint",
  "access.action.library": "Find at {service}",
  "access.action.full-text": "Read full text at {service}",
  "access.version": "{label} ({version})",
  "access.free": "Read free",
  "access.selected": "Through your services",
  "access.other": "Other places to look",
  "access.more": { one: "{count} more", other: "{count} more" },
  "access.help.unknown": "Can\u2019t open these? Tell us where you can read.",
  "access.help.none": "None of these is on your list. Add a service, or try your library.",
  "access.help.match": "Change where you read",
  "access.settings": "Where you can read",
  "access.services": "Services you can use",
  "access.preferred": "Open titles in",
  "access.noPreference": "No preference",
  "access.library": "Through my library",
  "access.library.kind": "Library access type",
  "access.library.none": "No library configured",
  "access.library.proxy": "Proxy prefix",
  "access.library.openurl": "OpenURL resolver",
  "access.library.address": "Library address",
  "access.library.help": "Use the HTTPS address supplied by your library. It is used only when you open a library link.",
  "access.privacy": "Saved in this browser for this site. Services may have the work. Availability varies by title.",
  "access.save": "Save",
  "access.clear": "Clear settings",
  "access.cancel": "Cancel",
  "access.at": "at {service}",
  "access.checked": "Checked {date}",
  "access.stale": "May have moved",
  "access.destination": "Open at {service}",
  "access.invalid": "Check your library address and preferred service.",
  "access.kind.free": "Open copies",
  "access.kind.publisher": "Publishers",
  "access.kind.subscription": "Subscriptions",
  "access.kind.library": "Libraries",
  "access.kind.lending": "Lending",
  "access.kind.accessibility": "Accessible editions",
  "access.kind.discovery": "Discovery"
};
function node(doc, tag, text, part) {
  const value = doc.createElement(tag);
  if (text) value.textContent = text;
  if (part) {
    value.dataset.citationPart = part;
    value.className = partClassNames(defaultClassPrefix, part).join(" ");
  }
  return value;
}
function containerIsPanel(container) {
  return container.getRootNode().host?.localName === "citation-inspector";
}
var AccessView = class {
  #owner;
  #options = {};
  #unsubscribe;
  #rows = /* @__PURE__ */ new Map();
  #titles = /* @__PURE__ */ new Map();
  #sheet;
  #returnFocus;
  #returnContainer;
  constructor(owner) {
    this.#owner = owner;
  }
  configure(options) {
    this.#options = { ...this.#options, ...options };
    accessCatalog(this.#options.accessCatalog);
    if (this.#options.accessLayout && !["flat", "grouped"].includes(this.#options.accessLayout)) throw new TypeError("Use grouped or flat access.");
    if (this.#options.accessSettings && !["builtin", "host", "off"].includes(this.#options.accessSettings)) throw new TypeError("Use builtin, host or off access settings.");
    for (const key of ["accessCollapseAfter", "staleAfterDays"]) {
      if (this.#options[key] !== void 0 && (!Number.isFinite(this.#options[key]) || this.#options[key] < 0)) throw new TypeError("Supply a nonnegative " + key + ".");
    }
    this.connect();
    this.restore();
  }
  get catalog() {
    return accessCatalog(this.#options.accessCatalog);
  }
  get storageOptions() {
    return { accessStorageKey: this.#options.accessStorageKey, window: this.#owner.ownerDocument.defaultView };
  }
  get profile() {
    return getAccessProfile(this.storageOptions);
  }
  get settings() {
    return this.#owner.getAttribute("access-settings") || this.#options.accessSettings || "builtin";
  }
  get layout() {
    return this.#owner.getAttribute("access-layout") || this.#options.accessLayout || "grouped";
  }
  text(key, values = {}) {
    let template = this.#options.strings?.[key] ?? defaults[key] ?? key;
    if (typeof template === "object") {
      const rule = new Intl.PluralRules(this.#options.locale).select(values.count ?? 0);
      template = template[rule] ?? template.other ?? defaults[key]?.other ?? key;
    }
    return String(template).replace(/\{(\w+)\}/g, (_, key2) => values[key2] ?? "");
  }
  connect() {
    this.#unsubscribe?.();
    if (!this.#owner.isConnected) return;
    this.#unsubscribe = subscribeAccessProfile((detail) => {
      this.restore();
      this.#owner.refreshAccess();
      this.#owner.dispatchEvent(new CustomEvent("access-profile-changed", { detail, bubbles: true, composed: true }));
    }, this.storageOptions);
  }
  disconnect() {
    this.#unsubscribe?.();
    this.#unsubscribe = null;
    if (this.#sheet?.open) this.#sheet.close();
    this.#sheet?.remove();
    this.#sheet = null;
    this.restore();
  }
  owns(event) {
    return this.#sheet && event.composedPath().includes(this.#sheet);
  }
  items(record, hidden = () => false) {
    const catalog = this.catalog;
    const items = record.locations.filter((location) => location.kind !== "status").map((location) => {
      const service = serviceFor(location, catalog);
      return { ...location, service: service.id, serviceLabel: service.label, label: this.text("access.destination", { service: service.label }) };
    }).filter((item) => !hidden(item.provider) && !hidden(item.service) && !hidden(item.serviceLabel));
    const resolver = typeof this.#owner.institutionalURL === "function" ? this.#institutional(record) : libraryURL(record, this.profile?.library);
    if (resolver) items.push({
      url: resolver,
      kind: "library",
      service: "reader-library",
      serviceLabel: this.text("access.library"),
      label: this.text("access.library"),
      access: "unknown"
    });
    return items;
  }
  #institutional(record) {
    try {
      return httpsURL(this.#owner.institutionalURL(structuredClone(record)));
    } catch {
      return "";
    }
  }
  // Resolve source labels and grouping from copy-level metadata, including legacy provider names.
  decorate(list, record, hidden = () => false) {
    const locations = this.items(record);
    const doc = list.ownerDocument;
    for (const item of locations) {
      if (![...list.querySelectorAll("a")].some((link) => link.href === item.url)) {
        const link = node(doc, "a", "", "icon");
        link.href = item.url;
        link.target = "_blank";
        link.rel = "noopener noreferrer";
        link.innerHTML = iconMarkup(item.kind === "pdf" ? "pdf" : item.kind === "library" ? "library" : "link");
        link.dataset.ciAccessProvider = item.provider || "";
        if (item.kind === "pdf") link.download = "";
        list.append(link);
      }
    }
    for (const link of [...list.querySelectorAll("a")]) {
      const provider = link.dataset.ciAccessProvider;
      const known = provider && serviceFor({ provider }, this.catalog);
      const item = locations.find((item2) => item2.url === link.href && (!provider || item2.provider === provider)) || known && { url: link.href, provider, service: known.id, serviceLabel: known.label, kind: "library", access: "unknown" };
      if (!item) {
        if (hidden(link.dataset.ciAccessProvider || "")) link.remove();
        continue;
      }
      if ([item.provider, item.service, item.serviceLabel].some((value) => value && hidden(value))) {
        link.remove();
        continue;
      }
      const kind = item.kind === "preprint" && /\.pdf(?:[?#]|$)/i.test(item.url) ? "pdf" : item.kind;
      const key = item.service === "reader-library" ? "access.library" : "access.action." + kind;
      let label = this.text(key, { service: item.serviceLabel });
      if (item.version) label = this.text("access.version", { label, version: item.version });
      delete link.dataset.accessChecked;
      delete link.dataset.accessStale;
      link.removeAttribute("aria-description");
      link.setAttribute("aria-label", label);
      link.title = label + "\n" + item.url;
      link.dataset.accessService = item.service;
      link.dataset.accessState = item.access || "unknown";
      if (item.verifiedAt) {
        const date = new Intl.DateTimeFormat(this.#options.locale, { dateStyle: "medium" }).format(new Date(item.verifiedAt));
        const checked = this.text("access.checked", { date });
        link.title += "\n" + checked;
        if (containerIsPanel(list)) {
          link.dataset.accessChecked = checked;
          link.setAttribute("aria-description", checked);
        }
        if (this.#options.staleAfterDays && Date.now() - Date.parse(item.verifiedAt) > this.#options.staleAfterDays * 864e5) {
          link.title += "\n" + this.text("access.stale");
          link.dataset.accessStale = this.text("access.stale");
        }
      }
    }
  }
  #appendLink(container, link) {
    if (containerIsPanel(container) && link.dataset.accessChecked) {
      const item = node(container.ownerDocument, "span", "", "access-destination");
      item.append(link, node(
        container.ownerDocument,
        "small",
        [link.dataset.accessChecked, link.dataset.accessStale].filter(Boolean).join(" \xB7 "),
        "access-checked"
      ));
      container.append(item);
    } else container.append(link);
  }
  group(container, links, record, { flat = false, hidden } = {}) {
    this.decorate(container, record, hidden);
    links = [...container.querySelectorAll("a")];
    if (this.layout === "flat") {
      for (const link of links) this.#appendLink(container, link);
      this.help(container, links);
      return;
    }
    const groups = groupAccess(links.map((link) => ({
      link,
      access: link.dataset.accessState,
      service: link.dataset.accessService
    })), this.profile);
    for (const [key, entries] of Object.entries(groups)) {
      if (!entries.length) continue;
      const doc = container.ownerDocument;
      if (key === "other") {
        const visible = this.#options.accessCollapseAfter ?? 0;
        for (const { link } of entries.slice(0, visible)) this.#appendLink(container, link);
        if (entries.length > visible) {
          const more = node(doc, "details", "", "access-more");
          more.append(node(doc, "summary", this.text("access.more", { count: entries.length - visible })));
          const label = node(doc, "span", this.text("access.other"), "access-group-label");
          more.append(label);
          for (const { link } of entries.slice(visible)) this.#appendLink(more, link);
          container.append(more);
        }
      } else {
        if (!flat) container.append(node(doc, "span", this.text(key === "free" ? "access.free" : "access.selected"), "access-group-label"));
        for (const { link } of entries) this.#appendLink(container, link);
      }
    }
    this.help(container, links);
  }
  help(container, links) {
    if (this.settings === "off") return;
    const profile = this.profile;
    const matched = links.some((link) => link.dataset.accessService === "reader-library" || profile?.services.includes(link.dataset.accessService));
    const key = profile === null ? "unknown" : matched ? "match" : "none";
    const help = node(container.ownerDocument, "button", this.text("access.help." + key), "access-help");
    help.type = "button";
    help.addEventListener("click", () => this.openSettings(help));
    container.append(help);
  }
  openSettings(trigger) {
    if (this.settings === "off") return;
    if (this.settings === "host") {
      this.#owner.dispatchEvent(new CustomEvent("access-settings-request", { bubbles: true, composed: true, cancelable: true }));
      return;
    }
    this.#sheet?.remove();
    const doc = this.#owner.ownerDocument;
    const sheet = this.#sheet = node(doc, "dialog", "", "access-settings");
    sheet.setAttribute("aria-label", this.text("access.settings"));
    const form = node(doc, "form");
    const title = node(doc, "h2", this.text("access.settings"));
    form.append(title, node(doc, "p", this.text("access.privacy")));
    const columns = node(doc, "div", "", "access-settings-columns");
    const services = node(doc, "fieldset");
    services.append(node(doc, "legend", this.text("access.services")));
    const profile = this.profile;
    const catalog = this.catalog;
    for (const kind2 of [...new Set(catalog.map((item) => item.kind))]) {
      const group = node(doc, "fieldset");
      group.append(node(doc, "legend", this.text("access.kind." + kind2)));
      for (const item of catalog.filter((item2) => item2.kind === kind2)) {
        const label = node(doc, "label");
        const input = node(doc, "input");
        input.type = "checkbox";
        input.name = "service";
        input.value = item.id;
        input.checked = Boolean(profile?.services.includes(item.id));
        label.append(input, " " + item.label);
        group.append(label);
      }
      services.append(group);
    }
    const preferences = node(doc, "fieldset");
    preferences.append(node(doc, "legend", this.text("access.preferred")));
    for (const item of [{ id: "", label: this.text("access.noPreference") }, ...catalog]) {
      const label = node(doc, "label");
      const input = node(doc, "input");
      input.type = "radio";
      input.name = "preferred";
      input.value = item.id;
      input.checked = (profile?.preferred || "") === item.id;
      label.append(input, " " + item.label);
      preferences.append(label);
    }
    columns.append(services, preferences);
    form.append(columns);
    const library = node(doc, "fieldset");
    library.append(node(doc, "legend", this.text("access.library")));
    const kindLabel = node(doc, "label", this.text("access.library.kind"));
    const kind = node(doc, "select");
    kind.name = "libraryKind";
    for (const key of ["none", "proxy", "openurl"]) {
      const option = node(doc, "option", this.text("access.library." + key));
      option.value = key;
      kind.append(option);
    }
    kind.value = profile?.library?.kind || "none";
    kindLabel.append(kind);
    const addressLabel = node(doc, "label", this.text("access.library.address"));
    const address = node(doc, "input");
    address.name = "libraryAddress";
    address.type = "url";
    address.value = profile?.library?.base || "";
    addressLabel.append(address);
    address.disabled = kind.value === "none";
    kind.addEventListener("change", () => {
      address.disabled = kind.value === "none";
    });
    library.append(kindLabel, addressLabel, node(doc, "p", this.text("access.library.help")));
    form.append(library);
    const error = node(doc, "p");
    error.setAttribute("role", "alert");
    form.append(error);
    const save = node(doc, "button", this.text("access.save"));
    save.type = "submit";
    const clear = node(doc, "button", this.text("access.clear"));
    clear.type = "button";
    clear.addEventListener("click", () => {
      setAccessProfile(null, this.storageOptions);
      close();
    });
    const cancel = node(doc, "button", this.text("access.cancel"));
    cancel.type = "button";
    cancel.addEventListener("click", () => sheet.close());
    form.append(save, clear, cancel);
    form.addEventListener("submit", (event) => {
      event.preventDefault();
      const fields = new FormData(form);
      try {
        setAccessProfile({
          services: fields.getAll("service"),
          preferred: fields.get("preferred"),
          library: kind.value === "none" ? null : { kind: kind.value, base: address.value }
        }, this.storageOptions);
        close();
      } catch {
        error.textContent = this.text("access.invalid");
      }
    });
    sheet.append(form);
    this.#owner.shadowRoot.append(sheet);
    this.#returnFocus = trigger;
    this.#returnContainer = trigger.closest("[data-ci-note-record]");
    const finish = () => {
      if (this.#sheet !== sheet) return;
      this.#sheet = null;
      if (this.#returnFocus?.isConnected) this.#returnFocus.focus({ preventScroll: true });
      else {
        const replacement = this.#returnContainer?.querySelector('[data-citation-part="access-help"]');
        if (replacement?.isConnected) replacement.focus({ preventScroll: true });
        else if (this.#owner.hasAttribute("open")) this.#owner.shadowRoot.querySelector("#panel-name")?.focus({ preventScroll: true });
      }
      sheet.remove();
    };
    const close = () => {
      sheet.close();
      finish();
    };
    sheet.addEventListener("close", finish, { once: true });
    sheet.addEventListener("cancel", (event) => {
      event.preventDefault();
      close();
    });
    let backdrop = false;
    sheet.addEventListener("pointerdown", (event) => {
      backdrop = event.target === sheet && this.#outside(sheet, event);
    });
    sheet.addEventListener("click", (event) => {
      if (backdrop && event.target === sheet) close();
      backdrop = false;
    });
    sheet.showModal();
  }
  #outside(sheet, event) {
    const rect = sheet.getBoundingClientRect();
    return event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom;
  }
  enhanceNotes(records, hidden) {
    for (const row of this.#rows.keys()) {
      if (!this.#owner.contains(row)) this.#restoreRow(row);
    }
    const references = this.#owner.querySelectorAll("[data-ci-reference-record], [data-ci-note-record]");
    const visited = /* @__PURE__ */ new Set();
    for (const reference of references) {
      if (reference.closest("citation-inspector") !== this.#owner) continue;
      const record = records.get(reference.dataset.ciReferenceRecord || reference.dataset.ciNoteRecord);
      if (!record) continue;
      let row = reference.matches("[data-ci-note-record]") ? reference : reference.querySelector(":scope > [data-ci-note-record]");
      if (!row) {
        if (this.settings === "off" && !this.items(record, hidden).length) continue;
        row = node(reference.ownerDocument, "div", "", "note-actions");
        row.dataset.ciNoteRecord = record.id;
        row.dataset.ciGeneratedActions = "";
        reference.append(row);
      }
      if (visited.has(row)) continue;
      visited.add(row);
      const signature = JSON.stringify([record, this.profile, this.layout, this.settings, this.#options, this.#owner.getAttribute("hidden-providers"), this.#owner.getAttribute("hidden-access-providers"), this.#owner.getAttribute("access-providers")]);
      if (this.#rows.get(row)?.signature === signature) continue;
      this.#restoreRow(row);
      if (row.hasAttribute("data-ci-generated-actions") && this.settings === "off" && !this.items(record, hidden).length) {
        row.remove();
        continue;
      }
      if (!row.isConnected) reference.append(row);
      const statusURL = record.integrity?.url || record.locations.find((item) => item.kind === "status")?.url;
      const links = [...row.querySelectorAll(':scope > a[href^="https:"]:not([data-ci-record]):not([data-ci-panel])')].filter((link) => link.href !== statusURL);
      const saved = { signature, nodes: [...row.childNodes], generated: row.hasAttribute("data-ci-generated-actions"), reference: row.closest("li") };
      this.#rows.set(row, saved);
      {
        const group = node(row.ownerDocument, "span", "", "access-inline");
        row.prepend(group);
        for (const link of links) group.append(link);
        this.group(group, [...group.querySelectorAll("a")], record, { flat: true, hidden });
      }
      this.#title(row.closest("li"), record, hidden);
    }
  }
  #title(row, record, hidden) {
    const items = this.items(record, hidden);
    const groups = groupAccess(items, this.profile);
    const best = groups.free[0] || groups.selected.find((item) => item.service === this.profile?.preferred);
    if (!best) return;
    const reference = row?.querySelector(":scope > span[data-ci-title-start]");
    if (!reference) return;
    let remaining = Number(reference.dataset.ciTitleStart);
    const length = Number(reference.dataset.ciTitleLength);
    const walker = reference.ownerDocument.createTreeWalker(reference, 4);
    let title, text;
    while (text = walker.nextNode()) {
      if (remaining >= text.length) {
        remaining -= text.length;
        continue;
      }
      if (length > text.length - remaining) return;
      if (text.parentElement.closest("a")) return;
      const isolated = text.splitText(remaining);
      isolated.splitText(length);
      title = node(reference.ownerDocument, "span");
      isolated.replaceWith(title);
      title.append(isolated);
      break;
    }
    const created = true;
    if (!title) return;
    const saved = [...title.childNodes];
    const link = node(title.ownerDocument, "a");
    link.href = best.url;
    link.target = "_blank";
    link.rel = "noopener noreferrer";
    const destination2 = this.text("access.at", { service: best.serviceLabel });
    link.setAttribute("aria-label", title.textContent + " " + destination2);
    for (const child of saved) link.append(child.cloneNode(true));
    for (const nested of link.querySelectorAll("a")) nested.replaceWith(...nested.childNodes);
    const label = node(title.ownerDocument, "small", " " + destination2);
    title.replaceChildren(link, label);
    this.#titles.set(title, { nodes: saved, created });
  }
  #restoreRow(row) {
    const saved = this.#rows.get(row);
    const reference = saved?.reference || row.closest("li");
    if (saved?.generated) row.remove();
    else if (saved) row.replaceChildren(...saved.nodes);
    this.#rows.delete(row);
    for (const [title, titleState] of this.#titles) {
      if (reference?.contains(title)) {
        if (titleState.created) title.replaceWith(...titleState.nodes);
        else title.replaceChildren(...titleState.nodes);
        this.#titles.delete(title);
      }
    }
  }
  restore() {
    for (const row of this.#rows.keys()) this.#restoreRow(row);
  }
};

// src/reference-features.mjs
var fallbackOrigin = "https://citation.invalid";
function siteURL(value, siteOrigin, { fragment = false } = {}) {
  if (typeof value !== "string" || !value || /[\u0000-\u0020\u007f\\]/.test(value) || value.startsWith("//")) return "";
  try {
    const base = siteOrigin ? new URL(siteOrigin) : new URL(fallbackOrigin);
    if (!["https:", "http:"].includes(base.protocol) || base.username || base.password) return "";
    const url = new URL(value, base);
    const absolute = /^[a-z][a-z0-9+.-]*:/i.test(value);
    if (absolute && !siteOrigin || url.origin !== base.origin || url.username || url.password || fragment && !url.hash) return "";
    return value;
  } catch {
    return "";
  }
}
function prepareReferences({ siteOccurrences = {}, occurrences, siteOrigin, tagCatalogue = [], listItemTags = {} } = {}, diagnostics = []) {
  if (occurrences !== void 0) {
    if (Object.keys(siteOccurrences).length) throw new TypeError("Use siteOccurrences or occurrences, not both.");
    siteOccurrences = occurrences;
  }
  if (!siteOccurrences || typeof siteOccurrences !== "object" || Array.isArray(siteOccurrences)) throw new TypeError("Supply a site occurrence index keyed by record ID.");
  if (!Array.isArray(tagCatalogue)) throw new TypeError("Supply a tagCatalogue array.");
  if (!listItemTags || typeof listItemTags !== "object" || Array.isArray(listItemTags)) throw new TypeError("Supply listItemTags keyed by record ID.");
  if (siteOrigin && !siteURL("/", siteOrigin)) throw new TypeError("Supply an HTTP(S) siteOrigin.");
  const catalogue = /* @__PURE__ */ new Map();
  for (const item of tagCatalogue) {
    const id = normalizeTags([item?.id])[0];
    const label = cleanText(item?.label);
    if (!id || !label || catalogue.has(id)) throw new TypeError("Tag catalogue entries need unique valid IDs and labels.");
    const icon = item.icon ? siteURL(item.icon, siteOrigin) : "";
    if (item.icon && !icon) diagnostics.push({ state: "invalid-tag-icon", tag: id });
    catalogue.set(id, { id, label, ...icon && { icon } });
  }
  const seenUnknown = /* @__PURE__ */ new Set();
  const tags = (record, list = false) => normalizeTags(list && Object.hasOwn(listItemTags, record.id) ? listItemTags[record.id] : record.tags).map((id) => {
    if (catalogue.has(id)) return catalogue.get(id);
    if (!seenUnknown.has(id)) {
      diagnostics.push({ state: "unknown-tag", tag: id });
      seenUnknown.add(id);
    }
    return { id, label: id };
  });
  const byRecord = /* @__PURE__ */ new Map();
  for (const [recordId, entries] of Object.entries(siteOccurrences)) {
    if (!Array.isArray(entries)) throw new TypeError("Each site occurrence entry must be an array.");
    const seen = /* @__PURE__ */ new Set();
    byRecord.set(recordId, entries.flatMap((item) => {
      const href = siteURL(item?.href, siteOrigin, { fragment: true });
      const label = cleanText(item?.label);
      if (!href || !label) {
        diagnostics.push({ state: "invalid-site-occurrence", recordId });
        return [];
      }
      const canonical = /^(?:[a-z][a-z0-9+.-]*:|\/)/i.test(href) ? new URL(href, siteOrigin || fallbackOrigin).href : href;
      if (seen.has(canonical)) return [];
      seen.add(canonical);
      return [{ href, label, context: cleanText(item.context), ...cleanText(item.occurrenceId) && { occurrenceId: cleanText(item.occurrenceId) } }];
    }));
  }
  return { tags, occurrences: (recordId) => byRecord.get(recordId) || [] };
}
function groupSiteOccurrences(entries) {
  const groups = /* @__PURE__ */ new Map();
  for (const item of entries) {
    const key = item.href.split("#")[0];
    if (!groups.has(key)) groups.set(key, { label: item.label, entries: [] });
    groups.get(key).entries.push(item);
  }
  return [...groups.values()];
}
var occurrenceLetter = (index) => index < 26 ? String.fromCharCode(97 + index) : occurrenceLetter(Math.floor(index / 26) - 1) + occurrenceLetter(index % 26);
var siteReturnLabel = (group, item, index) => `Return to ${group.label}${item.context ? " \u2014 " + item.context : ""} (occurrence ${occurrenceLetter(index)})`;

// src/compiler.mjs
var compare = (a, b) => {
  const left = a.normalize("NFKC").toLowerCase();
  const right = b.normalize("NFKC").toLowerCase();
  return left < right ? -1 : left > right ? 1 : 0;
};
var titleFor = (record) => record.title || record.original || "Unresolved citation";
var yearFor = (record) => record.displayDate || record.issued?.[0] || "n.d.";
var suffixFor = (year, suffix, style) => style === "apa" && year === "n.d." && suffix ? `-${suffix}` : suffix;
var originalYear = (record) => record.originalIssued?.[0];
var hasReprintDate = (record) => originalYear(record) < record.issued?.[0];
function citationYear(record, suffix, style, bibliography = false, reprintYear = "both") {
  const year = yearFor(record);
  const dated = year + suffixFor(year, suffix, style);
  if (!hasReprintDate(record)) return dated;
  if (style === "chicago-author-date") {
    if (bibliography) return `(${originalYear(record)}) ${dated}`;
    if (reprintYear === "original") return `${originalYear(record)}${suffix}`;
    if (reprintYear === "edition") return dated;
    return `[${originalYear(record)}] ${dated}`;
  }
  if (!bibliography && ["apa", "default", "harvard"].includes(style)) return `${originalYear(record)}/${dated}`;
  return dated;
}
var hasDefaultCitationText = (record, suffix) => record.citationText && (!suffix || record.citationText.includes(` (${yearFor(record)}).`));
function defaultBibliography(record, suffix = "") {
  if (record.state === "unresolved") return titleFor(record);
  const year = yearFor(record);
  if (hasDefaultCitationText(record, suffix)) {
    return record.citationText.replace(` (${year}).`, ` (${year}${suffix}).`);
  }
  const names = record.authors.map((author) => {
    if (author.literal) return author.literal;
    const initials = author.given?.match(/\p{L}[\p{L}\p{M}]*/gu)?.map((part) => `${[...part][0]}.`).join(" ");
    return [author.family, initials, author.suffix].filter(Boolean).join(", ");
  });
  const authors = names.length > 1 ? `${names.slice(0, -1).join(", ")}, & ${names.at(-1)}` : names[0];
  const journal = [record.containerTitle, record.volume + (record.issue ? `(${record.issue})` : ""), record.pages || record.articleNumber].filter(Boolean).join(", ");
  const source = record.identifiers.find((id) => id.scheme === "doi");
  const details = [journal || record.publisher, identifierURL(source)].filter(Boolean);
  return [
    authors ? `${authors} (${year}${suffix}). ${titleFor(record)}.` : `${titleFor(record)}. (${year}${suffix}).`,
    ...details.map((item) => item.startsWith("https://") ? item : `${item}.`)
  ].join(" ");
}
function chicagoBibliography(record, suffix) {
  const { authors, type, containerTitle, publisher, edition } = record;
  if (type === "legislation") {
    const citation = [record.legalCitation || [record.number, record.session].filter(Boolean).join(", "), record.jurisdiction].filter(Boolean);
    const url2 = identifierURL(record.identifiers.find((item) => item.scheme === "url"));
    return [{ text: `${titleFor(record)}. ${yearFor(record)}${suffix}.${citation.length ? ` ${citation.join(", ")}.` : ""}${url2 ? ` ${url2}` : ""}` }];
  }
  const parts = [];
  const add = (text, emphasis) => parts.push(emphasis ? { text, emphasis } : { text });
  if (authors.length) {
    const names = authors.slice(0, authors.length > 6 ? 3 : 6).map((author, index) => fullAuthorName(author, index === 0));
    const head = names.slice(0, -1).join(", ");
    const byline = names.length === 1 ? names[0] : authors.length > 6 ? `${names.join(", ")}, et al` : `${head}${names.length > 2 ? "," : ""} and ${names.at(-1)}`;
    add(`${byline}. ${citationYear(record, suffix, "chicago-author-date", true)}. `);
  }
  const title = titleFor(record);
  const quoted = ["article-journal", "article", "chapter", "webpage", "thesis"].includes(type);
  if (quoted) add(`\u201C${title}${/[.?!]$/.test(title) ? "" : "."}\u201D`);
  else {
    add(title, "italic");
    if (!/[.?!]$/.test(title)) add(".");
  }
  if (!authors.length) add(` ${citationYear(record, suffix, "chicago-author-date", true)}.`);
  if (containerTitle) {
    add(type === "chapter" ? " In " : " ");
    add(containerTitle, "italic");
    if (record.volume) add(` ${record.volume}`);
    if (record.issue) add(` (${record.issue})`);
    if (record.pages || record.articleNumber) add(`${type === "chapter" ? ", " : ": "}${record.pages || record.articleNumber}`);
    add(".");
  }
  if (edition) add(` ${edition.replace(/\.$/, "")}.`);
  if (publisher) add(` ${publisher.replace(/\.$/, "")}.`);
  const url = identifierURL(record.identifiers.find((item) => item.scheme === "doi" || item.scheme === "url"));
  if (url) add(` ${url}`);
  return parts;
}
function webpageReferenceURL(record) {
  const identifier = record.identifiers.find((id) => id.scheme === "doi") || record.identifiers.find((id) => id.scheme === "url");
  if (identifier) return identifierURL(identifier);
  const publisherURLs = new Set(record.locations.filter((location) => location.kind === "publisher").map((location) => location.url));
  return publisherURLs.size === 1 ? httpsURL(publisherURLs.values().next().value) : "";
}
function styledBibliography(record, suffix, style) {
  const parts = [];
  const add = (text, emphasis) => parts.push(emphasis ? { text, emphasis } : { text });
  const { authors, containerTitle, volume, issue, publisher, publisherPlace, edition } = record;
  const title = style === "apa" && record.apaTitle || titleFor(record);
  const year = citationYear(record, suffix, style, true);
  const pages = record.pages || record.articleNumber;
  const apa = style === "apa";
  const webpage = record.type === "webpage" && (apa || style === "default");
  const url = webpage ? webpageReferenceURL(record) : identifierURL(record.identifiers.find((id) => ["doi", "url"].includes(id.scheme)));
  const initials = (given, separator = ". ") => (given?.match(/\p{L}[\p{L}\p{M}]*/gu) || []).map((word) => [...word][0]).join(separator);
  const abbreviated = (author) => author.literal || [author.family, author.given && `${initials(author.given)}.`, author.suffix].filter(Boolean).join(", ");
  const period = (text) => /[.?!]$/.test(text) ? text : `${text}.`;
  const locator = pages && `${/[-–—]/.test(pages) ? "pp." : "p."} ${pages}`;
  if (style === "vancouver") {
    const ordinal = { II: "2nd", III: "3rd", IV: "4th", V: "5th", VI: "6th", VII: "7th", VIII: "8th", IX: "9th", X: "10th" };
    const names2 = authors.slice(0, 6).map((author) => author.literal || [author.family, initials(author.given, ""), Object.hasOwn(ordinal, author.suffix) ? ordinal[author.suffix] : author.suffix?.replace(/\.$/, "")].filter(Boolean).join(" "));
    if (names2.length) add(`${names2.join(", ")}${authors.length > 6 ? ", et al" : ""}. `);
    add(period(title));
    if (containerTitle) {
      const journal = period(record.containerAbbreviation || containerTitle);
      const issueText = issue ? `(${issue})` : "";
      add(` ${journal} ${year}${volume || issue ? `;${volume}${issueText}` : ""}${pages ? `:${pages}` : ""}.`);
    } else {
      if (edition) add(` ${period(edition)}`);
      add(` ${publisherPlace || "[place unknown]"}: ${publisher || "[publisher unknown]"}; ${year}.`);
    }
    const doi2 = record.identifiers.find((item) => item.scheme === "doi");
    if (doi2) add(` doi: ${doi2.value}`);
    if (hasReprintDate(record)) add(` Originally published ${originalYear(record)}.`);
    return parts;
  }
  if (style === "mla") {
    if (authors.length) {
      const byline = fullAuthorName(authors[0], true);
      add(`${byline}${authors.length > 2 ? ", et al" : authors.length === 2 ? `, and ${fullAuthorName(authors[1])}` : ""}. `);
    }
    if (containerTitle) {
      add(`\u201C${period(title)}\u201D `);
      add(containerTitle, "italic");
      const details = [volume && `vol. ${volume}`, issue && `no. ${issue}`, record.issued && year, locator, url].filter(Boolean);
      add(details.length ? period(`, ${details.join(", ")}`) : ".");
    } else {
      add(title, "italic");
      const details = [edition, publisher, record.issued && year, url].filter(Boolean);
      add(details.length ? `. ${period(details.join(", "))}` : ".");
    }
    if (hasReprintDate(record)) add(` Originally published ${originalYear(record)}.`);
    return parts;
  }
  const names = authors.map(abbreviated);
  if (names.length) {
    const tail = names.at(-1);
    const byline = apa && names.length > 20 ? `${names.slice(0, 19).join(", ")}, \u2026 ${tail}` : names.length === 1 ? tail : `${names.slice(0, -1).join(", ")}${apa || webpage ? ", &" : " and"} ${tail}`;
    add(apa || webpage ? `${period(byline)} (${year}). ` : `${byline} (${year}) `);
  }
  if (webpage) {
    add(title, "italic");
    if (!/[.?!]$/.test(title)) add(".");
    if (!names.length) add(` (${year}).`);
    const site = containerTitle || publisher;
    const sameAsAuthor = site && authors.length === 1 && authors[0].literal && compare(authors[0].literal, site) === 0;
    if (site && !sameAsAuthor) add(` ${period(site)}`);
  } else if (containerTitle) {
    add(apa ? `${period(title)} ` : `\u2018${title}\u2019, `);
    if (!names.length) add(`(${year})${apa ? "." : ","} `);
    add(apa && volume ? `${containerTitle}, ${volume}` : containerTitle, "italic");
    if (!apa && volume) add(`, ${volume}`);
    if (issue) add(`${apa ? "" : " "}(${issue})`);
    if (pages) add(`, ${apa ? record.pages || `Article ${record.articleNumber}` : record.pages ? locator : `article ${record.articleNumber}`}`);
    add(".");
  } else {
    add(title, "italic");
    if (edition) add(apa ? ` (${edition})` : `. ${edition}`);
    if (!/[.?!]$/.test(edition || title)) add(".");
    if (!names.length) add(` (${year}).`);
    if (publisher) add(` ${!apa && publisherPlace ? `${publisherPlace}: ` : ""}${period(publisher)}`);
  }
  if (url && webpage) parts.push({ text: " " }, { text: url, href: url });
  else if (url) add(` ${apa ? "" : "Available at: "}${url}`);
  if (hasReprintDate(record)) add(` (Original work published ${originalYear(record)})`);
  return parts;
}
function mediaBibliography(record, suffix, style) {
  const parts = [];
  const add = (text) => {
    if (text) parts.push({ text });
  };
  const title = titleFor(record);
  const creators = record.authors.map((author, index) => fullAuthorName(author, style === "chicago-author-date" && index === 0));
  const creator = [record.creatorAttribution, creators.join(" and ")].filter(Boolean).join(" ");
  const year = citationYear(record, suffix, style, true);
  if (creator) add(style === "chicago-author-date" ? `${creator}. ${year}. ` : `${creator}. (${year}). `);
  parts.push({ text: title, emphasis: "italic" });
  if (!/[.?!]$/.test(title)) add(".");
  if (!creator) add(style === "chicago-author-date" ? ` ${year}.` : ` (${year}).`);
  if (record.medium) add(` ${record.medium.replace(/\.$/, "")}.`);
  if (record.dimensions) add(` ${record.dimensions.replace(/\.$/, "")}.`);
  if (record.holdingInstitution) add(` ${record.holdingInstitution.replace(/\.$/, "")}.`);
  if (record.accession) add(` ${record.accession}.`);
  if (record.platform) add(` ${record.platform.replace(/\.$/, "")}.`);
  const href = identifierURL(record.identifiers.find((id) => id.scheme === "doi")) || identifierURL(record.identifiers.find((id) => id.scheme === "url")) || (record.locations.filter((location) => location.kind === "publisher").length === 1 ? record.locations.find((location) => location.kind === "publisher").url : "");
  if (href) parts.push({ text: " " }, { text: href, href });
  return parts;
}
function bibliographyParts(record, suffix, style) {
  if (record.state === "unresolved") return [{ text: titleFor(record) }];
  if (record.citationParts?.length) {
    if (!suffix || style === "mla" || style === "vancouver") return record.citationParts;
    const year = String(yearFor(record));
    const marker = style === "chicago-author-date" ? `${year}.` : `(${year})`;
    const text2 = record.citationParts.map((part) => part.text).join("");
    const at2 = text2.indexOf(marker);
    if (at2 >= 0) {
      const insertion = at2 + marker.indexOf(year) + year.length;
      let offset = 0;
      return record.citationParts.map((part) => {
        const local = insertion - offset;
        offset += part.text.length;
        return local > 0 && local <= part.text.length ? { ...part, text: part.text.slice(0, local) + suffixFor(year, suffix, style) + part.text.slice(local) } : part;
      });
    }
  }
  if (["artwork", "image"].includes(record.type) && !(style === "default" && hasDefaultCitationText(record, suffix))) {
    return mediaBibliography(record, suffix, style);
  }
  if (style === "chicago-author-date") return chicagoBibliography(record, suffix);
  if (style !== "default" || record.type === "webpage" && !hasDefaultCitationText(record, suffix)) {
    return styledBibliography(record, suffix, style);
  }
  const text = defaultBibliography(record, suffix) + (hasReprintDate(record) ? ` (Original work published ${originalYear(record)})` : "");
  const title = record.containerTitle || (["book", "report", "thesis"].includes(record.type) ? record.title : "");
  const at = title ? text.toLowerCase().lastIndexOf(title.toLowerCase()) : -1;
  return at < 0 ? [{ text }] : [
    { text: text.slice(0, at) },
    { text: text.slice(at, at + title.length), emphasis: "italic" },
    { text: text.slice(at + title.length) }
  ];
}
function bibliographyText(record, suffix = "", style = "default") {
  return bibliographyParts(record, suffix, style).map((part) => part.text).join("");
}

// src/browser.mjs
var componentName = "citation-inspector";
var stylesheetURL = new URL("./citation-inspector.css", import.meta.url);
var triggerSelector = "a[data-ci-record], a[data-ci-panel]";
var triggerAttributes = ["role", "aria-haspopup", "aria-expanded", "aria-label", "tabindex"];
var documentCaches = /* @__PURE__ */ new WeakMap();
var activeInspectors = /* @__PURE__ */ new WeakMap();
function element(tag, text, parts) {
  const node2 = document.createElement(tag);
  if (text) node2.textContent = text;
  if (parts) {
    node2.dataset.citationPart = parts;
    node2.className = partClassNames(defaultClassPrefix, parts).join(" ");
  }
  return node2;
}
function iconControl(node2, icon, label, tooltip = label) {
  node2.dataset.citationPart = "icon";
  node2.classList.add(`${defaultClassPrefix}-icon`);
  node2.innerHTML = iconMarkup(icon);
  node2.setAttribute("aria-label", label);
  node2.title = tooltip;
  return node2;
}
function action(label, icon, callback) {
  const button = iconControl(element("button"), icon, label);
  button.type = "button";
  button.addEventListener("click", callback);
  return button;
}
function external(url, label) {
  const link = element("a", label);
  link.href = url;
  link.target = "_blank";
  link.rel = "noopener noreferrer";
  return link;
}
function disclosure(summary, ...content) {
  const details = element("details");
  details.append(element("summary", summary), ...content);
  return details;
}
function destination(list, label, icon, url, { version, download = false } = {}) {
  if (!url) return;
  const row = element("li");
  const name = version ? `${label} (${version})` : label;
  const link = iconControl(external(url), icon, name, `${name}
${url}`);
  if (download) link.download = "";
  row.append(link);
  list.append(row);
}
var CitationInspector = class extends HTMLElement {
  static observedAttributes = ["access-layout", "access-settings", "activation", "panel-title", "panel-icon", "class-prefix", "access-providers", "hidden-access-providers", "hidden-providers", "evidence-title", "evidence-icon", "credit-title", "credit-icon"];
  #hovering = false;
  #hoverOpenTimer;
  #hoverCloseTimer;
  #dialog;
  #content;
  #status;
  #style;
  #cache;
  #hasInlineCache = false;
  #listeners;
  #observer;
  #panelSize;
  #enhanced = /* @__PURE__ */ new Map();
  #bindings = /* @__PURE__ */ new Map();
  #appliedPrefixes = /* @__PURE__ */ new WeakMap();
  #accessOrder = /* @__PURE__ */ new WeakMap();
  #hiddenAccessLinks = /* @__PURE__ */ new WeakSet();
  #trigger;
  #modal = false;
  #frame;
  #media;
  #heading;
  #brandIcon;
  #defaultIcon;
  #modalDismiss;
  #panelMenu;
  #panelMenuTrigger;
  #placement;
  #backdropPress = false;
  #drag;
  #manualPosition;
  #owner;
  #access = new AccessView(this);
  #settingsCommand;
  #references = prepareReferences();
  configureReferences(options = {}) {
    this.#references = prepareReferences({ siteOrigin: this.ownerDocument.location.origin, ...options });
    const record = this.#record(this.#trigger);
    if (record) this.#refresh(record, this.#trigger);
  }
  constructor() {
    super();
    const shadow = this.attachShadow({ mode: "open" });
    this.#style = element("link");
    this.#style.rel = "stylesheet";
    this.#style.href = stylesheetURL.href;
    this.#dialog = element("dialog", "", "panel");
    this.#dialog.part = "panel";
    this.#dialog.setAttribute("aria-labelledby", "panel-name");
    const header = element("header", "", "panel-header");
    this.#heading = element("h2", "citation.inator");
    this.#heading.id = "panel-name";
    this.#heading.tabIndex = -1;
    this.#brandIcon = element("img", "", "brand-icon");
    this.#brandIcon.alt = "";
    this.#brandIcon.hidden = true;
    this.#defaultIcon = element("span", "", "brand-icon");
    this.#defaultIcon.innerHTML = brandIconMarkup;
    this.#brandIcon.addEventListener("error", () => {
      this.#brandIcon.hidden = true;
      this.#defaultIcon.hidden = false;
    });
    const brand = element("div", "", "brand");
    brand.append(this.#brandIcon, this.#defaultIcon, this.#heading);
    this.#modalDismiss = element("button", "Dismiss", "modal-dismiss");
    this.#modalDismiss.type = "button";
    this.#modalDismiss.hidden = true;
    this.#modalDismiss.addEventListener("click", () => this.#dismiss(true));
    this.#panelMenuTrigger = iconControl(element("summary"), "more", "Panel options");
    const movePanel = element("button", "Move panel", "panel-command");
    movePanel.type = "button";
    movePanel.addEventListener("click", () => this.#beginPlacement());
    this.#panelMenu = element("details", "", "panel-menu");
    this.#settingsCommand = element("button", this.#access.text("access.settings"), "panel-command");
    this.#settingsCommand.type = "button";
    this.#settingsCommand.addEventListener("click", () => this.#access.openSettings(this.#settingsCommand));
    const commands = element("div", "", "panel-menu-commands");
    commands.append(movePanel, this.#settingsCommand);
    this.#panelMenu.append(this.#panelMenuTrigger, commands);
    header.append(brand, this.#panelMenu, this.#modalDismiss);
    const top = element("div", "", "panel-top");
    top.append(header);
    this.#content = element("div", "", "panel-content");
    this.#status = element("p", "", "live");
    this.#status.setAttribute("role", "status");
    this.#dialog.append(top, this.#content, this.#status);
    this.#placement = element("dialog", "", "panel-placement");
    this.#placement.setAttribute("aria-label", "Move citation panel");
    this.#placement.setAttribute("aria-describedby", "placement-instructions");
    const instructions = element("div", "", "placement-instructions");
    instructions.id = "placement-instructions";
    instructions.textContent = "Click or tap where the panel\u2019s top-left corner should go.";
    const cancel = element("button", "Cancel move", "panel-command");
    cancel.type = "button";
    cancel.autofocus = true;
    cancel.addEventListener("click", () => this.#cancelPlacement());
    instructions.append(cancel);
    this.#placement.append(instructions);
    this.#placement.addEventListener("cancel", (event) => {
      event.preventDefault();
      this.#cancelPlacement();
    });
    this.#placement.addEventListener("click", (event) => {
      if (event.target !== this.#placement) return;
      this.#placement.close();
      this.#moveTo(event.clientX, event.clientY);
      this.#heading.focus({ preventScroll: true });
    });
    shadow.append(this.#style, element("slot"), this.#dialog, this.#placement);
  }
  configureAccess(options) {
    this.#access.configure(options);
    this.refreshAccess();
  }
  refreshAccess() {
    this.#settingsCommand.textContent = this.#access.text("access.settings");
    this.#settingsCommand.hidden = this.#access.settings === "off";
    this.#enhance();
    const record = this.#record(this.#trigger);
    if (record) this.#refresh(record, this.#trigger);
  }
  set cache(value) {
    const cache = readCache(value);
    this.#dismiss(this.#bindings.has(this.#trigger) && !this.#hovering);
    this.#cache = cache;
    this.#hasInlineCache = true;
    if (this.isConnected) this.#enhance();
  }
  dismiss({ restoreFocus = true } = {}) {
    this.#dismiss(restoreFocus);
  }
  bindTrigger(trigger, occurrence, options) {
    if (!trigger?.matches?.("a, button") || trigger.closest(componentName) !== this) {
      throw new TypeError("Bind an anchor or button inside this citation inspector.");
    }
    if (this.#bindings.has(trigger) || trigger.matches(triggerSelector)) {
      throw new TypeError("This citation control is already managed by an inspector.");
    }
    this.#enhance();
    const binding = this.#bindingFor(occurrence, options);
    if ([...this.#bindings.values()].some((current) => current.occurrenceId === binding.occurrenceId)) {
      throw new TypeError(`Duplicate bound citation occurrence ${binding.occurrenceId}.`);
    }
    this.#bindings.set(trigger, binding);
    this.#enhance();
    return {
      update: (next, options2) => {
        if (this.#bindings.get(trigger) !== binding) throw new Error("This citation binding has been disposed.");
        const updated = this.#bindingFor(next, options2, binding);
        if (binding.occurrenceId !== updated.occurrenceId) throw new TypeError("Rebind a control when its occurrence ID changes.");
        Object.assign(binding, updated);
        this.#enhance();
        this.#labelTrigger(trigger);
        if (this.#trigger === trigger) {
          const record = this.#record(trigger);
          if (record) this.#refresh(record, trigger);
        }
      },
      dispose: () => {
        if (this.#bindings.get(trigger) !== binding) return;
        if (this.#trigger === trigger) this.#dismiss(!this.#hovering);
        const attributes = this.#enhanced.get(trigger);
        if (attributes) this.#restore(trigger, attributes);
        this.#bindings.delete(trigger);
      }
    };
  }
  #bindingFor(occurrence, { endnote, focusFallback } = {}, previous = {}) {
    if (!occurrence || !["occurrenceId", "anchorId", "recordId", "endnoteId", "label"].every((key) => typeof occurrence[key] === "string" && occurrence[key])) {
      throw new TypeError("Supply an occurrence from a structured citation plan.");
    }
    const { bibliographyParts: bibliographyParts2 } = occurrence;
    if (!Array.isArray(bibliographyParts2) || !bibliographyParts2.every((part) => typeof part?.text === "string")) {
      throw new TypeError("A citation occurrence requires formatted bibliography parts.");
    }
    endnote = endnote === void 0 ? previous.endnote : endnote;
    focusFallback = focusFallback === void 0 ? previous.focusFallback : focusFallback;
    if (endnote != null && (endnote.ownerDocument !== this.ownerDocument || endnote.id !== occurrence.endnoteId)) {
      throw new TypeError("Supply the endnote element for this citation occurrence.");
    }
    if (focusFallback != null && typeof focusFallback !== "function") throw new TypeError("The focus fallback must be a function.");
    return { ...occurrence, bibliographyParts: bibliographyParts2.map((part) => ({ ...part })), endnote, focusFallback };
  }
  set accessProviders(providers) {
    if (!Array.isArray(providers) || providers.some((provider) => typeof provider !== "string" || !provider.trim() || provider.includes(","))) {
      throw new TypeError("Supply an ordered array of provider names without commas.");
    }
    this.setAttribute("access-providers", providers.join(","));
  }
  set hiddenAccessProviders(providers) {
    if (!Array.isArray(providers) || providers.some((provider) => typeof provider !== "string" || !provider.trim() || provider.includes(","))) {
      throw new TypeError("Supply an array of hidden provider names without commas.");
    }
    this.setAttribute("hidden-access-providers", providers.join(","));
  }
  set hiddenProviders(providers) {
    if (!Array.isArray(providers) || providers.some((provider) => typeof provider !== "string" || !provider.trim() || provider.includes(","))) {
      throw new TypeError("Supply an array of hidden provider names without commas.");
    }
    this.setAttribute("hidden-providers", providers.join(","));
  }
  attributeChangedCallback(name, before, after) {
    if (before === after) return;
    if (name === "access-layout" || name === "access-settings") {
      this.#access.restore();
      this.refreshAccess();
      return;
    }
    if (name === "access-providers" || name === "hidden-access-providers" || name === "hidden-providers") {
      this.#access.restore();
      this.#enhance();
      const record = this.#record(this.#trigger);
      if (record) this.#refresh(record, this.#trigger);
      return;
    }
    if (name === "class-prefix") {
      this.#applyClassPrefix();
      return;
    }
    if (name !== "activation") {
      if (this.#trigger) this.#updateHeader(this.#annotationTarget(this.#trigger));
      return;
    }
    this.#cancelHover();
    if (this.#hovering) this.#dismiss(false);
  }
  #cancelHover() {
    clearTimeout(this.#hoverOpenTimer);
    clearTimeout(this.#hoverCloseTimer);
  }
  #hoverAllowed(event) {
    return this.getAttribute("activation") === "hover" && event.pointerType === "mouse" && typeof this.#dialog.showPopover === "function";
  }
  #queueHoverClose() {
    clearTimeout(this.#hoverCloseTimer);
    if (!this.#hovering) return;
    this.#hoverCloseTimer = setTimeout(() => {
      if (this.#hovering && !this.shadowRoot.activeElement && !this.#dialog.matches(":hover") && !this.#trigger?.matches(":hover")) {
        this.#dismiss(false);
      }
    }, 450);
  }
  connectedCallback() {
    const listeners = new AbortController();
    this.#listeners = listeners;
    const { signal } = listeners;
    this.#media = matchMedia("(max-width: 42rem), (pointer: coarse), (max-height: 30rem)");
    this.#media.addEventListener("change", () => this.#dismiss(!this.#hovering), { signal });
    this.addEventListener("pointerover", (event) => {
      const trigger = this.#eventTrigger(event);
      if (!this.#hoverAllowed(event) || !this.#enhanced.has(trigger) || event.relatedTarget instanceof Node && trigger.contains(event.relatedTarget)) return;
      clearTimeout(this.#hoverOpenTimer);
      if (this.#trigger === trigger) {
        clearTimeout(this.#hoverCloseTimer);
        return;
      }
      if (this.#trigger && !this.#hovering) return;
      this.#hoverOpenTimer = setTimeout(() => {
        if (this.#enhanced.has(trigger) && trigger.matches(":hover")) this.#open(trigger, true);
      }, 140);
    }, { signal });
    this.addEventListener("pointerout", (event) => {
      const trigger = this.#eventTrigger(event);
      if (!this.#enhanced.has(trigger) || event.relatedTarget instanceof Node && trigger.contains(event.relatedTarget)) return;
      clearTimeout(this.#hoverOpenTimer);
      if (trigger === this.#trigger) this.#queueHoverClose();
    }, { signal });
    this.#dialog.addEventListener("pointerdown", (event) => this.#startDrag(event), { signal });
    this.ownerDocument.addEventListener("pointermove", (event) => {
      const drag = this.#drag;
      if (drag?.id !== event.pointerId) return;
      if (!drag.moved) {
        if (Math.hypot(event.clientX - drag.x, event.clientY - drag.y) < 4) return;
        drag.moved = true;
        this.#dialog.setPointerCapture(event.pointerId);
        this.#cancelHover();
        this.#hovering = false;
      }
      this.#moveTo(drag.left + event.clientX - drag.x, drag.top + event.clientY - drag.y);
    }, { capture: true, signal });
    for (const type of ["pointerup", "pointercancel", "lostpointercapture"]) {
      this.ownerDocument.addEventListener(type, (event) => {
        if (event.pointerId !== this.#drag?.id) return;
        if (type === "lostpointercapture" && event.composedPath()[0] !== this.#dialog) return;
        this.#endDrag();
      }, { capture: true, signal });
    }
    this.#dialog.addEventListener("touchstart", (event) => {
      if (this.#drag && event.touches.length === 1 && event.cancelable) event.preventDefault();
    }, { passive: false, signal });
    this.#heading.addEventListener("keydown", (event) => this.#moveWithKeys(event), { signal });
    this.#dialog.addEventListener("pointerenter", () => clearTimeout(this.#hoverCloseTimer), { signal });
    this.#dialog.addEventListener("pointerleave", () => this.#queueHoverClose(), { signal });
    this.#dialog.addEventListener("focusin", () => clearTimeout(this.#hoverCloseTimer), { signal });
    this.#dialog.addEventListener("focusout", () => this.#queueHoverClose(), { signal });
    this.addEventListener("click", (event) => {
      const trigger = this.#eventTrigger(event);
      if (!this.#enhanced.has(trigger) || event.defaultPrevented || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      event.preventDefault();
      this.#open(trigger);
    }, { signal });
    this.addEventListener("keydown", (event) => {
      const trigger = this.#eventTrigger(event);
      if (!trigger || trigger.tagName === "BUTTON" || event.defaultPrevented || event.key !== " " && (event.key !== "Enter" || trigger.hasAttribute("href"))) return;
      event.preventDefault();
      if (!event.repeat) this.#open(trigger);
    }, { signal });
    this.ownerDocument.defaultView?.addEventListener("keydown", (event) => {
      if (event.defaultPrevented || event.key !== "Escape" || this.#access.owns(event)) return;
      this.#cancelHover();
      if (!this.#trigger) return;
      const path = event.composedPath();
      if (![this.#dialog, this.#placement, this.#trigger].some((element2) => path.includes(element2))) {
        this.#dismiss(false);
        return;
      }
      event.preventDefault();
      event.stopPropagation();
      if (this.#placement.open) {
        this.#cancelPlacement();
        return;
      }
      if (this.#panelMenu.open) {
        this.#panelMenu.open = false;
        this.#panelMenuTrigger.focus({ preventScroll: true });
        return;
      }
      this.#dismiss(!this.#hovering || Boolean(this.shadowRoot.activeElement));
    }, { signal, capture: true });
    this.#dialog.addEventListener("click", (event) => {
      const dismiss = this.#modal && this.#backdropPress && event.target === this.#dialog;
      this.#backdropPress = false;
      if (dismiss) this.#dismiss(true);
    }, { signal });
    this.#dialog.addEventListener("cancel", (event) => {
      event.preventDefault();
      this.#dismiss(true);
    }, { signal });
    this.#dialog.addEventListener("beforetoggle", (event) => {
      if (event.newState === "closed") this.#clearOpen();
    }, { signal });
    this.#dialog.addEventListener("close", () => {
      if (!this.#dialog.open && this.#modal) this.#clearOpen();
    }, { signal });
    this.ownerDocument.addEventListener("click", (event) => {
      if (this.#access.owns(event)) return;
      const target = event.composedPath();
      if (target.includes(this.#placement)) return;
      if (!target.includes(this.#panelMenu)) this.#panelMenu.open = false;
      if (!this.#trigger || this.#modal || target.includes(this) && (target.includes(this.#dialog) || target.some((node2) => this.#enhanced.has(node2)))) return;
      this.#dismiss(false);
    }, { signal });
    window.addEventListener("resize", () => this.#schedulePosition(), { signal });
    window.addEventListener("scroll", () => this.#schedulePosition(), { capture: true, passive: true, signal });
    window.visualViewport?.addEventListener("resize", () => this.#schedulePosition(), { signal });
    window.visualViewport?.addEventListener("scroll", () => this.#schedulePosition(), { signal });
    this.#panelSize = new ResizeObserver(() => this.#schedulePosition());
    this.#panelSize.observe(this.#dialog);
    this.addEventListener("change", (event) => {
      if (event.target.matches("[data-ci-tag-filter]") && event.target.closest(componentName) === this) this.#filterLists();
    }, { signal });
    this.#observer = new MutationObserver(() => {
      this.#applyClassPrefix();
      this.#enhance();
    });
    this.#observer.observe(this, { childList: true, subtree: true });
    this.#style.addEventListener("load", () => this.#enhance(), { signal });
    this.#access.connect();
    this.#applyClassPrefix();
    this.#enhance();
    if (!this.#cache) this.#load(signal);
  }
  async #load(signal) {
    try {
      const location = this.getAttribute("data-cache");
      if (!location) return;
      const url = new URL(location, this.baseURI);
      if (url.origin !== this.ownerDocument.location.origin) return;
      url.hash = "";
      let caches = documentCaches.get(this.ownerDocument);
      if (!caches) {
        caches = /* @__PURE__ */ new Map();
        documentCaches.set(this.ownerDocument, caches);
      }
      if (!caches.has(url.href)) {
        const request = fetch(url, { credentials: "same-origin", redirect: "error" }).then((response) => {
          if (!response.ok) throw new Error("Citation cache unavailable.");
          return response.json();
        }).then(readCache).catch((error) => {
          caches.delete(url.href);
          throw error;
        });
        caches.set(url.href, request);
      }
      const cache = await caches.get(url.href);
      if (!signal.aborted && !this.#hasInlineCache) {
        this.#cache = cache;
        this.#enhance();
      }
    } catch {
    }
  }
  #restore(trigger, attributes) {
    for (const [key, value] of attributes) {
      if (value === null) trigger.removeAttribute(key);
      else trigger.setAttribute(key, value);
    }
    this.#enhanced.delete(trigger);
  }
  #applyClassPrefix() {
    const lightParts = [...this.querySelectorAll(partSelector)].filter((node2) => node2.closest(componentName) === this);
    const configured = this.getAttribute("class-prefix");
    const compiled = lightParts[0]?.dataset.citationPrefix;
    const prefix = validClassPrefix(configured) ? configured : validClassPrefix(compiled) ? compiled : defaultClassPrefix;
    for (const node2 of [...lightParts, ...this.shadowRoot.querySelectorAll(partSelector)]) {
      const previous = this.#appliedPrefixes.get(node2) || node2.dataset.citationPrefix || defaultClassPrefix;
      if (previous === prefix) continue;
      const parts = node2.dataset.citationPart;
      node2.classList.remove(...partClassNames(previous, parts));
      node2.classList.add(...partClassNames(prefix, parts));
      this.#appliedPrefixes.set(node2, prefix);
    }
  }
  #annotationTarget(trigger) {
    const target = trigger.dataset.ciPanel && trigger.getRootNode().getElementById(trigger.hash.slice(1));
    return target && this.contains(target) && target.matches('[data-citation-part~="annotation-content"], .ci-annotation-content') ? target : null;
  }
  #canOpen(trigger) {
    return this.#record(trigger) || this.#annotationTarget(trigger);
  }
  #record(trigger) {
    return this.#cache?.byId.get(this.#bindings.get(trigger)?.recordId ?? trigger?.dataset.ciRecord);
  }
  #eventTrigger(event) {
    return event.composedPath().find((node2) => this.#enhanced.has(node2));
  }
  #labelTrigger(trigger) {
    const original = this.#enhanced.get(trigger);
    if (original && !trigger.dataset.ciPanel && !original.get("aria-label")) {
      const label = this.#bindings.get(trigger)?.label || trigger.textContent.trim();
      trigger.setAttribute("aria-label", trigger.dataset.ciInspectLabel || `Inspect citation: ${label}`);
    }
  }
  #refresh(record, trigger) {
    const focused = this.shadowRoot.activeElement;
    const restoreFocus = focused && this.#content.contains(focused);
    const actionName = focused?.getAttribute("aria-label");
    const href = focused?.getAttribute("href");
    const scroll = this.#dialog.scrollTop;
    this.#render(record, trigger);
    this.#applyClassPrefix();
    if (restoreFocus) {
      const replacement = [...this.#content.querySelectorAll("a, button")].find(
        (node2) => actionName ? node2.getAttribute("aria-label") === actionName : href && node2.getAttribute("href") === href
      );
      (replacement || this.#heading).focus({ preventScroll: true });
    }
    this.#dialog.scrollTop = scroll;
  }
  #providerRank(provider) {
    const preferences = (this.getAttribute("access-providers") || "").split(",").map((name) => name.trim().toLowerCase());
    const index = preferences.indexOf(provider.toLowerCase());
    return index < 0 ? Infinity : index;
  }
  #providerHidden(provider) {
    if (!provider) return false;
    return (this.getAttribute("hidden-providers") ?? this.getAttribute("hidden-access-providers") ?? "").split(",").some((name) => name.trim().toLowerCase() === provider.toLowerCase());
  }
  #orderEndnoteLinks() {
    for (const row of this.querySelectorAll('[data-citation-part~="note-actions"]')) {
      if (row.closest(componentName) !== this) continue;
      const links = [...row.querySelectorAll(":scope > [data-ci-access-provider]")];
      const active = this.ownerDocument.activeElement;
      links.forEach((link, index) => {
        if (!this.#accessOrder.has(link)) this.#accessOrder.set(link, index);
        if (this.#providerHidden(link.dataset.ciAccessProvider)) {
          if (!link.hidden) {
            link.hidden = true;
            this.#hiddenAccessLinks.add(link);
          }
        } else if (this.#hiddenAccessLinks.has(link)) {
          link.hidden = false;
          this.#hiddenAccessLinks.delete(link);
        }
      });
      if (links.includes(active) && active.hidden) {
        (row.querySelector("a:not([hidden])") || row.closest("li"))?.focus({ preventScroll: true });
      }
      const sorted = [...links].sort((a, b) => this.#providerRank(a.dataset.ciAccessProvider) - this.#providerRank(b.dataset.ciAccessProvider) || this.#accessOrder.get(a) - this.#accessOrder.get(b));
      if (links.every((link, index) => link === sorted[index])) continue;
      const slots = links.map((link) => {
        const marker = this.ownerDocument.createComment("");
        link.before(marker);
        return marker;
      });
      const focused = this.ownerDocument.activeElement;
      slots.forEach((slot, index) => slot.replaceWith(sorted[index]));
      if (links.includes(focused)) focused.focus({ preventScroll: true });
    }
  }
  #enhance() {
    this.#orderEndnoteLinks();
    for (const [trigger, attributes] of this.#enhanced) {
      if (trigger.closest(componentName) === this && this.#canOpen(trigger)) continue;
      if (trigger === this.#trigger) this.#dismiss(this.#bindings.has(trigger) && !this.#hovering);
      this.#restore(trigger, attributes);
    }
    for (const trigger of this.#bindings.keys()) {
      if (trigger.closest(componentName) !== this) this.#bindings.delete(trigger);
    }
    if (!this.#style.sheet || typeof this.#dialog.showModal !== "function") return;
    this.#filterLists();
    if (this.#cache) this.#access.enhanceNotes(this.#cache.byId, (name) => this.#providerHidden(name));
    const candidates = [...this.querySelectorAll(triggerSelector), ...this.#bindings.keys()];
    for (const trigger of candidates) {
      if (trigger.closest(componentName) !== this || this.#enhanced.has(trigger) || !this.#canOpen(trigger)) continue;
      this.#enhanced.set(trigger, new Map(triggerAttributes.map((key) => [key, trigger.getAttribute(key)])));
      if (trigger.tagName === "A") {
        trigger.setAttribute("role", "button");
        if (!trigger.hasAttribute("href")) trigger.setAttribute("tabindex", "0");
      }
      trigger.setAttribute("aria-haspopup", "dialog");
      trigger.setAttribute("aria-expanded", "false");
      this.#labelTrigger(trigger);
    }
  }
  disconnectedCallback() {
    this.#access.disconnect();
    this.#dismiss(this.#bindings.has(this.#trigger) && !this.#hovering);
    this.#listeners?.abort();
    this.#observer?.disconnect();
    this.#panelSize?.disconnect();
    for (const [trigger, attributes] of this.#enhanced) this.#restore(trigger, attributes);
    for (const filters of this.querySelectorAll("[data-ci-tag-filters]")) filters.hidden = true;
    for (const row of this.querySelectorAll("[data-ci-reading-list] > ol > li")) row.hidden = false;
  }
  #filterLists() {
    for (const list of this.querySelectorAll("[data-ci-reading-list]")) {
      if (list.closest(componentName) !== this) continue;
      const filters = list.querySelector("[data-ci-tag-filters]");
      if (!filters) continue;
      const selected = [...filters.querySelectorAll("input:checked")].map((node2) => node2.value);
      const rows = [...list.querySelectorAll(":scope > ol > li")];
      let shown = 0;
      for (const row of rows) {
        let tags = [];
        try {
          tags = JSON.parse(row.dataset.ciTags || "[]");
        } catch {
        }
        row.hidden = selected.length > 0 && !selected.some((tag) => tags.includes(tag));
        if (!row.hidden) shown++;
      }
      const category = new Intl.PluralRules("en").select(shown);
      const count = `${shown} ${category === "one" ? "reference" : "references"} shown out of ${rows.length}`;
      const status = filters.querySelector("[data-ci-list-count]");
      if (status.textContent !== count) status.textContent = count;
      list.querySelector("[data-ci-list-empty]").hidden = shown > 0;
      filters.hidden = false;
      if (this.#trigger && rows.some((row) => row.hidden && row.contains(this.#trigger))) this.#dismiss(false);
    }
  }
  #open(trigger, hover = false) {
    this.#cancelHover();
    if (trigger === this.#trigger) {
      if (hover) return;
      if (!this.#hovering) {
        this.#dismiss(true);
        return;
      }
      if (!this.#media.matches) {
        this.#hovering = false;
        this.#heading.focus({ preventScroll: true });
        return;
      }
      this.#dismiss(false);
    }
    const annotation = this.#annotationTarget(trigger);
    const record = this.#record(trigger);
    if (!annotation && !record) return;
    const doc = this.ownerDocument;
    const previousInspector = activeInspectors.get(doc);
    if (previousInspector && previousInspector !== this) previousInspector.#dismiss(false);
    this.#dismiss(false);
    this.#trigger = trigger;
    activeInspectors.set(doc, this);
    this.#hovering = hover;
    this.#owner = {};
    this.#modal = !hover && (this.#media.matches || typeof this.#dialog.showPopover !== "function");
    this.#modalDismiss.hidden = !this.#modal;
    trigger.setAttribute("aria-expanded", "true");
    this.#updateHeader(annotation);
    if (annotation) {
      this.#status.textContent = "";
      const body = annotation.querySelector("[data-ci-annotation-body]");
      this.#content.replaceChildren(body.cloneNode(true));
    } else this.#render(record, trigger);
    this.#applyClassPrefix();
    this.#dialog.scrollTop = 0;
    if (this.#modal) {
      this.#dialog.removeAttribute("popover");
      this.#dialog.showModal();
    } else {
      this.#dialog.setAttribute("popover", "manual");
      const previousFocus = hover && doc.activeElement;
      this.#dialog.showPopover({ source: trigger });
      if (hover && this.shadowRoot.activeElement) {
        this.shadowRoot.activeElement.blur();
        previousFocus?.focus({ preventScroll: true });
      }
    }
    this.setAttribute("open", "");
    this.#position();
    if (!hover) this.#heading.focus({ preventScroll: true });
  }
  #clearOpen() {
    if (activeInspectors.get(this.ownerDocument) === this) activeInspectors.delete(this.ownerDocument);
    this.removeAttribute("open");
    this.#trigger?.setAttribute("aria-expanded", "false");
    this.#trigger = null;
    this.#hovering = false;
    this.#backdropPress = false;
    this.#panelMenu.open = false;
    if (this.#placement.open) this.#placement.close();
    this.#endDrag();
    this.#manualPosition = null;
    this.#dialog.removeAttribute("data-ci-moved");
    this.#owner = null;
    cancelAnimationFrame(this.#frame);
    this.#frame = null;
  }
  #dismiss(restore) {
    this.#cancelHover();
    if (!this.#trigger) return;
    const trigger = this.#trigger;
    this.#clearOpen();
    if (this.#modal) this.#dialog.close();
    else if (this.#dialog.matches(":popover-open")) this.#dialog.hidePopover();
    if (restore) {
      const binding = this.#bindings.get(trigger);
      const target = trigger.isConnected && trigger.closest(componentName) === this ? trigger : binding?.focusFallback?.();
      if (target?.isConnected) target.focus(binding ? { preventScroll: true } : void 0);
    }
  }
  #schedulePosition() {
    if (!this.#trigger || this.#frame) return;
    this.#frame = requestAnimationFrame(() => {
      this.#frame = null;
      this.#position();
    });
  }
  #startDrag(event) {
    if (!this.#trigger || event.button !== 0 || !event.isPrimary || this.#drag) return;
    const { clientX: x, clientY: y, target } = event;
    const { left, top, right, bottom } = this.#dialog.getBoundingClientRect();
    const outside = x < left || x > right || y < top || y > bottom;
    this.#backdropPress = this.#modal && target === this.#dialog && outside;
    if (outside) return;
    if (target.closest("a, button, input, select, textarea, label, summary, [contenteditable], [tabindex]:not([tabindex='-1']), [role='button']") || this.#overText(target, x, y)) return;
    if (event.pointerType === "mouse") event.preventDefault();
    this.#drag = { id: event.pointerId, x, y, left, top, moved: false };
  }
  #overText(target, x, y) {
    const range = this.ownerDocument.createRange();
    for (const child of target.childNodes) {
      if (child.nodeType !== Node.TEXT_NODE || !child.textContent.trim()) continue;
      range.selectNodeContents(child);
      if ([...range.getClientRects()].some((rect) => x >= rect.left && x <= rect.right && y >= rect.top && y <= rect.bottom)) return true;
    }
    return false;
  }
  #endDrag() {
    const drag = this.#drag;
    this.#drag = null;
    if (drag && this.#dialog.hasPointerCapture(drag.id)) this.#dialog.releasePointerCapture(drag.id);
  }
  #moveWithKeys(event) {
    const offsets = { ArrowUp: [0, -24], ArrowDown: [0, 24], ArrowLeft: [-24, 0], ArrowRight: [24, 0] };
    const offset = offsets[event.key];
    if (!offset && event.key !== "Home") return;
    event.preventDefault();
    this.#cancelHover();
    this.#hovering = false;
    if (event.key === "Home") this.#resetPosition();
    else this.#nudge(...offset);
  }
  #beginPlacement() {
    this.#cancelHover();
    this.#hovering = false;
    this.#panelMenu.open = false;
    this.#placement.showModal();
    this.#position();
  }
  #cancelPlacement() {
    this.#placement.close();
    this.#panelMenuTrigger.focus({ preventScroll: true });
  }
  #resetPosition() {
    this.#manualPosition = null;
    this.#dialog.removeAttribute("data-ci-moved");
    this.#position();
  }
  #nudge(dx, dy) {
    const { left, top } = this.#dialog.getBoundingClientRect();
    this.#moveTo(left + dx, top + dy);
  }
  #moveTo(left, top) {
    this.#manualPosition = { left, top };
    this.#dialog.setAttribute("data-ci-moved", "");
    this.#position();
  }
  #position() {
    if (!this.#trigger) return;
    const viewport = window.visualViewport;
    const x = viewport?.offsetLeft ?? 0;
    const y = viewport?.offsetTop ?? 0;
    const width = viewport?.width ?? this.ownerDocument.documentElement.clientWidth;
    const height = viewport?.height ?? this.ownerDocument.documentElement.clientHeight;
    if (this.#placement.open) {
      this.#placement.style.setProperty("--ci-placement-left", `${x}px`);
      this.#placement.style.setProperty("--ci-placement-top", `${y}px`);
      this.#placement.style.setProperty("--ci-placement-width", `${width}px`);
      this.#placement.style.setProperty("--ci-placement-height", `${height}px`);
    }
    const widthLimit = width - (this.#modal ? 16 : 24);
    const heightLimit = this.#modal ? height * (this.#media.matches ? 0.6 : 0.8) : height - 24;
    this.#dialog.style.setProperty("--ci-panel-width", `${Math.max(1, widthLimit)}px`);
    this.#dialog.style.setProperty("--ci-panel-height", `${Math.max(1, heightLimit)}px`);
    const panel = this.#dialog.getBoundingClientRect();
    const anchor = this.#trigger.getBoundingClientRect();
    const clamp = (value, min, max) => Math.max(min, Math.min(max, value));
    const gap = this.#hovering ? 1 : 9;
    const below = anchor.bottom + gap;
    const above = anchor.top - panel.height - gap;
    const fitsBelow = below + panel.height <= y + height - 12;
    const fitsAbove = above >= y + 12;
    const side = anchor.right + gap;
    const fitsBeside = side + panel.width <= x + width - 12;
    const left = this.#manualPosition?.left ?? (this.#modal ? x + (width - panel.width) / 2 : !fitsBelow && !fitsAbove && fitsBeside ? side : anchor.left);
    const top = this.#manualPosition?.top ?? (this.#modal ? y + height - panel.height - 8 : fitsBelow ? below : fitsAbove ? above : anchor.top);
    const clampedLeft = clamp(left, x + 8, x + width - panel.width - 8);
    const clampedTop = clamp(top, y + 8, y + height - panel.height - 8);
    this.#dialog.style.setProperty("--ci-left", `${clampedLeft}px`);
    this.#dialog.style.setProperty("--ci-top", `${clampedTop}px`);
    if (this.#manualPosition) this.#manualPosition = { left: clampedLeft, top: clampedTop };
  }
  #updateHeader(annotation) {
    const panel = annotation ? this.#trigger?.dataset.ciPanel : "panel";
    this.#heading.textContent = this.getAttribute(`${panel}-title`)?.trim() || annotation?.getAttribute("aria-label") || "citation.inator";
    const icon = (this.getAttribute(`${panel}-icon`) ?? this.getAttribute("panel-icon"))?.trim();
    let source;
    if (icon && icon !== "none") {
      try {
        const url = new URL(icon, this.baseURI);
        if (["http:", "https:"].includes(url.protocol) && url.origin === this.ownerDocument.location.origin && !url.username && !url.password) {
          source = url.href;
        }
      } catch {
      }
    }
    if (source) {
      if (this.#brandIcon.getAttribute("src") !== source) {
        this.#defaultIcon.hidden = true;
        this.#brandIcon.hidden = false;
        this.#brandIcon.src = source;
      }
    } else {
      this.#brandIcon.hidden = true;
      this.#brandIcon.removeAttribute("src");
      this.#defaultIcon.hidden = icon === "none";
    }
  }
  #render(record, trigger) {
    const fragment = document.createDocumentFragment();
    const title = record.title || record.original || "Unresolved citation";
    const binding = this.#bindings.get(trigger);
    const bibliography = binding?.bibliographyParts.map((part) => part.text).join("") || trigger.dataset.ciBibliography || bibliographyText(record);
    const badges = [record.integrity?.state, record.state === "unresolved" && "Unresolved"].filter(Boolean);
    if (badges.length) fragment.append(element("p", badges.join(" \xB7 "), record.integrity ? "badge integrity" : "badge"));
    const titleNode = element("h3", title);
    titleNode.dir = "auto";
    fragment.append(titleNode);
    const bindingMetadata = this.#bindings.get(trigger);
    let tags = bindingMetadata?.tags || this.#references.tags(record);
    let siteOccurrences = bindingMetadata?.siteOccurrences || this.#references.occurrences(record.id);
    try {
      const metadata = JSON.parse(trigger.dataset.ciTags || "null");
      if (Array.isArray(metadata)) tags = metadata;
      const usage = JSON.parse(trigger.dataset.ciSiteOccurrences || "null");
      if (Array.isArray(usage)) siteOccurrences = usage;
    } catch {
    }
    const tagLine = element("p", "", "tags");
    for (const tag of Array.isArray(tags) ? tags : []) {
      if (typeof tag?.label !== "string") continue;
      const badge = element("span", "", "tag");
      const iconURL = siteURL(tag.icon, this.ownerDocument.location.origin);
      if (iconURL) {
        const ns = "http://www.w3.org/2000/svg";
        const icon = document.createElementNS(ns, "svg");
        icon.setAttribute("width", "16");
        icon.setAttribute("height", "16");
        icon.setAttribute("viewBox", "0 0 24 24");
        icon.setAttribute("aria-hidden", "true");
        icon.setAttribute("focusable", "false");
        const mask = document.createElementNS(ns, "mask");
        mask.id = "citation-tag-" + crypto.randomUUID();
        mask.setAttribute("mask-type", "alpha");
        const image = document.createElementNS(ns, "image");
        image.setAttribute("href", iconURL);
        image.setAttribute("width", "24");
        image.setAttribute("height", "24");
        mask.append(image);
        const rect = document.createElementNS(ns, "rect");
        rect.setAttribute("width", "24");
        rect.setAttribute("height", "24");
        rect.setAttribute("fill", "currentColor");
        rect.setAttribute("mask", `url(#${mask.id})`);
        icon.append(mask, rect);
        badge.append(icon);
      }
      badge.append(tag.label);
      tagLine.append(badge);
    }
    if (tagLine.childNodes.length) fragment.append(tagLine);
    const acceptedUsage = prepareReferences({
      siteOrigin: this.ownerDocument.location.origin,
      siteOccurrences: { [record.id]: Array.isArray(siteOccurrences) ? siteOccurrences : [] }
    }).occurrences(record.id);
    if (acceptedUsage.length) {
      const section = element("section", "", "site-returns");
      section.append(element("h4", "Cited on this site"));
      const list2 = element("ul");
      for (const group of groupSiteOccurrences(acceptedUsage)) {
        const row = element("li", group.label + " (");
        group.entries.forEach((item, index) => {
          if (index) row.append(", ");
          const link = element("a", occurrenceLetter(index));
          link.href = item.href;
          link.setAttribute("aria-label", siteReturnLabel(group, item, index));
          link.title = item.context || group.label;
          row.append(link);
        });
        row.append(")");
        list2.append(row);
      }
      section.append(list2);
      fragment.append(section);
    }
    if (record.license || record.rightsHolder) {
      const rights = element("p", "", "rights");
      if (record.license) rights.append(record.license.url ? external(record.license.url, record.license.name) : record.license.name);
      if (record.rightsHolder) rights.append((record.license ? " \xB7 " : "") + record.rightsHolder);
      fragment.append(rights);
    }
    const names = record.authors.map((author) => fullAuthorName(author));
    if (names.length) {
      const authors = element("p", names.join(", ") + (record.authorsComplete === false ? ", et al." : ""), "authors");
      authors.dir = "auto";
      fragment.append(names.length > 8 ? disclosure(record.authorsComplete === false ? "Show listed authors" : `Show all ${names.length} authors`, authors) : authors);
    }
    const mediaDetails = [record.creatorAttribution, record.displayDate, record.medium, record.dimensions, record.holdingInstitution, record.accession, record.platform].filter(Boolean);
    if (mediaDetails.length) fragment.append(element("p", mediaDetails.join(" \xB7 "), "details"));
    for (const contributor of record.contributors || []) fragment.append(element("p", contributor.role + " \xB7 " + contributor.name, "details"));
    for (const source of record.provenance) {
      for (const checksum of [source.checksum, ...source.checksums || []].filter(Boolean)) {
        const line = element("p", "", "checksum");
        const label = [source.provider, checksum.role, checksum.algorithm].filter(Boolean).join(" \xB7 ");
        line.append(label + " " + checksum.value.slice(0, 12) + "\u2026");
        line.append(action("Copy " + label, "copy", () => this.#copy(checksum.value)));
        fragment.append(line);
      }
    }
    const doi2 = record.identifiers.find((item) => item.scheme === "doi");
    const doiURL = identifierURL(doi2);
    const citation = element("p", "", "citation");
    let parts = binding?.bibliographyParts;
    if (!parts) {
      try {
        parts = JSON.parse(trigger.dataset.ciBibliographyParts || "null");
      } catch {
      }
    }
    if (!Array.isArray(parts) || !parts.every((part) => typeof part?.text === "string") || parts.map((part) => part.text).join("") !== bibliography) parts = [{ text: bibliography }];
    let linkedDOI = false;
    for (const { text, emphasis, href } of parts) {
      const node2 = emphasis === "italic" ? element("em") : emphasis === "bold" ? element("strong") : citation;
      const doiAt = !linkedDOI && doiURL ? text.toLowerCase().indexOf(doiURL.toLowerCase()) : -1;
      const link = httpsURL(href);
      if (link) {
        node2.append(external(link, text));
        if (link === doiURL) linkedDOI = true;
      } else if (doiAt < 0) node2.append(text);
      else {
        const end = doiAt + doiURL.length;
        node2.append(text.slice(0, doiAt), external(doiURL, text.slice(doiAt, end)), text.slice(end));
        linkedDOI = true;
      }
      if (node2 !== citation) citation.append(node2);
    }
    citation.dir = "auto";
    fragment.append(names.length > 8 ? disclosure("Show formatted citation", citation) : citation);
    for (const identifier of record.identifiers) {
      if (identifier.scheme !== "isbn" && (identifier !== doi2 || linkedDOI)) continue;
      const line = element("p", "", "identifier");
      const value = identifier.scheme === "isbn" && this.#providerHidden("WorldCat") ? identifier.value : external(identifierURL(identifier), identifier.value);
      line.append(`${identifier.scheme.toUpperCase()} `, value);
      fragment.append(line);
    }
    for (const { label, value, authority } of record.relatedIdentifiers ?? []) {
      const line = element("p", `${label}: ${value} (${authority})`, "identifier");
      line.dir = "auto";
      fragment.append(line);
    }
    if (record.abstract) {
      const heading = record.abstract.kind === "excerpt" ? "Abstract excerpt" : "Abstract";
      const abstract = element("p", record.abstract.text, "abstract");
      abstract.dir = "auto";
      const source = element("p", "", "muted");
      source.append(record.abstract.url ? external(record.abstract.url, record.abstract.source) : record.abstract.source);
      const block = disclosure(heading, abstract, source);
      block.open = record.abstract.kind === "excerpt";
      fragment.append(block);
    }
    const id = (scheme) => identifierURL(record.identifiers.find((item) => item.scheme === scheme));
    const location = (kind) => record.locations.find((item) => item.kind === kind);
    const preprint = location("preprint");
    const pdf = location("pdf") || (preprint && /\.pdf(?:[?#]|$)/i.test(preprint.url) ? preprint : null);
    const publisher = location("publisher");
    const list = element("ul", "", "destinations");
    list.setAttribute("aria-label", "Source links");
    destination(list, "Download PDF", "pdf", pdf?.url, { version: pdf?.version, download: true });
    destination(list, "Open publisher page", "publisher", publisher?.url === doiURL ? "" : publisher?.url);
    destination(list, "Open repository", "repository", location("repository")?.url);
    destination(list, "Open PubMed", "article", id("pmid"));
    destination(list, "Open PubMed Central", "repository", id("pmcid"));
    const preprintURL = id("arxiv") || preprint?.url;
    if (preprintURL !== pdf?.url) destination(list, "Open preprint", "external", preprintURL);
    const services = record.locations.filter((item) => ["library", "full-text"].includes(item.kind) && !this.#providerHidden(item.provider)).sort((a, b) => this.#providerRank(a.provider) - this.#providerRank(b.provider));
    for (const service of services) {
      const fullText = service.kind === "full-text";
      destination(
        list,
        `${fullText ? "Read full text at" : "Find at"} ${service.provider}`,
        fullText ? "article" : "library",
        service.url
      );
    }
    if (record.integrity) destination(list, "Open status record", "status", record.integrity.url || location("status")?.url);
    const footer = element("footer", "", "panel-actions");
    const endnote = binding ? binding.endnote : trigger.id && trigger.hash && trigger.getRootNode().getElementById(trigger.hash.slice(1));
    if (endnote?.isConnected) {
      footer.append(action("Go to endnote", "endnote", () => {
        if (!endnote.isConnected) return;
        this.#dismiss(false);
        if (binding) endnote.scrollIntoView({ block: "nearest" });
        else this.ownerDocument.defaultView.location.hash = trigger.hash;
        endnote.focus();
      }));
    }
    footer.append(action("Copy citation", "copy", () => this.#copy(bibliography)));
    const persistent = doi2 || record.identifiers[0];
    if (persistent) footer.append(action(`Copy ${persistent.scheme.toUpperCase()}`, "link", () => this.#copy(persistent.value)));
    if (typeof this.report === "function" || this.hasAttribute("data-report")) {
      footer.append(action("Report metadata", "status", () => {
        const payload = {
          record: structuredClone(record),
          page: this.ownerDocument.location.href,
          occurrence: binding?.anchorId || trigger.id,
          ...binding && { occurrenceId: binding.occurrenceId }
        };
        this.dispatchEvent(new CustomEvent("citation-report", { detail: payload, bubbles: true, composed: true }));
        this.report?.(payload);
      }));
    }
    const toolbar = element("div", "", "panel-toolbar");
    const access = element("section", "", "access");
    access.setAttribute("aria-label", this.#access.text("access.links"));
    const statusURL = record.integrity?.url || location("status")?.url;
    const accessLinks = [...list.querySelectorAll("a")].filter((link) => {
      if (statusURL && link.href === statusURL) {
        footer.prepend(link);
        return false;
      }
      return true;
    });
    access.append(...accessLinks);
    this.#access.group(access, accessLinks, record, { hidden: (name) => this.#providerHidden(name) });
    if (access.childElementCount) fragment.append(access);
    toolbar.append(footer);
    fragment.append(toolbar);
    this.#status.textContent = "";
    this.#content.replaceChildren(fragment);
  }
  #showStatus(message) {
    this.#status.textContent = message;
    const overflow = this.#status.getBoundingClientRect().bottom - this.#dialog.getBoundingClientRect().bottom;
    if (overflow > 0) this.#dialog.scrollTop += overflow + 2;
  }
  async #copy(value) {
    const owner = this.#owner;
    try {
      await navigator.clipboard.writeText(value);
      if (this.#owner === owner) this.#showStatus("Copied.");
    } catch {
      if (this.#owner === owner) this.#showStatus("Clipboard unavailable. Select the citation text to copy it.");
    }
  }
};
if (!customElements.get(componentName)) customElements.define(componentName, CitationInspector);
function bindCitationTrigger(inspector, trigger, occurrence, options) {
  if (typeof inspector?.bindTrigger !== "function") throw new TypeError("Pass an initialized citation-inspector element.");
  return inspector.bindTrigger(trigger, occurrence, options);
}
function initializeCitationInspector(element2, {
  classPrefix,
  cache,
  activation,
  panelTitle,
  panelIcon,
  accessProviders,
  hiddenAccessProviders,
  hiddenProviders,
  evidenceTitle,
  evidenceIcon,
  creditTitle,
  creditIcon,
  accessCatalog: accessCatalog2,
  accessStorageKey,
  accessLayout,
  accessCollapseAfter,
  accessSettings,
  strings,
  locale,
  staleAfterDays,
  tagCatalogue,
  siteOccurrences,
  siteOrigin
} = {}) {
  if (element2?.localName !== componentName) throw new TypeError("Pass a citation-inspector element.");
  if (classPrefix !== void 0) {
    validateClassPrefix(classPrefix);
    element2.setAttribute("class-prefix", classPrefix);
  }
  if (activation !== void 0) element2.setAttribute("activation", activation);
  if (panelTitle !== void 0) element2.setAttribute("panel-title", panelTitle);
  if (panelIcon !== void 0) element2.setAttribute("panel-icon", panelIcon);
  if (evidenceTitle !== void 0) element2.setAttribute("evidence-title", evidenceTitle);
  if (evidenceIcon !== void 0) element2.setAttribute("evidence-icon", evidenceIcon);
  if (creditTitle !== void 0) element2.setAttribute("credit-title", creditTitle);
  if (creditIcon !== void 0) element2.setAttribute("credit-icon", creditIcon);
  if (accessProviders !== void 0) element2.accessProviders = accessProviders;
  if (hiddenAccessProviders !== void 0) element2.hiddenAccessProviders = hiddenAccessProviders;
  if (hiddenProviders !== void 0) element2.hiddenProviders = hiddenProviders;
  element2.configureReferences(Object.fromEntries(Object.entries({ tagCatalogue, siteOccurrences, siteOrigin }).filter(([, value]) => value !== void 0)));
  element2.configureAccess(Object.fromEntries(Object.entries({
    accessCatalog: accessCatalog2,
    accessStorageKey,
    accessLayout,
    accessCollapseAfter,
    accessSettings,
    strings,
    locale,
    staleAfterDays
  }).filter(([, value]) => value !== void 0)));
  if (cache !== void 0) element2.cache = cache;
  return element2;
}
export {
  bindCitationTrigger,
  getAccessProfile,
  initializeCitationInspector,
  setAccessProfile
};
