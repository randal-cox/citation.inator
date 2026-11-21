import {createHash} from 'node:crypto';
import {parseInTextCitations,matchCitations} from '../src/import-matcher.mjs';
import {parseReferences} from '../src/import-references.mjs';
import {createImportReview,planImportEdits,applyImportEdits} from '../src/import-review.mjs';
import {compileCitations,markerKind,scanCitationMarkers} from '../src/compiler.mjs';
import {makeCache} from '../src/records.mjs';

// Local demo only: no files, records, credentials or provider services are written.
export function importDemoRequest(input) {
  if (!input || typeof input !== 'object' || typeof input.source !== 'string' || input.source.length>100000 || !Array.isArray(input.records) || input.records.length>100) throw new TypeError('Supply up to 100,000 source characters and 100 reference records.');
  const {source,records,style='apa',action='analyze'}=input;
  if (!['apa','chicago-author-date','vancouver'].includes(style)) throw new TypeError('Choose APA, Chicago author–date or Vancouver.');
  if(input.referenceText !== undefined && (typeof input.referenceText!=='string'||input.referenceText.length>100000)) throw new TypeError('Supply bounded reference text.');
  const contextHash=createHash('sha256').update(JSON.stringify({records,style,referenceText:input.referenceText || ''})).digest('hex');
  const cache=makeCache(records);
  if(cache.records.some(record=>record.title.length>500 || record.authors.length>50) || records.some(record=>JSON.stringify(record).length>8000))throw new TypeError('Use shorter reference records in this demo.');
  const detect=()=>parseInTextCitations(source,{style,maxCitations:100,maxItems:300});
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
    return {review,diagnostics:matched.diagnostics,parsedReferences};
  }
  if (action!=='preview') throw new TypeError('Choose analyze or preview.');
  // Candidate review is tied to the current records/style as well as the source.
  const current=createImportReview(source,match());
  if(current.reviewId!==input.review?.reviewId || contextHash!==input.review?.contextHash)throw new Error('Source, reference records or style changed. Analyze again.');
  const plan=planImportEdits(source,input.review,{reviewId:input.reviewId,decisions:input.decisions});
  const output=applyImportEdits(source,plan);
  const hasEndnotes=scanCitationMarkers(output.source).some(marker=>markerKind(marker.raw)==='endnote');
  const partialNumeric=style==='vancouver' && current.matches.some((match,index)=>!plan.edits.some(edit=>edit.citationIndex===index));
  const previewNotice=partialNumeric ? 'Some original reference numbers remain. The reading preview is withheld until every numeric group is converted; the reviewed source remains available.' : '';
  const reader=compileCitations(output.source+(hasEndnotes?'':'\n\n{citation endnote}'),cache,{citationStyle:style,namespace:'import-preview'});
  return {source:output.source,changed:output.changed,outcomes:plan.outcomes,edits:plan.edits,html:partialNumeric?'':reader.html,previewNotice,cache,diagnostics:reader.diagnostics};
}
