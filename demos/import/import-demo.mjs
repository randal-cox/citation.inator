import {initializeCitationInspector} from '../../dist/citation-inspector.mjs';
const $=id=>document.getElementById(id);
const work=(id,family,year,title,extra={})=>({id,type:'book',state:year?'resolved':'partial',title,authors:[{family}],issued:year?[year]:null,publisher:'Example Press',publisherPlace:'Example City',...extra});
const examples={
 apa:{style:'apa',source:'Two accounts share an author and year (Avery, 2021). The other account uses the same short label (Avery, 2021).\n\nA comparison has one candidate (Bennett, 2019, p. 4). One reference is absent (Unknown, 2001).',records:[work('avery-gardens','Avery',2021,'Synthetic gardens'),work('avery-fields','Avery',2021,'Synthetic fields'),work('bennett','Bennett',2019,'Comparing places')],referenceText:'Avery, J. (2021). Synthetic gardens. Example Press.\nAvery, J. (2021). Synthetic fields. Example Press.\nBennett, S. (2019). Comparing places. Example Press.'},
 chicago:{style:'chicago-author-date',source:'We compare Avery (2021, 12) with an earlier edition (Duval [1898] 2004, 61).\n\nAvery, Bennett, and Chan (2020) offer another account. This last byline needs explicit span review.',records:[work('avery','Avery',2021,'Synthetic gardens'),work('duval','Duval',2004,'An earlier account',{originalIssued:[1898]}),work('three','Avery',2020,'Three perspectives',{authors:[{family:'Avery'},{family:'Bennett'},{family:'Chan'}]})],referenceText:'Avery, Jordan. 2021. Synthetic gardens. Example Press.\nDuval, Camille. 2004. An earlier account. Example Press.'},
 numeric:{style:'vancouver',source:'The first comparison uses one source [2]. Another uses a different numbered entry [7]. Together they appear as a group [2, 7].\n\nA missing number remains in the text [99]. The supplied record order does not determine these numbers.',records:[work('seven','Bennett',2019,'Seventh numbered entry',{referenceNumber:7}),work('two','Avery',2021,'Second numbered entry',{referenceNumber:2})],referenceText:'2. Avery J. Second numbered entry. Example Press. 2021.\n7. Bennett S. Seventh numbered entry. Example Press. 2019.'},
 undated:{style:'apa',source:'A missing date is not the same as an explicitly undated work (Avery, n.d., p. 5). A curator has explicitly marked the other record undated (Bennett, n.d.).',records:[work('avery-unknown','Avery',null,'Date not recorded'),work('bennett-undated','Bennett',null,'Explicitly undated',{undated:true})],referenceText:'Avery, J. (n.d.). Date not recorded.\nBennett, S. (n.d.). Explicitly undated.'}
};
let review=null,version=0,output=null;
const el=(tag,text)=>{const node=document.createElement(tag);if(text!==undefined)node.textContent=text;return node;};
function invalidate(message='Source changed. Analyze again.') {
 version++;review=null;output=null;$('evidence').hidden=true;$('evidence-json').textContent='';$('preview').disabled=true;$('output-section').hidden=true;$('status').textContent=message;
 $('errors').textContent='';$('groups').replaceChildren();$('analyze-form').querySelector('button[type="submit"]').disabled=false;
}
function loadExample() {
 const sample=examples[$('example').value];invalidate('Example loaded. Analyze to inspect the candidates.');
 $('source').value=sample.source;$('style').value=sample.style;$('records').value=JSON.stringify(sample.records,null,2);$('reference-text').value=sample.referenceText;
 $('groups').replaceChildren();$('evidence').hidden=true;$('review-intro').textContent='Even a single candidate needs your decision. Missing references remain in the text.';
}
async function request(action,extra={}) {
 const records=JSON.parse($('records').value);
 const response=await fetch('./review',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({action,source:$('source').value,style:$('style').value,records,referenceText:$('reference-text').value,...extra})});
 const text=await response.text();let result;try{result=JSON.parse(text);}catch{throw Error(text||'The local demo server did not respond.');}
 if(!response.ok)throw Error(result.error||'The demo request failed.');return result;
}
function renderGroups() {
 $('groups').replaceChildren();
 review.matches.forEach((match,index)=>{
  const group=el('div');group.className='citation-group';group.dataset.group=String(index);
  const caption=el('blockquote',`Group ${index+1}: ${match.citation.raw}`);caption.id=`group-label-${index}`;group.setAttribute('role','group');group.setAttribute('aria-labelledby',caption.id);group.append(caption);
  match.items.forEach((proposal,itemIndex)=>{
   const label=el('label',`Work ${itemIndex+1}`);const select=el('select');select.dataset.item=String(itemIndex);select.id=`work-${index}-${itemIndex}`;label.htmlFor=select.id;
   select.append(new Option(proposal.candidates.length?'Choose a work':'No candidate — retain this citation',''));
   for(const candidate of proposal.candidates)select.append(new Option(`${candidate.title || candidate.recordId} (${candidate.recordId})`,candidate.recordId));
   select.disabled=!proposal.candidates.length;
   group.append(label,select,el('p',proposal.state==='unique'?'One candidate; review required.':proposal.state==='ambiguous'?'Ambiguous evidence; choose only after reviewing it.':'Unmatched. Add or correct a record, then analyze again.'));
   group.lastChild.className='item-state';
  });
  const label=el('label','Decision for this group'),action=el('select');action.id=`decision-${index}`;action.dataset.action='';label.htmlFor=action.id;
  action.append(new Option('Defer — keep the source','defer'),new Option('Accept selected works','accept'),new Option('Reject — keep the source','reject'));
  group.append(label,action);
  const details=el('details');details.append(el('summary','Matching evidence'),el('pre',JSON.stringify(match.items,null,2)));group.append(details);
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
  $('groups').append(group);
 });
}
$('analyze-form').addEventListener('submit',async event=>{
 event.preventDefault();invalidate('Analyzing citation shapes and supplied records…');const ticket=version;
 $('analyze-form').querySelector('button[type="submit"]').disabled=true;
 try {
  const result=await request('analyze');if(ticket!==version)return;
  review=result.review;renderGroups();$('preview').disabled=!review.matches.length;
  $('evidence-json').textContent=JSON.stringify({diagnostics:result.diagnostics,referenceRules:result.parsedReferences},null,2);$('evidence').hidden=false;
  $('status').textContent=`${review.matches.length} citation groups found. Review the candidate works and choose a decision for each group.`;
 } catch(error){if(ticket===version){$('errors').textContent=error.message;$('status').textContent='';}}
 finally{if(ticket===version)$('analyze-form').querySelector('button[type="submit"]').disabled=false;}
});
$('preview').addEventListener('click',async()=>{
 if(!review)return;const ticket=version;$('preview').disabled=true;$('errors').textContent='';
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
for(const id of ['source','records','reference-text','style'])$(id).addEventListener('input',()=>invalidate());
$('load-example').addEventListener('click',loadExample);
$('use-output').addEventListener('click',()=>{if(!output)return;const text=output.source;invalidate('Reviewed source loaded. Analyze again before making further changes.');$('source').value=text;$('groups').replaceChildren();});
$('download').addEventListener('click',()=>{if(!output)return;const url=URL.createObjectURL(new Blob([output.source],{type:'text/plain;charset=utf-8'}));const link=el('a');link.href=url;link.download='reviewed-citations.txt';link.click();setTimeout(()=>URL.revokeObjectURL(url),1000);});
loadExample();
