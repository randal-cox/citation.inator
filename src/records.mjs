export const CACHE_SCHEMA = "citation-inator.cache.v1";
export const DAY = 86_400_000;

export const cleanText = value => typeof value === "string" ? value.trim() : "";
const stableId = /^[a-z0-9][a-z0-9.-]{0,159}$/;
const doi = value => /^10\.\d{4,9}\/[^\s\u0000-\u001f\u007f<>{}]+$/iu.test(value) && !value.split("/").some(part => part === "." || part === "..");
const kinds = new Set(["article-journal", "book", "thesis", "article", "dataset", "software", "webpage", "report", "chapter", "document"]);
const versions = new Set(["version of record", "accepted manuscript", "author preprint", "preprint", "repository dissertation", "dataset", "software release"]);
const integrityStates = new Set(["retracted", "corrected", "expression of concern"]);
const locationKinds = new Set(["publisher", "repository", "pdf", "preprint", "status"]);

export function httpsURL(value) {
  try {
    const url = new URL(cleanText(value));
    if (url.protocol === "https:" && !url.username && !url.password) return url.href;
  } catch { /* Invalid URL. */ }
  return "";
}

export function normalizeIdentifier(input) {
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
    case "isbn": {
      value = value.replace(/[\s-]/g, "").toUpperCase();
      if (/^97[89]\d{10}$/.test(value) && [...value].reduce((sum, n, i) => sum + Number(n) * (i % 2 ? 3 : 1), 0) % 10 === 0) return { scheme, value };
      if (/^\d{9}[\dX]$/.test(value) && [...value].reduce((sum, n, i) => sum + (n === "X" ? 10 : Number(n)) * (10 - i), 0) % 11 === 0) return { scheme, value };
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
        try { return normalizeIdentifier(`doi:${decodeURIComponent(pathname.slice(1))}`); } catch { return null; }
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

export function localRecordId(prefix, key) {
  // Stable display ID only. Persistent identifiers remain the identity authority.
  let hash = 14695981039346656037n;
  for (const byte of new TextEncoder().encode(key)) hash = BigInt.asUintN(64, (hash ^ BigInt(byte)) * 1099511628211n);
  return `${prefix}-${hash.toString(16)}`;
}

export const identifierKey = ({ scheme, value }) => `${scheme}:${value}`;

export function identifierURL(id) {
  if (!id) return "";
  const valid = normalizeIdentifier(identifierKey(id));
  if (!valid) return "";
  const path = valid.value.split("/").map(encodeURIComponent).join("/");
  return ({
    doi: `https://doi.org/${path}`,
    pmid: `https://pubmed.ncbi.nlm.nih.gov/${path}/`,
    pmcid: `https://pmc.ncbi.nlm.nih.gov/articles/${path}/`,
    arxiv: `https://arxiv.org/abs/${path}`,
    isbn: `https://search.worldcat.org/search?q=bn%3A${path}`,
    url: valid.value
  })[valid.scheme] || "";
}

export function dateParts(value) {
  if (!Array.isArray(value) || !value.length || value.length > 3 || !value.every(Number.isInteger)) return null;
  const [year, month = 1, day = 1] = value;
  if (year < 1000 || year > 9999 || month < 1 || month > 12 || day < 1 || day > new Date(Date.UTC(year, month, 0)).getUTCDate()) return null;
  return [...value];
}

function stamp(value) {
  const date = cleanText(value);
  return date && Number.isFinite(Date.parse(date)) ? new Date(date).toISOString() : null;
}

export function normalizeRecord(input) {
  if (!input || !stableId.test(cleanText(input.id))) throw new TypeError("A stable citation record ID is required.");
  const array = value => Array.isArray(value) ? value : [];
  const identifiers = new Map();
  for (const item of array(input.identifiers)) {
    if (!item || typeof item.scheme !== "string" || typeof item.value !== "string") continue;
    const id = normalizeIdentifier(identifierKey(item));
    if (id && id.scheme !== "local") identifiers.set(identifierKey(id), id);
  }
  const authors = array(input.authors).flatMap(author => {
    const literal = cleanText(author?.literal);
    const family = cleanText(author?.family);
    const given = cleanText(author?.given);
    return literal ? [{ literal }] : family ? [{ family, ...(given && { given }) }] : [];
  });
  const locations = array(input.locations).flatMap(location => {
    const url = httpsURL(location?.url);
    const provider = cleanText(location?.provider);
    const verifiedAt = stamp(location?.verifiedAt);
    if (!url || !provider || !locationKinds.has(location.kind)) return [];
    if (["pdf", "preprint"].includes(location.kind) && !verifiedAt) return [];
    return [{
      kind: location.kind, url, provider, verifiedAt,
      version: versions.has(location.version) ? location.version : null
    }];
  });
  const provenance = array(input.provenance).flatMap(source => {
    const provider = cleanText(source?.provider);
    return provider ? [{
      provider, url: httpsURL(source.url), retrievedAt: stamp(source.retrievedAt),
      note: cleanText(source.note)
    }] : [];
  });
  const title = cleanText(input.title);
  const abstract = cleanText(input.abstract?.text);
  const abstractSource = cleanText(input.abstract?.source);
  const state = ["resolved", "partial", "unresolved"].includes(input.state) ? input.state : "unresolved";
  const textFields = ["containerTitle", "publisher", "volume", "issue", "pages", "articleNumber", "edition", "original", "note", "citationText"];
  return {
    id: input.id.trim(),
    type: kinds.has(input.type) ? input.type : "document",
    state: title ? state : "unresolved",
    title, authors, identifiers: [...identifiers.values()], locations, provenance,
    issued: dateParts(input.issued),
    online: dateParts(input.online),
    print: dateParts(input.print),
    retrievedAt: stamp(input.retrievedAt),
    version: versions.has(input.version) ? input.version : null,
    integrity: integrityStates.has(input.integrity?.state) && (httpsURL(input.integrity?.url) || cleanText(input.integrity?.source)) ? {
      state: input.integrity.state, source: cleanText(input.integrity.source), url: httpsURL(input.integrity.url)
    } : null,
    abstract: abstract && abstractSource ? {
      text: abstract, source: abstractSource,
      ...(input.abstract.kind === "excerpt" && { kind: "excerpt" }),
      ...(httpsURL(input.abstract.url) && { url: httpsURL(input.abstract.url) })
    } : null,
    ...Object.fromEntries(textFields.map(field => [field, cleanText(input[field])]))
  };
}

export function readCache(input) {
  if (input?.schema !== CACHE_SCHEMA || !Array.isArray(input.records)) throw new TypeError("Unsupported citation cache schema.");
  const byId = new Map();
  const byIdentifier = new Map();
  for (const raw of input.records) {
    const record = normalizeRecord(raw);
    if (byId.has(record.id)) throw new Error(`Duplicate record ID ${record.id}.`);
    byId.set(record.id, record);
    for (const identifier of record.identifiers) {
      const key = identifierKey(identifier);
      if (byIdentifier.has(key)) throw new Error(`Conflicting records for ${key}.`);
      byIdentifier.set(key, record);
    }
  }
  return { byId, byIdentifier };
}

export function makeCache(records) {
  return { schema: CACHE_SCHEMA, records: [...readCache({ schema: CACHE_SCHEMA, records }).byId.values()] };
}

export function toCSL(record) {
  const id = scheme => record.identifiers.find(item => item.scheme === scheme)?.value;
  const date = parts => parts && { "date-parts": [parts] };
  return Object.fromEntries(Object.entries({
    id: record.id, type: record.type, title: record.title, author: record.authors,
    issued: date(record.issued), "container-title": record.containerTitle, publisher: record.publisher,
    volume: record.volume, issue: record.issue, page: record.pages || record.articleNumber,
    edition: record.edition, DOI: id("doi"), ISBN: id("isbn"), PMID: id("pmid"), PMCID: id("pmcid"),
    URL: record.locations.find(item => ["publisher", "repository"].includes(item.kind))?.url || id("url")
  }).filter(([, value]) => value));
}
