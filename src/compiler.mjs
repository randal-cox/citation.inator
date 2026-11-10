import { defaultClassPrefix, partClassNames, validateClassPrefix } from "./class-names.mjs";
import packageInfo from "../package.json" with { type: "json" };
import { iconMarkup } from "./icons.mjs";
import { identifierKey, identifierURL, localRecordId, normalizeIdentifier, normalizeRecord, readCache } from "./records.mjs";

const forms = new Set(["parenthetical", "narrative", "author-only", "suppress-author", "suppress-year"]);
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
  let formSpecified = false;
  for (const option of options) {
    if (option.startsWith("form:")) {
      const requested = option.slice(5).trim();
      if (formSpecified || !forms.has(requested)) return null;
      form = requested;
      formSpecified = true;
    } else if (option.startsWith("label:")) {
      const match = /^label:\s*"((?:\\.|[^"\\])+)"$/.exec(option);
      if (label || !match) return null;
      label = unescape(match[1]).trim();
      if (!label) return null;
    } else if (option && !hint) hint = unescape(option);
    else return null;
  }
  return { identifier, form, label, hint };
}

function validateKeyword(citationKeyword) {
  if (typeof citationKeyword !== "string" || !/^[a-z][a-z0-9-]{0,31}$/.test(citationKeyword)) {
    throw new TypeError("Use a lowercase citation keyword.");
  }
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
    else if (match[1] === citationKeyword && match[2].trim() === "endnote") tokens.push({ type: "endnotes", raw });
    else if (match[1] === citationKeyword && Object.hasOwn(annotationNames, match[2].trim())) {
      tokens.push({ type: "annotation", name: match[2].trim(), raw });
    } else {
      const items = split(match[2], ";").map(parseItem);
      if (items.every(Boolean) && (items.length === 1 || items.every(item => item.form === "parenthetical"))) {
        tokens.push({ type: "citation", items, raw });
      } else tokens.push({ type: "text", text: raw, malformed: true });
    }
  }
  if (cursor < source.length) tokens.push({ type: "text", text: source.slice(cursor) });
  return tokens;
}

const name = author => author.literal || author.family;
const sortName = record => record.authors.map(name).join("\u001f") || record.title || record.original;
const compare = (a, b) => {
  const left = a.normalize("NFKC").toLowerCase();
  const right = b.normalize("NFKC").toLowerCase();
  return left < right ? -1 : left > right ? 1 : 0;
};
const titleFor = record => record.title || record.original || "Unresolved citation";
const yearFor = record => record.issued?.[0] ?? "n.d.";
const suffixAt = index => index < 26 ? String.fromCharCode(97 + index) : suffixAt(Math.floor(index / 26) - 1) + suffixAt(index % 26);

export function authorLabel(record, narrative = false) {
  const names = record.authors.map(name);
  if (!names.length) return titleFor(record);
  if (names.length === 1) return names[0];
  if (names.length === 2) return names.join(narrative ? " and " : " & ");
  return `${names[0]} et al.`;
}

