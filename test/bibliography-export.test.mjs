import test from 'node:test';
import assert from 'node:assert/strict';
import {exportBibliography} from '../src/bibliography-export.mjs';
import {makeCache,toCSL,normalizeRecord} from '../src/records.mjs';
import {fromCSLJSON} from '../src/csl-json.mjs';
import {compileCitations} from '../src/compiler.mjs';
const article={id:'study',type:'article-journal',state:'resolved',title:'Évidence & science',authors:[{family:'Rivera',given:'Ana'}],issued:[2020,2,4],containerTitle:'Research Methods',publisher:'Example Press',publisherPlace:'London',volume:'12',issue:'2',pages:'14–19',identifiers:[{scheme:'doi',value:'10.1234/evidence'}]};
const cache=(...records)=>makeCache(records);

test('document exports include used works once, including further reading, excluding unused cached works',()=>{
 const data=cache(article,{...article,id:'book',type:'book',title:'Further reading',identifiers:[]},{...article,id:'unused',title:'Unused cache',identifiers:[]});
 const result=compileCitations('{cite study}. {cite doi:10.1234/evidence}. {cite book nocite:true}\n\n{cite endnote}',data);
 for(const format of ['csl-json','bibtex','ris']){
  const exported=exportBibliography(result.cache,{format});assert.equal(exported.recordCount,2);assert(!exported.text.includes('Unused cache'));assert(exported.text.includes('Further reading'));assert.equal(exported.text,exportBibliography(result.cache,{format}).text);
 }
 assert.equal(exportBibliography(data).recordCount,3); // Explicitly selected cache: caller controls scope.
});
test('CSL export preserves structured roles, edition and original dates, while omitting private text',()=>{
 const r={...article,type:'chapter',editors:[{literal:'Research Collective'}],translators:[{family:'Jones',given:'Alex'}],edition:'2',originalIssued:[1912],note:'PRIVATE_EDITORIAL_NOTE',abstract:{text:'PRIVATE_ABSTRACT',source:'Private'},provenance:[{provider:'PRIVATE_PROVIDER',note:'PRIVATE_PROVENANCE'}],source:{key:'PRIVATE_MANAGER'},locations:[{provider:'PRIVATE_SERVICE',kind:'publisher',url:'https://example.org/article'}]};
 const out=exportBibliography(cache(r)),items=JSON.parse(out.text);assert.equal(items.length,1);assert.equal(items[0].type,'chapter');assert.equal(items[0].editor[0].literal,'Research Collective');assert.equal(items[0].translator[0].family,'Jones');assert.equal(items[0].edition,'2');assert.deepEqual(items[0]['original-date']['date-parts'],[[1912]]);assert.equal(items[0]['publisher-place'],'London');assert(!out.text.includes('PRIVATE_'));assert(!Object.hasOwn(items[0],'note'));
});
test('BibTeX protects record text against entry, comment and TeX injection',()=>{
 const r={...article,title:'A }\n@book{evil, title={injected}} % & # _ $ \\command ~ ^',authors:[{literal:'Science and Research'}]};
 const {text}=exportBibliography(cache(r),{format:'bibtex'});
 assert.equal((text.match(/^@/gm)||[]).length,1);assert.match(text,/\\\} @book\\\{/);assert.match(text,/\\textbackslash\{\}command/);assert.match(text,/author = \{\{Science and Research\}\}/);assert(!text.includes('undefined'));
});
test('RIS prevents metadata from injecting tags and keeps page ranges and e-locators distinct',()=>{
 const injected={...article,title:'Title\r\nER  - \nTY  - BOOK\u2028AU  - Intruder'};
 const out=exportBibliography(cache(injected),{format:'ris'});assert.equal((out.text.match(/^TY  - /gm)||[]).length,1);assert.equal((out.text.match(/^ER  - /gm)||[]).length,1);assert.match(out.text,/SP  - 14\r\nEP  - 19/);
 const locator=exportBibliography(cache({...article,pages:'',articleNumber:'e124'}),{format:'ris'});assert.match(locator.text,/SP  - e124/);assert(!locator.text.includes('EP  -'));
});
test('losses are explicit, empty selection stays empty, invalid schema never produces a file',()=>{
 const r={...article,type:'software',releaseVersion:'2.0',translators:[{family:'Jones'}],displayDate:'forthcoming',issued:null,citationParts:[{text:'Custom reference'}],identifiers:[...article.identifiers,{scheme:'doi',value:'10.1234/other'}]};
 for(const format of ['csl-json','bibtex','ris']){const out=exportBibliography(cache(r),{format});assert(out.diagnostics.some(d=>d.code==='export-custom-reference-omitted'));assert(out.diagnostics.some(d=>d.code==='export-additional-identifiers-omitted'));assert.equal(out.recordCount,1);}
 for(const format of ['bibtex','ris'])assert(exportBibliography(cache(r),{format}).diagnostics.some(d=>d.field==='translator'));
 assert.deepEqual(JSON.parse(exportBibliography(cache()).text),[]);assert.equal(exportBibliography(cache(),{format:'ris'}).text,'');assert.throws(()=>exportBibliography({record:article}),/schema/);assert.throws(()=>exportBibliography(cache(article),{format:'html'}),/Choose/);
});
test('supported title markup survives normalization, CSL round trip, Chicago/APA and portable exports without raw HTML',()=>{
 const raw={type:'article-journal',title:'Study of <i>Species</i> and <b>evidence</b> &amp; science',author:[{family:'Rivera'}],issued:{'date-parts':[[2020]]},'container-title':'Journal of <i>Methods</i>'};
 const selected=fromCSLJSON(raw,{recordId:'formatted'});assert.equal(selected.requiresReview,false);assert.equal(selected.record.title,'Study of Species and evidence & science');
 const normalized=normalizeRecord(selected.record);assert.deepEqual(normalized.titleParts,selected.record.titleParts);const csl=toCSL(normalized);assert.equal(csl.title,raw.title);assert.deepEqual(fromCSLJSON(csl,{recordId:'formatted'}).record.titleParts,normalized.titleParts);
 for(const citationStyle of ['chicago-author-date','apa']){const compiled=compileCitations('{cite formatted}',cache(normalized),{citationStyle});assert.match(compiled.html,/<em>Species<\/em>/);assert.match(compiled.html,/<strong>evidence<\/strong>/);assert.match(compiled.html,/<em>Journal of <\/em>Methods/);}
 assert.equal(JSON.parse(exportBibliography(cache(normalized)).text)[0].title,raw.title);
 for(const format of ['bibtex','ris']){const out=exportBibliography(cache(normalized),{format});assert(out.diagnostics.some(d=>d.code==='export-title-formatting-omitted'));assert(!out.text.includes('<i>'));}
 const overridden=normalizeRecord({...normalized,title:'Author override'});assert(!overridden.titleParts);
});
test('plain title angle brackets stay text; unsupported and nested markup requires review; book emphasis reverses inner italics',()=>{
 const input={type:'book',title:'<b>Bold</b> and <i>italic</i>',author:[{literal:'Collective'}],issued:{'date-parts':[[2020]]}};
 const book=fromCSLJSON(input,{recordId:'book'});const output=compileCitations('{cite book}',cache(book.record),{citationStyle:'chicago-author-date'});assert.match(output.html,/<strong><em>Bold<\/em><\/strong>/);assert.match(output.html,/<em> and <\/em>italic/);
 for(const title of ['<span style="color:red">Unsafe</span>','<i><b>Nested</b></i>','Safe<script>alert(1)</script>']){const r=fromCSLJSON({...input,title},{recordId:'x'});assert(r.requiresReview);assert(!r.record.titleParts);assert(!compileCitations('{cite x}',cache(r.record)).html.includes('alert(1)'));}
 const text=toCSL(normalizeRecord({...article,title:'A < B & C > D'}));assert.equal(text.title,'A &lt; B &amp; C &gt; D');
});

