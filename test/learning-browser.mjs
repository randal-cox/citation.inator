import assert from 'node:assert/strict';
import {createServer} from 'node:http';
import {readFile,mkdtemp,mkdir,writeFile,rm} from 'node:fs/promises';
import {spawn} from 'node:child_process';
import {tmpdir} from 'node:os';
import {join,dirname} from 'node:path';
import {unzipSync,strFromU8} from 'fflate';
import {chromium} from 'playwright-core';
import {checkLearning} from '../scripts/check-learning.mjs';

const unexpected=new URL('../site/__unexpected-learning-test.txt',import.meta.url);
await writeFile(unexpected,'not a public build input',{flag:'wx'});
try{await assert.rejects(()=>checkLearning(),/Unexpected learning output/);}
finally{await rm(unexpected);}

// Mount at a project base path to catch assumptions hidden by root hosting.
const server=createServer(async(req,res)=>{
  const path=new URL(req.url,'http://localhost').pathname;
  if(!/^\/citation\.inator\/(?:(?:assets|examples|import|documents|reference|tools|host)\/)?[\w.-]*$/.test(path)){res.writeHead(404).end();return;}
  let file=path.slice('/citation.inator/'.length);
  if(!file||file.endsWith('/'))file+='index.html';
  try{const content=await readFile(new URL('../site/'+file,import.meta.url));res.setHeader('Content-Type',/\.(?:mjs|js)$/.test(file)?'text/javascript':file.endsWith('.css')?'text/css':file.endsWith('.json')?'application/json':'text/html');res.end(content);}catch{res.writeHead(404).end();}
});
await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
const browser=await chromium.launch({executablePath:process.env.CITATION_CHROME,headless:true});
console.log('Learning test browser',browser.version());
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
  assert(await page.locator('#hover').isChecked());
  assert.equal(await page.locator('#example-gallery [aria-pressed="true"]').getAttribute('data-example'),'first');
  for(const value of await page.locator('#example-gallery button').evaluateAll(nodes=>nodes.map(n=>n.dataset.example))){
    await page.locator(`[data-example="${value}"]`).click();
    assert(await page.locator('#error').isHidden(),value);
    assert(await page.locator('#result [data-ci-record]').count(),value);
  }
  await page.locator('[data-example="access"]').click();
  await page.locator('#source').fill((await page.locator('#source').inputValue())+'\nAfter the references.');
  await page.waitForFunction(()=>!document.getElementById('result').hasAttribute('data-stale'));
  const order=await page.locator('#result').evaluate(node=>({text:node.textContent,html:node.innerHTML}));
  assert(!order.text.includes('{citation endnote}'));assert(order.html.indexOf('data-citation-part="endnotes"')<order.html.indexOf('After the references.'));
  const alternatives=page.locator('#result [data-citation-part="access-more"]');await alternatives.locator('summary').click();
  assert.match(await alternatives.innerText(),/JSTOR/);assert.match(await alternatives.innerText(),/WorldCat/);
  assert.equal(await alternatives.locator('[data-citation-part="backlinks"]').count(),0);
  const expanded=await alternatives.evaluate(node=>({summary:node.querySelector('summary').getBoundingClientRect().bottom,body:node.querySelector('[data-citation-part="access-more-body"]').getBoundingClientRect().top}));assert(expanded.body>=expanded.summary);
  await page.locator('[data-example="first"]').click();
  await page.locator('#configuration').fill(JSON.stringify({citationStyle:'chicago-author-date',locale:'es'}));
  await page.waitForFunction(()=>document.getElementById('result').textContent.includes('Notas finales'));
  await page.locator('#result [data-ci-record]').first().click();
  await page.waitForFunction(()=>document.querySelector('citation-inspector').hasAttribute('open'));
  assert.equal(await page.locator('citation-inspector').evaluate(e=>e.shadowRoot.querySelector('[data-citation-part~="panel-placement"]').getAttribute('aria-label')),'Mover panel de cita');
  await page.keyboard.press('Escape');
  await page.locator('#reset').click();
  await page.locator('[data-example="first"]').click();
  const trigger=page.locator('#result [data-ci-record]').first();
  await page.waitForFunction(()=>document.querySelector('#result [data-ci-record]')?.getAttribute('role')==='button');
  await page.locator('citation-inspector').evaluate(e=>e.configureAccess({locale:'es'}));
  assert.match(await trigger.getAttribute('aria-label'),/^Consultar cita:/);
  await trigger.click();
  await page.waitForFunction(()=>document.querySelector('citation-inspector').hasAttribute('open'));
  await page.locator('citation-inspector [data-citation-part~="panel-menu"] > summary').click();
  await page.getByRole('button',{name:'Dónde puedes leer',exact:true}).click();
  const sheet=page.locator('citation-inspector [data-citation-part="access-settings"]');
  await sheet.locator('input[name="service"]').first().check();
  await sheet.locator('[name="libraryKind"]').selectOption('proxy');
  await sheet.locator('[name="libraryAddress"]').fill('http://example.org/library');
  await sheet.getByRole('button',{name:'Guardar',exact:true}).click();
  assert.match(await sheet.getByRole('alert').innerText(),/Revisa/);
  await page.locator('citation-inspector').evaluate(e=>e.configureAccess({locale:'en'}));
  assert(await sheet.locator('input[name="service"]').first().isChecked());
  assert.equal(await sheet.getAttribute('lang'),'en');
  assert(await sheet.getByRole('button',{name:'Save',exact:true}).count());
  assert.match(await sheet.getByRole('alert').innerText(),/Check your library address/);
  await sheet.getByRole('button',{name:'Cancel',exact:true}).click();
  await page.keyboard.press('Escape');
  const download=page.waitForEvent('download');
  await page.locator('#download-cache').click();
  assert.equal((await download).suggestedFilename(),'citations.json');
  await page.screenshot({path:join(tmpdir(),'citation-learning-first.png'),fullPage:true});
  await page.setViewportSize({width:390,height:844});
  assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false);
  const help=page.getByRole('button',{name:'Hover configuration',exact:true});
  const circle=await help.boundingBox();assert(Math.abs(circle.width-circle.height)<.5);
  await help.focus();
  const tooltip=page.locator('#hover-help');assert(await tooltip.isVisible());
  const tooltipBounds=await tooltip.boundingBox();assert(tooltipBounds.x>=0&&tooltipBounds.x+tooltipBounds.width<=390);
  await page.keyboard.press('Escape');assert(await tooltip.isHidden());
  await page.screenshot({path:join(tmpdir(),'citation-learning-phone.png'),fullPage:true});
  await page.goto(origin+'guide.html');
  assert(await page.getByRole('heading',{name:'Load, compile, initialize',exact:true}).count());
  await page.goto(origin+'?example=site');
  await page.locator('#result [data-citation-part="site-returns"] a').first().click();
  assert.match(page.url(),/examples\/article-one\.html#/);
  assert(await page.locator(new URL(page.url()).hash).count());
  await page.goto(origin+'import/');
  await page.locator('[data-review-group="0"]').waitFor();
  await page.locator('[data-review-group="0"]').click();
  await page.locator('#target-0-0-0').check();
  await page.waitForFunction(()=>document.getElementById('lookup-evidence').textContent.includes('10.1002/andp.'),null,{timeout:12000});
  await page.keyboard.press('Escape');
  await page.locator('#preview').click();
  await page.waitForFunction(()=>document.getElementById('output').value.includes('{cite'));
  assert.equal(await page.locator('#errors').innerText(),'');
  for(const extension of ['pdf','docx','odt']){
    const bytes=await readFile(new URL('../site/documents/sample.'+extension,import.meta.url));
    await page.locator('#import-file').setInputFiles({name:'sample.'+extension,mimeType:'application/octet-stream',buffer:bytes});
    await page.waitForFunction(name=>document.getElementById('input-name').textContent===name,'sample.'+extension);
    await page.waitForFunction(()=>document.querySelectorAll('[data-review-group]').length===2&&document.getElementById('document-preview').textContent.includes('Ioannidis'));
    assert.equal(await page.locator('#errors').innerText(),'');
  }
  for(const route of ['guide.html','notation.html','reference/integration.html','import/','tools/editor-tools.html','host/']){
    await page.goto(origin+route);assert.deepEqual(await page.locator('header nav[aria-label="Learning"] a').allTextContents(),['Playground','Import','GitHub','Guide']);
  }
  await page.goto(origin+'import/');assert.match(await page.locator('.intro').innerText(),/Turn citations in an existing document/);
  assert.equal(await page.locator('body').evaluate(node=>getComputedStyle(node).colorScheme),'light');
  await page.goto(origin+'host/');
  await page.locator('#record-count').filter({hasText:'2 site records'}).waitFor();
  const editorSource=page.getByRole('textbox',{name:'The article, in Markdown',exact:true});
  const original=await editorSource.inputValue();
  await page.getByRole('button',{name:'Import citations',exact:true}).click();
  await page.getByRole('button',{name:'Find citations',exact:true}).click();
  await page.getByRole('button',{name:'Cancel',exact:true}).last().click();
  assert.equal(await editorSource.inputValue(),original);
  assert.match(await page.locator('#record-count').innerText(),/0 staged/);
  await page.getByRole('button',{name:'Import citations',exact:true}).click();
  await page.getByRole('button',{name:'Find citations',exact:true}).click();
  await page.getByRole('button',{name:'Convert 2 citations',exact:true}).click();
  assert.match(await editorSource.inputValue(),/\{citation bell-1992-ritual/);
  assert.match(await page.locator('#record-count').innerText(),/1 staged/);
  const bundleDownload=page.waitForEvent('download');
  await page.locator('#download-bundle').click();
  const artifact=await bundleDownload,stream=await artifact.createReadStream(),chunks=[];
  for await(const chunk of stream)chunks.push(chunk);
  const bundle=JSON.parse(Buffer.concat(chunks));
  assert.match(bundle.source,/\{citation/);
  assert.equal(bundle.cache.records.length,3);
  assert(bundle.cache.records.some(record=>record.id==='ioannidis-2005'));
  await editorSource.focus();await page.keyboard.press(process.platform==='darwin'?'Meta+z':'Control+z');
  assert.equal(await editorSource.inputValue(),original);
  await page.screenshot({path:join(tmpdir(),'citation-learning-host.png'),fullPage:true});
  for(const asset of ['article.md','citations.json','editor.js','forms.js']){
    const pattern='**/host/'+asset;
    await page.route(pattern,route=>route.fulfill({status:404,contentType:'text/plain',body:'Unavailable'}));
    await page.goto(origin+'host/');
    await page.locator('#host-error:not([hidden])').waitFor();
    assert.match(await page.locator('#host-error').innerText(),/Reload the page/);
    assert(await page.locator('#download-bundle').isDisabled());
    assert.equal(await page.getByRole('textbox',{name:'The article, in Markdown',exact:true}).count(),0);
    await page.unroute(pattern);
  }
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
  const offlineDirectory=await mkdtemp(join(tmpdir(),'citation-offline-learning-'));
  let offlineServer;
  try{
    const files=unzipSync(await readFile(new URL('../site/citation-learning-site.zip',import.meta.url)));
    assert(Object.keys(files).every(name=>name.startsWith('citation-learning/')&&!/\.citation-import-local|node_modules| 2\./.test(name)));
    for(const [name,bytes] of Object.entries(files)){const path=join(offlineDirectory,name);await mkdir(dirname(path),{recursive:true});await writeFile(path,bytes);}
    const packageInfo=JSON.parse(strFromU8(files['citation-learning/package.json']));
    const buildInfo=JSON.parse(strFromU8(files['citation-learning/BUILD.json']));assert.equal(buildInfo.version,packageInfo.version);
    offlineServer=spawn(process.execPath,['server.mjs'],{cwd:join(offlineDirectory,'citation-learning'),env:{...process.env,PORT:'0'},stdio:['ignore','pipe','pipe']});
    const url=await new Promise((resolve,reject)=>{const timer=setTimeout(()=>reject(new Error('Offline site server did not start')),5000);offlineServer.once('error',reject);offlineServer.stdout.on('data',chunk=>{const match=String(chunk).match(/http:\/\/127\.0\.0\.1:\d+\//);if(match){clearTimeout(timer);resolve(match[0]);}});});
    await page.goto(url);await page.locator('#result [data-ci-record]').first().waitFor();
    await page.goto(url+'import/');await page.locator('[data-review-group="0"]').waitFor();
    await page.goto(url+'host/');await page.locator('#record-count').filter({hasText:'2 site records'}).waitFor();
    assert(!(await page.locator('#download-bundle').isDisabled()));
  }finally{if(offlineServer&&!offlineServer.killed){offlineServer.kill();await new Promise(resolve=>offlineServer.once('exit',resolve));}await rm(offlineDirectory,{recursive:true,force:true});}
  assert.deepEqual(errors,[]);
  assert.deepEqual(remote,[]);
  console.log('Learning browser PASS: project base path, local-only lessons, edits/reset/errors, sanitizer, keyboard/help/Spanish, native import, cross-page anchors, real editor cancel/convert/staging/export/Undo, 404 guards and clean copied/offline ZIPs.');
}finally{await browser.close();await new Promise(resolve=>server.close(resolve));}
