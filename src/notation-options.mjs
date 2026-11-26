/** Source spans for optional-pipe, whitespace-separated key:value fields.
 * Quotes and escaped punctuation are opaque. Unquoted legacy phrases remain
 * intact until a pipe or another field begins; recommend quotes for new prose.
 */
export function optionSpans(source){
  const spans=[];let start=0,quoted=false;
  for(let i=0;i<source.length;i++){
    if(source[i]==='\\'){i++;continue;}
    if(source[i]==='"'){quoted=!quoted;continue;}
    if(quoted)continue;
    if(source[i]==='|'){
      spans.push({start,end:i});start=i+1;
    }else if(/[ \t\r\n]/.test(source[i])){
      const following=/^[ \t\r\n]+(?=[a-z0-9][a-z0-9-]*:|isolated(?:[ \t\r\n|]|$))/.exec(source.slice(i));
      if(following && source.slice(start,i).trim() && !source.slice(start,i).trimEnd().endsWith(';')){
        spans.push({start,end:i});start=i+following[0].length;i=start-1;
      }
    }
  }
  spans.push({start,end:source.length});return spans;
}
export const optionParts=source=>optionSpans(source).map(({start,end})=>source.slice(start,end).trim());

/** Remove author comments before semantic parsing or reader-facing fallback.
 * Quoted values in other fields are opaque. Comment text is never retained in
 * compiled records; source editors preserve the original marker bytes.
 */
export function stripSourceComments(source,{fields=['comment']}={}){
 const edits=[];let quoted=false,seen=new Set(),valid=true;
 for(let i=0;i<source.length;i++){
  if(source[i]==='\\'){i++;continue;}
  if(source[i]==='"'){quoted=!quoted;continue;}
  if(quoted)continue;
  if(source[i]===';'){seen.clear();continue;}
  const field=fields.find(name=>source.startsWith(name+':',i));if(!field||i>0&&!/[\s|;{]/u.test(source[i-1]))continue;
  if(seen.has(field))valid=false;seen.add(field);
  let value=i+field.length+1;while(/\s/u.test(source[value]||'')&&value<source.length)value++;
  let end=value;
  if(source[value]==='"'){
   end=value+1;for(;end<source.length;end++){if(source[end]==='\\'){end++;continue;}if(source[end]==='"'){end++;break;}}
   if(end>source.length||source[end-1]!=='"'){valid=false;end=source.length;}
  }else{valid=false;end=source.length;}
  let start=i,prior=i;while(prior>0&&/\s/u.test(source[prior-1]))prior--;
  if(source[prior-1]==='|')start=prior-1;
  else{let next=end;while(next<source.length&&/\s/u.test(source[next]))next++;if(source[next]==='|')end=next+1;}
  edits.push({start,end});i=end-1;
 }
 let text='',cursor=0;for(const edit of edits){text+=source.slice(cursor,Math.max(cursor,edit.start));cursor=Math.max(cursor,edit.end);}text+=source.slice(cursor);
 return {text,valid,hasComments:edits.length>0,ranges:edits.map(({start,end})=>({start,end}))};
}
