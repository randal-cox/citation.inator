/* draft.inator: import citations. Finds author–date citations (APA, Chicago, …) and the reference list in the article
   being edited, using citation.inator's importer, lets the writer review every match, and turns the accepted ones into
   {cite …} markers (the site's keyword) in one undoable step. citation.inator does the finding and matching; this file is the review
   and the editing. Nothing is applied that the writer hasn't seen: unique matches are proposed (and can be changed),
   others need a choice, and anything left alone stays exactly as written. */

// The site's one citation keyword (cite.inator 0.5.1, default cite): the Cite block's, else the data contract's.
export const citationKeyword = () => (typeof window !== 'undefined' && (window.DRAFT_CITATION?.keyword || window.DRAFT_CITATION_KEYWORD)) || 'cite';
const esc = v => String(v ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const STYLES = [
  { id: 'auto', label: 'Work it out' }, { id: 'apa', label: 'APA' },
  { id: 'chicago-author-date', label: 'Chicago author-date' }, { id: 'vancouver', label: 'Vancouver (numbered)' }
];
// cite.inator's evidence codes, in words. Codes not listed are internal and aren't shown.
const EVIDENCE = { 'exact-normalized': 'authors match', issued: 'year matches', 'exact-source-suffix': 'same year letter', 'not-specified': '' };

// A short note for a new work, as citation.inator would give it, when the site gives no describe().
function fallbackNote(r) {
  const names = (r.authors || []).map(a => a.family || a.literal).filter(Boolean);
  const who = names.length > 2 ? names[0] + ' et al.' : names.join(' and ') || r.title || 'An untitled reference';
  return `${who} ${r.issued?.[0] ?? 'n.d.'}`;
}

/**
 * A site-style id for a new work: first author's family name, year, and the title's first word, as in
 * bell-1992-ritual (the sample site's and korazonresearch.org's scheme), made unique against `taken`. A site with
 * another scheme passes its own `recordId`.
 * @param {object} record  A citation.inator record.
 * @param {{ taken: string[] }} context
 */
export function siteStyleId(record, { taken = [] } = {}) {
  const slug = v => String(v ?? '').normalize('NFKD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
  const first = record.authors?.[0];
  const who = slug(first?.family || (first?.literal || '').split(/\s+/)[0]) || 'anon';
  const year = /^\d{4}$/.test(String(record.issued?.[0])) ? String(record.issued[0]) : 'nd';
  const word = (record.title || '').split(/[\s:]+/).map(slug).find(w => w && !['a', 'an', 'the'].includes(w)) || 'work';
  const base = `${who}-${year}-${word}`;
  let id = base, n = 2;
  while (taken.includes(id)) id = `${base}-${n++}`;
  return id;
}

/**
 * Which works an applied import adds: the new records (not the site's own, reused) that a converted citation points
 * to. citation.inator also names uncited references in the list, which are not kept.
 * @param {{ recordMap: object, newRecordIds: string[], cache: { records: object[] } }} preview
 * @param {Array<{ targets: Array<{ recordId: string }> }>} decisions
 * @returns {object[]} records, with the ids the site gave them
 */
export function worksToKeep(preview, decisions) {
  const cited = new Set(decisions.flatMap(d => (d.targets || []).filter(t => t.recordId).map(t => preview.recordMap?.[t.recordId] ?? t.recordId)));
  // Placeholders for citations with no reference (cite.inator 0.5.1) are kept too: they're what a person completes later.
  for (const o of preview.outcomes || []) for (const id of o.placeholderRecordIds || []) cited.add(id);
  for (const id of preview.placeholderRecordIds || []) cited.add(id);
  const fresh = new Set(preview.newRecordIds ?? [...cited]);
  return (preview.cache?.records || []).filter(rec => cited.has(rec.id) && fresh.has(rec.id));
}

// A work kept as an unresolved placeholder: a flagged marker with the original wording, completed later.
export const PLACEHOLDER = '\u0000placeholder';
/** The decision cite.inator takes for one citation, from the writer's choice for each of its works. */
export function decisionFor(citationIndex, choices) {
  if (choices.every(c => c === PLACEHOLDER)) return { citationIndex, action: 'placeholder' };
  return { citationIndex, action: 'accept', targets: choices.map(c => (c === PLACEHOLDER ? { placeholder: true } : { recordId: c })) };
}

/**
 * Citations typed by hand in the text: author–date citations that aren't yet markers, found by cite.inator's import
 * analysis (existing markers and code are skipped). Used by the editor to warn, and to hold Save, until they're imported.
 * @param {string} text  The article.
 * @param {Function} process  cite.inator's processImportRequest.
 * @returns {{ count: number, examples: string[] }}
 */
export function findHandTyped(text, process, { keyword = citationKeyword() } = {}) {
  if (!process || !text || !/\(|\d{4}/.test(text)) return { count: 0, examples: [] };
  const found = style => {
    try {
      const a = process({ mode: 'document', source: text, style, citationKeyword: keyword, namespace: 'draft-check', limits: { references: 300 } });
      return a.review?.matches || [];
    } catch { return []; }
  };
  // When the style is ambiguous, count what either reading finds rather than nothing.
  let matches = found('auto');
  if (!matches.length) matches = [found('apa'), found('chicago-author-date')].sort((x, y) => y.length - x.length)[0];
  const raws = matches.map(m => m.citation.raw.replace(/\s+/g, ' '));
  return { count: raws.length, examples: [...new Set(raws)].slice(0, 3) };
}

/** A citation the review can propose with confidence: every work has exactly one candidate, unique. */
export function isProbablyRight(match) {
  return match.items.length > 0 && match.items.every(it => it.state === 'unique' && it.candidates?.length === 1);
}

const words = list => (list.length > 2 ? list.slice(0, -1).join(', ') + ', and ' + list[list.length - 1] : list.join(' and '));
const plain = v => String(v ?? '').toLowerCase().normalize('NFKD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, ' ').trim();
const families = r => (r?.authors || []).map(a => plain(a.family || a.literal)).join('|');

/**
 * What a proposed site work has in common with the imported reference, and what really differs, in words. Capitals,
 * punctuation, and initials against full given names don't count as differences; a missing subtitle is named as one.
 */
export function siteEvidence(candidate, source = null, site = null) {
  const same = [], diff = [];
  const e = [].concat(candidate.evidence || [])[0] || {};   // one evidence object (cite.inator 0.4.0), or a list
  const c = e.assessment?.comparisons || {};
  if (e.sharedIdentifierCount) same.push(e.sharedIdentifierCount === 1 ? 'the same DOI or ISBN' : 'the same identifiers');
  const st = plain(source?.title), tt = plain(site?.title);
  const titleSame = st && tt ? st === tt : c.title;
  const mainOnly = !titleSame && st && tt && (plain(String(source.title).split(':')[0]) === tt || plain(String(site.title).split(':')[0]) === st);
  const authorsSame = source && site ? families(source) === families(site) : c.authors;
  if (titleSame) same.push('title'); else if (mainOnly || e.mainTitleMatch) {
    same.push('main title');
    diff.push(plain(site?.title).length < plain(source?.title).length ? "the site's copy has no subtitle" : 'the typed reference has no subtitle');
  } else if (st && tt) diff.push('the titles differ');
  if (authorsSame) same.push('authors');
  if (c.year || (source?.issued?.[0] && source.issued[0] === site?.issued?.[0])) same.push('year');
  if (source && site && !authorsSame) diff.push('the authors differ');
  const head = same.length ? 'Same ' + words(same) : '';
  return [head, ...diff].filter(Boolean).join('; ') + (head || diff.length ? '.' : '');
}

/**
 * The sentence a citation sits in, with the citation marked: from the start of its sentence (or paragraph) to the
 * end, trimmed with an ellipsis only when the sentence is long.
 */
export function citationContext(text, start, end) {
  let a = Math.max(0, start - 240), before = text.slice(a, start);
  const cut = Math.max(before.lastIndexOf('\n'), ...[...before.matchAll(/[.!?]["”’)]?\s+(?=[A-Z“"(])/g)].map(m => m.index + m[0].length - 1));
  before = cut >= 0 ? before.slice(cut + 1).trimStart() : (a > 0 ? '…' + before.replace(/^\S*\s/, '') : before);
  let after = text.slice(end, end + 200);
  const stop = after.search(/[.!?](\s|$)|\n/);
  after = stop >= 0 ? after.slice(0, stop + 1).replace(/\n$/, '') : after.replace(/\s\S*$/, '…');
  return { before, after };
}

/**
 * The one edit that applies an import: the smallest stretch of the original text covering every accepted edit (and,
 * if asked, the reference list, replaced by the endnote directive), and what replaces it. Pure, so it can be tested.
 * @param {string} analysed  The text the import was analysed from.
 * @param {{ source: string, edits: Array<{start, end}> }} preview  citation.inator's preview result.
 * @param {{ start: number, end: number } | null} [bibliography]  The reference list to replace, if any.
 * @returns {{ start: number, end: number, text: string }}
 */
export function planReplacement(analysed, preview, bibliography = null, keyword = citationKeyword()) {
  const start = Math.min(...preview.edits.map(e => e.start));
  if (bibliography) {
    const shift = preview.source.length - analysed.length;
    return { start, end: bibliography.end,
      text: preview.source.slice(start, bibliography.start + shift) + `{${keyword} endnote}\n` + analysed.slice(bibliography.end).replace(/^\n+/, '\n') };
  }
  const end = Math.max(...preview.edits.map(e => e.end));
  return { start, end, text: preview.source.slice(start, preview.source.length - (analysed.length - end)) };
}

/**
 * @param {object} editor  What the importer needs from the editor (given by mountEditor).
 * @param {object} options  The editor's `importer` option:
 *   process     citation.inator's processImportRequest (required)
 *   describe    (markerId, cache) => short note, for the works list (citation.inator's describeCitation)
 *   siteCache   the site's own citation cache: references that look like works the site already has are offered
 *               for the writer to confirm, so they aren't added twice
 *   recordId    (record, { taken }) => the id the site gives a new work (default: siteStyleId, bell-1992-ritual)
 *   onRecords   (records, cache) => the site keeps new works (for example, alongside the page in the same pull request)
 *   style       the starting style (default 'auto')
 *   siteWorks   how strongly to steer to the site's own works: 'offer' (default: one clear match is selected, anything
 *               with a difference waits for a choice), 'prefer' (one match is selected even with differences), or
 *               'require' (no "Add it as a new work" when the site has a match)
 *   handTyped   what the editor does while citations are typed by hand: 'block' (default: Save waits), 'warn', or 'off'
 */
export function openImport(editor, options) {
  const { el, root } = editor;
  const opener = document.activeElement;   // focus goes back here, however the dialog closes
  const memory = editor.memory || new Map();
  const remember = m => `${m.citation.raw}\u0000${citationContext(analysed, m.citation.start, m.citation.end).before.slice(-40)}`;
  let style = options.style || 'auto', analysed = null, context = null, matches = [], chosen = [], siteChoice = {};

  const title = el('h2', { text: 'Import citations', tabindex: '-1' });
  const intro = el('p', { class: 'hint', text: 'Finds citations such as (Bell, 1992) and the reference list in this article, and turns the ones you accept into citations of works. Anything you leave stays as written.' });
  const styleSelect = el('select', { id: 'di-import-style' }, STYLES.map(s => el('option', { value: s.id, text: s.label, selected: s.id === style })));
  const find = el('button', { type: 'button', class: 'di-quiet', text: 'Find citations' });
  const controls = el('div', { class: 'di-import-controls' }, [el('label', { for: 'di-import-style', text: 'Citation style' }), styleSelect, find]);
  const summary = el('p', { class: 'di-import-summary', id: 'di-import-summary' });
  const spoken = el('span', { class: 'di-sr', role: 'status', 'aria-live': 'polite' });   // only what changed, briefly
  // Three sections, each a disclosure whose heading says how much is left in it, so a writer can close one and still
  // see its state: what needs them, the site's own works, and what's probably right (closed to start).
  const section = (cls, title, hint) => {
    const count = el('span', { class: 'di-import-count' });
    const body = el('div', { class: 'di-import-section-body' });
    const box = el('details', { class: 'di-import-section ' + cls, hidden: true }, [
      el('summary', {}, [el('span', { class: 'di-import-section-title', text: title }), el('span', { class: 'di-sr', text: ': ' }), count]), el('p', { class: 'hint', text: hint }), body]);
    return { box, count, body };
  };
  const secAttention = section('di-import-attention', 'Needs your attention', 'More than one work could match, or none in the reference list does. Choose for each, or leave it as written.');
  const secSite = section('di-import-site-section', 'Works this site already has', 'These references look like works already on the site. Use the site\'s work, or add the reference as a new one.');
  const secProbable = section('di-import-probable', 'Probably right', 'One clear match each, already selected. Check them; change any that are wrong.');
  const secRefs = section('di-import-refs', 'The reference list', 'Converted citations get a list of works cited, made from the site\'s records. Replace the typed list with it, or keep the typed list as it is.');
  const siteList = secSite.body;
  let bibChoice;   // 'replace', 'keep', or undefined (not decided yet)
  const writes = new Map();   // citation index → the element that says what it becomes
  const error = el('p', { class: 'di-error', role: 'alert' });
  const cancel = el('button', { type: 'button', class: 'di-quiet', text: 'Cancel' });
  const apply = el('button', { type: 'button', class: 'di-primary', text: 'Apply', disabled: true });
  const dialog = el('dialog', { class: 'di-dialog di-import', 'aria-labelledby': 'di-import-h' },
    [el('div', {}, [title, intro, controls, summary, spoken, el('div', { class: 'di-import-body' }, [secAttention.box, secSite.box, secProbable.box, secRefs.box]), error, el('div', { class: 'di-actions' }, [cancel, apply])])]);
  title.id = 'di-import-h';
  root.append(dialog);

  const close = () => { dialog.close(); dialog.remove(); if (opener?.isConnected) opener.focus(); else editor.focus(); };
  cancel.addEventListener('click', close);
  dialog.addEventListener('close', () => dialog.remove());
  styleSelect.addEventListener('change', () => { style = styleSelect.value; analyse(); });
  find.addEventListener('click', analyse);
  apply.addEventListener('click', applyChosen);

  function analyse() {
    error.textContent = ''; for (const sec of [secAttention, secSite, secProbable, secRefs]) { sec.body.textContent = ''; sec.box.hidden = true; }
    find.textContent = 'Find again';
    analysed = editor.getText();
    context = { mode: 'document', source: analysed, style, citationKeyword: citationKeyword(), namespace: 'draft-import',
      limits: { references: 300 }, ...(options.siteCache && { siteCache: options.siteCache }) };
    let a;
    try { a = options.process(context); } catch (e) { error.textContent = 'The importer stopped: ' + e.message; return; }
    if (a.formatChoiceRequired && style === 'auto') {
      summary.textContent = `These citations could be ${a.formatDetection?.label || 'more than one style'}. Choose the style above, then Find citations again.`;
      styleSelect.focus(); apply.disabled = true; return;
    }
    context.result = a;
    matches = a.review.matches;
    // A unique match is proposed (selected, visibly, and changeable); anything else waits for the writer.
    // A choice per work: a record id, null (leave as written), or undefined (not decided yet). What's probably right is
    // proposed; everything in Needs your attention starts undecided, and Convert waits until it's decided.
    chosen = matches.map(m => m.items.map(it => (isProbablyRight(m) ? it.candidates[0].recordId : undefined)));
    // Choices made earlier for the same citation (same words, same place in its sentence) come back.
    matches.forEach((m, i) => {
      const was = memory.get(remember(m));
      if (was && was.length === m.items.length && was.every((c, j) => c === undefined || c === null || c === PLACEHOLDER || m.items[j].candidates?.some(x => x.recordId === c))) chosen[i] = was.slice();
    });
    // A site work is proposed the same way: one candidate with nothing in conflict is selected, visibly, for the
    // writer to confirm by converting. Anything else (a conflict, several candidates) waits for a choice, and
    // Convert waits with it: adding a work the site may already have is as much a guess as merging it.
    // The site's policy (siteWorks) can say to prefer its works even when they're written differently.
    siteChoice = {};
    const policy = options.siteWorks || 'offer';
    for (const s of a.siteMatches || []) {
      if (!s.candidates?.length) continue;
      const only = s.candidates.length === 1 ? s.candidates[0] : null;
      const clear = only && ![].concat(only.evidence || []).some(e => e.assessment?.conflicts?.length);
      siteChoice[s.recordId] = only && (clear || policy !== 'offer') ? only.recordId : undefined;
    }
    bibChoice = memory.get('\u0000refs');
    draw();
  }

  function draw() {
    writes.clear();
    const attention = el('ol', { class: 'di-import-list' }), probable = el('ol', { class: 'di-import-list' });
    secAttention.body.replaceChildren(attention); secProbable.body.replaceChildren(probable);
    const nAttention = matches.filter(m => !isProbablyRight(m)).length;
    secAttention.box.hidden = !nAttention; secAttention.box.open = true;
    secProbable.box.hidden = nAttention === matches.length; secProbable.box.open = !nAttention;
    matches.forEach((m, i) => {
      const { before, after } = citationContext(analysed, m.citation.start, m.citation.end);
      const row = el('li', { class: 'di-import-row' });
      const quote = el('p', { class: 'di-import-context' });
      quote.innerHTML = `${esc(before)}<mark>${esc(m.citation.raw)}</mark>${esc(after)}`;
      row.append(quote);
      const becomes = el('p', { class: 'di-import-writes' });
      writes.set(i, becomes);
      m.items.forEach((it, j) => {
        const names = (it.item.authors || []).join(', ') + (it.item.etAl ? ' et al.' : '') + ' ' + (it.item.year ?? '');
        const set = el('fieldset', { class: 'di-import-item' }, [el('legend', { text: m.items.length > 1 ? `Work ${j + 1}: ${names.trim()}` : names.trim() })]);
        if (!it.candidates?.length) set.append(el('p', { class: 'hint', text: 'Not found in the reference list.' }));
        for (const c of it.candidates || []) {
          const id = `di-imp-${i}-${j}-${c.recordId}`;
          const evidence = Object.values(c.evidence || {}).map(v => EVIDENCE[v] ?? '').filter(Boolean).join(', ');
          const radio = el('input', { type: 'radio', name: `di-imp-${i}-${j}`, id, value: c.recordId, checked: chosen[i][j] === c.recordId });
          radio.addEventListener('change', () => { chosen[i][j] = c.recordId; tally(); });
          set.append(el('div', { class: 'di-import-choice' }, [radio, el('label', { for: id }, [el('span', { text: c.title }), evidence ? el('small', { text: ' · ' + evidence }) : null])]));
        }
        if (!it.candidates?.length || it.state === 'unmatched') {
          const id = `di-imp-${i}-${j}-pending`;
          const radio = el('input', { type: 'radio', name: `di-imp-${i}-${j}`, id, value: 'pending', checked: chosen[i][j] === PLACEHOLDER });
          radio.addEventListener('change', () => { chosen[i][j] = PLACEHOLDER; tally(); });
          set.append(el('div', { class: 'di-import-choice' }, [radio, el('label', { for: id }, [el('span', { text: 'Keep as unresolved (recommended)' }),
            el('small', { text: ' · a marked citation that keeps this wording; the site flags it until the work is found' })])]));
        }
        {
          const id = `di-imp-${i}-${j}-leave`;
          const radio = el('input', { type: 'radio', name: `di-imp-${i}-${j}`, id, value: '', checked: chosen[i][j] === null });
          radio.addEventListener('change', () => { chosen[i][j] = null; tally(); });
          set.append(el('div', { class: 'di-import-choice' }, [radio, el('label', { for: id, text: it.candidates?.length ? 'Leave as written' : 'Leave as typed text (the banner will keep reminding you)' })]));
        }
        row.append(set);
      });
      row.append(becomes);
      (isProbablyRight(m) ? probable : attention).append(row);
    });
    drawSite();
    drawRefs();
    tally();
    title.focus();
  }

  function drawSite() {
    siteList.textContent = '';
    const proposals = (context.result.siteMatches || []).filter(s => s.candidates?.length);
    secSite.box.hidden = !proposals.length; secSite.box.open = true;
    for (const s of proposals) {
      const ref = context.result.referenceRecords.find(r => r.id === s.recordId);
      const uses = matches.filter(m => m.items.some(it => it.candidates?.some(c => c.recordId === s.recordId))).length;
      const set = el('fieldset', { class: 'di-import-item' }, [el('legend', { text: `${ref ? fallbackNote(ref) : s.recordId}: ${ref?.title || ''}${uses ? ` (cited ${uses === 1 ? 'once' : uses + ' times'})` : ''}` })]);
      for (const c of s.candidates) {
        const siteRec = options.siteCache?.records?.find(r => r.id === c.recordId);
        const id = `di-site-${s.recordId}-${c.recordId}`, why = siteEvidence(c, ref, siteRec);
        const radio = el('input', { type: 'radio', name: `di-site-${s.recordId}`, id, checked: siteChoice[s.recordId] === c.recordId });
        radio.addEventListener('change', () => { siteChoice[s.recordId] = c.recordId; tally(); });
        set.append(el('div', { class: 'di-import-choice' }, [radio, el('label', { for: id, title: c.recordId }, [
          el('span', { text: `Use the site's “${c.title || 'untitled work'}”` }), why ? el('small', { text: ' · ' + why }) : null])]));
      }
      if (options.siteWorks === 'require') {
        set.append(el('p', { class: 'hint', text: 'This site uses its own works where it has them.' }));
      } else {
        const nid = `di-site-${s.recordId}-new`;
        const fresh = el('input', { type: 'radio', name: `di-site-${s.recordId}`, id: nid, checked: siteChoice[s.recordId] === null });
        fresh.addEventListener('change', () => { siteChoice[s.recordId] = null; tally(); });
        set.append(el('div', { class: 'di-import-choice' }, [fresh, el('label', { for: nid }, [el('span', { text: 'Add it as a new work' }),
          el('small', { text: ' · the site would then have two copies of this work' })])]));
      }
      siteList.append(set);
    }
  }

  // The reference list: its own decision, with each entry shown, and the ones no converted citation uses flagged.
  function drawRefs() {
    const bib = context.result.document?.bibliography;
    secRefs.box.hidden = !bib; secRefs.box.open = true;
    if (!bib) return;
    const list = el('ul', { class: 'di-import-refs-list' });
    for (const rec of context.result.referenceRecords) list.append(el('li', { 'data-id': rec.id }, [el('span', { text: `${fallbackNote(rec)}. ${rec.title || ''}` })]));
    const choice = (value, text) => {
      const id = `di-refs-${value}`;
      const radio = el('input', { type: 'radio', name: 'di-refs', id, checked: bibChoice === value });
      radio.addEventListener('change', () => { bibChoice = value; memory.set('\u0000refs', value); tally(); });
      return el('div', { class: 'di-import-choice' }, [radio, el('label', { for: id, text })]);
    };
    secRefs.body.replaceChildren(list, el('fieldset', { class: 'di-import-item' }, [el('legend', { text: 'What to do with the typed list' }),
      choice('replace', 'Replace it with the list of works cited, made from the site\'s records'),
      choice('keep', 'Keep it as typed (readers will also see the generated list of works cited)')]));
  }
  function markUnused() {
    const r = ready(), used = new Set(matches.flatMap((m, i) => (r[i] ? chosen[i].filter(c => c !== PLACEHOLDER) : [])));
    for (const li of secRefs.body.querySelectorAll('li[data-id]')) {
      const off = !used.has(li.dataset.id);
      li.classList.toggle('di-import-unused', off);
      let note = li.querySelector('.di-import-unused-note');
      if (off && !note) li.append(note = el('small', { class: 'di-import-unused-note', text: ' · not cited by a converted citation: replacing the list removes it' }));
      if (!off && note) note.remove();
    }
  }
  // What each citation becomes, from cite.inator's own preview of the current choices: the exact marker, so new works'
  // ids and the site's own works are visible before converting.
  function showWrites() {
    const r = ready();
    const decisions = matches.map((m, i) => r[i] && decisionFor(i, chosen[i])).filter(Boolean);
    let edits = [];
    if (decisions.length) {
      try {
        const recordDecisions = Object.entries(siteChoice).filter(([, v]) => v).map(([recordId, siteRecordId]) => ({ recordId, siteRecordId }));
        edits = options.process({ ...context, result: undefined, action: 'preview', review: context.result.review, reviewId: context.result.review.reviewId,
          decisions, ...(options.siteCache && { recordDecisions }), recordId: options.recordId || siteStyleId }).edits || [];
      } catch { edits = []; }
    }
    writes.forEach((node, i) => {
      const edit = edits.find(e => e.citationIndex === i);
      const partial = chosen[i].some(c => typeof c === 'string') && chosen[i].some(c => c === null);
      const said = edit ? null : partial ? 'Stays as written: a citation is converted whole, so leaving one of its works leaves all of them.'
        : decided(i) ? 'Stays as written.' : 'Choose above.';
      node.replaceChildren(...(edit ? [el('span', { text: 'Becomes a citation of ' + words(chosen[i].map(workName)) + '. ' }),
        el('details', { class: 'di-import-code' }, [el('summary', { text: 'Show code' }), el('code', { text: edit.text })])] : [document.createTextNode(said)]));
      node.classList.toggle('di-import-writes-none', !edit);
    });
  }

  // A work as a writer knows it: authors and year, and whether it's new or the site's own.
  function workName(recordId) {
    if (recordId === PLACEHOLDER) return 'an unresolved placeholder, flagged for later';
    const site = siteChoice[recordId] && options.siteCache?.records?.find(r => r.id === siteChoice[recordId]);
    const ref = context.result.referenceRecords.find(r => r.id === recordId);
    const name = fallbackNote(site || ref || {});
    // Two works by the same people in the same year (Cox 1995a and 1995b) are told apart by title.
    const twin = ref && context.result.referenceRecords.some(r => r !== ref && fallbackNote(r) === fallbackNote(ref));
    return `${name}${twin && (site || ref).title ? `, “${(site || ref).title}”` : ''} (${site ? "the site's" : 'new'})`;
  }
  const ready = () => matches.map((m, i) => m.items.length && chosen[i].every(c => typeof c === 'string'));
  const decided = i => chosen[i].every(c => c !== undefined);
  function tally() {
    markUnused(); showWrites();
    const r = ready(), n = r.filter(Boolean).length, refs = context.result.referenceRecords.length;
    const attentionLeft = matches.filter((m, i) => !isProbablyRight(m) && !decided(i)).length;
    // References the converted citations use whose site match hasn't been decided.
    const usedNow = new Set(matches.flatMap((m, i) => (r[i] ? chosen[i] : [])));
    const siteLeft = Object.entries(siteChoice).filter(([id, v]) => v === undefined && usedNow.has(id)).length;
    const siteTotal = Object.keys(siteChoice).length;
    const changed = matches.filter((m, i) => isProbablyRight(m) && chosen[i].some((c, j) => c !== m.items[j].candidates[0].recordId)).length;
    const nProbable = matches.filter(isProbablyRight).length;
    const left = k => (k ? `${k} to decide` : 'all decided ✓');
    secAttention.count.textContent = left(attentionLeft);
    secSite.count.textContent = `${siteTotal} work${siteTotal === 1 ? '' : 's'} · ${left(siteLeft)}`;
    secProbable.count.textContent = `${nProbable} citation${nProbable === 1 ? '' : 's'}${changed ? ` · ${changed} changed` : ' · all selected ✓'}`;
    matches.forEach((m, i) => memory.set(remember(m), chosen[i].slice()));
    for (const [sec, k] of [[secAttention, attentionLeft], [secSite, siteLeft]]) sec.box.classList.toggle('di-import-todo', k > 0);
    const refsLeft = !secRefs.box.hidden && bibChoice === undefined ? 1 : 0;
    secRefs.count.textContent = refsLeft ? '1 to decide' : bibChoice === 'replace' ? 'replace ✓' : bibChoice === 'keep' ? 'keep ✓' : '';
    secRefs.box.classList.toggle('di-import-todo', refsLeft > 0);
    const todo = attentionLeft + siteLeft + refsLeft;
    summary.textContent = !matches.length
      ? `No citations found${refs ? `, though ${refs} reference${refs === 1 ? ' was' : 's were'} read` : ''}. Is the style right?`
      : `${matches.length} citation${matches.length === 1 ? '' : 's'} found, ${refs} reference${refs === 1 ? '' : 's'} read. ` +
        (todo ? `Decide ${todo} more before converting: ${[attentionLeft && `${attentionLeft} in Needs your attention`, siteLeft && `${siteLeft} in Works this site already has`, refsLeft && 'the reference list'].filter(Boolean).join(', ')}.`
          : `${n} will be converted; ${matches.length - n} will stay as written.`);
    const say = todo ? `${todo} left to decide.` : 'All decided.';
    if (spoken.textContent !== say) spoken.textContent = say;
    apply.disabled = !n || todo > 0;
    apply.textContent = todo ? `Decide ${todo} more` : n ? `Convert ${n} citation${n === 1 ? '' : 's'}` : 'Apply';
  }

  function applyChosen() {
    error.textContent = '';
    if (editor.getText() !== analysed) { error.textContent = 'The article changed while this was open. Find citations again.'; return; }
    const r = ready();
    const decisions = matches.map((m, i) => r[i] && decisionFor(i, chosen[i])).filter(Boolean);
    let p;
    const recordDecisions = Object.entries(siteChoice).filter(([, site]) => site).map(([recordId, siteRecordId]) => ({ recordId, siteRecordId }));
    try {
      p = options.process({ ...context, result: undefined, action: 'preview', review: context.result.review, reviewId: context.result.review.reviewId,
        decisions, ...(options.siteCache && { recordDecisions }), recordId: options.recordId || siteStyleId });
    }
    catch (e) { error.textContent = 'The importer stopped: ' + e.message; return; }
    if (!p.edits?.length) { error.textContent = 'Nothing could be converted.'; return; }
    // Close first: the text behind an open dialog can't take focus, and without focus the edit would bypass the
    // browser's undo history. Then one undoable step: replace the smallest stretch covering every accepted edit.
    close();
    const bib = bibChoice === 'replace' ? context.result.document.bibliography : null;
    const plan = planReplacement(analysed, p, bib);
    // One undoable step. The caret goes to the start of the change, with nothing selected: a selection would be
    // replaced by the writer's next keystroke.
    editor.replace(plan.start, plan.end, plan.text, [0, 0]);
    // New works the converted citations point to join the works list, with notes, and go to the site to keep.
    // The site's own works, reused, are already there.
    const records = worksToKeep(p, decisions);
    editor.addWorks(records.map(rec => ({ id: rec.id, note: options.describe?.(rec.id, p.cache) || fallbackNote(rec), title: rec.title || '' })), records);
    options.onRecords?.(records, p.cache);
    const left = matches.length - decisions.length, reused = (p.reusedRecordIds || []).length;
    editor.leftAsTyped?.(left);
    const placeholders = new Set([...(p.placeholderRecordIds || []), ...(p.outcomes || []).flatMap(o => o.placeholderRecordIds || [])]);
    const pending = records.filter(rec => placeholders.has(rec.id)).length, works = records.length - pending;
    editor.recheck?.();
    const msg = `Converted ${decisions.length} citation${decisions.length === 1 ? '' : 's'}${left ? `; ${left} left as typed` : ''}` +
      `${works ? `; ${works} new work${works === 1 ? '' : 's'} will be saved with the page` : ''}${pending ? `; ${pending} unresolved placeholder${pending === 1 ? '' : 's'} flagged for later` : ''}${reused ? `; ${reused} of the site's own works used` : ''}.`;
    editor.report?.(msg);
    editor.announce(`Converted ${decisions.length} citation${decisions.length === 1 ? '' : 's'}${left ? `; ${left} left as written` : ''}` +
      `${records.length ? `; ${records.length} new work${records.length === 1 ? '' : 's'}` : ''}${reused ? `; ${reused} of the site's own` : ''}. Undo reverses the text.`);
  }

  dialog.showModal();
  // The editor already knows there are citations to import: look at once, rather than wait for a click.
  analyse();
  title.focus();
}
