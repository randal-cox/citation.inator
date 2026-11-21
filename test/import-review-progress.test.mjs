import test from 'node:test';import assert from 'node:assert/strict';
import {reviewProgress} from '../demos/import/review-progress.mjs';
const item=(key,metadata,extra={})=>({key,selected:true,metadata,...extra});
const group=(index,items,extra={})=>({index,items,...extra});
test('queued and running work are counted but never navigation destinations',()=>{
 assert.deepEqual(reviewProgress([group(0,[item('a')]),group(1,[item('b',{pending:true})])]),{lookingUp:2,needsReview:0,reviewGroups:[],lookupGroups:[0,1]});
});
test('returned choices stop counting as lookups and become review destinations',()=>{
 assert.deepEqual(reviewProgress([group(0,[item('a',{state:'choices'})]),group(1,[item('b',{accepted:{}})])]),{lookingUp:0,needsReview:1,reviewGroups:[0],lookupGroups:[]});
});
test('shared identifier decisions count once, separate citation work choices count separately',()=>{
 const result=reviewProgress([group(0,[item('a',{state:'choices'})]),group(1,[item('a',{state:'choices'})]),group(2,[{selected:false}]),group(3,[{selected:false}])]);
 assert.equal(result.needsReview,3);assert.deepEqual(result.reviewGroups,[0,1,2,3]);
});
test('failed optional metadata on a known identifier stays ready without a search decision',()=>{
 assert.deepEqual(reviewProgress([group(0,[item('doi:a',{state:'error'},{known:true})])]),{lookingUp:0,needsReview:0,reviewGroups:[],lookupGroups:[]});
});
test('failed unknown identifiers need a human decision, skipped and completed items do not',()=>{
 assert.deepEqual(reviewProgress([group(0,[item('a',{state:'error'})]),group(1,[item('b',{kept:true})]),group(2,[{selected:false}],{skipped:true})]),{lookingUp:0,needsReview:1,reviewGroups:[0],lookupGroups:[]});
});
test('span review remains visible even after identifier completion',()=>{
 assert.equal(reviewProgress([group(0,[item('a',{accepted:{}})],{sourceReview:true})]).needsReview,1);
});
test('known nonfetchable identifiers do not become permanently queued lookups',()=>{
 assert.deepEqual(reviewProgress([group(0,[item('url:a',undefined,{known:true,lookupEligible:false})])]),{lookingUp:0,needsReview:0,reviewGroups:[],lookupGroups:[]});
});
