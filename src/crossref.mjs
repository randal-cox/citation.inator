import packageInfo from "../package.json" with { type: "json" };
import { DAY, cleanText, dateParts, identifierKey, localRecordId, normalizeIdentifier, normalizeRecord } from "./records.mjs";

const CROSSREF = "Crossref";
const NEGATIVE_TTL = 5 * 60_000;
const works = "https://api.crossref.org/works/";
const bibliographicFields = ["title", "authors", "issued", "online", "print", "containerTitle", "publisher", "volume", "issue", "pages", "articleNumber"];
const crossrefType = type => ({
  "journal-article": "article-journal", book: "book", "book-chapter": "chapter",
  dissertation: "thesis", "posted-content": "article", dataset: "dataset", report: "report"
})[type] || "document";
const date = item => dateParts(item?.["date-parts"]?.[0]);

export function crossrefRecord(raw, identifier, retrievedAt, url) {
  const message = raw?.message;
  const actual = normalizeIdentifier(`doi:${cleanText(message?.DOI)}`);
  if (!actual || identifierKey(actual) !== identifierKey(identifier)) throw new Error("Crossref returned a different or missing DOI.");
  const authors = Array.isArray(message.author) ? message.author.map(author => ({
    family: cleanText(author?.family), given: cleanText(author?.given), literal: cleanText(author?.name)
  })).filter(author => author.family || author.literal) : [];
  const title = Array.isArray(message.title) ? cleanText(message.title[0]) : "";
  const online = date(message["published-online"]);
  const print = date(message["published-print"]);
  const issued = print || date(message.issued) || online;
  const updates = Array.isArray(message["update-to"]) ? message["update-to"] : [];
  const notice = updates.find(item => ["retraction", "correction", "expression-of-concern"].includes(item?.type));
  return normalizeRecord({
    id: localRecordId("crossref", identifierKey(identifier)),
    title, authors, issued, online, print, identifiers: [identifier],
    type: crossrefType(message.type), state: title && authors.length && issued ? "resolved" : "partial",
    version: message.type === "posted-content" && message.subtype === "preprint" ? "preprint" : null,
    publisher: message.publisher, containerTitle: Array.isArray(message["container-title"]) ? message["container-title"][0] : "",
    volume: message.volume, issue: message.issue, pages: message.page, articleNumber: message["article-number"],
    retrievedAt,
    locations: [{ kind: "publisher", provider: CROSSREF, url: message.resource?.primary?.URL }],
    provenance: [{ provider: CROSSREF, url, retrievedAt, note: notice ? "Update relation retained in raw metadata. This record may describe the notice itself." : "" }]
  });
}

function merge(prior, fresh) {
  const log = [];
  if (!prior) return { record: fresh, log: ["Created from Crossref fields."] };
  if (fresh.state !== "resolved" && prior.state === "resolved") {
    return { record: prior, log: ["Retained last-known-good record; Crossref response was partial."] };
  }
  const editorial = prior.provenance.some(source => source.provider !== CROSSREF);
  const next = { ...prior };
  for (const field of bibliographicFields) {
    const before = prior[field];
    const after = fresh[field];
    const present = value => Array.isArray(value) ? value.length > 0 : Boolean(value);
    if (!present(after)) {
      if (present(before)) log.push(`Retained ${field}; Crossref omitted it.`);
    } else if (JSON.stringify(before) !== JSON.stringify(after)) {
      if (editorial && present(before)) log.push(`Retained curated ${field}; Crossref disagreed.`);
      else {
        next[field] = after;
        log.push(`Updated ${field} from Crossref.`);
      }
    }
  }
  if (fresh.state === "resolved" || prior.state === "unresolved") next.state = fresh.state;
  next.version ||= fresh.version;
  const publisher = fresh.locations.find(item => item.kind === "publisher");
  if (publisher && !prior.locations.some(item => item.kind === "publisher")) {
    next.locations = [...prior.locations, publisher];
    log.push("Added publisher URL from Crossref.");
  }
  next.provenance = [...prior.provenance.filter(source => source.provider !== CROSSREF), ...fresh.provenance];
  if (fresh.state === "resolved") next.retrievedAt = fresh.retrievedAt;
  return { record: normalizeRecord(next), log };
}

function retryDelay(value, now) {
  if (!value) return 60_000;
  const seconds = Number(value);
  const delay = Number.isFinite(seconds) ? seconds * 1000 : Date.parse(value) - now;
  return Number.isFinite(delay) ? Math.max(1000, delay) : 60_000;
}

async function readPayload(response) {
  const reader = response.body?.getReader();
  if (!reader) return "";
  const decoder = new TextDecoder();
  let size = 0;
  let text = "";
  try {
    for (;;) {
      const { done, value } = await reader.read();
      if (done) return text + decoder.decode();
      size += value.length;
      if (size > 2_000_000) throw new Error("Provider payload exceeds 2 MB.");
      text += decoder.decode(value, { stream: true });
    }
  } finally {
    await reader.cancel().catch(() => {});
    reader.releaseLock();
  }
}

