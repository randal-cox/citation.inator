// Independently authored synthetic identity cases. Never send these to a provider.
// Expected decisions assess identity only; they do not establish claim support.
const article = {
  type: 'article-journal', title: 'Measuring collective attention: a controlled field study',
  authors: [{family:'Okafor',given:'Ada'}, {family:'Ruiz',given:'Elena'}], issued:[2021],
  containerTitle:'Journal of Synthetic Social Studies', volume:'12', issue:'3', pages:'41–57'
};
const doi = (suffix, changes={}) => ({...structuredClone(article),
  identifiers:[{scheme:'doi',value:'10.5555/enrichment.'+suffix}], ...changes});
const item = (id, source, candidates, automatic, reason) => ({id,source,candidates,automatic,reason});

export const doiIdentityChallenges = [
  item('exact', article, [doi('exact')], true, 'Complete exact identity evidence.'),
  item('punctuation', {...article,title:'Measuring collective attention — a controlled field study'}, [doi('punctuation')], true, 'Harmless punctuation alone can normalize.'),
  item('correction', article, [doi('correction',{title:'Correction: '+article.title})], false, 'A notice is a separate work even with shared authors and container.'),
  item('retraction', article, [doi('retraction',{title:'Retraction: '+article.title})], false, 'Retraction prefixes carry identity.'),
  item('subtitle-missing', article, [doi('subtitle',{title:'Measuring collective attention'})], false, 'Do not drop a subtitle to force equality.'),
  item('single-word-negative', article, [doi('different',{title:'Measuring individual attention: a controlled field study'})], false, 'High token overlap is insufficient.'),
  item('wrong-first-author', article, [doi('wrong-author',{authors:[{family:'Mensah',given:'Ada'},{family:'Ruiz',given:'Elena'}]})], false, 'A shared coauthor does not replace first-author evidence.'),
  item('same-family-wrong-person', article, [doi('same-family',{authors:[{family:'Okafor',given:'Peter'},{family:'Ruiz',given:'Elena'}]})], false, 'Same family name with conflicting known given names is not identity.'),
  item('source-missing-authors', {...article,authors:[]}, [doi('no-source-authors')], false, 'Title/year alone requires review.'),
  item('provider-missing-authors', article, [doi('no-provider-authors',{authors:[]})], false, 'Missing provider evidence is not agreement.'),
  item('source-missing-year', {...article,issued:null}, [doi('no-source-year')], false, 'Insufficient source identity evidence.'),
  item('provider-missing-year', article, [doi('no-provider-year',{issued:null})], false, 'Insufficient provider identity evidence.'),
  item('wrong-year', article, [doi('year',{issued:[2020]})], false, 'One-year difference is not automatically an online/print distinction.'),
  item('wrong-type', article, [doi('chapter',{type:'chapter'})], false, 'Chapter and article are separate publication types.'),
  item('preprint', article, [doi('preprint',{type:'article',version:'preprint'})], false, 'Preprint is not automatically the published version.'),
  item('wrong-container', article, [doi('container',{containerTitle:'Other Synthetic Journal'})], false, 'Supplied container conflict blocks automation.'),
  item('wrong-volume', article, [doi('volume',{volume:'13'})], false, 'Supplied volume conflict blocks automation.'),
  item('wrong-pages', article, [doi('pages',{pages:'58–74'})], false, 'Supplied page conflict blocks automation.'),
  item('missing-required-supplied-pages', article, [doi('no-pages',{pages:''})], false, 'An absent corroboration field should not silently count as a comparison match.'),
  item('exact-tie', article, [doi('tie-one'),doi('tie-two')], false, 'Two DOIs with the same full metadata still require a choice.'),
  item('duplicate-doi-alias', article, [doi('alias'),doi('alias',{identifiers:[{scheme:'doi',value:'10.5555/ENRICHMENT.ALIAS'}]})], true, 'Case variants of one DOI are one candidate, not a tie.'),
  item('near-tie', article, [doi('near-one'),doi('near-two',{pages:''})], false, 'A plausible runner-up with incomplete evidence must not disappear solely because it scores lower.'),
  item('source-original-year-not-edition', {...article,originalIssued:[1898]}, [doi('wrong-reprint',{issued:[1898]})], false, 'Original year cannot overwrite cited edition/publication year.')
];

const book = {
  type:'book', title:'Coordination in small communities',authors:[{family:'Bello',given:'Nadia'}],
  issued:[2018],publisher:'Synthetic University Press',edition:'Second edition',language:'eng',format:'paperback'
};
const isbn = (value,changes={}) => ({...structuredClone(book),identifiers:[{scheme:'isbn',value}],...changes});
export const isbnEditionChallenges = [
  item('exact-edition',book,[isbn('9780306406157')],true,'One corroborated edition can be eligible; work search alone cannot prove it.'),
  item('edition-tie',book,[isbn('9780306406157'),isbn('9780140328721')],false,'Two distinct valid ISBNs are not automatically aliases.'),
  item('isbn-alias',book,[isbn('9780306406157'),isbn('0306406152')],true,'ISBN-10 and its corresponding ISBN-13 identify the same ISBN assignment.'),
  item('wrong-edition',book,[isbn('9780306406157',{edition:'First edition'})],false,'Edition conflict blocks automation.'),
  item('wrong-edition-year',book,[isbn('9780306406157',{issued:[1998]})],false,'Reprint/original year cannot replace cited edition year.'),
  item('wrong-language',book,[isbn('9780306406157',{language:'fra'})],false,'Translated edition differs.'),
  item('wrong-publisher',book,[isbn('9780306406157',{publisher:'Other Synthetic Press'})],false,'Publisher conflict blocks automation.'),
  item('wrong-format',book,[isbn('9780306406157',{format:'ebook'})],false,'Binding/format constraints matter when supplied.'),
  item('edition-unknown',book,[isbn('9780306406157',{edition:''})],false,'Missing edition cannot silently corroborate a supplied second edition.'),
  item('invalid-isbn',book,[isbn('9780306406158')],false,'Invalid ISBN check digit cannot be accepted.'),
  item('no-year', {...book,issued:null},[isbn('9780306406157')],false,'A single work result cannot establish an unknown edition.')
];
