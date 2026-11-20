import { annotateMarkers, collectMarkerTags } from '../../dist/citation-tools.mjs';
const response = await fetch('./article-tools.json');
const cache = await response.json();
document.querySelector('#collect-tags').addEventListener('click', () => {
  const result = collectMarkerTags([document.querySelector('#editor-source').value, document.querySelector('#tag-source').value], cache, { includeDiagnostics: true });
  document.querySelector('#tag-result').textContent = JSON.stringify(result, null, 2);
  const count = Object.keys(result.counts).length;
  const noun = new Intl.PluralRules('en').select(count) === 'one' ? 'reference' : 'references';
  document.querySelector('#editor-status').textContent = 'Collected tag contributions for ' + count + ' ' + noun + '.' + (result.diagnostics.length ? ' Some source regions need review; see the diagnostics.' : '');
});
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
