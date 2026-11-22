import test from 'node:test';import assert from 'node:assert/strict';
import {partitionImportDocument,analyzeImportDocument} from '../src/import-document.mjs';
import {importDemoRequest} from '../scripts/import-demo-service.mjs';
import {compileCitations} from '../src/compiler.mjs';import {readCache} from '../src/records.mjs';
import {syntheticDocuments as documentExamples} from './fixtures/import-documents.mjs';
const analyze=(source,extra={})=>importDemoRequest({mode:'document',source,style:'auto',...extra});
const preview=(source,result,decisions,extra={})=>importDemoRequest({mode:'document',source,style:'auto',action:'preview',review:result.review,reviewId:result.review.reviewId,decisions,...extra});
test('synthetic edit fixtures derive matching records only from the full source bibliography',()=>{
 const expected={apa:[3,4],chicago:[3,3],numeric:[2,4],undated:[2,2],real:[3,3],books:[1,1]};
 for(const [key,source] of Object.entries(documentExamples)){const result=analyze(source);assert.equal(result.referenceEntries.length,expected[key][0]);assert.equal(result.review.matches.length,expected[key][1]);assert.ok(result.referenceEntries.every(entry=>source.slice(entry.start,entry.start+entry.raw.length)===entry.raw));}
 assert.throws(()=>analyze(documentExamples.apa,{records:[]}),/derives references/);
 assert.throws(()=>analyze(documentExamples.apa,{referenceText:'hidden'}),/derives references/);
});
test('bibliography title, author and year edits change derived targets rather than detached metadata',()=>{
 const source=documentExamples.apa,base=analyze(source),target=base.referenceRecords.find(record=>record.title==='How children learn together');
 const title=analyze(source.replace('How children learn together','A renamed book'));assert.ok(title.referenceRecords.some(record=>record.title==='A renamed book'));assert.ok(!title.referenceRecords.some(record=>record.id===target.id));
 const author=analyze(source.replace('Avery, J. (2021). How','Jones, J. (2021). How'));assert.equal(author.review.matches[0].items[0].candidates.length,1);
 const year=analyze(source.replace('Avery, J. (2021). How','Avery, J. (2022). How'));assert.equal(year.review.matches[0].items[0].candidates.length,1);
 const deleted=analyze(source.replace(/Avery, J\. \(2021\)\. How children learn together\. Example Press\.\n\n/u,''));assert.equal(deleted.referenceEntries.length,2);assert.equal(deleted.review.matches[0].items[0].candidates.length,1);
});
test('reordering references keeps content identity and cannot reuse stale source decisions',()=>{
 const source=documentExamples.apa,base=analyze(source);const fields=base.referenceRecords.find(record=>record.title==='Learning through play');
 const a='Avery, J. (2021). How children learn together. Example Press.',b='Avery, J. (2021). Learning through play. Example Press.';
 const moved=source.replace(a,'TEMP').replace(b,a).replace('TEMP',b),next=analyze(moved);assert.equal(next.referenceRecords.find(record=>record.title===fields.title).id,fields.id);
 assert.throws(()=>preview(moved,base,[{citationIndex:0,action:'accept',recordIds:[fields.id]}]),/changed/);
 const output=preview(moved,next,[{citationIndex:0,action:'accept',recordIds:[fields.id]}]);assert.ok(output.source.includes('{cite local:'+fields.id+'}'));assert.ok(output.source.endsWith(moved.slice(moved.indexOf('## References'))));
});
test('numeric labels are source-derived, out of order and renumbering never uses array position',()=>{
 const result=analyze(documentExamples.numeric);const record=result.referenceRecords.find(record=>record.referenceNumber===2);
 assert.equal(result.review.matches[0].items[0].candidates[0].recordId,record.id);
 const changed=analyze(documentExamples.numeric.replace('7. Bennett','5. Bennett'));assert.equal(changed.review.matches[1].items[0].state,'unmatched');assert.equal(changed.review.matches[0].items[0].candidates[0].recordId,record.id);
});
test('accepted body edits preserve full CRLF bibliography and produce an offline usable cache',()=>{
 const source='😀 A claim (Avery, 2021, p. 4).\r\n\r\n## References\r\n\r\nAvery, J. (2021). A book. Press.\r\n';const result=analyze(source),id=result.referenceRecords[0].id;
 const output=preview(source,result,[{citationIndex:0,action:'accept',recordIds:[id]}]);assert.equal(output.source,'😀 A claim {cite local:'+id+' | locator:"p. 4"}.\r\n\r\n## References\r\n\r\nAvery, J. (2021). A book. Press.\r\n');
 const cache=JSON.parse(JSON.stringify(output.cache));readCache(cache);const clean=compileCitations(output.source+'\n{citation endnote}',cache);assert.ok(clean.html.includes('A book'));assert.ok(!clean.diagnostics.some(item=>item.code==='citation-unresolved'));
});
test('headings in Markdown code, HTML and quotes cannot become bibliography boundaries',()=>{
 for(const fragment of ['<div>\nReferences\n</div>','```txt\n```not-a-close\nReferences\nAvery, J. (2021). Fake.\n```','> References','    References','`multiline\nReferences\nexample`']){
  const source='Before (Avery, 2021).\n\n'+fragment+'\n\nAfter (Bennett, 2020).';const result=analyze(source);assert.equal(result.document.bibliography,null);assert.equal(result.referenceEntries.length,0);assert.equal(result.review.matches.length,2);
 }
});
test('headings inside bibliography code cannot truncate real references',()=>{
 const source='Claim (Avery, 2021).\n\n## References\n\n```txt\n# Not an appendix\n```\n\nAvery, J. (2021). A real entry. Press.\n';const result=analyze(source);assert.equal(result.referenceEntries.length,1);assert.equal(result.referenceRecords[0].title,'A real entry');assert.equal(result.document.bibliography.end,source.length);
});
test('multiple boundaries require a choice, while manual ranges preserve following body',()=>{
 const source='Claim (Avery, 2021).\n\nReferences\n\nAvery, J. (2021). A book. Press.\n\n## Appendix\n\nAnother (Bennett, 2020).\n\nBibliography\n\nBennett, S. (2020). Another book.\n';const uncertain=analyze(source);assert.equal(uncertain.document.boundaryRequired,true);assert.throws(()=>preview(source,uncertain,[]),/boundary/);
 const selected=analyze(source,{bibliography:{startLine:3}});assert.equal(selected.referenceEntries.length,1);assert.ok(selected.review.matches.some(match=>match.citation.raw==='(Bennett, 2020)'));assert.ok(selected.document.bibliography.end<source.length);
 assert.throws(()=>partitionImportDocument(source,{startLine:3,endLine:2}),/end/);
});
test('custom boundaries can start within a paragraph or an ordered list',()=>{
 const a=analyze('Body (Avery, 2021).\nAvery, J. (2021). A book. Press.',{bibliography:{startLine:2}});assert.equal(a.referenceEntries.length,1);assert.equal(a.review.matches.length,1);
 const b=analyze('1. First raw entry.\n2. Second raw entry.',{style:'vancouver',bibliography:{startLine:2}});assert.equal(b.referenceEntries.length,1);assert.equal(b.referenceRecords[0].referenceNumber,2);
});
test('unsupported Chicago conjunctions do not become one complete given name',()=>{
 const bad=analyze('(Smith 2021).\n\nReferences\n\nSmith, John and Sarah Jones. 2021. A book.');assert.equal(bad.referenceRecords[0].authors.length,0);assert.equal(bad.review.matches[0].items[0].state,'unmatched');
 const good=analyze('(Smith and Jones 2021).\n\nReferences\n\nSmith, John, and Sarah Jones. 2021. A book.');assert.deepEqual(good.referenceRecords[0].authors.map(author=>author.family),['Smith','Jones']);assert.equal(good.review.matches[0].items[0].state,'unique');
});
test('uncertain Markdown source mappings and code examples remain unchanged',()=>{
 const source='A claim (**Avery**, 2021).\n\n`(Avery, 2021)`\n\n## References\n\nAvery, J. (2021). A book. Press.';const result=analyze(source);assert.equal(result.review.matches.length,1);const id=result.referenceRecords[0].id;const output=preview(source,result,[{citationIndex:0,action:'accept',recordIds:[id]}]);assert.equal(output.source,source);assert.equal(output.outcomes[0].state,'accepted-needs-adapter');
});
test('wrapped reference paragraphs and unknown entries remain inspectable raw source',()=>{
 const source='Claim (Avery, 2021).\n\nReferences\n\nAvery, J. (2021). A title\ncontinued on another line. Press.\n\nUnknown archive entry without date.\n';const result=analyze(source);assert.equal(result.referenceEntries.length,2);assert.ok(result.referenceEntries[0].raw.includes('\ncontinued'));assert.equal(result.referenceEntries[1].state,'unparsed');assert.equal(result.referenceRecords[1].authors.length,0);
});

