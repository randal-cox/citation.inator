/*! citation-inator v0.1.2 | MIT | See LICENSE */

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

// src/records.mjs
var CACHE_SCHEMA = "citation-inator.cache.v1";
var cleanText = (value) => typeof value === "string" ? value.trim() : "";
var stableId = /^[a-z0-9][a-z0-9.-]{0,159}$/;
var doi = (value) => /^10\.\d{4,9}\/[^\s\u0000-\u001f\u007f<>{}]+$/iu.test(value) && !value.split("/").some((part) => part === "." || part === "..");
var kinds = /* @__PURE__ */ new Set(["article-journal", "book", "thesis", "article", "dataset", "software", "webpage", "report", "chapter", "legislation", "document"]);
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
function normalizeRecord(input) {
  if (!input || !stableId.test(cleanText(input.id))) throw new TypeError("A stable citation record ID is required.");
  const array = (value) => Array.isArray(value) ? value : [];
  const identifiers = /* @__PURE__ */ new Map();
  for (const item of array(input.identifiers)) {
    if (!item || typeof item.scheme !== "string" || typeof item.value !== "string") continue;
    const id = normalizeIdentifier(identifierKey(item));
    if (id && id.scheme !== "local") identifiers.set(identifierKey(id), id);
  }
  const authors = array(input.authors).flatMap((author) => {
    const literal = cleanText(author?.literal);
    const family = cleanText(author?.family);
    const given = cleanText(author?.given);
    const short = cleanText(author?.short);
    const suffix = cleanText(author?.suffix);
    return literal ? [{ literal, ...short && { short } }] : family ? [{ family, ...given && { given }, ...suffix && { suffix } }] : [];
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
      version: versions.has(location.version) ? location.version : null
    }];
  });
  const provenance = array(input.provenance).flatMap((source) => {
    const provider = cleanText(source?.provider);
    return provider ? [{
      provider,
      url: httpsURL(source.url),
      retrievedAt: stamp(source.retrievedAt),
      note: cleanText(source.note)
    }] : [];
  });
  const title = cleanText(input.title);
  const abstract = cleanText(input.abstract?.text);
  const abstractSource = cleanText(input.abstract?.source);
  const optional = ["inlineAuthor", "jurisdiction", "number", "session", "legalCitation"];
  const originalIssued = dateParts(input.originalIssued);
  const state = ["resolved", "partial", "unresolved"].includes(input.state) ? input.state : "unresolved";
  const textFields = ["containerTitle", "publisher", "volume", "issue", "pages", "articleNumber", "edition", "publisherPlace", "containerAbbreviation", "apaTitle", "original", "note", "citationText"];
  return {
    id: input.id.trim(),
    type: kinds.has(input.type) ? input.type : "document",
    state: title ? state : "unresolved",
    title,
    authors,
    identifiers: [...identifiers.values()],
    locations,
    provenance,
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

// src/compiler.mjs
var titleFor = (record) => record.title || record.original || "Unresolved citation";
var yearFor = (record) => record.issued?.[0] ?? "n.d.";
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
function defaultBibliography(record, suffix = "") {
  if (record.state === "unresolved") return titleFor(record);
  const year = yearFor(record);
  if (record.citationText && (!suffix || record.citationText.includes(` (${year}).`))) {
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
function styledBibliography(record, suffix, style) {
  const parts = [];
  const add = (text, emphasis) => parts.push(emphasis ? { text, emphasis } : { text });
  const { authors, containerTitle, volume, issue, publisher, publisherPlace, edition } = record;
  const title = style === "apa" && record.apaTitle || titleFor(record);
  const year = citationYear(record, suffix, style, true);
  const pages = record.pages || record.articleNumber;
  const url = identifierURL(record.identifiers.find((id) => ["doi", "url"].includes(id.scheme)));
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
  const apa = style === "apa";
  const names = authors.map(abbreviated);
  if (names.length) {
    const tail = names.at(-1);
    const byline = apa && names.length > 20 ? `${names.slice(0, 19).join(", ")}, \u2026 ${tail}` : names.length === 1 ? tail : `${names.slice(0, -1).join(", ")}${apa ? ", &" : " and"} ${tail}`;
    add(apa ? `${period(byline)} (${year}). ` : `${byline} (${year}) `);
  }
  if (containerTitle) {
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
  if (url) add(` ${apa ? "" : "Available at: "}${url}`);
  if (hasReprintDate(record)) add(` (Original work published ${originalYear(record)})`);
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
  if (style === "chicago-author-date") return chicagoBibliography(record, suffix);
  if (style !== "default") return styledBibliography(record, suffix, style);
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
function element(tag, text, parts) {
  const node = document.createElement(tag);
  if (text) node.textContent = text;
  if (parts) {
    node.dataset.citationPart = parts;
    node.className = partClassNames(defaultClassPrefix, parts).join(" ");
  }
  return node;
}
function iconControl(node, icon, label, tooltip = label) {
  node.dataset.citationPart = "icon";
  node.classList.add(`${defaultClassPrefix}-icon`);
  node.innerHTML = iconMarkup(icon);
  node.setAttribute("aria-label", label);
  node.title = tooltip;
  return node;
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
var CitationInspector = class _CitationInspector extends HTMLElement {
  static observedAttributes = ["activation", "panel-title", "panel-icon", "class-prefix", "access-providers", "hidden-access-providers", "hidden-providers", "evidence-title", "evidence-icon", "credit-title", "credit-icon"];
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
    this.#panelMenu.append(this.#panelMenuTrigger, movePanel);
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
  set cache(value) {
    const cache = readCache(value);
    this.#dismiss(false);
    this.#cache = cache;
    this.#hasInlineCache = true;
    if (this.isConnected) this.#enhance();
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
    if (name === "access-providers" || name === "hidden-access-providers" || name === "hidden-providers") {
      this.#orderEndnoteLinks();
      const record = this.#cache?.byId.get(this.#trigger?.dataset.ciRecord);
      if (record) {
        const focused = this.shadowRoot.activeElement;
        const restoreFocus = focused && this.#content.contains(focused);
        const actionName = focused?.getAttribute("aria-label");
        const href = focused?.getAttribute("href");
        const scroll = this.#dialog.scrollTop;
        this.#render(record, this.#trigger);
        this.#applyClassPrefix();
        if (restoreFocus) {
          const replacement = [...this.#content.querySelectorAll("a, button")].find(
            (node) => actionName ? node.getAttribute("aria-label") === actionName : href && node.getAttribute("href") === href
          );
          (replacement || this.#heading).focus({ preventScroll: true });
        }
        this.#dialog.scrollTop = scroll;
      }
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
      const trigger = event.target.closest?.(triggerSelector);
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
      const trigger = event.target.closest?.(triggerSelector);
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
      const trigger = event.target.closest?.(triggerSelector);
      if (!this.#enhanced.has(trigger) || event.defaultPrevented || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      event.preventDefault();
      this.#open(trigger);
    }, { signal });
    this.addEventListener("keydown", (event) => {
      const trigger = event.target.closest?.(triggerSelector);
      if (!this.#enhanced.has(trigger) || event.defaultPrevented || event.key !== " " && (event.key !== "Enter" || trigger.hasAttribute("href"))) return;
      event.preventDefault();
      if (!event.repeat) this.#open(trigger);
    }, { signal });
    this.ownerDocument.addEventListener("keydown", (event) => {
      if (event.defaultPrevented || event.key !== "Escape") return;
      this.#cancelHover();
      if (!this.#trigger) return;
      event.preventDefault();
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
    }, { signal });
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
      const target = event.composedPath();
      if (target.includes(this.#placement)) return;
      if (!target.includes(this.#panelMenu)) this.#panelMenu.open = false;
      if (!this.#trigger || this.#modal || target.includes(this) && (target.includes(this.#dialog) || target.some((node) => this.#enhanced.has(node)))) return;
      this.#dismiss(false);
    }, { signal });
    window.addEventListener("resize", () => this.#schedulePosition(), { signal });
    window.addEventListener("scroll", () => this.#schedulePosition(), { capture: true, passive: true, signal });
    window.visualViewport?.addEventListener("resize", () => this.#schedulePosition(), { signal });
    window.visualViewport?.addEventListener("scroll", () => this.#schedulePosition(), { signal });
    this.#panelSize = new ResizeObserver(() => this.#schedulePosition());
    this.#panelSize.observe(this.#dialog);
    this.#observer = new MutationObserver(() => {
      this.#applyClassPrefix();
      this.#enhance();
    });
    this.#observer.observe(this, { childList: true, subtree: true });
    this.#style.addEventListener("load", () => this.#enhance(), { signal });
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
    const lightParts = [...this.querySelectorAll(partSelector)].filter((node) => node.closest(componentName) === this);
    const configured = this.getAttribute("class-prefix");
    const compiled = lightParts[0]?.dataset.citationPrefix;
    const prefix = validClassPrefix(configured) ? configured : validClassPrefix(compiled) ? compiled : defaultClassPrefix;
    for (const node of [...lightParts, ...this.shadowRoot.querySelectorAll(partSelector)]) {
      const previous = this.#appliedPrefixes.get(node) || node.dataset.citationPrefix || defaultClassPrefix;
      if (previous === prefix) continue;
      const parts = node.dataset.citationPart;
      node.classList.remove(...partClassNames(previous, parts));
      node.classList.add(...partClassNames(prefix, parts));
      this.#appliedPrefixes.set(node, prefix);
    }
  }
  #annotationTarget(trigger) {
    const target = trigger.dataset.ciPanel && this.ownerDocument.getElementById(trigger.hash.slice(1));
    return target && this.contains(target) && target.matches('[data-citation-part~="annotation-content"], .ci-annotation-content') ? target : null;
  }
  #canOpen(trigger) {
    return this.#cache?.byId.has(trigger.dataset.ciRecord) || this.#annotationTarget(trigger);
  }
  #providerRank(provider) {
    const preferences = (this.getAttribute("access-providers") || "").split(",").map((name) => name.trim().toLowerCase());
    const index = preferences.indexOf(provider.toLowerCase());
    return index < 0 ? Infinity : index;
  }
  #providerHidden(provider) {
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
    if (!this.#style.sheet || typeof this.#dialog.showModal !== "function") return;
    for (const [trigger, attributes] of this.#enhanced) {
      if (this.contains(trigger) && this.#canOpen(trigger)) continue;
      if (trigger === this.#trigger) this.#dismiss(false);
      this.#restore(trigger, attributes);
    }
    for (const trigger of this.querySelectorAll(triggerSelector)) {
      if (trigger.closest(componentName) !== this || this.#enhanced.has(trigger) || !this.#canOpen(trigger)) continue;
      this.#enhanced.set(trigger, new Map(triggerAttributes.map((key) => [key, trigger.getAttribute(key)])));
      trigger.setAttribute("role", "button");
      if (!trigger.hasAttribute("href")) trigger.setAttribute("tabindex", "0");
      trigger.setAttribute("aria-haspopup", "dialog");
      trigger.setAttribute("aria-expanded", "false");
      if (!trigger.dataset.ciPanel) trigger.setAttribute("aria-label", trigger.dataset.ciInspectLabel || `Inspect citation: ${trigger.textContent.trim()}`);
    }
  }
  disconnectedCallback() {
    this.#dismiss(false);
    this.#listeners?.abort();
    this.#observer?.disconnect();
    this.#panelSize?.disconnect();
    for (const [trigger, attributes] of this.#enhanced) this.#restore(trigger, attributes);
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
    const record = this.#cache?.byId.get(trigger.dataset.ciRecord);
    if (!annotation && !record) return;
    const doc = this.ownerDocument;
    doc.querySelectorAll(componentName).forEach((component) => {
      if (component !== this && component instanceof _CitationInspector) component.#dismiss(false);
    });
    this.#dismiss(false);
    this.#trigger = trigger;
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
    if (restore && trigger.isConnected) trigger.focus();
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
    const bibliography = trigger.dataset.ciBibliography || bibliographyText(record);
    const badges = [record.integrity?.state, record.state === "unresolved" && "Unresolved"].filter(Boolean);
    if (badges.length) fragment.append(element("p", badges.join(" \xB7 "), record.integrity ? "badge integrity" : "badge"));
    const titleNode = element("h3", title);
    titleNode.dir = "auto";
    fragment.append(titleNode);
    const names = record.authors.map((author) => fullAuthorName(author));
    if (names.length) {
      const authors = element("p", names.join(", ") + (record.authorsComplete === false ? ", et al." : ""), "authors");
      authors.dir = "auto";
      fragment.append(names.length > 8 ? disclosure(record.authorsComplete === false ? "Show listed authors" : `Show all ${names.length} authors`, authors) : authors);
    }
    const doi2 = record.identifiers.find((item) => item.scheme === "doi");
    const doiURL = identifierURL(doi2);
    const citation = element("p", "", "citation");
    let parts;
    try {
      parts = JSON.parse(trigger.dataset.ciBibliographyParts || "null");
    } catch {
    }
    if (!Array.isArray(parts) || !parts.every((part) => typeof part?.text === "string") || parts.map((part) => part.text).join("") !== bibliography) parts = [{ text: bibliography }];
    let linkedDOI = false;
    for (const { text, emphasis, href } of parts) {
      const node = emphasis === "italic" ? element("em") : emphasis === "bold" ? element("strong") : citation;
      const doiAt = !linkedDOI && doiURL ? text.toLowerCase().indexOf(doiURL.toLowerCase()) : -1;
      const link = httpsURL(href);
      if (link) {
        node.append(external(link, text));
        if (link === doiURL) linkedDOI = true;
      } else if (doiAt < 0) node.append(text);
      else {
        const end = doiAt + doiURL.length;
        node.append(text.slice(0, doiAt), external(doiURL, text.slice(doiAt, end)), text.slice(end));
        linkedDOI = true;
      }
      if (node !== citation) citation.append(node);
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
    if (typeof this.institutionalURL === "function") destination(list, "Open library resolver", "library", this.#institutionalLink(record));
    if (record.integrity) destination(list, "Open status record", "status", record.integrity.url || location("status")?.url);
    const footer = element("footer", "", "panel-actions");
    const endnote = trigger.id && trigger.hash && this.ownerDocument.getElementById(trigger.hash.slice(1));
    if (endnote) {
      footer.append(action("Go to endnote", "endnote", () => {
        this.#dismiss(false);
        this.ownerDocument.defaultView.location.hash = trigger.hash;
        endnote.focus();
      }));
    }
    footer.append(action("Copy citation", "copy", () => this.#copy(bibliography)));
    const persistent = doi2 || record.identifiers[0];
    if (persistent) footer.append(action(`Copy ${persistent.scheme.toUpperCase()}`, "link", () => this.#copy(persistent.value)));
    if (typeof this.report === "function" || this.hasAttribute("data-report")) {
      footer.append(action("Report metadata", "status", () => {
        const payload = { record: structuredClone(record), page: this.ownerDocument.location.href, occurrence: trigger.id };
        this.dispatchEvent(new CustomEvent("citation-report", { detail: payload, bubbles: true, composed: true }));
        this.report?.(payload);
      }));
    }
    const toolbar = element("div", "", "panel-toolbar");
    if (list.childElementCount) toolbar.append(list);
    toolbar.append(footer);
    fragment.append(toolbar);
    this.#status.textContent = "";
    this.#content.replaceChildren(fragment);
  }
  #institutionalLink(record) {
    try {
      return httpsURL(this.institutionalURL(structuredClone(record)));
    } catch {
      return "";
    }
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
  creditIcon
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
  if (cache !== void 0) element2.cache = cache;
  return element2;
}
export {
  initializeCitationInspector
};
