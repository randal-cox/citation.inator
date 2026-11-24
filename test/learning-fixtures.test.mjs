import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {savedProviderFetch,savedProviderEvidence} from '../demos/import/provider-fixtures.mjs';
import {extractImportFile} from '../src/import-files.mjs';
import {processImportRequest} from '../src/import-api.mjs';

test('saved lookup results retain fixture provenance instead of claiming a live provider check',async()=>{
  const item={DOI:'10.1234/example',title:['Example']};
  const request=savedProviderFetch({works:[item]});
  assert.equal((await (await request('https://api.crossref.org/works/10.1234%2Fexample')).json()).fixture,'saved-example-metadata');
  assert.equal((await request('https://api.crossref.org/works/10.1234%2Funknown')).status,404);
  const candidate={id:'example',identifiers:[{scheme:'doi',value:item.DOI}],provenance:[{provider:'Crossref',retrievedAt:'2026-11-23T00:00:00Z',url:'https://api.crossref.org/works/10.1234/example'}]};
  const source={candidates:[candidate],automatic:candidate,evidence:[{provider:'Crossref',url:'https://api.crossref.org/works',raw:{message:item}}]};
  const result=savedProviderEvidence(source);
  assert.equal(result.automatic,result.candidates[0]);
  assert.match(result.automatic.provenance[0].note,/no live provider verification/);
  assert.equal(result.automatic.provenance[0].retrievedAt,undefined);
  assert.equal(result.evidence[0].provider,'Saved example metadata');
  assert.equal(candidate.provenance[0].provider,'Crossref');
});

test('pinned draft teaching files exactly match their recorded upstream Git blobs and retain the license',async()=>{
  const base=new URL('../learn/vendor/draft-inator/',import.meta.url);
  const manifest=JSON.parse(await readFile(new URL('SOURCE.json',base)));
  assert.equal(manifest.repository,'https://github.com/randal-cox/draft.inator');
  for(const item of manifest.files){
    const bytes=await readFile(new URL(item.name,base));
    assert.equal(createHash('sha1').update('blob '+bytes.length+'\0').update(bytes).digest('hex'),item.blob,item.name);
  }
  assert.match(await readFile(new URL('LICENSE',base),'utf8'),/MIT License/);
});

for(const extension of ['pdf','docx','odt'])test(`public ${extension} lesson keeps its bibliography and distinguishes the deliberately missing source`,async()=>{
  const bytes=await readFile(new URL('../learn/documents/sample.'+extension,import.meta.url));
  const original=bytes.slice();
  const result=await extractImportFile(bytes,{filename:'sample.'+extension});
  assert.match(result.text,/References/);
  const analysis=processImportRequest({mode:'document',source:result.text,style:'apa'});
  assert.deepEqual(analysis.review.matches.map(match=>match.items.map(item=>item.state)),[['unique'],['unmatched']]);
  assert.deepEqual(bytes,original);
});
