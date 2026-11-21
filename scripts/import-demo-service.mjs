import {createHash} from 'node:crypto';
import {parseInTextCitations,matchCitations} from '../src/import-matcher.mjs';
import {parseReferences} from '../src/import-references.mjs';
import {createImportReview,planImportEdits,applyImportEdits} from '../src/import-review.mjs';
import {compileCitations,markerKind,scanCitationMarkers} from '../src/compiler.mjs';
import {detectCitationFormat} from '../src/import-format.mjs';
import {makeCache} from '../src/records.mjs';

// Local demo only: no files, records, credentials or provider services are written.
export function importDemoRequest(input) {
  if (!input || typeof input !== 'object' || typeof input.source !== 'string' || input.source.length>100000 || !Array.isArray(input.records) || input.records.length>100) throw new TypeError('Supply up to 100,000 source characters and 100 reference records.');
  const {source,records,style:requestedStyle='apa',action='analyze'}=input;
  if (!['auto','apa','chicago-author-date','vancouver'].includes(requestedStyle)) throw new TypeError('Choose APA, Chicago author–date or Vancouver.');
  if(input.referenceText !== undefined && (typeof input.referenceText!=='string'||input.referenceText.length>100000)) throw new TypeError('Supply bounded reference text.');
  const formatDetection=detectCitationFormat(source),formatChoiceRequired=requestedStyle==='auto'&&!formatDetection.style;
  const style=requestedStyle==='auto'?(formatDetection.style || 'apa'):requestedStyle;
  const contextHash=createHash('sha256').update(JSON.stringify({records,style:requestedStyle,referenceText:input.referenceText || ''})).digest('hex');
  const cache=makeCache(records);
  if(cache.records.some(record=>record.title.length>500 || record.authors.length>50) || records.some(record=>JSON.stringify(record).length>8000))throw new TypeError('Use shorter reference records in this demo.');
  const detect=()=>{const result=parseInTextCitations(source,{style,maxCitations:100,maxItems:300});if(style==='vancouver')result.citations=result.citations.filter(item=>!formatDetection.ignoredNumericRanges.some(range=>item.start<range.end&&item.end>range.start));return result;};
  const match=()=>{const result=matchCitations(detect(),records);if(result.matches.reduce((n,m)=>n+m.items.reduce((n,i)=>n+i.candidates.length,0),0)>1000)throw new RangeError('Too many candidate choices. Use a smaller reference set.');return result;};
  if (action==='analyze') {
    const matched=match();
    const review={...createImportReview(source,matched),contextHash};
    let parsedReferences;
    if(input.referenceText !== undefined) {
      if(typeof input.referenceText!=='string'||input.referenceText.length>100000) throw new TypeError('Supply bounded reference text.');
      const entries=input.referenceText.split(/\r?\n/).filter(line=>line.trim());
      if(entries.length>200)throw new TypeError('Use at most 200 explicitly separated entries.');
      parsedReferences=parseReferences(entries,{style});
    }
    return {review,formatDetection,formatChoiceRequired,effectiveStyle:style,diagnostics:matched.diagnostics,parsedReferences,referenceRecords:cache.records.map(record=>({id:record.id,title:record.title,authors:record.authors,issued:record.issued,originalIssued:record.originalIssued,publisher:record.publisher,publisherPlace:record.publisherPlace,containerTitle:record.containerTitle,volume:record.volume,issue:record.issue,pages:record.pages,articleNumber:record.articleNumber,identifiers:record.identifiers,referenceNumber:records.find(input=>input.id===record.id)?.referenceNumber,undated:records.find(input=>input.id===record.id)?.undated === true}))};
  }
  if (action!=='preview') throw new TypeError('Choose analyze or preview.');
  if(formatChoiceRequired)throw new TypeError('Choose a citation format.');
  // Candidate review is tied to the current records/style as well as the source.
  const current=createImportReview(source,match());
  if(current.reviewId!==input.review?.reviewId || contextHash!==input.review?.contextHash)throw new Error('Source, reference records or style changed. Analyze again.');
  const plan=planImportEdits(source,input.review,{reviewId:input.reviewId,decisions:input.decisions,citationKeyword:'cite'});
  const output=applyImportEdits(source,plan);
  const hasEndnotes=scanCitationMarkers(output.source).some(marker=>markerKind(marker.raw)==='endnote');
  const partialNumeric=style==='vancouver' && current.matches.some((match,index)=>!plan.edits.some(edit=>edit.citationIndex===index));
  const previewNotice=partialNumeric ? 'Some original reference numbers remain. The reading preview is withheld until every numeric group is converted; the reviewed source remains available.' : '';
  const reader=compileCitations(output.source+(hasEndnotes?'':'\n\n{citation endnote}'),cache,{citationStyle:style,namespace:'import-preview'});
  return {source:output.source,changed:output.changed,outcomes:plan.outcomes,edits:plan.edits,html:partialNumeric?'':reader.html,previewNotice,cache,diagnostics:reader.diagnostics};
}
