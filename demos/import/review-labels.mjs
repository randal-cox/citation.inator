export function citedWorkLabel(item){
 if(item.referenceNumber!==undefined)return 'Reference '+item.referenceNumber;
 const names=(item.authors || []).join(' & ')+(item.etAl?' et al.':'');
 const date=item.undated?'n.d.':String(item.year || '');
 return [names,(item.originalYear?item.originalYear+'/':'')+date+(item.sourceSuffix || '')].filter(Boolean).join(', ');
}
export function referenceDescription(record){
 if(!record)return '';
 const authors=(record.authors || []).map(author=>author.literal || [author.given,author.family].filter(Boolean).join(' ')).join('; ');
 return [authors,record.issued?.[0],record.containerTitle || record.publisher,record.edition].filter(Boolean).join(' · ');
}
