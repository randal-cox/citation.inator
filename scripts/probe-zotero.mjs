import {chromium} from 'playwright-core';
// Public template / local service-root probes only: no credentials or library items.
import {createServer} from 'node:http';
import {writeFile} from 'node:fs/promises';
const server=createServer((req,res)=>res.writeHead(200,{'Content-Type':'text/html'}).end('<!doctype html><title>Zotero connection probe</title>'));
await new Promise(r=>server.listen(0,'127.0.0.1',r));
const browser=await chromium.launch({headless:true});
const report={browser:browser.version(),checks:[]};
try {
 for(const entry of [{name:'local-editor-session-1',url:`http://127.0.0.1:${server.address().port}/`},{name:'hosted-editor',url:process.argv[2]||'https://korazonresearch.org/'},{name:'local-editor-session-2',url:`http://127.0.0.1:${server.address().port}/`}]){
  const context=await browser.newContext();const page=await context.newPage();const messages=[];
  page.on('console',m=>{if(m.type()==='error')messages.push(m.text().slice(0,300));});
  const row={name:entry.name,requestedOrigin:new URL(entry.url).origin};report.checks.push(row);
  try{await page.goto(entry.url,{waitUntil:'domcontentloaded',timeout:15000});row.actualOrigin=await page.evaluate(()=>location.origin);row.secureContext=await page.evaluate(()=>isSecureContext);
   for(const [name,url,headers] of [['web-template','https://api.zotero.org/items/new?itemType=journalArticle',{'Zotero-API-Version':'3'}],['web-invalid-key','https://api.zotero.org/items/new?itemType=journalArticle',{'Zotero-API-Version':'3','Zotero-API-Key':'not-a-real-zotero-api-key'}],['local-root','http://127.0.0.1:23119/api/',{'Zotero-API-Version':'3'}]]){
    row[name]=await page.evaluate(async({url,headers})=>{const start=performance.now();try{const r=await fetch(url,{headers,credentials:'omit',signal:AbortSignal.timeout(6000)});return {status:r.status,ok:r.ok,elapsedMs:Math.round(performance.now()-start),apiVersion:r.headers.get('Zotero-API-Version'),serverIdentityPresent:r.headers.has('Zotero-Server-ID'),cors:r.type};}catch(e){return {error:e.name,message:e.message,elapsedMs:Math.round(performance.now()-start)}}},{url,headers});
   }
  }catch(e){row.navigationError={name:e.name,message:e.message.slice(0,250)};}
  row.consoleErrors=messages;await context.close();
 }
}finally{await browser.close();await new Promise(r=>server.close(r));await writeFile('/private/tmp/cite-zotero-feasibility.json',JSON.stringify(report,null,2));console.log(JSON.stringify(report,null,2));}
