import test from 'node:test';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { compileCitations, planCitationOccurrences } from '../src/compiler.mjs';
import { compileHTML, compileMarkdown, rebaseCitationFragment } from '../src/markup.mjs';
import { annotateMarkers, describeCitation, createSiteOccurrenceIndex, collectMarkerTags } from '../src/tools.mjs';
import { makeCache, normalizeRecord, toCSL } from '../src/records.mjs';
import { prepareReferences } from '../src/reference-features.mjs';
import { createCrossrefResolver } from '../src/crossref.mjs';

const work = (id, title, year = 1995, tags = []) => ({ id, title, state: 'resolved', authors: [{family:'Cox',given:'Randal'}], issued:[year], type:'book', tags });
const cache = makeCache([work('alpha', 'Alpha', 1995, ['theory']), work('beta', 'Beta', 1995, ['praxis']), work('gamma', 'Gamma', 2000, ['theory','praxis'])]);
const chicago = { citationStyle: 'chicago-author-date' };
const catalogue = [{id:'theory',label:'Theory',icon:'/icons/book.svg'}, {id:'praxis',label:'Praxis'}];

test('editor notes cannot affect compiled output, including unresolved hints, groups and markup', () => {
  for (const compile of [compileCitations, compileHTML, compileMarkdown]) for (const id of ['alpha','missing']) {
    const plain = `Before {citation ${id} | locator:"p. 4"; beta} after.`;
    const annotated = `Before {citation ${id} | locator:"p. 4" | note:"PRIVATE \\| \\; \\{quote\\}"; beta | note:"stale"} after.`;
    assert.deepEqual(compile(plain,cache,chicago),compile(annotated,cache,chicago));
  }
  assert.deepEqual(compileCitations('{citation missing | legacy hint}',cache),compileCitations('{citation missing | legacy hint | note:"hidden"}',cache));
  assert.ok(compileCitations('{citation alpha | note:"one" | note:"two"}',cache).diagnostics.some(d=>d.state==='malformed'));
});

test('query and annotation follow page-local suffixes, styles, reprints and curated identities', () => {
  assert.equal(describeCitation('alpha',cache,chicago).text,'Cox 1995');
  const input='😀\r\n{citation beta | note: "old" ; alpha | prefix:"see also" | locator:"p. 4"}\r\n\r\n{citation endnote}';
  const result=annotateMarkers(input,cache,chicago);
  assert.match(result.source,/beta \| note:"Cox 1995b" ; alpha/);
  assert.match(result.source,/locator:"p. 4" \| note:"Cox 1995a"/);
  assert.equal(annotateMarkers(result.source,cache,chicago).changed,false);
  assert.deepEqual(compileCitations(input,cache,chicago),compileCitations(result.source,cache,chicago));
  const updated=makeCache(cache.records.map(record=>record.id==='alpha'?{...record,issued:[1996]}:record));
  assert.match(annotateMarkers(result.source,updated,chicago).source,/note:"Cox 1996"/);
  assert.equal(describeCitation('alpha',cache,{citationStyle:'apa'}).text,'Cox, 1995');
  assert.equal(describeCitation('missing',cache).state,'unresolved');
  assert.equal(describeCitation('{citation alpha | form:wrong}',cache).state,'malformed');
  assert.equal(annotateMarkers('{citation missing | note:"old"}',cache).changed,false);
  const reprint=makeCache([{...work('reprint','Book',1995),originalIssued:[1912]}]);
  assert.equal(describeCitation('reprint',reprint,chicago).text,'Cox [1912] 1995');
  assert.match(annotateMarkers('{ref alpha}',cache,{...chicago,citationKeyword:'ref'}).source,/note:"Cox 1995"/);
});

