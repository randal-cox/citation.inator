import test from 'node:test';
import assert from 'node:assert/strict';
import {formatRecordId,scanCitationMarkers} from '../src/compiler.mjs';
import {annotateMarkers,formatRecordId as toolsFormat} from '../src/tools.mjs';
import {formatRecordId as importFormat,processImportRequest} from '../src/import-api.mjs';
import {makeCache} from '../src/records.mjs';

test('shared local ID writer uses the minimal safe spelling and reserves directive names',()=>{
  assert.equal(toolsFormat,formatRecordId);assert.equal(importFormat,formatRecordId);
  for(const citationKeyword of ['citation','cite','ref'])for(const id of ['bell-1992-ritual','list-2001','123','endnote','list','nocite','evidence','credit']){
    const reserved=['endnote','list','nocite','evidence','credit'].includes(id);
    for(const identifierForm of ['minimal','explicit']){
      const written=formatRecordId(id,{citationKeyword,identifierForm});
      assert.equal(written,identifierForm==='explicit'||reserved?'local:'+id:id);
      const token=scanCitationMarkers(`{${citationKeyword} ${written}}`,{citationKeyword})[0].token;
      assert.equal(token.type,'citation');assert.equal(token.items.length,1);
      assert.deepEqual(token.items[0].identifier,{scheme:'local',value:id});
    }
  }
});

test('local ID writer rejects invalid IDs and configuration instead of silently changing identity',()=>{
  for(const id of [null,{},'', ' x','x ','UPPER','bad|value','two;works','doi:10.5555/example','local:bell','https://example.com'])assert.throws(()=>formatRecordId(id),/valid local/);
  assert.throws(()=>formatRecordId('bell',{identifierForm:'short'}),/minimal or explicit/);
  assert.throws(()=>formatRecordId('bell',{citationKeyword:'Bad'}),/lowercase citation/);
});

test('refreshing notes preserves bare and explicit identifier spelling in either writer mode',()=>{
  const cache=makeCache([{id:'bell',type:'book',state:'resolved',title:'Ritual',authors:[{family:'Bell',given:'Catherine'}],issued:[1992]}]);
  for(const identifierForm of ['minimal','explicit']){
    const source='{citation bell | note:"old"}; {citation local:bell | note:"old"}';
    const result=annotateMarkers(source,cache,{identifierForm,noteContext:'work',citationStyle:'chicago-author-date'});
    assert.match(result.source,/^\{citation bell \| note:"Bell 1992"\}; \{citation local:bell \| note:"Bell 1992"\}$/);
    assert.equal(annotateMarkers(result.source,cache,{identifierForm,noteContext:'work',citationStyle:'chicago-author-date'}).changed,false);
  }
  assert.throws(()=>annotateMarkers('',cache,{identifierForm:'unknown'}),/minimal or explicit/);
});

test('new import markers use shared minimal or explicit spelling, including host reserved IDs',()=>{
  const source='A claim (Bell, 1992).\n\nReferences\nBell, C. (1992). Ritual theory, ritual practice. Oxford University Press.';
  for(const citationKeyword of ['citation','ref'])for(const identifierForm of ['minimal','explicit'])for(const id of ['bell-1992-ritual','list-2001','list','endnote','nocite','evidence','credit']){
    const context={source,mode:'document',style:'apa',citationKeyword,identifierForm,siteCache:makeCache([])};
    const a=processImportRequest(context),recordId=a.referenceRecords[0].id;
    const p=processImportRequest({...context,action:'preview',review:a.review,reviewId:a.review.reviewId,recordIds:{[recordId]:id},decisions:[{citationIndex:0,action:'accept',targets:[{recordId}]}]});
    const marker=scanCitationMarkers(p.source,{citationKeyword})[0];
    assert.equal(marker.raw,`{${citationKeyword} ${formatRecordId(id,{citationKeyword,identifierForm})}}`);
    assert.deepEqual(marker.token.items[0].identifier,{scheme:'local',value:id});
  }
});
