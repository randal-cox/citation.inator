import { defaultClassPrefix, partClassNames, validateClassPrefix } from "./class-names.mjs";
import packageInfo from "../package.json" with { type: "json" };
import { iconMarkup } from "./icons.mjs";
import { canonicalIdentifierKey, fullAuthorName, httpsURL, identifierURL, localRecordId, normalizeIdentifier, normalizeRecord, readCache } from "./records.mjs";

const forms = new Set(["parenthetical", "narrative", "author-only", "suppress-author", "suppress-year"]);
const parentheticalForms = new Set(["parenthetical", "suppress-author", "suppress-year"]);
const annotationNames = { evidence: "Citation evidence", credit: "Citation credit" };
const split = (value, separator) => {
  const parts = [""];
  for (const [token] of value.matchAll(/\\.|"[^"\\]*(?:\\.[^"\\]*)*"|./gu)) {
    if (token === separator) parts.push("");
    else parts[parts.length - 1] += token;
  }
  return parts.map(part => part.trim());
};
const unescape = value => value.replace(/\\([\\{};|"])/g, "$1");
export const escapeHTML = value => String(value).replace(/[&<>"']/g, character => ({
  "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
})[character]);

function parseItem(text) {
  const [key, ...options] = split(text, "|");
  const identifier = normalizeIdentifier(unescape(key));
  if (!identifier) return null;
  let form = "parenthetical";
  let label = "";
  let hint = "";
  const affixes = {};
  let formSpecified = false;
  let isolated = false;
  for (const option of options) {
    if (option === "isolated") {
      if (isolated) return null;
      isolated = true;
    } else if (option.startsWith("form:")) {
      const requested = option.slice(5).trim();
      if (formSpecified || !forms.has(requested)) return null;
      form = requested;
      formSpecified = true;
    } else if (option.startsWith("label:")) {
      const match = /^label:\s*"((?:\\.|[^"\\])+)"$/.exec(option);
      if (label || !match) return null;
      label = unescape(match[1]).trim();
      if (!label) return null;
    } else if (/^(prefix|locator):/.test(option)) {
      const colon = option.indexOf(":");
      const field = option.slice(0, colon);
      const raw = option.slice(colon + 1).trim();
      const quoted = /^"((?:\\.|[^"\\])+)"$/.exec(raw);
      if (!raw || Object.hasOwn(affixes, field) || (raw.startsWith('"') && !quoted)) return null;
      affixes[field] = unescape(quoted ? quoted[1] : raw).trim();
      if (!affixes[field]) return null;
    } else if (option && !hint) hint = unescape(option);
    else return null;
  }
  return { identifier, form, label, hint, ...(isolated && { isolated }), ...affixes };
}

function validateKeyword(citationKeyword) {
  if (typeof citationKeyword !== "string" || !/^[a-z][a-z0-9-]{0,31}$/.test(citationKeyword)) {
    throw new TypeError("Use a lowercase citation keyword.");
  }
}

function parseEndnotes(body, raw) {
  const [, ...options] = split(body, "|");
  const token = { type: "endnotes", raw };
  for (const option of options) {
    if (option === "scope:since-last" && !token.scoped) token.scoped = true;
    else if (option === "heading:none" && token.heading === undefined) token.heading = null;
    else {
      const heading = /^heading:\s*"((?:\\.|[^"\\])+)"$/.exec(option);
      const level = /^level:\s*([1-6])$/.exec(option);
      if (heading && heading[1].trim() && token.heading === undefined) token.heading = unescape(heading[1]).trim();
      else if (level && token.level === undefined) token.level = Number(level[1]);
      else return { type: "text", text: raw, malformed: true };
    }
  }
  return token;
}

export function parseDirectives(source, { citationKeyword = "citation" } = {}) {
  validateKeyword(citationKeyword);
  const directive = new RegExp(String.raw`\\[\\{}]|\{endnotes\}|\{(${citationKeyword}|cite)[ \t]+((?:\\[^\n]|"[^"\\\n]*(?:\\.[^"\\\n]*)*"|[^"{}\\\n])+)\}`, "g");
  const tokens = [];
  let cursor = 0;
  for (const match of source.matchAll(directive)) {
    if (match.index > cursor) tokens.push({ type: "text", text: source.slice(cursor, match.index) });
    const raw = match[0];
    cursor = match.index + raw.length;
    if (raw.startsWith("\\")) tokens.push({ type: "text", text: raw.slice(1) });
    else if (raw === "{endnotes}") tokens.push({ type: "endnotes", raw });
    else if (match[1] === citationKeyword && /^endnote(?:\s*\||$)/.test(match[2].trim())) {
      tokens.push(parseEndnotes(match[2], raw));
    } else if (match[1] === citationKeyword && /^(?:list|nocite)[ \t]/.test(match[2].trim())) {
      const [, type, body] = /^(list|nocite)\s+(.+)$/.exec(match[2].trim()) || [];
      const [keys, ...options] = split(body || "", "|");
      const sort = options[0]?.match(/^sort:(author|year)$/)?.[1];
      const identifiers = split(keys, ";").map(key => normalizeIdentifier(unescape(key)));
      if (identifiers.every(Boolean) && (!options.length || type === "list" && options.length === 1 && sort)) {
        tokens.push({ type, items: identifiers.map(identifier => ({ identifier })), sort, raw });
      } else tokens.push({ type: "text", text: raw, malformed: true });
    }
    else if (match[1] === citationKeyword && Object.hasOwn(annotationNames, match[2].trim())) {
      tokens.push({ type: "annotation", name: match[2].trim(), raw });
    } else {
      const items = split(match[2], ";").map(parseItem);
      if (items.every(Boolean) && (items.length === 1 || items.every(item => parentheticalForms.has(item.form)))) {
        tokens.push({ type: "citation", items, raw });
      } else tokens.push({ type: "text", text: raw, malformed: true });
    }
  }
  if (cursor < source.length) tokens.push({ type: "text", text: source.slice(cursor) });
  return tokens;
}

