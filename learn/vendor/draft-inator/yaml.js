/* draft.inator: YAML front matter (and YAML entry files) edited without disturbing anything else.

   A page's front matter is written by people and by other tools. When the Details panel changes a field, only that
   field's lines change: every other byte, including comments, key order, quoting, list style, and line endings, stays as
   it was, and a write with no real change gives back the identical text. So this does not parse the YAML into a
   tree and print it again. It finds each top-level key's lines, reads the values it understands, and rewrites only the
   keys that changed, in the style they were written in.

   Understood (and editable): plain, 'single' and "double" quoted scalars; numbers, true/false, null; flow lists
   [a, "b"] and block lists (- a) of scalars; | literal text. Anything else (nested maps, lists of maps, > folded
   text, anchors, tags, multi-line flow) is kept exactly and reported as not editable. Plain browser JavaScript;
   also runs in Node. */

const KEY = /^([A-Za-z_][\w.-]*)[ \t]*:(?=[ \t]|\r?\n|$)(.*)$/;

// Split into lines that keep their own line endings, so joining them gives the text back exactly.
const lines = text => (text === '' ? [] : text.match(/[^\n]*\n|[^\n]+$/g));
const eol = text => (/\r\n/.test(text) ? '\r\n' : '\n');
const stripEnd = l => l.replace(/\r?\n$/, '');

// A comment starts at " #" outside quotes.
function splitComment(s) {
  let q = null;
  for (let i = 0; i < s.length; i++) {
    const c = s[i];
    if (q) { if (c === '\\' && q === '"') i++; else if (c === q) q = null; continue; }
    if (c === '"' || c === "'") q = c;
    else if (c === '#' && (i === 0 || /[ \t]/.test(s[i - 1]))) return [s.slice(0, i).trimEnd(), s.slice(i)];
  }
  return [s.trimEnd(), ''];
}

