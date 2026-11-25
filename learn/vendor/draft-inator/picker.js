/* draft.inator: a chooser that stays out of the way. The current choice shows as chips (or one value, or a picture);
   the choosing (a search box over a list, which copes with hundreds of entries) opens only when asked for. Used by
   the Details panel for authors, topics, keywords, a card image, and an order. Plain browser JavaScript; no inline
   handlers; the search box is an ARIA combobox over a listbox, so it works from the keyboard and with a screen reader:
   arrows move, Enter chooses, Escape closes. */

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

const SHOW = 100;   // choices drawn at once; more are reached by typing

/**
 * @param {object} o
 * @param {string} o.label  What is being chosen ("Authors").
 * @param {string} o.noun  One of them, for buttons ("author").
 * @param {boolean} [o.multiple]  Several values (an array) or one.
 * @param {*} o.value  The current value: an array when `multiple`.
 * @param {() => Array<{ value, label: string, hint?: string, thumb?: string }>} o.options  The choices.
 * @param {true | ((typed: string) => *)} [o.create]  Allow a value not among the choices: true for the typed text,
 *   or a function giving the value for it (null if it can't be one).
 * @param {boolean} [o.thumbs]  Show pictures (choices with `thumb`), as a gallery.
 * @param {boolean} [o.required]  A single value can't be removed, only changed.
 * @param {string} [o.describedBy]  Ids of the hint and error text.
 * @param {(value) => void} o.onChange
 * @returns {{ element: HTMLElement, focus(): void }}
 */
