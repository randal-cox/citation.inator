import test from 'node:test';import assert from 'node:assert/strict';
import {processImportRequest} from '../src/import-api.mjs';import {makeCache,readCache} from '../src/records.mjs';
const book={id:'bell-1992-ritual',type:'book',title:'Ritual theory, ritual practice',authors:[{family:'Bell',given:'Catherine'}],issued:[1992],state:'resolved',identifiers:[{scheme:'doi',value:'10.5555/ritual'}]};
const source='A claim (Bell, 1992).\n\nReferences\nBell, C. (1992). Ritual theory, ritual practice. Oxford University Press.';
const base={source,mode:'document',style:'apa',siteCache:makeCache([book])};
function preview(a,extra={},context=base){return processImportRequest({...context,action:'preview',review:a.review,reviewId:a.review.reviewId,decisions:[{citationIndex:0,action:'accept',targets:[{recordId:a.referenceRecords[0].id}]}],...extra});}
test('site identities stay reviewable; explicit reuse keeps existing ID and metadata without duplicate work',()=>{
 const a=processImportRequest(base),id=a.referenceRecords[0].id;assert.equal(a.siteMatches[0].candidates[0].recordId,book.id);assert.equal(a.siteMatches[0].candidates[0].requiresReview,true);
 const p=preview(a,{recordDecisions:[{recordId:id,siteRecordId:book.id}]});assert.match(p.source,/\{cite bell-1992-ritual\}/);assert.equal(p.cache.records.length,1);assert.deepEqual(p.cache.records[0],base.siteCache.records[0]);assert.deepEqual(p.newRecordIds,[]);assert.deepEqual(p.reusedRecordIds,[book.id]);
 const separate=preview(a);assert.notEqual(separate.recordMap[id],book.id);assert.equal(separate.cache.records.length,2);
});
test('site cache changes invalidate decisions; arbitrary reuse or duplicate choices are rejected',()=>{
 const a=processImportRequest(base),id=a.referenceRecords[0].id;assert.throws(()=>preview(a,{}, {...base,siteCache:makeCache([{...book,title:'Changed'}])}),/changed/);
 assert.throws(()=>preview(a,{recordDecisions:[{recordId:id,siteRecordId:'missing'}]}),/proposed/);assert.throws(()=>preview(a,{recordDecisions:[{recordId:id,siteRecordId:book.id},{recordId:id,siteRecordId:book.id}]}),/one site|one proposed/);
});
test('host ID mapping and allocator write safe local notation and valid cache IDs',()=>{
 const a=processImportRequest(base),id=a.referenceRecords[0].id;let taken;
 const p=preview(a,{recordId:(record,context)=>{taken=context.taken;record.title='Mutation';return 'new-bell';}});assert.match(p.source,/new-bell/);assert.equal(p.recordMap[id],'new-bell');assert.ok(taken.includes(book.id));assert.equal(p.cache.records.find(r=>r.id==='new-bell').title,'Ritual theory, ritual practice');readCache(p.cache);
 const mapped=preview(a,{recordIds:{[id]:'mapped-bell'}});assert.match(mapped.source,/mapped-bell/);
 for(const value of [book.id,'bad | id','doi:10.5555/ritual','local:prefixed',null])assert.throws(()=>preview(a,{recordId:()=>value}),/valid and distinct/);
 assert.throws(()=>preview(a,{recordIds:{missing:'new'}}),/only for new/);
});
test('shared canonical identity is offered but never reused automatically; existing cache keeps canonical ownership',()=>{
 const context={...base,source:source.replace('Oxford University Press.','https://doi.org/10.5555/ritual')},a=processImportRequest(context),id=a.referenceRecords[0].id;
 assert.equal(a.siteMatches[0].candidates[0].evidence.code,'import-site-shared-identifier');const p=preview(a,{recordIds:{[id]:'new-copy'}},context);readCache(p.cache);assert.deepEqual(p.cache.records[0],context.siteCache.records[0]);assert.match(p.source,/new-copy/);assert.equal(p.cache.records.find(r=>r.id==='new-copy').identifiers.length,0);
});

test('manual completion IDs cannot overwrite source allocation identities',()=>{
 const context={mode:'document',style:'apa',siteCache:makeCache([]),source:'A (Bell, 1992). B (Other, 2001).\n\nReferences\n'+source.split('References\n')[1]+'\nOther, A. (2001). Other work. Press.'},a=processImportRequest(context),id=a.referenceRecords[0].id;let called=false;
 assert.throws(()=>processImportRequest({...context,action:'preview',review:a.review,reviewId:a.review.reviewId,decisions:[{citationIndex:0,action:'accept',targets:[{recordId:id}]},{citationIndex:1,action:'accept',targets:[{identifier:'doi:10.5555/other'}]}],completions:[{record:{...book,id,title:'WRONG OTHER WORK',identifiers:[{scheme:'doi',value:'10.5555/other'}]}}],recordId:()=>{called=true;return 'new';}}),/must be distinct/);assert.equal(called,false);
});
test('legacy recordIds decisions retain accepted completion metadata with host IDs',()=>{const context={...base,siteCache:makeCache([])},a=processImportRequest(context),id=a.referenceRecords[0].id;const p=preview(a,{decisions:[{citationIndex:0,action:'accept',recordIds:[id]}],recordIds:{[id]:'bell-new'},completions:[{recordId:id,record:book}]},context);assert.equal(p.cache.records.find(r=>r.id==='bell-new').identifiers[0].value,'10.5555/ritual');});

test('site proposals survive subtitle, type and given-name differences in either direction without automatic reuse',()=>{
 for(const [sourceTitle,siteTitle] of [['The ritual process: Structure and anti-structure','The Ritual Process'],['The Ritual Process','The ritual process: Structure and anti-structure']]){
  const context={mode:'document',style:'apa',source:'Liminality is brief (Turner, 1969).\n\nReferences\nTurner, V. (1969). '+sourceTitle+'. Aldine.',siteCache:makeCache([{id:'turner-1969-ritual',type:'book',state:'resolved',title:siteTitle,authors:[{family:'Turner',given:'Victor'}],issued:[1969]}])};
  const a=processImportRequest(context),candidate=a.siteMatches[0].candidates[0];assert.equal(candidate.recordId,'turner-1969-ritual');assert.equal(candidate.requiresReview,true);assert.equal(candidate.evidence.mainTitleMatch,true);
  assert.deepEqual(candidate.evidence.differences,['title','authors','type']);assert.equal(a.referenceRecords[0].authors[0].given,'V.');assert.equal(context.siteCache.records[0].authors[0].given,'Victor');
  const p=preview(a,{},context);assert.deepEqual(p.reusedRecordIds,[]);
  const reused=preview(a,{recordDecisions:[{recordId:a.referenceRecords[0].id,siteRecordId:candidate.recordId}]},context);assert.deepEqual(reused.reusedRecordIds,[candidate.recordId]);assert.equal(reused.cache.records.length,1);
  for(const override of [{authors:[{family:'Other',given:'V.'}]},{issued:[1989]},{title:'A different process'}]){
   const b=processImportRequest({...context,siteCache:makeCache([{...context.siteCache.records[0],...override}])});assert.equal(b.siteMatches[0].candidates.length,0);
  }
 }
});
