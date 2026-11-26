import {normalizeRecord,makeCache,canonicalIdentifierKey} from './records.mjs';
import {importHash} from './import-hash.mjs';
import {normalizeImportLimits} from './import-limits.mjs';
const fields=['type','title','titleParts','authors','editors','translators','issued','originalIssued','displayDate','online','print','containerTitle','containerTitleParts','publisher','publisherPlace','volume','issue','pages','articleNumber','edition','releaseVersion','identifiers'];
const equal=(a,b)=>JSON.stringify(a??null)===JSON.stringify(b??null);
function bounded(raw,limits){if(JSON.stringify(raw)?.length>limits.recordCharacters)throw RangeError('Metadata exceeds the record limit.');const r=normalizeRecord(raw);if(r.title.length>limits.titleCharacters||[r.authors,r.editors||[],r.translators||[]].some(a=>a.length>limits.authorsPerRecord))throw RangeError('Metadata fields exceed the record limit.');return r;}
/** Honest current/incoming comparison, not an inferred three-way merge baseline. */
export function reviewMetadataRefresh(current,incoming,{limits:overrides}={}){
 const limits=normalizeImportLimits(overrides),before=bounded(current,limits),after=bounded(incoming,limits);
 const keys=r=>new Set(r.identifiers.map(canonicalIdentifierKey)),a=keys(before),b=keys(after),shared=[...a].filter(k=>b.has(k));
 const conflictingSchemes=['doi','isbn','pmid','pmcid'].filter(s=>{const x=[...a].filter(k=>k.startsWith(s+':')),y=[...b].filter(k=>k.startsWith(s+':'));return x.length&&y.length&&!x.some(k=>y.includes(k));});
 const changes=fields.filter(f=>!equal(before[f],after[f])).map(field=>({field,current:before[field]??null,incoming:after[field]??null,requiresDecision:true}));
 return {schema:'citation-inator.metadata-refresh.v1',reviewId:importHash(JSON.stringify({before,after,limits})),recordId:before.id,identity:{state:conflictingSchemes.length?'conflict':shared.length?'candidate':'unverified',sharedIdentifiers:shared,conflictingSchemes},changes};
}
/** No defaults overwrite curation; every changed field gets keep/take/clear, bound to both snapshots. */
export function applyMetadataRefresh(cache,incoming,review,{decisions,confirmIdentity=false,limits:overrides}={}){
 const limits=normalizeImportLimits(overrides);
 if(cache?.schema!=='citation-inator.cache.v1'||!Array.isArray(cache?.records)||cache.records.length>limits.references)throw TypeError('Supply a bounded citation cache.');
 for(const r of cache.records)bounded(r,limits);
 const normalized=makeCache(cache.records),current=normalized.records.find(r=>r.id===review?.recordId);if(!current)throw Error('The current record is missing. Review again.');
 const next=bounded(incoming,limits),fresh=reviewMetadataRefresh(current,next,{limits});
 if(review?.schema!==fresh.schema||review.reviewId!==fresh.reviewId)throw Error('Current or incoming metadata changed. Review again.');
 if(fresh.identity.state==='conflict')throw Error('Conflicting source identifiers require a separate work or identity review.');
 if(!confirmIdentity)throw Error('Confirm that both snapshots describe the same work.');
 if(!Array.isArray(decisions)||decisions.length!==fresh.changes.length)throw TypeError('Decide every changed metadata field.');
 const chosen=new Map();for(const d of decisions){if(!d||!fresh.changes.some(c=>c.field===d.field)||chosen.has(d.field)||!['keep','take','clear'].includes(d.action))throw TypeError('Choose keep, take or clear once for every changed field.');chosen.set(d.field,d.action);}
 const merged={...current};for(const change of fresh.changes){const action=chosen.get(change.field);if(action==='take')merged[change.field]=next[change.field];else if(action==='clear')delete merged[change.field];}
 for(const field of ['title','containerTitle'])if(merged[field+'Parts']?.length&&merged[field+'Parts'].map(p=>p.text).join('')!==merged[field])throw Error('Review '+field+' and its formatting together; the selected text and runs do not match.');
 // Whole-cache validation detects identifier ownership conflicts.
 const accepted=fresh.changes.filter(c=>chosen.get(c.field)==='take');
 if(accepted.length){const note='Reviewed incoming metadata fields: '+accepted.map(c=>c.field).join(', ')+'. Snapshot '+fresh.reviewId+'.';const sources=next.provenance.length?next.provenance:[{provider:'Reviewed metadata snapshot'}];merged.provenance=[...current.provenance,...sources.map(s=>({provider:s.provider,url:s.url,retrievedAt:s.retrievedAt||next.retrievedAt,note}))];}
 const record=normalizeRecord(merged);return {cache:makeCache(normalized.records.map(r=>r.id===current.id?record:r)),record,decisions:structuredClone(decisions),reviewId:fresh.reviewId};
}
