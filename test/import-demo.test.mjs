import test from 'node:test';import assert from 'node:assert/strict';import {importDemoRequest} from '../scripts/import-demo-service.mjs';
const records=[{id:'avery',type:'book',title:'Synthetic',state:'resolved',authors:[{family:'Avery'}],issued:[2021]}];
test('local demo explicitly reviews and previews edits without changing source or records',()=>{
 const source='Before (Avery, 2021). Unknown (Missing, 2000).';const before=JSON.stringify(records);
 const {review}=importDemoRequest({source,records});
 const result=importDemoRequest({action:'preview',source,records,review,reviewId:review.reviewId,decisions:[{citationIndex:0,action:'accept',recordIds:['avery']},{citationIndex:1,action:'defer'}]});
 assert.equal(result.source,'Before {cite avery}. Unknown (Missing, 2000).');assert.ok(result.html.includes('data-ci-record="avery"'));assert.equal(JSON.stringify(records),before);
 assert.throws(()=>importDemoRequest({action:'preview',source:source+' edited',records,review,reviewId:review.reviewId,decisions:[]}),/changed/);
 assert.throws(()=>importDemoRequest({action:'preview',source,records:[{...records[0],title:'Changed'}],review,reviewId:review.reviewId,decisions:[]}),/changed/);
});
test('demo keeps parsed reference proposals separate and escapes authored HTML in its reading preview',()=>{
 const source='<img src=x onerror=alert(1)> (Avery, 2021)';const input={source,records,referenceText:'Avery, J. (2021). Synthetic. Press.'};
 const analysis=importDemoRequest(input);assert.equal(analysis.parsedReferences.entries[0].fields.title,'Synthetic');
 const result=importDemoRequest({...input,action:'preview',review:analysis.review,reviewId:analysis.review.reviewId,decisions:[]});
 assert.ok(result.html.includes('&lt;img'));assert.ok(!result.html.includes('<img src=x'));
 assert.throws(()=>importDemoRequest({source,records,style:'wrong'}),/Choose/);
});

test('demo review binds every supplied record field, formatting style and reference text',()=>{
 const source='(Avery, 2021)';const input={source,records,style:'apa',referenceText:'A supplied entry'};
 const {review}=importDemoRequest(input);
 for(const change of [{style:'chicago-author-date'},{records:[{...records[0],publisher:'Changed'}]},{records:[{...records[0],authors:[{family:'Avery',given:'Changed'}]}]},{records:[{...records[0],identifiers:[{scheme:'doi',value:'10.1234/changed'}]}]},{referenceText:'Changed entry'}]) {
  assert.throws(()=>importDemoRequest({...input,...change,action:'preview',review,reviewId:review.reviewId,decisions:[]}),/changed/);
 }
});

test('demo bounds numeric expansion and candidate-choice fanout before cloning review data',()=>{
 const numbered=Array.from({length:100},(_,index)=>({...records[0],id:`ref-${index}`,referenceNumber:index+1}));
 assert.throws(()=>importDemoRequest({source:'[1–100] '.repeat(50),style:'vancouver',records:numbered}),/budget/);
 const sameAuthor=numbered.map(({referenceNumber,...record})=>record);
 assert.throws(()=>importDemoRequest({source:'(Avery, 2021) '.repeat(31),records:sameAuthor}),/candidate/);
});

test('partial numeric conversion does not show mixed old/new numbers as a reading preview',()=>{
 const source='One [2]. Another [7].';const numbered=[{...records[0],referenceNumber:2},{...records[0],id:'second',referenceNumber:7}];
 const input={source,records:numbered,style:'vancouver'};const {review}=importDemoRequest(input);
 const result=importDemoRequest({...input,action:'preview',review,reviewId:review.reviewId,decisions:[{citationIndex:0,action:'accept',recordIds:['avery']}]});
 assert.equal(result.html,'');assert.match(result.previewNotice,/original reference numbers/);assert.ok(result.source.includes('[7]'));
});

test('demo exposes the actual supplied matching records; parsed raw lines do not invent candidates',()=>{
 const result=importDemoRequest({source:'(Avery, 2021) (Other, 2022)',records,referenceText:'Other, J. (2022). A raw entry. Press.'});
 assert.equal(result.referenceRecords.length,1);assert.equal(result.referenceRecords[0].id,'avery');assert.equal(result.referenceRecords[0].title,'Synthetic');
 assert.equal(result.review.matches[1].items[0].state,'unmatched');assert.equal(result.parsedReferences.entries[0].fields.authors[0].family,'Other');
});

test('demo previews manual identifiers and preserves explicitly rejected citations without looking up records',()=>{
 const source='Unknown (Missing, 2000). Keep (Avery, 2021).';const input={source,records};const {review}=importDemoRequest(input);
 const result=importDemoRequest({...input,action:'preview',review,reviewId:review.reviewId,decisions:[{citationIndex:0,action:'accept',targets:[{identifier:'9780140328721'}]},{citationIndex:1,action:'reject'}]});
 assert.match(result.source,/isbn:9780140328721/);assert.ok(result.source.endsWith('Keep (Avery, 2021).'));assert.equal(result.cache.records.length,records.length);assert.equal(result.outcomes[1].state,'reject');
});

test('real lookup example withholds identifiers while preserving article metadata and correction identity',async()=>{
 const {realReferenceExample:input}=await import('../demos/import/real-reference-example.mjs');
 const {readFile}=await import('node:fs/promises');const key=JSON.parse(await readFile(new URL('../demos/import/real-reference-answer-key.json',import.meta.url),'utf8'));
 assert.ok(input.records.every(record=>record.identifiers.length===0));assert.ok(!input.referenceText.includes('10.'));
 const {review,referenceRecords}=importDemoRequest(input);assert.equal(review.matches.length,3);assert.ok(review.matches.every(match=>match.items[0].state==='unique'));
 assert.equal(referenceRecords[0].containerTitle,'PLOS Medicine');assert.equal(referenceRecords[0].pages,'e124');assert.equal(referenceRecords[1].pages,'e1004085');
 assert.deepEqual(review.matches.map(match=>match.items[0].candidates[0].recordId),input.records.map(record=>record.id));
 assert.equal(new Set(key.records.map(record=>record.doi)).size,3);assert.ok(key.records.every(answer=>input.records.some(record=>record.id===answer.recordId)));
});
