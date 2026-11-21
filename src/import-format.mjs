// Experimental citation-shape inference; a format clue is not work identification.
import {normalizeImportLimits} from './import-limits.mjs';
import {parseInTextCitations} from './import-matcher.mjs';
export function detectCitationFormat(source,{limits:overrides}={}) {
 const limits=normalizeImportLimits(overrides),options={maxCitations:limits.citationGroups,maxItems:limits.citedItems};
 const authorDate=parseInTextCitations(source,{...options,style:'apa'}).citations;
 const ignoredNumericRanges=[];let unsupportedAuthorDate=0;
 const parentheses=[...source.matchAll(/\([^()]*\)/gu)];
 const numeric=parseInTextCitations(source,{...options,style:'vancouver'}).citations.filter(item=>{
  if(authorDate.some(parent=>item.start>=parent.start&&item.end<=parent.end)){ignoredNumericRanges.push({start:item.start,end:item.end});return false;}
  if(/^\[\s*(?:1[5-9]\d{2}|20\d{2})\s*\]$/u.test(item.raw) && parentheses.some(parent=>{
   if(item.start<parent.index || item.end>parent.index+parent[0].length)return false;
   const around=parent[0].slice(0,item.start-parent.index)+parent[0].slice(item.end-parent.index);
   return /\p{L}|\b(?:1[5-9]\d{2}|20\d{2})\b/u.test(around);
  })){ignoredNumericRanges.push({start:item.start,end:item.end});unsupportedAuthorDate++;return false;}
  return true;
 });
 const cues={apa:0,chicago:0,numeric:numeric.length,authorDate:authorDate.length,unsupportedAuthorDate};
 for(const citation of authorDate)if(citation.form==='parenthetical')for(const part of citation.raw.slice(1,-1).split(';')) {
  const date=/(,?)\s*(?:\[(?:1[5-9]\d{2}|20\d{2})\]\s*)?(?:1[5-9]\d{2}|20\d{2}|n\.d\.)/iu.exec(part);
  if(date)cues[date[1]?'apa':'chicago']++;
 }
 if(numeric.length&&(authorDate.length||unsupportedAuthorDate))return {style:null,state:'mixed',label:'Mixed formats',cues,ignoredNumericRanges};
 if(numeric.length)return {style:'vancouver',state:'detected',label:'Numeric',cues,ignoredNumericRanges};
 if(cues.apa&&!cues.chicago)return {style:'apa',state:'detected',label:'APA',cues,ignoredNumericRanges};
 if(cues.chicago&&!cues.apa)return {style:'chicago-author-date',state:'detected',label:'Chicago author–date',cues,ignoredNumericRanges};
 return {style:null,state:authorDate.length?'ambiguous':'unknown',label:authorDate.length?'APA / Chicago':'Unknown',cues,ignoredNumericRanges};
}
