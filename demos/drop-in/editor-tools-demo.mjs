import { annotateMarkers } from './citation-tools.mjs';
const response = await fetch('./article-tools.json');
const cache = await response.json();
document.querySelector('#editor-tools').addEventListener('submit', event => {
  event.preventDefault();
  const source = document.querySelector('#editor-source');
  const output = document.querySelector('#editor-result');
  const status = document.querySelector('#editor-status');
  try {
    const result = annotateMarkers(source.value, cache, { citationStyle: document.querySelector('#editor-style').value });
    source.value = result.source;
    output.textContent = result.source;
    status.textContent = result.diagnostics.length ? result.diagnostics.map(item => item.state).join(', ') : result.changed ? 'Editor notes refreshed. Reader output is unchanged.' : 'Editor notes are already current.';
  } catch (error) { status.textContent = error.message; }
});
