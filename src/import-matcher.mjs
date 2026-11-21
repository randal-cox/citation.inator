// Experimental 0.4.0 source API. Recognition and matching propose review items only.
import { normalizeRecord } from './records.mjs';
import { scanCitationMarkers } from './compiler.mjs';

const styles = new Set(['apa', 'chicago-author-date', 'vancouver']);
const particles = new Set(['de', 'del', 'da', 'dos', 'van', 'von', 'der', 'den', 'la', 'le']);
const nonNames = new Set(['in', 'see', 'however', 'according', 'figure', 'table', 'equation', 'appendix', 'since', 'from', 'between']);
const folded = text => text.normalize('NFKC').toLocaleLowerCase('en').replace(/’/g, "'").replace(/\s+/g, ' ').trim();
const year = '(?:1[5-9]\\d{2}|20\\d{2})';

function authors(text) {
  const etAl = /\s+et\s+al\.?$/i.test(text);
  const raw = text.replace(/\s+et\s+al\.?$/i, '').replace(/,\s*$/, '').trim();
  const names = raw.split(/\s*(?:,\s*(?:(?:and|&)\s*)?|\s+and\s+|&)\s*/u);
  if (!names.length || names.some(name => !name || name.split(/\s+/).some(word =>
    nonNames.has(folded(word)) || !particles.has(folded(word)) && !/^\p{Lu}[\p{L}\p{M}'’.\-]*$/u.test(word)))) return null;
  return { names, etAl };
}

function dated(text) {
  const undated = /^\s*n\.d\.(?:-?([a-z]))?(.*)$/iu.exec(text);
  if (undated) {
    const tail=undated[2].trim();
    const location=tail && /^(?:,|:)\s*((?:pp?\.\s*)?\d+(?:\s*[-–—]\s*\d+)?)$/u.exec(tail);
    if (tail && (!location || new RegExp(`^${year}$`).test(location[1]))) return null;
    return {year:null,undated:true,sourceSuffix:(undated[1] || "").toLowerCase(),...(location && {locator:location[1]})};
  }
  const match = new RegExp(`^\\s*(?:\\[(${year})\\]\\s*)?(${year})([a-z]?)(.*)$`, 'u').exec(text);
  if (!match) return null;
  let printedYear = Number(match[2]), sourceSuffix = match[3], originalYear = match[1] ? Number(match[1]) : undefined;
  let tail = match[4].trim();
  const slash = new RegExp(`^/(${year})([a-z]?)(.*)$`, 'u').exec(tail);
  if (slash) {
    if (originalYear !== undefined || sourceSuffix) return null;
    originalYear = printedYear; printedYear = Number(slash[1]); sourceSuffix = slash[2]; tail = slash[3].trim();
  }
  let locator = '';
  if (tail) {
    const location = /^(?:,|:)\s*((?:pp?\.\s*)?\d+(?:\s*[-–—]\s*\d+)?)$/u.exec(tail);
    if (!location) return null;
    // A bare four-digit number can be a second cited year. Do not choose a page silently.
    if (new RegExp(`^${year}$`).test(location[1])) return null;
    locator = location[1];
  }
  return { year: printedYear, sourceSuffix, ...(originalYear !== undefined && { originalYear }), ...(locator && { locator }) };
}

function parentheticalItem(text) {
  const prefix = /^(see also|see|cf\.|e\.g\.,?)\s+/i.exec(text.trim());
  const body = text.trim().slice(prefix?.[0].length || 0);
  const dateAt = new RegExp(`(?:(?:\\[${year}\\]\\s*)?${year}[a-z]?|n\\.d\\.(?:-?[a-z])?)`, 'iu').exec(body);
  if (!dateAt) return null;
  const byline = authors(body.slice(0, dateAt.index).replace(/,\s*$/, '').trim());
  const date = dated(body.slice(dateAt.index));
  if (!byline || !date) return null;
  return { authors: byline.names, etAl: byline.etAl, ...date, ...(prefix && { prefix: prefix[1] }) };
}

/** Initial plain-text author-date detector. All matches retain original UTF-16 spans. */
export function parseInTextCitations(text, options = {}) {
  if (typeof options === 'string') options = { style: options };
  const { style = 'apa', range = { start: 0, end: text?.length }, citationKeyword, format = 'text', maxCitations = Infinity, maxItems = Infinity } = options;
  if (typeof text !== 'string') throw new TypeError('Supply visible plain text.');
  if (format !== 'text') throw new TypeError('Initial detection accepts visible plain text, not markup or files.');
  if (!styles.has(style)) throw new TypeError('Initial detection supports apa, chicago-author-date and vancouver.');
  if (!range || !Number.isInteger(range.start) || !Number.isInteger(range.end) || range.start < 0 || range.end < range.start || range.end > text.length) throw new TypeError('Supply a valid source range.');
  if (![maxCitations,maxItems].every(value=>value === Infinity || Number.isSafeInteger(value) && value>0)) throw new TypeError('Citation limits must be positive integers.');
  const limits={maxCitations,maxItems};let itemCount=0;
  const protectedRanges = scanCitationMarkers(text, { citationKeyword });
  const citations = [], diagnostics = [];
  const source = text.slice(range.start, range.end);
  if (style === 'vancouver') return detectNumeric(source,range.start,protectedRanges,style,limits);
  for (const match of source.matchAll(/\(([^()]*)\)/gu)) {
    let start = range.start + match.index;
    const end = start + match[0].length;
    if (protectedRanges.some(item => start < item.end && end > item.start)) continue;
    if (/\n\s*\n/.test(match[1])) continue;
    const parts = match[1].split(';');
    let items = parts.map(parentheticalItem);
    let form = 'parenthetical';
    if (items.some(item => !item)) {
      const date = parts.length === 1 && dated(match[1]);
      if (date) {
        let beforeStart = Math.max(range.start, start - 180);
        let before = text.slice(beforeStart, start);
        const paragraph = [...before.matchAll(/\r?\n[ \t]*\r?\n/gu)].at(-1);
        if (paragraph) { beforeStart += paragraph.index + paragraph[0].length; before = text.slice(beforeStart, start); }
        const words = [...before.matchAll(/\S+/gu)];
        const alternatives = [];
        for (let index = Math.max(0, words.length - 8); index < words.length; index++) {
          if (index && /^(?:and|&)$/i.test(words[index - 1][0])) continue;
          if (index && (/^(?:\p{Lu}\.)+$/u.test(words[index - 1][0]) || particles.has(folded(words[index - 1][0])))) continue;
          const raw = before.slice(words[index].index).trim();
          const parsed = authors(raw);
          if (parsed) alternatives.push({ authors: parsed.names, etAl: parsed.etAl, start: beforeStart + words[index].index });
        }
        if (!alternatives.length) continue;
        const byline = alternatives.at(-1);
        start = byline.start;
        items = [{ authors: byline.authors, etAl: byline.etAl, ...date,
          ...(alternatives.length > 1 && { authorAlternatives: alternatives, boundaryUncertain: true }) }];
        if (alternatives.length > 1) diagnostics.push({ code: 'import-uncertain-narrative-boundary', start: alternatives[0].start, end });
        form = 'narrative';
      } else {
        if (new RegExp(`\\p{L}[^()]*${year}`, 'u').test(match[1]) || /n\.d\./iu.test(match[1])) diagnostics.push({ code: 'import-unparsed-author-date', start, end, raw: match[0] });
        continue;
      }
    }
    itemCount+=items.length;
    if(citations.length>=maxCitations || itemCount>maxItems)throw new RangeError('Citation review budget exceeded. Use a shorter source or smaller groups.');
    citations.push({ start, end, raw: text.slice(start, end), form, items, requiresReview: true });
  }
  return { schema: 'citation-inator.import-detection.v1', style, citations, diagnostics };
}

function* bracketGroups(source) {
  let start = -1, depth = 0, nested = false;
  for (let index=0;index<source.length;index++) {
    if (source[index] === '[') {
      if (!depth) { start=index; nested=false; } else nested=true;
      depth++;
    } else if (source[index] === ']' && depth) {
      depth--;
      if (!depth) {
        let end=index+1;
        while (source[end] === ']') { nested=true; end++; }
        yield {index:start,raw:source.slice(start,end),body:source.slice(start+1,index),malformed:nested};
        index=end-1;
      }
    }
  }
  if (depth) yield {index:start,raw:source.slice(start),body:source.slice(start+1),malformed:true};
}

// Bracket shapes are proposals; only the caller's document-local labels map them.
function detectNumeric(source,offset,protectedRanges,style,limits) {
  let itemCount=0;
  const citations = [], diagnostics = [];
  for (const match of bracketGroups(source)) {
    const start = offset+match.index, end = start+match.raw.length;
    if (protectedRanges.some(item=>start<item.end && end>item.start) || /\n\s*\n/.test(match.body)) continue;
    if (match.malformed) {
      if (/\d/.test(match.body)) diagnostics.push({code:'import-unparsed-numeric-citation',start,end,raw:match.raw});
      continue;
    }
    if (!/^\s*\d[\d\s,–—-]*$/u.test(match.body)) continue;
    const numbers = []; let valid = true;
    for (const part of match.body.split(',')) {
      const span = /^\s*([1-9]\d{0,3})(?:\s*[-–—]\s*([1-9]\d{0,3}))?\s*$/u.exec(part);
      if (!span) { valid=false; break; }
      const first = Number(span[1]), last = Number(span[2] || span[1]);
      if (last < first || last-first+1+numbers.length > 100) { valid=false; break; }
      for (let number=first;number<=last;number++) numbers.push(number);
    }
    if (!valid) { diagnostics.push({code:'import-unparsed-numeric-citation',start,end,raw:match.raw}); continue; }
    if (new Set(numbers).size !== numbers.length) diagnostics.push({code:'import-repeated-reference-number',start,end,raw:match.raw});
    itemCount+=numbers.length;
    if(citations.length>=limits.maxCitations || itemCount>limits.maxItems)throw new RangeError('Citation review budget exceeded. Use a shorter source or smaller groups.');
    citations.push({start,end,raw:match.raw,form:'numeric',items:numbers.map(referenceNumber=>({referenceNumber})),requiresReview:true});
  }
  return {schema:'citation-inator.import-detection.v1',style,citations,diagnostics};
}

function authorMatches(name, author) {
  const initials = /^(?:(?:\p{Lu}\.\s*)+)(.+)$/u.exec(name);
  const family = initials ? initials[1] : name;
  const labels = [author.family, author.literal, author.short].filter(Boolean);
  if (!labels.some(label => folded(label) === folded(family))) return false;
  if (!initials) return true;
  const required = (name.slice(0, name.length - family.length).match(/\p{Lu}/gu) || []).join('');
  const actual = ((author.given || '').match(/\p{L}[\p{L}\p{M}]*/gu) || []).map(word => [...word][0]).join('');
  return Boolean(actual) && folded(actual).startsWith(folded(required));
}

/** Match against supplied records only. Unique results are proposals, never applied edits. */
export function matchCitations(detection, references) {
  if (detection?.schema !== 'citation-inator.import-detection.v1' || !Array.isArray(detection.citations)) throw new TypeError('Supply a detection result.');
  if (!Array.isArray(references)) throw new TypeError('Supply an array of bibliographic records.');
  const seen = new Set();
  const records = references.map(input => {
    const record = normalizeRecord(input);
    if (seen.has(record.id)) throw new TypeError('Reference IDs must be unique.');
    seen.add(record.id);
    if (input.sourceSuffix !== undefined && !/^[a-z]+$/.test(input.sourceSuffix)) throw new TypeError('A sourceSuffix must be a lowercase year letter.');
    if (input.referenceNumber !== undefined && (!Number.isInteger(input.referenceNumber) || input.referenceNumber < 1 || input.referenceNumber > 9999)) throw new TypeError('A referenceNumber must be an integer from 1 to 9999.');
    if (input.undated === true && record.issued) throw new TypeError('An explicitly undated record cannot also have an issued date.');
    return { record, sourceSuffix: input.sourceSuffix || '', referenceNumber:input.referenceNumber, undated:input.undated === true };
  });
  return { schema: 'citation-inator.import-matches.v1', matches: detection.citations.map(citation => ({
    citation,
    items: citation.items.map(item => {
      if (item.referenceNumber !== undefined) {
        const candidates = records.filter(entry=>entry.referenceNumber === item.referenceNumber).map(({record})=>({
          recordId:record.id,title:record.title,evidence:{referenceNumber:item.referenceNumber,identity:'document-local-label'}
        }));
        return {item,state:!candidates.length ? 'unmatched' : candidates.length === 1 ? 'unique' : 'ambiguous',candidates,requiresReview:true};
      }
      let uncertain = Boolean(item.boundaryUncertain);
      const candidates = records.flatMap(({ record, sourceSuffix, undated }) => {
        if (record.state === 'unresolved' || !item.undated && !record.issued || item.undated && record.issued) return [];
        const bylines = (item.authorAlternatives || [item]).filter(byline =>
          byline.authors.every((name, index) => record.authors[index] && authorMatches(name, record.authors[index])) &&
          (byline.etAl ? record.authors.length > byline.authors.length || record.authorsComplete === false && record.authors.length >= byline.authors.length
            : record.authors.length === byline.authors.length));
        if (!bylines.length) return [];
        const yearField = item.undated ? (undated ? 'explicitly-undated' : 'date-not-recorded') : record.issued[0] === item.year ? 'issued' : record.originalIssued?.[0] === item.year ? 'originalIssued' : '';
        if (!yearField || item.originalYear && (record.originalIssued?.[0] !== item.originalYear || record.issued[0] !== item.year)) return [];
        if (item.sourceSuffix && sourceSuffix && item.sourceSuffix !== sourceSuffix) return [];
        const missingSuffix = Boolean(item.sourceSuffix && !sourceSuffix);
        uncertain ||= missingSuffix || record.authorsComplete === false || item.undated && !undated;
        return [{ recordId: record.id, title: record.title, ...(item.authorAlternatives && { authorStarts: bylines.map(byline => byline.start) }), evidence: {
          authors: record.authorsComplete === false ? 'incomplete-byline' : item.boundaryUncertain ? 'uncertain-narrative-span' : 'exact-normalized', year: yearField,
          suffix: missingSuffix ? 'unknown-source-suffix' : item.sourceSuffix ? 'exact-source-suffix' : 'not-specified' } }];
      });
      return { item, state: !candidates.length ? 'unmatched' : candidates.length === 1 && !uncertain ? 'unique' : 'ambiguous', candidates, requiresReview: true };
    })
  })), diagnostics: detection.diagnostics };
}