test('annotation preserves literal source, excludes code and attributes, and handles CRLF Markdown', () => {
  const html='<p title="{citation alpha}">Text {citation alpha}.</p><code>{citation beta}</code><script>"{citation beta}"</script><!-- {citation beta} -->';
  const result=annotateMarkers(html,cache,{...chicago,format:'html'});
  assert.equal(result.edits.length,1);
  assert.equal(result.source,html.replace('Text {citation alpha}','Text {citation alpha | note:"Cox 1995"}'));
  const md='`{citation beta}`\r\n\r\nBefore **text** {citation alpha}.\r\n\r\n```js\r\n{citation beta}\r\n```\r\n\r\n[link {citation beta}](https://example.org)';
  const marked=annotateMarkers(md,cache,{...chicago,format:'markdown'});
  assert.equal(marked.edits.length,1);
  assert.equal(marked.source,md.replace('Before **text** {citation alpha}','Before **text** {citation alpha | note:"Cox 1995"}'));
  assert.equal(annotateMarkers(String.raw`Escaped \{citation alpha} and {citation alpha | label:"a\;b\|c"}`,cache).edits.length,1);
});

test('site index uses emitted anchors, includes repeat uses, rejects unsafe routes and deduplicates targets', () => {
  const first=compileCitations('First {citation alpha}. Again {citation alpha}.',cache,{...chicago,namespace:'essay-one'});
  const second=compileCitations('Other {citation beta}.',cache,{...chicago,namespace:'essay-two'});
  const index=createSiteOccurrenceIndex([{href:'/essays/one/',label:'Essay one',occurrences:first.occurrences},{href:'/essays/two/',label:'Essay two',occurrences:second.occurrences}]);
  assert.equal(index.alpha.length,2);
  for (const item of index.alpha) assert.ok(first.html.includes(`id="${item.href.split('#')[1]}"`));
  const list=compileCitations('{citation list alpha; beta}',cache,{...chicago,siteOccurrences:index});
  assert.ok(list.html.includes('Cited in:'));
  assert.ok(list.html.includes('data-ci-site-occurrences'));
  assert.match(list.html,/Return to Essay one.*occurrence b/);
  assert.equal(list.occurrences.length,0,'inspecting a bibliography does not invent an occurrence');
  assert.deepEqual(first,compileCitations('First {citation alpha}. Again {citation alpha}.',cache,{...chicago,namespace:'essay-one'}));
  const diagnostics=[];
  const accepted=prepareReferences({siteOrigin:'https://example.org',siteOccurrences:{alpha:[...index.alpha,index.alpha[0],{href:'javascript:alert(1)',label:'Bad'},{href:'https://evil.invalid/#a',label:'Bad'},{href:'/ok/#a',label:'<img>',context:'<script>'}]}},diagnostics);
  assert.equal(accepted.occurrences('alpha').length,3);
  assert.equal(diagnostics.length,2);
  const escaped=compileCitations('{citation list alpha}',cache,{siteOrigin:'https://example.org',siteOccurrences:{alpha:accepted.occurrences('alpha')}});
  assert.ok(!escaped.html.includes('<script>')); assert.ok(escaped.html.includes('&lt;script&gt;'));
  assert.throws(()=>createSiteOccurrenceIndex([{href:'//evil.invalid/',label:'No',occurrences:[]}]),/safe route/);
  const structured=planCitationOccurrences([{occurrenceId:'claim-one',recordId:'alpha'}],cache,{namespace:'structured',siteOccurrences:index,tagCatalogue:catalogue});
  assert.deepEqual(structured.occurrences[0].siteOccurrences,index.alpha);
  assert.equal(createSiteOccurrenceIndex([{href:'./chapter/',label:'Chapter',occurrences:structured.occurrences}]).alpha.length,1);
});

