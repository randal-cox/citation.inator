import test from 'node:test';
import assert from 'node:assert/strict';
import {createBrowserEnrichment,mergeCompletion,automaticCandidate} from '../src/import-enrichment.mjs';
import {importDemoRequest} from '../scripts/import-demo-service.mjs';
import {normalizeRecord} from '../src/records.mjs';
const response=raw=>new Response(JSON.stringify(raw));
const source='A claim (Bello, 2020). Another (Unknown, 2000).\n\n## References\n\nBello, N. (2020). Transport test. Test Journal, 12(3), 41–57.';
const article={DOI:'10.5555/enrichment.ui',title:['Transport test'],author:[{given:'Nadia',family:'Bello'}],issued:{'date-parts':[[2020]]},type:'journal-article','container-title':['Test Journal'],volume:'12',issue:'3',page:'41–57'};
test('strict DOI hit resolves independently and session completion exports canonical markers and cache',async()=>{
 const base={mode:'document',source,style:'auto'},analysis=importDemoRequest(base),record=analysis.referenceRecords[0],calls=[];
 assert.equal(record.type,'article-journal');assert.equal(record.containerTitle,'Test Journal');
 const client=createBrowserEnrichment({minInterval:0,fetch:async url=>{calls.push(url);return response(new URL(url).search?{message:{items:[article]}}:{message:article});}});
 const result=await client.lookup(record);assert.ok(result.automatic);assert.equal(calls.length,2);
 const decisions=[{citationIndex:0,action:'accept',targets:[{recordId:record.id}]},{citationIndex:1,action:'accept',targets:[{identifier:article.DOI}]}];
 const output=importDemoRequest({...base,action:'preview',review:analysis.review,reviewId:analysis.review.reviewId,decisions,completions:[{recordId:record.id,record:result.automatic},{record:result.automatic}]});
 assert.ok(output.source.includes('{cite doi:'+article.DOI+'}'));assert.equal(output.cache.records.length,1);assert.ok(output.cache.records[0].provenance.some(item=>item.provider==='Crossref'));assert.ok(!output.diagnostics.some(item=>item.code==='citation-unresolved'));assert.ok(output.source.endsWith(source.slice(source.indexOf('## References'))));
});
test('edition search enumerates bounded editions and never chooses the first work edition',async()=>{
 const calls=[];const client=createBrowserEnrichment({minInterval:0,fetch:async url=>{
  calls.push(url);return response(url.includes('/search.json')?{docs:[{key:'/works/OL1W',author_name:['Nadia Bello']}]}:{entries:[{key:'/books/OL1M',works:[{key:'/works/OL1W'}],title:'A book',publish_date:'1990',isbn_10:['0306406152'],isbn_13:['9780306406157'],edition_name:'First edition'},{key:'/books/OL2M',works:[{key:'/works/OL1W'}],title:'A book',publish_date:'1999',isbn_13:['9780593656433'],edition_name:'Second edition'}]});
 }});
 const result=await client.lookup({title:'A book',authors:[{family:'Bello',given:'Nadia'}]},{kind:'isbn'});
 assert.equal(result.candidates.length,2);assert.equal(result.automatic,null);assert.equal(result.limited,true);assert.ok(calls[1].includes('/works/OL1W/editions.json?limit=5'));assert.equal(result.candidates[1].edition,'Second edition');
});
test('metadata adds missing fields and keeps conflicting curated prose and dates',()=>{
 const source=normalizeRecord({id:'source',type:'book',state:'partial',title:'A book',issued:[1990],citationParts:[{text:'My authored reference.'}]});
 const fresh=normalizeRecord({id:'provider',type:'book',title:'A revised book',issued:[1999],publisher:'Publisher',identifiers:[{scheme:'isbn',value:'9780306406157'}]});
 const result=mergeCompletion(source,fresh);assert.equal(result.record.title,'A book');assert.deepEqual(result.record.issued,[1990]);assert.equal(result.record.publisher,'Publisher');assert.equal(result.record.citationParts[0].text,'My authored reference.');assert.ok(result.conflicts.includes('title'));assert.ok(result.conflicts.includes('issued'));
});
test('unknown reference types search both providers and retain partial suggestions on one-provider failure',async()=>{
 const urls=[];const client=createBrowserEnrichment({minInterval:0,fetch:async url=>{urls.push(url);return url.includes('api.crossref.org')?response({message:{items:[article]}}):new Response('Unavailable',{status:503});}});
 const result=await client.lookup({title:'Transport test',type:'document',authors:[{family:'Bello',given:'Nadia'}],issued:[2020]},{kind:'both'});
 assert.equal(result.candidates.length,1);assert.equal(result.automatic,null);assert.equal(result.partial,true);assert.ok(urls.some(url=>url.includes('openlibrary.org')));assert.ok(result.evidence.some(item=>item.error));
});

test('known original years and author identities constrain automation rather than disappearing from the query',async()=>{
 const original={id:'source',type:'article-journal',title:'Transport test',authors:[{family:'Bello',given:'Nadia'}],issued:[2020]};
 const candidate={...original,id:'candidate',identifiers:[{scheme:'doi',value:article.DOI}]};
 assert.equal(automaticCandidate({...original,originalIssued:[1900]},[candidate]),null);
 assert.equal(automaticCandidate({...original,authors:[{...original.authors[0],id:'orcid:known'}]},[candidate]),null);
 assert.equal(automaticCandidate({...original,authors:[{...original.authors[0],suffix:'Jr.'}]},[candidate]),null);
 const client=createBrowserEnrichment({minInterval:0,fetch:async()=>response({message:{items:[article]}})});
 const result=await client.lookup({...original,originalIssued:[1900]});assert.equal(result.automatic,null);
});
test('a DOI already in the bibliography converts canonically without a provider completion',()=>{
 const text=source.replace('41–57.','41–57. https://doi.org/'+article.DOI);
 const base={mode:'document',source:text,style:'auto'},analysis=importDemoRequest(base),id=analysis.referenceRecords[0].id;
 const result=importDemoRequest({...base,action:'preview',review:analysis.review,reviewId:analysis.review.reviewId,decisions:[{citationIndex:0,action:'accept',targets:[{recordId:id}]}]});
 assert.ok(result.source.includes('{cite doi:'+article.DOI+'}'));assert.ok(result.cache.records[0].identifiers.some(value=>value.value===article.DOI));
});
test('book discovery retries a main title once when a subtitle query returns no works',async()=>{
 const calls=[],client=createBrowserEnrichment({minInterval:0,fetch:async url=>{calls.push(url);const parsed=new URL(url);return response(parsed.pathname==='/search.json'?(parsed.searchParams.get('title').includes(':')?{docs:[]}:{docs:[{key:'/works/OL1W',author_name:['Nadia Bello']}] }):{entries:[{key:'/books/OL1M',works:[{key:'/works/OL1W'}],title:'Research methods',publish_date:'2020',isbn_13:['9780306406157']}]});}});
 const result=await client.lookup({type:'book',title:'Research methods: A practical guide',authors:[{family:'Bello',given:'N.'}],issued:[2020]},{kind:'isbn'});assert.equal(result.candidates.length,1);assert.equal(result.automatic,null);assert.equal(new URL(calls[0]).searchParams.get('title'),'Research methods: A practical guide');assert.equal(new URL(calls[1]).searchParams.get('title'),'Research methods');assert.equal(result.evidence.length,3);
});
