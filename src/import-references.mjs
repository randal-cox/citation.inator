// Experimental rules propose fields. Original entries are always retained for review.
import { normalizeIdentifier } from './records.mjs';
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

/** Parse one explicitly supplied entry; this never finds/deletes an article bibliography. */
export function parseReference(text,{style='apa'}={}) {
  if (typeof text !== 'string' || !text.trim() || text.length>20000) throw new TypeError('Supply one reference entry, up to 20000 characters.');
  if (!['apa','chicago-author-date','vancouver'].includes(style)) throw new TypeError('Initial reference rules support apa, chicago-author-date and vancouver.');
  const fields={}, evidence=[], diagnostics=[];
  const propose=(field,value,start,end,rule)=>{fields[field]=value;evidence.push({field,start,end,raw:text.slice(start,end),rule});};
  const identifierCandidates=[];
  for (const match of text.matchAll(/(?:https?:\/\/(?:dx\.)?doi\.org\/|doi:\s*)(10\.\d{4,9}\/[^\s<>]+)/giu)) {
    const value=match[1].replace(/[.,;]+$/,'');const identifier=normalizeIdentifier('doi:'+value);
    if (identifier && !identifierCandidates.some(candidate=>candidate.value===identifier.value)) {
      identifierCandidates.push(identifier);evidence.push({field:'identifiers',start:match.index,end:match.index+match[0].length,raw:match[0],rule:'explicit-doi-text'});
    }
  }
  if (identifierCandidates.length) fields.identifiers=identifierCandidates;
  if (style === 'vancouver') {
    const label=/^\s*([1-9]\d{0,3})\.\s+/.exec(text);
    if (label) propose('referenceNumber',Number(label[1]),label.index,label[0].length,'leading-number');
    diagnostics.push({code:'import-reference-fields-unsupported',message:'Numeric labels and explicit identifiers only; byline/title/date remain raw.'});
  } else {
    const pattern=style === 'apa' ? new RegExp(`\\((${year})([a-z]?)\\)\\.\\s+`,'u') : new RegExp(`\\.\\s+(${year})([a-z]?)\\.\\s+`,'u');
    const date=pattern.exec(text);
    if (date && date.index>0) {
      const authorText=text.slice(0,date.index).trim();
      propose('authorText',authorText,0,date.index,'author-before-date');
      propose('issued',[Number(date[1])],date.index,date.index+date[0].length,'explicit-style-date');
      if (date[2]) fields.sourceSuffix=date[2];
      const authors=style==='apa' && parseAPAAuthorList(authorText);
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
