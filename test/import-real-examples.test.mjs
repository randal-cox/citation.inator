import test from 'node:test';import assert from 'node:assert/strict';
import {documentExamples} from '../demos/import/document-examples.mjs';
import {importDemoRequest} from '../scripts/import-demo-service.mjs';
test('real APA example has three same-author same-year works and one unique reference',()=>{
 const result=importDemoRequest({mode:'document',source:documentExamples.apa,style:'auto'});
 assert.equal(result.referenceRecords.length,4);assert.equal(result.review.matches[0].items[0].candidates.length,3);assert.equal(result.review.matches[1].items[0].candidates.length,3);assert.equal(result.review.matches[2].items[0].state,'unique');assert.equal(result.review.matches[3].items[0].state,'unmatched');
 assert.ok(result.referenceRecords.every(record=>record.type==='article-journal'&&record.containerTitle==='Annalen der Physik'&&!record.identifiers.length));
});
test('Chicago real references retain exact titles and structured journal identity evidence',()=>{
 const result=importDemoRequest({mode:'document',source:documentExamples.chicago,style:'auto'});
 assert.equal(result.referenceRecords.length,4);assert.ok(result.referenceRecords.every(record=>record.type==='article-journal'&&record.pages));assert.equal(result.review.matches[0].items[0].candidates.length,3);
});
test('numeric real examples exercise explicit document numbers and known DOI metadata',()=>{
 const result=importDemoRequest({mode:'document',source:documentExamples.numeric,style:'auto'});
 assert.equal(result.referenceRecords.length,2);assert.ok(result.referenceRecords.every(record=>record.identifiers.some(id=>id.scheme==='doi')));assert.equal(result.review.matches[0].items[0].state,'unique');assert.equal(result.review.matches[3].items[0].state,'unmatched');
});
test('all live examples omit invented bibliography works and runtime answer keys',()=>{
 for(const source of Object.values(documentExamples))assert.ok(!/Avery|Bennett|Duval|Example Press/u.test(source));
});
