import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {createServer} from 'node:http';
import {chromium} from 'playwright-core';
const server=createServer(async(req,res)=>{if(req.url==='/'){res.writeHead(200,{'Content-Type':'text/html','Content-Security-Policy':"default-src 'self'; script-src 'self'; connect-src 'self'"}).end('<!doctype html><title>Manager API test</title>');return;}if(!['/citation-manager.mjs','/citation-compiler.mjs','/citation-tools.mjs'].includes(req.url)){res.writeHead(404).end();return;}res.writeHead(200,{'Content-Type':'text/javascript'}).end(await readFile(new URL('../dist'+req.url,import.meta.url)));});
await new Promise(r=>server.listen(0,'127.0.0.1',r));const browser=await chromium.launch({headless:true});
try{const page=await browser.newPage(),errors=[],requests=[];page.on('pageerror',e=>errors.push(e.message));page.on('request',r=>requests.push(r.url()));await page.goto(`http://127.0.0.1:${server.address().port}/`);
 const result=await page.evaluate(async()=>{
  const manager=await import('/citation-manager.mjs'),compiler=await import('/citation-compiler.mjs'),tools=await import('/citation-tools.mjs');
  const {fromZotero,reconcileZoteroItem}=manager,{compileCitations}=compiler;
  const policyKeys=['form','locator','note','unresolved','quote',null];
  const policies=[manager,compiler,tools].map(api=>policyKeys.map(key=>api.citationOptionPolicy(key).action));
  const csl={id:'https://www.zotero.org/users/42/items/ABCD2345',type:'book',title:'Collected evidence',editor:[{family:'Smith',given:'Jane'}],issued:{'date-parts':[['2022']]},ISBN:'9780691198927',note:'private-canary'};
  const selected=fromZotero({key:'ABCD2345',version:1,library:{id:42,type:'user'},csljson:JSON.stringify([csl])},{recordId:'collected-evidence'}),cache={schema:'citation-inator.cache.v1',records:[selected.record]},compiled=compileCitations('{cite collected-evidence locator:12}',cache,{citationStyle:'chicago-author-date'});
  const empty=reconcileZoteroItem(selected,{schema:cache.schema,records:[]}),reuse=reconcileZoteroItem(selected,cache);
  return {policies,html:compiled.html,serialized:JSON.stringify(compiled),requiresReview:selected.requiresReview,newState:empty.state,reuseCount:reuse.candidates.length};
 });
 assert.deepEqual(result.policies,Array.from({length:3},()=>['retain','review','recompute','replace-fallback','review','review']));
 assert(!result.requiresReview);assert.equal(result.newState,'new');assert.equal(result.reuseCount,1);assert.match(result.html,/Smith/);assert.match(result.html,/ed\./);assert(!result.serialized.includes('ABCD2345'));assert(!result.serialized.includes('private-canary'));assert.deepEqual(errors,[]);assert(requests.every(url=>url.startsWith(`http://127.0.0.1:${server.address().port}/`)));console.log('Manager browser PASS',browser.version(),': CSL conversion, edited-book render, site candidates, private-envelope exclusion, no provider requests.');
}finally{await browser.close();await new Promise(r=>server.close(r));}
