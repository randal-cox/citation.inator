import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { test } from "node:test";
import { parseFragment } from "parse5";
import { compileCitations, createCitationCompiler } from "../src/compiler.mjs";
import { compileHTML, compileMarkdown, rebaseCitationFragment } from "../src/markup.mjs";
import { createOpenLibraryResolver, createOpenLibrarySearch } from "../src/openlibrary.mjs";
import { makeCache, toCSL } from "../src/records.mjs";

const book = {
  id: "ostrom", type: "book", state: "resolved", title: "Governing the Commons", issued: [1990],
  authors: [{ given: "Elinor", family: "Ostrom" }], publisher: "Cambridge University Press", publisherPlace: "Cambridge",
  identifiers: [{ scheme: "isbn", value: "9780521405997" }]
};
const article = {
  id: "study", type: "article-journal", state: "resolved", title: "An example study", issued: [1985],
  authors: [{ given: "Dorothea", family: "Lerman" }, { given: "Brian", family: "Iwata" }],
  containerTitle: "Example Journal", containerAbbreviation: "Example J", volume: "4", issue: "2", pages: "12–34"
};
const cache = makeCache([book, article]);

function nodes(html, condition) {
  const selected = [];
  function scan(node) {
    if (condition(node)) selected.push(node);
    for (const child of node.childNodes || []) scan(child);
  }
  scan(parseFragment(html));
  return selected;
}
const attribute = (node, name) => node.attrs?.find(item => item.name === name)?.value;
const labels = html => nodes(html, node => attribute(node, "data-ci-record")).map(node => node.childNodes[0].value);

test("the five named styles format books and journal articles and Vancouver numbers references in appearance order", () => {
  const styles = {
    "chicago-author-date": [["Ostrom 1990, 34", "Lerman and Iwata 1985", "Ostrom 1990"], /Lerman, Dorothea and Brian Iwata\. 1985\. “An example study\.” <em>Example Journal<\/em> 4 \(2\): 12–34\./],
    apa: [["Ostrom, 1990, p. 34", "Lerman & Iwata, 1985", "Ostrom, 1990"], /Lerman, D\., &amp; Iwata, B\. \(1985\)\. An example study\. <em>Example Journal, 4<\/em>\(2\), 12–34\./],
    mla: [["Ostrom 34", "Lerman and Iwata", "Ostrom"], /Lerman, Dorothea, and Brian Iwata\. “An example study\.” <em>Example Journal<\/em>, vol\. 4, no\. 2, 1985, pp\. 12–34\./],
    harvard: [["Ostrom, 1990, p. 34", "Lerman and Iwata, 1985", "Ostrom, 1990"], /Lerman, D\. and Iwata, B\. \(1985\) ‘An example study’, <em>Example Journal<\/em>, 4 \(2\), pp\. 12–34\./],
    vancouver: [["1, p. 34", "2", "1"], /Lerman D, Iwata B\. An example study\. Example J\. 1985;4\(2\):12–34\./]
  };
  for (const [citationStyle, [expected, bibliography]] of Object.entries(styles)) {
    const { html } = compileCitations("{citation ostrom | locator:34}. {citation study}. {citation ostrom}.", cache, { citationStyle });
    assert.deepEqual(labels(html), expected, citationStyle);
    assert.match(html, bibliography, citationStyle);
    assert.equal(html.indexOf('id="cit-note-ostrom"') < html.indexOf('id="cit-note-study"'), citationStyle === "vancouver");
  }
  assert.throws(() => compileCitations("", cache, { citationStyle: "unknown" }), /Unknown citation style/);
});

test("MLA keeps distinguishing titles when the author is already in the sentence", () => {
  const first = { ...book, title: "Common title: First subtitle" };
  const second = { ...book, id: "other", identifiers: [], title: "Common title: Second subtitle" };
  const { html } = compileCitations(
    "{citation ostrom | locator:34}. Ostrom {citation other | form:suppress-author | locator:34}. {citation other | form:narrative | locator:34}.",
    makeCache([first, second]), { citationStyle: "mla" });
  assert.deepEqual(labels(html), [
    "Ostrom, Common title: First subtitle 34", "Common title: Second subtitle 34",
    "Ostrom (Common title: Second subtitle 34)"
  ]);
});

