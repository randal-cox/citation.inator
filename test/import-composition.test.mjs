import test from 'node:test';
import assert from 'node:assert/strict';
import {processImportRequest,parseInTextCitations,analyzeImportDocument,normalizeOpaqueRanges,classifyReview as rawClassifyReview} from '../src/import-api.mjs';
import {makeCache} from '../src/records.mjs';
import {importHash} from '../src/import-hash.mjs';
const classifyReview=(result,options={})=>rawClassifyReview(result,{reviewId:result.review.reviewId,...options});
const bell={id:'bell',title:'Ritual theory, ritual practice',authors:[{family:'Bell',given:'C.'}],issued:[1992],state:'resolved',identifiers:[{scheme:'doi',value:'10.5555/bell'}]};
const math='$x + \\text{(Bell, 1992)} + {cite phantom}$';
const source='😀 Randal<sup>1</sup> and Brad<sup>1</sup>.\r\n\r\nBefore (Bell, 1992).\r\n\r\n'+math+'\r\n\r\nFigure caption (Bell, 1992).\r\n\r\nAfter (Bell, 1992).\r\n\r\nReferences\r\nBell, C. (1992). Ritual theory, ritual practice. Oxford University Press.';
const opaque=[{start:source.indexOf(math),end:source.indexOf(math)+math.length}];
test('composed document import protects equations while retaining adjacent prose, captions and original bytes',()=>{
 const input={source,mode:'document',style:'apa',opaque,revision:'host-7'},a=processImportRequest(input);
 assert.equal(a.review.matches.length,3);assert.equal(a.document.sourceHash,importHash(source));assert.equal(a.revision,'host-7');
 assert.equal(analyzeImportDocument(source,{style:'apa',opaque}).detection.citations.length,3);
 for(const match of a.review.matches)assert(!opaque.some(range=>match.citation.start<range.end&&match.citation.end>range.start));
 const decisions=a.review.matches.map((match,citationIndex)=>({citationIndex,action:'accept',recordIds:[match.items[0].candidates[0].recordId]}));
 const r=processImportRequest({...input,action:'preview',review:a.review,reviewId:a.review.reviewId,decisions});
 assert.equal(r.edits.length,3);assert(r.source.includes(math));assert(r.source.startsWith('😀 Randal<sup>1</sup> and Brad<sup>1</sup>.\r\n'));assert(!r.html.includes('data-ci-bibliography="local:phantom"'));assert(r.html.includes('{cite phantom}'));assert.equal(r.revision,'host-7');
 const withoutMath=source.replace(math,' '.repeat(math.length));assert.equal(parseInTextCitations(source,{opaque}).citations.length,parseInTextCitations(withoutMath).citations.length);
});
test('opaque validation is complete, Unicode-safe and non-mutating; nested protections form a union',()=>{
 const ranges=[{start:8,end:12},{start:2,end:10},{start:3,end:4}],before=JSON.stringify(ranges);assert.deepEqual(normalizeOpaqueRanges('😀abcdefghijklm',ranges),[{start:2,end:12}]);assert.equal(JSON.stringify(ranges),before);
 for(const invalid of [null,{},[{start:-1,end:3}],[{start:0,end:0}],[{start:0,end:Infinity}],[{start:0,end:999}],[{start:1,end:2}],[{start:0.5,end:3}],[opaque[0],{start:0,end:0}]])assert.throws(()=>processImportRequest({source,style:'apa',records:[bell],opaque:invalid}),/opaque|Opaque/);
});
test('partial intersections suppress whole citation groups and opaque bibliography headings do not define structure',()=>{
 const text='Outside (Bell, 1992). Crossed (Bell, 1992).';const start=text.lastIndexOf('Bell');
 assert.equal(parseInTextCitations(text,{opaque:[{start:start+1,end:start+2}]}).citations.length,1);
 const hidden='$$\n# References\n(Bell, 1992)\n$$';const full=hidden+'\n\nA (Bell, 1992).\n\nReferences\nBell, C. (1992). A book. Press.';
 const a=processImportRequest({source:full,style:'apa',mode:'document',opaque:[{start:0,end:hidden.length}]});assert.equal(a.document.boundaryRequired,false);assert.equal(a.review.matches.length,1);assert.equal(a.referenceRecords.length,1);
});
test('opaque or host-revision changes invalidate pending review even when matching stays the same',()=>{
 const input={source:'A (Bell, 1992). Nothing.',records:[bell],style:'apa',revision:7,opaque:[]},a=processImportRequest(input);
 for(const change of [{revision:8},{opaque:[{start:source.length-1,end:source.length}]},{opaque:[{start:15,end:16}]}])assert.throws(()=>processImportRequest({...input,...change,action:'preview',review:a.review,reviewId:a.review.reviewId,decisions:[]}),/changed|ranges/);
});
const reviewInput={source:'KNOWN_PRIVATE_CONTEXT (Bell, 1992). Other (Rivera, 2020).',style:'apa',records:[bell],siteCache:makeCache([{...bell,id:'site-bell'}])};
test('classifier uses current choices, reports only IDs/state and never promotes a bibliography match to verified metadata',()=>{
 const a=processImportRequest(reviewInput),before=JSON.stringify(a),initial=classifyReview(a);assert.deepEqual(initial.probable,[0]);assert.deepEqual(initial.attention,[1]);assert.equal(initial.canApply,false);assert.equal(initial.groups[0].evidence[0].identifierVerification,'not-checked');assert.equal(a.review.matches[0].items[0].candidates[0].evidence.identifierVerification,'not-checked');assert(!JSON.stringify(initial).includes('KNOWN_PRIVATE_CONTEXT'));assert.equal(JSON.stringify(a),before);
 const decisions=[{citationIndex:0,action:'accept',recordIds:['bell']},{citationIndex:1,action:'reject'}];
 const selected=classifyReview(a,{decisions});assert.equal(selected.counts.probable.undecided,0);assert.equal(selected.counts.attention.undecided,0);assert.equal(selected.site[0].required,true);assert.equal(selected.site[0].suggestedSiteRecordId,'site-bell');assert(selected.blockers.some(b=>b.code==='import-site-decision-required'));
 const ready=classifyReview(a,{decisions,recordDecisions:[{recordId:'bell',siteRecordId:'site-bell'}]});assert(ready.canApply);
 const changed=classifyReview(a,{decisions:[{citationIndex:0,action:'defer'},{citationIndex:1,action:'reject'}]});assert.equal(changed.site[0].required,false);assert.equal(changed.counts.probable.undecided,1);assert(changed.blockers.some(b=>b.citationIndex===0));
});
test('site policies distinguish suggestions from decisions and only block records used now',()=>{
 const a=processImportRequest(reviewInput),decisions=[{citationIndex:0,action:'accept',targets:[{recordId:'bell'}]},{citationIndex:1,action:'placeholder'}];
 assert(classifyReview(a,{decisions,recordDecisions:[{recordId:'bell',siteRecordId:null}]}).canApply);
 assert(!classifyReview(a,{decisions,recordDecisions:[{recordId:'bell',siteRecordId:null}],policy:{siteWorks:'require'}}).canApply);
 const skipped=classifyReview(a,{decisions:[{citationIndex:0,action:'reject'},{citationIndex:1,action:'reject'}],policy:{siteWorks:'require'}});assert(skipped.canApply);assert.equal(skipped.counts.site.required,0);
 const conflict=structuredClone(a);conflict.siteMatches[0].candidates[0].evidence.assessment.conflicts.push('year');assert.equal(classifyReview(conflict).site[0].suggestedSiteRecordId,null);assert.equal(classifyReview(conflict,{policy:{siteWorks:'prefer'}}).site[0].suggestedSiteRecordId,'site-bell');assert.equal(classifyReview(conflict,{policy:{siteWorks:'prefer'}}).site[0].decided,false);
});
test('classifier rejects stale/duplicate decisions and keeps unsafe spans and format gates blocking',()=>{
 const a=processImportRequest(reviewInput);assert.throws(()=>rawClassifyReview(a,{decisions:[{citationIndex:0,action:'reject'}]}),/snapshot/);assert.throws(()=>classifyReview(a,{reviewId:'stale'}),/snapshot/);for(const options of [{decisions:[{citationIndex:99,action:'accept'}]},{decisions:[{citationIndex:0,action:'reject'},{citationIndex:0,action:'defer'}]},{recordDecisions:[{recordId:'bell',siteRecordId:'other'}]},{policy:{siteWorks:'merge'}}])assert.throws(()=>classifyReview(a,options));
 const unsafe=structuredClone(a);unsafe.review.matches[0].citation.sourceFragments=[{sourceStart:0,sourceEnd:2,exact:false}];const r=classifyReview(unsafe,{decisions:[{citationIndex:0,action:'accept',recordIds:['bell']},{citationIndex:1,action:'reject'}]});assert(r.blockers.some(b=>b.code==='import-source-span-review-required'));
 const gated=classifyReview({...a,formatChoiceRequired:true});assert(gated.blockers.some(b=>b.code==='import-citation-format-required'));
});

