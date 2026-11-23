import test from 'node:test';
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {build} from 'esbuild';
import * as sourceAPI from '../src/import-api.mjs';
const {processImportRequest}=sourceAPI;
import {importDemoRequest} from '../scripts/import-demo-service.mjs';
import {importHash} from '../src/import-hash.mjs';

const source='😀 A claim (Rivera, 2020, p. 4).\r\n\r\n## References\r\n\r\nRivera, R. (2020). A paper. Journal, 1(1), 4–8.\r\n';
const base={mode:'document',source,style:'auto'};
const accept=analysis=>({citationIndex:0,action:'accept',targets:[{recordId:analysis.referenceRecords[0].id}]});
const preview=(api,analysis,overrides={})=>api.processImportRequest({...base,action:'preview',review:analysis.review,reviewId:analysis.review.reviewId,decisions:[accept(analysis)],...overrides});

test('portable import hashes preserve existing Node wire identities including UTF-16 edge cases',()=>{
 for(const text of ['',source,'中文\u0000\ud800\udc00\ud800\udc01\udfff','a'.repeat(1500000)])assert.equal(importHash(text),createHash('sha256').update(text).digest('hex'));
});

test('public headless pipeline is the same implementation as the compatibility service',()=>{
 assert.equal(importDemoRequest,sourceAPI.processImportRequest);
 const analysis=sourceAPI.processImportRequest(base),result=preview(sourceAPI,analysis);
 assert.equal(analysis.review.matches.length,1);assert.equal(result.edits.length,1);
 assert.ok(result.source.includes('locator:"p. 4"'));assert.ok(result.source.endsWith(source.slice(source.indexOf('## References'))));
 assert.equal(analysis.review.sourceHash,importHash(source));assert.equal(result.cache.records.length,1);
 for(const name of ['createDocumentImporter','extractImportText','detectExtractedCitations','createImportReview','planImportEdits','applyImportEdits','normalizeImportLimits','createBrowserEnrichment'])assert.equal(typeof sourceAPI[name],'function');
});

test('browser-target bundle exchanges revision-bound analyses and previews with Node without Node builtins',async()=>{
 const built=await build({entryPoints:['src/import-api.mjs'],bundle:true,format:'esm',platform:'browser',target:'es2022',write:false});
 const code=built.outputFiles[0].text;assert.ok(!code.includes('node:crypto'));assert.ok(!/from ["']node:/u.test(code));
 const browserAPI=await import('data:text/javascript;base64,'+Buffer.from(code).toString('base64'));
 const nodeAnalysis=sourceAPI.processImportRequest(base),browserAnalysis=browserAPI.processImportRequest(base);
 assert.deepEqual(browserAnalysis,nodeAnalysis);assert.deepEqual(preview(browserAPI,nodeAnalysis),preview(sourceAPI,browserAnalysis));
 assert.throws(()=>preview(browserAPI,nodeAnalysis,{source:source+' '}),/changed/);
 assert.throws(()=>preview(sourceAPI,browserAnalysis,{limits:{references:4}}),/changed/);
 const modified=structuredClone(browserAnalysis);modified.review.matches[0].citation.raw='different';assert.throws(()=>preview(browserAPI,modified),/changed|snapshot/);
});

test('host keyword and namespace configure output and bind the review context',()=>{
 const source='A claim (Rivera, 2020).\n\nReferences\nRivera, R. (2020). A paper.',base={mode:'document',source,style:'auto',citationKeyword:'ref',namespace:'host-import'},analysis=processImportRequest(base),decisions=[{citationIndex:0,action:'accept',targets:[{recordId:analysis.referenceRecords[0].id}]}],request={...base,action:'preview',review:analysis.review,reviewId:analysis.review.reviewId,decisions};
 const result=processImportRequest(request);assert.match(result.source,/\{ref /);assert.ok(result.html.includes('host-import'));assert.throws(()=>processImportRequest({...request,namespace:'other'}),/changed/);assert.throws(()=>processImportRequest({...request,citationKeyword:'cite'}),/changed/);
});
