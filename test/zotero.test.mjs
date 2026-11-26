import test from 'node:test';
import assert from 'node:assert/strict';
import {fromCSLJSON,fromZotero,reconcileZoteroItem} from '../src/zotero.mjs';
import {makeCache,normalizeRecord,toCSL} from '../src/records.mjs';
import {compileCitations,bibliographyText} from '../src/compiler.mjs';
const article={type:'article-journal',title:'Sampling and evidence',author:[{family:'Rivera',given:'Ana'}],issued:{'date-parts':[[2020]]},'container-title':'Research Methods',volume:12,issue:'2',page:'14–19',DOI:'10.1234/evidence'};
const envelope=csl=>({key:'ABCD2345',version:3,library:{type:'user',id:42},csljson:JSON.stringify([csl])});
test('CSL projection preserves bibliographic roles and strips private manager payload',()=>{
 const input={...article,id:'https://www.zotero.org/users/42/items/ABCD2345',note:'private-note-canary',keyword:'private-topic-canary',abstract:'private-abstract-canary'};
 const z=fromZotero({...envelope(input),data:{key:'ABCD2345',version:3,note:'private-auth-canary'}},{recordId:'selected-article'}),before=JSON.stringify(input);
 assert.equal(z.requiresReview,false);assert.equal(z.record.volume,'12');assert.equal(z.source.libraryId,'42');assert.equal(z.record.id,'selected-article');
 const cache=makeCache([z.record]),r=compileCitations('{cite selected-article locator:14}',cache,{citationStyle:'chicago-author-date'});
 assert.match(r.html,/Rivera/);for(const privateText of ['ABCD2345','private-note-canary','private-topic-canary','private-abstract-canary','private-auth-canary','/users/42'])assert(!JSON.stringify(r).includes(privateText));assert.equal(JSON.stringify(input),before);
 assert.throws(()=>makeCache([z]),/ID/);
});
test('edited books cite editors without inventing authors; chapters retain container editors',()=>{
 const book=fromCSLJSON({type:'book',title:'Collected methods',editor:[{family:'Smith',given:'Jane'}],issued:{'date-parts':[[2022]]},edition:'2',publisher:'Example Press'},{recordId:'edited-book'}).record;
 assert.deepEqual(book.authors,[]);assert.equal(book.editors[0].family,'Smith');assert.equal(toCSL(normalizeRecord(book)).editor[0].family,'Smith');
 const chicago=bibliographyText(book,'','chicago-author-date');assert.match(chicago,/Smith, Jane, ed\. 2022/);assert.match(chicago,/2nd ed\./);
 const apa=bibliographyText(book,'','apa');assert.match(apa,/Smith, J\. \(Ed\.\)\. \(2022\)/);
 assert.match(compileCitations('{cite edited-book}',makeCache([book]),{citationStyle:'chicago-author-date'}).html,/Smith/);
 const chapter=fromCSLJSON({...article,type:'chapter',title:'A chapter','container-title':'Collected methods',editor:[{family:'Smith',given:'Jane'}],publisher:'Example Press',page:'21–34'},{recordId:'chapter'}).record;
 assert.match(bibliographyText(chapter,'','chicago-author-date'),/edited by Jane Smith/);assert.match(bibliographyText(chapter,'','apa'),/In J\. Smith \(Ed\.\), Collected methods \(pp\. 21–34\)\. Example Press/);
});
test('translations, original dates, corporate creators and missing identifiers remain explicit',()=>{
 const book=fromCSLJSON({type:'book',title:'Translated work',author:[{literal:'Research Council'}],translator:[{family:'Jones',given:'Alex'}],issued:{'date-parts':[[2020]]},'original-date':{'date-parts':[[1912]]},publisher:'Example Press'},{recordId:'translation'});
 assert.equal(book.requiresReview,false);assert.deepEqual(book.record.identifiers,[]);assert.equal(toCSL(book.record).translator[0].family,'Jones');assert.deepEqual(book.record.originalIssued,[1912]);
 assert.match(bibliographyText(book.record,'','chicago-author-date'),/Translated by Alex Jones/);assert.match(bibliographyText(book.record,'','apa'),/A\. Jones, Trans\./);
});
test('losses are reviewable before insertion rather than silently presented as faithful conversion',()=>{
 for(const csl of [{...article,title:'Study of <span>Species</span>'},{...article,author:[{family:'Gogh','non-dropping-particle':'van'}]},{...article,issued:{'date-parts':[[1990],[1992]]}},{...article,type:'unexpected-type'}]){
 const result=fromCSLJSON(csl,{recordId:'review'});assert.equal(result.requiresReview,true);assert.equal(result.record.state,'partial');assert(result.diagnostics.length);
 }
 const safe=fromCSLJSON({...article,title:'Study <script>evil()</script> &amp; evidence'},{recordId:'safe'});assert(!safe.record.title.includes('evil'));assert.match(safe.record.title,/&/);
 const literal=fromCSLJSON({...article,issued:{literal:'forthcoming'}},{recordId:'literal'});assert.equal(literal.record.issued,null);assert.equal(literal.record.displayDate,'forthcoming');
});
test('Zotero identities and version partitions are validated without cross-instance assumptions',()=>{
 const item=envelope(article);assert.throws(()=>fromZotero(item,{recordId:'x',transport:'local'}),/identity/);
 const old=fromZotero(item,{recordId:'x',transport:'local',connectionId:'session-1'});assert.equal(old.source.versionComparable,false);assert.equal(old.source.versionPartition,'local-session:session-1');
 const local=fromZotero(item,{recordId:'x',transport:'local',serverId:'instance-1'});assert.equal(local.source.versionPartition,'local:instance-1');assert.notEqual(local.source.versionPartition,fromZotero(item,{recordId:'x'}).source.versionPartition);
 assert.throws(()=>fromZotero({...item,data:{key:'OTHER234'}},{recordId:'x'}),/disagree/);assert.throws(()=>fromZotero({...item,version:-1},{recordId:'x'}),/scoped/);assert.throws(()=>fromZotero({...item,library:{type:'user',id:0}},{recordId:'x'}),/scoped/);
});
test('site reconciliation proposes existing identities without overwriting curation',()=>{
 const selected=fromZotero(envelope(article),{recordId:'selected'}),site=makeCache([{...selected.record,id:'site-work',title:'Curated title'}]),before=JSON.stringify(site);
 const result=reconcileZoteroItem(selected,site);assert.equal(result.candidates[0].recordId,'site-work');assert.equal(result.requiresReview,true);assert.equal(JSON.stringify(site),before);
 const fresh=reconcileZoteroItem(selected,makeCache([]));assert.equal(fresh.state,'new');assert.equal(fresh.requiresReview,false);
});
test('malformed, oversized and multi-item input fails before a record is returned',()=>{
 assert.throws(()=>fromCSLJSON([article,article],{recordId:'x'}),/one/);assert.throws(()=>fromCSLJSON(article),/ID/);
 assert.throws(()=>fromCSLJSON({...article,title:'x'.repeat(1000)},{recordId:'x',limits:{recordCharacters:100}}),/limit/);
 const bad=fromCSLJSON({...article,DOI:'not a DOI',ISBN:'bad ISBN',URL:'javascript:alert(1)'},{recordId:'x'});assert.deepEqual(bad.record.identifiers,[]);assert(bad.diagnostics.length>=3);
});

