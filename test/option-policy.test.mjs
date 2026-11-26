import test from 'node:test';
import assert from 'node:assert/strict';
import {citationOptionPolicy,CITATION_OPTION_POLICIES} from '../src/compiler.mjs';
import {citationOptionPolicy as toolsPolicy} from '../src/tools.mjs';
import {citationOptionPolicy as managerPolicy} from '../src/zotero.mjs';
import {authorFields} from '../src/author-fields.mjs';
test('replacement keeps presentation, recomputes notes and replaces the old unresolved fallback',()=>{
 assert.equal(citationOptionPolicy('form').action,'retain');assert.equal(citationOptionPolicy('isolated').action,'retain');
 assert.equal(citationOptionPolicy('note').action,'recompute');assert.equal(citationOptionPolicy('unresolved').action,'replace-fallback');
});
test('source-dependent assertions and unknown options require intentional replacement review',()=>{
 for(const key of ['locator','label','prefix','tags',...authorFields])assert.equal(citationOptionPolicy(key).action,'review',key);
 for(const key of ['quote','future-field','constructor','__proto__'])assert.deepEqual(citationOptionPolicy(key),{known:false,action:'review',category:'unknown'});
 assert.deepEqual(citationOptionPolicy(null),{known:true,action:'review',category:'source'});
});
test('all entry points share immutable policy metadata without rewriting marker values',()=>{
 assert.equal(toolsPolicy,citationOptionPolicy);assert.equal(managerPolicy,citationOptionPolicy);
 assert(Object.isFrozen(CITATION_OPTION_POLICIES));assert(Object.isFrozen(CITATION_OPTION_POLICIES.note));assert(Object.isFrozen(citationOptionPolicy('form')));
 assert.throws(()=>{CITATION_OPTION_POLICIES.note.action='retain';},TypeError);
});
