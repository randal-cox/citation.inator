// Public Einstein/Planck metadata matches demos/import/document-examples.mjs.
// The two example.org records below are explicitly synthetic teaching data.
const titles=[
  ['light','Über einen die Erzeugung und Verwandlung des Lichtes betreffenden heuristischen Gesichtspunkt','10.1002/andp.19053220607','322','6','132–148'],
  ['brownian','Über die von der molekularkinetischen Theorie der Wärme geforderte Bewegung von in ruhenden Flüssigkeiten suspendierten Teilchen','10.1002/andp.19053220806','322','8','549–560'],
  ['relativity','Zur Elektrodynamik bewegter Körper','10.1002/andp.19053221004','322','10','891–921']
];
export const extraRecords=[
  ...titles.map(([id,title,doi,volume,issue,pages])=>({id:'einstein-1905-'+id,type:'article-journal',state:'resolved',title,authors:[{family:'Einstein',given:'Albert'}],issued:[1905],containerTitle:'Annalen der Physik',volume,issue,pages,identifiers:[{scheme:'doi',value:doi}],provenance:[{provider:'Wiley',url:'https://doi.org/'+doi}]})),
  {id:'example-handbook',type:'book',state:'resolved',title:'Example field handbook',authors:[{literal:'Example archive'}],issued:[2024],locations:[
    {kind:'pdf',provider:'Example archive',access:'open',url:'https://example.org/handbook.pdf',verifiedAt:'2026-11-01T00:00:00Z'},
    {kind:'library',provider:'JSTOR',service:'jstor',access:'subscription',url:'https://example.org/jstor-handbook'},
    {kind:'library',provider:'WorldCat',service:'worldcat',access:'unknown',url:'https://example.org/worldcat-handbook'}
  ],note:'Synthetic access example; destinations are illustrative.'},
  {id:'example-artwork',type:'artwork',state:'resolved',title:'Example harbor study',creatorAttribution:'Attributed to',authors:[{literal:'Example artist'}],displayDate:'1830/34',medium:'Oil on canvas',dimensions:'60 × 90 cm',holdingInstitution:'Example archive',accession:'DEMO-42',license:{name:'CC BY-SA 4.0',url:'https://creativecommons.org/licenses/by-sa/4.0/'},rightsHolder:'Example artist',contributors:[{name:'Example uploader',role:'uploader'}],provenance:[{provider:'Example archive',checksums:[{role:'source',algorithm:'sha256',value:'a'.repeat(64)},{role:'served',algorithm:'sha256',value:'b'.repeat(64)}]}],note:'Synthetic artwork and illustrative checksums.'}
];
export function learningRecords(base){return [...base.map(record=>record.id==='ioannidis-2005'?{...record,locations:[
 {kind:'publisher',provider:'PLOS',url:'https://journals.plos.org/plosmedicine/article?id=10.1371/journal.pmed.0020124',access:'open',verifiedAt:'2026-11-24T21:49:26Z'},
 {kind:'pdf',provider:'PLOS',url:'https://journals.plos.org/plosmedicine/article/file?id=10.1371/journal.pmed.0020124&type=printable',access:'open',verifiedAt:'2026-11-24T21:49:26Z'}
],integrity:{state:'corrected',source:'PLOS correction notice, 25 August 2022',url:'https://doi.org/10.1371/journal.pmed.1004085'}}:record),...extraRecords];}
