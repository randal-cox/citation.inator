import test from 'node:test';
import assert from 'node:assert/strict';
import {createCrossrefSearch} from '../src/import-crossref.mjs';
const item=(doi='10.1234/alpha',overrides={})=>({DOI:doi,title:['A synthetic reference'],author:[{family:'Avery',given:'Jordan'}],issued:{'date-parts':[[2021]]},type:'journal-article',score:24,...overrides});
const response=(items,status=200,headers={})=>new Response(JSON.stringify({message:{items}}),{status,headers});
const query={reference:'Avery. A synthetic reference. 2021.',title:'A synthetic reference',author:'Avery',year:2021};

test('explicit Crossref search retains ranked candidates and field conflicts without selecting',async()=>{
 let sent;let options;
 const search=createCrossrefSearch({minInterval:0,fetch:async(url,init)=>{sent=url;options=init;return response([item(),item('10.1234/beta',{title:['Different title'],issued:{'date-parts':[[2019]]},score:23})]);}});
 const result=await search.search({...query,doi:'10.1234/beta'});
 assert.equal(sent.origin,'https://api.crossref.org');assert.equal(sent.searchParams.get('query.bibliographic'),query.reference);assert.equal(sent.searchParams.get('rows'),'5');
 assert.equal(sent.searchParams.has('filter'),false);assert.equal(options.redirect,'error');
 assert.equal(result.state,'candidates');assert.ok(result.candidates.every(c=>c.requiresReview&&c.state==='candidate'));
 assert.equal(result.candidates[0].agreement.title.state,'exact');assert.equal(result.candidates[0].agreement.author.state,'exact');assert.equal(result.candidates[0].agreement.doi.state,'different');
 assert.equal(result.candidates[1].agreement.title.state,'different');assert.equal(result.candidates[1].agreement.year.state,'different');assert.equal(result.candidates[1].agreement.doi.state,'exact');
 assert.equal(result.candidates[0].providerScore,24);assert.equal(result.evidence[0].raw.message.items.length,2);
});

test('Crossref coalesces identical searches, caches separately and isolates caller mutation',async()=>{
 let calls=0,release;const gate=new Promise(resolve=>{release=resolve;});const store=new Map();
 const search=createCrossrefSearch({store,minInterval:0,fetch:async()=>{calls++;await gate;return response([item()]);}});
 const first=search.search(query),second=search.search(query);release();const [a,b]=await Promise.all([first,second]);
 assert.equal(calls,1);a.candidates[0].record.title='Changed';assert.equal(b.candidates[0].record.title,'A synthetic reference');
 const cached=await search.search(query);assert.equal(cached.cached,true);assert.equal(cached.candidates[0].record.title,'A synthetic reference');
 assert.ok([...store.keys()].every(key=>key.startsWith('crossref-search:')));
});

test('Crossref refresh failure retains last-known-good evidence as stale proposals',async()=>{
 let fail=false;
 const search=createCrossrefSearch({minInterval:0,fetch:async()=>fail?response([],503,{'retry-after':'2'}):response([item()])});
 await search.search(query);fail=true;const failure=await search.search(query,{force:true});
 assert.equal(failure.state,'error');assert.equal(failure.stale,true);assert.equal(failure.candidates.length,1);assert.equal(failure.evidence[0].status,503);assert.ok(failure.lastKnownGood.evidence.length);
});

test('Crossref pacing and retry interval stop queued requests, including server errors',async()=>{
 let now=10000,calls=0;const waits=[];
 const search=createCrossrefSearch({now:()=>now,sleep:async ms=>{waits.push(ms);now+=ms;},minInterval:50,fetch:async()=>{calls++;return calls===2?response([],500,{'retry-after':'2'}):response([item()]);}});
 await search.search(query);await search.search({...query,reference:'second'});const paused=await search.search({...query,reference:'third'});
 assert.equal(calls,2);assert.deepEqual(waits,[50]);assert.equal(paused.state,'error');assert.match(paused.message,/pause/);
 now+=2000;assert.equal((await search.search({...query,reference:'fourth'})).state,'candidates');
});

test('Crossref malformed, missing DOI and oversized payloads do not become cached misses',async()=>{
 for(const fetch of [async()=>new Response('not json'),async()=>response([{}]),async()=>new Response('x'.repeat(2_000_001))]) {
  const store=new Map();const result=await createCrossrefSearch({store,minInterval:0,fetch}).search(query);
  assert.equal(result.state,'error');assert.equal(store.size,0);assert.ok(result.evidence.length);
 }
});

