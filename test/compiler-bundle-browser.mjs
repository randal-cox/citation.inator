import assert from 'node:assert/strict';
import {compileMarkdown,compileHTML} from '../src/markup.mjs';import {compileCitations} from '../src/compiler.mjs';import {makeCache} from '../src/records.mjs';
export async function checkCompilerBundle(browser,origin){
 const cache=makeCache([{id:'bell-1992-ritual',type:'book',state:'resolved',title:'Ritual Theory, Ritual Practice',authors:[{family:'Bell',given:'Catherine'}],issued:[1992]}]),options={citationStyle:'chicago-author-date',namespace:'editor-preview'},source='Practice comes first {citation bell-1992-ritual | note:"Bell 1992" | locator:12}.\n\n{citation endnote}';
 const fixtures={cache,options,source,html:'<p><em>A title</em> '+source.replaceAll('\n','')+'</p>'};
 const expected=[compileCitations(source,cache,options),compileMarkdown(source,cache,options),compileHTML(fixtures.html,cache,options)];
 const context=await browser.newContext(),page=await context.newPage(),requests=[];page.on('request',r=>requests.push(r.url()));
 try{
  await page.route(origin+'/compiler-probe.html',r=>r.fulfill({contentType:'text/html',headers:{'Content-Security-Policy':"default-src 'none'; script-src 'self'; connect-src 'none'; style-src 'none'; img-src 'none'; base-uri 'none'"},body:'<!doctype html><title>Compiler probe</title><script type="module" src="/compiler-probe.mjs"></script>'}));
  await page.route(origin+'/compiler-probe.mjs',r=>r.fulfill({contentType:'text/javascript',body:`import {compileCitations,compileMarkdown,compileHTML} from '/dist/citation-compiler.mjs';const f=${JSON.stringify(fixtures)};window.compilerProbe=[compileCitations(f.source,f.cache,f.options),compileMarkdown(f.source,f.cache,f.options),compileHTML(f.html,f.cache,f.options)];`}));
  await page.goto(origin+'/compiler-probe.html');await page.waitForFunction(()=>Array.isArray(window.compilerProbe));assert.deepEqual(await page.evaluate(()=>window.compilerProbe),expected);assert.ok(requests.every(url=>url.startsWith(origin+'/')));
 }finally{await context.close();}
 console.log('Standalone browser compiler matches all three Node entry points under self-only CSP without a server compiler or provider requests.');
}
