// Read a locally supplied metadata response; print aggregate results, never library records.
import {readFile,stat} from 'node:fs/promises';
import {fromZotero} from '../src/zotero.mjs';
import {makeCache,toCSL,canonicalIdentifierKey} from '../src/records.mjs';
import {compileCitations} from '../src/compiler.mjs';
const path=process.argv[2];if(!path)throw Error('Supply a private Zotero include=csljson response file.');
if((await stat(path)).size>12_000_000)throw Error('Metadata response exceeds the probe limit.');
const items=JSON.parse(await readFile(path,'utf8'));if(!Array.isArray(items)||items.length>300)throw Error('Supply at most 300 selected metadata items.');
const converted=items.map((item,index)=>fromZotero(item,{recordId:'probe-'+index})),diagnostics={},owners=new Map();let roles=0;
for(let i=0;i<converted.length;i++){
 const x=converted[i],raw=typeof items[i].csljson==='string'?JSON.parse(items[i].csljson):items[i].csljson,csl=Array.isArray(raw)?raw[0]:raw,round=toCSL(x.record);
 for(const d of x.diagnostics)diagnostics[d.code+':'+d.field]=(diagnostics[d.code+':'+d.field]||0)+1;
 for(const id of x.record.identifiers){const key=canonicalIdentifierKey(id);owners.set(key,[...(owners.get(key)||[]),i]);}
 for(const role of ['editor','translator'])if(csl[role]?.length){if(JSON.stringify(round[role])!==JSON.stringify(csl[role]))throw Error('Structured role changed; inspect the private source.');roles++;}
}
const renders={};for(const citationStyle of ['chicago-author-date','apa']){
 let count=0;for(const x of converted){const result=compileCitations('{cite '+x.record.id+'}',makeCache([x.record]),{citationStyle});if(items.some(item=>JSON.stringify(result).includes(item.key)))throw Error('Private item key reached compiled output.');count++;}renders[citationStyle]={individualRecordsRendered:count};
}
console.log(JSON.stringify({items:converted.length,reviewRequired:converted.filter(x=>x.requiresReview).length,diagnostics,structuredRoleArraysMatched:roles,renders,sharedIdentifierGroups:[...owners.values()].filter(x=>x.length>1).length},null,2));
