// Synthetic, local-only example. No account, library, file writes or provider requests.
import {inspectBibliography,applyBibliographyImport,exportBibliography,reviewMetadataRefresh,applyMetadataRefresh,reviewCrossrefNotices,applyNoticeReview} from '../src/library-tools.mjs';
const source=JSON.stringify([{type:'book',title:'Collected methods',editor:[{family:'Rivera',given:'Ana'}],issued:{'date-parts':[[2020]]},DOI:'10.1234/synthetic-example'}]);
const review=inspectBibliography(source,{format:'csl-json'});
const imported=applyBibliographyImport(source,review,{format:'csl-json',decisions:[{index:0,action:'import',recordId:'rivera-2020-methods'}]});
for(const format of ['csl-json','bibtex','ris']){const file=exportBibliography(imported.cache,{format});console.log(format,':',file.recordCount,'reference;',file.diagnostics.length,'format warnings');}
const current=imported.cache.records[0],incoming={...current,publisher:'Example Press',provenance:[{provider:'Selected library snapshot'}]};
const refresh=reviewMetadataRefresh(current,incoming);
const refreshed=applyMetadataRefresh(imported.cache,incoming,refresh,{confirmIdentity:true,decisions:refresh.changes.map(c=>({field:c.field,action:c.field==='publisher'?'take':'keep'}))});
const notices=[{message:{DOI:'10.1234/synthetic-correction','update-to':[{DOI:'10.1234/synthetic-example',type:'correction',source:'publisher'}]}}];
const noticeReview=reviewCrossrefNotices(refreshed.record,notices,{checkedAt:'2026-11-25T12:00:00Z'});
const accepted=applyNoticeReview(refreshed.cache,notices,noticeReview,{action:'accept',proposalIndex:0});
console.log('Reviewed publisher:',refreshed.record.publisher);console.log('Explicitly accepted synthetic notice:',accepted.record.integrity.state);
