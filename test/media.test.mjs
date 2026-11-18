import assert from "node:assert/strict";
import test from "node:test";
import { makeCache, toCSL } from "../src/records.mjs";
import { bibliographyText, compileCitations } from "../src/compiler.mjs";

test("media metadata preserves attribution, literal dates, rights and distinct source and served checksums", () => {
  const digest = "a".repeat(64), served = "b".repeat(64);
  const record = makeCache([{
    id: "painting", type: "artwork", state: "resolved", title: "The Prairie on Fire", issued: [1827],
    authors: [{ family: "Fisher", given: "Alvan" }], creatorAttribution: "Attributed to",
    displayDate: "1830/34", medium: "Oil on canvas", dimensions: "60 × 90 cm",
    holdingInstitution: "Example museum", accession: "1920.4",
    license: { name: "CC BY-SA 4.0", url: "https://creativecommons.org/licenses/by-sa/4.0/" },
    rightsHolder: "Example rights holder", contributors: [{ name: "Uploader", role: "uploader" }],
    provenance: [{ provider: "Museum", checksums: [
      { algorithm: "SHA-256", value: digest, role: "source" }, { algorithm: "sha256", value: served, role: "served" }
    ] }]
  }]).records[0];
  assert.equal(record.type, "artwork");
  assert.equal(record.provenance[0].checksums[1].value, served);
  assert.equal(record.provenance[0].checksums[0].role, "source");
  assert.match(bibliographyText(record, "", "chicago-author-date"), /^Attributed to Fisher, Alvan\. 1830\/34\. The Prairie on Fire\. Oil on canvas\./);
  const csl = toCSL(record);
  assert.equal(csl.type, "graphic");
  assert.deepEqual(csl.issued, { literal: "1830/34" });
  assert.equal(csl.archive_location, "1920.4");
  assert.equal(csl.author[0].family, "Fisher");
  assert(!JSON.stringify(csl.author).includes("Uploader"));
  const unknown = { ...record, id: "unknown", authors: [], displayDate: "c. 1500", creatorAttribution: "" };
  assert.match(bibliographyText(unknown, "", "chicago-author-date"), /^The Prairie on Fire\. c\. 1500\./);
  const { html } = compileCitations("{citation list painting}", makeCache([record]), { inspectAppearance: "icon", inspectPlacement: "before" });
  assert(html.indexOf("data-ci-inspect-icon") < html.indexOf("<em>The Prairie on Fire"));
  assert.match(html, /aria-label="Inspect reference: The Prairie on Fire"/);
});

test("media date suffixes agree, canonical export wins, and authored references retain uncertainty", () => {
  const base = {
    type: "artwork", state: "resolved", authors: [{ literal: "Example artist" }],
    creatorAttribution: "Attributed to", identifiers: [{ scheme: "url", value: "https://canonical.example/work" }],
    locations: [{ kind: "publisher", provider: "Museum", url: "https://museum.example/catalog" }]
  };
  const cache = makeCache([{ ...base, id: "a", title: "A work" }, { ...base, id: "b", title: "B work", identifiers: [] }]);
  const result = compileCitations("{citation a; b}", cache, { citationStyle: "apa" });
  assert.match(result.html, /\(n\.d\.-a\)\. A work/);
  assert.match(result.html, /\(n\.d\.-b\)\. B work/);
  const csl = toCSL(cache.records[0]);
  assert.equal(csl.URL, "https://canonical.example/work");
  assert.match(csl.note, /Attributed to/);
  const curated = makeCache([{ ...base, id: "curated", title: "Study.", citationText: "Curator-written reference" }]).records[0];
  assert.equal(bibliographyText(curated, "", "default"), "Curator-written reference");
  assert(!bibliographyText({ ...curated, citationText: "" }, "", "chicago-author-date").includes("Study.."));
});

test("plain and italic title offsets identify the title independently of the byline", () => {
  for (const citationStyle of ["default", "apa", "chicago-author-date", "mla", "harvard", "vancouver"]) {
    const cache = makeCache([{
      id: "nature", title: "Nature", authors: [{ literal: "Nature" }], type: "webpage", state: "resolved", issued: [2020]
    }]);
    const { html } = compileCitations("{citation nature}", cache, { citationStyle });
    const match = html.match(/<span dir="auto" data-ci-title-start="(\d+)" data-ci-title-length="(\d+)">([^]*?)<\/span>/);
    assert(match, citationStyle);
    const plain = match[3].replace(/<[^>]*>/g, "").replaceAll("&amp;", "&").replaceAll("&quot;", '"');
    const start = Number(match[1]);
    assert.equal(plain.slice(start, start + Number(match[2])), "Nature", citationStyle);
    assert(start > 0, citationStyle);
  }
});