test("MLA distinguishes identical titles when the records have separate edition identifiers", () => {
  const digital = { ...book, id: "digital", identifiers: [{ scheme: "doi", value: "10.1000/example" }] };
  const { html, diagnostics } = compileCitations("{citation ostrom | locator:34}; {citation digital | locator:34}.",
    makeCache([book, digital]), { citationStyle: "mla" });
  assert.deepEqual(labels(html), [
    "Ostrom, Governing the Commons, ISBN 9780521405997 34", "Ostrom, Governing the Commons, DOI 10.1000/example 34"
  ]);
  assert.deepEqual(diagnostics, []);
});

test("MLA asks for editorial labels only where identical titles still need them", () => {
  const local = makeCache([{ ...book, identifiers: [] }, { ...book, id: "other", identifiers: [] }]);
  const result = compileCitations('{citation ostrom | label:"Print copy"}. {citation other | label:"Local archive copy"}.',
    local, { citationStyle: "mla" });
  assert.deepEqual(labels(result.html), ["Print copy", "Local archive copy"]);
  assert.deepEqual(result.diagnostics, []);
  assert.equal(compileCitations("{citation ostrom; other}", local, { citationStyle: "mla" }).diagnostics.length, 2);
});

test("equivalent ISBN forms share an endnote and conflicting records cannot claim the same edition", () => {
  const isbn10 = { scheme: "isbn", value: "0521405998" };
  const { html, diagnostics } = compileCitations("{citation isbn:0521405998}. {citation isbn:9780521405997}.", cache);
  assert.deepEqual(labels(html), ["Ostrom, 1990", "Ostrom, 1990"]);
  assert.equal(nodes(html, node => node.tagName === "li" && attribute(node, "id")).length, 1);
  assert.deepEqual(diagnostics, []);
  assert.throws(() => makeCache([book, { ...book, id: "alias", identifiers: [isbn10] }]), /Conflicting records/);
  assert.equal(makeCache([{ ...book, identifiers: [isbn10] }]).records[0].identifiers[0].value, isbn10.value);
});

test("Chicago integration preserves formatted text, adds year suffixes and supports affixes within groups", () => {
  const next = {
    ...book, id: "other-book", identifiers: [], title: "Another book",
    citationParts: [{ text: "Ostrom, Elinor. " }, { text: "1990" }, { text: ". " }, { text: "Another <book>", emphasis: "italic" }]
  };
  const compiler = createCitationCompiler({
    citationKeyword: "ref", classPrefix: "essay", citationStyle: "chicago-author-date", endnotesHeading: "References"
  });
  const result = compiler.compile([
    "Ostrom {ref other-book | form:suppress-author; study | prefix:see also}.",
    "Again {ref other-book | locator:p. 34} and {ref ostrom}.", "{ref endnote}"
  ], makeCache([book, next, article]), { namespace: "essay" });
  assert.deepEqual(labels(result.html), ["1990a", "see also Lerman and Iwata 1985", "Ostrom 1990a, p. 34", "Ostrom 1990b"]);
  assert.match(result.html, /<h2 id="essay-endnotes">References<\/h2>/);
  assert.match(result.html, /1990a\. <em>Another &lt;book&gt;<\/em>/);
  assert.match(result.html, /class="essay-cite"/);
  const returns = nodes(result.html, node => attribute(node, "aria-label")?.includes("occurrence"));
  assert.deepEqual(returns.filter(node => attribute(node, "href").includes("other-book")).map(node => node.childNodes[0].value), ["a", "b"]);
});

test("HTML compilation preserves author markup, skips non-prose, and places supplements inside the body", () => {
  const source = '<!doctype html><html><head><title>{citation study}</title></head><body><p class=lead>Some <em>text</em> &amp; {citation ostrom}. <a href="#legacy">{citation study}</a></p><pre>{citation study}</pre><!--{citation study}--><p>{citation endnote}</p><p>{citation credit}</p></body></html>';
  const { html, cache: subset } = compileHTML(source, cache, { namespace: "body-copy" });
  assert.deepEqual(labels(html), ["Ostrom, 1990"]);
  assert.deepEqual(subset.records.map(record => record.id), ["ostrom"]);
  assert.match(html, /<p class=lead>Some <em>text<\/em> &amp; /);
  assert.match(html, /<a href="#legacy">{citation study}<\/a><\/p><pre>{citation study}<\/pre><!--{citation study}--><section/);
  assert.match(html, /id="body-copy-credit"[\s\S]*<\/section><\/body><\/html>$/);
});

