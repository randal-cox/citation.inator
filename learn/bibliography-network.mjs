export async function readNoticeJSON(response,maxBytes){
 const declared=Number(response.headers?.get('content-length'));
 if(Number.isFinite(declared)&&declared>maxBytes){await response.body?.cancel();throw Error('The notice response is too large.');}
 if(!response.body?.getReader)throw Error('The source did not provide readable notice metadata.');
 const reader=response.body.getReader(),decoder=new TextDecoder();let bytes=0,text='';
 try{while(true){const next=await reader.read();if(next.done)break;bytes+=next.value.byteLength;if(bytes>maxBytes){await reader.cancel();throw Error('The notice response is too large.');}text+=decoder.decode(next.value,{stream:true});}text+=decoder.decode();}
 finally{reader.releaseLock();}
 let value;try{value=JSON.parse(text);}catch{throw Error('Crossref returned unreadable notice metadata. Try again later.');}
 if(!Array.isArray(value?.message?.items))throw Error('Crossref returned an unexpected response. Try again later.');
 return value;
}
