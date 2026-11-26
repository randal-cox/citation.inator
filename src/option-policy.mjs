import {authorFields} from './author-fields.mjs';

// Policy for an actual work replacement, never for same-work marker round trips.
const policy=(action,category)=>Object.freeze({action,category});
export const CITATION_OPTION_POLICIES=Object.freeze(Object.fromEntries([
 ['form',policy('retain','presentation')],['isolated',policy('retain','presentation')],
 ['cue',policy('recompute','editor')],['comment',policy('review','source')],['unresolved',policy('replace-fallback','source')],
 ...[...new Set(['locator','label','prefix','tags',...authorFields])].map(name=>[name,policy('review','source')])
]));

/** Pass an option name without ':'; null denotes a bare legacy display fallback. */
export function citationOptionPolicy(name){
 if(name===null)return Object.freeze({known:true,action:'review',category:'source'});
 if(typeof name!=='string'||!name.trim())throw new TypeError('Supply an option name, or null for a bare display fallback.');
 if(Object.hasOwn(CITATION_OPTION_POLICIES,name))return Object.freeze({known:true,...CITATION_OPTION_POLICIES[name]});
 // Unknown options can describe the old work. Never silently transfer them.
 return Object.freeze({known:false,action:'review',category:'unknown'});
}
