// Discovery metadata stays proposed until its supplied-field disagreements are reviewed.
export const identityIssues=(assessment,source={})=>{
 const present=value=>Array.isArray(value)?value.length>0:Boolean(value);
 const missing=(assessment?.missing || []).filter(key=>key==='year'?present(source.issued):key==='type'?present(source.type)&&source.type!=='document':present(source[key])).map(key=>'missing '+key);
 return [...new Set([...(assessment?.conflicts || []),...(assessment?.differences || []),...missing])];
};
export const identityNeedsReview=entry=>Boolean(entry?.proposed&&entry.identityIssues?.length&&!entry.identityOverride);
export const identifierReady=(entry,known=false)=>!identityNeedsReview(entry)&&Boolean(entry?.accepted||entry?.kept||known);
export function resolvedIdentifierState(candidate,assessment,source={}){
 const issues=identityIssues(assessment,source);
 return {proposed:issues.length?candidate:null,accepted:issues.length?null:candidate,identityIssues:issues,identityOverride:false,pending:false,state:issues.length?'conflict':'ready'};
}
export function acceptIdentityOverride(entry,proposal){
 if(!identityNeedsReview(entry)||entry.proposed!==proposal)return false;
 entry.accepted=proposal;entry.proposed=null;entry.identityOverride=true;entry.state='ready';return true;
}