test('review fixes preserve URL and name boundaries without inventing a thesis degree',()=>{
 const data=cache({...article,type:'thesis',authors:[{family:'Anderson and Sons',given:'Ana',suffix:'Jr.'}],identifiers:[...article.identifiers,{scheme:'url',value:'https://example.org/reading'}]});
 const bib=exportBibliography(data,{format:'bibtex'});assert.match(bib.text,/@misc\{/);assert(!bib.text.includes('phdthesis'));assert.match(bib.text,/\{Anderson and Sons\}, \{Jr\.\}, \{Ana\}/);assert(bib.diagnostics.some(d=>d.code==='export-type-fallback'));
 for(const format of ['csl-json','bibtex','ris'])assert(exportBibliography(data,{format}).text.includes('https://example.org/reading'));
});
test('formatted titles survive default and media rendering and retain full linked-title offsets',()=>{
 for(const type of ['book','artwork','article-journal']){const r=fromCSLJSON({type:type==='artwork'?'book':type,title:'Study <i>Species</i>',author:[{family:'Author'}],issued:{'date-parts':[[2020]]}},{recordId:'rich'}).record;r.type=type;
 for(const citationStyle of ['default','chicago-author-date','apa','mla','harvard','vancouver']){const out=compileCitations('{cite rich}',cache(r),{citationStyle});assert.match(out.html,/data-ci-title-length="13"/);assert(out.html.includes('Species'));assert(!out.html.includes('&lt;i&gt;'));}
 }
});
