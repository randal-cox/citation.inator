// Count machine work separately from the human decisions that navigation visits.
export function reviewProgress(groups){
 const lookups=new Set(),decisions=new Set(),reviewGroups=[],lookupGroups=[];
 for(const group of groups){
  if(group.skipped)continue;let needsReview=false,looking=false;
  if(group.sourceReview){decisions.add('source:'+group.index);needsReview=true;}
  for(const [index,item] of group.items.entries()){
   if(!item.selected || item.invalid){decisions.add('work:'+group.index+':'+index);needsReview=true;continue;}
   const entry=item.metadata;
   if(item.lookupEligible!==false&&(entry?.pending || (!entry || ['paused','queued'].includes(entry.state))&&!entry?.kept&&!entry?.accepted)){lookups.add(item.key);looking=true;}
   if(!item.known&&!entry?.accepted&&!entry?.kept&&['choices','error'].includes(entry?.state)){
    decisions.add('identifier:'+item.key);needsReview=true;
   }
  }
  if(needsReview)reviewGroups.push(group.index);if(looking)lookupGroups.push(group.index);
 }
 return {lookingUp:lookups.size,needsReview:decisions.size,reviewGroups,lookupGroups};
}
