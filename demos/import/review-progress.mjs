import {identityNeedsReview} from './identity-state.mjs';
// Count machine work separately from the human decisions that navigation visits.
export function reviewProgress(groups){
 const lookups=new Set(),decisions=new Set(),reviewGroups=[],lookupGroups=[];
 for(const group of groups){
  if(group.skipped)continue;let needsReview=false,looking=false;
  if(group.sourceReview){decisions.add('source:'+group.index);needsReview=true;}
  for(const [index,item] of group.items.entries()){
   if(!item.selected || item.invalid){decisions.add('work:'+group.index+':'+index);needsReview=true;continue;}
   const entry=item.metadata;
   if(identityNeedsReview(entry)){decisions.add('identity:'+item.key);needsReview=true;}
   if(item.lookupEligible!==false&&(entry?.pending || (!entry || ['paused','queued'].includes(entry.state))&&!entry?.kept&&!entry?.accepted)){lookups.add(item.key);looking=true;}
   if(!item.known&&!entry?.accepted&&!entry?.kept&&['choices','error'].includes(entry?.state)){
    decisions.add('identifier:'+item.key);needsReview=true;
   }
  }
  if(needsReview)reviewGroups.push(group.index);if(looking)lookupGroups.push(group.index);
 }
 return {lookingUp:lookups.size,needsReview:decisions.size,reviewGroups,lookupGroups};
}

// Readiness uses the fixed set of highlighted citation groups, not lookup jobs.
export function reviewReadiness(groups,{blocked=false}={}){
 const readyGroups=[];let matched=0,skipped=0;
 for(const group of groups){
  if(group.skipped){skipped++;continue;}
  if(group.items.length&&group.items.every(item=>item.bibliographyMatched))matched++;
  if(!blocked&&!group.sourceReview&&group.items.length&&group.items.every(item=>item.selected&&!item.invalid&&!identityNeedsReview(item.metadata)&&Boolean(item.known||item.metadata?.accepted||item.metadata?.kept)))readyGroups.push(group.index);
 }
 return {total:groups.length,ready:readyGroups.length,readyPercent:groups.length?Math.round(readyGroups.length/groups.length*100):0,matched,skipped,readyGroups};
}
