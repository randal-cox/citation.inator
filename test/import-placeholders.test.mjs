import assert from 'node:assert/strict';
import test from 'node:test';
import {processImportRequest} from '../src/import-api.mjs';
import {compileCitations,markerKind} from '../src/compiler.mjs';
import {createImportReview,planImportEdits,applyImportEdits} from '../src/import-review.mjs';
import {annotateMarkers,collectMarkerTags,describeCitation} from '../src/tools.mjs';
import {makeCache} from '../src/records.mjs';
const doc=body=>({mode:'document',style:'apa',source:body+'\n\nReferences\nBell, C. (1992). Ritual theory, ritual practice. Oxford University Press.'});
function run(input,decisions,extra={}){const a=processImportRequest(input);return processImportRequest({...input,...extra,action:'preview',review:a.review,reviewId:a.review.reviewId,decisions:typeof decisions==='function'?decisions(a):decisions});}
const placeholder={citationIndex:0,action:'placeholder'};
test('an unmatched citation becomes a flagged portable placeholder with original wording',()=>{
 const input=doc('Missing (see Rivera, 2020a, p. 4).'),r=run(input,[placeholder]);
 const record=r.cache.records.find(record=>record.state==='unresolved');assert.ok(r.newRecordIds.includes(record.id));assert.equal(record.state,'unresolved');assert.equal(record.title,'');assert.deepEqual(record.authors,[]);assert.equal(record.issued,null);assert.equal(record.unresolvedText,'');assert.match(r.source,/cue:"Rivera, 2020a"/);assert.match(r.source,/comment:"Original: \(see Rivera, 2020a, p\. 4\) No matching bibliography entry\."/);assert.doesNotMatch(r.source,/unresolved:/);
 assert.equal(markerKind(r.edits[0].text),'citation');assert.match(r.html,/data-ci-state="unresolved-placeholder"/);assert.match(r.html,/>see Rivera, 2020a, p\. 4<\/a>/);assert.equal(r.diagnostics[0].code,'citation-unresolved-placeholder');assert.ok(r.outcomes[0].placeholderRecordIds.includes(record.id));assert.equal(r.outcomes[0].code,'import-unresolved-placeholder');
});
test('fallback survives missing or partial metadata and normal formatting resumes on completion',()=>{
 const r=run(doc('Missing (Rivera, 2020).'),[placeholder]);const marker=r.edits[0].text,id=r.outcomes[0].placeholderRecordIds[0];
 for(const cache of [makeCache([]),makeCache([{id,title:'Still being checked',state:'partial'}])]){
 assert.equal(describeCitation(marker,cache).text,'Rivera, 2020');assert.equal(describeCitation(marker,cache).diagnostics[0].code,'citation-unresolved-placeholder');
 }
 const completed=makeCache([{id,title:'Located work',authors:[{family:'Rivera'}],issued:[2020],state:'resolved'}]);const rendered=compileCitations(marker,completed);assert.deepEqual(rendered.diagnostics,[]);assert.doesNotMatch(rendered.html,/unresolved-placeholder/);assert.equal(describeCitation(marker,completed).text,'Rivera, 2020');
});
test('all source tools flag placeholders without changing or fabricating notes or tags',()=>{
 const r=run(doc('Missing (Rivera, 2020).'),[placeholder]),source=r.edits[0].text;
 assert.equal(describeCitation(source,r.cache).text,'Rivera, 2020');const notes=annotateMarkers(source,r.cache);assert.equal(notes.source,source);assert.equal(notes.diagnostics[0].code,'citation-unresolved-placeholder');
 const tags=collectMarkerTags([{source}],r.cache,{includeDiagnostics:true});assert.deepEqual(tags.counts,{});assert.equal(tags.diagnostics[0].code,'citation-unresolved-placeholder');
});
test('mixed groups retain every work and use parser-owned text for the missing item',()=>{
 const r=run(doc('Both (see Rivera, 2020a, p. 4; Bell, 1992).'),a=>[{citationIndex:0,action:'accept',targets:[{placeholder:true},{recordId:a.review.matches[0].items[1].candidates[0].recordId}]}]);
 assert.equal(r.edits.length,1);assert.equal(r.cache.records.filter(r=>r.state==='unresolved').length,1);assert.match(r.edits[0].text,/cue:"Rivera, 2020a"/);assert.match(r.html,/>see Rivera, 2020a, p. 4<\/a>/);assert.doesNotMatch(r.html,/see see/);assert.equal(r.diagnostics.filter(d=>d.code==='citation-unresolved-placeholder').length,1);
 const all=run(doc('Both (Rivera, 2020; Bell, 1992).'),[placeholder]);assert.equal(all.outcomes[0].placeholderRecordIds.length,2);assert.equal(all.diagnostics.filter(d=>d.code==='citation-unresolved-placeholder').length,2);
});
test('narrative text is preserved without extra brackets or duplicated author',()=>{
 const r=run(doc('Rivera (2020) wrote this.'),[placeholder]);assert.equal(r.edits.length,1);assert.equal(describeCitation(r.edits[0].text,r.cache).text,'Rivera (2020)');assert.match(r.html,/>Rivera \(2020\)<\/a>/);
});
test('complex expanded groups remain unchanged and create no orphan placeholder records',()=>{
 for(const input of [doc('Missing (Rivera, 2020, 2021).'),{source:'Missing [3–5].',style:'vancouver',records:[]}]){
 const r=run(input,[placeholder]);assert.equal(r.changed,false);assert.equal(r.source,input.source);assert.equal(r.outcomes[0].state,'accepted-needs-span');assert.equal(r.outcomes[0].code,'import-placeholder-span-review-required');assert.equal(r.cache.records.some(r=>r.state==='unresolved'),false);
 }
});
test('repeated wording produces separate identities, while host allocation and collisions are respected',()=>{
 const input=doc('Missing (Rivera, 2020). Again (Rivera, 2020).'),a=processImportRequest(input);const decisions=a.review.matches.map((_,citationIndex)=>({citationIndex,action:'placeholder'}));const r=run(input,decisions);const ids=r.cache.records.filter(r=>r.state==='unresolved').map(r=>r.id);assert.equal(new Set(ids).size,2);
 const one=doc('Missing (Rivera, 2020).'),first=run(one,[placeholder]),id=first.outcomes[0].placeholderRecordIds[0];const siteCache=makeCache([{id,title:'Another record',state:'resolved'}]);const aa=processImportRequest({...one,siteCache});const collision=processImportRequest({...one,siteCache,action:'preview',review:aa.review,reviewId:aa.review.reviewId,decisions:[placeholder]});assert.ok(collision.outcomes[0].placeholderRecordIds[0].startsWith(id+'-'));assert.equal(siteCache.records.length,1);
 const allocated=run(one,[placeholder],{recordId:record=>'host-'+record.id});const allocatedId=allocated.outcomes[0].placeholderRecordIds[0];assert.match(allocatedId,/^host-/);assert.ok(allocated.newRecordIds.includes(allocatedId));assert.ok(allocated.source.includes(allocatedId));
});
test('stale source/site and unsafe source fragments fail closed',()=>{
 const input=doc('Missing (Rivera, 2020).'),a=processImportRequest(input);
 assert.throws(()=>processImportRequest({...input,source:input.source+'!',action:'preview',review:a.review,reviewId:a.review.reviewId,decisions:[placeholder]}),/changed/);
 assert.throws(()=>processImportRequest({...input,siteCache:makeCache([]),action:'preview',review:a.review,reviewId:a.review.reviewId,decisions:[placeholder]}),/changed/);
 const matches=structuredClone(a.review.matches);matches[0].citation.sourceFragments[0].exact=false;const review=createImportReview(input.source,{schema:'citation-inator.import-matches.v1',matches});const plan=planImportEdits(input.source,review,{reviewId:review.reviewId,decisions:[placeholder]});assert.equal(plan.edits.length,0);assert.equal(plan.placeholderRecords.length,0);assert.equal(applyImportEdits(input.source,plan).changed,false);
});
test('placeholder fallback is escaped text, never executable HTML',()=>{
 const source='{cite local:pending unresolved:"(<img src=x onerror=alert(1)>)"}';const r=compileCitations(source,makeCache([]));assert.match(r.html,/&lt;img/);assert.doesNotMatch(r.html,/<img src=x/);
});

