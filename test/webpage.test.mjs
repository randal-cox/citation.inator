import assert from "node:assert/strict";
import test from "node:test";
import { bibliographyText, compileCitations, planCitationOccurrences } from "../src/compiler.mjs";
import { makeCache } from "../src/records.mjs";

const publisherURL = "https://example.org/field-notes";
const canonicalURL = "https://example.org/canonical";
const organization = "Harbor Observatory";
const webpage = {
  id: "field-notes", type: "webpage", state: "resolved",
  title: "Field notes from the coast", issued: [2024],
  authors: [{ literal: organization }], publisher: organization,
  locations: [{ kind: "publisher", provider: organization, url: publisherURL }]
};
const formatted = (record, style) => bibliographyText(makeCache([record]).records[0], "", style);

for (const style of ["default", "apa"]) {
  test(`${style} webpage references show and link the publisher fallback in each output`, () => {
    const cache = makeCache([{
      ...webpage,
      containerTitle: organization,
      locations: [...webpage.locations, { ...webpage.locations[0], provider: "Second listing" }]
    }]);
    const text = `${organization}. (2024). Field notes from the coast. ${publisherURL}`;
    assert.equal(bibliographyText(cache.records[0], "", style), text);
    const { html } = compileCitations("{citation field-notes}", cache, { citationStyle: style });
    assert.match(html, /<em>Field notes from the coast<\/em>\. <a href="https:\/\/example\.org\/field-notes"[^>]*>https:\/\/example\.org\/field-notes<\/a>/);
    const plan = planCitationOccurrences([{ occurrenceId: "caption", recordId: webpage.id }], cache, {
      namespace: "example", citationStyle: style
    });
    assert.deepEqual(plan.endnotes[0].parts, plan.occurrences[0].bibliographyParts);
    assert.deepEqual(plan.endnotes[0].parts.at(-1), { text: publisherURL, href: publisherURL });
  });

  test(`${style} webpage references prefer identity and leave access destinations separate`, () => {
    const url = { scheme: "url", value: canonicalURL };
    const doi = { scheme: "doi", value: "10.1000/field-notes" };
    assert(formatted({ ...webpage, identifiers: [url] }, style).endsWith(canonicalURL));
    assert(formatted({ ...webpage, identifiers: [url, doi] }, style).endsWith("https://doi.org/10.1000/field-notes"));
    assert(!formatted({
      ...webpage,
      locations: [...webpage.locations, { ...webpage.locations[0], url: "https://example.org/second" }]
    }, style).includes("https://"));
    assert(!formatted({
      ...webpage,
      locations: ["library", "repository", "full-text"].map(kind => ({ ...webpage.locations[0], kind }))
    }, style).includes("https://"));
    assert(!formatted({ ...webpage, type: "book" }, style).includes("https://"));
    assert(formatted({ ...webpage, publisher: "Distinct Website" }, style).includes("Distinct Website. "));
    assert.equal(formatted({ ...webpage, citationParts: [{ text: "Curated reference" }] }, style), "Curated reference");
  });
}

test("default webpage references retain authored citation text", () => {
  assert.equal(formatted({ ...webpage, citationText: "Curated reference" }, "default"), "Curated reference");
});
