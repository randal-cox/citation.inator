import {readFile} from 'node:fs/promises';
import {zipSync,strToU8} from 'fflate';

export async function learningStarter({version,source,records,options={}}){
  const files={};
  const add=(name,text)=>files['citation-starter/'+name]=strToU8(text);
  for(const file of ['citation-compiler.mjs','citation-inspector.mjs','citation-inspector.css','LICENSE','THIRD_PARTY_LICENSES.txt'])files['citation-starter/'+file]=new Uint8Array(await readFile('dist/'+file));
  add('article.md',source);add('citations.json',JSON.stringify(records,null,2));add('configuration.json',JSON.stringify(options,null,2));
  add('index.html','<!doctype html><html lang="en"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Citation example</title><link rel="stylesheet" href="./citation-inspector.css"><body><citation-inspector id="article"></citation-inspector><script type="module" src="./article.mjs"></script></body></html>');
  add('article.mjs',`import {compileMarkdown} from './citation-compiler.mjs';
import {initializeCitationInspector} from './citation-inspector.mjs';
const [source,cache,options]=await Promise.all([
  fetch('./article.md').then(r=>r.text()),
  fetch('./citations.json').then(r=>r.json()),
  fetch('./configuration.json').then(r=>r.json())
]);
const result=compileMarkdown(source,cache,options);
const element=document.querySelector('#article');
// Use trusted authored content here; sanitize untrusted HTML before insertion.
element.innerHTML=result.html;
initializeCitationInspector(element,{...options,cache:result.cache});
`);
  files['citation-starter/server.mjs']=new Uint8Array(await readFile('scripts/static-server.mjs'));
  add('package.json',JSON.stringify({name:'citation-starter',private:true,type:'module',version:'1.0.0',scripts:{start:'node server.mjs'},engines:{node:'>=22.13.0'}},null,2));
  add('README.md',`# Citation starter — ${version}

Run \`npm start\`, then open http://127.0.0.1:4188/. No install is required.
Without npm, run \`node server.mjs\` (Node 22.13.0 or later). Any static HTTP server also works; opening index.html through file:// does not.

The HTML loads citation-inspector.css, creates a citation-inspector element and loads article.mjs. That module imports the compiler and inspector, compiles article.md with citations.json/configuration.json, inserts trusted authored output and initializes the reader panel with the returned cache.

Edit article.md, citations.json and configuration.json, then reload. Keep local IDs and the cache together. This copied-file starter uses bundled browser assets, not an npm registry dependency. For npm build integration, see https://github.com/randal-cox/citation.inator/blob/v${version}/README.md .

Only use trusted authored HTML with this starter's direct insertion. A public editing host must sanitize compiled HTML before inserting it. The learning playground demonstrates that boundary with DOMPurify.

Library license and dependency notices are included. Source metadata remains attributable to its listed providers. No metadata lookups, analytics or document uploads occur in this starter.
`);
  return zipSync(files,{level:6});
}
