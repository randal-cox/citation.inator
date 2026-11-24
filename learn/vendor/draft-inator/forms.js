/* draft.inator: forms for blocks outside Sveltia. A block describes its form as Sveltia fields (list, select, select
   with multiple, string, boolean, image, hidden); this draws that form in a plain page, so the same block code runs
   in draft.inator's own editor (src/editor/editor.js) and in the demos. Load it before the blocks: where Sveltia isn't
   on the page, it collects the blocks they register. Plain browser JavaScript, no dependencies. */
(function () {
  var components = {};
  if (!window.CMS) window.CMS = { registerEditorComponent: function (c) { components[c.id] = c; } };

  function el(tag, attrs, kids) {
    var n = document.createElement(tag);
    Object.keys(attrs || {}).forEach(function (k) {
      if (k === 'text') n.textContent = attrs[k];
      else if (attrs[k] !== false && attrs[k] != null) n.setAttribute(k, attrs[k] === true ? '' : attrs[k]);
    });
    (kids || []).forEach(function (kid) { if (kid) n.appendChild(kid); });
    return n;
  }
  var uid = 0;

  // One field of one list item. Calls change() whenever its value changes.
  function field(spec, value, change) {
    var id = 'f' + (++uid);
    if (spec.widget === 'hidden') return null;
    var label = el('label', { for: id, text: spec.label + (spec.required === false ? '' : ' (required)') });
    if (spec.widget === 'boolean') {
      var box = el('input', { type: 'checkbox', id: id, checked: !!value });
      box.addEventListener('change', function () { change(box.checked); });
      return el('div', { class: 'check' }, [box, el('label', { for: id, text: spec.label })]);
    }
    if (spec.widget === 'image') {
      // Choose one of the page's images, or upload one; an upload stays in this browser (an object URL), like an
      // unpublished upload in Sveltia, and is written with the site's public path.
      var assets = window.DraftForms.assets, sources = window.DraftForms.imageSources || [];
      var wrap = el('div', { class: 'image-field' }, [el('label', { for: id, text: spec.label + (spec.required === false ? '' : ' (required)') })]);
      var pick = el('select', { id: id });
      pick.appendChild(el('option', { value: '', text: 'Choose an image…' }));
      sources.forEach(function (s) { pick.appendChild(el('option', { value: s.path, text: s.label, selected: s.path === value })); });
      if (value && !sources.some(function (s) { return s.path === value; })) pick.appendChild(el('option', { value: value, text: value, selected: true }));
      var thumb = el('img', { alt: '', class: 'thumb', hidden: !value });
      function show(v) { thumb.hidden = !v; if (v) thumb.src = assets[v] || v; }
      show(value);
      pick.addEventListener('change', function () { show(pick.value); change(pick.value); });
      var fid = 'f' + (++uid), file = el('input', { type: 'file', id: fid, accept: 'image/*', class: 'visually-hidden' });
      file.addEventListener('change', function () {
        var f = file.files && file.files[0];
        if (!f) return;
        var path = (window.DraftForms.publicFolder || '/uploads') + '/' + f.name.replace(/[^\w.-]+/g, '-');
        assets[path] = URL.createObjectURL(f);
        if (!sources.some(function (s) { return s.path === path; })) { sources.push({ label: f.name + ' (uploaded)', path: path }); pick.appendChild(el('option', { value: path, text: f.name + ' (uploaded)' })); }
        if (window.DraftForms.onUpload) window.DraftForms.onUpload(path, f);
        pick.value = path; show(path); change(path);
      });
      var upload = el('label', { for: fid, class: 'button quiet', text: 'Upload an image' });
      wrap.appendChild(el('div', { class: 'image-row' }, [thumb, el('div', {}, [pick, file, upload])]));
      return wrap;
    }
    if (spec.widget === 'select' && spec.multiple) {
      var chosen = (value || []).slice();
      var box = el('fieldset', { class: 'checks' }, [el('legend', { text: spec.label })]);
      if (!spec.options.length) box.appendChild(el('p', { class: 'hint', text: 'This site has no topics yet.' }));
      spec.options.forEach(function (o) {
        var cid = 'f' + (++uid), input = el('input', { type: 'checkbox', id: cid, value: o.value, checked: chosen.indexOf(o.value) >= 0 });
        input.addEventListener('change', function () {
          if (input.checked) chosen.push(o.value); else chosen.splice(chosen.indexOf(o.value), 1);
          change(chosen.slice());
        });
        box.appendChild(el('label', { for: cid }, [input, document.createTextNode(o.label)]));
      });
      // Values the options don't list (a tag already in a marker) are kept, and shown so nothing vanishes unseen.
      var unknown = chosen.filter(function (v) { return !spec.options.some(function (o) { return o.value === v; }); });
      if (unknown.length) box.appendChild(el('p', { class: 'hint', text: 'Also kept, not in the topic list: ' + unknown.join(', ') }));
      return box;
    }
    if (spec.widget === 'select') {
      var select = el('select', { id: id });
      var options = spec.options.map(function (o) { return typeof o === 'string' ? { label: o, value: o } : o; });
      if (value && !options.some(function (o) { return o.value === value; })) options.unshift({ label: value + ' (not in the works list)', value: value });
      if ((!value || spec.required === false) && !options.some(function (o) { return o.value === ''; })) select.appendChild(el('option', { value: '', text: spec.required === false ? '(none)' : 'Choose…', selected: !value }));
      options.forEach(function (o) { select.appendChild(el('option', { value: o.value, text: o.label, selected: o.value === (value || '') })); });
      select.addEventListener('change', function () { change(select.value); });
      return el('div', {}, [label, select]);
    }
    var input = el('input', { type: 'text', id: id, value: value || '' });
    input.addEventListener('input', function () { change(input.value); });
    return el('div', {}, [label, input]);
  }

  // Draw a component's form into `host` for `data`; onChange(data) after every edit.
  function drawForm(component, host, data, onChange) {
    host.textContent = '';
    component.fields.forEach(function (spec) {
      if (spec.widget !== 'list') {
        var single = field(spec, data[spec.name], function (v) { data[spec.name] = v; onChange(data); });
        if (single) host.appendChild(single);
        return;
      }
      var items = data[spec.name] = data[spec.name] || [];
      var noun = (spec.label_singular || 'Item').toLowerCase();
      var list = el('div', { role: 'group', 'aria-label': spec.label });
      items.forEach(function (item, i) {
        var set = el('fieldset', {}, [el('legend', { text: (spec.label_singular || 'Item') + ' ' + (i + 1) })]);
        spec.fields.forEach(function (sub) {
          var f = field(sub, item[sub.name], function (v) { item[sub.name] = v; onChange(data); });
          if (f) set.appendChild(f);
        });
        var actions = el('div', { class: 'actions' });
        if (i > 0) {
          var up = el('button', { type: 'button', class: 'quiet', text: 'Move ' + noun + ' ' + (i + 1) + ' up' });
          up.addEventListener('click', function () { items.splice(i - 1, 0, items.splice(i, 1)[0]); redraw('Moved ' + noun + ' ' + (i + 1) + ' up.'); });
          actions.appendChild(up);
        }
        var remove = el('button', { type: 'button', class: 'quiet', text: 'Remove ' + noun + ' ' + (i + 1) });
        remove.addEventListener('click', function () {
          items.splice(i, 1); redraw('Removed ' + noun + ' ' + (i + 1) + '.');
          var buttons = host.querySelectorAll('button'); buttons[buttons.length - 1].focus();   // "Add a …", so focus isn't lost
        });
        actions.appendChild(remove);
        set.appendChild(actions);
        list.appendChild(set);
      });
      var add = el('button', { type: 'button', class: 'quiet', text: 'Add a ' + noun });
      add.addEventListener('click', function () {
        items.push({});
        redraw('Added ' + noun + ' ' + items.length + '.');
        var sets = host.querySelectorAll('fieldset > legend');
        var last = sets[sets.length - 1];
        if (last) { var first = last.parentNode.querySelector('select, input'); if (first) first.focus(); }
      });
      host.appendChild(list);
      host.appendChild(el('div', { class: 'actions' }, [add]));
    });
    function redraw(message) { drawForm(component, host, data, onChange); onChange(data, message); }
  }

  window.DraftForms = { components: components, drawForm: drawForm, el: el, assets: {}, imageSources: [], publicFolder: '/uploads' };
})();
