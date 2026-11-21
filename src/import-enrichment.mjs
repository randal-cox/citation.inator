export {readableImportSource} from './import-display.mjs';
export {IMPORT_LIMITS,normalizeImportLimits} from './import-limits.mjs';
// Experimental browser-safe metadata transport and deterministic identity policy.
import {normalizeIdentifier,canonicalIdentifierKey,normalizeRecord,localRecordId} from './records.mjs';
import {crossrefRecord} from './crossref.mjs';
export function normalizeImportIdentifier(input){const id=typeof input==='string'&&normalizeIdentifier(/^[\dXx\s-]{10,30}$/.test(input)?'isbn:'+input:input);return id&&['doi','isbn','url','pmid','pmcid','arxiv'].includes(id.scheme)?id:null;}
export function enrichmentIdentifier(input){const id=normalizeImportIdentifier(input);return id&&['doi','isbn'].includes(id.scheme)?id:null;}
export const ENRICHMENT_POLICY='exact-identity-v1';
const norm=value=>String(value || '').normalize('NFKC').toLocaleLowerCase('en').replace(/[.,:;!?“”‘’"'()\[\]{}—–-]+/gu,' ').replace(/\s+/gu,' ').trim();
const present=value=>Array.isArray(value)?value.length>0:Boolean(value);
const initials=value=>norm(value).split(' ').map(word=>word[0]).join('');
function authorEqual(a,b){
 if(a.id&&a.id!==b.id || norm(a.suffix)!==norm(b.suffix))return false;
 if(a.literal || b.literal)return norm(a.literal || [a.given,a.family].filter(Boolean).join(' '))===norm(b.literal || [b.given,b.family].filter(Boolean).join(' '));
 if(!a.family || norm(a.family)!==norm(b.family) || !a.given || !b.given)return false;
 const x=norm(a.given).split(' '),y=norm(b.given).split(' ');
 return initials(a.given)===initials(b.given)&&x.length===y.length&&x.every((word,i)=>word===y[i]||word.length===1||y[i].length===1);
}
export function compareIdentity(source,candidate){
 const comparisons={title:present(source.title)&&norm(source.title)===norm(candidate.title),
  authors:source.authorsComplete!==false&&source.authors?.length>0&&source.authors.length===candidate.authors?.length&&source.authors.every((author,i)=>authorEqual(author,candidate.authors[i])),
  year:Boolean(source.issued?.[0]&&source.issued[0]===candidate.issued?.[0]),
  type:present(source.type)&&source.type!=='document'&&source.type===candidate.type&&!candidate.version&&!candidate.noticeRelations?.length,
 };
 for(const key of ['containerTitle','publisher','volume','issue','pages','articleNumber','edition','originalIssued','language','format'])if(present(source[key]))comparisons[key]=present(candidate[key])&&norm(source[key])===norm(candidate[key]);
 return {policy:ENRICHMENT_POLICY,comparisons,exact:Object.values(comparisons).every(Boolean)};
}
// Search/ranking can ignore explicit edition prose; stored titles and dates stay authored.
const editionQualifier=/\s*\((?:(?:\d+(?:st|nd|rd|th)?|first|second|third|fourth|revised|rev\.?|updated|expanded)\s+(?:ed\.?|edition)\b[^)]*|repr\.?|reprint(?:ed)?(?:\s+\d{4})?)\)\s*\.?$/iu;
export function importSearchTitle(source){
 const title=typeof source==='string'?source:source?.title;
 return typeof title==='string'?title.replace(editionQualifier,'').trim():'';
}
function rankingAuthorEqual(a,b){
 if(a.id&&b.id&&a.id!==b.id || a.suffix&&b.suffix&&norm(a.suffix)!==norm(b.suffix))return false;
 if(authorEqual(a,b))return true;
 const family=norm(a.family),otherFamily=norm(b.family);
 if(family&&otherFamily){if(family!==otherFamily)return false;const x=norm(a.given),y=norm(b.given);return !x||!y||initials(x)===initials(y)||x.startsWith(y+' ')||y.startsWith(x+' ');}
 const structured=family?a:otherFamily?b:null,literal=family?b.literal:a.literal;
 if(!structured||!literal)return false;
 const name=norm(literal),surname=norm(structured.family);let given;
 if(name.endsWith(' '+surname))given=name.slice(0,-surname.length).trim();
 else if(name.startsWith(surname+' '))given=name.slice(surname.length).trim();
 else return false;
 const required=norm(structured.given);return !required||initials(required)===initials(given)||given.startsWith(required+' ')||required.startsWith(given+' ');
}
const publicationType=type=>type==='book-chapter'?'chapter':['book','edited-book','monograph','reference-book'].includes(type)?'book':['article-journal','journal-article'].includes(type)?'article-journal':type;
const rankingTitle=value=>norm(importSearchTitle(value));
/** Ranking is an inspectable suggestion, not work identity or permission to merge. */
export function assessImportCandidate(source,candidate){
 const strict=compareIdentity(source,candidate),conflicts=[],differences=[],missing=[],reasons=[];
 const title=rankingTitle(source.title),otherTitle=rankingTitle(candidate.title),a=new Set(title.split(' ').filter(Boolean)),b=new Set(otherTitle.split(' ').filter(Boolean));
 const overlap=[...a].filter(word=>b.has(word)).length,titleSimilarity=a.size&&b.size?overlap/Math.max(a.size,b.size):0;
 if(!title||!otherTitle)missing.push('title');else if(title!==otherTitle&&titleSimilarity<.8)conflicts.push('title');else if(title!==otherTitle)differences.push('title');
 const authors=source.authors || [],otherAuthors=candidate.authors || [];
 let authorsMatch=false;
 if(!authors.length||!otherAuthors.length)missing.push('authors');
 else {authorsMatch=(source.authorsComplete===false?otherAuthors.length>=authors.length:otherAuthors.length===authors.length)&&authors.every((author,index)=>rankingAuthorEqual(author,otherAuthors[index]));if(!authorsMatch)conflicts.push('authors');}
 // An explicit edition/reprint qualifier is book evidence even when generic parsing retained type=document.
 const expectedType=publicationType(source.type==='document'&&(present(source.edition)||editionQualifier.test(source.title || ''))?'book':source.type),actualType=publicationType(candidate.type);
 if(!expectedType||expectedType==='document'||!actualType||actualType==='document')missing.push('type');else if(expectedType!==actualType)conflicts.push('type');
 const sourceYear=source.issued?.[0],candidateYear=candidate.issued?.[0],yearDistance=sourceYear&&candidateYear?Math.abs(sourceYear-candidateYear):null;
 if(sourceYear&&!candidateYear)missing.push('year');else if(yearDistance)differences.push('year');
 for(const key of ['containerTitle','publisher','volume','issue','pages','articleNumber','edition','originalIssued','language','format']){
  if(!present(source[key]))continue;
  if(!present(candidate[key]))missing.push(key);
  else if(norm(source[key])!==norm(candidate[key]))(key==='originalIssued'?conflicts:differences).push(key);
 }
 if(expectedType==='document'&&actualType==='chapter')reasons.push('unconfirmed-chapter');
 if(candidate.version||candidate.noticeRelations?.length){conflicts.push('version');reasons.push('version-or-notice');}
 if(conflicts.includes('authors'))reasons.push('different-authors');
 if(conflicts.includes('type'))reasons.push(actualType==='chapter'?'different-work-type-chapter':'different-work-type');
 if(conflicts.includes('title'))reasons.push('different-title');
 if(yearDistance>2)reasons.push('distant-year');
 const primary=!conflicts.length&&!reasons.includes('unconfirmed-chapter')&&authorsMatch&&titleSimilarity>=.8&&(yearDistance===null||yearDistance<=2);
 const score=(primary?1000:0)+(authorsMatch?200:0)+(expectedType&&expectedType!=='document'&&expectedType===actualType?100:0)+Math.round(titleSimilarity*100)-(yearDistance===null?0:Math.min(yearDistance,100))-conflicts.length*100;
 return {policy:'candidate-ranking-v1',comparisons:strict.comparisons,exact:strict.exact,conflicts,differences,missing,reasons,primary,score,titleSimilarity,yearDistance};
}
export function rankImportCandidates(source,candidates){
 return candidates.map((candidate,index)=>({candidate,assessment:assessImportCandidate(source,candidate),index})).sort((a,b)=>b.assessment.score-a.assessment.score||a.index-b.index).map(({candidate,assessment})=>({candidate,assessment}));
}

export function automaticCandidate(source,candidates){
 // Book identifiers require an edition decision even when DOI metadata agrees.
 if(publicationType(source.type)==='book')return null;
 const identifier=candidate=>{const id=candidate.identifiers?.[0];return id&&normalizeIdentifier(id.scheme+':'+id.value);};
 const valid=candidates.filter(identifier);
 const distinct=[...new Map(valid.map(candidate=>[canonicalIdentifierKey(identifier(candidate)),candidate])).values()];
 const exact=distinct.filter(candidate=>candidate.identifiers?.[0]?.scheme==='doi'&&compareIdentity(source,candidate).exact);
 // Any competing same-title result is a possible version/tie, even if its metadata is incomplete.
 return exact.length===1&&distinct.filter(candidate=>norm(candidate.title)===norm(source.title)).length===1?exact[0]:null;
}
export function mergeCompletion(source,candidate){
 const fresh=normalizeRecord(candidate),next={...source};
 if(!fresh.identifiers.length)throw Error('Choose a valid identifier.');
 const conflicts=[];if(source.type==='document'&&fresh.type!=='document')next.type=fresh.type;
 for(const key of ['title','authors','issued','containerTitle','publisher','publisherPlace','volume','issue','pages','articleNumber','edition','version','originalIssued']){
  if(present(next[key])&&present(fresh[key])&&JSON.stringify(next[key])!==JSON.stringify(fresh[key]))conflicts.push(key);
  else if(!present(next[key])&&present(fresh[key]))next[key]=fresh[key];
 }
 next.identifiers=[...(source.identifiers || []),...fresh.identifiers];
 next.locations=[...(source.locations || []),...fresh.locations];next.provenance=[...(source.provenance || []),...fresh.provenance];
 return {record:normalizeRecord({...next,id:source.id,state:'partial'}),conflicts};
}
const usableRecord=record=>record.title.length>0&&record.title.length<=1000&&record.authors.length<=50&&JSON.stringify(record).length<=16000;
const noticeRelations=message=>(Array.isArray(message?.['update-to'])?message['update-to']:[]).filter(item=>['correction','retraction','expression-of-concern'].includes(item?.type));
const year=value=>{const years=String(value || '').match(/\b[1-9]\d{3}\b/g);return years?.length===1?[Number(years[0])]:null;};
function isbnRecord(raw,id,at,url){
 const key='ISBN:'+id.value,book=raw?.[key];if(!book)throw Error('No edition found for this ISBN.');
 const ids=[...(book.identifiers?.isbn_13 || []),...(book.identifiers?.isbn_10 || [])].map(value=>normalizeIdentifier('isbn:'+value)).filter(Boolean);
 if(!ids.some(value=>canonicalIdentifierKey(value)===canonicalIdentifierKey(id)))throw Error('The returned edition does not verify this ISBN.');
 return normalizeRecord({id:localRecordId('lookup',canonicalIdentifierKey(id)),type:'book',state:'partial',title:[book.title,book.subtitle].filter(Boolean).join(': '),authors:(book.authors || []).map(author=>({literal:author.name})),issued:year(book.publish_date),publisher:book.publishers?.[0]?.name,identifiers:[id],locations:[{kind:'library',url:book.url,provider:'Open Library'}],provenance:[{provider:'Open Library',url,retrievedAt:at}]});
}
export function createBrowserEnrichment({fetch:request=globalThis.fetch,now=Date.now,sleep=ms=>new Promise(resolve=>setTimeout(resolve,ms)),minInterval=1100,timeout=10000}={}){
 let generation=0,retainedBytes=0;const lanes=new Map(),pending=new Map(),cache=new Map(),controllers=new Set();
 async function json(url,token){
  const parsed=new URL(url);if(!['https://api.crossref.org','https://openlibrary.org'].includes(parsed.origin))throw Error('Unsupported metadata provider.');
  const lane=lanes.get(parsed.origin)||{tail:Promise.resolve(),next:0,pause:0};lanes.set(parsed.origin,lane);
  const task=lane.tail.then(async()=>{
   if(token!==generation)throw Error('Lookup paused.');
   if(lane.pause>now())throw Error('Provider rate limit. Retry later.');
   if(lane.next>now())await sleep(lane.next-now());if(token!==generation)throw Error('Lookup paused.');
   lane.next=now()+minInterval;const controller=new AbortController();controllers.add(controller);const timer=setTimeout(()=>controller.abort(),timeout);
   try{
    const response=await request(url,{headers:{Accept:'application/json'},credentials:'omit',referrerPolicy:'no-referrer',redirect:'error',signal:controller.signal});
    if(response.status===429 || response.status>=500){const value=response.headers.get('retry-after');const duration=value&&/^\d+$/.test(value)?Number(value)*1000:Date.parse(value)-now();lane.pause=now()+Math.max(60000,Number.isFinite(duration)?duration:60000);}
    if(!response.ok)throw Error('Provider returned HTTP '+response.status+'.');
    const reader=response.body?.getReader();if(!reader)throw Error('Empty provider response.');let size=0,text='';const decoder=new TextDecoder();
    try{for(;;){const {done,value}=await reader.read();if(done)break;size+=value.length;if(size>2000000)throw Error('Provider response is too large.');text+=decoder.decode(value,{stream:true});}text+=decoder.decode();}finally{await reader.cancel().catch(()=>{});reader.releaseLock();}
    if(token!==generation)throw Error('Lookup paused.');retainedBytes+=size;if(retainedBytes>20000000)throw Error('Metadata session limit reached. Start a new import.');return JSON.parse(text);
   }finally{clearTimeout(timer);controllers.delete(controller);}
  });lane.tail=task.catch(()=>{});return task;
 }
 async function search(source,kind,token){
  if(kind==='both'){
   const results=await Promise.allSettled([search(source,'doi',token),search(source,'isbn',token)]),good=results.filter(result=>result.status==='fulfilled').map(result=>result.value),errors=results.filter(result=>result.status==='rejected').map(result=>result.reason.message);
   const candidates=good.flatMap(result=>result.candidates);if(errors.length&&!candidates.length)throw Error(errors.join(' '));
   return {candidates,automatic:null,evidence:[...good.flatMap(result=>result.evidence),...errors.map(error=>({error}))],policy:ENRICHMENT_POLICY,limited:true,partial:Boolean(errors.length)};
  }
  const at=new Date(now()).toISOString(),evidence=[];const get=async url=>{const raw=await json(url,token);evidence.push({provider:kind==='doi'?'Crossref':'Open Library',url,retrievedAt:at,raw});return raw;};
  if(kind==='doi'){
   if(!source.title || !source.authors?.length)throw Error('Add a title and author in Raw Document, or paste an identifier.');
   const byline=source.authors.map(a=>a.literal || [a.family,a.given].filter(Boolean).join(' ')).join('; ');
   const params=new URLSearchParams({'query.bibliographic':[source.title,byline,source.issued?.[0],source.containerTitle].filter(Boolean).join('. '),rows:'5'});
   const url='https://api.crossref.org/works?'+params,raw=await get(url);if(!Array.isArray(raw?.message?.items))throw Error('Invalid Crossref results.');
   const candidates=[],seen=new Set();for(const item of raw.message.items.slice(0,5)){const id=normalizeIdentifier('doi:'+item.DOI);if(!id||seen.has(canonicalIdentifierKey(id)))continue;seen.add(canonicalIdentifierKey(id));const record={...crossrefRecord({message:item},id,at,url),noticeRelations:noticeRelations(item)};if(usableRecord(record))candidates.push(record);}
   if(raw.message.items.length&&!candidates.length)throw Error('No usable Crossref metadata returned.');
   let automatic=automaticCandidate(source,candidates);
   if(automatic){const verified=await resolve(automatic.identifiers[0],token);evidence.push(...verified.evidence);const replaced=candidates.map(candidate=>candidate===automatic?verified.candidates[0]:candidate);automatic=automaticCandidate(source,replaced);return {candidates:replaced,automatic,evidence,policy:ENRICHMENT_POLICY};}
   return {candidates,automatic:null,evidence,policy:ENRICHMENT_POLICY};
  }
  if(!source.title || !source.authors?.length)throw Error('Add a title and author in Raw Document, or paste an ISBN.');
  const author=source.authors[0].family || source.authors[0].literal;
  const url='https://openlibrary.org/search.json?'+new URLSearchParams({title:importSearchTitle(source),author,limit:'3',fields:'key,title,author_name'}),raw=await get(url);
  if(!Array.isArray(raw?.docs))throw Error('Invalid Open Library results.');
  const candidates=[],seen=new Set();
  for(const work of raw.docs.slice(0,3)){
   if(!/^\/works\/OL\d+W$/.test(work.key))continue;
   const editionsURL='https://openlibrary.org'+work.key+'/editions.json?limit=5',editions=await get(editionsURL);if(!Array.isArray(editions.entries))throw Error('Invalid edition results.');
   for(const edition of editions.entries.slice(0,5)){
    if(!/^\/books\/OL\d+M$/.test(edition.key)||!edition.works?.some(value=>value.key===work.key))continue;
    const ids=[...(Array.isArray(edition.isbn_13)?edition.isbn_13:[]),...(Array.isArray(edition.isbn_10)?edition.isbn_10:[])].map(value=>normalizeIdentifier('isbn:'+value)).filter(Boolean);
    for(const id of ids){const canonical=canonicalIdentifierKey(id);if(seen.has(canonical))continue;seen.add(canonical);
     const record=normalizeRecord({id:'lookup-'+candidates.length,type:'book',state:'partial',title:[edition.title,edition.subtitle].filter(Boolean).join(': '),authors:(work.author_name || []).map(name=>({literal:name})),issued:year(edition.publish_date),publisher:edition.publishers?.[0],identifiers:[id],locations:[{kind:'library',url:'https://openlibrary.org'+edition.key,provider:'Open Library'}],edition:edition.edition_name,provenance:[{provider:'Open Library',url:editionsURL,retrievedAt:at,note:'Authors from work; edition choice requires review. '+JSON.stringify({edition:edition.edition_name,languages:edition.languages,format:edition.physical_format})}]});
     if(!usableRecord(record))continue;
     candidates.push({...record,edition:edition.edition_name || '',language:(edition.languages || []).map(value=>value.key).join(', '),format:edition.physical_format || '',editionKey:edition.key});
    }
   }
  }
  return {candidates:candidates.slice(0,15),automatic:null,evidence,policy:ENRICHMENT_POLICY,limited:true};
 }
 async function resolve(id,token){
  const at=new Date(now()).toISOString(),url=id.scheme==='doi'?'https://api.crossref.org/works/'+encodeURIComponent(id.value):'https://openlibrary.org/api/books?'+new URLSearchParams({bibkeys:'ISBN:'+id.value,format:'json',jscmd:'data'}),raw=await json(url,token);
  const record=id.scheme==='doi'?{...crossrefRecord(raw,id,at,url),noticeRelations:noticeRelations(raw.message)}:isbnRecord(raw,id,at,url);
  if(!usableRecord(record))throw Error('No usable metadata returned.');
  return {candidates:[record],automatic:null,evidence:[{provider:id.scheme==='doi'?'Crossref':'Open Library',url,retrievedAt:at,raw}],policy:ENRICHMENT_POLICY};
 }
 return {
  cancel(){generation++;for(const controller of controllers)controller.abort();pending.clear();},
  reset(){this.cancel();cache.clear();retainedBytes=0;},
  async lookup(source,{kind='doi',identifier}={}){
   if(!['doi','isbn','both'].includes(kind))throw Error('Choose DOI or ISBN search.');
   const token=generation,id=identifier&&normalizeIdentifier(/^[\dXx\s-]{10,30}$/.test(identifier)?'isbn:'+identifier:identifier);
   if(identifier&&(!id||!['doi','isbn'].includes(id.scheme)))throw Error('Paste a DOI or valid ISBN for metadata lookup.');
   const safe=Object.fromEntries(['title','authors','authorsComplete','issued','type','containerTitle','publisher','volume','issue','pages','articleNumber','edition','originalIssued','language','format'].map(key=>[key,source[key]]));
   if(JSON.stringify(safe).length>6000)throw Error('Use shorter reference fields.');
   const key=JSON.stringify({safe,kind,id,policy:ENRICHMENT_POLICY});if(cache.has(key))return structuredClone(cache.get(key));if(pending.has(key))return pending.get(key).then(structuredClone);
   if(pending.size>=100)throw Error('Lookup queue is full.');
   const task=(id?resolve(id,token):search(safe,kind,token)).then(result=>{if(token!==generation)throw Error('Lookup paused.');if(cache.size>=100)cache.delete(cache.keys().next().value);cache.set(key,result);return structuredClone(result);}).finally(()=>{if(pending.get(key)===task)pending.delete(key);});pending.set(key,task);return task;
  }
 };
}
