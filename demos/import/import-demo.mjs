import {initializeCitationInspector} from '../../dist/citation-inspector.mjs';
import {editTextSource} from './text-source.mjs';
import {documentExamples} from './document-examples.mjs';
const $=id=>document.getElementById(id);
let workingSource='',review=null,version=0,output=null,referenceRecords=[],referenceEntries=[],documentModel=null,originalFile=null,fileVersion=0,activeGroup=null,closeTimer,convertingVersion=null,conversionTimer,analysisTimer,formatChoiceRequired=false;
const setSource=text=>{workingSource=text;$('source').value=text;};
const el=(tag,text)=>{const node=document.createElement(tag);if(text!==undefined)node.textContent=text;return node;};
function invalidate(message='') {
 closeReview();clearTimeout(conversionTimer);clearTimeout(analysisTimer);version++;review=null;output=null;documentModel=null;referenceRecords=[];referenceEntries=[];$('reference-summary').replaceChildren();$('converted-document').open=false;$('conversion-progress').hidden=true;$('detected-format').textContent='Detected format';$('format-choice').textContent='';$('evidence').hidden=true;$('evidence-json').textContent='';$('preview').setAttribute('aria-disabled','true');$('output-section').hidden=true;$('status').textContent=message;
 $('errors').textContent='';$('groups').replaceChildren();
}
function loadExample() {
 fileVersion++;originalFile=null;$('download-original').hidden=true;$('input-name').textContent='';
 setSource(documentExamples[$('example').value]);$('style').value='auto';resetBoundary();void analyzeSource();
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
 const response=await fetch('./review',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({mode:'document',action,source:workingSource,style:$('style').value,bibliography:boundaryOptions(),...extra})});
 const text=await response.text();let result;try{result=JSON.parse(text);}catch{throw Error(text||'The local demo server did not respond.');}
 if(!response.ok)throw Error(result.error||'The demo request failed.');return result;
}
function renderBibliography() {
 $('reference-summary').replaceChildren(...referenceEntries.map(entry=>{const row=el('p',entry.raw);row.dataset.referenceId=entry.id;return row;}));
}
function closeReview() {
 clearTimeout(closeTimer);
 if(activeGroup) { activeGroup.hidden=true;const anchor=document.querySelector(`[data-review-group="${activeGroup.dataset.group}"]`);anchor?.setAttribute('aria-expanded','false'); }
 activeGroup=null;
}
function scheduleClose() {clearTimeout(closeTimer);closeTimer=setTimeout(()=>{if(!activeGroup?.contains(document.activeElement))closeReview();},300);}
function openReview(index,focus=false) {
 const group=$('groups').children[index],anchor=document.querySelector(`[data-review-group="${index}"]`);if(!group||!anchor)return;
 closeReview();activeGroup=group;group.hidden=false;anchor.setAttribute('aria-expanded','true');
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
   container.append(document.createTextNode(source.slice(cursor,citation.start)));
   const anchor=el('button',source.slice(citation.start,citation.end));anchor.type='button';anchor.dataset.reviewGroup=String(index);anchor.className='review-citation';
   const status=match.items.some(item=>item.state==='unmatched')?'unmatched':match.items.some(item=>item.state==='ambiguous')?'ambiguous':'candidate';
   anchor.dataset.matchState=status;anchor.setAttribute('aria-label',`Review citation ${index+1}: ${citation.raw} (${status})`);anchor.setAttribute('aria-expanded','false');anchor.setAttribute('aria-controls',`review-group-${index}`);anchor.setAttribute('aria-haspopup','dialog');
   anchor.addEventListener('pointerenter',event=>{if(event.pointerType!=='touch'&&!activeGroup?.contains(document.activeElement))openReview(index);});anchor.addEventListener('pointerleave',scheduleClose);
   anchor.addEventListener('click',()=>openReview(index,true));container.append(anchor);cursor=citation.end;
  }
  container.append(document.createTextNode(source.slice(cursor,range.end)));
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
 const state=group.dataset.needsSpan==='true' && group.dataset.action==='accept'?'needs-review':group.dataset.action==='accept'?'selected':group.dataset.action==='reject'?'kept':'needs-review';
 anchor.dataset.reviewState=state;
 const description=state==='selected'?(group.dataset.automatic==='true'?'Selected automatically':'Selected for replacement'):state==='kept'?'Left unchanged':'Needs review';
 anchor.setAttribute('aria-label',`Review citation ${Number(group.dataset.group)+1}: ${anchor.textContent} (${description.toLowerCase()})`);anchor.title=description;updateReviewNavigation();
}
function redTarget(index,direction) {
 const anchors=[...document.querySelectorAll('[data-review-group][data-review-state="needs-review"]')];
 return direction>0 ? anchors.find(anchor=>Number(anchor.dataset.reviewGroup)>index) : anchors.reverse().find(anchor=>Number(anchor.dataset.reviewGroup)<index);
}
function updateReviewNavigation() {
 for(const group of $('groups').children)for(const button of group.querySelectorAll('[data-direction]')){const direction=Number(button.dataset.direction),target=redTarget(Number(group.dataset.group),direction);button.disabled=false;button.setAttribute('aria-label',target?(direction>0?'Next red citation':'Previous red citation'):'Close review');button.title=target?(direction>0?'Next red citation':'Previous red citation'):'Close review';}
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
  header.append(caption,navigation);group.append(header);
  match.items.forEach((proposal,itemIndex)=>{
   const fieldset=el('fieldset');fieldset.dataset.item=String(itemIndex);
   fieldset.append(el('legend',`${match.items.length>1?'Work '+(itemIndex+1)+' · ':''}${proposal.candidates.length} suggested target${proposal.candidates.length===1?'':'s'}`));
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
   const input=el('input');input.type='text';input.id=`identifier-${index}-${itemIndex}`;input.maxLength=2048;input.placeholder='Paste DOI, ISBN or URL';input.setAttribute('aria-label',`Identifier for work ${itemIndex+1}`);
   input.addEventListener('input',()=>{manual.checked=true;});fieldset.append(input);
   const skipLabel=el('label');skipLabel.className='target-choice';const skip=el('input');skip.type='radio';skip.name=`target-${index}-${itemIndex}`;skip.dataset.skip='';skip.id=`skip-${index}-${itemIndex}`;skipLabel.append(skip,el('span',"Don't fix"));fieldset.append(skipLabel);group.append(fieldset);
  });
  const state=el('p','Not changed');state.className='item-state';state.setAttribute('aria-live','polite');
  const activeReview=review;
  if(match.items.every(proposal=>proposal.state==='unique' && proposal.candidates.length===1 && !proposal.item.boundaryUncertain)){group.dataset.action='accept';group.dataset.automatic='true';state.textContent='Selected automatically';}
  function changed() {
   if(review!==activeReview)return;
   version++;output=null;$('use-output').disabled=true;$('download').disabled=true;$('download-records').disabled=true;$('errors').textContent='';group.dataset.automatic='false';
   const targets=selectedTargets(group);
   group.dataset.action=targets.some(target=>target?.skip)?'reject':targets.every(target=>target && (target.recordId || target.identifier))?'accept':'defer';
   state.textContent=group.dataset.action==='reject'?"Won’t change":group.dataset.action==='accept'?(group.dataset.needsSpan==='true'?'Author span needs review':'Selected for replacement'):'Choose a target';
   updateReviewAppearance(group);$('preview').setAttribute('aria-disabled',String(formatChoiceRequired));$('status').textContent='';
   clearTimeout(conversionTimer);if($('converted-document').open){$('conversion-progress').hidden=false;conversionTimer=setTimeout(()=>{if($('converted-document').open)void convertDocument();},200);}
  }
  group.addEventListener('input',changed);group.addEventListener('change',changed);
  group.addEventListener('keydown',event=>{if(event.key==='Enter'&&event.target.matches('input[type="text"]'))event.preventDefault();});
  group.append(state);
  const details=el('details');details.append(el('summary','Matching evidence'),el('pre',JSON.stringify(match.items,null,2)));group.append(details);$('groups').append(group);updateReviewAppearance(group);
 });
}
async function analyzeSource() {
 invalidate('Analyzing…');const ticket=version;
 $('analyze-form').setAttribute('aria-busy','true');
 try {
  const result=await request('analyze');if(ticket!==version)return;
  documentModel=result.document;referenceEntries=result.referenceEntries || [];formatChoiceRequired=result.formatChoiceRequired || documentModel?.boundaryRequired;$('detected-format').textContent='Detected format: '+result.formatDetection.label;$('format-choice').textContent=documentModel?.boundaryRequired?'Choose the bibliography boundary.':result.formatChoiceRequired?'Choose a citation format.':'';
  review=result.review;referenceRecords=result.referenceRecords;renderBoundary();renderBibliography();renderDocument();renderGroups();$('preview').setAttribute('aria-disabled',String(formatChoiceRequired));
  $('evidence-json').textContent=JSON.stringify({diagnostics:result.diagnostics,document:documentModel,referenceRules:result.parsedReferences},null,2);$('evidence').hidden=false;
  $('status').textContent=`${review.matches.length} citations.`;
 } catch(error){if(ticket===version){$('errors').textContent=error.message;$('status').textContent='';}}
 finally{if(ticket===version)$('analyze-form').removeAttribute('aria-busy');}
}
async function convertDocument() {
 if(!review || formatChoiceRequired || convertingVersion===version)return;
 if(output){$('output-section').hidden=false;return;}
 const ticket=version;convertingVersion=ticket;$('errors').textContent='';$('status').textContent='Converting…';$('converted-document').setAttribute('aria-busy','true');$('conversion-progress').hidden=false;
 const decisions=[...$('groups').children].map((group,citationIndex)=>({citationIndex,action:group.dataset.action,targets:group.dataset.action==='accept'?selectedTargets(group):[]}));
 try {
  const result=await request('preview',{review,reviewId:review.reviewId,decisions});if(ticket!==version)return;
  for(const outcome of result.outcomes){if(outcome.state==='accepted-needs-span'||outcome.state==='accepted-needs-adapter'){const group=$('groups').children[outcome.citationIndex];group.dataset.action='defer';updateReviewAppearance(group);}}
  if($('output-section').hidden)$('reading-details').open=false;output=result;$('use-output').disabled=false;$('download').disabled=false;$('download-records').disabled=false;$('output').value=result.source;$('outcomes').textContent=JSON.stringify(result.outcomes,null,2);
  $('preview-notice').textContent=result.previewNotice ? 'Resolve remaining numbered citations to view this preview.' : '';
  const reader=$('reading-preview');reader.innerHTML=result.html;initializeCitationInspector(reader,{cache:result.cache});
  const explanations=result.outcomes.filter(outcome=>outcome.state==='accepted-needs-span'||outcome.state==='accepted-needs-adapter').map(outcome=>`Citation ${outcome.citationIndex+1}: ${outcome.state==='accepted-needs-span'?'review the author span':'review the source formatting'}.`);
  $('outcome-notes').replaceChildren(...explanations.map(text=>el('p',text)));
  $('output-section').hidden=false;$('status').textContent='Converted document ready.';
 }catch(error){if(ticket===version){$('errors').textContent=error.message;$('status').textContent='';$('output-section').hidden=true;}}
 finally{if(convertingVersion===ticket){convertingVersion=null;$('conversion-progress').hidden=true;$('converted-document').removeAttribute('aria-busy');}}
}
$('preview').addEventListener('click',event=>{if(!review || formatChoiceRequired)event.preventDefault();});
$('converted-document').addEventListener('toggle',()=>{if(!$('converted-document').open)clearTimeout(conversionTimer);else {if(!review || formatChoiceRequired){$('converted-document').open=false;return;}void convertDocument();}});
$('source').addEventListener('input',()=>{workingSource=editTextSource(workingSource,$('source').value);fileVersion++;resetBoundary();invalidate();renderDocument();analysisTimer=setTimeout(()=>void analyzeSource(),300);});
$('bibliography-start').addEventListener('change',()=>{$('boundary-custom').hidden=$('bibliography-start').value!=='custom';if($('bibliography-start').value==='custom'&&!$('start-line').value){invalidate();$('start-line').focus();return;}void analyzeSource();});
for(const id of ['start-line','end-line'])$(id).addEventListener('input',()=>{invalidate();analysisTimer=setTimeout(()=>void analyzeSource(),300);});
document.addEventListener('keydown',event=>{
 const navigationIndex=activeGroup?.contains(event.target)?activeGroup.dataset.group:event.target.closest('[data-review-group]')?.dataset.reviewGroup;
 if(navigationIndex!==undefined && ['ArrowLeft','ArrowRight'].includes(event.key) && !event.altKey && !event.ctrlKey && !event.metaKey && !event.shiftKey && !event.target.closest('input:not([type="radio"]),textarea,select,[contenteditable]')){event.preventDefault();moveReview(Number(navigationIndex),event.key==='ArrowRight'?1:-1);return;}
 if(event.key==='Escape'&&activeGroup){const restore=activeGroup.contains(document.activeElement),anchor=document.querySelector(`[data-review-group="${activeGroup.dataset.group}"]`);closeReview();if(restore)anchor?.focus({preventScroll:true});}});