test("HTML keeps notation literal in native and ARIA controls", () => {
  const source = '<label>{citation study}</label><details><summary>{citation study}</summary><p>{citation ostrom}</p></details><span role="button" tabindex="0">{citation study}</span><div contenteditable>{citation study}</div>';
  const { html } = compileHTML(source, cache);
  assert.deepEqual(labels(html), ["Ostrom, 1990"]);
  assert.ok(html.includes('<label>{citation study}</label>'));
  assert.ok(html.includes('<summary>{citation study}</summary>'));
  assert.ok(html.includes('<span role="button" tabindex="0">{citation study}</span>'));
});

test("APA inserts a hyphen before suffixes on undated entries", () => {
  const first = { ...book, issued: null, citationParts: [{ text: "Ostrom, E. (n.d.). " }, { text: book.title, emphasis: "italic" }] };
  const second = { ...first, id: "other", identifiers: [], title: "Second work", citationParts: [] };
  const { html } = compileCitations("{citation ostrom; other}", makeCache([first, second]), { citationStyle: "apa" });
  assert.deepEqual(labels(html), ["Ostrom, n.d.-a", "Ostrom, n.d.-b"]);
  assert.match(html, /\(n\.d\.-a\)\. <em>Governing the Commons<\/em>/);
});

test("Markdown preserves author emphasis, skips code, and protects escapes and directive punctuation", () => {
  const { html } = compileMarkdown('An *italic* claim {citation ostrom | prefix:"see *also*"} and `{citation study}`.\n\n\\{citation study}', cache);
  assert.deepEqual(labels(html), ["see *also* Ostrom, 1990"]);
  assert.match(html, /<em>italic<\/em>/);
  assert.match(html, /<code>{citation study}<\/code>/);
  assert.match(html, /<p>{citation study}<\/p>/);
});

test("return link context crosses inline markup without changing the author HTML", () => {
  const input = "<p>First claim <span>{citation ostrom}</span>. Later <em>claim</em> <span>{citation ostrom}</span>.</p>";
  for (const { html } of [
    compileHTML(input, cache),
    compileMarkdown("First claim *{citation ostrom}*. Later *claim* *{citation ostrom}*.", cache)
  ]) {
    const back = nodes(html, node => attribute(node, "aria-label")?.includes("occurrence"));
    assert.match(attribute(back[0], "title"), /First claim.*occurrence a/);
    assert.match(attribute(back[1], "title"), /Later claim.*occurrence b/);
    assert.ok(back.every(link => !attribute(link, "title").includes("{citation")));
  }
});

