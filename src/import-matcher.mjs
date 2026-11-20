// Experimental 0.3.0 source API. Recognition and matching propose review items only.
import { normalizeRecord } from './records.mjs';
import { scanCitationMarkers } from './compiler.mjs';

const styles = new Set(['apa', 'chicago-author-date']);
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
  const dateAt = new RegExp(`(?:\\[${year}\\]\\s*)?${year}[a-z]?`).exec(body);
  if (!dateAt) return null;
  const byline = authors(body.slice(0, dateAt.index).replace(/,\s*$/, '').trim());
  const date = dated(body.slice(dateAt.index));
  if (!byline || !date) return null;
  return { authors: byline.names, etAl: byline.etAl, ...date, ...(prefix && { prefix: prefix[1] }) };
}

/** Initial plain-text author-date detector. All matches retain original UTF-16 spans. */
export function parseInTextCitations(text, options = {}) {
  if (typeof options === 'string') options = { style: options };
  const { style = 'apa', range = { start: 0, end: text?.length }, citationKeyword, format = 'text' } = options;
  if (typeof text !== 'string') throw new TypeError('Supply visible plain text.');
  if (format !== 'text') throw new TypeError('Initial detection accepts visible plain text, not markup or files.');
  if (!styles.has(style)) throw new TypeError('Initial detection supports apa and chicago-author-date.');
  if (!range || !Number.isInteger(range.start) || !Number.isInteger(range.end) || range.start < 0 || range.end < range.start || range.end > text.length) throw new TypeError('Supply a valid source range.');
  const protectedRanges = scanCitationMarkers(text, { citationKeyword });
  const citations = [], diagnostics = [];
  const source = text.slice(range.start, range.end);
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
        if (new RegExp(`\\p{L}[^()]*${year}`, 'u').test(match[1])) diagnostics.push({ code: 'import-unparsed-author-date', start, end, raw: match[0] });
        continue;
      }
    }
    citations.push({ start, end, raw: text.slice(start, end), form, items, requiresReview: true });
  }
  return { schema: 'citation-inator.import-detection.v1', style, citations, diagnostics };
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
    return { record, sourceSuffix: input.sourceSuffix || '' };
  });
  return { schema: 'citation-inator.import-matches.v1', matches: detection.citations.map(citation => ({
    citation,
    items: citation.items.map(item => {
      let uncertain = Boolean(item.boundaryUncertain);
      const candidates = records.flatMap(({ record, sourceSuffix }) => {
        if (record.state === 'unresolved' || !record.issued) return [];
        const bylines = (item.authorAlternatives || [item]).filter(byline =>
          byline.authors.every((name, index) => record.authors[index] && authorMatches(name, record.authors[index])) &&
          (byline.etAl ? record.authors.length > byline.authors.length || record.authorsComplete === false && record.authors.length >= byline.authors.length
            : record.authors.length === byline.authors.length));
        if (!bylines.length) return [];
        const yearField = record.issued[0] === item.year ? 'issued' : record.originalIssued?.[0] === item.year ? 'originalIssued' : '';
        if (!yearField || item.originalYear && (record.originalIssued?.[0] !== item.originalYear || record.issued[0] !== item.year)) return [];
        if (item.sourceSuffix && sourceSuffix && item.sourceSuffix !== sourceSuffix) return [];
        const missingSuffix = Boolean(item.sourceSuffix && !sourceSuffix);
        uncertain ||= missingSuffix || record.authorsComplete === false;
        return [{ recordId: record.id, title: record.title, ...(item.authorAlternatives && { authorStarts: bylines.map(byline => byline.start) }), evidence: {
          authors: record.authorsComplete === false ? 'incomplete-byline' : item.boundaryUncertain ? 'uncertain-narrative-span' : 'exact-normalized', year: yearField,
          suffix: missingSuffix ? 'unknown-source-suffix' : item.sourceSuffix ? 'exact-source-suffix' : 'not-specified' } }];
      });
      return { item, state: !candidates.length ? 'unmatched' : candidates.length === 1 && !uncertain ? 'unique' : 'ambiguous', candidates, requiresReview: true };
    })
  })), diagnostics: detection.diagnostics };
}
