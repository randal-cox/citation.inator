// Pointer movement avoids controls and selectable text; no source/review state lives here.
export function movableReviewWindow(panel,{onInteract=()=>{}}={}) {
 let gesture=null,placed=false;
 const controls='a,button,input,select,textarea,label,summary,[contenteditable],[role="button"]';
 const overText=(target,x,y)=>{const range=document.createRange();for(const child of target.childNodes){if(child.nodeType!==Node.TEXT_NODE||!child.textContent.trim())continue;range.selectNodeContents(child);if([...range.getClientRects()].some(rect=>x>=rect.left&&x<=rect.right&&y>=rect.top&&y<=rect.bottom))return true;}return false;};
 const bounds=()=>({width:Math.max(1,window.innerWidth-24),height:Math.max(1,window.innerHeight-24)});
 function fit(left,top,width,height){
  const room=bounds();width=Math.min(Math.max(Math.min(280,room.width),width),room.width);height=Math.min(Math.max(Math.min(130,room.height),height),room.height);
  left=Math.min(Math.max(12,left),window.innerWidth-width-12);top=Math.min(Math.max(12,top),window.innerHeight-height-12);
  Object.assign(panel.style,{left:left+'px',top:top+'px',width:width+'px',height:height+'px',maxHeight:room.height+'px'});
 }
 const resize=document.createElement('button');resize.type='button';resize.className='review-resize';resize.setAttribute('aria-label','Resize citation popup');resize.title='Resize (arrow keys)';
 panel.append(resize);
 function finish(event){if(!gesture||event.pointerId!==gesture.id)return;const id=gesture.id;gesture=null;panel.classList.remove('moving');if(panel.hasPointerCapture(id))panel.releasePointerCapture(id);}
 panel.addEventListener('pointerdown',event=>{
  if(event.button!==0||!event.isPrimary||gesture)return;
  const rect=panel.getBoundingClientRect(),resizing=resize.contains(event.target);
  // Scrollbars retain their native behaviour.
  if(event.clientX>=rect.right-4||event.clientY>=rect.bottom-4)return;
  if(!resizing&&event.clientX>=rect.right-20)return;
  if(!resizing&&(event.target.closest(controls)||overText(event.target,event.clientX,event.clientY)))return;
  event.preventDefault();onInteract();(resizing?resize:panel).focus({preventScroll:true});panel.dataset.pinned='true';
  gesture={id:event.pointerId,x:event.clientX,y:event.clientY,left:rect.left,top:rect.top,width:rect.width,height:rect.height,resizing};
  placed=true;panel.setPointerCapture(event.pointerId);panel.classList.add('moving');
 });
 panel.addEventListener('pointermove',event=>{
  if(gesture?.id!==event.pointerId)return;event.preventDefault();
  const g=gesture,dx=event.clientX-g.x,dy=event.clientY-g.y;
  if(g.resizing){fit(g.left,g.top,Math.min(g.width+dx,window.innerWidth-g.left-12),Math.min(g.height+dy,window.innerHeight-g.top-12));}
  else fit(g.left+dx,g.top+dy,g.width,g.height);
 });
 for(const type of ['pointerup','pointercancel','lostpointercapture'])panel.addEventListener(type,finish);
 panel.addEventListener('keydown',event=>{
  const delta={ArrowLeft:[-24,0],ArrowRight:[24,0],ArrowUp:[0,-24],ArrowDown:[0,24]}[event.key];
  const resizing=event.target===resize;
  if(!delta||!resizing&&!(event.target===panel&&event.altKey))return;
  event.preventDefault();event.stopPropagation();onInteract();panel.dataset.pinned='true';placed=true;
  const rect=panel.getBoundingClientRect();fit(rect.left+(resizing?0:delta[0]),rect.top+(resizing?0:delta[1]),rect.width+(resizing?delta[0]:0),rect.height+(resizing?delta[1]:0));
 });
 return {get placed(){return placed;},fit(){const rect=panel.getBoundingClientRect();fit(rect.left,rect.top,rect.width,rect.height);},cancel(){if(gesture)finish({pointerId:gesture.id});}};
}