export function picker(o) {
  const id = 'di-p' + (++uid);
  let value = o.multiple ? (Array.isArray(o.value) ? o.value.slice() : []) : o.value ?? '';
  const known = () => o.options();
  const find = v => known().find(c => String(c.value) === String(v));

  const root = el('div', { class: 'di-pick' + (o.thumbs ? ' di-pick-thumbs' : ''), role: 'group', 'aria-label': o.label, 'aria-describedby': o.describedBy });
  const shown = el(o.multiple ? 'ul' : 'div', { class: o.multiple ? 'di-chips' : 'di-pick-value', 'aria-label': o.multiple ? o.label : null });
  const open = el('button', { type: 'button', class: 'di-pick-open', 'aria-expanded': 'false', 'aria-controls': id + '-pop' });
  const clear = !o.multiple && !o.required ? el('button', { type: 'button', class: 'di-pick-clear', text: 'Remove' }) : null;
  const search = el('input', { type: 'text', role: 'combobox', 'aria-autocomplete': 'list', 'aria-expanded': 'true',
    'aria-controls': id + '-list', 'aria-label': `Find ${o.noun}`, autocomplete: 'off', spellcheck: 'false',
    placeholder: o.create ? 'Find, or type a new one…' : 'Find…' });
  const list = el('ul', { role: 'listbox', id: id + '-list', 'aria-label': o.label, 'aria-multiselectable': o.multiple ? 'true' : null,
    class: o.thumbs ? 'di-pick-grid' : null });
  const more = el('p', { class: 'di-pick-more', 'aria-live': 'polite' });
  const pop = el('div', { class: 'di-pop', id: id + '-pop', hidden: true }, [search, list, more]);
  root.append(...[shown, el('div', { class: 'di-pick-actions' }, [open, clear].filter(Boolean)), pop]);

  // ---------- What is chosen ----------
  function drawChosen() {
    shown.textContent = '';
    if (o.multiple) {
      for (const v of value) {
        const c = find(v), name = c ? c.label : String(v);
        const x = el('button', { type: 'button', class: 'di-chip-x', 'aria-label': `Remove ${name}`, text: '×' });
        x.addEventListener('click', () => {
          const i = value.indexOf(v);
          if (i >= 0) value.splice(i, 1);
          drawChosen(); o.onChange(value.slice());
          (shown.querySelector('.di-chip-x') || open).focus();
        });
        shown.append(el('li', { class: 'di-chip' + (c ? '' : ' di-chip-unknown'), title: c ? null : 'Not in the list; kept as written' },
          [c?.thumb && el('img', { src: c.thumb, alt: '' }), el('span', { text: name }), x]));
      }
      if (!value.length) shown.append(el('li', { class: 'di-none', text: 'None yet' }));
      open.textContent = `Add ${o.noun}`;
    } else {
      const c = value === '' || value == null ? null : find(value);
      if (value === '' || value == null) shown.append(el('span', { class: 'di-none', text: 'None' }));
      else {
        if (o.thumbs) shown.append(el('img', { src: c?.thumb || String(value), alt: '', class: 'di-pick-thumb' }));
        shown.append(el('span', { text: c ? c.label : String(value) }));
        if (c?.hint) shown.append(el('span', { class: 'di-pick-hint', text: c.hint }));
      }
      open.textContent = value === '' || value == null ? `Choose ${o.noun}` : 'Change';
      if (clear) clear.hidden = value === '' || value == null;
    }
    open.setAttribute('aria-label', `${open.textContent}: ${o.label}`);
  }
  if (clear) clear.addEventListener('click', () => { value = ''; o.onChange(value); drawChosen(); open.focus(); });

  // ---------- Choosing ----------
  let active = -1, items = [];
  const chosen = v => (o.multiple ? value.some(x => String(x) === String(v)) : String(value) === String(v));
  function drawList() {
    const q = search.value.trim().toLowerCase(), words = q.split(/\s+/).filter(Boolean);
    const all = known().filter(c => { const t = `${c.label} ${c.value} ${c.hint || ''}`.toLowerCase(); return words.every(w => t.includes(w)); });
    items = all.slice(0, SHOW).map(c => ({ ...c }));
    if (o.create && q && !known().some(c => String(c.value).toLowerCase() === q || c.label.toLowerCase() === q)) {
      const made = o.create === true ? search.value.trim() : o.create(search.value.trim());
      if (made != null && made !== '') items.unshift({ value: made, label: `Add “${made}”`, made: true });
    }
    list.textContent = '';
    items.forEach((c, i) => {
      const li = el('li', { role: 'option', id: `${id}-o${i}`, 'aria-selected': String(chosen(c.value)), class: c.made ? 'di-made' : null },
        [o.thumbs && c.thumb && el('img', { src: c.thumb, alt: '' }), el('span', { text: c.label }), c.hint && el('span', { class: 'di-pick-hint', text: c.hint })]);
      li.addEventListener('mousedown', e => e.preventDefault());   // keep focus in the search box
      li.addEventListener('click', () => choose(i));
      list.append(li);
    });
    more.textContent = all.length > SHOW ? `${all.length - SHOW} more; type to narrow them.` : items.length ? '' : (q ? 'Nothing matches.' : 'Nothing to choose yet.');
    setActive(items.length ? Math.min(Math.max(active, 0), items.length - 1) : -1);
  }
  function setActive(i) {
    active = i;
    [...list.children].forEach((li, j) => li.classList.toggle('di-active', j === i));
    if (i >= 0) { search.setAttribute('aria-activedescendant', `${id}-o${i}`); keepInView(list.children[i]); }
    else search.removeAttribute('aria-activedescendant');
  }
  // Scroll the list alone (scrollIntoView would also scroll the page and the editor, sideways too on a phone).
  function keepInView(li) {
    if (li.offsetTop < list.scrollTop) list.scrollTop = li.offsetTop;
    else if (li.offsetTop + li.offsetHeight > list.scrollTop + list.clientHeight) list.scrollTop = li.offsetTop + li.offsetHeight - list.clientHeight;
  }
  function choose(i) {
    const c = items[i];
    if (!c) return;
    if (o.multiple) {
      const at = value.findIndex(x => String(x) === String(c.value));
      if (at >= 0) value.splice(at, 1); else value.push(c.value);
      if (c.made) search.value = '';
      drawChosen(); drawList(); o.onChange(value.slice());
      search.focus();
    } else {
      value = c.value;
      o.onChange(value); drawChosen(); close(true);   // told first, so the choice's hint is up to date
    }
  }
  function show() {
    pop.hidden = false; open.setAttribute('aria-expanded', 'true');
    search.value = ''; active = Math.max(0, known().findIndex(c => chosen(c.value)));
    drawList(); search.focus();
    document.addEventListener('pointerdown', outside, true);
  }
  function close(refocus) {
    if (pop.hidden) return;
    pop.hidden = true; open.setAttribute('aria-expanded', 'false');
    document.removeEventListener('pointerdown', outside, true);
    if (refocus) open.focus();
  }
  const outside = e => { if (!root.contains(e.target)) close(false); };
  open.addEventListener('click', () => (pop.hidden ? show() : close(true)));
  search.addEventListener('input', () => { active = 0; drawList(); });
  search.addEventListener('keydown', e => {
    if (e.key === 'ArrowDown' || e.key === 'ArrowUp') { e.preventDefault(); if (items.length) setActive((active + (e.key === 'ArrowDown' ? 1 : items.length - 1)) % items.length); }
    else if (e.key === 'Enter') { e.preventDefault(); choose(active); }
    else if (e.key === 'Escape') { e.preventDefault(); e.stopPropagation(); close(true); }
    else if (e.key === 'Tab') close(false);
  });

  drawChosen();
  return { element: root, focus: () => open.focus() };
}