test("fragment rebasing updates generated targets and references and catches collisions", () => {
  const { html } = compileCitations("Text {citation ostrom}. {citation evidence}", cache, { namespace: "original" });
  const rebased = rebaseCitationFragment('<p id="original-note-host">original stays.</p>' + html, "original", "copy");
  assert.match(rebased, /id="original-note-host"/);
  assert.doesNotMatch(rebased, /(?:id|href|aria-labelledby)="#?original-(?:cite-ostrom|note-ostrom|evidence|endnotes)/);
  assert.match(rebased, /href="#copy-cite-ostrom-1"/);
  assert.match(rebased, /aria-labelledby="copy-endnotes"/);
  assert.throws(() => rebaseCitationFragment('<p id="copy-note-ostrom"></p>' + html, "original", "copy"), /already exists/);
});

test("the JSON CLI returns one clean result for a paragraph batch", () => {
  const run = spawnSync(process.execPath, ["scripts/compile.mjs", "--json"], {
    input: JSON.stringify({
      paragraphs: ["Claim {ref ostrom}.", "{ref endnote}"], cache,
      options: { citationKeyword: "ref", citationStyle: "chicago-author-date", endnotesHeading: "References" }
    }), encoding: "utf8"
  });
  assert.equal(run.status, 0, run.stderr);
  assert.equal(run.stderr, "");
  const result = JSON.parse(run.stdout);
  assert.deepEqual(labels(result.html), ["Ostrom 1990"]);
  assert.match(result.html, />References<\/h2>/);
  assert.deepEqual(result.diagnostics, []);
});

test("Open Library resolves an exact ISBN edition, shares cache semantics, and rejects a mismatched book", async () => {
  const key = "isbn:9780521405997";
  let count = 0;
  const resolver = createOpenLibraryResolver({
    minInterval: 0, fetch: async url => {
      count++;
      assert.equal(url.origin, "https://openlibrary.org");
      assert.equal(url.searchParams.get("bibkeys"), "ISBN:9780521405997");
      return Response.json({ "ISBN:9780521405997": {
        title: book.title, authors: [{ name: "Elinor Ostrom" }], publish_date: "1990",
        identifiers: count === 1 ? { isbn_10: ["0521405998"] } : { isbn_13: ["9780593656433"] },
        url: "https://openlibrary.org/books/OL123M/Governing_the_Commons"
      } });
    }
  });
  const first = await resolver.resolve("isbn:0521405998");
  assert.equal(first.state, "resolved");
  assert.equal(first.record.locations[0].provider, "Open Library");
  assert.equal((await resolver.resolve(key)).state, "cached");
  const second = await resolver.resolve(key, { force: true });
  assert.equal(second.state, "error");
  assert.equal(second.record.id, first.record.id);
  assert.match(second.attempt.mergeLog[0], /did not verify this ISBN/);
  assert.equal(count, 2);
});


test("reprint records preserve both dates and styles disambiguate their displayed date pairs", () => {
  const reprint = { ...book, id: "durkheim", title: "The Elementary Forms of Religious Life",
    authors: [{ given: "Émile", family: "Durkheim" }], issued: [1995], originalIssued: [1912], identifiers: [] };
  const normalized = makeCache([reprint]).records[0];
  assert.deepEqual(normalized.originalIssued, [1912]);
  assert.deepEqual(toCSL(normalized)["original-date"], { "date-parts": [[1912]] });
  assert.deepEqual(toCSL(normalized).issued, { "date-parts": [[1995]] });
  const chicago = compileCitations("{citation durkheim}", makeCache([reprint]), { citationStyle: "chicago-author-date" });
  assert.deepEqual(labels(chicago.html), ["Durkheim [1912] 1995"]);
  assert.match(chicago.html, /Durkheim, Émile\. \(1912\) 1995\./);
  const apa = compileCitations("{citation durkheim}", makeCache([reprint]), { citationStyle: "apa" });
  assert.deepEqual(labels(apa.html), ["Durkheim, 1912/1995"]);
  assert.match(apa.html, /Original work published 1912/);
  const another = { ...reprint, id: "another-original", originalIssued: [1900] };
  const distinct = compileCitations("{citation durkheim; another-original}", makeCache([reprint, another]), { citationStyle: "chicago-author-date" });
  assert.deepEqual(labels(distinct.html), ["Durkheim [1912] 1995", "Durkheim [1900] 1995"]);
});

test("ISBN search returns edition-level proposals, coalesces requests and preserves prior proposals through a rate limit", async () => {
  let rateLimited = false;
  let count = 0;
  const search = createOpenLibrarySearch({
    minInterval: 0,
    fetch: async url => {
      count++;
      if (rateLimited) return new Response("pause", { status: 429, headers: { "Retry-After": "60" } });
      if (url.pathname === "/search.json") {
        assert.equal(url.searchParams.get("q"), 'title:"Governing the Commons" AND author:"Elinor Ostrom" AND publish_year:1990 AND language:eng');
        return Response.json({ docs: [{ key: "/works/OL123W", author_name: ["Elinor Ostrom"],
          isbn: ["9780593656433"], editions: { docs: [{ key: "/books/OL123M" }] } }] });
      }
      assert.equal(url.pathname, "/books/OL123M.json");
      return Response.json({ key: "/books/OL123M", title: book.title, publish_date: "1990",
        publishers: ["Cambridge University Press"], isbn_10: ["0521405998"], isbn_13: ["9780521405997"] });
    }
  });
  const query = { title: book.title, author: "Elinor Ostrom", year: 1990, language: "eng" };
  const [first, same] = await Promise.all([search.search(query), search.search(query)]);
  assert.equal(count, 2);
  assert.deepEqual(first, same);
  assert.equal(first.state, "candidates");
  assert.equal(first.candidates[0].requiresReview, true);
  assert.deepEqual(first.candidates[0].identifiers, book.identifiers);
  assert.equal(first.candidates[0].provenance.length, 2);
  assert.equal(first.candidates[0].authorSource, "work");
  assert.equal((await search.search(query)).state, "cached");
  assert.equal(count, 2);
  rateLimited = true;
  const failure = await search.search(query, { force: true });
  assert.equal(failure.state, "error");
  assert.deepEqual(failure.candidates, first.candidates);
  assert.match(failure.message, /429/);
  assert.equal(count, 3);
  assert.equal((await search.search(query, { force: true })).state, "error");
  assert.equal(count, 3);
  await assert.rejects(search.search({ title: book.title }), /title and author/);
});
