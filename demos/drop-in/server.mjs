import {createServer} from 'node:http';
import {readFile} from 'node:fs/promises';
const types={html:'text/html',mjs:'text/javascript',css:'text/css',json:'application/json',md:'text/plain'};
const server=createServer(async(req,res)=>{
  const path=new URL(req.url,'http://localhost').pathname;
  if(!/^\/[a-zA-Z0-9_.-]*$/.test(path)){res.writeHead(404).end();return;}
  const file=path==='/'?'index.html':path.slice(1);
  try{const data=await readFile(new URL('./'+file,import.meta.url));res.setHeader('Content-Type',types[file.split('.').pop()]||'text/plain');res.end(data);}catch{res.writeHead(404).end();}
});
server.listen(Number(process.env.PORT||4188),'127.0.0.1',()=>console.log('Open http://127.0.0.1:'+server.address().port+'/'));