const name = author => author.literal || author.family;
const sortName = record => (record.type === "legislation" ? record.title : record.authors.map(name).join("\u001f")) || record.title || record.original;
const compare = (a, b) => {
  const left = a.normalize("NFKC").toLowerCase();
  const right = b.normalize("NFKC").toLowerCase();
  return left < right ? -1 : left > right ? 1 : 0;
};
const titleFor = record => record.title || record.original || "Unresolved citation";
const shortTitle = record => titleFor(record).split(/[:;]/, 1)[0];
const yearFor = record => record.issued?.[0] ?? "n.d.";
const suffixFor = (year, suffix, style) => style === "apa" && year === "n.d." && suffix ? `-${suffix}` : suffix;
const originalYear = record => record.originalIssued?.[0];
const hasReprintDate = record => originalYear(record) < record.issued?.[0];
const bibliographyYear = (record, style) =>
  (style === "chicago-author-date" && hasReprintDate(record) ? originalYear(record) : record.issued?.[0]) ?? 0;
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
const suffixAt = index => index < 26 ? String.fromCharCode(97 + index) : suffixAt(Math.floor(index / 26) - 1) + suffixAt(index % 26);

export function authorLabel(record, narrative = false) {
  const names = record.authors.map(name);
  if (!names.length) return titleFor(record);
  if (names.length === 1) return names[0];
  if (names.length === 2) return names.join(narrative ? " and " : " & ");
  return `${names[0]} et al.`;
}

function defaultBibliography(record, suffix = "") {
  if (record.state === "unresolved") return titleFor(record);
  const year = yearFor(record);
  if (record.citationText && (!suffix || record.citationText.includes(` (${year}).`))) {
    return record.citationText.replace(` (${year}).`, ` (${year}${suffix}).`);
  }
  const names = record.authors.map(author => {
    if (author.literal) return author.literal;
    const initials = author.given?.match(/\p{L}[\p{L}\p{M}]*/gu)?.map(part => `${[...part][0]}.`).join(" ");
    return [author.family, initials, author.suffix].filter(Boolean).join(", ");
  });
  const authors = names.length > 1 ? `${names.slice(0, -1).join(", ")}, & ${names.at(-1)}` : names[0];
  const journal = [record.containerTitle, record.volume + (record.issue ? `(${record.issue})` : ""), record.pages || record.articleNumber].filter(Boolean).join(", ");
  const source = record.identifiers.find(id => id.scheme === "doi");
  const details = [journal || record.publisher, identifierURL(source)].filter(Boolean);
  return [
    authors ? `${authors} (${year}${suffix}). ${titleFor(record)}.` : `${titleFor(record)}. (${year}${suffix}).`,
    ...details.map(item => item.startsWith("https://") ? item : `${item}.`)
  ].join(" ");
}

function chicagoBibliography(record, suffix) {
  const { authors, type, containerTitle, publisher, edition } = record;
  if (type === "legislation") {
    const citation = [record.legalCitation || [record.number, record.session].filter(Boolean).join(", "), record.jurisdiction].filter(Boolean);
    const url = identifierURL(record.identifiers.find(item => item.scheme === "url"));
    return [{ text: `${titleFor(record)}. ${yearFor(record)}${suffix}.${citation.length ? ` ${citation.join(", ")}.` : ""}${url ? ` ${url}` : ""}` }];
  }
  const parts = [];
  const add = (text, emphasis) => parts.push(emphasis ? { text, emphasis } : { text });
  if (authors.length) {
    const names = authors.slice(0, authors.length > 6 ? 3 : 6).map((author, index) => fullAuthorName(author, index === 0));
    const head = names.slice(0, -1).join(", ");
    const byline = names.length === 1 ? names[0]
      : authors.length > 6 ? `${names.join(", ")}, et al`
      : `${head}${names.length > 2 ? "," : ""} and ${names.at(-1)}`;
    add(`${byline}. ${citationYear(record, suffix, "chicago-author-date", true)}. `);
  }
  const title = titleFor(record);
  const quoted = ["article-journal", "article", "chapter", "webpage", "thesis"].includes(type);
  if (quoted) add(`“${title}${/[.?!]$/.test(title) ? "" : "."}”`);
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
  const url = identifierURL(record.identifiers.find(item => item.scheme === "doi" || item.scheme === "url"));
  if (url) add(` ${url}`);
  return parts;
}

