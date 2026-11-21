import test from 'node:test';
import assert from 'node:assert/strict';
import { parseInTextCitations, matchCitations } from '../src/import-matcher.mjs';
const record=(id,families,year,title=id)=>({id,title,state:'resolved',type:'book',authors:families.map(family=>({family})),issued:[year]});

test('experimental detector preserves grouped APA author-date source, affixes and locators',()=>{
 const text='😀 Before (see also Avery, 2021, p. 4; Bennett & Chan, 2019, pp. 12–15). After.';
 const result=parseInTextCitations(text,'apa');
 assert.equal(result.citations.length,1);
 const citation=result.citations[0];
 assert.equal(text.slice(citation.start,citation.end),citation.raw);
 assert.equal(citation.start,text.indexOf('('));
 assert.deepEqual(citation.items.map(item=>item.authors),[['Avery'],['Bennett','Chan']]);
 assert.equal(citation.items[0].prefix,'see also');assert.equal(citation.items[0].locator,'p. 4');
 assert.equal(citation.items[1].locator,'pp. 12–15');assert.equal(citation.requiresReview,true);
});

test('Chicago suffixes, reprints and narrative forms remain explicit',()=>{
 const result=parseInTextCitations('Avery and Bennett (2021) agree (García 2020a; Duval [1912] 1995).','chicago-author-date');
 assert.equal(result.citations.length,2);
 assert.equal(result.citations[0].form,'narrative');
 assert.equal(result.citations[0].raw,'Avery and Bennett (2021)');
 assert.equal(result.citations[1].items[0].sourceSuffix,'a');
 assert.equal(result.citations[1].items[1].originalYear,1912);
});

test('existing notation, noncitations and out-of-range reference lists are left alone',()=>{
 const text='A date (2021), a rate (p = 0.04), and a marker {citation alpha | note:"Avery (2021)"}. Real (Bennett, 2019).\n\nReferences\nAvery (2021) Bibliography.';
 const result=parseInTextCitations(text,{range:{start:0,end:text.indexOf('\n\nReferences')}});
 assert.deepEqual(result.citations.map(c=>c.raw),['(Bennett, 2019)']);
 assert.throws(()=>parseInTextCitations(text,{style:'unknown'}),/Initial detection/);
 assert.throws(()=>parseInTextCitations(text,{format:'markdown'}),/visible plain text/);
 assert.throws(()=>parseInTextCitations(text,{range:{start:-1,end:4}}),/range/);
});

test('matching keeps unique, ambiguous and unknown proposals distinct without cache mutation',()=>{
 const text='(Avery, 2021; Bennett, 2019; Unknown, 2000)';
 const references=[record('avery',['Avery'],2021),record('bennett-a',['Bennett'],2019),record('bennett-b',['Bennett'],2019)];
 const before=JSON.stringify(references);
 const matched=matchCitations(parseInTextCitations(text),references);
 assert.deepEqual(matched.matches[0].items.map(item=>item.state),['unique','ambiguous','unmatched']);
 assert.ok(matched.matches[0].items.every(item=>item.requiresReview));
 assert.equal(JSON.stringify(references),before);
 assert.equal(matched.matches[0].items[0].candidates[0].recordId,'avery');
});

test('source suffixes require document evidence and never derive letters from cache order',()=>{
 const detection=parseInTextCitations('(Avery, 2021a)');
 const refs=[record('second',['Avery'],2021),record('first',['Avery'],2021)];
 assert.equal(matchCitations(detection,refs).matches[0].items[0].state,'ambiguous');
 const labelled=refs.map((record,index)=>({...record,sourceSuffix:index?'a':'b'}));
 const result=matchCitations(detection,labelled).matches[0].items[0];
 assert.equal(result.state,'unique');assert.equal(result.candidates[0].recordId,'first');
 assert.equal(matchCitations(detection,[refs[0]]).matches[0].items[0].state,'ambiguous');
});

