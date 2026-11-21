import {identityNeedsReview,identifierReady,resolvedIdentifierState,acceptIdentityOverride} from './identity-state.mjs';
import {processImportRequest} from '../../dist/citation-import.mjs';
import {movableReviewWindow} from './review-window.mjs';
import {citedWorkLabel,referenceDescription} from './review-labels.mjs';
import {reviewProgress,reviewReadiness} from './review-progress.mjs';
import {createBrowserEnrichment,compareIdentity,assessImportCandidate,rankImportCandidates,enrichmentIdentifier,normalizeImportIdentifier,normalizeImportLimits,readableImportSource} from './enrichment-browser.mjs';
import {initializeCitationInspector} from '../../dist/citation-inspector.mjs';
import {editTextSource} from './text-source.mjs';
import {documentExamples} from './document-examples.mjs';
const $=id=>document.getElementById(id);
const importOptions=JSON.parse($('citation-import-config')?.textContent || '{}'),importLimits=normalizeImportLimits(importOptions.limits);
let activeExampleSelection='apa',fileController=null;
let workingSource='',review=null,version=0,output=null,referenceRecords=[],referenceEntries=[],documentModel=null,originalFile=null,fileVersion=0,activeGroup=null,closeTimer,convertingVersion=null,conversionTimer,analysisTimer,formatChoiceRequired=false;
const setSource=text=>{workingSource=text;$('source').value=text;};
const el=(tag,text)=>{const node=document.createElement(tag);if(text!==undefined)node.textContent=text;return node;};
const reviewWindows=new WeakMap();
const completionStates=new Map(),lookup=createBrowserEnrichment();let lookupEpoch=0,manualLookupTimer;
const referenceIdentifier=source=>source?.identifiers?.find(id=>['doi','isbn'].includes(id.scheme));
const searchKind=source=>source.type==='book'?'isbn':source.type==='document'?'both':'doi';
const identifierMatches=count=>count+(count===1?' identifier match':' identifier matches');
const completionLabel=entry=>identityNeedsReview(entry)?'Identifier needs review':entry?.kept?'Kept without identifier':entry?.accepted?(entry.automatic?'DOI matched automatically':'Identifier selected'):entry?.label || 'Identifier needed';
function selectedRecordIds(){return new Set([...$('groups').children].filter(group=>group.dataset.action!=='reject').flatMap(group=>selectedTargets(group).filter(target=>target?.recordId).map(target=>target.recordId)));}
function selectedCompletionKeys(){return new Set([...$('groups').children].filter(group=>group.dataset.action!=='reject').flatMap(group=>selectedTargets(group).filter(Boolean).map(target=>target.recordId || 'manual:'+target.identifier)));}
function clearLookups(){clearTimeout(manualLookupTimer);lookupEpoch++;lookup.cancel();completionStates.clear();}
function completionData(){return [...completionStates].filter(([,entry])=>entry.accepted).map(([recordId,entry])=>({recordId:recordId.startsWith('manual:')?undefined:recordId,record:entry.accepted}));}
function invalidateOutput(){version++;output=null;for(const id of ['use-output','download','download-records'])$(id).disabled=true;clearTimeout(conversionTimer);if($('converted-document').open || $('reading-details').open){$('conversion-progress').hidden=false;conversionTimer=setTimeout(()=>void convertDocument(),200);}}
function refreshCompletions(){
 for(const group of $('groups').children){updateReviewAppearance(group);for(const field of group.querySelectorAll('fieldset[data-item]'))renderCompletion(field,group);}
 updateReviewNavigation();updateLookupSummary();
}
function renderCompletion(field,group){
 let area=field.querySelector('.identifier-completion');if(!area){area=el('div');area.className='identifier-completion';field.append(area);}
 const target=selectedTargets(group)[Number(field.dataset.item)],key=target?.recordId || (target?.identifier?'manual:'+target.identifier:'');
 if(group.dataset.action==='reject'||!key){area.replaceChildren();delete area.dataset.key;return;}
 const source=referenceRecords.find(record=>record.id===target.recordId) || {};
 const known=target.identifier&&normalizeImportIdentifier(target.identifier) || referenceIdentifier(source);area.hidden=Boolean(known)&&!identityNeedsReview(completionStates.get(key));if(area.hidden)return;
 if(area.dataset.key!==key){
  area.dataset.key=key;area.replaceChildren();
  const status=el('p');status.className='completion-status';status.setAttribute('role','status');
  const current=el('div');current.className='completion-current';const choices=el('div');choices.className='completion-choices';
  const change=el('button','Change identifier');change.type='button';change.className='completion-change';change.addEventListener('click',()=>{const entry=completionStates.get(key);if(!entry)return;entry.accepted=null;entry.proposed=null;entry.identityIssues=[];entry.identityOverride=false;entry.kept=false;entry.automatic=false;entry.state='choices';entry.label=identifierMatches(entry.candidates?.length || 0);invalidateOutput();refreshCompletions();group.focus({preventScroll:true});});
  const evidence=el('details');evidence.className='completion-evidence';evidence.append(el('summary','Provider evidence'),el('pre'));
  const conflict=el('p');conflict.className='completion-conflict';conflict.setAttribute('role','status');
  const override=el('button','Use this identifier anyway');override.type='button';override.className='completion-override';override.addEventListener('click',()=>{const entry=completionStates.get(key);if(entry?.proposalReviewId!==review?.reviewId||!selectedCompletionKeys().has(key))return;const proposal=entry?.proposed;if(!acceptIdentityOverride(entry,proposal))return;invalidateOutput();refreshCompletions();group.focus({preventScroll:true});});
  area.append(status,current,conflict,override,change,choices,evidence);
 }
 const entry=completionStates.get(key),proposed=entry?.accepted || entry?.proposed,status=area.querySelector('.completion-status');status.textContent=entry?.pending?'Looking up…':!entry&&target.identifier?'Identifier entered':completionLabel(entry);
 const current=area.querySelector('.completion-current');current.replaceChildren();if(proposed){if(identityNeedsReview(entry)){current.append(el('small','Retrieved reference'),el('strong',proposed.title || 'Title unavailable'),el('span',referenceDescription(proposed)));}current.append(el('span',proposed.identifiers.map(id=>id.scheme.toUpperCase()+': '+id.value).join(' · ')));}area.querySelector('.completion-change').hidden=!entry?.accepted||Boolean(known);
 const conflict=identityNeedsReview(entry);area.querySelector('.completion-conflict').hidden=!conflict;area.querySelector('.completion-conflict').textContent=conflict?'Check: '+entry.identityIssues.map(key=>({type:'publication type',containerTitle:'journal or collection',originalIssued:'original year'}[key] || key)).join(', '):'';area.querySelector('.completion-override').hidden=!conflict;
 const evidence=area.querySelector('.completion-evidence');evidence.hidden=!entry?.evidence;evidence.querySelector('pre').textContent=entry?.evidence?JSON.stringify({policy:entry.policy,evidence:entry.evidence},null,2):'';
 const choices=area.querySelector('.completion-choices');
 if(choices.contains(document.activeElement)){choices.addEventListener('focusout',()=>queueMicrotask(()=>renderCompletion(field,group)),{once:true});return;}
 const expandedMore=choices.querySelector('.more-results')?.open || false;choices.replaceChildren();const distant=[];
 for(const [index,{candidate,assessment}] of (known?[]:rankImportCandidates(source,entry?.candidates || [])).entries()){
  const label=el('label');label.className='target-choice';const radio=el('input');radio.type='radio';radio.name='completion-'+group.dataset.group+'-'+field.dataset.item;radio.value=String(index);radio.checked=proposed?.identifiers?.[0]?.scheme===candidate.identifiers[0]?.scheme&&proposed?.identifiers?.[0]?.value===candidate.identifiers[0]?.value;
  const text=el('span');text.append(el('strong',candidate.title || 'Untitled reference'));text.append(el('small',[candidate.authors.map(a=>a.literal || [a.given,a.family].filter(Boolean).join(' ')).join('; '),candidate.issued?.[0],candidate.publisher,candidate.edition,candidate.format,candidate.language].filter(Boolean).join(' · ')));text.append(el('small',candidate.identifiers.map(id=>id.scheme.toUpperCase()+': '+id.value).join(' · ')));
  const comparison=compareIdentity(source,candidate);const differences=Object.entries(comparison.comparisons).filter(([,match])=>!match).map(([key])=>({type:'reference type',containerTitle:'journal or collection',articleNumber:'article number',originalIssued:'original year'}[key] || key));if(differences.length)text.append(el('small','Check: '+differences.join(', ')));
  if(candidate.noticeRelations?.length)text.append(el('small','Publication notice: '+candidate.noticeRelations.map(item=>item.type).join(', ')));
  radio.addEventListener('change',event=>{event.stopPropagation();void acceptIdentifier(key,entry,candidate);});radio.addEventListener('input',event=>event.stopPropagation());label.append(radio,text);const suppliedYear=source.issued?.[0],candidateYear=candidate.issued?.[0];if((!assessment.primary||suppliedYear&&candidateYear&&Math.abs(suppliedYear-candidateYear)>2)&&!radio.checked)distant.push(label);else choices.append(label);
 }
 if(distant.length){const more=el('details');more.className='more-results';more.open=expandedMore;more.append(el('summary','Less likely results ('+distant.length+')'),...distant);choices.append(more);}
 const keepLabel=el('label');keepLabel.className='target-choice';const keep=el('input');keep.type='radio';keep.name='completion-'+group.dataset.group+'-'+field.dataset.item;keep.checked=Boolean(entry?.kept);keep.addEventListener('input',event=>event.stopPropagation());keep.addEventListener('change',event=>{event.stopPropagation();const current=completionStates.get(key)||{};current.accepted=null;current.proposed=null;current.identityIssues=[];current.identityOverride=false;current.kept=true;current.pending=false;current.run=(current.run||0)+1;completionStates.set(key,current);invalidateOutput();refreshCompletions();pumpLookups();});keepLabel.append(keep,el('span',target.identifier?'Keep as entered':'Keep without identifier'));if(!known)choices.append(keepLabel);
}
async function acceptIdentifier(key,entry,candidate){
 const epoch=lookupEpoch,activeReview=review,run=(entry.run || 0)+1;entry.run=run;entry.accepted=null;entry.proposed=candidate;entry.identityIssues=[];entry.identityOverride=false;entry.pending=true;entry.kept=false;entry.label='Checking identifier…';invalidateOutput();refreshCompletions();
 try{
  const id=candidate.identifiers[0],verified=await lookup.lookup({}, {identifier:id.scheme+':'+id.value});
  if(epoch!==lookupEpoch||review!==activeReview||entry.run!==run||!selectedCompletionKeys().has(key))return;
  entry.evidence=[...(entry.evidence || []),...verified.evidence];
  const resolved={...candidate,...verified.candidates[0],edition:candidate.edition || verified.candidates[0].edition,provenance:[...candidate.provenance,...verified.candidates[0].provenance]},source=referenceRecords.find(record=>record.id===key) || {};
  Object.assign(entry,resolvedIdentifierState(resolved,assessImportCandidate(source,resolved),source),{proposalReviewId:activeReview.reviewId,automatic:false});invalidateOutput();
 }catch(error){if(epoch!==lookupEpoch||review!==activeReview||entry.run!==run)return;entry.pending=false;entry.state='error';entry.label='Lookup unavailable';entry.evidence=[...(entry.evidence || []),{error:error.message}];}
 refreshCompletions();pumpLookups();
}
async function lookupReference(key,source,kind='doi',identifier){
const epoch=lookupEpoch,activeReview=review;
 const entry=completionStates.get(key)||{};if(entry.pending)return;entry.run=(entry.run||0)+1;const run=entry.run;entry.pending=true;entry.state='searching';entry.label='Looking up…';entry.kept=false;completionStates.set(key,entry);refreshCompletions();
 try{
  const result=await lookup.lookup(source,{kind,identifier});
  if(epoch!==lookupEpoch||review!==activeReview||entry.run!==run||!selectedCompletionKeys().has(key))return;
  Object.assign(entry,result,{pending:false,state:'choices',label:result.candidates.length?identifierMatches(result.candidates.length):'No identifier found'});
  if(result.automatic || identifier&&result.candidates.length===1){const candidate=result.automatic || result.candidates[0];Object.assign(entry,resolvedIdentifierState(candidate,assessImportCandidate(source,candidate),source),{proposalReviewId:activeReview.reviewId,automatic:Boolean(result.automatic)});invalidateOutput();}
 }catch(error){if(epoch!==lookupEpoch||review!==activeReview||entry.run!==run)return;entry.pending=false;entry.state='error';entry.label='Lookup unavailable';entry.evidence=[{error:error.message}];}
 refreshCompletions();pumpLookups();
}
function pumpLookups(){
 let active=[...completionStates.values()].filter(entry=>entry.pending).length;
 for(const key of selectedCompletionKeys()){
  if(active>=importLimits.parallelLookups)break;const entry=completionStates.get(key);if(entry?.state!=='queued')continue;
  const source=referenceRecords.find(record=>record.id===key) || {},identifier=key.startsWith('manual:')?key.slice(7):referenceIdentifier(source);
  active++;void lookupReference(key,source,searchKind(source),typeof identifier==='string'?identifier:identifier?identifier.scheme+':'+identifier.value:undefined);
 }
}
function startSelectedLookups(){
 for(const id of selectedRecordIds())if(!completionStates.has(id)||completionStates.get(id)?.state==='paused')completionStates.set(id,{state:'queued',label:'Queued'});
 pumpLookups();refreshCompletions();
}
function startManualLookups(){
 for(const key of selectedCompletionKeys())if(key.startsWith('manual:')&&enrichmentIdentifier(key.slice(7))&&!completionStates.has(key))completionStates.set(key,{state:'queued',label:'Queued'});
 pumpLookups();refreshCompletions();
}
function currentReviewProgress(){
 const groups=[...$('groups').children].map(group=>{
  const targets=selectedTargets(group);
  return {index:Number(group.dataset.group),skipped:group.dataset.action==='reject',sourceReview:group.dataset.needsSpan==='true'||group.dataset.action==='defer'&&targets.every(target=>target?.recordId || target?.identifier),items:targets.map(target=>{
   const key=target?.recordId || (target?.identifier?'manual:'+target.identifier:null),source=referenceRecords.find(record=>record.id===target?.recordId);
   return {key,selected:Boolean(key),lookupEligible:!target?.identifier||Boolean(enrichmentIdentifier(target.identifier)),invalid:Boolean(target?.identifier&&!normalizeImportIdentifier(target.identifier)),bibliographyMatched:Boolean(target?.recordId),known:Boolean(target?.identifier&&normalizeImportIdentifier(target.identifier)||referenceIdentifier(source)),metadata:completionStates.get(key)};
  })};
 });return {...reviewProgress(groups),...reviewReadiness(groups,{blocked:formatChoiceRequired||documentModel?.boundaryRequired})};
}
function updateLookupSummary(){
 const progress=currentReviewProgress(),failed=[...selectedCompletionKeys()].filter(key=>completionStates.get(key)?.state==='error').length;
 for(const [id,count] of [['lookup-pending-number',progress.lookingUp],['lookup-review-number',progress.needsReview]]){const button=$(id);if(button.textContent!==String(count))button.textContent=String(count);button.setAttribute('aria-label',String(count)+(id==='lookup-pending-number'?' looking up; go to first pending lookup':' need review; go to first item needing review'));button.setAttribute('aria-disabled',String(count===0));button.tabIndex=count?0:-1;button.parentElement.dataset.active=String(count>0);}
 const ready=$('lookup-ready-number');ready.textContent=progress.ready+'/'+progress.total+' · '+progress.readyPercent+'%';ready.setAttribute('aria-label',ready.textContent+' citations ready to convert; go to first ready citation');ready.setAttribute('aria-disabled',String(progress.ready===0));ready.tabIndex=progress.ready?0:-1;
 const retry=$('retry-lookups');retry.hidden=!failed&&document.activeElement!==retry;retry.setAttribute('aria-disabled',String(!failed));
 $('lookup-evidence').textContent=JSON.stringify([...completionStates].map(([key,entry])=>({reference:key,state:entry.state,identityIssues:entry.identityIssues,identityOverride:entry.identityOverride,policy:entry.policy,evidence:entry.evidence})),null,2);
}
for(const [id,kind] of [['lookup-ready-number','readyGroups'],['lookup-pending-number','lookupGroups'],['lookup-review-number','reviewGroups']])$(id).addEventListener('click',()=>{
 const index=currentReviewProgress()[kind][0];if(index===undefined)return;
 $('resolve-citations').open=true;const anchor=document.querySelector('[data-review-group="'+index+'"]');anchor?.scrollIntoView({block:'center',behavior:'instant'});openReview(index,true);
});
$('retry-lookups').addEventListener('click',()=>{
 for(const key of selectedCompletionKeys())if(completionStates.get(key)?.state==='error'){const entry=completionStates.get(key);entry.state='queued';entry.label='Queued';}
 pumpLookups();refreshCompletions();
});
$('retry-lookups').addEventListener('blur',updateLookupSummary);
function invalidate(message='') {
 clearLookups();closeReview();clearTimeout(conversionTimer);clearTimeout(analysisTimer);version++;review=null;output=null;documentModel=null;referenceRecords=[];referenceEntries=[];$('reference-summary').replaceChildren();$('converted-document').open=false;$('reading-details').open=false;$('reading-preview').replaceChildren();$('preview-notice').textContent='';$('conversion-progress').hidden=true;$('detected-format').textContent='Detected format';$('format-choice').textContent='';$('evidence').hidden=true;$('evidence-json').textContent='';$('preview').setAttribute('aria-disabled','true');$('output-section').hidden=true;$('status').textContent=message;
 $('errors').textContent='';$('groups').replaceChildren();updateLookupSummary();
}
async function loadExample() {
 fileController?.abort();const selected=$('example').value,ticket=++fileVersion;let text;
 if(selected.startsWith('local:')){
  try{const response=await fetch('./examples/'+encodeURIComponent(selected.slice(6))),data=await response.json();if(!response.ok)throw Error(data.error || 'Cannot read this example.');if(typeof data.source!=='string'||data.source.length>importLimits.sourceCharacters)throw Error('Use a document of at most '+importLimits.sourceCharacters.toLocaleString('en')+' characters.');if(ticket!==fileVersion)return;text=data.source;}
  catch(error){if(ticket===fileVersion){$('example').value=activeExampleSelection;$('errors').textContent=error.message;}return;}
 }else text=documentExamples[selected];
 if(ticket!==fileVersion)return;
 lookup.reset();originalFile=null;$('file-extraction').hidden=true;$('file-extraction-json').textContent='';$('download-original').hidden=true;$('input-name').textContent='';activeExampleSelection=selected;
 setSource(text);$('style').value='auto';resetBoundary();void analyzeSource();
}
function resetBoundary() {$('bibliography-start').value='auto';$('boundary-custom').hidden=true;$('start-line').value='';$('end-line').value='';}
function boundaryOptions() {
 const selected=$('bibliography-start').value;
 const startLine=selected==='custom'?Number($('start-line').value):['auto','none'].includes(selected)?selected:Number(selected);
 if(selected==='custom'&&!Number.isSafeInteger(startLine) || selected==='custom'&&startLine<1)throw Error('Enter the bibliography start line.');
 return {startLine,endLine:selected==='custom'&&$('end-line').value?Number($('end-line').value):null};
}
function renderBoundary() {
 const selected=$('bibliography-start').value;
 const options=[new Option('Detect bibliography','auto'),new Option('No bibliography','none'),new Option('Custom lines','custom'),...(documentModel?.headings || []).map(item=>new Option(`${item.label} · line ${item.line}`,String(item.line)))];
 $('bibliography-start').replaceChildren(...options);$('bibliography-start').value=options.some(option=>option.value===selected)?selected:'auto';
}
async function request(action,extra={}) {
 const input={limits:importLimits,mode:'document',action,source:workingSource,style:$('style').value,bibliography:boundaryOptions(),...extra};
 if(importOptions.processing!=='server')return processImportRequest(input);
 const response=await fetch('./review',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(input)});
 const text=await response.text();let result;try{result=JSON.parse(text);}catch{throw Error(text||'Import server unavailable.');}
 if(!response.ok)throw Error(result.error||'Import request failed.');return result;
}
function renderBibliography() {
 $('reference-summary').replaceChildren(...referenceEntries.map(entry=>{const row=el('p',entry.raw);row.dataset.referenceId=entry.id;return row;}));
}
function closeReview() {
 clearTimeout(closeTimer);
 if(activeGroup) { reviewWindows.get(activeGroup)?.cancel();activeGroup.hidden=true;const anchor=document.querySelector(`[data-review-group="${activeGroup.dataset.group}"]`);anchor?.setAttribute('aria-expanded','false'); }
 activeGroup=null;
}
function scheduleClose() {clearTimeout(closeTimer);closeTimer=setTimeout(()=>{if(activeGroup?.dataset.pinned!=='true'&&!activeGroup?.contains(document.activeElement))closeReview();},300);}
function openReview(index,focus=false) {
 const group=$('groups').children[index],anchor=document.querySelector(`[data-review-group="${index}"]`);if(!group||!anchor)return;
 if(activeGroup===group){clearTimeout(closeTimer);if(focus)group.focus({preventScroll:true});return;}
 closeReview();activeGroup=group;group.hidden=false;anchor.setAttribute('aria-expanded','true');
 if(reviewWindows.get(group)?.placed){reviewWindows.get(group).fit();if(focus)group.focus({preventScroll:true});return;}
 const rect=anchor.getBoundingClientRect(),width=Math.min(570,window.innerWidth-24);group.style.width=width+'px';
 group.style.left=Math.min(Math.max(12,rect.left),window.innerWidth-width-12)+'px';
 const below=window.innerHeight-rect.bottom-20,above=rect.top-20;
 if(below>=180) { group.style.maxHeight=below+'px';group.style.top=(rect.bottom+8)+'px'; }
 else if(above>=180) { group.style.maxHeight=above+'px';group.style.top=Math.max(12,rect.top-Math.min(group.scrollHeight,above)-8)+'px'; }
 else {group.style.maxHeight=(window.innerHeight-24)+'px';group.style.top='12px';}
 if(focus)group.focus({preventScroll:true});
}
function renderDocument() {
 const source=workingSource,container=$('document-preview');container.replaceChildren();
 const ranges=documentModel?.bodyRanges || [{start:0,end:source.length}];
 for(const range of ranges){let cursor=range.start;
  for(const [index,match] of (review?.matches || []).entries()) {
   const citation=match.citation;if(citation.start<range.start || citation.end>range.end || citation.start<cursor)continue;
   container.append(document.createTextNode(readableImportSource(source.slice(cursor,citation.start))));
   const anchor=el('button',source.slice(citation.start,citation.end));anchor.type='button';anchor.dataset.reviewGroup=String(index);anchor.className='review-citation';
   const status=match.items.some(item=>item.state==='unmatched')?'unmatched':match.items.some(item=>item.state==='ambiguous')?'ambiguous':'candidate';
   anchor.dataset.matchState=status;anchor.setAttribute('aria-label',`Review citation ${index+1}: ${citation.raw} (${status})`);anchor.setAttribute('aria-expanded','false');anchor.setAttribute('aria-controls',`review-group-${index}`);anchor.setAttribute('aria-haspopup','dialog');
   anchor.addEventListener('pointerenter',event=>{if(event.pointerType!=='touch'&&!activeGroup?.contains(document.activeElement))openReview(index);});anchor.addEventListener('pointerleave',scheduleClose);
   anchor.addEventListener('click',()=>openReview(index,true));container.append(anchor);cursor=citation.end;
  }
  container.append(document.createTextNode(readableImportSource(source.slice(cursor,range.end).trimEnd())));
 }
}
function selectedTargets(group) {
 return [...group.querySelectorAll('fieldset[data-item]')].map(fieldset=>{
  const radio=fieldset.querySelector('input[type="radio"]:checked');
  if(!radio)return null;
  if(radio.dataset.skip!==undefined)return {skip:true};
  return radio.dataset.manual!==undefined ? {identifier:fieldset.querySelector('input[type="text"]').value.trim()} : {recordId:radio.value};
 });
}
function updateReviewAppearance(group) {
 const anchor=document.querySelector(`[data-review-group="${group.dataset.group}"]`);if(!anchor)return;
 const targets=selectedTargets(group),entries=targets.map(target=>target?.recordId?completionStates.get(target.recordId):target?.identifier?completionStates.get('manual:'+target.identifier):null);
 const ready=targets.every((target,index)=>(!target?.identifier || normalizeImportIdentifier(target.identifier))&&identifierReady(entries[index],Boolean(target?.identifier&&normalizeImportIdentifier(target.identifier)||target?.recordId&&referenceIdentifier(referenceRecords.find(record=>record.id===target.recordId)))));
 const identityReview=entries.some(identityNeedsReview);
 const invalidManual=targets.some(target=>target?.identifier&&!normalizeImportIdentifier(target.identifier));
 const unmatched=group.dataset.action==='defer'&&review.matches[Number(group.dataset.group)].items.some(item=>item.state==='unmatched');
 const state=group.dataset.action==='reject'?'kept':group.dataset.needsSpan==='true'||invalidManual||identityReview?'needs-review':group.dataset.action==='accept'?(ready?'selected':'completing'):unmatched?'unmatched':'needs-review';
 for(const [itemIndex,target] of targets.entries()){const badge=group.querySelector('[data-item-state="'+itemIndex+'"]');if(!badge)continue;const entry=entries[itemIndex],source=referenceRecords.find(record=>record.id===target?.recordId),known=Boolean(target?.identifier&&normalizeImportIdentifier(target.identifier)||referenceIdentifier(source));badge.textContent=group.dataset.action==='reject'?'Left unchanged':identityNeedsReview(entry)?'Needs review':!target?'Choose reference':identifierReady(entry,known)?'Ready':entry?.pending?'Looking up…':completionLabel(entry);}
 anchor.dataset.reviewState=state;
 const description=state==='selected'?'Reference ready':state==='completing'?entries.map(completionLabel).join('; '):state==='kept'?'Left unchanged':state==='unmatched'?'Unmatched':'Needs review';
 anchor.setAttribute('aria-label',`Review citation ${Number(group.dataset.group)+1}: ${anchor.textContent} (${description.toLowerCase()})`);anchor.title=description;updateReviewNavigation();
}
function redTarget(index,direction) {
 const reviewIndices=new Set(currentReviewProgress().reviewGroups);
 const anchors=[...document.querySelectorAll('[data-review-group]')].filter(anchor=>reviewIndices.has(Number(anchor.dataset.reviewGroup)));
 return direction>0 ? anchors.find(anchor=>Number(anchor.dataset.reviewGroup)>index) : anchors.reverse().find(anchor=>Number(anchor.dataset.reviewGroup)<index);
}
function updateReviewNavigation() {
 for(const group of $('groups').children)for(const button of group.querySelectorAll('[data-direction]')){const direction=Number(button.dataset.direction),target=redTarget(Number(group.dataset.group),direction);button.disabled=false;button.setAttribute('aria-label',target?(direction>0?'Next unresolved citation':'Previous unresolved citation'):'Close review');button.title=target?(direction>0?'Next unresolved citation':'Previous unresolved citation'):'Close review';}
}
function moveReview(index,direction) {
 const anchor=redTarget(index,direction);if(!anchor){if(activeGroup){const restore=activeGroup.contains(document.activeElement),trigger=document.querySelector(`[data-review-group="${activeGroup.dataset.group}"]`);closeReview();if(restore)trigger?.focus({preventScroll:true});}return;}
 anchor.scrollIntoView({block:'center',behavior:'instant'});openReview(Number(anchor.dataset.reviewGroup),true);
}
function renderGroups() {
 $('groups').replaceChildren();
 review.matches.forEach((match,index)=>{
  const group=el('div');group.className='citation-group';group.dataset.group=String(index);group.dataset.action='defer';group.dataset.needsSpan=String(match.items.some(proposal=>proposal.item.boundaryUncertain));group.id=`review-group-${index}`;group.hidden=true;group.tabIndex=-1;
  group.addEventListener('pointerenter',()=>clearTimeout(closeTimer));group.addEventListener('pointerleave',scheduleClose);group.addEventListener('focusout',scheduleClose);
  const caption=el('blockquote',match.citation.raw);caption.id=`group-label-${index}`;group.setAttribute('role','dialog');group.setAttribute('aria-labelledby',caption.id);
  const header=el('div');header.className='review-header';const navigation=el('nav');navigation.className='review-navigation';navigation.setAttribute('aria-label','Unresolved citations');
  for(const [direction,icon,name,key] of [[-1,'←','Previous','ArrowLeft'],[1,'→','Next','ArrowRight']]) {
   const button=el('button',icon);button.type='button';button.dataset.direction=String(direction);button.setAttribute('aria-label',name+' red citation');button.title=name+' red citation ('+(direction>0?'Right':'Left')+' arrow; Up/Down changes radio choice)';button.setAttribute('aria-keyshortcuts',key);button.addEventListener('click',()=>moveReview(index,direction));navigation.append(button);
  }
  header.append(caption,navigation);group.append(header);if(match.items.length>1){const count=el('p',match.items.length+' references');count.className='work-count';group.append(count);}
  match.items.forEach((proposal,itemIndex)=>{
   const fieldset=el('fieldset');fieldset.dataset.item=String(itemIndex);const workLabel=citedWorkLabel(proposal.item);fieldset.setAttribute('aria-label','Bibliography match for '+workLabel);
   fieldset.append(el('legend',`${proposal.candidates.length} suggested target${proposal.candidates.length===1?'':'s'}`));
   if(!proposal.candidates.length){const name=proposal.item.authors?.[0]?.normalize('NFKC').toLocaleLowerCase('en'),related=referenceRecords.some(record=>record.authors?.some(author=>(author.family || author.literal || '').normalize('NFKC').toLocaleLowerCase('en')===name)),unparsed=referenceRecords.some(record=>!record.authors?.length);fieldset.append(el('p',related?'Author found; check year and edition':unparsed?'No match; check the unparsed bibliography entries':'No matching bibliography entry'));}
   for(const [candidateIndex,candidate] of proposal.candidates.entries()) {
    const record=referenceRecords.find(record=>record.id===candidate.recordId),label=el('label');label.className='target-choice';
    const radio=el('input');radio.type='radio';radio.name=`target-${index}-${itemIndex}`;radio.value=candidate.recordId;radio.checked=proposal.state==='unique' && proposal.candidates.length===1 && !proposal.item.boundaryUncertain;radio.id=`target-${index}-${itemIndex}-${candidateIndex}`;
    const text=el('span');text.append(el('strong',record?.title || referenceEntries.find(entry=>entry.id===candidate.recordId)?.raw || candidate.title || candidate.recordId));
    const byline=(record?.authors || []).map(author=>author.literal || [author.given,author.family].filter(Boolean).join(' ')).join('; ');
    text.append(el('small',[byline,record?.issued?.[0] || (record?.undated?'n.d.':''),record?.containerTitle || record?.publisher].filter(Boolean).join(' · ')));
    label.append(radio,text);fieldset.append(label);
   }
   const manualLabel=el('label');manualLabel.className='target-choice';const manual=el('input');manual.type='radio';manual.name=`target-${index}-${itemIndex}`;manual.dataset.manual='';manual.id=`manual-${index}-${itemIndex}`;
   manualLabel.append(manual,el('span','Use an identifier'));fieldset.append(manualLabel);
   const input=el('input');input.type='text';input.id=`identifier-${index}-${itemIndex}`;input.maxLength=2048;input.placeholder='Paste DOI, ISBN or URL';input.setAttribute('aria-label',`Identifier for ${workLabel}`);
   input.addEventListener('input',()=>{manual.checked=true;});fieldset.append(input);
   const skipLabel=el('label');skipLabel.className='target-choice';const skip=el('input');skip.type='radio';skip.name=`target-${index}-${itemIndex}`;skip.dataset.skip='';skip.id=`skip-${index}-${itemIndex}`;skipLabel.append(skip,el('span',match.items.length>1?'Leave entire citation unchanged':"Don't fix"));fieldset.append(skipLabel);if(match.items.length>1){const work=el('details');work.className='work-review';work.open=true;const summary=el('summary');summary.append(el('span',workLabel));const state=el('small');state.className='work-status';state.dataset.itemState=String(itemIndex);summary.append(state);const body=el('div');body.className='work-review-body';body.append(fieldset);work.append(summary,body);group.append(work);}else group.append(fieldset);
  });
  const state=el('p','');state.className='item-state';state.setAttribute('aria-live','polite');
  const activeReview=review;
  if(match.items.every(proposal=>proposal.state==='unique' && proposal.candidates.length===1 && !proposal.item.boundaryUncertain)){group.dataset.action='accept';group.dataset.automatic='true';state.textContent='';}
  function changed() {
   if(review!==activeReview)return;
   version++;output=null;$('use-output').disabled=true;$('download').disabled=true;$('download-records').disabled=true;$('errors').textContent='';group.dataset.automatic='false';
   const targets=selectedTargets(group);
   group.dataset.action=targets.some(target=>target?.skip)?'reject':targets.every(target=>target && (target.recordId || target.identifier))?'accept':'defer';
   state.textContent=group.dataset.action==='reject'?"Won’t change":group.dataset.action==='accept'?(group.dataset.needsSpan==='true'?'Author span needs review':''):'Choose a target';
   for(const [key,entry] of completionStates)if(!selectedCompletionKeys().has(key)&&entry.pending){entry.run++;entry.pending=false;entry.state='paused';entry.label='Lookup paused';}
   refreshCompletions();startSelectedLookups();clearTimeout(manualLookupTimer);manualLookupTimer=setTimeout(startManualLookups,500);$('preview').setAttribute('aria-disabled',String(formatChoiceRequired));$('status').textContent='';
   clearTimeout(conversionTimer);if($('converted-document').open || $('reading-details').open){$('conversion-progress').hidden=false;conversionTimer=setTimeout(()=>{if($('converted-document').open || $('reading-details').open)void convertDocument();},200);}
  }
  group.addEventListener('input',changed);group.addEventListener('change',changed);
  group.addEventListener('keydown',event=>{if(event.key==='Enter'&&event.target.matches('input[type="text"]'))event.preventDefault();});
  group.append(state);
  const details=el('details');details.append(el('summary','Matching evidence'),el('pre',JSON.stringify(match.items,null,2)));group.append(details);const content=el('div');content.className='review-content';content.append(...[...group.childNodes].filter(node=>node!==header));group.replaceChildren(header,content);reviewWindows.set(group,movableReviewWindow(group,{onInteract:()=>clearTimeout(closeTimer)}));$('groups').append(group);updateReviewAppearance(group);
 });
}
async function analyzeSource() {
 invalidate('Analyzing…');renderDocument();const ticket=version;
 $('analyze-form').setAttribute('aria-busy','true');
 try {
  const result=await request('analyze');if(ticket!==version)return;
  documentModel=result.document;referenceEntries=result.referenceEntries || [];formatChoiceRequired=result.formatChoiceRequired || documentModel?.boundaryRequired;$('detected-format').textContent='Detected format: '+result.formatDetection.label;$('format-choice').textContent=documentModel?.boundaryRequired?'Choose the bibliography boundary.':result.formatChoiceRequired?'Choose a citation format.':'';
  review=result.review;referenceRecords=result.referenceRecords;renderBoundary();renderBibliography();renderDocument();renderGroups();refreshCompletions();startSelectedLookups();clearTimeout(manualLookupTimer);manualLookupTimer=setTimeout(startManualLookups,500);$('preview').setAttribute('aria-disabled',String(formatChoiceRequired));
  $('evidence-json').textContent=JSON.stringify({diagnostics:result.diagnostics,document:documentModel,referenceRules:result.parsedReferences},null,2);$('evidence').hidden=false;
  $('status').textContent=`${review.matches.length} citations.`;
 } catch(error){if(ticket===version){$('errors').textContent=error.message;$('status').textContent='';}}
 finally{if(ticket===version)$('analyze-form').removeAttribute('aria-busy');}
}
async function convertDocument() {
 if(!review || formatChoiceRequired || convertingVersion===version)return;
 if(output){$('output-section').hidden=false;return;}
 const ticket=version;convertingVersion=ticket;$('reading-preview').inert=true;$('reading-details').setAttribute('aria-busy','true');$('preview-notice').textContent='Converting…';$('errors').textContent='';$('status').textContent='Converting…';$('converted-document').setAttribute('aria-busy','true');$('conversion-progress').hidden=false;
 const decisions=[...$('groups').children].map((group,citationIndex)=>{const targets=selectedTargets(group),conflict=targets.some(target=>identityNeedsReview(completionStates.get(target?.recordId || (target?.identifier?'manual:'+target.identifier:''))));return {citationIndex,action:conflict?'defer':group.dataset.action,targets:!conflict&&group.dataset.action==='accept'?targets:[]};});
 try {
  const result=await request('preview',{review,reviewId:review.reviewId,decisions,completions:completionData()});if(ticket!==version)return;
  for(const outcome of result.outcomes){if(outcome.state==='accepted-needs-span'||outcome.state==='accepted-needs-adapter'){const group=$('groups').children[outcome.citationIndex];group.dataset.action='defer';updateReviewAppearance(group);}}
  output=result;$('use-output').disabled=false;$('download').disabled=false;$('download-records').disabled=false;$('output').value=result.source;$('outcomes').textContent=JSON.stringify(result.outcomes,null,2);
  $('preview-notice').textContent=result.previewNotice ? 'Resolve remaining numbered citations to view this preview.' : '';
  const reader=$('reading-preview');reader.innerHTML=result.html;initializeCitationInspector(reader,{cache:result.cache});
  const explanations=result.outcomes.filter(outcome=>outcome.state==='accepted-needs-span'||outcome.state==='accepted-needs-adapter').map(outcome=>`Citation ${outcome.citationIndex+1}: ${outcome.state==='accepted-needs-span'?'review the author span':'review the source formatting'}.`);
  $('outcome-notes').replaceChildren(...explanations.map(text=>el('p',text)));
  $('reading-preview').inert=false;$('output-section').hidden=false;$('status').textContent='Converted document ready.';
 }catch(error){if(ticket===version){$('errors').textContent=error.message;$('status').textContent='';$('output-section').hidden=true;}}
 finally{if(convertingVersion===ticket){convertingVersion=null;$('conversion-progress').hidden=true;$('converted-document').removeAttribute('aria-busy');$('reading-details').removeAttribute('aria-busy');}}
}
$('preview').addEventListener('click',event=>{if(!review || formatChoiceRequired)event.preventDefault();});
$('converted-document').addEventListener('toggle',()=>{if(!$('converted-document').open&&!$('reading-details').open)clearTimeout(conversionTimer);else {if(!review || formatChoiceRequired){$('converted-document').open=false;return;}void convertDocument();}});
$('reading-details').addEventListener('toggle',()=>{if($('reading-details').open){if(!review || formatChoiceRequired){$('reading-details').open=false;return;}void convertDocument();}});
$('source').addEventListener('input',()=>{workingSource=editTextSource(workingSource,$('source').value);fileVersion++;fileController?.abort();resetBoundary();invalidate();renderDocument();analysisTimer=setTimeout(()=>void analyzeSource(),300);});
$('bibliography-start').addEventListener('change',()=>{$('boundary-custom').hidden=$('bibliography-start').value!=='custom';if($('bibliography-start').value==='custom'&&!$('start-line').value){invalidate();$('start-line').focus();return;}void analyzeSource();});
for(const id of ['start-line','end-line'])$(id).addEventListener('input',()=>{invalidate();analysisTimer=setTimeout(()=>void analyzeSource(),300);});
document.addEventListener('keydown',event=>{
 const navigationIndex=activeGroup?.contains(event.target)?activeGroup.dataset.group:event.target.closest('[data-review-group]')?.dataset.reviewGroup;
 if(navigationIndex!==undefined && ['ArrowLeft','ArrowRight'].includes(event.key) && !event.altKey && !event.ctrlKey && !event.metaKey && !event.shiftKey && !event.target.closest('input:not([type="radio"]),textarea,select,[contenteditable]')){event.preventDefault();moveReview(Number(navigationIndex),event.key==='ArrowRight'?1:-1);return;}
 if(event.key==='Escape'&&activeGroup){const restore=activeGroup.contains(document.activeElement),anchor=document.querySelector(`[data-review-group="${activeGroup.dataset.group}"]`);closeReview();if(restore)anchor?.focus({preventScroll:true});}});
