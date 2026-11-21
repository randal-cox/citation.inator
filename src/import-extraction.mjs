// Experimental import extraction. Source spans are evidence, not replacement edits.
import { parse } from 'parse5';
import { isCitationTextExcluded } from './markup.mjs';
import { parseInTextCitations } from './import-matcher.mjs';

const blocks = new Set(['address','article','aside','blockquote','body','caption','dd','div','dl','dt','fieldset','figcaption','figure','footer','form','h1','h2','h3','h4','h5','h6','header','hr','li','main','nav','ol','p','section','table','tbody','td','th','thead','tr','ul']);
const nontext = new Set(['input','img','canvas','video','audio','object','embed']);
const attr = (node, name) => node.attrs?.find(item => item.name === name)?.value;

/** Extract eligible HTML text without loading URLs or executing the document.
 * Links contribute visible text; their targets are opaque provenance only.
 * HTML/CSS rendering is not simulated: external CSS visibility is unknown.
 */
export function extractImportText(source, { format = 'text' } = {}) {
  if (typeof source !== 'string') throw new TypeError('Supply source text.');
  if (!['text','html'].includes(format)) throw new TypeError('Experimental extraction supports text and html.');
  const result = { schema:'citation-inator.import-extraction.v1', format, text:'', segments:[], links:[], diagnostics:[] };
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
  function visit(node, link) {
    const hidden = attr(node,'hidden') !== undefined || attr(node,'aria-hidden')?.toLowerCase() === 'true' ||
      ['details','dialog'].includes(node.tagName) && attr(node,'open') === undefined;
    // Unlike the compiler, import reads citation labels inside ordinary links.
    const excluded = node.tagName === 'a'
      ? isCitationTextExcluded({ ...node, tagName:'span', attrs:node.attrs.map(attribute =>
          attribute.name === 'role' ? { ...attribute, value:attribute.value.split(/\s+/).filter(role => role !== 'link').join(' ') } : attribute) })
      : isCitationTextExcluded(node);
    if (hidden || excluded || nontext.has(node.tagName)) { boundary(); return; }
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
  const detected = parseInTextCitations(extraction.text,options);
  return { ...detected, citations:detected.citations.map(citation => ({ ...citation,
    sourceFragments:mapImportRange(extraction,citation), requiresReview:true
  })), diagnostics:[...extraction.diagnostics,...detected.diagnostics] };
}