test('reprint years, full bylines, et al and initials constrain proposals',()=>{
 const reprint={...record('edition',['Duval'],1995),originalIssued:[1912]};
 assert.equal(matchCitations(parseInTextCitations('(Duval [1912] 1995)','chicago-author-date'),[reprint]).matches[0].items[0].state,'unique');
 assert.equal(matchCitations(parseInTextCitations('(Duval [1900] 1995)','chicago-author-date'),[reprint]).matches[0].items[0].state,'unmatched');
 const multi=record('multi',['Avery','Bennett','Chan'],2021);
 assert.equal(matchCitations(parseInTextCitations('(Avery et al., 2021)'),[multi]).matches[0].items[0].state,'unique');
 assert.equal(matchCitations(parseInTextCitations('(Avery, 2021)'),[multi]).matches[0].items[0].state,'unmatched');
 const names=[{...record('j',['Avery'],2021),authors:[{family:'Avery',given:'Jamie'}]}, {...record('r',['Avery'],2021),authors:[{family:'Avery',given:'Robin'}]}];
 assert.deepEqual(matchCitations(parseInTextCitations('(J. Avery, 2021)'),names).matches[0].items[0].candidates.map(c=>c.recordId),['j']);
});

test('APA original/edition dates are retained, including same-year republication',()=>{
 const result=parseInTextCitations('(Avery, 1990/2005, p. 4; Anonymous, 2020/2020)');
 assert.equal(result.citations.length,1);
 assert.equal(result.citations[0].items[0].originalYear,1990);
 assert.equal(result.citations[0].items[0].year,2005);
 assert.equal(result.citations[0].items[1].originalYear,2020);
 const references=[{...record('edition',['Avery'],2005),originalIssued:[1990]}];
 assert.equal(matchCitations(result,references).matches[0].items[0].state,'unique');
 const unsupported=parseInTextCitations('(Avery 2000, 2004)','chicago-author-date');
 assert.equal(unsupported.citations.length,0);assert.equal(unsupported.diagnostics[0].code,'import-unparsed-author-date');
});

test('narrative boundaries stay within paragraphs and uncertain name spans require review',()=>{
 for(const prefix of ['As ','Similarly, ']) {
  const detected=parseInTextCitations(prefix+'Avery (2021)');
  assert.equal(detected.citations[0].raw,'Avery (2021)');
  assert.equal(detected.citations[0].items[0].boundaryUncertain,true);
  assert.equal(matchCitations(detected,[record('one',['Avery'],2021)]).matches[0].items[0].state,'ambiguous');
 }
 const heading=parseInTextCitations('HEADING\n\nAvery (2021)');
 assert.equal(heading.citations[0].raw,'Avery (2021)');
 assert.equal(parseInTextCitations('Avery\n\n(2021)').citations.length,0);
});

test('et al requires omitted authors and incomplete bylines cannot become unique matches',()=>{
 const one=record('one',['Avery'],2021);
 assert.equal(matchCitations(parseInTextCitations('(Avery et al., 2021)'),[one]).matches[0].items[0].state,'unmatched');
 const incomplete={...one,authorsComplete:false};
 assert.equal(matchCitations(parseInTextCitations('(Avery et al., 2021)'),[incomplete]).matches[0].items[0].state,'ambiguous');
 assert.equal(matchCitations(parseInTextCitations('(Avery, 2021)'),[incomplete]).matches[0].items[0].state,'ambiguous');
 const oxford=parseInTextCitations('(Avery, Bennett, & Chan, 2021)');
 assert.deepEqual(oxford.citations[0].items[0].authors,['Avery','Bennett','Chan']);
 const initials={...one,authors:[{family:'Avery',given:'R.W.'}]};
 assert.equal(matchCitations(parseInTextCitations('(R. W. Avery, 2021)'),[initials]).matches[0].items[0].state,'unique');
});

test('narrative alternatives retain known initials and mark weak name-boundary evidence',()=>{
 const refs=[{...record('j',['Avery'],2021),authors:[{family:'Avery',given:'Jamie'}]},{...record('r',['Avery'],2021),authors:[{family:'Avery',given:'Robin'}]}];
 const result=matchCitations(parseInTextCitations('We follow R. Avery (2021).'),refs).matches[0].items[0];
 assert.deepEqual(result.candidates.map(c=>c.recordId),['r']);
 const comma=matchCitations(parseInTextCitations('Avery, Bennett, and Chan (2021)'),[record('three',['Avery','Bennett','Chan'],2021),record('two',['Bennett','Chan'],2021)]).matches[0].items[0];
 assert.equal(comma.state,'ambiguous');
 assert.ok(comma.candidates.every(c=>c.evidence.authors==='uncertain-narrative-span'));
});

