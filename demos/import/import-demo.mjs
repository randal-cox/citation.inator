import {initializeCitationInspector} from '../../dist/citation-inspector.mjs';
import {realReferenceExample} from './real-reference-example.mjs';
const $=id=>document.getElementById(id);
const work=(id,family,year,title,extra={})=>({id,type:'book',state:year?'resolved':'partial',title,authors:[{family,given:({Avery:'Jordan',Bennett:'Sam',Duval:'Camille'})[family] || ''}],issued:year?[year]:null,publisher:'Example Press',publisherPlace:'Example City',...extra});
const examples={
 real:realReferenceExample,
 apa:{style:'apa',source:'Two books by Jordan Avery came out in 2021. This citation could refer to either book (Avery, 2021). So could this one (Avery, 2021).\n\nThis citation includes a page number (Bennett, 2019, p. 4). This one has no matching bibliography entry (Unknown, 2001).',records:[work('avery-gardens','Avery',2021,'How children learn together'),work('avery-fields','Avery',2021,'Learning through play'),work('bennett','Bennett',2019,'Teaching in small groups')],referenceText:'Avery, J. (2021). How children learn together. Example Press.\nAvery, J. (2021). Learning through play. Example Press.\nBennett, S. (2019). Teaching in small groups. Example Press.'},
 chicago:{style:'chicago-author-date',source:'We compare Avery (2021, 12) with an earlier edition (Duval [1898] 2004, 61).\n\nAvery, Bennett, and Chan (2020) offer another perspective.',records:[work('avery','Avery',2021,'How children learn together'),work('duval','Duval',2004,'An earlier edition',{originalIssued:[1898]}),work('three','Avery',2020,'Three perspectives',{authors:[{family:'Avery'},{family:'Bennett'},{family:'Chan'}]})],referenceText:'Avery, Jordan. 2021. How children learn together. Example Press.\nDuval, Camille. 2004. An earlier edition. Example Press.'},
 numeric:{style:'vancouver',source:'The first comparison uses one source [2]. Another uses a different numbered entry [7]. Together they appear as a group [2, 7].\n\nA missing number remains in the text [99].',records:[work('seven','Bennett',2019,'Seventh numbered entry',{referenceNumber:7}),work('two','Avery',2021,'Second numbered entry',{referenceNumber:2})],referenceText:'2. Avery J. Second numbered entry. Example Press. 2021.\n7. Bennett S. Seventh numbered entry. Example Press. 2019.'},
 undated:{style:'apa',source:'A missing date is not the same as an explicitly undated work (Avery, n.d., p. 5). A curator has explicitly marked the other record undated (Bennett, n.d.).',records:[work('avery-unknown','Avery',null,'Date not recorded'),work('bennett-undated','Bennett',null,'Explicitly undated',{undated:true})],referenceText:'Avery, J. (n.d.). Date not recorded.\nBennett, S. (n.d.). Explicitly undated.'}
};
let review=null,version=0,output=null,referenceRecords=[],activeGroup=null,closeTimer,convertingVersion=null,conversionTimer,analysisTimer,formatChoiceRequired=false;
const el=(tag,text)=>{const node=document.createElement(tag);if(text!==undefined)node.textContent=text;return node;};
function invalidate(message='') {
 closeReview();clearTimeout(conversionTimer);clearTimeout(analysisTimer);version++;review=null;output=null;$('converted-document').open=false;$('conversion-progress').hidden=true;$('detected-format').textContent='Detected format';$('format-choice').textContent='';$('evidence').hidden=true;$('evidence-json').textContent='';$('preview').setAttribute('aria-disabled','true');$('output-section').hidden=true;$('status').textContent=message;
 $('errors').textContent='';$('groups').replaceChildren();
}
function loadExample() {
 const sample=examples[$('example').value];invalidate('Loading example…');
 $('source').value=sample.source;$('style').value='auto';$('records').value=JSON.stringify(sample.records,null,2);$('reference-text').value=sample.referenceText;
 referenceRecords=sample.records;renderDocument();renderBibliography();
 $('groups').replaceChildren();$('evidence').hidden=true;
 void analyzeSource();
}
async function request(action,extra={}) {
 const records=JSON.parse($('records').value);
 const response=await fetch('./review',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({action,source:$('source').value,style:$('style').value,records,referenceText:$('reference-text').value,...extra})});
 const text=await response.text();let result;try{result=JSON.parse(text);}catch{throw Error(text||'The local demo server did not respond.');}
 if(!response.ok)throw Error(result.error||'The demo request failed.');return result;
}
function referenceText(record) {
 const names=(record.authors || []).map(author=>author.literal || [author.given,author.family].filter(Boolean).join(' ')).join('; ');
 const date=record.issued?.[0] ? String(record.issued[0]) : record.undated ? 'explicitly undated' : 'date not recorded';
 return [names || 'Author not supplied', record.originalIssued ? `${record.originalIssued[0]} / ${date}` : date, record.title || 'Title not supplied', record.containerTitle ? [record.containerTitle,record.volume && record.volume+(record.issue?'('+record.issue+')':''),record.pages || record.articleNumber].filter(Boolean).join(', ') : [record.publisher,record.publisherPlace].filter(Boolean).join(', ')].filter(Boolean).join('. ')+'.';
}
function renderBibliography() {
 $('reference-summary').replaceChildren(...referenceRecords.map(record=>{
  const row=el('p',`${record.referenceNumber ? record.referenceNumber+'. ' : ''}${referenceText(record)}`);row.dataset.referenceId=record.id;return row;
 }));
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
 const source=$('source').value,container=$('document-preview');container.replaceChildren();let cursor=0;
 for(const [index,match] of (review?.matches || []).entries()) {
  const citation=match.citation;container.append(document.createTextNode(source.slice(cursor,citation.start)));
  const anchor=el('button',citation.raw);anchor.type='button';anchor.dataset.reviewGroup=String(index);anchor.className='review-citation';
  const status=match.items.some(item=>item.state==='unmatched')?'unmatched':match.items.some(item=>item.state==='ambiguous')?'ambiguous':'candidate';
  anchor.dataset.matchState=status;anchor.setAttribute('aria-label',`Review citation ${index+1}: ${citation.raw} (${status})`);anchor.setAttribute('aria-expanded','false');anchor.setAttribute('aria-controls',`review-group-${index}`);anchor.setAttribute('aria-haspopup','dialog');
  anchor.addEventListener('pointerenter',event=>{if(event.pointerType!=='touch'&&!activeGroup?.contains(document.activeElement))openReview(index);});anchor.addEventListener('pointerleave',scheduleClose);
  anchor.addEventListener('click',()=>openReview(index,true));container.append(anchor);cursor=citation.end;
 }
 container.append(document.createTextNode(source.slice(cursor)));
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
 for(const group of $('groups').children)for(const button of group.querySelectorAll('[data-direction]'))button.disabled=!redTarget(Number(group.dataset.group),Number(button.dataset.direction));
}
function moveReview(index,direction) {
 const anchor=redTarget(index,direction);if(!anchor)return;
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
    const text=el('span');text.append(el('strong',record?.title || candidate.title || candidate.recordId));
    const byline=(record?.authors || []).map(author=>author.literal || [author.given,author.family].filter(Boolean).join(' ')).join('; ');
    text.append(el('small',[byline,record?.issued?.[0] || (record?.undated?'n.d.':''),record?.containerTitle || record?.publisher].filter(Boolean).join(' · ')));
    label.append(radio,text);fieldset.append(label);
   }
   const manualLabel=el('label');manualLabel.className='target-choice';const manual=el('input');manual.type='radio';manual.name=`target-${index}-${itemIndex}`;manual.dataset.manual='';manual.id=`manual-${index}-${itemIndex}`;
   manualLabel.append(manual,el('span','Use an identifier'));fieldset.append(manualLabel);
   const input=el('input');input.type='text';input.id=`identifier-${index}-${itemIndex}`;input.maxLength=2048;input.placeholder='Paste DOI, ISBN or HTTPS URL';input.setAttribute('aria-label',`Identifier for work ${itemIndex+1}`);
   input.addEventListener('input',()=>{manual.checked=true;});fieldset.append(input);
   const skipLabel=el('label');skipLabel.className='target-choice';const skip=el('input');skip.type='radio';skip.name=`target-${index}-${itemIndex}`;skip.dataset.skip='';skip.id=`skip-${index}-${itemIndex}`;skipLabel.append(skip,el('span',"Don't fix"));fieldset.append(skipLabel);group.append(fieldset);
  });
  const state=el('p','Not changed');state.className='item-state';state.setAttribute('aria-live','polite');
  const activeReview=review;
  if(match.items.every(proposal=>proposal.state==='unique' && proposal.candidates.length===1 && !proposal.item.boundaryUncertain)){group.dataset.action='accept';group.dataset.automatic='true';state.textContent='Selected automatically';}
  function changed() {
   if(review!==activeReview)return;
   version++;output=null;$('use-output').disabled=true;$('download').disabled=true;$('errors').textContent='';group.dataset.automatic='false';
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
  formatChoiceRequired=result.formatChoiceRequired;$('detected-format').textContent='Detected format: '+result.formatDetection.label;$('format-choice').textContent=formatChoiceRequired?'Choose a citation format.':'';
  review=result.review;referenceRecords=result.referenceRecords;renderBibliography();renderDocument();renderGroups();$('preview').setAttribute('aria-disabled',String(formatChoiceRequired));
  $('evidence-json').textContent=JSON.stringify({diagnostics:result.diagnostics,referenceRules:result.parsedReferences},null,2);$('evidence').hidden=false;
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
  if($('output-section').hidden)$('reading-details').open=false;output=result;$('use-output').disabled=false;$('download').disabled=false;$('output').value=result.source;$('outcomes').textContent=JSON.stringify(result.outcomes,null,2);
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
for(const id of ['source','records','reference-text'])$(id).addEventListener('input',()=>{invalidate();renderDocument();if(id==='records'){$('reference-summary').replaceChildren();}analysisTimer=setTimeout(()=>void analyzeSource(),300);});
document.addEventListener('keydown',event=>{
 const navigationIndex=activeGroup?.contains(event.target)?activeGroup.dataset.group:event.target.closest('[data-review-group]')?.dataset.reviewGroup;
 if(navigationIndex!==undefined && ['ArrowLeft','ArrowRight'].includes(event.key) && !event.altKey && !event.ctrlKey && !event.metaKey && !event.shiftKey && !event.target.closest('input:not([type="radio"]),textarea,select,[contenteditable]')){event.preventDefault();moveReview(Number(navigationIndex),event.key==='ArrowRight'?1:-1);return;}
 if(event.key==='Escape'&&activeGroup){const restore=activeGroup.contains(document.activeElement),anchor=document.querySelector(`[data-review-group="${activeGroup.dataset.group}"]`);closeReview();if(restore)anchor?.focus({preventScroll:true});}});
document.addEventListener('pointerdown',event=>{if(activeGroup&&!activeGroup.contains(event.target)&&!event.target.closest('[data-review-group]'))closeReview();});
window.addEventListener('resize',closeReview);
$('example').addEventListener('change',loadExample);
$('style').addEventListener('change',()=>void analyzeSource());
$('use-output').addEventListener('click',()=>{if(!output)return;const text=output.source;invalidate();$('source').value=text;$('groups').replaceChildren();renderDocument();void analyzeSource();});
$('download').addEventListener('click',()=>{if(!output)return;const url=URL.createObjectURL(new Blob([output.source],{type:'text/markdown;charset=utf-8'}));const link=el('a');link.href=url;link.download='reviewed-citations.md';link.click();setTimeout(()=>URL.revokeObjectURL(url),1000);});
loadExample();
