/*! citation-inator v0.1.1 | MIT | See LICENSE */

// src/class-names.mjs
var defaultClassPrefix = "citation";
var partSelector = "[data-citation-part]";
function validClassPrefix(prefix) {
  return typeof prefix === "string" && /^[a-z][a-z0-9-]{0,31}$/.test(prefix);
}
function validateClassPrefix(prefix) {
  if (!validClassPrefix(prefix)) throw new TypeError("Use a lowercase citation class prefix.");
}
function partClassNames(prefix, parts) {
  return parts.split(" ").map((part) => `${prefix}-${part}`);
}

// src/icons.mjs
var paths = {
  pdf: '<path d="M6 3h8l4 4v14H6z M14 3v5h4"/><path d="m8 17 3-5 2 4 3 1-4 1z"/>',
  publisher: '<path d="M3 9 12 4l9 5z M5 20h14 M7 11v7m5-7v7m5-7v7"/>',
  book: '<path d="M5 4h14v16H7a2 2 0 0 1-2-2z M5 17h14 M8 8h8m-8 3h6"/>',
  link: '<path d="m9 15 6-6 M8 16l-1 1a3 3 0 0 1-4-4l5-5a3 3 0 0 1 4 0 M16 8l1-1a3 3 0 0 1 4 4l-5 5a3 3 0 0 1-4 0"/>',
  repository: '<path d="M4 4h16v5H4z M6 9v11h12V9 M10 13h4"/>',
  article: '<path d="M6 4h12v16H6z M9 8h6m-6 4h6m-6 4h4"/>',
  external: '<path d="M13 4h7v7m0-7-9 9m7 0v7H4V6h7"/>',
  library: '<path d="M4 19V5h4v14zm4 0V5h4v14zm6-13 4-1 3 14-4 1z"/>',
  status: '<path d="M12 3 4 7v5c0 5 4 8 8 9 4-1 8-4 8-9V7z M12 8v5m0 3h.01"/>',
  back: '<path d="m10 6-6 6 6 6 M4 12h11a4 4 0 0 0 4-4"/>',
  endnote: '<path d="M4 5h16M4 10h10m-10 5h5m6-2v7m-3-3 3 3 3-3"/>',
  copy: '<rect x="8" y="8" width="12" height="12" rx="2"/><path d="M16 8V4H4v12h4"/>',
  more: '<circle cx="5" cy="12" r="1"/><circle cx="12" cy="12" r="1"/><circle cx="19" cy="12" r="1"/>'
};
function iconMarkup(name) {
  return `<svg viewBox="0 0 24 24" width="19" height="19" fill="none" stroke="currentColor" stroke-width="1.65" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">${Object.hasOwn(paths, name) ? paths[name] : paths.link}</svg>`;
}