export function bibliographyText(record, suffix = "") {
  if (record.state === "unresolved") return titleFor(record);
  const year = yearFor(record);
  if (record.citationText && (!suffix || record.citationText.includes(` (${year}).`))) {
    return record.citationText.replace(` (${year}).`, ` (${year}${suffix}).`);
  }
  const names = record.authors.map(author => {
    if (author.literal) return author.literal;
    const initials = author.given?.match(/\p{L}[\p{L}\p{M}]*/gu)?.map(part => `${[...part][0]}.`).join(" ");
    return initials ? `${author.family}, ${initials}` : author.family;
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

function inlineText(record, item, suffix) {
  if (item.label) return item.label;
  if (record.state === "unresolved") return item.hint || "Unresolved citation";
  const year = yearFor(record) + suffix;
  const author = authorLabel(record, item.form !== "parenthetical");
  if (item.form === "narrative") return `${author} (${year})`;
  if (item.form === "suppress-author") return year;
  if (["author-only", "suppress-year"].includes(item.form)) return author;
  return `${author}, ${year}`;
}

function iconLink(part, url, label, icon, title = label, attributes = "") {
  return `<a ${part("icon")} href="${escapeHTML(url)}" aria-label="${escapeHTML(label)}" title="${escapeHTML(title)}"${attributes}>${iconMarkup(icon)}</a>`;
}

function destinations(record, part) {
  const links = new Map();
  const identifierIcons = { isbn: "book", pmid: "article", pmcid: "repository", arxiv: "external" };
  for (const id of record.identifiers) {
    const label = id.scheme === "isbn" ? "Look up ISBN" : id.scheme === "url" ? "Open source" : `Open ${id.scheme.toUpperCase()}`;
    links.set(identifierURL(id), { label, icon: identifierIcons[id.scheme] || "link" });
  }
  const kinds = {
    publisher: ["Open publisher page", "publisher"], repository: ["Open repository", "repository"],
    pdf: ["Download PDF", "pdf"], preprint: ["Open preprint", "pdf"], status: ["Open status record", "status"]
  };
  for (const location of record.locations) {
    if (links.has(location.url)) continue;
    const [action, icon] = kinds[location.kind];
    const label = location.version ? `${action} (${location.version})` : action;
    links.set(location.url, { label, icon, download: location.kind === "pdf" || location.kind === "preprint" && /\.pdf(?:[?#]|$)/i.test(location.url) });
  }
  return [...links].filter(([url]) => url).map(([url, { label, icon, download }]) =>
    iconLink(part, url, label, icon, `${label}\n${url}`, ` target="_blank" rel="noopener noreferrer"${download ? ' download=""' : ""}`)
  ).join("");
}

function occurrenceContext(block, index, item, record) {
  const nearby = offset => block[index + offset]?.type === "text" ? block[index + offset].text.replace(/\s+/g, " ").trim() : "";
  const before = nearby(-1);
  const after = nearby(1);
  const citation = item.label || (record.state === "unresolved" ? "Unresolved citation" : authorLabel(record));
  const lead = before.length > 72 ? `…${before.slice(-72).replace(/^\S+\s+/, "")}` : before;
  const tail = after.length > 36 ? `${after.slice(0, 36).replace(/\s+\S*$/, "")}…` : after;
  return [lead, `[${citation}]`, tail].filter(Boolean).join(" ").replace(/\s+([.,;:!?])/g, "$1");
}

function annotationContent(name, namespace, records, part) {
  let content;
  if (name === "credit") {
    const citation = `citation.inator contributors. (2026). citation.inator (Version ${packageInfo.version}) [Computer software].`;
    content = `<p>citation.inator · Portable Citation Inspector</p><p>The software uses the MIT license. Cited material retains its own terms.</p><h3>How to cite this software</h3><p>${escapeHTML(citation)}</p>`;
  } else {
    const sources = records.map(record => ({
      title: titleFor(record), state: record.state, identifiers: record.identifiers,
      version: record.version, retrievedAt: record.retrievedAt, provenance: record.provenance,
      ...(record.note && { note: record.note })
    }));
    const summary = records.length ? "Sources for the citations on this page." : "No citations on this page.";
    content = `<p data-ci-evidence-summary>${summary}</p><details><summary>Source metadata</summary><pre data-ci-evidence-details tabindex="0" aria-label="Source metadata">${escapeHTML(JSON.stringify(sources, null, 2))}</pre></details>`;
  }
  return `<section ${part("annotation-content")} id="${namespace}-${name}" tabindex="-1" aria-label="${annotationNames[name]}"><h2>${annotationNames[name]}</h2><div data-ci-annotation-body>${content}</div></section>`;
}

export function createCitationCompiler({ citationKeyword = "citation", classPrefix = defaultClassPrefix } = {}) {
  validateKeyword(citationKeyword);
  validateClassPrefix(classPrefix);
  return {
    parse: source => parseDirectives(source, { citationKeyword }),
    compile: (source, cache, options) => compileCitations(source, cache, { ...options, citationKeyword, classPrefix })
  };
}

export function compileCitations(source, cache, { namespace = "cit", citationKeyword = "citation", classPrefix = defaultClassPrefix } = {}) {
  if (!/^[a-z][a-z0-9-]{0,39}$/.test(namespace)) throw new TypeError("Use a stable lowercase document namespace.");
  validateClassPrefix(classPrefix);
  const prefixAttribute = classPrefix === defaultClassPrefix ? "" : ` data-citation-prefix="${classPrefix}"`;
  const part = names => `class="${partClassNames(classPrefix, names).join(" ")}" data-citation-part="${names}"${prefixAttribute}`;
  const index = readCache(cache);
  const used = new Map();
  const diagnostics = [];
  const blocks = source.trim().split(/\r?\n(?:[ \t]*\r?\n)+/).map(block => parseDirectives(block, { citationKeyword }));
  const missing = new Map();
  for (const block of blocks) for (const [indexInBlock, token] of block.entries()) {
    if (token.malformed) {
      diagnostics.push({ state: "malformed", source: token.text });
    }
    if (token.type !== "citation") continue;
    for (const item of token.items) {
      const { identifier } = item;
      const key = identifierKey(identifier);
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
      const occurrence = `${namespace}-cite-${record.id}-${entry.occurrences.length + 1}`;
      entry.occurrences.push({ id: occurrence, context: occurrenceContext(block, indexInBlock, item, record) });
      Object.assign(item, { entry, occurrence });
    }
  }

  const entries = [...used.values()].sort(({ record: a }, { record: b }) =>
    (a.state === "unresolved") - (b.state === "unresolved") ||
    compare(sortName(a), sortName(b)) ||
    (a.issued?.[0] ?? 0) - (b.issued?.[0] ?? 0) ||
    compare(titleFor(a), titleFor(b)) || compare(a.id, b.id)
  );
  const groups = new Map();
  for (const entry of entries) {
    const { record } = entry;
    if (record.state === "unresolved") continue;
    // The rendered author-year must also distinguish two different lists shortened to "et al."
    const key = JSON.stringify([authorLabel(record).normalize("NFKC").toLowerCase(), yearFor(record)]);
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key).push(entry);
  }
  for (const group of groups.values()) {
    if (group.length > 1) group.forEach((entry, index) => { entry.suffix = suffixAt(index); });
  }

  const endnotes = `<section ${part("endnotes")} aria-labelledby="${namespace}-endnotes"><h2 id="${namespace}-endnotes">Endnotes</h2><ol>${entries.map(({ record, suffix, occurrences }) => {
    const text = bibliographyText(record, suffix);
    const status = [record.state === "unresolved" ? "Unresolved" : "", record.integrity?.state].filter(Boolean).join(" · ");
    const links = destinations(record, part);
    const backlinks = occurrences.map(({ id, context }) => {
      const label = `Return to “${context}”`;
      return iconLink(part, `#${id}`, label, "back");
    }).join("");
    return `<li id="${namespace}-note-${record.id}" tabindex="-1"><span dir="auto">${escapeHTML(text)}</span>${status ? ` <strong ${part("note-status")}>${escapeHTML(status)}</strong>` : ""}<div ${part("note-actions")}>${links}<span ${part("backlinks")}>${backlinks}</span></div></li>`;
  }).join("\n")}</ol></section>`;

  let emittedNotes = false;
  const annotations = new Set();
  const html = blocks.map(tokens => {
    const meaningful = tokens.filter(token => token.type !== "text" || token.text.trim());
    if (meaningful.length === 1 && meaningful[0].type === "endnotes" && !emittedNotes) {
      emittedNotes = true;
      return entries.length ? endnotes : "";
    }
    const content = tokens.map(token => {
      if (token.type === "text") return escapeHTML(token.text);
      if (token.type === "endnotes") return escapeHTML(token.raw);
      if (token.type === "annotation") {
        annotations.add(token.name);
        return `<a ${part("cite annotation")} href="#${namespace}-${token.name}" data-ci-panel="${token.name}">${annotationNames[token.name]}</a>`;
      }
      const citations = token.items.map(item => {
        const { record, suffix } = item.entry;
        const label = inlineText(record, item, suffix);
        const text = bibliographyText(record, suffix);
        return `<a ${part("cite")} id="${item.occurrence}" href="#${namespace}-note-${record.id}" data-ci-record="${record.id}" data-ci-bibliography="${escapeHTML(text)}" dir="auto">${escapeHTML(label)}</a>`;
      }).join("; ");
      const parenthetical = token.items.length > 1 || (!token.items[0].label && ["parenthetical", "suppress-author", "suppress-year"].includes(token.items[0].form));
      return parenthetical ? `<span ${part("cluster")}>(${citations})</span>` : citations;
    }).join("");
    return content ? `<p>${content}</p>` : "";
  }).join("\n");
  const records = entries.map(({ record }) => record);
  const supplementary = [...annotations].map(name => annotationContent(name, namespace, records, part));
  if (!emittedNotes && entries.length) supplementary.unshift(endnotes);
  return {
    html: [html, ...supplementary].join("\n"),
    cache: { schema: cache.schema, records },
    diagnostics
  };
}