test('tag filters preserve curated metadata, use explicit lists and keep per-list roles separate', () => {
  assert.deepEqual(normalizeRecord({...work('tagged','Book'),tags:['theory','theory','bad tag','praxis']}).tags,['theory','praxis']);
  const options={tagCatalogue:catalogue,listFilters:true};
  const filtered=compileCitations('{citation list alpha; beta; gamma | tags:theory | sort:author}',cache,options);
  assert.match(filtered.html,/data-ci-list-record="alpha"/); assert.ok(!filtered.html.includes('data-ci-list-record="beta"'));
  assert.match(filtered.html,/data-ci-tag-filters hidden/); assert.match(filtered.html,/>Theory</);
  const all=compileCitations('{citation list alpha; beta; gamma | tags:theory,praxis | tag-mode:all}',cache,options);
  assert.ok(!all.html.includes('data-ci-list-record="alpha"')); assert.ok(all.html.includes('data-ci-list-record="gamma"'));
  const empty=compileCitations('{citation list beta | tags:theory}',cache,options);
  assert.match(empty.html,/No references match/);
  const overrides=compileCitations('{citation list alpha}',cache,{...options,listItemTags:{alpha:['praxis']}});
  assert.ok(!overrides.html.includes('>Theory<')); assert.ok(overrides.html.includes('>Praxis<'));
  assert.deepEqual(cache.records[0].tags,['theory']);
  assert.equal(toCSL(cache.records[0]).tags,undefined);
  const unknown=compileCitations('{citation list alpha}',cache,{tagCatalogue:[]});
  assert.ok(unknown.diagnostics.some(d=>d.state==='unknown-tag'));
  const badIcon=compileCitations('{citation list alpha}',cache,{tagCatalogue:[{id:'theory',label:'Theory',icon:'https://evil.invalid/x.svg'}]});
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
  const transformed=run('--annotate',{source:'{citation alpha}',cache,options:chicago});
  assert.equal(transformed.status,0,transformed.stderr);
  assert.equal(run('--check-notes',{source:'{citation alpha}',cache,options:chicago}).status,1);
  assert.equal(run('--check-notes',{source:JSON.parse(transformed.stdout).source,cache,options:chicago}).status,0);
  const collected=run('--collect-tags',{sources:['{citation alpha | tags:theory}','{citation alpha | tags:theory,praxis}'],cache,options:{includeDiagnostics:true}});
  assert.equal(collected.status,0,collected.stderr);
  assert.deepEqual(JSON.parse(collected.stdout),{counts:{alpha:{theory:2,praxis:1}},diagnostics:[]});
});

test('annotation safely quotes provider markup and line breaks without changing reader output', () => {
  const unsafe=makeCache([{...work('unsafe','Work'),authors:[{family:'<img src=x onerror=alert(1)> & Cox\nJr.'}]}]);
  for (const [format,compile,source] of [['text',compileCitations,'{citation unsafe}'],['html',compileHTML,'<p>{citation unsafe}</p>'],['markdown',compileMarkdown,'Text {citation unsafe}.']]) {
    const result=annotateMarkers(source,unsafe,{...chicago,format});
    assert.equal(result.edits.length,1);
    assert.ok(!result.edits[0].text.includes('\n'));
    if(format!=='text') assert.ok(!result.edits[0].text.includes('<img'));
    assert.deepEqual(compile(result.source,unsafe,chicago),compile(source,unsafe,chicago));
    assert.equal(annotateMarkers(result.source,unsafe,{...chicago,format}).changed,false);
  }
});

test('annotation shares compilation eligibility and preserves relative targets without a page base', () => {
  const source='<p><span role="note">See {citation alpha}.</span> <span contenteditable="false">More {citation beta}.</span> <a href="#x">{citation gamma}</a></p>';
  const result=annotateMarkers(source,cache,{...chicago,format:'html'});
  assert.equal(result.edits.length,2);
  assert.match(result.source,/note:"Cox 1995a"/); assert.match(result.source,/note:"Cox 1995b"/);
  assert.deepEqual(compileHTML(result.source,cache,chicago),compileHTML(source,cache,chicago));
  const md='<a href="#x">{citation beta}</a> and {citation alpha}.';
  const marked=annotateMarkers(md,cache,{...chicago,format:'markdown'});
  assert.equal(marked.edits.length,1); assert.match(marked.source,/note:"Cox 1995"/);
  const links=prepareReferences({siteOccurrences:{alpha:[{href:'../article.html#x',label:'Parent'},{href:'./article.html#x',label:'Sibling'}]}}).occurrences('alpha');
  assert.equal(links.length,2);
});

test('build-time tag filters establish the actual bibliography before assigning suffixes', () => {
  const result=compileCitations('{citation list alpha; beta | tags:theory}',cache,{...chicago,tagCatalogue:catalogue});
  assert.ok(!result.html.includes('1995a')); assert.ok(!result.html.includes('1995b'));
  assert.deepEqual(result.cache.records.map(record=>record.id),['alpha']);
});

