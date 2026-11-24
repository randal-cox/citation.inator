import assert from 'node:assert/strict';
import {createServer} from 'node:http';
import {readFile,mkdtemp,mkdir,writeFile,rm} from 'node:fs/promises';
import {spawn} from 'node:child_process';
import {tmpdir} from 'node:os';
import {join,dirname} from 'node:path';
import {unzipSync,strFromU8} from 'fflate';
import {chromium} from 'playwright-core';

// Mount at a project base path to catch assumptions hidden by root hosting.
const server=createServer(async(req,res)=>{
  const path=new URL(req.url,'http://localhost').pathname;
  if(!/^\/citation\.inator\/(?:assets\/)?[\w.-]*$/.test(path)){res.writeHead(404).end();return;}
  const file=path.slice('/citation.inator/'.length)||'index.html';
  try{const content=await readFile(new URL('../site/'+file,import.meta.url));res.setHeader('Content-Type',file.endsWith('.mjs')?'text/javascript':file.endsWith('.css')?'text/css':file.endsWith('.json')?'application/json':'text/html');res.end(content);}catch{res.writeHead(404).end();}
});
await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
const browser=await chromium.launch({executablePath:process.env.CITATION_CHROME,headless:true});
try{
  const page=await browser.newPage({viewport:{width:1400,height:1000}});
  page.setDefaultTimeout(6000);
  const errors=[],remote=[];
  page.on('pageerror',e=>errors.push(e.message));
  page.on('request',req=>{if(!req.url().startsWith('http://127.0.0.1:'))remote.push(req.url());});
  const origin=`http://127.0.0.1:${server.address().port}/citation.inator/`;
  await page.goto(origin);
  await page.locator('#result [data-ci-record]').first().click();
  await page.waitForFunction(()=>document.querySelector('citation-inspector').hasAttribute('open'));
  await page.keyboard.press('Escape');
  await page.waitForFunction(()=>!document.querySelector('citation-inspector').hasAttribute('open'));
  await page.locator('#style').selectOption('apa');
  assert.match(await page.locator('#result').innerText(),/Ioannidis, 2005/);
  await page.getByText('Configuration (JSON)',{exact:true}).click();
  await page.locator('#configuration').fill('{');
  await page.waitForFunction(()=>!document.getElementById('error').hidden);
  assert(await page.locator('#download-cache').isDisabled());
  await page.locator('#reset').click();
  assert(!(await page.locator('#download-cache').isDisabled()));
  await page.locator('#source').fill('<img src=x onerror="window.bad=1"><style>body{display:none}</style><script>window.bad=2</script><p style="position:fixed;inset:0">Unsafe styling</p>\n\n{citation ioannidis-2005}\n\n{citation endnote}');
  await page.waitForFunction(()=>!document.getElementById('result').hasAttribute('data-stale'));
  assert.equal(await page.evaluate(()=>window.bad),undefined);
  assert.equal(await page.locator('#result script,#result style,#result [onerror],#result [style]').count(),0);
  await page.locator('#reset').click();
  for(const value of await page.locator('#example option').evaluateAll(nodes=>nodes.map(n=>n.value))){
    await page.locator('#example').selectOption(value);
    assert(await page.locator('#error').isHidden(),value);
    assert(await page.locator('#result [data-ci-record]').count(),value);
  }
  await page.locator('#configuration').fill(JSON.stringify({citationStyle:'chicago-author-date',locale:'es'}));
  await page.waitForFunction(()=>document.getElementById('result').textContent.includes('Notas finales'));
  await page.locator('#result [data-ci-record]').first().click();
  await page.waitForFunction(()=>document.querySelector('citation-inspector').hasAttribute('open'));
  assert.equal(await page.locator('citation-inspector').evaluate(e=>e.shadowRoot.querySelector('[data-citation-part~="panel-placement"]').getAttribute('aria-label')),'Mover panel de cita');
  await page.keyboard.press('Escape');
  await page.locator('#reset').click();
  await page.locator('#example').selectOption('first');
  const trigger=page.locator('#result [data-ci-record]').first();
  await page.locator('citation-inspector').evaluate(e=>e.configureAccess({locale:'es'}));
  assert.match(await trigger.getAttribute('aria-label'),/^Consultar cita:/);
  await trigger.click();
  await page.waitForFunction(()=>document.querySelector('citation-inspector').hasAttribute('open'));
  await page.locator('citation-inspector [data-citation-part~="panel-menu"] > summary').click();
  await page.getByRole('button',{name:'Dónde puedes leer',exact:true}).click();
  const sheet=page.locator('citation-inspector [data-citation-part="access-settings"]');
  await sheet.locator('input[name="service"]').first().check();
  await page.locator('citation-inspector').evaluate(e=>e.configureAccess({locale:'en'}));
  assert(await sheet.locator('input[name="service"]').first().isChecked());
  assert.equal(await sheet.getAttribute('lang'),'en');
  assert(await sheet.getByRole('button',{name:'Save',exact:true}).count());
  await sheet.getByRole('button',{name:'Cancel',exact:true}).click();
  await page.keyboard.press('Escape');
  const download=page.waitForEvent('download');
  await page.locator('#download-cache').click();
  assert.equal((await download).suggestedFilename(),'citations.json');
  await page.screenshot({path:'/private/tmp/citation-learning-first.png',fullPage:true});
  await page.setViewportSize({width:390,height:844});
  assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false);
  await page.screenshot({path:'/private/tmp/citation-learning-phone.png',fullPage:true});
  await page.goto(origin+'guide.html');
  assert(await page.getByRole('heading',{name:'Load, compile, initialize',exact:true}).count());
  await page.route('**/records.json',route=>route.fulfill({status:503,body:'Unavailable'}));
  await page.goto(origin);
  await page.waitForFunction(()=>!document.getElementById('error').hidden);
  assert.match(await page.locator('#error').innerText(),/Reload the page/);
  assert(await page.locator('#download-cache').isDisabled());
  const directory=await mkdtemp(join(tmpdir(),'citation-learning-starter-'));
  let child;
  try{
    const files=unzipSync(await readFile(new URL('../site/citation-starter.zip',import.meta.url)));
    assert(Object.keys(files).every(name=>name.startsWith('citation-starter/')&&!name.includes('..')));
    for(const [name,bytes] of Object.entries(files)){const path=join(directory,name);await mkdir(dirname(path),{recursive:true});await writeFile(path,bytes);}
    assert.match(strFromU8(files['citation-starter/README.md']),/No install is required/);
    child=spawn(process.execPath,['server.mjs'],{cwd:join(directory,'citation-starter'),env:{...process.env,PORT:'0'},stdio:['ignore','pipe','pipe']});
    const url=await new Promise((resolve,reject)=>{const timer=setTimeout(()=>reject(new Error('Starter server did not start')),5000);child.once('error',reject);child.stdout.on('data',chunk=>{const match=String(chunk).match(/http:\/\/127\.0\.0\.1:\d+\//);if(match){clearTimeout(timer);resolve(match[0]);}});});
    await page.unroute('**/records.json');
    await page.goto(url);
    await page.locator('[data-ci-record]').first().click();
    await page.waitForFunction(()=>document.querySelector('citation-inspector').hasAttribute('open'));
    assert.match(await page.locator('citation-inspector').innerText(),/Ioannidis/);
  }finally{if(child&&!child.killed){child.kill();await new Promise(resolve=>child.once('exit',resolve));}await rm(directory,{recursive:true,force:true});}
  assert.deepEqual(errors,[]);
  assert.deepEqual(remote,[]);
  console.log('Learning browser PASS: project base path, local-only lessons, live format/reset, invalid JSON, sanitizer, panel/Escape, Spanish UI, cache download and phone width.');
}finally{await browser.close();await new Promise(resolve=>server.close(resolve));}
