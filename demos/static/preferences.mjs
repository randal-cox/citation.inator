const preferences = document.querySelector("[data-demo-preferences]");
const hover = preferences.querySelector('input[name="activation"]');
const theme = preferences.querySelector('select[name="theme"]');

function applyPreferences() {
  for (const reader of document.querySelectorAll("citation-inspector")) {
    reader.dataset.citationTheme = theme.value;
    if (hover.checked) reader.setAttribute("activation", "hover");
    else reader.removeAttribute("activation");
  }
}

preferences.addEventListener("change", applyPreferences);
applyPreferences();
preferences.hidden = false;
