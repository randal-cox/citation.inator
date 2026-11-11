import { defaultClassPrefix, partClassNames, partSelector, validClassPrefix, validateClassPrefix } from "./class-names.mjs";
import { brandIconMarkup, iconMarkup } from "./icons.mjs";
import { bibliographyText } from "./compiler.mjs";
import { fullAuthorName, httpsURL, identifierURL, readCache } from "./records.mjs";

const componentName = "citation-inspector";
const stylesheetURL = new URL("./citation-inspector.css", import.meta.url);
const triggerSelector = "a[data-ci-record], a[data-ci-panel]";
const triggerAttributes = ["role", "aria-haspopup", "aria-expanded", "aria-label", "tabindex"];
const documentCaches = new WeakMap();

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
  const link = iconControl(external(url), icon, name, `${name}\n${url}`);
  if (download) link.download = "";
  row.append(link);
  list.append(row);
}

class CitationInspector extends HTMLElement {
  static observedAttributes = ["activation", "panel-title", "panel-icon", "class-prefix", "access-providers", "hidden-access-providers", "hidden-providers", "evidence-title", "evidence-icon", "credit-title", "credit-icon"];

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
  #enhanced = new Map();
  #appliedPrefixes = new WeakMap();
  #accessOrder = new WeakMap();
  #hiddenAccessLinks = new WeakSet();
  #trigger;
  #modal = false;
  #frame;
  #media;
  #heading;
  #brandIcon;
  #defaultIcon;
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
    this.#defaultIcon = element("span", "", "brand-icon");
    this.#defaultIcon.innerHTML = brandIconMarkup;
    this.#brandIcon.addEventListener("error", () => {
      this.#brandIcon.hidden = true;
      this.#defaultIcon.hidden = false;
    });
    const brand = element("div", "", "brand");
    brand.append(this.#brandIcon, this.#defaultIcon, this.#heading);
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
    instructions.textContent = "Click or tap where the panel’s top-left corner should go.";
    const cancel = element("button", "Cancel move", "panel-command");
    cancel.type = "button";
    cancel.autofocus = true;
    cancel.addEventListener("click", () => this.#cancelPlacement());
    instructions.append(cancel);
    this.#placement.append(instructions);
    this.#placement.addEventListener("cancel", event => {
      event.preventDefault();
      this.#cancelPlacement();
    });
    this.#placement.addEventListener("click", event => {
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

  set accessProviders(providers) {
    if (!Array.isArray(providers) || providers.some(provider => typeof provider !== "string" || !provider.trim() || provider.includes(","))) {
      throw new TypeError("Supply an ordered array of provider names without commas.");
    }
    this.setAttribute("access-providers", providers.join(","));
  }

  set hiddenAccessProviders(providers) {
    if (!Array.isArray(providers) || providers.some(provider => typeof provider !== "string" || !provider.trim() || provider.includes(","))) {
      throw new TypeError("Supply an array of hidden provider names without commas.");
    }
    this.setAttribute("hidden-access-providers", providers.join(","));
  }

  set hiddenProviders(providers) {
    if (!Array.isArray(providers) || providers.some(provider => typeof provider !== "string" || !provider.trim() || provider.includes(","))) {
      throw new TypeError("Supply an array of hidden provider names without commas.");
    }
    this.setAttribute("hidden-providers", providers.join(","));
  }

  attributeChangedCallback(name, before, after) {
    if (before === after) return;
    if (name === "access-providers" || name === "hidden-access-providers" || name === "hidden-providers") {
      this.#orderEndnoteLinks();
      const record = this.#cache?.byId.get(this.#trigger?.dataset.ciRecord);
      if (record) {
        const focused = this.shadowRoot.activeElement;
        const restoreFocus = focused && this.#content.contains(focused);
        const actionName = focused?.getAttribute("aria-label");
        const href = focused?.getAttribute("href");
        const scroll = this.#dialog.scrollTop;
        this.#render(record, this.#trigger);
        this.#applyClassPrefix();
        if (restoreFocus) {
          const replacement = [...this.#content.querySelectorAll("a, button")].find(node =>
            actionName ? node.getAttribute("aria-label") === actionName : href && node.getAttribute("href") === href
          );
          (replacement || this.#heading).focus({ preventScroll: true });
        }
        this.#dialog.scrollTop = scroll;
      }
      return;
    }
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
    return this.getAttribute("activation") === "hover" && event.pointerType === "mouse" &&
      typeof this.#dialog.showPopover === "function";
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
    this.addEventListener("pointerover", event => {
      const trigger = event.target.closest?.(triggerSelector);
      if (!this.#hoverAllowed(event) || !this.#enhanced.has(trigger) || (event.relatedTarget instanceof Node && trigger.contains(event.relatedTarget))) return;
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
    this.addEventListener("pointerout", event => {
      const trigger = event.target.closest?.(triggerSelector);
      if (!this.#enhanced.has(trigger) || (event.relatedTarget instanceof Node && trigger.contains(event.relatedTarget))) return;
      clearTimeout(this.#hoverOpenTimer);
      if (trigger === this.#trigger) this.#queueHoverClose();
    }, { signal });
    this.#dialog.addEventListener("pointerdown", event => this.#startDrag(event), { signal });
    this.ownerDocument.addEventListener("pointermove", event => {
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
      this.ownerDocument.addEventListener(type, event => {
        if (event.pointerId !== this.#drag?.id) return;
        if (type === "lostpointercapture" && event.composedPath()[0] !== this.#dialog) return;
        this.#endDrag();
      }, { capture: true, signal });
    }
    this.#dialog.addEventListener("touchstart", event => {
      if (this.#drag && event.touches.length === 1 && event.cancelable) event.preventDefault();
    }, { passive: false, signal });
    this.#heading.addEventListener("keydown", event => this.#moveWithKeys(event), { signal });
    this.#dialog.addEventListener("pointerenter", () => clearTimeout(this.#hoverCloseTimer), { signal });
    this.#dialog.addEventListener("pointerleave", () => this.#queueHoverClose(), { signal });
    this.#dialog.addEventListener("focusin", () => clearTimeout(this.#hoverCloseTimer), { signal });
    this.#dialog.addEventListener("focusout", () => this.#queueHoverClose(), { signal });
    this.addEventListener("click", event => {
      const trigger = event.target.closest?.(triggerSelector);
      if (!this.#enhanced.has(trigger) || event.defaultPrevented || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      event.preventDefault();
      this.#open(trigger);
    }, { signal });
    this.addEventListener("keydown", event => {
      const trigger = event.target.closest?.(triggerSelector);
      if (!this.#enhanced.has(trigger) || event.defaultPrevented ||
          (event.key !== " " && (event.key !== "Enter" || trigger.hasAttribute("href")))) return;
      event.preventDefault();
      if (!event.repeat) this.#open(trigger);
    }, { signal });
    this.ownerDocument.addEventListener("keydown", event => {
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
    this.#dialog.addEventListener("click", event => {
      const dismiss = this.#modal && this.#backdropPress && event.target === this.#dialog;
      this.#backdropPress = false;
      if (dismiss) this.#dismiss(true);
    }, { signal });
    this.#dialog.addEventListener("cancel", event => {
      event.preventDefault();
      this.#dismiss(true);
    }, { signal });
    this.#dialog.addEventListener("beforetoggle", event => {
      if (event.newState === "closed") this.#clearOpen();
    }, { signal });
    this.#dialog.addEventListener("close", () => {
      if (!this.#dialog.open && this.#modal) this.#clearOpen();
    }, { signal });
    this.ownerDocument.addEventListener("click", event => {
      const target = event.composedPath();
      if (target.includes(this.#placement)) return;
      if (!target.includes(this.#panelMenu)) this.#panelMenu.open = false;
      if (!this.#trigger || this.#modal || target.includes(this) && (target.includes(this.#dialog) || target.some(node => this.#enhanced.has(node)))) return;
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
      if (url.origin !== this.ownerDocument.location.origin) return;
      url.hash = "";
      let caches = documentCaches.get(this.ownerDocument);
      if (!caches) {
        caches = new Map();
        documentCaches.set(this.ownerDocument, caches);
      }
      if (!caches.has(url.href)) {
        const request = fetch(url, { credentials: "same-origin", redirect: "error" })
          .then(response => {
            if (!response.ok) throw new Error("Citation cache unavailable.");
            return response.json();
          }).then(readCache).catch(error => {
            caches.delete(url.href);
            throw error;
          });
        caches.set(url.href, request);
      }
      const cache = await caches.get(url.href);
      if (!signal.aborted && !this.#hasInlineCache) {
        this.#cache = cache;
        this.#enhance();
      }
    } catch { /* Static endnote links remain usable when enhancement is unavailable. */ }
  }

  #restore(trigger, attributes) {
    for (const [key, value] of attributes) {
      if (value === null) trigger.removeAttribute(key);
      else trigger.setAttribute(key, value);
    }
    this.#enhanced.delete(trigger);
  }

  #applyClassPrefix() {
    const lightParts = [...this.querySelectorAll(partSelector)].filter(node => node.closest(componentName) === this);
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

  #providerRank(provider) {
    const preferences = (this.getAttribute("access-providers") || "").split(",").map(name => name.trim().toLowerCase());
    const index = preferences.indexOf(provider.toLowerCase());
    return index < 0 ? Infinity : index;
  }

  #providerHidden(provider) {
    return (this.getAttribute("hidden-providers") ?? this.getAttribute("hidden-access-providers") ?? "").split(",")
      .some(name => name.trim().toLowerCase() === provider.toLowerCase());
  }

  #orderEndnoteLinks() {
    for (const row of this.querySelectorAll('[data-citation-part~="note-actions"]')) {
      if (row.closest(componentName) !== this) continue;
      const links = [...row.querySelectorAll(":scope > [data-ci-access-provider]")];
      const active = this.ownerDocument.activeElement;
      links.forEach((link, index) => {
        if (!this.#accessOrder.has(link)) this.#accessOrder.set(link, index);
        if (this.#providerHidden(link.dataset.ciAccessProvider)) {
          if (!link.hidden) {
            link.hidden = true;
            this.#hiddenAccessLinks.add(link);
          }
        } else if (this.#hiddenAccessLinks.has(link)) {
          link.hidden = false;
          this.#hiddenAccessLinks.delete(link);
        }
      });
      if (links.includes(active) && active.hidden) {
        (row.querySelector("a:not([hidden])") || row.closest("li"))?.focus({ preventScroll: true });
      }
      const sorted = [...links].sort((a, b) => this.#providerRank(a.dataset.ciAccessProvider) -
        this.#providerRank(b.dataset.ciAccessProvider) || this.#accessOrder.get(a) - this.#accessOrder.get(b));
      if (links.every((link, index) => link === sorted[index])) continue;
      const slots = links.map(link => {
        const marker = this.ownerDocument.createComment("");
        link.before(marker);
        return marker;
      });
      const focused = this.ownerDocument.activeElement;
      slots.forEach((slot, index) => slot.replaceWith(sorted[index]));
      if (links.includes(focused)) focused.focus({ preventScroll: true });
    }
  }

  #enhance() {
    this.#orderEndnoteLinks();
    if (!this.#style.sheet || typeof this.#dialog.showModal !== "function") return;
    for (const [trigger, attributes] of this.#enhanced) {
      if (this.contains(trigger) && this.#canOpen(trigger)) continue;
      if (trigger === this.#trigger) this.#dismiss(false);
      this.#restore(trigger, attributes);
    }
    for (const trigger of this.querySelectorAll(triggerSelector)) {
      if (trigger.closest(componentName) !== this || this.#enhanced.has(trigger) || !this.#canOpen(trigger)) continue;
      this.#enhanced.set(trigger, new Map(triggerAttributes.map(key => [key, trigger.getAttribute(key)])));
      trigger.setAttribute("role", "button");
      if (!trigger.hasAttribute("href")) trigger.setAttribute("tabindex", "0");
      trigger.setAttribute("aria-haspopup", "dialog");
      trigger.setAttribute("aria-expanded", "false");
      if (!trigger.dataset.ciPanel) trigger.setAttribute("aria-label", trigger.dataset.ciInspectLabel || `Inspect citation: ${trigger.textContent.trim()}`);
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
      // A click in a narrow pane switches the preview to its modal sheet.
      this.#dismiss(false);
    }
    const annotation = this.#annotationTarget(trigger);
    const record = this.#cache?.byId.get(trigger.dataset.ciRecord);
    if (!annotation && !record) return;
    const doc = this.ownerDocument;
    doc.querySelectorAll(componentName).forEach(component => {
      if (component !== this && component instanceof CitationInspector) component.#dismiss(false);
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
      // Keeping the pane in the top layer avoids clipping and z-index conflicts.
      this.#dialog.setAttribute("popover", "manual");
      const previousFocus = hover && doc.activeElement;
      this.#dialog.showPopover({ source: trigger });
      if (hover && this.shadowRoot.activeElement) {
        this.shadowRoot.activeElement.blur();
        previousFocus?.focus({ preventScroll: true });
      }
    }
    this.setAttribute("open", "");
    this.#position();
    if (!hover) this.#heading.focus({ preventScroll: true });
  }

  #clearOpen() {
    this.removeAttribute("open");
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
    if (target.closest("a, button, input, select, textarea, label, summary, [contenteditable], [tabindex]:not([tabindex='-1']), [role='button']") ||
        this.#overText(target, x, y)) return;
    if (event.pointerType === "mouse") event.preventDefault();
    this.#drag = { id: event.pointerId, x, y, left, top, moved: false };
  }

  #overText(target, x, y) {
    const range = this.ownerDocument.createRange();
    for (const child of target.childNodes) {
      if (child.nodeType !== Node.TEXT_NODE || !child.textContent.trim()) continue;
      range.selectNodeContents(child);
      if ([...range.getClientRects()].some(rect => x >= rect.left && x <= rect.right && y >= rect.top && y <= rect.bottom)) return true;
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
    this.#position();
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
    // Pinch zoom can make the visible viewport smaller than CSS viewport units.
    if (this.#placement.open) {
      this.#placement.style.setProperty("--ci-placement-left", `${x}px`);
      this.#placement.style.setProperty("--ci-placement-top", `${y}px`);
      this.#placement.style.setProperty("--ci-placement-width", `${width}px`);
      this.#placement.style.setProperty("--ci-placement-height", `${height}px`);
    }
    const widthLimit = width - (this.#modal ? 16 : 24);
    const heightLimit = this.#modal ? height * (this.#media.matches ? 0.6 : 0.8) : height - 24;
    this.#dialog.style.setProperty("--ci-panel-width", `${Math.max(1, widthLimit)}px`);
    this.#dialog.style.setProperty("--ci-panel-height", `${Math.max(1, heightLimit)}px`);
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
    const left = this.#manualPosition?.left ?? (this.#modal
      ? x + (width - panel.width) / 2
      : !fitsBelow && !fitsAbove && fitsBeside ? side : anchor.left);
    const top = this.#manualPosition?.top ?? (this.#modal
      ? y + height - panel.height - 8
      : fitsBelow ? below : fitsAbove ? above : anchor.top);
    const clampedLeft = clamp(left, x + 8, x + width - panel.width - 8);
    const clampedTop = clamp(top, y + 8, y + height - panel.height - 8);
    this.#dialog.style.setProperty("--ci-left", `${clampedLeft}px`);
    this.#dialog.style.setProperty("--ci-top", `${clampedTop}px`);
    if (this.#manualPosition) this.#manualPosition = { left: clampedLeft, top: clampedTop };
  }

  #updateHeader(annotation) {
    const panel = annotation ? this.#trigger?.dataset.ciPanel : "panel";
    this.#heading.textContent = this.getAttribute(`${panel}-title`)?.trim() ||
      annotation?.getAttribute("aria-label") || "citation.inator";
    const icon = (this.getAttribute(`${panel}-icon`) ?? this.getAttribute("panel-icon"))?.trim();
    let source;
    if (icon && icon !== "none") {
      try {
        const url = new URL(icon, this.baseURI);
        if (["http:", "https:"].includes(url.protocol) && url.origin === this.ownerDocument.location.origin && !url.username && !url.password) {
          source = url.href;
        }
      } catch { /* Invalid icon URL. */ }
    }
    if (source) {
      if (this.#brandIcon.getAttribute("src") !== source) {
        this.#defaultIcon.hidden = true;
        this.#brandIcon.hidden = false;
        this.#brandIcon.src = source;
      }
    } else {
      this.#brandIcon.hidden = true;
      this.#brandIcon.removeAttribute("src");
      this.#defaultIcon.hidden = icon === "none";
    }
  }

  #render(record, trigger) {
    const fragment = document.createDocumentFragment();
    const title = record.title || record.original || "Unresolved citation";
    const bibliography = trigger.dataset.ciBibliography || bibliographyText(record);
    const badges = [record.integrity?.state, record.state === "unresolved" && "Unresolved"].filter(Boolean);
    if (badges.length) fragment.append(element("p", badges.join(" · "), record.integrity ? "badge integrity" : "badge"));
    const titleNode = element("h3", title);
    titleNode.dir = "auto";
    fragment.append(titleNode);
    const names = record.authors.map(author => fullAuthorName(author));
    if (names.length) {
      const authors = element("p", names.join(", ") + (record.authorsComplete === false ? ", et al." : ""), "authors");
      authors.dir = "auto";
      fragment.append(names.length > 8 ? disclosure(record.authorsComplete === false ? "Show listed authors" : `Show all ${names.length} authors`, authors) : authors);
    }
    const doi = record.identifiers.find(item => item.scheme === "doi");
    const doiURL = identifierURL(doi);
    const citation = element("p", "", "citation");
    let parts;
    try { parts = JSON.parse(trigger.dataset.ciBibliographyParts || "null"); } catch { /* Fall back to plain text. */ }
    if (!Array.isArray(parts) || !parts.every(part => typeof part?.text === "string") ||
        parts.map(part => part.text).join("") !== bibliography) parts = [{ text: bibliography }];
    let linkedDOI = false;
    for (const { text, emphasis, href } of parts) {
      const node = emphasis === "italic" ? element("em") : emphasis === "bold" ? element("strong") : citation;
      const doiAt = !linkedDOI && doiURL ? text.toLowerCase().indexOf(doiURL.toLowerCase()) : -1;
      const link = httpsURL(href);
      if (link) {
        node.append(external(link, text));
        if (link === doiURL) linkedDOI = true;
      } else if (doiAt < 0) node.append(text);
      else {
        const end = doiAt + doiURL.length;
        node.append(text.slice(0, doiAt), external(doiURL, text.slice(doiAt, end)), text.slice(end));
        linkedDOI = true;
      }
      if (node !== citation) citation.append(node);
    }
    citation.dir = "auto";
    fragment.append(names.length > 8 ? disclosure("Show formatted citation", citation) : citation);
    for (const identifier of record.identifiers) {
      if (identifier.scheme !== "isbn" && (identifier !== doi || linkedDOI)) continue;
      const line = element("p", "", "identifier");
      const value = identifier.scheme === "isbn" && this.#providerHidden("WorldCat")
        ? identifier.value : external(identifierURL(identifier), identifier.value);
      line.append(`${identifier.scheme.toUpperCase()} `, value);
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

    const id = scheme => identifierURL(record.identifiers.find(item => item.scheme === scheme));
    const location = kind => record.locations.find(item => item.kind === kind);
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
    const services = record.locations.filter(item => ["library", "full-text"].includes(item.kind) && !this.#providerHidden(item.provider))
      .sort((a, b) => this.#providerRank(a.provider) - this.#providerRank(b.provider));
    for (const service of services) {
      const fullText = service.kind === "full-text";
      destination(list, `${fullText ? "Read full text at" : "Find at"} ${service.provider}`,
        fullText ? "article" : "library", service.url);
    }
    if (typeof this.institutionalURL === "function") destination(list, "Open library resolver", "library", this.#institutionalLink(record));
    if (record.integrity) destination(list, "Open status record", "status", record.integrity.url || location("status")?.url);
    const footer = element("footer", "", "panel-actions");
    const endnote = trigger.id && trigger.hash && this.ownerDocument.getElementById(trigger.hash.slice(1));
    if (endnote) {
      footer.append(action("Go to endnote", "endnote", () => {
        this.#dismiss(false);
        this.ownerDocument.defaultView.location.hash = trigger.hash;
        endnote.focus();
      }));
    }
    footer.append(action("Copy citation", "copy", () => this.#copy(bibliography)));
    const persistent = doi || record.identifiers[0];
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
    try { return httpsURL(this.institutionalURL(structuredClone(record))); }
    catch { return ""; }
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
}

if (!customElements.get(componentName)) customElements.define(componentName, CitationInspector);

export function initializeCitationInspector(element, {
  classPrefix, cache, activation, panelTitle, panelIcon, accessProviders, hiddenAccessProviders, hiddenProviders, evidenceTitle, evidenceIcon, creditTitle, creditIcon
} = {}) {
  if (element?.localName !== componentName) throw new TypeError("Pass a citation-inspector element.");
  if (classPrefix !== undefined) {
    validateClassPrefix(classPrefix);
    element.setAttribute("class-prefix", classPrefix);
  }
  if (activation !== undefined) element.setAttribute("activation", activation);
  if (panelTitle !== undefined) element.setAttribute("panel-title", panelTitle);
  if (panelIcon !== undefined) element.setAttribute("panel-icon", panelIcon);
  if (evidenceTitle !== undefined) element.setAttribute("evidence-title", evidenceTitle);
  if (evidenceIcon !== undefined) element.setAttribute("evidence-icon", evidenceIcon);
  if (creditTitle !== undefined) element.setAttribute("credit-title", creditTitle);
  if (creditIcon !== undefined) element.setAttribute("credit-icon", creditIcon);
  if (accessProviders !== undefined) element.accessProviders = accessProviders;
  if (hiddenAccessProviders !== undefined) element.hiddenAccessProviders = hiddenAccessProviders;
  if (hiddenProviders !== undefined) element.hiddenProviders = hiddenProviders;
  if (cache !== undefined) element.cache = cache;
  return element;
}
