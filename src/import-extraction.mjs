// Experimental import extraction. Source spans are evidence, not replacement edits.
import { parse, parseFragment } from 'parse5';
import { Lexer } from 'marked';
import { isCitationTextExcluded } from './markup.mjs';
import { scanCitationMarkers } from './compiler.mjs';
import { parseInTextCitations } from './import-matcher.mjs';

const blocks = new Set(['address','article','aside','blockquote','body','caption','dd','div','dl','dt','fieldset','figcaption','figure','footer','form','h1','h2','h3','h4','h5','h6','header','hr','li','main','nav','ol','p','section','table','tbody','td','th','thead','tr','ul']);
const nontext = new Set(['input','img','canvas','video','audio','object','embed']);
const urlLabel = text => /^(?:https?:\/\/|www\.)\S+$/iu.test(text.trim());
const nodeText = node => node.nodeName === '#text' ? node.value : (node.childNodes || []).map(nodeText).join('');
const attr = (node, name) => node.attrs?.find(item => item.name === name)?.value;

const entityPattern = /&(?:#[xX][0-9a-fA-F]+;|#\d+;|[a-zA-Z][a-zA-Z0-9]*;)/g;
const decodeEntity = entity => {
  const nodes = parseFragment(entity).childNodes;
  return nodes.length === 1 && nodes[0].nodeName === '#text' ? nodes[0].value : entity;
};
function protectedMarkers(source,citationKeyword) {
  let decoded = '', cursor = 0;
  const starts = [], ends = [];
  for (const match of source.matchAll(entityPattern)) {
    for (;cursor < match.index;cursor++) { decoded += source[cursor]; starts.push(cursor); ends.push(cursor+1); }
    const visible = decodeEntity(match[0]);
    decoded += visible;
    for (let index=0;index<visible.length;index++) { starts.push(match.index); ends.push(match.index+match[0].length); }
    cursor = match.index+match[0].length;
  }
  for (;cursor<source.length;cursor++) { decoded += source[cursor]; starts.push(cursor); ends.push(cursor+1); }
  // Escaped literal examples must remain protected after Markdown unescapes them.
  let literal = ''; const literalStarts = [], literalEnds = [];
  for (let index=0;index<decoded.length;index++) {
    let next = index;
    while (decoded[next] === '\\') next++;
    const until = next > index && ['{','}'].includes(decoded[next]) ? next : index;
    literal += decoded[until]; literalStarts.push(starts[index]); literalEnds.push(ends[until]);
    index = until;
  }
  return scanCitationMarkers(literal,{citationKeyword}).map(({start,end})=>({start:literalStarts[start],end:literalEnds[end-1]}));
}

/** Extract eligible HTML text without loading URLs or executing the document.
 * Links contribute visible text; their targets are opaque provenance only.
 * HTML/CSS rendering is not simulated: external CSS visibility is unknown.
 */
export function extractImportText(source, { format = 'text', citationKeyword = 'citation', includeURLLabels=false } = {}) {
  if (typeof source !== 'string') throw new TypeError('Supply source text.');
  if (!['text','html','markdown'].includes(format)) throw new TypeError('Experimental extraction supports text, html and markdown.');
  const result = { schema:'citation-inator.import-extraction.v1', format, citationKeyword, excludedSourceRanges:protectedMarkers(source,citationKeyword), text:'', segments:[], links:[], diagnostics:[] };
  function append(text, location, link) {
    const start = result.text.length;
    result.text += text;
    if (text && location) result.segments.push({ start, end:result.text.length,
      sourceStart:location.startOffset, sourceEnd:location.endOffset,
      exact:source.slice(location.startOffset,location.endOffset) === text,
      ...(link !== undefined && { link }) });
  }
  if (format === 'text') {
    append(source,{startOffset:0,endOffset:source.length});
    return result;
  }
  // Synthetic paragraph boundaries prevent matching across blocks or excluded content.
  const boundary = () => { if (result.text && !result.text.endsWith('\n\n')) result.text += '\n\n'; };
  if (format === 'markdown') {
    extractMarkdown(source, { result, append, boundary, includeURLLabels });
    return result;
  }
  function visit(node, link) {
    const hidden = attr(node,'hidden') !== undefined || attr(node,'aria-hidden')?.toLowerCase() === 'true' ||
      ['details','dialog'].includes(node.tagName) && attr(node,'open') === undefined;
    // Unlike the compiler, import reads citation labels inside ordinary links.
    const excluded = node.tagName === 'a'
      ? isCitationTextExcluded({ ...node, tagName:'span', attrs:node.attrs.map(attribute =>
          attribute.name === 'role' ? { ...attribute, value:attribute.value.split(/\s+/).filter(role => role !== 'link').join(' ') } : attribute) })
      : isCitationTextExcluded(node);
    if (hidden || excluded || nontext.has(node.tagName) || node.tagName === 'a' && urlLabel(nodeText(node))) { boundary(); return; }
    if (blocks.has(node.tagName) || node.tagName === 'br') boundary();
    if (node.tagName === 'a' && node.sourceCodeLocation) {
      link = result.links.length;
      result.links.push({ href:attr(node,'href') ?? '', sourceStart:node.sourceCodeLocation.startOffset,
        sourceEnd:node.sourceCodeLocation.endOffset, start:result.text.length, end:result.text.length });
    }
    if (node.nodeName === '#text') append(node.value,node.sourceCodeLocation,link);
    for (const child of node.childNodes || []) visit(child,link);
    if (node.tagName === 'a' && link !== undefined) result.links[link].end = result.text.length;
    if (blocks.has(node.tagName)) boundary();
  }
  visit(parse(source,{sourceCodeLocationInfo:true}));
  result.diagnostics.push({ code:'import-html-rendering-not-evaluated', message:'CSS visibility and visual reading order are not evaluated.' });
  return result;
}

/** Map a visible UTF-16 range to original source fragments.
 * Decoded entities/newlines map conservatively to their whole text node.
 * Never treat the union of fragments as an accepted source replacement.
 */
export function mapImportRange(extraction, { start, end }) {
  if (extraction?.schema !== 'citation-inator.import-extraction.v1') throw new TypeError('Supply an extraction result.');
  if (!Number.isInteger(start) || !Number.isInteger(end) || start < 0 || end <= start || end > extraction.text.length) throw new TypeError('Supply a nonempty visible text range.');
  return extraction.segments.filter(segment => segment.start < end && segment.end > start).map(segment => {
    const from = Math.max(start,segment.start), to = Math.min(end,segment.end);
    return { start:from, end:to,
      sourceStart:segment.exact ? segment.sourceStart + from - segment.start : segment.sourceStart,
      sourceEnd:segment.exact ? segment.sourceStart + to - segment.start : segment.sourceEnd,
      exact:segment.exact, ...(segment.link !== undefined && { link:segment.link }) };
  });
}

/** Recognize proposals in extracted text and attach reviewable source fragments. */
export function detectExtractedCitations(extraction, options = {}) {
  if (extraction?.schema !== 'citation-inator.import-extraction.v1') throw new TypeError('Supply an extraction result.');
  if (options.citationKeyword !== undefined && options.citationKeyword !== extraction.citationKeyword) throw new TypeError('Use the same citationKeyword for extraction and detection.');
  const detected = parseInTextCitations(extraction.text,{citationKeyword:extraction.citationKeyword,...options});
  return { ...detected, citations:detected.citations.map(citation => ({ ...citation,
    sourceFragments:mapImportRange(extraction,citation), requiresReview:true
  })).filter(citation => !citation.sourceFragments.some(fragment => extraction.excludedSourceRanges.some(range => fragment.sourceStart < range.end && fragment.sourceEnd > range.start))), diagnostics:[...extraction.diagnostics,...detected.diagnostics] };
}

// Marked's tokens can omit list indentation or quote prefixes. When an exact
// source location cannot be recovered, skip that region instead of guessing.
function extractMarkdown(source, { result, append, boundary, includeURLLabels=false }) {
  let normalized = '';
  const offsets = [];
  for (let index = 0; index < source.length; index++) {
    offsets.push(index);
    normalized += source[index] === '\r' ? '\n' : source[index];
    if (source[index] === '\r' && source[index + 1] === '\n') index++;
  }
  offsets.push(source.length);
  const location = (start,end) => ({ startOffset:offsets[start], endOffset:offsets[end] });
  const children = token => token.items || token.tokens || [];
  const containsHTML = token => token.type === 'html' || children(token).some(containsHTML);
  const skipped = (start,end,reason) => {
    boundary();
    result.diagnostics.push({ code:'import-markdown-region-skipped', sourceStart:offsets[start], sourceEnd:offsets[end], reason });
  };
  function appendDecoded(token,at,until,link) {
    if (token.text !== normalized.slice(at,until)) {
      append(token.text.replace(entityPattern,decodeEntity),location(at,until),link); return;
    }
    let cursor = 0;
    for (const match of token.text.matchAll(entityPattern)) {
      append(token.text.slice(cursor,match.index),location(at+cursor,at+match.index),link);
      append(decodeEntity(match[0]),location(at+match.index,at+match.index+match[0].length),link);
      cursor = match.index+match[0].length;
    }
    append(token.text.slice(cursor),location(at+cursor,until),link);
  }
  function walk(tokens,start,end,link) {
    let cursor = start;
    const located = [];
    for (const token of tokens) {
      if (!token.raw) continue;
      const at = normalized.indexOf(token.raw,cursor), until = at + token.raw.length;
      if (at < cursor || until > end) { skipped(start,end,'token-source-location'); return; }
      located.push({token,at,until}); cursor = until;
    }
    for (const {token,at,until} of located) {
      const block = ['paragraph','heading','blockquote','list','list_item','space','hr','table'].includes(token.type);
      if (block) boundary();
      if (containsHTML(token)) { skipped(at,until,'raw-html-context'); continue; }
      if (['code','codespan','image','def','hr','br','space'].includes(token.type)) { boundary(); continue; }
      if (token.type === 'table') { skipped(at,until,'table-not-supported'); continue; }
      let currentLink = link;
      if (!includeURLLabels && token.type === 'link' && urlLabel(token.text)) { boundary(); continue; }
      if (token.type === 'link') {
        currentLink = result.links.length;
        result.links.push({ href:token.href, sourceStart:offsets[at], sourceEnd:offsets[until], start:result.text.length, end:result.text.length });
      }
      if (children(token).length) {
        let contentStart = at, contentEnd = until;
        if (typeof token.text === 'string' && token.text !== token.raw) {
          contentStart = normalized.indexOf(token.text,at);
          contentEnd = contentStart + token.text.length;
          const again = normalized.indexOf(token.text,contentStart + 1);
          if (contentStart < at || contentEnd > until || again >= 0 && again + token.text.length <= until) {
            skipped(at,until,'ambiguous-content-source'); continue;
          }
        }
        walk(children(token),contentStart,contentEnd,currentLink);
      }
      else if (['text','escape'].includes(token.type)) appendDecoded(token,at,until,currentLink);
      else skipped(at,until,'unknown-token');
      if (token.type === 'link') result.links[currentLink].end = result.text.length;
      if (block) boundary();
    }
  }
  walk(Lexer.lex(normalized),0,normalized.length);
}
