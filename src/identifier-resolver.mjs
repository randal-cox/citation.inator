import packageInfo from "../package.json" with { type: "json" };
import { DAY, canonicalIdentifierKey, normalizeIdentifier, normalizeRecord } from "./records.mjs";

const NEGATIVE_TTL = 5 * 60_000;

function merge(prior, fresh, provider, fields, locationKind) {
  const log = [];
  if (!prior) return { record: fresh, log: [`Created from ${provider} fields.`] };
  if (fresh.state !== "resolved" && prior.state === "resolved") {
    return { record: prior, log: [`Retained last-known-good record; ${provider} response was partial.`] };
  }
  const editorial = prior.provenance.some(source => source.provider !== provider);
  const next = { ...prior };
  for (const field of fields) {
    const before = prior[field];
    const after = fresh[field];
    const present = value => Array.isArray(value) ? value.length > 0 : Boolean(value);
    if (!present(after)) {
      if (present(before)) log.push(`Retained ${field}; ${provider} omitted it.`);
    } else if (JSON.stringify(before) !== JSON.stringify(after)) {
      if (editorial && present(before)) log.push(`Retained curated ${field}; ${provider} disagreed.`);
      else {
        next[field] = after;
        log.push(`Updated ${field} from ${provider}.`);
      }
    }
  }
  if (fresh.state === "resolved" || prior.state === "unresolved") next.state = fresh.state;
  next.version ||= fresh.version;
  const location = fresh.locations.find(item => item.kind === locationKind);
  if (location && !prior.locations.some(item => item.kind === locationKind &&
      (locationKind !== "library" || item.provider === provider))) {
    next.locations = [...prior.locations, location];
    log.push(`Added ${locationKind} URL from ${provider}.`);
  }
  next.provenance = [...prior.provenance.filter(source => source.provider !== provider), ...fresh.provenance];
  if (fresh.state === "resolved") next.retrievedAt = fresh.retrievedAt;
  return { record: normalizeRecord(next), log };
}

export function retryDelay(value, now) {
  if (!value) return 60_000;
  const seconds = Number(value);
  const delay = Number.isFinite(seconds) ? seconds * 1000 : Date.parse(value) - now;
  return Number.isFinite(delay) ? Math.max(1000, delay) : 60_000;
}

export async function readPayload(response) {
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

// Store contract uses identifier keys. set() commits one attempt and its
// merged record together. Server deployments can replace the in-memory Map.
export function createIdentifierResolver({
  provider, scheme, endpoint, metadata, missMessage, unsupportedMessage,
  fields, locationKind
}, {
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
    if (backOffUntil > start) return result(identifier, prior, "error", `${provider} requested a pause. Try again later.`, start);
    if (nextRequest > start) await new Promise(resolve => setTimeout(resolve, nextRequest - start));
    const time = now();
    nextRequest = time + minInterval;
    const url = endpoint(identifier);
    const evidenceURL = url.href;
    if (mailto) url.searchParams.set("mailto", mailto);
    let status = null;
    let raw = null;
    let rawText = "";
    let state = "error";
    let message = `${provider} could not be reached.`;
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
        message = `${provider} returned HTTP ${status}. Requests paused.`;
      } else if (status === 404) {
        state = "unresolved";
        message = missMessage;
      } else if (!response.ok) message = `${provider} returned HTTP ${status}.`;
      else message = `${provider} returned unusable metadata.`;

      rawText = await readPayload(response);
      try { raw = JSON.parse(rawText); } catch { /* Preserve a bounded non-JSON response as text. */ }
      if (response.ok && raw) {
        const fresh = metadata(raw, identifier, new Date(time).toISOString(), evidenceURL);
        if (fresh === null) {
          state = "unresolved";
          message = missMessage;
        } else if (fresh.title) {
          ({ record, log } = merge(prior, fresh, provider, fields, locationKind));
          state = fresh.state;
          message = state === "resolved" ? `${provider} metadata received.` : `${provider} supplied a partial record.`;
        }
      }
    } catch (error) {
      if (status === 200) log = [error.message];
    }
    const attempt = {
      provider, url: evidenceURL, at: new Date(time).toISOString(), status, state,
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
      const key = canonicalIdentifierKey(identifier);
      const seedRecord = seed && normalizeRecord(seed);
      if (seedRecord && !seedRecord.identifiers.some(item => canonicalIdentifierKey(item) === key)) throw new Error("The seed record does not match the requested identifier.");
      const stored = await store.get(key);
      const prior = stored?.record || seedRecord;
      const time = now();
      if (identifier.scheme !== scheme) {
        return result(identifier, prior, prior ? "cached" : "unresolved", unsupportedMessage, time);
      }
      if (!force && stored?.negativeUntil > time) return result(identifier, prior, "unresolved", `Cached ${provider} miss. Refresh to retry explicitly.`, time, stored.attempts?.at(-1));
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
