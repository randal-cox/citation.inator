import test from 'node:test';import assert from 'node:assert/strict';
import {spawnSync} from 'node:child_process';import {mkdtemp,writeFile,readFile,rm,readdir} from 'node:fs/promises';import {tmpdir} from 'node:os';import {join} from 'node:path';
const source='A claim (Rivera, 2020, p. 4).\n\nReferences\nRivera, R. (2020). A paper.';
const run=(args,input)=>spawnSync(process.execPath,['scripts/compile.mjs','import',...args],{encoding:'utf8',input:typeof input==='string'?input:JSON.stringify(input)});
test('JSON import CLI analyzes and previews revision-bound changes without provider or file operations',()=>{
 const request={mode:'document',source,style:'auto'},analysis=run(['--json'],request);assert.equal(analysis.status,0);assert.equal(analysis.stderr,'');const model=JSON.parse(analysis.stdout);assert.equal(model.review.matches.length,1);
 const decision={citationIndex:0,action:'accept',targets:[{recordId:model.referenceRecords[0].id}]},previewRequest={...request,action:'preview',review:model.review,reviewId:model.review.reviewId,decisions:[decision]};
 const preview=run(['--json'],previewRequest);assert.equal(preview.status,0);assert.equal(preview.stderr,'');const output=JSON.parse(preview.stdout);assert.ok(output.source.includes('locator:"p. 4"'));assert.ok(output.source.endsWith(source.slice(source.indexOf('References'))));
 const stale=run(['--json'],{...previewRequest,source:source+' '});assert.equal(stale.status,1);assert.equal(stale.stderr,'');assert.match(JSON.parse(stale.stdout).error.message,/changed/);
});
test('import CLI errors remain one JSON object with failure status',()=>{
 for(const [args,input] of [[['--json'],'{broken'],[[],undefined],[['--json','--file','any.txt'],'{}'],[['--bogus'],'{}'],[['--json','--limits','{"references":0}'],'{}']]){const result=run(args,input);assert.equal(result.status,1);assert.equal(result.stderr,'');const value=JSON.parse(result.stdout);assert.equal(value.error.code,'import-cli-error');assert.equal(typeof value.error.message,'string');}
 const limited=run(['--json','--limits','{"sourceCharacters":20}'],{mode:'document',source,style:'auto'});assert.equal(limited.status,1);assert.match(JSON.parse(limited.stdout).error.message,/20 characters/);
});
test('file import CLI returns a text working copy and preserves the source file without creating outputs',async()=>{
 const root=await mkdtemp(join(tmpdir(),'citation-import-cli-'));try{
  const file=join(root,'paper.txt'),bytes=Buffer.from(source.replaceAll('\n','\r\n'));await writeFile(file,bytes);
  const result=run(['--file',file]);assert.equal(result.status,0,result.stderr+result.stdout);assert.equal(result.stderr,'');const output=JSON.parse(result.stdout);assert.equal(output.text,bytes.toString());assert.equal(output.original.filename,'paper.txt');assert.equal(output.original.size,bytes.length);assert.equal(output.workingCopy,true);
  assert.deepEqual(await readFile(file),bytes);assert.deepEqual(await readdir(root),['paper.txt']);
  const tooLarge=run(['--file',file,'--limits','{"fileBytes":10}']);assert.equal(tooLarge.status,1);assert.match(JSON.parse(tooLarge.stdout).error.message,/size limit/);assert.deepEqual(await readFile(file),bytes);
 }finally{await rm(root,{recursive:true,force:true});}
});