// Store contract uses identifier keys. put() must commit one attempt and its
// merged record together. Server deployments can replace the in-memory Map.
export function createCrossrefResolver({
  fetch: request = globalThis.fetch, store = new Map(), now = Date.now,
  freshFor = DAY, mailto = "", minInterval = 1000
} = {}) {
  let queue = Promise.resolve();
  let nextRequest = 0;
  let backOffUntil = 0;
  let pending = 0;
  const inFlight = new Map();

  function isFresh(record, time) {
    const age = time - Date.parse(record?.retrievedAt);
    return record?.state === "resolved" && age >= 0 && age < freshFor;
  }

  function result(identifier, record, state, message, time, attempt = null) {
    const retrievedAt = record?.retrievedAt;
    return {
      identifier, record, state, message, attempt,
      freshness: retrievedAt ? (isFresh(record, time) ? "fresh" : "stale") : "unknown",
      ageSeconds: retrievedAt ? Math.max(0, Math.floor((time - Date.parse(retrievedAt)) / 1000)) : null
    };
  }

  async function retrieve(identifier, key, prior) {
    const start = now();
    if (backOffUntil > start) return result(identifier, prior, "error", "Crossref requested a pause. Try again later.", start);
    if (nextRequest > start) await new Promise(resolve => setTimeout(resolve, nextRequest - start));
    const time = now();
    nextRequest = time + minInterval;
    const url = new URL(works + encodeURIComponent(identifier.value));
    if (mailto) url.searchParams.set("mailto", mailto);
    const evidenceURL = works + encodeURIComponent(identifier.value);
    let status = null;
    let raw = null;
    let rawText = "";
    let state = "error";
    let message = "Crossref could not be reached.";
    let record = prior;
    let log = [];
    try {
      const response = await request(url, {
        headers: { Accept: "application/json", "User-Agent": `citation-inator/${packageInfo.version}${mailto ? ` (mailto:${mailto})` : ""}` },
        signal: AbortSignal.timeout(8000), redirect: "error"
      });
      status = response.status;
      if (status === 429 || status === 503) {
        backOffUntil = now() + retryDelay(response.headers.get("retry-after"), now());
        message = `Crossref returned HTTP ${status}. Requests paused.`;
      } else if (status === 404) {
        state = "unresolved";
        message = "Crossref has no record for this DOI. Other registration agencies may still have it.";
      } else if (!response.ok) message = `Crossref returned HTTP ${status}.`;
      else message = "Crossref returned unusable metadata.";

      rawText = await readPayload(response);
      try { raw = JSON.parse(rawText); } catch { /* Preserve a bounded non-JSON response as text. */ }
      if (response.ok) {
        const fresh = crossrefRecord(raw, identifier, new Date(time).toISOString(), evidenceURL);
        if (fresh.title) {
          ({ record, log } = merge(prior, fresh));
          state = fresh.state;
          message = state === "resolved" ? "Crossref metadata received." : "Crossref supplied a partial record.";
        }
      }
    } catch (error) {
      if (status === 200) log = [error.message];
    }
    const attempt = {
      provider: CROSSREF, url: evidenceURL, at: new Date(time).toISOString(), status, state,
      raw: raw ?? (rawText || null), mergeLog: log
    };
    const previous = await store.get(key);
    await store.set(key, {
      record, attempts: [...(previous?.attempts || []), attempt],
      negativeUntil: state === "unresolved" ? now() + NEGATIVE_TTL : 0
    });
    return result(identifier, record, state, message, now(), attempt);
  }

  return {
    async resolve(input, { seed = null, force = false } = {}) {
      const identifier = normalizeIdentifier(input);
      if (!identifier) return { state: "error", message: "Enter a valid citation identifier.", record: null };
      const key = identifierKey(identifier);
      const seedRecord = seed && normalizeRecord(seed);
      if (seedRecord && !seedRecord.identifiers.some(item => identifierKey(item) === key)) throw new Error("The seed record does not match the requested identifier.");
      const stored = await store.get(key);
      const prior = stored?.record || seedRecord;
      const time = now();
      if (identifier.scheme !== "doi") {
        return result(identifier, prior, prior ? "cached" : "unresolved", "Live resolution is available for DOI records. Other sources use the supplied cache.", time);
      }
      if (!force && stored?.negativeUntil > time) return result(identifier, prior, "unresolved", "Cached Crossref miss. Refresh to retry explicitly.", time, stored.attempts?.at(-1));
      if (!force && isFresh(prior, time)) return result(identifier, prior, "cached", "Using fresh cached metadata.", time, stored?.attempts?.at(-1));
      if (inFlight.has(key)) return inFlight.get(key);
      if (pending >= 4) return result(identifier, prior, "error", "The resolution queue is full. Try again shortly.", time);

      pending++;
      const task = queue.then(() => retrieve(identifier, key, prior)).finally(() => {
        pending--;
        inFlight.delete(key);
      });
      queue = task.catch(() => {});
      inFlight.set(key, task);
      return task;
    }
  };
}
