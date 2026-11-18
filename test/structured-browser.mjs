import assert from "node:assert/strict";
import { writeFile } from "node:fs/promises";
import { join } from "node:path";
import { compileCitations, planCitationOccurrences } from "../src/compiler.mjs";
import { makeCache } from "../src/records.mjs";

export async function checkStructuredBrowser({ page, directory, origin }) {
  const cache = makeCache([
    { id: "atlas", title: "Forest atlas", type: "book", state: "resolved", relatedIdentifiers: [{ label: "Catalog number", value: "A-52", authority: "Library" }] },
    { id: "survey", title: "Field survey", type: "report", state: "resolved" }
  ]);
  const first = planCitationOccurrences([{ occurrenceId: "detail-occurrence-caption", recordId: "atlas", label: "Atlas source" }], cache, { namespace: "map" });
  const updated = planCitationOccurrences([{ occurrenceId: "detail-occurrence-caption", recordId: "survey", label: "Survey source" }], cache, { namespace: "map" });
  const second = planCitationOccurrences([{ occurrenceId: "caption", recordId: "survey", label: "Survey source" }], cache, { namespace: "map-occurrence-detail" });
  const legacy = compileCitations("{citation atlas}", cache, { namespace: "citation-3-map" });
  await writeFile(join(directory, "structured.html"), `<!doctype html><html lang="en">
    <head><meta charset="utf-8"><title>Structured citations</title><link rel="stylesheet" href="/citation-inspector.css">
    <script type="module" src="/structured-fixture.mjs"></script></head><body>
    <main><h1 id="fallback" tabindex="-1">Sources</h1><citation-inspector id="first"></citation-inspector>
    <citation-inspector id="legacy">${legacy.html}</citation-inspector>
    <button id="open-parent">Open host dialog</button><dialog id="parent"><button autofocus>Host action</button><div id="shadow"></div></dialog></main>
    </body></html>`);
  await writeFile(join(directory, "structured-fixture.mjs"), `
    import { bindCitationTrigger, initializeCitationInspector } from "/citation-inspector.mjs";
    const cache = ${JSON.stringify(cache)};
    const first = document.querySelector("#first");
    const parent = document.querySelector("#parent");
    const fallback = () => document.querySelector("#fallback");
    const shadow = document.querySelector("#shadow").attachShadow({ mode: "open" });
    const second = document.createElement("citation-inspector");
    second.id = "second";
    shadow.append(second);
    function render(root, [occurrence], tag) {
      const trigger = document.createElement(tag);
      trigger.textContent = occurrence.label;
      trigger.id = occurrence.anchorId;
      if (tag === "a") trigger.href = "#" + occurrence.endnoteId;
      else trigger.type = "button";
      const note = document.createElement("p");
      note.textContent = "Endnote for " + occurrence.label;
      note.id = occurrence.endnoteId;
      note.tabIndex = -1;
      root.append(trigger, note);
      return { trigger, note };
    }
    initializeCitationInspector(first, { cache });
    initializeCitationInspector(document.querySelector("#legacy"), { cache });
    initializeCitationInspector(second, { cache, panelTitle: "Second inspector" });
    const primary = render(first, ${JSON.stringify(first.occurrences)}, "a");
    const secondary = render(second, ${JSON.stringify(second.occurrences)}, "button");
    const binding = bindCitationTrigger(first, primary.trigger, ${JSON.stringify(first.occurrences[0])}, { endnote: primary.note, focusFallback: fallback });
    bindCitationTrigger(second, secondary.trigger, ${JSON.stringify(second.occurrences[0])}, { endnote: secondary.note, focusFallback: fallback });
    document.querySelector("#open-parent").onclick = () => parent.showModal();
    document.addEventListener("keydown", event => {
      if (event.key === "Escape" && parent.open) {
        event.preventDefault();
        parent.close();
      }
    }, true);
    first.report = payload => { window.reportedCitation = payload; };
    window.fixture = {
      update() {
        const occurrence = ${JSON.stringify(updated.occurrences[0])};
        primary.trigger.textContent = occurrence.label;
        primary.trigger.href = "#" + occurrence.endnoteId;
        primary.note.id = occurrence.endnoteId;
        binding.update(occurrence, { endnote: primary.note });
      },
      cache() { first.cache = cache; },
      showParent() { parent.showModal(); },
      detach() { primary.trigger.remove(); },
      dispose() { binding.dispose(); },
      unmountSecond() { second.remove(); }
    };
  `);
  await page.goto(origin + "/structured.html");
  assert.equal(await page.locator("#citation-3-map-note-atlas").count(), 1);
  assert.equal(await page.locator(`#${first.endnotes[0].id}`).count(), 1);
  const trigger = page.locator(`#${first.occurrences[0].anchorId}`);
  const panel = page.getByRole("dialog", { name: "citation.inator" });
  await trigger.waitFor();
  await page.waitForFunction(id => document.getElementById(id)?.getAttribute("role") === "button", first.occurrences[0].anchorId);
  await trigger.press("Enter");
  await panel.getByRole("heading", { name: "Forest atlas" }).waitFor();
  assert.equal(await panel.getByText("Catalog number: A-52 (Library)").count(), 1);
  await panel.getByRole("button", { name: "Report metadata" }).click();
  assert.deepEqual(await page.evaluate(() => ({
    occurrence: window.reportedCitation.occurrence, occurrenceId: window.reportedCitation.occurrenceId
  })), { occurrence: first.occurrences[0].anchorId, occurrenceId: first.occurrences[0].occurrenceId });
  const copy = panel.getByRole("button", { name: "Copy citation" });
  await copy.focus();
  await page.evaluate(() => window.fixture.update());
  await panel.getByRole("heading", { name: "Field survey" }).waitFor();
  assert(await copy.evaluate(node => node.getRootNode().activeElement === node));
  assert.equal(await trigger.getAttribute("aria-label"), "Inspect citation: Survey source");
  await page.evaluate(() => window.fixture.cache());
  await panel.waitFor({ state: "hidden" });
  assert(await trigger.evaluate(node => document.activeElement === node));
  await trigger.press("Space");
  await panel.waitFor();
  await page.evaluate(() => window.fixture.showParent());
  await page.getByRole("button", { name: "Host action" }).waitFor();
  await page.keyboard.press("Escape");
  await page.waitForFunction(() => !document.getElementById("parent").open);
  await panel.waitFor({ state: "hidden" });
  await trigger.press("Enter");
  await panel.waitFor();
  await page.evaluate(() => window.fixture.detach());
  await panel.waitFor({ state: "hidden" });
  assert.equal(await page.evaluate(() => document.activeElement.id), "fallback");
  await page.evaluate(() => window.fixture.dispose());

  const viewport = page.viewportSize();
  await page.setViewportSize({ width: 390, height: 850 });
  await page.locator("#open-parent").click();
  const other = page.locator(`#${second.occurrences[0].anchorId}`);
  const otherPanel = page.getByRole("dialog", { name: "Second inspector" });
  await other.press("Space");
  await otherPanel.waitFor();
  await page.keyboard.press("Escape");
  assert(await page.locator("#parent").evaluate(node => node.open));
  assert(await other.evaluate(node => node.getRootNode().activeElement === node));
  await other.press("Enter");
  await otherPanel.getByRole("button", { name: "Go to endnote" }).click();
  const note = page.locator(`#${second.occurrences[0].endnoteId}`);
  assert(await note.evaluate(node => node.getRootNode().activeElement === node));
  assert.equal(new URL(page.url()).hash, "");
  await other.press("Enter");
  await otherPanel.waitFor();
  await page.evaluate(() => window.fixture.unmountSecond());
  await otherPanel.waitFor({ state: "hidden" });
  await page.keyboard.press("Escape");
  assert.equal(await page.locator("#parent").evaluate(node => node.open), false);
  if (viewport) await page.setViewportSize(viewport);
  console.log("Structured citation update, cache replacement, detached focus fallback, both Escape ownership cases and shadow endnote passed.");
}
