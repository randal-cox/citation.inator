import {readFile,writeFile,copyFile} from 'node:fs/promises';
import {compileMarkdown} from 'cite-inator/markup';
const source=await readFile('article.md','utf8');
const cache=JSON.parse(await readFile('citations.json','utf8'));
const options=JSON.parse(await readFile('configuration.json','utf8'));
const result=compileMarkdown(source,cache,options);
console.table(result.diagnostics);
// Build trusted authored source. Sanitize untrusted HTML before insertion.
const template=await readFile('template.html','utf8');
await writeFile('index.html',template.replace('<!--citation-fragment-->',result.html));
await writeFile('compiled-citations.json',JSON.stringify(result.cache,null,2));
for(const name of ['citation-inspector.mjs','citation-inspector.css','LICENSE','THIRD_PARTY_LICENSES.txt'])await copyFile('node_modules/cite-inator/dist/'+name,name);
console.log('Built index.html and its reference cache.');
