import assert from "node:assert/strict";
import { writeFile } from "node:fs/promises";
import { join } from "node:path";
import { compileCitations, escapeHTML, planCitationOccurrences } from "../src/compiler.mjs";
import { makeCache } from "../src/records.mjs";

export async function checkWebpageBrowser({ page, directory, origin }) {
  const url = "https://example.org/harbor-observations";
  const cache = makeCache([{
    id: "harbor", type: "webpage", state: "resolved", title: "Harbor observations",
    issued: [2024], authors: [{ literal: "Coastal Archive" }], publisher: "Coastal Archive",
    locations: [{ kind: "publisher", provider: "Coastal Archive", url }]
  }]);
  const variants = ["default", "apa"].map(style => {
    const { html } = compileCitations("{citation harbor}", cache, { namespace: style, citationStyle: style });
    return `<citation-inspector id="${style}" data-cache="./webpage.json">${html}</citation-inspector>`;
  });
  const plan = planCitationOccurrences([{ occurrenceId: "caption", recordId: "harbor" }], cache, {
    namespace: "structured", citationStyle: "apa"
  });
  const [occurrence] = plan.occurrences;
  const [note] = plan.endnotes;
  const parts = note.parts.map(({ text, emphasis, href }) => {
    if (href) return `<a href="${escapeHTML(href)}">${escapeHTML(text)}</a>`;
    return emphasis === "italic" ? `<em>${escapeHTML(text)}</em>` : escapeHTML(text);
  }).join("");
  variants.push(`<citation-inspector id="structured" data-cache="./webpage.json">
    <a id="${occurrence.anchorId}" href="#${note.id}">${escapeHTML(occurrence.label)}</a>
    <section data-citation-part="endnotes"><ol><li id="${note.id}" tabindex="-1">${parts}</li></ol></section>
    </citation-inspector>`);
  await writeFile(join(directory, "webpage-binding.mjs"), `
    import { bindCitationTrigger } from "/citation-inspector.mjs";
    const occurrence = ${JSON.stringify(occurrence)};
    bindCitationTrigger(document.getElementById("structured"), document.getElementById(occurrence.anchorId), occurrence, {
      endnote: document.getElementById(occurrence.endnoteId)
    });
  `);
  await writeFile(join(directory, "webpage.json"), JSON.stringify(cache));
  await writeFile(join(directory, "webpage.html"), `<!doctype html>
    <html lang="en"><head><meta charset="utf-8"><title>Webpage references</title>
    <link rel="stylesheet" href="/citation-inspector.css">
    <script type="module" src="/citation-inspector.mjs"></script>
    <script type="module" src="/webpage-binding.mjs"></script></head>
    <body><main><h1>Webpage references</h1>${variants.join("")}</main></body></html>`);
  await page.goto(origin + "/webpage.html");
  const reference = `Coastal Archive. (2024). Harbor observations. ${url}`;
  for (const style of ["default", "apa", "structured"]) {
    const reader = page.locator(`#${style}`);
    const endnotes = reader.locator("[data-citation-part='endnotes']");
    const endnoteLink = endnotes.getByRole("link", { name: url, exact: true });
    assert.equal(await endnoteLink.getAttribute("href"), url);
    assert.equal(await endnotes.locator("em").textContent(), "Harbor observations");
    const trigger = reader.getByRole("button", { name: /Inspect citation/ });
    if (style === "default") await trigger.press("Enter");
    else await trigger.click();
    const panel = reader.getByRole("dialog", { name: "cite.inator" });
    const heading = panel.getByRole("heading", { name: "cite.inator" });
    assert.equal(await heading.evaluate(node => node.getRootNode().activeElement === node), true);
    assert.equal(await heading.evaluate(node => getComputedStyle(node).outlineStyle), "none");

    await page.keyboard.press("Tab");
    const panelOptions = panel.getByLabel("Panel options", { exact: true });
    assert(await panelOptions.evaluate(node =>
      node.getRootNode().activeElement === node && getComputedStyle(node).outlineStyle === "solid"
    ));
    const citation = panel.locator("[data-citation-part='citation']");
    assert.equal(await citation.textContent(), reference);
    assert.equal(await citation.getByRole("link", { name: url, exact: true }).getAttribute("href"), url);
    assert.equal(await citation.locator("em").textContent(), "Harbor observations");
    await page.evaluate(() => navigator.clipboard.writeText(""));
    await panel.getByRole("button", { name: "Copy citation" }).click();
    await page.waitForFunction(async expected => await navigator.clipboard.readText() === expected, reference);

    await page.keyboard.press("Escape");
    await panel.waitFor({ state: "hidden" });
    assert.equal(await trigger.evaluate(node => document.activeElement === node), true);
  }
}
