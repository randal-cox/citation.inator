import {normalizeImportLimits} from './import-limits.mjs';
// Experimental full-source text/Markdown import. Original source is never rewritten here.
import {Lexer} from 'marked';
import {importHash} from './import-hash.mjs';
import {referenceDOIs} from './import-identifiers.mjs';
import {parseReference,parseAPAAuthorList} from './import-references.mjs';
import {extractImportText,detectExtractedCitations,mapImportRange} from './import-extraction.mjs';
import {detectCitationFormat} from './import-format.mjs';
import {normalizeRecord,canonicalIdentifierKey} from './records.mjs';
const digest=importHash;
const heading=/^ {0,3}(?:#{1,6}[ \t]+)?(References|Bibliography|Works cited):?[ \t]*(?:#+[ \t]*)?$/iu;
function sourceLines(source) {
 const lines=[];let start=0;
 for(const match of source.matchAll(/\r\n|\n|\r/gu)){lines.push({start,end:match.index+match[0].length,text:source.slice(start,match.index),line:lines.length+1});start=match.index+match[0].length;}
 lines.push({start,end:source.length,text:source.slice(start),line:lines.length+1});return lines;
}
function markdownBlocks(source) {
 let normalized='';const offsets=[];
 for(let index=0;index<source.length;index++){offsets.push(index);normalized+=source[index]==='\r'?'\n':source[index];if(source[index]==='\r'&&source[index+1]==='\n')index++;}offsets.push(source.length);
 let cursor=0;return Lexer.lex(normalized).map(token=>{
  const at=normalized.indexOf(token.raw,cursor),until=at+token.raw.length;if(at<cursor)throw new Error('Cannot map Markdown blocks to source.');cursor=until;
  const html=item=>item.type==='html'||(item.tokens || item.items || []).some(html);
  const block={eligible:!html(token),type:token.type,start:offsets[at],end:offsets[until],text:token.type==='heading'?extractImportText(token.raw,{format:'markdown'}).text.trim():token.text,depth:token.depth,ordered:token.ordered};
  if(token.type==='list'){let itemCursor=at;block.items=token.items.map(item=>{const start=normalized.indexOf(item.raw,itemCursor),end=start+item.raw.length;if(start<itemCursor||end>until)throw new Error('Cannot map reference list to source.');itemCursor=end;return {start:offsets[start],end:offsets[end]};});}
  return block;
 });
}
export function partitionImportDocument(source,{startLine='auto',endLine=null,limits:overrides,citationKeyword='cite'}={}) {
 const limits=normalizeImportLimits(overrides);
 if(typeof source!=='string'||source.length>limits.sourceCharacters)throw new TypeError('Use a document of at most '+limits.sourceCharacters.toLocaleString('en')+' characters.');
 const lines=sourceLines(source),blocks=markdownBlocks(source),headings=[],eligible=extractImportText(source,{format:'markdown',citationKeyword}).segments;
 let blockIndex=0;
 for(const line of lines){
  while(blockIndex<blocks.length&&blocks[blockIndex].end<=line.start)blockIndex++;
  const block=blocks[blockIndex];if(!block?.eligible)continue;
  if(block.type==='heading'&&block.start===line.start&&/^(?:References|Bibliography|Works cited):?$/iu.test(block.text?.trim() || ''))headings.push({line:line.line,start:block.start,end:block.end,label:block.text.trim(),depth:block.depth});
  else if(block.type==='paragraph'&&heading.test(line.text)&&eligible.some(segment=>segment.sourceStart<line.end&&segment.sourceEnd>line.start))headings.push({line:line.line,start:line.start,end:line.end,label:line.text.trim()});
  if(headings.length>100)throw new RangeError('Too many bibliography heading candidates. Use a smaller document.');
 }
 let boundaryRequired=false,selected=null;
 if(startLine==='auto'){boundaryRequired=headings.length>1;selected=headings.length===1?headings[0]:null;}
 else if(startLine!=='none'){
  if(!Number.isSafeInteger(startLine)||startLine<1||startLine>lines.length)throw new TypeError('Choose a valid bibliography start line.');
  const line=lines[startLine-1];if(blocks.some(block=>!['heading','paragraph','list','space'].includes(block.type)&&line.start>=block.start&&line.start<block.end))throw new TypeError('Choose a bibliography boundary outside code or HTML.');selected=headings.find(item=>item.line===startLine) || {...line,label:line.text.trim()};
 }
 if(endLine!==null&&(!Number.isSafeInteger(endLine)||endLine<1||endLine>lines.length))throw new TypeError('Choose a valid bibliography end line.');
 if(selected&&endLine!==null&&endLine<selected.line)throw new TypeError('The bibliography end must follow its start.');
 const start=selected?.start ?? source.length;
 let end=selected?(endLine===null?source.length:lines[endLine-1].end):source.length;
 // A subsequent Markdown heading ends this reference section; never swallow an appendix.
 if(selected&&endLine===null){const next=blocks.find(block=>block.start>=selected.end&&(block.type==='heading'||block.type==='paragraph'&&/^(?:Notes|Appendix|Appendices|Acknowledg(?:e)?ments|Supporting information)\s*$/iu.test(block.text || '')));if(next)end=next.start;}
 const entriesStart=selected?(heading.test(selected.text ?? selected.label)?selected.end:selected.start):source.length;
 const bodyRanges=selected?[{start:0,end:start},...(end<source.length?[{start:end,end:source.length}]:[])]:[{start:0,end:boundaryRequired?headings[0].start:source.length}];
 return {schema:'citation-inator.import-document.v1',sourceHash:digest(source),headings,boundaryRequired,
  bibliography:selected?{start,end,entriesStart,heading:source.slice(start,entriesStart),startLine:selected.line}:null,
  bodyRanges,lines,blocks};
}
function chicagoAuthors(raw) {
 const first=/^([^,]+),\s*([^,]+)(.*)$/u.exec(raw);if(!first)return null;
 const safe=value=>/^[\p{L}\p{M}'’. -]+$/u.test(value)&&!/(?:et al|\.\.\.|…)/iu.test(value);
 if(!safe(first[1])||!safe(first[2])||/\band\b|&/iu.test(first[2]))return null;
 const people=[{family:first[1].trim(),given:first[2].trim()}];
 if(first[3])for(const name of first[3].replace(/^,\s*(?:and\s+)?/u,'').split(/,\s*(?:and\s+)?|\s+and\s+/u)){
  const parts=/^(\p{Lu}[\p{L}\p{M}'’. -]*?)\s+(\p{Lu}[\p{L}\p{M}'’.-]*)$/u.exec(name.trim());if(!parts)return null;
  const given=parts[1].split(/\s+/u),family=[parts[2]],particles=new Set(['de','del','da','dos','das','di','van','von','der','den','la','le','du','al','bin','ben']);
  while(given.length>1&&particles.has(given.at(-1).toLocaleLowerCase('en')))family.unshift(given.pop());
  // Extra unabbreviated words can be compound given or family names. Retain raw instead of deciding.
  if(given.slice(1).some(part=>!/^\p{Lu}\.$/u.test(part)))return null;
  people.push({given:given.join(' '),family:family.join(' ')});
 }
 return people;
}
function entryFields(raw,style) {
 const parsed=parseReference(raw,{style}),fields={...parsed.fields};
 if(style==='chicago-author-date'&&!fields.authors&&fields.authorText){const people=chicagoAuthors(fields.authorText);if(people){fields.authors=people;fields.authorsComplete=true;}}
 if(style==='apa'&&!fields.issued){const date=/^(.+?)\s+\(n\.d\.(?:-?([a-z]))?\)\.\s+(.+)$/iu.exec(raw);if(date){const people=parseAPAAuthorList(date[1]);if(people){fields.authors=people;fields.authorsComplete=true;fields.undated=true;fields.title=date[3].split(/\.\s/u)[0].replace(/\.$/u,'');if(date[2])fields.sourceSuffix=date[2].toLowerCase();}}}
 // Only structured journal tails supply publication-type evidence for automatic DOI matching.
 if(fields.title&&['apa','chicago-author-date'].includes(style)){
  const titleEnd=parsed.evidence.find(item=>item.field==='title')?.end;
  const tail=titleEnd===undefined?'':raw.slice(titleEnd).replace(/^\.\s*/, '');
  const journal=/^([^,]+),\s*(\d+)(?:\(([^)]+)\))?,\s*(e?\d+(?:[-–]\d+)?)\.?$/u.exec(tail.trim()) || /^(.+?)\s+(\d+)\s*\(([^)]+)\):\s*(\d+(?:[-–]\d+)?)\.?$/u.exec(tail.trim());
  if(journal){fields.type='article-journal';fields.containerTitle=journal[1];fields.volume=journal[2];if(journal[3])fields.issue=journal[3];if(journal[4].startsWith('e'))fields.articleNumber=journal[4];else fields.pages=journal[4];}
 }
 const original=/\b(?:original(?:ly)?(?: work)?|first)\s+published\s+(1[5-9]\d{2}|20\d{2})\b/iu.exec(raw);if(original)fields.originalIssued=[Number(original[1])];
 const diagnostics=parsed.diagnostics.filter(item=>!(fields.authors&&item.code==='import-reference-byline-unparsed')&&!(fields.undated&&item.code==='import-reference-unparsed'));
 return {...parsed,fields,state:Object.keys(fields).length?'partial':'unparsed',diagnostics};
}
function semanticReferenceText(source){
 const walk=tokens=>tokens.map(token=>token.type==='html'||token.type==='image'||token.type==='def'?'':token.tokens?walk(token.tokens):['text','escape','codespan'].includes(token.type)?token.text:['br','space'].includes(token.type)?'\n':'').join('');
 return walk(Lexer.lex(source));
}
function referenceExtraction(source,style){
 const extraction=extractImportText(source,{format:style==='vancouver'?'text':'markdown',includeURLLabels:true});
 const mapped=!extraction.diagnostics.length&&Boolean(extraction.text.trim());
 return {extraction,text:mapped?extraction.text:semanticReferenceText(source),mapped};
}
function bibliographyEntries(source,document,style,limits) {
 if(!document.bibliography)return [];
 const {entriesStart,end}=document.bibliography;
 const entries=[];
 // A bare wrapped year continues the preceding numbered entry before applying record caps.
 const appendEntry=entry=>{
  const previous=entries.at(-1),text=source.slice(entry.start,entry.end).trim(),prior=previous?source.slice(previous.start,previous.end).trimEnd():'';
  const numericTail=/^\d{1,6}\.(?:\s+(?:https?:\/\/(?:dx\.)?doi\.org\/)?10\.\d{4,9}\/\S+)?$/u.test(text);
  const wrappedPage=numericTail&&/[-–]$/u.test(prior),wrappedDOI=/^\d{1,6}\.$/u.test(text)&&/10\.\d{4,9}\/[^\s]*[.\/-]$/u.test(prior);
  const wrappedYear=/^(?:1[5-9]\d{2}|20\d{2})\.$/u.test(text);
  if(style==='vancouver'&&previous&&(wrappedYear||wrappedPage||wrappedDOI)&&/^\s*[1-9]\d{0,3}\.\s+\S/u.test(prior)&&!source.slice(previous.end,entry.start).trim())previous.end=entry.end;else entries.push(entry);
 };
 for(const block of document.blocks.filter(block=>block.end>entriesStart&&block.start<end)){
  if(block.type==='list'){for(const item of block.items)if(item.start>=entriesStart&&item.start<end)appendEntry({start:item.start,end:Math.min(item.end,end)});}
  else if(block.type==='paragraph'&&block.eligible){
   const lines=document.lines.filter(line=>line.start>=Math.max(block.start,entriesStart)&&line.start<Math.min(block.end,end)&&line.text.trim());
   const starts=text=>style==='vancouver'?/^\s*[1-9]\d{0,3}\.\s+(?=[‘’“"']?\p{L})/u.test(text):style==='apa'?/^(?:[^,\n]+,.*|[\p{L}\p{M} .&’'-]{1,150})\s*\((?:1[5-9]\d{2}|20\d{2}|n\.d\.)[a-z]?\)\.\s+/iu.test(text):/^[^,\n]+,.*\.\s+(?:1[5-9]\d{2}|20\d{2})/u.test(text);
   const boundaries=lines.filter(line=>starts(referenceExtraction(line.text,style).text.trim()));
   if(boundaries.length>1){
    const beginning=Math.max(block.start,entriesStart);if(boundaries[0].start>beginning&&source.slice(beginning,boundaries[0].start).trim())appendEntry({start:beginning,end:boundaries[0].start});
    for(const [index,line] of boundaries.entries())appendEntry({start:line.start,end:boundaries[index+1]?.start ?? Math.min(block.end,end)});
   }else appendEntry({start:Math.max(block.start,entriesStart),end:Math.min(block.end,end)});
  }
  if(entries.length>limits.references)throw new RangeError('Use at most '+limits.references+' reference entries.');
 }
 if(entries.length>limits.references)throw new RangeError('Use at most '+limits.references+' reference entries.');
 return entries.map(entry=>{
  const raw=source.slice(entry.start,entry.end).trimEnd(),line=document.lines.find(line=>line.start<=entry.start&&entry.start<line.end)?.line;
  const bullet=style!=='vancouver'?/^ {0,3}[-+*]\s+/u.exec(raw):null;
  const offset=bullet?.[0].length || 0,body=raw.slice(offset),visible=referenceExtraction(body,style),extraction=visible.extraction,map=[];let flat='';for(let index=0;index<visible.text.length;index++){map.push(index);flat+=visible.text[index]==='\r'||visible.text[index]==='\n'?' ':visible.text[index];if(visible.text[index]==='\r'&&visible.text[index+1]==='\n')index++;}map.push(visible.text.length);
  const parsed=flat.trim()&&flat.length<=20000?entryFields(flat,style):{schema:'citation-inator.import-reference.v1',fields:{},evidence:[],diagnostics:[{code:'import-reference-unparsed'}],requiresReview:true,state:'unparsed'};
  const sourceDOIs=referenceDOIs(visible.text);
  parsed.fields.identifiers=sourceDOIs.identifiers;
  parsed.diagnostics=parsed.diagnostics.filter(item=>!item.code.startsWith('import-wrapped-identifier-'));parsed.diagnostics.push(...sourceDOIs.diagnostics);
  parsed.evidence=parsed.evidence.filter(item=>item.field!=='identifiers');
  const evidence=parsed.evidence.flatMap(item=>{if(!visible.mapped)return [{...item,start:0,end:raw.length,raw,exact:false,rule:'formatted-reference-text-proposal'}];const fragments=mapImportRange(extraction,{start:map[item.start],end:map[item.end]});if(!fragments.length)return [];const start=fragments[0].sourceStart+offset,end=fragments.at(-1).sourceEnd+offset;return [{...item,start,end,raw:raw.slice(start,end),exact:fragments.every(fragment=>fragment.exact)}];});
  for(const link of extraction.links){
   if(!link.href || link.href.length>20000)continue;
   const identifiers=parseReference(link.href).fields.identifiers || [];
   if(!identifiers.length)continue;
   parsed.fields.identifiers=[...(parsed.fields.identifiers || [])];
   for(const identifier of identifiers)if(!parsed.fields.identifiers.some(existing=>existing.scheme===identifier.scheme&&existing.value===identifier.value))parsed.fields.identifiers.push(identifier);
   evidence.push({field:'identifiers',start:link.sourceStart+offset,end:link.sourceEnd+offset,raw:raw.slice(link.sourceStart+offset,link.sourceEnd+offset),exact:false,rule:'bibliography-link-identifier'});
  }
  for(const item of sourceDOIs.evidence){const fragments=mapImportRange(extraction,item);if(!fragments.length)continue;const start=fragments[0].sourceStart+offset,end=fragments.at(-1).sourceEnd+offset;evidence.push({...item,start,end,raw:raw.slice(start,end),exact:item.exact!==false&&fragments.every(fragment=>fragment.exact)});}
  parsed.fields.identifiers=(parsed.fields.identifiers || []).filter(id=>!sourceDOIs.blocked.has(id.value));
  return {...parsed,...entry,line,raw,id:'ref-'+digest(raw).slice(0,20),evidence};
 });
}
export function analyzeImportDocument(source,{style='auto',bibliography={},limits:overrides,citationKeyword='cite'}={}) {
 const limits=normalizeImportLimits(overrides),document=partitionImportDocument(source,{...bibliography,limits,citationKeyword});
 const parts=document.bodyRanges.filter(range=>range.end>range.start).map(range=>{
  const extraction=extractImportText(source.slice(range.start,range.end),{format:'markdown',citationKeyword});return {range,extraction};
 });
 const visible=parts.map(part=>part.extraction.text).join('\n\n');
 const formatDetection=detectCitationFormat(visible,{limits}),formatChoiceRequired=style==='auto'&&!formatDetection.style&&visible.trim().length>0;
 const effectiveStyle=style==='auto'?(formatDetection.style||'apa'):style;
 if(!['apa','chicago-author-date','vancouver'].includes(effectiveStyle))throw new TypeError('Choose a supported citation format.');
 const entries=bibliographyEntries(source,document,effectiveStyle,limits),seen=new Set(),records=[];
 for(const entry of entries){if(seen.has(entry.id))continue;seen.add(entry.id);
  const record=normalizeRecord({id:entry.id,type:'document',state:'partial',...entry.fields,original:entry.raw,citationText:entry.raw,citationParts:[{text:entry.raw}],provenance:[{provider:'Imported bibliography',note:`Source lines ${entry.line}; SHA-256 ${digest(entry.raw)}`} ]});
  const recovered=new Set(entry.diagnostics.filter(item=>item.code==='import-wrapped-identifier-recovered').map(item=>item.value));
  const identifierProposals=record.identifiers.filter(id=>recovered.has(id.value));
  record.identifiers=record.identifiers.filter(id=>!recovered.has(id.value));
  records.push({...record,...(identifierProposals.length&&{identifierProposals}),...(entry.fields.referenceNumber&&{referenceNumber:entry.fields.referenceNumber}),...(entry.fields.sourceSuffix&&{sourceSuffix:entry.fields.sourceSuffix}),...(entry.fields.undated&&{undated:true})});
 }
 const citations=[],diagnostics=[];
 // Imported prose can repeat a page-header DOI across unrelated entries. Keep
 // every source proposal, but give no local record ownership of a disputed ID.
 const claims=new Map();
 for(const record of records)for(const identifier of record.identifiers){
  if(!['doi','isbn'].includes(identifier.scheme))continue;
  const key=canonicalIdentifierKey(identifier);if(!claims.has(key))claims.set(key,new Set());claims.get(key).add(record.id);
 }
 const contested=new Set();
 for(const [key,recordIds] of claims)if(recordIds.size>1){contested.add(key);diagnostics.push({code:'import-conflicting-source-identifier',key,recordIds:[...recordIds]});}
 if(contested.size)for(const record of records)record.identifiers=record.identifiers.filter(identifier=>!contested.has(canonicalIdentifierKey(identifier)));
 for(const {range,extraction} of parts){const localFormat=detectCitationFormat(extraction.text,{limits}),detected=detectExtractedCitations(extraction,{style:effectiveStyle,maxCitations:limits.citationGroups,maxItems:limits.citedItems});diagnostics.push(...detected.diagnostics.map(item=>{
   if(Number.isInteger(item.sourceStart))return {...item,sourceStart:item.sourceStart+range.start,sourceEnd:item.sourceEnd+range.start};
   if(Number.isInteger(item.start)&&Number.isInteger(item.end)&&item.end>item.start){const mapped=mapImportRange(extraction,item);if(mapped.length)return {...item,extractedRange:{start:item.start,end:item.end},start:mapped[0].sourceStart+range.start,end:mapped.at(-1).sourceEnd+range.start,sourceStart:mapped[0].sourceStart+range.start,sourceEnd:mapped.at(-1).sourceEnd+range.start};}
   return item;
  }));
  for(const item of detected.citations){
   if(effectiveStyle==='vancouver'&&localFormat.ignoredNumericRanges.some(ignore=>item.start<ignore.end&&item.end>ignore.start))continue;
   const fragments=item.sourceFragments.map(fragment=>({...fragment,sourceStart:fragment.sourceStart+range.start,sourceEnd:fragment.sourceEnd+range.start}));
   if(!fragments.length)continue;
   citations.push({...item,start:fragments[0].sourceStart,end:fragments.at(-1).sourceEnd,sourceFragments:fragments});
  }
 }
 if(citations.length>limits.citationGroups||citations.reduce((sum,item)=>sum+item.items.length,0)>limits.citedItems)throw new RangeError('Citation review budget exceeded.');
 if(document.boundaryRequired)diagnostics.push({code:'import-bibliography-boundary-required'});
 if(entries.some(entry=>entry.state==='unparsed'))diagnostics.push({code:'import-reference-review-required'});
 return {document:{...document,lines:undefined,blocks:undefined},entries,records,formatDetection,formatChoiceRequired,effectiveStyle,
  detection:{schema:'citation-inator.import-detection.v1',style:effectiveStyle,citations,diagnostics},diagnostics};
}

export function createDocumentImporter(options={}){
 const limits=normalizeImportLimits(options.limits);return {limits,analyze:source=>analyzeImportDocument(source,{...options,limits})};
}
