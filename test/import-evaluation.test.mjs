import test from 'node:test';import assert from 'node:assert/strict';import {readFileSync} from 'node:fs';import {createHash} from 'node:crypto';
import {evaluateImportCases} from '../src/import-evaluation.mjs';
const bytes=readFileSync(new URL('./fixtures/import-challenge.json',import.meta.url));
const fixture=JSON.parse(bytes);
test('sealed independent challenge remains unchanged and conservative ambiguity stays visible',()=>{
 assert.equal(createHash('sha256').update(bytes).digest('hex'),'7f0a72c8bee00a39dd83f12770e8c19c80b5b629df76cb8fa4c4398ed4078d8e');
 const report=evaluateImportCases(fixture);assert.equal(report.summary.baselinePassed,7);assert.equal(report.summary.falseUnique,0);
 assert.equal(report.cases.find(c=>c.id==='apa-undated').pass,true);
 assert.equal(report.cases.find(c=>c.id==='apa-undated').groups[0].items[0].state,'ambiguous');
});
test('evaluation rejects duplicate spans, surplus items and unexpected unique predictions',()=>{
 const one={...fixture,cases:[fixture.cases[0]]};
 const citation={start:one.cases[0].source.indexOf('(Rivera'),end:one.cases[0].source.indexOf('(Rivera')+'(Rivera, 2021)'.length,raw:'(Rivera, 2021)'};
 const proposal={state:'unique',candidates:[{recordId:'rivera-2021'}]};
 for(const predictions of [
  [{citation,items:[proposal]},{citation,items:[proposal]}],
  [{citation,items:[proposal,proposal]}],
  [{citation,items:[proposal]},{citation:{start:0,end:1,raw:'S'},items:[proposal]}]
 ]) {
  const report=evaluateImportCases(one,{detect:()=>({}),match:()=>({matches:predictions})});
  assert.equal(report.cases[0].pass,false);assert.equal(report.summary.falseUnique,1);
 }
});
