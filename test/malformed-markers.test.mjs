import test from 'node:test';import assert from 'node:assert/strict';
import {compileCitations,markerKind,scanCitationMarkers} from '../src/compiler.mjs';
import {compileHTML,compileMarkdown} from '../src/markup.mjs';
import {annotateMarkers,collectMarkerTags} from '../src/tools.mjs';
import {makeCache} from '../src/records.mjs';const cache=makeCache([]);
test('incomplete configured markers are reported by compilers and scanner',()=>{
 for(const citationKeyword of ['cite','citation','reference'])for(const source of [`{${citationKeyword} pending`,`{${citationKeyword} pending unresolved:"broken}`,`{${citationKeyword}}`,`{${citationKeyword}`]){
 const options={citationKeyword};for(const compile of [compileCitations,compileHTML,compileMarkdown])assert.ok(compile(source,cache,options).diagnostics.some(d=>d.code==='citation-malformed'),source+' '+compile.name);
 assert.equal(markerKind(source,options),'malformed');assert.ok(scanCitationMarkers(source,options).some(m=>m.token.malformed));
 }
});
test('malformed diagnostics do not claim other keywords, escaped examples or excluded code',()=>{
 for(const source of ['{xref figure-1}','{citation pending','\\{cite pending'])assert.equal(compileCitations(source,cache).diagnostics.length,0);
 assert.equal(compileHTML('<code>{cite pending</code>',cache).diagnostics.length,0);assert.equal(compileMarkdown('`{cite pending`',cache).diagnostics.length,0);assert.equal(compileMarkdown('```text\n{cite pending\n```',cache).diagnostics.length,0);
});
test('editor tools report incomplete configured markers without editing source',()=>{
 const source='Before {reference pending unresolved:"broken}';const options={citationKeyword:'reference'};const result=annotateMarkers(source,cache,options);assert.equal(result.source,source);assert.ok(result.diagnostics.some(d=>d.code==='citation-malformed'));
 assert.ok(collectMarkerTags([{source}],cache,{...options,includeDiagnostics:true}).diagnostics.some(d=>d.code==='citation-malformed'));
});

test('editor Markdown masking leaves incomplete examples inside code excluded',()=>{
 for(const source of ['`{cite pending`','```text\n{cite pending\n```','<code>{cite pending</code>']){
 const options={format:'markdown'};assert.equal(annotateMarkers(source,cache,options).diagnostics.length,0);assert.equal(collectMarkerTags([{source,format:'markdown'}],cache,{includeDiagnostics:true}).diagnostics.length,0);
 }
});