test('Crossref skips duplicate identifiers and preserves unknown metadata and date alternatives',async()=>{
 const result=await createCrossrefSearch({minInterval:0,fetch:async()=>response([item(),item(),item('10.1234/missing',{title:[],author:[],score:null}),item('10.1234/dates',{'published-print':{'date-parts':[[2022]]},'published-online':{'date-parts':[[2021]]}})])}).search(query);
 assert.equal(result.candidates.length,3);assert.equal(result.candidates[1].agreement.title.state,'missing');assert.equal(result.candidates[1].providerScore,null);assert.equal(result.candidates[2].agreement.year.state,'alternative-date');
});

test('Crossref works when search caching fails and preserves empty-result state',async()=>{
 const broken={get:async()=>{throw Error('offline');},set:async()=>{throw Error('offline');}};
 const result=await createCrossrefSearch({store:broken,minInterval:0,fetch:async()=>response([item()])}).search(query);
 assert.equal(result.state,'candidates');assert.ok(result.diagnostics.some(d=>d.code==='import-search-cache-unavailable'));
 const search=createCrossrefSearch({minInterval:0,fetch:async()=>response([])});assert.equal((await search.search(query)).state,'empty');const cached=await search.search(query);assert.equal(cached.state,'empty');assert.equal(cached.cached,true);
});

test('Crossref validates input and construction without making network requests',async()=>{
 let calls=0;const search=createCrossrefSearch({fetch:async()=>{calls++;return response([]);}});
 for(const input of [null,{}, {reference:'x',limit:6},{reference:'x',year:2021.5},{reference:'x',doi:'garbage'},{reference:'x',title:5}]) await assert.rejects(search.search(input),TypeError);
 assert.equal(calls,0);assert.throws(()=>createCrossrefSearch({minInterval:Infinity}),TypeError);assert.throws(()=>createCrossrefSearch({mailto:'a\nb'}),TypeError);
});

test('Crossref bounds queued searches and releases capacity after completion',async()=>{
 let release;const gate=new Promise(resolve=>{release=resolve;});let calls=0;
 const search=createCrossrefSearch({minInterval:0,fetch:async()=>{calls++;await gate;return response([item()]);}});
 const pending=Array.from({length:4},(_,i)=>search.search({...query,reference:`reference ${i}`}));
 const overflow=await search.search({...query,reference:'overflow'});assert.equal(overflow.state,'error');assert.match(overflow.message,/queue/);
 release();assert.ok((await Promise.all(pending)).every(result=>result.state==='candidates'));assert.equal(calls,4);
 assert.equal((await search.search({...query,reference:'after'})).state,'candidates');
});

test('Crossref 429 and network failures pause subsequent requests without automatic retries',async()=>{
 for(const failure of [()=>response([],429,{'retry-after':'2'}),()=>{throw Error('network unavailable');}]) {
  let calls=0;const search=createCrossrefSearch({minInterval:0,fetch:async()=>{calls++;return failure();}});
  assert.equal((await search.search(query)).state,'error');assert.equal((await search.search({...query,reference:'next'})).state,'error');assert.equal(calls,1);
 }
});

test('Crossref ignores malformed persisted envelopes and unsafe cached candidate flags',async()=>{
 for(const value of [{expiresAt:Date.now()+10000},{expiresAt:Date.now()+10000,result:{schema:'other',state:'selected',candidates:[]}}]) {
  let calls=0;const store={get:async()=>value,set:async()=>{}};
  const result=await createCrossrefSearch({store,minInterval:0,fetch:async()=>{calls++;return response([item()]);}}).search(query);
  assert.equal(calls,1);assert.equal(result.cached,false);assert.equal(result.state,'candidates');assert.ok(result.diagnostics.some(d=>d.code==='import-search-cache-invalid'));
 }
 const store=new Map();let calls=0;const search=createCrossrefSearch({store,minInterval:0,fetch:async()=>{calls++;return response([item()]);}});
 await search.search(query);[...store.values()][0].result.candidates[0].requiresReview=false;
 const fresh=await search.search(query);assert.equal(calls,2);assert.equal(fresh.candidates[0].requiresReview,true);
});

test('Crossref DOI-only candidates retain unknown fields and reuse their own valid cache entry',async()=>{
 let calls=0;const search=createCrossrefSearch({minInterval:0,fetch:async()=>{calls++;return response([{DOI:'10.1234/unknown'}]);}});
 const first=await search.search(query);assert.equal(first.candidates[0].record.state,'unresolved');assert.equal(first.candidates[0].agreement.title.state,'missing');assert.equal(first.candidates[0].requiresReview,true);
 const second=await search.search(query);assert.equal(second.cached,true);assert.equal(calls,1);
});
