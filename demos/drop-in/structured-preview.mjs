import { bindCitationTrigger, initializeCitationInspector } from "./citation-inspector.mjs";
const cache = { schema: "citation-inator.cache.v1", records: [
  {"type":"dataset","state":"resolved","authors":[{"literal":"NOAA National Centers for Environmental Information"}],"relatedIdentifiers":[{"label":"Collection code","value":"CLIMATE-NORMALS","authority":"Demo catalog"}],"locations":[{"kind":"publisher","provider":"NOAA National Centers for Environmental Information","url":"https://www.ncei.noaa.gov/products/land-based-station/us-climate-normals"}],"provenance":[{"provider":"NOAA National Centers for Environmental Information","url":"https://www.ncei.noaa.gov/products/land-based-station/us-climate-normals","note":"The publisher page describes both releases."}],"id":"normals-current","title":"U.S. Climate Normals, 1991–2020","issued":[2021]},
  {"type":"dataset","state":"resolved","authors":[{"literal":"NOAA National Centers for Environmental Information"}],"relatedIdentifiers":[{"label":"Collection code","value":"CLIMATE-NORMALS","authority":"Demo catalog"}],"locations":[{"kind":"publisher","provider":"NOAA National Centers for Environmental Information","url":"https://www.ncei.noaa.gov/products/land-based-station/us-climate-normals"}],"provenance":[{"provider":"NOAA National Centers for Environmental Information","url":"https://www.ncei.noaa.gov/products/land-based-station/us-climate-normals","note":"The publisher page describes both releases."}],"id":"normals-previous","title":"U.S. Climate Normals, 1981–2010","issued":[2011]},
  {"id":"station-log","title":"Station relocation log","state":"unresolved","note":"The editor has a title but no verified record or destination."}
] };
const occurrences = [
  {"occurrenceId":"map-caption","anchorId":"citation_15-climate-example-occurrence-map-caption","recordId":"normals-current","tags":[],"siteOccurrences":[],"endnoteId":"citation_15-climate-example-note-normals-current","label":"1991–2020 normals","bibliographyParts":[{"text":"NOAA National Centers for Environmental Information (2021). "},{"text":"U.S. Climate Normals, 1991–2020","titleField":"title"},{"text":"."}]},
  {"occurrenceId":"table-caption","anchorId":"citation_15-climate-example-occurrence-table-caption","recordId":"normals-current","tags":[],"siteOccurrences":[],"endnoteId":"citation_15-climate-example-note-normals-current","label":"1991–2020 normals","bibliographyParts":[{"text":"NOAA National Centers for Environmental Information (2021). "},{"text":"U.S. Climate Normals, 1991–2020","titleField":"title"},{"text":"."}]},
  {"occurrenceId":"earlier-release","anchorId":"citation_15-climate-example-occurrence-earlier-release","recordId":"normals-previous","tags":[],"siteOccurrences":[],"endnoteId":"citation_15-climate-example-note-normals-previous","label":"1981–2010 normals","bibliographyParts":[{"text":"NOAA National Centers for Environmental Information (2011). "},{"text":"U.S. Climate Normals, 1981–2010","titleField":"title"},{"text":"."}]},
  {"occurrenceId":"station-log","anchorId":"citation_15-climate-example-occurrence-station-log","recordId":"station-log","tags":[],"siteOccurrences":[],"endnoteId":"citation_15-climate-example-note-station-log","label":"Station relocation log","bibliographyParts":[{"text":"Station relocation log"}]}
];
const dialogOccurrences = [
  {"occurrenceId":"map-caption","anchorId":"citation_15-climate-details-occurrence-map-caption","recordId":"normals-current","tags":[],"siteOccurrences":[],"endnoteId":"citation_15-climate-details-note-normals-current","label":"1991–2020 normals","bibliographyParts":[{"text":"NOAA National Centers for Environmental Information (2021). "},{"text":"U.S. Climate Normals, 1991–2020","titleField":"title"},{"text":"."}]}
];

const preview = document.getElementById("structured-preview");
const dialog = document.getElementById("structured-host");
const open = document.getElementById("structured-open-host");
const dark = document.getElementById("structured-dark");

function bindPlan(inspectorId, plannedOccurrences, focusFallback) {
  const inspector = document.getElementById(inspectorId);
  initializeCitationInspector(inspector, { cache });
  for (const occurrence of plannedOccurrences) {
    bindCitationTrigger(inspector, document.getElementById(occurrence.anchorId), occurrence, {
      endnote: document.getElementById(occurrence.endnoteId), focusFallback
    });
  }
}

bindPlan("structured-reader", occurrences, () => open);
bindPlan("structured-host-reader", dialogOccurrences, () => dialog.querySelector("button"));

if (typeof dialog.showModal === "function") open.addEventListener("click", () => dialog.showModal());
else open.hidden = true;
dark.addEventListener("change", () => preview.toggleAttribute("data-dark", dark.checked));
preview.toggleAttribute("data-dark", dark.checked);
preview.querySelector(".structured-controls").hidden = false;

// A host that handles Escape in capture still receives it when its own dialog owns focus.
document.addEventListener("keydown", event => {
  if (dialog.open && event.key === "Escape" && !event.defaultPrevented) {
    event.preventDefault();
    dialog.close();
  }
}, { capture: true });
