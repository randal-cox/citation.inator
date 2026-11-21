// Experimental, opt-in bibliographic search. Results never mutate citation records.
import packageInfo from '../package.json' with { type:'json' };
import { crossrefRecord } from './crossref.mjs';
import { DAY, normalizeIdentifier, normalizeRecord } from './records.mjs';
import { readPayload, retryDelay } from './identifier-resolver.mjs';

const label = value => value.normalize('NFKC').toLocaleLowerCase('en').replace(/[^\p{L}\p{N}]+/gu,' ').trim();
const field = (expected, actual) => ({ state:expected === undefined ? 'not-supplied' : !actual.length ? 'missing' : actual.some(value => label(String(value)) === label(String(expected))) ? 'exact' : 'different', expected:expected ?? null, actual });
function agreement(query, record) {
  const years = [...new Set([record.issued?.[0],record.online?.[0],record.print?.[0]].filter(Boolean))];
  const year = field(query.year,record.issued ? [record.issued[0]] : []);
  if (year.state === 'different' && years.includes(query.year)) year.state = 'alternative-date';
  return {
    title:field(query.title,record.title ? [record.title] : []),
    author:{scope:'any-listed-author', ...field(query.author,record.authors.flatMap(author => [author.literal,author.family,[author.given,author.family].filter(Boolean).join(' ')].filter(Boolean)))},
    year:{...year, availableYears:years},
    doi:field(query.doi,record.identifiers.filter(id => id.scheme === 'doi').map(id => id.value))
  };
}

function validStored(entry,query) {
  try {
    const result = entry?.result;
    return Number.isFinite(entry?.expiresAt) && result?.schema === 'citation-inator.import-search.v1' &&
      ['candidates','empty'].includes(result.state) && result.cached === false && result.stale === false &&
      JSON.stringify(result.query) === JSON.stringify(query) && Number.isFinite(Date.parse(result.retrievedAt)) &&
      Array.isArray(result.evidence) && Array.isArray(result.diagnostics) && Array.isArray(result.candidates) &&
      (result.state === 'empty' ? result.candidates.length === 0 : result.candidates.length > 0) &&
      result.candidates.every(candidate => candidate.state === 'candidate' && candidate.requiresReview === true &&
        Number.isInteger(candidate.providerRank) && candidate.providerRank > 0 &&
        (candidate.providerScore === null || Number.isFinite(candidate.providerScore)) &&
        ['resolved','partial','unresolved'].includes(candidate.record?.state) &&
        candidate.record.identifiers.some(id=>id.scheme === 'doi') &&
        JSON.stringify(candidate.agreement) === JSON.stringify(agreement(query,candidate.record)) &&
        JSON.stringify(normalizeRecord(candidate.record)) === JSON.stringify(candidate.record));
  } catch { return false; }
}

/** Explicit calls send only the supplied reference and optional contact to Crossref.
 * Relevance scores/order are provider evidence, never probabilities or selections.
 */