function readScalar(s) {
  s = s.trim();
  if (s.startsWith('"')) {
    const m = /^"((?:[^"\\]|\\.)*)"$/.exec(s);
    if (!m) return null;
    return { kind: 'double', value: m[1].replace(/\\(u[0-9a-fA-F]{4}|x[0-9a-fA-F]{2}|.)/g, (x, e) =>
      e[0] === 'u' || e[0] === 'x' ? String.fromCharCode(parseInt(e.slice(1), 16)) : ({ n: '\n', t: '\t', r: '\r', '0': '\0', '"': '"', '\\': '\\', '/': '/', ' ': ' ' }[e] ?? e)) };
  }
  if (s.startsWith("'")) {
    const m = /^'((?:[^']|'')*)'$/.exec(s);
    return m ? { kind: 'single', value: m[1].replace(/''/g, "'") } : null;
  }
  if (/^[&*!%@`|>]/.test(s) || /^[[{]/.test(s)) return null;
  if (s === '' || s === '~' || /^null$/i.test(s)) return { kind: 'plain', value: null };
  if (/^(true|false)$/i.test(s)) return { kind: 'plain', value: /^true$/i.test(s) };
  if (/^[-+]?(\d+|\d*\.\d+)([eE][-+]?\d+)?$/.test(s) && !/^[-+]?0\d/.test(s)) return { kind: 'plain', value: Number(s) };
  return { kind: 'plain', value: s };
}

// Flow list on one line, of scalars only: [a, "b, c", 'd']
function readFlowList(s) {
  s = s.trim();
  if (!s.startsWith('[') || !s.endsWith(']')) return null;
  const inner = s.slice(1, -1).trim();
  if (!inner) return [];
  const items = [];
  let cur = '', q = null;
  for (let i = 0; i < inner.length; i++) {
    const c = inner[i];
    if (q) { cur += c; if (c === '\\' && q === '"') cur += inner[++i] ?? ''; else if (c === q) q = null; continue; }
    if (c === '"' || c === "'") { q = c; cur += c; continue; }
    if (c === '[' || c === ']' || c === '{' || c === '}') return null;
    if (c === ',') { items.push(cur); cur = ''; continue; }
    cur += c;
  }
  items.push(cur);
  const out = [];
  for (const it of items) { const v = readScalar(it); if (!v || (v.kind === 'plain' && it.trim() === '')) return null; out.push(v.value); }
  return out;
}

/** The top-level structure of a YAML document: key entries, and everything else, as line ranges. */
function segment(text) {
  const ls = lines(text), segs = [];
  let i = 0;
  while (i < ls.length) {
    const m = KEY.exec(stripEnd(ls[i]));
    if (!m) { segs.push({ type: 'other', start: i, end: i + 1 }); i++; continue; }
    let j = i + 1;
    // The key's value continues on following lines that are indented, or are "- " items at column 0 (compact
    // block lists), or are blank lines followed by more of the same.
    while (j < ls.length) {
      const l = stripEnd(ls[j]);
      if (/^[ \t]+\S/.test(l) || /^-([ \t]|$)/.test(l)) { j++; continue; }
      if (l.trim() === '') {
        let k = j; while (k < ls.length && stripEnd(ls[k]).trim() === '') k++;
        if (k < ls.length && (/^[ \t]+\S/.test(stripEnd(ls[k])) && /^[ \t]*[|>]/.test(m[2].trim()))) { j = k; continue; }
      }
      break;
    }
    segs.push({ type: 'key', key: m[1], start: i, end: j });
    i = j;
  }
  return { ls, segs };
}

function readEntry(ls, seg) {
  const first = stripEnd(ls[seg.start]), m = KEY.exec(first);
  const [head, comment] = splitComment(m[2]);
  const rest = ls.slice(seg.start + 1, seg.end).map(stripEnd);
  const base = { key: seg.key, comment, separator: first.slice(0, first.length - m[2].length) + (m[2].match(/^[ \t]*/)[0]) };
  if (head.trim() === '' && rest.length) {
    const items = rest.filter(l => l.trim() !== '');
    if (items.every(l => /^[ \t]*-[ \t]+\S/.test(l) || /^[ \t]*-$/.test(l))) {
      const values = [];
      for (const l of items) {
        const [body] = splitComment(l.replace(/^[ \t]*-[ \t]*/, ''));
        const v = readScalar(body);
        if (!v || body.startsWith('-') || KEY.test(body) || /^[[{]/.test(body)) return { ...base, kind: 'complex' };
        values.push(v.value);
      }
      return { ...base, kind: 'block-list', value: values, itemPrefix: items[0].match(/^[ \t]*-[ \t]*/)[0] };
    }
    return { ...base, kind: 'complex' };
  }
  const h = head.trim();
  if (/^\|[-+]?$/.test(h)) {
    const body = rest.slice();
    while (body.length && body[body.length - 1].trim() === '') body.pop();
    const indent = (body.find(l => l.trim()) || '  ').match(/^[ \t]*/)[0] || '  ';
    const text = body.map(l => (l.startsWith(indent) ? l.slice(indent.length) : l.trim())).join('\n');
    return { ...base, kind: 'text', value: h === '|-' ? text : text + '\n', chomp: h, indent };
  }
  if (rest.length) return { ...base, kind: 'complex' };
  if (h.startsWith('[')) { const v = readFlowList(h); return v ? { ...base, kind: 'flow-list', value: v } : { ...base, kind: 'complex' }; }
  const v = readScalar(h);
  return v ? { ...base, kind: v.kind, value: v.value } : { ...base, kind: 'complex' };
}

/**
 * Read a YAML document (an entry file, or the inside of a front matter block).
 * @returns {{ values: Object<string, any>, editable: Object<string, boolean>, order: string[] }}
 *   `editable[key]` is false for values kept as written but not understood (nested maps and the like).
 */
export function readYaml(text) {
  const { ls, segs } = segment(text), values = {}, editable = {}, order = [];
  for (const seg of segs) if (seg.type === 'key') {
    const e = readEntry(ls, seg);
    order.push(e.key);
    editable[e.key] = e.kind !== 'complex';
    if (e.kind !== 'complex') values[e.key] = e.value;
  }
  return { values, editable, order };
}

// ---------- Writing ----------

const RESERVED = /^(true|false|null|~|yes|no|on|off)$/i;
const NUMBERISH = /^[-+]?(\d[\d_]*|\d*\.\d+)([eE][-+]?\d+)?$|^0[xo]|^\.(inf|nan)$/i;
function plainOk(s, flow) {
  return s !== '' && s === s.trim() && !RESERVED.test(s) && !NUMBERISH.test(s) && !/^[-?:,[\]{}#&*!|>'"%@`]/.test(s) &&
    !/: |:$| #|\n|\t/.test(s) && !(flow && /[,[\]{}]/.test(s));
}
const dq = s => '"' + s.replace(/[\\"]/g, c => '\\' + c).replace(/\n/g, '\\n').replace(/\t/g, '\\t').replace(/\r/g, '\\r') + '"';
const sq = s => "'" + s.replace(/'/g, "''") + "'";
function scalar(v, style = 'plain', flow = false) {
  if (v === null || v === undefined) return 'null';
  if (typeof v === 'boolean' || typeof v === 'number') return String(v);
  v = String(v);
  if (style === 'double') return dq(v);
  if (style === 'single' && !/\n/.test(v)) return sq(v);
  return plainOk(v, flow) ? v : dq(v);
}
const same = (a, b) => JSON.stringify(a) === JSON.stringify(b);

function writeEntry(old, key, value, nl) {
  const sep = old ? old.separator : `${key}: `;
  const comment = old?.comment ? ' ' + old.comment : '';
  const kind = old?.kind;
  if (Array.isArray(value)) {
    if (kind === 'block-list' || (!kind && value.join(', ').length > 60)) {
      const prefix = old?.itemPrefix ?? '  - ';
      return [sep.trimEnd() + comment + nl, ...value.map(v => prefix + scalar(v, 'plain') + nl)];
    }
    return [sep + '[' + value.map(v => scalar(v, 'plain', true)).join(', ') + ']' + comment + nl];
  }
  if (typeof value === 'string' && (kind === 'text' || /\n/.test(value))) {
    const indent = old?.indent ?? '  ';
    const keep = /\n$/.test(value), body = keep ? value.slice(0, -1) : value;
    return [sep + (keep ? '|' : '|-') + comment + nl, ...body.split('\n').map(l => (l ? indent + l : '') + nl)];
  }
  const style = kind === 'double' || kind === 'single' ? kind : 'plain';
  return [sep + scalar(value, style) + comment + nl];
}

/**
 * Apply changes to a YAML document, touching only the changed keys' lines.
 * @param {string} text
 * @param {Object<string, any>} changes  New values; `undefined` removes the key. A value equal to the current one is
 *   no change. New keys go at the end.
 * @returns {string}
 * @throws if a change targets a value that isn't editable (kept as written).
 */
export function writeYaml(text, changes) {
  const { ls, segs } = segment(text), nl = eol(text);
  const out = [], done = new Set();
  for (const seg of segs) {
    const chunk = ls.slice(seg.start, seg.end);
    if (seg.type !== 'key' || !(seg.key in changes)) { out.push(...chunk); continue; }
    const old = readEntry(ls, seg), next = changes[seg.key];
    done.add(seg.key);
    if (old.kind === 'complex') {
      if (next === undefined) continue;
      throw new Error(`"${seg.key}" is written in a form the editor keeps as is; change it in the file itself.`);
    }
    if (next === undefined) continue;
    if (same(old.value, next)) { out.push(...chunk); continue; }
    // A block value's trailing blank lines belong to the layout, not the value: keep them.
    const trailing = []; for (let k = chunk.length - 1; k > 0 && stripEnd(chunk[k]).trim() === ''; k--) trailing.unshift(chunk[k]);
    const written = writeEntry(old, seg.key, next, nl);
    if (!/\n$/.test(chunk[chunk.length - 1]) && !trailing.length) written[written.length - 1] = stripEnd(written[written.length - 1]);
    out.push(...written, ...trailing);
  }
  const added = Object.keys(changes).filter(k => !done.has(k) && changes[k] !== undefined);
  if (added.length) {
    if (out.length && !/\n$/.test(out[out.length - 1])) out[out.length - 1] += nl;
    for (const k of added) out.push(...writeEntry(null, k, changes[k], nl));
  }
  return out.join('');
}

// ---------- Front matter blocks ----------

const FM = /^(﻿?---[ \t]*\r?\n)([\s\S]*?)((?:---|\.\.\.)[ \t]*(?:\r?\n|$))$/;

/** Read a front matter block as splitFrontMatter() gives it ('' for none). */
export function readFrontMatter(frontMatter) {
  const m = FM.exec(frontMatter);
  return m ? readYaml(m[2]) : { values: {}, editable: {}, order: [] };
}

/** Apply changes to a front matter block, keeping its delimiters; '' with changes becomes a new block. */
export function writeFrontMatter(frontMatter, changes) {
  const m = FM.exec(frontMatter);
  if (m) return m[1] + writeYaml(m[2], changes) + m[3];
  const inner = writeYaml('', changes);
  return inner ? `---\n${inner}---\n` : frontMatter;
}
