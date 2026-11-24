import assert from 'node:assert/strict';
import {processImportRequest,formatRecordId} from '../src/import-api.mjs';
export async function checkImportAPI(browser,origin){
 const context=await browser.newContext(),page=await context.newPage(),requests=[];page.on('request',request=>requests.push(request.url()));
 const source='😀 A claim (Rivera, 2020, p. 4).\r\n\r\n## References\r\n\r\nRivera, R. (2020). A paper. Journal, 1(1), 4–8.\r\n',base={mode:'document',source,style:'auto'},analysis=processImportRequest(base);
 const decisions=[{citationIndex:0,action:'accept',targets:[{recordId:analysis.referenceRecords[0].id}]}],previewRequest={...base,action:'preview',review:analysis.review,reviewId:analysis.review.reviewId,decisions},preview=processImportRequest(previewRequest);
 try{
  await page.route(origin+'/import-api-test.html',route=>route.fulfill({contentType:'text/html',body:'<!doctype html><title>Import API test</title>'}));
  await page.goto(origin+'/import-api-test.html');
  const result=await page.evaluate(async ({origin,base,previewRequest})=>{
   const {processImportRequest}=await import(origin+'/dist/citation-import.mjs');const analysis=processImportRequest(base),preview=processImportRequest(previewRequest);let staleRejected=false,changedContextRejected=false;
   try{processImportRequest({...previewRequest,source:base.source+' '});}catch{staleRejected=true;}
   try{processImportRequest({...previewRequest,limits:{references:4}});}catch{changedContextRejected=true;}
   return {analysisJSON:JSON.stringify(analysis),previewJSON:JSON.stringify(preview),staleRejected,changedContextRejected};
  },{origin,base,previewRequest});
  const numberedBase={mode:'document',style:'vancouver',source:'Two claims [1, 2].\n\nReferences\n1. Rivera R, Chen SM, et al. Trial outcomes. Test Journal. 2020;12(3):101–9. https://doi.org/10.1371/journal.\npone.0224511\n2. Smith A. Another study. Test Journal. 2021;4:22–30.'};
  const numberedAnalysis=processImportRequest(numberedBase),numberedRequest={...numberedBase,action:'preview',review:numberedAnalysis.review,reviewId:numberedAnalysis.review.reviewId,decisions:[{citationIndex:0,action:'accept',targets:numberedAnalysis.review.matches[0].items.map(i=>({recordId:i.candidates[0].recordId}))}]};
  const numberedResult=await page.evaluate(async ({origin,base,request})=>{const {processImportRequest}=await import(origin+'/dist/citation-import.mjs');return {analysis:processImportRequest(base),preview:processImportRequest(request)};},{origin,base:numberedBase,request:numberedRequest});
  assert.deepEqual(numberedResult.analysis,numberedAnalysis);assert.deepEqual(numberedResult.preview,processImportRequest(numberedRequest));
  assert.equal(numberedResult.analysis.referenceRecords[0].title,'Trial outcomes');assert.equal(numberedResult.analysis.referenceRecords[0].authorsComplete,false);assert.equal(numberedResult.analysis.referenceRecords[0].identifierProposals[0].value,'10.1371/journal.pone.0224511');
  const helperResults=await page.evaluate(async origin=>{
   const imports=await import(origin+'/dist/citation-import.mjs'),tools=await import(origin+'/dist/citation-tools.mjs');
   return ['bell-1992-ritual','list-2001','list','endnote','nocite','evidence','credit'].map(id=>['minimal','explicit'].map(identifierForm=>{
    const options={citationKeyword:'ref',identifierForm};return [imports.formatRecordId(id,options),tools.formatRecordId(id,options)];
   }));
  },origin);
  assert.deepEqual(helperResults,['bell-1992-ritual','list-2001','list','endnote','nocite','evidence','credit'].map(id=>['minimal','explicit'].map(identifierForm=>{
   const result=formatRecordId(id,{citationKeyword:'ref',identifierForm});return [result,result];
  })));
  const siteBase={...base,siteCache:{schema:'citation-inator.cache.v1',records:[{...analysis.referenceRecords[0],id:'site-rivera'}]}},siteAnalysis=processImportRequest(siteBase),siteRequest={...siteBase,action:'preview',review:siteAnalysis.review,reviewId:siteAnalysis.review.reviewId,decisions,recordDecisions:[{recordId:analysis.referenceRecords[0].id,siteRecordId:'site-rivera'}]};
  const siteResult=await page.evaluate(async ({origin,siteBase,siteRequest})=>{const {processImportRequest}=await import(origin+'/dist/citation-import.mjs');return {analysis:processImportRequest(siteBase),preview:processImportRequest(siteRequest)};},{origin,siteBase,siteRequest});
  assert.deepEqual(siteResult.analysis,siteAnalysis);assert.deepEqual(siteResult.preview,processImportRequest(siteRequest));assert.match(siteResult.preview.source,/site-rivera/);
  assert.equal(result.analysisJSON,JSON.stringify(analysis));assert.equal(result.previewJSON,JSON.stringify(preview));assert.equal(result.staleRejected,true);assert.equal(result.changedContextRejected,true);assert.ok(requests.every(url=>url.startsWith(origin+'/')));
 }finally{await context.close();}
 console.log('Public import browser bundle matches Node analysis/preview, rejects stale revisions/context and performs no provider requests by default.');
}
