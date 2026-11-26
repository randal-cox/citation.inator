import test from 'node:test';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { compileCitations, planCitationOccurrences } from '../src/compiler.mjs';
import { compileHTML, compileMarkdown, rebaseCitationFragment } from '../src/markup.mjs';
import { markerKind, annotateMarkers, describeCitation, createSiteOccurrenceIndex, collectMarkerTags } from '../src/tools.mjs';
import { makeCache, normalizeRecord, toCSL } from '../src/records.mjs';
import { prepareReferences } from '../src/reference-features.mjs';
import { createCrossrefResolver } from '../src/crossref.mjs';

const work = (id, title, year = 1995, tags = []) => ({ id, title, state: 'resolved', authors: [{family:'Cox',given:'Randal'}], issued:[year], type:'book', tags });
const cache = makeCache([work('alpha', 'Alpha', 1995, ['theory']), work('beta', 'Beta', 1995, ['praxis']), work('gamma', 'Gamma', 2000, ['theory','praxis'])]);
const chicago = { citationStyle: 'chicago-author-date' };
const catalogue = [{id:'theory',label:'Theory',icon:'/icons/book.svg'}, {id:'praxis',label:'Praxis'}];

test('editor notes cannot affect compiled output, including unresolved hints, groups and markup', () => {
  for (const compile of [compileCitations, compileHTML, compileMarkdown]) for (const id of ['alpha']) {
    const plain = `Before {cite ${id} | locator:"p. 4"; beta} after.`;
    const annotated = `Before {cite ${id} | locator:"p. 4" | cue:"PRIVATE \\| \\; \\{quote\\}"; beta | cue:"stale"} after.`;
    assert.deepEqual(compile(plain,cache,chicago),compile(annotated,cache,chicago));
  }
  assert.match(compileCitations('{cite missing | legacy hint | cue:"Cox, 1995"}',cache).html,/Cox, 1995/);
  assert.ok(compileCitations('{cite alpha | cue:"one" | cue:"two"}',cache).diagnostics.some(d=>d.state==='malformed'));
});

test('query and annotation follow page-local suffixes, styles, reprints and curated identities', () => {
  assert.equal(describeCitation('alpha',cache,chicago).text,'Cox 1995');
  const input='😀\r\n{cite beta | cue: "old" ; alpha | prefix:"see also" | locator:"p. 4"}\r\n\r\n{cite endnote}';
  const result=annotateMarkers(input,cache,chicago);
  assert.match(result.source,/beta \| cue:"Cox 1995b" ; alpha/);
  assert.match(result.source,/locator:"p. 4" \| cue:"Cox 1995a"/);
  assert.equal(annotateMarkers(result.source,cache,chicago).changed,false);
  assert.deepEqual(compileCitations(input,cache,chicago),compileCitations(result.source,cache,chicago));
  const updated=makeCache(cache.records.map(record=>record.id==='alpha'?{...record,issued:[1996]}:record));
  assert.match(annotateMarkers(result.source,updated,chicago).source,/cue:"Cox 1996"/);
  assert.equal(describeCitation('alpha',cache,{citationStyle:'apa'}).text,'Cox, 1995');
  assert.equal(describeCitation('missing',cache).state,'unresolved');
  assert.equal(describeCitation('{cite alpha | form:wrong}',cache).state,'malformed');
  assert.equal(annotateMarkers('{cite missing | cue:"old"}',cache).changed,false);
  const reprint=makeCache([{...work('reprint','Book',1995),originalIssued:[1912]}]);
  assert.equal(describeCitation('reprint',reprint,chicago).text,'Cox [1912] 1995');
  assert.match(annotateMarkers('{ref alpha}',cache,{...chicago,citationKeyword:'ref'}).source,/cue:"Cox 1995"/);
});

