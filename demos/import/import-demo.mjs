import {initializeCitationInspector} from '../../dist/citation-inspector.mjs';
const $=id=>document.getElementById(id);
const work=(id,family,year,title,extra={})=>({id,type:'book',state:year?'resolved':'partial',title,authors:[{family,given:({Avery:'Jordan',Bennett:'Sam',Duval:'Camille'})[family] || ''}],issued:year?[year]:null,publisher:'Example Press',publisherPlace:'Example City',...extra});
const examples={
 apa:{style:'apa',source:'Two accounts share an author and year (Avery, 2021). The other account uses the same short label (Avery, 2021).\n\nA comparison has one candidate (Bennett, 2019, p. 4). One reference is absent (Unknown, 2001).',records:[work('avery-gardens','Avery',2021,'Synthetic gardens'),work('avery-fields','Avery',2021,'Synthetic fields'),work('bennett','Bennett',2019,'Comparing places')],referenceText:'Avery, J. (2021). Synthetic gardens. Example Press.\nAvery, J. (2021). Synthetic fields. Example Press.\nBennett, S. (2019). Comparing places. Example Press.'},
 chicago:{style:'chicago-author-date',source:'We compare Avery (2021, 12) with an earlier edition (Duval [1898] 2004, 61).\n\nAvery, Bennett, and Chan (2020) offer another account. This last byline needs explicit span review.',records:[work('avery','Avery',2021,'Synthetic gardens'),work('duval','Duval',2004,'An earlier account',{originalIssued:[1898]}),work('three','Avery',2020,'Three perspectives',{authors:[{family:'Avery'},{family:'Bennett'},{family:'Chan'}]})],referenceText:'Avery, Jordan. 2021. Synthetic gardens. Example Press.\nDuval, Camille. 2004. An earlier account. Example Press.'},
 numeric:{style:'vancouver',source:'The first comparison uses one source [2]. Another uses a different numbered entry [7]. Together they appear as a group [2, 7].\n\nA missing number remains in the text [99]. The supplied record order does not determine these numbers.',records:[work('seven','Bennett',2019,'Seventh numbered entry',{referenceNumber:7}),work('two','Avery',2021,'Second numbered entry',{referenceNumber:2})],referenceText:'2. Avery J. Second numbered entry. Example Press. 2021.\n7. Bennett S. Seventh numbered entry. Example Press. 2019.'},
 undated:{style:'apa',source:'A missing date is not the same as an explicitly undated work (Avery, n.d., p. 5). A curator has explicitly marked the other record undated (Bennett, n.d.).',records:[work('avery-unknown','Avery',null,'Date not recorded'),work('bennett-undated','Bennett',null,'Explicitly undated',{undated:true})],referenceText:'Avery, J. (n.d.). Date not recorded.\nBennett, S. (n.d.). Explicitly undated.'}
};
let review=null,version=0,output=null,referenceRecords=[],activeGroup=null,closeTimer;
const el=(tag,text)=>{const node=document.createElement(tag);if(text!==undefined)node.textContent=text;return node;};
function invalidate(message='Source changed. Analyze again.') {
 closeReview();version++;review=null;output=null;$('evidence').hidden=true;$('evidence-json').textContent='';$('preview').disabled=true;$('output-section').hidden=true;$('status').textContent=message;
 $('errors').textContent='';$('groups').replaceChildren();$('analyze-form').querySelector('button[type="submit"]').disabled=false;
}
function loadExample() {
 const sample=examples[$('example').value];invalidate('Loading example…');
 $('source').value=sample.source;$('style').value=sample.style;$('records').value=JSON.stringify(sample.records,null,2);$('reference-text').value=sample.referenceText;
 referenceRecords=sample.records;renderDocument();renderBibliography();
 $('groups').replaceChildren();$('evidence').hidden=true;$('review-intro').textContent='Hover over or click a highlighted citation to review it. Examples are analyzed automatically; after editing, use Analyze citations. These fictional examples include ambiguity the citation alone cannot resolve.';
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
 return [names || 'Author not supplied', record.originalIssued ? `${record.originalIssued[0]} / ${date}` : date, record.title || 'Title not supplied', [record.publisher,record.publisherPlace].filter(Boolean).join(', ')].filter(Boolean).join('. ')+'.';
}
function renderBibliography() {
 $('reference-summary').replaceChildren(...referenceRecords.map(record=>{
  const row=el('p',`${record.referenceNumber ? record.referenceNumber+'. ' : ''}${referenceText(record)}`);row.dataset.referenceId=record.id;return row;
 }));
 $('bibliography-explanation').textContent=`Matching searches these ${referenceRecords.length} supplied records, not the web. These are fictional example records. Raw reference parsing does not automatically add candidates to this set.`;
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
function reason(candidate,item) {
 const evidence=candidate.evidence;
 if(evidence.identity==='document-local-label')return `Reference number ${item.referenceNumber} matches this supplied entry's number. Record-array order is not used.`;
 const authors=item.authors?.join(' and ') || 'The cited author';
 const date=evidence.year==='date-not-recorded'?'The record has no date information; that does not confirm an undated work.':evidence.year==='explicitly-undated'?'The record is explicitly marked undated.':item.originalYear ? `Original year ${item.originalYear} and edition year ${item.year} match.`:`The ${evidence.year==='originalIssued'?'original':'publication'} year ${item.year} matches.`;
 const byline=evidence.authors==='incomplete-byline'?'The supplied byline is incomplete.':evidence.authors==='uncertain-narrative-span'?'A possible author span matches, but its text boundary still needs review.':`The cited author label “${authors}” matches the supplied byline.`;
 return `${byline} ${date}${evidence.suffix==='exact-source-suffix' ? ` The source year letter “${item.sourceSuffix}” also matches.` : ''}`;
}
function candidateComparison(proposal) {
 const comparison=el('div');comparison.className='candidate-comparison';
 if(!proposal.candidates.length){comparison.append(el('p','No supplied record matches. This demo has not searched online; add or correct a reference record, or defer.'));return comparison;}
 comparison.append(el('p',proposal.candidates.length>1?'Several supplied works fit the same citation. The matcher cannot choose the intended work from this citation alone.':'This candidate comes from the supplied bibliography. It still needs your review.'));
 for(const candidate of proposal.candidates) {
  const record=referenceRecords.find(record=>record.id===candidate.recordId),row=el('div');row.className='candidate-reference';
  row.append(el('h4',record?.title || candidate.title || candidate.recordId),el('p',record?referenceText(record):candidate.title),el('p',reason(candidate,proposal.item)));
  const identifiers=(record?.identifiers || []).map(id=>`${id.scheme.toUpperCase()}: ${id.value}`).join('; ');
  row.append(el('small',identifiers || 'No DOI or ISBN was supplied.'));comparison.append(row);
 }
 return comparison;
}
function renderGroups() {
 $('groups').replaceChildren();
 review.matches.forEach((match,index)=>{
  const group=el('div');group.className='citation-group';group.dataset.group=String(index);group.id=`review-group-${index}`;group.hidden=true;group.tabIndex=-1;group.addEventListener('pointerenter',()=>clearTimeout(closeTimer));group.addEventListener('pointerleave',scheduleClose);group.addEventListener('focusout',scheduleClose);
  const caption=el('blockquote',`Group ${index+1}: ${match.citation.raw}`);caption.id=`group-label-${index}`;group.setAttribute('role','dialog');group.setAttribute('aria-labelledby',caption.id);group.append(caption);
  const context=el('p', 'Context: '+$('source').value.slice(Math.max(0,match.citation.start-85),Math.min($('source').value.length,match.citation.end+85)).replace(/\s+/g,' '));context.className='citation-context';group.append(context);
  match.items.forEach((proposal,itemIndex)=>{
   const label=el('label',`Work ${itemIndex+1}`);const select=el('select');select.dataset.item=String(itemIndex);select.id=`work-${index}-${itemIndex}`;label.htmlFor=select.id;
   select.append(new Option(proposal.candidates.length?'Choose a work':'No candidate — retain this citation',''));
   for(const candidate of proposal.candidates)select.append(new Option(candidate.title || candidate.recordId,candidate.recordId));
   select.disabled=!proposal.candidates.length;
   group.append(candidateComparison(proposal),label,select,el('p',proposal.state==='unique'?'One candidate; review required.':proposal.state==='ambiguous'?'Ambiguous evidence; choose only after reviewing it.':'Unmatched. Add or correct a record, then analyze again.'));
   group.lastChild.className='item-state';
  });
  const label=el('label','Decision for this group'),action=el('select');action.id=`decision-${index}`;action.dataset.action='';label.htmlFor=action.id;
  action.append(new Option('Defer — keep the source','defer'),new Option('Accept selected works','accept'),new Option('Reject — keep the source','reject'));
  group.append(label,action);
  const details=el('details');details.append(el('summary','Technical matching evidence (JSON)'),el('pre',JSON.stringify(match.items,null,2)));group.append(details);
  const activeReview=review;
  function changed() {
   if(review!==activeReview)return;
   version++;output=null;$('output-section').hidden=true;$('errors').textContent='';
   const allChosen=[...group.querySelectorAll('select[data-item]')].every(select=>select.value);
   action.querySelector('option[value="accept"]').disabled=!allChosen;
   if(!allChosen&&action.value==='accept')action.value='defer';
   $('preview').disabled=false;$('status').textContent='Decisions changed. Preview to check the result.';
  }
  group.addEventListener('change',changed);
  action.querySelector('option[value="accept"]').disabled=true;
  group.append(el('p','Escape or click outside to close. Defer if you cannot identify the intended work.'));
  $('groups').append(group);
 });
}
async function analyzeSource() {
 invalidate('Analyzing citation shapes and supplied records…');const ticket=version;
 $('analyze-form').querySelector('button[type="submit"]').disabled=true;
 try {
  const result=await request('analyze');if(ticket!==version)return;
  review=result.review;referenceRecords=result.referenceRecords;renderBibliography();renderDocument();renderGroups();$('preview').disabled=!review.matches.length;
  $('evidence-json').textContent=JSON.stringify({diagnostics:result.diagnostics,referenceRules:result.parsedReferences},null,2);$('evidence').hidden=false;
  $('status').textContent=`${review.matches.length} citation groups highlighted. Hover, click or press Enter on a citation to compare the supplied works.`;
 } catch(error){if(ticket===version){$('errors').textContent=error.message;$('status').textContent='';}}
 finally{if(ticket===version)$('analyze-form').querySelector('button[type="submit"]').disabled=false;}
}
$('analyze-form').addEventListener('submit',event=>{event.preventDefault();void analyzeSource();});
$('preview').addEventListener('click',async()=>{
 if(!review)return;closeReview();const ticket=version;$('preview').disabled=true;$('errors').textContent='';
 const decisions=[...$('groups').children].map((group,citationIndex)=>({citationIndex,action:group.querySelector('[data-action]').value,recordIds:[...group.querySelectorAll('[data-item]')].map(select=>select.value)}));
 try {
  const result=await request('preview',{review,reviewId:review.reviewId,decisions});if(ticket!==version)return;
  output=result;$('output').value=result.source;$('outcomes').textContent=JSON.stringify(result.outcomes,null,2);
  $('preview-notice').textContent=result.previewNotice || '';
  const reader=$('reading-preview');reader.innerHTML=result.html;initializeCitationInspector(reader,{cache:result.cache});
  const explanations=result.outcomes.filter(outcome=>outcome.state==='accepted-needs-span'||outcome.state==='accepted-needs-adapter').map(outcome=>`Group ${outcome.citationIndex+1}: accepted work identity, but ${outcome.state==='accepted-needs-span'?'the author-text boundary needs review':'the source needs a formatting adapter'}. Kept unchanged.`);
  $('outcome-notes').replaceChildren(...explanations.map(text=>el('p',text)));
  $('output-section').hidden=false;$('status').textContent=`${result.edits.length} accepted groups can be replaced. Deferred, unmatched and unsafe spans are retained.`;
 }catch(error){if(ticket===version){$('errors').textContent=error.message;$('output-section').hidden=true;}}
 finally{if(ticket===version)$('preview').disabled=false;}
});
for(const id of ['source','records','reference-text','style'])$(id).addEventListener('input',()=>{invalidate();renderDocument();if(id==='records'){$('reference-summary').replaceChildren();$('bibliography-explanation').textContent='Supplied record data changed. Analyze to refresh the checked bibliography.';}});
document.addEventListener('keydown',event=>{if(event.key==='Escape'&&activeGroup){const restore=activeGroup.contains(document.activeElement),anchor=document.querySelector(`[data-review-group="${activeGroup.dataset.group}"]`);closeReview();if(restore)anchor?.focus({preventScroll:true});}});
document.addEventListener('pointerdown',event=>{if(activeGroup&&!activeGroup.contains(event.target)&&!event.target.closest('[data-review-group]'))closeReview();});
window.addEventListener('resize',closeReview);
$('load-example').addEventListener('click',loadExample);
$('use-output').addEventListener('click',()=>{if(!output)return;const text=output.source;invalidate('Reviewed source loaded. Analyze again before making further changes.');$('source').value=text;$('groups').replaceChildren();renderDocument();});
$('download').addEventListener('click',()=>{if(!output)return;const url=URL.createObjectURL(new Blob([output.source],{type:'text/plain;charset=utf-8'}));const link=el('a');link.href=url;link.download='reviewed-citations.txt';link.click();setTimeout(()=>URL.revokeObjectURL(url),1000);});
loadExample();
