/* draft.inator: import citations. Finds author–date citations (APA, Chicago, …) and the reference list in the article
   being edited, using citation.inator's importer, lets the writer review every match, and turns the accepted ones into
   {citation …} markers in one undoable step. citation.inator does the finding and matching; this file is the review
   and the editing. Nothing is applied that the writer hasn't seen: unique matches are proposed (and can be changed),
   others need a choice, and anything left alone stays exactly as written. */

const esc = v => String(v ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const STYLES = [
  { id: 'auto', label: 'Work it out' }, { id: 'apa', label: 'APA' },
  { id: 'chicago-author-date', label: 'Chicago author-date' }, { id: 'vancouver', label: 'Vancouver (numbered)' }
];
const EVIDENCE = { 'exact-normalized': 'authors match', issued: 'year matches', 'not-specified': '' };

// A short note for a new work, as citation.inator would give it, when the site gives no describe().
function fallbackNote(r) {
  const names = (r.authors || []).map(a => a.family || a.literal).filter(Boolean);
  const who = names.length > 2 ? names[0] + ' et al.' : names.join(' and ') || r.title || r.id;
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
  const cited = new Set(decisions.flatMap(d => d.targets.map(t => preview.recordMap?.[t.recordId] ?? t.recordId)));
  const fresh = new Set(preview.newRecordIds ?? [...cited]);
  return (preview.cache?.records || []).filter(rec => cited.has(rec.id) && fresh.has(rec.id));
}

// What a proposed site work has in common with the imported reference, and how it's written differently, in words.
function siteEvidence(candidate) {
  const same = [], other = new Set();
  for (const e of [].concat(candidate.evidence || [])) {   // one evidence object (0.4.0), or a list
    const c = e.assessment?.comparisons || {};
    if (e.sharedIdentifierCount) same.push(`${e.sharedIdentifierCount} shared identifier${e.sharedIdentifierCount === 1 ? '' : 's'}`);
    if (e.mainTitleMatch || c.title) same.push(e.mainTitleMatch && !c.title ? 'main title' : 'title');
    if (c.authors) same.push('authors');
    if (c.year) same.push('year');
    for (const d of e.differences || []) other.add(typeof d === 'string' ? d : d.field || d.code);
  }
  const list = a => (a.length > 2 ? a.slice(0, -1).join(', ') + ', and ' + a[a.length - 1] : a.join(' and '));
  return [same.length && `${list([...new Set(same)])} match`, other.size && `written differently: ${[...other].join(', ')}`].filter(Boolean).join('; ');
}

/**
 * The one edit that applies an import: the smallest stretch of the original text covering every accepted edit (and,
 * if asked, the reference list, replaced by {citation endnote}), and what replaces it. Pure, so it can be tested.
 * @param {string} analysed  The text the import was analysed from.
 * @param {{ source: string, edits: Array<{start, end}> }} preview  citation.inator's preview result.
 * @param {{ start: number, end: number } | null} [bibliography]  The reference list to replace, if any.
 * @returns {{ start: number, end: number, text: string }}
 */
export function planReplacement(analysed, preview, bibliography = null) {
  const start = Math.min(...preview.edits.map(e => e.start));
  if (bibliography) {
    const shift = preview.source.length - analysed.length;
    return { start, end: bibliography.end,
      text: preview.source.slice(start, bibliography.start + shift) + '{citation endnote}\n' + analysed.slice(bibliography.end).replace(/^\n+/, '\n') };
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
 */
export function openImport(editor, options) {
  const { el, root } = editor;
  let style = options.style || 'auto', analysed = null, context = null, matches = [], chosen = [], siteChoice = {};

  const title = el('h2', { text: 'Import citations' });
  const intro = el('p', { class: 'hint', text: 'Finds citations such as (Bell, 1992) and the reference list in this article, and turns the ones you accept into citations of works. Anything you leave stays as written.' });
  const styleSelect = el('select', { id: 'di-import-style' }, STYLES.map(s => el('option', { value: s.id, text: s.label, selected: s.id === style })));
  const find = el('button', { type: 'button', class: 'di-primary', text: 'Find citations' });
  const controls = el('div', { class: 'di-import-controls' }, [el('label', { for: 'di-import-style', text: 'Citation style' }), styleSelect, find]);
  const summary = el('p', { class: 'di-import-summary', role: 'status', 'aria-live': 'polite' });
  const list = el('ol', { class: 'di-import-list' });
  const siteHead = el('h3', { text: 'Works this site already has', hidden: true });
  const siteIntro = el('p', { class: 'hint', hidden: true, text: 'These references look like works already on the site. Use the site\'s work, or add the reference as a new one.' });
  const siteList = el('div', { class: 'di-import-site' });
  const replaceBox = el('input', { type: 'checkbox', id: 'di-import-replace' });
  const replaceLabel = el('label', { for: 'di-import-replace' });
  const replaceRow = el('div', { class: 'check di-import-replace', hidden: true }, [replaceBox, replaceLabel]);
  const error = el('p', { class: 'di-error', role: 'alert' });
  const cancel = el('button', { type: 'button', class: 'di-quiet', text: 'Cancel' });
  const apply = el('button', { type: 'button', class: 'di-primary', text: 'Apply', disabled: true });
  const dialog = el('dialog', { class: 'di-dialog di-import', 'aria-labelledby': 'di-import-h' },
    [el('div', {}, [title, intro, controls, summary, list, siteHead, siteIntro, siteList, replaceRow, error, el('div', { class: 'di-actions' }, [cancel, apply])])]);
  title.id = 'di-import-h';
  root.append(dialog);

  const close = () => { dialog.close(); dialog.remove(); editor.focus(); };
  cancel.addEventListener('click', close);
  dialog.addEventListener('close', () => dialog.remove());
  styleSelect.addEventListener('change', () => { style = styleSelect.value; });
  find.addEventListener('click', analyse);
  apply.addEventListener('click', applyChosen);

  function analyse() {
    error.textContent = ''; list.textContent = '';
    analysed = editor.getText();
    context = { mode: 'document', source: analysed, style, citationKeyword: 'citation', namespace: 'draft-import',
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
    chosen = matches.map(m => m.items.map(it => (it.state === 'unique' && it.candidates?.length === 1 ? it.candidates[0].recordId : null)));
    // A site work is proposed the same way: one candidate with nothing in conflict is selected, visibly, for the
    // writer to confirm by converting. Anything else (a conflict, several candidates) waits for a choice, and
    // Convert waits with it: adding a work the site may already have is as much a guess as merging it.
    siteChoice = {};
    for (const s of a.siteMatches || []) {
      if (!s.candidates?.length) continue;
      const only = s.candidates.length === 1 ? s.candidates[0] : null;
      siteChoice[s.recordId] = only && ![].concat(only.evidence || []).some(e => e.assessment?.conflicts?.length) ? only.recordId : undefined;
    }
    draw();
  }

  function draw() {
    list.textContent = '';
    matches.forEach((m, i) => {
      const at = m.citation.start, text = analysed;
      const before = text.slice(Math.max(0, at - 50), at).replace(/^\S*\s/, '…'), after = text.slice(m.citation.end, m.citation.end + 40).replace(/\s\S*$/, '…');
      const row = el('li', { class: 'di-import-row' });
      const quote = el('p', { class: 'di-import-context' });
      quote.innerHTML = `${esc(before)}<mark>${esc(m.citation.raw)}</mark>${esc(after)}`;
      row.append(quote);
      m.items.forEach((it, j) => {
        const names = (it.item.authors || []).join(', ') + (it.item.etAl ? ' et al.' : '') + ' ' + (it.item.year ?? '');
        const set = el('fieldset', { class: 'di-import-item' }, [el('legend', { text: m.items.length > 1 ? `Work ${j + 1}: ${names.trim()}` : names.trim() })]);
        if (!it.candidates?.length) set.append(el('p', { class: 'hint', text: 'Not found in the reference list. It stays as written.' }));
        for (const c of it.candidates || []) {
          const id = `di-imp-${i}-${j}-${c.recordId}`;
          const evidence = Object.values(c.evidence || {}).map(v => EVIDENCE[v] ?? v).filter(Boolean).join(', ');
          const radio = el('input', { type: 'radio', name: `di-imp-${i}-${j}`, id, value: c.recordId, checked: chosen[i][j] === c.recordId });
          radio.addEventListener('change', () => { chosen[i][j] = c.recordId; tally(); });
          set.append(el('div', { class: 'di-import-choice' }, [radio, el('label', { for: id }, [el('span', { text: c.title }), evidence ? el('small', { text: ' · ' + evidence }) : null])]));
        }
        if (it.candidates?.length) {
          const id = `di-imp-${i}-${j}-leave`;
          const radio = el('input', { type: 'radio', name: `di-imp-${i}-${j}`, id, value: '', checked: !chosen[i][j] });
          radio.addEventListener('change', () => { chosen[i][j] = null; tally(); });
          set.append(el('div', { class: 'di-import-choice' }, [radio, el('label', { for: id, text: 'Leave as written' })]));
        }
        row.append(set);
      });
      list.append(row);
    });
    drawSite();
    tally();
    const first = list.querySelector('input'); if (first) first.focus();
  }

  function drawSite() {
    siteList.textContent = '';
    const proposals = (context.result.siteMatches || []).filter(s => s.candidates?.length);
    siteHead.hidden = siteIntro.hidden = !proposals.length;
    for (const s of proposals) {
      const ref = context.result.referenceRecords.find(r => r.id === s.recordId);
      const set = el('fieldset', { class: 'di-import-item' }, [el('legend', { text: `${ref ? fallbackNote(ref) : s.recordId}: ${ref?.title || ''}` })]);
      for (const c of s.candidates) {
        const id = `di-site-${s.recordId}-${c.recordId}`, why = siteEvidence(c);
        const radio = el('input', { type: 'radio', name: `di-site-${s.recordId}`, id, checked: siteChoice[s.recordId] === c.recordId });
        radio.addEventListener('change', () => { siteChoice[s.recordId] = c.recordId; tally(); });
        set.append(el('div', { class: 'di-import-choice' }, [radio, el('label', { for: id }, [
          el('span', { text: `Use the site's “${c.title || c.recordId}”` }), el('small', { text: ` · ${c.recordId}${why ? ' · ' + why : ''}` })])]));
      }
      const nid = `di-site-${s.recordId}-new`;
      const fresh = el('input', { type: 'radio', name: `di-site-${s.recordId}`, id: nid, checked: siteChoice[s.recordId] === null });
      fresh.addEventListener('change', () => { siteChoice[s.recordId] = null; tally(); });
      set.append(el('div', { class: 'di-import-choice' }, [fresh, el('label', { for: nid, text: 'Add it as a new work' })]));
      siteList.append(set);
    }
  }

  const ready = () => matches.map((m, i) => m.items.length && chosen[i].every(Boolean));
  // The typed reference list can be replaced by {citation endnote}, which lists the cited works. Typed text is only
  // removed when the writer says so: ticked when every reference is used by a converted citation, else unticked
  // with the ones that would go named.
  function offerReplace() {
    const bib = context.result.document?.bibliography;
    replaceRow.hidden = !bib;
    if (!bib) return;
    const r = ready(), used = new Set(matches.flatMap((m, i) => (r[i] ? chosen[i] : [])));
    const unused = context.result.referenceRecords.filter(rec => !used.has(rec.id));
    replaceLabel.textContent = unused.length
      ? `Replace the reference list with the list of works cited. ${unused.length} reference${unused.length === 1 ? ' isn\'t' : 's aren\'t'} cited by a converted citation and would be removed: ${unused.map(rec => fallbackNote(rec)).join('; ')}.`
      : 'Replace the reference list with the list of works cited (every reference is used).';
    if (!replaceBox.dataset.touched) replaceBox.checked = !unused.length && used.size > 0;
  }
  replaceBox.addEventListener('change', () => { replaceBox.dataset.touched = '1'; });
  function tally() {
    offerReplace();
    const r = ready(), n = r.filter(Boolean).length, refs = context.result.referenceRecords.length;
    summary.textContent = matches.length
      ? `${matches.length} citation${matches.length === 1 ? '' : 's'} found, ${refs} reference${refs === 1 ? '' : 's'} read. ${n} will be converted; ${matches.length - n} will stay as written.`
      : `No citations found${refs ? `, though ${refs} reference${refs === 1 ? ' was' : 's were'} read` : ''}. Is the style right?`;
    // References the converted citations use whose site match hasn't been decided.
    const usedNow = new Set(matches.flatMap((m, i) => (r[i] ? chosen[i] : [])));
    const undecided = Object.entries(siteChoice).filter(([id, v]) => v === undefined && usedNow.has(id)).length;
    if (undecided) summary.textContent += ` Choose for ${undecided} work${undecided === 1 ? '' : 's'} this site may already have (below).`;
    apply.disabled = !n || undecided > 0;
    apply.textContent = n ? `Convert ${n} citation${n === 1 ? '' : 's'}` : 'Apply';
  }

  function applyChosen() {
    error.textContent = '';
    if (editor.getText() !== analysed) { error.textContent = 'The article changed while this was open. Find citations again.'; return; }
    const r = ready();
    const decisions = matches.map((m, i) => r[i] && { citationIndex: i, action: 'accept', targets: chosen[i].map(recordId => ({ recordId })) }).filter(Boolean);
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
    const bib = !replaceRow.hidden && replaceBox.checked ? context.result.document.bibliography : null;
    const plan = planReplacement(analysed, p, bib);
    editor.replace(plan.start, plan.end, plan.text);
    // New works the converted citations point to join the works list, with notes, and go to the site to keep.
    // The site's own works, reused, are already there.
    const records = worksToKeep(p, decisions);
    editor.addWorks(records.map(rec => ({ id: rec.id, note: options.describe?.(rec.id, p.cache) || fallbackNote(rec), title: rec.title || '' })), records);
    options.onRecords?.(records, p.cache);
    const left = matches.length - decisions.length, reused = (p.reusedRecordIds || []).length;
    editor.announce(`Converted ${decisions.length} citation${decisions.length === 1 ? '' : 's'}${left ? `; ${left} left as written` : ''}` +
      `${records.length ? `; ${records.length} new work${records.length === 1 ? '' : 's'}` : ''}${reused ? `; ${reused} of the site's own` : ''}. Undo reverses the text.`);
  }

  dialog.showModal();
  styleSelect.focus();
}