test('annotation preserves literal source, excludes code and attributes, and handles CRLF Markdown', () => {
  const html='<p title="{cite alpha}">Text {cite alpha}.</p><code>{cite beta}</code><script>"{cite beta}"</script><!-- {cite beta} -->';
  const result=annotateMarkers(html,cache,{...chicago,format:'html'});
  assert.equal(result.edits.length,1);
  assert.equal(result.source,html.replace('Text {cite alpha}','Text {cite alpha | cue:"Cox 1995"}'));
  const md='`{cite beta}`\r\n\r\nBefore **text** {cite alpha}.\r\n\r\n```js\r\n{cite beta}\r\n```\r\n\r\n[link {cite beta}](https://example.org)';
  const marked=annotateMarkers(md,cache,{...chicago,format:'markdown'});
  assert.equal(marked.edits.length,1);
  assert.equal(marked.source,md.replace('Before **text** {cite alpha}','Before **text** {cite alpha | cue:"Cox 1995"}'));
  assert.equal(annotateMarkers(String.raw`Escaped \{cite alpha} and {cite alpha | label:"a\;b\|c"}`,cache).edits.length,1);
});

test('site index uses emitted anchors, includes repeat uses, rejects unsafe routes and deduplicates targets', () => {
  const first=compileCitations('First {cite alpha}. Again {cite alpha}.',cache,{...chicago,namespace:'essay-one'});
  const second=compileCitations('Other {cite beta}.',cache,{...chicago,namespace:'essay-two'});
  const index=createSiteOccurrenceIndex([{href:'/essays/one/',label:'Essay one',occurrences:first.occurrences},{href:'/essays/two/',label:'Essay two',occurrences:second.occurrences}]);
  assert.equal(index.alpha.length,2);
  for (const item of index.alpha) assert.ok(first.html.includes(`id="${item.href.split('#')[1]}"`));
  const list=compileCitations('{cite list alpha; beta}',cache,{...chicago,siteOccurrences:index});
  assert.ok(list.html.includes('Cited in:'));
  assert.ok(list.html.includes('data-ci-site-occurrences'));
  assert.match(list.html,/Return to Essay one.*occurrence b/);
  assert.equal(list.occurrences.length,0,'inspecting a bibliography does not invent an occurrence');
  assert.deepEqual(first,compileCitations('First {cite alpha}. Again {cite alpha}.',cache,{...chicago,namespace:'essay-one'}));
  const diagnostics=[];
  const accepted=prepareReferences({siteOrigin:'https://example.org',siteOccurrences:{alpha:[...index.alpha,index.alpha[0],{href:'javascript:alert(1)',label:'Bad'},{href:'https://evil.invalid/#a',label:'Bad'},{href:'/ok/#a',label:'<img>',context:'<script>'}]}},diagnostics);
  assert.equal(accepted.occurrences('alpha').length,3);
  assert.equal(diagnostics.length,2);
  const escaped=compileCitations('{cite list alpha}',cache,{siteOrigin:'https://example.org',siteOccurrences:{alpha:accepted.occurrences('alpha')}});
  assert.ok(!escaped.html.includes('<script>')); assert.ok(escaped.html.includes('&lt;script&gt;'));
  assert.throws(()=>createSiteOccurrenceIndex([{href:'//evil.invalid/',label:'No',occurrences:[]}]),/safe route/);
  const structured=planCitationOccurrences([{occurrenceId:'claim-one',recordId:'alpha'}],cache,{namespace:'structured',siteOccurrences:index,tagCatalogue:catalogue});
  assert.deepEqual(structured.occurrences[0].siteOccurrences,index.alpha);
  assert.equal(createSiteOccurrenceIndex([{href:'./chapter/',label:'Chapter',occurrences:structured.occurrences}]).alpha.length,1);
});

