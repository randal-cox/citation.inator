import { CACHE_SCHEMA, canonicalIdentifierKey, normalizeRecord } from "./records.mjs";

const normalized = text => (text || "").normalize("NFKD").toLowerCase()
  .replace(/\p{M}/gu, "").replace(/[^\p{L}\p{N}]+/gu, " ").trim();

function group(map, key, record) {
  if (!key) return;
  if (!map.has(key)) map.set(key, []);
  const records = map.get(key);
  if (!records.includes(record)) records.push(record);
}

const describe = record => ({ id: record.id, title: record.title, year: record.issued?.[0] ?? null });

export async function reportCitations(cache, fragments, compile) {
  if (cache?.schema !== CACHE_SCHEMA || !Array.isArray(cache.records)) throw new TypeError("Unsupported citation cache schema.");
  if (!Array.isArray(fragments)) throw new TypeError("Supply an array of fragments.");
  const records = cache.records.map(normalizeRecord);
  const ids = new Map();
  const identifiers = new Map();
  const titles = new Map();
  const usable = new Map();
  for (const record of records) {
    const firstAuthor = record.authors[0];
    const author = normalized(firstAuthor?.literal || [firstAuthor?.family, firstAuthor?.given].filter(Boolean).join(" "));
    const title = normalized(record.title);
    if (title && author) group(titles, JSON.stringify([title, author]), record);
    const unclaimed = record.identifiers.filter(identifier => {
      const key = canonicalIdentifierKey(identifier);
      const present = identifiers.has(key);
      group(identifiers, key, record);
      return !present;
    });
    if (!usable.has(record.id)) usable.set(record.id, { ...record, identifiers: [] });
    usable.get(record.id).identifiers.push(...unclaimed);
    group(ids, record.id, record);
  }

  const used = new Set();
  const unresolved = [];
  const malformed = [];
  for (const [position, fragment] of fragments.entries()) {
    if (!fragment || typeof fragment !== "object") throw new TypeError("Supply source and an optional name for each fragment.");
    const name = typeof fragment.name === "string" && fragment.name || String(position + 1);
    const result = await compile(fragment.paragraphs ?? fragment.source, { schema: CACHE_SCHEMA, records: [...usable.values()] }, fragment.options, fragment.format);
    for (const record of result.cache.records) if (ids.has(record.id)) used.add(record.id);
    for (const diagnostic of result.diagnostics) {
      if (diagnostic.state === "unresolved") unresolved.push({ fragment: name, identifier: diagnostic.identifier });
      if (diagnostic.state === "malformed") malformed.push({ fragment: name, source: diagnostic.source });
    }
  }

  const collect = (map, keyName, predicate) => [...map]
    .filter(([, records]) => predicate(records))
    .map(([key, records]) => ({ [keyName]: key, records: records.map(describe) }));
  const duplicate = records => records.length > 1;
  return {
    unused: records.filter(record => !used.has(record.id)).map(describe),
    unresolved,
    malformed,
    duplicates: [
      ...collect(ids, "id", duplicate),
      ...collect(new Map([...identifiers].filter(([key]) => /^(doi|isbn):/.test(key))), "identifier", duplicate),
      ...collect(titles, "titleAndAuthor", duplicate)
    ],
    yearConflicts: collect(titles, "titleAndAuthor",
      records => new Set(records.map(record => record.issued?.[0]).filter(Boolean)).size > 1)
  };
}
