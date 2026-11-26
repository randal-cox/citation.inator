export {exportBibliography} from './bibliography-export.mjs';
export {citationOptionPolicy,CITATION_OPTION_POLICIES} from './option-policy.mjs';
import {optionSpans,stripSourceComments} from './notation-options.mjs';
export {createCitationMessages, citationLocales} from "./i18n.mjs";
import { parse } from 'parse5';
import { Lexer } from 'marked';
import { compileCitationBlocks, formatRecordId, parseDirectives, scanCitationMarkers, splitCitationParagraphs } from './compiler.mjs';
import { isCitationTextExcluded } from './markup.mjs';
import { canonicalIdentifierKey, readCache } from './records.mjs';
export { markerKind, formatRecordId } from './compiler.mjs';
export { createSiteOccurrenceIndex } from './reference-features.mjs';

const escaped = value => value.replace(/[\\"{};|]/g, character => '\\' + character);
const splitSpans = (source, separator) => {
  const spans = [];
  const pattern = /\\.|"[^"\\]*(?:\\.[^"\\]*)*"|./gsu;
  let start = 0;
  for (const match of source.matchAll(pattern)) if (match[0] === separator) {
    spans.push({ start, end: match.index }); start = match.index + 1;
  }
  spans.push({ start, end: source.length });
  return spans;
};

function textRanges(source, format, diagnostics, options) {
  if (format === 'text') return [{ start: 0, end: source.length }];
  if (format === 'html') {
    const ranges = [];
    const walk = node => {
      if (isCitationTextExcluded(node)) return;
      if (node.nodeName === '#text' && node.sourceCodeLocation) {
        const raw = source.slice(node.sourceCodeLocation.startOffset, node.sourceCodeLocation.endOffset);
        if (raw.includes('&') && scanCitationMarkers(node.value, options).filter(item => item.token?.type === 'citation').length >
            scanCitationMarkers(raw, options).filter(item => item.token?.type === 'citation').length) {
          diagnostics.push({ state: 'annotation-encoded-marker-skipped', start: node.sourceCodeLocation.startOffset });
        }
        ranges.push({ start: node.sourceCodeLocation.startOffset, end: node.sourceCodeLocation.endOffset });
      }
      for (const child of node.childNodes || []) walk(child);
    };
    walk(parse(source, { sourceCodeLocationInfo: true }));
    return ranges;
  }
  if (format !== 'markdown') throw new TypeError('Use text, html or markdown format.');
  // Marked normalizes line endings. Map normalized offsets back to the author's bytes.
  const offsets = [];
  let normalized = '';
  for (let i = 0; i < source.length; i++) {
    offsets.push(i);
    normalized += source[i] === '\r' ? '\n' : source[i];
    if (source[i] === '\r' && source[i + 1] === '\n') i++;
  }
  offsets.push(source.length);
  let lexicalSource = normalized;
  for (const marker of scanCitationMarkers(normalized, options).filter(marker=>!marker.token?.incomplete).reverse()) {
    lexicalSource = lexicalSource.slice(0, marker.start) + 'x'.repeat(marker.end - marker.start) + lexicalSource.slice(marker.end);
  }
  const blocked = [];
  const walk = (tokens, start, end) => {
    let cursor = start;
    for (const token of tokens || []) {
      if (!token.raw) continue;
      const at = lexicalSource.indexOf(token.raw, cursor);
      if (at < cursor || at + token.raw.length > end) {
        blocked.push([start, end]);
        diagnostics.push({ state: 'annotation-region-skipped', message: 'Could not locate a Markdown token exactly; its containing region was left unchanged.' });
        return;
      }
      cursor = at + token.raw.length;
      if (['code', 'codespan', 'html', 'link', 'image'].includes(token.type)) blocked.push([at, cursor]);
      else if (token.items) walk(token.items, at, cursor);
      else if (token.tokens) walk(token.tokens, at, cursor);
    }
  };
  walk(Lexer.lex(lexicalSource), 0, normalized.length);
  const protectHTML = node => {
    if (isCitationTextExcluded(node)) {
      if (node.sourceCodeLocation) blocked.push([node.sourceCodeLocation.startOffset, node.sourceCodeLocation.endOffset]);
      return;
    }
    if (node.nodeName === '#text' && scanCitationMarkers(node.value, options).some(item => item.token?.type === 'citation')) {
      diagnostics.push({ state: 'annotation-encoded-marker-skipped', start: offsets[node.sourceCodeLocation?.startOffset || 0] });
    }
    for (const child of node.childNodes || []) protectHTML(child);
  };
  protectHTML(parse(lexicalSource, { sourceCodeLocationInfo: true }));
  // Raw HTML tags/blocks are protected, including quoted attribute values.
  const ranges = [];
  let cursor = 0;
  for (const [start, end] of blocked.sort((a, b) => a[0] - b[0])) {
    if (start > cursor) ranges.push({ start: offsets[cursor], end: offsets[start] });
    cursor = Math.max(cursor, end);
  }
  if (cursor < normalized.length) ranges.push({ start: offsets[cursor], end: source.length });
  return ranges;
}

function analyze(source, cache, options) {
  if (typeof source !== 'string') throw new TypeError('Supply source text.');
  const diagnostics = [];
  const ranges = textRanges(source, options.format || 'text', diagnostics, options);
  const markers = [];
  const blocks = [];
  for (const range of ranges) {
    const text = source.slice(range.start, range.end);
    for (const marker of scanCitationMarkers(text, options)) {
      if (marker.token?.malformed) diagnostics.push({ state: 'malformed', code: 'citation-malformed', source: stripSourceComments(marker.raw).text, start: range.start + marker.start });
      if (marker.token?.type === 'citation') markers.push({ ...marker, start: marker.start + range.start, end: marker.end + range.start });
    }
    for (const paragraph of splitCitationParagraphs(text,options)) blocks.push(parseDirectives(paragraph, options));
  }
  const result = compileCitationBlocks(blocks, cache, options);
  if (markers.length !== result.citationDescriptions.length) throw new Error('Citation source ranges do not match the compilation context.');
  return { markers, effectiveCache:result.cache, descriptions: result.citationDescriptions, diagnostics: [...diagnostics,
    ...result.diagnostics.filter(item => !['unknown-tag', 'invalid-tag-icon', 'invalid-site-occurrence'].includes(item.state))] };
}

/** Describe a marker or identifier. No network requests or cache writes. */
export function describeCitation(identifierOrMarker, cache, options = {}) {
  if (typeof identifierOrMarker !== 'string') throw new TypeError('Supply a marker or identifier.');
  const source = identifierOrMarker.trim().startsWith('{') ? identifierOrMarker : `{${options.citationKeyword || 'cite'} ${identifierOrMarker}}`;
  const markers = scanCitationMarkers(source, options);
  if (markers.length !== 1 || markers[0].token?.type !== 'citation' || source.trim() !== markers[0].raw) {
    return { text: '', items: [], state: 'malformed', diagnostics: [{ state: 'malformed', code: 'citation-malformed', source: stripSourceComments(identifierOrMarker).text }] };
  }
  const result = analyze(source, cache, { ...options, format: 'text' });
  const items = result.descriptions.flatMap(marker => marker.items);
  return { text: items.map(item => item.text).join('; '), items,
    state: !items.length ? 'malformed' : items.some(item => item.state === 'unresolved') ? 'unresolved' : items.some(item => item.state === 'partial') ? 'partial' : 'resolved',
    diagnostics: result.diagnostics };
}

/** Refresh per-item editor notes; bytes outside proposed note edits are preserved. */
export function annotateMarkers(source, cache, options = {}) {
  const { noteContext = 'article' } = options;
  if (!['article','work'].includes(noteContext)) throw new TypeError('Use article or work noteContext.');
  // Annotation changes notes only; validate the writer option without changing existing IDs.
  formatRecordId('annotation-validation', options);
  const { markers, effectiveCache, descriptions, diagnostics } = analyze(source, cache, options);
  const workDescriptions = new Map();
  const edits = [];
  for (const [index, marker] of markers.entries()) {
    const description = descriptions[index];
    if (description.items.some(item => item.state === 'unresolved')) continue;
    const bodyStart = marker.raw.match(/^\{\s*[^\s]+\s+/)[0].length;
    const body = marker.raw.slice(bodyStart, -1);
    for (const [i, item] of splitSpans(body, ';').entries()) {
      const text = body.slice(item.start, item.end);
      const parts = optionSpans(text);
      const note = parts.slice(1).find(span => /^\s*cue:/.test(text.slice(span.start, span.end)));
      let noteText=description.items[i].text;
      if (noteContext === 'work') {
        const recordId=description.items[i].recordId;
        if (!workDescriptions.has(recordId)) workDescriptions.set(recordId,describeCitation(`{${options.citationKeyword || 'cite'} ${formatRecordId(recordId, options)}}`,effectiveCache,{...options,suffixScope:'fragment'}).text);
        noteText=workDescriptions.get(recordId);
      }
      noteText=escaped(noteText);
      const replacement = `cue:"${options.format && options.format !== 'text' ? noteText.replace(/[&<>]/g, character => ({'&':'&amp;','<':'&lt;','>':'&gt;'}[character])) : noteText}"`;
      if (note) {
        const original = text.slice(note.start, note.end);
        const start = marker.start + bodyStart + item.start + note.start + original.search(/\S/);
        const end = marker.start + bodyStart + item.start + note.end - (original.match(/\s*$/)[0].length);
        if (source.slice(start, end) !== replacement) edits.push({ start, end, text: replacement });
      } else {
        const end = marker.start + bodyStart + item.end - text.match(/\s*$/)[0].length;
        edits.push({ start: end, end, text: ' | ' + replacement });
      }
    }
  }
  let output = source;
  for (const edit of [...edits].sort((a, b) => b.start - a.start)) output = output.slice(0, edit.start) + edit.text + output.slice(edit.end);
  return { source: output, edits, changed: edits.length > 0, diagnostics };
}

/** Count per-item tag contributions without fetching providers or changing records. */
export function collectMarkerTags(sources, cache, options = {}) {
  if (!Array.isArray(sources)) throw new TypeError('Supply an array of source strings or source objects.');
  const index = cache === undefined ? null : readCache(cache);
  const counts = new Map();
  const diagnostics = [];
  for (const [position, input] of sources.entries()) {
    const entry = typeof input === 'string' ? { source: input } : input;
    if (!entry || typeof entry.source !== 'string') throw new TypeError('Each source must contain source text.');
    const settings = { ...options, ...entry.options, ...(entry.format && { format: entry.format }) };
    const issues = [];
    const ranges = textRanges(entry.source, settings.format || 'text', issues, settings);
    for (const range of ranges) for (const marker of scanCitationMarkers(entry.source.slice(range.start, range.end), settings)) {
      if (marker.token?.malformed) issues.push({ state: 'malformed', code: 'citation-malformed', start: range.start + marker.start });
      if (marker.token?.type !== 'citation') continue;
      for (const item of marker.token.items) {
        const key = canonicalIdentifierKey(item.identifier);
        const record = item.identifier.scheme === 'local' ? index?.byId.get(item.identifier.value) : index?.byIdentifier.get(key);
        const id = record?.id || (item.identifier.scheme === 'local' ? item.identifier.value : key);
        const fallback=record?.state!=='resolved'&&((item.editorNote||'').replace(/\s+/gu,' ').trim()||item.unresolvedText||record?.unresolvedText);
        if(fallback)issues.push({state:'unresolved',code:'citation-unresolved-placeholder',identifier:key,original:fallback});
        else if(index && (!record || record.state==='unresolved'))issues.push({state:'unresolved',code:'citation-unresolved',identifier:key});
        if (!item.markerTags?.length) continue;
        if (!counts.has(id)) counts.set(id, new Map());
        for (const tag of item.markerTags) counts.get(id).set(tag, (counts.get(id).get(tag) || 0) + 1);
      }
    }
    diagnostics.push(...issues.map(issue => ({ ...issue, source: typeof entry.name === 'string' ? entry.name : String(position + 1) })));
  }
  const result = Object.fromEntries([...counts].map(([id, tags]) => [id, Object.fromEntries(tags)]));
  return options.includeDiagnostics ? { counts: result, diagnostics } : result;
}

/** Explicit source migration; protected prose/code and authored comments stay byte-for-byte. */
export function migrateCitationCues(source,options={}){
 if(typeof source!=='string')throw TypeError('Supply authored source text.');
 const diagnostics=[],edits=[];
 for(const range of textRanges(source,options.format||'text',diagnostics,options))for(const marker of scanCitationMarkers(source.slice(range.start,range.end),options)){
  if(marker.token?.incomplete)continue;
  const head=/^\{\s*[^\s]+\s+/u.exec(marker.raw);if(!head)continue;
  const bodyStart=head[0].length,body=marker.raw.slice(bodyStart,-1),proposed=[];
  for(const item of splitSpans(body,';'))for(const field of optionSpans(body.slice(item.start,item.end)).slice(1)){
   const start=bodyStart+item.start+field.start,text=marker.raw.slice(start,bodyStart+item.start+field.end),match=/^\s*note:(?=\s*")/u.exec(text);
   if(match){const at=start+match[0].indexOf('note:');proposed.push({start:at,end:at+4,text:'cue'});}
  }
  if(!proposed.length)continue;
  let changed=marker.raw;for(const edit of [...proposed].reverse())changed=changed.slice(0,edit.start)+edit.text+changed.slice(edit.end);
  if(scanCitationMarkers(changed,options)[0]?.token?.type!=='citation'){diagnostics.push({code:'cue-migration-needs-review',start:range.start+marker.start});continue;}
  for(const edit of proposed)edits.push({...edit,start:range.start+marker.start+edit.start,end:range.start+marker.start+edit.end});
 }
 let output=source;for(const edit of edits.sort((a,b)=>b.start-a.start))output=output.slice(0,edit.start)+edit.text+output.slice(edit.end);
 return {source:output,edits:edits.reverse(),changed:Boolean(edits.length),diagnostics};
}
