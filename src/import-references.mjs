// Experimental rules propose fields. Original entries are always retained for review.
import {referenceDOIs} from './import-identifiers.mjs';
const year='(?:1[5-9]\\d{2}|20\\d{2})';
export function parseAPAAuthorList(text) {
  const authors=[];let remainder=text.trim();
  while (remainder) {
    const match=/^([^,]+),\s*((?:\p{Lu}\.(?:-\p{Lu}\.)?\s*)+)(?:,\s*(?:&\s*)?|$)/u.exec(remainder);
    if (!match || !/\p{L}/u.test(match[1]) || /(?:\.\s*){2,}|…/u.test(match[1]) || /\bet\s+al\b/iu.test(match[1]) || /\b(?:Jr|Sr|II|III|IV)\.?$/iu.test(match[1].trim()) || !/^[\p{L}\p{M}'’ .-]+$/u.test(match[1])) return null;
    authors.push({family:match[1].trim(),given:match[2].trim()});remainder=remainder.slice(match[0].length);
  }
  return authors.length ? authors : null;
}

export function parseOrganizationAuthor(text){
 const name=text.trim().replace(/\.$/u,'');
 if(!name||name.length>150||/[;,<>]/u.test(name))return null;
 return /\b(?:organization|organisation|institute|university|ministry|department|association|society|committee|council|agency|office|government|foundation|corporation|company|centres?|centers?|laborator(?:y|ies)|labs?|bureau|bank|united nations)\b/iu.test(name)||/^[A-Z]{2,12}$/u.test(name)?[{literal:name}]:null;
}

function numberedAuthors(raw){
 const shortened=/,?\s+et al\.?$/iu.test(raw),body=raw.replace(/,?\s+et al\.?$/iu,'');
 const people=[];
 for(const entry of body.split(/,\s*/u)){
  const m=/^([\p{L}\p{M}'’ .-]+?)\s+([A-Z]{1,6}(?:-[A-Z]{1,3})?)$/u.exec(entry.trim());
  if(!m||!/[\p{L}]/u.test(m[1])||/\bet al\b|\.\.\.|…/iu.test(m[1]))return null;
  people.push({family:m[1],given:m[2].split('-').map(part=>[...part].map(letter=>letter+'.').join(' ')).join('-')});
 }
 return people.length?{authors:people,authorsComplete:!shortened}:null;
}
function numberedFields(text,fields,propose,diagnostics){
 const flat=text.replace(/\s/gu,' '),start=/^\s*[1-9]\d{0,3}\.\s+/u.exec(flat)?.[0].length ?? 0;
 // Initials in the common compact byline have no periods; organisation names may.
 const byline=/^(.+?)\.\s+/u.exec(flat.slice(start));
 if(!byline){diagnostics.push({code:'import-reference-fields-unsupported'});return;}
 const authorText=byline[1],people=numberedAuthors(authorText)||(()=>{const authors=!/[:—–?!]/u.test(authorText)&&parseOrganizationAuthor(authorText);return authors?{authors,authorsComplete:true}:null;})();
 propose('authorText',authorText,start,start+authorText.length,'numbered-byline');
 if(people){Object.assign(fields,people);propose('authors',people.authors,start,start+authorText.length,'numbered-byline-authors');}
 else diagnostics.push({code:'import-reference-byline-unparsed'});
 const after=start+byline[0].length;
 // Anchor on publication syntax, not a year mentioned in a title or accessed date.
 const date=new RegExp('\\b('+year+')(?:\\s+(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*(?:\\s+\\d{1,2})?)?\\s*;\\s*(\\d+)(?:\\s*\\(([^)]+)\\))?(?:\\s*:\\s*([a-z]?\\d+(?:[-–][a-z]?\\d+)?))?(?=\\.|\\s|$)','iu').exec(flat.slice(after));
 if(date){
  const before=flat.slice(after,after+date.index).trimEnd().replace(/\.$/u,'');
  const boundaries=[...before.matchAll(/\.\s+(?=\p{Lu})/gu)].filter(m=>!/(?:\b(?:[A-Z]|Dr|Mr|Mrs|Ms|Prof|St|vs|al|Glob|Int|Med|Soc|Sci|Res|Biol|Phys|Chem)|\b[A-Z](?:\.[A-Z])+)$/.test(before.slice(0,m.index)));
  const boundary=boundaries.at(-1);
  if(boundary){
   const title=before.slice(0,boundary.index).trim(),container=before.slice(boundary.index+boundary[0].length).trim();
   if(title&&container){
    propose('title',title,after,after+boundary.index,'numbered-title-before-journal');
    const containerStart=after+boundary.index+boundary[0].length;
    propose('containerTitle',container,containerStart,containerStart+container.length,'numbered-journal-before-date');
    propose('issued',[Number(date[1])],after+date.index,after+date.index+4,'numbered-journal-date');
    fields.type='article-journal';fields.volume=date[2];if(date[3])fields.issue=date[3];if(date[4])fields[/^e\d/iu.test(date[4])?'articleNumber':'pages']=date[4];
    // Multiple sentence boundaries are inspectable proposals, not assured title segmentation.
    if(boundaries.length>1){fields.type='document';diagnostics.push({code:'import-reference-title-boundary-review-required'});}
   }
  }
 }
 if(!fields.title)diagnostics.push({code:'import-reference-fields-unsupported'});
 diagnostics.push({code:'import-reference-partial-fields',message:'Review proposed fields against the original reference.'});
}

/** Parse one explicitly supplied entry; this never finds/deletes an article bibliography. */
export function parseReference(text,{style='apa'}={}) {
  if (typeof text !== 'string' || !text.trim() || text.length>20000) throw new TypeError('Supply one reference entry, up to 20000 characters.');
  if (!['apa','chicago-author-date','vancouver'].includes(style)) throw new TypeError('Initial reference rules support apa, chicago-author-date and vancouver.');
  const fields={}, evidence=[], diagnostics=[];
  const propose=(field,value,start,end,rule)=>{fields[field]=value;evidence.push({field,start,end,raw:text.slice(start,end),rule});};
  const doiText=referenceDOIs(text);
  if(doiText.identifiers.length)fields.identifiers=doiText.identifiers;
  evidence.push(...doiText.evidence);diagnostics.push(...doiText.diagnostics);
  if (style === 'vancouver') {
    const label=/^\s*([1-9]\d{0,3})\.\s+/.exec(text);
    if (label) propose('referenceNumber',Number(label[1]),label.index,label[0].length,'leading-number');
    numberedFields(text,fields,propose,diagnostics);
  } else {
    const pattern=style === 'apa' ? new RegExp(`\\((${year})([a-z]?)\\)\\.\\s+`,'u') : new RegExp(`\\.\\s+(${year})([a-z]?)\\.\\s+`,'u');
    const date=pattern.exec(text);
    if (date && date.index>0) {
      const authorText=text.slice(0,date.index).trim();
      propose('authorText',authorText,0,date.index,'author-before-date');
      propose('issued',[Number(date[1])],date.index,date.index+date[0].length,'explicit-style-date');
      if (date[2]) fields.sourceSuffix=date[2];
      const authors=(style==='apa'&&parseAPAAuthorList(authorText)) || parseOrganizationAuthor(authorText) || (/^Anonymous\.$/u.test(authorText)?[{literal:'Anonymous'}]:null);
      if (authors) { fields.authors=authors;fields.authorsComplete=true; }
      else diagnostics.push({code:'import-reference-byline-unparsed',message:'Retain and review the original author text.'});
      const after=date.index+date[0].length, tail=text.slice(after);
      const title=/^[“"]([^”"]+)[”"]\.?/u.exec(tail) || /^(.+?)(?=\.\s|$)/u.exec(tail);
      if (title && title[0].trim()) propose('title',title[1].replace(/\.$/,''),after,after+title[0].length,'first-title-segment-proposal');
      diagnostics.push({code:'import-reference-partial-fields',message:'Title boundaries and remaining publication/edition fields require review.'});
    } else diagnostics.push({code:'import-reference-unparsed',message:'No supported author/date boundary; entry retained unchanged.'});
  }
  return {schema:'citation-inator.import-reference.v1',style,raw:text,state:Object.keys(fields).length?'partial':'unparsed',fields,evidence,diagnostics,requiresReview:true};
}

/** Entries must be separated by the caller; ambiguous line wraps are not guessed. */
export function parseReferences(entries,options={}) {
  if (!Array.isArray(entries)) throw new TypeError('Supply an array of explicitly separated reference strings.');
  return {schema:'citation-inator.import-references.v1',entries:entries.map(text=>parseReference(text,options))};
}