// src/records.mjs
var CACHE_SCHEMA = "citation-inator.cache.v1";
var cleanText = (value) => typeof value === "string" ? value.trim() : "";
var stableId = /^[a-z0-9][a-z0-9.-]{0,159}$/;
var doi = (value) => /^10\.\d{4,9}\/[^\s\u0000-\u001f\u007f<>{}]+$/iu.test(value) && !value.split("/").some((part) => part === "." || part === "..");
var kinds = /* @__PURE__ */ new Set(["article-journal", "book", "thesis", "article", "dataset", "software", "webpage", "report", "chapter", "document"]);
var versions = /* @__PURE__ */ new Set(["version of record", "accepted manuscript", "author preprint", "preprint", "repository dissertation", "dataset", "software release"]);
var integrityStates = /* @__PURE__ */ new Set(["retracted", "corrected", "expression of concern"]);
var locationKinds = /* @__PURE__ */ new Set(["publisher", "repository", "pdf", "preprint", "status"]);
function httpsURL(value) {
  try {
    const url = new URL(cleanText(value));
    if (url.protocol === "https:" && !url.username && !url.password) return url.href;
  } catch {
  }
  return "";
}
function normalizeIdentifier(input) {
  if (typeof input !== "string") return null;
  const raw = input.trim();
  if (!raw || raw.length > 2048) return null;
  if (doi(raw)) return { scheme: "doi", value: raw.toLowerCase() };
  if (/^https:\/\//i.test(raw)) return normalizeIdentifier(`url:${raw}`);
  const match = /^([a-z]+):(.*)$/i.exec(raw);
  if (!match) return stableId.test(raw) ? { scheme: "local", value: raw } : null;
  const scheme = match[1].toLowerCase();
  let value = match[2].trim();
  switch (scheme) {
    case "doi":
      return doi(value) ? { scheme, value: value.toLowerCase() } : null;
    case "pmid":
      return /^[1-9]\d{0,11}$/.test(value) ? { scheme, value } : null;
    case "pmcid":
      value = value.toUpperCase();
      return /^PMC[1-9]\d{0,11}$/.test(value) ? { scheme, value } : null;
    case "arxiv":
      value = value.replace(/^arxiv:/i, "");
      return /^(?:\d{4}\.\d{4,5}|[a-z][a-z0-9.-]*\/\d{7})(?:v[1-9]\d*)?$/i.test(value) ? { scheme, value } : null;
    case "isbn": {
      value = value.replace(/[\s-]/g, "").toUpperCase();
      if (/^97[89]\d{10}$/.test(value) && [...value].reduce((sum, n, i) => sum + Number(n) * (i % 2 ? 3 : 1), 0) % 10 === 0) return { scheme, value };
      if (/^\d{9}[\dX]$/.test(value) && [...value].reduce((sum, n, i) => sum + (n === "X" ? 10 : Number(n)) * (10 - i), 0) % 11 === 0) return { scheme, value };
      return null;
    }
    case "dataset":
    case "software":
      if (doi(value)) return normalizeIdentifier(value);
      return normalizeIdentifier(`url:${value}`);
    case "url": {
      const safe = httpsURL(value);
      if (!safe) return null;
      const { hostname, pathname } = new URL(safe);
      if (["doi.org", "dx.doi.org"].includes(hostname)) {
        try {
          return normalizeIdentifier(`doi:${decodeURIComponent(pathname.slice(1))}`);
        } catch {
          return null;
        }
      }
      if (hostname === "pubmed.ncbi.nlm.nih.gov") {
        const pmid = /^\/(\d+)\/?$/.exec(pathname)?.[1];
        if (pmid) return normalizeIdentifier(`pmid:${pmid}`);
      }
      if (hostname === "pmc.ncbi.nlm.nih.gov" || hostname === "www.ncbi.nlm.nih.gov") {
        const pmc = /^\/(?:pmc\/)?articles\/(PMC\d+)\/?$/.exec(pathname)?.[1];
        if (pmc) return normalizeIdentifier(`pmcid:${pmc}`);
      }
      if (hostname === "arxiv.org") {
        const arxiv = /^\/(?:abs|pdf)\/(.+?)(?:\.pdf)?$/.exec(pathname)?.[1];
        if (arxiv) return normalizeIdentifier(`arxiv:${arxiv}`);
      }
      return { scheme, value: safe };
    }
    case "local":
      return stableId.test(value) ? { scheme, value } : null;
    default:
      return null;
  }
}
var identifierKey = ({ scheme, value }) => `${scheme}:${value}`;
function identifierURL(id) {
  if (!id) return "";
  const valid = normalizeIdentifier(identifierKey(id));
  if (!valid) return "";
  const path = valid.value.split("/").map(encodeURIComponent).join("/");
  return {
    doi: `https://doi.org/${path}`,
    pmid: `https://pubmed.ncbi.nlm.nih.gov/${path}/`,
    pmcid: `https://pmc.ncbi.nlm.nih.gov/articles/${path}/`,
    arxiv: `https://arxiv.org/abs/${path}`,
    isbn: `https://search.worldcat.org/search?q=bn%3A${path}`,
    url: valid.value
  }[valid.scheme] || "";
}
function dateParts(value) {
  if (!Array.isArray(value) || !value.length || value.length > 3 || !value.every(Number.isInteger)) return null;
  const [year, month = 1, day = 1] = value;
  if (year < 1e3 || year > 9999 || month < 1 || month > 12 || day < 1 || day > new Date(Date.UTC(year, month, 0)).getUTCDate()) return null;
  return [...value];
}
function stamp(value) {
  const date = cleanText(value);
  return date && Number.isFinite(Date.parse(date)) ? new Date(date).toISOString() : null;
}
function normalizeRecord(input) {
  if (!input || !stableId.test(cleanText(input.id))) throw new TypeError("A stable citation record ID is required.");
  const array = (value) => Array.isArray(value) ? value : [];
  const identifiers = /* @__PURE__ */ new Map();
  for (const item of array(input.identifiers)) {
    if (!item || typeof item.scheme !== "string" || typeof item.value !== "string") continue;
    const id = normalizeIdentifier(identifierKey(item));
    if (id && id.scheme !== "local") identifiers.set(identifierKey(id), id);
  }
  const authors = array(input.authors).flatMap((author) => {
    const literal = cleanText(author?.literal);
    const family = cleanText(author?.family);
    const given = cleanText(author?.given);
    return literal ? [{ literal }] : family ? [{ family, ...given && { given } }] : [];
  });
  const locations = array(input.locations).flatMap((location) => {
    const url = httpsURL(location?.url);
    const provider = cleanText(location?.provider);
    const verifiedAt = stamp(location?.verifiedAt);
    if (!url || !provider || !locationKinds.has(location.kind)) return [];
    if (["pdf", "preprint"].includes(location.kind) && !verifiedAt) return [];
    return [{
      kind: location.kind,
      url,
      provider,
      verifiedAt,
      version: versions.has(location.version) ? location.version : null
    }];
  });
  const provenance = array(input.provenance).flatMap((source) => {
    const provider = cleanText(source?.provider);
    return provider ? [{
      provider,
      url: httpsURL(source.url),
      retrievedAt: stamp(source.retrievedAt),
      note: cleanText(source.note)
    }] : [];
  });
  const title = cleanText(input.title);
  const abstract = cleanText(input.abstract?.text);
  const abstractSource = cleanText(input.abstract?.source);
  const state = ["resolved", "partial", "unresolved"].includes(input.state) ? input.state : "unresolved";
  const textFields = ["containerTitle", "publisher", "volume", "issue", "pages", "articleNumber", "edition", "original", "note", "citationText"];
  return {
    id: input.id.trim(),
    type: kinds.has(input.type) ? input.type : "document",
    state: title ? state : "unresolved",
    title,
    authors,
    identifiers: [...identifiers.values()],
    locations,
    provenance,
    issued: dateParts(input.issued),
    online: dateParts(input.online),
    print: dateParts(input.print),
    retrievedAt: stamp(input.retrievedAt),
    version: versions.has(input.version) ? input.version : null,
    integrity: integrityStates.has(input.integrity?.state) && (httpsURL(input.integrity?.url) || cleanText(input.integrity?.source)) ? {
      state: input.integrity.state,
      source: cleanText(input.integrity.source),
      url: httpsURL(input.integrity.url)
    } : null,
    abstract: abstract && abstractSource ? {
      text: abstract,
      source: abstractSource,
      ...input.abstract.kind === "excerpt" && { kind: "excerpt" },
      ...httpsURL(input.abstract.url) && { url: httpsURL(input.abstract.url) }
    } : null,
    ...Object.fromEntries(textFields.map((field) => [field, cleanText(input[field])]))
  };
}
function readCache(input) {
  if (input?.schema !== CACHE_SCHEMA || !Array.isArray(input.records)) throw new TypeError("Unsupported citation cache schema.");
  const byId = /* @__PURE__ */ new Map();
  const byIdentifier = /* @__PURE__ */ new Map();
  for (const raw of input.records) {
    const record = normalizeRecord(raw);
    if (byId.has(record.id)) throw new Error(`Duplicate record ID ${record.id}.`);
    byId.set(record.id, record);
    for (const identifier of record.identifiers) {
      const key = identifierKey(identifier);
      if (byIdentifier.has(key)) throw new Error(`Conflicting records for ${key}.`);
      byIdentifier.set(key, record);
    }
  }
  return { byId, byIdentifier };
}

// src/compiler.mjs
var titleFor = (record) => record.title || record.original || "Unresolved citation";
var yearFor = (record) => record.issued?.[0] ?? "n.d.";
function bibliographyText(record, suffix = "") {
  if (record.state === "unresolved") return titleFor(record);
  const year = yearFor(record);
  if (record.citationText && (!suffix || record.citationText.includes(` (${year}).`))) {
    return record.citationText.replace(` (${year}).`, ` (${year}${suffix}).`);
  }
  const names = record.authors.map((author) => {
    if (author.literal) return author.literal;
    const initials = author.given?.match(/\p{L}[\p{L}\p{M}]*/gu)?.map((part) => `${[...part][0]}.`).join(" ");
    return initials ? `${author.family}, ${initials}` : author.family;
  });
  const authors = names.length > 1 ? `${names.slice(0, -1).join(", ")}, & ${names.at(-1)}` : names[0];
  const journal = [record.containerTitle, record.volume + (record.issue ? `(${record.issue})` : ""), record.pages || record.articleNumber].filter(Boolean).join(", ");
  const source = record.identifiers.find((id) => id.scheme === "doi");
  const details = [journal || record.publisher, identifierURL(source)].filter(Boolean);
  return [
    authors ? `${authors} (${year}${suffix}). ${titleFor(record)}.` : `${titleFor(record)}. (${year}${suffix}).`,
    ...details.map((item) => item.startsWith("https://") ? item : `${item}.`)
  ].join(" ");
}

// src/browser.mjs
var componentName = "citation-inspector";
var stylesheetURL = new URL("./citation-inspector.css", import.meta.url);
var triggerSelector = "a[data-ci-record], a[data-ci-panel]";
var triggerAttributes = ["role", "aria-haspopup", "aria-expanded", "aria-label"];
function element(tag, text, parts) {
  const node = document.createElement(tag);
  if (text) node.textContent = text;
  if (parts) {
    node.dataset.citationPart = parts;
    node.className = partClassNames(defaultClassPrefix, parts).join(" ");
  }
  return node;
}
function iconControl(node, icon, label, tooltip = label) {
  node.dataset.citationPart = "icon";
  node.classList.add(`${defaultClassPrefix}-icon`);
  node.innerHTML = iconMarkup(icon);
  node.setAttribute("aria-label", label);
  node.title = tooltip;
  return node;
}
function action(label, icon, callback) {
  const button = iconControl(element("button"), icon, label);
  button.type = "button";
  button.addEventListener("click", callback);
  return button;
}
function external(url, label) {
  const link = element("a", label);
  link.href = url;
  link.target = "_blank";
  link.rel = "noopener noreferrer";
  return link;
}
function disclosure(summary, ...content) {
  const details = element("details");
  details.append(element("summary", summary), ...content);
  return details;
}
function destination(list, label, icon, url, { version, download = false } = {}) {
  if (!url) return;
  const row = element("li");
  const name = version ? `${label} (${version})` : label;
  const link = iconControl(external(url), icon, name, `${name}
${url}`);
  if (download) link.download = "";
  row.append(link);
  list.append(row);
}
var CitationInspector = class _CitationInspector extends HTMLElement {
  static observedAttributes = ["activation", "panel-title", "panel-icon", "class-prefix"];
  #hovering = false;
  #hoverOpenTimer;
  #hoverCloseTimer;
  #dialog;
  #content;
  #status;
  #style;
  #cache;
  #hasInlineCache = false;
  #listeners;
  #observer;
  #panelSize;
  #enhanced = /* @__PURE__ */ new Map();
  #appliedPrefixes = /* @__PURE__ */ new WeakMap();
  #trigger;
  #modal = false;
  #frame;
  #media;
  #heading;
  #brandIcon;
  #modalDismiss;
  #panelMenu;
  #panelMenuTrigger;
  #placement;
  #backdropPress = false;
  #drag;
  #manualPosition;
  #owner;
  constructor() {
    super();
    const shadow = this.attachShadow({ mode: "open" });
    this.#style = element("link");
    this.#style.rel = "stylesheet";
    this.#style.href = stylesheetURL.href;
    this.#dialog = element("dialog", "", "panel");
    this.#dialog.part = "panel";
    this.#dialog.setAttribute("aria-labelledby", "panel-name");
    const header = element("header", "", "panel-header");
    this.#heading = element("h2", "citation.inator");
    this.#heading.id = "panel-name";
    this.#heading.tabIndex = -1;
    this.#brandIcon = element("img", "", "brand-icon");
    this.#brandIcon.alt = "";
    this.#brandIcon.hidden = true;
    this.#brandIcon.addEventListener("error", () => {
      this.#brandIcon.hidden = true;
    });
    const brand = element("div", "", "brand");
    brand.append(this.#brandIcon, this.#heading);
    this.#modalDismiss = element("button", "Dismiss", "modal-dismiss");
    this.#modalDismiss.type = "button";
    this.#modalDismiss.hidden = true;
    this.#modalDismiss.addEventListener("click", () => this.#dismiss(true));
    this.#panelMenuTrigger = iconControl(element("summary"), "more", "Panel options");
    const movePanel = element("button", "Move panel", "panel-command");
    movePanel.type = "button";
    movePanel.addEventListener("click", () => this.#beginPlacement());
    this.#panelMenu = element("details", "", "panel-menu");
    this.#panelMenu.append(this.#panelMenuTrigger, movePanel);
    header.append(brand, this.#panelMenu, this.#modalDismiss);
    const top = element("div", "", "panel-top");
    top.append(header);
    this.#content = element("div", "", "panel-content");
    this.#status = element("p", "", "live");
    this.#status.setAttribute("role", "status");
    this.#dialog.append(top, this.#content, this.#status);
    this.#placement = element("dialog", "", "panel-placement");
    this.#placement.setAttribute("aria-label", "Move citation panel");
    this.#placement.setAttribute("aria-describedby", "placement-instructions");
    const instructions = element("div", "", "placement-instructions");
    instructions.id = "placement-instructions";
    instructions.textContent = "Click or tap where the panel\u2019s top-left corner should go.";
    const cancel = element("button", "Cancel move", "panel-command");
    cancel.type = "button";
    cancel.autofocus = true;
    cancel.addEventListener("click", () => this.#cancelPlacement());
    instructions.append(cancel);
    this.#placement.append(instructions);
    this.#placement.addEventListener("cancel", (event) => {
      event.preventDefault();
      this.#cancelPlacement();
    });
    this.#placement.addEventListener("click", (event) => {
      if (event.target !== this.#placement) return;
      this.#placement.close();
      this.#moveTo(event.clientX, event.clientY);
      this.#heading.focus({ preventScroll: true });
    });
    shadow.append(this.#style, element("slot"), this.#dialog, this.#placement);
  }
  set cache(value) {
    const cache = readCache(value);
    this.#dismiss(false);
    this.#cache = cache;
    this.#hasInlineCache = true;
    if (this.isConnected) this.#enhance();
  }
  attributeChangedCallback(name, before, after) {
    if (before === after) return;
    if (name === "class-prefix") {
      this.#applyClassPrefix();
      return;
    }
    if (name !== "activation") {
      if (this.#trigger) this.#updateHeader(this.#annotationTarget(this.#trigger));
      return;
    }
    this.#cancelHover();
    if (this.#hovering) this.#dismiss(false);
  }
  #cancelHover() {
    clearTimeout(this.#hoverOpenTimer);
    clearTimeout(this.#hoverCloseTimer);
  }
  #hoverAllowed(event) {
    return this.getAttribute("activation") === "hover" && event.pointerType === "mouse" && typeof this.#dialog.showPopover === "function";
  }
  #queueHoverClose() {
    clearTimeout(this.#hoverCloseTimer);
    if (!this.#hovering) return;
    this.#hoverCloseTimer = setTimeout(() => {
      if (this.#hovering && !this.shadowRoot.activeElement && !this.#dialog.matches(":hover") && !this.#trigger?.matches(":hover")) {
        this.#dismiss(false);
      }
    }, 450);
  }
  connectedCallback() {
    const listeners = new AbortController();
    this.#listeners = listeners;
    const { signal } = listeners;
    this.#media = matchMedia("(max-width: 42rem), (pointer: coarse), (max-height: 30rem)");
    this.#media.addEventListener("change", () => this.#dismiss(!this.#hovering), { signal });
    this.addEventListener("pointerover", (event) => {
      const trigger = event.target.closest?.(triggerSelector);
      if (!this.#hoverAllowed(event) || !this.#enhanced.has(trigger) || event.relatedTarget instanceof Node && trigger.contains(event.relatedTarget)) return;
      clearTimeout(this.#hoverOpenTimer);
      if (this.#trigger === trigger) {
        clearTimeout(this.#hoverCloseTimer);
        return;
      }
      if (this.#trigger && !this.#hovering) return;
      this.#hoverOpenTimer = setTimeout(() => {
        if (this.#enhanced.has(trigger) && trigger.matches(":hover")) this.#open(trigger, true);
      }, 140);
    }, { signal });
    this.addEventListener("pointerout", (event) => {
      const trigger = event.target.closest?.(triggerSelector);
      if (!this.#enhanced.has(trigger) || event.relatedTarget instanceof Node && trigger.contains(event.relatedTarget)) return;
      clearTimeout(this.#hoverOpenTimer);
      if (trigger === this.#trigger) this.#queueHoverClose();
    }, { signal });
    this.#dialog.addEventListener("pointerdown", (event) => this.#startDrag(event), { signal });
    this.ownerDocument.addEventListener("pointermove", (event) => {
      const drag = this.#drag;
      if (drag?.id !== event.pointerId) return;
      if (!drag.moved) {
        if (Math.hypot(event.clientX - drag.x, event.clientY - drag.y) < 4) return;
        drag.moved = true;
        this.#dialog.setPointerCapture(event.pointerId);
        this.#cancelHover();
        this.#hovering = false;
      }
      this.#moveTo(drag.left + event.clientX - drag.x, drag.top + event.clientY - drag.y);
    }, { capture: true, signal });
    for (const type of ["pointerup", "pointercancel", "lostpointercapture"]) {
      this.ownerDocument.addEventListener(type, (event) => {
        if (event.pointerId !== this.#drag?.id) return;
        if (type === "lostpointercapture" && event.composedPath()[0] !== this.#dialog) return;
        this.#endDrag();
      }, { capture: true, signal });
    }
    this.#dialog.addEventListener("touchstart", (event) => {
      if (this.#drag && event.touches.length === 1 && event.cancelable) event.preventDefault();
    }, { passive: false, signal });
    this.#heading.addEventListener("keydown", (event) => this.#moveWithKeys(event), { signal });
    this.#dialog.addEventListener("pointerenter", () => clearTimeout(this.#hoverCloseTimer), { signal });
    this.#dialog.addEventListener("pointerleave", () => this.#queueHoverClose(), { signal });
    this.#dialog.addEventListener("focusin", () => clearTimeout(this.#hoverCloseTimer), { signal });
    this.#dialog.addEventListener("focusout", () => this.#queueHoverClose(), { signal });
    this.addEventListener("click", (event) => {
      const trigger = event.target.closest?.(triggerSelector);
      if (!this.#enhanced.has(trigger) || event.defaultPrevented || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      event.preventDefault();
      this.#open(trigger);
    }, { signal });
    this.addEventListener("keydown", (event) => {
      const trigger = event.target.closest?.(triggerSelector);
      if (event.key !== " " || !this.#enhanced.has(trigger) || event.defaultPrevented) return;
      event.preventDefault();
      if (!event.repeat) this.#open(trigger);
    }, { signal });
    this.ownerDocument.addEventListener("keydown", (event) => {
      if (event.defaultPrevented || event.key !== "Escape") return;
      this.#cancelHover();
      if (!this.#trigger) return;
      event.preventDefault();
      if (this.#placement.open) {
        this.#cancelPlacement();
        return;
      }
      if (this.#panelMenu.open) {
        this.#panelMenu.open = false;
        this.#panelMenuTrigger.focus({ preventScroll: true });
        return;
      }
      this.#dismiss(!this.#hovering || Boolean(this.shadowRoot.activeElement));
    }, { signal });
    this.#dialog.addEventListener("click", (event) => {
      const dismiss = this.#modal && this.#backdropPress && event.target === this.#dialog;
      this.#backdropPress = false;
      if (dismiss) this.#dismiss(true);
    }, { signal });
    this.#dialog.addEventListener("cancel", (event) => {
      event.preventDefault();
      this.#dismiss(true);
    }, { signal });
    this.#dialog.addEventListener("beforetoggle", (event) => {
      if (event.newState === "closed") this.#clearOpen();
    }, { signal });
    this.#dialog.addEventListener("close", () => {
      if (!this.#dialog.open && this.#modal) this.#clearOpen();
    }, { signal });
    this.ownerDocument.addEventListener("click", (event) => {
      const target = event.composedPath();
      if (target.includes(this.#placement)) return;
      if (!target.includes(this.#panelMenu)) this.#panelMenu.open = false;
      if (!this.#trigger || this.#modal || target.includes(this) && (target.includes(this.#dialog) || target.some((node) => this.#enhanced.has(node)))) return;
      this.#dismiss(false);
    }, { signal });
    window.addEventListener("resize", () => this.#schedulePosition(), { signal });
    window.addEventListener("scroll", () => this.#schedulePosition(), { capture: true, passive: true, signal });
    window.visualViewport?.addEventListener("resize", () => this.#schedulePosition(), { signal });
    window.visualViewport?.addEventListener("scroll", () => this.#schedulePosition(), { signal });
    this.#panelSize = new ResizeObserver(() => this.#schedulePosition());
    this.#panelSize.observe(this.#dialog);
    this.#observer = new MutationObserver(() => {
      this.#applyClassPrefix();
      this.#enhance();
    });
    this.#observer.observe(this, { childList: true, subtree: true });
    this.#style.addEventListener("load", () => this.#enhance(), { signal });
    this.#applyClassPrefix();
    this.#enhance();
    if (!this.#cache) this.#load(signal);
  }
  async #load(signal) {
    try {
      const location = this.getAttribute("data-cache");
      if (!location) return;
      const url = new URL(location, this.baseURI);
      if (url.origin !== window.location.origin) return;
      const response = await fetch(url, { signal, credentials: "same-origin", redirect: "error" });
      if (!response.ok) return;
      const cache = readCache(await response.json());
      if (!signal.aborted && !this.#hasInlineCache) {
        this.#cache = cache;
        this.#enhance();
      }
    } catch {
    }
  }
  #restore(trigger, attributes) {
    for (const [key, value] of attributes) {
      if (value === null) trigger.removeAttribute(key);
      else trigger.setAttribute(key, value);
    }
    this.#enhanced.delete(trigger);
  }
  #applyClassPrefix() {
    const lightParts = [...this.querySelectorAll(partSelector)].filter((node) => node.closest(componentName) === this);
    const configured = this.getAttribute("class-prefix");
    const compiled = lightParts[0]?.dataset.citationPrefix;
    const prefix = validClassPrefix(configured) ? configured : validClassPrefix(compiled) ? compiled : defaultClassPrefix;
    for (const node of [...lightParts, ...this.shadowRoot.querySelectorAll(partSelector)]) {
      const previous = this.#appliedPrefixes.get(node) || node.dataset.citationPrefix || defaultClassPrefix;
      if (previous === prefix) continue;
      const parts = node.dataset.citationPart;
      node.classList.remove(...partClassNames(previous, parts));
      node.classList.add(...partClassNames(prefix, parts));
      this.#appliedPrefixes.set(node, prefix);
    }
  }
  #annotationTarget(trigger) {
    const target = trigger.dataset.ciPanel && this.ownerDocument.getElementById(trigger.hash.slice(1));
    return target && this.contains(target) && target.matches('[data-citation-part~="annotation-content"], .ci-annotation-content') ? target : null;
  }
  #canOpen(trigger) {
    return this.#cache?.byId.has(trigger.dataset.ciRecord) || this.#annotationTarget(trigger);
  }
  #enhance() {
    if (!this.#style.sheet || typeof this.#dialog.showModal !== "function") return;
    for (const [trigger, attributes] of this.#enhanced) {
      if (this.contains(trigger) && this.#canOpen(trigger)) continue;
      if (trigger === this.#trigger) this.#dismiss(false);
      this.#restore(trigger, attributes);
    }
    for (const trigger of this.querySelectorAll(triggerSelector)) {
      if (trigger.closest(componentName) !== this || this.#enhanced.has(trigger) || !this.#canOpen(trigger)) continue;
      this.#enhanced.set(trigger, new Map(triggerAttributes.map((key) => [key, trigger.getAttribute(key)])));
      trigger.setAttribute("role", "button");
      trigger.setAttribute("aria-haspopup", "dialog");
      trigger.setAttribute("aria-expanded", "false");
      if (!trigger.dataset.ciPanel) trigger.setAttribute("aria-label", `Inspect citation: ${trigger.textContent.trim()}`);
    }
  }
  disconnectedCallback() {
    this.#dismiss(false);
    this.#listeners?.abort();
    this.#observer?.disconnect();
    this.#panelSize?.disconnect();
    for (const [trigger, attributes] of this.#enhanced) this.#restore(trigger, attributes);
  }
  #open(trigger, hover = false) {
    this.#cancelHover();
    if (trigger === this.#trigger) {
      if (hover) return;
      if (!this.#hovering) {
        this.#dismiss(true);
        return;
      }
      if (!this.#media.matches) {
        this.#hovering = false;
        this.#heading.focus({ preventScroll: true });
        return;
      }
      this.#dismiss(false);
    }
    const annotation = this.#annotationTarget(trigger);
    const record = this.#cache?.byId.get(trigger.dataset.ciRecord);
    if (!annotation && !record) return;
    const doc = this.ownerDocument;
    doc.querySelectorAll(componentName).forEach((component) => {
      if (component !== this && component instanceof _CitationInspector) component.#dismiss(false);
    });
    this.#dismiss(false);
    this.#trigger = trigger;
    this.#hovering = hover;
    this.#owner = {};
    this.#modal = !hover && (this.#media.matches || typeof this.#dialog.showPopover !== "function");
    this.#modalDismiss.hidden = !this.#modal;
    trigger.setAttribute("aria-expanded", "true");
    this.#updateHeader(annotation);
    if (annotation) {
      this.#status.textContent = "";
      const body = annotation.querySelector("[data-ci-annotation-body]");
      this.#content.replaceChildren(body.cloneNode(true));
    } else this.#render(record, trigger);
    this.#applyClassPrefix();
    this.#dialog.scrollTop = 0;
    if (this.#modal) {
      this.#dialog.removeAttribute("popover");
      this.#dialog.showModal();
    } else {
      this.#dialog.setAttribute("popover", "manual");
      const previousFocus = hover && doc.activeElement;
      this.#dialog.showPopover({ source: trigger });
      if (hover && this.shadowRoot.activeElement) {
        this.shadowRoot.activeElement.blur();
        previousFocus?.focus({ preventScroll: true });
      }
    }
    this.#position();
    if (!hover) this.#heading.focus({ preventScroll: true });
  }
  #clearOpen() {
    this.#trigger?.setAttribute("aria-expanded", "false");
    this.#trigger = null;
    this.#hovering = false;
    this.#backdropPress = false;
    this.#panelMenu.open = false;
    if (this.#placement.open) this.#placement.close();
    this.#endDrag();
    this.#manualPosition = null;
    this.#dialog.removeAttribute("data-ci-moved");
    this.#owner = null;
    cancelAnimationFrame(this.#frame);
    this.#frame = null;
  }
  #dismiss(restore) {
    this.#cancelHover();
    if (!this.#trigger) return;
    const trigger = this.#trigger;
    this.#clearOpen();
    if (this.#modal) this.#dialog.close();
    else if (this.#dialog.matches(":popover-open")) this.#dialog.hidePopover();
    if (restore && trigger.isConnected) trigger.focus();
  }
  #schedulePosition() {
    if (!this.#trigger || this.#frame) return;
    this.#frame = requestAnimationFrame(() => {
      this.#frame = null;
      this.#position();
    });
  }
  #startDrag(event) {
    if (!this.#trigger || event.button !== 0 || !event.isPrimary || this.#drag) return;
    const { clientX: x, clientY: y, target } = event;
    const { left, top, right, bottom } = this.#dialog.getBoundingClientRect();
    const outside = x < left || x > right || y < top || y > bottom;
    this.#backdropPress = this.#modal && target === this.#dialog && outside;
    if (outside) return;
    if (target.closest("a, button, input, select, textarea, label, summary, [contenteditable], [tabindex]:not([tabindex='-1']), [role='button']") || this.#overText(target, x, y)) return;
    if (event.pointerType === "mouse") event.preventDefault();
    this.#drag = { id: event.pointerId, x, y, left, top, moved: false };
  }
  #overText(target, x, y) {
    const range = this.ownerDocument.createRange();
    for (const child of target.childNodes) {
      if (child.nodeType !== Node.TEXT_NODE || !child.textContent.trim()) continue;
      range.selectNodeContents(child);
      if ([...range.getClientRects()].some((rect) => x >= rect.left && x <= rect.right && y >= rect.top && y <= rect.bottom)) return true;
    }
    return false;
  }
  #endDrag() {
    const drag = this.#drag;
    this.#drag = null;
    if (drag && this.#dialog.hasPointerCapture(drag.id)) this.#dialog.releasePointerCapture(drag.id);
  }
  #moveWithKeys(event) {
    const offsets = { ArrowUp: [0, -24], ArrowDown: [0, 24], ArrowLeft: [-24, 0], ArrowRight: [24, 0] };
    const offset = offsets[event.key];
    if (!offset && event.key !== "Home") return;
    event.preventDefault();
    this.#cancelHover();
    this.#hovering = false;
    if (event.key === "Home") this.#resetPosition();
    else this.#nudge(...offset);
  }
  #beginPlacement() {
    this.#cancelHover();
    this.#hovering = false;
    this.#panelMenu.open = false;
    this.#placement.showModal();
  }
  #cancelPlacement() {
    this.#placement.close();
    this.#panelMenuTrigger.focus({ preventScroll: true });
  }
  #resetPosition() {
    this.#manualPosition = null;
    this.#dialog.removeAttribute("data-ci-moved");
    this.#position();
  }
  #nudge(dx, dy) {
    const { left, top } = this.#dialog.getBoundingClientRect();
    this.#moveTo(left + dx, top + dy);
  }
  #moveTo(left, top) {
    this.#manualPosition = { left, top };
    this.#dialog.setAttribute("data-ci-moved", "");
    this.#position();
  }
  #position() {
    if (!this.#trigger) return;
    const viewport = window.visualViewport;
    const x = viewport?.offsetLeft ?? 0;
    const y = viewport?.offsetTop ?? 0;
    const width = viewport?.width ?? this.ownerDocument.documentElement.clientWidth;
    const height = viewport?.height ?? this.ownerDocument.documentElement.clientHeight;
    if (this.#modal) {
      this.#dialog.style.setProperty("--ci-sheet-width", `${Math.max(1, width - 16)}px`);
      this.#dialog.style.setProperty("--ci-sheet-height", `${height * (this.#media.matches ? 0.6 : 0.8)}px`);
    }
    const panel = this.#dialog.getBoundingClientRect();
    const anchor = this.#trigger.getBoundingClientRect();
    const clamp = (value, min, max) => Math.max(min, Math.min(max, value));
    const gap = this.#hovering ? 1 : 9;
    const below = anchor.bottom + gap;
    const above = anchor.top - panel.height - gap;
    const fitsBelow = below + panel.height <= y + height - 12;
    const fitsAbove = above >= y + 12;
    const side = anchor.right + gap;
    const fitsBeside = side + panel.width <= x + width - 12;
    const left = this.#manualPosition?.left ?? (this.#modal ? x + (width - panel.width) / 2 : !fitsBelow && !fitsAbove && fitsBeside ? side : anchor.left);
    const top = this.#manualPosition?.top ?? (this.#modal ? y + height - panel.height - 8 : fitsBelow ? below : fitsAbove ? above : anchor.top);
    const clampedLeft = clamp(left, x + 8, x + width - panel.width - 8);
    const clampedTop = clamp(top, y + 8, y + height - panel.height - 8);
    this.#dialog.style.setProperty("--ci-left", `${clampedLeft}px`);
    this.#dialog.style.setProperty("--ci-top", `${clampedTop}px`);
    if (this.#manualPosition) this.#manualPosition = { left: clampedLeft, top: clampedTop };
  }
  #updateHeader(annotation) {
    this.#heading.textContent = annotation?.getAttribute("aria-label") || this.getAttribute("panel-title")?.trim() || "citation.inator";
    const icon = this.getAttribute("panel-icon")?.trim();
    let source;
    if (icon) {
      try {
        const url = new URL(icon, this.baseURI);
        if (["http:", "https:"].includes(url.protocol) && url.origin === this.ownerDocument.location.origin && !url.username && !url.password) {
          source = url.href;
        }
      } catch {
      }
    }
    if (source) {
      if (this.#brandIcon.getAttribute("src") !== source) {
        this.#brandIcon.hidden = false;
        this.#brandIcon.src = source;
      }
    } else {
      this.#brandIcon.hidden = true;
      this.#brandIcon.removeAttribute("src");
    }
  }
  #render(record, trigger) {
    const fragment = document.createDocumentFragment();
    const title = record.title || record.original || "Unresolved citation";
    const bibliography = trigger.dataset.ciBibliography || bibliographyText(record);
    const badges = [record.integrity?.state, record.state === "unresolved" && "Unresolved"].filter(Boolean);
    if (badges.length) fragment.append(element("p", badges.join(" \xB7 "), record.integrity ? "badge integrity" : "badge"));
    const titleNode = element("h3", title);
    titleNode.dir = "auto";
    fragment.append(titleNode);
    const names = record.authors.map((author) => author.literal || [author.given, author.family].filter(Boolean).join(" "));
    if (names.length) {
      const authors = element("p", names.join(", "), "authors");
      authors.dir = "auto";
      fragment.append(names.length > 8 ? disclosure(`Show all ${names.length} authors`, authors) : authors);
    }
    const doi2 = record.identifiers.find((item) => item.scheme === "doi");
    const doiURL = identifierURL(doi2);
    const doiAt = doiURL ? bibliography.toLowerCase().indexOf(doiURL.toLowerCase()) : -1;
    const citation = element("p", doiAt < 0 ? bibliography : "", "citation");
    if (doiAt >= 0) {
      const end = doiAt + doiURL.length;
      citation.append(bibliography.slice(0, doiAt), external(doiURL, bibliography.slice(doiAt, end)), bibliography.slice(end));
    }
    citation.dir = "auto";
    fragment.append(names.length > 8 ? disclosure("Show formatted citation", citation) : citation);
    for (const identifier of record.identifiers) {
      if (identifier.scheme !== "isbn" && (identifier !== doi2 || doiAt >= 0)) continue;
      const line = element("p", "", "identifier");
      line.append(`${identifier.scheme.toUpperCase()} `, external(identifierURL(identifier), identifier.value));
      fragment.append(line);
    }
    if (record.abstract) {
      const heading = record.abstract.kind === "excerpt" ? "Abstract excerpt" : "Abstract";
      const abstract = element("p", record.abstract.text, "abstract");
      abstract.dir = "auto";
      const source = element("p", "", "muted");
      source.append(record.abstract.url ? external(record.abstract.url, record.abstract.source) : record.abstract.source);
      const block = disclosure(heading, abstract, source);
      block.open = record.abstract.kind === "excerpt";
      fragment.append(block);
    }
    const id = (scheme) => identifierURL(record.identifiers.find((item) => item.scheme === scheme));
    const location = (kind) => record.locations.find((item) => item.kind === kind);
    const preprint = location("preprint");
    const pdf = location("pdf") || (preprint && /\.pdf(?:[?#]|$)/i.test(preprint.url) ? preprint : null);
    const publisher = location("publisher");
    const list = element("ul", "", "destinations");
    list.setAttribute("aria-label", "Source links");
    destination(list, "Download PDF", "pdf", pdf?.url, { version: pdf?.version, download: true });
    destination(list, "Open publisher page", "publisher", publisher?.url === doiURL ? "" : publisher?.url);
    destination(list, "Open repository", "repository", location("repository")?.url);
    destination(list, "Open PubMed", "article", id("pmid"));
    destination(list, "Open PubMed Central", "repository", id("pmcid"));
    const preprintURL = id("arxiv") || preprint?.url;
    if (preprintURL !== pdf?.url) destination(list, "Open preprint", "external", preprintURL);
    if (typeof this.institutionalURL === "function") destination(list, "Open library resolver", "library", this.#institutionalLink(record));
    if (record.integrity) destination(list, "Open status record", "status", record.integrity.url || location("status")?.url);
    const footer = element("footer", "", "panel-actions");
    const endnote = trigger.hash && this.ownerDocument.getElementById(trigger.hash.slice(1));
    if (endnote) {
      footer.append(action("Go to endnote", "endnote", () => {
        this.#dismiss(false);
        this.ownerDocument.defaultView.location.hash = trigger.hash;
        endnote.focus();
      }));
    }
    footer.append(action("Copy citation", "copy", () => this.#copy(bibliography)));
    const persistent = doi2 || record.identifiers[0];
    if (persistent) footer.append(action(`Copy ${persistent.scheme.toUpperCase()}`, "link", () => this.#copy(persistent.value)));
    if (typeof this.report === "function" || this.hasAttribute("data-report")) {
      footer.append(action("Report metadata", "status", () => {
        const payload = { record: structuredClone(record), page: this.ownerDocument.location.href, occurrence: trigger.id };
        this.dispatchEvent(new CustomEvent("citation-report", { detail: payload, bubbles: true, composed: true }));
        this.report?.(payload);
      }));
    }
    const toolbar = element("div", "", "panel-toolbar");
    if (list.childElementCount) toolbar.append(list);
    toolbar.append(footer);
    fragment.append(toolbar);
    this.#status.textContent = "";
    this.#content.replaceChildren(fragment);
  }
  #institutionalLink(record) {
    try {
      return httpsURL(this.institutionalURL(structuredClone(record)));
    } catch {
      return "";
    }
  }
  #showStatus(message) {
    this.#status.textContent = message;
    const overflow = this.#status.getBoundingClientRect().bottom - this.#dialog.getBoundingClientRect().bottom;
    if (overflow > 0) this.#dialog.scrollTop += overflow + 2;
  }
  async #copy(value) {
    const owner = this.#owner;
    try {
      await navigator.clipboard.writeText(value);
      if (this.#owner === owner) this.#showStatus("Copied.");
    } catch {
      if (this.#owner === owner) this.#showStatus("Clipboard unavailable. Select the citation text to copy it.");
    }
  }
};
if (!customElements.get(componentName)) customElements.define(componentName, CitationInspector);
function initializeCitationInspector(element2, {
  classPrefix,
  cache,
  activation,
  panelTitle,
  panelIcon
} = {}) {
  if (element2?.localName !== componentName) throw new TypeError("Pass a citation-inspector element.");
  if (classPrefix !== void 0) {
    validateClassPrefix(classPrefix);
    element2.setAttribute("class-prefix", classPrefix);
  }
  if (activation !== void 0) element2.setAttribute("activation", activation);
  if (panelTitle !== void 0) element2.setAttribute("panel-title", panelTitle);
  if (panelIcon !== void 0) element2.setAttribute("panel-icon", panelIcon);
  if (cache !== void 0) element2.cache = cache;
  return element2;
}
export {
  initializeCitationInspector
};
