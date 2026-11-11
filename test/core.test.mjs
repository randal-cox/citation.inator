import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { test } from "node:test";
import { compileCitations, createCitationCompiler, parseDirectives } from "../src/compiler.mjs";
import { DAY, identifierURL, makeCache, normalizeIdentifier, readCache, toCSL } from "../src/records.mjs";
import { createCrossrefResolver } from "../src/crossref.mjs";
import { demoCache } from "../scripts/demo-cache.mjs";

const fixtures = JSON.parse(await readFile(new URL("../fixtures/citation-demo-cases.json", import.meta.url), "utf8"));
const cache = demoCache(fixtures);
const key = "doi:10.1017/s0003055419000534";
const seed = readCache(cache).byIdentifier.get(key);

test("identifier types preserve identity and reject unsafe destinations", () => {
  for (const [input, scheme, value] of [
    ["https://doi.org/10.1017/S0003055419000534", "doi", "10.1017/s0003055419000534"],
    ["pmid:123456", "pmid", "123456"],
    ["https://pmc.ncbi.nlm.nih.gov/articles/PMC123456/", "pmcid", "PMC123456"],
    ["https://arxiv.org/pdf/hep-th/9901001v2.pdf", "arxiv", "hep-th/9901001v2"],
    ["isbn:978-0-593-65643-3", "isbn", "9780593656433"],
    ["dataset:https://doi.org/10.1111/DATA", "doi", "10.1111/data"],
    ["software:10.1111/software", "doi", "10.1111/software"]
  ]) assert.deepEqual(normalizeIdentifier(input), { scheme, value });
  for (const input of ["url:javascript:alert(1)", "url:https://doi.org@evil.test/", "doi:10.1/abc", "isbn:9780593656430", "pmcid:123", "pmid:0"]) {
    assert.equal(normalizeIdentifier(input), null);
  }
  assert.equal(identifierURL(normalizeIdentifier("https://arxiv.org/abs/2401.12345v3")), "https://arxiv.org/abs/2401.12345v3");
});

