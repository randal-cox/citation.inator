/* draft.inator: the Details panel. A page's front matter, edited as a form drawn from the site's collection fields
   (Sveltia CMS's field format: name, label, widget, required, hint, pattern, options, multiple, min, max, and, for
   relations, collection, value_field, display_fields). Every change is written with writeFrontMatter, so only the
   keys a writer changes are touched; keys the collection doesn't describe, and values too complex for a form, are
   kept exactly as written. Plain browser JavaScript; the parts without a page also run in Node. */
import { readFrontMatter, writeFrontMatter } from './yaml.js';
import { picker } from './picker.js';

// Widgets the panel edits. Anything else (object, code, map, a list of objects, a site's own widget) is kept as is.
const EDITED = new Set(['string', 'text', 'number', 'boolean', 'datetime', 'date', 'select', 'relation', 'list', 'image', 'file']);

/**
 * The fields the panel shows, from a collection's fields: defaults filled in (widget `string`, required true, as in
 * Sveltia), the body left out (it is the text being written), and each marked `edited` or kept as is.
 * @param {Array<object>} fields  A collection's `fields`.
 */
export function panelFields(fields = []) {
  return fields
    .filter(f => f && f.name && !(f.name === 'body' && (!f.widget || f.widget === 'markdown')))
    .map(f => {
      const widget = f.widget || 'string';
      // A list is edited only as a list of plain values: no sub-fields, or a single string sub-field.
      const simpleList = widget === 'list' && !f.fields && !f.types && (!f.field || (f.field.widget || 'string') === 'string');
      return { ...f, widget, label: f.label || (f.name[0].toUpperCase() + f.name.slice(1)).replace(/[_-]+/g, ' '), required: f.required !== false,
        edited: widget !== 'hidden' && EDITED.has(widget) && (widget !== 'list' || simpleList) };
    });
}

// `{{slug}}`, `{{fields.name}}`, or a bare field name, read from an entry ({ slug, ...fields }).
function pick(entry, template) {
  const one = t => { const k = t.trim().replace(/^fields\./, ''); const v = entry[k]; return v == null ? '' : String(v); };
  return /\{\{/.test(template) ? template.replace(/\{\{([^}]+)\}\}/g, (_, t) => one(t)) : one(template);
}

/**
 * The choices for a relation field, from the host's entries for that collection.
 * @param {object} field  A relation field.
 * @param {Record<string, Array<object>>} entries  `window.DRAFT_ENTRIES`: entries by collection name.
 * @returns {Array<{ value: string, label: string }>}
 */
export function relationOptions(field, entries = {}) {
  const list = entries[field.collection] || [];
  const valueField = field.value_field || '{{slug}}';
  const display = [].concat(field.display_fields || [valueField]);
  return list.map(e => ({ value: pick(e, valueField), label: display.map(d => pick(e, d)).filter(Boolean).join(' · ') || pick(e, valueField) }))
    .filter(o => o.value)
    .sort((a, b) => a.label.localeCompare(b.label));
}

const isEmpty = v => v == null || v === '' || (Array.isArray(v) && v.length === 0);

/**
 * What stops a page being saved: required fields left empty, patterns not matched, numbers out of range. Values the
 * panel keeps as is are never judged.
 * @returns {Array<{ name: string, label: string, message: string }>}
 */
export function checkDetails(fields, values) {
  const out = [];
  for (const f of panelFields(fields)) {
    if (!f.edited) continue;
    const v = values[f.name], say = message => out.push({ name: f.name, label: f.label, message });
    if (isEmpty(v)) { if (f.required) say(`${f.label} is required.`); continue; }
    if (f.pattern && typeof v === 'string') {
      const [re, msg] = Array.isArray(f.pattern) ? f.pattern : [f.pattern];
      try { if (!new RegExp(re).test(v)) say(msg || `${f.label} isn't in the expected form.`); } catch { /* a pattern this browser can't read isn't the writer's fault */ }
    }
    if (f.widget === 'number') {
      if (typeof v !== 'number' || Number.isNaN(v)) say(`${f.label} must be a number.`);
      else {
        if (f.value_type === 'int' && !Number.isInteger(v)) say(`${f.label} must be a whole number.`);
        if (f.min != null && v < f.min) say(`${f.label} must be at least ${f.min}.`);
        if (f.max != null && v > f.max) say(`${f.label} must be at most ${f.max}.`);
      }
    }
    if ((f.widget === 'list' || (f.multiple && (f.widget === 'select' || f.widget === 'relation'))) && Array.isArray(v)) {
      if (f.min != null && v.length < f.min) say(`${f.label} needs at least ${f.min}.`);
      if (f.max != null && v.length > f.max) say(`${f.label} takes at most ${f.max}.`);
    }
  }
  return out;
}

/**
 * The change one field makes to the front matter. Clearing a field the page didn't have leaves it out, rather
 * than writing an empty key.
 */
export function applyDetail(frontMatter, name, value, hadKey) {
  return writeFrontMatter(frontMatter, { [name]: isEmpty(value) && !hadKey ? undefined : value });
}

/**
 * Positions for an order field, from the other entries of the page's collection: each says which entries already
 * hold it, so a writer chooses a place, not a bare number.
 * @param {string} name  The field ("order").
 * @param {Array<object>} siblings  The collection's other entries ({ slug, title, [name]: number }).
 * @returns {Array<{ value: number, label: string, hint: string }>}
 */
export function orderOptions(name, siblings = []) {
  const placed = siblings.filter(e => typeof e[name] === 'number').sort((a, b) => a[name] - b[name]);
  const top = placed.length ? placed[placed.length - 1][name] : 0;
  const out = [];
  for (let n = 1; n <= top + 1; n++) {
    const here = placed.filter(e => e[name] === n).map(e => `“${e.title || e.name || e.slug}”`);
    out.push({ value: n, label: String(n), hint: here.length ? 'with ' + here.join(', ') : n > top ? 'after all the others' : 'free' });
  }
  return out;
}

/**
 * Choices for a list of plain values (keywords): the field's own `options`, or else the values the collection's
 * other entries use, most used first.
 */
export function listSuggestions(field, siblings = []) {
  if (Array.isArray(field.options)) return field.options.map(o => (typeof o === 'object' ? o : { value: String(o), label: String(o) }));
  const count = new Map();
  for (const e of siblings) for (const v of [].concat(e[field.name] ?? [])) if (v !== '' && v != null) count.set(String(v), (count.get(String(v)) || 0) + 1);
  return [...count].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0])).map(([v, n]) => ({ value: v, label: v, hint: n > 1 ? `on ${n} pages` : '' }));
}

