import {makeCache,httpsURL} from '../src/records.mjs';
import {normalizeImportLimits} from '../src/import-limits.mjs';
const limits=normalizeImportLimits();
export const WORKSPACE_SCHEMA='cite-inator.bibliography-workspace.v1';
export function validateWorkingCopy(value){
 if(value?.schema!==WORKSPACE_SCHEMA||value.cache?.schema!=='citation-inator.cache.v1'||!Array.isArray(value.cache.records)||value.cache.records.length>limits.references)throw Error('Choose a supported bibliography working copy.');
 const encoded=JSON.stringify(value);if(new TextEncoder().encode(encoded).length>limits.requestBytes)throw Error('The working copy exceeds the 12 MB limit.');
 const cache=makeCache(value.cache.records);
 for(const r of cache.records)if(JSON.stringify(r).length>limits.recordCharacters||r.title.length>limits.titleCharacters||[r.authors,r.editors||[],r.translators||[]].some(a=>a.length>limits.authorsPerRecord))throw Error('A saved reference exceeds the size limit.');
 const observations=[],ids=new Set(cache.records.map(r=>r.id)),seen=new Set();let checks=0;
 if(value.observations!==undefined&&!Array.isArray(value.observations))throw Error('The saved source-check history is damaged.');
 for(const pair of value.observations||[]){
  if(!Array.isArray(pair)||pair.length!==2||typeof pair[0]!=='string'||!Array.isArray(pair[1])||seen.has(pair[0]))throw Error('The saved source-check history is damaged.');
  seen.add(pair[0]);if(!ids.has(pair[0]))continue;const safe=[];
  for(const item of pair[1]){
   if(++checks>limits.candidateChoices||!item||!['reachable','redirect','not-found','restricted','rate-limited','head-unsupported','indeterminate'].includes(item.state)||!httpsURL(item.url)||item.url.length>2048||!Number.isFinite(Date.parse(item.checkedAt))||item.method!=='HEAD'||!/^[a-f0-9]{64}$/.test(item.recordHash||'')||item.recordId!==pair[0])throw Error('The saved source-check history is damaged.');
   safe.push({recordId:item.recordId,recordHash:item.recordHash,url:httpsURL(item.url),checkedAt:new Date(item.checkedAt).toISOString(),method:'HEAD',state:item.state,...(Number.isInteger(item.status)&&item.status>=0&&item.status<=599&&{status:item.status}),...(httpsURL(item.redirectURL)&&{redirectURL:httpsURL(item.redirectURL)}),...(['cancelled','timeout','transport-error'].includes(item.reason)&&{reason:item.reason})});
  }
  observations.push([pair[0],safe]);
 }
 const result={schema:WORKSPACE_SCHEMA,cache,selectedId:ids.has(value.selectedId)?value.selectedId:cache.records[0]?.id||'',observations};if(new TextEncoder().encode(JSON.stringify(result)).length>limits.requestBytes)throw Error('The working copy exceeds the 12 MB limit.');return result;
}
export function serializeWorkingCopy(value){return JSON.stringify(validateWorkingCopy(value));}
