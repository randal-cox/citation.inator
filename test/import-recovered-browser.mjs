import assert from 'node:assert/strict';
export async function checkRecoveredIdentifier(browser,origin){
 const context=await browser.newContext(),page=await context.newPage();let release;
 const held=new Promise(resolve=>{release=resolve;});
 const id='10.5555/record.article.2020';
 try{
  await page.route('https://api.crossref.org/**',async route=>{
   if(!route.request().url().includes('10.5555'))return route.fulfill({json:{message:{items:[]}}});
   await held;return route.fulfill({json:{message:{DOI:id,title:['Trial one'],type:'journal-article',author:[{family:'Rivera',given:'Ruth'}],issued:{'date-parts':[[2020]]},'container-title':['Test Journal'],volume:'1',page:'1-4'}}});
  });
  await page.goto(origin+'/demos/import/');await page.locator('#input-details>summary').click();
  await page.locator('#source').fill('A claim [1].\n\nReferences\n1. Rivera R. Trial one. Test Journal. 2020;1:1-4. https://doi.org/10.5555/record.\narticle.2020');await page.locator('#style').selectOption('vancouver');
  await page.waitForFunction(()=>document.querySelector('#status').textContent==='1 citations.');
  assert.equal(await page.locator('[data-review-group="0"]').getAttribute('data-review-state'),'completing');
  assert.match(await page.locator('#lookup-ready').textContent(),/0\/1/);
  await page.locator('#preview').click();await page.waitForFunction(()=>document.querySelector('#output').value.includes('{cite ref-'));
  release();await page.waitForFunction(()=>document.querySelector('[data-review-group="0"]').dataset.reviewState==='selected');
  await page.waitForFunction(()=>document.querySelector('#output').value.includes('doi:10.5555/record.article.2020'));
  assert.match(await page.locator('#lookup-ready').textContent(),/1\/1/);assert.equal(await page.locator('#errors').textContent(),'');
  console.log('Recovered DOI stays orange/local until accepted provider metadata promotes it to a green DOI marker.');
 }finally{release();await context.close();}
}
