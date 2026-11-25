import assert from "node:assert/strict";
import { join } from "node:path";
import { makeCache } from "../src/records.mjs";
import { compileCitations } from "../src/compiler.mjs";

export async function checkReaderAccess(browser, origin, evidence) {
  const context = await browser.newContext({ viewport: { width: 1280, height: 900 }, hasTouch: true, permissions: ["clipboard-read", "clipboard-write"] });
  try {
    const page = await context.newPage();
    page.setDefaultTimeout(5000);
    const errors = [];
    page.on("pageerror", error => errors.push(error.message));
    await page.goto(origin + "/demos/static/#access-preview");
    const reader = page.locator("#access-demo-reader");
    const trigger = reader.locator('a[data-ci-record="harbor-handbook"][id]').first();
    await trigger.getAttribute("role");
    await page.waitForFunction(() => document.querySelector("#access-demo-reader a[data-ci-record]").getAttribute("role") === "button");
    const requests = [];
    page.on("request", request => requests.push(request.url()));
    await trigger.press("Enter");
    const panel = reader.getByRole("dialog", { name: "Source and access" });
    await panel.waitFor();
    await panel.getByRole("link", { name: "Download PDF" }).waitFor();
    assert.equal(await panel.locator('[data-citation-part="access-more"]').count(),0);
    await reader.evaluate(element=>element.configureAccess({accessCollapseAfter:0}));
    const more = panel.locator('[data-citation-part="access-more"]');
    assert.equal(await more.locator("summary").textContent(), "More options (2)");
    await panel.getByRole("button", { name: /Choose your library or reading services/ }).click();
    const settings = reader.getByRole("dialog", { name: "Where you can read" });
    if (evidence) await page.screenshot({ path: join(evidence, "reader-access-settings.png") });
    await settings.getByRole("checkbox", { name: "JSTOR", exact: true }).check();
    await settings.getByRole("radio", { name: "JSTOR", exact: true }).check();
    await settings.getByRole("button", { name: "Save", exact: true }).click();
    await settings.waitFor({ state: "detached" });
    await panel.getByRole("link", { name: "Find at JSTOR", exact: true }).waitFor();
    assert.equal(await panel.locator('[data-citation-part="access-more"] summary').textContent(), "More options (1)");
    assert.equal(await page.locator("#access-profile-state").textContent(), "jstor");
    await panel.getByRole("button", { name: "Copy citation" }).click();
    assert(!(await page.evaluate(() => navigator.clipboard.readText())).includes("jstor-handbook"));
    await page.keyboard.press("Escape");
    const title = reader.locator("li em").filter({ hasText: "Harbor field handbook" });
    assert.equal(await title.getByRole("link").getAttribute("href"), "https://example.org/handbook.pdf");
    assert.match(await title.textContent(), /at Example archive/);

    await page.reload();
    await page.waitForFunction(() => document.getElementById("access-profile-state").textContent === "jstor");
    const configured = await page.evaluate(async () => {
      const { setAccessProfile, getAccessProfile } = await import("/dist/citation-inspector.mjs");
      const inspector = document.querySelector("#access-demo-reader");
      let state;
      inspector.addEventListener("access-profile-changed", event => { state = event.detail.state; });
      setAccessProfile({ services: [] });
      return { profile: getAccessProfile(), state };
    });
    assert.deepEqual(configured.state, "none");
    await trigger.click();
    await panel.getByRole("button", { name: /Edit your library or reading services/ }).click();
    await settings.getByRole("button", { name: "Clear settings" }).click();
    await settings.waitFor({ state: "detached" });
    assert.equal(await page.locator("#access-profile-state").textContent(), "Not set");
    await page.keyboard.press("Escape");
    await panel.waitFor({ state: "hidden" });

    await page.evaluate(async () => {
      const { initializeCitationInspector, setAccessProfile } = await import("/dist/citation-inspector.mjs");
      const inspector = document.querySelector("#access-demo-reader");
      initializeCitationInspector(inspector, {
        accessSettings: "host", accessCollapseAfter:0, strings: {
          "access.help.unknown": "Choose access", "access.more": { one: "{count} other place", other: "{count} other places" }
        }
      });
      inspector.addEventListener("access-settings-request", event => { event.preventDefault(); window.requestedAccess = event.cancelable; });
      setAccessProfile(null);
    });
    await trigger.click();
    await panel.getByRole("button", { name: "Choose access" }).click();
    assert.equal(await page.evaluate(() => window.requestedAccess), true);
    assert.equal(await settings.count(), 0);
    assert.equal(await panel.locator('[data-citation-part="access-more"] summary').textContent(), "2 other places");
    await page.keyboard.press("Escape");

    await page.evaluate(async () => {
      const { setAccessProfile } = await import("/dist/citation-inspector.mjs");
      setAccessProfile({ services: [], library: { kind: "openurl", base: "https://library.example/resolve?" } });
    });
    await trigger.click();
    const library = panel.getByRole("link", { name: "Through my library", exact: true });
    assert.equal(new URL(await library.getAttribute("href")).searchParams.get("rft.btitle"), "Harbor field handbook");
    await page.keyboard.press("Escape");

    const media = page.locator("#media-demo-reader");
    await media.getByRole("button", { name: "Inspect reference: A study of the harbor" }).click();
    const artwork = media.getByRole("dialog", { name: "Artwork and rights" });
    await artwork.getByRole("link", { name: "CC BY-SA 4.0" }).waitFor();
    await artwork.getByText(/Attributed to · 1830\/34/).waitFor();
    await artwork.getByText("uploader · Example uploader", { exact: true }).waitFor();
    await artwork.getByRole("button", { name: "Copy Example archive · served · sha256" }).click();
    await page.waitForFunction(async () => await navigator.clipboard.readText() === "b".repeat(64));
    if (evidence) {
      await artwork.evaluate(node => { node.scrollTop = 0; });
      await page.screenshot({ path: join(evidence, "reader-media.png") });
    }
    const fixtureCache = makeCache([{
      id: "two-copies", type: "book", state: "resolved", title: "Two copies", authors: [{ literal: "Archive" }], issued: [2020],
      locations: [
        { kind: "pdf", provider: "First", access: "open", verifiedAt: "2026-11-01T00:00:00Z", url: "https://example.org/first.pdf" },
        { kind: "pdf", provider: "Second", access: "open", verifiedAt: "2026-11-01T00:00:00Z", url: "https://example.org/second.pdf" },
        { kind: "library", provider: "Hathi Trust", service: "hathi-trust", url: "https://example.org/hathi" },
        { kind: "library", provider: "JSTOR", service: "jstor", url: "https://example.org/jstor" }
      ]
    }, {
      id: "nature", type: "article-journal", state: "resolved", title: "Nature",
      authors: [{ literal: "Nature" }], issued: [2020], containerTitle: "Journal",
      locations: [{ kind: "full-text", provider: "Perlego", service: "perlego", access: "subscription", url: "https://example.org/preferred" }]
    }]);
    const fixture = compileCitations("{cite two-copies; nature}", fixtureCache, { namespace: "fixture", citationStyle: "chicago-author-date" });
    await page.route(origin + "/access-fixture.html", route => route.fulfill({
      contentType: "text/html",
      body: `<!doctype html><html lang="en"><head><meta charset="utf-8"><title>Access fixture</title>
      <link rel="stylesheet" href="/dist/citation-inspector.css"></head><body>
      <citation-inspector id="fixture">${fixture.html}</citation-inspector>
      <script type="module">
        import { initializeCitationInspector, setAccessProfile } from "/dist/citation-inspector.mjs";
        setAccessProfile({ services: ["jstor", "perlego"], preferred: "perlego" });
        initializeCitationInspector(document.getElementById("fixture"), {
          cache: ${JSON.stringify(fixtureCache)},
          accessCatalog: [{ id: "jstor", label: "Translated JSTOR" }, { id: "hathi-trust", label: "Hathi Trust", kind: "library" }]
        });
      </script></body></html>`
    }));
    await page.goto(origin + "/access-fixture.html");
    const root = page.locator("#fixture");
    const copiesTrigger = page.locator("#fixture-cite-two-copies-1");
    await page.waitForFunction(() => document.getElementById("fixture-cite-two-copies-1").getAttribute("role") === "button");
    await copiesTrigger.press("Enter");
    const copiesPanel = root.getByRole("dialog", { name: "cite.inator" });
    assert.equal(await copiesPanel.getByRole("link", { name: "Download PDF", exact: true }).count(), 2);
    await copiesPanel.getByRole("link", { name: "Find at Translated JSTOR", exact: true }).waitFor();
    await page.keyboard.press("Escape");
    const articleNote = page.locator("#fixture-note-nature");
    assert.equal(await articleNote.getByRole("link", { name: "Nature at Perlego", exact: true }).getAttribute("href"), "https://example.org/preferred");
    assert.match(await articleNote.locator(":scope > span").first().evaluate(node => node.firstChild.textContent), /^Nature\. 2020\. “/);

    await root.evaluate(node => { node.hiddenProviders = ["jstor", "hathi-trust"]; });
    await page.waitForFunction(() => !document.querySelector('#fixture-note-two-copies a[href="https://example.org/jstor"]'));
    assert.equal(await page.locator('#fixture-note-two-copies a[href="https://example.org/hathi"]').count(), 0);
    await root.evaluate(node => { node.hiddenProviders = []; });
    await page.waitForFunction(() => document.querySelector('#fixture-note-two-copies a[href="https://example.org/jstor"]'));
    const noteActions = page.locator('#fixture-note-two-copies [data-ci-note-record]');
    await noteActions.getByRole("button", { name: "Change reading services", exact: true }).click();
    const noteSettings = root.getByRole("dialog", { name: "Where you can read" });
    await noteSettings.getByRole("button", { name: "Clear settings" }).click();
    await noteSettings.waitFor({ state: "detached" });
    assert.equal(await root.locator('[data-citation-part="access-list-help"]').getByRole("button", { name: /Choose your library or reading services/ }).evaluate(node => node === document.activeElement), true);
    await page.setViewportSize({ width: 390, height: 850 });
    assert.equal(await root.locator('[data-citation-part="access-list-help"]').count(),1);
    assert.equal(await root.locator('li [data-citation-part="access-help"]').count(),0);
    await root.locator('[data-citation-part="access-list-help"]').getByRole("button", { name: /Choose your library or reading services/ }).tap();
    await noteSettings.waitFor();
    assert((await noteSettings.boundingBox()).width <= 390);
    if (evidence) await page.screenshot({ path: join(evidence, "reader-access-narrow.png") });
    await page.keyboard.press("Escape");
    await noteSettings.waitFor({ state: "detached" });

    // An ancestor host list must never become an insertion target outside the component.
    await root.evaluate(element => {
      const ambient=document.createElement('ol');ambient.id='ambient-host-list';
      const hostItem=document.createElement('li');ambient.append(hostItem);element.before(ambient);hostItem.append(element);
      const reference=document.createElement('div');reference.id='standalone-reference';reference.dataset.ciReferenceRecord='two-copies';reference.textContent='Standalone reference';element.append(reference);
    });
    await root.locator('#standalone-reference [data-citation-part="access-help"]').waitFor();
    assert.equal(await page.locator('body > [data-citation-part="access-list-help"]').count(),0);
    assert.equal(await page.evaluate(()=>[...document.querySelectorAll('[data-citation-part="access-list-help"]')].every(node=>node.closest('citation-inspector'))),true);

    assert.deepEqual(errors, []);
    assert(requests.every(url => url.startsWith(origin)));
    console.log("Reader profile sync, restoration, unknown/none, grouping, host settings, title destinations, library links, media rights and checksums passed.");
  } finally { await context.close(); }
}