test('tag filters preserve curated metadata, use explicit lists and keep per-list roles separate', () => {
  assert.deepEqual(normalizeRecord({...work('tagged','Book'),tags:['theory','theory','bad tag','praxis']}).tags,['theory','praxis']);
  const options={tagCatalogue:catalogue,listFilters:true};
  const filtered=compileCitations('{cite list alpha; beta; gamma | tags:theory | sort:author}',cache,options);
  assert.match(filtered.html,/data-ci-list-record="alpha"/); assert.ok(!filtered.html.includes('data-ci-list-record="beta"'));
  assert.match(filtered.html,/data-ci-tag-filters hidden/); assert.match(filtered.html,/>Theory</);
  const all=compileCitations('{cite list alpha; beta; gamma | tags:theory,praxis | tag-mode:all}',cache,options);
  assert.ok(!all.html.includes('data-ci-list-record="alpha"')); assert.ok(all.html.includes('data-ci-list-record="gamma"'));
  const empty=compileCitations('{cite list beta | tags:theory}',cache,options);
  assert.match(empty.html,/No references match/);
  const overrides=compileCitations('{cite list alpha}',cache,{...options,listItemTags:{alpha:['praxis']}});
  assert.ok(!overrides.html.includes('>Theory<')); assert.ok(overrides.html.includes('>Praxis<'));
  assert.deepEqual(cache.records[0].tags,['theory']);
  assert.equal(toCSL(cache.records[0]).tags,undefined);
  const unknown=compileCitations('{cite list alpha}',cache,{tagCatalogue:[]});
  assert.ok(unknown.diagnostics.some(d=>d.state==='unknown-tag'));
  const badIcon=compileCitations('{cite list alpha}',cache,{tagCatalogue:[{id:'theory',label:'Theory',icon:'https://evil.invalid/x.svg'}]});
  assert.ok(badIcon.diagnostics.some(d=>d.state==='invalid-tag-icon'));
});

test('provider refresh retains curated tags', async () => {
  const resolver=createCrossrefResolver({fetch:async()=>new Response(JSON.stringify({message:{DOI:'10.1234/test',title:['Refreshed'],author:[{family:'Cox'}],issued:{'date-parts':[[1995]]}}}),{status:200}),minInterval:0});
  const prior={...work('alpha','Old'),tags:['theory'],identifiers:[{scheme:'doi',value:'10.1234/test'}]};
  const result=await resolver.resolve('10.1234/test',{seed:prior,force:true});
  assert.deepEqual(result.record.tags,['theory']);
});

test('JSON CLI describes, transforms and checks notes without writing source files', () => {
  const run=(flag,request)=>spawnSync(process.execPath,['scripts/compile.mjs',flag,'--json'],{input:JSON.stringify(request),encoding:'utf8'});
  const described=run('--describe',{citation:'alpha',cache,options:chicago});
  assert.equal(described.status,0,described.stderr); assert.equal(JSON.parse(described.stdout).text,'Cox 1995');
  const transformed=run('--annotate',{source:'{cite alpha}',cache,options:chicago});
  assert.equal(transformed.status,0,transformed.stderr);
  assert.equal(run('--check-notes',{source:'{cite alpha}',cache,options:chicago}).status,1);
  assert.equal(run('--check-notes',{source:JSON.parse(transformed.stdout).source,cache,options:chicago}).status,0);
  const collected=run('--collect-tags',{sources:['{cite alpha | tags:theory}','{cite alpha | tags:theory,praxis}'],cache,options:{includeDiagnostics:true}});
  assert.equal(collected.status,0,collected.stderr);
  assert.deepEqual(JSON.parse(collected.stdout),{counts:{alpha:{theory:2,praxis:1}},diagnostics:[]});
});

