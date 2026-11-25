import { accessCatalog, serviceFor, groupAccess, libraryURL } from "./access.mjs";
import { getAccessProfile, setAccessProfile, subscribeAccessProfile } from "./access-profile.mjs";
import { iconMarkup } from "./icons.mjs";
import { httpsURL } from "./records.mjs";
import { defaultClassPrefix, partClassNames } from "./class-names.mjs";

import { createCitationMessages } from "./i18n.mjs";


function node(doc, tag, text, part) {
  const value = doc.createElement(tag);
  if (text) value.textContent = text;
  if (part) {
    value.dataset.citationPart = part;
    value.className = partClassNames(defaultClassPrefix, part).join(" ");
  }
  return value;
}

function containerIsPanel(container) {
  return container.dataset.ciPanelAccess === "true" || container.dataset.citationPart?.split(/\s+/).includes("access") || container.getRootNode().host?.localName === "citation-inspector";
}

export class AccessView {
  #owner;
  #options = {};
  #messages = createCitationMessages();
  #unsubscribe;
  #rows = new Map();
  #titles = new Map();
  #listHelps = new Map();
  #sheet;
  #sheetMessages = [];
  #returnFocus;
  #returnContainer;
  constructor(owner) { this.#owner = owner; }
  configure(options) {
    const next = { ...this.#options, ...options };
    const messages = createCitationMessages(next);
    this.#options = next;
    this.#messages = messages;
    for (const {node,key,prefix} of this.#sheetMessages) node.textContent = prefix + this.text(key);
    if (this.#sheet) {
      this.#sheet.lang = messages.locale;
      this.#sheet.setAttribute("aria-label", this.text("access.settings"));
      const error=this.#sheet.querySelector('[data-ci-access-error]');
      if(error?.textContent)error.textContent=this.text('access.invalid');
    }
    accessCatalog(this.#options.accessCatalog);
    if (this.#options.accessLayout && !["flat", "grouped"].includes(this.#options.accessLayout)) throw new TypeError("Use grouped or flat access.");
    if (this.#options.accessSettings && !["builtin", "host", "off"].includes(this.#options.accessSettings)) throw new TypeError("Use builtin, host or off access settings.");
    for (const key of ["accessCollapseAfter", "staleAfterDays"]) {
      if (this.#options[key] !== undefined && (!Number.isFinite(this.#options[key]) || this.#options[key] < 0)) throw new TypeError("Supply a nonnegative " + key + ".");
    }
    this.connect();
    this.restore();
  }
  get catalog() { return accessCatalog(this.#options.accessCatalog); }
  get storageOptions() { return { accessStorageKey: this.#options.accessStorageKey, window: this.#owner.ownerDocument.defaultView }; }
  get profile() { return getAccessProfile(this.storageOptions); }
  get settings() { return this.#owner.getAttribute("access-settings") || this.#options.accessSettings || "builtin"; }
  get layout() { return this.#owner.getAttribute("access-layout") || this.#options.accessLayout || "grouped"; }
  text(key, values = {}) { return this.#messages.text(key, values); }

  connect() {
    this.#unsubscribe?.();
    if (!this.#owner.isConnected) return;
    this.#unsubscribe = subscribeAccessProfile(detail => {
      this.restore();
      this.#owner.refreshAccess();
      this.#owner.dispatchEvent(new CustomEvent("access-profile-changed", { detail, bubbles: true, composed: true }));
    }, this.storageOptions);
  }
  disconnect() {
    this.#unsubscribe?.();
    this.#unsubscribe = null;
    if (this.#sheet?.open) this.#sheet.close();
    this.#sheet?.remove();
    this.#sheet = null;
    this.restore();
  }
  owns(event) { return this.#sheet && event.composedPath().includes(this.#sheet); }
  items(record, hidden = () => false) {
    const catalog = this.catalog;
    const items = record.locations.filter(location => location.kind !== "status").map(location => {
      const service = serviceFor(location, catalog);
      return { ...location, service: service.id, serviceLabel: service.label, label: this.text("access.destination", { service: service.label }) };
    }).filter(item => !hidden(item.provider) && !hidden(item.service) && !hidden(item.serviceLabel));
    const resolver = typeof this.#owner.institutionalURL === "function"
      ? this.#institutional(record) : libraryURL(record, this.profile?.library);
    if (resolver) items.push({ url: resolver, kind: "library", service: "reader-library", serviceLabel: this.text("access.library"),
      label: this.text("access.library"), access: "unknown" });
    return items;
  }
  #institutional(record) {
    try { return httpsURL(this.#owner.institutionalURL(structuredClone(record))); } catch { return ""; }
  }
  // Resolve source labels and grouping from copy-level metadata, including legacy provider names.
  decorate(list, record, hidden = () => false) {
    const locations = this.items(record);
    const doc = list.ownerDocument;
    for (const item of locations) {
      if (![...list.querySelectorAll("a")].some(link => link.href === item.url)) {
        const link = node(doc, "a", "", "icon");
        link.href = item.url; link.target = "_blank"; link.rel = "noopener noreferrer";
        link.innerHTML = iconMarkup(item.kind === "pdf" ? "pdf" : item.kind === "library" ? "library" : "link");
        link.dataset.ciAccessProvider = item.provider || "";
        if (item.kind === "pdf") link.download = "";
        list.append(link);
      }
    }
    for (const link of [...list.querySelectorAll("a")]) {
      const provider = link.dataset.ciAccessProvider;
      const known = provider && serviceFor({ provider }, this.catalog);
      const item = locations.find(item => item.url === link.href && (!provider || item.provider === provider)) ||
        (known && { url: link.href, provider, service: known.id, serviceLabel: known.label, kind: "library", access: "unknown" });
      if (!item) {
        const directKind=link.dataset.accessKind || (link.href.startsWith('https://doi.org/')?'publisher':link.href.startsWith('https://arxiv.org/')?'preprint':/https:\/\/(?:pmc\.ncbi\.nlm\.nih\.gov|www\.ncbi\.nlm\.nih\.gov\/pmc)\//.test(link.href)?'repository':record.identifiers.some(id=>id.scheme==='url'&&id.value===link.href)?'publisher':'');
        if(['publisher','pdf','repository','preprint'].includes(directKind)){
          link.dataset.accessKind=directKind;link.dataset.accessPrimary='true';
          const label=this.text('access.action.'+directKind);link.setAttribute('aria-label',label);link.title=label+'\n'+link.href;
        }
        if (hidden(link.dataset.ciAccessProvider || "")) link.remove();
        continue;
      }
      if ([item.provider, item.service, item.serviceLabel].some(value => value && hidden(value))) { link.remove(); continue; }
      const kind = item.kind === "preprint" && /\.pdf(?:[?#]|$)/i.test(item.url) ? "pdf" : item.kind;
      link.dataset.accessKind=kind;
      link.dataset.accessPrimary=String(['publisher','pdf','repository','preprint'].includes(kind));
      const key = item.service === "reader-library" ? "access.library" : "access.action." + kind;
      let label = this.text(key, { service: item.serviceLabel });
      if (item.version) label = this.text("access.version", { label, version: item.version });
      delete link.dataset.accessChecked;
      delete link.dataset.accessStale;
      link.removeAttribute("aria-description");
      link.setAttribute("aria-label", label);
      link.title = label + "\n" + item.url;
      link.dataset.accessService = item.service;
      link.dataset.accessState = item.access || "unknown";
      if (item.verifiedAt) {
        const date = new Date(item.verifiedAt).toISOString().slice(0, 10);
        const checked = this.text("access.checked", { date });
        link.title += "\n" + checked;
        if (containerIsPanel(list)) {
          link.dataset.accessChecked = checked;
          link.setAttribute("aria-description", checked);
        }
        if (this.#options.staleAfterDays && Date.now() - Date.parse(item.verifiedAt) > this.#options.staleAfterDays * 86400000) {
          link.title += "\n" + this.text("access.stale");
          link.dataset.accessStale = this.text("access.stale");
        }
      }
    }
  }
  #appendLink(container, link) {
    if(containerIsPanel(container)&&!link.querySelector('[data-citation-part="access-link-label"]')){
      link.append(node(container.ownerDocument,'span',link.getAttribute('aria-label')||link.title?.split('\n')[0],'access-link-label'));
    }
    if(containerIsPanel(container))link.dataset.accessLabeled='';
    if (containerIsPanel(container) && link.dataset.accessChecked) {
      const item = node(container.ownerDocument, "span", "", "access-destination");
      item.append(link, node(container.ownerDocument, "small",
        [link.dataset.accessChecked, link.dataset.accessStale].filter(Boolean).join(" · "), "access-checked"));
      container.append(item);
    } else container.append(link);
  }
  group(container, links, record, { flat = false, hidden, showHelp = true } = {}) {
    this.decorate(container, record, hidden);
    links = [...container.querySelectorAll("a")];
    if (this.layout === "flat") {
      for (const link of links) this.#appendLink(container, link);
      if (showHelp) this.help(container, links);
      return;
    }
    const primary=links.filter(link=>link.dataset.accessPrimary==='true');
    for(const link of primary)this.#appendLink(container,link);
    const groups = groupAccess(links.filter(link=>!primary.includes(link)).map(link => ({
      link, access: link.dataset.accessState, service: link.dataset.accessService
    })), this.profile);
    for (const [key, entries] of Object.entries(groups)) {
      if (!entries.length) continue;
      const doc = container.ownerDocument;
      if (key === "other") {
        const visible = this.#options.accessCollapseAfter ?? 3;
        for (const { link } of entries.slice(0, visible)) this.#appendLink(container, link);
        if (entries.length > visible) {
          const more = node(doc, "details", "", "access-more");
          more.append(node(doc, "summary", this.text("access.more", { count: entries.length - visible })));
          const body = node(doc, "div", "", "access-more-body");
          if(containerIsPanel(container))body.dataset.ciPanelAccess='true';
          for (const { link } of entries.slice(visible)) {
            const destination = node(doc, "span", "", "access-alternative");
            const name = link.getAttribute("aria-label") || link.title || new URL(link.href).hostname;
            link.append(node(doc, "span", name, "access-link-label"));
            destination.append(link);body.append(destination);
          }
          more.append(body);
          container.append(more);
        }
      } else {
        if (!flat) container.append(node(doc, "span", this.text(key === "free" ? "access.free" : "access.selected"), "access-group-label"));
        for (const { link } of entries) this.#appendLink(container, link);
      }
    }
    if (showHelp) this.help(container, links);
  }
  help(container, links) {
    if (this.settings === "off" || !links.length) return;
    const profile = this.profile;
    const matched = links.some(link => link.dataset.accessService === "reader-library" || profile?.services.includes(link.dataset.accessService));
    const key = profile === null ? "unknown" : matched ? "match" : "none";
    const help = node(container.ownerDocument, "button", "", "access-help");
    help.innerHTML = iconMarkup("settings");
    help.append(node(container.ownerDocument, "span", this.text("access.help." + key)));
    help.type = "button";
    help.addEventListener("click", () => this.openSettings(help));
    container.append(help);
  }
  openSettings(trigger) {
    if (this.settings === "off") return;
    if (this.settings === "host") {
      this.#owner.dispatchEvent(new CustomEvent("access-settings-request", { bubbles: true, composed: true, cancelable: true }));
      return;
    }
    this.#sheet?.remove();
    const doc = this.#owner.ownerDocument;
    this.#sheetMessages = [];
    const message = (tag,key) => {
      const value = node(doc,tag);
      const text = doc.createTextNode(this.text(key));
      value.append(text); this.#sheetMessages.push({node:text,key,prefix:""});
      return value;
    };
    const sheet = this.#sheet = node(doc, "dialog", "", "access-settings");
    sheet.lang = this.#messages.locale;
    sheet.setAttribute("aria-label", this.text("access.settings"));
    const form = node(doc, "form");
    const title = message("h2", "access.settings");
    form.append(title, message("p", "access.privacy"));
    const columns = node(doc, "div", "", "access-settings-columns");
    const services = node(doc, "fieldset");
    services.append(message("legend", "access.services"));
    const profile = this.profile;
    const catalog = this.catalog;
    for (const kind of [...new Set(catalog.map(item => item.kind))]) {
      const group = node(doc, "fieldset");
      group.append(message("legend", "access.kind." + kind));
      for (const item of catalog.filter(item => item.kind === kind)) {
        const label = node(doc, "label");
        const input = node(doc, "input");
        input.type = "checkbox"; input.name = "service"; input.value = item.id;
        input.checked = Boolean(profile?.services.includes(item.id));
        label.append(input, " " + item.label); group.append(label);
      }
      services.append(group);
    }
    const preferences = node(doc, "fieldset");
    preferences.append(message("legend", "access.preferred"));
    for (const item of [{ id: "", label: this.text("access.noPreference") }, ...catalog]) {
      const label = node(doc, "label");
      const input = node(doc, "input");
      input.type = "radio"; input.name = "preferred"; input.value = item.id;
      input.checked = (profile?.preferred || "") === item.id;
      if (item.id === "") {
        const text = doc.createTextNode(" " + this.text("access.noPreference"));
        this.#sheetMessages.push({node:text,key:"access.noPreference",prefix:" "}); label.append(input,text);
      } else label.append(input, " " + item.label);
      preferences.append(label);
    }
    columns.append(services, preferences); form.append(columns);
    const library = node(doc, "fieldset");
    library.append(message("legend", "access.library"));
    const kindLabel = message("label", "access.library.kind");
    const kind = node(doc, "select"); kind.name = "libraryKind";
    for (const key of ["none", "proxy", "openurl"]) {
      const option = message("option", "access.library." + key); option.value = key;
      kind.append(option);
    }
    kind.value = profile?.library?.kind || "none"; kindLabel.append(kind);
    const addressLabel = message("label", "access.library.address");
    const address = node(doc, "input"); address.name = "libraryAddress"; address.type = "url";
    address.value = profile?.library?.base || ""; addressLabel.append(address);
    address.disabled = kind.value === "none";
    kind.addEventListener("change", () => { address.disabled = kind.value === "none"; });
    library.append(kindLabel, addressLabel, message("p", "access.library.help"));
    form.append(library);
    const error = node(doc, "p"); error.dataset.ciAccessError = ""; error.setAttribute("role", "alert"); form.append(error);
    const save = message("button", "access.save"); save.type = "submit";
    const clear = message("button", "access.clear"); clear.type = "button";
    clear.addEventListener("click", () => { setAccessProfile(null, this.storageOptions); close(); });
    const cancel = message("button", "access.cancel"); cancel.type = "button";
    cancel.addEventListener("click", () => sheet.close());
    form.append(save, clear, cancel);
    form.addEventListener("submit", event => {
      event.preventDefault();
      const fields = new FormData(form);
      try {
        setAccessProfile({
          services: fields.getAll("service"), preferred: fields.get("preferred"),
          library: kind.value === "none" ? null : { kind: kind.value, base: address.value }
        }, this.storageOptions);
        close();
      } catch { error.textContent = this.text("access.invalid"); }
    });
    sheet.append(form);
    this.#owner.shadowRoot.append(sheet);
    this.#returnFocus = trigger;
    this.#returnContainer = trigger.closest('[data-ci-note-record]') || trigger.closest('[data-citation-part="access-list-help"]')?.previousElementSibling;
    const finish = () => {
      if (this.#sheet !== sheet) return;
      this.#sheet = null;
      if (this.#returnFocus?.isConnected) this.#returnFocus.focus({ preventScroll: true });
      else {
        const replacement = this.#returnContainer?.querySelector('[data-citation-part="access-help"]') ||
          this.#listHelps.get(this.#returnContainer?.closest('ol,ul'))?.querySelector('[data-citation-part="access-help"]');
        if (replacement?.isConnected) replacement.focus({ preventScroll: true });
        else if (this.#owner.hasAttribute("open")) this.#owner.shadowRoot.querySelector("#panel-name")?.focus({ preventScroll: true });
      }
      sheet.remove();
    };
    const close = () => { sheet.close(); finish(); };
    sheet.addEventListener("close", finish, { once: true });
    sheet.addEventListener("cancel", event => { event.preventDefault(); close(); });
    let backdrop = false;
    sheet.addEventListener("pointerdown", event => { backdrop = event.target === sheet && this.#outside(sheet, event); });
    sheet.addEventListener("click", event => { if (backdrop && event.target === sheet) close(); backdrop = false; });
    sheet.showModal();
  }
  #outside(sheet, event) {
    const rect = sheet.getBoundingClientRect();
    return event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom;
  }
  enhanceNotes(records, hidden) {
    for (const row of this.#rows.keys()) {
      if (!this.#owner.contains(row)) this.#restoreRow(row);
    }
    const references = this.#owner.querySelectorAll('[data-ci-reference-record], [data-ci-note-record]');
    const visited = new Set(), lists = new Set();
    const unknown = this.profile === null;
    for (const reference of references) {
      if (reference.closest("citation-inspector") !== this.#owner) continue;
      const record = records.get(reference.dataset.ciReferenceRecord || reference.dataset.ciNoteRecord);
      if (!record) continue;
      const ancestorList = reference.closest("ol,ul");
      const list = ancestorList && this.#owner.contains(ancestorList) && ancestorList.closest("citation-inspector") === this.#owner ? ancestorList : null;
      if (list) lists.add(list);
      let row = reference.matches("[data-ci-note-record]") ? reference : reference.querySelector(':scope > [data-ci-note-record]');
      if (!row) {
        if (this.settings === "off" && !this.items(record, hidden).length) continue;
        row = node(reference.ownerDocument, "div", "", "note-actions");
        row.dataset.ciNoteRecord = record.id;
        row.dataset.ciGeneratedActions = "";
        reference.append(row);
      }
      if (visited.has(row)) continue;
      visited.add(row);
      const signature = JSON.stringify([record, this.profile, this.layout, this.settings, this.#options, this.#owner.getAttribute("hidden-providers"), this.#owner.getAttribute("hidden-access-providers"), this.#owner.getAttribute("access-providers")]);
      if (this.#rows.get(row)?.signature === signature) continue;
      this.#restoreRow(row);
      if (row.hasAttribute("data-ci-generated-actions") && this.settings === "off" && !this.items(record, hidden).length) {
        row.remove();
        continue;
      }
      if (!row.isConnected) reference.append(row);
      const statusURL = record.integrity?.url || record.locations.find(item => item.kind === "status")?.url;
      const links = [...row.querySelectorAll(':scope > a[href^="https:"]:not([data-ci-record]):not([data-ci-panel])')].filter(link => link.href !== statusURL);
      const saved = { signature, nodes: [...row.childNodes], generated: row.hasAttribute("data-ci-generated-actions"), reference: row.closest("li") };
      this.#rows.set(row, saved);
      {
        const group = node(row.ownerDocument, "span", "", "access-inline");
        row.prepend(group);
        for (const link of links) group.append(link);
        this.group(group, [...group.querySelectorAll("a")], record, { flat: true, hidden, showHelp:!unknown || !list });
      }
      this.#title(row.closest("li"), record, hidden);
    }
    for (const [list,help] of this.#listHelps) {
      if (!lists.has(list) || !unknown || this.settings === 'off') { help.remove(); this.#listHelps.delete(list); }
    }
    if (unknown && this.settings !== 'off') for (const list of lists) {
      if (this.#listHelps.has(list)) continue;
      const links=[...list.querySelectorAll('[data-ci-note-record] a[href^="https:"]')];
      if(!links.length)continue;
      const help=node(list.ownerDocument,'div','','access-list-help');
      this.help(help,links);list.after(help);this.#listHelps.set(list,help);
    }
  }
  #title(row, record, hidden) {
    const items = this.items(record, hidden);
    const groups = groupAccess(items, this.profile);
    const best = groups.free[0] || groups.selected.find(item => item.service === this.profile?.preferred);
    if (!best) return;
    const reference = row?.querySelector(':scope > span[data-ci-title-start]');
    if (!reference) return;
    let remaining = Number(reference.dataset.ciTitleStart);
    const length = Number(reference.dataset.ciTitleLength);
    const walker = reference.ownerDocument.createTreeWalker(reference, 4);
    let title, text;
    while ((text = walker.nextNode())) {
      if (remaining >= text.length) { remaining -= text.length; continue; }
      if (length > text.length - remaining) return;
      if (text.parentElement.closest("a")) return;
      const isolated = text.splitText(remaining);
      isolated.splitText(length);
      title = node(reference.ownerDocument, "span");
      isolated.replaceWith(title);
      title.append(isolated);
      break;
    }
    const created = true;
    if (!title) return;
    const saved = [...title.childNodes];
    const link = node(title.ownerDocument, "a");
    link.href = best.url; link.target = "_blank"; link.rel = "noopener noreferrer";
    const destination = this.text("access.at", { service: best.serviceLabel });
    link.setAttribute("aria-label", title.textContent + " " + destination);
    // Keep authored emphasis, while avoiding nested links from a curated reference.
    for (const child of saved) link.append(child.cloneNode(true));
    for (const nested of link.querySelectorAll("a")) nested.replaceWith(...nested.childNodes);
    const label = node(title.ownerDocument, "small", " " + destination);
    title.replaceChildren(link, label);
    this.#titles.set(title, { nodes: saved, created });
  }
  #restoreRow(row) {
    const saved = this.#rows.get(row);
    const reference = saved?.reference || row.closest("li");
    if (saved?.generated) row.remove();
    else if (saved) row.replaceChildren(...saved.nodes);
    this.#rows.delete(row);
    for (const [title, titleState] of this.#titles) {
      if (reference?.contains(title)) {
        if (titleState.created) title.replaceWith(...titleState.nodes);
        else title.replaceChildren(...titleState.nodes);
        this.#titles.delete(title);
      }
    }
  }
  restore() {
    for (const help of this.#listHelps.values()) help.remove();
    this.#listHelps.clear();
    for (const row of this.#rows.keys()) this.#restoreRow(row);
  }
}
