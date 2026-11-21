// Experimental full-source text/Markdown import. Original source is never rewritten here.
import {Lexer} from 'marked';
import {createHash} from 'node:crypto';
import {parseReference,parseAPAAuthorList} from './import-references.mjs';
import {extractImportText,detectExtractedCitations,mapImportRange} from './import-extraction.mjs';
import {detectCitationFormat} from './import-format.mjs';
import {normalizeRecord} from './records.mjs';
const digest=text=>createHash('sha256').update(text).digest('hex');
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
  const block={eligible:!html(token),type:token.type,start:offsets[at],end:offsets[until],text:token.text,depth:token.depth,ordered:token.ordered};
  if(token.type==='list'){let itemCursor=at;block.items=token.items.map(item=>{const start=normalized.indexOf(item.raw,itemCursor),end=start+item.raw.length;if(start<itemCursor||end>until)throw new Error('Cannot map reference list to source.');itemCursor=end;return {start:offsets[start],end:offsets[end]};});}
  return block;
 });
}
export function partitionImportDocument(source,{startLine='auto',endLine=null}={}) {
 if(typeof source!=='string'||source.length>100000)throw new TypeError('Use a document of at most 100,000 characters.');
 const lines=sourceLines(source),blocks=markdownBlocks(source),headings=[],eligible=extractImportText(source,{format:'markdown'}).segments;
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
 if(selected&&endLine===null){const next=blocks.find(block=>block.start>=selected.end&&block.type==='heading');if(next)end=next.start;}
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
 if(fields.title&&style==='apa'){
  const titleEnd=parsed.evidence.find(item=>item.field==='title')?.end;
  const tail=titleEnd===undefined?'':raw.slice(titleEnd).replace(/^\.\s*/, '');
  const journal=/^([^,]+),\s*(\d+)(?:\(([^)]+)\))?,\s*(e?\d+(?:[-–]\d+)?)\.?$/u.exec(tail.trim());
  if(journal){fields.type='article-journal';fields.containerTitle=journal[1];fields.volume=journal[2];if(journal[3])fields.issue=journal[3];if(journal[4].startsWith('e'))fields.articleNumber=journal[4];else fields.pages=journal[4];}
 }
 const original=/\b(?:original(?:ly)?(?: work)?|first)\s+published\s+(1[5-9]\d{2}|20\d{2})\b/iu.exec(raw);if(original)fields.originalIssued=[Number(original[1])];
 const diagnostics=parsed.diagnostics.filter(item=>!(fields.authors&&item.code==='import-reference-byline-unparsed')&&!(fields.undated&&item.code==='import-reference-unparsed'));
 return {...parsed,fields,state:Object.keys(fields).length?'partial':'unparsed',diagnostics};
}
function bibliographyEntries(source,document,style) {
 if(!document.bibliography)return [];
 const {entriesStart,end}=document.bibliography;
 const entries=[];
 for(const block of document.blocks.filter(block=>block.end>entriesStart&&block.start<end)){
  if(block.type==='list'){for(const item of block.items)if(item.start>=entriesStart&&item.start<end)entries.push({start:item.start,end:Math.min(item.end,end)});}
  else if(block.type==='paragraph'&&block.eligible){
   const lines=document.lines.filter(line=>line.start>=Math.max(block.start,entriesStart)&&line.start<Math.min(block.end,end)&&line.text.trim());
   const starts=text=>style==='vancouver'?/^\s*[1-9]\d{0,3}\.\s+/u.test(text):style==='apa'?/^[^,\n]+,.*\((?:1[5-9]\d{2}|20\d{2}|n\.d\.)/iu.test(text):/^[^,\n]+,.*\.\s+(?:1[5-9]\d{2}|20\d{2})/u.test(text);
   if(lines.length>100&&lines.every(line=>starts(line.text)))throw new RangeError('Use at most 100 reference entries.');
   if(lines.length>1&&lines.every(line=>starts(line.text)))for(const line of lines)entries.push({start:line.start,end:line.end});
   else entries.push({start:Math.max(block.start,entriesStart),end:Math.min(block.end,end)});
  }
  if(entries.length>100)throw new RangeError('Use at most 100 reference entries.');
 }
 if(entries.length>100)throw new RangeError('Use at most 100 reference entries.');
 return entries.map(entry=>{
  const raw=source.slice(entry.start,entry.end).trimEnd(),line=document.lines.find(line=>line.start<=entry.start&&entry.start<line.end)?.line;
  const bullet=style!=='vancouver'?/^ {0,3}[-+*]\s+/u.exec(raw):null;
  const parsed=entryFields(bullet?raw.slice(bullet[0].length):raw,style);
  const evidence=parsed.evidence.map(item=>({...item,start:item.start+(bullet?.[0].length || 0),end:item.end+(bullet?.[0].length || 0)}));
  return {...parsed,...entry,line,raw,id:'ref-'+digest(raw).slice(0,20),evidence};
 });
}
export function analyzeImportDocument(source,{style='auto',bibliography={}}={}) {
 const document=partitionImportDocument(source,bibliography);
 const parts=document.bodyRanges.filter(range=>range.end>range.start).map(range=>{
  const extraction=extractImportText(source.slice(range.start,range.end),{format:'markdown'});return {range,extraction};
 });
 const visible=parts.map(part=>part.extraction.text).join('\n\n');
 const formatDetection=detectCitationFormat(visible),formatChoiceRequired=style==='auto'&&!formatDetection.style&&visible.trim().length>0;
 const effectiveStyle=style==='auto'?(formatDetection.style||'apa'):style;
 if(!['apa','chicago-author-date','vancouver'].includes(effectiveStyle))throw new TypeError('Choose a supported citation format.');
 const entries=bibliographyEntries(source,document,effectiveStyle),seen=new Set(),records=[];
 for(const entry of entries){if(seen.has(entry.id))continue;seen.add(entry.id);
  const record=normalizeRecord({id:entry.id,type:'document',state:'partial',...entry.fields,original:entry.raw,citationText:entry.raw,citationParts:[{text:entry.raw}],provenance:[{provider:'Imported bibliography',note:`Source lines ${entry.line}; SHA-256 ${digest(entry.raw)}`} ]});
  records.push({...record,...(entry.fields.referenceNumber&&{referenceNumber:entry.fields.referenceNumber}),...(entry.fields.sourceSuffix&&{sourceSuffix:entry.fields.sourceSuffix}),...(entry.fields.undated&&{undated:true})});
 }
 const citations=[],diagnostics=[];
 for(const {range,extraction} of parts){const localFormat=detectCitationFormat(extraction.text),detected=detectExtractedCitations(extraction,{style:effectiveStyle,maxCitations:100,maxItems:300});diagnostics.push(...detected.diagnostics.map(item=>{
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
 if(citations.length>100||citations.reduce((sum,item)=>sum+item.items.length,0)>300)throw new RangeError('Citation review budget exceeded.');
 if(document.boundaryRequired)diagnostics.push({code:'import-bibliography-boundary-required'});
 if(entries.some(entry=>entry.state==='unparsed'))diagnostics.push({code:'import-reference-review-required'});
 return {document:{...document,lines:undefined,blocks:undefined},entries,records,formatDetection,formatChoiceRequired,effectiveStyle,
  detection:{schema:'citation-inator.import-detection.v1',style:effectiveStyle,citations,diagnostics},diagnostics};
}
