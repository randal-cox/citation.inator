import test from 'node:test';import assert from 'node:assert/strict';
import {parseReference,parseReferences} from '../src/import-references.mjs';
test('APA rules propose structured author initials, date, suffix and title with source evidence',()=>{
 const text='Avery, J. R., Bennett, S.-L., & Chan, T. (2021a). A synthetic book title. Example Press. https://doi.org/10.1234/example.';
 const result=parseReference(text);
 assert.deepEqual(result.fields.authors,[{family:'Avery',given:'J. R.'},{family:'Bennett',given:'S.-L.'},{family:'Chan',given:'T.'}]);
 assert.deepEqual(result.fields.issued,[2021]);assert.equal(result.fields.sourceSuffix,'a');assert.equal(result.fields.title,'A synthetic book title');assert.equal(result.fields.identifiers[0].value,'10.1234/example');
 for(const field of result.evidence) assert.equal(text.slice(field.start,field.end),field.raw);
 assert.equal(result.raw,text);assert.equal(result.requiresReview,true);assert.equal(result.state,'partial');
});
test('unsupported complex and undated entries stay raw rather than inventing names',()=>{
 for(const text of ['Avery Jr., J. (2021). Title. Example.','Avery (n.d.). An undated text.']) {
  const result=parseReference(text);assert.equal(result.raw,text);assert.equal(result.fields.authors,undefined);assert.ok(result.diagnostics.length);
 }
});
test('Chicago date boundary and numeric labels propose partial fields only',()=>{
 const chicago=parseReference('Avery, Jordan. 2021. A synthetic title. Example.',{style:'chicago-author-date'});
 assert.equal(chicago.fields.authorText,'Avery, Jordan');assert.deepEqual(chicago.fields.issued,[2021]);assert.equal(chicago.fields.authors,undefined);
 const numeric=parseReference('7. Avery J. A title. Journal. 2021;4:9. doi:10.1234/example',{style:'vancouver'});
 assert.equal(numeric.fields.referenceNumber,7);assert.equal(numeric.fields.authors,undefined);assert.equal(numeric.fields.issued,undefined);assert.equal(numeric.fields.identifiers.length,1);
});
test('entry arrays preserve unsupported and uncited references without source deletion',()=>{
 const entries=['Avery, J. (2021). Title. Press.','Unrecognized raw entry'];const result=parseReferences(entries);
 assert.deepEqual(result.entries.map(e=>e.raw),entries);assert.equal(result.entries[1].state,'unparsed');
 assert.throws(()=>parseReferences('not an array'),TypeError);assert.throws(()=>parseReference(''),TypeError);
});

test('omitted author ellipses and punctuation never become complete named bylines',()=>{
 for(const names of ['Avery, J., ... Chan, T.','Avery, J., . . . Chan, T.','..., J.','-, J.']) {
  const result=parseReference(`${names} (2021). A title. Press.`);
  assert.equal(result.fields.authors,undefined);assert.notEqual(result.fields.authorsComplete,true);
 }
});
test('quoted Chicago titles stop at the closing quote even with punctuation inside',()=>{
 const result=parseReference('Avery, Jordan. 2021. “A quoted article title.” Example Journal.',{style:'chicago-author-date'});
 assert.equal(result.fields.title,'A quoted article title');
});

test('explicit organisation bylines are literal authors without rewriting raw reference text',()=>{const text='Organization. (2021). A report. Example.',p=parseReference(text);assert.deepEqual(p.fields.authors,[{literal:'Organization'}]);assert.equal(p.raw,text);assert.ok(p.diagnostics.some(d=>d.code==='import-reference-partial-fields'));});
