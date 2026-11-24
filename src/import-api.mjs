import {importSiteContext,allocateImportRecords} from './import-sites.mjs';
import {readableImportSource} from './import-display.mjs';
import {normalizeImportLimits} from './import-limits.mjs';
import {importHash} from './import-hash.mjs';
import {parseInTextCitations,matchCitations} from './import-matcher.mjs';
import {parseReferences} from './import-references.mjs';
import {createImportReview,planImportEdits,applyImportEdits} from './import-review.mjs';
import {compileCitations,formatRecordId,markerKind,scanCitationMarkers} from './compiler.mjs';
import {detectCitationFormat} from './import-format.mjs';
import {analyzeImportDocument} from './import-document.mjs';
import {makeCache,normalizeRecord,normalizeIdentifier,canonicalIdentifierKey} from './records.mjs';
import {mergeCompletion} from './import-enrichment.mjs';

// Headless reviewed import: proposes source edits and portable records; hosts own persistence.
export function processImportRequest(input) {
  const limits=normalizeImportLimits(input?.limits);
  if (!input || typeof input !== 'object' || typeof input.source !== 'string' || input.source.length>limits.sourceCharacters) throw new TypeError('Use a document of at most '+limits.sourceCharacters.toLocaleString('en')+' characters.');
  const {source,style:requestedStyle='apa',action='analyze',citationKeyword='cite',namespace='import-preview',identifierForm='minimal'}=input;
  formatRecordId('import-validation',{citationKeyword,identifierForm});
  scanCitationMarkers('',{citationKeyword});if(typeof namespace!=='string'||!/^[-A-Za-z0-9_]{1,80}$/u.test(namespace))throw new TypeError('Use a namespace of up to 80 letters, digits, hyphens or underscores.');
  if (!['auto','apa','chicago-author-date','vancouver'].includes(requestedStyle)) throw new TypeError('Choose APA, Chicago author–date or Vancouver.');
  const fullDocument=input.mode==='document';
  if(fullDocument && (input.records!==undefined || input.referenceText!==undefined))throw new TypeError('Full-document import derives references from the source.');
  const model=fullDocument?analyzeImportDocument(source,{style:requestedStyle,bibliography:input.bibliography,limits,citationKeyword}):null;
  const records=model?.records ?? input.records;
  if(!Array.isArray(records)||records.length>limits.references)throw new TypeError('Supply at most '+limits.references+' reference records.');
  if(input.referenceText !== undefined && (typeof input.referenceText!=='string'||input.referenceText.length>limits.sourceCharacters)) throw new TypeError('Supply bounded reference text.');
  const formatDetection=model?.formatDetection ?? detectCitationFormat(source,{limits}),formatChoiceRequired=model?.formatChoiceRequired ?? (requestedStyle==='auto'&&!formatDetection.style);
  const style=model?.effectiveStyle ?? (requestedStyle==='auto'?(formatDetection.style || 'apa'):requestedStyle);
  const cache=makeCache(records);
  if(cache.records.some(record=>record.title.length>limits.titleCharacters || record.authors.length>limits.authorsPerRecord) || records.some(record=>JSON.stringify(record).length>limits.recordCharacters))throw new TypeError('Use shorter reference records.');
  const recoveredProposals=new Map((model?.records || []).filter(record=>record.identifierProposals?.length).map(record=>[record.id,record.identifierProposals]));
  const site=importSiteContext(cache.records,input.siteCache,limits);
  const hostRecords=input.recordDecisions!==undefined||input.siteCache!==undefined||input.recordId!==undefined||input.recordIds!==undefined;
  const contextHash=importHash(JSON.stringify({siteCache:input.siteCache ?? null,limits,mode:fullDocument?'document':'fixture',bibliography:input.bibliography ?? {},records,style:requestedStyle,citationKeyword,namespace,referenceText:input.referenceText || ''}));
  const detect=()=>{if(model)return model.detection;const result=parseInTextCitations(source,{style,maxCitations:limits.citationGroups,maxItems:limits.citedItems});if(style==='vancouver')result.citations=result.citations.filter(item=>!formatDetection.ignoredNumericRanges.some(range=>item.start<range.end&&item.end>range.start));return result;};
  const match=()=>{const result=matchCitations(detect(),records);if(result.matches.reduce((n,m)=>n+m.items.reduce((n,i)=>n+i.candidates.length,0),0)>limits.candidateChoices)throw new RangeError('Too many candidate choices. Use a smaller reference set.');return result;};
  if (action==='analyze') {
    const matched=match();
    const review={...createImportReview(source,matched),contextHash};
    let parsedReferences=model?{entries:model.entries}:undefined;
    if(input.referenceText !== undefined) {
      if(typeof input.referenceText!=='string'||input.referenceText.length>limits.sourceCharacters) throw new TypeError('Supply bounded reference text.');
      const entries=input.referenceText.split(/\r?\n/).filter(line=>line.trim());
      if(entries.length>limits.references)throw new TypeError('Use at most '+limits.references+' explicitly separated entries.');
      parsedReferences=parseReferences(entries,{style});
    }
    return {siteMatches:site.matches,review,document:model?.document,referenceEntries:model?.entries,formatDetection,formatChoiceRequired,effectiveStyle:style,diagnostics:matched.diagnostics,parsedReferences,referenceRecords:cache.records.map(record=>({id:record.id,type:record.type,authorsComplete:record.authorsComplete,title:record.title,authors:record.authors,issued:record.issued,originalIssued:record.originalIssued,publisher:record.publisher,publisherPlace:record.publisherPlace,containerTitle:record.containerTitle,volume:record.volume,issue:record.issue,pages:record.pages,articleNumber:record.articleNumber,identifiers:record.identifiers,...(recoveredProposals.has(record.id)&&{identifierProposals:recoveredProposals.get(record.id)}),referenceNumber:records.find(input=>input.id===record.id)?.referenceNumber,undated:records.find(input=>input.id===record.id)?.undated === true}))};
  }
  if (action!=='preview') throw new TypeError('Choose analyze or preview.');
  if(model?.document.boundaryRequired)throw new TypeError('Choose the bibliography boundary.');
  if(formatChoiceRequired)throw new TypeError('Choose a citation format.');
  // Candidate review is tied to the current records/style as well as the source.
  const current=createImportReview(source,match());
  if(current.reviewId!==input.review?.reviewId || contextHash!==input.review?.contextHash)throw new Error('Source, reference records or style changed. Analyze again.');
  // Session completions are editor-accepted proposals. They cannot alter source-derived matching context.
  const completions=input.completions ?? [];
  if(!Array.isArray(completions)||completions.length>limits.references||JSON.stringify(completions).length>limits.recordCharacters*10)throw new TypeError('Use bounded reference completions.');
  const enriched=new Map(),extra=[],completionIds=new Set();
  for(const original of records){const identifier=original.identifiers?.find(id=>['doi','isbn'].includes(id.scheme));if(identifier&&input.decisions?.some(decision=>decision.action==='accept'&&(decision.targets || decision.recordIds?.map(recordId=>({recordId})))?.some(target=>target.recordId===original.id)))enriched.set(original.id,{record:normalizeRecord(original),identifier});}
  for(const completion of completions){
    if(!completion||JSON.stringify(completion).length>20000)throw new TypeError('Use bounded completion metadata.');
    const record=normalizeRecord(completion.record),id=record.identifiers[0];
    if(!id||!['doi','isbn'].includes(id.scheme))throw new TypeError('Choose DOI or ISBN completion metadata.');
    if(completion.recordId){
      const original=records.find(record=>record.id===completion.recordId);
      if(!original||completionIds.has(original.id))throw new TypeError('Choose one completion per source reference.');
      const selected=input.decisions?.some(decision=>decision.action==='accept'&&(decision.targets || decision.recordIds?.map(recordId=>({recordId})))?.some(target=>target.recordId===original.id));
      if(!selected)continue;completionIds.add(original.id);
      enriched.set(original.id,{record:mergeCompletion(original,record).record,identifier:id});
    }else{
      const selected=input.decisions?.some(decision=>decision.action==='accept'&&(decision.targets || decision.recordIds?.map(recordId=>({recordId})))?.some(target=>{const value=typeof target.identifier==='string'&&normalizeIdentifier(/^[\dXx\s-]{10,30}$/.test(target.identifier)?'isbn:'+target.identifier:target.identifier);return value&&canonicalIdentifierKey(value)===canonicalIdentifierKey(id);}));
      if(selected)extra.push(record);
    }
  }
  // Validate the original local choices before replacing them with their accepted canonical identifiers.
  planImportEdits(source,input.review,{reviewId:input.reviewId,decisions:input.decisions,citationKeyword,identifierForm});
  const allocation=hostRecords?allocateImportRecords([...records.map(record=>enriched.get(record.id)?.record || normalizeRecord(record)),...extra],site,input):null;
  const decisions=input.decisions.map(decision=>({...decision,...((decision.targets||decision.recordIds)&&{targets:(decision.targets || decision.recordIds.map(recordId=>({recordId}))).map(target=>allocation?.mapping.has(target.recordId)?{recordId:allocation.mapping.get(target.recordId)}:enriched.has(target.recordId)?{identifier:enriched.get(target.recordId).identifier.scheme+':'+enriched.get(target.recordId).identifier.value}:target)})}));
  const outputReview=allocation?createImportReview(source,{schema:'citation-inator.import-matches.v1',matches:input.review.matches.map(match=>({...match,items:match.items.map(item=>({...item,candidates:item.candidates.map(candidate=>({...candidate,recordId:allocation.mapping.get(candidate.recordId) || candidate.recordId}))}))}))}):input.review;
  const plan=planImportEdits(source,outputReview,{reviewId:outputReview.reviewId,decisions,citationKeyword,identifierForm});
  const portable=[],owners=new Map(),ids=new Set();
  for(const rawRecord of (allocation?.records || [...records.map(record=>enriched.get(record.id)?.record || record),...extra])){
    const record=normalizeRecord(rawRecord);
    const identifiers=record.identifiers.filter(identifier=>!owners.has(canonicalIdentifierKey(identifier)));
    if(ids.has(record.id))continue;
    if(!identifiers.length&&!(allocation?.records || records).some(source=>source.id===record.id))continue;
    const aliases=record.identifiers.filter(identifier=>owners.has(canonicalIdentifierKey(identifier)));
    const next=normalizeRecord({...record,identifiers,provenance:[...record.provenance,...aliases.map(identifier=>({provider:'Import review',note:'Accepted identifier '+canonicalIdentifierKey(identifier)+' is shared with '+owners.get(canonicalIdentifierKey(identifier))+'. Source record retained separately.'}))]});
    portable.push(next);ids.add(record.id);for(const identifier of identifiers)owners.set(canonicalIdentifierKey(identifier),record.id);
  }
  const completedCache=makeCache(portable);
  const output=applyImportEdits(source,plan);
  const hasEndnotes=scanCitationMarkers(output.source,{citationKeyword}).some(marker=>markerKind(marker.raw,{citationKeyword})==='endnote');
  const partialNumeric=style==='vancouver' && current.matches.some((match,index)=>!plan.edits.some(edit=>edit.citationIndex===index));
  const previewNotice=partialNumeric ? 'Some original reference numbers remain. The reading preview is withheld until every numeric group is converted; the reviewed source remains available.' : '';
  const readingSource=model?model.document.bodyRanges.map(range=>{let part=source.slice(range.start,range.end);for(const edit of [...plan.edits].reverse())if(edit.start>=range.start&&edit.end<=range.end)part=part.slice(0,edit.start-range.start)+edit.text+part.slice(edit.end-range.start);return part;}).join('\n\n'):output.source;
  const reader=compileCitations(readableImportSource(readingSource)+(hasEndnotes?'':`\n\n{${citationKeyword} endnote}`),completedCache,{citationStyle:style,namespace,citationKeyword});
  return {...(allocation&&{recordMap:Object.fromEntries(allocation.mapping),newRecordIds:allocation.newRecordIds,reusedRecordIds:allocation.reusedRecordIds}),source:output.source,changed:output.changed,outcomes:plan.outcomes,edits:plan.edits,html:partialNumeric?'':reader.html,previewNotice,cache:completedCache,diagnostics:reader.diagnostics};
}

// Composable primitives for hosts that own their review presentation.
export {formatRecordId} from './compiler.mjs';
export {analyzeImportDocument,createDocumentImporter,partitionImportDocument} from './import-document.mjs';
export {createImportReview,planImportEdits,applyImportEdits} from './import-review.mjs';
export {extractImportText,detectExtractedCitations,mapImportRange} from './import-extraction.mjs';
export {parseInTextCitations,matchCitations} from './import-matcher.mjs';
export {parseReference,parseReferences} from './import-references.mjs';
export {detectCitationFormat} from './import-format.mjs';
export {IMPORT_LIMITS,normalizeImportLimits} from './import-limits.mjs';
export {createBrowserEnrichment,compareIdentity,automaticCandidate,mergeCompletion,normalizeImportIdentifier,enrichmentIdentifier,importSearchTitle,assessImportCandidate,rankImportCandidates} from './import-enrichment.mjs';
