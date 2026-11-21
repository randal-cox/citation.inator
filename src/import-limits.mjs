// Development guardrails, not measured capacity or format-support claims.
// Source/record budgets cover the supplied 186k-character Markdown manuscript,
// including embedded images and the retained copies of each raw reference.
export const IMPORT_LIMITS=Object.freeze({sourceCharacters:1500000,fileBytes:6000000,recordCharacters:300000,requestBytes:12000000,references:300,citationGroups:300,citedItems:900,candidateChoices:3000,parallelLookups:4,titleCharacters:1500,authorsPerRecord:150});

export function normalizeImportLimits(overrides={}){
 if(!overrides||typeof overrides!=='object'||Array.isArray(overrides))throw new TypeError('Supply an import limits object.');
 for(const [key,value] of Object.entries(overrides))if(!Object.hasOwn(IMPORT_LIMITS,key)||!Number.isSafeInteger(value)||value<1)throw new TypeError('Use positive integer values for known import limits.');
 return Object.freeze({...IMPORT_LIMITS,...overrides});
}