// ---------- The panel (needs a page) ----------

let uid = 0;
function el(tag, attrs = {}, kids = []) {
  const n = document.createElement(tag);
  for (const [k, v] of Object.entries(attrs)) {
    if (k === 'text') n.textContent = v;
    else if (v === true) n.setAttribute(k, '');
    else if (v !== false && v != null) n.setAttribute(k, v);
  }
  for (const kid of kids) if (kid) n.append(kid);
  return n;
}

const DATE = /^\d{4}-\d{2}-\d{2}$/, DATETIME = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/;
const choicesOf = f => (f.options || []).map(o => (typeof o === 'object' ? o : { value: String(o), label: String(o) }));
const singular = f => (f.label_singular || f.label.replace(/ies$/, 'y').replace(/s$/, '')).toLowerCase();
const article = w => (/^[aeiou]/i.test(w) ? 'an ' : 'a ') + w;

/**
 * Draw the Details panel into `host`: the title large, a subtitle under it, a summary that opens when wanted, and
 * the rest as compact rows whose choosers open only when asked for.
 * @param {HTMLElement} host
 * @param {object} options
 * @param {Array<object>} options.fields  The collection's fields.
 * @param {string} options.frontMatter  The page's front matter, delimiters included ('' for none).
 * @param {(frontMatter: string) => void} options.change  Called with the new front matter.
 * @param {Record<string, Array<object>>} [options.entries]  Entries by collection, for relations, keyword
 *   suggestions, and order.
 * @param {string} [options.collection]  The page's own collection name (its entries are the page's siblings).
 * @param {string} [options.slug]  The page's own slug, so it isn't its own sibling.
 * @param {Array<{label, path, url?}>} [options.images]  Images an image field can offer.
 * @returns {{ show(problems: Array<{name, message}>): void, values(): object }}
 */
