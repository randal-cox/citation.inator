import test from 'node:test';import assert from 'node:assert/strict';
import {analyzeImportDocument} from '../src/import-document.mjs';
import {processImportRequest} from '../src/import-api.mjs';
import {makeCache} from '../src/records.mjs';
const shared='10.5555/repeated-header',unique='10.5555/rivera-only';
const first=`Rivera, R. (2020). A river study. Journal, 1(1), 1–8. https://doi.org/${shared} doi:${unique}`;
const second=`Santos, S. (2021). A field study. Another Journal, 2(1), 9–18. https://doi.org/10.5555/REPEATED-HEADER`;
const source=`Two claims (Rivera, 2020; Santos, 2021).\n\n## References\n\n${first}\n\n${second}`;

test('distinct source references sharing a DOI retain separate raw proposals but neither owns that identifier',()=>{
 const model=analyzeImportDocument(source);assert.equal(model.entries.length,2);assert.equal(model.records.length,2);
 assert.deepEqual(model.entries.map(entry=>entry.raw),[first,second]);assert.ok(model.entries.every(entry=>entry.fields.identifiers.some(id=>id.value===shared)));
 assert.ok(model.records.every(record=>!record.identifiers.some(id=>id.value===shared)));assert.ok(model.records[0].identifiers.some(id=>id.value===unique));
 const diagnostic=model.diagnostics.find(item=>item.code==='import-conflicting-source-identifier');assert.equal(diagnostic.key,'doi:'+shared);assert.deepEqual(diagnostic.recordIds,model.records.map(record=>record.id));assert.doesNotThrow(()=>makeCache(model.records));
 const request={mode:'document',source,style:'auto'},analysis=processImportRequest(request);assert.equal(analysis.review.matches[0].items.length,2);assert.ok(analysis.review.matches[0].items.every(item=>item.state==='unique'));
 assert.equal(analysis.diagnostics.filter(item=>item.code==='import-conflicting-source-identifier').length,1);
});

test('conflicts are withheld from every claimant and are independent of bibliography order',()=>{
 const third=`Torres, T. (2022). A third study. doi:${shared}`;
 for(const entries of [[first,second,third],[third,second,first]]){
  const model=analyzeImportDocument('A claim (Santos, 2021).\n\nReferences\n\n'+entries.join('\n\n'));
  const warning=model.diagnostics.find(item=>item.code==='import-conflicting-source-identifier');assert.equal(warning.recordIds.length,3);assert.ok(model.records.every(record=>!record.identifiers.some(id=>id.value===shared)));assert.deepEqual(new Set(model.entries.map(entry=>entry.raw)),new Set(entries));assert.doesNotThrow(()=>makeCache(model.records));
 }
});

test('identical repeated source entries do not create a false identifier conflict',()=>{
 const model=analyzeImportDocument('A claim (Santos, 2021).\n\nReferences\n\n'+second+'\n\n'+second);
 assert.equal(model.entries.length,2);assert.equal(model.records.length,1);assert.ok(model.records[0].identifiers.some(id=>id.value===shared));assert.ok(!model.diagnostics.some(item=>item.code==='import-conflicting-source-identifier'));
});
