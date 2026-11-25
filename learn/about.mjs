for(const tabs of document.querySelectorAll('[data-example-tabs]')){
  const buttons=[...tabs.querySelectorAll('[role="tab"]')];
  function select(button,focus=false){
    for(const candidate of buttons){const active=candidate===button;candidate.setAttribute('aria-selected',String(active));candidate.tabIndex=active?0:-1;document.getElementById(candidate.getAttribute('aria-controls')).hidden=!active;}
    if(focus)button.focus();
  }
  for(const [index,button] of buttons.entries()){
    button.addEventListener('click',()=>select(button));
    button.addEventListener('keydown',event=>{
      let next;if(event.key==='ArrowRight')next=(index+1)%buttons.length;else if(event.key==='ArrowLeft')next=(index+buttons.length-1)%buttons.length;else if(event.key==='Home')next=0;else if(event.key==='End')next=buttons.length-1;else return;
      event.preventDefault();select(buttons[next],true);
    });
  }
}
