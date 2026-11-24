import test from 'node:test';
import assert from 'node:assert/strict';
import {parseReference} from '../src/import-references.mjs';
import {analyzeImportDocument} from '../src/import-document.mjs';
import {processImportRequest} from '../src/import-api.mjs';

// Written independently of the numbered-reference implementation. These are
// synthetic boundary cases, not an assertion that every Vancouver variant works.
const parse=text=>parseReference(text,{style:'vancouver'});
const document=ref=>analyzeImportDocument('A claim [1].\n\nReferences\n\n'+ref,{style:'vancouver'});
const initials=value=>value.replace(/[.\s]/gu,'');
const identifierChoices=record=>[...record.identifiers,...(record.identifierProposals || [])];

test('numbered journal proposals retain incomplete bylines and publication fields',()=>{
 const raw='7. Rivera R, Chen SM, et al. Trial outcomes. Test Journal. 2020;12(3):101–9. doi:10.5555/trial';
 const p=parse(raw),f=p.fields;
 assert.equal(f.referenceNumber,7);assert.equal(f.title,'Trial outcomes');assert.deepEqual(f.issued,[2020]);
 assert.deepEqual(f.authors.map(a=>a.family),['Rivera','Chen']);assert.deepEqual(f.authors.map(a=>initials(a.given)),['R','SM']);
 assert.equal(f.authorsComplete,false);assert.equal(f.containerTitle,'Test Journal');assert.equal(f.volume,'12');assert.equal(f.issue,'3');assert.equal(f.pages,'101–9');
 assert.equal(p.raw,raw);assert.equal(p.requiresReview,true);assert.equal(p.state,'partial');
 for(const e of p.evidence)assert.equal(raw.slice(e.start,e.end),e.raw);
});

test('numbered journal bylines preserve particles and punctuation rather than splitting surnames',()=>{
 const p=parse('1. O’Neil JS, de Vries K, Van Den Broek NR. A measured response. Example Journal. 2021;4:22–30.');
 assert.deepEqual(p.fields.authors.map(a=>a.family),['O’Neil','de Vries','Van Den Broek']);
 assert.equal(p.fields.authorsComplete,true);assert.equal(p.fields.title,'A measured response');
 assert.deepEqual(p.fields.issued,[2021]);assert.equal(p.fields.pages,'22–30');
});

test('unsupported numbered references remain raw and never gain a complete invented byline',()=>{
 for(const raw of [
  '1. Smith, J., ..., Doe. A questionable byline. Journal. 2020;4:9.',
  '1. Smith J, et al., Jones A. A questionable byline. Journal. 2020;4:9.',
  '1. World Health Organisation. Disease counts. https://example.org/report (Accessed 9 January 2022).',
 ]){
  const p=parse(raw);assert.equal(p.raw,raw);assert.equal(p.requiresReview,true);assert.equal(p.state,'partial');
  if(raw.includes('questionable'))assert.notEqual(p.fields.authorsComplete,true);
  if(raw.includes('Accessed'))assert.notDeepEqual(p.fields.issued,[2022]);
 }
});

test('ordinary wrapped DOI continuity recovers the complete identifier and preserves source',()=>{
 for(const [wrapped,expected] of [
  ['10.1371/journal.\npone.0224511','10.1371/journal.pone.0224511'],
  ['10.1016/S0140-\n6736(15)00946-0','10.1016/s0140-6736(15)00946-0'],
  ['10.7189/jogh.09.\n010406','10.7189/jogh.09.010406'],
 ]){
  const raw='1. Smith A. A paper. Example Journal. 2020;4:9. https://doi.org/'+wrapped;
  const a=document(raw);assert.equal(a.entries.length,1);assert.equal(a.entries[0].raw,raw);
  assert.deepEqual(a.records[0].identifiers,[]);
  assert.deepEqual(identifierChoices(a.records[0]).map(i=>i.value.toLowerCase()),[expected]);
  assert.ok(a.entries[0].evidence.some(e=>e.field==='identifiers'&&e.raw.includes('\n')));
 }
});

