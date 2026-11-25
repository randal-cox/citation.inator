import {createIdentifierResolver} from './identifier-resolver.mjs';
import {cleanText,canonicalIdentifierKey,localRecordId,normalizeIdentifier,normalizeRecord} from './records.mjs';

export function pubmedRecord(raw,identifier,retrievedAt,url){
  const results=raw?.resultList?.result;
  if(Number(raw?.hitCount)===0)return null;
  if(Number(raw?.hitCount)!==1 || !Array.isArray(results) || results.length!==1)throw new Error('Ambiguous PubMed identifier response.');
  const work=results[0];
  if(work.source!=='MED' || String(work.id)!==identifier.value)throw new Error('Provider returned a different PubMed record.');
  const identifiers=[identifier];
  for(const [key,scheme] of [['doi','doi'],['pmcid','pmcid']])if(work[key]){
    const value=normalizeIdentifier(`${scheme}:${work[key]}`);
    if(!value)throw new Error(`Provider returned an invalid ${scheme}.`);
    identifiers.push(value);
  }
  const authors=(work.authorList?.author || []).flatMap(person=>person.lastName ? [{family:person.lastName,given:person.firstName||person.initials||''}] : person.collectiveName ? [{literal:person.collectiveName}] : []);
  const year=/^[1-9]\d{3}$/.test(String(work.pubYear)) ? [Number(work.pubYear)] : null;
  return normalizeRecord({id:localRecordId('pubmed',canonicalIdentifierKey(identifier)),identifiers,title:cleanText(work.title),authors,issued:year,state:work.title&&authors.length&&year?'resolved':'partial',type:'article-journal',containerTitle:work.journalInfo?.journal?.title,volume:work.journalInfo?.volume,issue:work.journalInfo?.issue,pages:work.pageInfo,retrievedAt,locations:[],provenance:[{provider:'Europe PMC',url,retrievedAt,note:'Exact PubMed identifier lookup; DOI and PMCID aliases are explicitly supplied by the provider.'}]});
}
export function createPubMedResolver(options){
  return createIdentifierResolver({provider:'Europe PMC',scheme:'pmid',fields:['title','authors','issued','containerTitle','volume','issue','pages'],locationKind:'publisher',endpoint:identifier=>{
    const url=new URL('https://www.ebi.ac.uk/europepmc/webservices/rest/search');
    url.search=new URLSearchParams({query:`EXT_ID:${identifier.value} AND SRC:MED`,format:'json',resultType:'core',pageSize:'2'});return url;
  },metadata:pubmedRecord,missMessage:'No PubMed record was found for this identifier.',unsupportedMessage:'This resolver accepts PubMed identifiers.'},options);
}