test('unsupported encoded notation and filtered unknown records remain diagnosable', () => {
  for(const format of ['html','markdown']) {
    const result=annotateMarkers('<p>&#123;citation alpha&#125;</p>',cache,{...chicago,format});
    assert.equal(result.changed,false);
    assert.ok(result.diagnostics.some(d=>d.state==='annotation-encoded-marker-skipped'));
  }
  const filtered=compileCitations('{citation list missing | tags:theory}',cache,{tagCatalogue:catalogue});
  assert.ok(filtered.diagnostics.some(d=>d.state==='unresolved'));
  assert.equal(describeCitation('{citation alpha} trailing',cache).state,'malformed');
});

test('rebased copies update tag masks and local site-use metadata together', () => {
  const compiled=compileCitations('Use {citation alpha}.',cache,{...chicago,namespace:'original',tagCatalogue:catalogue,
    siteOccurrences:{alpha:[{href:'#original-cite-alpha-1',label:'This article',context:'Use'}]}});
  const rebased=rebaseCitationFragment(compiled.html,'original','copy');
  assert.ok(rebased.includes('id="copy_tag-mask-'));
  assert.ok(!rebased.includes('id="original_tag-mask-'));
  assert.ok(!rebased.includes('url(#original_tag-mask-'));
  assert.ok(rebased.includes('#copy-cite-alpha-1'));
  assert.ok(!rebased.includes('#original-cite-alpha-1'));
});

test('tag hooks and filter thresholds retain reading-list semantics', () => {
  const source='{citation list alpha; beta; gamma}';
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
  assert.ok(!compileCitations('{citation list alpha}',cache,{...base,listFilters:{minItems:1,minTags:2}}).html.includes('data-ci-tag-filters'));
  assert.throws(()=>compileCitations(source,cache,{listFilters:{minItems:-1}}),/threshold/);
});

test('nocite inventory reports listed uses at actual endnote anchors without inventing citations', () => {
  const compiled=compileCitations('{citation nocite alpha}\n\n{citation endnote}',cache,{namespace:'listing'});
  assert.equal(compiled.citationDescriptions.length,0);
  assert.deepEqual(compiled.occurrences,[{recordId:'alpha',anchorId:'listing-note-alpha',kind:'listed',context:'Endnotes'}]);
  const index=createSiteOccurrenceIndex([{href:'/reading/',label:'Reading',occurrences:compiled.occurrences}]);
  const bibliography=compileCitations('{citation list alpha}',cache,{siteOccurrences:index});
  assert.ok(bibliography.html.includes('Listed in:'));
  assert.ok(!bibliography.html.includes('Cited in:'));
  assert.match(bibliography.html,/Return to listing in Reading/);
  assert.ok(compiled.html.includes('id="listing-note-alpha"'));
  assert.ok(bibliography.html.indexOf('data-ci-note-record="alpha"')<bibliography.html.indexOf('Listed in:'));
  const mixed=compileCitations('{citation alpha}\n\n{citation nocite alpha}',cache,{namespace:'mixed'});
  const mixedIndex=createSiteOccurrenceIndex([{href:'/mixed/',label:'Mixed',occurrences:mixed.occurrences}]);
  assert.equal(mixedIndex.alpha.length,1);
  assert.notEqual(mixedIndex.alpha[0].kind,'listed');
  assert.equal(compileCitations('{citation nocite alpha}',cache,{references:'isolated'}).occurrences.length,0);
  const scoped=compileCitations('{citation nocite alpha}\n\n{citation endnote | scope:since-last}',cache,{namespace:'scoped'});
  for(const occurrence of scoped.occurrences) assert.ok(scoped.html.includes(`id="${occurrence.anchorId}"`));
});

