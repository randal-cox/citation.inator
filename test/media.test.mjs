import assert from "node:assert/strict";
import test from "node:test";
import { makeCache, toCSL } from "../src/records.mjs";
import { rebaseCitationFragment } from "../src/markup.mjs";
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
  const { html } = compileCitations("{cite list painting}", makeCache([record]), { inspectAppearance: "icon", inspectPlacement: "before" });
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
  const result = compileCitations("{cite a; b}", cache, { citationStyle: "apa" });
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
    const { html } = compileCitations("{cite nature}", cache, { citationStyle });
    const match = html.match(/<span dir="auto" data-ci-title-start="(\d+)" data-ci-title-length="(\d+)">([^]*?)<\/span>/);
    assert(match, citationStyle);
    const plain = match[3].replace(/<[^>]*>/g, "").replaceAll("&amp;", "&").replaceAll("&quot;", '"');
    const start = Number(match[1]);
    assert.equal(plain.slice(start, start + Number(match[2])), "Nature", citationStyle);
    assert(start > 0, citationStyle);
  }
});

test("leading inspect icons omit empty actions and support a colour-inheriting mask", () => {
  const cache = makeCache([{ id: "work", type: "book", title: "Work", authors: [{ family: "Author" }], issued: [2020], state: "resolved" }]);
  const source = "{cite list work}\n\n{cite list work}";
  const options = { inspectAppearance: "icon", inspectPlacement: "before", inspectIcon: "/book.svg", namespace: "icons" };
  const image = compileCitations(source, cache, options).html;
  assert(!image.includes('data-citation-part="note-actions"'));
  assert.match(image, /<img src="\/book\.svg" alt=""/);
  const masked = compileCitations(source, cache, { ...options, inspectIconMode: "mask" }).html;
  assert(!masked.includes('data-citation-part="note-actions"'));
  assert.match(masked, /mask-type="alpha"/);
  assert.match(masked, /fill="currentColor"/);
  assert.match(masked, /<image href="\/book\.svg"/);
  const ids = [...masked.matchAll(/<mask id="([^"]+)"/g)].map(match => match[1]);
  assert.equal(ids.length, 2);
  assert.equal(new Set(ids).size, 2);
  const rebased = rebaseCitationFragment(masked, "icons", "other");
  assert.match(rebased, /<mask id="other_inspect-mask-1"/);
  assert.match(rebased, /mask="url\(#other_inspect-mask-1\)"/);
  assert(!rebased.includes('id="icons_inspect-mask-'));
  assert.throws(() => compileCitations(source, cache, { ...options, inspectIcon: "javascript:alert(1)" }));
  assert.throws(() => compileCitations(source, cache, { ...options, inspectIconMode: "raw" }));
  const notes = compileCitations("{cite nocite work}", cache, { ...options, inspectPlacement: "before" }).html;
  assert(!notes.includes('data-citation-part="note-actions"'));
});
