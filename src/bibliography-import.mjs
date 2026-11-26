import {Cite,plugins} from '@citation-js/core';
import '@citation-js/plugin-bibtex';
import '@citation-js/plugin-ris';
import {fromCSLJSON} from './csl-json.mjs';
import {normalizeImportLimits} from './import-limits.mjs';
import {importHash} from './import-hash.mjs';
import {importSiteContext,allocateImportRecords} from './import-sites.mjs';
import {canonicalIdentifierKey,makeCache} from './records.mjs';

const schema='citation-inator.bibliography-review.v1';
function settings(options){
 const limits=normalizeImportLimits(options.limits),format=options.format;
 if(!['csl-json','bibtex','ris'].includes(format))throw TypeError('Choose csl-json, bibtex or ris explicitly.');
 return {format,limits};
}
function parse(source,format,limits){
 if(typeof source!=='string'||source.length>limits.sourceCharacters||new TextEncoder().encode(source).length>limits.fileBytes)throw RangeError('Supply a bounded bibliography text file.');
 if(!source.trim())throw TypeError('The bibliography file is empty.');
 // Force a local parser. Source text must never select a URL/DOI network adapter.
 const items=format==='csl-json'?JSON.parse(source):format==='bibtex'?new Cite(source,{forceType:'@biblatex/text',generateGraph:false}).data:plugins.input.data(source,'@ris/file').map(raw=>{
  const item=new Cite(raw,{forceType:'@ris/record',generateGraph:false}).data[0];
  const book=item.type==='book',series=book||item.type==='report';
  const editorTags=[raw.ED,book?raw.A3:series?undefined:raw.A2].flat().filter(Boolean);
  if(editorTags.length)item.editor=new Cite({TY:'JOUR',TI:'Creator projection',ED:editorTags},{forceType:'@ris/old+record',generateGraph:false}).data[0].editor;
  const seriesTags=[series?raw.A2:raw.A3].flat().filter(Boolean);
  if(seriesTags.length)item['collection-editor']=new Cite({TY:'JOUR',TI:'Creator projection',ED:seriesTags},{forceType:'@ris/old+record',generateGraph:false}).data[0].editor;
  const legacy=new Cite(raw,{forceType:'@ris/old+record',generateGraph:false}).data[0],present=item.issued?.['date-parts']?.[0],alternate=legacy.issued?.['date-parts']?.[0];
  if(alternate&&(!present||present[0]===alternate[0]&&alternate.length>present.length))item.issued=legacy.issued;
  return item;
 });
 if(!Array.isArray(items)||!items.length||items.length>limits.references)throw RangeError('Supply a nonempty bounded bibliography array.');
 return items;
}
/** Read-only inspection. Generated source IDs identify rows, never imported manager identities. */
export function inspectBibliography(source,options={}){
 const {format,limits}=settings(options),raw=parse(source,format,limits);
 const items=raw.map((input,index)=>{
  try{const converted=fromCSLJSON(input,{recordId:'bibliography-'+(index+1),limits});if(format!=='csl-json'){converted.diagnostics.push({code:'bibliography-format-projection-review',field:format});converted.requiresReview=true;}return {index,...converted};}
  catch(error){return {index,record:null,requiresReview:true,diagnostics:[{code:'bibliography-item-invalid',message:error.message}]};}
 });
 const records=items.filter(i=>i.record).map(i=>i.record),site=importSiteContext(records,options.siteCache,limits),owners=new Map(),conflicts=[];
 for(const record of records)for(const id of record.identifiers){const key=canonicalIdentifierKey(id),prior=owners.get(key);if(prior&&prior!==record.id)conflicts.push({code:'bibliography-shared-identifier',recordIds:[prior,record.id],identifier:key});else owners.set(key,record.id);}
 const reviewId=importHash(JSON.stringify({source,format,limits,siteCache:options.siteCache??null}));
 return {schema,reviewId,format,items,siteMatches:site.matches,conflicts,requiresReview:items.some(i=>i.requiresReview)||Boolean(conflicts.length)||site.matches.some(m=>m.candidates.length)};
}
/** Explicit row decisions; no implicit all-record import or identity merge. Inputs are re-inspected. */
export function applyBibliographyImport(source,review,{decisions,...options}={}){
 const current=inspectBibliography(source,options);
 if(review?.schema!==schema||review.reviewId!==current.reviewId)throw Error('Bibliography, site cache or limits changed. Inspect again.');
 if(!Array.isArray(decisions)||decisions.length!==current.items.length)throw TypeError('Choose import, reuse or skip for every bibliography row.');
 const choices=new Map();
 for(const d of decisions){if(!d||!Number.isSafeInteger(d.index)||d.index<0||d.index>=current.items.length||choices.has(d.index)||!['import','reuse','skip'].includes(d.action))throw TypeError('Use one valid decision per row.');choices.set(d.index,d);}
 const selected=[],recordIds={},recordDecisions=[];
 for(const item of current.items){const d=choices.get(item.index);if(d.action==='skip')continue;if(!item.record)throw TypeError('Invalid bibliography items must be skipped or corrected.');
  if(item.requiresReview&&d.acceptDiagnostics!==true)throw TypeError('Review the item diagnostics before importing.');
  selected.push(item.record);
  if(d.action==='reuse')recordDecisions.push({recordId:item.record.id,siteRecordId:d.siteRecordId});
  else {if(typeof d.recordId!=='string')throw TypeError('Allocate a stable host record ID for each new work.');recordIds[item.record.id]=d.recordId;}
 }
 const site=importSiteContext(selected,options.siteCache,normalizeImportLimits(options.limits));
 const allocated=allocateImportRecords(selected,site,{recordIds,recordDecisions});
 // Full-cache validation rejects shared DOI/ISBN ownership; never drop identifiers to force a merge.
 if(allocated.records.length>normalizeImportLimits(options.limits).references)throw RangeError('The combined bibliography exceeds the reference limit. Import fewer entries or increase the configured limit.');
 const cache=makeCache(allocated.records);
 return {cache,newRecordIds:allocated.newRecordIds,reusedRecordIds:allocated.reusedRecordIds,skippedIndexes:current.items.filter(i=>choices.get(i.index).action==='skip').map(i=>i.index)};
}