test('annotation safely quotes provider markup and line breaks without changing reader output', () => {
  const unsafe=makeCache([{...work('unsafe','Work'),authors:[{family:'<img src=x onerror=alert(1)> & Cox\nJr.'}]}]);
  for (const [format,compile,source] of [['text',compileCitations,'{cite unsafe}'],['html',compileHTML,'<p>{cite unsafe}</p>'],['markdown',compileMarkdown,'Text {cite unsafe}.']]) {
    const result=annotateMarkers(source,unsafe,{...chicago,format});
    assert.equal(result.edits.length,1);
    assert.ok(!result.edits[0].text.includes('\n'));
    if(format!=='text') assert.ok(!result.edits[0].text.includes('<img'));
    assert.deepEqual(compile(result.source,unsafe,chicago),compile(source,unsafe,chicago));
    assert.equal(annotateMarkers(result.source,unsafe,{...chicago,format}).changed,false);
  }
});

test('annotation shares compilation eligibility and preserves relative targets without a page base', () => {
  const source='<p><span role="note">See {cite alpha}.</span> <span contenteditable="false">More {cite beta}.</span> <a href="#x">{cite gamma}</a></p>';
  const result=annotateMarkers(source,cache,{...chicago,format:'html'});
  assert.equal(result.edits.length,2);
  assert.match(result.source,/cue:"Cox 1995a"/); assert.match(result.source,/cue:"Cox 1995b"/);
  assert.deepEqual(compileHTML(result.source,cache,chicago),compileHTML(source,cache,chicago));
  const md='<a href="#x">{cite beta}</a> and {cite alpha}.';
  const marked=annotateMarkers(md,cache,{...chicago,format:'markdown'});
  assert.equal(marked.edits.length,1); assert.match(marked.source,/cue:"Cox 1995"/);
  const links=prepareReferences({siteOccurrences:{alpha:[{href:'../article.html#x',label:'Parent'},{href:'./article.html#x',label:'Sibling'}]}}).occurrences('alpha');
  assert.equal(links.length,2);
});

test('build-time tag filters establish the actual bibliography before assigning suffixes', () => {
  const result=compileCitations('{cite list alpha; beta | tags:theory}',cache,{...chicago,tagCatalogue:catalogue});
  assert.ok(!result.html.includes('1995a')); assert.ok(!result.html.includes('1995b'));
  assert.deepEqual(result.cache.records.map(record=>record.id),['alpha']);
});

test('unsupported encoded notation and filtered unknown records remain diagnosable', () => {
  for(const format of ['html','markdown']) {
    const result=annotateMarkers('<p>&#123;cite alpha&#125;</p>',cache,{...chicago,format});
    assert.equal(result.changed,false);
    assert.ok(result.diagnostics.some(d=>d.state==='annotation-encoded-marker-skipped'));
  }
  const filtered=compileCitations('{cite list missing | tags:theory}',cache,{tagCatalogue:catalogue});
  assert.ok(filtered.diagnostics.some(d=>d.state==='unresolved'));
  assert.equal(describeCitation('{cite alpha} trailing',cache).state,'malformed');
});

test('rebased copies update tag masks and local site-use metadata together', () => {
  const compiled=compileCitations('Use {cite alpha}.',cache,{...chicago,namespace:'original',tagCatalogue:catalogue,
    siteOccurrences:{alpha:[{href:'#original-cite-alpha-1',label:'This article',context:'Use'}]}});
  const rebased=rebaseCitationFragment(compiled.html,'original','copy');
  assert.ok(rebased.includes('id="copy_tag-mask-'));
  assert.ok(!rebased.includes('id="original_tag-mask-'));
  assert.ok(!rebased.includes('url(#original_tag-mask-'));
  assert.ok(rebased.includes('#copy-cite-alpha-1'));
  assert.ok(!rebased.includes('#original-cite-alpha-1'));
});

