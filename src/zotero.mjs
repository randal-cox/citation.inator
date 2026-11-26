export {citationOptionPolicy,CITATION_OPTION_POLICIES} from './option-policy.mjs';
import {fromCSLJSON} from './csl-json.mjs';
import {importSiteContext} from './import-sites.mjs';
import {normalizeImportLimits} from './import-limits.mjs';
export {fromCSLJSON};
// source is host-side connection metadata. Publish only record, never this envelope.
export function fromZotero(item,{recordId,transport='web',serverId,connectionId,limits}={}){
 if(!item||typeof item!=='object'||!['web','local'].includes(transport))throw new TypeError('Supply a Zotero item and explicit supported transport.');
 const library=item.library,key=item.key,version=item.version;
 if(!library||!['user','group'].includes(library.type)||!/^\d+$/.test(String(library.id))||Number(library.id)<=0||!Number.isSafeInteger(Number(library.id))||!(/^[A-Z0-9]{8}$/).test(key)||!Number.isSafeInteger(version)||version<0)throw new TypeError('Supply a library-scoped Zotero item with key and version.');
 if(item.data&&(item.data.key!==undefined&&item.data.key!==key||item.data.version!==undefined&&item.data.version!==version))throw new TypeError('Zotero item identity/version fields disagree.');
 if(transport==='local'&&![serverId,connectionId].some(x=>typeof x==='string'&&/^[A-Za-z0-9._-]{1,128}$/.test(x)))throw new TypeError('Local metadata needs a server identity or session connection identity.');
 if(serverId!==undefined&&(typeof serverId!=='string'||!/^[A-Za-z0-9._-]{1,128}$/.test(serverId)))throw new TypeError('Invalid local server identity.');
 if(item.csljson===undefined)throw new TypeError('Request the selected item with include=csljson.');
 const converted=fromCSLJSON(item.csljson,{recordId,limits});
 return {...converted,schema:'citation-inator.zotero-selection.v1',source:{provider:'zotero',libraryType:library.type,libraryId:String(library.id),itemKey:key,itemVersion:version,transport,versionPartition:transport==='web'?'web':serverId?'local:'+serverId:'local-session:'+connectionId,...(transport==='local'&&!serverId&&{versionComparable:false})}};
}
export function reconcileZoteroItem(selection,siteCache,{limits:overrides}={}){
 if(selection?.schema!=='citation-inator.zotero-selection.v1'||!selection.record)throw new TypeError('Supply a converted Zotero selection.');
 const limits=normalizeImportLimits(overrides),site=importSiteContext([selection.record],siteCache,limits);
 const candidates=site.matches[0]?.candidates||[];
 const collision=site.records.some(record=>record.id===selection.record.id)&&!candidates.some(candidate=>candidate.recordId===selection.record.id);
 return {schema:'citation-inator.manager-matches.v1',recordId:selection.record.id,candidates,state:collision?'id-collision':candidates.length?'candidate-review':'new',requiresReview:collision||selection.requiresReview||candidates.length>0,...(collision&&{diagnostics:[{code:'manager-record-id-collision',recordId:selection.record.id}]})};
}
