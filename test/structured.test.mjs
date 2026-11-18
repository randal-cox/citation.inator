import assert from "node:assert/strict";
import test from "node:test";
import { compileCitations, planCitationOccurrences } from "../src/compiler.mjs";
import { makeCache, readCache } from "../src/records.mjs";

const related = [{ label: "Catalog number", value: "B-19", authority: "Museum register" }];
const cache = makeCache([
  { id: "first-edition", title: "Field guide", type: "book", authors: [{ family: "Mori" }], issued: [2001], state: "resolved", relatedIdentifiers: related },
  { id: "second-edition", title: "Field guide", type: "book", authors: [{ family: "Mori" }], issued: [2001], state: "resolved", relatedIdentifiers: related },
  { id: "unknown-entry", title: "Unconfirmed field notes", state: "unresolved" }
]);

test("structured citations preserve occurrence identities through reordering and retain edition-specific endnotes", () => {
  const occurrences = [
    { occurrenceId: "table-row-a", recordId: "first-edition", locator: "33", context: "North transect" },
    { occurrenceId: "table-row-b", recordId: "second-edition" },
    { occurrenceId: "caption", recordId: "first-edition", label: "Field guide caption" }
  ];
  const plan = planCitationOccurrences(occurrences, cache, { namespace: "survey", citationStyle: "apa" });
  const reversed = planCitationOccurrences(occurrences.toReversed(), cache, { namespace: "survey", citationStyle: "apa" });
  assert.equal(plan.schema, "citation-inator.occurrence-plan.v1");
  assert.deepEqual(plan.occurrences, reversed.occurrences.toReversed());
  assert.match(plan.occurrences[0].label, /2001a, p\. 33/);
  assert.match(plan.occurrences[1].label, /2001b/);
  assert.equal(plan.occurrences[2].label, "Field guide caption");
  assert.deepEqual(plan.endnotes.map(note => note.backlinks.map(backlink => backlink.href)), [
    [`#${plan.occurrences[0].anchorId}`, `#${plan.occurrences[2].anchorId}`],
    [`#${plan.occurrences[1].anchorId}`]
  ]);
  assert.equal(plan.endnotes[0].backlinks[0].context, "North transect");
  assert.deepEqual(readCache(cache).byId.get("second-edition").relatedIdentifiers, related);
  assert.equal(readCache(cache).byIdentifier.size, 0);
});

test("different structured namespaces cannot overlap by containing an ID delimiter", () => {
  const first = planCitationOccurrences([{ occurrenceId: "detail-occurrence-caption", recordId: "first-edition" }], cache, { namespace: "map" });
  const second = planCitationOccurrences([{ occurrenceId: "caption", recordId: "first-edition" }], cache, { namespace: "map-occurrence-detail" });
  assert.notEqual(first.occurrences[0].anchorId, second.occurrences[0].anchorId);

  const noteCache = makeCache([
    { id: "detail-note-caption", title: "First notes", state: "resolved" },
    { id: "caption", title: "Second notes", state: "resolved" }
  ]);
  const left = planCitationOccurrences([{ occurrenceId: "caption", recordId: "detail-note-caption" }], noteCache, { namespace: "map" });
  const right = planCitationOccurrences([{ occurrenceId: "caption", recordId: "caption" }], noteCache, { namespace: "map-note-detail" });
  assert.notEqual(left.endnotes[0].id, right.endnotes[0].id);
});

test("structured endnotes coexist with legacy compiled notes using a neighboring namespace", () => {
  const plan = planCitationOccurrences([{ occurrenceId: "caption", recordId: "first-edition" }], cache, { namespace: "map" });
  const legacy = compileCitations("{citation first-edition}", cache, { namespace: "citation-3-map" });
  const legacyIds = new Set([...legacy.html.matchAll(/ id="([^"]+)"/g)].map(match => match[1]));
  assert(legacyIds.has("citation-3-map-note-first-edition"));
  for (const id of [plan.occurrences[0].anchorId, plan.endnotes[0].id]) assert(!legacyIds.has(id), id);
});

test("structured plans distinguish unresolved records from unknown or duplicate occurrence input", () => {
  const occurrence = { occurrenceId: "caption", recordId: "unknown-entry" };
  assert.throws(() => planCitationOccurrences([occurrence], cache), /namespace/);
  assert.throws(() => planCitationOccurrences([occurrence, occurrence], cache, { namespace: "test" }), /unique/);
  assert.throws(() => planCitationOccurrences([{ ...occurrence, recordId: "missing" }], cache, { namespace: "test" }), /Unknown citation record/);
  const plan = planCitationOccurrences([occurrence], cache, { namespace: "test" });
  assert.equal(plan.endnotes[0].state, "unresolved");
  assert.equal(plan.occurrences[0].label, "(Unresolved citation)");
  assert.equal(plan.diagnostics[0].state, "unresolved");
});
