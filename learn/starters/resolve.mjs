import {readFile,writeFile} from 'node:fs/promises';
import {compileMarkdown} from 'cite-inator/markup';
import {readCache} from 'cite-inator/records';
import {createCrossrefResolver} from 'cite-inator/crossref';
import {createOpenLibraryResolver} from 'cite-inator/openlibrary';

const source=await readFile('article.md','utf8');
const cache=JSON.parse(await readFile('citations.json','utf8'));
const options=JSON.parse(await readFile('configuration.json','utf8'));
const missing=compileMarkdown(source,cache,options).diagnostics
  .filter(item=>item.code==='citation-unresolved').map(item=>item.identifier);
const providers={doi:createCrossrefResolver(),isbn:createOpenLibraryResolver()};
for(const identifier of new Set(missing)){
  const provider=providers[identifier.split(':',1)[0]];
  if(!provider)throw new Error(`Add metadata for ${identifier} through import review or a curated record.`);
  const prior=readCache(cache).byIdentifier.get(identifier);
  const result=await provider.resolve(identifier,{seed:prior});
  if(result.record?.state!=='resolved')throw new Error(`Could not resolve ${identifier}. Review the identifier and try again.`);
  cache.records=cache.records.filter(record=>record.id!==result.record.id && record.id!==prior?.id);
  cache.records.push(result.record);
}
const checked=compileMarkdown(source,cache,options);
if(checked.diagnostics.some(item=>item.code==='citation-unresolved'))throw new Error('Review unresolved citations before saving metadata.');
await writeFile('citations.json',JSON.stringify(cache,null,2)+'\n');
console.log('Saved bibliographic metadata. Run npm start to build and view the article.');
