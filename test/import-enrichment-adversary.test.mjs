import test from 'node:test';
import assert from 'node:assert/strict';
import {doiIdentityChallenges,isbnEditionChallenges} from './fixtures/enrichment-challenge.mjs';
import {normalizeRecord} from '../src/records.mjs';
import {automaticCandidate,createBrowserEnrichment,mergeCompletion} from '../src/import-enrichment.mjs';
import {importDemoRequest} from '../scripts/import-demo-service.mjs';

const normalized=(record,index=0)=>normalizeRecord({id:'challenge-'+index,...record});

test('independent DOI identity challenge rejects conflicting or incomplete candidates',()=>{
  for(const item of doiIdentityChallenges)assert.equal(Boolean(automaticCandidate(item.source,item.candidates.map(normalized))),item.automatic,item.id+': '+item.reason);
});
test('ISBN suggestions always require curator edition choice',()=>{
  for(const item of isbnEditionChallenges)assert.equal(automaticCandidate(item.source,item.candidates.map(normalized)),null,item.id);
});
test('title normalization does not erase identity-bearing symbols',()=>{
  const sample=doiIdentityChallenges[0];
  for(const [title,other] of [['Effects of C++ instruction','Effects of C instruction'],['When A > B','When A < B']]){
    const source={...sample.source,title},candidate=normalized({...sample.candidates[0],title:other});
    assert.equal(automaticCandidate(source,[candidate]),null,`${title} is not ${other}`);
  }
});
const response=value=>new Response(JSON.stringify(value),{headers:{'content-type':'application/json'}});
const rawArticle={DOI:'10.5555/enrichment.transport',title:['Transport test'],author:[{family:'Bello',given:'Nadia'}],issued:{'date-parts':[[2020]]},type:'journal-article'};
const source={type:'document',title:'Transport test',authors:[{family:'Bello',given:'Nadia'}],issued:[2020],original:'SECRET MANUSCRIPT',note:'SECRET NOTE',filename:'SECRET FILE'};
const searchResponse=()=>response({message:{items:[rawArticle]}});
test('browser transport sends only bibliography fields with no credentials/referrer',async()=>{
  const calls=[];
  const client=createBrowserEnrichment({fetch:async(url,options)=>{calls.push({url,options});return searchResponse();},minInterval:0});
  const result=await client.lookup(source);
  assert.equal(result.candidates.length,1);assert.equal(calls.length,1);
  const {url,options}=calls[0];assert.equal(new URL(url).origin,'https://api.crossref.org');assert.ok(!url.includes('SECRET'));
  assert.equal(options.credentials,'omit');assert.equal(options.referrerPolicy,'no-referrer');assert.equal(options.redirect,'error');
  assert.deepEqual(options.headers,{Accept:'application/json'});
  await assert.rejects(client.lookup(source,{identifier:'https://private.example/path'}),/DOI|ISBN/);
  assert.equal(calls.length,1);
});
test('identical in-flight work queries coalesce and cached result copies are isolated',async()=>{
  let release,calls=0;
  const client=createBrowserEnrichment({minInterval:0,fetch:async()=>{calls++;return await new Promise(resolve=>release=resolve);}});
  const first=client.lookup(source),second=client.lookup(source);await new Promise(resolve=>setImmediate(resolve));
  assert.equal(calls,1);release(searchResponse());const [a,b]=await Promise.all([first,second]);
  a.candidates[0].title='MUTATED';assert.equal(b.candidates[0].title,'Transport test');
  const c=await client.lookup(source);assert.equal(c.candidates[0].title,'Transport test');assert.equal(calls,1);
});
test('cancel rejects late responses even when the injected transport ignores abort',async()=>{
  let release,signal;
  const client=createBrowserEnrichment({minInterval:0,fetch:async(url,options)=>{signal=options.signal;return await new Promise(resolve=>release=resolve);}});
  const result=client.lookup(source);await new Promise(resolve=>setImmediate(resolve));client.cancel();assert.equal(signal.aborted,true);
  release(searchResponse());await assert.rejects(result,/paused/);
});
test('queued requests invalidated by cancel never hit provider',async()=>{
  let release,calls=0;
  const client=createBrowserEnrichment({minInterval:0,fetch:async()=>{calls++;return await new Promise(resolve=>release=resolve);}});
  const one=client.lookup(source),two=client.lookup({...source,title:'Different work'});
  const results=Promise.allSettled([one,two]);await new Promise(resolve=>setImmediate(resolve));client.cancel();release(searchResponse());
  assert.deepEqual((await results).map(value=>value.status),['rejected','rejected']);assert.equal(calls,1);
});
test('rate limits stop queued provider calls without an automatic retry storm',async()=>{
  let calls=0;
  const client=createBrowserEnrichment({minInterval:0,fetch:async()=>{calls++;return new Response('',{status:429,headers:{'Retry-After':'10'}});}});
  await assert.rejects(client.lookup(source),/429/);
  await assert.rejects(client.lookup({...source,title:'Different work'}),/rate limit/);assert.equal(calls,1);
});
test('provider payload bounds reject oversized responses',async()=>{
  const client=createBrowserEnrichment({minInterval:0,fetch:async()=>new Response('x'.repeat(2000001))});
  await assert.rejects(client.lookup(source),/too large/);
});
test('accepted edition metadata is retained and conflicts are reported',()=>{
  const original={id:'source-book',type:'book',state:'partial',title:'Synthetic book',authors:[{family:'Bello',given:'Nadia'}],issued:[2018]};
  const candidate={...original,id:'provider-book',edition:'Second edition',identifiers:[{scheme:'isbn',value:'9780306406157'}]};
  assert.equal(mergeCompletion(original,candidate).record.edition,'Second edition');
  const conflict=mergeCompletion({...original,edition:'First edition'},candidate);
  assert.equal(conflict.record.edition,'First edition');assert.ok(conflict.conflicts.includes('edition'));
});
test('Crossref update notices never auto-match an original through identical deposited metadata',async()=>{
  for(const type of ['correction','retraction','expression-of-concern']){
    const notice={...rawArticle,'update-to':[{type,DOI:'10.5555/enrichment.original'}]};
    const client=createBrowserEnrichment({minInterval:0,fetch:async url=>new URL(url).search?response({message:{items:[notice]}}):response({message:notice})});
    const result=await client.lookup({...source,type:'article-journal'});
    assert.equal(result.automatic,null,type+' must require review');
    assert.ok(JSON.stringify(result.evidence).includes(type));
  }
});
test('different manually resolved ISBNs retain distinct portable record IDs',async()=>{
  const client=createBrowserEnrichment({minInterval:0,fetch:async url=>{
    const key=new URL(url).searchParams.get('bibkeys'),isbn=key.slice(5);
    return response({[key]:{title:'Synthetic edition '+isbn,authors:[{name:'Nadia Bello'}],publish_date:'2018',identifiers:{isbn_13:[isbn]}}});
  }});
  const first=await client.lookup({}, {identifier:'9780306406157'}),second=await client.lookup({}, {identifier:'9780140328721'});
  assert.notEqual(first.candidates[0].id,second.candidates[0].id);
});
test('manual and bibliography choices of the same accepted work share a portable identifier record',()=>{
  const one={id:'first',state:'partial',type:'article-journal',title:'First synthetic work',authors:[{family:'Avery'}],issued:[2021]},
    two={id:'second',state:'partial',type:'article-journal',title:'Second synthetic work',authors:[{family:'Bennett'}],issued:[2019]},
    source='(Avery, 2021). (Bennett, 2019).',input={source,records:[one,two]},
    record={...one,id:'provider-first',identifiers:[{scheme:'doi',value:'10.5555/enrichment.same'}]};
  const {review}=importDemoRequest(input);
  const result=importDemoRequest({...input,action:'preview',review,reviewId:review.reviewId,
    decisions:[{citationIndex:0,action:'accept',targets:[{recordId:'first'}]},{citationIndex:1,action:'accept',targets:[{identifier:'doi:10.5555/enrichment.same'}]}],
    completions:[{recordId:'first',record},{record}]});
  assert.equal(result.cache.records.filter(item=>item.identifiers.some(id=>id.value==='10.5555/enrichment.same')).length,1);
});
test('unknown-type combined search retains successful provider choices when the other provider fails',async()=>{
  const calls=[];
  const client=createBrowserEnrichment({minInterval:0,fetch:async url=>{
    calls.push(url);const parsed=new URL(url);
    if(parsed.origin==='https://api.crossref.org')return new Response('',{status:503});
    if(parsed.pathname==='/search.json')return response({docs:[{key:'/works/OL1W',author_name:['Nadia Bello']}]});
    return response({entries:[{key:'/books/OL2M',works:[{key:'/works/OL1W'}],title:'Transport test',publish_date:'2020',isbn_13:['9780306406157']}]});
  }});
  const result=await client.lookup(source,{kind:'both'});
  assert.equal(result.automatic,null);assert.equal(result.partial,true);assert.equal(result.candidates.length,1);
  assert.equal(result.candidates[0].identifiers[0].scheme,'isbn');assert.equal(calls.length,3);
  assert.ok(result.evidence.some(item=>item.error?.includes('503')));
});
test('reset invalidates cached metadata while preserving cancellation guards',async()=>{
  let calls=0;const client=createBrowserEnrichment({minInterval:0,fetch:async()=>{calls++;return searchResponse();}});
  await client.lookup(source);await client.lookup(source);assert.equal(calls,1);
  client.reset();await client.lookup(source);assert.equal(calls,2);
});
