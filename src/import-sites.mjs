import {makeCache,normalizeIdentifier,canonicalIdentifierKey} from './records.mjs';
import {assessImportCandidate} from './import-enrichment.mjs';

// Site identities are proposals. Reusing one always requires a source-record decision.
export function importSiteContext(records,siteCache,limits){
 if(siteCache===undefined)return {records:[],matches:[]};
 if(siteCache?.schema!=='citation-inator.cache.v1'||!Array.isArray(siteCache.records)||siteCache.records.length>limits.references)throw TypeError('Supply a bounded site citation cache.');
 if(siteCache.records.some(record=>JSON.stringify(record).length>limits.recordCharacters))throw TypeError('Use shorter site reference records.');
 const site=makeCache(siteCache.records).records;
 if(site.some(record=>record.title.length>limits.titleCharacters||record.authors.length>limits.authorsPerRecord))throw TypeError('Use shorter site reference fields.');
 let count=0;
 const matches=records.map(source=>({recordId:source.id,candidates:site.flatMap(record=>{
  const assessment=assessImportCandidate(source,record),keys=new Set((source.identifiers || []).map(canonicalIdentifierKey));
  const identifiers=record.identifiers.filter(id=>keys.has(canonicalIdentifierKey(id))).map(canonicalIdentifierKey);
  if(!identifiers.length&&!assessment.primary)return [];
  if(++count>limits.candidateChoices)throw RangeError('Too many site identity choices. Use a smaller site cache.');
  return [{recordId:record.id,title:record.title,requiresReview:true,evidence:{code:identifiers.length?'import-site-shared-identifier':'import-site-bibliographic-candidate',sharedIdentifierCount:identifiers.length,assessment}}];
 })}));
 return {records:site,matches};
}

export function allocateImportRecords(records,site,{recordDecisions=[],recordIds,recordId}={}){
 if(!Array.isArray(recordDecisions)||recordDecisions.length>records.length)throw TypeError('Supply one site identity decision per source record.');
 if(recordId!==undefined&&typeof recordId!=='function')throw TypeError('recordId must be an allocator function.');
 if(recordIds!==undefined&&(!recordIds||typeof recordIds!=='object'||Array.isArray(recordIds)))throw TypeError('Supply a recordIds object.');
 if(recordIds!==undefined&&recordId!==undefined)throw TypeError('Choose recordIds or recordId.');
 const reused=new Map(),sourceIds=new Set(records.map(record=>record.id));
 if(sourceIds.size!==records.length)throw TypeError('Source and completion record IDs must be distinct before allocation.');
 for(const choice of recordDecisions){
  if(!choice||!sourceIds.has(choice.recordId)||reused.has(choice.recordId)||typeof choice.siteRecordId!=='string'||!site.matches.find(match=>match.recordId===choice.recordId)?.candidates.some(candidate=>candidate.recordId===choice.siteRecordId))throw TypeError('Choose one proposed site identity for each source record.');
  reused.set(choice.recordId,choice.siteRecordId);
 }
 for(const id of Object.keys(recordIds || {}))if(!sourceIds.has(id)||reused.has(id))throw TypeError('Allocate IDs only for new source records.');
 const taken=new Set(site.records.map(record=>record.id)),mapping=new Map(reused),output=[...site.records];
 for(const record of records){
  if(reused.has(record.id)){continue;}
  const id=recordId?recordId(structuredClone(record),{taken:Object.freeze([...taken])}):Object.hasOwn(recordIds || {},record.id)?recordIds[record.id]:record.id;
  const normalized=typeof id==='string'&&normalizeIdentifier(id);
  if(normalized?.scheme!=='local'||normalized.value!==id||taken.has(id))throw TypeError('New record IDs must be valid and distinct from existing site and allocated IDs.');
  taken.add(id);mapping.set(record.id,id);output.push({...record,id});
 }
 return {mapping,records:output,reusedRecordIds:[...new Set(reused.values())],newRecordIds:output.filter(record=>!site.records.some(existing=>existing.id===record.id)).map(record=>record.id)};
}
