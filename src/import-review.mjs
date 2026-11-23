// Revision-bound review/edit protocol shared by Node and browser hosts. Acceptance is supplied explicitly by the host.
import {importHash} from './import-hash.mjs';
import { normalizeIdentifier } from './records.mjs';
import { scanCitationMarkers, formatRecordId } from './compiler.mjs';
const hash=importHash;
const quote = value => '"'+String(value).replace(/[\\"{};|]/g,character=>'\\'+character)+'"';
const digest = (sourceHash,matches) => hash(sourceHash+'\n'+JSON.stringify(matches));

/** Retain a revision-bound snapshot. This is local data, not a provider request. */
export function createImportReview(source, matched) {
  if (typeof source !== 'string' || matched?.schema !== 'citation-inator.import-matches.v1' || !Array.isArray(matched.matches)) throw new TypeError('Supply original source and matched proposals.');
  const sourceHash=hash(source), matches=structuredClone(matched.matches);
  return {schema:'citation-inator.import-review.v1',sourceHash,sourceLength:source.length,
    reviewId:digest(sourceHash,matches),matches};
}

/** Plan whole-group edits. Rejected, deferred, absent and unsafe decisions preserve source. */
export function planImportEdits(source,review,{reviewId,decisions=[],citationKeyword='citation',identifierForm='minimal'}={}) {
  if (typeof source !== 'string' || review?.schema !== 'citation-inator.import-review.v1' || review.sourceHash !== hash(source) || review.sourceLength !== source.length) throw new Error('The source revision has changed; review again.');
  if (reviewId !== review.reviewId || review.reviewId !== digest(review.sourceHash,review.matches)) throw new Error('Review decisions belong to a different or changed snapshot.');
  scanCitationMarkers('',{citationKeyword});
  if (!['minimal','explicit'].includes(identifierForm)) throw new TypeError('Use minimal or explicit identifierForm.');
  if (!Array.isArray(decisions)) throw new TypeError('Supply review decisions.');
  const edits=[], outcomes=[], seen=new Set();
  for (const decision of decisions) {
    const index=decision?.citationIndex;
    if (!Number.isInteger(index) || index<0 || index>=review.matches.length || seen.has(index)) throw new TypeError('Each decision must address one distinct citation group.');
    seen.add(index);
    if (!['accept','reject','defer'].includes(decision.action)) throw new TypeError('Choose accept, reject or defer.');
    const match=review.matches[index], citation=match.citation;
    if (decision.action !== 'accept') { outcomes.push({citationIndex:index,state:decision.action}); continue; }
    const targets=decision.targets ?? decision.recordIds?.map(recordId=>({recordId}));
    if (!Array.isArray(targets) || targets.length !== match.items.length) throw new TypeError('Accept a target for every item in the citation group.');
    const identities=targets.map((target,itemIndex)=>{
      if(target && typeof target.recordId==='string' && target.identifier===undefined) {
        const id=target.recordId, identifier=normalizeIdentifier(id);
        if(identifier?.scheme!=='local' || identifier.value!==id || !match.items[itemIndex].candidates.some(candidate=>candidate.recordId===id)) throw new TypeError('Choose a supplied candidate record ID for each item.');
        return {scheme:'local',value:id};
      }
      if(!target || typeof target.identifier!=='string' || target.recordId!==undefined) throw new TypeError('Choose a candidate or supply an identifier for each item.');
      const raw=target.identifier.trim(), identifier=normalizeIdentifier(/^[\dXx\s-]{10,30}$/.test(raw)?'isbn:'+raw:raw);
      if(!identifier || !['doi','isbn','url','pmid','pmcid','arxiv'].includes(identifier.scheme)) throw new TypeError('Enter a valid DOI, ISBN, URL, PMID, PMCID or arXiv identifier.');
      return identifier;
    });
    const selection=decision.targets ? {targets:identities.map(id=>id.scheme==='local'?{recordId:id.value}:{identifier:id.scheme+':'+id.value})} : {recordIds:[...decision.recordIds]};
    const items=match.items.map((proposal,itemIndex)=>{
      const identifier=identities[itemIndex], item=proposal.item;
      // Escape identifiers so punctuation cannot become notation options or extra items.
      return (identifier.scheme==='local'?formatRecordId(identifier.value,{citationKeyword,identifierForm}):(identifier.scheme+':'+identifier.value).replace(/[\\"{};|]/g,character=>'\\'+character)) + (item.prefix ? ' | prefix:'+quote(item.prefix) : '') + (item.locator ? ' | locator:'+quote(item.locator) : '') +
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
    edits.push({start,end,before:source.slice(start,end),text,citationIndex:index,...selection});
    outcomes.push({citationIndex:index,state:'accepted',...selection});
  }
  for (let index=0;index<review.matches.length;index++) if (!seen.has(index)) outcomes.push({citationIndex:index,state:'pending'});
  edits.sort((a,b)=>a.start-b.start);
  for (let index=1;index<edits.length;index++) if (edits[index].start<edits[index-1].end) throw new Error('Citation edits overlap; review source boundaries again.');
  const plan={schema:'citation-inator.import-edit-plan.v1',sourceHash:review.sourceHash,reviewId:review.reviewId,edits,outcomes};
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