test('numeric citations preserve grouped ranges and UTF-16 source spans',()=>{
 const text='😀 Reading [1, 3–5, 8].';
 const result=parseInTextCitations(text,'vancouver');
 assert.equal(result.citations.length,1);const citation=result.citations[0];
 assert.equal(citation.raw,'[1, 3–5, 8]');assert.equal(text.slice(citation.start,citation.end),citation.raw);
 assert.deepEqual(citation.items.map(item=>item.referenceNumber),[1,3,4,5,8]);assert.equal(citation.requiresReview,true);
});

test('numeric matching requires explicit document-local labels rather than cache order',()=>{
 const refs=[{...record('two',['Bennett'],2020),referenceNumber:2},{...record('one',['Avery'],2021),referenceNumber:1},record('unlabelled',['Chan'],2019)];
 const detection=parseInTextCitations('[1–3]','vancouver');
 const result=matchCitations(detection,refs).matches[0].items;
 assert.deepEqual(result.map(item=>item.state),['unique','unique','unmatched']);
 assert.deepEqual(result.slice(0,2).map(item=>item.candidates[0].recordId),['one','two']);
 assert.equal(result[0].candidates[0].evidence.identity,'document-local-label');
 const collision=matchCitations(detection,[...refs,{...record('other',['Duval'],2000),referenceNumber:1}]);
 assert.equal(collision.matches[0].items[0].state,'ambiguous');
 assert.throws(()=>matchCitations(detection,[{...refs[0],referenceNumber:0}]),/referenceNumber/);
});

test('numeric malformed groups are not partially imported and expansion is bounded',()=>{
 for(const text of ['[3–1]','[0]','[1,]','[1–9999]','[1 2]','[1,[2]]','[[1]]','[1]]','[1,2']) {
  const result=parseInTextCitations(text,'vancouver');assert.equal(result.citations.length,0);assert.equal(result.diagnostics[0].code,'import-unparsed-numeric-citation');
 }
 const duplicate=parseInTextCitations('[1,1]','vancouver');assert.equal(duplicate.citations[0].items.length,2);assert.equal(duplicate.diagnostics[0].code,'import-repeated-reference-number');
 assert.equal(parseInTextCitations('[95%] [p < 0.05]','vancouver').citations.length,0);
});

test('numeric notation and bibliography boundaries remain protected',()=>{
 const text='{citation alpha | note:"[1]"} Body [2].\nReferences\n[3] Book';
 const result=parseInTextCitations(text,{style:'vancouver',range:{start:0,end:text.indexOf('\nReferences')}});
 assert.deepEqual(result.citations.map(c=>c.raw),['[2]']);
});

test('undated citations recognize locators but missing dates do not become verified undated identity',()=>{
 const detection=parseInTextCitations('(Avery, n.d., p. 5)');assert.equal(detection.citations[0].items[0].undated,true);
 const reference={...record('undated',['Avery'],2021),issued:null};
 const unknown=matchCitations(detection,[reference]).matches[0].items[0];assert.equal(unknown.state,'ambiguous');assert.equal(unknown.candidates[0].evidence.year,'date-not-recorded');
 assert.equal(matchCitations(detection,[{...reference,undated:true}]).matches[0].items[0].state,'unique');
 assert.equal(matchCitations(detection,[record('dated',['Avery'],2021)]).matches[0].items[0].state,'unmatched');
 assert.throws(()=>matchCitations(detection,[{...record('conflict',['Avery'],2021),undated:true}]),/cannot also/);
});

test('undated letters support APA hyphens, case variants and visible unsupported-shape diagnostics',()=>{
 for(const text of ['(Avery, n.d.-a)','(Avery, N.D.-A)','(Avery, N.D.)']) {
  const detected=parseInTextCitations(text);assert.equal(detected.citations.length,1,text);assert.equal(detected.citations[0].items[0].undated,true);
 }
 assert.equal(parseInTextCitations('(Avery, n.d.-a)').citations[0].items[0].sourceSuffix,'a');
 const refs=[{...record('a',['Avery'],2020),issued:null,undated:true,sourceSuffix:'a'},{...record('b',['Avery'],2020),issued:null,undated:true,sourceSuffix:'b'}];
 assert.deepEqual(matchCitations(parseInTextCitations('(Avery, n.d.-a)'),refs).matches[0].items[0].candidates.map(c=>c.recordId),['a']);
 for(const text of ['(Avery, n.d.-)','(Avery, n.d., pp. iv–v)']) {const detected=parseInTextCitations(text);assert.equal(detected.citations.length,0);assert.equal(detected.diagnostics[0].code,'import-unparsed-author-date');}
});
