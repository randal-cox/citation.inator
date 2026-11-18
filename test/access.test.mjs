import assert from "node:assert/strict";
import test from "node:test";
import { accessCatalog, normalizeAccessProfile, accessProfileState, groupAccess, libraryURL, serviceFor } from "../src/access.mjs";
import { getAccessProfile, setAccessProfile, subscribeAccessProfile } from "../src/access-profile.mjs";
import { makeCache } from "../src/records.mjs";

function fakeWindow(fail = false) {
  const values = new Map();
  return Object.assign(new EventTarget(), { localStorage: {
    getItem: key => values.get(key) || null,
    setItem(key, value) { if (fail) throw new Error("blocked"); values.set(key, value); },
    removeItem(key) { if (fail) throw new Error("blocked"); values.delete(key); }
  } });
}

test("profile changes synchronize consumers and preserve unknown, none and memory-only states", () => {
  for (const fail of [false, true]) {
    const view = fakeWindow(fail), options = { window: view };
    const states = [];
    const stop = subscribeAccessProfile(value => states.push(value.state), options);
    assert.equal(getAccessProfile(options), null);
    setAccessProfile({ services: [] }, options);
    assert.deepEqual(getAccessProfile(options).services, []);
    setAccessProfile({ services: ["jstor"], preferred: "jstor" }, options);
    const copy = getAccessProfile(options);
    copy.services.push("perlego");
    assert.deepEqual(getAccessProfile(options).services, ["jstor"]);
    setAccessProfile(null, options);
    assert.equal(getAccessProfile(options), null);
    assert.deepEqual(states, ["none", ["jstor"], "unknown"]);
    stop();
  }
  assert.throws(() => normalizeAccessProfile({ services: [], preferred: "jstor" }));
  assert.equal(accessProfileState(null), "unknown");
});

test("catalogues are isolated and openness is a property of the copy", () => {
  const catalog = accessCatalog([{ id: "hathi-trust", label: "Hathi Trust", kind: "library" }, { id: "jstor", label: "My JSTOR" }, { id: "perlego", remove: true }]);
  assert.equal(catalog.find(item => item.id === "jstor").label, "My JSTOR");
  assert.equal(accessCatalog().find(item => item.id === "jstor").label, "JSTOR");
  assert.equal(serviceFor({ provider: "JSTOR" }).kind, "subscription");
  assert.equal(serviceFor({ provider: "Unrecognized" }).kind, "publisher");
  const items = [
    { kind: "pdf", access: "unknown" },
    { kind: "pdf", access: "open" },
    { service: "perlego", access: "subscription" }, { service: "jstor", access: "subscription" }
  ];
  const groups = groupAccess(items, { services: ["perlego", "jstor"], preferred: "jstor" });
  assert.deepEqual(groups.free, [items[1]]);
  assert.deepEqual(groups.selected, [items[3], items[2]]);
  assert.deepEqual(groups.other, [items[0]]);
});

test("library links are encoded KEV or proxy URLs and never conflate access with citation identity", () => {
  const record = makeCache([{
    id: "book", type: "book", state: "resolved", title: "A & B", issued: [2020],
    authors: [{ family: "Cox", given: "Randal" }],
    identifiers: [{ scheme: "doi", value: "10.1000/test" }, { scheme: "isbn", value: "9780521405997" }]
  }]).records[0];
  const url = new URL(libraryURL(record, { kind: "openurl", base: "https://library.example/resolve?tenant=one" }));
  assert.equal(url.searchParams.get("rft_id"), "info:doi/10.1000/test");
  assert.equal(url.searchParams.get("rft.btitle"), "A & B");
  assert.equal(url.searchParams.get("tenant"), "one");
  assert.equal(url.searchParams.get("rft.isbn"), "9780521405997");
  const proxy = libraryURL(record, { kind: "proxy", base: "https://proxy.example/login?url=" });
  assert.equal(new URL(proxy).searchParams.get("url"), "https://doi.org/10.1000/test");
  assert.throws(() => normalizeAccessProfile({ services: [], library: { kind: "proxy", base: "javascript:alert(1)" } }));
});

test("book chapter resolver metadata retains chapter and collection titles", () => {
  const record = makeCache([{
    id: "chapter", type: "chapter", title: "The chapter", containerTitle: "The collection", state: "resolved",
    identifiers: [{ scheme: "issn", value: "0028-0836" }]
  }]).records[0];
  const query = new URL(libraryURL(record, { kind: "openurl", base: "https://example.org/resolve" })).searchParams;
  assert.equal(query.get("rft.genre"), "bookitem");
  assert.equal(query.get("rft.atitle"), "The chapter");
  assert.equal(query.get("rft.btitle"), "The collection");
  assert.equal(query.get("rft.jtitle"), null);
  assert.equal(query.get("rft.issn"), "0028-0836");
});
