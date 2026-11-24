import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {compileMarkdown} from '../src/markup.mjs';
import {lessons} from '../learn/lessons.mjs';
import {learningRecords} from '../learn/example-records.mjs';
const records=learningRecords(JSON.parse(await readFile(new URL('../fixtures/notation-records.json',import.meta.url),'utf8')));
test('learning examples resolve their cited records in all five formatting presets',()=>{
  for(const citationStyle of ['chicago-author-date','apa','mla','harvard','vancouver'])for(const lesson of lessons){
    const result=compileMarkdown(lesson.source,{schema:'citation-inator.cache.v1',records:records.map(record=>({...record,...lesson.recordOverrides?.[record.id]}))},{...lesson.options,citationStyle});
    assert(result.cache.records.length,lesson.id);
    assert.equal(result.cache.records.some(record=>record.state==='unresolved'),Boolean(lesson.unresolved),lesson.id);
    if(!lesson.unresolved)assert.equal(result.diagnostics.length,0,lesson.id);
  }
});
test('Chicago first-citation example does not add punctuation after a final author initial',()=>{
  const result=compileMarkdown(lessons[0].source,{schema:'citation-inator.cache.v1',records},{citationStyle:'chicago-author-date'});
  assert(result.html.includes('Ioannidis, John P. A. 2005.'));
  assert(!result.html.includes('John P. A..'));
});
