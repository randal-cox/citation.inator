// src/import-display.mjs
var readableImportSource = (source) => source.replace(/data:image\/[a-z0-9.+-]+;base64,[A-Za-z0-9+/=]+/giu, "[embedded image]");

// src/import-limits.mjs
var IMPORT_LIMITS = Object.freeze({ sourceCharacters: 15e5, fileBytes: 18e6, recordCharacters: 3e5, requestBytes: 12e6, references: 300, citationGroups: 300, citedItems: 900, candidateChoices: 3e3, parallelLookups: 4, titleCharacters: 1500, authorsPerRecord: 150, pdfPages: 500, archiveEntryBytes: 24e6 });
function normalizeImportLimits(overrides = {}) {
  if (!overrides || typeof overrides !== "object" || Array.isArray(overrides)) throw new TypeError("Supply an import limits object.");
  for (const [key, value] of Object.entries(overrides)) if (!Object.hasOwn(IMPORT_LIMITS, key) || !Number.isSafeInteger(value) || value < 1) throw new TypeError("Use positive integer values for known import limits.");
  return Object.freeze({ ...IMPORT_LIMITS, ...overrides });
}

// src/records.mjs
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
function localRecordId(prefix, key) {
  let hash = 14695981039346656037n;
  for (const byte of new TextEncoder().encode(key)) hash = BigInt.asUintN(64, (hash ^ BigInt(byte)) * 1099511628211n);
  return `${prefix}-${hash.toString(16)}`;
}
var identifierKey = ({ scheme, value }) => `${scheme}:${value}`;
function canonicalIdentifierKey(identifier) {
  const { scheme, value } = identifier;
  if (scheme !== "isbn" || !validISBN10(value)) return identifierKey(identifier);
  const stem = "978" + value.slice(0, -1);
  return `isbn:${stem}${isbn13CheckDigit(stem)}`;
}
function dateParts(value) {
  if (!Array.isArray(value) || !value.length || value.length > 3 || !value.every(Number.isInteger)) return null;
  const [year2, month = 1, day = 1] = value;
  if (year2 < 1e3 || year2 > 9999 || month < 1 || month > 12 || day < 1 || day > new Date(Date.UTC(year2, month, 0)).getUTCDate()) return null;
  return [...value];
}
function stamp(value) {
  const date2 = cleanText(value);
  return date2 && Number.isFinite(Date.parse(date2)) ? new Date(date2).toISOString() : null;
}
function normalizeTextParts(parts) {
  return (Array.isArray(parts) ? parts : []).flatMap((part) => {
    if (typeof part?.text !== "string" || !part.text) return [];
    const href = httpsURL(part.href);
    return [{ text: part.text, ...["italic", "bold"].includes(part.emphasis) && { emphasis: part.emphasis }, ...href && { href } }];
  });
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
  const citationParts = normalizeTextParts(input.citationParts);
  const abstract = cleanText(input.abstract?.text);
  const abstractSource = cleanText(input.abstract?.source);
  const optional = ["inlineAuthor", "jurisdiction", "number", "session", "legalCitation"];
  const originalIssued = dateParts(input.originalIssued);
  const state = ["resolved", "partial", "unresolved"].includes(input.state) ? input.state : "unresolved";
  const textFields = ["containerTitle", "publisher", "volume", "issue", "pages", "articleNumber", "edition", "publisherPlace", "containerAbbreviation", "apaTitle", "original", "note", "citationText", "medium", "dimensions", "holdingInstitution", "accession", "platform", "rightsHolder", "creatorAttribution", "displayDate"];
  return {
    id: input.id.trim(),
    type: kinds.has(input.type) ? input.type : "document",
    state: title ? state : state === "partial" && citationParts.length ? "partial" : "unresolved",
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
    citationParts,
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

// src/identifier-resolver.mjs
var NEGATIVE_TTL = 5 * 6e4;

// src/crossref.mjs
var CROSSREF = "Crossref";
var crossrefType = (type) => ({
  "journal-article": "article-journal",
  book: "book",
  "book-chapter": "chapter",
  dissertation: "thesis",
  "posted-content": "article",
  dataset: "dataset",
  report: "report"
})[type] || "document";
var date = (item) => dateParts(item?.["date-parts"]?.[0]);
function crossrefRecord(raw, identifier, retrievedAt, url) {
  const message = raw?.message;
  const actual = normalizeIdentifier(`doi:${cleanText(message?.DOI)}`);
  if (!actual || identifierKey(actual) !== identifierKey(identifier)) throw new Error("Crossref returned a different or missing DOI.");
  const authors = Array.isArray(message.author) ? message.author.map((author) => ({
    family: cleanText(author?.family),
    given: cleanText(author?.given),
    literal: cleanText(author?.name)
  })).filter((author) => author.family || author.literal) : [];
  const title = Array.isArray(message.title) ? cleanText(message.title[0]) : "";
  const online = date(message["published-online"]);
  const print = date(message["published-print"]);
  const issued = print || date(message.issued) || online;
  const updates = Array.isArray(message["update-to"]) ? message["update-to"] : [];
  const notice = updates.find((item) => ["retraction", "correction", "expression-of-concern"].includes(item?.type));
  return normalizeRecord({
    id: localRecordId("crossref", identifierKey(identifier)),
    title,
    authors,
    issued,
    online,
    print,
    identifiers: [identifier],
    type: crossrefType(message.type),
    state: title && authors.length && issued ? "resolved" : "partial",
    version: message.type === "posted-content" && message.subtype === "preprint" ? "preprint" : null,
    publisher: message.publisher,
    containerTitle: Array.isArray(message["container-title"]) ? message["container-title"][0] : "",
    volume: message.volume,
    issue: message.issue,
    pages: message.page,
    articleNumber: message["article-number"],
    retrievedAt,
    locations: [{ kind: "publisher", provider: CROSSREF, url: message.resource?.primary?.URL }],
    provenance: [{ provider: CROSSREF, url, retrievedAt, note: notice ? "Update relation retained in raw metadata. This record may describe the notice itself." : "" }]
  });
}

// src/import-enrichment.mjs
function normalizeImportIdentifier(input) {
  const id = typeof input === "string" && normalizeIdentifier(/^[\dXx\s-]{10,30}$/.test(input) ? "isbn:" + input : input);
  return id && ["doi", "isbn", "url", "pmid", "pmcid", "arxiv"].includes(id.scheme) ? id : null;
}
function enrichmentIdentifier(input) {
  const id = normalizeImportIdentifier(input);
  return id && ["doi", "isbn"].includes(id.scheme) ? id : null;
}
var ENRICHMENT_POLICY = "exact-identity-v1";
var norm = (value) => String(value || "").normalize("NFKC").toLocaleLowerCase("en").replace(/[.,:;!?“”‘’"'()\[\]{}—–-]+/gu, " ").replace(/\s+/gu, " ").trim();
var present = (value) => Array.isArray(value) ? value.length > 0 : Boolean(value);
var initials = (value) => norm(value).split(" ").map((word) => word[0]).join("");
function authorEqual(a, b) {
  if (a.id && a.id !== b.id || norm(a.suffix) !== norm(b.suffix)) return false;
  if (a.literal || b.literal) return norm(a.literal || [a.given, a.family].filter(Boolean).join(" ")) === norm(b.literal || [b.given, b.family].filter(Boolean).join(" "));
  if (!a.family || norm(a.family) !== norm(b.family) || !a.given || !b.given) return false;
  const x = norm(a.given).split(" "), y = norm(b.given).split(" ");
  return initials(a.given) === initials(b.given) && x.length === y.length && x.every((word, i) => word === y[i] || word.length === 1 || y[i].length === 1);
}
function compareIdentity(source, candidate) {
  const comparisons = {
    title: present(source.title) && norm(source.title) === norm(candidate.title),
    authors: source.authorsComplete !== false && source.authors?.length > 0 && source.authors.length === candidate.authors?.length && source.authors.every((author, i) => authorEqual(author, candidate.authors[i])),
    year: Boolean(source.issued?.[0] && source.issued[0] === candidate.issued?.[0]),
    type: present(source.type) && source.type !== "document" && source.type === candidate.type && !candidate.version && !candidate.noticeRelations?.length
  };
  for (const key of ["containerTitle", "publisher", "volume", "issue", "pages", "articleNumber", "edition", "originalIssued", "language", "format"]) if (present(source[key])) comparisons[key] = present(candidate[key]) && norm(source[key]) === norm(candidate[key]);
  return { policy: ENRICHMENT_POLICY, comparisons, exact: Object.values(comparisons).every(Boolean) };
}
var editionQualifier = /\s*\((?:(?:\d+(?:st|nd|rd|th)?|first|second|third|fourth|revised|rev\.?|updated|expanded)\s+(?:ed\.?|edition)\b[^)]*|repr\.?|reprint(?:ed)?(?:\s+\d{4})?)\)\s*\.?$/iu;
function importSearchTitle(source) {
  const title = typeof source === "string" ? source : source?.title;
  return typeof title === "string" ? title.replace(editionQualifier, "").trim() : "";
}
function rankingAuthorEqual(a, b) {
  if (a.id && b.id && a.id !== b.id || a.suffix && b.suffix && norm(a.suffix) !== norm(b.suffix)) return false;
  if (authorEqual(a, b)) return true;
  const family = norm(a.family), otherFamily = norm(b.family);
  if (family && otherFamily) {
    if (family !== otherFamily) return false;
    const x = norm(a.given), y = norm(b.given);
    return !x || !y || initials(x) === initials(y) || x.startsWith(y + " ") || y.startsWith(x + " ");
  }
  const structured = family ? a : otherFamily ? b : null, literal = family ? b.literal : a.literal;
  if (!structured || !literal) return false;
  const name = norm(literal), surname = norm(structured.family);
  let given;
  if (name.endsWith(" " + surname)) given = name.slice(0, -surname.length).trim();
  else if (name.startsWith(surname + " ")) given = name.slice(surname.length).trim();
  else return false;
  const required = norm(structured.given);
  return !required || initials(required) === initials(given) || given.startsWith(required + " ") || required.startsWith(given + " ");
}
var publicationType = (type) => type === "book-chapter" ? "chapter" : ["book", "edited-book", "monograph", "reference-book"].includes(type) ? "book" : ["article-journal", "journal-article"].includes(type) ? "article-journal" : type;
var rankingTitle = (value) => norm(importSearchTitle(value));
function assessImportCandidate(source, candidate) {
  const strict = compareIdentity(source, candidate), conflicts = [], differences = [], missing = [], reasons = [];
  const title = rankingTitle(source.title), otherTitle = rankingTitle(candidate.title), a = new Set(title.split(" ").filter(Boolean)), b = new Set(otherTitle.split(" ").filter(Boolean));
  const overlap = [...a].filter((word) => b.has(word)).length, titleSimilarity = a.size && b.size ? overlap / Math.max(a.size, b.size) : 0;
  if (!title || !otherTitle) missing.push("title");
  else if (title !== otherTitle && titleSimilarity < 0.8) conflicts.push("title");
  else if (title !== otherTitle) differences.push("title");
  const authors = source.authors || [], otherAuthors = candidate.authors || [];
  let authorsMatch = false;
  if (!authors.length || !otherAuthors.length) missing.push("authors");
  else {
    authorsMatch = (source.authorsComplete === false ? otherAuthors.length >= authors.length : otherAuthors.length === authors.length) && authors.every((author, index) => rankingAuthorEqual(author, otherAuthors[index]));
    if (!authorsMatch) conflicts.push("authors");
  }
  const expectedType = publicationType(source.type === "document" && (present(source.edition) || editionQualifier.test(source.title || "")) ? "book" : source.type), actualType = publicationType(candidate.type);
  if (!expectedType || expectedType === "document" || !actualType || actualType === "document") missing.push("type");
  else if (expectedType !== actualType) conflicts.push("type");
  const sourceYear = source.issued?.[0], candidateYear = candidate.issued?.[0], yearDistance = sourceYear && candidateYear ? Math.abs(sourceYear - candidateYear) : null;
  if (sourceYear && !candidateYear) missing.push("year");
  else if (yearDistance) differences.push("year");
  for (const key of ["containerTitle", "publisher", "volume", "issue", "pages", "articleNumber", "edition", "originalIssued", "language", "format"]) {
    if (!present(source[key])) continue;
    if (!present(candidate[key])) missing.push(key);
    else if (norm(source[key]) !== norm(candidate[key])) (key === "originalIssued" ? conflicts : differences).push(key);
  }
  if (expectedType === "document" && actualType === "chapter") reasons.push("unconfirmed-chapter");
  if (candidate.version || candidate.noticeRelations?.length) {
    conflicts.push("version");
    reasons.push("version-or-notice");
  }
  if (conflicts.includes("authors")) reasons.push("different-authors");
  if (conflicts.includes("type")) reasons.push(actualType === "chapter" ? "different-work-type-chapter" : "different-work-type");
  if (conflicts.includes("title")) reasons.push("different-title");
  if (yearDistance > 2) reasons.push("distant-year");
  const primary = !conflicts.length && !reasons.includes("unconfirmed-chapter") && authorsMatch && titleSimilarity >= 0.8 && (yearDistance === null || yearDistance <= 2);
  const score = (primary ? 1e3 : 0) + (authorsMatch ? 200 : 0) + (expectedType && expectedType !== "document" && expectedType === actualType ? 100 : 0) + Math.round(titleSimilarity * 100) - (yearDistance === null ? 0 : Math.min(yearDistance, 100)) - conflicts.length * 100;
  return { policy: "candidate-ranking-v1", comparisons: strict.comparisons, exact: strict.exact, conflicts, differences, missing, reasons, primary, score, titleSimilarity, yearDistance };
}
function rankImportCandidates(source, candidates) {
  return candidates.map((candidate, index) => ({ candidate, assessment: assessImportCandidate(source, candidate), index })).sort((a, b) => b.assessment.score - a.assessment.score || a.index - b.index).map(({ candidate, assessment }) => ({ candidate, assessment }));
}
function automaticCandidate(source, candidates) {
  if (publicationType(source.type) === "book") return null;
  const identifier = (candidate) => {
    const id = candidate.identifiers?.[0];
    return id && normalizeIdentifier(id.scheme + ":" + id.value);
  };
  const valid = candidates.filter(identifier);
  const distinct = [...new Map(valid.map((candidate) => [canonicalIdentifierKey(identifier(candidate)), candidate])).values()];
  const exact = distinct.filter((candidate) => candidate.identifiers?.[0]?.scheme === "doi" && compareIdentity(source, candidate).exact);
  return exact.length === 1 && distinct.filter((candidate) => norm(candidate.title) === norm(source.title)).length === 1 ? exact[0] : null;
}
function mergeCompletion(source, candidate) {
  const fresh = normalizeRecord(candidate), next = { ...source };
  if (!fresh.identifiers.length) throw Error("Choose a valid identifier.");
  const conflicts = [];
  if (source.type === "document" && fresh.type !== "document") next.type = fresh.type;
  for (const key of ["title", "authors", "issued", "containerTitle", "publisher", "publisherPlace", "volume", "issue", "pages", "articleNumber", "edition", "version", "originalIssued"]) {
    if (present(next[key]) && present(fresh[key]) && JSON.stringify(next[key]) !== JSON.stringify(fresh[key])) conflicts.push(key);
    else if (!present(next[key]) && present(fresh[key])) next[key] = fresh[key];
  }
  next.identifiers = [...source.identifiers || [], ...fresh.identifiers];
  next.locations = [...source.locations || [], ...fresh.locations];
  next.provenance = [...source.provenance || [], ...fresh.provenance];
  return { record: normalizeRecord({ ...next, id: source.id, state: "partial" }), conflicts };
}
var usableRecord = (record) => record.title.length > 0 && record.title.length <= 1e3 && record.authors.length <= 50 && JSON.stringify(record).length <= 16e3;
var noticeRelations = (message) => (Array.isArray(message?.["update-to"]) ? message["update-to"] : []).filter((item) => ["correction", "retraction", "expression-of-concern"].includes(item?.type));
var year = (value) => {
  const years = String(value || "").match(/\b[1-9]\d{3}\b/g);
  return years?.length === 1 ? [Number(years[0])] : null;
};
function isbnRecord(raw, id, at, url) {
  const key = "ISBN:" + id.value, book = raw?.[key];
  if (!book) throw Error("No edition found for this ISBN.");
  const ids = [...book.identifiers?.isbn_13 || [], ...book.identifiers?.isbn_10 || []].map((value) => normalizeIdentifier("isbn:" + value)).filter(Boolean);
  if (!ids.some((value) => canonicalIdentifierKey(value) === canonicalIdentifierKey(id))) throw Error("The returned edition does not verify this ISBN.");
  return normalizeRecord({ id: localRecordId("lookup", canonicalIdentifierKey(id)), type: "book", state: "partial", title: [book.title, book.subtitle].filter(Boolean).join(": "), authors: (book.authors || []).map((author) => ({ literal: author.name })), issued: year(book.publish_date), publisher: book.publishers?.[0]?.name, identifiers: [id], locations: [{ kind: "library", url: book.url, provider: "Open Library" }], provenance: [{ provider: "Open Library", url, retrievedAt: at }] });
}
function createBrowserEnrichment({ fetch: request = globalThis.fetch, now = Date.now, sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms)), minInterval = 1100, timeout = 1e4 } = {}) {
  let generation = 0, retainedBytes = 0;
  const lanes = /* @__PURE__ */ new Map(), pending = /* @__PURE__ */ new Map(), cache = /* @__PURE__ */ new Map(), controllers = /* @__PURE__ */ new Set();
  async function json(url, token) {
    const parsed = new URL(url);
    if (!["https://api.crossref.org", "https://openlibrary.org"].includes(parsed.origin)) throw Error("Unsupported metadata provider.");
    const lane = lanes.get(parsed.origin) || { tail: Promise.resolve(), next: 0, pause: 0 };
    lanes.set(parsed.origin, lane);
    const task = lane.tail.then(async () => {
      if (token !== generation) throw Error("Lookup paused.");
      if (lane.pause > now()) throw Error("Provider rate limit. Retry later.");
      if (lane.next > now()) await sleep(lane.next - now());
      if (token !== generation) throw Error("Lookup paused.");
      lane.next = now() + minInterval;
      const controller = new AbortController();
      controllers.add(controller);
      const timer = setTimeout(() => controller.abort(), timeout);
      try {
        const response = await request(url, { headers: { Accept: "application/json" }, credentials: "omit", referrerPolicy: "no-referrer", redirect: "error", signal: controller.signal });
        if (response.status === 429 || response.status >= 500) {
          const value = response.headers.get("retry-after");
          const duration = value && /^\d+$/.test(value) ? Number(value) * 1e3 : Date.parse(value) - now();
          lane.pause = now() + Math.max(6e4, Number.isFinite(duration) ? duration : 6e4);
        }
        if (!response.ok) throw Error("Provider returned HTTP " + response.status + ".");
        const reader = response.body?.getReader();
        if (!reader) throw Error("Empty provider response.");
        let size = 0, text = "";
        const decoder = new TextDecoder();
        try {
          for (; ; ) {
            const { done, value } = await reader.read();
            if (done) break;
            size += value.length;
            if (size > 2e6) throw Error("Provider response is too large.");
            text += decoder.decode(value, { stream: true });
          }
          text += decoder.decode();
        } finally {
          await reader.cancel().catch(() => {
          });
          reader.releaseLock();
        }
        if (token !== generation) throw Error("Lookup paused.");
        retainedBytes += size;
        if (retainedBytes > 2e7) throw Error("Metadata session limit reached. Start a new import.");
        return JSON.parse(text);
      } finally {
        clearTimeout(timer);
        controllers.delete(controller);
      }
    });
    lane.tail = task.catch(() => {
    });
    return task;
  }
  async function search(source, kind, token) {
    if (kind === "both") {
      const results = await Promise.allSettled([search(source, "doi", token), search(source, "isbn", token)]), good = results.filter((result) => result.status === "fulfilled").map((result) => result.value), errors = results.filter((result) => result.status === "rejected").map((result) => result.reason.message);
      const candidates2 = good.flatMap((result) => result.candidates);
      if (errors.length && !candidates2.length) throw Error(errors.join(" "));
      return { candidates: candidates2, automatic: null, evidence: [...good.flatMap((result) => result.evidence), ...errors.map((error) => ({ error }))], policy: ENRICHMENT_POLICY, limited: true, partial: Boolean(errors.length) };
    }
    const at = new Date(now()).toISOString(), evidence = [];
    const get = async (url2) => {
      const raw2 = await json(url2, token);
      evidence.push({ provider: kind === "doi" ? "Crossref" : "Open Library", url: url2, retrievedAt: at, raw: raw2 });
      return raw2;
    };
    if (kind === "doi") {
      if (!source.title || !source.authors?.length) throw Error("Add a title and author in Raw Document, or paste an identifier.");
      const byline = source.authors.map((a) => a.literal || [a.family, a.given].filter(Boolean).join(" ")).join("; ");
      const params = new URLSearchParams({ "query.bibliographic": [source.title, byline, source.issued?.[0], source.containerTitle].filter(Boolean).join(". "), rows: "5" });
      const url2 = "https://api.crossref.org/works?" + params, raw2 = await get(url2);
      if (!Array.isArray(raw2?.message?.items)) throw Error("Invalid Crossref results.");
      const candidates2 = [], seen2 = /* @__PURE__ */ new Set();
      for (const item of raw2.message.items.slice(0, 5)) {
        const id = normalizeIdentifier("doi:" + item.DOI);
        if (!id || seen2.has(canonicalIdentifierKey(id))) continue;
        seen2.add(canonicalIdentifierKey(id));
        const record = { ...crossrefRecord({ message: item }, id, at, url2), noticeRelations: noticeRelations(item) };
        if (usableRecord(record)) candidates2.push(record);
      }
      if (raw2.message.items.length && !candidates2.length) throw Error("No usable Crossref metadata returned.");
      let automatic = automaticCandidate(source, candidates2);
      if (automatic) {
        const verified = await resolve(automatic.identifiers[0], token);
        evidence.push(...verified.evidence);
        const replaced = candidates2.map((candidate) => candidate === automatic ? verified.candidates[0] : candidate);
        automatic = automaticCandidate(source, replaced);
        return { candidates: replaced, automatic, evidence, policy: ENRICHMENT_POLICY };
      }
      return { candidates: candidates2, automatic: null, evidence, policy: ENRICHMENT_POLICY };
    }
    if (!source.title || !source.authors?.length) throw Error("Add a title and author in Raw Document, or paste an ISBN.");
    const author = source.authors[0].family || source.authors[0].literal;
    const url = "https://openlibrary.org/search.json?" + new URLSearchParams({ title: importSearchTitle(source), author, limit: "3", fields: "key,title,author_name" }), raw = await get(url);
    if (!Array.isArray(raw?.docs)) throw Error("Invalid Open Library results.");
    const candidates = [], seen = /* @__PURE__ */ new Set();
    for (const work of raw.docs.slice(0, 3)) {
      if (!/^\/works\/OL\d+W$/.test(work.key)) continue;
      const editionsURL = "https://openlibrary.org" + work.key + "/editions.json?limit=5", editions = await get(editionsURL);
      if (!Array.isArray(editions.entries)) throw Error("Invalid edition results.");
      for (const edition of editions.entries.slice(0, 5)) {
        if (!/^\/books\/OL\d+M$/.test(edition.key) || !edition.works?.some((value) => value.key === work.key)) continue;
        const ids = [...Array.isArray(edition.isbn_13) ? edition.isbn_13 : [], ...Array.isArray(edition.isbn_10) ? edition.isbn_10 : []].map((value) => normalizeIdentifier("isbn:" + value)).filter(Boolean);
        for (const id of ids) {
          const canonical = canonicalIdentifierKey(id);
          if (seen.has(canonical)) continue;
          seen.add(canonical);
          const record = normalizeRecord({ id: "lookup-" + candidates.length, type: "book", state: "partial", title: [edition.title, edition.subtitle].filter(Boolean).join(": "), authors: (work.author_name || []).map((name) => ({ literal: name })), issued: year(edition.publish_date), publisher: edition.publishers?.[0], identifiers: [id], locations: [{ kind: "library", url: "https://openlibrary.org" + edition.key, provider: "Open Library" }], edition: edition.edition_name, provenance: [{ provider: "Open Library", url: editionsURL, retrievedAt: at, note: "Authors from work; edition choice requires review. " + JSON.stringify({ edition: edition.edition_name, languages: edition.languages, format: edition.physical_format }) }] });
          if (!usableRecord(record)) continue;
          candidates.push({ ...record, edition: edition.edition_name || "", language: (edition.languages || []).map((value) => value.key).join(", "), format: edition.physical_format || "", editionKey: edition.key });
        }
      }
    }
    return { candidates: candidates.slice(0, 15), automatic: null, evidence, policy: ENRICHMENT_POLICY, limited: true };
  }
  async function resolve(id, token) {
    const at = new Date(now()).toISOString(), url = id.scheme === "doi" ? "https://api.crossref.org/works/" + encodeURIComponent(id.value) : "https://openlibrary.org/api/books?" + new URLSearchParams({ bibkeys: "ISBN:" + id.value, format: "json", jscmd: "data" }), raw = await json(url, token);
    const record = id.scheme === "doi" ? { ...crossrefRecord(raw, id, at, url), noticeRelations: noticeRelations(raw.message) } : isbnRecord(raw, id, at, url);
    if (!usableRecord(record)) throw Error("No usable metadata returned.");
    return { candidates: [record], automatic: null, evidence: [{ provider: id.scheme === "doi" ? "Crossref" : "Open Library", url, retrievedAt: at, raw }], policy: ENRICHMENT_POLICY };
  }
  return {
    cancel() {
      generation++;
      for (const controller of controllers) controller.abort();
      pending.clear();
    },
    reset() {
      this.cancel();
      cache.clear();
      retainedBytes = 0;
    },
    async lookup(source, { kind = "doi", identifier } = {}) {
      if (!["doi", "isbn", "both"].includes(kind)) throw Error("Choose DOI or ISBN search.");
      const token = generation, id = identifier && normalizeIdentifier(/^[\dXx\s-]{10,30}$/.test(identifier) ? "isbn:" + identifier : identifier);
      if (identifier && (!id || !["doi", "isbn"].includes(id.scheme))) throw Error("Paste a DOI or valid ISBN for metadata lookup.");
      const safe = Object.fromEntries(["title", "authors", "authorsComplete", "issued", "type", "containerTitle", "publisher", "volume", "issue", "pages", "articleNumber", "edition", "originalIssued", "language", "format"].map((key2) => [key2, source[key2]]));
      if (JSON.stringify(safe).length > 6e3) throw Error("Use shorter reference fields.");
      const key = JSON.stringify({ safe, kind, id, policy: ENRICHMENT_POLICY });
      if (cache.has(key)) return structuredClone(cache.get(key));
      if (pending.has(key)) return pending.get(key).then(structuredClone);
      if (pending.size >= 100) throw Error("Lookup queue is full.");
      const task = (id ? resolve(id, token) : search(safe, kind, token)).then((result) => {
        if (token !== generation) throw Error("Lookup paused.");
        if (cache.size >= 100) cache.delete(cache.keys().next().value);
        cache.set(key, result);
        return structuredClone(result);
      }).finally(() => {
        if (pending.get(key) === task) pending.delete(key);
      });
      pending.set(key, task);
      return task;
    }
  };
}
export {
  ENRICHMENT_POLICY,
  IMPORT_LIMITS,
  assessImportCandidate,
  automaticCandidate,
  compareIdentity,
  createBrowserEnrichment,
  enrichmentIdentifier,
  importSearchTitle,
  mergeCompletion,
  normalizeImportIdentifier,
  normalizeImportLimits,
  rankImportCandidates,
  readableImportSource
};
