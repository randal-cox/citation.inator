/* draft.inator: the Cite block. In the text editor, a "Citation" button opens a form:
   one or more works, each with an optional page, prefix, form, and reference topics. It writes a citation.inator
   marker, {citation id | note:"Bell 1992" | locator:12 | tags:ritual-theory; other-id}, with each note taken from
   citation.inator's description of the work (window.DRAFT_WORKS, written by the host site's build; see docs/data-contract.md). Existing markers open in the same form;
   any option the form doesn't show (a label, fallback words) is kept as it was. */
(function () {
  if (!window.CMS) return;
  var TOPICS = window.DRAFT_TOPICS || [];
  // The works a writer can cite, indexed. addWorks() (below) adds to them in place, so works an import brings in
  // appear in the form and get their notes at once.
  var NOTE = {}, WORK_OPTIONS = [];
  function index() {
    NOTE = {}; WORK_OPTIONS.length = 0;
    (window.DRAFT_WORKS || []).forEach(function (w) { NOTE[w.id] = w.note; WORK_OPTIONS.push({ label: w.note + ' · ' + w.title, value: w.id }); });
  }
  index();
  var FORMS = ['parenthetical', 'narrative', 'author-only', 'suppress-author', 'suppress-year'];
  var SHOWN = ['note', 'locator', 'prefix', 'form', 'tags'];

  // Split on a separator outside quotes, honouring backslash escapes (citation.inator's notation).
  function split(s, sep) {
    var out = [], cur = '', q = false;
    for (var i = 0; i < s.length; i++) {
      var c = s[i];
      if (c === '\\' && i + 1 < s.length) { cur += c + s[++i]; continue; }
      if (c === '"') q = !q;
      if (c === sep && !q) { out.push(cur); cur = ''; continue; }
      cur += c;
    }
    out.push(cur);
    return out.map(function (x) { return x.trim(); });
  }
  function unquote(v) {
    v = v.trim();
    if (v.length > 1 && v[0] === '"' && v[v.length - 1] === '"') v = v.slice(1, -1);
    return v.replace(/\\(.)/g, '$1');
  }
  function quote(v) {
    v = String(v);
    return /[;|"{}\\:]|^\s|\s$/.test(v) ? '"' + v.replace(/(["\\])/g, '\\$1') + '"' : v;
  }

  function quoteAlways(v) { return '"' + String(v).replace(/(["\\])/g, '\\$1') + '"'; }

  // A work's id is written bare (bell-1992-ritual) or explicitly local (local:bell-1992-ritual); citation.inator reads
  // both as the same record. The block works with the bare id and remembers how it was written, so an unchanged work
  // goes back exactly as it was. A newly chosen work is written bare, unless the bare id would read as a directive.
  var DIRECTIVES = ['endnote', 'list', 'nocite', 'evidence', 'credit'];
  function bareId(written) { return /^local:/.test(written) ? written.slice(6) : written; }
  function writeId(it) {
    if (it.written && bareId(it.written) === it.work) return it.written;
    return DIRECTIVES.indexOf(it.work) >= 0 ? 'local:' + it.work : it.work;
  }

  function parse(body) {
    return split(body, ';').filter(Boolean).map(function (part) {
      var bits = split(part, '|'), item = { work: bareId(bits[0]), written: bits[0], locator: '', prefix: '', form: '', tags: [], extra: [], order: [] };
      bits.slice(1).forEach(function (b) {
        var m = /^([a-z-]+):([\s\S]*)$/.exec(b);
        if (m && SHOWN.indexOf(m[1]) >= 0) {
          if (m[1] === 'tags') item.tags = unquote(m[2]).split(',').map(function (t) { return t.trim(); }).filter(Boolean);
          else if (m[1] !== 'note') item[m[1]] = unquote(m[2]);
          item.order.push(m[1] + (/^\s*"/.test(m[2]) ? '"' : ''));   // '"': it was written quoted, so keep it so
        } else if (b) { item.extra.push(b); item.order.push('extra'); }   // one 'extra' per unknown option, in place
      });
      item.extra = item.extra.join(' | ');
      item.order = item.order.join(',');             // the marker's own option order, kept when it's written back
      return item;
    });
  }

  function build(items) {
    return '{citation ' + (items || []).filter(function (it) { return it && it.work; }).map(function (it) {
      var was = (it.order || '').split(',').filter(Boolean);
      function q(k, v) { return was.indexOf(k + '"') >= 0 ? quoteAlways(v) : quote(v); }
      var tags = it.tags || [], parts = {
        note: 'note:' + quoteAlways(NOTE[it.work] || it.work),
        locator: it.locator ? 'locator:' + (/\s/.test(it.locator) ? quoteAlways(it.locator) : q('locator', it.locator)) : '',
        prefix: it.prefix ? 'prefix:' + q('prefix', it.prefix) : '',
        form: it.form ? 'form:' + it.form : '',
        tags: tags.length ? 'tags:' + tags.join(',') : ''
      };
      // Unknown options go back where each one was. If the writer changed "Other options" so they no longer match
      // one for one, they all go where the first one was.
      var extras = it.extra ? split(it.extra, '|').filter(Boolean) : [];
      var slots = was.filter(function (k) { return k === 'extra'; }).length, next = 0;
      var out = [], seen = {};
      was.forEach(function (k) {
        k = k.replace('"', '');
        if (k === 'extra') {
          if (extras.length === slots) out.push(extras[next++]);
          else if (next === 0 && extras.length) { out.push(extras.join(' | ')); next = -1; }
        } else if (k in parts && !seen[k]) { seen[k] = true; if (parts[k]) out.push({ key: k, text: parts[k] }); }
      });
      ['note', 'locator', 'prefix', 'form', 'tags'].forEach(function (k) {
        if (!seen[k] && parts[k]) out.push({ key: k, text: parts[k] });
      });
      if (!slots && extras.length) out.push(extras.join(' | '));
      // A note the marker didn't have goes first.
      if (was.indexOf('note') < 0 && was.indexOf('note"') < 0) {
        var at = out.findIndex ? out.findIndex(function (o) { return o && o.key === 'note'; }) : -1;
        if (at > 0) out.unshift(out.splice(at, 1)[0]);
      }
      return [writeId(it)].concat(out.map(function (o) { return typeof o === 'string' ? o : o.text; })).join(' | ');
    }).join('; ') + '}';
  }

  function addWorks(list) {
    if (!window.DRAFT_WORKS) window.DRAFT_WORKS = [];
    (list || []).forEach(function (w) { if (w && w.id && !(w.id in NOTE)) { window.DRAFT_WORKS.push(w); NOTE[w.id] = w.note; } });
    index();
  }

  window.DRAFT_CITATION = { parse: parse, build: build, addWorks: addWorks, writeId: writeId };

  CMS.registerEditorComponent({
    id: 'citation',
    label: 'Citation',
    icon: 'format_quote',
    fields: [{
      name: 'items', label: 'Works cited here', label_singular: 'Work', widget: 'list',
      fields: [
        { name: 'work', label: 'Work (search by author, year, or title)', widget: 'select',
          options: WORK_OPTIONS },
        { name: 'locator', label: 'Page or section (such as 12, or "pp. 4–6")', widget: 'string', required: false },
        { name: 'prefix', label: 'Words before it (such as "see also")', widget: 'string', required: false },
        { name: 'form', label: 'How it reads', widget: 'select', required: false,
          options: [{ label: '(Bell 1992): the usual', value: '' }].concat(FORMS.slice(1).map(function (f) { return { label: f.replace('-', ' '), value: f }; })) },
        { name: 'tags', label: 'Topics this citation is about', widget: 'select', multiple: true, required: false,
          options: TOPICS.map(function (t) { return { label: t.label, value: t.id }; }) },
        { name: 'extra', label: 'Other options (kept as written)', widget: 'string', required: false },
        { name: 'order', label: 'Option order', widget: 'hidden', required: false },
        { name: 'written', label: 'The work as written', widget: 'hidden', required: false }
      ]
    }],
    // Directives are not citations of a work; leave them alone. Matches citation.inator 0.2.0's own test exactly
    // ({citation endnote}, {citation endnote | …}, {citation list …}, {citation nocite …}, {citation evidence},
    // {citation credit}), so a work whose id merely starts with one of those words (list-2001) still opens.
    pattern: /\{citation (?!\s*(?:endnote\s*[|}]|(?:list|nocite)[ \t]|(?:evidence|credit)\s*\}))((?:[^{}\\]|\\.)*)\}/,
    fromBlock: function (match) { return { items: parse(match[1]) }; },
    toBlock: function (data) { return build(data.items); },
    toPreview: function (data) {
      return '(' + (data.items || []).map(function (it) {
        return (it.prefix ? it.prefix + ' ' : '') + (NOTE[it.work] || it.work) + (it.locator ? ', ' + it.locator : '');
      }).join('; ') + ')';
    }
  });
})();
