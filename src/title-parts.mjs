// Title formatting is data, never trusted HTML. A single inline emphasis per run.
export function normalizeTitleParts(parts,title){
 if(!Array.isArray(parts)||!parts.length)return [];
 if(!parts.every(p=>p&&typeof p.text==='string'&&(!p.emphasis||['italic','bold'].includes(p.emphasis))))return [];
 if(parts.map(p=>p.text).join('')!==title)return [];
 return parts.map(({text,emphasis})=>({text,...(emphasis&&{emphasis})}));
}
const escape=value=>value.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
export function cslTitle(title,parts){
 const safe=normalizeTitleParts(parts,title);
 return safe.length?safe.map(p=>p.emphasis?`<${p.emphasis==='italic'?'i':'b'}>${escape(p.text)}</${p.emphasis==='italic'?'i':'b'}>`:escape(p.text)).join(''):escape(title);
}
/** Exact title run only. Surrounding style italics invert source italics, as in CSL. */
export function titleRuns(record,field,emphasis){
 const title=record[field]||'',parts=normalizeTitleParts(record[field+'Parts'],title);
 const runs=parts.length?parts.map(p=>({text:p.text,...(p.emphasis==='bold'&&emphasis==='italic'?{emphasis:'italic',strong:true}:p.emphasis==='italic'&&emphasis==='italic'?{}:(p.emphasis||emphasis)?{emphasis:p.emphasis||emphasis}:{})})): [{text:title,...(emphasis&&{emphasis})}];
 return runs.map(p=>({...p,titleField:field}));
}
