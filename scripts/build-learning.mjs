import {build} from 'esbuild';
import {mkdir,readFile,writeFile,copyFile,rm,lstat} from 'node:fs/promises';
import {learningMarkdown} from './learning-markdown.mjs';
import {checkLearning} from './check-learning.mjs';
import {learningStarter,npmLearningStarter} from './learning-starter.mjs';
import {lessons} from '../learn/lessons.mjs';
import {brandIconMarkup} from '../src/icons.mjs';
import {compileMarkdown} from '../src/markup.mjs';
import {compileCitations,escapeHTML} from '../src/compiler.mjs';
import {createSiteOccurrenceIndex} from '../src/reference-features.mjs';
import {learningRecords} from '../learn/example-records.mjs';
import {createHash} from 'node:crypto';
import {execFileSync} from 'node:child_process';
import {describeCitation} from '../src/tools.mjs';
import {zipSync} from 'fflate';
await rm('site',{recursive:true,force:true});
await mkdir('site/assets',{recursive:true});
for(const file of ['index.html','learning.css'])await copyFile(`learn/${file}`,`site/${file}`);
for(const file of ['citation-library.mjs','citation-inspector.mjs','citation-inspector.css','citation-compiler.mjs','citation-tools.mjs','citation-import.mjs','citation-import-files.mjs','citation-pdf.worker.mjs','LICENSE','THIRD_PARTY_LICENSES.txt'])await copyFile(`dist/${file}`,`site/assets/${file}`);
await copyFile('demos/static/tag-book.svg','site/assets/book.svg');
const {version}=JSON.parse(await readFile('package.json','utf8'));
const sourceRef=execFileSync('git',['rev-parse','HEAD'],{encoding:'utf8'}).trim();
const uncommittedChanges=Boolean(execFileSync('git',['status','--porcelain','--untracked-files=no'],{encoding:'utf8'}).trim());
await writeFile('site/version.json',JSON.stringify({version}));
await writeFile('site/BUILD.json',JSON.stringify({version,sourceRef,uncommittedChanges,privateCorpusIncluded:false},null,2));
await copyFile('node_modules/dompurify/LICENSE','site/assets/LEARNING_THIRD_PARTY.txt');
const records=learningRecords(JSON.parse(await readFile('fixtures/notation-records.json','utf8')));
const cache={schema:'citation-inator.cache.v1',records};
const articles=[
  {id:'article-one',label:'Article one',source:'A sourced claim {cite ioannidis-2005}. A second mention returns separately {cite ioannidis-2005}.\n\n{cite endnote}'},
  {id:'article-two',label:'Article two',source:'Another article uses the same work {cite ioannidis-2005}. This book is included without an in-text claim {cite nocite durkheim-1995-fields}.\n\n{cite endnote}'}
].map(article=>({...article,result:compileMarkdown(article.source,cache,{namespace:'learning-'+article.id,citationStyle:'chicago-author-date'})}));
const siteOccurrences=createSiteOccurrenceIndex(articles.map(article=>({href:'./examples/'+article.id+'.html',label:article.label,occurrences:article.result.occurrences})));
await writeFile('site/records.json',JSON.stringify({...cache,siteOccurrences}));
await mkdir('site/examples',{recursive:true});
await writeFile('site/examples/reader.mjs',`import {initializeCitationInspector} from '../assets/citation-inspector.mjs';\nconst data=await fetch('../records.json').then(r=>r.json());\ninitializeCitationInspector(document.querySelector('citation-inspector'),{cache:{schema:'citation-inator.cache.v1',records:data.records},accessStorageKey:'citation-inator-learning-access'});`);
for(const article of articles)await writeFile('site/examples/'+article.id+'.html',`<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${article.label} · cite.inator</title><link rel="stylesheet" href="../learning.css"><link rel="stylesheet" href="../assets/citation-inspector.css"></head><body><header><a class="brand" href="../">${brandIconMarkup}cite.inator</a><nav aria-label="Examples"><a href="./article-one.html">Article one</a><a href="./article-two.html">Article two</a><a href="../?example=site">Bibliography</a><a href="../guide.html">Guide</a></nav></header><main><h1>${article.label}</h1><citation-inspector>${article.result.html}</citation-inspector><details><summary>Source</summary><pre>${escapeHTML(article.source)}</pre></details></main><script type="module" src="./reader.mjs"></script></body></html>`);
const starter={version,sourceRef,source:lessons[0].source,records:{schema:'citation-inator.cache.v1',records:records.filter(record=>record.id==='ioannidis-2005')},options:{namespace:'starter',citationStyle:'chicago-author-date',activation:'hover'}};
await writeFile('site/citation-starter.zip',await learningStarter(starter));
await writeFile('site/citation-npm-starter.zip',await npmLearningStarter(starter));
const guide = learningMarkdown(await readFile('learn/guide.md','utf8'));
await writeFile('site/guide.html',`<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>Guide · cite.inator</title><link rel="stylesheet" href="./learning.css"></head><body><header><a class="brand" href="./">${brandIconMarkup}cite.inator</a><nav aria-label="Learning"><a href="./">Playground</a><a href="https://github.com/randal-cox/cite.inator">GitHub</a></nav></header><main class="guide">${guide}</main></body></html>`);
await build({entryPoints:['learn/learning.mjs'],outfile:'site/learning.mjs',bundle:true,format:'esm',platform:'browser',target:'es2022',external:['./assets/citation-inspector.mjs'],legalComments:'eof'});
await mkdir('site/import',{recursive:true});
for(const file of ['bibliography.html','bibliography.css'])await copyFile('learn/'+file,'site/import/'+file);
await build({entryPoints:['learn/bibliography.mjs'],outfile:'site/import/bibliography.mjs',bundle:true,format:'esm',platform:'browser',target:'es2022',legalComments:'eof'});
const bibliographyExample=JSON.parse((await import('../src/bibliography-export.mjs')).exportBibliography({schema:cache.schema,records:records.filter(r=>['ioannidis-2005','durkheim-1995-fields'].includes(r.id)).map(r=>r.id==='durkheim-1995-fields'?{...r,translators:[{given:'Karen E.',family:'Fields'}],originalIssued:[1912]}:r)}).text);
await writeFile('site/import/sample-bibliography.json',JSON.stringify(bibliographyExample,null,2));
await mkdir('site/documents',{recursive:true});
const documentManifest=[];
for(const extension of ['md','txt','pdf','docx','odt']){
  const name='sample.'+extension,bytes=await readFile('learn/documents/'+name);
  await writeFile('site/documents/'+name,bytes);
  documentManifest.push({name,bytes:bytes.length,sha256:createHash('sha256').update(bytes).digest('hex')});
}
await writeFile('site/documents/manifest.json',JSON.stringify({source:'sample.md',author:'Randal Cox',license:'MIT for the example prose and files; bibliographic metadata identifies the cited work.',files:documentManifest},null,2));
for(const file of ['document-examples.mjs','enrichment-browser.mjs','identity-state.mjs','import-demo.css','import-demo.mjs','review-labels.mjs','review-progress.mjs','review-window.mjs','text-source.mjs','provider-fixtures.mjs']){
  const content=(await readFile('demos/import/'+file,'utf8')).replaceAll('../../dist/','../assets/');
  if(file==='import-demo.css'){
    // The learning shell stays light; the standalone import host retains its dark theme.
    let css=content,start;
    while((start=css.search(/@media\s*\(\s*prefers-color-scheme\s*:\s*dark\s*\)/))>=0){let end=css.indexOf('{',start),depth=1;while(depth&&++end<css.length){if(css[end]==='{')depth++;else if(css[end]==='}')depth--;}css=css.slice(0,start)+css.slice(end+1);}
    await writeFile('site/import/'+file,css);
  }else await writeFile('site/import/'+file,content);
}
let importHTML=(await readFile('demos/import/index.html','utf8')).replaceAll('../../dist/','../assets/');
importHTML=importHTML.replace(/<header>[\s\S]*?<\/header>/,`<header><a href="../">cite.inator</a><nav aria-label="Learning"><a href="../">Playground</a><a href="../guide.html">Guide</a></nav></header>`).replaceAll('../../docs/citation-styles.md','../guide.html').replaceAll('../../docs/import-demo.md','../guide.html');
for(const mode of ['saved','live']){
  const config={processing:'browser',localExamples:false,...(mode==='saved'?{providerResponses:'./provider-responses.json'}:{})};
  const label=mode==='saved'?'Saved lookups for the examples':'Live lookups send reference details to Crossref and Open Library';
  const other=mode==='saved'?'<a href="./live.html" target="_blank" rel="noopener">Look up my document ↗</a>':'<a href="./" target="_blank" rel="noopener">Saved examples ↗</a>';
  let html=importHTML.replace('<main>','<main><nav class="local-navigation" aria-label="Import"><a href="./" aria-current="page">Document</a><a href="./bibliography.html">Bibliography</a></nav>').replace('id="citation-import-config">{}','id="citation-import-config">'+JSON.stringify(config)).replace('<main>','<main><p class="lookup-mode">'+label+' · '+other+'</p>');
  if(mode==='saved')html=html.replace('Books: ISBN edition choices','Books: finish without an ISBN').replace('Real references: DOIs omitted','Real references: partial saved metadata');
  await writeFile('site/import/'+(mode==='saved'?'index':'live')+'.html',html);
}
const fixtureRecords=records.filter(record=>record.id.startsWith('einstein-')||record.id==='ioannidis-2005');
fixtureRecords.push({id:'planck-1901',title:'Ueber das Gesetz der Energieverteilung im Normalspectrum',authors:[{family:'Planck',given:'Max'}],issued:[1901],containerTitle:'Annalen der Physik',volume:'309',issue:'3',pages:'553–563',identifiers:[{scheme:'doi',value:'10.1002/andp.19013090310'}]});
await writeFile('site/import/provider-responses.json',JSON.stringify({purpose:'Fixed example metadata envelopes derived from the public example references, not recorded live search responses or an accuracy benchmark.',works:fixtureRecords.map(record=>({DOI:record.identifiers.find(id=>id.scheme==='doi').value,type:'journal-article',title:[record.title],author:record.authors,'published-print':{'date-parts':[record.issued]},'container-title':[record.containerTitle],volume:record.volume,issue:record.issue,page:record.pages}))},null,2));
await mkdir('site/tools',{recursive:true});
for(const file of ['article-1.html','article-2.html','bibliography.html','editor-tools.html','article-tools-demo.css','article-tools.json','editor-tools-demo.mjs','tag-book.svg','tag-tool.svg']){
  let content=(await readFile('demos/static/'+file,'utf8')).replaceAll('../../dist/','../assets/');
  if(file.endsWith('.html'))content=content.replace('<a href="./">Reading room</a>','<a href="../">Playground</a>').replace('</head>','<script type="module" src="./learning-scope.mjs"></script></head>');
  await writeFile('site/tools/'+file,content);
}
await writeFile('site/tools/learning-scope.mjs',`import {initializeCitationInspector} from '../assets/citation-inspector.mjs';\nfor(const element of document.querySelectorAll('citation-inspector'))initializeCitationInspector(element,{accessStorageKey:'citation-inator-learning-access'});`);
const referenceNames=['corpus-review-0.6','library-maintenance','zotero','authoring','integration','article-tools','reader-access','media-support','citation-styles','import-api','import-demo','i18n','draft-integration','naming-migration','notation-migration'];
const page=(title,body)=>`<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${escapeHTML(title)} · cite.inator</title><link rel="stylesheet" href="../learning.css"></head><body><header><a class="brand" href="../">${brandIconMarkup}cite.inator</a><nav aria-label="Learning"><a href="../tutorials.html">Tutorials</a><a href="../import/">Import</a><a href="../guide.html">Guide</a></nav></header><main class="guide">${body}</main><footer>cite.inator ${version} · <a href="https://github.com/randal-cox/cite.inator/tree/${sourceRef}">Source</a></footer></body></html>`;
await mkdir('site/reference',{recursive:true});
for(const name of referenceNames){
  const content=learningMarkdown(await readFile('docs/'+name+'.md','utf8')).replace(/href="([^"#]+)(#[^"]*)?"/g,(match,href,hash='')=>{
    if(/^(?:https?:|mailto:)/.test(href))return match;
    const local=href.replace(/\.md$/,'');
    if(referenceNames.includes(local))return `href="./${local}.html${hash}"`;
    const path=new URL(href,'https://source.invalid/docs/'+name+'.md').pathname.slice(1);
    return `href="https://github.com/randal-cox/cite.inator/blob/${sourceRef}/${path}${hash}"`;
  });
  await writeFile('site/reference/'+name+'.html',page(name,content));
}
const tutorialHTML=`<h2>Worked examples</h2><p>Start with a DOI or ISBN marker, then explore formatting, reading lists and other source types.</p><ul>${lessons.map(lesson=>`<li><a href="#${lesson.id}">${escapeHTML(lesson.title)}</a></li>`).join('')}</ul>`+lessons.map(lesson=>`<section id="${lesson.id}"><h2>${escapeHTML(lesson.title)}</h2>${learningMarkdown(lesson.text)}<p><a href="./?example=${lesson.id}">Open working example</a></p><pre><code>${escapeHTML(lesson.source)}</code></pre>${Object.keys(lesson.options).length?`<h3>Configuration</h3><pre><code>${escapeHTML(JSON.stringify(lesson.options,null,2))}</code></pre>`:''}</section>`).join('')+`<h2 id="api-reference">API reference</h2><ul>${referenceNames.map(name=>`<li><a href="./reference/${name}.html">${name.replaceAll('-',' ')}</a></li>`).join('')}</ul><p><a href="./tools/editor-tools.html">Try the editor-note and tag tools</a> · <a href="./tools/bibliography.html">Try the shared bibliography</a></p>`;
const combinedGuide=await readFile('site/guide.html','utf8');
await writeFile('site/guide.html',combinedGuide.replace('</main>',`<section id="examples">${tutorialHTML}</section></main>`));
const overviewSnippets=[
 ['Citation','A claim {cite doi:10.1371/journal.pmed.0020124}.\n\n{cite endnote}'],
 ['JavaScript',`import {compileMarkdown} from './citation-compiler.mjs';
import {initializeCitationInspector} from './citation-inspector.mjs';

const [source,cache]=await Promise.all([
  fetch('./article.md').then(response=>response.text()),
  fetch('./citations.json').then(response=>response.json())
]);
const options={citationStyle:'chicago-author-date',activation:'hover'};
const result=compileMarkdown(source,cache,options);
const article=document.querySelector('#article');
article.innerHTML=result.html; // Trusted authored content.
initializeCitationInspector(article,{...options,cache:result.cache});`],
 ['HTML',`<link rel="stylesheet" href="./citation-inspector.css">
<citation-inspector id="article"></citation-inspector>
<script type="module" src="./article.mjs"></script>`]
];
const overviewExample=`<section class="overview-code" data-example-tabs><div role="tablist" aria-label="Minimal citation example">${overviewSnippets.map(([label],index)=>`<button type="button" role="tab" id="example-tab-${index}" aria-controls="example-panel-${index}" aria-selected="${index===0}" tabindex="${index===0?0:-1}">${label}</button>`).join('')}</div>${overviewSnippets.map(([,code],index)=>`<div role="tabpanel" id="example-panel-${index}" aria-labelledby="example-tab-${index}"${index===0?'':' hidden'}><pre tabindex="0"><code>${escapeHTML(code)}</code></pre></div>`).join('')}</section>`;
await copyFile('learn/about.mjs','site/about.mjs');
await writeFile('site/about.html',page('About cite.inator',learningMarkdown(await readFile('learn/about.md','utf8'))).replaceAll('href="../','href="./').replace('class="guide"','class="guide overview"').replace('<div id="overview-example"></div>',overviewExample).replace('</body>','<script type="module" src="./about.mjs"></script></body>'));
await writeFile('site/tutorials.html',`<!doctype html><html lang="en"><head><meta charset="utf-8"><meta http-equiv="refresh" content="0;url=./guide.html#examples"><title>Guide · cite.inator</title></head><body><a href="./guide.html#examples">Open the Guide</a></body></html>`);
await mkdir('site/host',{recursive:true});
for(const file of ['editor.js','importer.js','forms.js','citation.js','editor.css','frontmatter.js','details.js','yaml.js','picker.js','SOURCE.json'])await copyFile('learn/vendor/draft-inator/'+file,'site/host/'+file);
await copyFile('learn/vendor/draft-inator/LICENSE','site/host/DRAFT_LICENSE.txt');
for(const file of ['index.html','host.css','article.md','bootstrap.mjs'])await copyFile('learn/host/'+file,'site/host/'+file);
await copyFile('learn/host/integration.mjs','site/host/integration-source.mjs');
const hostCache={schema:'citation-inator.cache.v1',records:[records.find(record=>record.id==='ioannidis-2005'),{id:'bell-1992-ritual',type:'book',state:'resolved',title:'Ritual Theory, Ritual Practice',authors:[{family:'Bell',given:'Catherine'}],issued:[1992],publisher:'Oxford University Press'}]};
await writeFile('site/host/citations.json',JSON.stringify(hostCache,null,2));
await writeFile('site/host/works.js','window.DRAFT_WORKS='+JSON.stringify(hostCache.records.map(record=>({id:record.id,title:record.title,note:describeCitation(record.id,hostCache,{citationStyle:'chicago-author-date'}).text,year:record.issued?.[0]})))+';\nwindow.DRAFT_TOPICS=[];\n');
await build({entryPoints:['learn/host/integration.mjs'],outfile:'site/host/integration.mjs',bundle:true,format:'esm',platform:'browser',target:'es2022',external:['./editor.js','../assets/*'],legalComments:'eof'});
await writeFile('site/host/recipe.html',page('Editor integration',learningMarkdown(await readFile('learn/host/recipe.md','utf8'))));
await writeFile('site/notation.html',page('Complete notation',learningMarkdown(await readFile('learn/notation.md','utf8'))).replaceAll('href="../','href="./'));
await copyFile('scripts/static-server.mjs','site/server.mjs');
await writeFile('site/package.json',JSON.stringify({name:'citation-learning-site',private:true,type:'module',version,scripts:{start:'node server.mjs'},engines:{node:'>=22.13.0'}},null,2));
await writeFile('site/README.md',`# cite.inator learning site — ${version}\n\nRun npm start (no install required), or node server.mjs, then open http://127.0.0.1:4188/. Node 22.13.0 or later is required. Any static HTTP server also works. Use HTTP, not file://.\n\nCore compilation, saved import metadata, native sample files and the pinned draft editor run locally. Live lookup is a separate page which sends bibliographic details to Crossref/Open Library. Bibliography review offers explicit local browser storage and working-copy downloads; online source checks require permission. No authenticated host or document-storage backend is configured.\n\nLibrary notices are in assets/. DOMPurify's license is assets/LEARNING_THIRD_PARTY.txt. The pinned draft editor's MIT license and source manifest are in host/. The public document samples have attribution/checksums in documents/manifest.json. The npm starter contains its own pinned library tarball; npm install is needed only inside that extracted starter.\n`);
const downloadFiles={},routes=JSON.parse(await readFile('learn/generated-routes.json','utf8'));
const creditMarkup=compileCitations('{cite credit}',{schema:'citation-inator.cache.v1',records:[]},{namespace:'learning-footer',strings:{'ui.credit':'How to cite'}}).html;
const commonFooter=`<footer class="learning-credit"><div>Randal Cox · <a href="https://orcid.org/0009-0002-3427-7190">ORCID</a></div><div class="footer-links"><a href="https://github.com/randal-cox/cite.inator/blob/main/LICENSE">MIT license</a><citation-inspector data-learning-credit>${creditMarkup}</citation-inspector></div></footer>`;
await copyFile('learn/footer.mjs','site/assets/learning-footer.mjs');
// One navigation shell across every learning route; local links remain in the body.
for(const route of routes.filter(path=>path.endsWith('.html'))){
 const prefix=route.includes('/')?'../':'./';
 const header=`<header><a class="brand" href="${prefix}about.html">${brandIconMarkup}cite.inator</a><nav aria-label="Learning"><a href="${prefix}">Playground</a><a href="${prefix}import/">Import</a><a href="${prefix}guide.html">Guide</a></nav><a class="github-link" href="https://github.com/randal-cox/cite.inator"><span>GitHub</span><span id="version">${version}</span></a></header>`;
 let html=await readFile('site/'+route,'utf8');
 if(html.includes('<header>'))html=html.replace(/<header>[\s\S]*?<\/header>/,header);else html=html.replace(/(<body[^>]*>)/,'$1'+header);
 if(route==='host/index.html'){const upstream=html.match(/<footer[^>]*>([\s\S]*?)<\/footer>/)?.[1];if(upstream)html=html.replace('</main>',`<aside class="upstream-credit">${upstream}</aside></main>`);}
 html=html.replace(/<footer[^>]*>[\s\S]*?<\/footer>/g,'');
 html=html.replace('</body>',`${commonFooter}<script type="module" src="${prefix}assets/learning-footer.mjs"></script></body>`);
 if(!html.includes('href="'+prefix+'assets/citation-inspector.css"'))html=html.replace('</head>',`<link rel="stylesheet" href="${prefix}assets/citation-inspector.css"></head>`);
 if(!html.includes('href="'+prefix+'learning.css"'))html=html.replace('</head>',`<link rel="stylesheet" href="${prefix}learning.css"></head>`);
 if(route.startsWith('tools/')&&route.endsWith('.html'))html=html.replace('<main>','<main><nav class="local-navigation" aria-label="Bibliography examples"><a href="./article-1.html">Article one</a><a href="./article-2.html">Article two</a><a href="./bibliography.html">Shared bibliography</a><a href="./editor-tools.html">Editor tools</a></nav>');
 if(route.startsWith('examples/'))html=html.replace('<main>','<main><nav class="local-navigation" aria-label="Article examples"><a href="./article-one.html">Article one</a><a href="./article-two.html">Article two</a><a href="../?example=site">Shared bibliography</a></nav>');
 html=html.replace(/<body([^>]*)>/,(_,attrs)=>attrs.includes('class=')?'<body'+attrs.replace(/class="([^"]*)"/,'class="$1 learning-site"')+'>':'<body'+attrs+' class="learning-site">');
 // The playground initializes the existing shared brand, not a second icon.
 if(route==='index.html')html=html.replace('class="brand"','class="brand" id="brand"');
 await writeFile('site/'+route,html);
}
if(!Array.isArray(routes)||new Set(routes).size!==routes.length||!routes.every(path=>typeof path==='string'&&/^[a-zA-Z0-9_-][a-zA-Z0-9_.-]*(?:\/[a-zA-Z0-9_-][a-zA-Z0-9_.-]*)*$/.test(path)))throw new Error('Public learning routes must be unique safe relative filenames.');
for(const path of routes.filter(path=>path!=='citation-learning-site.zip')){
  if(!(await lstat('site/'+path)).isFile())throw new Error('Learning downloads require regular files: '+path);
  downloadFiles['citation-learning/'+path]=new Uint8Array(await readFile('site/'+path));
}
await writeFile('site/citation-learning-site.zip',zipSync(downloadFiles,{level:6}));
console.log('Learning build',await checkLearning());
