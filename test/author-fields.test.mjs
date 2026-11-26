import assert from 'node:assert/strict';
import test from 'node:test';
import {compileCitations} from '../src/compiler.mjs';
import {compileMarkdown,compileHTML} from '../src/markup.mjs';
import {annotateMarkers} from '../src/tools.mjs';
import {makeCache,mergeResolvedRecord} from '../src/records.mjs';
import {createPubMedResolver,pubmedRecord} from '../src/pubmed.mjs';
const cache=()=>makeCache([{id:'work',title:'A book',authors:[{family:'Mori'}],issued:[1995,3,2],state:'resolved',identifiers:[{scheme:'isbn',value:'9780029079379'}],provenance:[{provider:'Curator'}]}]);
test('document assertions propagate through aliases, without mutating the cache',()=>{
 const input=cache(),saved=JSON.stringify(input);
 const result=compileCitations('{cite work}\n\n{cite isbn:9780029079379 | original-year:1912 | edition-year:1996}',input,{citationStyle:'chicago-author-date'});
 assert.equal(JSON.stringify(input),saved);assert.deepEqual(result.cache.records[0].issued,[1996]);assert.deepEqual(result.cache.records[0].originalIssued,[1912]);assert.equal(result.citationDescriptions.length,2);assert.ok(result.citationDescriptions.every(d=>d.items[0].text.includes('1996')));assert.match(result.cache.records[0].provenance.at(-1).note,/1995/);
});
test('author assertions reject contradictions, impossible chronology and cache-wide date changes',()=>{
 for(const source of ['{cite work | edition-year:1996}{cite work | edition-year:1997}','{cite work | original-year:1997}'])assert.throws(()=>compileCitations(source,cache()),/Conflicting|later/);
 assert.throws(()=>compileCitations('{cite work | edition-year:1996}',cache(),{suffixScope:'cache'}),/shared date/);
 assert.throws(()=>compileCitations('{cite work | original-year:1912}',makeCache([{...cache().records[0],citationText:'Authored date 1995'}])),/custom reference/);
 for(const bad of ['0999','2019a','10000'])assert.ok(compileCitations(`{cite work | edition-year:${bad}}`,cache()).diagnostics.some(d=>d.code==='citation-malformed'));
});
test('formatted reference is escaped and italicized in text, HTML and Markdown compilers',()=>{
 const marker='{cite work | reference:"Mori. *A book*. **1995**. <img src=x onerror=alert(1)>"}';
 for(const compile of [compileCitations,compileMarkdown,compileHTML]){
 const result=compile(compile===compileHTML?marker.replaceAll('<','&lt;').replaceAll('>','&gt;'):marker,cache());assert.equal(result.diagnostics.length,0);assert.match(result.html,/<em>A book<\/em>/);assert.doesNotMatch(result.html,/<img src=x/);assert.match(result.html,/&lt;img/);
 }
});
test('work-context editor notes keep effective author date and are idempotent',()=>{
 const source='{cite work | edition-year:1996}';
 const first=annotateMarkers(source,cache(),{noteContext:'work'});assert.match(first.source,/cue:"Mori, 1996"/);assert.equal(annotateMarkers(first.source,cache(),{noteContext:'work'}).source,first.source);
});
test('artwork and copy assertions normalize safely and retain provenance',()=>{
 const result=compileCitations('{cite work | attribution:"Attributed to Mori" | display-date:"c. 1500" | medium:"Oil" | institution:"Museum" | accession:"A1" | rights:"CC BY-SA" | photographer:"Kai" | uploader:"Lee" | pdf:"https://example.org/copy.pdf" | checked:2026-11-25 | access:open}',cache());
 const record=result.cache.records[0];assert.equal(record.holdingInstitution,'Museum');assert.equal(record.license.name,'CC BY-SA');assert.equal(record.contributors.length,2);assert.equal(record.locations[0].access,'open');assert.equal(record.locations[0].verifiedAt,'2026-11-25T00:00:00.000Z');
 assert.throws(()=>compileCitations('{cite work | pdf:"https://example.org/a.pdf"}',cache()),/checked/);
 assert.throws(()=>compileCitations('{cite work | access:open}',cache()),/need pdf/);
 assert.ok(compileCitations('{cite work | pdf:"javascript:alert(1)"}',cache()).diagnostics.some(d=>d.code==='citation-malformed'));
 assert.ok(compileCitations('{cite work | checked:2026-02-30}',cache()).diagnostics.some(d=>d.code==='citation-malformed'));
});
const raw={hitCount:1,resultList:{result:[{id:'16060722',source:'MED',doi:'10.1371/journal.pmed.0020124',pmcid:'PMC1182327',title:'Why Most Published Research Findings Are False',pubYear:'2005',authorList:{author:[{lastName:'Ioannidis',firstName:'John P A'}]},journalInfo:{journal:{title:'PLOS Medicine'},volume:'2',issue:'8'}}]}};
test('exact PubMed resolver reports aliases and rejects mismatched identity',async()=>{
 let calls=0;const resolver=createPubMedResolver({minInterval:0,fetch:async url=>{calls++;assert.match(String(url),/EXT_ID%3A16060722/);return new Response(JSON.stringify(raw));}});
 const result=await resolver.resolve('pmid:16060722');assert.equal(result.state,'resolved');assert.deepEqual(result.record.identifiers.map(i=>i.scheme),['pmid','doi','pmcid']);await resolver.resolve('pmid:16060722');assert.equal(calls,1);
 assert.throws(()=>pubmedRecord(raw,{scheme:'pmid',value:'123'},'2026-11-25T00:00:00Z','https://example.org'),/different/);
 assert.equal(pubmedRecord({hitCount:0},{scheme:'pmid',value:'123'}),null);
});
test('exact identifier cache merges preserve curated identity in both resolution orders',()=>{
 const pub=pubmedRecord(raw,{scheme:'pmid',value:'16060722'},'2026-11-25T00:00:00Z','https://example.org');
 const doi={...pub,id:'curated',title:'Curated title',identifiers:pub.identifiers.filter(i=>i.scheme==='doi')};
 for(const [a,b] of [[doi,pub],[pub,doi]]){const merged=mergeResolvedRecord(makeCache([a]),b);assert.equal(merged.records.length,1);assert.equal(merged.records[0].id,a.id);assert.equal(merged.records[0].identifiers.length,3);assert.equal(compileCitations('{cite doi:10.1371/journal.pmed.0020124; pmid:16060722}',merged).cache.records.length,1);}
 assert.throws(()=>mergeResolvedRecord(makeCache([doi,{...pub,id:'other',identifiers:pub.identifiers.filter(i=>i.scheme==='pmid')}]),pub),/joins existing/);
 assert.throws(()=>mergeResolvedRecord(makeCache([doi]),{...pub,identifiers:[...pub.identifiers,{scheme:'doi',value:'10.1234/other'}]}),/Conflicting doi/);
});
test('accented titles alphabetize with their base letters for year suffixes',()=>{
 const records=['Zur Elektrodynamik','Über die Bewegung','Über einen Standpunkt'].map((title,i)=>({id:'work-'+i,title,authors:[{family:'Einstein'}],issued:[1905],state:'resolved'}));
 const result=compileCitations('{cite work-0; work-1; work-2}',makeCache(records),{citationStyle:'chicago-author-date'});
 assert.deepEqual(result.citationDescriptions[0].items.map(i=>i.text),['Einstein 1905c','Einstein 1905a','Einstein 1905b']);
});

test('date assertions cannot retain stale literal dates or bypass cache-wide consistency',()=>{
 const input=makeCache([{...cache().records[0],displayDate:'1995'}]);
 const result=compileCitations('{cite work | edition-year:1996 | reference:"Mori. Book. 1996."}',input);
 assert.equal(result.cache.records[0].displayDate,'');assert.match(result.citationDescriptions[0].items[0].text,/1996/);
 assert.throws(()=>compileCitations('{cite work | display-date:"1996"}',cache(),{suffixScope:'cache'}),/shared date/);
 assert.throws(()=>compileCitations('{cite work | edition-year:1996 | display-date:"1997"}',cache()),/disagrees/);
});

test('new identifiers with author fields remain resolvable before metadata exists',()=>{
 const result=compileMarkdown('{cite doi:10.1234/new-work | original-year:1912}',makeCache([]));
 assert.ok(result.diagnostics.some(d=>d.code==='citation-unresolved'&&d.identifier==='doi:10.1234/new-work'));
});
