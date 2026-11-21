import test from 'node:test';import assert from 'node:assert/strict';
import {reviewReadiness} from '../demos/import/review-progress.mjs';import {citedWorkLabel} from '../demos/import/review-labels.mjs';
const ready={selected:true,bibliographyMatched:true,metadata:{accepted:{}}},group=(index,items,extra={})=>({index,items,...extra});
test('readiness counts complete highlighted citation groups, retaining skips in denominator',()=>{
 const result=reviewReadiness([group(0,[ready,ready]),group(1,[ready,{selected:false}]),group(2,[ready],{skipped:true}),group(3,[ready],{sourceReview:true})]);assert.equal(result.ready,1);assert.equal(result.total,4);assert.equal(result.readyPercent,25);assert.equal(result.skipped,1);assert.deepEqual(result.readyGroups,[0]);
});
test('repeated groups count separately and known-ID optional lookup may overlap readiness',()=>{
 const item={selected:true,known:true,metadata:{pending:true}};assert.deepEqual(reviewReadiness([group(0,[item]),group(1,[item])]),{total:2,ready:2,readyPercent:100,matched:0,skipped:0,readyGroups:[0,1]});
});
test('identity conflicts and missing identifiers are not ready; explicit identifier-free completion is',()=>{
 assert.equal(reviewReadiness([group(0,[{selected:true,known:true,metadata:{proposed:{},identityIssues:['title']}}]),group(1,[{selected:true,metadata:{kept:true}}]),group(2,[{selected:true,metadata:{state:'choices'}}])]).ready,1);
});
test('each work label identifies source author/year or document-local number',()=>{
 assert.equal(citedWorkLabel({authors:['Charmaz'],year:2012}),'Charmaz, 2012');assert.equal(citedWorkLabel({authors:['Guest'],etAl:true,year:2006}),'Guest et al., 2006');assert.equal(citedWorkLabel({referenceNumber:7}),'Reference 7');
});

test('format or bibliography review gates block ready-to-convert success without hiding matches',()=>{
 const result=reviewReadiness([group(0,[ready]),group(1,[ready])],{blocked:true});assert.equal(result.ready,0);assert.equal(result.readyPercent,0);assert.equal(result.matched,2);
});
