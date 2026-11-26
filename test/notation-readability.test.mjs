import test from 'node:test';import assert from 'node:assert/strict';
import {compileCitations,markerKind,scanCitationMarkers,citationOptionPolicy} from '../src/compiler.mjs';
import {compileMarkdown,compileHTML} from '../src/markup.mjs';
import {annotateMarkers,migrateCitationCues} from '../src/tools.mjs';
import {makeCache} from '../src/records.mjs';
const cache=makeCache([{id:'work',state:'resolved',type:'book',title:'A work',authors:[{family:'Cox',given:'Randal'}],issued:[1995]}]);
test('multiline and optional separators preserve citation meaning across public compilers',()=>{
 const forms=['{cite work locator:"p. 2"}','{cite\n  work\n  locator:"p. 2"\n}','{cite\r\n work\r\n\r\n | locator:"p. 2"\r\n}'];
 for(const compile of [compileCitations,compileMarkdown,compileHTML])for(const source of forms){assert.equal(markerKind(source),'citation');assert.deepEqual(compile(source,cache).citationDescriptions,compile(forms[0],cache).citationDescriptions);assert.equal(compile(source,cache).diagnostics.length,0);}
});
test('source annotations never enter compiled reader artifacts, including malformed ownership and HTML-shaped values',()=>{
 const cases=['{cite work cue:"CANARY" comment:"CANARY"}','{cite missing comment:"CANARY"}','{cite work comment:"CANARY" form:wrong}','{cite work comment:\nFIRST_CANARY\nLAST_CANARY}','{cite work comment:"FIRST_CANARY {cite work} LAST_CANARY','{cite work comment:"FIRST_CANARY \\} LAST_CANARY','{cite work comment:"<b>CANARY</b>"}','{cite work comment:"&quot;CANARY&quot;"}','{cite work comment:"CANARY" comment:"CANARY"}','{cite work note:"CANARY"}'];
 for(const source of cases)for(const compile of [compileCitations,compileMarkdown,compileHTML])assert(!JSON.stringify(compile(source,cache)).includes('CANARY'),compile.name+' leaked an annotation');
});
test('author comments may contain escaped punctuation, quoted fields and grouped markers without rendering',()=>{
 const source='{cite work comment:"CANARY \\"quote\\" ; | {cite work}"; work cue:"CANARY" comment:"CANARY"}';
 assert.equal(markerKind(source),'citation');assert(!JSON.stringify(compileMarkdown(source,cache)).includes('CANARY'));assert.equal(scanCitationMarkers(source).length,1);
 assert.equal(citationOptionPolicy('comment').action,'review');assert.equal(citationOptionPolicy('cue').action,'recompute');
});
test('cue refresh preserves multiline layout and comments byte-for-byte',()=>{
 const source='Before {cite\r\n work\r\n\r\n cue:"old"\r\n comment:"DO NOT CHANGE | note:\\"private\\""\r\n}. After';
 const result=annotateMarkers(source,cache,{format:'markdown'});assert.equal(result.source,source.replace('cue:"old"','cue:"Cox, 1995"'));
});
test('explicit note-to-cue migration changes only authored field keys and leaves literal code and metadata prose alone',()=>{
 const source='Prose note:"leave"\n\n`{cite work note:"code"}`\n\n{cite\n work\n note:"old"\n comment:"note:\\"leave\\""\n}';
 const result=migrateCitationCues(source,{format:'markdown'});assert.equal(result.source,source.replace('note:"old"','cue:"old"'));assert.equal(result.edits.length,1);assert.equal(markerKind('{cite work note:"old"}'),'malformed');
});
test('multiple newline endnote directives and fenced literal markers stay distinct',()=>{
 const result=compileMarkdown('A {cite\n work\n}.\n\n{cite\n endnote\n}\n\n```text\n{cite work comment:"literal example"}\n```',cache);assert.equal(result.citationDescriptions.length,1);assert.equal(result.diagnostics.length,0);assert(result.html.includes('literal example'));
});

test('encoded HTML opening braces do not bypass source-comment ownership',()=>{
 for(const source of ['&#123;cite work comment:"<b>CANARY</b>"&#125;','&#123;cite work comment:"&quot;CANARY&quot;"&#125;','&lcub;cite work comment:"CANARY"&rcub;'])for(const compile of [compileHTML,compileMarkdown])assert(!JSON.stringify(compile(source,cache)).includes('CANARY'));
 const result=annotateMarkers('`{cite work comment:"CANARY`',cache,{format:'markdown'});assert.equal(result.changed,false);assert.equal(result.diagnostics.length,0);
});

test('encoded Markdown outer markers own literal nested markers before inline processing',()=>{
 const source='&#123;cite work comment:"CANARY {cite work} INSIDE_CANARY"}';
 assert(!JSON.stringify(compileMarkdown(source,cache)).includes('CANARY'));
 for(const source of ['`&#123;cite work comment:"literal example"&#125;`','```text\n&#123;cite work comment:"literal example"&#125;\n```'])assert(compileMarkdown(source,cache).html.includes('literal example'));
});

