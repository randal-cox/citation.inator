import DOMPurify from 'dompurify';
import {compileMarkdown} from '../src/markup.mjs';
import {brandIconMarkup} from '../src/icons.mjs';
import {lessons} from './lessons.mjs';
import {initializeCitationInspector} from './assets/citation-inspector.mjs';

const $=id=>document.getElementById(id);
async function start(){
const records=await fetch('./records.json').then(response=>{if(!response.ok)throw new Error('Reference cache could not be loaded.');return response.json();});
const version=await fetch('./version.json').then(response=>{if(!response.ok)throw new Error('Version information could not be loaded.');return response.json();});
$('brand').insertAdjacentHTML('afterbegin',brandIconMarkup);
$('version').textContent=version.version;
for(const lesson of lessons)$('example').add(new Option(lesson.title,lesson.id));
let compiled=null, timer;
const json=value=>JSON.stringify(value,null,2);
function options(){const value=JSON.parse($('configuration').value);if(!value||Array.isArray(value)||typeof value!=='object')throw new Error('Configuration must be a JSON object.');return value;}
function render(){
  try{
    const cache=JSON.parse($('records').value), configuration={namespace:'learning',activation:'click',...options()};
    if(!['click','hover'].includes(configuration.activation))throw new Error('Activation must be click or hover.');
    $('hover').checked=configuration.activation==='hover';
    if(!Array.isArray(cache.records))throw new Error('References must contain a records array.');
    compiled=compileMarkdown($('source').value,cache,configuration);
    const inspector=document.createElement('citation-inspector');
    inspector.innerHTML=DOMPurify.sanitize(compiled.html,{USE_PROFILES:{html:true,svg:true,svgFilters:true},FORBID_TAGS:['style','form','iframe','object','embed'],FORBID_ATTR:['style']});
    initializeCitationInspector(inspector,{...configuration,cache:compiled.cache,activation:$('hover').checked?'hover':'click',accessStorageKey:'citation-inator-learning-access'});
    $('result').replaceChildren(inspector);
    $('result').removeAttribute('data-stale');
    $('compiled').textContent=compiled.html;
    $('diagnostics').textContent=compiled.diagnostics.length?json(compiled.diagnostics):'None';
    $('initialization').textContent=`import { compileMarkdown } from './citation-compiler.mjs';\nimport { initializeCitationInspector } from './citation-inspector.mjs';\n\nconst result = compileMarkdown(source, cache, ${json(configuration)});\n// For trusted authored content. Sanitize untrusted HTML before insertion.\nelement.innerHTML = result.html;\ninitializeCitationInspector(element, {\n  ...${json(configuration)},\n  cache: result.cache,\n  activation: ${JSON.stringify($('hover').checked?'hover':'click')}\n});`;
    $('error').hidden=true;
    for(const id of ['download-source','download-cache'])$(id).disabled=false;
  }catch(error){compiled=null;$('error').textContent=`Preview not updated: ${error.message}`;$('error').hidden=false;$('result').setAttribute('data-stale','');for(const id of ['download-source','download-cache'])$(id).disabled=true;}
}
function load(){const lesson=lessons.find(item=>item.id===$('example').value);$('source').value=lesson.source;$('records').value=json({schema:'citation-inator.cache.v1',records});$('configuration').value=json({namespace:'learning',activation:'click',citationStyle:'chicago-author-date',...lesson.options});$('style').value='chicago-author-date';$('hover').checked=false;$('appearance').value='paper';$('lesson').textContent=lesson.text;appearance();render();}
function appearance(){document.querySelector('.result').className=`result ${$('appearance').value}`;}
for(const id of ['source','records','configuration'])$(id).addEventListener('input',()=>{clearTimeout(timer);$('result').setAttribute('data-stale','');for(const download of ['download-source','download-cache'])$(download).disabled=true;timer=setTimeout(()=>{try{$('style').value=options().citationStyle||'chicago-author-date';}catch{}render();},180);});
$('example').addEventListener('change',load);$('reset').addEventListener('click',load);$('hover').addEventListener('change',()=>{try{$('configuration').value=json({...options(),activation:$('hover').checked?'hover':'click'});render();}catch{render();}});$('appearance').addEventListener('change',appearance);
$('style').addEventListener('change',()=>{try{$('configuration').value=json({...options(),citationStyle:$('style').value});render();}catch{render();}});
function download(name,value,type){const url=URL.createObjectURL(new Blob([value],{type}));const link=document.createElement('a');link.href=url;link.download=name;link.click();setTimeout(()=>URL.revokeObjectURL(url),1000);}
$('download-source').addEventListener('click',()=>{if(compiled)download('article.md',$('source').value,'text/markdown');});
$('download-cache').addEventListener('click',()=>{if(compiled)download('citations.json',json(compiled.cache),'application/json');});
load();

}
start().catch(error=>{$("error").hidden=false;$("error").textContent=`Examples could not be loaded: ${error.message} Reload the page to try again.`;for(const node of document.querySelectorAll("button,select,textarea,input"))node.disabled=true;});
