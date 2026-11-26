// Selected bibliographic data only. Connection identity and credentials are not record fields.
import {parseFragment} from 'parse5';
import {normalizeRecord,normalizeIdentifier,dateParts,httpsURL} from './records.mjs';
import {normalizeImportLimits} from './import-limits.mjs';
const types={'article-journal':'article-journal',book:'book',chapter:'chapter',report:'report',thesis:'thesis',webpage:'webpage',dataset:'dataset',software:'software','paper-conference':'article'};
export function fromCSLJSON(input,{recordId,limits:overrides}={}){
 const limits=normalizeImportLimits(overrides),diagnostics=[];
 if(JSON.stringify(input)?.length>limits.recordCharacters)throw new RangeError('Selected metadata exceeds the record limit.');
 let item=typeof input==='string'?JSON.parse(input):input;
 if(Array.isArray(item)){if(item.length!==1)throw new TypeError('Select one CSL item.');item=item[0];}
 if(!item||typeof item!=='object'||Array.isArray(item))throw new TypeError('Supply one CSL item.');
 const warn=(code,field)=>diagnostics.push({code,field});
 const numericFields=new Set(['volume','issue','page','article-number','edition']);
 const text=(field)=>{const value=item[field];if(typeof value==='string')return value.trim();if(numericFields.has(field)&&Number.isFinite(value))return String(value);if(value!==undefined&&value!==null)warn('csl-field-review-required',field);return '';};
 const titleFormatting={};
 const plain=field=>{
  const value=text(field);if(!/[<&]/.test(value))return value;
  const root=parseFragment(value),parts=[];let unsupported=false;
  const walk=(node,emphasis)=>{
   if(node.nodeName==='#text'){parts.push({text:node.value,...(emphasis&&{emphasis})});return;}
   if(['script','style','template'].includes(node.tagName)){unsupported=true;return;}
   let next=emphasis;
   if(node.tagName){const format={i:'italic',em:'italic',b:'bold',strong:'bold'}[node.tagName];if(!format||node.attrs?.length||emphasis&&emphasis!==format)unsupported=true;else next=format;}
   for(const child of node.childNodes||[])walk(child,next);
  };
  walk(root);const title=parts.map(p=>p.text).join('').trim();
  if(unsupported)warn('csl-title-formatting-review-required',field);
  // Trimming applies to the edge runs too, keeping searchable text and formatting consistent.
  while(parts.length&&!parts[0].text.trim())parts.shift();while(parts.length&&!parts.at(-1).text.trim())parts.pop();
  if(parts.length){parts[0].text=parts[0].text.trimStart();parts.at(-1).text=parts.at(-1).text.trimEnd();}
  if(!unsupported&&parts.some(p=>p.emphasis))titleFormatting[field==='title'?'titleParts':'containerTitleParts']=parts;
  return title;
 };
 const people=field=>{
  if(item[field]===undefined)return [];
  if(!Array.isArray(item[field])||item[field].length>limits.authorsPerRecord)throw new TypeError('Use a bounded CSL creator array.');
  return item[field].flatMap(person=>{
   if(!person||typeof person!=='object'){warn('csl-creator-review-required',field);return [];}
   if(typeof person.literal==='string'&&person.literal.trim())return [{literal:person.literal.trim()}];
   if(typeof person.family!=='string'||!person.family.trim()){warn('csl-creator-review-required',field);return [];}
   const particles=[person['non-dropping-particle'],person['dropping-particle']].filter(x=>typeof x==='string'&&x.trim());if(particles.length)warn('csl-name-particle-review-required',field);
   return [{family:[...particles,person.family.trim()].join(' '),...(typeof person.given==='string'&&{given:person.given.trim()}),...(typeof person.suffix==='string'&&{suffix:person.suffix.trim()})}];
  });
 };
 const cslDateParts=parts=>Array.isArray(parts)?dateParts(parts.map(value=>typeof value==='string'&&/^\d{1,4}$/.test(value)?Number(value):value)):null;
 function date(field){const value=item[field];if(!value)return null;const parts=value['date-parts'];if(Array.isArray(parts)&&parts.length===1&&cslDateParts(parts[0])&&!value.circa&&!value.season)return cslDateParts(parts[0]);if(field==='issued'&&typeof value.literal==='string'&&value.literal.trim())return null;warn('csl-date-review-required',field);return null;}
 const issued=date('issued'),originalIssued=date('original-date');
 const identifiers=[];
 for(const [field,scheme] of [['DOI','doi'],['ISBN','isbn'],['PMID','pmid'],['PMCID','pmcid']]){
  const raw=text(field);if(!raw)continue;
  let candidates=[raw];if(scheme==='isbn'&&!normalizeIdentifier('isbn:'+raw))candidates=raw.split(/[,;\n]+/).flatMap(part=>normalizeIdentifier('isbn:'+part.trim())?[part.trim()]:part.trim().split(/\s+/));
  for(const value of candidates){const id=normalizeIdentifier(scheme+':'+value);if(id)identifiers.push(id);else warn('csl-identifier-review-required',field);}
 }
 const url=httpsURL(text('URL'));
 if(text('URL')&&!url)warn('csl-url-review-required','URL');
 if(url&&!/\/(?:users|groups)\/\d+\/items\//.test(new URL(url).pathname))identifiers.push({scheme:'url',value:url});
 else if(url)warn('csl-manager-address-omitted','URL');
 const authors=people('author'),editors=people('editor'),translators=people('translator');
 for(const field of ['container-author','collection-editor','recipient','interviewer','composer','director','illustrator'])if(item[field]?.length)warn('csl-creator-role-review-required',field);
 const title=plain('title'),containerTitle=plain('container-title');
 if(!title||title.length>limits.titleCharacters)throw new TypeError('Use a nonempty bounded bibliographic title.');
 if(!Object.hasOwn(types,item.type))warn('csl-type-review-required','type');
 if(!authors.length&&!editors.length)warn('csl-missing-creator','author');
 const sourceDates=item.issued?.['date-parts'];
 const renderedDates=Array.isArray(sourceDates)&&sourceDates.length&&sourceDates.every(parts=>cslDateParts(parts))?sourceDates.map(parts=>parts.join('-')).join('–'):'';
 const literalDate=issued?'':typeof item.issued?.literal==='string'?item.issued.literal.trim():renderedDates?(item.issued?.circa?'circa ':'')+renderedDates+(item.issued?.season?' (season '+String(item.issued.season)+')':''):'';
 if(issued&&item.issued?.literal)warn('csl-date-review-required','issued');
 if(!issued&&!literalDate)warn('csl-missing-date','issued');
 const record=normalizeRecord({id:recordId,type:Object.hasOwn(types,item.type)?types[item.type]:'document',title,containerTitle,...titleFormatting,authors,editors,translators,issued,originalIssued,displayDate:literalDate,identifiers,
  publisher:text('publisher'),publisherPlace:text('publisher-place'),volume:text('volume'),issue:text('issue'),pages:text('page'),articleNumber:text('article-number'),edition:typeof item.edition==='number'?String(item.edition):text('edition'),
  releaseVersion:text('version'),state:diagnostics.length?'partial':'resolved',provenance:[{provider:'CSL-JSON',note:'Selected bibliographic snapshot; identifiers have not been independently verified.'}]});
 if(JSON.stringify(record).length>limits.recordCharacters)throw new RangeError('Converted metadata exceeds the record limit.');
 return {schema:'citation-inator.metadata-proposal.v1',record,diagnostics,requiresReview:diagnostics.length>0};
}