test('wrapped DOI recovery never consumes metadata, another link, another reference or blank-line prose',()=>{
 for(const continuation of ['PMID: 12345','https://example.org/other','2. Brown A. Another paper. 2021.','\nAnother paragraph.','This is ordinary prose.']){
  const a=document('1. Smith A. A paper. 2020. https://doi.org/10.1371/journal.\n'+continuation);
  const values=a.records.flatMap(r=>identifierChoices(r).map(i=>i.value));
  assert.ok(!values.some(value=>/12345|example\.org|brown|paragraph|ordinary|this/i.test(value)),continuation);
 }
});

test('complete DOI followed by PMID is retained without joining it',()=>{
 const a=document('1. Smith A. A paper. 2020. https://doi.org/10.5555/complete.\nPMID: 12345');
 assert.deepEqual(a.records[0].identifiers.map(i=>i.value),['10.5555/complete']);
});

test('resolver-prefix wraps recover without changing neighbouring reference text',()=>{
 for(const spelling of ['https://doi.org/\n10.5555/prefix','https://\ndoi.org/10.5555/prefix','doi:\n10.5555/prefix']){
  const raw='1. Smith A. A paper. Example Journal. 2020;4:9. '+spelling,a=document(raw);
  assert.deepEqual(a.records[0].identifiers,[]);
  assert.deepEqual(identifierChoices(a.records[0]).map(i=>i.value),['10.5555/prefix']);
  assert.equal(a.entries[0].raw,raw);
 }
});

test('numbered article title preserves abbreviation and multiple sentence text before journal metadata',()=>{
 const raw='1. Rivera R. U.S. hospital care: A comparison. Findings from two sites. Example Journal. 2020;12(3):101–9.';
 const p=parse(raw);assert.equal(p.fields.title,'U.S. hospital care: A comparison. Findings from two sites');
 assert.equal(p.fields.containerTitle,'Example Journal');assert.deepEqual(p.fields.issued,[2020]);assert.equal(p.raw,raw);
});

test('ambiguous numeric metadata and digit-bearing prose never become appended DOI suffixes',()=>{
 for(const token of ['32553130','Table2','Figure3','COVID-19','accessed2020-12-01','chapter-2','fig.2','table-s1','p.22']){
  const a=document('1. Smith A. A paper. 2020. https://doi.org/10.5555/complete.\n'+token);
  assert.ok(!a.records.flatMap(identifierChoices).some(i=>i.value==='10.5555/complete.'+token.toLowerCase()),token);
 }
});


test('recovered DOI proposals enter the portable cache only through accepted completion',()=>{
 const source='A claim [1].\n\nReferences\n\n1. Smith A. A paper. Example Journal. 2020;4:9. https://doi.org/10.1371/journal.\npone.0224511';
 const context={mode:'document',source,style:'vancouver'},a=processImportRequest(context),r=a.referenceRecords[0];
 assert.deepEqual(r.identifiers,[]);assert.equal(r.identifierProposals.length,1);
 const request={...context,action:'preview',review:a.review,reviewId:a.review.reviewId,decisions:[{citationIndex:0,action:'accept',targets:[{recordId:r.id}]}]};
 const unverified=processImportRequest(request);
 assert.deepEqual(unverified.cache.records[0].identifiers,[]);assert.ok(!unverified.edits[0].text.includes('doi:'));
 assert.equal(unverified.cache.records[0].identifierProposals,undefined);
 const accepted=processImportRequest({...request,completions:[{recordId:r.id,record:{...r,state:'resolved',identifiers:r.identifierProposals}}]});
 assert.deepEqual(accepted.cache.records[0].identifiers,r.identifierProposals);
 assert.ok(accepted.edits[0].text.includes('doi:10.1371/journal.pone.0224511'));
});
