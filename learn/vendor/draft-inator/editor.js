/* draft.inator: the article editor. Markdown with draft.inator's blocks (Cite, Figure) and a live preview, mounted
   into any element: a whole window, or a box inside the site's own page so its menus stay in view.

     import { mountEditor } from '/admin/draft-inator/editor/editor.js';
     mountEditor(document.querySelector('#edit-here'), {
       text: markdown,                       // the page's Markdown
       render: md => html,                   // the site's Markdown renderer (escape raw HTML in it)
       save: async text => 'Pull request opened',   // optional: where Save sends the text
     });

   Load src/editor/forms.js, the works list, and the blocks (src/blocks/*.js) first, as classic scripts. Plain
   browser JavaScript, no dependencies, no inline handlers, so it runs under a strict Content Security Policy. */

const LAYOUTS = [
  { id: 'split', label: 'Side by side' },
  { id: 'stacked', label: 'Stacked' },
  { id: 'write', label: 'Write only' },
  { id: 'preview', label: 'Preview only' }
];
const CODE = /```[\s\S]*?```|`[^`\n]*`/g;
const esc = v => String(v ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

function el(tag, attrs = {}, kids = []) {
  const n = document.createElement(tag);
  for (const [k, v] of Object.entries(attrs)) {
    if (k === 'text') n.textContent = v;
    else if (k === 'class') n.className = v;
    else if (v === true) n.setAttribute(k, '');
    else if (v !== false && v != null) n.setAttribute(k, v);
  }
  for (const kid of [].concat(kids)) if (kid) n.append(kid);
  return n;
}

// Blocks found in Markdown: figures (lines of their own) and citations, outside code. A block that isn't loaded (or
// isn't enabled) is skipped, and its tags stay as text.
function findBlocks(text, cite, figure) {
  const code = [...text.matchAll(CODE)].map(m => [m.index, m.index + m[0].length]);
  const inCode = at => code.some(([x, y]) => at >= x && at < y);
  const found = [];
  if (figure) for (const m of text.matchAll(new RegExp(figure.pattern.source, 'gm'))) if (!inCode(m.index)) found.push({ kind: 'figure', start: m.index, end: m.index + m[0].length, match: m });
  if (cite) for (const m of text.matchAll(new RegExp(cite.pattern.source, 'g'))) if (!inCode(m.index)) found.push({ kind: 'citation', start: m.index, end: m.index + m[0].length, match: m });
  found.inCode = inCode;
  return found.sort((x, y) => x.start - y.start);
}

// The blocks the page loaded, limited to `allowed` (ids such as ['citation']) when given.
function enabledBlocks(allowed) {
  const all = (window.DraftForms && window.DraftForms.components) || {};
  const on = id => all[id] && (!allowed || allowed.includes(id)) ? all[id] : null;
  return { cite: on('citation'), figure: on('figure') };
}

/**
 * Whether a page body is written in HTML rather than Markdown (most of its text is inside HTML elements). The editor
 * edits Markdown; an HTML body would show its tags as text in the preview, so a site may prefer not to offer it.
 * @param {string} body
 * @returns {'markdown' | 'html'}
 */
export function bodyKind(body) {
  const text = body.replace(CODE, '').trim();
  if (!text) return 'markdown';
  const inTags = (text.match(/<(p|div|ul|ol|li|section|table|h[1-6]|blockquote|figure)\b[^>]*>[\s\S]*?<\/\1>/gi) || []).join('').length;
  return inTags / text.length > 0.5 ? 'html' : 'markdown';
}

/**
 * The article as readers see it: Markdown through the site's renderer, with figures laid out as their tags say and
 * citations shown by their notes, plus a list of the works cited (at {citation endnote}, or at the end).
 * @param {string} text  Markdown with draft.inator blocks.
 * @param {object} [options]
 * @param {(markdown: string) => string} [options.render]  The site's Markdown renderer (it must escape raw HTML).
 * @param {string[]} [options.blocks]  Only these blocks (ids, such as ['citation']); default: every block loaded.
 * @param {(path: string) => string | null} [options.imageURL]  Where to load an image from; null if it isn't
 *   available (shown as a note, not a broken image). Default: the path itself.
 * @returns {{ html: string, title: string, words: number, citations: number, figures: number }}
 */
export function renderArticle(text, options = {}) {
  const { cite, figure } = enabledBlocks(options.blocks);
  const WORKS = Object.fromEntries((window.DRAFT_WORKS || []).map(w => [w.id, w]));
  const imageURL = options.imageURL || (p => p);
  const compiler = options.citations?.compileHTML && options.citations.cache ? options.citations : null;
  const found = findBlocks(text, cite, figure), cited = [], parts = [];
  const hold = html => `DRAFTPH${parts.push(html) - 1}X`;
  let out = '', last = 0;
  for (const b of found) {
    out += text.slice(last, b.start);
    if (b.kind === 'figure') {
      const d = figure.fromBlock(b.match);
      const cls = ['fig', d.align && 'align-' + d.align, d.width && 'width-' + d.width, d.wrap && 'wrap'].filter(Boolean).join(' ');
      const credit = [d.credit, d.licence].filter(Boolean).join(', ');
      const cap = d.caption || credit ? `<figcaption>${esc(d.caption)}${credit ? ` <small>${esc(credit)}</small>` : ''}</figcaption>` : '';
      const url = d.src ? imageURL(d.src) : null;
      const img = !d.src ? '' : url ? `<img src="${esc(url)}" alt="${esc(d.alt)}">`
        : `<div class="di-missing" role="img" aria-label="${esc(d.alt)}">${esc(d.src)} isn't in this browser. Uploads stay in the browser they were made in.</div>`;
      out += hold(`<figure class="${cls}">${img}${cap}</figure>`);
    } else {
      const data = cite.fromBlock(b.match);
      data.items.forEach(it => { if (it.work && !cited.includes(it.work)) cited.push(it.work); });
      // With citation.inator's compiler, the marker itself is kept (safe from Markdown) for the compiler to format.
      out += hold(compiler ? esc(b.match[0]) : `<a class="cite" href="#di-ref-${esc(data.items[0]?.work)}">${esc(cite.toPreview(data))}</a>`);
    }
    last = b.end;
  }
  out += text.slice(last);
  let placed = false;
  out = out.replace(/\{citation endnote(?:\s*\|[^}\n]*)?\}/g, (m, at) => (found.inCode(at) ? m : (placed = true, compiler ? hold(esc(m)) : 'DRAFTENDNOTES')));
  const endnotes = cited.length ? `<section class="endnotes"><h2>Works cited</h2><ol>${cited.map(id => { const w = WORKS[id];
    return `<li id="di-ref-${esc(id)}">${esc(w?.note || id)}${w?.title ? `. <cite>${esc(w.title)}</cite>.` : ' <span class="unresolved">(not yet found)</span>'}</li>`; }).join('')}</ol></section>` : '';
  const md = options.render || (m => m.split(/\n{2,}/).map(p => `<p>${esc(p)}</p>`).join(''));
  if (compiler && !placed && cited.length) out += '\n\n' + hold('{citation endnote}');
  let html = md(out + (compiler || placed || !cited.length ? '' : '\n\nDRAFTENDNOTES'))
    .replace(/<p>DRAFTENDNOTES<\/p>|DRAFTENDNOTES/g, endnotes)
    .replace(/<p>DRAFTPH(\d+)X<\/p>/g, (m, n) => parts[n]).replace(/DRAFTPH(\d+)X/g, (m, n) => parts[n]);
  let formatted = false, diagnostics = [];
  if (compiler) {
    try {
      const r = compiler.compileHTML(html, compiler.cache, { citationStyle: compiler.citationStyle || 'chicago-author-date', namespace: 'di-preview' });
      html = r.html; formatted = true; diagnostics = r.diagnostics || [];
    } catch (e) {
      // The compiler stopped: show the notes instead, and say why, rather than a blank preview.
      return { ...renderArticle(text, { ...options, citations: null }), compileError: e.message };
    }
  }
  const h1 = text.match(/^#\s+(.+)$/m);
  const prose = found.reduceRight((t, b) => t.slice(0, b.start) + t.slice(b.end), text).replace(/[#>*_`[\]()-]/g, ' ');
  return { html, title: h1 ? h1[1] : '', words: (prose.match(/[\p{L}\p{N}][\p{L}\p{N}'’-]*/gu) || []).length,
    citations: found.filter(b => b.kind === 'citation').length, figures: found.filter(b => b.kind === 'figure').length,
    formatted, diagnostics };
}

/**
 * What to do with a draft kept in this browser when the editor opens. The page's own text always loads; a kept draft
 * that differs is offered, never applied unasked.
 * @param {string} given  The page's text as the site gave it now.
 * @param {{ text: string, base?: string, at?: number } | null} kept  The kept draft: its text, the text it started
 *   from, and when it was kept.
 * @returns {'none' | 'same' | 'offer' | 'offer-changed'}  Nothing kept; kept but identical (forget it); offer it;
 *   offer it, warning that the page has changed since the draft began.
 */
export function recoveryChoice(given, kept) {
  if (!kept || typeof kept.text !== 'string') return 'none';
  if (kept.text === given) return 'same';
  return kept.base === undefined || kept.base === given ? 'offer' : 'offer-changed';
}

/**
 * @param {HTMLElement} root  Where the editor goes. It fills the element; give it a height (or `fullWindow`).
 * @param {object} options
 * @param {string | (() => Promise<string>)} options.text  The Markdown to edit.
 * @param {(markdown: string) => string} [options.render]  Markdown to HTML for the preview. Without it the preview
 *   shows paragraphs of plain text.
 * @param {(text: string) => Promise<string | void>} [options.save]  Adds a Save button; the returned text is shown.
 * @param {() => void} [options.done]  Adds a Done button (to leave the editor).
 * @param {() => Promise<string>} [options.reset]  Adds a Reset button that loads this text.
 * @param {string} [options.label]  What the box says it is ("Editing").
 * @param {string | null} [options.storageKey]  Keep the draft and settings in this browser under this name.
 * @param {Array<{label, path, url?}>} [options.images]  Images a figure can use; `url` if the path isn't servable.
 * @param {string} [options.publicFolder]  Where uploads are written (default `/uploads`).
 * @param {string} [options.previewClass]  The site's own class for article text, so the preview looks like the site.
 * @param {boolean} [options.fullWindow]  Fill the window instead of a box.
 * @param {string[]} [options.blocks]  Only these blocks (such as ['citation']); default: every block the page loaded.
 * @param {{ compileHTML: Function, cache: object, citationStyle?: string }} [options.citations]  Formatted citations
 *   and endnotes in the preview: citation.inator's browser compiler (citation-compiler.mjs) and the site's citation
 *   cache. Without it the preview shows each work's note.
 * @param {boolean} [options.showImport]  Show the Import citations button even without an importer (disabled).
 * @param {object} [options.importer]  Turns on Import citations: { process, describe?, siteCache?, recordId?,
 *   onRecords? } (see src/editor/importer.js). `process` is citation.inator's processImportRequest.
 */
export function mountEditor(root, options = {}) {
  const F = window.DraftForms;
  if (!F) throw new Error('Load src/editor/forms.js (and the blocks) before mounting the editor.');
  const o = { label: 'Editing', publicFolder: '/uploads', storageKey: null, ...options };
  // Only the blocks the page loaded (and, if `blocks` is given, allowed) appear: no button, no form, tags left as text.
  const { cite, figure } = enabledBlocks(o.blocks);
  F.publicFolder = o.publicFolder;
  for (const img of o.images || []) {
    if (!F.imageSources.some(s => s.path === img.path)) F.imageSources.push({ label: img.label, path: img.path });
    if (img.url) F.assets[img.path] = img.url;
  }
  const SAMPLES = new Set((o.images || []).map(i => i.path));

  const store = {
    get(k) { if (!o.storageKey) return null; try { return localStorage.getItem(o.storageKey + ':' + k); } catch { return null; } },
    set(k, v) { if (!o.storageKey) return false; try { localStorage.setItem(o.storageKey + ':' + k, v); return true; } catch { return false; } }
  };

  // ---------- Build the editor ----------
  root.classList.add('di-editor');
  if (o.fullWindow) root.classList.add('di-full');
  root.textContent = '';
  const title = el('span', { class: 'di-title', text: '' });
  const viewButton = el('button', { type: 'button', class: 'di-menu-button', 'aria-haspopup': 'menu', 'aria-expanded': 'false' });
  const menu = el('div', { class: 'di-menu', role: 'menu', 'aria-label': 'View', hidden: true });
  const layoutItems = LAYOUTS.map(l => el('button', { type: 'button', role: 'menuitemradio', 'aria-checked': 'false', 'data-layout': l.id, text: l.label }));
  const toolbarItem = el('button', { type: 'button', role: 'menuitemcheckbox', 'aria-checked': 'true', text: 'Toolbar' });
  const plainItem = el('button', { type: 'button', role: 'menuitem', text: 'Plain: just the text' });
  menu.append(...layoutItems, el('div', { role: 'separator' }), toolbarItem, plainItem);
  const head = el('div', { class: 'di-head' }, [
    el('span', { class: 'di-label', text: o.label }), title, el('span', { class: 'di-spacer' }),
    el('div', { class: 'di-view' }, [viewButton, menu])
  ]);
  const resetButton = o.reset && el('button', { type: 'button', class: 'di-quiet', text: 'Reset', title: 'Start again from the sample' });
  const doneButton = o.done && el('button', { type: 'button', class: 'di-quiet', text: 'Done' });
  const saveButton = o.save && el('button', { type: 'button', class: 'di-primary', text: 'Save' });
  head.append(...[resetButton, doneButton, saveButton].filter(Boolean));

  // The tooltip (title) may say more; the spoken name is the visible text, except for one-letter buttons (`name`).
  const tb = (cmd, text, label, extra = {}) => el('button', { type: 'button', 'data-cmd': cmd, title: label, ...extra }, typeof text === 'string' ? [document.createTextNode(text)] : text);
  const editButton = tb('edit', 'Edit', 'Put the cursor in a citation or figure (Ctrl+E)', { disabled: true });
  const toolbar = el('div', { class: 'di-toolbar', role: 'toolbar', 'aria-label': 'Formatting' }, [
    el('div', { class: 'di-group' }, [tb('heading', 'H', 'Heading', { 'aria-label': 'Heading' }), tb('bold', [el('b', { text: 'B' })], 'Bold (Ctrl+B)', { 'aria-label': 'Bold' }),
      tb('italic', [el('i', { text: 'I' })], 'Italic (Ctrl+I)', { 'aria-label': 'Italic' }), tb('link', 'Link', 'Link (Ctrl+K)'), tb('code', 'Code', 'Code')]),
    el('div', { class: 'di-group' }, [tb('ul', '• List', 'Bulleted list'), tb('ol', '1. List', 'Numbered list'), tb('quote', 'Quote', 'Quotation')]),
    el('div', { class: 'di-group di-blocks' }, [cite && tb('citation', 'Citation', 'Insert a citation'), figure && tb('figure', 'Figure', 'Insert a figure'),
      (cite || figure) && editButton, (o.importer || o.showImport) && tb('import', 'Import citations',
        o.importer ? 'Find citations such as (Bell, 1992) and convert them' : 'Coming with citation.inator\'s importer', { disabled: !o.importer })])
  ]);
  const source = el('textarea', { class: 'di-source', spellcheck: 'true', 'aria-label': 'The article, in Markdown' });
  const preview = el('article', { class: ['di-article', o.previewClass].filter(Boolean).join(' '), 'aria-label': 'Preview' });
  const readPane = el('div', { class: 'di-pane di-read' }, [preview]);
  const note = el('p', { class: 'di-note', text: 'Citations here show each work\'s note. Give the editor the site\'s citation records (the citations option) to see them formatted, with endnotes.' });
  readPane.append(note);
  const panes = el('div', { class: 'di-panes' }, [el('div', { class: 'di-pane di-write' }, [source]), readPane]);
  const counts = el('span'), saved = el('span'), live = el('span', { class: 'di-sr', role: 'status', 'aria-live': 'polite' });
  const status = el('div', { class: 'di-status' }, [counts, saved, live]);
  const exitPlain = el('button', { type: 'button', class: 'di-exit-plain', text: 'Leave plain (Esc)', hidden: true });
  const recoverText = el('span'), recoverButton = el('button', { type: 'button', class: 'di-primary', text: 'Restore them' });
  const discardButton = el('button', { type: 'button', class: 'di-quiet', text: 'Discard' });
  const recover = el('div', { class: 'di-recover', role: 'region', 'aria-label': 'Unsaved changes', hidden: true },
    [recoverText, el('span', { class: 'di-recover-actions' }, [recoverButton, discardButton])]);

  const dTitle = el('h2', { text: 'Citation' }), dFields = el('div'), dOut = el('output', { class: 'di-code' });
  const dError = el('p', { class: 'di-error', role: 'alert' });
  const dCancel = el('button', { type: 'button', class: 'di-quiet', text: 'Cancel' }), dSave = el('button', { type: 'submit', class: 'di-primary', text: 'Insert' });
  const dForm = el('form', { method: 'dialog' }, [dTitle, dFields, el('h3', { text: 'What it writes' }), dOut, dError, el('div', { class: 'di-actions' }, [dCancel, dSave])]);
  const dialog = el('dialog', { class: 'di-dialog' }, [dForm]);
  dialog.setAttribute('aria-label', 'Block');
  root.append(head, recover, toolbar, panes, status, exitPlain, dialog);

  const announce = msg => { live.textContent = ''; setTimeout(() => { live.textContent = msg; }, 30); };

  // ---------- Blocks in the text, and the preview ----------
  const blocks = text => findBlocks(text, cite, figure);
  const blockAt = (text, at) => blocks(text).find(b => at >= b.start && at <= b.end);
  // An upload lives only in the browser it was made in; elsewhere renderArticle says so instead of a broken image.
  const imageURL = p => F.assets[p] || (SAMPLES.has(p) || !p.startsWith(o.publicFolder + '/') || !o.storageKey ? p : null);
  function render() {
    const r = renderArticle(source.value, { render: o.render, imageURL, blocks: o.blocks, citations: o.citations });
    preview.innerHTML = r.html;
    note.hidden = r.formatted;
    if (r.compileError) { note.hidden = false; note.textContent = 'Citations show each work\'s note: the citation compiler stopped (' + r.compileError + ').'; }
    title.textContent = r.title;
    counts.textContent = `${r.words} words · ${r.citations} citations · ${r.figures} figures`;
  }

  // ---------- Editing text ----------
  // execCommand keeps the browser's undo history; setRangeText is the fallback.
  function replace(start, end, text, select) {
    source.focus();
    source.setSelectionRange(start, end);
    if (!document.execCommand || !document.execCommand('insertText', false, text)) {
      source.setRangeText(text, start, end, 'end');
      source.dispatchEvent(new Event('input'));
    }
    if (select) source.setSelectionRange(start + select[0], start + select[1]);
  }
  function wrap(before, after, placeholder) {
    const { selectionStart: a, selectionEnd: b, value } = source;
    const inner = value.slice(a, b) || placeholder;
    replace(a, b, before + inner + after, [before.length, before.length + inner.length]);
  }
  function prefixLines(prefix) {
    const v = source.value, a = v.lastIndexOf('\n', source.selectionStart - 1) + 1;
    let b = v.indexOf('\n', source.selectionEnd); if (b < 0) b = v.length;
    const p = i => (typeof prefix === 'function' ? prefix(i) : prefix), lines = v.slice(a, b).split('\n');
    const all = lines.every((l, i) => l.startsWith(p(i)));
    const next = lines.map((l, i) => (all ? l.slice(p(i).length) : p(i) + l)).join('\n');
    replace(a, b, next, [0, next.length]);
  }
  const COMMANDS = {
    bold: () => wrap('**', '**', 'bold text'),
    italic: () => wrap('*', '*', 'italic text'),
    code: () => wrap('`', '`', 'code'),
    link: () => { const { selectionStart: a, selectionEnd: b, value } = source; const t = value.slice(a, b) || 'link text';
      replace(a, b, `[${t}](https://)`, [t.length + 3, t.length + 11]); },
    heading: () => prefixLines('## '),
    ul: () => prefixLines('- '),
    ol: () => prefixLines(i => `${i + 1}. `),
    quote: () => prefixLines('> '),
    citation: () => openBlock('citation'),
    figure: () => openBlock('figure'),
    edit: () => { const b = blockAt(source.value, source.selectionStart); if (b) openBlock(b.kind, b); },
    import: async () => {
      const { openImport } = await import('./importer.js');
      openImport({ el, root, getText: () => source.value, replace, announce, focus: () => source.focus(),
        addWorks: (works, records) => {
          window.DRAFT_CITATION?.addWorks(works);
          // New works join the records the preview compiles with, so their citations are formatted at once.
          if (o.citations?.cache && records?.length) {
            const have = new Set(o.citations.cache.records.map(r => r.id));
            o.citations.cache = { ...o.citations.cache, records: [...o.citations.cache.records, ...records.filter(r => !have.has(r.id))] };
          }
          render();
        } }, o.importer);
    }
  };
  toolbar.addEventListener('click', e => { const b = e.target.closest('button[data-cmd]'); if (b && !b.disabled && COMMANDS[b.dataset.cmd]) COMMANDS[b.dataset.cmd](); });
  function updateEditButton() {
    const b = blockAt(source.value, source.selectionStart);
    editButton.disabled = !b;
    editButton.textContent = b ? `Edit ${b.kind}` : 'Edit';
  }

  // ---------- The block dialog ----------
  let editing = null;
  function openBlock(kind, range = null) {
    const component = kind === 'citation' ? cite : figure;
    const data = range ? component.fromBlock(range.match) : kind === 'citation' ? { items: [{}] } : {};
    editing = { kind, range: range && { start: range.start, end: range.end, raw: range.match[0] }, data };
    dTitle.textContent = (range ? 'Edit ' : 'Insert a ') + kind;
    dSave.textContent = range ? 'Save' : 'Insert';
    dError.textContent = '';
    const show = () => { dOut.textContent = component.toBlock(editing.data); };
    F.drawForm(component, dFields, editing.data, show);
    show();
    dialog.showModal();
    const first = dFields.querySelector('select, input:not([type=hidden]):not(.visually-hidden)');
    if (first) first.focus();
  }
  function problem(kind, d) {
    if (kind === 'citation') return d.items?.some(it => it.work) ? '' : 'Choose a work to cite.';
    if (!d.src) return 'Choose or upload an image.';
    if (!d.alt) return 'Add alt text: what the image shows, for people who can\'t see it.';
    return '';
  }
  dForm.addEventListener('submit', e => {
    e.preventDefault();
    const { kind, range, data } = editing, component = kind === 'citation' ? cite : figure;
    const p = problem(kind, data);
    if (p) { dError.textContent = p; return; }
    let text = component.toBlock(data);
    dialog.close();
    if (range) {
      if (source.value.slice(range.start, range.end) !== range.raw) { announce('The text changed while the form was open; nothing was saved.'); return; }
      replace(range.start, range.end, text);
    } else {
      const at = source.selectionStart, v = source.value;
      if (kind === 'figure') {   // a figure is a line of its own
        const lineStart = v.lastIndexOf('\n', at - 1) + 1;
        text = (at > lineStart ? '\n\n' : (lineStart > 0 && v[lineStart - 2] !== '\n' ? '\n' : '')) + text + '\n\n';
      }
      replace(at, source.selectionEnd, text);
    }
    announce(`${kind[0].toUpperCase() + kind.slice(1)} ${range ? 'saved' : 'inserted'}.`);
  });
  dCancel.addEventListener('click', () => { dialog.close(); source.focus(); });

  // ---------- The View menu ----------
  function setLayout(id, quiet) {
    root.dataset.layout = id;
    for (const item of layoutItems) item.setAttribute('aria-checked', String(item.dataset.layout === id));
    viewButton.textContent = 'View: ' + LAYOUTS.find(l => l.id === id).label;
    store.set('layout', id);
    if (!quiet) announce(`Layout: ${LAYOUTS.find(l => l.id === id).label}.`);
  }
  function setToolbar(on, quiet) {
    root.classList.toggle('di-no-toolbar', !on);
    toolbarItem.setAttribute('aria-checked', String(on));
    store.set('toolbar', on ? '1' : '0');
    if (!quiet) announce(on ? 'Toolbar shown.' : 'Toolbar hidden.');
  }
  function setPlain(on) {
    root.classList.toggle('di-plain', on);
    exitPlain.hidden = !on;
    source.focus();
    announce(on ? 'Plain: just the text. Press Escape to leave.' : 'Left plain.');
  }
  const items = () => [...menu.querySelectorAll('[role^=menuitem]')];
  function openMenu(focusLast) {
    menu.hidden = false; viewButton.setAttribute('aria-expanded', 'true');
    const list = items(), checked = list.find(i => i.getAttribute('aria-checked') === 'true' && i.dataset.layout);
    (focusLast ? list[list.length - 1] : checked || list[0]).focus();
  }
  function closeMenu(refocus) { menu.hidden = true; viewButton.setAttribute('aria-expanded', 'false'); if (refocus) viewButton.focus(); }
  viewButton.addEventListener('click', () => (menu.hidden ? openMenu() : closeMenu()));
  viewButton.addEventListener('keydown', e => { if (e.key === 'ArrowDown' || e.key === 'ArrowUp') { e.preventDefault(); openMenu(e.key === 'ArrowUp'); } });
  menu.addEventListener('keydown', e => {
    const list = items(), i = list.indexOf(document.activeElement);
    if (e.key === 'Escape') { e.preventDefault(); e.stopPropagation(); closeMenu(true); }
    else if (e.key === 'ArrowDown' || e.key === 'ArrowUp') { e.preventDefault(); list[(i + (e.key === 'ArrowDown' ? 1 : list.length - 1)) % list.length].focus(); }
    else if (e.key === 'Home' || e.key === 'End') { e.preventDefault(); list[e.key === 'Home' ? 0 : list.length - 1].focus(); }
    else if (e.key === 'Tab') closeMenu(false);
  });
  menu.addEventListener('click', e => {
    const item = e.target.closest('[role^=menuitem]');
    if (!item) return;
    closeMenu(true);
    if (item.dataset.layout) setLayout(item.dataset.layout);
    else if (item === toolbarItem) setToolbar(root.classList.contains('di-no-toolbar'));
    else if (item === plainItem) setPlain(true);
  });
  document.addEventListener('click', e => { if (!menu.hidden && !e.target.closest('.di-view')) closeMenu(false); });
  exitPlain.addEventListener('click', () => setPlain(false));

  // ---------- Keys ----------
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && root.classList.contains('di-plain') && !dialog.open) { e.preventDefault(); setPlain(false); }
  });
  source.addEventListener('keydown', e => {
    if (!(e.ctrlKey || e.metaKey) || e.altKey) return;
    const cmd = { b: 'bold', i: 'italic', k: 'link', e: 'edit' }[e.key.toLowerCase()];
    if (cmd) { e.preventDefault(); COMMANDS[cmd](); }
  });

  // ---------- Save, Done, Reset ----------
  if (saveButton) saveButton.addEventListener('click', async () => {
    saveButton.disabled = true; saved.textContent = 'Saving…';
    try {
      const text = source.value, msg = await o.save(text);
      base = text; forgetDraft();   // saved: the kept copy has done its job
      saved.textContent = msg || 'Saved'; announce(saved.textContent);
    }
    catch (error) { saved.textContent = 'Not saved: ' + (error?.message || error); announce(saved.textContent); }
    finally { saveButton.disabled = false; }
  });
  if (doneButton) doneButton.addEventListener('click', () => o.done(source.value));
  if (resetButton) resetButton.addEventListener('click', async () => {
    const text = await o.reset();
    base = text;
    replace(0, source.value.length, text);
    source.setSelectionRange(0, 0); source.scrollTop = 0;
    announce('Back to the sample article.');
  });

  // ---------- Scroll the preview with the writing ----------
  source.addEventListener('scroll', () => {
    const l = root.dataset.layout;
    if (l === 'write' || l === 'preview') return;
    const max = source.scrollHeight - source.clientHeight;
    if (max > 0) readPane.scrollTop = (source.scrollTop / max) * (readPane.scrollHeight - readPane.clientHeight);
  });

  // ---------- Uploads kept in this browser ----------
  F.onUpload = (path, file) => {
    if (!o.storageKey) return;
    if (file.size > 1_500_000) { announce('Uploaded. This image is too big to keep after you reload.'); return; }
    const reader = new FileReader();
    reader.onload = () => { if (!store.set('asset:' + path, reader.result)) announce('Uploaded, but it won\'t be kept after you reload.'); };
    reader.readAsDataURL(file);
  };
  function restoreUploads(text) {
    for (const m of text.matchAll(/\{figure "?([^"|}\s]+)/g)) {
      const kept = store.get('asset:' + m[1]);
      if (kept && kept.startsWith('data:image/')) {
        F.assets[m[1]] = kept;
        if (!F.imageSources.some(s => s.path === m[1])) F.imageSources.push({ label: m[1].split('/').pop() + ' (uploaded)', path: m[1] });
      }
    }
  }

  // ---------- Drafts kept in this browser ----------
  // Kept as { text, base, at }: the writer's text, the page text it started from, and when. On opening, the page's
  // own text always loads and a kept draft that differs is offered (recoveryChoice), never applied unasked, so a
  // newer save by someone else is never hidden. Saving forgets the kept draft.
  let base = '';
  const readDraft = () => {
    const raw = store.get('draft');
    if (raw) { try { return JSON.parse(raw); } catch { return null; } }
    const old = store.get('text');   // drafts kept by 0.3.0, as plain text
    return old == null ? null : { text: old };
  };
  const keepDraft = text => store.set('draft', JSON.stringify({ text, base, at: Date.now() }));
  const forgetDraft = () => { if (o.storageKey) try { localStorage.removeItem(o.storageKey + ':draft'); localStorage.removeItem(o.storageKey + ':text'); } catch {} };
  function offerDraft(kept, changed) {
    const when = kept.at ? new Date(kept.at).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' }) : 'an earlier visit';
    recoverText.textContent = `You have changes kept in this browser from ${when}.` +
      (changed ? ' The page has changed since you made them, so restoring them would replace the newer version.' : '');
    recover.hidden = false;
    recover.classList.toggle('di-recover-changed', changed);
    const done = msg => { recover.hidden = true; announce(msg); source.focus(); };
    recoverButton.onclick = () => { restoreUploads(kept.text); replace(0, source.value.length, kept.text); done('Your kept changes are back. Undo returns to the page as it was.'); };
    discardButton.onclick = () => { forgetDraft(); done('Kept changes discarded.'); };
    announce(recoverText.textContent);
  }

  // ---------- Start ----------
  let timer;
  source.addEventListener('input', () => {
    render(); updateEditButton();
    if (!o.storageKey) return;
    clearTimeout(timer);
    timer = setTimeout(() => {
      if (source.value === base) { forgetDraft(); saved.textContent = ''; return; }
      saved.textContent = keepDraft(source.value) ? 'Draft kept in this browser' : 'Draft not kept: browser storage is off';
    }, 400);
  });
  for (const ev of ['click', 'keyup', 'select']) source.addEventListener(ev, updateEditButton);

  const ready = (async () => {
    const given = typeof o.text === 'function' ? await o.text() : o.text || '';
    source.value = base = given;
    restoreUploads(given);
    setLayout(store.get('layout') || o.layout || 'split', true);
    setToolbar(store.get('toolbar') !== '0', true);
    const kept = readDraft(), choice = recoveryChoice(given, kept);
    if (choice === 'same') forgetDraft();
    if (choice === 'offer' || choice === 'offer-changed') offerDraft(kept, choice === 'offer-changed');
    render(); updateEditButton();
  })();

  return {
    ready,
    get text() { return source.value; },
    set text(v) { source.value = base = v; render(); updateEditButton(); },
    focus() { source.focus(); },
    setLayout
  };
}
