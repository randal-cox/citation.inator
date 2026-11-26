import {normalizeIdentifier} from './records.mjs';
import {placeholderOriginal} from './import-review.mjs';
import {normalizeImportIdentifier} from './import-enrichment.mjs';

// Presentation-independent queues over one analysis snapshot. Suggestions never
// apply edits, confirm an identity, or claim an identifier lookup was performed.
export function classifyReview(result,{reviewId,decisions=[],recordDecisions=[],policy={}}={}){
 const review=result?.review;
 if(review?.schema!=='citation-inator.import-review.v1'||typeof review.reviewId!=='string'||!Array.isArray(review.matches)||review.matches.length>10000)throw TypeError('Supply a current import analysis result.');
 if(!Array.isArray(decisions)||!Array.isArray(recordDecisions)||!policy||typeof policy!=='object'||Array.isArray(policy)||Object.keys(policy).some(key=>key!=='siteWorks'))throw TypeError('Supply decisions, record decisions and a siteWorks policy.');
 if((decisions.length||recordDecisions.length||reviewId!==undefined)&&reviewId!==review.reviewId)throw Error('Decisions belong to a different review snapshot.');
 const siteWorks=policy.siteWorks??'offer';if(!['offer','prefer','require'].includes(siteWorks))throw TypeError('Use offer, prefer or require for siteWorks.');
 const choices=new Map(),siteChoices=new Map(),sites=new Map((result.siteMatches||[]).map(item=>[item.recordId,item]));
 for(const choice of decisions){if(!Number.isInteger(choice?.citationIndex)||choice.citationIndex<0||choice.citationIndex>=review.matches.length||choices.has(choice.citationIndex)||!['accept','placeholder','reject','defer'].includes(choice.action))throw TypeError('Supply one valid current decision per citation group.');choices.set(choice.citationIndex,choice);}
 for(const choice of recordDecisions){const match=sites.get(choice?.recordId);if(!match||siteChoices.has(choice.recordId)||choice.siteRecordId!==null&&!match.candidates.some(item=>item.recordId===choice.siteRecordId))throw TypeError('Choose one current proposed site record or null for a new record.');siteChoices.set(choice.recordId,choice.siteRecordId);}
 const attention=[],probable=[],groups=[],used=new Set(),blockers=[];
 const taken=new Set([...(result.referenceRecords||[]).map(item=>item.id),...(result.siteRecordIds||[]),...review.matches.flatMap(match=>match.items.flatMap(item=>item.candidates.map(candidate=>candidate.recordId))),...[...sites.values()].flatMap(item=>item.candidates.map(candidate=>candidate.recordId))]);
 if(result.document?.boundaryRequired)blockers.push({code:'import-bibliography-boundary-required'});
 if(result.formatChoiceRequired)blockers.push({code:'import-citation-format-required'});
 for(const [citationIndex,match] of review.matches.entries()){
  if(!Array.isArray(match.items)||!match.items.length||match.items.some(item=>!Array.isArray(item.candidates)))throw TypeError('Supply complete citation proposals.');
  const suggestion=match.items.every(item=>item.state==='unique'&&item.candidates.length===1)?match.items.map(item=>({recordId:item.candidates[0].recordId})):null;
  const choice=choices.get(citationIndex),targets=choice?.targets??choice?.recordIds?.map(recordId=>({recordId}))??(choice?.action==='placeholder'?match.items.map(()=>({placeholder:true})):undefined);
  let decided=choice?.action==='reject',valid=Boolean(Array.isArray(targets)&&targets.length===match.items.length&&!(choice?.action==='placeholder'&&targets.some(target=>target?.placeholder!==true))),manual=false;
  if(choice&&['accept','placeholder'].includes(choice.action)){
   for(const [index,item] of match.items.entries()){
    const target=targets?.[index];if(!target){valid=false;continue;}
    if(target.placeholder===true&&target.identifier===undefined){
     manual=true;
     if(target.recordId!==undefined){if(typeof target.recordId!=='string'||normalizeIdentifier('local:'+target.recordId)?.value!==target.recordId||taken.has(target.recordId))valid=false;else taken.add(target.recordId);}
     continue;
    }
    const fields=['recordId','identifier','placeholder'].filter(key=>target[key]!==undefined);
    if(fields.length!==1){valid=false;continue;}
    if(target.recordId!==undefined){if(typeof target.recordId!=='string'||!item.candidates.some(candidate=>candidate.recordId===target.recordId))valid=false;}
    else if(target.placeholder!==undefined){if(target.placeholder!==true)valid=false;manual=true;}
    else{if(!normalizeImportIdentifier(target.identifier))valid=false;manual=true;}
   }
   if(valid){
    const uncertain=match.items.some(item=>item.item?.boundaryUncertain);
    const fragments=match.citation.sourceFragments;
    const unsafe=fragments&&(!fragments.length||fragments.some((fragment,index)=>fragment.exact!==true||fragment.link!==undefined||index>0&&fragment.sourceStart!==fragments[index-1].sourceEnd));
    const originals=targets.map((target,index)=>target.placeholder?placeholderOriginal(match,index):undefined);
    const unsafePlaceholder=originals.some(original=>original===null);
    const multilinePlaceholder=originals.some(original=>typeof original==='string'&&/[\r\n]/.test(original));
    if(uncertain||unsafe||unsafePlaceholder||multilinePlaceholder)blockers.push({code:multilinePlaceholder?'import-placeholder-linebreak-review-required':'import-source-span-review-required',citationIndex});else decided=true;
    for(const target of targets)if(target.recordId)used.add(target.recordId);
   }
  }
  const queue=suggestion&&!manual?'probable':'attention';(queue==='probable'?probable:attention).push(citationIndex);
  if(!decided&&!blockers.some(item=>item.citationIndex===citationIndex))blockers.push({code:'import-citation-decision-required',citationIndex});
  groups.push({citationIndex,queue,decided,action:choice?.action??'pending',suggestedTargets:suggestion,selectedRecordIds:valid&&targets?targets.flatMap(target=>target.recordId?[target.recordId]:[]):[],evidence:match.items.map((item,index)=>({itemIndex:index,bibliographyMatched:item.candidates.length>0,identifierVerification:'not-checked'}))});
 }
 const site=[];
 for(const match of sites.values()){
  if(!match.candidates.length)continue;
  const only=match.candidates.length===1?match.candidates[0]:null;
  const clear=only&&![].concat(only.evidence||[]).some(item=>item.assessment?.conflicts?.length);
  const suggestedSiteRecordId=only&&(clear||siteWorks!=='offer')?only.recordId:null;
  const chosen=siteChoices.get(match.recordId),required=used.has(match.recordId),decided=siteChoices.has(match.recordId)&&!(siteWorks==='require'&&chosen===null);
  if(required&&!decided)blockers.push({code:siteWorks==='require'&&chosen===null?'import-site-reuse-required':'import-site-decision-required',recordId:match.recordId});
  site.push({recordId:match.recordId,candidateRecordIds:match.candidates.map(item=>item.recordId),required,decided,...(siteChoices.has(match.recordId)&&{siteRecordId:chosen}),suggestedSiteRecordId});
 }
 const count=indexes=>({total:indexes.length,undecided:indexes.filter(index=>!groups[index].decided).length});
 return {schema:'citation-inator.import-classification.v1',reviewId:review.reviewId,...(result.revision!==undefined&&{revision:result.revision}),attention,probable,site,groups,counts:{attention:count(attention),probable:count(probable),site:{total:site.length,required:site.filter(item=>item.required).length,undecided:site.filter(item=>item.required&&!item.decided).length}},blockers,canApply:blockers.length===0};
}