export function createCrossrefSearch({ fetch:request = globalThis.fetch, store = new Map(), now = Date.now,
  sleep = milliseconds => new Promise(resolve => setTimeout(resolve,milliseconds)),
  minInterval = 1000, freshFor = DAY, mailto = '' } = {}) {
  if (typeof request !== 'function' || typeof now !== 'function' || typeof sleep !== 'function' || !store?.get || !store?.set) throw new TypeError('Supply fetch, clock, sleep and search-store implementations.');
  if (![minInterval,freshFor].every(value => Number.isFinite(value) && value >= 0)) throw new TypeError('Search intervals must be finite and nonnegative.');
  if (typeof mailto !== 'string' || mailto.length > 254 || /[\r\n]/.test(mailto)) throw new TypeError('Supply a valid contact string.');
  let queue = Promise.resolve(), pending = 0, nextRequest = 0, backOffUntil = 0;
  const inFlight = new Map();
  async function retrieve(query,key,prior,diagnostics) {
    const evidence = [];
    try {
      if (backOffUntil > now()) throw new Error('Crossref requested a pause. Try again after its retry interval.');
      if (nextRequest > now()) await sleep(nextRequest - now());
      nextRequest = now() + minInterval;
      const url = new URL('https://api.crossref.org/works');
      url.searchParams.set('query.bibliographic',query.reference);
      url.searchParams.set('rows',String(query.limit));
      if (mailto) url.searchParams.set('mailto',mailto);
      const at = new Date(now()).toISOString();
      const attempt = { provider:'Crossref', url:url.href, at, status:null };
      evidence.push(attempt);
      const response = await request(url,{headers:{Accept:'application/json','User-Agent':`citation-inator/${packageInfo.version}${mailto ? ` (mailto:${mailto})` : ''}`},signal:AbortSignal.timeout(8000),redirect:'error'});
      attempt.status = response.status;
      if (response.status === 429 || response.status >= 500) backOffUntil = now() + retryDelay(response.headers.get('retry-after'),now());
      const payload = await readPayload(response);
      try { attempt.raw = JSON.parse(payload); } catch { attempt.raw = payload; }
      if (!response.ok) throw new Error(`Crossref returned HTTP ${response.status}.`);
      const items = attempt.raw?.message?.items;
      if (!Array.isArray(items)) throw new Error('Crossref omitted the search results.');
      const candidates = [], seen = new Set();
      for (const [index,item] of items.slice(0,query.limit).entries()) {
        try {
          const identifier = normalizeIdentifier(`doi:${typeof item?.DOI === 'string' ? item.DOI : ''}`);
          if (!identifier) throw new Error('Missing or invalid DOI.');
          if (seen.has(identifier.value)) continue;
          const record = crossrefRecord({message:item},identifier,at,url.href);
          seen.add(identifier.value);
          candidates.push({state:'candidate', requiresReview:true, providerRank:index+1,
            providerScore:Number.isFinite(item.score) ? item.score : null,
            record, agreement:agreement(query,record), provenance:{provider:'Crossref',url:url.href,retrievedAt:at}});
        } catch (error) { diagnostics.push({code:'import-crossref-candidate-skipped',providerRank:index+1,message:error.message}); }
      }
      const result = {schema:'citation-inator.import-search.v1',state:candidates.length ? 'candidates' : 'empty',query,candidates,evidence,diagnostics,retrievedAt:at,cached:false,stale:false};
      // A nonempty but unusable provider payload is not a verified negative result.
      if (items.length && !candidates.length) throw new Error('Crossref returned no usable candidate records.');
      try { await store.set(key,structuredClone({result,expiresAt:now()+(candidates.length ? freshFor : 5*60_000)})); }
      catch { diagnostics.push({code:'import-search-cache-unavailable'}); }
      return result;
    } catch (error) {
      if (evidence.some(attempt=>attempt.status === null)) backOffUntil = Math.max(backOffUntil,now()+60_000);
      return {schema:'citation-inator.import-search.v1',state:'error',query,candidates:structuredClone(prior?.result.candidates || []),evidence,diagnostics,
        message:error.message,cached:false,stale:Boolean(prior?.result.candidates?.length),
        ...(prior && {lastKnownGood:{retrievedAt:prior.result.retrievedAt,evidence:structuredClone(prior.result.evidence)}})};
    }
  }
  return {
    async search(input = {}, {force = false} = {}) {
      if (!input || typeof input !== 'object' || Array.isArray(input)) throw new TypeError('Supply a reference search object.');
      const {reference, title, author, year, doi, limit = 5} = input;
      if (typeof reference !== 'string' || !reference.trim() || reference.length > 2000) throw new TypeError('Supply one reference, up to 2000 characters.');
      for (const [name,value,max] of [['title',title,500],['author',author,300]]) if (value !== undefined && (typeof value !== 'string' || !value.trim() || value.length > max)) throw new TypeError(`Supply a bounded ${name}.`);
      if (year !== undefined && (!Number.isInteger(year) || year < 1000 || year > 9999)) throw new TypeError('Supply a four-digit year.');
      const identifier = doi === undefined ? undefined : typeof doi === 'string' && normalizeIdentifier(`doi:${doi}`);
      if (doi !== undefined && !identifier) throw new TypeError('Supply a valid DOI value.');
      if (!Number.isInteger(limit) || limit < 1 || limit > 5) throw new TypeError('Use a result limit from 1 to 5.');
      const query = {reference:reference.trim(),...(title !== undefined && {title:title.trim()}),...(author !== undefined && {author:author.trim()}),...(year !== undefined && {year}),...(identifier && {doi:identifier.value}),limit};
      const key = 'crossref-search:'+JSON.stringify(query), diagnostics = [];
      let prior;
      try { prior = await store.get(key); } catch { diagnostics.push({code:'import-search-cache-unavailable'}); }
      if (prior && !validStored(prior,query)) { diagnostics.push({code:'import-search-cache-invalid'}); prior = undefined; }
      if (!force && prior?.expiresAt > now()) return {...structuredClone(prior.result),cached:true};
      if (inFlight.has(key)) return inFlight.get(key).then(structuredClone);
      if (pending >= 4) return {schema:'citation-inator.import-search.v1',state:'error',query,candidates:[],evidence:[],diagnostics,message:'The search queue is full.',cached:false,stale:false};
      pending++;
      const task = queue.then(()=>retrieve(query,key,prior,diagnostics)).finally(()=>{pending--;inFlight.delete(key);});
      queue = task.catch(()=>{});inFlight.set(key,task);
      return task.then(structuredClone);
    }
  };
}
