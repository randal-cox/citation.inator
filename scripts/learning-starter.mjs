import {readFile} from 'node:fs/promises';
import {zipSync,strToU8} from 'fflate';
import {mkdtemp,mkdir,writeFile,rm,lstat} from 'node:fs/promises';
import {execFileSync} from 'node:child_process';
import {tmpdir} from 'node:os';
import {join,dirname} from 'node:path';

export async function learningStarter({version,sourceRef,source,records,options={}}){
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

Edit article.md, citations.json and configuration.json, then reload. Keep local IDs and the cache together. This copied-file starter uses bundled browser assets, not an npm registry dependency. For npm build integration, see https://github.com/randal-cox/citation.inator/blob/${sourceRef}/README.md .

Only use trusted authored HTML with this starter's direct insertion. A public editing host must sanitize compiled HTML before inserting it. The learning playground demonstrates that boundary with DOMPurify.

Library license and dependency notices are included. Source metadata remains attributable to its listed providers. No metadata lookups, analytics or document uploads occur in this starter.
`);
  return zipSync(files,{level:6});
}

export async function npmLearningStarter({version,source,records,options={}}){
  const directory=await mkdtemp(join(tmpdir(),'citation-public-npm-'));
  try{
    const pkg=JSON.parse(await readFile('package.json','utf8'));
    const tracked=execFileSync('git',['ls-files','-z'],{encoding:'utf8'}).split('\0').filter(Boolean);
    const included=file=>['package.json','README.md','LICENSE'].includes(file)||pkg.files.some(path=>file===path||file.startsWith(path+'/'));
    for(const file of tracked.filter(included)){
      if(!(await lstat(file)).isFile())throw new Error('Npm starter sources require regular tracked files: '+file);
      const destination=join(directory,file);
      await mkdir(dirname(destination),{recursive:true});
      await writeFile(destination,await readFile(file));
    }
    const output=JSON.parse(execFileSync('npm',['pack','--ignore-scripts','--json'],{cwd:directory,encoding:'utf8',timeout:30000,env:{...process.env,npm_config_cache:join(tmpdir(),'citation-learning-pack-cache')}}));
    const tarball=output[0].filename;
    if(tarball!==`citation-inator-${version}.tgz`)throw new Error('Starter library version differs from the learning site.');
    const files={},add=(name,text)=>files['citation-npm-starter/'+name]=strToU8(text);
    files['citation-npm-starter/'+tarball]=new Uint8Array(await readFile(join(directory,tarball)));
    add('package.json',JSON.stringify({name:'citation-npm-starter',private:true,type:'module',version:'1.0.0',engines:{node:'>=22.13.0'},scripts:{build:'node build.mjs',prestart:'npm run build',start:'node server.mjs'},dependencies:{'citation-inator':'file:./'+tarball}},null,2));
    for(const [destination,path] of Object.entries({'build.mjs':'learn/starters/npm-build.mjs','article.mjs':'learn/starters/npm-browser.mjs','template.html':'learn/starters/npm-index.html','server.mjs':'scripts/static-server.mjs'}))files['citation-npm-starter/'+destination]=new Uint8Array(await readFile(path));
    add('article.md',source);add('citations.json',JSON.stringify(records,null,2));add('configuration.json',JSON.stringify(options,null,2));
    add('README.md',`# npm citation starter — ${version}

Run \`npm install\`, then \`npm start\`. Open http://127.0.0.1:4188/.

The library tarball is included and pinned by filename; no npm registry publication of citation.inator is assumed. npm installs its dependencies and creates your lockfile. Node 22.13.0 or later is required.

Edit article.md, citations.json and configuration.json, then run \`npm run build\`. The build imports compileMarkdown from citation-inator/markup and writes static index.html plus its compiled cache. article.mjs initializes the reader using the matching prebuilt browser assets. npm start builds first and serves the folder; no server-side compiler endpoint or provider account is needed.

The generated HTML is readable without JavaScript. Keep local-ID markers with their cache. Only build trusted authored HTML using this example's direct insertion; a public editing host must sanitize its compiled output. License and notices are copied from the installed library during build.
`);
    return zipSync(files,{level:6});
  }finally{await rm(directory,{recursive:true,force:true});}
}
