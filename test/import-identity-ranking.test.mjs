import test from 'node:test';import assert from 'node:assert/strict';
import {assessImportCandidate,rankImportCandidates,importSearchTitle,automaticCandidate,createBrowserEnrichment,mergeCompletion} from '../src/import-enrichment.mjs';
const book={id:'book',type:'book',title:'The social life of gardens',authors:[{family:'Rivera',given:'N.'}],issued:[2011],publisher:'Example Press'};
const edition={...book,id:'edition',authors:[{literal:'Nadia Rivera'}],identifiers:[{scheme:'isbn',value:'9780306406157'}]};
const review={...book,id:'review',type:'article-journal',authors:[{family:'Bell',given:'Owen'}],issued:[2012],identifiers:[{scheme:'doi',value:'10.5555/review'}]};
test('same-title review DOI stays secondary to a plausible book edition, and every candidate survives ranking',()=>{
 const input=[review,edition],snapshot=structuredClone(input),ranked=rankImportCandidates(book,input);
 assert.deepEqual(ranked.map(item=>item.candidate.id),['edition','review']);assert.equal(ranked[0].assessment.primary,true);assert.equal(ranked[1].assessment.primary,false);
 assert.deepEqual(ranked[1].assessment.conflicts,['authors','type']);assert.ok(ranked[1].assessment.differences.includes('year'));assert.deepEqual(input,snapshot);
});
test('a one-year edition difference remains explicit and cannot produce automatic acceptance',()=>{
 const changed={...edition,issued:[2012]},assessment=assessImportCandidate(book,changed);
 assert.equal(assessment.primary,true);assert.ok(assessment.differences.includes('year'));assert.equal(assessment.exact,false);assert.equal(automaticCandidate(book,[changed]),null);
 const merged=mergeCompletion(book,changed);assert.deepEqual(merged.record.issued,[2011]);assert.ok(merged.conflicts.includes('issued'));
});
test('matching authors do not make a book chapter or notice interchangeable with its book',()=>{
 for(const candidate of [{...book,type:'chapter'},{...book,noticeRelations:[{type:'correction'}]},{...book,version:'revised'}]){
  const assessment=assessImportCandidate(book,candidate);assert.equal(assessment.primary,false);assert.ok(assessment.conflicts.length>0);
 }
});
test('generic source type is missing evidence, not an asserted work-type conflict',()=>{
 const assessment=assessImportCandidate({...book,type:'document'},edition);assert.ok(assessment.missing.includes('type'));assert.ok(!assessment.conflicts.includes('type'));assert.equal(assessment.primary,true);
 const chapter=assessImportCandidate({...book,type:'document'},{...book,type:'chapter'});assert.equal(chapter.primary,false);assert.ok(chapter.reasons.includes('unconfirmed-chapter'));
});
test('only explicit trailing edition and reprint qualifiers leave search titles',()=>{
 for(const suffix of [' (Repr)',' (Repr.)',' (2nd ed., with an update a decade later)',' (revised edition)',' (Reprinted 2012)'])assert.equal(importSearchTitle({title:book.title+suffix}),book.title);
 for(const title of ['Gardens (an ethnography)','Second edition gardens','Gardens (2020)','Gardens (edible plants)'])assert.equal(importSearchTitle({title}),title);
});
test('explicit book qualifier protects a generically parsed reference from journal review substitution',()=>{
 const source={...book,type:'document',title:book.title+' (2nd ed., with an update a decade later)'};
 const assessment=assessImportCandidate(source,{...review,authors:book.authors});assert.ok(assessment.conflicts.includes('type'));assert.equal(assessment.primary,false);
 assert.ok(!assessImportCandidate({...book,type:'document',title:book.title+' '},{...book,type:'article-journal'}).conflicts.includes('type'));
});
test('Open Library receives the cleaned query but raw source and returned evidence remain intact',async()=>{
 const source={...book,title:book.title+' (Repr)'},before=structuredClone(source),calls=[];
 const client=createBrowserEnrichment({minInterval:0,fetch:async url=>{calls.push(url);return new Response(JSON.stringify({docs:[]}));}});
 const result=await client.lookup(source,{kind:'isbn'});assert.equal(new URL(calls[0]).searchParams.get('title'),book.title);assert.equal(result.evidence[0].url,calls[0]);assert.equal(result.automatic,null);assert.deepEqual(source,before);
});
test('same-title review with additional book author metadata still cannot pass author matching',()=>{
 const candidate={...review,authors:[{family:'Bell',given:'Owen'},...book.authors]};const assessment=assessImportCandidate(book,candidate);
 assert.ok(assessment.conflicts.includes('authors'));assert.equal(assessment.primary,false);assert.equal(automaticCandidate(book,[candidate]),null);
});
test('unknown/missing data and distant dates never become a ranking assertion of correctness',()=>{
 const missing=assessImportCandidate(book,{title:book.title,type:'document',authors:[],issued:null});assert.equal(missing.primary,false);assert.ok(missing.missing.includes('authors'));assert.ok(missing.missing.includes('year'));assert.ok(!missing.conflicts.includes('authors'));
 const distant=assessImportCandidate(book,{...edition,issued:[1990]});assert.equal(distant.primary,false);assert.ok(distant.reasons.includes('distant-year'));assert.equal(distant.exact,false);
});

test('an exact book DOI still requires an edition decision',()=>{
 const candidate={...book,id:'book-doi',identifiers:[{scheme:'doi',value:'10.5555/book'}]};
 assert.equal(assessImportCandidate(book,candidate).exact,true);assert.equal(automaticCandidate(book,[candidate]),null);
});
