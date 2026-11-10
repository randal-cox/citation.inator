import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { once } from "node:events";
import { mkdir, mkdtemp, cp, readFile, rm, writeFile } from "node:fs/promises";
import { createServer } from "node:http";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { chromium } from "playwright-core";
import axe from "axe-core";

const executablePath = process.env.CITATION_CHROME || "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
const evidence = process.env.CITATION_EVIDENCE;
const temporary = await mkdtemp(join(tmpdir(), "citation-copied-"));
const csp = "default-src 'none'; script-src 'self'; style-src 'self'; connect-src 'self'; base-uri 'none'";
const copyHost = createServer(async (request, response) => {
  const path = new URL(request.url, "http://127.0.0.1").pathname.slice(1) || "index.html";
  const types = { html: "text/html", css: "text/css", mjs: "text/javascript", json: "application/json" };
  const type = types[path.split(".").at(-1)];
  try {
    if (!type || !/^[\w.-]+$/.test(path)) throw new Error("unknown path");
    const contents = await readFile(join(temporary, path));
    response.writeHead(200, { "Content-Type": type + "; charset=utf-8", "Content-Security-Policy": csp });
    response.end(contents);
  } catch {
    response.writeHead(404).end();
  }
});
const demo = spawn(process.execPath, ["scripts/serve.mjs"], { env: { ...process.env, CITATION_PORT: "0", CITATION_CACHE_DIR: join(temporary, "provider-cache") }, stdio: ["ignore", "pipe", "inherit"] });
let browser;
try {
  const [stdout] = await Promise.race([
    once(demo.stdout, "data"),
    once(demo, "exit").then(([status]) => { throw new Error(`Demo server exited with status ${status}.`); })
  ]);
  const origin = stdout.toString().match(/http:\/\/127\.0\.0\.1:\d+/)?.[0];
  assert.ok(origin);
  await cp(process.env.CITATION_DROP_IN_DIR || "demos/christopher-drop-in", temporary, { recursive: true });
  for (const name of ["adversaries.html", "adversaries.json", "hostile.css"]) {
    const contents = await readFile(`demos/static/${name}`, "utf8");
    await writeFile(join(temporary, name), name.endsWith(".html") ? contents.replaceAll("../../dist/", "./") : contents);
  }
  for (const name of ["citation-inspector.mjs", "citation-inspector.css"]) {
    assert.deepEqual(await readFile(join(temporary, name)), await readFile(`dist/${name}`));
  }
  await once(copyHost.listen(0, "127.0.0.1"), "listening");
  const copied = `http://127.0.0.1:${copyHost.address().port}`;
  if (evidence) await mkdir(evidence, { recursive: true });
  browser = await chromium.launch({ executablePath, headless: true, args: ["--no-first-run"] });
  console.log(`Chrome ${browser.version()}`);
  const context = await browser.newContext({ permissions: ["clipboard-read", "clipboard-write"], viewport: { width: 1440, height: 960 }, reducedMotion: "reduce" });
  const page = await context.newPage();
  page.setDefaultTimeout(5000);
  const errors = [];
  const requests = [];
  page.on("pageerror", error => errors.push(error.message));
  page.on("request", request => requests.push(request.url()));
  await page.addInitScript(() => {
    window.violations = [];
    document.addEventListener("securitypolicyviolation", event => window.violations.push(event.violatedDirective));
  });

  const primary = page.locator(".citation-cite").first();
  const panel = page.getByRole("dialog", { name: "citation.inator" });
  const dialogHeading = panel.getByRole("heading", { name: "citation.inator", exact: true });
  const report = async label => {
    await page.evaluate(axe.source);
    const findings = await page.evaluate(async () => {
      const result = await window.axe.run(document, { runOnly: ["wcag2a", "wcag2aa", "wcag21aa"] });
      return result.violations.map(issue => ({ id: issue.id, nodes: issue.nodes.map(node => node.target) }));
    });
    assert.deepEqual(findings, [], label);
  };

  await page.goto(origin + "/demos/static/");
  await primary.and(page.getByRole("button")).waitFor();
  await primary.click();
  await panel.waitFor();
  const pdf = panel.getByRole("link", { name: "Download PDF (author preprint)" });
  assert.equal(await pdf.getAttribute("download"), "");
  assert.match(await pdf.getAttribute("title"), /https:\/\/scottaclifford.com\//);
  const publisher = panel.getByRole("link", { name: "Open publisher page" });
  assert.equal(await publisher.getAttribute("target"), "_blank");
  assert.match(await publisher.getAttribute("title"), /https:\/\/www.cambridge.org\//);
  assert.ok(await panel.getByText("Abstract excerpt", { exact: true }).isVisible());
  assert.ok(await panel.getByText(/marked increase in partisan social polarization/).isVisible());
  if (evidence) await page.screenshot({ path: join(evidence, "reading-room.png") });
  await page.keyboard.press("Escape");
  const enableHover = page.getByRole("checkbox", { name: "Hover" });
  const style = page.getByLabel("Style");
  const hostAppearance = () => page.evaluate(() => ["html", ".site", "h1", ".intro", ".reading", "footer.site"].map(selector => {
    const css = getComputedStyle(document.querySelector(selector));
    return [css.color, css.backgroundColor, css.fontFamily, css.borderColor];
  }));
  const baseAppearance = await hostAppearance();
  const menu = page.getByRole("navigation", { name: "Demos" });
  assert.equal(await menu.getByRole("link").last().textContent(), "Guide");
  assert.equal(await menu.getByRole("link", { name: "Guide" }).evaluate(node => getComputedStyle(node).borderInlineStartWidth), "1px");
  await enableHover.check();
  await style.selectOption("field");
  assert.deepEqual(await hostAppearance(), baseAppearance);
  assert.match(await page.locator(".citation-endnotes").evaluate(node => getComputedStyle(node).fontFamily), /Georgia/);
  const countBeforeHover = requests.length;
  await primary.hover();
  await panel.waitFor();
  assert.equal(await primary.evaluate(node => node !== document.activeElement), true);
  assert.equal(await panel.evaluate(node => node.getRootNode().activeElement === null), true);
  const hoverBox = await panel.boundingBox();
  await page.mouse.move(hoverBox.x + 24, hoverBox.y + 30, { steps: 20 });
  await page.waitForTimeout(500);
  assert.ok(await panel.isVisible(), "hover pane must persist when entered");
  await page.mouse.move(10, 10);
  await panel.waitFor({ state: "hidden" });
  assert.equal(requests.length, countBeforeHover);
  await primary.hover();
  await panel.waitFor();
  await primary.click();
  await page.mouse.move(10, 10);
  await page.waitForTimeout(500);
  assert.ok(await panel.isVisible(), "click pins a hover pane");
  await page.keyboard.press("Escape");
  await primary.hover();
  await panel.waitFor();
  const start = await panel.boundingBox();
  const padding = await panel.locator(".citation-panel-content").boundingBox();
  const startX = padding.x + 5;
  const startY = padding.y + 26;
  await page.mouse.move(startX, startY, { steps: 15 });
  await page.mouse.down();
  await page.mouse.move(startX - 150, startY - 70, { steps: 15 });
  await page.mouse.up();
  const moved = await panel.boundingBox();
  const selectable = await panel.locator(".citation-abstract").evaluate(node => {
    const range = node.ownerDocument.createRange();
    range.setStart(node.firstChild, 0);
    range.setEnd(node.firstChild, 20);
    const { left, top, right, height } = range.getBoundingClientRect();
    return { x: left + 1, y: top + height / 2, end: right };
  });
  await page.mouse.move(selectable.x, selectable.y);
  await page.mouse.down();
  await page.mouse.move(selectable.end, selectable.y, { steps: 8 });
  await page.mouse.up();
  assert.match(await panel.evaluate(node => node.getRootNode().getSelection().toString()), /Over the past/);
  assert.ok(Math.abs((await panel.boundingBox()).x - moved.x) < 2);
  assert.ok(moved.x < start.x - 100 && moved.y < start.y - 45);
  await page.mouse.move(10, 10);
  await page.waitForTimeout(500);
  assert.ok(await panel.isVisible(), "dragging keeps a preview open");
  await dialogHeading.press("ArrowRight");
  assert.ok((await panel.boundingBox()).x > moved.x);
  await dialogHeading.press("Home");
  assert.ok(Math.abs((await panel.boundingBox()).x - start.x) < 12);
  await page.keyboard.press("Escape");
  await style.selectOption("midnight");
  assert.deepEqual(await hostAppearance(), baseAppearance);
  assert.equal(await page.locator(".citation-endnotes").evaluate(node => getComputedStyle(node).backgroundColor), "rgb(21, 39, 50)");
  await primary.click();
  await panel.waitFor();
  assert.equal(await panel.evaluate(node => getComputedStyle(node).backgroundColor), "rgb(21, 39, 50)");
  if (evidence) await page.screenshot({ path: join(evidence, "midnight-theme.png") });
  await page.keyboard.press("Escape");
  await report("midnight reading room");
  await enableHover.uncheck();
  await style.selectOption("reading");
  const evidenceLink = page.getByRole("button", { name: "Citation evidence" });
  const evidencePanel = page.getByRole("dialog", { name: "Citation evidence" });
  const creditLink = page.getByRole("button", { name: "Citation credit" });
  const creditPanel = page.getByRole("dialog", { name: "Citation credit" });
  for (const [link, preview] of [[evidenceLink, evidencePanel], [creditLink, creditPanel]]) {
    await link.hover();
    await page.waitForTimeout(250);
    assert.equal(await preview.isVisible(), false);
  }
  await evidenceLink.click();
  await evidencePanel.waitFor();
  await evidencePanel.getByText("Source metadata").click();
  assert.ok(await evidencePanel.getByText(/Cambridge University Press/).isVisible());
  assert.equal(await evidencePanel.locator("pre").getAttribute("tabindex"), "0");
  await page.keyboard.press("Escape");
  await creditLink.press("Enter");
  await creditPanel.waitFor();
  assert.ok(await creditPanel.getByText(/Computer software/).isVisible());
  await page.keyboard.press("Escape");
  await enableHover.check();
  await evidenceLink.hover();
  await evidencePanel.waitFor();
  await page.keyboard.press("Escape");
  await enableHover.uncheck();
  await report("static reading room");
  await primary.click();
  await page.evaluate(() => scrollTo(0, document.documentElement.scrollHeight));
  await page.keyboard.press("Escape");
  assert.ok(await primary.evaluate(node => node === document.activeElement && node.getBoundingClientRect().bottom > 0));
  await page.route(origin + "/test-brand.svg", route => route.fulfill({
    contentType: "image/svg+xml", body: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24"><rect width="24" height="24"/></svg>'
  }));
  await page.evaluate(() => {
    const reader = document.querySelector("citation-inspector");
    reader.setAttribute("panel-title", "Example publication");
    reader.setAttribute("panel-icon", "/test-brand.svg");
  });
  await primary.click();
  const branded = page.getByRole("dialog", { name: "Example publication" });
  await branded.waitFor();
  await page.waitForFunction(() => document.querySelector("citation-inspector").shadowRoot.querySelector(".citation-brand-icon").naturalWidth === 24);
  await page.mouse.click(2, 2);
  await branded.waitFor({ state: "hidden" });
  await page.evaluate(async moduleURL => {
    const { initializeCitationInspector } = await import(moduleURL);
    const reader = document.querySelector("citation-inspector");
    initializeCitationInspector(reader, { classPrefix: "example-ref" });
  }, origin + "/dist/citation-inspector.mjs");
  assert.equal(await page.locator("a.citation-cite").count(), 0);
  assert.ok(await page.locator(".example-ref-endnotes").isVisible());
  const customTrigger = page.locator("a.example-ref-cite").first();
  await customTrigger.click();
  assert.ok(await branded.locator(".example-ref-panel-content").isVisible());
  assert.equal(await branded.evaluate(node => getComputedStyle(node).position), "fixed");
  await page.keyboard.press("Escape");
  await enableHover.check();
  await creditLink.hover();
  await creditPanel.waitFor();
  await page.keyboard.press("Escape");
  await enableHover.uncheck();
  await page.evaluate(() => document.querySelector("citation-inspector").removeAttribute("class-prefix"));
  assert.ok(await primary.isVisible());
  console.log("Static reading room rendered with its inspector.");

  requests.length = 0;
  await page.goto(copied);
  await primary.and(page.getByRole("button")).waitFor();
  const ready = requests.length;
  await primary.hover();
  await page.waitForTimeout(250);
  assert.equal(requests.length, ready);
  assert.equal(await panel.count(), 0);
  await primary.focus();
  await page.keyboard.press("Enter");
  await panel.waitFor();
  assert.equal(await dialogHeading.evaluate(node => node.getRootNode().activeElement === node), true);
  await page.keyboard.press("Tab");
  const panelOptions = panel.getByLabel("Panel options", { exact: true });
  assert.equal(await panelOptions.evaluate(node => node.getRootNode().activeElement === node), true);
  await page.keyboard.press("Tab");
  const doiLink = panel.getByRole("link", { name: /https:\/\/doi.org/ });
  assert.equal(await doiLink.evaluate(node => node.getRootNode().activeElement === node), true);
  await page.keyboard.press("Shift+Tab");
  await page.keyboard.press("Shift+Tab");
  assert.equal(await page.evaluate(() => document.querySelector("citation-inspector").shadowRoot.activeElement === null), true);
  await page.keyboard.press("Escape");
  assert.equal(await primary.evaluate(node => node === document.activeElement), true);
  await page.keyboard.press("Space");
  await panel.waitFor();
  const box = await panel.boundingBox();
  assert.ok(box.x >= 0 && box.x + box.width <= 1440);
  const placement = page.getByRole("dialog", { name: "Move citation panel" });
  await panelOptions.press("Enter");
  await panel.getByRole("button", { name: "Move panel", exact: true }).press("Enter");
  await placement.waitFor();
  await page.keyboard.press("Escape");
  await placement.waitFor({ state: "hidden" });
  assert.deepEqual(await panel.boundingBox(), box);
  assert.equal(await panelOptions.evaluate(node => node.getRootNode().activeElement === node), true);

  await panelOptions.click();
  await panel.getByRole("button", { name: "Move panel", exact: true }).click();
  await placement.waitFor();
  await page.mouse.click(40, 180);
  await placement.waitFor({ state: "hidden" });
  const placed = await panel.boundingBox();
  assert.ok(Math.abs(placed.x - 40) < 1 && Math.abs(placed.y - 180) < 1);
  await page.mouse.move(placed.x + 20, placed.y + 50, { steps: 15 });
  assert.equal(await panel.isVisible(), true);
  assert.equal(await panel.getByRole("link", { name: "Open PubMed Central" }).count(), 0);
  assert.equal(requests.length, ready);
  assert.ok(requests.every(url => url.startsWith(copied)));

  await page.evaluate(() => {
    const element = document.querySelector("citation-inspector");
    element.dataset.report = "";
    document.addEventListener("citation-report", event => { window.reported = event.detail; });
  });
  await page.keyboard.press("Escape");
  const repeat = page.locator(".citation-cite[id$='polarization-2']");
  await repeat.click();
  await panel.getByRole("button", { name: "Report metadata" }).click();
  assert.equal(await page.evaluate(() => window.reported.occurrence), await repeat.getAttribute("id"));
  await panel.getByRole("button", { name: "Go to endnote" }).click();
  assert.equal(await page.evaluate(() => document.activeElement.id), "reading-note-simas-clifford-kirkland-2020-empathy-polarization");
  await page.getByRole("link", { name: /Return to “A reading list can hold.*Simas/ }).click();
  assert.equal(await repeat.evaluate(node => node === document.activeElement), true);

  await context.setOffline(true);
  await primary.click();
  assert.equal(await panel.isVisible(), true);
  await page.emulateMedia({ media: "print" });
  assert.equal(await panel.isVisible(), false);
  assert.ok(await page.getByRole("heading", { name: "Endnotes" }).isVisible());
  await page.emulateMedia({ media: "screen" });
  await context.setOffline(false);
  await page.keyboard.press("Escape");
  await page.evaluate(() => {
    const element = document.querySelector("citation-inspector");
    const parent = element.parentNode;
    element.remove();
    if (element.querySelector(".citation-cite").hasAttribute("role")) throw new Error("Trigger was not restored");
    parent.append(element);
  });
  await primary.and(page.getByRole("button")).waitFor();
  await primary.click();
  await panel.waitFor();
  await page.keyboard.press("Escape");
  assert.deepEqual(await page.evaluate(() => window.violations), []);
  assert.deepEqual(errors, []);
  await primary.click();
  await report("standalone desktop inspector");
  await page.keyboard.press("Escape");
  console.log("Copied drop-in passed CSP, keyboard/focus, pointer, reporting, backlinks, offline, remount and print checks.");

  const noJS = await browser.newContext({ javaScriptEnabled: false });
  const degraded = await noJS.newPage();
  await degraded.goto(copied);
  const bare = degraded.locator(".citation-cite").first();
  assert.equal(await bare.getAttribute("role"), null);
  await bare.click();
  assert.match(degraded.url(), /#reading-note-simas-/);
  await degraded.getByRole("link", { name: /Return to “A reading list can hold.*Simas/ }).click();
  assert.match(degraded.url(), /-polarization-2$/);
  await degraded.getByRole("link", { name: "Citation credit" }).click();
  assert.ok(await degraded.getByRole("region", { name: "Citation credit" }).getByText(/Computer software/).isVisible());
  await noJS.close();
  console.log("Copied HTML endnotes and occurrence links worked with JavaScript disabled.");

  const phone = await browser.newContext({ viewport: { width: 390, height: 580 }, isMobile: true, hasTouch: true, reducedMotion: "reduce" });
  const mobile = await phone.newPage();
  await mobile.goto(origin + "/demos/static/");
  await mobile.getByRole("button", { name: /Inspect citation: Simas/ }).first().tap();
  const sheet = mobile.getByRole("dialog", { name: "citation.inator", exact: true });
  await sheet.waitFor();
  assert.equal(await sheet.evaluate(node => node.matches(":modal")), true);
  const mobileBox = await sheet.boundingBox();
  assert.ok(mobileBox.width <= 390 && mobileBox.y + mobileBox.height <= 581);
  assert.ok(mobileBox.height <= 580 * 0.6 + 1);
  assert.ok(await sheet.evaluate(node => node.scrollHeight > node.clientHeight));
  assert.equal(await mobile.evaluate(() => document.documentElement.scrollWidth), 390);
  const touchPadding = await sheet.locator(".citation-panel-content").boundingBox();
  const touch = await phone.newCDPSession(mobile);
  await touch.send("Emulation.setPageScaleFactor", { pageScaleFactor: 1.5 });
  await mobile.waitForFunction(() => {
    const viewport = window.visualViewport;
    const panel = document.querySelector("citation-inspector").shadowRoot.querySelector(".citation-panel");
    const box = panel.getBoundingClientRect();
    return viewport.scale === 1.5 && box.height <= viewport.height * 0.6 + 1 &&
      box.bottom <= viewport.offsetTop + viewport.height;
  });
  await touch.send("Emulation.setPageScaleFactor", { pageScaleFactor: 1 });
  await mobile.waitForFunction(expectedTop => {
    const panel = document.querySelector("citation-inspector").shadowRoot.querySelector(".citation-panel");
    return Math.abs(panel.getBoundingClientRect().top - expectedTop) < 1;
  }, mobileBox.y);
  const touchPoint = { x: touchPadding.x + 5, y: touchPadding.y + 26 };
  await touch.send("Input.dispatchTouchEvent", { type: "touchStart", touchPoints: [touchPoint] });
  await touch.send("Input.dispatchTouchEvent", { type: "touchMove", touchPoints: [{ ...touchPoint, y: touchPoint.y - 75 }] });
  await touch.send("Input.dispatchTouchEvent", { type: "touchEnd", touchPoints: [] });
  const draggedSheet = await sheet.boundingBox();
  assert.ok(draggedSheet.y < mobileBox.y - 40);
  const mobilePlacement = mobile.getByRole("dialog", { name: "Move citation panel" });
  await sheet.getByLabel("Panel options", { exact: true }).tap();
  await sheet.getByRole("button", { name: "Move panel", exact: true }).tap();
  await mobilePlacement.waitFor();
  await mobile.touchscreen.tap(5, 24);
  await mobilePlacement.waitFor({ state: "hidden" });
  const placedSheet = await sheet.boundingBox();
  assert.ok(Math.abs(placedSheet.y - 24) < 1);
  assert.ok(mobileBox.y - placedSheet.y > 180);
  if (evidence) await mobile.screenshot({ path: join(evidence, "mobile-sheet.png") });
  await mobile.getByRole("button", { name: "Go to endnote" }).tap();
  await sheet.waitFor({ state: "hidden" });
  await mobile.setViewportSize({ width: 844, height: 390 });
  await mobile.getByRole("button", { name: /Inspect citation: Frost/ }).tap();
  await sheet.waitFor();
  await mobile.touchscreen.tap(2, 2);
  await sheet.waitFor({ state: "hidden" });
  await mobile.getByRole("button", { name: /Inspect citation: Frost/ }).tap();
  const dismiss = sheet.getByRole("button", { name: "Dismiss", exact: true });
  await dismiss.focus();
  assert.ok(await dismiss.evaluate(node => getComputedStyle(node).clipPath === "none"));
  await dismiss.press("Enter");
  await sheet.waitFor({ state: "hidden" });
  await phone.close();
  console.log("Short phone sheet moved over 180 px, scrolled to its endnote action, and dismissed after rotation.");

  await page.setViewportSize({ width: 320, height: 720 });
  await page.emulateMedia({ forcedColors: "active", reducedMotion: "reduce" });
  await page.goto(copied + "/adversaries.html");
  await primary.and(page.getByRole("button")).waitFor();
  await primary.click();
  await panel.waitFor();
  const hostile = await panel.boundingBox();
  assert.ok(hostile.width <= 320);
  assert.equal(await panel.evaluate(node => node.scrollWidth === node.clientWidth), true);
  assert.ok(await panel.getByRole("heading", { name: /<img src=x onerror=alert\(1\)>/ }).isVisible());
  assert.equal(await panel.locator("img:not(.citation-brand-icon), script").count(), 0);
  assert.equal(await panel.getByRole("link", { name: /Download PDF/ }).count(), 0);
  assert.equal(await panel.getByRole("link", { name: /PubMed Central/ }).count(), 0);
  assert.equal(await panel.getByRole("link", { name: "Open PubMed", exact: true }).count(), 1);
  await panel.getByText("Show all 100 authors", { exact: true }).click();
  assert.ok(await panel.locator(".citation-authors").filter({ hasText: /研究者 100/ }).isVisible());
  await panel.getByRole("button", { name: "Copy citation" }).click();
  await panel.getByRole("status").getByText("Copied.").waitFor();
  assert.ok(await panel.getByRole("status").evaluate(node =>
    node.getBoundingClientRect().bottom <= node.closest("dialog").getBoundingClientRect().bottom + 1
  ));
  assert.match(await page.evaluate(() => navigator.clipboard.readText()), /研究者 100/);
  await panel.getByText("Abstract", { exact: true }).click();
  assert.ok(await panel.getByText(/x < 1; x > 0/).isVisible());
  await panel.getByText("Show formatted citation").click();
  assert.equal(await panel.evaluate(node => node.scrollWidth === node.clientWidth), true);
  assert.equal(await panel.getByRole("button", { name: "Copy citation" }).evaluate(node => getComputedStyle(node).fontFamily.includes("fantasy")), false);
  await page.keyboard.press("Escape");
  const second = page.locator(".citation-cite").nth(1);
  assert.match(await primary.textContent(), /2020b/);
  assert.match(await second.textContent(), /2020a/);
  await second.click();
  assert.ok(await panel.getByText("retracted", { exact: false }).first().isVisible());
  await page.keyboard.press("Escape");
  assert.deepEqual(await page.evaluate(() => window.violations), []);
  assert.deepEqual(errors, []);
  await page.getByRole("button", { name: "Citation evidence" }).press("Enter");
  const hostileEvidence = page.getByRole("dialog", { name: "Citation evidence" });
  await hostileEvidence.getByText("Source metadata").click();
  assert.match(await hostileEvidence.locator("pre").textContent(), /<img src=x onerror=alert/);
  assert.equal(await hostileEvidence.locator("img:not(.citation-brand-icon)").count(), 0);
  await page.keyboard.press("Escape");
  console.log("Separate hostile host passed narrow reflow, safe literal metadata, status, year suffixes and scoped style checks.");

  await page.setViewportSize({ width: 1440, height: 960 });
  await page.emulateMedia({ forcedColors: "none" });
  await page.goto(origin + "/demos/dynamic/");
  const mode = page.getByLabel("Provider mode");
  const input = page.getByLabel("Identifier or single citation directive");
  const refresh = page.getByRole("button", { name: "Force refresh" });
  const status = page.locator("#resolution-status");
  await mode.selectOption("offline");
  await refresh.click();
  await page.waitForFunction(() => document.querySelector("#resolution-status").dataset.state === "error");
  assert.match(await status.textContent(), /Cache stale/);
  await page.getByRole("button", { name: "Citation evidence" }).press("Enter");
  const runtimeEvidence = page.getByRole("dialog", { name: "Citation evidence" });
  await runtimeEvidence.getByText("Provider response and merge decisions").click();
  assert.ok(await runtimeEvidence.getByText(/Synthetic provider outage/).isVisible());
  await page.keyboard.press("Escape");
  assert.match(await page.locator("#live-reader").textContent(), /Simas/);
  if (evidence) await page.screenshot({ path: join(evidence, "stale-cache.png") });
  await mode.selectOption("partial");
  await refresh.click();
  await page.waitForFunction(() => document.querySelector("#resolution-status").dataset.state === "partial");
  assert.match(await status.textContent(), /partial/);
  assert.match(await page.locator("#live-reader").textContent(), /Simas/);

  await mode.selectOption("slow");
  await refresh.click();
  await page.waitForFunction(() => document.querySelector("#resolution-status").dataset.state === "loading");
  await mode.selectOption("live");
  await input.fill("isbn:9780593656433");
  await page.getByRole("button", { name: "Resolve", exact: true }).click();
  const feiler = page.getByRole("button", { name: /Inspect citation: Feiler/ });
  await feiler.click();
  assert.ok(await panel.getByRole("heading", { name: /A Time to Gather/ }).isVisible());
  await page.keyboard.press("Escape");
  await page.waitForTimeout(2350);
  assert.ok(await feiler.isVisible());
  assert.equal(await panel.count(), 0);

  await mode.selectOption("slow");
  await refresh.click();
  await feiler.click();
  await page.keyboard.press("Escape");
  await page.waitForFunction(() => document.querySelector("#resolution-status").dataset.state === "cached");
  assert.equal(await panel.count(), 0);
  assert.ok(await page.getByRole("button", { name: "Show updated citation" }).isVisible());
  await page.getByRole("button", { name: "Show updated citation" }).click();
  assert.ok(await feiler.isVisible());
  assert.equal(await panel.count(), 0);
  assert.deepEqual(errors, []);
  console.log("Dynamic outage, stale age, partial response, A/B race and close-while-loading passed.");

  await page.getByRole("link", { name: "Guide" }).click();
  assert.ok(await page.getByRole("heading", { name: "Complete notation" }).isVisible());
  const original = await (await fetch(origin + "/demos/static/reading.txt")).text();
  assert.equal(await page.locator('#guide-source + p + pre code').textContent(), original.trim());
  await page.goto(origin + "/demos/dynamic/");

  await page.getByRole("button", { name: "a cached book" }).click();
  await page.getByRole("button", { name: "Resolve", exact: true }).click();
  await page.waitForFunction(() => document.querySelector("#resolution-status").dataset.state === "cached");
  assert.match(await status.textContent(), /Cache hit.*A Time to Gather/);
  assert.ok(await page.getByRole("button", { name: /Inspect citation: Feiler/ }).isVisible());
  await page.getByRole("button", { name: "Citation evidence" }).press("Enter");
  assert.ok(await page.getByRole("dialog", { name: "Citation evidence" }).getByText("Cached source metadata").isVisible());
  await page.keyboard.press("Escape");

  if (process.env.CITATION_ZOOM_CHROME) {
    const extension = join(temporary, "zoom-extension");
    await mkdir(extension);
    await writeFile(join(extension, "manifest.json"), JSON.stringify({
      name: "Temporary browser zoom assay", version: "1.0", manifest_version: 3,
      permissions: ["tabs"], background: { service_worker: "worker.js" }
    }));
    await writeFile(join(extension, "worker.js"), "chrome.runtime.onInstalled.addListener(() => {});");
    const zoomContext = await chromium.launchPersistentContext(join(temporary, "zoom-profile"), {
      executablePath: process.env.CITATION_ZOOM_CHROME,
      headless: true, viewport: null,
      args: [`--disable-extensions-except=${extension}`, `--load-extension=${extension}`, "--window-size=1440,960"]
    });
    try {
      const worker = zoomContext.serviceWorkers()[0] || await zoomContext.waitForEvent("serviceworker", { timeout: 5000 });
      const zoomed = zoomContext.pages()[0];
      await zoomed.goto(copied + "/adversaries.html");
      const trigger = zoomed.locator(".citation-cite").first().and(zoomed.getByRole("button"));
      await trigger.waitFor();
      for (const factor of [2, 4]) {
        const actual = await worker.evaluate(async ({ factor, url }) => {
          const tab = (await chrome.tabs.query({})).find(item => item.url === url);
          await chrome.tabs.setZoom(tab.id, factor);
          return chrome.tabs.getZoom(tab.id);
        }, { factor, url: zoomed.url() });
        assert.ok(Math.abs(actual - factor) < 0.01);
        await zoomed.waitForFunction(factor => Math.abs(devicePixelRatio - factor) < 0.01, factor);
        await trigger.click();
        const zoomPanel = zoomed.getByRole("dialog");
        await zoomPanel.waitFor();
        await zoomPanel.getByText("Show formatted citation").click();
        await zoomPanel.getByRole("button", { name: "Copy citation" }).scrollIntoViewIfNeeded();
        assert.equal(await zoomPanel.evaluate(node => {
          const box = node.getBoundingClientRect();
          return node.scrollWidth === node.clientWidth && box.right <= innerWidth + 1 && box.bottom <= innerHeight + 1;
        }), true);
        if (evidence && factor === 4) {
          const cdp = await zoomContext.newCDPSession(zoomed);
          const screenshot = await cdp.send("Page.captureScreenshot", { format: "png", fromSurface: true });
          await writeFile(join(evidence, "400-percent-zoom.png"), Buffer.from(screenshot.data, "base64"));
        }
        await zoomed.keyboard.press("Escape");
        await zoomPanel.waitFor({ state: "hidden" });
      }
      console.log("Chrome tab zoom at 200% and 400% preserved the copied inspector and actions.");
    } finally {
      await zoomContext.close();
    }
  }

  if (process.env.CITATION_LIVE_CHECK) {
    await mode.selectOption("live");
    await input.fill("doi:10.1017/S0003055419000534");
    const [response] = await Promise.all([
      page.waitForResponse(response => response.url().includes("/demos/dynamic/resolve?"), { timeout: 12000 }),
      refresh.click()
    ]);
    const data = await response.json();
    await page.waitForFunction(() => document.querySelector("#resolution-status").dataset.state === "resolved");
    assert.match(await status.textContent(), /Crossref metadata received/);
    if (evidence) await page.screenshot({ path: join(evidence, "live-crossref.png") });
    console.log(`Live Crossref · ${data.state} · HTTP ${data.attempt?.status ?? "no response"} · ${data.message}`);
    assert.equal(data.state, "resolved");
    assert.equal(data.attempt.raw.message.DOI.toLowerCase(), "10.1017/s0003055419000534");
    await page.getByRole("button", { name: "Resolve", exact: true }).click();
    await page.waitForFunction(() => document.querySelector("#resolution-status").dataset.state === "cached");
    assert.match(await status.textContent(), /Cache hit.*How Empathic Concern Fuels Political Polarization/);
    await page.getByRole("button", { name: "Citation evidence" }).press("Enter");
    assert.ok(await page.getByRole("dialog", { name: "Citation evidence" }).getByText(/most recent provider attempt/).isVisible());

  }
} finally {
  await browser?.close();
  copyHost.close();
  demo.kill("SIGTERM");
  await rm(temporary, { recursive: true, force: true });
}