test('indented keyword styles share grammar, markup ownership and source-preserving tools',()=>{
 const forms=['{cite work locator:"p. 2"}','{ cite work locator:"p. 2" }','{\n  cite\n  work\n  locator:"p. 2"\n}','{\r\n\t cite\r\n work locator:"p. 2"\r\n}'];
 for(const compile of [compileCitations,compileMarkdown,compileHTML])for(const source of forms){assert.equal(markerKind(source),'citation');assert.deepEqual(compile(source,cache).citationDescriptions,compile(forms[0],cache).citationDescriptions);assert.equal(compile(source,cache).diagnostics.length,0);}
 const source='{\n cite\n work\n cue:"old"\n comment:"CANARY"\n}';
 assert.equal(annotateMarkers(source,cache,{format:'markdown'}).source,source.replace('cue:"old"','cue:"Cox, 1995"'));
 assert.equal(migrateCitationCues(source.replace('cue:','note:'),{format:'markdown'}).source,source);
 for(const compile of [compileCitations,compileMarkdown,compileHTML])for(const suffix of ['}','']){const result=compile('{\n cite work comment:"CANARY"'+suffix,cache);assert(!JSON.stringify(result).includes('CANARY'));}
 assert.equal(markerKind('{\n reference work\n}',{citationKeyword:'reference'}),'citation');
 const rendered=compileMarkdown('A {\n cite work\n}.\n\n{\n cite endnote\n}',cache);assert.equal(rendered.citationDescriptions.length,1);assert.equal(rendered.diagnostics.length,0);
 const literal=compileMarkdown('`{ cite work}` and \\{ cite work\\}',cache);assert.equal(literal.citationDescriptions.length,0);assert.equal(literal.diagnostics.length,0);
 assert.equal(scanCitationMarkers('{ cite-other work}').length,0);
});

test('cue is a flagged provisional identity until genuine resolution, and comments stay source-only',()=>{
 const source='{\n cite\n unknown\n cue:"Rivera, 2020"\n locator:"p. 4"\n comment:"HIDDEN_CANARY original wording and editorial context"\n}';
 for(const compile of [compileCitations,compileHTML,compileMarkdown])for(const state of ['unresolved','partial','resolved']){
  const data=makeCache([{id:'unknown',state,title:'Different metadata',authors:[{family:'Actual'}],issued:[2021]}]);const result=compile(source,data,{citationStyle:'apa'});
  assert(!JSON.stringify(result).includes('HIDDEN_CANARY'));assert.equal(result.cache.records[0].state,state);
  if(state==='resolved'){assert(!JSON.stringify(result).includes('Rivera, 2020'));assert(result.html.includes('Actual'));assert.equal(result.diagnostics.length,0);}
  else{assert(result.html.includes('Rivera, 2020, p. 4'));assert(result.html.includes('data-ci-state="unresolved-placeholder"'));assert(result.diagnostics.some(x=>x.code==='citation-unresolved-placeholder'));}
 }
 for(const compile of [compileCitations,compileHTML,compileMarkdown]){const result=compile('{\n cite work cue:"<b>CANARY</b>" comment:"CANARY"}',cache);assert(!JSON.stringify(result).includes('CANARY'));}
});

test('encoded whitespace before keywords retains comment ownership across HTML and Markdown',()=>{
 for(const source of ['{&#10;cite work comment:"<b>CANARY</b>"}','&#123;&#32;cite work comment:"&quot;CANARY&quot;"}','{&Tab;cite work comment:"<b>CANARY</b>"}','{&NewLine;cite work comment:"CANARY"}','{&#x2003;cite work comment:"CANARY"}'])for(const compile of [compileHTML,compileMarkdown])assert(!JSON.stringify(compile(source,cache)).includes('CANARY'),compile.name+' '+source);
});

test('encoded grammar and atomic markup cannot disclose comment payload or shorten ownership',()=>{
 const cases=['{cite work comment:"<span title="}">CANARY</span>"}','{c&#105;te work comment:"<b>CANARY</b>"}','{cite work comm&#101;nt:"<b>CANARY</b>"}','{cite work comment&#58;"<b>CANARY</b>"}','{cite work comment:&quot;}CANARY&quot;}','{c&#105;te work comm&#101;nt&#58;"<span title="}">CANARY</span>"}','{cite work comment:"<b>"</b>CANARY"}','{cite work comment:"<span title="}">CANARY'];
 for(const source of cases)for(const compile of [compileHTML,compileMarkdown])assert(!JSON.stringify(compile(source,cache)).includes('CANARY'),compile.name+' leaked '+source);
 for(const source of cases){const literal=compileHTML('<code>'+source+'</code>',cache);assert(literal.html.includes('CANARY'));}
 const ordinary=compileHTML('<p>{cite work comment:"<b>hidden</b>"}</p><p><em>Following sibling</em></p>',cache);assert(ordinary.html.includes('<em>Following sibling</em>'));
});

test('raw-text comments use explicit quote escaping and leave following prose untouched',()=>{
 const valid=String.raw`{cite work comment:"<span title=\"}\">CANARY</span>"}`;
 assert(!JSON.stringify(compileCitations(valid,cache)).includes('CANARY'));
 const ordinary=compileCitations('{cite work comment:"SOURCE_COMMENT_CANARY"} Ordinary following text.',cache);assert(ordinary.html.includes('Ordinary following text.'));assert(!ordinary.html.includes('SOURCE_COMMENT_CANARY'));
});
