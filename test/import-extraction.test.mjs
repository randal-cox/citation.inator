import test from 'node:test';
import assert from 'node:assert/strict';
import { marked } from 'marked';
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
 assert.throws(()=>extractImportText(source,{format:'docx'}),/supports text, html and markdown/);
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

test('Markdown citation labels retain original-source fragments through links and formatting',()=>{
 const source='😀 ([**Avery** & Bennett, 2021](https://example.invalid/opaque)).\r\n\r\nOther (Chan, 2020).';
 const extraction=extractImportText(source,{format:'markdown'});
 const result=detectExtractedCitations(extraction);
 assert.deepEqual(result.citations.map(c=>c.raw),['(Avery & Bennett, 2021)','(Chan, 2020)']);
 assert.ok(result.citations[0].sourceFragments.some(fragment=>fragment.link===0));
 for(const c of result.citations) for(const f of c.sourceFragments.filter(f=>f.exact)) assert.equal(source.slice(f.sourceStart,f.sourceEnd),extraction.text.slice(f.start,f.end));
 assert.equal(source.slice(extraction.links[0].sourceStart,extraction.links[0].sourceEnd),'[**Avery** & Bennett, 2021](https://example.invalid/opaque)');
});

test('Markdown escapes and entities are visible with conservative source mapping',()=>{
 const source='See \\(Avery &amp; Bennett, 2021\\).';
 const extraction=extractImportText(source,{format:'markdown'});
 const citation=detectExtractedCitations(extraction).citations[0];
 assert.equal(citation.raw,'(Avery & Bennett, 2021)');
 assert.ok(citation.sourceFragments.some(fragment=>!fragment.exact));
 assert.equal(source.slice(citation.sourceFragments[0].sourceStart,citation.sourceFragments[0].sourceEnd),'\\(');
});

test('Markdown code, image targets, link destinations and definitions are protected',()=>{
 const source='`(Wrong, 2021)`\n\n```text\n(Wrong, 2021)\n```\n\n![caption (Wrong, 2021)](data:image/png;base64,abc)\n\n[Label](https://example.invalid/\"(Wrong,2021)\")\n\n[(Avery, 2021)][ref]\n\n[ref]: https://example.invalid/target \"(Wrong, 2021)\"';
 const extraction=extractImportText(source,{format:'markdown'});
 assert.deepEqual(detectExtractedCitations(extraction).citations.map(c=>c.raw),['(Avery, 2021)']);
 assert.equal(extraction.links.at(-1).href,'https://example.invalid/target');
});

test('Markdown skips unmappable containers and raw HTML with explicit diagnostics',()=>{
 const source='> Text\n> (Wrong, 2021)\n\nText <span hidden>(Wrong, 2021)</span>\n\n(Avery, 2021)';
 const extraction=extractImportText(source,{format:'markdown'});
 assert.deepEqual(detectExtractedCitations(extraction).citations.map(c=>c.raw),['(Avery, 2021)']);
 assert.ok(extraction.diagnostics.some(d=>['token-source-location','ambiguous-content-source'].includes(d.reason)));
 assert.ok(extraction.diagnostics.some(d=>d.reason==='raw-html-context'));
 assert.ok(extraction.diagnostics.every(d=>d.sourceStart>=0&&d.sourceEnd<=source.length));
});

test('Markdown does not bridge inline code, images, hard breaks or list items',()=>{
 for(const source of ['Avery `code` (2021)','Avery ![alt](opaque) (2021)','Avery  \n(2021)','- Avery\n- (2021)']) assert.equal(detectExtractedCitations(extractImportText(source,{format:'markdown'})).citations.length,0);
});

test('Markdown entity recognition agrees with rendered HTML and requires semicolons',()=>{
 for(const amp of ['&AMP','&#38','&#x26','&amp;','&#38;','&#x26;']) {
  const source=`(Avery ${amp} Bennett, 2021)`;
  const direct=detectExtractedCitations(extractImportText(source,{format:'markdown'}));
  const rendered=detectExtractedCitations(extractImportText(marked.parse(source),{format:'html'}));
  assert.deepEqual(direct.citations.map(c=>c.raw),rendered.citations.map(c=>c.raw),amp);
 }
});

test('URL labels are opaque while formatted citation labels remain eligible',()=>{
 for(const source of ['<https://example.invalid/(Wrong,2021)>','https://example.invalid/(Wrong,2021)','[https://example.invalid/(Wrong,2021)](https://target.invalid)']) assert.equal(detectExtractedCitations(extractImportText(source,{format:'markdown'})).citations.length,0);
 const html='<a href="https://example.invalid">https://example.invalid/(Wrong,2021)</a>';
 assert.equal(detectExtractedCitations(extractImportText(html,{format:'html'})).citations.length,0);
 assert.equal(detectExtractedCitations(extractImportText('[(Avery, 2021)](https://example.invalid)',{format:'markdown'})).citations.length,1);
});

test('Markdown content bounds prevent mapping visible headings to delimiter syntax',()=>{
 const source='### # **Avery** (2021)';
 const extraction=extractImportText(source,{format:'markdown'});
 assert.equal(extraction.segments[0].sourceStart,4);
 for(const segment of extraction.segments.filter(s=>s.exact)) assert.equal(source.slice(segment.sourceStart,segment.sourceEnd),extraction.text.slice(segment.start,segment.end));
 const ambiguous=extractImportText('[Avery](https://example.invalid/Avery)',{format:'markdown'});
 assert.ok(ambiguous.diagnostics.some(d=>d.reason==='ambiguous-content-source'));
});

test('original notation protection survives Markdown transformations and custom keywords',()=>{
 for(const citationKeyword of ['citation','ref']) {
  const source=`{${citationKeyword} alpha | cue:"first \`code\` Avery (2021)"} After (Bennett, 2020).`;
  const extraction=extractImportText(source,{format:'markdown',citationKeyword});
  assert.deepEqual(detectExtractedCitations(extraction).citations.map(c=>c.raw),['(Bennett, 2020)']);
  assert.throws(()=>detectExtractedCitations(extraction,{citationKeyword:'different'}),/same citationKeyword/);
 }
});

test('encoded marker delimiters remain protected before Markdown inline transformations',()=>{
 const source='&#123;cite alpha | cue:"before `code` Avery (2021)"&#125; After (Bennett, 2020).';
 assert.deepEqual(detectExtractedCitations(extractImportText(source,{format:'markdown'})).citations.map(c=>c.raw),['(Bennett, 2020)']);
});

test('escaped literal notation examples are protected before Markdown removes escapes',()=>{
 for(const citationKeyword of ['citation','ref']) {
  const source=`\\{${citationKeyword} alpha | cue:"first \`code\` Avery (2021)"} After (Bennett, 2020).`;
  assert.deepEqual(detectExtractedCitations(extractImportText(source,{format:'markdown',citationKeyword})).citations.map(c=>c.raw),['(Bennett, 2020)']);
 }
});
