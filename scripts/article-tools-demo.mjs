import { writeFile } from 'node:fs/promises';
import { compileCitations, escapeHTML } from '../src/compiler.mjs';
import { makeCache } from '../src/records.mjs';
import { createSiteOccurrenceIndex } from '../src/reference-features.mjs';
import { brandIconMarkup } from '../src/icons.mjs';

export async function writeArticleToolsDemo(directory, cache, assets) {
  const records = cache.records.filter(record => record.state === 'resolved').slice(0, 3)
    .map((record, index) => ({ ...record, tags: [['theory'], ['praxis'], ['theory', 'praxis']][index] }));
  const data = makeCache(records);
  const [one, two, three] = records.map(record => record.id);
  const catalogue = [{ id: 'theory', label: 'Theory', icon: './tag-book.svg' }, { id: 'praxis', label: 'Praxis', icon: './tag-tool.svg' }];
  const options = { citationStyle: 'chicago-author-date', tagCatalogue: catalogue, endnotesHeading: 'References' };
  const sources = [
    `This article uses the first source {citation ${one} | tags:theory}. A second passage uses the same source {citation ${one} | tags:praxis | locator:"p. 4"}.\n\nA different source provides a comparison {citation ${two}}.\n\n{citation endnote}`,
    `This article shares a source with Article one {citation ${one} | tags:praxis}. Its other source has two accumulated topic tags, but this mention contributes Theory {citation ${three} | tags:theory}.\n\nThe comparison source is listed for further reading without an in-text citation.\n\n{citation nocite ${two}}\n\n{citation endnote}`
  ];
  const articles = sources.map((source, index) => compileCitations(source, data, { ...options, namespace: `example-${index + 1}` }));
  const siteOccurrences = createSiteOccurrenceIndex(articles.map((result, index) => ({ href: `./article-${index + 1}.html`, label: `Article ${index + 1}`, occurrences: result.occurrences })));
  const fullOptions = { ...options, siteOccurrences, listFilters: true };
  const bibliography = compileCitations(`{citation list ${one}; ${two}; ${three} | sort:author}`, data, { ...fullOptions, namespace: 'site-library' });
  const buildFiltered = compileCitations(`{citation list ${one}; ${two}; ${three} | tags:theory,praxis | tag-mode:all}`, data, { ...fullOptions, namespace: 'both-topics' });
  const reader = (html, id) => `<citation-inspector id="${id}" data-cache="./article-tools.json" access-settings="off">${html}</citation-inspector>`;
  const page = (title, body, script = '') => `<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${title} | cite.inator</title>
<link rel="stylesheet" href="${assets}citation-inspector.css"><link rel="stylesheet" href="./article-tools-demo.css"><script type="module" src="${assets}citation-inspector.mjs"></script>${script}</head>
<body><header><a href="./">Reading room</a><nav aria-label="Article tools examples"><a href="./article-1.html">Article one</a> · <a href="./article-2.html">Article two</a> · <a href="./bibliography.html">Site bibliography</a> · <a href="./editor-tools.html">Editor tools</a></nav></header>
<main><h1>${brandIconMarkup}<span>${title}</span></h1><hr>${body}</main></body></html>`;
  for (const [index, source] of sources.entries()) {
    const result = compileCitations(source, data, { ...fullOptions, namespace: `example-${index + 1}`, inlineTags: index === 1 ? 'marker' : false });
    await writeFile(`${directory}article-${index + 1}.html`, page(`Article ${index + 1}`, `<p>This example demonstrates repeated citations and return links shared across two articles. The references retain this article's own formatting context. Article two shows marker-local tags and a listing-only source.</p>${reader(result.html, 'article-reader')}`));
  }
  await writeFile(directory + 'bibliography.html', page('Site bibliography', `<p>Three sources are shared by two articles. Follow the lettered <strong>Cited in</strong> links to the exact passages, or inspect a reference to see <strong>Cited on this site</strong>. These links work without JavaScript.</p><h2>All topics</h2>${reader(bibliography.html, 'site-bibliography')}<h2>Both topics, selected at build time</h2><p>This list requires both Theory and Praxis.</p>${reader(buildFiltered.html, 'both-topics')}`));
  const source = `A source for an editor to identify {citation ${one} | tags:theory,praxis}.\n\n{citation endnote}`;
  await writeFile(directory + 'editor-tools.html', page('Editor tools', `<p>This offline example refreshes source-only notes. It makes no network lookups and does not save your text.</p><form id="editor-tools"><label for="editor-source">Citation source</label><textarea id="editor-source" name="source" autocomplete="off" spellcheck="false" rows="7">${escapeHTML(source)}</textarea><label for="editor-style">Citation style</label><select id="editor-style" name="style"><option value="chicago-author-date">Chicago author–date</option><option value="apa">APA</option><option value="mla">MLA</option><option value="harvard">Harvard</option><option value="vancouver">Vancouver</option></select><button type="submit">Refresh editor notes</button><label for="tag-source">Another source for tag contributions</label><textarea id="tag-source" name="tag-source" autocomplete="off" spellcheck="false" rows="3">${escapeHTML(`{citation ${one} | tags:theory}`)}</textarea><button type="button" id="collect-tags">Collect marker tags</button></form><pre id="tag-result" aria-label="Tag contribution counts"></pre><p id="editor-status" role="status"></p><pre id="editor-result" aria-label="Annotated source"></pre><details><summary>Record cache for this example</summary><pre>${escapeHTML(JSON.stringify(data, null, 2))}</pre></details>`, '<script type="module" src="./editor-tools-demo.mjs"></script>'));
  await writeFile(directory + 'editor-tools-demo.mjs', `import { annotateMarkers, collectMarkerTags } from '${assets}citation-tools.mjs';
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
`);
  await writeFile(directory + 'article-tools.json', JSON.stringify(data, null, 2) + '\n');
  await writeFile(directory + 'article-tools-demo.css', `body { margin: 1.5rem; font: 1rem/1.6 system-ui, sans-serif; color: #172848; background: #f7f9fc; } main { background: white; padding: 1.5rem; border: 1px solid #a9bad4; } header { display: flex; flex-wrap: wrap; justify-content: space-between; gap: 1rem; margin-bottom: 1rem; } h1 { display: flex; align-items: center; gap: .5rem; } h1 > svg { width: 1.6rem; height: 1.6rem; flex: none; } a { color: #214fab; } label { display: block; } textarea { box-sizing: border-box; width: 100%; font: .95rem/1.5 monospace; } select, button { font: inherit; margin: .5rem .5rem .5rem 0; padding: .35rem; } pre { white-space: pre-wrap; overflow-wrap: anywhere; } :focus-visible { outline: 2px solid #214fab; outline-offset: 3px; } @media (max-width: 450px) { body { margin: .5rem; } main { padding: .75rem; } h1 { font-size: 1.5rem; } }\n`);
  for (const [filename, path] of [['tag-book.svg', '<path d="M3 4h8v16H3zM13 4h8v16h-8z"/>'], ['tag-tool.svg', '<path d="M4 3h16v4H4zM10 7h4v14h-4z"/>']]) {
    await writeFile(directory + filename, `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">${path}</svg>\n`);
  }
  return `<section id="article-tools-preview" aria-labelledby="article-tools-title"><h2 id="article-tools-title">Across articles and editor tools</h2><p>Explore a <a href="./bibliography.html">site-wide bibliography with return links and tag filters</a>, <a href="./article-1.html">two linked articles</a>, and an <a href="./editor-tools.html">offline editor-note tool</a>.</p>${reader(bibliography.html, 'article-tools-reader')}</section>`;
}
