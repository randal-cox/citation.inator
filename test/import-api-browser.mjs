import assert from 'node:assert/strict';
import {processImportRequest} from '../src/import-api.mjs';
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
  const siteBase={...base,siteCache:{schema:'citation-inator.cache.v1',records:[{...analysis.referenceRecords[0],id:'site-rivera'}]}},siteAnalysis=processImportRequest(siteBase),siteRequest={...siteBase,action:'preview',review:siteAnalysis.review,reviewId:siteAnalysis.review.reviewId,decisions,recordDecisions:[{recordId:analysis.referenceRecords[0].id,siteRecordId:'site-rivera'}]};
  const siteResult=await page.evaluate(async ({origin,siteBase,siteRequest})=>{const {processImportRequest}=await import(origin+'/dist/citation-import.mjs');return {analysis:processImportRequest(siteBase),preview:processImportRequest(siteRequest)};},{origin,siteBase,siteRequest});
  assert.deepEqual(siteResult.analysis,siteAnalysis);assert.deepEqual(siteResult.preview,processImportRequest(siteRequest));assert.match(siteResult.preview.source,/local:site-rivera/);
  assert.equal(result.analysisJSON,JSON.stringify(analysis));assert.equal(result.previewJSON,JSON.stringify(preview));assert.equal(result.staleRejected,true);assert.equal(result.changedContextRejected,true);assert.ok(requests.every(url=>url.startsWith(origin+'/')));
 }finally{await context.close();}
 console.log('Public import browser bundle matches Node analysis/preview, rejects stale revisions/context and performs no provider requests by default.');
}
