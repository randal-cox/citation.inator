// Recover only explicit DOI text with bounded, visible line-wrap continuity.
// Syntax remains a proposal: provider metadata and editor review establish identity.
import {normalizeIdentifier} from './records.mjs';
const line='[ \\t]*(?:\\r?\\n)[ \\t]*';
const wrap='(?:'+line+')?';
const prefix=new RegExp('(?:https?:\\/\\/'+wrap+'(?:dx\\.)?doi\\.org\\/'+wrap+'|doi:[ \\t]*'+wrap+')(10\\.'+wrap+'\\d{4,9}\\/[^\\s<>]*)','giu');
export function referenceDOIs(text){
 const identifiers=[],evidence=[],diagnostics=[],blocked=new Set();
 for(const match of text.matchAll(prefix)){
  let value=match[1].replace(/[ \t\r\n]/gu,''),end=match.index+match[0].length,joined=/\r?\n/u.test(match[0]);
  const initial=normalizeIdentifier('doi:'+value.replace(/[.,;]+$/u,''));
  let uncertain=false;
  for(let n=0;n<4&&/[.\/-]$/u.test(value);n++){
   const continuation=/^[ \t]*\r?\n[ \t]*([^\s<>]+)/u.exec(text.slice(end));
   if(!continuation)break;
   const token=continuation[1];
   if(/^(?:PMID|PMCID|doi|ISBN|https?):/iu.test(token))break;
   // Numeric reference labels, calendar years and ordinary words are not DOI continuations.
   if(/^(?:PMID|PMCID|ISBN|Table|Figure|Fig|Chapter|Appendix|Accessed|Retrieved|Copyright|References|pp?|sec)(?=[:._-]|\d|$)/iu.test(token)||/^[A-Z]{2,}[-_.]?\d/u.test(token)||!(/\d/u.test(token))||!(/[./_()-]/u.test(token)||/^[a-z]\d{6,}$/iu.test(token)||/^0\d{4,}$/u.test(token)&&/\d+\.$/u.test(value))||/^\d{1,4}\.?$/u.test(token)||/^10\.\d{4,9}\//u.test(token)||!/^[-a-z\d._;()/:%+]+$/iu.test(token)) {uncertain=true;break;}
   if(/^\d+$/u.test(token)&&!(/^0\d{4,}$/u.test(token)&&/\d+\.$/u.test(value))){uncertain=true;break;}
   if(initial)blocked.add(initial.value);
   value+=token;end+=continuation[0].length;joined=true;
  }
  // A fifth continuation exceeds this rule's budget; do not expose its partial prefix.
  if(/[.\/-]$/u.test(value)&&/^[ \t]*\r?\n[ \t]*(?!PMID:|PMCID:|doi:|ISBN:|https?:)\S/iu.test(text.slice(end)))uncertain=true;
  const id=normalizeIdentifier('doi:'+value.replace(/[.,;]+$/u,''));
  if(uncertain){if(initial)blocked.add(initial.value);diagnostics.push({code:'import-wrapped-identifier-review-required',scheme:'doi'});continue;}
  if(!id)continue;
  if(!identifiers.some(existing=>existing.value===id.value))identifiers.push(id);
  evidence.push({field:'identifiers',start:match.index,end,raw:text.slice(match.index,end),exact:!joined,rule:joined?'explicit-doi-line-wrap':'explicit-doi-text'});
  if(joined)diagnostics.push({code:'import-wrapped-identifier-recovered',scheme:'doi',value:id.value});
 }
 return {identifiers:identifiers.filter(id=>!blocked.has(id.value)),evidence,diagnostics,blocked};
}