test('Chicago later-author family particles are preserved and ambiguous compound names stay raw',()=>{
 for(const family of ['de Waal','van Schaik','van der Meer']){const source='(Smith and '+family+' 2021).\n\nReferences\n\nSmith, John, and Anna '+family+'. 2021. A book.';const result=analyze(source);assert.equal(result.referenceRecords[0].authors[1].family,family);assert.equal(result.review.matches[0].items[0].state,'unique');const wrong=analyze(source.replace('(Smith and '+family,'(Smith and '+family.split(' ').at(-1)));assert.equal(wrong.review.matches[0].items[0].state,'unmatched');}
 const uncertain=analyze('(Smith and Márquez 2021).\n\nReferences\n\nSmith, John, and Gabriel García Márquez. 2021. A book.');assert.equal(uncertain.referenceRecords[0].authors.length,0);assert.equal(uncertain.review.matches[0].items[0].state,'unmatched');
});

test('textarea editing preserves untouched mixed source newlines',async()=>{
 const {textView,editTextSource}=await import('../demos/import/text-source.mjs');const raw='😀 Before\r\nReferences\nAvery\rDone';assert.equal(editTextSource(raw,textView(raw)),raw);assert.equal(editTextSource(raw,textView(raw).replace('Avery','Jones')),'😀 Before\r\nReferences\nJones\rDone');assert.equal(editTextSource('one\r\ntwo','one\nnew\ntwo'),'one\r\nnew\r\ntwo');
});

