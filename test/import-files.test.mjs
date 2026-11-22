import test from 'node:test';import assert from 'node:assert/strict';
import {extractImportFile} from '../src/import-files.mjs';
import {officeZip,docx,odt,pdf,textStream} from './fixtures/native-documents.mjs';
import {zipSync,strToU8} from 'fflate';
const extract=(bytes,format,options={})=>extractImportFile(bytes,{filename:'paper.'+format,...options});
test('DOCX extraction measures visible paragraphs, tabs/breaks and unchanged bytes under namespace aliases',async()=>{
 const bytes=officeZip('docx',docx('<z:p><z:r><z:t>A claim (Rivera, 2020).</z:t><z:tab/><z:t>More</z:t><z:br/><z:t>text.</z:t></z:r></z:p><z:p><z:r><z:t>References</z:t></z:r></z:p>',{prefix:'z'})),before=bytes.slice();
 const result=await extract(bytes,'docx');assert.equal(result.text,'A claim (Rivera, 2020).\tMore\ntext.\n\nReferences');assert.deepEqual(bytes,before);assert.equal(result.original.size,bytes.length);assert.equal(result.workingCopy,true);
});
test('ODT namespace aliases preserve counted spaces, tabs, linebreaks and headings',async()=>{
 const bytes=officeZip('odt',odt('<tx:h>References</tx:h><tx:p>A<tx:s tx:c="3"/>B<tx:tab/>C<tx:line-break/>D</tx:p>',{prefix:'tx'}));
 const result=await extract(bytes,'odt');assert.equal(result.text,'References\n\nA   B\tC\nD');
});
test('wrong namespace with a familiar Word prefix is rejected instead of masquerading as supported text',async()=>{
 const bytes=officeZip('docx',docx('<w:p><w:r><w:t>Not WordprocessingML.</w:t></w:r></w:p>',{namespace:'urn:not-word'}));
 await assert.rejects(()=>extract(bytes,'docx'),/namespace|content|unsupported|readable/i);
});
test('office extraction excludes deleted text and preserves visible inserted content',async()=>{
 const xml=docx('<w:p><w:del><w:r><w:delText>Deleted claim.</w:delText></w:r></w:del><w:ins><w:r><w:t>Current claim.</w:t></w:r></w:ins></w:p>');
 assert.equal((await extract(officeZip('docx',xml),'docx')).text,'Current claim.');
});
test('missing, malformed, DTD and invalid UTF-8 main XML fail without fallback extraction',async()=>{
 await assert.rejects(()=>extract(zipSync({'word/other.xml':strToU8('<x/>')}),'docx'),/main content/);
 for(const xml of ['<w:document>','<!DOCTYPE x [<!ENTITY x SYSTEM "file:///etc/passwd">]><x>&x;</x>',Uint8Array.of(0xc3,0x28)])await assert.rejects(()=>extract(officeZip('docx',xml),'docx'));
});
test('declared extraction limits apply to file bytes, decompressed XML and output characters',async()=>{
 const bytes=officeZip('docx',docx('<w:p><w:r><w:t>'+ 'A'.repeat(300)+'</w:t></w:r></w:p>'));
 await assert.rejects(()=>extract(bytes,'docx',{limits:{fileBytes:bytes.length-1}}),/size limit/);
 await assert.rejects(()=>extract(bytes,'docx',{limits:{sourceCharacters:10}}),/extraction limit|import limit/);
 const fake={size:1,arrayBuffer:async()=>new TextEncoder().encode('A'.repeat(30)).buffer};await assert.rejects(()=>extractImportFile(fake,{filename:'paper.txt',limits:{fileBytes:10,sourceCharacters:100}}),/size limit/);
});
test('cancelled inputs and cancellation during async Blob reading cannot produce a partial result',async()=>{
 const controller=new AbortController();controller.abort(new DOMException('Cancelled','AbortError'));await assert.rejects(()=>extract(Uint8Array.of(1),'docx',{signal:controller.signal}),/Cancelled/);
 const later=new AbortController(),fake={size:3,arrayBuffer:async()=>{later.abort(new DOMException('Cancelled','AbortError'));return new TextEncoder().encode('abc').buffer;}};await assert.rejects(()=>extractImportFile(fake,{filename:'paper.txt',signal:later.signal}),/Cancelled/);
});
test('PDF visible text and page order remain usable without modifying the original buffer',async()=>{
 const bytes=pdf([['A claim (Rivera, 2020).','More prose.'],['References','Rivera, R. (2020). A title.']]),before=bytes.slice(),result=await extract(bytes,'pdf');
 assert.ok(result.text.indexOf('A claim')<result.text.indexOf('References'));assert.ok(result.text.includes('Rivera, R. (2020). A title.'));assert.deepEqual(bytes,before);assert.equal(result.metadata.pages,2);assert.ok(result.diagnostics.some(item=>item.code==='import-pdf-reading-order-review-required'));
});
test('image-only PDF rejects with an actionable no-text/OCR error',async()=>{await assert.rejects(()=>extract(pdf(['q Q']),'pdf'),/no extractable text|OCR/i);});
test('rotated content is accounted for explicitly rather than mixed into prose',async()=>{
 const result=await extract(pdf([textStream(['Body text.'])+'\n'+textStream(['WATERMARK'],{rotation:45,x:100,y:100})]),'pdf');assert.ok(result.text.includes('Body text.'));assert.ok(!result.text.includes('WATERMARK'));assert.ok(result.diagnostics.some(item=>item.code==='import-pdf-rotated-text-excluded'));
});
test('repeated legitimate first/last body lines are not silently deleted as page furniture',async()=>{
 const pages=Array.from({length:3},(_,index)=>textStream(['We observed the same theme.','Evidence '+String.fromCharCode(65+index), 'This sentence matters.'],{y:400}));
 const result=await extract(pdf(pages),'pdf');assert.equal(result.text.split('We observed the same theme.').length-1,3);assert.equal(result.text.split('This sentence matters.').length-1,3);
});
test('PDF page count and extracted character limits fail rather than returning truncated text',async()=>{
 await assert.rejects(()=>extract(pdf(Array.from({length:501},()=>['A'])),'pdf'),/500 pages/);
 await assert.rejects(()=>extract(pdf([['A'.repeat(30)]]),'pdf',{limits:{sourceCharacters:10}}),/import limit/);
});
test('DOCX visible citation fields and link targets are retained as opaque metadata',async()=>{
 const instruction='ADDIN ZOTERO_ITEM CSL_CITATION {"citationItems":[{"id":"item-1"}]}',escaped=instruction.replace(/&/gu,'&amp;').replace(/"/gu,'&quot;');
 const xml=docx(`<w:p><w:fldSimple w:instr="${escaped}"><w:r><w:t>(Rivera, 2020)</w:t></w:r></w:fldSimple><w:r><w:instrText>ADDIN ZOTERO_</w:instrText></w:r><w:r><w:instrText>ITEM data</w:instrText></w:r><w:hyperlink r:id="rId1"><w:r><w:t>Paper title</w:t></w:r></w:hyperlink></w:p>`);
 const relationships='<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/hyperlink" Target="https://doi.org/10.5555/a?x=1&amp;y=2" TargetMode="External"/></Relationships>';
 const result=await extract(officeZip('docx',xml,{'word/_rels/document.xml.rels':strToU8(relationships)}),'docx');assert.equal(result.text,'(Rivera, 2020)Paper title');assert.ok(!result.text.includes('ZOTERO'));
 assert.ok(result.metadata.citationFields.some(item=>item.raw===instruction));assert.ok(result.metadata.citationFields.some(item=>item.raw==='ADDIN ZOTERO_'));assert.ok(result.metadata.citationFields.some(item=>item.raw==='ITEM data'));assert.deepEqual(result.metadata.links,[{href:'https://doi.org/10.5555/a?x=1&y=2',label:'Paper title'}]);
});
test('ODT managed-reference marks and links retain namespace-aware opaque provenance',async()=>{
 const name='ZOTERO_ITEM CSL_CITATION {"citationItems":[]}',escaped=name.replace(/"/gu,'&quot;');
 const xml=odt(`<tx:p><tx:reference-mark-start tx:name="${escaped}"/><tx:a xlink:href="https://example.org/reference">(Rivera, 2020)</tx:a></tx:p>`,{prefix:'tx'}),result=await extract(officeZip('odt',xml),'odt');assert.equal(result.text,'(Rivera, 2020)');assert.equal(result.metadata.citationFields[0].raw,name);assert.deepEqual(result.metadata.links,[{href:'https://example.org/reference',label:'(Rivera, 2020)'}]);
});
test('ODT excluded drawing frames do not leak nested paragraph text into body prose',async()=>{
 const xml=odt('<text:p>Body.</text:p><draw:frame xmlns:draw="urn:oasis:names:tc:opendocument:xmlns:drawing:1.0"><draw:text-box><text:p>A hidden diagram label (Rivera, 2020).</text:p></draw:text-box></draw:frame><text:p>References</text:p>');
 assert.equal((await extract(officeZip('odt',xml),'odt')).text,'Body.\n\nReferences');
});
test('PDF rotated excerpts remain recoverable in metadata with page accounting',async()=>{
 const result=await extract(pdf([textStream(['Body text.'])+'\n'+textStream(['Rotated table citation'],{rotation:90,x:100,y:100})]),'pdf');assert.equal(result.metadata.excludedText.find(item=>item.text==='Rotated table citation')?.page,1);
});
test('sequential numbered body headings in the page middle are not mistaken for page numbers',async()=>{
 const pages=Array.from({length:3},(_,index)=>textStream(['Hypothesis '+(index+1),'Observed data '+String.fromCharCode(65+index)],{y:400})),result=await extract(pdf(pages),'pdf');
 for(let number=1;number<=3;number++)assert.ok(result.text.includes('Hypothesis '+number));
});

test('valid office roots cannot authorize foreign descendant prefix shadowing',async()=>{
 const xml=docx('<w:p><w:r><w:t>Real body.</w:t></w:r></w:p><w:p xmlns:w="urn:not-word"><w:r><w:t>A foreign citation (Rivera, 2020).</w:t></w:r></w:p>');
 const result=await extract(officeZip('docx',xml),'docx');assert.equal(result.text,'Real body.');assert.ok(result.metadata.excludedContent.some(item=>item.namespace==='urn:not-word'&&item.text.includes('foreign citation')));assert.ok(result.diagnostics.some(item=>item.code==='import-office-excluded-content-preserved'));
});

test('Node Buffer PDFs extract without detaching or changing caller bytes',async()=>{const bytes=Buffer.from(pdf([['A useful paper.']])),before=Buffer.from(bytes);const result=await extract(bytes,'pdf');assert.match(result.text,/A useful paper/);assert.deepEqual(bytes,before);});
test('repeated page/total footer URLs are excluded but the same DOI in body text is retained',async()=>{const url='https://doi.org/10.5555/article';const pages=Array.from({length:3},(_,i)=>textStream(['Body '+url],{y:400})+'\n'+textStream(['Journal | '+url+' June 1, 2024 '+(i+1)+' / 3'],{y:25}));const result=await extract(pdf(pages),'pdf');assert.equal(result.text.split(url).length-1,3);assert.ok(!result.text.includes('Journal |'));assert.equal(result.metadata.excludedText.filter(x=>x.reason==='page-number-furniture').length,3);});
