import {zipSync,strToU8} from 'fflate';
export const wordNS='http://schemas.openxmlformats.org/wordprocessingml/2006/main';
export const odtNS='urn:oasis:names:tc:opendocument:xmlns:text:1.0';
export function officeZip(format,xml,extra={}){return zipSync({[format==='docx'?'word/document.xml':'content.xml']:typeof xml==='string'?strToU8(xml):xml,...extra});}
export function docx(paragraphs,{prefix='w',namespace=wordNS}={}){return `<${prefix}:document xmlns:${prefix}="${namespace}" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships"><${prefix}:body>${paragraphs}</${prefix}:body></${prefix}:document>`;}
export function odt(paragraphs,{prefix='text'}={}){return `<office:document-content xmlns:office="urn:oasis:names:tc:opendocument:xmlns:office:1.0" xmlns:${prefix}="${odtNS}" xmlns:xlink="http://www.w3.org/1999/xlink"><office:body><office:text>${paragraphs}</office:text></office:body></office:document-content>`;}
const pdfString=text=>'('+text.replace(/[\\()]/gu,value=>'\\'+value)+')';
export function textStream(lines,{x=72,y=720,rotation=0}={}){
 const transform=rotation===90?`0 1 -1 0 ${x} ${y}`:rotation===45?`0.707 0.707 -0.707 0.707 ${x} ${y}`:`1 0 0 1 ${x} ${y}`;
 return `BT /F1 12 Tf ${transform} Tm `+lines.map((line,index)=>(index?'0 -24 Td ':'')+pdfString(line)+' Tj').join(' ')+' ET';
}
export function pdf(pages){
 const objects=['<< /Type /Catalog /Pages 2 0 R >>',`<< /Type /Pages /Kids [${pages.map((_,index)=>`${4+index*2} 0 R`).join(' ')}] /Count ${pages.length} >>`,'<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>'];
 for(const [index,page] of pages.entries()){
  const stream=typeof page==='string'?page:textStream(page);
  objects.push(`<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Resources << /Font << /F1 3 0 R >> >> /Contents ${5+index*2} 0 R >>`,`<< /Length ${Buffer.byteLength(stream,'ascii')} >>\nstream\n${stream}\nendstream`);
 }
 let source='%PDF-1.4\n',offsets=[0];for(const [index,object] of objects.entries()){offsets.push(Buffer.byteLength(source,'ascii'));source+=`${index+1} 0 obj\n${object}\nendobj\n`;}
 const xref=Buffer.byteLength(source,'ascii');source+=`xref\n0 ${objects.length+1}\n0000000000 65535 f \n`+offsets.slice(1).map(offset=>String(offset).padStart(10,'0')+' 00000 n \n').join('')+`trailer\n<< /Size ${objects.length+1} /Root 1 0 R >>\nstartxref\n${xref}\n%%EOF\n`;
 return new Uint8Array(Buffer.from(source,'ascii'));
}