test('plain reference headings need no blank line after them and retain the first entry',()=>{
 const source='Claim (Avery, 2021).\n\nReferences\nAvery, J. (2021). A book. Press.\nBennett, S. (2020). Another book.';const result=analyze(source);assert.equal(result.referenceEntries.length,2);assert.equal(result.referenceRecords[0].title,'A book');assert.equal(result.review.matches[0].items[0].state,'unique');
});

test('unparsed numeric references export usable raw citations without invented title or date fields',()=>{
 const source='Two sources [2, 7].\n\nReferences\n\n7. Bennett S. Raw seventh entry. 2019.\n\n2. Avery J. Raw second entry. 2021.';const result=analyze(source),ids=result.review.matches[0].items.map(item=>item.candidates[0].recordId);const output=preview(source,result,[{citationIndex:0,action:'accept',recordIds:ids}]);assert.ok(output.cache.records.every(record=>record.title===''&&record.issued===null&&record.state==='partial'));const clean=compileCitations(output.source+'\n{citation endnote}',JSON.parse(JSON.stringify(output.cache)),{citationStyle:'vancouver'});assert.ok(clean.html.includes('Raw seventh entry'));assert.ok(clean.html.includes('Raw second entry'));assert.ok(!clean.diagnostics.some(item=>item.code==='citation-unresolved'));
});

test('explicit Anonymous byline and original year match without inventing a person',()=>{
 const result=analyze('A tool (Anonymous, 2025/2025).\n\nReferences\nAnonymous. (2025). A tool [Computer software]. https://example.org (Original work published 2025)');
 assert.deepEqual(result.referenceRecords[0].authors,[{literal:'Anonymous'}]);assert.equal(result.review.matches[0].items[0].state,'unique');
});

test('numeric bibliography wrapped year stays with its preceding reference',()=>{const a=analyzeImportDocument('A claim [19, 20].\n\nReferences\n\n19. World Health Organisation. Service availability report.\n2017.\n20. Smith A. Other work. 2020.',{style:'vancouver',limits:{references:2}});assert.equal(a.records.length,2);assert.match(a.referenceEntries?.[0]?.raw || a.entries?.[0]?.raw || '',/2017/);});

test('line-wrapped DOI fragments are withheld instead of becoming known identifiers',()=>{for(const fragment of ['10.1016/S0140-\n6736(15)00946-0','10.1371/journal.\npone.0224511','10.7189/jogh.09.\n010406']){const a=analyzeImportDocument('A claim [1].\n\nReferences\n\n1. Smith A. A paper. 2020. https://doi.org/'+fragment,{style:'vancouver'});assert.equal(a.records[0].identifiers.length,0);assert.ok(a.entries[0].diagnostics.some(d=>d.code==='import-wrapped-identifier-review-required'));}const a=analyzeImportDocument('A claim [1].\n\nReferences\n\n1. Smith A. A paper. 2020. https://doi.org/10.5555/complete.\nPMID: 12345',{style:'vancouver'});assert.equal(a.records[0].identifiers[0].value,'10.5555/complete');});

test('formatted reference autolinks cannot restore withheld wrapped DOI fragments',()=>{for(const [style,body,ref] of [['apa','(Smith, 2020)','Smith, A. (2020).'],['chicago-author-date','(Smith 2020)','Smith, Alex. 2020.']]){const a=analyzeImportDocument('A claim '+body+'.\n\nReferences\n\n'+ref+' A paper. https://doi.org/10.1371/journal.\npone.0224511',{style});assert.equal(a.records[0].identifiers.length,0);assert.ok(a.entries[0].diagnostics.some(d=>d.code==='import-wrapped-identifier-review-required'));}});
