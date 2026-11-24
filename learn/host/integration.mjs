import {mountEditor} from './editor.js';
import {processImportRequest} from '../assets/citation-import.mjs';
import {compileHTML} from '../assets/citation-compiler.mjs';
import {describeCitation} from '../assets/citation-tools.mjs';
import DOMPurify from 'dompurify';
import {marked} from 'marked';
const $=id=>document.getElementById(id);
async function load(path,format){
  const response=await fetch(path);
  if(!response.ok)throw new Error(`${path} could not be loaded.`);
  return response[format]();
}
const [siteCache,source]=await Promise.all([
  load('./citations.json','json'),load('./article.md','text')
]);
if(!Array.isArray(window.DRAFT_WORKS)||!window.DraftForms||!window.DRAFT_CITATION)throw new Error('Editor support files are unavailable.');
compileHTML('',siteCache);
const initialSiteCount=siteCache.records.length;
let pendingCache=structuredClone(siteCache);
const sanitize=html=>DOMPurify.sanitize(html,{USE_PROFILES:{html:true,svg:true,svgFilters:true},FORBID_TAGS:['style','form','iframe','object','embed'],FORBID_ATTR:['style']});
function showCache(){
  $('cache').textContent=JSON.stringify(pendingCache,null,2);
  $('record-count').textContent=`${initialSiteCount} site records · ${pendingCache.records.length-initialSiteCount} staged`;
}
const editor=mountEditor($('editor'),{
  text:source, label:'Article editor', blocks:['citation'],
  render:markdown=>sanitize(marked.parse(markdown)),
  citations:{
    compileHTML:(html,cache,options)=>{const result=compileHTML(html,cache,options);return {...result,html:sanitize(result.html)};},
    cache:structuredClone(siteCache),citationStyle:'chicago-author-date'
  },
  importer:{
    process:processImportRequest,siteCache,
    describe:(id,cache)=>describeCitation(id,cache,{citationStyle:'chicago-author-date'}).text,
    onRecords(records){
      // Stage additions; the host's Save action owns persistence of text + records.
      const existing=new Set(pendingCache.records.map(record=>record.id));
      pendingCache={...pendingCache,records:[...pendingCache.records,...records.filter(record=>!existing.has(record.id))]};
      siteCache.records=pendingCache.records;
      showCache();
    }
  }
});
await editor.ready;
$('download-bundle').addEventListener('click',()=>{
  // One artifact carries a coherent snapshot; no server writes or authentication.
  const bundle={schema:'citation-inator.article-bundle.v1',source:editor.text,cache:pendingCache};
  const url=URL.createObjectURL(new Blob([JSON.stringify(bundle,null,2)],{type:'application/json'}));
  const link=document.createElement('a');link.href=url;link.download='article-bundle.json';link.click();setTimeout(()=>URL.revokeObjectURL(url),1000);
});
showCache();
$('host-loading').hidden=true;$('download-bundle').disabled=false;
try{$('initialization').textContent=await load('./integration-source.mjs','text');}
catch{$('initialization').textContent='Initialization source could not be loaded. Reload the page to try again.';}