test('uncertainty, source schema errors and software versions cannot disappear silently',()=>{
 const circa=fromCSLJSON({...article,issued:{'date-parts':[[2020]],circa:true}},{recordId:'circa'});assert.equal(circa.requiresReview,true);assert.equal(circa.record.issued,null);assert.equal(circa.record.displayDate,'circa 2020');
 const numeric=fromCSLJSON({...article,DOI:123},{recordId:'numeric'});assert(numeric.requiresReview);assert(numeric.diagnostics.some(item=>item.field==='DOI'));
 const software=fromCSLJSON({...article,type:'software',version:'2.0'},{recordId:'software'});assert.equal(software.record.releaseVersion,'2.0');assert.equal(toCSL(software.record).version,'2.0');assert.match(bibliographyText(software.record,'','chicago-author-date'),/Version 2\.0/);
 assert(fromCSLJSON({...article,type:'__proto__'},{recordId:'bad-type'}).requiresReview);
});
test('ID collisions are explicit and role formatting covers authorless and translated chapters',()=>{
 const selected=fromZotero(envelope(article),{recordId:'collision'}),cache=makeCache([{id:'collision',type:'book',title:'Unrelated',authors:[{family:'Else'}],issued:[1999],state:'resolved'}]);
 const collision=reconcileZoteroItem(selected,cache);assert.equal(collision.state,'id-collision');assert(collision.requiresReview);
 const chapter=fromCSLJSON({type:'chapter',title:'Anonymous chapter',editor:[{family:'One',given:'A'},{family:'Two',given:'B'},{family:'Three',given:'C'}],translator:[{family:'Jones',given:'Alex'}],issued:{'date-parts':[[2020]]},'container-title':'Edited collection'},{recordId:'anonymous'}).record;
 const apa=bibliographyText(chapter,'','apa');assert.match(apa,/Anonymous chapter\. \(2020\)/);assert.match(apa,/A\. Jones, Trans\./);assert.match(apa,/A\. One, B\. Two, & C\. Three/);
 const unsupported=compileCitations('{cite anonymous}',makeCache([chapter]),{citationStyle:'harvard'});assert(unsupported.diagnostics.some(x=>x.code==='citation-creator-role-style-review-required'));
});

test('authored books retain editor and translator credits in APA',()=>{
 const result=fromCSLJSON({...article,type:'book','container-title':undefined,editor:[{given:'Eve',family:'Editor'}],translator:[{given:'A',family:'One'},{given:'B',family:'Two'},{given:'C',family:'Three'}]},{recordId:'roles'});
 assert.equal(result.requiresReview,false);const text=bibliographyText(result.record,'','apa');assert.match(text,/E\. Editor, Ed\./);assert.match(text,/A\. One, B\. Two, & C\. Three, Trans\./);
});

test('Zotero CSL date-part strings normalize without guessing free-form dates',()=>{
 const r=fromCSLJSON({...article,issued:{'date-parts':[['2020','02','29']]}},{recordId:'date'});assert.equal(r.requiresReview,false);assert.deepEqual(r.record.issued,[2020,2,29]);
 for(const value of ['2020abc','2e3','2020.1']){const bad=fromCSLJSON({...article,issued:{'date-parts':[[value]]}},{recordId:'bad-date'});assert(bad.requiresReview);assert.equal(bad.record.issued,null);}
});
