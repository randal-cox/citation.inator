import {canonicalIdentifierKey,cleanText,normalizeRecord,normalizeTags} from './records.mjs';

/** Document authors can label and assign reading-list topics without site JS. */
export function applyTagDeclarations(blocks,index,{tagCatalogue=[],listItemTags={}}={},diagnostics=[]){
  // Leave validation of the configured catalogue/overrides to prepareReferences.
  if(!Array.isArray(tagCatalogue) || !listItemTags || typeof listItemTags!=='object' || Array.isArray(listItemTags))return {tagCatalogue,listItemTags};
  const catalogue=tagCatalogue.map(tag=>({...tag,id:normalizeTags([tag?.id])[0],label:cleanText(tag?.label)})),overrides={...listItemTags};
  const assigned=new Map();
  for(const token of blocks.flat()){
    if(token.type!=='tags')continue;
    const identifier=token.items[0].identifier,key=canonicalIdentifierKey(identifier);
    const record=identifier.scheme==='local'?index.byId.get(identifier.value):index.byIdentifier.get(key);
    if(!record || record.state==='unresolved')diagnostics.push({state:'unresolved',code:'citation-unresolved',identifier:key});
    if(!record)continue;
    const previous=assigned.get(record.id)||new Set();
    for(const definition of token.definitions){
      const configured=catalogue.find(tag=>tag.id===definition.id);
      if(configured && configured.label!==definition.label)throw new TypeError(`Conflicting label for tag ${definition.id}. Use one label throughout the document.`);
      if(!configured)catalogue.push(definition);
      previous.add(definition.id);
    }
    assigned.set(record.id,previous);
  }
  for(const [id,tags] of assigned){
    const prior=index.byId.get(id);
    const next=normalizeRecord({...prior,tags:normalizeTags([...(prior.tags||[]),...tags]),provenance:[...prior.provenance,{provider:'Document author',note:JSON.stringify({tags:[...tags],priorTags:prior.tags||[]})}]});
    index.byId.set(id,next);
    for(const identifier of next.identifiers)index.byIdentifier.set(canonicalIdentifierKey(identifier),next);
    if(Object.hasOwn(overrides,id)){
      if(!Array.isArray(overrides[id]))throw new TypeError('Supply listItemTags values as arrays of topic IDs.');
      overrides[id]=normalizeTags([...overrides[id],...tags]);
    }
  }
  return {tagCatalogue:catalogue,listItemTags:overrides};
}
