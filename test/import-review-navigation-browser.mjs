import assert from 'node:assert/strict';
import axe from 'axe-core';
import {documentExamples} from '../demos/import/document-examples.mjs';
export async function checkReviewNavigation(browser,origin){
 const context=await browser.newContext({viewport:{width:1280,height:1100}}),page=await context.newPage();page.setDefaultTimeout(10000);
 const planck={DOI:'10.1002/andp.19013090310',title:['Ueber das Gesetz der Energieverteilung im Normalspectrum'],author:[{given:'Max',family:'Planck'}],issued:{'date-parts':[[1901]]},type:'journal-article','container-title':['Annalen der Physik'],volume:'309',issue:'3',page:'553-563'};
 let release,started;const pendingStarted=new Promise(resolve=>started=resolve);let phase='pending';
 await page.route('https://api.crossref.org/**',async route=>{
  const url=new URL(route.request().url());if(url.search&&phase==='queue')await new Promise(()=>{});if(url.search&&phase==='pending')await new Promise(resolve=>{release=resolve;started();});
  const record={...planck,issue:phase==='choices'?'4':'3'};
  await route.fulfill({json:url.search?{message:{items:phase==='choices'?[record,{...record,DOI:'10.5555/alternate-planck'},{...record,DOI:'10.5555/later-planck',issued:{'date-parts':[[1950]]}}]:[record]}}:{message:record}});
 });
 await page.route('https://openlibrary.org/**',route=>route.fulfill({json:{docs:[]}}));
 const open=async index=>{await page.keyboard.press('Escape');await page.locator('[data-review-group="'+index+'"]').click();};
 try{
  await page.goto(origin+'/demos/import/');await pendingStarted;
  assert.equal(await page.locator('#lookup-count').textContent(),'Looking up: 1');assert.equal(await page.locator('#lookup-activity').textContent(),'Needs review: 3');
  await page.locator('#lookup-pending-number').click();await page.locator('#review-group-2').waitFor({state:'visible'});await page.keyboard.press('Escape');
  await page.locator('#lookup-review-number').click();await page.locator('#review-group-0').waitFor({state:'visible'});assert.equal(await page.locator('#resolve-citations').getAttribute('open'),'');
  await open(1);await page.keyboard.press('ArrowRight');await page.locator('#review-group-3').waitFor({state:'visible'});await page.keyboard.press('ArrowLeft');await page.locator('#review-group-1').waitFor({state:'visible'});
  await page.keyboard.press('Escape');await page.locator('#example').click();const exampleControl=await page.locator('#example').elementHandle();phase='exact';release();await page.waitForFunction(()=>document.querySelector('[data-review-group="2"]').dataset.reviewState==='selected');
  assert.ok(await exampleControl.evaluate(node=>node.isConnected&&node===document.querySelector('#example')&&node===document.activeElement));
  // Native select Arrow/Escape commitment differs by platform. Keep the focus/identity
  // assertion above, then choose explicitly so later checks use the same document.
  await page.keyboard.press('Escape');await page.locator('#example').selectOption('apa');assert.equal(await page.locator('#example').inputValue(),'apa');await page.waitForFunction(()=>document.querySelector('[data-review-group="2"]')?.dataset.reviewState==='selected');
  assert.equal(await page.locator('#lookup-count').textContent(),'Looking up: 0');assert.equal(await page.locator('#lookup-activity').textContent(),'Needs review: 3');assert.equal(await page.locator('#lookup-pending-number').getAttribute('aria-disabled'),'true');
  await open(1);await page.keyboard.press('ArrowRight');await page.locator('#review-group-3').waitFor({state:'visible'});await page.keyboard.press('ArrowRight');assert.equal(await page.locator('#review-group-3').isHidden(),true);
  phase='choices';await page.locator('#input-details>summary').click();await page.locator('#source').fill(documentExamples.apa.replace('309(3)','309(4)'));
  await page.waitForFunction(()=>document.querySelector('#review-group-2 .completion-status')?.textContent==='3 identifier matches');
  assert.equal(await page.locator('#lookup-count').textContent(),'Looking up: 0');assert.equal(await page.locator('#lookup-activity').textContent(),'Needs review: 4');await open(1);await page.keyboard.press('ArrowRight');await page.locator('#review-group-2').waitFor({state:'visible'});assert.equal(await page.locator('#review-group-2 .more-results input').isHidden(),true);await page.getByText('Less likely results (1)',{exact:true}).click();await page.locator('#review-group-2 .more-results input').waitFor({state:'visible'});
  await page.locator('#resolve-citations>summary').click();await page.locator('#review-group-2').waitFor({state:'hidden'});await page.locator('#lookup-review-number').click();assert.equal(await page.locator('#resolve-citations').getAttribute('open'),'');await page.locator('#review-group-0').waitFor({state:'visible'});await page.keyboard.press('Escape');
  await page.setViewportSize({width:390,height:844});await page.emulateMedia({colorScheme:'dark'});
  const layout=await page.locator('.lookup-progress').evaluate(node=>{const a=node.querySelector('#lookup-count'),b=node.querySelector('#lookup-activity');return {top:a.getBoundingClientRect().top,bottom:b.getBoundingClientRect().top,firstSize:getComputedStyle(a).fontSize,secondSize:getComputedStyle(b).fontSize};});assert.ok(Math.abs(layout.bottom-layout.top)<2);assert.equal(layout.firstSize,layout.secondSize);assert.ok(parseFloat(layout.firstSize)>=11);assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
  const contained=await page.locator('#resolve-citations').evaluate(node=>{const body=node.querySelector('.disclosure-body'),a=node.getBoundingClientRect(),b=body.getBoundingClientRect();return b.left>=a.left&&b.right<=a.right&&parseFloat(getComputedStyle(node).borderLeftWidth)>0;});assert.ok(contained);
  await page.evaluate(axe.source);const report=await page.evaluate(()=>axe.run(document,{rules:{'color-contrast':{enabled:false}}}));assert.deepEqual(report.violations.map(item=>item.id),[]);
  // Three-times-BEST work is queued, never rejected by the transport's pending-job cap.
  phase='queue';const family=index=>'Arden'+String.fromCharCode(97+Math.floor(index/26))+String.fromCharCode(97+index%26);
  const bulk=Array.from({length:57},(_,index)=>`A claim (${family(index%51)}, 2020).`).join('\n\n')+'\n\n## References\n\n'+Array.from({length:51},(_,index)=>`${family(index)}, A. (2020). Study ${index}. Journal, 1(1), 1–2.`).join('\n');
  if(await page.locator('#source').isHidden())await page.locator('#input-details>summary').click();await page.locator('#source').fill(bulk);
  await page.waitForFunction(()=>document.querySelectorAll('[data-review-group]').length===57&&document.getElementById('lookup-pending-number').textContent==='51');assert.equal(await page.locator('#lookup-review-number').textContent(),'0');
  const states=await page.locator('.completion-status').allTextContents();assert.ok(states.filter(text=>text==='Looking up…').length<=8);assert.ok(states.includes('Queued'));assert.equal(await page.locator('#errors').textContent(),'');
 }finally{await context.close();}
 console.log('Review navigation skips machine work and clear matches; stacked counters count and jump to genuine decisions within contained disclosures.');
}
