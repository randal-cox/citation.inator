import assert from "node:assert/strict";
import test from "node:test";
import { createCitationMessages, citationLocales } from "../src/i18n.mjs";
import { compileCitations } from "../src/compiler.mjs";
import { makeCache } from "../src/records.mjs";

test("independent i18n: missing translations retain usable English labels", () => {
  const fallback = createCitationMessages();
  const partial = createCitationMessages({ locale: "es", strings: { "access.save": "Guardar ahora" } });
  assert.equal(fallback.text("access.save"), "Save");
  assert.equal(partial.text("access.save"), "Guardar ahora");
  assert.equal(typeof partial.text("access.cancel"), "string");
  assert.notEqual(partial.text("access.cancel"), "access.cancel");
  const unknownLanguage = createCitationMessages({ locale: "de-DE" });
  assert.equal(unknownLanguage.text("access.save"), "Save");
});

test("independent i18n: plural categories use the selected locale", () => {
  const messages = createCitationMessages({ locale: "ar", strings: {
    "access.more": { zero: "zero {count}", one: "one {count}", two: "two {count}", few: "few {count}", many: "many {count}", other: "other {count}" }
  } });
  for (const [count, category] of [[0,"zero"],[1,"one"],[2,"two"],[3,"few"],[11,"many"],[100,"other"]]) {
    assert.equal(messages.text("access.more", { count }), `${category} ${count}`);
  }
});

test("independent i18n: incomplete plural overrides fall back per category", () => {
  const messages = createCitationMessages({ strings: { "access.more": { one: "One remaining" } } });
  assert.equal(messages.text("access.more", { count: 1 }), "One remaining");
  assert.equal(messages.text("access.more", { count: 2 }), "Other sources (2)");
});

test("independent i18n: instances snapshot overrides and do not contaminate defaults", () => {
  const strings = { "access.save": "Keep", "access.more": { one: "single", other: "plural" } };
  const first = createCitationMessages({ strings });
  strings["access.save"] = "Changed";
  strings["access.more"].one = "Changed";
  const second = createCitationMessages();
  assert.equal(first.text("access.save"), "Keep");
  assert.equal(first.text("access.more", { count: 1 }), "single");
  assert.equal(second.text("access.save"), "Save");
  assert.equal(second.text("access.more", { count: 1 }), "Other source (1)");
  assert(Object.isFrozen(first));
  assert(Object.isFrozen(citationLocales));
  assert(Object.isFrozen(citationLocales.en));
  assert(Object.isFrozen(citationLocales.es));
});

test("independent i18n: interpolation is one pass and never evaluates supplied markup", () => {
  const markup = '<img src=x onerror="throw 1">{service}';
  const messages = createCitationMessages({ strings: { "access.destination": "Read {service}" } });
  assert.equal(messages.text("access.destination", { service: markup }), `Read ${markup}`);
  assert.equal(messages.text("access.destination", { service: "$&" }), "Read $&");
  assert.equal(messages.text("access.destination", { service: 0 }), "Read 0");
  assert.equal(messages.text("access.destination", { service: "" }), "Read ");
});

test("independent i18n: inherited overrides cannot alter unrelated messages", () => {
  const strings = Object.create({ "access.save": "Inherited" });
  strings["access.cancel"] = "Stop";
  const messages = createCitationMessages({ strings });
  assert.equal(messages.text("access.save"), "Save");
  assert.equal(messages.text("access.cancel"), "Stop");
});

test("independent i18n: Intl formatting uses each instance's locale", () => {
  const german = createCitationMessages({ locale: "de-DE" });
  const english = createCitationMessages({ locale: "en-US" });
  assert.equal(german.number(12345.6), new Intl.NumberFormat("de-DE").format(12345.6));
  assert.equal(english.number(12345.6), new Intl.NumberFormat("en-US").format(12345.6));
  const date = new Date("2026-11-23T12:00:00Z");
  const options = { year: "numeric", month: "long", day: "numeric", timeZone: "UTC" };
  assert.equal(german.date(date, options), new Intl.DateTimeFormat("de-DE", options).format(date));
  assert.equal(english.date(date, options), new Intl.DateTimeFormat("en-US", options).format(date));
});

test("independent i18n: malformed configuration fails with TypeError", () => {
  for (const options of [{ locale: "not a locale" }, { strings: [] }, { strings: "Save" }, { strings: { "access.save": 4 } }, { strings: { "access.more": { one: 4 } } }]) {
    assert.throws(() => createCitationMessages(options), TypeError);
  }
});

const translationCache = makeCache([{ id: "field", title: "Original English Title", authors: [{ family: "Mori" }], issued: [2001], state: "resolved", identifiers: [{ scheme: "doi", value: "10.1234/field" }], locations: [{ provider: "Example repository", kind: "pdf", verifiedAt: "2026-11-23", url: "https://example.org/field.pdf" }] }]);

test("independent i18n: compiled static labels translate without changing metadata or citation style", () => {
  const source = "{citation field}\n\n{citation endnote}\n\n{citation evidence} {citation credit}";
  const spanish = compileCitations(source, translationCache, { locale: "es", citationStyle: "chicago-author-date", inspectAppearance: "icon" }).html;
  const english = compileCitations(source, translationCache, { citationStyle: "chicago-author-date" }).html;
  assert.match(spanish, />Notas finales<\/h2>/);
  assert.match(spanish, /Descargar PDF/);
  assert.match(spanish, /Evidencia de la cita/);
  assert.match(spanish, /Cómo citar este software/);
  assert.match(spanish, /data-ci-inspect-icon/);
  assert.match(spanish, /Original English Title/);
  assert.match(spanish, /Mori 2001/);
  assert.match(english, />Endnotes<\/h2>/);
  assert.doesNotMatch(english, /Notas finales/);
  const explicit = compileCitations(source, translationCache, { locale: "es", endnotesHeading: "References" }).html;
  assert.match(explicit, />References<\/h2>/);
});

test("independent i18n: hostile overrides are escaped at compiler text and attribute sinks", () => {
  const attack = '\"><img src=x onerror="alert(1)"><script>alert(2)</script>';
  const strings = Object.fromEntries(Object.keys(citationLocales.en).map(key => [key, attack]));
  const html = compileCitations("{citation field}\n\n{citation endnote}\n\n{citation evidence} {citation credit}", translationCache, { strings, inspectAppearance: "icon" }).html;
  assert.match(html, /&lt;img src=x onerror=/);
  assert.doesNotMatch(html, /<img src=x|<script>alert/);
  assert.match(html, /data-ci-inspect-icon/);
});

test("independent i18n: built-in counts format locally while custom counts retain numeric plural context", () => {
  const messages = createCitationMessages({ locale: "ar" });
  const count = 1234;
  assert.equal(messages.text("access.more", { count }), `Other sources (${new Intl.NumberFormat("ar").format(count)})`);
  const custom = createCitationMessages({ locale: "ar", strings: { "access.more": { two: "raw {count}; display {countLabel}", other: "other" } } });
  assert.equal(custom.text("access.more", { count: 2 }), `raw 2; display ${new Intl.NumberFormat("ar").format(2)}`);
});

test("independent i18n: unresolved inline fallback follows UI locale", () => {
  const html = compileCitations("{citation missing}\n\n{citation endnote}", makeCache([]), { locale: "es" }).html;
  assert.match(html, />Cita sin resolver<\/a>/);
  assert.doesNotMatch(html, /Unresolved citation/);
});