test('tag hooks and filter thresholds retain reading-list semantics', () => {
  const source='{cite list alpha; beta; gamma}';
  const base={tagCatalogue:catalogue,classPrefix:'host-ref'};
  const filtered=compileCitations(source,cache,{...base,listFilters:{minItems:3,minTags:2}});
  assert.match(filtered.html,/data-citation-part="reading-list"/);
  assert.ok(!filtered.html.includes('data-citation-part="endnotes"'));
  assert.match(filtered.html,/<ol class="host-ref-reference-list"/);
  assert.match(filtered.html,/data-ci-tag="theory"/);
  assert.ok(filtered.html.includes('data-ci-tag-filters'));
  for(const options of [{minItems:4,minTags:2},{minItems:1,minTags:3},{}]) {
    assert.ok(!compileCitations(source,cache,{...base,listFilters:options}).html.includes('data-ci-tag-filters'));
  }
  assert.ok(!compileCitations('{cite list alpha}',cache,{...base,listFilters:{minItems:1,minTags:2}}).html.includes('data-ci-tag-filters'));
  assert.throws(()=>compileCitations(source,cache,{listFilters:{minItems:-1}}),/threshold/);
});

test('nocite inventory reports listed uses at actual endnote anchors without inventing citations', () => {
  const compiled=compileCitations('{cite nocite alpha}\n\n{cite endnote}',cache,{namespace:'listing'});
  assert.equal(compiled.citationDescriptions.length,0);
  assert.deepEqual(compiled.occurrences,[{recordId:'alpha',anchorId:'listing-note-alpha',kind:'listed',context:'Endnotes'}]);
  const index=createSiteOccurrenceIndex([{href:'/reading/',label:'Reading',occurrences:compiled.occurrences}]);
  const bibliography=compileCitations('{cite list alpha}',cache,{siteOccurrences:index});
  assert.ok(bibliography.html.includes('Listed in:'));
  assert.ok(!bibliography.html.includes('Cited in:'));
  assert.match(bibliography.html,/Return to listing in Reading/);
  assert.ok(compiled.html.includes('id="listing-note-alpha"'));
  assert.ok(bibliography.html.indexOf('data-ci-note-record="alpha"')<bibliography.html.indexOf('Listed in:'));
  const mixed=compileCitations('{cite alpha}\n\n{cite nocite alpha}',cache,{namespace:'mixed'});
  const mixedIndex=createSiteOccurrenceIndex([{href:'/mixed/',label:'Mixed',occurrences:mixed.occurrences}]);
  assert.equal(mixedIndex.alpha.length,1);
  assert.notEqual(mixedIndex.alpha[0].kind,'listed');
  assert.equal(compileCitations('{cite nocite alpha}',cache,{references:'isolated'}).occurrences.length,0);
  const scoped=compileCitations('{cite nocite alpha}\n\n{cite endnote | scope:since-last}',cache,{namespace:'scoped'});
  for(const occurrence of scoped.occurrences) assert.ok(scoped.html.includes(`id="${occurrence.anchorId}"`));
});

test('unresolved and malformed diagnostics expose stable codes without replacing legacy state', () => {
  const result=compileCitations('{cite missing}\n\n{cite alpha | form:wrong}',cache);
  assert.ok(result.diagnostics.some(d=>d.state==='unresolved'&&d.code==='citation-unresolved'));
  assert.ok(result.diagnostics.some(d=>d.state==='malformed'&&d.code==='citation-malformed'));
  assert.equal(describeCitation('{cite alpha} trailing',cache).diagnostics[0].code,'citation-malformed');
  assert.ok(annotateMarkers('{cite missing}',cache).diagnostics.some(d=>d.code==='citation-unresolved'));
});

