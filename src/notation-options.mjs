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
    }else if(/[ \t]/.test(source[i])){
      const following=/^[ \t]+(?=[a-z0-9][a-z0-9-]*:|isolated(?:[ \t|]|$))/.exec(source.slice(i));
      if(following && source.slice(start,i).trim() && !source.slice(start,i).trimEnd().endsWith(';')){
        spans.push({start,end:i});start=i+following[0].length;i=start-1;
      }
    }
  }
  spans.push({start,end:source.length});return spans;
}
export const optionParts=source=>optionSpans(source).map(({start,end})=>source.slice(start,end).trim());
