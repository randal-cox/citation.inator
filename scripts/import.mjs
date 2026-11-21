import {parseArgs} from 'node:util';
import {readFile,stat} from 'node:fs/promises';
import {basename} from 'node:path';
import {processImportRequest,normalizeImportLimits} from '../src/import-api.mjs';

/** Machine-readable local import. The caller owns files, records and accepted changes. */
export async function runImportCli(argv){
 try{
  const {values}=parseArgs({args:argv,allowPositionals:false,options:{json:{type:'boolean'},file:{type:'string'},limits:{type:'string'}}});
  if(Boolean(values.json)===Boolean(values.file))throw TypeError('Use import --json or import --file PATH.');
  const overrides=values.limits===undefined?{}:JSON.parse(values.limits),limits=normalizeImportLimits(overrides);
  let result;
  if(values.file){
   if((await stat(values.file)).size>limits.fileBytes)throw RangeError('The file exceeds the configured import size limit.');
   const {extractImportFile}=await import('../src/import-files.mjs');
   result=await extractImportFile(await readFile(values.file),{filename:basename(values.file),limits});
  }else{
   const chunks=[];let bytes=0;
   for await(const chunk of process.stdin){bytes+=chunk.length;if(bytes>limits.requestBytes)throw RangeError('The JSON request exceeds the configured import size limit.');chunks.push(chunk);}
   const request=JSON.parse(new TextDecoder('utf-8',{fatal:true}).decode(Buffer.concat(chunks)));
   if(values.limits!==undefined){if(!request||typeof request!=='object'||Array.isArray(request))throw TypeError('Supply one import request object.');request.limits={...request.limits,...overrides};}
   result=processImportRequest(request);
  }
  process.stdout.write(JSON.stringify(result)+'\n');return 0;
 }catch(error){
  process.stdout.write(JSON.stringify({error:{code:'import-cli-error',message:error.message}})+'\n');return 1;
 }
}
