import {initializeCitationInspector} from './citation-inspector.mjs';
const [cache,options]=await Promise.all([
  fetch('./compiled-citations.json').then(r=>r.json()),
  fetch('./configuration.json').then(r=>r.json())
]);
initializeCitationInspector(document.querySelector('citation-inspector'),{...options,cache});
