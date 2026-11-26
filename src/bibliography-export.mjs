// Bibliographic interchange only: no occurrence text, reader state or manager envelopes.
import {readCache,toCSL} from './records.mjs';

const formats={
 'csl-json':{extension:'json',mimeType:'application/vnd.citationstyles.csl+json'},
 bibtex:{extension:'bib',mimeType:'application/x-bibtex'},
 ris:{extension:'ris',mimeType:'application/x-research-info-systems'}
};
const bibTypes={'article-journal':'article',article:'misc',book:'book',chapter:'incollection',report:'techreport'};
const risTypes={'article-journal':'JOUR',article:'GEN',book:'BOOK',chapter:'CHAP',report:'RPRT',thesis:'THES',webpage:'ELEC',dataset:'DATA',software:'COMP',artwork:'ART',image:'ART',legislation:'STAT',document:'GEN'};
// Escaping is literal, including braces/backslashes, never executable TeX supplied by a record.
const tex=value=>String(value??'').replace(/[\\{}%&#_$~^]/g,c=>({'\\':'\\textbackslash{}','{':'\\{','}':'\\}','%':'\\%','&':'\\&','#':'\\#','_':'\\_','$':'\\$','~':'\\textasciitilde{}','^':'\\textasciicircum{}'}[c])).replace(/\s+/gu,' ').trim();
const line=value=>String(value).replace(/[\u0000-\u001f\u007f\u0085\u2028\u2029]+/gu,' ').trim();
const name=person=>person.literal?`{${tex(person.literal)}}`:['{'+tex(person.family)+'}',person.suffix&&'{'+tex(person.suffix)+'}',person.given&&'{'+tex(person.given)+'}'].filter(Boolean).join(', ');

/** Pass compiled.cache for the document's used works, or an explicitly selected cache. Never a manager envelope. */
export function exportBibliography(cache,{format='csl-json'}={}){
 if(!Object.hasOwn(formats,format))throw new TypeError('Choose csl-json, bibtex or ris.');
 const records=[...readCache(cache).byId.values()],diagnostics=[];
 const warn=(record,code,field)=>diagnostics.push({code,recordId:record.id,...(field&&{field})});
 const items=records.map(record=>{
  if(record.state==='unresolved'||!record.title)warn(record,'export-incomplete-record');
  if(record.citationParts?.length||record.citationText)warn(record,'export-custom-reference-omitted','citationParts');
  const csl=toCSL(record);
  // Do not export editorial notes, generic contributor comments, abstracts or provenance.
  delete csl.note;
  const explicitURL=record.identifiers.find(id=>id.scheme==='url')?.value;if(explicitURL)csl.URL=explicitURL;
  if(record.state==='partial')warn(record,'export-record-review-required');
  if(record.contributors?.length||record.creatorAttribution)warn(record,'export-contributor-detail-omitted','contributors');
  for(const scheme of ['doi','isbn','pmid','pmcid','url'])if(record.identifiers.filter(id=>id.scheme===scheme).length>1)warn(record,'export-additional-identifiers-omitted',scheme);
  return {record,csl};
 });
 let text;
 if(format==='csl-json')text=JSON.stringify(items.map(({csl})=>csl),null,2)+'\n';
 else if(format==='bibtex')text=items.map(({record:r,csl:c})=>{
  const type=bibTypes[r.type]||'misc';
  if(type==='misc')warn(r,'export-type-fallback','type');
  for(const [field,value] of [['translator',r.translators?.length],['version',r.releaseVersion],['original-date',r.originalIssued],['issued',r.displayDate],['PMID',c.PMID],['PMCID',c.PMCID],['medium',r.medium],['archive',r.holdingInstitution],['number',r.number]])if(value)warn(r,'export-field-omitted',field);
  if(r.authors.length&&r.editors?.length)warn(r,'export-creator-role-reader-dependent','editor');
  const people=list=>list?.map(name).join(' and ');
  const fields={title:`{${tex(r.title)}}`,author:people(r.authors),editor:people(r.editors),
   [r.type==='chapter'?'booktitle':'journal']:tex(r.containerTitle),publisher:tex(r.publisher),address:tex(r.publisherPlace),
   year:r.issued?.[0],month:r.issued?.[1],volume:tex(r.volume),number:tex(r.issue),pages:tex(r.pages||r.articleNumber),edition:tex(r.edition),doi:tex(c.DOI||''),isbn:tex(c.ISBN||''),url:tex(c.URL||'')};
  if(r.issued?.length>2)warn(r,'export-field-omitted','issued.day');
  if(r.type==='report'){fields.institution=fields.publisher;delete fields.publisher;}
  if(r.titleParts?.length||r.containerTitleParts?.length)warn(r,'export-title-formatting-omitted','title');
  return `@${type}{${r.id},\n${Object.entries(fields).filter(([,v])=>v!==undefined&&v!=='').map(([key,v])=>`  ${key} = {${v}}`).join(',\n')}\n}`;
 }).join('\n\n')+(records.length?'\n':'');
 else text=items.map(({record:r,csl:c})=>{
  const lines=[],add=(tag,value)=>{if(value!==undefined&&value!==null&&value!=='')lines.push(`${tag}  - ${line(value)}`);};
  const type=risTypes[r.type];add('TY',type||'GEN');if(!type||type==='GEN')warn(r,'export-type-fallback','type');
  add('ID',r.id);add('TI',r.title);
  for(const person of r.authors)add('AU',person.literal||[person.family,person.given].filter(Boolean).join(', '));
  for(const person of r.editors||[])add('A2',person.literal||[person.family,person.given].filter(Boolean).join(', '));
  if([...r.authors,...(r.editors||[])].some(p=>p.literal||p.suffix))warn(r,'export-creator-structure-reader-dependent','creators');
  for(const [field,value] of [['translator',r.translators?.length],['original-date',r.originalIssued],['version',r.releaseVersion],['PMID',c.PMID],['PMCID',c.PMCID],['medium',r.medium],['archive',r.holdingInstitution],['number',r.number]])if(value)warn(r,'export-field-omitted',field);
  add('PY',r.issued?.join('/')||r.displayDate);add(r.type==='chapter'?'T2':'JO',r.containerTitle);add('PB',r.publisher);add('CY',r.publisherPlace);add('VL',r.volume);add('IS',r.issue);add('ET',r.edition);
  // A range only when both endpoints are unambiguous; e-locators remain a single SP.
  const pages=r.pages||r.articleNumber,range=/^(\d+)\s*[-–—]\s*(\d+)$/.exec(pages);
  add('SP',range?range[1]:pages);if(range)add('EP',range[2]);add('DO',c.DOI);add('SN',c.ISBN);add('UR',c.URL);
  if(r.titleParts?.length||r.containerTitleParts?.length)warn(r,'export-title-formatting-omitted','title');
  lines.push('ER  - ');return lines.join('\r\n');
 }).join('\r\n\r\n')+(records.length?'\r\n':'');
 return {format,...formats[format],text,recordCount:records.length,diagnostics};
}
