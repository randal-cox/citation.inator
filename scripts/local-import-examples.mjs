import {normalizeImportLimits} from '../src/import-limits.mjs';
// Local-only opt-in corpus manifest. Manuscripts and configuration remain gitignored.
import {readFile,realpath,stat} from 'node:fs/promises';
import {resolve,sep} from 'node:path';
export async function localImportExamples(directory=resolve('.citation-import-local'),options={}){
 const limits=normalizeImportLimits(options.limits);let raw;try{raw=JSON.parse(await readFile(resolve(directory,'examples.json'),'utf8'));}catch(error){if(error.code==='ENOENT')return [];throw error;}
 if(!Array.isArray(raw)||raw.length>20)throw Error('Use at most 20 local examples.');
 const root=await realpath(directory),result=[];
 for(const item of raw){
  if(!/^[a-z0-9-]{1,64}$/.test(item.id)||typeof item.label!=='string'||item.label.length>100||typeof item.file!=='string'||result.some(row=>row.id===item.id))throw Error('Invalid local example manifest.');
  const file=await realpath(resolve(root,item.file));if(!file.startsWith(root+sep))throw Error('Keep example files inside the local corpus directory.');
  result.push({id:item.id,label:item.label,read:async()=>{if((await stat(file)).size>limits.fileBytes)throw Error('Use a local example below '+limits.fileBytes+' bytes.');const text=new TextDecoder('utf-8',{fatal:true}).decode(await readFile(file));if(text.length>limits.sourceCharacters)throw Error('This example exceeds the current '+limits.sourceCharacters.toLocaleString('en')+'-character import limit.');return text;}});
 }
 return result;
}