document.addEventListener('pointerdown',event=>{if(activeGroup&&!activeGroup.contains(event.target)&&!event.target.closest('[data-review-group]'))closeReview();});
window.addEventListener('resize',closeReview);
$('example').addEventListener('change',loadExample);
$('style').addEventListener('change',()=>void analyzeSource());
$('use-output').addEventListener('click',()=>{if(!output)return;fileVersion++;const text=output.source;invalidate();setSource(text);$('groups').replaceChildren();renderDocument();void analyzeSource();});
function download(blob,name){const url=URL.createObjectURL(blob),link=el('a');link.href=url;link.download=name;link.click();setTimeout(()=>URL.revokeObjectURL(url),1000);}
$('download').addEventListener('click',()=>{if(output)download(new Blob([output.source],{type:'text/markdown;charset=utf-8'}),'reviewed-citations.md');});
$('download-records').addEventListener('click',()=>{if(output)download(new Blob([JSON.stringify(output.cache,null,2)+'\n'],{type:'application/json'}),'citations.json');});
$('download-original').addEventListener('click',()=>{if(originalFile)download(originalFile,originalFile.name);});
async function loadFile(files,origin='chosen'){
 const ticket=++fileVersion;
 try {
  if(files.length!==1)throw Error('Choose one .txt or .md file.');const file=files[0];
  if(!/\.(?:txt|md|markdown)$/iu.test(file.name))throw Error('Choose a .txt or .md file, or paste the document.');
  if(file.size>400000)throw Error('Use a file smaller than 400 KB.');
  let text;try{text=new TextDecoder('utf-8',{fatal:true,ignoreBOM:true}).decode(await file.arrayBuffer());}catch{throw Error('Use a UTF-8 text file.');}
  if(ticket!==fileVersion)return;if(text.length>100000)throw Error('Use a document of at most 100,000 characters.');
  originalFile=file;$('file-source-option').textContent=origin==='dropped'?'Dropped file':'Chosen file';$('example').value='';$('download-original').hidden=false;$('input-name').textContent=file.name;setSource(text);$('style').value='auto';resetBoundary();void analyzeSource();
 }catch(error){if(ticket===fileVersion)$('errors').textContent=error.message;}
}
$('choose-file').addEventListener('click',()=>$('import-file').click());
$('import-file').addEventListener('change',()=>{if($('import-file').files.length)void loadFile([...$('import-file').files]);$('import-file').value='';});
$('file-drop').addEventListener('dragover',event=>{event.preventDefault();});
$('file-drop').addEventListener('drop',event=>{event.preventDefault();void loadFile([...event.dataTransfer.files],'dropped');});
document.addEventListener('dragover',event=>{if(event.dataTransfer?.types.includes('Files'))event.preventDefault();});
document.addEventListener('drop',event=>{if(event.dataTransfer?.types.includes('Files'))event.preventDefault();});
loadExample();
