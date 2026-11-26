// Revision-bound review/edit protocol shared by Node and browser hosts. Acceptance is supplied explicitly by the host.
import {importHash} from './import-hash.mjs';
import { normalizeIdentifier,normalizeRecord } from './records.mjs';
import { scanCitationMarkers, formatRecordId } from './compiler.mjs';
const hash=importHash;
const quote = value => '"'+String(value).replace(/[\\"{};|]/g,character=>'\\'+character)+'"';
const importCue=(item,original,form)=>{
 const names=Array.isArray(item.authors)?item.authors.filter(name=>typeof name==='string'&&name.trim()):[];
 if(names.length&&(Number.isInteger(item.year)||item.undated))return names.join(' & ')+(item.etAl?' et al.':'')+(form==='narrative'?' (':', ')+(item.undated?'n.d.':item.year)+(item.sourceSuffix||'')+(form==='narrative'?')':'');
 return String(original).replace(/\s+/gu,' ').trim();
};
const digest = (sourceHash,matches) => hash(sourceHash+'\n'+JSON.stringify(matches));

/** Retain a revision-bound snapshot. This is local data, not a provider request. */
export function createImportReview(source, matched) {
  if (typeof source !== 'string' || matched?.schema !== 'citation-inator.import-matches.v1' || !Array.isArray(matched.matches)) throw new TypeError('Supply original source and matched proposals.');
  const sourceHash=hash(source), matches=structuredClone(matched.matches);
  return {schema:'citation-inator.import-review.v1',sourceHash,sourceLength:source.length,
    reviewId:digest(sourceHash,matches),matches};
}

export function placeholderOriginal(match,itemIndex){
 const citation=match.citation,item=match.items[itemIndex].item,range=item.rawRange;
 return match.items.length===1?citation.raw:range&&Number.isInteger(range.start)&&Number.isInteger(range.end)&&range.start>=0&&range.end>range.start&&citation.raw.slice(range.start,range.end)===item.rawText?item.rawText:null;
}

/** Plan whole-group edits. Rejected, deferred, absent and unsafe decisions preserve source. */
export function planImportEdits(source,review,{reviewId,decisions=[],citationKeyword='cite',identifierForm='minimal',existingRecordIds=[],referenceEntries=[]}={}) {
  if (typeof source !== 'string' || review?.schema !== 'citation-inator.import-review.v1' || review.sourceHash !== hash(source) || review.sourceLength !== source.length) throw new Error('The source revision has changed; review again.');
  if (reviewId !== review.reviewId || review.reviewId !== digest(review.sourceHash,review.matches)) throw new Error('Review decisions belong to a different or changed snapshot.');
  scanCitationMarkers('',{citationKeyword});
  if (!['minimal','explicit'].includes(identifierForm)) throw new TypeError('Use minimal or explicit identifierForm.');
  if (!Array.isArray(decisions)) throw new TypeError('Supply review decisions.');
  if(!Array.isArray(existingRecordIds) || existingRecordIds.some(id=>normalizeIdentifier('local:'+id)?.value!==id))throw new TypeError('Supply valid existing record IDs.');
  if(!Array.isArray(referenceEntries))throw new TypeError('Supply source reference entries.');
  const references=new Map(referenceEntries.map(entry=>{
    if(typeof entry?.id!=='string' || !Number.isInteger(entry.start) || !Number.isInteger(entry.end) || entry.start<0 || entry.end<=entry.start || entry.end>source.length)throw new TypeError('Supply source reference entries with valid ranges.');
    return [entry.id,source.slice(entry.start,entry.end).trim()];
  }));
  const taken=new Set([...existingRecordIds,...review.matches.flatMap(match=>match.items.flatMap(item=>item.candidates.map(candidate=>candidate.recordId)))]);
  const edits=[], outcomes=[], seen=new Set(),placeholderRecords=[];
  for (const decision of decisions) {
    const index=decision?.citationIndex;
    if (!Number.isInteger(index) || index<0 || index>=review.matches.length || seen.has(index)) throw new TypeError('Each decision must address one distinct citation group.');
    seen.add(index);
    if (!['accept','placeholder','reject','defer'].includes(decision.action)) throw new TypeError('Choose accept, placeholder, reject or defer.');
    const match=review.matches[index], citation=match.citation;
    if (!['accept','placeholder'].includes(decision.action)) { outcomes.push({citationIndex:index,state:decision.action}); continue; }
    const targets=decision.targets ?? decision.recordIds?.map(recordId=>({recordId})) ?? (decision.action==='placeholder'?match.items.map(()=>({placeholder:true})):undefined);
    const pending=[];
    if (!Array.isArray(targets) || targets.length !== match.items.length) throw new TypeError('Accept a target for every item in the citation group.');
    if(decision.action==='placeholder' && targets.some(target=>target?.placeholder!==true))throw new TypeError('Use accept with explicit targets for mixed citation groups.');
    const identities=targets.map((target,itemIndex)=>{
      if(target?.placeholder===true){
        if(target.identifier!==undefined)throw new TypeError('A placeholder cannot also select an identifier.');
        const base='pending-'+hash(review.sourceHash+':'+index+':'+itemIndex).slice(0,20);
        let id=target.recordId ?? base;
        if(target.recordId===undefined){let counter=0;while(taken.has(id))id=base+'-'+(++counter);}
        if(typeof id!=='string' || normalizeIdentifier('local:'+id)?.value!==id || taken.has(id))throw new TypeError('Placeholder IDs must be valid and distinct from existing records.');
        taken.add(id);
        const item=match.items[itemIndex].item;
        const original=placeholderOriginal(match,itemIndex);
        const referenceTexts=[...new Set(match.items[itemIndex].candidates.map(candidate=>references.get(candidate.recordId)).filter(Boolean))];
        const cue=importCue(item,original,citation.form);
        const comment='Original: '+original+' '+(referenceTexts.length?'Bibliographic identity remains unconfirmed.':'No matching bibliography entry.');
        pending.push({id,original,itemIndex,referenceTexts,cue,comment});
        return {scheme:'local',value:id,placeholder:true,original,cue,comment};
      }
      if(target && typeof target.recordId==='string' && target.identifier===undefined && target.placeholder===undefined) {
        const id=target.recordId, identifier=normalizeIdentifier(id);
        if(identifier?.scheme!=='local' || identifier.value!==id || !match.items[itemIndex].candidates.some(candidate=>candidate.recordId===id)) throw new TypeError('Choose a supplied candidate record ID for each item.');
        return {scheme:'local',value:id};
      }
      if(!target || typeof target.identifier!=='string' || target.recordId!==undefined || target.placeholder!==undefined) throw new TypeError('Choose a candidate or supply an identifier for each item.');
      const raw=target.identifier.trim(), identifier=normalizeIdentifier(/^[\dXx\s-]{10,30}$/.test(raw)?'isbn:'+raw:raw);
      if(!identifier || !['doi','isbn','url','pmid','pmcid','arxiv'].includes(identifier.scheme)) throw new TypeError('Enter a valid DOI, ISBN, URL, PMID, PMCID or arXiv identifier.');
      return identifier;
    });
    const selection=decision.targets || decision.action==='placeholder' ? {targets:identities.map(id=>id.placeholder?{placeholder:true,recordId:id.value}:id.scheme==='local'?{recordId:id.value}:{identifier:id.scheme+':'+id.value})} : {recordIds:[...decision.recordIds]};
    if(pending.some(item=>item.original===null)){
      outcomes.push({citationIndex:index,state:'accepted-needs-span',...selection,code:'import-placeholder-span-review-required'});continue;
    }
    if(pending.some(item=>/[\r\n]/.test(item.original))){
      outcomes.push({citationIndex:index,state:'accepted-needs-adapter',...selection,code:'import-placeholder-linebreak-review-required'});continue;
    }
    const items=match.items.map((proposal,itemIndex)=>{
      const identifier=identities[itemIndex], item=proposal.item;
      // Escape identifiers so punctuation cannot become notation options or extra items.
      return (identifier.scheme==='local'?formatRecordId(identifier.value,{citationKeyword,identifierForm}):(identifier.scheme+':'+identifier.value).replace(/[\\"{};|]/g,character=>'\\'+character)) + (identifier.placeholder ? ' | cue:'+quote(identifier.cue)+' | comment:'+quote(identifier.comment) : '') + (item.prefix ? ' | prefix:'+quote(item.prefix) : '') + (item.locator ? ' | locator:'+quote(item.locator) : '') +
        (citation.form === 'narrative' ? ' | form:narrative' : '');
    });
    if (match.items.some(proposal=>proposal.item.boundaryUncertain)) {
      outcomes.push({citationIndex:index,state:'accepted-needs-span',...selection,code:'import-author-span-review-required'}); continue;
    }
    const fragments=citation.sourceFragments || [{sourceStart:citation.start,sourceEnd:citation.end,exact:true}];
    let start=fragments[0]?.sourceStart, end=start, safe=fragments.length>0;
    for (const fragment of fragments) {
      safe &&= fragment.exact === true && fragment.link === undefined && Number.isInteger(fragment.sourceStart) && Number.isInteger(fragment.sourceEnd) &&
        fragment.sourceStart === end && fragment.sourceEnd>fragment.sourceStart && fragment.sourceEnd<=source.length;
      end=fragment.sourceEnd;
    }
    safe &&= start>=0 && source.slice(start,end) === citation.raw;
    if (!safe) { outcomes.push({citationIndex:index,state:'accepted-needs-adapter',...selection,code:'import-noncontiguous-or-decoded-source'}); continue; }
    const text=`{${citationKeyword} ${items.join('; ')}}`;
    const token=scanCitationMarkers(text,{citationKeyword})[0]?.token;
    if (token?.type !== 'citation' || token.items.length !== identities.length || token.items.some((item,index)=>item.identifier.scheme !== identities[index].scheme || item.identifier.value !== identities[index].value)) throw new Error('Could not encode accepted record identities.');
    placeholderRecords.push(...pending.map(item=>normalizeRecord({id:item.id,state:'unresolved',original:item.referenceTexts.length===1?item.referenceTexts[0]:item.cue,provenance:[{provider:'Import review',note:'Citation retained for editorial completion; no bibliographic identity has been inferred.'},...item.referenceTexts.map(text=>({provider:'Import review',note:'Unverified candidate reference; not an accepted identity: '+text}))]})));
    edits.push({start,end,before:source.slice(start,end),text,citationIndex:index,...selection});
    outcomes.push({citationIndex:index,state:'accepted',...selection,...(pending.length && {placeholderRecordIds:pending.map(item=>item.id),code:'import-unresolved-placeholder'})});
  }
  for (let index=0;index<review.matches.length;index++) if (!seen.has(index)) outcomes.push({citationIndex:index,state:'pending'});
  edits.sort((a,b)=>a.start-b.start);
  for (let index=1;index<edits.length;index++) if (edits[index].start<edits[index-1].end) throw new Error('Citation edits overlap; review source boundaries again.');
  const plan={schema:'citation-inator.import-edit-plan.v1',sourceHash:review.sourceHash,reviewId:review.reviewId,edits,outcomes,placeholderRecords};
  return {...plan,planHash:hash(JSON.stringify(plan))};
}

/** Apply a reviewed plan atomically to the same source revision. No record/cache writes. */
export function applyImportEdits(source,plan) {
  const {planHash,...snapshot}=plan || {};
  if (typeof source !== 'string' || plan?.schema !== 'citation-inator.import-edit-plan.v1' || planHash !== hash(JSON.stringify(snapshot)) || plan.sourceHash !== hash(source) || !Array.isArray(plan.edits)) throw new Error('Source or edit plan changed; review again.');
  let cursor=0;
  for (const edit of plan.edits) {
    if (!Number.isInteger(edit.start) || !Number.isInteger(edit.end) || edit.start<cursor || edit.end<=edit.start || edit.end>source.length || source.slice(edit.start,edit.end)!==edit.before || typeof edit.text !== 'string') throw new Error('Invalid edit boundary; nothing was applied.');
    cursor=edit.end;
  }
  let output=source;
  for (const edit of [...plan.edits].reverse()) output=output.slice(0,edit.start)+edit.text+output.slice(edit.end);
  return {source:output,changed:output!==source,sourceHash:hash(output),outcomes:structuredClone(plan.outcomes)};
}
