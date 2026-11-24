import {readFile,readdir} from 'node:fs/promises';
import {resolve,join,relative} from 'node:path';
import {pathToFileURL,fileURLToPath} from 'node:url';
import {parse} from 'parse5';

export async function checkLearning(root=resolve('site')){
  const files=new Set(),documents=new Map(),errors=[];
  async function collect(directory){for(const item of await readdir(directory,{withFileTypes:true})){const path=join(directory,item.name);if(item.isDirectory())await collect(path);else if(item.isFile())files.add(path);else errors.push('Non-regular learning output: '+path);}}
  await collect(root);
  const declared=JSON.parse(await readFile(new URL('../learn/generated-routes.json',import.meta.url),'utf8'));
  if(!Array.isArray(declared)||new Set(declared).size!==declared.length||!declared.every(path=>typeof path==='string'&&/^[a-zA-Z0-9_-][a-zA-Z0-9_.-]*(?:\/[a-zA-Z0-9_-][a-zA-Z0-9_.-]*)*$/.test(path)))throw new Error('Public learning routes must be unique safe relative filenames.');
  const allowed=new Set(declared);
  for(const path of declared)if(!files.has(join(root,path)))errors.push('Declared public route missing: '+path);
  for(const path of files)if(!allowed.has(relative(root,path)))errors.push('Unexpected learning output: '+relative(root,path));
  for(const file of [...files].filter(file=>file.endsWith('.html'))){
    const doc=parse(await readFile(file,'utf8')),ids=new Set(),links=[];
    function walk(node){for(const attr of node.attrs||[]){if(attr.name==='id')ids.add(attr.value);if(['href','src'].includes(attr.name)&&!/^(?:[a-z]+:|\/\/)/i.test(attr.value))links.push(attr.value);}for(const child of node.childNodes||[])walk(child);}
    walk(doc);documents.set(file,{ids,links});
  }
  for(const [file,{links}] of documents)for(const link of links){
    const url=new URL(link,pathToFileURL(file));let target=fileURLToPath(url);
    if(url.pathname.endsWith('/'))target=join(target,'index.html');
    if(!files.has(target)){errors.push(`${file.slice(root.length+1)}: missing ${link}`);continue;}
    if(url.hash&&documents.has(target)&&!documents.get(target).ids.has(decodeURIComponent(url.hash.slice(1))))errors.push(`${file.slice(root.length+1)}: missing anchor ${link}`);
  }
  if(errors.length)throw new Error(errors.join('\n'));
  return {files:files.size,documents:documents.size};
}
if(process.argv[1]&&import.meta.url===pathToFileURL(resolve(process.argv[1])).href)console.log('Learning links PASS',await checkLearning());
