import test from 'node:test';import assert from 'node:assert/strict';
import {mkdtemp,writeFile,rm,mkdir,symlink} from 'node:fs/promises';import {join} from 'node:path';import {tmpdir} from 'node:os';
import {localImportExamples} from '../scripts/local-import-examples.mjs';
test('local corpus catalogue is optional and reads only explicitly registered bounded text',async()=>{
 const root=await mkdtemp(join(tmpdir(),'citation-local-examples-'));try{
  assert.deepEqual(await localImportExamples(root),[]);
  await writeFile(join(root,'paper.txt'),'A complete source.');await writeFile(join(root,'examples.json'),JSON.stringify([{id:'paper',label:'A paper',file:'paper.txt'}]));
  const examples=await localImportExamples(root);assert.equal(await examples[0].read(),'A complete source.');assert.ok(!JSON.stringify(examples).includes(root));
  await writeFile(join(root,'paper.txt'),'a'.repeat(1500001));await assert.rejects(()=>examples[0].read(),/1,500,000/);
 }finally{await rm(root,{recursive:true,force:true});}
});
test('local example manifests reject path and symlink escapes',async()=>{
 const root=await mkdtemp(join(tmpdir(),'citation-local-boundary-'));try{
  const corpus=join(root,'corpus');await mkdir(corpus);await writeFile(join(root,'outside.txt'),'private');
  for(const file of ['../outside.txt','escape.txt']){
   if(file==='escape.txt')await symlink(join(root,'outside.txt'),join(corpus,file));
   await writeFile(join(corpus,'examples.json'),JSON.stringify([{id:'paper',label:'A paper',file}]));await assert.rejects(()=>localImportExamples(corpus),/inside/);
  }
 }finally{await rm(root,{recursive:true,force:true});}
});