test('marker tags are reader-neutral metadata preserved by annotation and counted per contribution', () => {
  const sources=['{cite alpha | tags:a}', '{cite alpha | cue:"old" | tags:a,b}'];
  assert.deepEqual(collectMarkerTags(sources),{alpha:{a:2,b:1}});
  for(const compile of [compileCitations,compileHTML,compileMarkdown]) {
    assert.deepEqual(compile('{cite alpha | tags:a,b}',cache),compile('{cite alpha}',cache));
    assert.deepEqual(compile('{cite missing | tags:a,b}',cache),compile('{cite missing}',cache));
  }
  const annotated=annotateMarkers(sources[1],cache,chicago);
  assert.match(annotated.source,/tags:a,b/);
  assert.deepEqual(collectMarkerTags([annotated.source]),{alpha:{a:1,b:1}});
  assert.equal(annotateMarkers(annotated.source,cache,chicago).changed,false);
  const aliases=makeCache([{...work('alpha','Alpha'),identifiers:[{scheme:'doi',value:'10.1234/alpha'}]}]);
  assert.deepEqual(collectMarkerTags(['{cite alpha | tags:a}', '{cite 10.1234/alpha | tags:a,b}'],aliases),{alpha:{a:2,b:1}});
  assert.deepEqual(collectMarkerTags(['{cite 10.1234/alpha | tags:a}']),{'doi:10.1234/alpha':{a:1}});
  assert.deepEqual(collectMarkerTags(['{cite alpha | tags:a,a}']),{alpha:{a:1}});
  const result=collectMarkerTags(['{cite missing | tags:a}'],cache,{includeDiagnostics:true});
  assert.deepEqual(result.counts,{missing:{a:1}});
  assert.equal(result.diagnostics[0].code,'citation-unresolved');
});

test('tag collection shares HTML and Markdown exclusions and supports custom notation', () => {
  const sources=[{format:'html',source:'<p>{cite alpha | tags:a}</p><code>{cite alpha | tags:code}</code><a href="#x">{cite alpha | tags:link}</a>'},
    {format:'markdown',source:'`{cite alpha | tags:code}`\n\n{ref alpha | tags:a,b}\n\n```\n{ref alpha | tags:code}\n```',options:{citationKeyword:'ref'}}];
  assert.deepEqual(collectMarkerTags(sources,cache),{alpha:{a:2,b:1}});
  const skipped=collectMarkerTags([{format:'html',source:'&#123;cite alpha | tags:a&#125;'}],cache,{includeDiagnostics:true});
  assert.deepEqual(skipped.counts,{});
  assert.ok(skipped.diagnostics.some(d=>d.state==='annotation-encoded-marker-skipped'));
  assert.throws(()=>collectMarkerTags('not an array'),/array/);
  const inline=compileCitations('{cite alpha | tags:praxis}',cache,{tagCatalogue:catalogue,inlineTags:'marker',references:'isolated'});
  assert.ok(inline.html.includes('data-ci-tag="praxis"'));
  assert.ok(!inline.html.includes('data-ci-tag="theory"'));
  assert.throws(()=>createSiteOccurrenceIndex([{href:'/x/',label:'X',occurrences:[{recordId:'alpha',anchorId:'id',kind:'typo'}]}]),/kind/);
  for(const kind of [null,false,'']) {
    const diagnostics=[];
    assert.equal(prepareReferences({siteOccurrences:{alpha:[{href:'/x/#id',label:'X',kind}]}},diagnostics).occurrences('alpha').length,0);
    assert.equal(diagnostics[0].state,'invalid-site-occurrence');
  }
});

test('referenceItemPrefix receives isolated metadata and emits safe text before each reference',()=>{
 const before=JSON.stringify(cache);const seen=[];
 const result=compileCitations('{cite list alpha; beta}',cache,{classPrefix:'host',referenceItemPrefix:info=>{seen.push({id:info.record.id,kind:info.kind});info.record.title='Changed';return '<Theory> ';}});
 assert.equal(seen.length,2);assert.ok(seen.every(item=>item.kind==='reading-list'));assert.equal(JSON.stringify(cache),before);
 assert.match(result.html,/class="host-reference-prefix"[^>]*>&lt;Theory&gt; <\/span>/);assert.ok(!result.html.includes('Changed'));
 assert.throws(()=>compileCitations('{cite list alpha}',cache,{referenceItemPrefix:'text'}),/function/);
 assert.throws(()=>compileCitations('{cite list alpha}',cache,{referenceItemPrefix:()=>({html:'<b>unsafe</b>'})}),/return text/);
});

