/** Fixed teaching metadata, never a substitute for a live provider measurement. */
export function savedProviderFetch(fixture){
  if(!fixture||!Array.isArray(fixture.works))throw new TypeError('Saved metadata must contain a works array.');
  return async function request(input){
    const url=new URL(input);
    let message,status=200;
    if(url.origin==='https://api.crossref.org'&&url.pathname==='/works')message={items:fixture.works.slice(0,5)};
    else if(url.origin==='https://api.crossref.org'&&url.pathname.startsWith('/works/')){
      const doi=decodeURIComponent(url.pathname.slice('/works/'.length)).toLowerCase();
      message=fixture.works.find(item=>item.DOI.toLowerCase()===doi);
      if(!message)status=404;
    }else if(url.origin==='https://openlibrary.org'&&url.pathname==='/search.json')return Response.json({docs:[],fixture:'saved-example-metadata'});
    else status=404;
    return Response.json({message:message||'No saved example metadata for this identifier.',fixture:'saved-example-metadata'},{status});
  };
}

export function savedProviderEvidence(result){
  const mapped=new Map();
  const candidates=result.candidates.map(record=>{
    const value={...record,provenance:[{provider:'Saved example metadata',note:'Fixed teaching metadata from the public learning references; no live provider verification was performed.'}]};
    mapped.set(record,value);return value;
  });
  return {...result,candidates,automatic:result.automatic?mapped.get(result.automatic)||null:null,
    evidence:(result.evidence||[]).map(entry=>({provider:'Saved example metadata',fixtureFor:entry.url,raw:entry.raw}))};
}
