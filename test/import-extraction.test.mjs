import test from 'node:test';
import assert from 'node:assert/strict';
import {extractImportText,mapImportRange,detectExtractedCitations} from '../src/import-extraction.mjs';

test('HTML import recognizes formatted citation links without treating targets as identities',()=>{
 const source='<p>😀 See (<a role="link" href="https://example.invalid/opaque?x=1&amp;y=2"><em>Avery</em> &amp; Bennett, 2021</a>).</p>';
 const before=source;
 const extracted=extractImportText(source,{format:'html'});
 const detected=detectExtractedCitations(extracted);
 assert.equal(detected.citations.length,1);
 assert.equal(detected.citations[0].raw,'(Avery & Bennett, 2021)');
 assert.deepEqual(detected.citations[0].items[0].authors,['Avery','Bennett']);
 assert.equal(extracted.links[0].href,'https://example.invalid/opaque?x=1&y=2');
 const fragments=detected.citations[0].sourceFragments;
 assert.ok(fragments.some(f=>f.link===0));
 assert.ok(fragments.some(f=>!f.exact));
 for(const fragment of fragments.filter(f=>f.exact)) assert.equal(source.slice(fragment.sourceStart,fragment.sourceEnd),extracted.text.slice(fragment.start,fragment.end));
 assert.equal(source,before);
 assert.equal(detected.citations[0].requiresReview,true);
});

test('HTML import excludes code, attributes, controls, hidden and generated citation UI',()=>{
 const source='<head><title>(Wrong, 2021)</title></head><body><p title="(Wrong, 2021)">(Avery, 2021)</p>'+['code','pre','script','style','textarea','button','svg','math','template'].map(tag=>`<${tag}>(Wrong, 2021)</${tag}>`).join('')+
 '<p hidden>(Wrong, 2021)</p><p aria-hidden="true">(Wrong, 2021)</p><span role="button">(Wrong, 2021)</span><div contenteditable>(Wrong, 2021)</div><div data-ci-record="a">(Wrong, 2021)</div></body>';
 const detected=detectExtractedCitations(extractImportText(source,{format:'html'}));
 assert.deepEqual(detected.citations.map(c=>c.raw),['(Avery, 2021)']);
});

test('HTML import never bridges excluded content or paragraph boundaries',()=>{
 for(const source of ['<p>Avery</p><p>(2021)</p>','<p>(Avery<code>omit</code>, 2021)</p>','<p>Avery<br>(2021)</p>','<p>Avery<input value="hidden"> (2021)</p>','<p>Avery<img src="opaque"> (2021)</p>']) {
  assert.equal(detectExtractedCitations(extractImportText(source,{format:'html'})).citations.length,0);
 }
 const result=detectExtractedCitations(extractImportText('<p>(<i>Avery</i>, 2021)</p>',{format:'html'}));
 assert.equal(result.citations[0].raw,'(Avery, 2021)');
 assert.equal(result.citations[0].sourceFragments.length,3);
});

test('plain text extraction has an exact identity map including UTF-16 offsets',()=>{
 const source='😀 before (Avery, 2021) after';
 const extraction=extractImportText(source);
 const citation=detectExtractedCitations(extraction).citations[0];
 assert.deepEqual(citation.sourceFragments,[{start:source.indexOf('('),end:source.indexOf(')')+1,sourceStart:source.indexOf('('),sourceEnd:source.indexOf(')')+1,exact:true}]);
 assert.equal(extraction.text,source);
 assert.throws(()=>extractImportText(source,{format:'markdown'}),/supports text and html/);
 assert.throws(()=>mapImportRange(extraction,{start:0,end:0}),/nonempty/);
 assert.throws(()=>mapImportRange(extraction,{start:-1,end:1}),/nonempty/);
});

test('decoded text and CRLF mappings are conservative and diagnostics disclose CSS limits',()=>{
 const source='<p>Context\r\n&#40;Avery, 2021&#41;</p>';
 const extraction=extractImportText(source,{format:'html'});
 const detected=detectExtractedCitations(extraction);
 assert.equal(detected.citations.length,1);
 assert.deepEqual(detected.citations[0].sourceFragments,[{start:extraction.text.indexOf('('),end:extraction.text.indexOf(')')+1,sourceStart:3,sourceEnd:source.indexOf('</p>'),exact:false}]);
 assert.ok(detected.diagnostics.some(d=>d.code==='import-html-rendering-not-evaluated'));
});

test('closed native disclosure and dialog content is not treated as visible prose',()=>{
 const source='<details><summary>Heading</summary><p>(Wrong, 2021)</p></details><dialog>(Wrong, 2021)</dialog><details open><summary>(Wrong, 2021)</summary><p>(Avery, 2021)</p></details><dialog open>(Bennett, 2020)</dialog>';
 assert.deepEqual(detectExtractedCitations(extractImportText(source,{format:'html'})).citations.map(c=>c.raw),['(Avery, 2021)','(Bennett, 2020)']);
});
