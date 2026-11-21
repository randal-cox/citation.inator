import test from 'node:test';import assert from 'node:assert/strict';
import {identityNeedsReview,identifierReady,resolvedIdentifierState,acceptIdentityOverride} from '../demos/import/identity-state.mjs';
import {reviewProgress} from '../demos/import/review-progress.mjs';
const candidate={title:'A similar book review',identifiers:[{scheme:'doi',value:'10.5555/review'}]};
test('a resolved review DOI remains proposed until its identity disagreement is explicitly accepted',()=>{
 const state=resolvedIdentifierState(candidate,{conflicts:['authors','type'],differences:['year']});
 assert.equal(state.accepted,null);assert.equal(state.proposed,candidate);assert.equal(identityNeedsReview(state),true);assert.equal(identifierReady(state),false);
 assert.equal(acceptIdentityOverride(state,candidate),true);assert.equal(state.accepted,candidate);assert.equal(identifierReady(state),true);assert.equal(state.identityOverride,true);
});
test('a supplied known DOI does not hide an observed metadata conflict from review counts',()=>{
 const state=resolvedIdentifierState(candidate,{conflicts:['authors'],differences:[]});
 const result=reviewProgress([0,1].map(index=>({index,items:[{key:'book',selected:true,known:true,metadata:state}]})));
 assert.equal(identifierReady(state,true),false);assert.equal(result.lookingUp,0);assert.equal(result.needsReview,1);assert.deepEqual(result.reviewGroups,[0,1]);
});
test('year disagreement requires review without automatic forgiveness and matching candidates remain one-step',()=>{
 const date=resolvedIdentifierState(candidate,{conflicts:[],differences:['year']});assert.equal(identityNeedsReview(date),true);
 const matching=resolvedIdentifierState(candidate,{conflicts:[],differences:[],missing:['publisher']});assert.equal(matching.accepted,candidate);assert.equal(identityNeedsReview(matching),false);
});
test('an override is tied to its exact proposal and cannot approve a replaced choice',()=>{
 const state=resolvedIdentifierState(candidate,{conflicts:['title']});assert.equal(acceptIdentityOverride(state,{...candidate}),false);assert.equal(state.accepted,null);
 const replacement={...candidate,title:'Another work'};Object.assign(state,resolvedIdentifierState(replacement,{conflicts:['authors']}));assert.equal(acceptIdentityOverride(state,candidate),false);assert.equal(state.accepted,null);
});
test('offline metadata failure on a known identifier retains the manual completion path',()=>{
 assert.equal(identifierReady({state:'error'},true),true);assert.equal(identityNeedsReview({state:'error'}),false);
});

test('missing supplied identity evidence needs review, but a pasted identifier has no invented source expectations',()=>{
 const assessment={conflicts:[],differences:[],missing:['title','authors','year','type']};
 const supplied=resolvedIdentifierState(candidate,assessment,{title:'A study',authors:[{family:'Rivera'}],issued:[2020],type:'book'});
 assert.equal(identityNeedsReview(supplied),true);assert.deepEqual(supplied.identityIssues,['missing title','missing authors','missing year','missing type']);
 const manual=resolvedIdentifierState(candidate,assessment,{});assert.equal(identityNeedsReview(manual),false);assert.equal(manual.accepted,candidate);
});
