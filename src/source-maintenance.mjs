import {normalizeRecord,makeCache,httpsURL,identifierURL,normalizeIdentifier} from './records.mjs';
import {importHash} from './import-hash.mjs';
import {normalizeImportLimits} from './import-limits.mjs';
const stamp=value=>{const date=new Date(value);if(!Number.isFinite(+date))throw TypeError('Supply a valid check date.');return date.toISOString();};
const recordHash=record=>importHash(JSON.stringify(normalizeRecord(record)));
/** Explicit transport only. HEAD observations are not proof that a work is unavailable or its content is readable. */
export async function checkSourceLink(input,{url,fetch:fetcher,checkedAt=new Date().toISOString(),timeoutMs=8000,signal}={}){
 const record=normalizeRecord(input),target=httpsURL(url);
 const destinations=new Set([...record.identifiers.map(identifierURL),...record.locations.map(l=>l.url)].filter(Boolean));
 if(!target||!destinations.has(target))throw TypeError('Choose an HTTPS destination belonging to this reference.');
 if(typeof fetcher!=='function')throw TypeError('Supply an explicitly authorized fetch transport.');
 if(!Number.isSafeInteger(timeoutMs)||timeoutMs<1||timeoutMs>60000)throw RangeError('Use a timeout from 1 to 60000 milliseconds.');
 const base={recordId:record.id,recordHash:recordHash(record),url:target,checkedAt:stamp(checkedAt),method:'HEAD'};
 if(signal?.aborted)return {...base,state:'indeterminate',reason:'cancelled'};
 const controller=new AbortController();let timer,removeAbort;
 try{
  const deadline=new Promise((_,reject)=>{timer=setTimeout(()=>{controller.abort();reject(new DOMException('Timed out','TimeoutError'));},timeoutMs);if(signal){const cancel=()=>{controller.abort();reject(new DOMException('Cancelled','AbortError'));};removeAbort=()=>signal.removeEventListener('abort',cancel);if(signal.aborted)cancel();else signal.addEventListener('abort',cancel,{once:true});}});
  const response=await Promise.race([Promise.resolve().then(()=>{if(controller.signal.aborted)throw new DOMException('Cancelled','AbortError');return fetcher(target,{method:'HEAD',redirect:'manual',credentials:'omit',referrerPolicy:'no-referrer',signal:controller.signal});}),deadline]);
  const status=response.status;
  if(status>=200&&status<300)return {...base,state:'reachable',status};
  if(status>=300&&status<400){let redirectURL='';try{const location=response.headers?.get('location');if(location)redirectURL=httpsURL(new URL(location,target).href);}catch{}return {...base,state:'redirect',status,...(redirectURL&&{redirectURL})};}
  return {...base,status,state:[404,410].includes(status)?'not-found':[401,403].includes(status)?'restricted':status===429?'rate-limited':[405,501].includes(status)?'head-unsupported':'indeterminate'};
 }catch(error){return {...base,state:'indeterminate',reason:signal?.aborted?'cancelled':['TimeoutError','AbortError'].includes(error?.name)?'timeout':'transport-error'};}finally{clearTimeout(timer);removeAbort?.();}
}
const noticeTypes={retraction:'retracted',correction:'corrected','expression-of-concern':'expression of concern'};
/** Check the notice's outgoing relation to the cited work, not a matching title or notice status alone. */
export function reviewCrossrefNotices(input,envelopes,{checkedAt,limits:overrides}={}){
 const limits=normalizeImportLimits(overrides);if(!Array.isArray(envelopes)||envelopes.length>limits.references||JSON.stringify(envelopes).length>limits.requestBytes)throw RangeError('Supply bounded Crossref notice metadata.');
 if(JSON.stringify(input)?.length>limits.recordCharacters)throw RangeError('Cited metadata exceeds the record limit.');
 const record=normalizeRecord(input),doi=record.identifiers.find(id=>id.scheme==='doi')?.value;
 if(!doi)throw TypeError('Crossref notice review requires the cited DOI.');
 const proposals=[],diagnostics=[],seen=new Set();
 for(let index=0;index<envelopes.length;index++){
  const message=envelopes[index]?.message,notice=normalizeIdentifier('doi:'+String(message?.DOI||''));
  if(!notice||notice.scheme!=='doi'||notice.value===doi){diagnostics.push({code:'notice-identity-unconfirmed',index});continue;}
  const relations=Array.isArray(message['update-to'])?message['update-to']:[];
  let matched=false;for(const relation of relations){const target=normalizeIdentifier('doi:'+String(relation?.DOI||''));if(target?.value!==doi||!Object.hasOwn(noticeTypes,relation.type))continue;matched=true;const key=notice.value+'|'+relation.type+'|'+doi;if(seen.has(key))continue;if(proposals.length>=limits.candidateChoices)throw RangeError('Too many notice proposals.');seen.add(key);proposals.push({noticeDOI:notice.value,targetDOI:doi,integrity:{state:noticeTypes[relation.type],source:'Crossref',url:identifierURL(notice)},relationType:relation.type,providerSource:typeof relation.source==='string'?relation.source:''});}
  if(!matched)diagnostics.push({code:'notice-relation-unconfirmed',index});
 }
 return {schema:'citation-inator.notice-review.v1',recordId:record.id,recordHash:recordHash(record),reviewId:importHash(JSON.stringify({record,envelopes,limits,checkedAt:checkedAt?stamp(checkedAt):null})),...(checkedAt&&{checkedAt:stamp(checkedAt)}),proposals,diagnostics,coverage:'provider-metadata-only',conclusion:proposals.length?'review-notices':'no-confirmed-notice-in-supplied-metadata'};
}
export function applyNoticeReview(cache,envelopes,review,{proposalIndex,action='retain',limits}={}){
 const budgets=normalizeImportLimits(limits);if(cache?.schema!=='citation-inator.cache.v1'||!Array.isArray(cache?.records)||cache.records.length>budgets.references||cache.records.some(r=>JSON.stringify(r).length>budgets.recordCharacters))throw RangeError('Supply a bounded citation cache.');
 const current=makeCache(cache.records),record=current.records.find(r=>r.id===review?.recordId);if(!record)throw Error('The cited record changed. Review again.');
 const fresh=reviewCrossrefNotices(record,envelopes,{limits,checkedAt:review.checkedAt});if(review?.schema!==fresh.schema||review.reviewId!==fresh.reviewId)throw Error('The record or notice evidence changed. Review again.');
 if(!['retain','accept'].includes(action))throw TypeError('Choose retain or accept; absence of a notice cannot clear prior integrity evidence.');
 if(action==='retain')return {cache:current,changed:false};
 if(!Number.isSafeInteger(proposalIndex)||!fresh.proposals[proposalIndex])throw TypeError('Choose one verified notice relation.');
 const proposal=fresh.proposals[proposalIndex],next=normalizeRecord({...record,integrity:proposal.integrity,provenance:[...record.provenance,...(record.integrity&&JSON.stringify(record.integrity)!==JSON.stringify(proposal.integrity)?[{provider:'Prior integrity decision',url:record.integrity.url,retrievedAt:fresh.checkedAt,note:'Explicitly replaced '+record.integrity.state+' flag from '+record.integrity.source+'.'}]:[]),{provider:'Crossref',url:proposal.integrity.url,retrievedAt:fresh.checkedAt,note:`Reviewed ${proposal.relationType} notice ${proposal.noticeDOI} targeting ${proposal.targetDOI}.`}]});
 return {cache:makeCache(current.records.map(r=>r.id===next.id?next:r)),changed:true,record:next};
}
