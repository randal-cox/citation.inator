import test from 'node:test';import assert from 'node:assert/strict';import {processImportRequest} from '../src/import-api.mjs';
const bell92='Bell, C. (1992). Ritual theory, ritual practice. Oxford University Press.',bell97='Bell, C. (1997). Ritual: Perspectives and dimensions. Oxford University Press.';
const run=(body,refs,style='apa')=>processImportRequest({mode:'document',source:body+'\n\nReferences\n'+refs.join('\n'),style});
const items=a=>a.review.matches[0]?.items;
test('one author with multiple years expands parenthetical, narrative and year-letter groups',()=>{
 for(const body of ['Again (Bell, 1992, 1997).','Bell (1992, 1997) returns to this.']){const a=run(body,[bell92,bell97]);assert.equal(a.review.matches.length,1);assert.deepEqual(items(a).map(i=>i.item.year),[1992,1997]);assert.ok(items(a).every(i=>i.state==='unique'));}
 const a=run('Both (Cox, 1995a, 1995b).',['Cox, A. (1995a). Masks and makers. Hollow Press.','Cox, A. (1995b). Rites of the river. Hollow Press.']);assert.deepEqual(items(a).map(i=>i.item.sourceSuffix),['a','b']);assert.ok(items(a).every(i=>i.state==='unique'));
});
test('organisations match literal authors; inferred abbreviation is reviewable, never unique',()=>{
 const refs=['World Health Organization. (2020). Mental health atlas 2020. World Health Organization.'];
 const a=run('Uneven (World Health Organization, 2020).',refs);assert.equal(a.referenceRecords[0].authors[0].literal,'World Health Organization');assert.equal(items(a)[0].state,'unique');
 const b=run('Uneven (WHO, 2020).',refs);assert.equal(items(b)[0].state,'ambiguous');assert.equal(items(b)[0].candidates[0].evidence.authors,'possible-organization-abbreviation');
 const c=run('Uneven (World Health Organization 2020).',['World Health Organization. 2020. Mental health atlas. WHO.'],'chicago-author-date');assert.equal(items(c)[0].state,'unique');
});
test('secondary citation targets the read source, preserves original relationship and requires review',()=>{
 const source='Liminality (Turner, 1969, as cited in Bell, 1992).\n\nReferences\n'+bell92,a=processImportRequest({mode:'document',source,style:'apa'}),item=items(a)[0];assert.equal(item.item.year,1992);assert.equal(item.item.secondarySource.year,1969);assert.equal(item.state,'ambiguous');assert.ok(a.diagnostics.some(d=>d.code==='import-secondary-source-review-required'));
 const p=processImportRequest({mode:'document',source,style:'apa',action:'preview',review:a.review,reviewId:a.review.reviewId,decisions:[{citationIndex:0,action:'accept',targets:[{recordId:item.candidates[0].recordId}]}]});assert.match(p.source,/prefix:"Turner, 1969, as cited in"/);assert.match(p.html,/Turner, 1969, as cited in/);
});
test('unrecognised year-like citation spans have stable diagnostics and original source offsets; code is excluded',()=>{
 const source='😀 A *claim* (Bell, 1992, forthcoming).\n\n`(Bell, 1992, forthcoming)`\n\nReferences\n'+bell92,a=processImportRequest({mode:'document',source,style:'apa'}),d=a.diagnostics.filter(d=>d.code==='import-unparsed-author-date');assert.equal(d.length,1);assert.equal(source.slice(d[0].start,d[0].end),'(Bell, 1992, forthcoming)');assert.equal(a.review.matches.length,0);
 const b=run('Bell (1992, forthcoming) returns.',[bell92]);assert.ok(b.diagnostics.some(d=>d.code==='import-unparsed-author-date'));
});

test('organisation connectors/plurals work without mistaking personal Bank bylines for organisations',()=>{
 for(const name of ['Department of Health','Centers for Disease Control and Prevention']){const a=run('A claim ('+name+', 2020).',[name+'. (2020). Annual report. Government Press.']);assert.equal(items(a)[0].state,'unique');}
 const a=run('A claim (Bank 2020).',['Bank, Alex. 2020. Annual report. Example Press.'],'chicago-author-date');assert.equal(a.referenceRecords[0].authors[0].family,'Bank');assert.equal(items(a)[0].state,'unique');
});

test('organisation recognition preserves multi-person surnames with particles',()=>{const a=run('A claim (Bank and Van Dyke, 2020).',['Bank, A., & Van Dyke, B. (2020). A paper. Example Press.']);assert.equal(items(a)[0].state,'unique');assert.deepEqual(items(a)[0].item.authors,['Bank','Van Dyke']);});
