import { stripSourceComments } from "./notation-options.mjs";
import { Marked, Lexer } from "marked";
import { parse, parseFragment, serialize, Tokenizer } from "parse5";
import {
  compileCitationBlocks,
  escapeHTML,
  parseDirectives,
  scanCitationMarkers,
} from "./compiler.mjs";

const excluded = new Set([
  "a",
  "button",
  "code",
  "head",
  "iframe",
  "label",
  "math",
  "noscript",
  "option",
  "pre",
  "script",
  "select",
  "style",
  "summary",
  "svg",
  "template",
  "textarea",
  "title",
  "xmp",
]);
const interactiveRoles = new Set([
  "button",
  "checkbox",
  "combobox",
  "link",
  "menuitem",
  "menuitemcheckbox",
  "menuitemradio",
  "option",
  "radio",
  "searchbox",
  "slider",
  "spinbutton",
  "switch",
  "tab",
  "textbox",
  "treeitem",
]);
const blockParents = new Set([
  "body",
  "article",
  "aside",
  "blockquote",
  "dd",
  "div",
  "figcaption",
  "figure",
  "footer",
  "header",
  "li",
  "main",
  "section",
  "td",
  "th",
  "#document-fragment",
]);
const proseBoundaries = new Set([
  ...blockParents,
  "blockquote",
  "caption",
  "dd",
  "dt",
  "figure",
  "figcaption",
  "h1",
  "h2",
  "h3",
  "h4",
  "h5",
  "h6",
  "li",
  "ol",
  "p",
  "table",
  "td",
  "th",
  "ul",
]);
const attr = (node, name) => node.attrs?.find((item) => item.name === name);
const skip = (node) =>
  excluded.has(node.tagName) ||
  attr(node, "role")
    ?.value.split(/\s+/)
    .some((role) => interactiveRoles.has(role)) ||
  ["", "true", "plaintext-only"].includes(
    attr(node, "contenteditable")?.value.toLowerCase(),
  ) ||
  attr(node, "data-ci-record") ||
  attr(node, "data-citation-part");
export { skip as isCitationTextExcluded };
const standalone = (tokens) =>
  tokens.filter((token) => token.type !== "text" || token.text.trim())
    .length === 1 &&
  tokens.some(
    (token) =>
      token.type === "endnotes" ||
      token.type === "list" ||
      token.type === "tags",
  );

function visit(node, callback) {
  if (callback(node) === false) return;
  for (const child of node.childNodes || []) visit(child, callback);
}

function inlineProse(node, options) {
  if (node.nodeName === "#text") {
    if (!node.value.includes("{")) return node.value;
    return parseDirectives(node.value, options)
      .map((token) =>
        token.type === "text" && !token.malformed ? token.text : " ",
      )
      .join("");
  }
  if (skip(node) || proseBoundaries.has(node.nodeName)) return "";
  return (node.childNodes || [])
    .map((child) => inlineProse(child, options))
    .join("");
}

function surroundingProse(node, step, options) {
  const limit = 110;
  let prose = "";
  for (let cursor = node; cursor.parentNode;) {
    const parent = cursor.parentNode;
    const siblings = parent.childNodes;
    for (
      let index = siblings.indexOf(cursor) + step;
      siblings[index] && prose.length < limit;
      index += step
    ) {
      const sibling = siblings[index];
      if (proseBoundaries.has(sibling.nodeName)) return prose;
      const text = inlineProse(sibling, options);
      prose =
        step < 0
          ? (text + prose).slice(-limit)
          : (prose + text).slice(0, limit);
    }
    if (prose.length >= limit || proseBoundaries.has(parent.nodeName)) break;
    cursor = parent;
  }
  return prose;
}

const sourceHTML = (text) =>
  escapeHTML(text).replaceAll("&quot;", '"').replaceAll("&#39;", "'");
