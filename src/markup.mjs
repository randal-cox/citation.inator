import { Marked } from "marked";
import { parse, parseFragment, serialize } from "parse5";
import { compileCitationBlocks, escapeHTML, parseDirectives } from "./compiler.mjs";

const excluded = new Set([
  "a", "button", "code", "head", "iframe", "label", "math", "noscript", "option", "pre", "script",
  "select", "style", "summary", "svg", "template", "textarea", "title", "xmp"
]);
const interactiveRoles = new Set([
  "button", "checkbox", "combobox", "link", "menuitem", "menuitemcheckbox", "menuitemradio", "option",
  "radio", "searchbox", "slider", "spinbutton", "switch", "tab", "textbox", "treeitem"
]);
const blockParents = new Set(["body", "article", "aside", "div", "footer", "header", "main", "section", "#document-fragment"]);
const proseBoundaries = new Set([
  ...blockParents, "blockquote", "caption", "dd", "dt", "figure", "figcaption", "h1", "h2", "h3",
  "h4", "h5", "h6", "li", "ol", "p", "table", "td", "th", "ul"
]);
const attr = (node, name) => node.attrs?.find(item => item.name === name);
const skip = node => excluded.has(node.tagName) || attr(node, "role")?.value.split(/\s+/).some(role => interactiveRoles.has(role)) ||
  ["", "true", "plaintext-only"].includes(attr(node, "contenteditable")?.value.toLowerCase()) ||
  attr(node, "data-ci-record") || attr(node, "data-citation-part");
const standalone = tokens => tokens.filter(token => token.type !== "text" || token.text.trim()).length === 1 &&
  tokens.some(token => token.type === "endnotes");

function visit(node, callback) {
  if (callback(node) === false) return;
  for (const child of node.childNodes || []) visit(child, callback);
}

function inlineProse(node, options) {
  if (node.nodeName === "#text") {
    if (!node.value.includes("{")) return node.value;
    return parseDirectives(node.value, options).map(token => token.type === "text" && !token.malformed ? token.text : " ").join("");
  }
  if (skip(node) || proseBoundaries.has(node.nodeName)) return "";
  return (node.childNodes || []).map(child => inlineProse(child, options)).join("");
}

function surroundingProse(node, step, options) {
  const limit = 110;
  let prose = "";
  for (let cursor = node; cursor.parentNode;) {
    const parent = cursor.parentNode;
    const siblings = parent.childNodes;
    for (let index = siblings.indexOf(cursor) + step; siblings[index] && prose.length < limit; index += step) {
      const sibling = siblings[index];
      if (proseBoundaries.has(sibling.nodeName)) return prose;
      const text = inlineProse(sibling, options);
      prose = step < 0 ? (text + prose).slice(-limit) : (prose + text).slice(0, limit);
    }
    if (prose.length >= limit || proseBoundaries.has(parent.nodeName)) break;
    cursor = parent;
  }
  return prose;
}

/** Compile trusted author HTML while preserving source outside the edited text nodes. */
export function compileHTML(source, cache, options = {}) {
  if (typeof source !== "string") throw new TypeError("Supply HTML as a string.");
  parseDirectives("", options);
  const document = parse(source, { sourceCodeLocationInfo: true });
  const edits = [];
  let bodyEnd = source.length;
  visit(document, node => {
    if (node.tagName === "body") {
      bodyEnd = node.sourceCodeLocation?.endTag?.startOffset ??
        node.parentNode.sourceCodeLocation?.endTag?.startOffset ?? source.length;
    }
    if (skip(node)) return false;
    if (node.nodeName !== "#text" || !node.sourceCodeLocation) return;
    const tokens = parseDirectives(node.value, options);
    if (tokens.every(token => token.type === "text" && !token.malformed) &&
        tokens.map(token => token.text).join("") === node.value) return;
    const first = tokens[0]?.type === "text" ? tokens[1] : tokens[0];
    const last = tokens.at(-1)?.type === "text" ? tokens.at(-2) : tokens.at(-1);
    if (first?.type === "citation") first.leadingContext = surroundingProse(node, -1, options);
    if (last?.type === "citation") last.trailingContext = surroundingProse(node, 1, options);
    const parent = node.parentNode;
    if (standalone(tokens) && parent.tagName === "p" && parent.childNodes.length === 1 && parent.sourceCodeLocation &&
        blockParents.has(parent.parentNode.nodeName)) {
      edits.push({ ...parent.sourceCodeLocation, tokens });
    } else {
      if (standalone(tokens) && !blockParents.has(parent.nodeName)) {
        const marker = tokens.find(token => token.type === "endnotes");
        Object.assign(marker, { type: "text", text: marker.raw });
      }
      edits.push({ ...node.sourceCodeLocation, tokens });
    }
  });
  edits.sort((a, b) => a.startOffset - b.startOffset);
  const blocks = [];
  let cursor = 0;
  for (const edit of edits) {
    blocks.push([{ type: "markup", text: source.slice(cursor, edit.startOffset) }], edit.tokens);
    cursor = edit.endOffset;
  }
  const insertAt = Math.max(cursor, bodyEnd);
  blocks.push([{ type: "markup", text: source.slice(cursor, insertAt) }]);
  return compileCitationBlocks(blocks, cache, { ...options, markup: true, closingMarkup: source.slice(insertAt) });
}