test('unresolved and malformed diagnostics expose stable codes without replacing legacy state', () => {
  const result=compileCitations('{citation missing}\n\n{citation alpha | form:wrong}',cache);
  assert.ok(result.diagnostics.some(d=>d.state==='unresolved'&&d.code==='citation-unresolved'));
  assert.ok(result.diagnostics.some(d=>d.state==='malformed'&&d.code==='citation-malformed'));
  assert.equal(describeCitation('{citation alpha} trailing',cache).diagnostics[0].code,'citation-malformed');
  assert.ok(annotateMarkers('{citation missing}',cache).diagnostics.some(d=>d.code==='citation-unresolved'));
});

test('marker tags are reader-neutral metadata preserved by annotation and counted per contribution', () => {
  const sources=['{citation alpha | tags:a}', '{citation alpha | note:"old" | tags:a,b}'];
  assert.deepEqual(collectMarkerTags(sources),{alpha:{a:2,b:1}});
  for(const compile of [compileCitations,compileHTML,compileMarkdown]) {
    assert.deepEqual(compile('{citation alpha | tags:a,b}',cache),compile('{citation alpha}',cache));
    assert.deepEqual(compile('{citation missing | tags:a,b}',cache),compile('{citation missing}',cache));
  }
  const annotated=annotateMarkers(sources[1],cache,chicago);
  assert.match(annotated.source,/tags:a,b/);
  assert.deepEqual(collectMarkerTags([annotated.source]),{alpha:{a:1,b:1}});
  assert.equal(annotateMarkers(annotated.source,cache,chicago).changed,false);
  const aliases=makeCache([{...work('alpha','Alpha'),identifiers:[{scheme:'doi',value:'10.1234/alpha'}]}]);
  assert.deepEqual(collectMarkerTags(['{citation alpha | tags:a}', '{citation 10.1234/alpha | tags:a,b}'],aliases),{alpha:{a:2,b:1}});
  assert.deepEqual(collectMarkerTags(['{citation 10.1234/alpha | tags:a}']),{'doi:10.1234/alpha':{a:1}});
  assert.deepEqual(collectMarkerTags(['{citation alpha | tags:a,a}']),{alpha:{a:1}});
  const result=collectMarkerTags(['{citation missing | tags:a}'],cache,{includeDiagnostics:true});
  assert.deepEqual(result.counts,{missing:{a:1}});
  assert.equal(result.diagnostics[0].code,'citation-unresolved');
});

test('tag collection shares HTML and Markdown exclusions and supports custom notation', () => {
  const sources=[{format:'html',source:'<p>{citation alpha | tags:a}</p><code>{citation alpha | tags:code}</code><a href="#x">{citation alpha | tags:link}</a>'},
    {format:'markdown',source:'`{citation alpha | tags:code}`\n\n{ref alpha | tags:a,b}\n\n```\n{ref alpha | tags:code}\n```',options:{citationKeyword:'ref'}}];
  assert.deepEqual(collectMarkerTags(sources,cache),{alpha:{a:2,b:1}});
  const skipped=collectMarkerTags([{format:'html',source:'&#123;citation alpha | tags:a&#125;'}],cache,{includeDiagnostics:true});
  assert.deepEqual(skipped.counts,{});
  assert.ok(skipped.diagnostics.some(d=>d.state==='annotation-encoded-marker-skipped'));
  assert.throws(()=>collectMarkerTags('not an array'),/array/);
  const inline=compileCitations('{citation alpha | tags:praxis}',cache,{tagCatalogue:catalogue,inlineTags:'marker',references:'isolated'});
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
 const result=compileCitations('{citation list alpha; beta}',cache,{classPrefix:'host',referenceItemPrefix:info=>{seen.push({id:info.record.id,kind:info.kind});info.record.title='Changed';return '<Theory> ';}});
 assert.equal(seen.length,2);assert.ok(seen.every(item=>item.kind==='reading-list'));assert.equal(JSON.stringify(cache),before);
 assert.match(result.html,/class="host-reference-prefix"[^>]*>&lt;Theory&gt; <\/span>/);assert.ok(!result.html.includes('Changed'));
 assert.throws(()=>compileCitations('{citation list alpha}',cache,{referenceItemPrefix:'text'}),/function/);
 assert.throws(()=>compileCitations('{citation list alpha}',cache,{referenceItemPrefix:()=>({html:'<b>unsafe</b>'})}),/return text/);
});
