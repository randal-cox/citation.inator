import {canonicalIdentifierKey, httpsURL, normalizeRecord} from './records.mjs';

export const authorFields = new Set(['original-year','edition-year','reference','attribution','display-date','medium','dimensions','institution','accession','rights','photographer','uploader','pdf','read-url','access','checked']);
const recordFields = {'original-year':'originalIssued','edition-year':'issued',attribution:'creatorAttribution','display-date':'displayDate',medium:'medium',dimensions:'dimensions',institution:'holdingInstitution',accession:'accession'};

// Only these two inline emphasis forms are interpreted. Everything else is text.
export function referenceParts(value) {
  return value.split(/(\*\*[^*]+\*\*|\*[^*]+\*)/u).filter(Boolean).map(text =>
    text.startsWith('**') && text.endsWith('**') ? {text:text.slice(2,-2),emphasis:'bold'} :
    text.startsWith('*') && text.endsWith('*') ? {text:text.slice(1,-1),emphasis:'italic'} : {text});
}
export function validAuthorField(field,value){
  if(!value.trim())return false;
  if(field.endsWith('-year'))return /^[1-9][0-9]{3}$/.test(value);
  if(['pdf','read-url'].includes(field))return Boolean(httpsURL(value));
  if(field==='access')return ['open','subscription','purchase','loan','unknown'].includes(value);
  if(field==='checked')return /^\d{4}-\d{2}-\d{2}$/.test(value) && Number.isFinite(Date.parse(value)) && new Date(value).toISOString().slice(0,10)===value;
  return true;
}

/** Collect document-wide assertions before sorting and year-letter assignment. */
export function applyAuthorFields(blocks,index,{suffixScope}){
  const assertions=new Map();
  for(const token of blocks.flat())for(const item of token.items || []){
    if(!item.authorFields)continue;
    const record=item.identifier.scheme==='local'?index.byId.get(item.identifier.value):index.byIdentifier.get(canonicalIdentifierKey(item.identifier));
    // Leave unresolved citations available to the resolver/import workflow.
    if(!record)continue;
    const fields=assertions.get(record.id)||{};
    for(const [key,value] of Object.entries(item.authorFields)){
      if(Object.hasOwn(fields,key)&&fields[key]!==value)throw new TypeError(`Conflicting ${key} declarations for ${record.id}. Use one value throughout the document.`);
      fields[key]=value;
    }
    assertions.set(record.id,fields);
  }
  for(const [id,fields] of assertions){
    const prior=index.byId.get(id),next={...prior};
    const datesChanged=['original-year','edition-year'].some(key=>fields[key] && prior[recordFields[key]]?.[0]!==Number(fields[key]));
    const displayChanged=fields['display-date'] && fields['display-date']!==prior.displayDate;
    if((datesChanged || displayChanged) && suffixScope==='cache')throw new TypeError(`Put shared date corrections for ${id} in the shared metadata before using suffixScope:cache.`);
    if(!fields.reference && (datesChanged && prior.displayDate || (datesChanged || displayChanged) && (prior.citationParts?.length || prior.citationText)))throw new TypeError(`Date assertions for ${id} conflict with its custom reference/date. Supply reference: too, or correct the shared metadata.`);
    for(const [key,field] of Object.entries(recordFields))if(fields[key]){
      next[field]=key.endsWith('-year') ? prior[field]?.[0]===Number(fields[key]) ? prior[field] : [Number(fields[key])] : fields[key];
    }
    if(fields['edition-year'] && fields['display-date'] && fields['display-date']!==fields['edition-year'])throw new TypeError(`display-date: disagrees with edition-year: for ${id}.`);
    if(datesChanged && fields.reference && prior.displayDate && !fields['display-date'])delete next.displayDate;
    if(next.originalIssued && next.issued && next.originalIssued[0]>next.issued[0])throw new TypeError(`Original year is later than edition year for ${id}.`);
    if(fields.reference){next.citationParts=referenceParts(fields.reference);next.citationText='';}
    if(fields.rights)next.license={name:fields.rights};
    const contributors=['photographer','uploader'].filter(key=>fields[key]).map(role=>({role,name:fields[role]}));
    if(contributors.length)next.contributors=[...(prior.contributors||[]).filter(person=>!fields[person.role]),...contributors];
    if((fields.access || fields.checked) && !fields.pdf && !fields['read-url'])throw new TypeError(`access: and checked: need pdf: or read-url: for ${id}.`);
    const locations=['pdf','read-url'].filter(key=>fields[key]).map(key=>{
      if(key==='pdf' && !fields.checked)throw new TypeError(`Supply checked:YYYY-MM-DD with pdf: for ${id}.`);
      return {kind:key==='pdf'?'pdf':'publisher',provider:'Author-supplied copy',url:fields[key],access:fields.access||'unknown',verifiedAt:fields.checked ? fields.checked+'T00:00:00.000Z' : null};
    });
    if(locations.length)next.locations=[...prior.locations.filter(location=>!locations.some(added=>added.url===location.url)),...locations];
    const priorFields=new Set(Object.keys(fields).filter(key=>recordFields[key]).map(key=>recordFields[key]));
    if(fields.reference){priorFields.add('citationParts');priorFields.add('citationText');}
    if(fields.rights)priorFields.add('license');
    if(contributors.length)priorFields.add('contributors');
    if(locations.length)priorFields.add('locations');
    if(prior.displayDate && next.displayDate!==prior.displayDate)priorFields.add('displayDate');
    next.provenance=[...prior.provenance,{provider:'Document author',note:JSON.stringify({assertions:fields,prior:Object.fromEntries([...priorFields].map(key=>[key,prior[key]??null]))})}];
    const normalized=normalizeRecord(next);
    index.byId.set(id,normalized);
    for(const identifier of normalized.identifiers)index.byIdentifier.set(canonicalIdentifierKey(identifier),normalized);
  }
}
