import assert from "node:assert/strict";
import { join } from "node:path";
import { compileCitations } from "../src/compiler.mjs";
import { makeCache } from "../src/records.mjs";

export async function checkInspectIcons(browser, origin, evidence) {
  const context = await browser.newContext({ viewport: { width: 800, height: 600 } });
  const page = await context.newPage();
  page.setDefaultTimeout(5000);
  const violations = [];
  const cache = makeCache([{ id: "work", type: "book", title: "A reading", authors: [{ family: "Author" }], issued: [2020], state: "resolved" }]);
  const { html } = compileCitations("{citation list work}\n\n{citation list work}", cache, {
    namespace: "inspect", inspectAppearance: "icon", inspectPlacement: "before", inspectIcon: "/mask-book.svg", inspectIconMode: "mask"
  });
  try {
    await page.route(origin + "/mask-book.svg", route => route.fulfill({
      contentType: "image/svg+xml",
      body: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path fill="black" d="M2 2h20v20H2z"/></svg>'
    }));
    await page.route(origin + "/inspect-icons.html", route => route.fulfill({
      contentType: "text/html",
      headers: { "Content-Security-Policy": "default-src 'none'; script-src 'self'; style-src 'self'; img-src 'self'; connect-src 'self'" },
      body: `<!doctype html><html lang="en"><head><meta charset="utf-8"><title>Inspect icons</title>
      <link rel="stylesheet" href="/dist/citation-inspector.css">
      <script type="module" src="/inspect-fixture.mjs"></script></head><body><h1>Readings</h1>
      <citation-inspector id="reader" access-settings="off">${html}</citation-inspector></body></html>`
    }));
    await page.route(origin + "/inspect-fixture.mjs", route => route.fulfill({
      contentType: "text/javascript",
      body: `import { initializeCitationInspector } from "/dist/citation-inspector.mjs";
      document.addEventListener("securitypolicyviolation", event => console.error("CSP " + event.violatedDirective));
      window.inspectFixtureCache = ${JSON.stringify(cache)};
      initializeCitationInspector(document.getElementById("reader"), { cache: window.inspectFixtureCache });`
    }));
    page.on("console", message => { if (message.text().startsWith("CSP ")) violations.push(message.text()); });
    await page.goto(origin + "/inspect-icons.html");
    const inspect = page.getByRole("button", { name: "Inspect reference: A reading", exact: true });
    await inspect.first().waitFor();
    assert.equal(await page.locator('[data-citation-part="note-actions"]').count(), 0);
    const masks = await page.locator("mask").evaluateAll(nodes => nodes.map(node => node.id));
    assert.equal(new Set(masks).size, 2);
    for (const theme of ["light", "dark"]) {
      await page.emulateMedia({ colorScheme: theme });
      await page.route(origin + "/inspect-theme.css?mode=" + theme, route => route.fulfill({
        contentType: "text/css",
        body: theme === "light"
          ? 'body { color: #172848; background: white; } citation-inspector { --citation-inline-color: #173f65; }'
          : 'body { color: white; background: #172848; } citation-inspector { --citation-inline-color: #f3bc41; }'
      }));
      await page.evaluate(href => {
        document.querySelector("#theme")?.remove();
        const style = document.createElement("link"); style.id = "theme"; style.rel = "stylesheet"; style.href = href;
        document.head.append(style);
      }, origin + "/inspect-theme.css?mode=" + theme);
      await page.waitForFunction(expected => getComputedStyle(document.querySelector("[data-ci-inspect-icon]")).color === expected,
        theme === "light" ? "rgb(23, 63, 101)" : "rgb(243, 188, 65)");
      const fill = await inspect.first().locator("rect").evaluate(node => getComputedStyle(node).fill);
      assert.equal(fill, theme === "light" ? "rgb(23, 63, 101)" : "rgb(243, 188, 65)");
      assert.equal(await inspect.first().locator("mask").evaluate(node => getComputedStyle(node).maskType), "alpha");
      await inspect.first().focus();
      if (evidence) await inspect.first().screenshot({ path: join(evidence, "inspect-mask-" + theme + ".png") });
    }
    await page.evaluate(() => {
      const cache = structuredClone(window.inspectFixtureCache);
      cache.records[0].locations = [{ kind: "publisher", provider: "Example", url: "https://example.org/work" }];
      document.getElementById("reader").cache = cache;
    });
    await page.waitForFunction(() => document.querySelectorAll('[data-citation-part="note-actions"]').length === 2);
    await page.evaluate(() => { document.getElementById("reader").cache = window.inspectFixtureCache; });
    await page.waitForFunction(() => document.querySelectorAll('[data-citation-part="note-actions"]').length === 0);
    await inspect.first().press("Enter");
    const panel = page.getByRole("dialog", { name: "citation.inator" });
    await panel.waitFor();
    await page.keyboard.press("Escape");
    assert(await inspect.first().evaluate(node => document.activeElement === node));
    assert.deepEqual(violations, []);
    console.log("Leading inspect icons omit blank actions, inherit light/dark colour, keep accessible names and pass strict CSP.");
  } finally { await context.close(); }
}
