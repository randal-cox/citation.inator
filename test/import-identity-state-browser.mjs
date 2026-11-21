import assert from 'node:assert/strict';
export async function checkImportIdentityState(browser,origin){
 const context=await browser.newContext({viewport:{width:1280,height:1100}}),page=await context.newPage();page.setDefaultTimeout(10000);
 const doi='10.5555/reviewed.target',knownDOI='10.5555/reviewed.known',record={DOI:doi,title:['Shared study'],author:[{family:'Jensen',given:'T.'}],issued:{'date-parts':[[2021]]},type:'journal-article','container-title':['Journal'],volume:'5',issue:'1',page:'1–9',publisher:'Example Publisher'};
 const source='A claim (Rivera, 2020).\n\n## References\n\nRivera, R. (2020). Shared study. Journal, 5(1), 1–9.';
 const failures=[];page.on('pageerror',error=>failures.push(error.message));
 await page.route('https://api.crossref.org/**',route=>{const url=new URL(route.request().url()),identifier=url.pathname.includes(encodeURIComponent(knownDOI))?knownDOI:doi;return route.fulfill({json:url.search?{message:{items:[record]}}:{message:{...record,DOI:identifier}}});});
 await page.route('https://openlibrary.org/**',route=>route.fulfill({json:{docs:[]}}));
 const setSource=async text=>{await page.keyboard.press('Escape');if(await page.locator('#source').isHidden())await page.locator('#input-details>summary').click();await page.locator('#source').fill(text);await page.waitForFunction(()=>document.querySelector('[data-review-group="0"]')?.textContent==='(Rivera, 2020)'||document.querySelector('[data-review-group="0"]')?.textContent==='(Rivera, 2022)');};
 const open=async()=>{await page.keyboard.press('Escape');await page.locator('[data-review-group="0"]').click();};
 const converted=async()=>{await page.keyboard.press('Escape');if(!await page.locator('#converted-document').evaluate(n=>n.open))await page.locator('#preview').click();await page.waitForFunction(()=>!document.querySelector('#output-section').hidden&&!document.querySelector('#converted-document').hasAttribute('aria-busy')&&!document.querySelector('#download').disabled);return page.locator('#output').inputValue();};
 try{
  await page.goto(origin+'/demos/import/');await setSource(source);await page.waitForFunction(()=>document.querySelector('#review-group-0 .completion-status')?.textContent==='1 identifier match');await open();
  // Reviews with conflicting authors are secondary even when the title is identical.
  await page.locator('#review-group-0 .more-results>summary').click();await page.locator('#review-group-0 .completion-choices input').first().check();
  await page.waitForFunction(()=>document.querySelector('#review-group-0 .completion-status')?.textContent==='Identifier needs review');
  assert.equal(await page.locator('[data-review-group="0"]').getAttribute('data-review-state'),'needs-review');assert.equal(await page.locator('#lookup-activity').textContent(),'Needs review: 1');assert.match(await page.locator('#review-group-0 .completion-conflict').textContent(),/authors/);assert.ok(!(await converted()).includes('doi:'+doi));
  await open();await page.getByRole('button',{name:'Use this identifier anyway',exact:true}).click();await page.waitForFunction(()=>document.querySelector('[data-review-group="0"]').dataset.reviewState==='selected');assert.ok((await converted()).includes('doi:'+doi));
  // A known identifier bypasses search, but observed identity conflicts remain visible.
  await setSource(source+' https://doi.org/'+knownDOI);await page.waitForFunction(()=>document.querySelector('#review-group-0 .completion-status')?.textContent==='Identifier needs review');await open();assert.ok(await page.locator('#review-group-0 .identifier-completion').isVisible());assert.equal(await page.locator('#review-group-0 .completion-choices input').count(),0);assert.ok(!(await converted()).includes('{cite doi:'+knownDOI));
  await open();await page.getByRole('button',{name:'Use this identifier anyway',exact:true}).click();assert.ok((await converted()).includes('doi:'+knownDOI));
  // Source edits create a new review; a previous override cannot approve its metadata.
  await setSource((source+' https://doi.org/'+knownDOI).replaceAll('2020','2022'));await page.waitForFunction(()=>document.querySelector('#review-group-0 .completion-status')?.textContent==='Identifier needs review');assert.equal(await page.locator('[data-review-group="0"]').getAttribute('data-review-state'),'needs-review');assert.ok(!(await converted()).includes('{cite doi:'+knownDOI));assert.deepEqual(failures,[]);
 }finally{await context.close();}
 console.log('Import identity conflicts stay reviewable and out of converted citations until explicit override; known IDs bypass discovery and source changes invalidate overrides.');
}
