import DOMPurify from 'dompurify';
import {compileMarkdown} from '../src/markup.mjs';
import {brandIconMarkup} from '../src/icons.mjs';
import {lessons} from './lessons.mjs';
import {initializeCitationInspector} from './assets/citation-inspector.mjs';

const $=id=>document.getElementById(id);
async function start(){
const data=await fetch('./records.json').then(response=>{if(!response.ok)throw new Error('Reference cache could not be loaded.');return response.json();});
const records=data.records;
const version=await fetch('./version.json').then(response=>{if(!response.ok)throw new Error('Version information could not be loaded.');return response.json();});
if(!$('brand').querySelector('svg'))$('brand').insertAdjacentHTML('afterbegin',brandIconMarkup);
$('version').textContent=version.version;
let selected=lessons[0].id;
let currentDifficulty;
for(const lesson of lessons){
 if(lesson.difficulty!==currentDifficulty){const heading=document.createElement('h3');heading.className='gallery-subheading';heading.textContent={everyday:'Everyday',intermediate:'Intermediate',advanced:'Advanced'}[lesson.difficulty];$('example-gallery').append(heading);currentDifficulty=lesson.difficulty;}
 const button=document.createElement('button');button.type='button';button.dataset.example=lesson.id;button.setAttribute('aria-pressed','false');
 const thumbnail=document.createElement('span');thumbnail.className='example-thumbnail';thumbnail.setAttribute('aria-hidden','true');
 const preview=document.createElement('div');preview.innerHTML=DOMPurify.sanitize(compileMarkdown(lesson.source,{...data,records:records.map(record=>({...record,...lesson.recordOverrides?.[record.id]}))},lesson.options).html);
 const sample=[...preview.querySelectorAll('p,li')].find(node=>node.textContent.trim());
 thumbnail.innerHTML=DOMPurify.sanitize(sample?.innerHTML||'References',{ALLOWED_TAGS:['span','em','strong','i','b','br'],ALLOWED_ATTR:['class','data-citation-part']});
 if(lesson.id==='filters'){const tags=new Map([...preview.querySelectorAll('[data-citation-part~="tag"]')].map(tag=>[tag.dataset.ciTag,tag]));thumbnail.innerHTML=DOMPurify.sanitize([...tags.values()].map(tag=>tag.outerHTML).join(' '),{ALLOWED_TAGS:['span'],ALLOWED_ATTR:['data-citation-part','data-ci-tag']});}

 const excerpt=document.createElement('span');excerpt.className='example-preview';excerpt.append(...thumbnail.childNodes,document.createTextNode(' …'));thumbnail.append(excerpt);
 const name=document.createElement('strong');name.textContent=lesson.title;button.append(name,thumbnail);
 button.addEventListener('click',()=>{selected=lesson.id;load();});$('example-gallery').append(button);
}
const requested=new URL(location.href).searchParams.get('example');
if(lessons.some(item=>item.id===requested))selected=requested;
let compiled=null, timer;
const sourceEditor=$('source');
function fitSource(){
  if(!sourceEditor.getClientRects().length)return;
  sourceEditor.style.height='auto';
  sourceEditor.style.height=`${sourceEditor.scrollHeight}px`;
}
sourceEditor.addEventListener('input',fitSource);
$('source-panel').addEventListener('toggle',fitSource);
let sourceWidth;
new ResizeObserver(entries=>{
  const width=entries[0].contentRect.width;
  if(width!==sourceWidth){sourceWidth=width;fitSource();}
}).observe(sourceEditor);
document.fonts.ready.then(fitSource);
const json=value=>JSON.stringify(value,null,2);
function options(){const value=JSON.parse($('configuration').value);if(!value||Array.isArray(value)||typeof value!=='object')throw new Error('Configuration must be a JSON object.');return value;}
function prettyHTML(html){
  const template=document.createElement('template');template.innerHTML=html;
  function line(node,depth){
    const indent='  '.repeat(depth);
    if(node.nodeType!==Node.ELEMENT_NODE)return node.nodeType===Node.COMMENT_NODE?indent+'<!--'+node.data+'-->':node.textContent.trim()?indent+node.textContent:'';
    const children=[...node.childNodes].filter(child=>child.nodeType!==Node.TEXT_NODE||child.textContent.trim());
    if(!children.length||['PRE','CODE','SCRIPT','STYLE','TEXTAREA'].includes(node.tagName)||children.some(child=>child.nodeType===Node.TEXT_NODE))return indent+node.outerHTML;
    const empty=node.cloneNode(false).outerHTML,closing=empty.lastIndexOf('</');
    if(closing<0)return indent+node.outerHTML;
    return indent+empty.slice(0,closing)+'\n'+children.map(child=>line(child,depth+1)).filter(Boolean).join('\n')+'\n'+indent+empty.slice(closing);
  }
  return [...template.content.childNodes].map(node=>line(node,0)).filter(Boolean).join('\n');
}
function render(){
  fitSource();
  try{
    const cache=JSON.parse($('records').value), configuration={namespace:'learning',activation:'hover',...options()};
    if(!['click','hover'].includes(configuration.activation))throw new Error('Activation must be click or hover.');
    $('hover').checked=configuration.activation==='hover';
    $('hover-help').textContent=`initializeCitationInspector(element, {activation: ${JSON.stringify(configuration.activation)}})`;
    $('style-help').textContent=`compileMarkdown(source, cache, {citationStyle: ${JSON.stringify(configuration.citationStyle||'default')}})`;
    if(!Array.isArray(cache.records))throw new Error('References must contain a records array.');
    compiled=compileMarkdown($('source').value,cache,configuration);
    const inspector=document.createElement('citation-inspector');
    inspector.innerHTML=DOMPurify.sanitize(compiled.html,{USE_PROFILES:{html:true,svg:true,svgFilters:true},FORBID_TAGS:['style','form','iframe','object','embed'],FORBID_ATTR:['style']});
    initializeCitationInspector(inspector,{...configuration,cache:compiled.cache,activation:$('hover').checked?'hover':'click',accessStorageKey:'citation-inator-learning-access'});
    $('result').replaceChildren(inspector);
    $('result').removeAttribute('data-stale');
    $('compiled').textContent=`<link rel="stylesheet" href="./citation-inspector.css">\n<citation-inspector id="article">\n${prettyHTML(compiled.html).split('\n').map(line=>'  '+line).join('\n')}\n</citation-inspector>\n<script type="module" src="./article.mjs"></script>`;
    $('diagnostics').textContent=compiled.diagnostics.length?json(compiled.diagnostics):'None';
    const metadataFields={letters:['identifiers'],access:['locations']};
    const fields=metadataFields[selected];
    const exampleCache=fields?{schema:cache.schema,records:compiled.cache.records.map(record=>Object.fromEntries([...new Set(['id',...fields,...Object.keys(record)])].filter(key=>record[key]!==undefined).map(key=>[key,record[key]])))}:null;
    const setup=exampleCache?`const cache = ${json(exampleCache)};`:`const cache = await fetch('./citations.json').then(response => response.json());`;
    const noteTools=selected==='notes'?`import {annotateMarkers,collectMarkerTags} from './citation-tools.mjs';\n`:'';
    const noteStep=selected==='notes'?`const labelled = annotateMarkers(source, cache, {...options, format:'markdown', noteContext:'work'});\nconst topics = collectMarkerTags([{source, format:'markdown'}], cache, options);\nconsole.log(topics);\n`:'';
    $('initialization').textContent=`import {compileMarkdown} from './citation-compiler.mjs';\nimport {initializeCitationInspector} from './citation-inspector.mjs';\n${noteTools}\nconst source = await fetch('./article.md').then(response => response.text());\n${setup}\nconst options = ${json(configuration)};\n${noteStep}const result = compileMarkdown(${selected==='notes'?'labelled.source':'source'}, cache, options);\nconst element = document.querySelector('#article');\n// Trusted authored content; sanitize untrusted HTML before insertion.\nelement.innerHTML = result.html;\ninitializeCitationInspector(element, {...options, cache:result.cache});`;
    $('error').hidden=true;
    for(const id of ['download-source','download-cache'])$(id).disabled=false;
  }catch(error){compiled=null;$('error').textContent=`Preview not updated: ${error.message}`;$('error').hidden=false;$('result').setAttribute('data-stale','');for(const id of ['download-source','download-cache'])$(id).disabled=true;}
}
function load(){const lesson=lessons.find(item=>item.id===selected);const url=new URL(location.href);if(lesson.id==='first')url.searchParams.delete('example');else url.searchParams.set('example',lesson.id);history.replaceState(null,'',url);$('source').value=lesson.source;$('records').value=json({schema:'citation-inator.cache.v1',records:records.map(record=>({...record,...lesson.recordOverrides?.[record.id]}))});$('configuration').value=json({namespace:'learning',activation:'hover',citationStyle:'chicago-author-date',...lesson.options,...(lesson.id==='site'?{siteOccurrences:data.siteOccurrences,siteOrigin:location.origin}:{})});$('style').value='chicago-author-date';$('hover').checked=true;$('appearance').value='paper';$('lesson').textContent=lesson.text;$('example-title').textContent=lesson.title;for(const button of $('example-gallery').querySelectorAll('button'))button.setAttribute('aria-pressed',String(button.dataset.example===selected));$('javascript-panel').open=['first','names','branding','letters','notes','filters','access','leading','site','language'].includes(selected);$('html-panel').open=['first','html','names'].includes(selected);appearance();render();$('example-gallery').querySelector('[aria-pressed="true"]')?.scrollIntoView({block:'nearest',inline:'nearest'});}
function appearance(){document.querySelector('.result').className=`result ${$('appearance').value}`;$('css-help').textContent=$('appearance').value==='ink'?'citation-inspector { --citation-paper: #182c44; --citation-ink: #f4f7fb; --citation-accent: #8cdeed; }':$('appearance').value==='compact'?'citation-inspector { --citation-heading-font: system-ui; --citation-panel-radius: 4px; --citation-icon-radius: 3px; }':'citation-inspector { --citation-paper: #fff; --citation-ink: #182c44; }';}
for(const id of ['source','records','configuration'])$(id).addEventListener('input',()=>{clearTimeout(timer);$('result').setAttribute('data-stale','');for(const download of ['download-source','download-cache'])$(download).disabled=true;timer=setTimeout(()=>{try{$('style').value=options().citationStyle||'chicago-author-date';}catch{}render();},180);});
$('reset').addEventListener('click',load);$('hover').addEventListener('change',()=>{try{$('configuration').value=json({...options(),activation:$('hover').checked?'hover':'click'});render();}catch{render();}});$('appearance').addEventListener('change',appearance);
$('style').addEventListener('change',()=>{try{$('configuration').value=json({...options(),citationStyle:$('style').value});render();}catch{render();}});
for(const help of document.querySelectorAll('.help-wrap'))for(const event of ['pointerenter','focusin'])help.addEventListener(event,()=>{
 delete help.dataset.dismissed;
 const tooltip=help.querySelector('code');tooltip.style.transform='';
 const rect=tooltip.getBoundingClientRect(),shift=rect.left<8?8-rect.left:rect.right>innerWidth-8?innerWidth-8-rect.right:0;
 tooltip.style.transform=`translateX(${shift}px)`;
});
document.addEventListener('keydown',event=>{if(event.key==='Escape')for(const help of document.querySelectorAll('.help-wrap'))help.dataset.dismissed='';});
function download(name,value,type){const url=URL.createObjectURL(new Blob([value],{type}));const link=document.createElement('a');link.href=url;link.download=name;link.click();setTimeout(()=>URL.revokeObjectURL(url),1000);}
$('download-source').addEventListener('click',()=>{if(compiled)download('article.md',$('source').value,'text/markdown');});
$('download-cache').addEventListener('click',()=>{if(compiled)download('citations.json',json(compiled.cache),'application/json');});
load();

}
start().catch(error=>{$("error").hidden=false;$("error").textContent=`Examples could not be loaded: ${error.message} Reload the page to try again.`;for(const node of document.querySelectorAll("button,select,textarea,input"))node.disabled=true;});
