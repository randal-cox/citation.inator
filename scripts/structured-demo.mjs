import { escapeHTML as html, planCitationOccurrences } from "../src/compiler.mjs";
import { makeCache } from "../src/records.mjs";

const catalog = "https://www.ncei.noaa.gov/products/land-based-station/us-climate-normals";
const provider = "NOAA National Centers for Environmental Information";
const release = {
  type: "dataset", state: "resolved",
  authors: [{ literal: provider }],
  relatedIdentifiers: [{ label: "Collection code", value: "CLIMATE-NORMALS", authority: "Demo catalog" }],
  locations: [{ kind: "publisher", provider, url: catalog }],
  provenance: [{ provider, url: catalog, note: "The publisher page describes both releases." }]
};

const records = [
  { ...release, id: "normals-current", title: "U.S. Climate Normals, 1991–2020", issued: [2021] },
  { ...release, id: "normals-previous", title: "U.S. Climate Normals, 1981–2010", issued: [2011] },
  { id: "station-log", title: "Station relocation log", state: "unresolved", note: "The editor has a title but no verified record or destination." }
];
const cache = makeCache(records);

const plan = planCitationOccurrences([
  { occurrenceId: "map-caption", recordId: "normals-current", context: "Map caption", label: "1991–2020 normals" },
  { occurrenceId: "table-caption", recordId: "normals-current", context: "Table caption", label: "1991–2020 normals" },
  { occurrenceId: "earlier-release", recordId: "normals-previous", context: "Earlier release", label: "1981–2010 normals" },
  { occurrenceId: "station-log", recordId: "station-log", context: "Editor’s note", label: "Station relocation log" }
], cache, { namespace: "climate-example" });

const dialogPlan = planCitationOccurrences([
  { occurrenceId: "map-caption", recordId: "normals-current", context: "Map details", label: "1991–2020 normals" }
], cache, { namespace: "climate-details" });

const anchor = ({ anchorId, endnoteId, label }) =>
  `<a id="${html(anchorId)}" href="#${html(endnoteId)}">${html(label)}</a>`;

function referenceParts(parts) {
  return parts.map(({ text, emphasis, href }) => {
    const plain = html(text);
    const formatted = emphasis === "italic" ? `<em>${plain}</em>` : emphasis === "bold" ? `<strong>${plain}</strong>` : plain;
    return href ? `<a href="${html(href)}">${formatted}</a>` : formatted;
  }).join("");
}

function endnotes({ endnotes }) {
  return `<ol class="structured-endnotes">${endnotes.map(note => `
      <li id="${html(note.id)}" tabindex="-1">
        ${referenceParts(note.parts)}${note.state === "unresolved" ? ' <strong>Unresolved</strong>' : ""}
        <div class="structured-links">
          ${[
            ...note.destinations.map(link => `<a href="${html(link.href)}">${html(link.label)}</a>`),
            ...note.backlinks.map(link => `<a href="${html(link.href)}">Return to ${html(link.context)}</a>`)
          ].join("\n          ")}
        </div>
      </li>`).join("")}
    </ol>`;
}

const [map, table, prior, missing] = plan.occurrences;

export const structuredDemo = `<section id="structured-preview" class="structured-preview" aria-labelledby="structured-title">
      <h2 id="structured-title">Programmatic citations</h2>
      <p>Try the map and table citations. Each opens the same source, and its single reference has a return link for each caption. This example uses records and occurrence IDs supplied by the page.</p>
      <citation-inspector id="structured-reader" panel-title="Climate sources">
        <p><strong>Map caption.</strong> Baseline ${anchor(map)}.</p>
        <p><strong>Table caption.</strong> Comparison baseline ${anchor(table)}.</p>
        <p><strong>Earlier release.</strong> Open the ${anchor(prior)}. Both releases share a demo collection code and link to the publisher’s catalog.</p>
        <p><strong>Editor’s note.</strong> The ${anchor(missing)} is still unresolved.</p>
        <h3>Climate references</h3>
        ${endnotes(plan)}
      </citation-inspector>
      <div class="structured-controls" hidden>
        <button type="button" id="structured-open-host">Open map details</button>
        <label><input id="structured-dark" type="checkbox"> Dark colors for this example</label>
      </div>
      <dialog class="structured-host" id="structured-host" aria-labelledby="structured-host-title">
        <h3 id="structured-host-title">Map details</h3>
        <p>Open the source, then press Escape twice. The first press returns to the citation, and the second closes Map details.</p>
        <citation-inspector id="structured-host-reader" panel-title="Map source">
          <p>Map baseline ${anchor(dialogPlan.occurrences[0])}.</p>
          ${endnotes(dialogPlan)}
        </citation-inspector>
        <form method="dialog"><button autofocus>Close map details</button></form>
      </dialog>
      <p>Disable JavaScript to try the reference links and both return links. <a href="./structured-preview.mjs">View the example’s JavaScript</a>.</p>
    </section>`;

const asJSArray = items => `[\n${items.map(item => "  " + JSON.stringify(item)).join(",\n")}\n]`;

export function structuredModule(browserModule, client) {
  return `import { bindCitationTrigger, initializeCitationInspector } from ${JSON.stringify(browserModule)};
const cache = { schema: ${JSON.stringify(cache.schema)}, records: ${asJSArray(records)} };
const occurrences = ${asJSArray(plan.occurrences)};
const dialogOccurrences = ${asJSArray(dialogPlan.occurrences)};

${client}`;
}
