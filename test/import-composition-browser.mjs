import assert from 'node:assert/strict';
import {createServer} from 'node:http';
import {readFile} from 'node:fs/promises';
import {chromium} from 'playwright-core';
import {processImportRequest,classifyReview} from '../src/import-api.mjs';

const equation='$x + \\text{(Bell, 1992)} + {cite untouched}$';
const source='😀 Author<sup>1</sup>. Before (Bell, 1992).\n\n'+equation+'\n\n{figure src:"example.png" caption:"A caption (Bell, 1992)."}\n\nAfter (Bell, 1992).\n\nReferences\nBell, C. (1992). Ritual theory, ritual practice. Press.';
const request={source,mode:'document',style:'apa',revision:7,opaque:[{start:source.indexOf(equation),end:source.indexOf(equation)+equation.length}]};
function exercise(api){
 const analysis=api.processImportRequest(request);
 const decisions=analysis.review.matches.map((match,citationIndex)=>({citationIndex,action:'accept',recordIds:[match.items[0].candidates[0].recordId]}));
 const classification=api.classifyReview(analysis,{reviewId:analysis.review.reviewId,decisions});
 const preview=api.processImportRequest({...request,action:'preview',review:analysis.review,reviewId:analysis.review.reviewId,decisions});
 return {analysis,classification,preview};
}
const expected=exercise({processImportRequest,classifyReview});
const server=createServer(async(req,res)=>{if(req.url==='/'){res.setHeader('Content-Type','text/html');res.setHeader('Content-Security-Policy',"default-src 'none'; script-src 'self'; connect-src 'self'");res.end('<!doctype html><title>Composed import test</title>');}else if(req.url==='/citation-import.mjs'){res.setHeader('Content-Type','text/javascript');res.end(await readFile(new URL('../dist/citation-import.mjs',import.meta.url)));}else res.writeHead(404).end();});
await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
const browser=await chromium.launch({headless:true,executablePath:process.env.CITATION_CHROME});
try{
 const page=await browser.newPage(),errors=[],requests=[];page.on('pageerror',e=>errors.push(e.message));page.on('request',r=>requests.push(r.url()));const origin=`http://127.0.0.1:${server.address().port}`;await page.goto(origin);
 const actual=await page.evaluate(async request=>{const api=await import('/citation-import.mjs'),analysis=api.processImportRequest(request),decisions=analysis.review.matches.map((match,citationIndex)=>({citationIndex,action:'accept',recordIds:[match.items[0].candidates[0].recordId]})),classification=api.classifyReview(analysis,{reviewId:analysis.review.reviewId,decisions}),preview=api.processImportRequest({...request,action:'preview',review:analysis.review,reviewId:analysis.review.reviewId,decisions});return {analysis,classification,preview};},request);
 assert.deepEqual(actual,expected);assert.equal(actual.preview.edits.length,3);assert(actual.preview.source.includes(equation));assert(actual.preview.source.includes('{figure src:"example.png" caption:"A caption {cite '));assert(actual.classification.canApply);assert.deepEqual(errors,[]);assert(requests.every(url=>url.startsWith(origin+'/')));console.log('Composed import browser PASS',browser.version(),': Node parity, opaque math, nested caption edits, classifier and self-only CSP.');
}finally{await browser.close();await new Promise(resolve=>server.close(resolve));}