/** Compile trusted Markdown. Raw HTML follows the same trust model as compileHTML. */
export function compileMarkdown(source, cache, options = {}) {
  if (typeof source !== "string") throw new TypeError("Supply Markdown as a string.");
  const keyword = options.citationKeyword ?? "citation";
  parseDirectives("", options);
  const starts = new RegExp(String.raw`\\[{}\\]|\{(?:endnotes\}|(?:cite|${keyword})[ \t])`);
  const markdown = new Marked({
    extensions: [{
      name: "citationDirective", level: "inline",
      start(input) { return starts.exec(input)?.index; },
      tokenizer(input) {
        if (starts.exec(input)?.index !== 0) return;
        const first = parseDirectives(input.split("\n", 1)[0], { citationKeyword: keyword })[0];
        if (first?.raw && input.startsWith(first.raw)) return { type: "citationDirective", raw: first.raw };
        if (first?.malformed && input.startsWith(first.text)) return { type: "citationDirective", raw: first.text };
        if (/^\\[{}\\]/.test(input)) return { type: "citationDirective", raw: input.slice(0, 2) };
      },
      renderer(token) { return escapeHTML(token.raw); }
    }]
  });
  return compileHTML(markdown.parse(source), cache, options);
}

/** Change generated fragment IDs and their references before embedding another copy. */
export function rebaseCitationFragment(html, from, to) {
  for (const namespace of [from, to]) {
    if (typeof namespace !== "string" || !/^[a-z][a-z0-9-]{0,39}$/.test(namespace)) {
      throw new TypeError("Use a stable lowercase document namespace.");
    }
  }
  const fragment = parseFragment(html);
  const generated = new RegExp(`^${from}-(?:cite-.+-[0-9]+|note-.+|endnotes|evidence|credit)$`);
  const ids = new Set();
  const mapping = new Map();
  visit(fragment, node => {
    const id = attr(node, "id")?.value;
    if (!id) return;
    if (ids.has(id)) throw new TypeError(`Duplicate fragment ID: ${id}`);
    ids.add(id);
    const part = attr(node, "data-citation-part")?.value;
    const parentPart = attr(node.parentNode || {}, "data-citation-part")?.value;
    const listPart = attr(node.parentNode?.parentNode || {}, "data-citation-part")?.value;
    if (generated.test(id) && (attr(node, "data-ci-record") || part === "annotation-content" ||
        node.tagName === "h2" && parentPart === "endnotes" || node.tagName === "li" && listPart === "endnotes")) {
      mapping.set(id, to + id.slice(from.length));
    }
  });
  for (const id of mapping.values()) {
    if (ids.has(id) && !mapping.has(id)) throw new TypeError(`Destination ID already exists: ${id}`);
  }
  visit(fragment, node => {
    const id = attr(node, "id");
    const href = attr(node, "href");
    const labelledBy = attr(node, "aria-labelledby");
    if (mapping.has(id?.value)) id.value = mapping.get(id.value);
    if (href?.value.startsWith("#") && mapping.has(href.value.slice(1))) href.value = "#" + mapping.get(href.value.slice(1));
    if (labelledBy) labelledBy.value = labelledBy.value.replace(/\S+/g, word => mapping.get(word) || word);
  });
  return serialize(fragment);
}
