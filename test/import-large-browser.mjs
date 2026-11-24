import assert from 'node:assert/strict';
/** Large document, few unique works: isolate review rendering from provider throughput. */
export async function checkLargeImport(browser,origin){
 const context=await browser.newContext(),page=await context.newPage();
 try{
  await page.route('https://api.crossref.org/**',route=>route.fulfill({json:{message:{items:[]}}}));
  await page.route('https://openlibrary.org/**',route=>route.fulfill({json:{docs:[]}}));
  await page.goto(origin+'/demos/import/');
  await page.locator('#input-details>summary').click();
  const body=Array.from({length:180},(_,n)=>`Claim ${n+1} [${n%8+1}].`).join('\n\n');
  const refs=Array.from({length:8},(_,n)=>`${n+1}. Rivera R. Trial ${n+1}. Test Journal. 2020;1:1–4.`).join('\n');
  await page.locator('#source').fill(body+'\n\nReferences\n'+refs);
  const started=Date.now();await page.locator('#style').selectOption('vancouver');
  await page.waitForFunction(()=>document.querySelector('#status').textContent==='180 citations.',null,{timeout:15000});
  const analysisMs=Date.now()-started;
  assert.equal(await page.locator('[data-review-group]').count(),180);
  await page.waitForFunction(()=>document.querySelector('#lookup-count').textContent==='Looking up: 0',null,{timeout:20000});
  const evidence=await page.locator('#lookup-evidence').textContent();assert.equal(JSON.parse(evidence).length,8);assert.ok(JSON.parse(evidence).every(entry=>entry.state!=='queued'&&entry.state!=='searching'));
  await page.locator('[data-review-group="0"]').click();assert.equal(await page.locator('#review-group-0').isVisible(),true);
  assert.equal(await page.locator('#review-group-0 [data-direction="1"]').getAttribute('aria-label'),'Next unresolved citation');
  assert.equal(await page.locator('#errors').textContent(),'');
  console.log(`Large import rendered 180 groups in ${analysisMs} ms and completed all eight mocked-provider jobs; unresolved navigation remains available.`);
 }finally{await context.close();}
}
