import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {createBrowserEnrichment} from '../src/import-enrichment.mjs';
import {processImportRequest} from '../src/import-api.mjs';
import {savedProviderFetch,savedProviderEvidence} from '../demos/import/provider-fixtures.mjs';

const source=await readFile(new URL('../learn/documents/sample.md',import.meta.url),'utf8');
const base={mode:'document',source,style:'apa'};
const item={DOI:'10.1371/journal.pmed.0020124',type:'journal-article',title:['Why Most Published Research Findings Are False'],author:[{family:'Ioannidis',given:'John P. A.'}],'published-print':{'date-parts':[[2005]]},'container-title':['PLOS Medicine'],volume:'2',issue:'8','article-number':'e124'};

test('saved metadata survives real enrichment and canonical cache export without live provenance',async()=>{
  const analysis=processImportRequest(base),record=analysis.referenceRecords[0],requests=[];
  const fixed=savedProviderFetch({works:[item]});
  const client=createBrowserEnrichment({minInterval:0,fetch:async(...args)=>{requests.push(args[0]);return fixed(...args);}});
  const result=savedProviderEvidence(await client.lookup(record));
  assert.equal(requests.length,2,'search plus exact DOI lookup are both intercepted');
  assert.ok(result.automatic);
  const output=processImportRequest({...base,action:'preview',review:analysis.review,reviewId:analysis.review.reviewId,decisions:[{citationIndex:0,action:'accept',targets:[{recordId:record.id}]}],completions:[{recordId:record.id,record:result.automatic}]});
  assert.match(output.source,/doi:10\.1371\/journal\.pmed\.0020124/);
  const provenance=output.cache.records.flatMap(record=>record.provenance);
  assert.ok(provenance.some(entry=>entry.provider==='Saved example metadata'));
  assert.ok(provenance.every(entry=>entry.provider!=='Crossref'&&!entry.retrievedAt));
  assert.match(JSON.stringify(provenance),/no live provider verification/);
  assert.ok(output.source.includes('(Missing, 2001)'));
});

test('a cancelled saved lookup cannot supply a late candidate, and a new run can recover',async()=>{
  let release,started;
  const waiting=new Promise(resolve=>{started=resolve;});
  const gate=new Promise(resolve=>{release=resolve;});
  const fixed=savedProviderFetch({works:[item]});
  const client=createBrowserEnrichment({minInterval:0,fetch:async(...args)=>{started();await gate;return fixed(...args);}});
  const lookup=client.lookup({}, {identifier:item.DOI});
  await waiting;
  client.cancel();release();
  await assert.rejects(lookup,/Lookup paused/);
  assert.equal(savedProviderEvidence(await client.lookup({}, {identifier:item.DOI})).candidates.length,1);
});

test('public lesson review rejects changed source or cache and leaves caller state intact',()=>{
  const siteCache={schema:'citation-inator.cache.v1',records:[]};
  const request={...base,siteCache},original=structuredClone(request),analysis=processImportRequest(request);
  const conversion={...request,action:'preview',review:analysis.review,reviewId:analysis.review.reviewId,decisions:[{citationIndex:0,action:'accept',targets:[{recordId:analysis.referenceRecords[0].id}]}]};
  assert.throws(()=>processImportRequest({...conversion,source:source+'\nChanged.'}),/changed/);
  assert.throws(()=>processImportRequest({...conversion,siteCache:{...siteCache,records:[{id:'new',title:'Concurrent site addition'}]}}),/changed/);
  assert.deepEqual(request,original);
});
