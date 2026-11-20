import { cleanText, normalizeTags } from './records.mjs';

const fallbackOrigin = 'https://citation.invalid';
export function siteURL(value, siteOrigin, { fragment = false } = {}) {
  if (typeof value !== 'string' || !value || /[\u0000-\u0020\u007f\\]/.test(value) || value.startsWith('//')) return '';
  try {
    const base = siteOrigin ? new URL(siteOrigin) : new URL(fallbackOrigin);
    if (!['https:', 'http:'].includes(base.protocol) || base.username || base.password) return '';
    const url = new URL(value, base);
    const absolute = /^[a-z][a-z0-9+.-]*:/i.test(value);
    if (absolute && !siteOrigin || url.origin !== base.origin || url.username || url.password || fragment && !url.hash) return '';
    return value;
  } catch { return ''; }
}

export function prepareReferences({ siteOccurrences = {}, occurrences, siteOrigin, tagCatalogue = [], listItemTags = {} } = {}, diagnostics = []) {
  if (occurrences !== undefined) {
    if (Object.keys(siteOccurrences).length) throw new TypeError('Use siteOccurrences or occurrences, not both.');
    siteOccurrences = occurrences;
  }
  if (!siteOccurrences || typeof siteOccurrences !== 'object' || Array.isArray(siteOccurrences)) throw new TypeError('Supply a site occurrence index keyed by record ID.');
  if (!Array.isArray(tagCatalogue)) throw new TypeError('Supply a tagCatalogue array.');
  if (!listItemTags || typeof listItemTags !== 'object' || Array.isArray(listItemTags)) throw new TypeError('Supply listItemTags keyed by record ID.');
  if (siteOrigin && !siteURL('/', siteOrigin)) throw new TypeError('Supply an HTTP(S) siteOrigin.');
  const catalogue = new Map();
  for (const item of tagCatalogue) {
    const id = normalizeTags([item?.id])[0];
    const label = cleanText(item?.label);
    if (!id || !label || catalogue.has(id)) throw new TypeError('Tag catalogue entries need unique valid IDs and labels.');
    const icon = item.icon ? siteURL(item.icon, siteOrigin) : '';
    if (item.icon && !icon) diagnostics.push({ state: 'invalid-tag-icon', tag: id });
    catalogue.set(id, { id, label, ...(icon && { icon }) });
  }
  const seenUnknown = new Set();
  const tags = (record, list = false) => normalizeTags(list && Object.hasOwn(listItemTags, record.id) ? listItemTags[record.id] : record.tags).map(id => {
    if (catalogue.has(id)) return catalogue.get(id);
    if (!seenUnknown.has(id)) { diagnostics.push({ state: 'unknown-tag', tag: id }); seenUnknown.add(id); }
    return { id, label: id };
  });
  const byRecord = new Map();
  for (const [recordId, entries] of Object.entries(siteOccurrences)) {
    if (!Array.isArray(entries)) throw new TypeError('Each site occurrence entry must be an array.');
    const seen = new Set();
    byRecord.set(recordId, entries.flatMap(item => {
      const href = siteURL(item?.href, siteOrigin, { fragment: true });
      const label = cleanText(item?.label);
      if (!href || !label) { diagnostics.push({ state: 'invalid-site-occurrence', recordId }); return []; }
      const canonical = /^(?:[a-z][a-z0-9+.-]*:|\/)/i.test(href) ? new URL(href, siteOrigin || fallbackOrigin).href : href;
      if (seen.has(canonical)) return [];
      seen.add(canonical);
      return [{ href, label, context: cleanText(item.context), ...(cleanText(item.occurrenceId) && { occurrenceId: cleanText(item.occurrenceId) }) }];
    }));
  }
  return { tags, occurrences: recordId => byRecord.get(recordId) || [] };
}

export function groupSiteOccurrences(entries) {
  const groups = new Map();
  for (const item of entries) {
    const key = item.href.split('#')[0];
    if (!groups.has(key)) groups.set(key, { label: item.label, entries: [] });
    groups.get(key).entries.push(item);
  }
  return [...groups.values()];
}
export const occurrenceLetter = index => index < 26 ? String.fromCharCode(97 + index) : occurrenceLetter(Math.floor(index / 26) - 1) + occurrenceLetter(index % 26);
export const siteReturnLabel = (group, item, index) => `Return to ${group.label}${item.context ? ' — ' + item.context : ''} (occurrence ${occurrenceLetter(index)})`;

/** Join actual emitted anchors to routes; does not crawl pages or write files. */
export function createSiteOccurrenceIndex(pages, { siteOrigin } = {}) {
  if (!Array.isArray(pages)) throw new TypeError('Supply pages with href, label and compiled occurrences.');
  const result = Object.create(null);
  for (const page of pages) {
    const href = siteURL(page?.href, siteOrigin);
    if (!href || href.includes('#') || !cleanText(page.label) || !Array.isArray(page.occurrences)) throw new TypeError('Each page needs a safe route, label and occurrence array.');
    for (const occurrence of page.occurrences) {
      if (!cleanText(occurrence.anchorId) || !/^[a-z0-9][a-z0-9.-]{0,159}$/.test(occurrence.recordId || '')) throw new TypeError('Supply actual compiled occurrence IDs and record IDs.');
      (result[occurrence.recordId] ||= []).push({ href: href + '#' + encodeURIComponent(occurrence.anchorId), label: page.label,
        context: cleanText(occurrence.context), ...(occurrence.occurrenceId && { occurrenceId: occurrence.occurrenceId }) });
    }
  }
  const normalized = prepareReferences({ siteOccurrences: result, siteOrigin });
  return Object.fromEntries(Object.keys(result).map(id => [id, normalized.occurrences(id)]));
}