document.addEventListener('pointerdown',event=>{if(activeGroup&&!activeGroup.contains(event.target)&&!event.target.closest('[data-review-group]'))closeReview();});
window.addEventListener('resize',()=>{if(activeGroup)reviewWindows.get(activeGroup)?.fit();});
$('resolve-citations').addEventListener('toggle',()=>{if(!$('resolve-citations').open)closeReview();});
$('example').addEventListener('change',loadExample);
$('style').addEventListener('change',()=>void analyzeSource());
$('use-output').addEventListener('click',()=>{if(!output)return;fileVersion++;const text=output.source;invalidate();setSource(text);$('groups').replaceChildren();renderDocument();void analyzeSource();});
function download(blob,name){const url=URL.createObjectURL(blob),link=el('a');link.href=url;link.download=name;link.click();setTimeout(()=>URL.revokeObjectURL(url),1000);}
$('download').addEventListener('click',()=>{if(output)download(new Blob([output.source],{type:'text/markdown;charset=utf-8'}),'reviewed-citations.md');});
$('download-records').addEventListener('click',()=>{if(output)download(new Blob([JSON.stringify(output.cache,null,2)+'\n'],{type:'application/json'}),'citations.json');});
$('download-original').addEventListener('click',()=>{if(originalFile)download(originalFile,originalFile.name);});
async function loadFile(files,origin='chosen'){
 fileController?.abort();const controller=fileController=new AbortController(),ticket=++fileVersion;
 try {
  if(files.length!==1)throw Error('Choose one document.');const file=files[0];
  if(!/\.(?:txt|md|markdown|pdf|docx|odt)$/iu.test(file.name))throw Error('Choose a TXT, Markdown, PDF, DOCX or ODT file.');
  if(file.size>importLimits.fileBytes)throw Error('Use a file smaller than '+(importLimits.fileBytes/1000000)+' MB.');
  let text,extraction;
  if(/\.(?:pdf|docx|odt)$/iu.test(file.name)){const {extractImportFile}=await import('../../dist/citation-import-files.mjs');extraction=await extractImportFile(file,{limits:importLimits,signal:controller.signal});text=extraction.text;}
  else {try{text=new TextDecoder('utf-8',{fatal:true,ignoreBOM:true}).decode(await file.arrayBuffer());}catch{throw Error('Use a UTF-8 text file.');}}
  if(ticket!==fileVersion)return;if(text.length>importLimits.sourceCharacters)throw Error('Use a document of at most '+importLimits.sourceCharacters.toLocaleString('en')+' characters.');
  $('file-extraction').hidden=!extraction;$('file-extraction-json').textContent=extraction?JSON.stringify({...extraction,text:undefined},null,2):'';
  lookup.reset();activeExampleSelection='';originalFile=file;$('file-source-option').textContent=origin==='dropped'?'Dropped file':'Chosen file';$('example').value='';$('download-original').hidden=false;$('input-name').textContent=file.name;setSource(text);$('style').value='auto';resetBoundary();void analyzeSource();
 }catch(error){if(ticket===fileVersion)$('errors').textContent=error.message;}
}
$('choose-file').addEventListener('click',()=>$('import-file').click());
$('import-file').addEventListener('change',()=>{if($('import-file').files.length)void loadFile([...$('import-file').files]);$('import-file').value='';});
$('file-drop').addEventListener('dragover',event=>{event.preventDefault();});
$('file-drop').addEventListener('drop',event=>{event.preventDefault();void loadFile([...event.dataTransfer.files],'dropped');});
document.addEventListener('dragover',event=>{if(event.dataTransfer?.types.includes('Files'))event.preventDefault();});
document.addEventListener('drop',event=>{if(event.dataTransfer?.types.includes('Files'))event.preventDefault();});

async function loadLocalExamples(){try{const response=await fetch('./examples');if(!response.ok)return;const examples=await response.json();if(!examples.length)return;const group=el('optgroup');group.label='Your documents';for(const item of examples)group.append(new Option(item.label,'local:'+item.id));$('example').append(group);}catch{ /* Public demos have no private corpus catalogue. */ }}
$('example').disabled=true;await loadLocalExamples();$('example').disabled=false;void loadExample();