test('classifier never declares invalid placeholder targets or unsupported multiline placeholders ready',()=>{
 const a=processImportRequest(reviewInput);const invalid=classifyReview(a,{decisions:[{citationIndex:0,action:'placeholder',targets:[{recordId:'bell'}]},{citationIndex:1,action:'reject'}]});assert(!invalid.canApply);assert.equal(invalid.groups[0].decided,false);
 const input={source:'A (Rivera,\n2020).',style:'apa',records:[]},b=processImportRequest(input),decision={citationIndex:0,action:'placeholder'};const c=classifyReview(b,{decisions:[decision]});assert(!c.canApply);assert(c.blockers.some(blocker=>blocker.code==='import-placeholder-linebreak-review-required'));
 const p=processImportRequest({...input,action:'preview',review:b.review,reviewId:b.review.reviewId,decisions:[decision]});assert.equal(p.changed,false);assert.equal(p.outcomes[0].state,'accepted-needs-adapter');
});

test('partially opaque bibliography entries retain original evidence without synthetic metadata claims',()=>{
 const source='A (Bell, 1992).\n\nReferences\nBell, C. (1992). Ritual theory, ritual practice. Press.',start=source.indexOf('theory');
 const a=processImportRequest({source,style:'apa',mode:'document',opaque:[{start,end:start+6}]});
 assert.equal(a.referenceEntries[0].raw,'Bell, C. (1992). Ritual theory, ritual practice. Press.');assert.deepEqual(a.referenceEntries[0].fields,{});assert.deepEqual(a.referenceEntries[0].evidence,[]);assert.equal(a.referenceEntries[0].state,'unparsed');assert.equal(a.referenceRecords[0].title,'');assert.equal(a.review.matches[0].items[0].state,'unmatched');assert(a.diagnostics.some(d=>d.code==='import-reference-opaque-review-required'));
});