export function drawDetails(host, { fields, frontMatter, change, entries = {}, collection = null, slug = null, images = [] }) {
  let fm = frontMatter;
  const start = readFrontMatter(fm);
  const had = new Set(start.order);
  const values = { ...start.values };
  const shown = panelFields(fields).filter(f => f.widget !== 'hidden');
  const siblings = (collection && entries[collection] || []).filter(e => !slug || e.slug !== slug);
  const errors = {};
  host.textContent = '';
  host.classList.add('di-fields');

  const set = (name, value) => {
    values[name] = value;
    fm = applyDetail(fm, name, value, had.has(name));
    if (errors[name]) { errors[name].textContent = ''; errors[name].hidden = true; }
    change(fm);
  };

  const lead = shown.find(f => f.edited && f.widget === 'string' && f.name === 'title') || shown.find(f => f.edited && f.widget === 'string');
  const sub = shown.find(f => f.edited && f.widget === 'string' && f !== lead && /^(subtitle|sub_title|dek|standfirst)$/.test(f.name));
  const top = el('div', { class: 'di-top' }), rows = el('div', { class: 'di-props' });
  host.append(top, rows);

  for (const f of shown) {
    const id = 'di-d' + (++uid), labelId = id + '-label', errId = id + '-err', hintId = id + '-hint';
    const err = errors[f.name] = el('p', { class: 'di-field-error', id: errId, hidden: true });
    const hint = f.hint ? el('p', { class: 'di-hint', id: hintId, text: f.hint }) : null;
    const describedBy = [hint && hintId, errId].filter(Boolean).join(' ');
    const req = f.required && f.edited ? el('span', { class: 'di-req', text: ' (required)' }) : null;
    const v = values[f.name];
    const kept = !f.edited || (had.has(f.name) && start.editable[f.name] === false);
    const field = el('div', { class: 'di-field', 'data-name': f.name });

    // The title and subtitle: full width, the title large.
    if (!kept && (f === lead || f === sub)) {
      const input = el('input', { type: 'text', id, class: f === lead ? 'di-lead' : 'di-sub', 'aria-describedby': describedBy, placeholder: f.label });
      input.value = v == null ? '' : String(v);
      input.addEventListener('input', () => set(f.name, input.value));
      field.append(...[el('label', { for: id, class: 'di-top-label' }, [document.createTextNode(f.label), req]), input, hint, err].filter(Boolean));
      top.append(field); continue;
    }
    // Longer text: one line of it, opened when wanted.
    if (!kept && f.widget === 'text') {
      const area = el('textarea', { id, rows: 3, 'aria-describedby': describedBy, hidden: true });
      area.value = v == null ? '' : String(v);
      const peek = el('span', { class: 'di-peek' });
      const toggle = el('button', { type: 'button', class: 'di-disclose', 'aria-expanded': 'false', 'aria-controls': id }, [
        el('span', { class: 'di-disclose-label' }, [document.createTextNode(f.label), req]), peek]);
      const drawPeek = () => { peek.textContent = area.value.trim() ? area.value.trim().replace(/\s+/g, ' ') : `Add ${article(f.label.toLowerCase())}`; peek.classList.toggle('di-none', !area.value.trim()); };
      drawPeek();
      toggle.addEventListener('click', () => {
        const opening = area.hidden;
        area.hidden = !opening; toggle.setAttribute('aria-expanded', String(opening)); peek.hidden = opening;
        if (opening) area.focus(); else drawPeek();
      });
      area.addEventListener('input', () => set(f.name, area.value));
      area.addEventListener('keydown', e => { if (e.key === 'Escape') { e.preventDefault(); toggle.click(); toggle.focus(); } });
      area.setAttribute('aria-label', f.label);
      field.classList.add('di-text');
      field.append(...[toggle, area, hint, err].filter(Boolean));
      top.append(field); continue;
    }

    // Everything else: a row, its label beside its value.
    field.classList.add('di-prop');
    const label = el(kept ? 'span' : 'label', { class: 'di-prop-label', id: labelId, for: kept ? null : id }, [document.createTextNode(f.label), req]);
    const value = el('div', { class: 'di-prop-value' });
    field.append(label, value);
    rows.append(field);
    if (kept) {
      value.append(el('span', { class: 'di-kept', text: had.has(f.name) ? 'Kept as written' : 'Not set' }));
      field.classList.add('di-prop-kept');
      continue;
    }
    label.removeAttribute('for');
    const add = node => value.append(...[node, hint, err].filter(Boolean));
    const choose = opts => { const p = picker({ label: f.label, describedBy, required: f.required, onChange: x => set(f.name, x), ...opts }); return p.element; };

    if (f.widget === 'boolean') {
      const box = el('input', { type: 'checkbox', role: 'switch', id, checked: v === true, 'aria-labelledby': labelId, 'aria-describedby': describedBy });
      box.addEventListener('change', () => set(f.name, box.checked));
      add(el('span', { class: 'di-switch' }, [box]));
    } else if (f.widget === 'relation' || f.widget === 'select') {
      const opts = () => (f.widget === 'relation' ? relationOptions(f, entries) : choicesOf(f));
      add(choose({ noun: article(singular(f)), multiple: !!f.multiple, value: v, options: opts }));
    } else if (f.widget === 'list') {
      add(choose({ noun: article(singular(f)), multiple: true, value: Array.isArray(v) ? v : v == null || v === '' ? [] : [v], options: () => listSuggestions(f, siblings), create: true }));
    } else if (f.widget === 'image' || f.widget === 'file') {
      const thumb = p => images.find(i => i.path === p)?.url || p;
      add(choose({ noun: article(f.widget === 'image' ? 'image' : 'file'), value: v, thumbs: f.widget === 'image',
        options: () => images.map(i => ({ value: i.path, label: i.label, thumb: i.url || i.path })).concat(
          v && !images.some(i => i.path === v) ? [{ value: v, label: String(v), thumb: thumb(v) }] : []),
        create: typed => (/^(\/|https?:\/\/)\S+$/.test(typed) ? typed : null) }));
    } else if (f.widget === 'number' && siblings.some(e => typeof e[f.name] === 'number')) {
      add(choose({ noun: 'a place', value: v,
        options: () => orderOptions(f.name, siblings).map(o => (o.value === values[f.name] && o.hint === 'free' ? { ...o, hint: 'this page' } : o)),
        create: typed => (/^-?\d+(\.\d+)?$/.test(typed) ? Number(typed) : null) }));
    } else if (f.widget === 'number') {
      const input = el('input', { type: 'number', id, class: 'di-short', 'aria-labelledby': labelId, 'aria-describedby': describedBy,
        step: f.step ?? (f.value_type === 'int' ? 1 : 'any'), min: f.min, max: f.max });
      input.value = v == null ? '' : String(v);
      input.addEventListener('input', () => set(f.name, input.value === '' ? '' : Number(input.value)));
      add(input);
    } else if (f.widget === 'datetime' || f.widget === 'date') {
      const dateOnly = f.widget === 'date' || f.time_format === false, cur = v == null ? '' : String(v);
      const fits = !cur || (dateOnly ? DATE : DATETIME).test(cur);   // a value the picker can't show stays text
      const input = el('input', { type: fits ? (dateOnly ? 'date' : 'datetime-local') : 'text', id, class: 'di-short', 'aria-labelledby': labelId, 'aria-describedby': describedBy });
      input.value = cur;
      input.addEventListener('input', () => set(f.name, input.value));
      add(input);
    } else {
      const input = el('input', { type: 'text', id, 'aria-labelledby': labelId, 'aria-describedby': describedBy });
      input.value = v == null ? '' : String(v);
      input.addEventListener('input', () => set(f.name, input.value));
      add(input);
    }
  }

  const extra = start.order.filter(k => !panelFields(fields).some(f => f.name === k));
  if (extra.length) host.append(el('p', { class: 'di-hint di-extra', text: 'Also in this page, kept as written: ' + extra.join(', ') }));

  return {
    values: () => ({ ...values }),
    /** Show problems beside their fields; focus the first. */
    show(problems) {
      for (const e of Object.values(errors)) { e.textContent = ''; e.hidden = true; }
      for (const p of problems) {
        const e = errors[p.name];
        if (e) { e.textContent = e.textContent ? e.textContent + ' ' + p.message : p.message; e.hidden = false; }
      }
      const row = problems[0] && host.querySelector(`[data-name="${CSS.escape(problems[0].name)}"]`);
      const first = row && row.querySelector('input:not([hidden]), select, textarea:not([hidden]), button');
      if (first) first.focus();
    }
  };
}
