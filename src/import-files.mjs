// Native inputs become an editable text working copy; original bytes stay with the host.
import {unzipSync} from 'fflate';
import {DOMParser} from '@xmldom/xmldom';
import {normalizeImportLimits} from './import-limits.mjs';
import {importHash} from './import-hash.mjs';
const decoder=new TextDecoder('utf-8',{fatal:true});
const children=node=>Array.from(node?.childNodes || []);
const attr=(node,name)=>{const colon=name.indexOf(':');if(colon<0)return node.getAttribute?.(name);const ns={text:'urn:oasis:names:tc:opendocument:xmlns:text:1.0',xlink:'http://www.w3.org/1999/xlink',r:'http://schemas.openxmlformats.org/officeDocument/2006/relationships',w:'http://schemas.openxmlformats.org/wordprocessingml/2006/main'};return node.getAttributeNS?.(ns[name.slice(0,colon)],name.slice(colon+1)) || node.getAttribute?.(name);};
const text=node=>node.textContent || '';
const tagName=node=>{const uri=node.namespaceURI || '',local=node.localName?.toLowerCase();return uri==='http://schemas.openxmlformats.org/wordprocessingml/2006/main'?'w:'+local:uri==='urn:oasis:names:tc:opendocument:xmlns:text:1.0'?'text:'+local:uri==='urn:oasis:names:tc:opendocument:xmlns:office:1.0'?'office:'+local:uri==='urn:oasis:names:tc:opendocument:xmlns:drawing:1.0'?'draw:'+local:'';};
const abort=signal=>{if(signal?.aborted)throw signal.reason || new DOMException('Import cancelled.','AbortError');};
function xmlTree(bytes){const source=decoder.decode(bytes);if(/<!\s*(?:DOCTYPE|ENTITY)\b/iu.test(source))throw Error('Document declarations and external entities are not supported.');return new DOMParser({onError:()=>{throw Error('Malformed document XML.');}}).parseFromString(source,'application/xml');}
// A separate opt-in Markdown projection keeps plain-text offsets/API consumers stable.
const escapeInline=value=>value.replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;');
function wordInline(node){
 const tag=tagName(node);if(node.nodeType===3)return '';
 if(!tag.startsWith('w:')||['w:del','w:instrtext','w:rpr','w:ppr','w:drawing','w:pict'].includes(tag))return '';
 if(tag==='w:t')return escapeInline(text(node));if(tag==='w:tab')return '\t';if(tag==='w:br')return '\n';
 let value=children(node).map(wordInline).join('');
 if(tag==='w:r'&&value.trim()){
  const properties=children(node).find(child=>tagName(child)==='w:rpr');
  const enabled=name=>{const property=children(properties).find(child=>tagName(child)==='w:'+name);return property&&!['0','false','off','none'].includes(attr(property,'w:val'));};
  const vertical=children(properties).find(child=>tagName(child)==='w:vertalign'),position=vertical&&attr(vertical,'w:val');
  for(const [name,html] of [['b','strong'],['i','em'],['u','u'],['strike','s']])if(enabled(name))value='<'+html+'>'+value+'</'+html+'>';
  if(position==='superscript'||position==='subscript'){const html=position==='superscript'?'sup':'sub';value='<'+html+'>'+value+'</'+html+'>';}
 }
 return value;
}
function officeText(bytes,format,limits){
 const target=format==='docx'?'word/document.xml':'content.xml',relationships='word/_rels/document.xml.rels',cap=Math.min(limits.archiveEntryBytes,limits.sourceCharacters*12);let found=false;const seen=new Set();
 const files=unzipSync(bytes,{filter:entry=>{if(![target,relationships].includes(entry.name))return false;if(seen.has(entry.name))throw Error('Duplicate document content.');seen.add(entry.name);if(entry.name===target)found=true;if(entry.originalSize>cap||entry.size>limits.fileBytes)throw Error('Document content exceeds the extraction limit.');return true;}});
 if(!files[target])throw Error('The document has no readable main content.');if(files[target].length>cap)throw Error('Document content exceeds the extraction limit.');
 const root=xmlTree(files[target]);const expected=format==='docx'?'http://schemas.openxmlformats.org/wordprocessingml/2006/main':'urn:oasis:names:tc:opendocument:xmlns:office:1.0';if(root.documentElement.namespaceURI!==expected)throw Error('Unsupported document namespace.');
 const paragraphs=[],markdownParagraphs=[],fields=[],links=[],excludedContent=[],relations=new Map();let count=0,metadataSize=0;
 if(format==='docx'&&files[relationships]){const doc=xmlTree(files[relationships]);for(const entry of Array.from(doc.getElementsByTagName('*')))if(entry.localName==='Relationship')relations.set(entry.getAttribute('Id'),entry.getAttribute('Target'));}
 const knownNamespaces=new Set(['http://schemas.openxmlformats.org/wordprocessingml/2006/main','urn:oasis:names:tc:opendocument:xmlns:text:1.0','urn:oasis:names:tc:opendocument:xmlns:office:1.0','urn:oasis:names:tc:opendocument:xmlns:drawing:1.0']);
 const foreign=node=>node.nodeType===1&&!knownNamespaces.has(node.namespaceURI);
 const exclude=node=>{const value=text(node);metadataSize+=value.length;if(metadataSize>limits.sourceCharacters)throw Error('Document metadata exceeds the extraction limit.');excludedContent.push({kind:tagName(node)||'unsupported-namespace',namespace:node.namespaceURI,text:value});};
 const field=value=>{metadataSize+=value.raw.length;if(fields.length>=limits.citedItems||metadataSize>limits.sourceCharacters)throw Error('Citation metadata exceeds the extraction limit.');fields.push(value);};
 const extract=node=>{
  if(++count>limits.sourceCharacters*3)throw Error('Document structure exceeds the extraction limit.');
  const tag=tagName(node);if(foreign(node)){exclude(node);return '';}
  if(tag==='w:fldsimple'&&attr(node,'w:instr'))field({kind:'word-field',raw:attr(node,'w:instr')});
  if(tag==='w:hyperlink'||tag==='text:a'){const href=tag==='w:hyperlink'?relations.get(attr(node,'r:id')):attr(node,'xlink:href');if(href){const label=text(node);metadataSize+=href.length+label.length;if(links.length>=limits.citedItems*4||metadataSize>limits.sourceCharacters)throw Error('Citation metadata exceeds the extraction limit.');links.push({href,label});}}
  if(['text:reference-mark-start','text:bookmark-start'].includes(tag)&&/ZOTERO|CSL_CITATION|MENDELEY/iu.test(attr(node,'text:name') || ''))field({kind:'opendocument-field',raw:attr(node,'text:name')});
  if(['w:rpr','w:ppr','w:del','w:instrtext','text:tracked-changes','office:annotation','draw:frame','script'].includes(tag)){if(tag==='w:instrtext')field({kind:'word-field-chunk',raw:text(node)});return '';}
  if(tag==='w:t'||node.nodeName==='#text'&&format==='odt')return text(node);
  if(tag==='w:tab'||tag==='text:tab')return '\t';if(tag==='w:br'||tag==='text:line-break')return '\n';
  if(tag==='text:s'){const length=Number(attr(node,'text:c') || 1);if(!Number.isSafeInteger(length)||length<1||length>1000)throw Error('Unsupported space run.');return ' '.repeat(length);}
  return children(node).map(extract).join('');
 };
 const visit=node=>{const tag=tagName(node);if(foreign(node)){exclude(node);return;}if(['w:del','text:tracked-changes','office:annotation','draw:frame'].includes(tag)){exclude(node);return;}if(format==='docx'&&tag==='w:p'||format==='odt'&&['text:p','text:h'].includes(tag)){paragraphs.push(extract(node));if(format==='docx')markdownParagraphs.push(wordInline(node));return;}for(const child of children(node))visit(child);};visit(root);
 const source=paragraphs.join('\n\n');if(!source.trim())throw Error('This document has no readable main text.');if(source.length>limits.sourceCharacters)throw Error('Extracted text exceeds the import limit.');
 const markdown=format==='docx'?markdownParagraphs.join('\n\n'):undefined;if(markdown?.length>limits.sourceCharacters)throw Error('Formatted working copy exceeds the import limit.');
 return {text:source,...(markdown!==undefined&&{markdown,workingCopyFormat:'markdown'}),metadata:{citationFields:fields,links,excludedContent},diagnostics:[{code:'import-native-working-copy',format},...(fields.length?[{code:'import-managed-citation-fields-preserved',count:fields.length}]:[]),...(excludedContent.length?[{code:'import-office-excluded-content-preserved',count:excludedContent.length}]:[])]};
}
async function pdfText(bytes,{limits,signal,pdfWorkerSrc}){
 const pdfjs=await import('pdfjs-dist/legacy/build/pdf.mjs');abort(signal);
 // Copied browser distributions keep the worker next to this optional bundle.
 if(pdfWorkerSrc)pdfjs.GlobalWorkerOptions.workerSrc=pdfWorkerSrc;
 else if(typeof window!=='undefined')pdfjs.GlobalWorkerOptions.workerSrc=new URL('./citation-pdf.worker.mjs',import.meta.url).href;
 const task=pdfjs.getDocument({data:new Uint8Array(bytes),isEvalSupported:false,useSystemFonts:false,disableFontFace:true,stopAtErrors:true,verbosity:0});
 const cancel=()=>void task.destroy();signal?.addEventListener('abort',cancel,{once:true});
 let document;
 try{
  document=await task.promise;abort(signal);if(document.numPages>limits.pdfPages)throw Error('Use a PDF with at most '+limits.pdfPages+' pages.');
  const pages=[],diagnostics=[],metadata={pages:document.numPages,citationFields:[],excludedText:[]};let length=0;
  for(let number=1;number<=document.numPages;number++){
   abort(signal);const page=await document.getPage(number),content=await page.getTextContent(),lines=[],edgeLines=new Set();let line='',last=null,rotated=0;
   const addLine=()=>{if(!line.trim())return;const value=line.trimEnd();lines.push(value);if(last&&(last.y-page.view[1]<64||page.view[3]-last.y<64))edgeLines.add(value);};
   for(const item of content.items){if(typeof item.str!=='string')continue;const [a,b,,,x,y]=item.transform;
    // Do not mix diagonal watermarks into horizontal prose; report excluded material.
    if(Math.abs(Math.atan2(b,a))>.02){rotated++;length+=item.str.length;if(length>limits.sourceCharacters)throw Error('Extracted text exceeds the import limit.');metadata.excludedText.push({page:number,text:item.str,x,y,reason:'rotated'});continue;}
    if(last&&Math.abs(y-last.y)>Math.max(2,Math.abs(item.transform[3])*.35)){addLine();line='';}
    else if(last&&line&&x>last.right+Math.max(1,Math.abs(a)*.12)&&!line.endsWith(' '))line+=' ';
    line+=item.str;last={y,right:x+item.width};if(item.hasEOL){addLine();line='';last=null;}
   }
   addLine();const source=lines.join('\n');length+=source.length+2;if(length>limits.sourceCharacters)throw Error('Extracted text exceeds the import limit.');
   pages.push({number,text:source,edgeLines});if(rotated)diagnostics.push({code:'import-pdf-rotated-text-excluded',page:number,items:rotated});page.cleanup();
  }
  // Repeated page furniture otherwise becomes prose or corrupts the bibliography.
  const repeated=new Map();for(const page of pages){const lines=page.text.split('\n').filter(Boolean);for(const line of new Set([lines[0],lines.at(-1)].filter(Boolean))){const match=/^([\p{L} .–—-]{0,70}?)\s*(\d{1,4})$/u.exec(line);if(!match||!page.edgeLines.has(line))continue;const key=match[1]+'#offset'+(Number(match[2])-page.number);const entry=repeated.get(key)||{count:0,lines:new Set()};entry.count++;entry.lines.add(line);repeated.set(key,entry);}}
  // A repeated edge footer with this page/total is furniture even when it contains a URL/date.
  const fractions=new Map();for(const page of pages)for(const line of page.edgeLines){const match=/^(.*\S)\s+(\d{1,4})\s*\/\s*(\d{1,4})$/u.exec(line);if(!match||Number(match[2])!==page.number||Number(match[3])!==pages.length)continue;const key=match[1],entry=fractions.get(key)||{count:0,lines:new Set()};entry.count++;entry.lines.add(line);fractions.set(key,entry);}
  const fractionFurniture=new Set([...fractions.values()].filter(entry=>entry.count>=3&&entry.count>=pages.length*.5).flatMap(entry=>[...entry.lines]));
  const furniture=new Set([...repeated.values()].filter(entry=>entry.count>=3&&entry.count>=pages.length*.5&&entry.lines.size>=3).flatMap(entry=>[...entry.lines]));
  const source=pages.map(page=>page.text.split('\n').filter((line,index,lines)=>{const removed=page.edgeLines.has(line)&&(fractionFurniture.has(line)||(index===0||index===lines.length-1)&&furniture.has(line));if(removed)metadata.excludedText.push({page:page.number,text:line,reason:'page-number-furniture'});return !removed;}).join('\n')).join('\n\n');
  if(!source.trim())throw Error('This PDF has no extractable text. Paste text from an OCR tool.');
  if(furniture.size||fractionFurniture.size)diagnostics.push({code:'import-pdf-repeated-page-furniture-excluded',patterns:furniture.size+fractionFurniture.size});
  return {text:source,metadata,diagnostics:[{code:'import-native-working-copy',format:'pdf'},...diagnostics,{code:'import-pdf-reading-order-review-required'}]};
 }finally{signal?.removeEventListener('abort',cancel);await task.destroy();}
}
/** File/Blob or bytes plus filename. No file URLs, network fetches, rendering, OCR or native-file writes. */
export async function extractImportFile(input,{filename=input?.name || '',limits:overrides,signal,pdfWorkerSrc}={}){
 const limits=normalizeImportLimits(overrides);abort(signal);
 const size=input?.size ?? input?.byteLength;if(!Number.isSafeInteger(size)||size<1||size>limits.fileBytes)throw Error('Use a file within the configured import size limit.');
 const bytes=input instanceof Uint8Array?input:input instanceof ArrayBuffer?new Uint8Array(input):typeof input?.arrayBuffer==='function'?new Uint8Array(await input.arrayBuffer()):null;if(!bytes)throw TypeError('Supply a File, Blob or byte array.');if(bytes.byteLength>limits.fileBytes)throw Error('File exceeds the configured import size limit.');abort(signal);
 const extension=/\.([^.]+)$/u.exec(filename)?.[1]?.toLowerCase();let result,format=extension;
 if(['txt','md','markdown'].includes(extension)){const source=decoder.decode(bytes);if(source.length>limits.sourceCharacters)throw Error('Extracted text exceeds the import limit.');result={text:source,metadata:{citationFields:[]},diagnostics:[]};format=extension==='txt'?'text':'markdown';}
 else if(['docx','odt'].includes(extension)){if(bytes[0]!==80||bytes[1]!==75)throw Error('This is not a readable office document.');result=officeText(bytes,extension,limits);}
 else if(extension==='pdf'){if(decoder.decode(bytes.slice(0,5))!=='%PDF-')throw Error('This is not a readable PDF.');result=await pdfText(bytes,{limits,signal,pdfWorkerSrc});}
 else throw Error('Choose a TXT, Markdown, PDF, DOCX or ODT file.');
 abort(signal);return {schema:'citation-inator.import-file.v1',format,...result,sourceHash:importHash(result.text),original:{filename,size:bytes.length},workingCopy:true};
}
