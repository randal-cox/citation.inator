import {initializeCitationInspector} from './citation-inspector.mjs';
for(const element of document.querySelectorAll('[data-learning-credit]'))initializeCitationInspector(element,{
  cache:{schema:'citation-inator.cache.v1',records:[]},activation:'hover',strings:{'ui.credit':'How to cite'},accessSettings:'off'
});
