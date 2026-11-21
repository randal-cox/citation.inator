import test from 'node:test';import assert from 'node:assert/strict';
import {createDocumentImporter,analyzeImportDocument} from '../src/import-document.mjs';import {IMPORT_LIMITS,normalizeImportLimits} from '../src/import-limits.mjs';import {importDemoRequest} from '../scripts/import-demo-service.mjs';
test('JavaScript initialization accepts a JSON limits object, with strict validation',()=>{
 const options=JSON.parse('{"limits":{"sourceCharacters":100,"references":2}}');const importer=createDocumentImporter(options);assert.equal(importer.limits.sourceCharacters,100);assert.throws(()=>importer.analyze('a'.repeat(101)),/100 characters/);
 for(const limits of [{sourceCharacters:0},{references:1.5},{unknown:4},{toString:2}])assert.throws(()=>normalizeImportLimits(limits),/positive integer/);
 assert.equal(IMPORT_LIMITS.references,300);
});
test('wrapped and Zotero-linked bibliography entries split without blank lines, preserving source',()=>{
 const source='A claim [(Rivera, 2020)](https://www.zotero.org/google-docs/?a).\n\n# **References**\n\n[Anonymous. (2025). *A software tool*.](https://www.zotero.org/google-docs/?a)  \n[Rivera, R. (2020). *A paper title*. Journal, 12(2), 4–8. https\\://doi.org/10.5555/a](https://www.zotero.org/google-docs/?b)\n\n# **Notes**\n\nA retained note.';
 const result=importDemoRequest({mode:'document',source,style:'auto'});assert.equal(result.referenceRecords.length,2);assert.equal(result.referenceRecords[1].title,'A paper title');assert.equal(result.review.matches[0].items[0].state,'unique');
 const preview=importDemoRequest({mode:'document',source,style:'auto',action:'preview',review:result.review,reviewId:result.review.reviewId,decisions:[{citationIndex:0,action:'accept',targets:[{recordId:result.referenceRecords[1].id}]}]});assert.equal(preview.source,source);assert.ok(preview.outcomes.some(item=>item.state==='accepted-needs-adapter'));
});
test('one bibliography supports three times the measured BEST reference and citation counts',()=>{
 const family=index=>'Arden'+String.fromCharCode(97+Math.floor(index/26))+String.fromCharCode(97+index%26);
 const references=Array.from({length:51},(_,index)=>`${family(index)}, A. (2020). Study ${index}. Journal, 1(1), ${index+1}–${index+2}.`);
 const body=Array.from({length:57},(_,index)=>`A claim (${family(index%51)}, 2020).`).join('\n\n'),source=body+'\n\n## References\n\n'+references.join('\n')+'\n\n[image1]: <data:image/png;base64,'+'A'.repeat(600000)+'>';
 const base={mode:'document',source,style:'auto'},analysis=importDemoRequest(base);assert.equal(analysis.referenceRecords.length,51);assert.equal(analysis.review.matches.length,57);
 const output=importDemoRequest({...base,action:'preview',review:analysis.review,reviewId:analysis.review.reviewId,decisions:analysis.review.matches.map((match,citationIndex)=>({citationIndex,action:'accept',targets:[{recordId:match.items[0].candidates[0].recordId}]}))});assert.equal(output.edits.length,57);assert.ok(output.source.endsWith(source.slice(source.indexOf('## References'))));
});
test('large inert Markdown image payloads fit without truncating the converted source',()=>{
 const source='A claim (Rivera, 2020).\n\n## References\n\nRivera, R. (2020). A paper.\n\n[image1]: <data:image/png;base64,'+'A'.repeat(600000)+'>';
 const model=analyzeImportDocument(source);assert.equal(model.records.length,1);const base={mode:'document',source,style:'auto'},analysis=importDemoRequest(base),output=importDemoRequest({...base,action:'preview',review:analysis.review,reviewId:analysis.review.reviewId,decisions:[{citationIndex:0,action:'accept',targets:[{recordId:analysis.referenceRecords[0].id}]}]});assert.ok(output.source.endsWith('A'.repeat(600000)+'>'));
});

test('configured citation caps reach format detection beyond the old 100-group boundary',()=>{
 const source=Array.from({length:301},()=> 'A claim (Rivera, 2020).').join('\n\n')+'\n\n## References\n\nRivera, R. (2020). A paper.';
 assert.equal(createDocumentImporter({limits:{citationGroups:400,citedItems:1200}}).analyze(source).detection.citations.length,301);
 assert.throws(()=>createDocumentImporter().analyze(source),/budget|many|300|limit/i);
});
test('a DOI present only in a bibliography hyperlink is retained without changing source',()=>{
 const source='A claim (Rivera, 2020).\n\n## References\n\nRivera, R. (2020). [A paper title](https://doi.org/10.5555/linked). Journal, 12(2), 4–8.';
 const result=analyzeImportDocument(source);assert.ok(result.records[0].identifiers.some(id=>id.value==='10.5555/linked'));assert.ok(result.entries[0].evidence.some(item=>item.rule==='bibliography-link-identifier'));assert.equal(result.entries[0].raw,source.split('\n\n').at(-1));
});
