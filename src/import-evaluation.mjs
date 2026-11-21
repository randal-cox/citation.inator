import {parseInTextCitations,matchCitations} from './import-matcher.mjs';

export function evaluateImportCases(fixture,{detect=parseInTextCitations,match=matchCitations}={}) {
const cases=[];
let expectedGroups=0,predictedGroups=0,correctGroups=0,expectedItems=0,correctCandidateSets=0,falseUnique=0;
const sameSet=(a,b)=>JSON.stringify([...a].sort())===JSON.stringify([...b].sort());
for(const entry of fixture.cases) {
  const style=entry.style==='numeric'?'vancouver':entry.style;
  const records=entry.records.map(record=>({...record,state:record.state || (record.title && record.authors?.length && record.issued ? 'resolved' : 'partial'),...(record.yearSuffix && {sourceSuffix:record.yearSuffix})}));
  const detected=detect(entry.source,{style,range:entry.bodyBoundary});
  const matched=match(detected,records);
  let cursor=entry.bodyBoundary.start;
  const expected=entry.expectedCitations.map(citation=>{
    const start=entry.source.indexOf(citation.raw,cursor);
    if(start<cursor || start+citation.raw.length>entry.bodyBoundary.end) throw new Error(`Invalid expected boundary: ${entry.id}`);
    cursor=start+citation.raw.length;return {...citation,start,end:cursor};
  });
  const groups=[], used=new Set();
  for(const gold of expected) {
    const actualIndex=matched.matches.findIndex((match,index)=>!used.has(index)&&match.citation.start===gold.start&&match.citation.end===gold.end);
    const actual=matched.matches[actualIndex];if(actual)used.add(actualIndex);
    const items=gold.recordIds.map((id,index)=>{
      const expectedCandidates=gold.candidateRecordIds?.[index] || (id?[id]:[]);
      const proposal=actual?.items[index];
      const actualCandidates=proposal?.candidates.map(candidate=>candidate.recordId) || [];
      const candidatesCorrect=Boolean(proposal)&&sameSet(expectedCandidates,actualCandidates);
      const unsafeUnique=proposal?.state==='unique' && (expectedCandidates.length!==1 || !candidatesCorrect);
      expectedItems++;if(candidatesCorrect)correctCandidateSets++;if(unsafeUnique)falseUnique++;
      return {expectedCandidates,actualCandidates,state:proposal?.state||'not-detected',candidatesCorrect,unsafeUnique};
    });
    const spanCorrect=Boolean(actual);if(spanCorrect)correctGroups++;
    const itemCountCorrect=Boolean(actual)&&actual.items.length===gold.recordIds.length;
    if(actual) for(const extra of actual.items.slice(gold.recordIds.length)) if(extra.state==='unique')falseUnique++;
    groups.push({raw:gold.raw,spanCorrect,itemCountCorrect,items});
  }
  expectedGroups+=expected.length;predictedGroups+=matched.matches.length;
  const unexpectedMatches=matched.matches.filter((actual,index)=>!used.has(index));
  for(const extra of unexpectedMatches) for(const item of extra.items) if(item.state==='unique')falseUnique++;
  const unexpected=unexpectedMatches.map(match=>match.citation.raw);
  cases.push({id:entry.id,tier:entry.evaluationTier,pass:unexpected.length===0&&groups.every(g=>g.spanCorrect&&g.itemCountCorrect&&g.items.every(i=>i.candidatesCorrect&&!i.unsafeUnique)),groups,unexpected,diagnostics:detected.diagnostics});
}
return {schema:'citation-inator.import-evaluation.v1',
  protocol:'First evaluation of independently authored synthetic challenge cases. After this run these cases are regression material, not unseen held-out evidence. No private documents or providers used.',
  adapters:['Fixture entries omit record.state: complete supplied title/author/date fields map to resolved; incomplete entries to partial. This means metadata completeness, not independently verified identity.','Fixture numeric style maps to vancouver.','Explicit fixture yearSuffix maps to sourceSuffix; no inferred year letters.'],
  limits:'Small synthetic set; not a general accuracy estimate. Candidate-set agreement permits conservative ambiguity and does not establish claim support or field parsing accuracy.',
  summary:{cases:cases.length,baselinePassed:cases.filter(c=>c.tier==='baseline'&&c.pass).length,baselineTotal:cases.filter(c=>c.tier==='baseline').length,challengePassed:cases.filter(c=>c.tier==='challenge'&&c.pass).length,challengeTotal:cases.filter(c=>c.tier==='challenge').length,expectedGroups,predictedGroups,correctGroups,detectionPrecision:predictedGroups?correctGroups/predictedGroups:null,detectionRecall:expectedGroups?correctGroups/expectedGroups:null,expectedItems,correctCandidateSets,falseUnique},cases};
}
