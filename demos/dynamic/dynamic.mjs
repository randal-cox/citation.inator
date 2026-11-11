import { setCitationVariants } from "../static/preferences.mjs";

const form = document.querySelector("#resolve-form");
const status = document.querySelector("#resolution-status");
const reader = document.querySelector("#live-reader");
const showResult = document.querySelector("#show-result");
const resultNames = {
  cached: "Cache hit", resolved: "Resolved", partial: "Partial response",
  unresolved: "Unresolved", error: "Resolution failed"
};
const localTime = new Intl.DateTimeFormat(undefined, { timeStyle: "medium" });
let request;
let next;

function updateEvidence(data) {
  const summary = reader.querySelector("[data-ci-evidence-summary]");
  const details = reader.querySelector("[data-ci-evidence-details]");
  if (!summary || !details) return;
  summary.textContent = data.state === "cached" && data.attempt
    ? "This result came from the cache. The most recent provider attempt is shown below."
    : data.message;
  const label = data.attempt ? "Provider response and merge decisions" : data.record ? "Cached source metadata" : "Lookup result";
  details.previousElementSibling.textContent = label;
  details.setAttribute("aria-label", label);
  details.textContent = JSON.stringify(data.attempt ? { attempt: data.attempt, record: data.record } : data.record, null, 2);
}

function render(data) {
  setCitationVariants(data.styles, html => {
    reader.cache = data.cache;
    // The same-origin demo server supplies HTML escaped by the compiler.
    reader.innerHTML = html;
    updateEvidence(data);
  });
  next = null;
  showResult.hidden = true;
}

showResult.addEventListener("click", () => {
  if (!next) return;
  render(next);
  status.focus({ preventScroll: true });
});
status.tabIndex = -1;

form.querySelectorAll("button").forEach(button => { button.disabled = false; });
for (const example of form.querySelectorAll("[data-example]")) {
  example.addEventListener("click", () => {
    form.elements.identifier.value = example.dataset.example;
    form.elements.identifier.focus();
  });
}

form.addEventListener("submit", async event => {
  event.preventDefault();
  request?.abort();
  const controller = new AbortController();
  request = controller;
  next = null;
  showResult.hidden = true;
  const input = new FormData(form);
  const force = event.submitter?.value === "refresh";
  input.set("force", String(force));
  status.dataset.state = "loading";
  status.textContent = force ? "Refreshing metadata…" : "Checking the cache and resolving the citation…";
  try {
    const response = await fetch(`./resolve?${new URLSearchParams(input)}`, { signal: controller.signal });
    if (!response.ok) throw new Error("The demo server could not process the request.");
    const data = await response.json();
    if (request !== controller) return;
    status.dataset.state = data.state;
    const label = data.record?.title || data.record?.original;
    const age = data.ageSeconds == null ? "" : ` · age ${data.ageSeconds < 3600 ? `${Math.floor(data.ageSeconds / 60)} min` : `${Math.floor(data.ageSeconds / 3600)} hr`}`;
    status.textContent = [
      data.mode !== "live" ? "Simulation." : "",
      `${resultNames[data.state] || "Result"} at ${localTime.format(new Date())}${label ? ` for “${label}”` : ""}.`,
      data.message,
      data.record && data.freshness !== "unknown" ? `Cache ${data.freshness}${age}.` : "",
      data.record && ["error", "unresolved", "partial"].includes(data.state) ? "Showing available metadata." : ""
    ].filter(Boolean).join(" ");
    if (!data.cache) return;
    if (reader.contains(document.activeElement) || reader.querySelector('[aria-expanded="true"]')) {
      next = data;
      showResult.hidden = false;
    } else render(data);
  } catch (error) {
    if (request !== controller || error.name === "AbortError") return;
    status.dataset.state = "error";
    status.textContent = "The resolution service is unavailable. The displayed citation is still available.";
  }
});
