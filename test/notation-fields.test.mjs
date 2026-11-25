import assert from 'node:assert/strict';
import test from 'node:test';
import {compileCitations,markerKind} from '../src/compiler.mjs';
import {compileHTML,compileMarkdown} from '../src/markup.mjs';
import {makeCache} from '../src/records.mjs';
import {annotateMarkers,collectMarkerTags} from '../src/tools.mjs';
const cache=()=>makeCache([{id:'work',title:'Work',authors:[{family:'Mori'}],issued:[2001],identifiers:[{scheme:'doi',value:'10.1234/work'}],state:'resolved'},{id:'other',title:'Other',authors:[{family:'Li'}],issued:[2002],state:'resolved'}]);
test('pipes are optional visual separators for works and endnote fields',()=>{
 const a=compileCitations('{cite work | note:"Mori 2001" | prefix:"see also" | locator:"p. 4"}\n\n{cite endnote | heading:"Sources" | level:3}',cache());
 const b=compileCitations('{cite work note:"Mori 2001" | prefix:"see also" locator:"p. 4"}\n\n{cite endnote heading:"Sources" level:3}',cache());
 assert.equal(a.html,b.html);assert.deepEqual(b.diagnostics,[]);
});
test('quoted colons, pipes, semicolons and escaped quotes remain value text',()=>{
 const result=compileCitations('{cite work note:"See: x | y; \\"z\\"" reference:"Mori. *A: B | C; D*. 2001."}',cache());
 assert.deepEqual(result.diagnostics,[]);assert.match(result.html,/A: B \| C; D/);
});
test('annotation updates notes with whitespace, pipes or mixed separators without duplicates',()=>{
 for(const source of ['{cite work note:"old" locator:"p. 4"}','{cite work | note:"old" locator:"p. 4"}','{cite work note:"old" | locator:"p. 4"}']){
 const result=annotateMarkers(source,cache());assert.equal((result.source.match(/note:/g)||[]).length,1);assert.match(result.source,/locator:"p. 4"/);assert.equal(annotateMarkers(result.source,cache()).source,result.source);
 }
 assert.deepEqual(collectMarkerTags([{source:'{cite work tags:a,b}',format:'text'}],cache()),{work:{a:1,b:1}});
});
const tags='{cite tags doi:10.1234/work methods:"Methods"}\n\n{cite tags other data:"Data"}';
test('author topic declarations and list filters work in text, Markdown and HTML',()=>{
 const source=tags+'\n\n{cite list work; other filters:true}';
 const saved=JSON.stringify(cache());
 for(const compile of [compileCitations,compileMarkdown,compileHTML]){
 const input=cache();const text=compile===compileHTML?source.split('\n\n').map(s=>'<p>'+s+'</p>').join(''):source;
 const result=compile(text,input);assert.deepEqual(result.diagnostics,[]);assert.match(result.html,/data-ci-tag-filter/);assert.match(result.html,/> Methods</);assert.deepEqual(result.cache.records.find(r=>r.id==='work').tags,['methods']);assert.equal(JSON.stringify(input),saved);assert.doesNotMatch(result.html,/\{cite tags/);
 }
});
test('tag declarations do not cite works and preserve identity and conflict checks',()=>{
 assert.equal(markerKind('{cite tags work methods:"Methods"}'),'tags');assert.equal(markerKind('{cite tags-2001}'),'citation');
 const only=compileCitations(tags,cache());assert.equal(only.cache.records.length,0);assert.doesNotMatch(only.html,/<ol/);
 assert.throws(()=>compileCitations(tags+'\n\n{cite tags work methods:"Different"}',cache()),/Conflicting label/);
 const unknown=compileCitations('{cite tags missing methods:"Methods"}',cache());assert.equal(unknown.diagnostics[0].code,'citation-unresolved');
 const seeded=compileCitations('{cite tags pending methods:"Methods"}',makeCache([{id:'pending',state:'unresolved'}]));assert.equal(seeded.diagnostics[0].code,'citation-unresolved');
 assert.equal(markerKind('{cite tags work methods:"Methods" methods:"Again"}'),'malformed');
});
test('a list can enable or disable filters independently of site defaults',()=>{
 const enabled=compileCitations(tags+'\n\n{cite list work; other filters:true}',cache(),{listFilters:{minItems:100,minTags:50}});assert.match(enabled.html,/data-ci-tag-filter/);
 const disabled=compileCitations(tags+'\n\n{cite list work; other filters:false}',cache(),{listFilters:true});assert.doesNotMatch(disabled.html,/data-ci-tag-filter/);
});
test('excluded Markdown and HTML do not assign topics',()=>{
 const md=compileMarkdown('```text\n{cite tags work methods:"Methods"}\n```\n\n{cite list work filters:true}',cache());assert.equal(md.cache.records[0].tags,undefined);
 const html=compileHTML('<code>{cite tags work methods:"Methods"}</code><p>{cite list work filters:true}</p>',cache());assert.equal(html.cache.records[0].tags,undefined);
});

test('identifier schemes after list semicolons are not mistaken for named options',()=>{
 const result=compileCitations('{cite list work; doi:10.1234/work filters:true}',cache());
 assert.equal(result.cache.records.length,1);assert.deepEqual(result.diagnostics,[]);
});
test('a record named tags survives editor annotation and custom keywords',()=>{
 const input=makeCache([{id:'tags',title:'Tags work',authors:[{family:'Tagger'}],issued:[2020],state:'resolved'}]);
 for(const citationKeyword of ['cite','ref']){
 const source=`{${citationKeyword} tags}`;const first=annotateMarkers(source,input,{citationKeyword});
 assert.equal(markerKind(first.source,{citationKeyword}),'citation');assert.equal(annotateMarkers(first.source,input,{citationKeyword}).source,first.source);
 assert.equal(markerKind(`{${citationKeyword} tags note:"old"}`,{citationKeyword}),'citation');
 }
});
