import { createIdentifierResolver, readPayload, retryDelay } from "./identifier-resolver.mjs";
import packageInfo from "../package.json" with { type: "json" };
import { DAY, cleanText, httpsURL, canonicalIdentifierKey, localRecordId, normalizeIdentifier, normalizeRecord } from "./records.mjs";

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


const words = value => (value || "").normalize("NFKD").toLowerCase().replace(/\p{M}/gu, "")
  .match(/[\p{L}\p{N}]+/gu) || [];

function overlap(left, right) {
  const a = new Set(words(left));
  const b = new Set(words(right));
  return a.size && b.size ? 2 * [...a].filter(word => b.has(word)).length / (a.size + b.size) : 0;
}

function matchScore(query, candidate) {
  const title = overlap(query.title, candidate.title);
  const author = Math.max(0, ...candidate.authors.map(name => overlap(query.author, name)));
  const year = query.year && (candidate.publicationDate.match(/\b[1-9]\d{3}\b/g) || []).includes(String(query.year));
  return Math.round((55 * title + 30 * author + (year ? 15 : 0)) / (query.year ? 1 : .85));
}

// Search results are proposals for a curator. They never enter the citation cache.
export function createOpenLibrarySearch({
  fetch: request = globalThis.fetch, store = new Map(), now = Date.now,
  freshFor = DAY, mailto = "", minInterval = 1000
} = {}) {
  let queue = Promise.resolve();
  let pending = 0;
  let nextRequest = 0;
  let backOffUntil = 0;
  const inFlight = new Map();

  async function fetchJSON(url, evidence) {
    const start = now();
    if (backOffUntil > start) throw new Error("Open Library requested a pause. Try again after its retry interval.");
    if (nextRequest > start) await new Promise(resolve => setTimeout(resolve, nextRequest - start));
    nextRequest = now() + minInterval;
    const response = await request(url, {
      headers: { Accept: "application/json", "User-Agent": `citation-inator/${packageInfo.version}${mailto ? ` (mailto:${mailto})` : ""}` },
      signal: AbortSignal.timeout(8000), redirect: "error"
    });
    if ([429, 503].includes(response.status)) backOffUntil = now() + retryDelay(response.headers.get("retry-after"), now());
    const payload = await readPayload(response);
    let raw;
    try { raw = JSON.parse(payload); } catch { /* Keep bounded non-JSON evidence. */ }
    evidence.push({ provider, url: url.href, at: new Date(now()).toISOString(), status: response.status, raw: raw ?? payload });
    if (!response.ok) throw new Error(`Open Library returned HTTP ${response.status}.`);
    if (!raw || typeof raw !== "object" || Array.isArray(raw)) throw new Error("Open Library returned an invalid payload.");
    return raw;
  }

  async function retrieve(query, key, prior) {
    const evidence = [];
    const candidates = [];
    const errors = [];
    const quote = value => '"' + value.replace(/[\\"]/g, "\\$&") + '"';
    const urlFor = author => {
      const q = [`title:${quote(query.title)}`, `author:${quote(author)}`,
        query.year && `publish_year:${query.year}`, query.language && `language:${query.language}`].filter(Boolean);
      return new URL(`https://openlibrary.org/search.json?${new URLSearchParams({
        q: q.join(" AND "), limit: String(query.limit), fields: "key,author_name,editions,editions.key"
      })}`);
    };
    let searchURL = urlFor(query.author);
    try {
      let raw = await fetchJSON(searchURL, evidence);
      if (!Array.isArray(raw.docs)) throw new Error("Open Library omitted the search results.");
      const surname = query.author.includes(",") ? query.author.split(",", 1)[0].trim() : query.author.split(/\s+/).at(-1);
      if (!raw.docs.length && surname && surname !== query.author) {
        searchURL = urlFor(surname);
        raw = await fetchJSON(searchURL, evidence);
        if (!Array.isArray(raw.docs)) throw new Error("Open Library omitted the search results.");
      }
      const searchEvidence = evidence.at(-1);
      for (const work of raw.docs.slice(0, query.limit)) {
        const workKey = cleanText(work?.key);
        const editionKey = cleanText(work?.editions?.docs?.[0]?.key);
        if (!/^\/works\/OL\d+W$/.test(workKey) || !/^\/books\/OL\d+M$/.test(editionKey)) continue;
        try {
          const editionURL = `https://openlibrary.org${editionKey}`;
          const edition = await fetchJSON(new URL(editionURL + ".json"), evidence);
          if (edition.key !== editionKey) throw new Error("Open Library returned a different edition.");
          if (Array.isArray(edition.works) && edition.works.length && !edition.works.some(work => work?.key === workKey)) {
            throw new Error("Open Library did not associate the edition with the matched work.");
          }
          const identifiers = new Map();
          for (const value of [...(Array.isArray(edition.isbn_13) ? edition.isbn_13 : []),
            ...(Array.isArray(edition.isbn_10) ? edition.isbn_10 : [])]) {
            const id = normalizeIdentifier(`isbn:${value}`);
            if (id && !identifiers.has(canonicalIdentifierKey(id))) identifiers.set(canonicalIdentifierKey(id), id);
          }
          const editionEvidence = evidence.at(-1);
          const title = [cleanText(edition.title), cleanText(edition.subtitle)].filter(Boolean).join(": ");
          if (!title || !identifiers.size || candidates.some(candidate => candidate.editionKey === editionKey)) continue;
          candidates.push({
            state: "candidate", requiresReview: true, title,
            authors: (Array.isArray(work.author_name) ? work.author_name : []).filter(value => typeof value === "string"),
            authorSource: "work", editionKey, editionURL, workURL: `https://openlibrary.org${workKey}`,
            publicationDate: cleanText(edition.publish_date), edition: cleanText(edition.edition_name),
            publishers: (Array.isArray(edition.publishers) ? edition.publishers : []).filter(value => typeof value === "string"),
            languages: (Array.isArray(edition.languages) ? edition.languages : []).map(item => cleanText(item?.key)).filter(Boolean),
            identifiers: [...identifiers.values()],
            ...(identifiers.size > 1 && { note: "The catalog lists multiple ISBNs. Check the binding and edition before choosing one." }),
            provenance: [searchEvidence, editionEvidence].map(({ provider, url, at }) => ({ provider, url, retrievedAt: at }))
          });
        } catch (error) {
          errors.push(error.message);
          if (backOffUntil > now()) break;
        }
      }
    } catch (error) {
      errors.push(error.message);
    }
    for (const candidate of candidates) candidate.matchScore = matchScore(query, candidate);
    candidates.sort((a, b) => b.matchScore - a.matchScore);
    const state = errors.length ? candidates.length ? "partial" : "error" : candidates.length ? "candidates" : "empty";
    const result = {
      state, query, candidates: candidates.length || !errors.length ? candidates : prior?.result.candidates || [],
      message: errors.length ? errors.join(" ") : candidates.length ? "ISBN candidates are ready for curator review." : "No ISBN candidates found.",
      evidence, retrievedAt: new Date(now()).toISOString()
    };
    if (!errors.length || candidates.length) {
      await store.set(key, { result, expiresAt: now() + (candidates.length ? freshFor : 5 * 60_000) });
    }
    return structuredClone(result);
  }

  return {
    async search({ title, author, year, language = "", limit = 5 } = {}, { force = false } = {}) {
      title = cleanText(title);
      author = cleanText(author);
      language = cleanText(language).toLowerCase();
      if (!title || !author || title.length > 500 || author.length > 300) throw new TypeError("Supply a title and author.");
      if (year !== undefined && (!Number.isInteger(year) || year < 1000 || year > 9999)) throw new TypeError("Supply a four-digit edition year.");
      if (language && !/^[a-z]{3}$/.test(language)) throw new TypeError("Use a three-letter language code, such as eng.");
      if (!Number.isInteger(limit) || limit < 1 || limit > 10) throw new TypeError("Use a result limit from 1 to 10.");
      const query = { title, author, ...(year !== undefined && { year }), ...(language && { language }), limit };
      const key = "openlibrary-search:" + JSON.stringify(query);
      const prior = await store.get(key);
      if (!force && prior?.expiresAt > now()) return { ...structuredClone(prior.result), state: "cached" };
      if (inFlight.has(key)) return inFlight.get(key).then(structuredClone);
      if (pending >= 4) return { state: "error", query, candidates: [], message: "The search queue is full. Try again shortly.", evidence: [] };
      pending++;
      const task = queue.then(() => retrieve(query, key, prior)).finally(() => {
        pending--;
        inFlight.delete(key);
      });
      queue = task.catch(() => {});
      inFlight.set(key, task);
      return task;
    }
  };
}