function renderSourceMarker(raw, options, diagnostics, forceMalformed = false) {
  const all = stripSourceComments(raw, { fields: ["comment", "cue", "note"] });
  const marker = all.hasComments
    ? scanCitationMarkers(raw, { ...options, firstOnly: true })[0]
    : null;
  if (forceMalformed || marker?.token?.malformed) {
    const safe = "{" + (options.citationKeyword || "cite") + " …}";
    diagnostics.push({
      state: "malformed",
      code: "citation-malformed",
      source: safe,
    });
    return `<code>${escapeHTML(safe)}</code>`;
  }
  return sourceHTML(stripSourceComments(raw).text);
}
function projectMarkerBraces(source, options = {}, eligible, blocked = []) {
  // Decode notation syntax while retaining raw offsets. Quote entities can open
  // fields, but quotes of another source form inside a field remain its content.
  // This permits cue:&quot;...&quot; without letting &quot; inside comment:"..."
  // shorten the comment's ownership and expose its remaining text.
  const pattern = /&(?:#(?:x[0-9a-f]+|[0-9]+);?|[a-z][a-z0-9]*;)/giu;
  const matches = [...source.matchAll(pattern)].flatMap((match) => {
    const value = parseFragment(match[0])
      .childNodes.map((node) => node.value || "")
      .join("");
    return value &&
      (!/["'\\]/u.test(value) || value === '"') &&
      value !== match[0]
      ? [{ ...match, at: match.index, raw: match[0], value }]
      : [];
  });
  if (!matches.length)
    return { text: source, toRaw: (index) => index, toLex: (index) => index };
  let text = "",
    cursor = 0;
  const offsets = [],
    entityQuotes = new Set();
  for (const match of matches) {
    while (cursor < match.at) {
      offsets.push(cursor);
      text += source[cursor++];
    }
    for (let i = 0; i < match.value.length; i++) {
      offsets.push(cursor);
      if (match.value[i] === '"') entityQuotes.add(text.length);
      text += match.value[i];
    }
    cursor += match.raw.length;
  }
  while (cursor < source.length) {
    offsets.push(cursor);
    text += source[cursor++];
  }
  offsets.push(source.length);
  const start = new RegExp(
    "^\\{\\s*" + (options.citationKeyword || "cite") + "(?=[\\s}]|$)",
    "u",
  );
  let projected = "",
    active = false,
    quoteOrigin = null,
    escaped = false;
  const projectedOffsets = [];
  for (let i = 0; i < text.length; i++) {
    const character = text[i];
    let slashCount = 0;
    if (character === "{")
      for (let before = i - 1; before >= 0 && text[before] === "\\"; before--)
        slashCount++;
    if (
      !active &&
      character === "{" &&
      slashCount % 2 === 0 &&
      start.test(text.slice(i)) &&
      (!eligible ||
        eligible.some(
          (range) =>
            offsets[i] >= range.startOffset && offsets[i] < range.endOffset,
        )) &&
      !blocked.some(([start, end]) => offsets[i] >= start && offsets[i] < end)
    )
      active = true;
    if (active) {
      if (escaped) escaped = false;
      else if (character === "\\") escaped = true;
      else if (character === '"') {
        const origin = entityQuotes.has(i) ? "entity" : "literal";
        if (quoteOrigin && quoteOrigin !== origin) {
          projectedOffsets.push(offsets[i]);
          projected += "\\";
        } else quoteOrigin = quoteOrigin ? null : origin;
      } else if (character === "}" && !quoteOrigin) active = false;
    }
    projectedOffsets.push(offsets[i]);
    projected += character;
  }
  projectedOffsets.push(source.length);
  return {
    text: projected,
    toRaw: (index) => projectedOffsets[index],
    toLex: (index) => {
      let low = 0,
        high = projectedOffsets.length - 1;
      while (low < high) {
        const middle = (low + high) >> 1;
        if (projectedOffsets[middle] < index) low = middle + 1;
        else high = middle;
      }
      return low;
    },
  };
}
function annotationAtoms(tree, source) {
  const atoms = [];
  visit(tree, (node) => {
    const location = node.sourceCodeLocation;
    if (
      node.tagName &&
      location?.startTag &&
      location.endOffset > location.startOffset
    )
      atoms.push({ start: location.startOffset, end: location.endOffset });
  });
  // Tree construction drops misplaced doctypes. The pinned parse5 tokenizer
  // retains their spans, along with ordinary and bogus HTML comment tokens.
  if (source.includes("<!") || source.includes("<?")) {
    const ignore = () => {},
      remember = (token) => {
        const range = token.location;
        if (range && range.endOffset > range.startOffset)
          atoms.push({ start: range.startOffset, end: range.endOffset });
      };
    new Tokenizer(
      { sourceCodeLocationInfo: true },
      {
        onStartTag: ignore,
        onEndTag: ignore,
        onComment: remember,
        onDoctype: remember,
        onCharacter: ignore,
        onWhitespaceCharacter: ignore,
        onNullCharacter: ignore,
        onEof: ignore,
        onParseError: null,
      },
    ).write(source, true);
  }
  return atoms;
}
function eligibleMarkerRanges(tree, options) {
  const ranges = [],
    keyword = options.citationKeyword || "cite",
    start = new RegExp("\\{\\s*" + keyword + "(?=[\\s}]|$)");
  visit(tree, (node) => {
    if (skip(node)) return false;
    if (
      node.nodeName === "#text" &&
      node.sourceCodeLocation &&
      start.test(node.value)
    )
      ranges.push(node.sourceCodeLocation);
  });
  return ranges;
}
function markdownLiteralRanges(source) {
  const ranges = [];
  const walk = (tokens, start, end) => {
    let cursor = start;
    for (const token of tokens || []) {
      if (!token.raw) continue;
      const at = source.indexOf(token.raw, cursor);
      if (at < cursor || at + token.raw.length > end) {
        ranges.push([start, end]);
        return;
      }
      cursor = at + token.raw.length;
      if (["code", "codespan"].includes(token.type)) ranges.push([at, cursor]);
      else if (token.items) walk(token.items, at, cursor);
      else if (token.tokens) walk(token.tokens, at, cursor);
    }
  };
  walk(Lexer.lex(source), 0, source.length);
  return ranges;
}
function excludedHTMLChunks(source) {
  const chunks = [];
  visit(parse(source, { sourceCodeLocationInfo: true }), (node) => {
    if (!skip(node)) return;
    const location = node.sourceCodeLocation;
    if (location) {
      chunks.push(source.slice(location.startOffset, location.endOffset));
      return false;
    }
  });
  return [...new Set(chunks)]
    .filter(Boolean)
    .sort((a, b) => b.length - a.length);
}
function ownedMarker(projection, cursor, atoms, options) {
  let lexical = projection.text.slice(cursor),
    marker = scanCitationMarkers(lexical, { ...options, firstOnly: true })[0];
  if (!marker) return null;
  const from = projection.toRaw(cursor + marker.start),
    covered = new Set();
  for (let pass = 0; pass < 32; pass++) {
    const end = projection.toRaw(cursor + marker.end),
      annotations = stripSourceComments(marker.raw, {
        fields: ["comment", "cue", "note"],
      }).ranges;
    const next = atoms.filter(
      (atom) =>
        atom.start > from &&
        atom.start < end &&
        !covered.has(atom) &&
        annotations.some((range) => {
          const at = projection.toLex(atom.start) - cursor - marker.start;
          return at >= range.start && at < range.end;
        }),
    );
    if (!next.length) break;
    const ranges = next
      .map((atom) => {
        covered.add(atom);
        return {
          start: Math.max(0, projection.toLex(atom.start) - cursor),
          end: projection.toLex(atom.end) - cursor,
        };
      })
      .sort((a, b) => b.start - a.start);
    for (const range of ranges)
      lexical =
        lexical.slice(0, range.start) +
        lexical.slice(range.start, range.end).replace(/[^\r\n]/g, " ") +
        lexical.slice(range.end);
    marker = scanCitationMarkers(lexical, { ...options, firstOnly: true })[0];
    if (!marker) return null;
    if (pass === 31) {
      marker = {
        ...marker,
        end: lexical.length,
        raw: lexical.slice(marker.start),
        token: { type: "text", malformed: true, incomplete: true },
      };
    }
  }
  // Invalid comment delimiters have ambiguous ownership; never recover a short
  // raw fallback that could publish the remainder of an annotation.
  if (!stripSourceComments(marker.raw).valid)
    marker = {
      ...marker,
      end: lexical.length,
      raw: lexical.slice(marker.start),
      token: { type: "text", malformed: true, incomplete: true },
    };
  return marker;
}
function redactHTMLSourceAnnotations(source, options) {
  const edits = [],
    diagnostics = [],
    tree = parse(source, { sourceCodeLocationInfo: true }),
    ranges = eligibleMarkerRanges(tree, options),
    atoms = annotationAtoms(tree, source),
    projection = projectMarkerBraces(source, options, ranges);
  for (const range of ranges.sort((a, b) => a.startOffset - b.startOffset)) {
    let cursor = projection.toLex(range.startOffset);
    while (projection.toRaw(cursor) < range.endOffset) {
      const marker = ownedMarker(projection, cursor, atoms, options);
      if (!marker || projection.toRaw(cursor + marker.start) >= range.endOffset)
        break;
      const start = projection.toRaw(cursor + marker.start),
        end = projection.toRaw(cursor + marker.end);
      cursor += marker.end;
      if (edits.some((edit) => start >= edit.start && start < edit.end))
        continue;
      const clean = stripSourceComments(marker.raw, {
        fields: ["comment", "cue", "note"],
      });
      if (
        clean.hasComments &&
        (marker.token?.malformed ||
          stripSourceComments(marker.raw).hasComments ||
          marker.raw.includes("<"))
      ) {
        const text = marker.token?.malformed
          ? renderSourceMarker(marker.raw, options, diagnostics, true)
          : sourceHTML(stripSourceComments(marker.raw).text);
        edits.push({ start, end, text });
      }
    }
  }
  for (const edit of edits.sort((a, b) => b.start - a.start))
    source = source.slice(0, edit.start) + edit.text + source.slice(edit.end);
  return { source, diagnostics };
}

/** Compile trusted author HTML while preserving source outside the edited text nodes. */
export function compileHTML(source, cache, options = {}) {
  if (typeof source !== "string")
    throw new TypeError("Supply HTML as a string.");
  parseDirectives("", options);
  const annotations = redactHTMLSourceAnnotations(source, options);
  source = annotations.source;
  const document = parse(source, { sourceCodeLocationInfo: true });
  const edits = [];
  let bodyEnd = source.length;
  visit(document, (node) => {
    if (node.tagName === "body") {
      bodyEnd =
        node.sourceCodeLocation?.endTag?.startOffset ??
        node.parentNode.sourceCodeLocation?.endTag?.startOffset ??
        source.length;
    }
    if (skip(node)) return false;
    if (node.nodeName !== "#text" || !node.sourceCodeLocation) return;
    const tokens = parseDirectives(node.value, options);
    if (
      tokens.every((token) => token.type === "text" && !token.malformed) &&
      tokens.map((token) => token.text).join("") === node.value
    )
      return;
    const first = tokens[0]?.type === "text" ? tokens[1] : tokens[0];
    const last = tokens.at(-1)?.type === "text" ? tokens.at(-2) : tokens.at(-1);
    if (first?.type === "citation")
      first.leadingContext = surroundingProse(node, -1, options);
    if (last?.type === "citation")
      last.trailingContext = surroundingProse(node, 1, options);
    const parent = node.parentNode;
    if (
      standalone(tokens) &&
      parent.tagName === "p" &&
      parent.childNodes.length === 1 &&
      parent.sourceCodeLocation &&
      blockParents.has(parent.parentNode.nodeName)
    ) {
      edits.push({ ...parent.sourceCodeLocation, tokens });
    } else {
      if (standalone(tokens) && !blockParents.has(parent.nodeName)) {
        const marker = tokens.find(
          (token) =>
            token.type === "endnotes" ||
            token.type === "list" ||
            token.type === "tags",
        );
        Object.assign(marker, {
          type: "text",
          text: marker.raw,
          misplaced: true,
        });
      }
      edits.push({ ...node.sourceCodeLocation, tokens });
    }
  });
  edits.sort((a, b) => a.startOffset - b.startOffset);
  const blocks = [];
  let cursor = 0;
  for (const edit of edits) {
    blocks.push(
      [{ type: "markup", text: source.slice(cursor, edit.startOffset) }],
      edit.tokens,
    );
    cursor = edit.endOffset;
  }
  const insertAt = Math.max(cursor, bodyEnd);
  blocks.push([{ type: "markup", text: source.slice(cursor, insertAt) }]);
  const result = compileCitationBlocks(blocks, cache, {
    ...options,
    markup: true,
    closingMarkup: source.slice(insertAt),
  });
  return {
    ...result,
    diagnostics: [...annotations.diagnostics, ...result.diagnostics],
  };
}

function prepareEncodedMarkdownMarkers(source, options, diagnostics) {
  const tree = parse(source, { sourceCodeLocationInfo: true }),
    eligible = eligibleMarkerRanges(tree, options),
    literals = markdownLiteralRanges(source),
    projection = projectMarkerBraces(source, options, eligible, literals);
  if (projection.text === source && !/[<&]/u.test(source)) return source;
  const atoms = annotationAtoms(tree, source),
    markers = [];
  let markerCursor = 0;
  while (markerCursor < projection.text.length) {
    const marker = ownedMarker(projection, markerCursor, atoms, options);
    if (!marker) break;
    const sourceStart = projection.toRaw(markerCursor + marker.start);
    if (
      !eligible.some(
        (range) =>
          sourceStart >= range.startOffset && sourceStart < range.endOffset,
      ) ||
      literals.some(([start, end]) => sourceStart >= start && sourceStart < end)
    ) {
      markerCursor += marker.start + 1;
      continue;
    }
    markers.push({
      ...marker,
      sourceStart,
      sourceEnd: projection.toRaw(markerCursor + marker.end),
    });
    markerCursor += marker.end;
  }
  let lexical = source;
  for (const marker of [...markers].reverse())
    if (!marker.token?.incomplete)
      lexical =
        lexical.slice(0, marker.sourceStart) +
        "x".repeat(marker.sourceEnd - marker.sourceStart) +
        lexical.slice(marker.sourceEnd);
  const blocked = [];
  const walk = (tokens, start, end) => {
    let cursor = start;
    for (const token of tokens || []) {
      if (!token.raw) continue;
      const at = lexical.indexOf(token.raw, cursor);
      if (at < cursor || at + token.raw.length > end) {
        blocked.push([start, end]);
        return;
      }
      cursor = at + token.raw.length;
      if (["code", "codespan", "html", "link", "image"].includes(token.type))
        blocked.push([at, cursor]);
      else if (token.items) walk(token.items, at, cursor);
      else if (token.tokens) walk(token.tokens, at, cursor);
    }
  };
  walk(Lexer.lex(lexical), 0, lexical.length);
  for (const marker of [...markers].reverse()) {
    if (
      blocked.some(
        ([start, end]) =>
          marker.sourceStart >= start && marker.sourceStart < end,
      )
    )
      continue;
    if (
      source.slice(marker.sourceStart, marker.sourceEnd) === marker.raw &&
      !(
        marker.token?.malformed &&
        stripSourceComments(marker.raw, { fields: ["comment", "cue", "note"] })
          .hasComments
      )
    )
      continue;
    const clean = stripSourceComments(marker.raw, {
      fields: ["comment", "cue", "note"],
    });
    const replacement =
      marker.token?.malformed && clean.hasComments
        ? renderSourceMarker(marker.raw, options, diagnostics, true)
        : marker.raw;
    source =
      source.slice(0, marker.sourceStart) +
      replacement +
      source.slice(marker.sourceEnd);
  }
  return source;
}

/** Compile trusted Markdown. Raw HTML follows the same trust model as compileHTML. */
export function compileMarkdown(source, cache, options = {}) {
  if (typeof source !== "string")
    throw new TypeError("Supply Markdown as a string.");
  const keyword = options.citationKeyword ?? "cite";
  parseDirectives("", options);
  const starts = new RegExp(String.raw`\\[{}\\]|\{\s*(?:${keyword})[ \t\r\n]`);
  const annotationDiagnostics = [];
  source = prepareEncodedMarkdownMarkers(
    source,
    options,
    annotationDiagnostics,
  );
  const literalHTML = excludedHTMLChunks(source);
  const markdown = new Marked({
    extensions: [
      {
        name: "citationBlockDirective",
        level: "block",
        start(input) {
          const match = new RegExp(
            String.raw`\n {0,3}\{\s*(?:${keyword})[ \t\r\n]+(?:endnote|list)(?=[ \t|}])`,
          ).exec(input);
          return match ? match.index + 1 : undefined;
        },
        tokenizer(input) {
          if (/^(?: {4}|\t)/.test(input)) return;
          const indent = /^ {0,3}/.exec(input)[0].length;
          const marker = scanCitationMarkers(input.slice(indent), {
            citationKeyword: keyword,
          })[0];
          if (!marker || marker.start !== 0 || marker.token?.incomplete) return;
          const end = indent + marker.end,
            tail = /^[ \t]*(?:\r?\n|$)/.exec(input.slice(end));
          if (!tail) return;
          return {
            type: "citationBlockDirective",
            kind: marker.token.type,
            raw: input.slice(0, end + tail[0].length),
          };
        },
        renderer(token) {
          return `<p>${renderSourceMarker(token.raw.trimEnd(), options, annotationDiagnostics)}</p>\n`;
        },
      },
      {
        name: "citationDirective",
        level: "inline",
        start(input) {
          return starts.exec(input)?.index;
        },
        tokenizer(input) {
          if (this.lexer.state.inRawBlock || this.lexer.state.inLink) return;
          if (starts.exec(input)?.index !== 0) return;
          if (/^\\[{}\\]/.test(input))
            return { type: "citationDirective", raw: input.slice(0, 2) };
          const first = parseDirectives(input, { citationKeyword: keyword })[0];
          if (first?.raw && input.startsWith(first.raw))
            return { type: "citationDirective", raw: first.raw };
          if (first?.malformed && input.startsWith(first.text))
            return { type: "citationDirective", raw: first.text };
        },
        renderer(token) {
          return renderSourceMarker(token.raw, options, annotationDiagnostics);
        },
      },
      {
        name: "citationLiteralHTML",
        level: "inline",
        start(input) {
          const at = literalHTML
            .map((raw) => input.indexOf(raw))
            .filter((index) => index >= 0);
          return at.length ? Math.min(...at) : undefined;
        },
        tokenizer(input) {
          const raw = literalHTML.find((raw) => input.startsWith(raw));
          if (raw) return { type: "citationLiteralHTML", raw };
        },
        renderer(token) {
          return token.raw;
        },
      },
    ],
  });
  const result = compileHTML(markdown.parse(source), cache, options);
  return {
    ...result,
    diagnostics: [...annotationDiagnostics, ...result.diagnostics],
  };
}

/** Change generated fragment IDs and their references before embedding another copy. */
export function rebaseCitationFragment(html, from, to) {
  for (const namespace of [from, to]) {
    if (
      typeof namespace !== "string" ||
      !/^[a-z][a-z0-9-]{0,39}$/.test(namespace)
    ) {
      throw new TypeError("Use a stable lowercase document namespace.");
    }
  }
  const fragment = parseFragment(html);
  const generated = new RegExp(
    `^${from}-(?:scope-[0-9]+-)?(?:cite-.+-[0-9]+|note-.+|endnotes|evidence|credit)$`,
  );
  const inspectMask = new RegExp(`^${from}_(?:inspect|tag)-mask-[0-9]+$`);
  const ids = new Set();
  const mapping = new Map();
  visit(fragment, (node) => {
    const id = attr(node, "id")?.value;
    if (!id) return;
    if (ids.has(id)) throw new TypeError(`Duplicate fragment ID: ${id}`);
    ids.add(id);
    const part = attr(node, "data-citation-part")?.value;
    const parentPart = attr(node.parentNode || {}, "data-citation-part")?.value;
    const listPart = attr(
      node.parentNode?.parentNode || {},
      "data-citation-part",
    )?.value;
    if (
      (node.tagName === "mask" && inspectMask.test(id)) ||
      (generated.test(id) &&
        (attr(node, "data-ci-record") ||
          part === "annotation-content" ||
          (/^h[1-6]$/.test(node.tagName) && parentPart === "endnotes") ||
          (node.tagName === "li" && listPart === "endnotes")))
    ) {
      mapping.set(id, to + id.slice(from.length));
    }
  });
  for (const id of mapping.values()) {
    if (ids.has(id) && !mapping.has(id))
      throw new TypeError(`Destination ID already exists: ${id}`);
  }
  visit(fragment, (node) => {
    const id = attr(node, "id");
    const href = attr(node, "href");
    const labelledBy = attr(node, "aria-labelledby");
    const mask = attr(node, "mask");
    const maskId = /^url\(#(.+)\)$/.exec(mask?.value || "")?.[1];
    if (mapping.has(maskId)) mask.value = "url(#" + mapping.get(maskId) + ")";
    if (mapping.has(id?.value)) id.value = mapping.get(id.value);
    if (href?.value.startsWith("#") && mapping.has(href.value.slice(1)))
      href.value = "#" + mapping.get(href.value.slice(1));
    if (labelledBy)
      labelledBy.value = labelledBy.value.replace(
        /\S+/g,
        (word) => mapping.get(word) || word,
      );
    const siteUses = attr(node, "data-ci-site-occurrences");
    if (siteUses) {
      try {
        const entries = JSON.parse(siteUses.value);
        let changed = false;
        if (Array.isArray(entries))
          for (const entry of entries) {
            if (
              typeof entry?.href === "string" &&
              entry.href.startsWith("#") &&
              mapping.has(entry.href.slice(1))
            ) {
              entry.href = "#" + mapping.get(entry.href.slice(1));
              changed = true;
            }
          }
        if (changed) siteUses.value = JSON.stringify(entries);
      } catch {
        /* Preserve unrecognized host metadata. */
      }
    }
  });
  return serialize(fragment);
}
