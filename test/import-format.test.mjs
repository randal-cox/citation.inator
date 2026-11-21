import test from 'node:test';import assert from 'node:assert/strict';
import {detectCitationFormat} from '../src/import-format.mjs';
import {importDemoRequest} from '../scripts/import-demo-service.mjs';
test('format inference uses source punctuation and brackets, not an example name',()=>{
 for(const [source,style] of [['(Avery, 2021)','apa'],['(Avery 2021)','chicago-author-date'],['[2, 7]','vancouver'],['Avery (2021, 12). (Duval [1898] 2004, 61)','chicago-author-date'],['(Avery, n.d.)','apa']])assert.equal(detectCitationFormat(source).style,style);
 for(const source of ['Avery (2021).','No citation here.','(Avery, 2021) and [2].','(Avery, 2021) and (Bennett 2020).'])assert.equal(detectCitationFormat(source).style,null);
 assert.equal(detectCitationFormat('{cite local:a | note:"Avery 2021"}').state,'unknown');
});
test('auto mode retains uncertainty and requires explicit format before conversion',()=>{
 const input={source:'Avery (2021).',style:'auto',records:[{id:'avery',type:'book',state:'partial',title:'Test',authors:[{family:'Avery'}],issued:[2021]}]};const result=importDemoRequest(input);
 assert.equal(result.formatChoiceRequired,true);assert.equal(result.formatDetection.state,'ambiguous');
 assert.throws(()=>importDemoRequest({...input,action:'preview',review:result.review,reviewId:result.review.reviewId,decisions:[]}),/Choose a citation format/);
 const override={...input,style:'chicago-author-date'};const manual=importDemoRequest(override);assert.equal(manual.formatChoiceRequired,false);
 assert.doesNotThrow(()=>importDemoRequest({...override,action:'preview',review:manual.review,reviewId:manual.review.reviewId,decisions:[]}));
});

test('unsupported reprint locators cannot turn bracketed years into numeric citations',()=>{
 for(const source of ['(Duval [1898] 2004, ch. 2)','(Duval [1898] 2004, pp. iv–v)','Duval (1995 [1912])']){
  assert.equal(detectCitationFormat(source).style,null);
  const input={source,style:'auto',records:[{id:'unrelated',type:'book',state:'partial',title:'Unrelated',authors:[{family:'Other'}],issued:[2000],referenceNumber:source.includes('1912')?1912:1898}]};
  const result=importDemoRequest(input);assert.equal(result.formatChoiceRequired,true);assert.equal(result.review.matches.length,0);
  assert.throws(()=>importDemoRequest({...input,action:'preview',review:result.review,reviewId:result.review.reviewId,decisions:[]}),/Choose a citation format/);
 }
});

test('mixed unsupported reprints and real numeric citations never restore year islands',()=>{
 const input={source:'(Duval [1898] 2004, ch. 2). Also [2].',style:'auto',records:[{id:'unrelated',type:'book',state:'partial',title:'Unrelated',authors:[{family:'Other'}],issued:[2000],referenceNumber:1898},{id:'two',type:'book',state:'partial',title:'Second',authors:[{family:'Two'}],issued:[2001],referenceNumber:2}]};
 const auto=importDemoRequest(input);assert.equal(auto.formatChoiceRequired,true);assert.equal(auto.formatDetection.state,'mixed');
 const manual=importDemoRequest({...input,style:'vancouver'});assert.deepEqual(manual.review.matches.map(match=>match.citation.raw),['[2]']);
 const result=importDemoRequest({...input,style:'vancouver',action:'preview',review:manual.review,reviewId:manual.review.reviewId,decisions:[{citationIndex:0,action:'accept',recordIds:['two']}]});assert.ok(result.source.startsWith('(Duval [1898] 2004, ch. 2).'));assert.ok(result.source.includes('{cite local:two}'));
});
