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
