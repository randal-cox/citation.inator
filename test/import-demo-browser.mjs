import assert from 'node:assert/strict';
import {join} from 'node:path';
export async function checkImportDemo(browser,origin,evidence) {
 const context=await browser.newContext({viewport:{width:1360,height:1000}});const page=await context.newPage();
 const errors=[],requests=[];page.on('pageerror',error=>errors.push(error.message));page.on('request',request=>requests.push(request.url()));
 try {
  await page.goto(origin+'/demos/import/');
  const bundle=await page.evaluate(async()=>{
   const tools=await import('/dist/citation-tools.mjs'),reader=await import('/dist/citation-inspector.mjs');
   const cache={schema:'citation-inator.cache.v1',records:[{id:'a',type:'book',state:'resolved',title:'Alpha',authors:[{family:'Avery'}],issued:[2021]},{id:'b',type:'book',state:'resolved',title:'Beta',authors:[{family:'Avery'}],issued:[2021]}]};
   const source='{citation a; b}';return {toolsKind:tools.markerKind('{citation list-2001}'),readerKind:reader.markerKind('{citation list-2001}'),legacy:tools.markerKind('{cite a}'),work:tools.annotateMarkers(source,cache,{citationStyle:'chicago-author-date',noteContext:'work'}).source,article:tools.annotateMarkers(source,cache,{citationStyle:'chicago-author-date'}).source};
  });
  assert.equal(bundle.toolsKind,'citation');assert.equal(bundle.readerKind,'citation');assert.equal(bundle.legacy,'citation');assert.equal((bundle.work.match(/note:"Avery 2021"/g)||[]).length,2);assert.match(bundle.article,/2021a/);assert.match(bundle.article,/2021b/);
  const original=await page.locator('#source').inputValue();
  await page.locator('[data-review-group="3"]').waitFor();
  assert.equal(await page.locator('[data-review-group="0"]').getAttribute('data-review-state'),'needs-review');assert.equal(await page.locator('[data-review-group="2"]').getAttribute('data-review-state'),'selected');assert.equal(await page.locator('#review-group-2').getAttribute('data-automatic'),'true');assert.ok(await page.locator('#review-group-2 input[value="bennett"]').isChecked());
  await page.locator('#load-example').focus();await page.locator('[data-review-group="0"]').hover();await page.keyboard.press('ArrowRight');assert.ok(await page.locator('#load-example').evaluate(node=>node===document.activeElement));
  await page.locator('[data-review-group="0"]').hover();await page.locator('#review-group-0').waitFor({state:'visible'});
  assert.ok(await page.locator('#review-group-0').getByText('How children learn together',{exact:true}).isVisible());assert.ok(await page.locator('#review-group-0').getByText('Learning through play',{exact:true}).isVisible());
  assert.match(await page.locator('#review-group-0').textContent(),/2 suggested targets/);assert.doesNotMatch(await page.locator('#review-group-0').textContent(),/Context:|cannot choose/);assert.equal(await page.locator('.supplied-bibliography').getAttribute('open'),null);
  assert.equal(await page.locator('#review-group-0 button').count(),2);
  assert.equal(await page.locator('#review-group-0').getByRole('button',{name:'Previous red citation',exact:true}).isDisabled(),true);
  await page.locator('#review-group-0').getByRole('button',{name:'Next red citation',exact:true}).click();await page.locator('#review-group-1').waitFor({state:'visible'});
  await page.keyboard.press('ArrowRight');await page.locator('#review-group-3').waitFor({state:'visible'});
  assert.equal(await page.locator('#review-group-3').getByRole('button',{name:'Next red citation',exact:true}).isDisabled(),true);
  await page.keyboard.press('ArrowLeft');await page.locator('#review-group-1').waitFor({state:'visible'});await page.keyboard.press('ArrowLeft');await page.locator('#review-group-0').waitFor({state:'visible'});
  await page.locator('#target-0-0-0').check();assert.equal(await page.locator('[data-review-group="0"]').getAttribute('data-review-state'),'selected');
  await page.locator('#target-0-0-0').press('ArrowDown');assert.ok(await page.locator('#target-0-0-1').isChecked());assert.ok(await page.locator('#review-group-0').isVisible());
  await page.locator('#target-0-0-1').press('ArrowRight');await page.locator('#review-group-1').waitFor({state:'visible'});assert.ok(await page.locator('#target-0-0-1').isChecked());await page.keyboard.press('ArrowLeft');assert.ok(await page.locator('#review-group-1').isVisible());
  await page.locator('[data-review-group="0"]').click();await page.locator('#skip-0-0').check();assert.equal(await page.locator('[data-review-group="0"]').getAttribute('data-review-state'),'kept');
  await page.locator('#skip-0-0').press('ArrowRight');await page.locator('#review-group-1').waitFor({state:'visible'});assert.ok(await page.locator('#skip-0-0').isChecked());
  for(const [index,id] of [[0,'avery-gardens'],[1,'avery-fields'],[2,'bennett']]){await page.keyboard.press('Escape');await page.locator(`[data-review-group="${index}"]`).click();await page.locator(`#review-group-${index} input[type=radio][value="${id}"]`).check();assert.equal(await page.locator(`[data-review-group="${index}"]`).getAttribute('data-review-state'),'selected');}
  await page.getByRole('button',{name:'Preview accepted changes'}).click();await page.locator('#output-section').waitFor({state:'visible'});
  const output=await page.locator('#output').inputValue();assert.match(output,/local:avery-gardens/);assert.match(output,/local:avery-fields/);assert.ok(output.includes('(Unknown, 2001)'));assert.equal(await page.locator('#source').inputValue(),original);
  const downloadPromise=page.waitForEvent('download');await page.getByRole('button',{name:'Download text',exact:true}).click();const download=await downloadPromise;const stream=await download.createReadStream();const chunks=[];for await(const chunk of stream)chunks.push(chunk);assert.equal(Buffer.concat(chunks).toString('utf8'),output);
  const reader=page.locator('#reading-preview');const trigger=reader.locator('a[data-ci-record][id]').first();await trigger.press('Enter');await reader.getByRole('dialog',{name:'citation.inator',exact:true}).waitFor();await page.keyboard.press('Escape');
  if(evidence)await page.screenshot({path:join(evidence,'import-review-desktop.png'),fullPage:true});
  await page.locator('#input-details > summary').click();await page.locator('#source').fill(original+' changed');assert.equal(await page.locator('#preview').isDisabled(),true);assert.equal(await page.locator('#output-section').isHidden(),true);assert.equal(await page.locator('.citation-group').count(),0);assert.equal(await page.locator('#evidence').isHidden(),true);
  await page.locator('#example').selectOption('numeric');await page.getByRole('button',{name:'Load example'}).click();await page.locator('[data-review-group="3"]').waitFor();
  await page.locator('[data-review-group="2"]').click();await page.locator('#manual-2-1').check();await page.locator('#review-group-2 fieldset[data-item="0"] input[value="two"]').check();assert.equal(await page.locator('#review-group-2').getAttribute('data-action'),'defer');await page.locator('#review-group-2 fieldset[data-item="1"] input[value="seven"]').check();assert.equal(await page.locator('[data-review-group="2"]').getAttribute('data-review-state'),'selected');await page.locator('#skip-2-0').check();assert.equal(await page.locator('#review-group-2').getAttribute('data-action'),'reject');await page.locator('#target-2-0-0').check();
  await page.getByRole('button',{name:'Preview accepted changes'}).click();await page.locator('#output-section').waitFor({state:'visible'});assert.match(await page.locator('#output').inputValue(),/local:two; local:seven/);assert.match(await page.locator('#preview-notice').textContent(),/withheld/);assert.equal(await page.locator('#reading-preview').textContent(),'');
  await page.setViewportSize({width:390,height:844});await page.emulateMedia({colorScheme:'dark'});assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=window.innerWidth),true);
  if(evidence)await page.screenshot({path:join(evidence,'import-review-phone-dark.png'),fullPage:true});
  if(!await page.locator('#input-details').getAttribute('open') && await page.locator('#records').isHidden())await page.locator('#input-details > summary').click();
  await page.locator('#records').fill('{broken');await page.getByRole('button',{name:'Analyze citations',exact:true}).click();await page.waitForFunction(()=>document.getElementById('errors').textContent.length>0);assert.equal(await page.locator('#preview').isDisabled(),true);
  await page.locator('#example').selectOption('apa');await page.getByRole('button',{name:'Load example'}).click();await page.locator('[data-review-group="3"]').waitFor();
  await page.locator('[data-review-group="3"]').click();await page.locator('#identifier-3-0').fill('9780140328722');
  await page.getByRole('button',{name:'Preview accepted changes'}).click();await page.waitForFunction(()=>document.getElementById('errors').textContent.includes('valid'));assert.equal(await page.locator('#output-section').isHidden(),true);
  await page.locator('[data-review-group="3"]').click();await page.locator('#identifier-3-0').fill('978-0-14-032872-1');
  await page.locator('[data-review-group="0"]').click();await page.locator('#skip-0-0').check();assert.equal(await page.locator('[data-review-group="0"]').getAttribute('data-review-state'),'kept');
  await page.getByRole('button',{name:'Preview accepted changes'}).click();await page.locator('#output-section').waitFor({state:'visible'});assert.match(await page.locator('#output').inputValue(),/isbn:9780140328721/);assert.ok((await page.locator('#output').inputValue()).includes('(Avery, 2021)'));assert.match(await page.locator('#outcome-notes').textContent(),/not been looked up/);
  await page.locator('[data-review-group="0"]').press('Enter');await page.locator('#review-group-0').waitFor({state:'visible'});await page.keyboard.press('Tab');assert.ok(await page.locator('#review-group-0 [data-direction="1"]').evaluate(node=>node===document.activeElement));
  await page.locator('#example').selectOption('undated');await page.getByRole('button',{name:'Load example'}).click();await page.locator('[data-review-group="1"]').waitFor();assert.equal(await page.locator('[data-review-group="0"]').getAttribute('data-review-state'),'needs-review');assert.equal(await page.locator('#review-group-0 input[type=radio]:checked').count(),0);assert.equal(await page.locator('[data-review-group="1"]').getAttribute('data-review-state'),'selected');
  await page.locator('[data-review-group="0"]').click();await page.locator('#identifier-0-0').fill('doi:10.1234/example');await page.locator('#identifier-0-0').press('ArrowLeft');assert.ok(await page.locator('#identifier-0-0').evaluate(node=>node===document.activeElement));assert.ok(await page.locator('#review-group-0').isVisible());await page.locator('#identifier-0-0').press('Enter');assert.equal(await page.locator('[data-review-group="0"]').getAttribute('data-review-state'),'selected');
  await page.locator('#example').selectOption('real');await page.getByRole('button',{name:'Load example'}).click();await page.locator('[data-review-group="2"]').waitFor();assert.equal(await page.locator('[data-review-state="selected"]').count(),3);assert.ok(JSON.parse(await page.locator('#records').inputValue()).every(record=>record.identifiers.length===0));assert.match(await page.locator('#review-intro').textContent(),/Real publications/);assert.ok(!requests.some(url=>url.includes('answer-key')));
  const denied=await page.request.post(origin+'/demos/import/review',{headers:{Origin:'https://other.invalid'},data:{source:'',records:[]}});assert.equal(denied.status(),403);
  assert.deepEqual(errors,[]);assert.ok(requests.every(url=>url.startsWith(origin)));
 }finally{await context.close();}
 console.log('Import demo passed automatic example analysis, hover opening, explicit decisions, group completeness, source preservation, stale UI, numeric labels, bundle compatibility, narrow dark layout and local-only requests.');
}
