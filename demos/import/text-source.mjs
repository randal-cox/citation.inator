// Textarea views normalize newlines. Keep unchanged canonical source bytes outside edits.
export function textView(source) {return source.replace(/\r\n?|\n/gu,'\n');}
export function editTextSource(previous,nextView) {
 const before=textView(previous);let prefix=0,suffix=0;
 while(prefix<before.length&&prefix<nextView.length&&before[prefix]===nextView[prefix])prefix++;
 while(suffix<before.length-prefix&&suffix<nextView.length-prefix&&before[before.length-1-suffix]===nextView[nextView.length-1-suffix])suffix++;
 const positions=[0];for(let index=0;index<previous.length;index++){if(previous[index]==='\r'&&previous[index+1]==='\n')index++;positions.push(index+1);}
 const newline=/\r\n|\r|\n/u.exec(previous)?.[0] || '\n';
 return previous.slice(0,positions[prefix])+nextView.slice(prefix,nextView.length-suffix).replace(/\n/gu,newline)+previous.slice(positions[before.length-suffix]);
}