test('markerKind classifies whole compiler markers without duplicating reserved-name heuristics',()=>{
 for(const [raw,kind] of [
  ['{cite list-2001}','citation'],['{cite local:list}','citation'],['{cite endnote}','endnote'],['{endnotes}','malformed'],
  ['{cite list alpha}','list'],['{cite nocite alpha}','nocite'],['{cite evidence}','annotation'],['{cite credit}','annotation'],
  ['{cite list-2001}','citation'],['{citation evidence}','malformed'],['{cite alpha | form:wrong}','malformed'],['text {cite alpha}','malformed'],
  ['{cite alpha} trailing','malformed'],['{cite alpha} {cite beta}','malformed'],['\\{cite alpha}','malformed']
 ]) assert.equal(markerKind(raw),kind,raw);
 assert.equal(markerKind('{ref endnote}',{citationKeyword:'ref'}),'endnote');assert.equal(markerKind('{ref alpha}',{citationKeyword:'ref'}),'citation');
 assert.equal(markerKind('{ref alpha}',{citationKeyword:'ref'}),'citation');assert.equal(markerKind('{cite alpha}',{citationKeyword:'ref'}),'malformed');
 assert.throws(()=>markerKind(null),TypeError);
});

test('work-context annotation agrees with standalone descriptions while reader year letters stay contextual',()=>{
 const source='{cite beta; alpha | locator:12}\n\n{cite endnote}';
 const work=annotateMarkers(source,cache,{...chicago,noteContext:'work'});
 assert.equal((work.source.match(/cue:"Cox 1995"/g)||[]).length,2);assert.ok(!work.source.includes('1995a'));assert.ok(!work.source.includes('1995b'));
 assert.equal(annotateMarkers(work.source,cache,{...chicago,noteContext:'work'}).changed,false);
 assert.deepEqual(compileCitations(source,cache,chicago),compileCitations(work.source,cache,chicago));
 assert.match(annotateMarkers(source,cache,chicago).source,/1995a/);assert.match(annotateMarkers(source,cache,chicago).source,/1995b/);
 assert.equal(describeCitation('alpha',cache,chicago).text,'Cox 1995');
 assert.equal(annotateMarkers(source,cache,{...chicago,suffixScope:'cache',noteContext:'work'}).source,work.source);
 assert.throws(()=>annotateMarkers(source,cache,{noteContext:'wrong'}),/noteContext/);
});

test('work notes stay consistent in markup and the JSON annotation/check CLI',()=>{
 for(const [format,source] of [['html','<p>{cite alpha; beta}</p>'],['markdown','Text {cite alpha; beta}.']]) {
  const annotated=annotateMarkers(source,cache,{...chicago,format,noteContext:'work'});
  assert.equal((annotated.source.match(/cue:"Cox 1995"/g)||[]).length,2);assert.equal(annotateMarkers(annotated.source,cache,{...chicago,format,noteContext:'work'}).changed,false);
  const compile=format==='html'?compileHTML:compileMarkdown;assert.deepEqual(compile(source,cache,chicago),compile(annotated.source,cache,chicago));
 }
 const request={source:'{cite alpha; beta}',cache,options:{...chicago,noteContext:'work'}};
 const run=spawnSync(process.execPath,['scripts/compile.mjs','--annotate','--json'],{input:JSON.stringify(request),encoding:'utf8'});assert.equal(run.status,0);const result=JSON.parse(run.stdout);
 const check=spawnSync(process.execPath,['scripts/compile.mjs','--check-notes','--json'],{input:JSON.stringify({...request,source:result.source}),encoding:'utf8'});assert.equal(check.status,0);assert.equal(JSON.parse(check.stdout).changed,false);
});