test("escape rules, narrative and groups, malformed literal, unique backlinks", () => {
  assert.deepEqual(parseDirectives(String.raw`\{cite a\}`).map(token => token.type), ["text", "text", "text"]);
  const unrelated = parseDirectives(String.raw`Render {literal \{open\}}.`);
  assert.equal(unrelated.map(token => token.text).join(""), "Render {literal {open}}.");
  assert.equal(parseDirectives('{cite item | label:"<x> | two; three"}')[0].items[0].label, "<x> | two; three");
  assert.equal(parseDirectives("{cite item | form:narrative; other}")[0].malformed, true);
  const output = compileCitations(`First mention of {cite ${key} | form:narrative}.

Compare the two works {cite ${key}; isbn:9780593656433}. {cite pmid:x}. {cite 10.1111/missing | label:"<source>"}.

{endnotes}`, cache);
  assert.match(output.html, />Simas et al\. \(2020\)<\/a>/);
  assert.match(output.html, />Simas et al\., 2020<\/a>; <a/);
  assert.match(output.html, /-polarization-1" aria-label="Return to “First mention of/);
  assert.match(output.html, /-polarization-2" aria-label="Return to “Compare the two works/);
  assert.match(output.html, /aria-label="Look up ISBN" title="Look up ISBN\nhttps:\/\/search.worldcat.org/);
  assert.equal(output.cache.records.find(record => record.id === seed.id).abstract.kind, "excerpt");
  assert.match(output.html, /\{cite pmid:x\}/);
  assert.match(output.html, /&lt;source&gt;/);
  assert.match(output.html, /https:\/\/doi.org\/10.1111\/missing/);
  assert.equal(output.diagnostics.length, 2);
});

test("the configured keyword applies to citations, endnotes, evidence and software credit", () => {
  const compiler = createCitationCompiler({ citationKeyword: "ref" });
  const source = `{ref ${key}} {ref evidence} {ref credit} {ref evidence}

{ref endnote}`;
  const output = compiler.compile(source, cache, { namespace: "custom" });
  assert.match(output.html, /Simas et al\., 2020/);
  assert.match(output.html, /id="custom-endnotes"/);
  const spaced = compiler.compile(`{ref ${key}}\r\n\r\n\r\n  {ref endnote}  \r\n\r\nAfter.`, cache);
  assert.ok(spaced.html.indexOf('class="citation-endnotes"') < spaced.html.indexOf("<p>After.</p>"));
  assert.doesNotMatch(spaced.html, /\{ref endnote\}/);
  assert.equal(output.html.match(/id="custom-evidence"/g).length, 1);
  assert.equal(output.html.match(/href="#custom-evidence"/g).length, 2);
  assert.match(output.html, /Cox, R\..*Computer software/);
  assert.equal(compiler.parse("{citation credit}")[0].type, "text");
  assert.equal(compiler.parse(String.raw`\{ref credit\}`).some(token => token.type === "annotation"), false);
  assert.equal(compiler.parse("{cite local-work}")[0].type, "citation");
  assert.throws(() => createCitationCompiler({ citationKeyword: "Bad keyword" }), /lowercase citation keyword/);
  assert.throws(() => createCitationCompiler({ citationKeyword: null }), /lowercase citation keyword/);
  assert.throws(() => parseDirectives("", { citationKeyword: ["ref"] }), /lowercase citation keyword/);
});

test("a custom class prefix applies to every generated part without changing anchors", () => {
  const source = `{citation ${key}} {citation credit}\n\n{citation endnote}`;
  const built = compileCitations(source, cache);
  const custom = createCitationCompiler({ classPrefix: "my-site" }).compile(source, cache);
  assert.match(built.html, /class="citation-cite"/);
  assert.match(custom.html, /class="my-site-cite my-site-annotation"/);
  assert.match(custom.html, /class="my-site-endnotes"/);
  assert.match(custom.html, /class="my-site-icon"/);
  assert.doesNotMatch(custom.html, /class="citation-/);
  const anchors = html => [...html.matchAll(/ id="([^"]+)"/g)].map(match => match[1]);
  assert.deepEqual(anchors(custom.html), anchors(built.html));
  assert.throws(() => createCitationCompiler({ classPrefix: "has spaces" }), /class prefix/);
});

test("edition IDs stay distinct and year suffixes follow bibliography order", () => {
  const records = readCache(cache);
  const jstor = records.byIdentifier.get("doi:10.2307/j.ctv2wr4wbd");
  const isbn = records.byIdentifier.get("isbn:9780691198927");
  assert.notEqual(jstor.id, isbn.id);
  assert.equal(toCSL(jstor).ISBN, undefined);
  assert.throws(() => makeCache([isbn, { ...jstor, identifiers: isbn.identifiers }]), /Conflicting records/);
  const a = { ...seed, id: "alpha", title: "A prior work", identifiers: [], citationText: "" };
  const b = { ...a, id: "beta", title: "B later work" };
  const output = compileCitations("{cite beta; alpha}\n\n{endnotes}", makeCache([b, a]));
  assert.match(output.html, />Simas et al\., 2020b<\/a>; <a.+>Simas et al\., 2020a<\/a>/);
  assert.match(output.html, /\(2020a\)\. A prior work/);
  assert.match(output.html, /\(2020b\)\. B later work/);
});

test("provider keeps raw evidence and last-known-good record across partial, mismatch, 503 and backoff", async () => {
  let time = Date.parse("2026-11-14");
  let hits = 0;
  const store = new Map();
  const partial = { message: { DOI: key.slice(4), title: ["Conflicting title"], author: [{ given: "No family" }] } };
  const replies = [
    Response.json(partial),
    Response.json({ message: { ...partial.message, DOI: "10.1111/different" } }),
    new Response("outage", { status: 503, headers: { "retry-after": "30" } })
  ];
  const resolver = createCrossrefResolver({
    fetch: async () => { hits++; return replies.shift(); }, store, minInterval: 0, now: () => time
  });
  const first = await resolver.resolve(key, { seed, force: true });
  assert.equal(first.state, "partial");
  assert.equal(first.freshness, "stale");
  assert.deepEqual(first.record, seed);
  assert.deepEqual(first.attempt.raw, partial);
  assert.equal((await resolver.resolve(key, { force: true })).state, "error");
  assert.equal((await resolver.resolve(key, { force: true })).state, "error");
  assert.equal((await resolver.resolve(key, { force: true })).state, "error");
  assert.equal(hits, 3);
  assert.equal(store.get(key).attempts.length, 3);
  assert.deepEqual(store.get(key).record, seed);
});

test("concurrent refreshes coalesce, retain date distinctions, and negative-cache until forced", async () => {
  let hits = 0;
  let time = Date.parse("2026-11-14");
  const complete = { message: {
    DOI: key.slice(4), title: [seed.title], author: seed.authors, type: "journal-article",
    "published-online": { "date-parts": [[2019, 10, 31]] },
    "published-print": { "date-parts": [[2020, 2]] }
  } };
  const store = new Map();
  const resolver = createCrossrefResolver({
    store, now: () => time, minInterval: 0,
    fetch: async url => {
      hits++;
      assert.equal(url.hostname, "api.crossref.org");
      assert.ok(url.pathname.startsWith("/works/10.1017%2F"));
      return hits === 1 ? Response.json(complete) : new Response("No record", { status: 404 });
    }
  });
  const [one, two] = await Promise.all([resolver.resolve(key), resolver.resolve(key)]);
  assert.deepEqual(one, two);
  assert.deepEqual(one.record.issued, [2020, 2]);
  assert.deepEqual(one.record.online, [2019, 10, 31]);
  assert.equal((await resolver.resolve(key)).state, "cached");
  time += 2 * DAY;
  assert.equal((await resolver.resolve(key)).state, "unresolved");
  assert.equal((await resolver.resolve(key)).state, "unresolved");
  assert.equal(hits, 2);
  assert.equal((await resolver.resolve(key, { force: true })).state, "unresolved");
  assert.equal(hits, 3);
  assert.equal(store.get(key).record.title, seed.title);
});


test("a fresh stored record works with or without provider history", async () => {
  const now = () => Date.parse(seed.retrievedAt) + 30_000;
  const fetch = async () => assert.fail("Resolve must reuse fresh cached metadata");
  const store = new Map([[key, { record: seed }]]);
  const resolver = createCrossrefResolver({ store, now, fetch });
  const first = await resolver.resolve(key);
  assert.equal(first.state, "cached");
  assert.equal(first.attempt, null);
  const attempt = { provider: "Crossref", raw: { message: {} } };
  store.set(key, { record: seed, attempts: [attempt] });
  assert.deepEqual((await resolver.resolve(key)).attempt, attempt);
});
