import { compileCitations, escapeHTML } from "../src/compiler.mjs";
import { makeCache } from "../src/records.mjs";

const provider = "Example archive";
const verifiedAt = "2026-11-01T00:00:00Z";
const cache = makeCache([{
  id: "harbor-handbook", type: "book", state: "resolved", title: "Harbor field handbook",
  authors: [{ literal: "Example archive" }], issued: [2024],
  locations: [
    { kind: "pdf", provider, access: "open", url: "https://example.org/handbook.pdf", verifiedAt },
    { kind: "library", provider: "JSTOR", service: "jstor", access: "subscription", url: "https://example.org/jstor-handbook" },
    { kind: "library", provider: "WorldCat", service: "worldcat", access: "unknown", url: "https://example.org/worldcat-handbook" }
  ]
}, {
  id: "harbor-index", type: "webpage", state: "resolved", title: "Harbor collection index",
  authors: [{ literal: provider }], issued: [2024],
  locations: [{ kind: "publisher", provider, access: "unknown", url: "https://example.org/collection" }]
}, {
  id: "harbor-artwork", type: "artwork", state: "resolved", title: "A study of the harbor",
  creatorAttribution: "Attributed to", authors: [{ literal: "Example artist" }],
  displayDate: "1830/34", medium: "Oil on canvas", dimensions: "60 × 90 cm",
  holdingInstitution: "Example archive", accession: "DEMO-42",
  license: { name: "CC BY-SA 4.0", url: "https://creativecommons.org/licenses/by-sa/4.0/" },
  rightsHolder: "Example artist", contributors: [{ name: "Example uploader", role: "uploader" }],
  provenance: [{ provider, checksums: [
    { role: "source", algorithm: "sha256", value: "a".repeat(64) },
    { role: "served", algorithm: "sha256", value: "b".repeat(64) }
  ] }]
}]);

const main = compileCitations(`Open the handbook {citation harbor-handbook} to compare an explicitly open PDF with subscription and library destinations. The collection index {citation harbor-index} has no matching service.

{citation endnote}`, cache, { namespace: "access-example", citationStyle: "chicago-author-date", endnotesHeading: "Access references" });
const media = compileCitations("{citation list harbor-artwork}", cache, {
  namespace: "media-example", citationStyle: "chicago-author-date", inspectAppearance: "icon", inspectPlacement: "before"
});
export const accessDemo = `<section id="access-preview" aria-labelledby="access-preview-title">
  <h2 id="access-preview-title">Reader access and artwork <small>Preview</small></h2>
  <p>These synthetic records use example.org destinations to demonstrate access choices. Select JSTOR in Where you can read, save, and reopen the handbook. The open copy stays first. Both inspectors share your browser settings.</p>
  <p>Access settings <output id="access-profile-state">Not set</output></p>
  <citation-inspector id="access-demo-reader" panel-title="Source and access">${main.html}</citation-inspector>
  <h3>Artwork and compact inspection</h3>
  <p>Open the book-shaped icon. This synthetic artwork has an attributed creator, a date range, rights, a separate uploader, and illustrative checksums for the source and served copies.</p>
  <citation-inspector id="media-demo-reader" panel-title="Artwork and rights">${media.html}</citation-inspector>
  <details><summary>Configuration used here</summary><pre><code>${escapeHTML('initializeCitationInspector(reader, { cache, accessLayout: "grouped", staleAfterDays: 30 });\ncompileCitations(source, cache, { citationStyle: "chicago-author-date", inspectAppearance: "icon", inspectPlacement: "before" });')}</code></pre></details>
</section>`;

export function accessDemoModule(browserModule) {
  return `import { initializeCitationInspector, getAccessProfile } from ${JSON.stringify(browserModule)};
const cache = ${JSON.stringify(cache, null, 2)};
for (const id of ["access-demo-reader", "media-demo-reader"]) {
  initializeCitationInspector(document.getElementById(id), { cache, accessLayout: "grouped", staleAfterDays: 30 });
}
const status = document.getElementById("access-profile-state");
function show(profile) {
  status.textContent = profile === null ? "Not set" : profile.services.length ? profile.services.join(", ") : profile.library ? "Library configured" : "None chosen";
}
show(getAccessProfile());
document.addEventListener("access-profile-changed", event => show(event.detail.profile));
`;
}