test('incomplete citation notation inside opaque math cannot consume later prose',()=>{
 const text='$ {cite incomplete $ Outside (Bell, 1992).',end=text.indexOf(' Outside');const result=parseInTextCitations(text,{opaque:[{start:0,end}]});assert.equal(result.citations.length,1);assert.equal(result.citations[0].raw,'(Bell, 1992)');
});

test('explicit placeholder IDs classify consistently with preview and reject collisions',()=>{
 const input={source:'A (Rivera, 2020).',records:[],style:'apa'},a=processImportRequest(input),decisions=[{citationIndex:0,action:'accept',targets:[{placeholder:true,recordId:'mine'}]}];assert(classifyReview(a,{decisions}).canApply);const p=processImportRequest({...input,action:'preview',review:a.review,reviewId:a.review.reviewId,decisions});assert(p.changed);assert(p.source.includes('mine'));
 const existing={...input,siteCache:makeCache([{...bell,id:'mine'}])},b=processImportRequest(existing);assert(!classifyReview(b,{decisions}).canApply);assert.throws(()=>processImportRequest({...existing,action:'preview',review:b.review,reviewId:b.review.reviewId,decisions}),/distinct/);
});

test('unprotected bibliography entries retain their original raw-text identity hashes',()=>{
 const a=analyzeImportDocument('A (Bell, 1992).\n\nReferences\n\nBell, C. (1992). A book. Press.\n\n',{style:'apa'});const entry=a.entries[0];assert.equal(entry.id,'ref-'+importHash(entry.raw).slice(0,20));
});