const citationStyles = new Set(["default", "chicago-author-date", "apa", "mla", "harvard", "vancouver"]);

function styledBibliography(record, suffix, style) {
  const parts = [];
  const add = (text, emphasis) => parts.push(emphasis ? { text, emphasis } : { text });
  const { authors, containerTitle, volume, issue, publisher, publisherPlace, edition } = record;
  const title = style === "apa" && record.apaTitle || titleFor(record);
  const year = citationYear(record, suffix, style, true);
  const pages = record.pages || record.articleNumber;
  const url = identifierURL(record.identifiers.find(id => ["doi", "url"].includes(id.scheme)));
  const initials = (given, separator = ". ") => (given?.match(/\p{L}[\p{L}\p{M}]*/gu) || [])
    .map(word => [...word][0]).join(separator);
  const abbreviated = author => author.literal || [author.family, author.given && `${initials(author.given)}.`, author.suffix].filter(Boolean).join(", ");
  const period = text => /[.?!]$/.test(text) ? text : `${text}.`;
  const locator = pages && `${/[-–—]/.test(pages) ? "pp." : "p."} ${pages}`;
  if (style === "vancouver") {
    const ordinal = { II: "2nd", III: "3rd", IV: "4th", V: "5th", VI: "6th", VII: "7th", VIII: "8th", IX: "9th", X: "10th" };
    const names = authors.slice(0, 6).map(author => author.literal ||
      [author.family, initials(author.given, ""), Object.hasOwn(ordinal, author.suffix) ? ordinal[author.suffix] : author.suffix?.replace(/\.$/, "")].filter(Boolean).join(" "));
    if (names.length) add(`${names.join(", ")}${authors.length > 6 ? ", et al" : ""}. `);
    add(period(title));
    if (containerTitle) {
      const journal = period(record.containerAbbreviation || containerTitle);
      const issueText = issue ? `(${issue})` : "";
      add(` ${journal} ${year}${volume || issue ? `;${volume}${issueText}` : ""}${pages ? `:${pages}` : ""}.`);
    } else {
      if (edition) add(` ${period(edition)}`);
      add(` ${publisherPlace || "[place unknown]"}: ${publisher || "[publisher unknown]"}; ${year}.`);
    }
    const doi = record.identifiers.find(item => item.scheme === "doi");
    if (doi) add(` doi: ${doi.value}`);
    if (hasReprintDate(record)) add(` Originally published ${originalYear(record)}.`);
    return parts;
  }
  if (style === "mla") {
    if (authors.length) {
      const byline = fullAuthorName(authors[0], true);
      add(`${byline}${authors.length > 2 ? ", et al" : authors.length === 2 ? `, and ${fullAuthorName(authors[1])}` : ""}. `);
    }
    if (containerTitle) {
      add(`“${period(title)}” `);
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
    const byline = apa && names.length > 20 ? `${names.slice(0, 19).join(", ")}, … ${tail}` :
      names.length === 1 ? tail : `${names.slice(0, -1).join(", ")}${apa ? ", &" : " and"} ${tail}`;
    add(apa ? `${period(byline)} (${year}). ` : `${byline} (${year}) `);
  }
  if (containerTitle) {
    add(apa ? `${period(title)} ` : `‘${title}’, `);
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
    const text = record.citationParts.map(part => part.text).join("");
    const at = text.indexOf(marker);
    if (at >= 0) {
      const insertion = at + marker.indexOf(year) + year.length;
      let offset = 0;
      return record.citationParts.map(part => {
        const local = insertion - offset;
        offset += part.text.length;
        return local > 0 && local <= part.text.length
          ? { ...part, text: part.text.slice(0, local) + suffixFor(year, suffix, style) + part.text.slice(local) } : part;
      });
    }
  }
  if (style === "chicago-author-date") return chicagoBibliography(record, suffix);
  if (style !== "default") return styledBibliography(record, suffix, style);
  const text = defaultBibliography(record, suffix) + (hasReprintDate(record) ? ` (Original work published ${originalYear(record)})` : "");
  const title = record.containerTitle || (["book", "report", "thesis"].includes(record.type) ? record.title : "");
  const at = title ? text.toLowerCase().lastIndexOf(title.toLowerCase()) : -1;
  return at < 0 ? [{ text }] : [
    { text: text.slice(0, at) }, { text: text.slice(at, at + title.length), emphasis: "italic" },
    { text: text.slice(at + title.length) }
  ];
}

export function bibliographyText(record, suffix = "", style = "default") {
  return bibliographyParts(record, suffix, style).map(part => part.text).join("");
}

const nameKey = value => (value || "").normalize("NFKC").toLowerCase();
const identity = author => author.id
  ? JSON.stringify([author.id])
  : JSON.stringify([author.literal, author.family, author.given, author.suffix].map(nameKey));

function styleAuthor(record, style, narrative = false, shared = new Map()) {
  if (record.inlineAuthor) return record.inlineAuthor;
  if (record.type === "legislation") return titleFor(record);
  if (style === "chicago-author-date" && record.authors.length) {
    const names = record.authors.map(author => {
      if (author.literal) return author.short || author.literal;
      const initials = author.given?.match(/\p{L}[\p{L}\p{M}]*/gu)?.map(word => `${[...word][0]}.`).join(" ");
      return shared.get(nameKey(author.family))?.has(identity(author)) && initials ? `${initials} ${author.family}` : author.family;
    });
    return names.length > 2 ? `${names[0]} et al.` : names.join(" and ");
  }
  if (style === "harvard" && record.authors.length === 3) {
    const [first, second, third] = record.authors.map(name);
    return `${first}, ${second} and ${third}`;
  }
  return authorLabel(record, narrative || ["chicago-author-date", "harvard", "mla"].includes(style));
}

function pageLocator(item, style) {
  let location = item.locator;
  if (["apa", "harvard", "vancouver"].includes(style) && /^\d+(?:\s*[-–—]\s*\d+)?$/.test(location || "")) {
    location = `${/[-–—]/.test(location) ? "pp." : "p."} ${location}`;
  }
  return location ? `, ${location}` : "";
}

function inlineText({ record, suffix, number, titleLabel, chicagoAuthor }, item, style, reprintYear) {
  if (item.label) return item.label;
  const qualify = text => `${item.prefix ? item.prefix + " " : ""}${text}`;
  if (style === "vancouver") return qualify(`${number}${pageLocator(item, style)}`);
  if (record.state === "unresolved") return qualify(item.hint || "Unresolved citation");
  const year = citationYear(record, suffix, style, false, reprintYear);
  let author = chicagoAuthor ?? styleAuthor(record, style, item.form !== "parenthetical");
  if (style === "mla") {
    const location = [titleLabel, item.locator].filter(Boolean).join(" ");
    if (item.form === "suppress-author") return qualify(location || shortTitle(record));
    if (item.form === "narrative") return qualify(location ? `${author} (${location})` : author);
    if (titleLabel) author = record.authors.length ? `${author}, ${titleLabel}` : titleLabel;
    return qualify([author, item.form !== "author-only" && item.locator].filter(Boolean).join(" "));
  }
  const locator = pageLocator(item, style);
  if (item.form === "narrative") return qualify(`${author} (${year}${locator})`);
  if (item.form === "suppress-author") return qualify(year + locator);
  if (["author-only", "suppress-year"].includes(item.form)) return qualify(author + locator);
  const separator = style === "chicago-author-date" ? " " : ", ";
  return qualify(`${author}${separator}${year}${locator}`);
}

function iconLink(part, url, label, icon, title = label, attributes = "", text = "") {
  return `<a ${part("icon")} href="${escapeHTML(url)}" aria-label="${escapeHTML(label)}" title="${escapeHTML(title)}"${attributes}>${icon ? iconMarkup(icon) : escapeHTML(text)}</a>`;
}

function destinations(record, part) {
  const links = new Map();
  const services = new Map();
  const identifierIcons = { isbn: "book", pmid: "article", pmcid: "repository", arxiv: "external" };
  for (const id of record.identifiers) {
    const label = id.scheme === "isbn" ? "Look up ISBN" : id.scheme === "url" ? "Open source" : `Open ${id.scheme.toUpperCase()}`;
    links.set(identifierURL(id), { label, icon: identifierIcons[id.scheme] || "link", ...(id.scheme === "isbn" && { provider: "WorldCat" }) });
  }
  const kinds = {
    publisher: ["Open publisher page", "publisher"], repository: ["Open repository", "repository"],
    pdf: ["Download PDF", "pdf"], preprint: ["Open preprint", "pdf"], status: ["Open status record", "status"],
    "full-text": ["Read full text at", "article"], library: ["Find at", "library"]
  };
  for (const location of record.locations) {
    const [action, icon] = kinds[location.kind];
    if (["library", "full-text"].includes(location.kind)) {
      if (links.get(location.url)?.provider?.toLowerCase() === location.provider.toLowerCase()) links.delete(location.url);
      services.set(JSON.stringify([location.url, location.provider.toLowerCase()]), [
        location.url, { label: `${action} ${location.provider}`, icon, provider: location.provider }
      ]);
      continue;
    }
    if (links.has(location.url)) continue;
    const label = location.version ? `${action} (${location.version})` : action;
    links.set(location.url, { label, icon, download: location.kind === "pdf" || location.kind === "preprint" && /\.pdf(?:[?#]|$)/i.test(location.url) });
  }
  return [...links, ...services.values()].filter(([url]) => url).map(([url, { label, icon, download, provider }]) =>
    iconLink(part, url, label, icon, `${label}\n${url}`, ` target="_blank" rel="noopener noreferrer"${download ? ' download=""' : ""}${provider ? ` data-ci-access-provider="${escapeHTML(provider)}"` : ""}`)
  ).join("");
}

function occurrenceContext(block, index, item, record) {
  const nearby = offset => block[index + offset]?.type === "text" ? block[index + offset].text : "";
  const { leadingContext = "", trailingContext = "" } = block[index];
  const compact = text => text.replace(/\s+/g, " ").trim();
  const before = compact(leadingContext + nearby(-1));
  const after = compact(nearby(1) + trailingContext);
  const citation = item.label || (record.state === "unresolved" ? "Unresolved citation" : authorLabel(record));
  const lead = before.length > 72 ? `…${before.slice(-72).replace(/^\S+\s+/, "")}` : before;
  const tail = after.length > 36 ? `${after.slice(0, 36).replace(/\s+\S*$/, "")}…` : after;
  return [lead, `[${citation}]`, tail].filter(Boolean).join(" ").replace(/\s+([.,;:!?])/g, "$1");
}

function annotationContent(name, namespace, records, part) {
  let content;
  if (name === "credit") {
    const repository = httpsURL(packageInfo.repository.url.replace(/^git\+/, "").replace(/\.git$/, ""));
    const author = packageInfo.author;
    const citation = `Cox, R. (2026). citation.inator (Version ${packageInfo.version}) [Computer software]. ${repository}`;
    content = `<p>citation.inator · Portable Citation Inspector</p><p>The software uses the MIT license. Cited material retains its own terms.</p><h3>How to cite this software</h3><p>${escapeHTML(citation)}</p><p><a href="${escapeHTML(httpsURL(author.url))}">${escapeHTML(author.name)} (ORCID)</a> · <a href="${escapeHTML(repository)}">GitHub repository</a></p>`;
  } else {
    const sources = records.map(record => ({
      title: titleFor(record), state: record.state, identifiers: record.identifiers,
      ...(record.originalIssued && { issued: record.issued, originalIssued: record.originalIssued }),
      version: record.version, retrievedAt: record.retrievedAt, provenance: record.provenance,
      ...(record.note && { note: record.note })
    }));
    content = `<pre data-ci-evidence-details tabindex="0" aria-label="Source metadata">${escapeHTML(JSON.stringify(sources, null, 2))}</pre>`;
  }
  return `<section ${part("annotation-content")} id="${namespace}-${name}" tabindex="-1" aria-label="${annotationNames[name]}"><h2>${annotationNames[name]}</h2><div data-ci-annotation-body>${content}</div></section>`;
}

export function createCitationCompiler({ citationKeyword = "citation", classPrefix = defaultClassPrefix, ...defaults } = {}) {
  validateKeyword(citationKeyword);
  validateClassPrefix(classPrefix);
  return {
    parse: source => parseDirectives(source, { citationKeyword }),
    compile: (source, cache, options) => compileCitations(source, cache, { ...defaults, ...options, citationKeyword, classPrefix })
  };
}

export function compileCitations(source, cache, options = {}) {
  const { citationKeyword } = options;
  const paragraphs = Array.isArray(source) ? source : typeof source === "string" ? source.trim().split(/\r?\n(?:[ \t]*\r?\n)+/) : null;
  if (!paragraphs || !paragraphs.every(paragraph => typeof paragraph === "string")) throw new TypeError("Supply text or an array of paragraphs.");
  const blocks = paragraphs.map(block => parseDirectives(block, { citationKeyword }));
  return compileCitationBlocks(blocks, cache, options);
}

// The markup adapter supplies trusted markup tokens and text-node edits.
function safeFallback(value) {
  if (!value || /[\u0000-\u0020\u007f\\]/.test(value)) return "";
  const absolute = httpsURL(value);
  if (absolute) return absolute;
  if (value.startsWith("//") || /^[a-z][a-z0-9+.-]*:/i.test(value)) return "";
  return value;
}

function renderBibliographyPart({ text, emphasis, href }) {
  const escaped = escapeHTML(text);
  const formatted = emphasis === "italic" ? `<em>${escaped}</em>` : emphasis === "bold" ? `<strong>${escaped}</strong>` : escaped;
  return href ? `<a href="${escapeHTML(href)}" target="_blank" rel="noopener noreferrer">${formatted}</a>` : formatted;
}

export function compileCitationBlocks(blocks, cache, {
  namespace = "cit", classPrefix = defaultClassPrefix, citationStyle = "default",
  endnotesHeading = "Endnotes", markup = false, closingMarkup = "",
  references = "endnotes", isolatedHref, reprintYear = "both", suffixScope = "fragment"
} = {}) {
  if (!/^[a-z][a-z0-9-]{0,39}$/.test(namespace)) throw new TypeError("Use a stable lowercase document namespace.");
  validateClassPrefix(classPrefix);
  if (!citationStyles.has(citationStyle)) throw new TypeError("Unknown citation style.");
  if (typeof endnotesHeading !== "string" || !endnotesHeading.trim()) throw new TypeError("Supply a nonempty endnotes heading.");
  if (!["endnotes", "isolated"].includes(references)) throw new TypeError("Use endnotes or isolated references.");
  if (!["fragment", "cache"].includes(suffixScope)) throw new TypeError("Use fragment or cache for suffixScope.");
  if (!["original", "edition", "both"].includes(reprintYear)) throw new TypeError("Use original, edition, or both for reprintYear.");
  if (isolatedHref !== undefined && (typeof isolatedHref !== "string" || !safeFallback(isolatedHref.replaceAll("{id}", "record")))) {
    throw new TypeError("Use an HTTPS URL or a relative path for isolatedHref.");
  }
  const prefixAttribute = classPrefix === defaultClassPrefix ? "" : ` data-citation-prefix="${classPrefix}"`;
  const part = names => `class="${partClassNames(classPrefix, names).join(" ")}" data-citation-part="${names}"${prefixAttribute}`;
  const index = readCache(cache);
  const used = new Map();
  const diagnostics = [];
  const missing = new Map();
  const markerFor = block => {
    const tokens = block.filter(token => token.type !== "text" || token.text.trim());
    return tokens.length === 1 && tokens[0].type === "endnotes" ? tokens[0] : null;
  };
  const scoped = references !== "isolated" && blocks.some(block => markerFor(block)?.scoped);
  let scope = 0;
  let nextReferenceNumber = 1;
  const localEntries = new Map();
  const includeInNotes = (entry, scope) => {
    if (!localEntries.has(scope)) localEntries.set(scope, new Map());
    const local = localEntries.get(scope);
    if (!local.has(entry.record.id)) local.set(entry.record.id, []);
    return local.get(entry.record.id);
  };
  for (const block of blocks) {
    const marker = markerFor(block);
    if (scoped && marker) {
      marker.scope = scope++;
      continue;
    }
    for (const [indexInBlock, token] of block.entries()) {
      if (token.malformed) diagnostics.push({ state: "malformed", source: token.text });
      if (token.misplaced) diagnostics.push({ state: "misplaced-directive", source: token.text });
      if (!["citation", "list", "nocite"].includes(token.type)) continue;
      if (token.type === "list" && block.some(other => other !== token && (other.type !== "text" || other.text.trim()))) continue;
      for (const item of token.items) {
        const { identifier } = item;
        const key = canonicalIdentifierKey(identifier);
        let record = identifier.scheme === "local" ? index.byId.get(identifier.value) : index.byIdentifier.get(key);
        if (!record) {
          if (!missing.has(key)) {
            const base = localRecordId("missing", key);
            let id = base;
            let collision = 0;
            while (index.byId.has(id) || [...missing.values()].some(candidate => candidate.id === id)) id = `${base}-${++collision}`;
            missing.set(key, normalizeRecord({
              id, original: key, state: "unresolved",
              identifiers: [identifier], note: "No matching record."
            }));
          }
          record = missing.get(key);
        }
        if (record.state === "unresolved") diagnostics.push({ state: "unresolved", identifier: key });
        if (!used.has(record.id)) used.set(record.id, { record, occurrences: [], suffix: "" });
        const entry = used.get(record.id);
        item.entry = entry;
        item.scope = scope;
        const local = references !== "isolated" && !item.isolated && token.type !== "list";
        const occurrences = local ? includeInNotes(entry, scope) : null;
        if (local && !entry.number) entry.number = nextReferenceNumber++;
        if (token.type === "citation") {
          const occurrence = local ? `${namespace}-cite-${record.id}-${entry.occurrences.length + 1}` : null;
          const detail = { id: occurrence, context: occurrenceContext(block, indexInBlock, item, record), label: item.label };
          if (occurrence) entry.occurrences.push(detail);
          occurrences?.push(detail);
          item.occurrence = occurrence;
        }
      }
    }
  }

  const entries = [...used.values()];
  const referenceOrder = ({ record: a }, { record: b }) =>
    (a.state === "unresolved") - (b.state === "unresolved") ||
    compare(sortName(a), sortName(b)) ||
    bibliographyYear(a, citationStyle) - bibliographyYear(b, citationStyle) ||
    compare(titleFor(a), titleFor(b)) || compare(a.id, b.id);
  if (citationStyle !== "vancouver") entries.sort(referenceOrder);
  const numbering = suffixScope === "cache" && !["mla", "vancouver"].includes(citationStyle)
    ? [...index.byId.values()].map(record => used.get(record.id) || { record, suffix: "" }).sort(referenceOrder)
    : entries;
  const shared = new Map();
  if (citationStyle === "chicago-author-date") {
    const surnames = new Map();
    for (const { record } of numbering) {
      if (record.inlineAuthor || record.type === "legislation" || record.state === "unresolved") continue;
      const byline = record.authors.slice(0, record.authors.length > 2 ? 1 : 2);
      const bylineKey = JSON.stringify(byline.map(identity));
      for (const author of byline) {
        if (!author.family || !author.given) continue;
        const key = nameKey(author.family);
        if (!surnames.has(key)) surnames.set(key, { people: new Set(), bylines: new Set() });
        const entry = surnames.get(key);
        entry.people.add(identity(author));
        entry.bylines.add(bylineKey);
      }
    }
    for (const [surname, { people, bylines }] of surnames) {
      if (people.size > 1 && bylines.size > 1) shared.set(surname, people);
    }
  }
  const groups = new Map();
  for (const entry of entries) entry.number ??= nextReferenceNumber++;
  for (const entry of numbering) {
    const { record } = entry;
    if (record.state === "unresolved") continue;
    // The rendered author-year must also distinguish two different lists shortened to "et al."
    const label = styleAuthor(record, citationStyle, false, shared);
    if (citationStyle === "chicago-author-date") entry.chicagoAuthor = label;
    const key = JSON.stringify([label.normalize("NFKC").toLowerCase(), citationStyle === "mla" ? null : citationYear(record, "", citationStyle, false, reprintYear)]);
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key).push(entry);
  }
  for (const group of groups.values()) {
    if (group.length < 2) continue;
    if (citationStyle === "mla") {
      const titleCounts = new Map();
      const fullCounts = new Map();
      for (const { record } of group) {
        const short = shortTitle(record).toLowerCase();
        const full = titleFor(record).toLowerCase();
        titleCounts.set(short, (titleCounts.get(short) || 0) + 1);
        fullCounts.set(full, (fullCounts.get(full) || 0) + 1);
      }
      for (const entry of group) {
        const { record } = entry;
        const full = titleFor(record);
        const short = shortTitle(record);
        if (record.authors.length) entry.titleLabel = titleCounts.get(short.toLowerCase()) > 1 ? full : short;
        if (fullCounts.get(full.toLowerCase()) < 2) continue;
        const identifier = record.identifiers.find(item => ["isbn", "doi"].includes(item.scheme)) || record.identifiers[0];
        if (identifier) {
          entry.titleLabel = `${full}, ${identifier.scheme.toUpperCase()} ${identifier.value}`;
        } else if (entry.occurrences.some(occurrence => !occurrence.label)) {
          diagnostics.push({ state: "ambiguous-citation", record: record.id, message: "Supply a label to distinguish works with identical titles." });
        }
      }
    } else if (citationStyle !== "vancouver") {
      group.forEach((entry, index) => { entry.suffix = suffixAt(index); });
    }
  }

  const scopeName = scope => scope === 0 ? namespace : `${namespace}-scope-${scope + 1}`;
  const noteID = (record, scope) => `${scopeName(scope)}-note-${record.id}`;
  const bibliography = ({ record, suffix }) => bibliographyParts(record, suffix, citationStyle);
  const trigger = (item, label, inspectLabel) => {
    const { record } = item.entry;
    const parts = bibliography(item.entry);
    const text = parts.map(part => part.text).join("");
    const formatting = parts.some(part => part.emphasis || part.href) ? ` data-ci-bibliography-parts="${escapeHTML(JSON.stringify(parts))}"` : "";
    const fallback = isolatedHref && safeFallback(isolatedHref.replaceAll("{id}", encodeURIComponent(record.id))) ||
      record.identifiers.map(identifierURL).find(Boolean) || record.locations[0]?.url;
    const href = item.occurrence ? "#" + noteID(record, item.scope) : fallback;
    return `<a ${part("cite")}${item.occurrence ? ` id="${item.occurrence}"` : ""}${href ? ` href="${escapeHTML(href)}"` : ""} data-ci-record="${record.id}"${inspectLabel ? ` data-ci-inspect-label="${escapeHTML(inspectLabel)}" aria-label="${escapeHTML(inspectLabel)}"` : ""} data-ci-bibliography="${escapeHTML(text)}"${formatting} dir="auto">${escapeHTML(label)}</a>`;
  };

  function referencesHTML(items, scope, list = false, marker = {}) {
    const local = localEntries.get(scope);
    if (!items.length) return "";
    const heading = `${scopeName(scope)}-endnotes`;
    const rows = items.map(item => {
      const { record } = item.entry;
      const text = bibliography(item.entry).map(renderBibliographyPart).join("");
      const status = [record.state === "unresolved" ? "Unresolved" : "", record.integrity?.state].filter(Boolean).join(" · ");
      const links = destinations(record, part);
      const backlinks = (local?.get(record.id) || []).map(({ id, context }, index) => {
        const letter = suffixAt(index);
        const label = `Return to “${context}” (occurrence ${letter})`;
        return iconLink(part, `#${id}`, label, "", label, "", letter);
      }).join("");
      const controls = list ? trigger(item, "Inspect", "Inspect reference: " + titleFor(record)) + links
        : links + `<span ${part("backlinks")}>${backlinks}</span>`;
      const annotation = list && record.listAnnotationParts?.length
        ? `<p ${part("list-annotation")}>${record.listAnnotationParts.map(renderBibliographyPart).join("")}</p>` : "";
      const attrs = list ? ` data-ci-list-record="${record.id}"` : ` id="${noteID(record, scope)}" tabindex="-1"${citationStyle === "vancouver" && scoped ? ` value="${item.entry.number}"` : ""}`;
      return `<li${attrs}><span dir="auto">${text}</span>${status ? ` <strong ${part("note-status")}>${escapeHTML(status)}</strong>` : ""}${annotation}<div ${part("note-actions")}>${controls}</div></li>`;
    }).join("\n");
    if (list) return `<ol ${part("reference-list")}>${rows}</ol>`;
    const level = marker.level ?? 2;
    const label = marker.heading === null ? `aria-label="${escapeHTML(endnotesHeading)}"` : `aria-labelledby="${heading}"`;
    const title = marker.heading === null ? "" : `<h${level} id="${heading}">${escapeHTML(marker.heading ?? endnotesHeading)}</h${level}>`;
    return `<section ${part("endnotes")} ${label}>${title}<ol>${rows}</ol></section>`;

  }
  const scopeItems = scope => {
    const items = entries.filter(entry => localEntries.get(scope)?.has(entry.record.id));
    if (citationStyle === "vancouver") items.sort((a, b) => a.number - b.number);
    return items.map(entry => ({ entry }));
  };

  let emittedNotes = false;
  const annotations = new Set();
  const html = blocks.map(tokens => {
    const meaningful = tokens.filter(token => token.type !== "text" || token.text.trim());
    const marker = markerFor(tokens);
    if (marker && references === "isolated") return "";
    if (marker && (scoped || !emittedNotes)) {
      emittedNotes = true;
      return referencesHTML(scopeItems(marker.scope ?? 0), marker.scope ?? 0, false, marker);
    }
    if (meaningful.length === 1 && meaningful[0].type === "list") {
      const token = meaningful[0];
      const items = [...token.items];
      if (token.sort) items.sort(({ entry: a }, { entry: b }) => {
        const byAuthor = compare(sortName(a.record), sortName(b.record));
        const byYear = bibliographyYear(a.record, citationStyle) - bibliographyYear(b.record, citationStyle);
        return (token.sort === "author" ? byAuthor || byYear : byYear || byAuthor) || compare(titleFor(a.record), titleFor(b.record));
      });
      return referencesHTML(items, 0, true);
    }
    const content = tokens.map(token => {
      if (token.type === "text") return escapeHTML(token.text);
      if (token.type === "markup") return token.text;
      if (token.type === "nocite") return "";
      if (token.type === "endnotes" || token.type === "list") {
        diagnostics.push({ state: "misplaced-directive", source: token.raw });
        return escapeHTML(token.raw);
      }
      if (token.type === "annotation") {
        if (references === "isolated") return escapeHTML(annotationNames[token.name]);
        annotations.add(token.name);
        return `<a ${part("cite annotation")} href="#${namespace}-${token.name}" data-ci-panel="${token.name}">${annotationNames[token.name]}</a>`;
      }
      let previous;
      const citations = token.items.map(item => {
        const collapsible = current => current.entry.record.state !== "unresolved" && !current.label && !current.prefix && !current.locator;
        const sameAuthor = previous && item.form === "parenthetical" && previous.form === "parenthetical" &&
          item.entry.record.authors.length && JSON.stringify(item.entry.record.authors.map(identity)) === JSON.stringify(previous.entry.record.authors.map(identity)) &&
          item.entry.chicagoAuthor === previous.entry.chicagoAuthor;
        const joined = citationStyle === "chicago-author-date" && previous && collapsible(item) && collapsible(previous) &&
          (sameAuthor || item.form === "suppress-author" && previous.form === "suppress-author");
        const label = inlineText(item.entry, joined ? { ...item, form: "suppress-author" } : item, citationStyle, reprintYear);
        const separator = !previous ? "" : joined || citationStyle === "vancouver" ? ", " : "; ";
        previous = item;
        return separator + trigger(item, label);
      }).join("");
      const { label, form } = token.items[0];
      const parenthetical = token.items.length > 1 || !label && (citationStyle === "vancouver" || parentheticalForms.has(form));
      return parenthetical ? `<span ${part("cluster")}>(${citations})</span>` : citations;
    }).join("");
    return markup || !content.trim() ? content : `<p>${content}</p>`;
  }).join(markup ? "" : "\n");
  const records = entries.map(({ record }) => record);
  const supplementary = [...annotations].map(name => annotationContent(name, namespace, records, part));
  if ((scoped || !emittedNotes) && localEntries.get(scope)?.size) supplementary.unshift(referencesHTML(scopeItems(scope), scope));
  return {
    html: [html, ...supplementary].join("\n") + closingMarkup,
    cache: { schema: cache.schema, records },
    diagnostics
  };
}
