import test from 'node:test';import assert from 'node:assert/strict';
import {scanCitationMarkers} from '../src/compiler.mjs';
import {parseInTextCitations,matchCitations} from '../src/import-matcher.mjs';
import {extractImportText,detectExtractedCitations} from '../src/import-extraction.mjs';
import {createImportReview,planImportEdits,applyImportEdits} from '../src/import-review.mjs';
const refs=[{id:'avery',title:'Synthetic',state:'resolved',type:'book',authors:[{family:'Avery'}],issued:[2021]}];
const reviewFor=source=>createImportReview(source,matchCitations(parseInTextCitations(source),refs));
test('accepted text edits preserve prefixes, locators and unrelated source exactly',()=>{
 const source='😀 Before (see also Avery, 2021, p. 4).\r\n\r\nReferences\r\nKeep this bibliography.';
 const review=reviewFor(source);const plan=planImportEdits(source,review,{reviewId:review.reviewId,decisions:[{citationIndex:0,action:'accept',recordIds:['avery']}]});
 assert.equal(plan.edits.length,1);const result=applyImportEdits(source,plan);
 assert.equal(result.source,'😀 Before {citation local:avery | prefix:"see also" | locator:"p. 4"}.\r\n\r\nReferences\r\nKeep this bibliography.');
 assert.equal(result.changed,true);
});
test('pending, deferred and rejected groups produce no edits or record mutation',()=>{
 const source='(Avery, 2021) and (Avery, 2021).';const review=reviewFor(source);const before=JSON.stringify(review);
 const plan=planImportEdits(source,review,{reviewId:review.reviewId,decisions:[{citationIndex:0,action:'reject'}]});
 assert.equal(applyImportEdits(source,plan).source,source);assert.deepEqual(plan.outcomes.map(o=>o.state),['reject','pending']);assert.equal(JSON.stringify(review),before);
});
test('source revisions, changed proposals/plans and invalid decisions fail closed',()=>{
 const source='(Avery, 2021)';const review=reviewFor(source);const options={reviewId:review.reviewId,decisions:[{citationIndex:0,action:'accept',recordIds:['avery']}]};
 assert.throws(()=>planImportEdits(source+' ',review,options),/revision/);
 assert.throws(()=>planImportEdits(source,review,{...options,reviewId:'wrong'}),/snapshot/);
 assert.throws(()=>planImportEdits(source,review,{...options,decisions:[{citationIndex:0,action:'accept',recordIds:['invented']}]}),/supplied candidate/);
 const plan=planImportEdits(source,review,options);plan.edits[0].text='unsafe';assert.throws(()=>applyImportEdits(source,plan),/changed/);
 review.matches[0].citation.raw='changed';assert.throws(()=>planImportEdits(source,review,options),/snapshot/);
});
test('accepting rich text retains decisions but requires an adapter instead of erasing formatting',()=>{
 const source='<p>(<i>Avery</i>, 2021)</p>';
 const review=createImportReview(source,matchCitations(detectExtractedCitations(extractImportText(source,{format:'html'})),refs));
 const plan=planImportEdits(source,review,{reviewId:review.reviewId,decisions:[{citationIndex:0,action:'accept',recordIds:['avery']}]});
 assert.equal(plan.edits.length,0);assert.equal(plan.outcomes[0].state,'accepted-needs-adapter');assert.equal(applyImportEdits(source,plan).source,source);
});
test('numeric groups require all item decisions and use configured notation',()=>{
 const source='Before [1–2].';const records=[{...refs[0],referenceNumber:1},{...refs[0],id:'second',referenceNumber:2}];
 const review=createImportReview(source,matchCitations(parseInTextCitations(source,'vancouver'),records));
 const plan=planImportEdits(source,review,{reviewId:review.reviewId,citationKeyword:'ref',decisions:[{citationIndex:0,action:'accept',recordIds:['avery','second']}]});
 assert.equal(applyImportEdits(source,plan).source,'Before {ref local:avery; local:second}.');
 assert.throws(()=>planImportEdits(source,review,{reviewId:review.reviewId,decisions:[{citationIndex:0,action:'accept',recordIds:['avery']}]}),/every item/);
});

test('accepting a narrative identity cannot silently accept a different author boundary',()=>{
 const source='Avery, Bennett, and Chan (2021) argue.';
 const records=[{...refs[0],id:'three',authors:[{family:'Avery'},{family:'Bennett'},{family:'Chan'}]}];
 const review=createImportReview(source,matchCitations(parseInTextCitations(source),records));
 const plan=planImportEdits(source,review,{reviewId:review.reviewId,decisions:[{citationIndex:0,action:'accept',recordIds:['three']}]});
 assert.equal(plan.edits.length,0);assert.equal(plan.outcomes[0].state,'accepted-needs-span');assert.equal(applyImportEdits(source,plan).source,source);
});

test('linked labels require conversion adapters so notation is not stranded inside existing links',()=>{
 for(const [source,format] of [['<p><a href="/legacy">(Avery, 2021)</a></p>','html'],['[(Avery, 2021)](/legacy)','markdown']]) {
  const review=createImportReview(source,matchCitations(detectExtractedCitations(extractImportText(source,{format})),refs));
  const plan=planImportEdits(source,review,{reviewId:review.reviewId,decisions:[{citationIndex:0,action:'accept',recordIds:['avery']}]});
  assert.equal(plan.edits.length,0);assert.equal(plan.outcomes[0].state,'accepted-needs-adapter');assert.equal(applyImportEdits(source,plan).source,source);
 }
});

test('reserved local record names emit citation items instead of annotation commands',()=>{
 for(const id of ['endnote','evidence','credit','list','nocite']) {
  const source='(Avery, 2021)';const review=createImportReview(source,matchCitations(parseInTextCitations(source),[{...refs[0],id}]));
  const plan=planImportEdits(source,review,{reviewId:review.reviewId,decisions:[{citationIndex:0,action:'accept',recordIds:[id]}]});
  const token=scanCitationMarkers(applyImportEdits(source,plan).source)[0].token;
  assert.equal(token.type,'citation');assert.equal(token.items[0].identifier.value,id);
 }
});
