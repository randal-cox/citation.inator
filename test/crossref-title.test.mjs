import test from 'node:test';import assert from 'node:assert/strict';import {crossrefRecord} from '../src/crossref.mjs';
const record=message=>crossrefRecord({message:{DOI:'10.5555/title',type:'journal-article',author:[{given:'R.',family:'Rivera'}],issued:{'date-parts':[[2020]]},...message}},{scheme:'doi',value:'10.5555/title'},'2026-11-21','https://api.crossref.org/works/10.5555/title');
test('Crossref title and separate subtitle form one full title without duplication',()=>{
 assert.equal(record({title:['How Many Interviews Are Enough?'],subtitle:['An Experiment with Data Saturation and Variability']}).title,'How Many Interviews Are Enough?: An Experiment with Data Saturation and Variability');
 assert.equal(record({title:['A title: A subtitle'],subtitle:['A subtitle']}).title,'A title: A subtitle');
});
test('provider title formatting/entities become readable text while mathematical markup stays distinct',()=>{
 assert.equal(record({title:['<i>A book</i> &amp; another']}).title,'A book & another');assert.equal(record({title:['E = mc<sup>2</sup>']}).title,'E = mc<sup>2</sup>');
});