test('configured keywords survive import, site reuse, host allocation, marker classification and compilation',()=>{
 for(const citationKeyword of ['cite','citation','reference']){
 const input={...doc('A note with no entry (Rivera, 2020). Mixed (Bell, 1992; Rivera, 2020).'),citationKeyword,siteCache:makeCache([{id:'bell-1992-ritual',title:'Ritual theory, ritual practice',authors:[{family:'Bell',given:'C.'}],issued:[1992],state:'resolved'}])};
 const a=processImportRequest(input),sourceId=a.review.matches[1].items[0].candidates[0].recordId;
 const r=processImportRequest({...input,action:'preview',review:a.review,reviewId:a.review.reviewId,recordId:record=>'x-'+record.id,recordDecisions:[{recordId:sourceId,siteRecordId:'bell-1992-ritual'}],decisions:[placeholder,{citationIndex:1,action:'accept',targets:[{recordId:sourceId},{placeholder:true}]}]});
 const options={citationKeyword,citationStyle:'apa'};assert.equal(r.edits.length,2);assert.ok(r.source.includes('bell-1992-ritual'));
 for(const edit of r.edits)for(const marker of [edit.text,edit.text.replace(/ \| /g,' ')]){
 assert.equal(markerKind(marker,options),'citation');const compiled=compileCitations(marker,r.cache,options);assert.ok(compiled.diagnostics.some(d=>d.code==='citation-unresolved-placeholder'));assert.doesNotMatch(compiled.html,new RegExp('\\{'+citationKeyword+' '));
 }
 assert.equal(compileCitations(r.source,r.cache,options).diagnostics.filter(d=>d.code==='citation-unresolved-placeholder').length,2);
 }
});


