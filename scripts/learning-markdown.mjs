import {marked} from 'marked';
import {parseFragment,serialize} from 'parse5';
export function learningMarkdown(source){
  const fragment=parseFragment(marked.parse(source)),used=new Set();
  const text=node=>node.nodeName==='#text'?node.value:(node.childNodes||[]).map(text).join('');
  function visit(node){
    if(/^h[1-6]$/.test(node.tagName||'')&&!node.attrs.some(attr=>attr.name==='id')){
      const base=text(node).toLowerCase().replace(/[^\p{L}\p{N}_\s-]/gu,'').trim().replace(/\s/g,'-')||'section';
      let id=base,index=0;while(used.has(id))id=base+'-'+(++index);used.add(id);node.attrs.push({name:'id',value:id});
    }
    for(const child of node.childNodes||[])visit(child);
  }
  visit(fragment);return serialize(fragment);
}
