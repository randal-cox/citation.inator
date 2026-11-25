import assert from 'node:assert/strict';
import {test} from 'node:test';
import {compileCitations,parseDirectives,scanCitationMarkers,markerKind} from '../src/compiler.mjs';
import {compileHTML,compileMarkdown} from '../src/markup.mjs';
import {annotateMarkers} from '../src/tools.mjs';
import {processImportRequest} from '../src/import-api.mjs';
const cache={schema:'citation-inator.cache.v1',records:[{id:'one',state:'resolved',type:'book',title:'A source',authors:[{family:'Rivera'}],issued:[2020]}]};

test('one configured keyword covers work and every directive without implicit aliases',()=>{
 for(const citationKeyword of [undefined,'reference','citation']){
  const keyword=citationKeyword??'cite',options=citationKeyword?{citationKeyword}:{};
  for(const [body,kind] of [['one','citation'],['endnote','endnote'],['list one','list'],['nocite one','nocite'],['evidence','annotation'],['credit','annotation']])assert.equal(markerKind(`{${keyword} ${body}}`,options),kind);
  for(const other of ['cite','citation','reference'].filter(value=>value!==keyword))assert.equal(scanCitationMarkers(`{${other} one} {${other} endnote}`,options).length,0);
  assert.equal(markerKind('{endnotes}',options),'malformed');
 }
});

test('text HTML Markdown and note tools agree on cite default and retain literal unconfigured text',()=>{
 for(const compile of [compileCitations,compileHTML,compileMarkdown]){
  const source=compile===compileHTML?'<p>Before {cite one}.</p><p>{cite endnote}</p><p>After.</p>':'Before {cite one}.\n\n{cite endnote}\n\nAfter.';
  const result=compile(source,cache,{namespace:'default-cite'});
  assert.equal(result.diagnostics.length,0);assert.equal(result.cache.records[0].id,'one');
  assert(!result.html.includes('{cite endnote}'));assert(result.html.indexOf('default-cite-note-one')<result.html.lastIndexOf('After.'));
  const literal=compile('{citation one} {endnotes}',cache,{namespace:'literal'});
  assert(literal.html.includes('{citation one}'));assert(literal.html.includes('{endnotes}'));assert.equal(literal.cache.records.length,0);
 }
 const source='A {cite one}.';assert(annotateMarkers(source,cache).source.includes('note:"Rivera, 2020"'));
 assert.equal(annotateMarkers('{citation one}',cache).changed,false);
 assert.equal(parseDirectives('\\{cite one}').map(token=>token.text).join(''),'{cite one}');
});

test('headless import writes the same default keyword it protects and compiles',()=>{
 const context={source:'A claim (Rivera, 2020).',records:cache.records};
 const analysis=processImportRequest(context);
 const result=processImportRequest({...context,action:'preview',review:analysis.review,reviewId:analysis.review.reviewId,decisions:[{citationIndex:0,action:'accept',targets:[{recordId:'one'}]}]});
 assert(result.source.includes('{cite one}'));assert.equal(markerKind(scanCitationMarkers(result.source)[0].raw),'citation');
 assert.equal(result.diagnostics.length,0);
});
