if(window.self!==window.top&&new URL(location.href).searchParams.get('embed')==='guide')document.documentElement.classList.add('guide-embedded');

for(const menu of document.querySelectorAll('.project-menu')){
 document.addEventListener('pointerdown',event=>{if(menu.open&&!menu.contains(event.target))menu.open=false;});
 document.addEventListener('keydown',event=>{if(event.key==='Escape'&&menu.open){menu.open=false;menu.querySelector('summary').focus();}});
}
