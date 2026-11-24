import assert from "node:assert/strict";
import { join } from "node:path";

export async function checkStructuredDemo(browser, url, compact, evidence) {
  const viewport = { width: compact ? 390 : 1280, height: 850 };
  const context = await browser.newContext({ viewport, hasTouch: compact });
  const staticContext = await browser.newContext({ viewport, javaScriptEnabled: false });
  try {
    const page = await context.newPage();
    await page.goto(url + "#structured-preview");
    const demo = page.getByRole("region", { name: /Programmatic citations/ });
    const reader = demo.locator("#structured-reader");
    const captions = reader.getByRole("button", { name: "Inspect citation: 1991–2020 normals", exact: true });
    await captions.nth(1).waitFor();
    const noteHash = await captions.first().getAttribute("href");
    assert.equal(await captions.nth(1).getAttribute("href"), noteHash);
    const note = demo.locator(noteHash);
    assert.equal(await note.getByRole("link", { name: "Return to Map caption" }).count(), 1);
    assert.equal(await note.getByRole("link", { name: "Return to Table caption" }).count(), 1);
    if (evidence && !compact) await demo.screenshot({ path: join(evidence, "structured-preview.png") });
    await page.evaluate(() => document.documentElement.style.setProperty("--citation-paper", "#f5f0df"));
    const requests = [];
    page.on("request", request => requests.push(request.url()));
    const activate = async locator => compact ? locator.tap() : locator.press("Enter");
    await activate(captions.nth(1));
    const panel = reader.getByRole("dialog", { name: "Climate sources" });
    const otherLocations = panel.locator('[data-citation-part="access-more"] summary');
    if (await otherLocations.count()) await otherLocations.click();
    await panel.getByText("Collection code: CLIMATE-NORMALS (Demo catalog)").waitFor();
    assert.equal(await panel.evaluate(node => getComputedStyle(node).backgroundColor), "rgb(245, 240, 223)");
    assert.match(await panel.getByRole("link", { name: /Read online/ }).getAttribute("href"), /ncei\.noaa\.gov/);
    await panel.getByRole("button", { name: "Go to endnote" }).click();
    assert.equal(await note.evaluate(node => node === document.activeElement), true);
    await note.getByRole("link", { name: "Return to Table caption" }).click();
    assert.equal(await captions.nth(1).evaluate(node => node === document.activeElement), true);
    await activate(reader.getByRole("button", { name: "Inspect citation: Station relocation log" }));
    await panel.getByText("Unresolved", { exact: true }).waitFor();
    assert.equal(await panel.getByRole("link", { name: /Read online/ }).count(), 0);
    await page.keyboard.press("Escape");
    await panel.waitFor({ state: "hidden" });

    const mainBackground = await page.locator("main").evaluate(node => getComputedStyle(node).backgroundColor);
    await demo.getByRole("checkbox", { name: "Dark colors for this example" }).check();
    const open = demo.getByRole("button", { name: "Open map details" });
    await activate(open);
    const host = demo.getByRole("dialog", { name: "Map details" });
    const nested = host.getByRole("button", { name: "Inspect citation: 1991–2020 normals" });
    await activate(nested);
    const nestedPanel = host.getByRole("dialog", { name: "Map source" });
    await nestedPanel.waitFor();
    assert.equal(await nestedPanel.evaluate(node => getComputedStyle(node).backgroundColor), "rgb(22, 39, 48)");
    assert.match(await nestedPanel.evaluate(node => getComputedStyle(node).fontFamily), /^Georgia/);
    if (compact) {
      assert.equal(await nestedPanel.evaluate(node => getComputedStyle(node).borderTopLeftRadius), "20px");
      assert.equal(await nestedPanel.evaluate(node => getComputedStyle(node, "::backdrop").backgroundColor), "rgba(9, 27, 37, 0.65)");
    }
    assert.equal(await page.locator("main").evaluate(node => getComputedStyle(node).backgroundColor), mainBackground);
    if (evidence && compact) await page.screenshot({ path: join(evidence, "structured-preview-nested.png") });
    await page.keyboard.press("Escape");
    assert.equal(await host.isVisible(), true);
    assert.equal(await nested.evaluate(node => node === document.activeElement), true);
    await page.keyboard.press("Escape");
    await host.waitFor({ state: "hidden" });
    assert.equal(await open.evaluate(node => node === document.activeElement), true);

    await activate(captions.first());
    await panel.waitFor();
    await reader.evaluate(node => node.dismiss());
    assert.equal(await captions.first().evaluate(node => node === document.activeElement), true);

    await activate(captions.first());
    await panel.waitFor();
    await demo.evaluate(node => {
      const inspector = node.querySelector("#structured-reader");
      const heading = node.querySelector("h2");
      heading.tabIndex = -1;
      const destination = new URL(window.location.href);
      destination.searchParams.set("view", "table");
      history.pushState({}, "", destination);
      if (!inspector.hasAttribute("open")) throw new Error("Expected the retained inspector to stay open until the host dismisses it.");
      inspector.dismiss({ restoreFocus: false });
      heading.focus({ preventScroll: true });
    });
    await panel.waitFor({ state: "hidden" });
    assert.equal(new URL(page.url()).searchParams.get("view"), "table");
    assert.equal(await demo.getByRole("heading", { name: /Programmatic citations/ })
      .evaluate(node => node === document.activeElement), true);
    assert.equal(await captions.first().getAttribute("aria-expanded"), "false");

    await page.emulateMedia({ forcedColors: "active" });
    await activate(captions.first());
    await panel.waitFor();
    assert.equal(await panel.evaluate(node => matchMedia("(forced-colors: active)").matches && getComputedStyle(node).borderTopStyle === "solid"), true);
    await page.keyboard.press("Escape");
    assert.deepEqual(requests, []);

    const staticPage = await staticContext.newPage();
    await staticPage.goto(url + "#structured-preview");
    const staticReader = staticPage.locator("#structured-reader");
    const table = staticReader.getByRole("link", { name: "1991–2020 normals", exact: true }).nth(1);
    await table.click();
    assert.equal(new URL(staticPage.url()).hash, noteHash);
    await staticReader.locator(noteHash).getByRole("link", { name: "Return to Table caption" }).click();
    assert.equal(new URL(staticPage.url()).hash, "#" + await table.getAttribute("id"));
    await staticReader.getByRole("link", { name: "Station relocation log", exact: true }).click();
    assert.match(await staticReader.locator(":target").textContent(), /Unresolved/);
    assert.equal(await staticPage.getByRole("button", { name: "Open map details" }).count(), 0);
  } finally {
    await context.close();
    await staticContext.close();
  }
}
