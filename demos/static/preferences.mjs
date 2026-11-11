const preferences = document.querySelector("[data-demo-preferences]");
const hover = preferences.querySelector('input[name="activation"]');
const theme = preferences.querySelector('select[name="theme"]');
const style = preferences.querySelector('select[name="citation-style"]');
const reader = document.querySelector("citation-inspector");
const status = preferences.querySelector("[data-style-status]");
let initialStyles;
let currentStyles;
let renderHTML = html => { reader.innerHTML = html; };
let renderedStyle = "default";
let selection = 0;

function applyAppearance() {
  reader.dataset.citationTheme = theme.value;
  if (hover.checked) reader.setAttribute("activation", "hover");
  else reader.removeAttribute("activation");
  preferences.querySelector("#demo-help-css code").textContent =
    `<citation-inspector data-citation-theme="${theme.value}">`;
}

function showStyleHelp() {
  preferences.querySelector("#demo-help-style code").textContent =
    `createCitationCompiler({ citationStyle: "${style.value}" })`;
}

function showVariant(variants) {
  const html = variants?.[style.value];
  if (typeof html !== "string") throw new Error("That citation style is unavailable.");
  renderHTML(html);
  renderedStyle = style.value;
  status.textContent = "";
}

async function changeStyle() {
  showStyleHelp();
  const token = ++selection;
  try {
    if (!currentStyles) {
      initialStyles ||= fetch("./styles.json").then(response => {
        if (!response.ok) throw new Error("Citation examples are unavailable.");
        return response.json();
      }).catch(error => {
        initialStyles = null;
        throw error;
      });
      const loaded = await initialStyles;
      if (token !== selection) return;
      currentStyles = loaded;
    }
    showVariant(currentStyles);
  } catch {
    if (token !== selection) return;
    style.value = renderedStyle;
    showStyleHelp();
    status.textContent = "Could not load that citation style.";
  }
}

export function setCitationVariants(variants, render) {
  ++selection;
  currentStyles = variants;
  renderHTML = render;
  showVariant(variants);
}

let activeHelp;
let hideHelpTimer;

function closeHelp() {
  clearTimeout(hideHelpTimer);
  if (!activeHelp) return;
  delete activeHelp.dataset.open;
  delete activeHelp.dataset.pinned;
  activeHelp = null;
}

function openHelp(help) {
  clearTimeout(hideHelpTimer);
  if (activeHelp !== help) closeHelp();
  activeHelp = help;
  help.dataset.open = "";
}

function scheduleHelpClose(help) {
  clearTimeout(hideHelpTimer);
  hideHelpTimer = setTimeout(() => {
    if (activeHelp === help && !help.matches(":hover, :focus-within, [data-pinned]")) closeHelp();
  }, 180);
}

for (const help of preferences.querySelectorAll(".demo-help")) {
  const button = help.querySelector("button");
  help.addEventListener("pointerenter", event => {
    if (event.pointerType === "mouse") openHelp(help);
  });
  help.addEventListener("pointerleave", () => scheduleHelpClose(help));
  button.addEventListener("focus", () => openHelp(help));
  button.addEventListener("click", () => {
    openHelp(help);
    help.dataset.pinned = "";
  });
  button.addEventListener("blur", () => {
    delete help.dataset.pinned;
    scheduleHelpClose(help);
  });
}

document.addEventListener("pointerdown", event => {
  if (activeHelp && !activeHelp.contains(event.target)) closeHelp();
});
document.addEventListener("keydown", event => {
  if (event.key === "Escape") closeHelp();
});

hover.addEventListener("change", applyAppearance);
theme.addEventListener("change", applyAppearance);
style.addEventListener("change", changeStyle);
applyAppearance();
showStyleHelp();
preferences.hidden = false;
