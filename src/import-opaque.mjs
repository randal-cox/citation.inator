// UTF-16, end-exclusive ranges over the exact supplied Markdown/text projection.
// Validate all input before detection. Overlapping/nested protections form a union.
export function normalizeOpaqueRanges(source,opaque=[]){
 if(typeof source!=='string'||!Array.isArray(opaque)||opaque.length>10000)throw new TypeError('Supply at most 10000 opaque source ranges.');
 const splitsPair=index=>index>0&&index<source.length&&/[\uD800-\uDBFF]/.test(source[index-1])&&/[\uDC00-\uDFFF]/.test(source[index]);
 const ordered=opaque.map(range=>{
  if(!range||!Number.isSafeInteger(range.start)||!Number.isSafeInteger(range.end)||range.start<0||range.end<=range.start||range.end>source.length||splitsPair(range.start)||splitsPair(range.end))throw new TypeError('Opaque ranges need valid UTF-16 start/end boundaries within the supplied source.');
  return {start:range.start,end:range.end};
 }).sort((a,b)=>a.start-b.start||a.end-b.end);
 const result=[];for(const range of ordered){const last=result.at(-1);if(last&&range.start<=last.end)last.end=Math.max(last.end,range.end);else result.push(range);}
 return result;
}
export function intersectsOpaque(start,end,opaque){return opaque.some(range=>start<range.end&&end>range.start);}
export function maskOpaqueRanges(source,opaque){
 let cursor=0,text='';for(const range of opaque){text+=source.slice(cursor,range.start)+source.slice(range.start,range.end).replace(/[^\r\n]/g,' ');cursor=range.end;}return text+source.slice(cursor);
}
