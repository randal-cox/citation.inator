import assert from 'node:assert/strict';
export async function checkImportWindows(browser,origin){
 const context=await browser.newContext({viewport:{width:1280,height:1000}}),page=await context.newPage();page.setDefaultTimeout(6000);
 await page.route(/^https:\/\/(?:api\.crossref\.org|openlibrary\.org)\//,route=>route.abort());
 try{
  await page.goto(origin+'/demos/import/');await page.locator('[data-review-group="0"]').click();const panel=page.locator('#review-group-0'),content=panel.locator('.review-content'),handle=panel.getByRole('button',{name:'Resize citation popup'});
  const before=await panel.boundingBox();await page.mouse.move(before.x+8,before.y+70);await page.mouse.down();await page.mouse.move(before.x+108,before.y-50,{steps:8});await page.mouse.up();let moved=await panel.boundingBox();assert.ok(moved.x-before.x>=99);assert.ok(moved.y<before.y-50);
  await page.mouse.move(2,2);await page.waitForTimeout(350);assert.ok(await panel.isVisible());
  const corner=await handle.boundingBox();await page.mouse.move(corner.x+12,corner.y+12);await page.mouse.down();await page.mouse.move(corner.x+92,corner.y+52,{steps:8});await page.mouse.up();let resized=await panel.boundingBox();assert.ok(resized.width>=moved.width+79);assert.ok(resized.height>=moved.height+39);
  assert.ok(await handle.evaluate(n=>n===document.activeElement));await page.keyboard.press('ArrowLeft');const keyboard=await panel.boundingBox();assert.equal(Math.round(keyboard.width),Math.round(resized.width)-24);
  await panel.focus();await page.keyboard.press('Alt+ArrowUp');assert.ok((await panel.boundingBox()).y<keyboard.y);
  const text=panel.locator('.target-choice strong').first();const textBox=await text.boundingBox(),selectionBefore=await panel.boundingBox();await page.mouse.move(textBox.x+3,textBox.y+10);await page.mouse.down();await page.mouse.move(textBox.x+100,textBox.y+10,{steps:8});await page.mouse.up();assert.ok(await page.evaluate(()=>getSelection().toString().length>0));assert.deepEqual(await panel.boundingBox(),selectionBefore);
  await page.keyboard.press('Escape');await page.locator('[data-review-group="0"]').click();assert.equal(Math.round((await panel.boundingBox()).width),Math.round(keyboard.width));
  await page.setViewportSize({width:390,height:700});await page.waitForFunction(()=>{const r=document.querySelector('#review-group-0').getBoundingClientRect();return r.x>=11&&r.y>=11&&r.right<=379&&r.bottom<=689;});assert.ok(await panel.isVisible());const narrow=await panel.boundingBox();assert.ok(narrow.x>=11&&narrow.y>=11&&narrow.x+narrow.width<=379&&narrow.y+narrow.height<=689);assert.ok(await content.evaluate(n=>n.scrollHeight>n.clientHeight));
  await content.evaluate(n=>n.scrollTop=n.scrollHeight);assert.ok(await handle.isVisible());await page.keyboard.press('Escape');assert.ok(await panel.isHidden());
 }finally{await context.close();}
 console.log('Import popups drag, resize with pointer/keyboard, preserve text selection and geometry, and remain contained/scrollable on narrow screens.');
}