test('explicit placeholders retain matched reference text as unverified evidence without identity',()=>{
 const input={...doc('Masks recur (Okafor, 2019), and (Bell, 1992).'),style:'auto'};
 const a=processImportRequest(input),before=JSON.stringify(a);
 const r=processImportRequest({...input,action:'preview',review:a.review,reviewId:a.review.reviewId,decisions:a.review.matches.map((_,citationIndex)=>({citationIndex,action:'placeholder'}))});
 assert.equal(JSON.stringify(a),before);assert.equal(r.edits.length,2);
 const pending=r.outcomes.flatMap(outcome=>outcome.placeholderRecordIds).map(id=>r.cache.records.find(record=>record.id===id));
 for(const record of pending){assert.equal(record.state,'unresolved');assert.equal(record.title,'');assert.deepEqual(record.authors,[]);assert.deepEqual(record.identifiers,[]);assert.equal(record.issued,null);}
 const bell=pending.find(record=>record.original.startsWith('Bell, C.'));
 assert.equal(bell.original,'Bell, C. (1992). Ritual theory, ritual practice. Oxford University Press.');
 assert(bell.provenance.some(item=>item.note.includes('Unverified candidate reference')&&item.note.includes(bell.original)));
 assert.equal(compileCitations(r.source,r.cache).diagnostics.filter(d=>d.code==='citation-unresolved-placeholder').length,2);
 const ordinary=run(input,x=>[{citationIndex:1,action:'accept',recordIds:[x.review.matches[1].items[0].candidates[0].recordId]}]);
 assert.equal(ordinary.outcomes[0].placeholderRecordIds,undefined);assert(!ordinary.cache.records.some(record=>record.state==='unresolved'));
});

test('ambiguous placeholder preserves every candidate as unverified without choosing one',()=>{
 const input={mode:'document',style:'apa',source:'Both books (Bell, 1992).\n\nReferences\nBell, C. (1992). First book. Oxford University Press.\n\nBell, C. (1992). Second book. Oxford University Press.'};
 const a=processImportRequest(input);assert.equal(a.review.matches[0].items[0].state,'ambiguous');
 const r=run(input,[{citationIndex:0,action:'accept',targets:[{placeholder:true}]}],{recordId:record=>'host-'+record.id});
 const record=r.cache.records.find(record=>record.id===r.outcomes[0].placeholderRecordIds[0]);
 assert.equal(record.original,'Bell, 1992');assert.equal(record.state,'unresolved');
 const notes=record.provenance.filter(item=>item.note.startsWith('Unverified candidate reference'));assert.equal(notes.length,2);assert(notes.some(item=>item.note.includes('First book')));assert(notes.some(item=>item.note.includes('Second book')));assert.deepEqual(record.identifiers,[]);assert.equal(record.title,'');
});
