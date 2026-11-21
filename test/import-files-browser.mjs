import assert from 'node:assert/strict';
import {officeZip,docx,odt,pdf} from './fixtures/native-documents.mjs';
export async function checkImportFiles(browser,origin){
 const context=await browser.newContext(),page=await context.newPage(),requests=[],errors=[];page.setDefaultTimeout(15000);page.on('request',request=>requests.push(request.url()));page.on('pageerror',error=>errors.push(error.message));
 await page.route(/^https:\/\/(?:api\.crossref\.org|openlibrary\.org)\//,route=>route.abort());
 const paragraphs=['A claim (Rivera, 2020).','References','Rivera, R. (2020). A paper. Journal, 1(1), 4-8.'];
 const files=[{name:'source.docx',bytes:officeZip('docx',docx(paragraphs.map(line=>'<w:p><w:r><w:t>'+line+'</w:t></w:r></w:p>').join('')))},{name:'source.odt',bytes:officeZip('odt',odt(paragraphs.map(line=>'<text:p>'+line+'</text:p>').join('')))},{name:'source.pdf',bytes:pdf([paragraphs])}];
 try{
  await page.goto(origin+'/demos/import/');await page.locator('[data-review-group="0"]').waitFor();
  for(const file of files){await page.locator('#import-file').setInputFiles({name:file.name,mimeType:'application/octet-stream',buffer:Buffer.from(file.bytes)});await page.waitForFunction(name=>document.querySelector('#input-name').textContent===name,file.name);await page.waitForFunction(()=>document.querySelectorAll('[data-review-group]').length===1&&document.querySelector('#document-preview').textContent.includes('Rivera'));assert.equal(await page.locator('#errors').textContent(),'');assert.ok((await page.locator('#source').inputValue()).includes('References'));assert.equal(await page.locator('#file-extraction').getAttribute('hidden'),null);const meta=JSON.parse(await page.locator('#file-extraction-json').textContent());assert.equal(meta.original.filename,file.name);
   await page.locator('#input-details>summary').click();const waiting=page.waitForEvent('download');await page.getByRole('button',{name:'Download original',exact:true}).click();const download=await waiting,stream=await download.createReadStream(),chunks=[];for await(const chunk of stream)chunks.push(chunk);assert.deepEqual(Buffer.concat(chunks),Buffer.from(file.bytes));await page.locator('#input-details>summary').click();
  }
  assert.ok(!requests.some(url=>url.endsWith('/demos/import/review')));assert.ok(requests.some(url=>url.endsWith('/dist/citation-pdf.worker.mjs')));assert.deepEqual(errors,[]);
 }finally{await context.close();}
 console.log('Native DOCX/ODT/PDF load in-browser, retain bibliography/original bytes and extraction evidence, and require no review server.');
}
