const en = {
  "access.links": "Source links",
  "access.action.pdf": "Download PDF", "access.action.publisher": "Read online",
  "access.action.repository": "Open repository", "access.action.preprint": "Open preprint",
  "access.action.library": "Find at {service}", "access.action.full-text": "Read full text at {service}",
  "access.version": "{label} ({version})",
  "access.free": "Read free", "access.selected": "Through your services",
  "access.other": "Other places to look", "access.more": { one: "More options ({count})", other: "More options ({count})" },
  "access.help.unknown": "Reading services",
  "access.help.none": "Reading services",
  "access.help.match": "Reading services", "access.settings": "Where you can read",
  "access.services": "Services you can use", "access.preferred": "Open titles in",
  "access.noPreference": "No preference", "access.library": "Through my library",
  "access.library.kind": "Library access type", "access.library.none": "No library configured",
  "access.library.proxy": "Proxy prefix", "access.library.openurl": "OpenURL resolver",
  "access.library.address": "Library address", "access.library.help": "Use the HTTPS address supplied by your library. It is used only when you open a library link.",
  "access.privacy": "Saved in this browser for this site. Services may have the work. Availability varies by title.",
  "access.save": "Save", "access.clear": "Clear settings", "access.cancel": "Cancel",
  "access.at": "at {service}", "access.checked": "Checked {date}", "access.stale": "May have moved",
  "access.destination": "Open at {service}", "access.invalid": "Check your library address and preferred service.",
  "access.kind.free": "Open copies", "access.kind.publisher": "Publishers", "access.kind.subscription": "Subscriptions",
  "access.kind.library": "Libraries", "access.kind.lending": "Lending", "access.kind.accessibility": "Accessible editions",
  "access.kind.discovery": "Discovery"
};

const es = {
  'access.links':'Enlaces a fuentes', 'access.save':'Guardar', 'access.cancel':'Cancelar',
  'access.clear':'Borrar preferencias', 'access.settings':'Dónde puedes leer',
  'access.free':'Leer gratis', 'access.selected':'A través de tus servicios',
  'access.other':'Otros lugares donde buscar', 'access.more':{one:'Más opciones ({count})',other:'Más opciones ({count})'},
  'access.services':'Servicios disponibles', 'access.preferred':'Abrir títulos en',
  'access.noPreference':'Sin preferencia', 'access.library':'A través de mi biblioteca',
  'access.library.kind':'Tipo de acceso a la biblioteca', 'access.library.none':'Sin biblioteca configurada',
  'access.library.proxy':'Prefijo del proxy', 'access.library.openurl':'Servidor OpenURL',
  'access.library.address':'Dirección de la biblioteca',
  'access.library.help':'Usa la dirección HTTPS de tu biblioteca. Solo se utiliza al abrir un enlace de biblioteca.',
  'access.privacy':'Se guarda en este navegador para este sitio. La disponibilidad depende del título.',
  'access.help.unknown':'Servicios de lectura',
  'access.help.none':'Servicios de lectura',
  'access.help.match':'Servicios de lectura', 'access.at':'en {service}',
  'access.checked':'Comprobado el {date}', 'access.stale':'Puede haber cambiado de dirección',
  'access.destination':'Abrir en {service}', 'access.invalid':'Revisa la dirección de tu biblioteca y el servicio preferido.',
  'access.action.pdf':'Descargar PDF', 'access.action.publisher':'Leer en línea',
  'access.action.repository':'Abrir repositorio', 'access.action.preprint':'Abrir prepublicación',
  'access.action.library':'Buscar en {service}', 'access.action.full-text':'Leer texto completo en {service}',
  'access.kind.free':'Copias abiertas','access.kind.publisher':'Editoriales',
  'access.kind.subscription':'Suscripciones','access.kind.library':'Bibliotecas',
  'access.kind.lending':'Préstamos','access.kind.accessibility':'Ediciones accesibles','access.kind.discovery':'Descubrimiento'
};
Object.assign(en, {
  "ui.dismiss": "Dismiss",
  "ui.panelOptions": "Panel options",
  "ui.move": "Move panel",
  "ui.moveLabel": "Move citation panel",
  "ui.moveInstructions": "Click or tap where the panel’s top-left corner should go.",
  "ui.cancelMove": "Cancel move",
  "ui.unresolved": "Unresolved citation",
  "ui.unresolvedBadge": "Unresolved",
  "ui.listedSite": "Listed on this site",
  "ui.citedSite": "Cited on this site",
  "ui.listedAuthors": "Show listed authors",
  "ui.formatted": "Show formatted citation",
  "ui.abstractExcerpt": "Abstract excerpt",
  "ui.abstract": "Abstract",
  "ui.pubmed": "Open PubMed",
  "ui.pmc": "Open PubMed Central",
  "ui.status": "Open status record",
  "ui.endnote": "Go to endnote",
  "ui.copyCitation": "Copy citation",
  "ui.report": "Report metadata",
  "ui.copied": "Copied.",
  "ui.clipboard": "Clipboard unavailable. Select the citation text to copy it.",
  "ui.inspect": "Inspect",
  "ui.endnotes": "Endnotes",
  "ui.readingList": "Reading list",
  "ui.noTags": "No references match the selected tags.",
  "ui.filterLegend": "Show references with any selected tag",
  "ui.listedIn": "Listed in",
  "ui.citedIn": "Cited in",
  "ui.evidence": "Citation evidence",
  "ui.credit": "Citation credit",
  "ui.sourceMetadata": "Source metadata",
  "ui.softwareLicense": "The software uses the MIT license. Cited material retains its own terms.",
  "ui.citeSoftware": "How to cite this software",
  "ui.repository": "GitHub repository",
  "ui.software": "cite.inator · Portable Citation Inspector",
  "ui.lookupISBN": "Look up ISBN",
  "ui.openSource": "Open source",
  "ui.inspectCitation": "Inspect citation: {label}",
  "ui.inspectReference": "Inspect reference: {title}",
  "ui.copy": "Copy {label}",
  "ui.openIdentifier": "Open {scheme}",
  "ui.return": "Return to “{context}” (occurrence {letter})",
  "ui.authors": {
    "one": "Show all {count} author",
    "other": "Show all {count} authors"
  },
  "ui.shown": {
    "one": "{count} reference shown out of {total}",
    "other": "{count} references shown out of {total}"
  }
});
Object.assign(es, {
  "ui.dismiss": "Cerrar",
  "ui.panelOptions": "Opciones del panel",
  "ui.move": "Mover panel",
  "ui.moveLabel": "Mover panel de cita",
  "ui.moveInstructions": "Haz clic o toca donde deba ir la esquina superior izquierda del panel.",
  "ui.cancelMove": "Cancelar movimiento",
  "ui.unresolved": "Cita sin resolver",
  "ui.unresolvedBadge": "Sin resolver",
  "ui.listedSite": "Incluido en este sitio",
  "ui.citedSite": "Citado en este sitio",
  "ui.listedAuthors": "Mostrar autores indicados",
  "ui.formatted": "Mostrar cita formateada",
  "ui.abstractExcerpt": "Extracto del resumen",
  "ui.abstract": "Resumen",
  "ui.pubmed": "Abrir PubMed",
  "ui.pmc": "Abrir PubMed Central",
  "ui.status": "Abrir registro de estado",
  "ui.endnote": "Ir a la nota",
  "ui.copyCitation": "Copiar cita",
  "ui.report": "Informar sobre metadatos",
  "ui.copied": "Copiado.",
  "ui.clipboard": "Portapapeles no disponible. Selecciona la cita para copiarla.",
  "ui.inspect": "Consultar",
  "ui.endnotes": "Notas finales",
  "ui.readingList": "Lista de lecturas",
  "ui.noTags": "Ninguna referencia coincide con las etiquetas seleccionadas.",
  "ui.filterLegend": "Mostrar referencias con alguna etiqueta seleccionada",
  "ui.listedIn": "Incluido en",
  "ui.citedIn": "Citado en",
  "ui.evidence": "Evidencia de la cita",
  "ui.credit": "Créditos de la cita",
  "ui.sourceMetadata": "Metadatos de la fuente",
  "ui.softwareLicense": "El software usa la licencia MIT. El material citado conserva sus propias condiciones.",
  "ui.citeSoftware": "Cómo citar este software",
  "ui.repository": "Repositorio de GitHub",
  "ui.software": "cite.inator · Inspector portátil de citas",
  "ui.lookupISBN": "Buscar ISBN",
  "ui.openSource": "Abrir fuente",
  "ui.inspectCitation": "Consultar cita: {label}",
  "ui.inspectReference": "Consultar referencia: {title}",
  "ui.copy": "Copiar {label}",
  "ui.openIdentifier": "Abrir {scheme}",
  "ui.return": "Volver a «{context}» (mención {letter})",
  "ui.authors": {
    "one": "Mostrar el autor",
    "other": "Mostrar los {count} autores"
  },
  "ui.shown": {
    "one": "{count} referencia mostrada de {total}",
    "other": "{count} referencias mostradas de {total}"
  }
});
Object.assign(en, {'ui.returnListing':'Return to listing in {label}{context} (entry {letter})','ui.returnSite':'Return to {label}{context} (occurrence {letter})'});
Object.assign(es, {'ui.returnListing':'Volver a la lista en {label}{context} (entrada {letter})','ui.returnSite':'Volver a {label}{context} (mención {letter})'});
for(const catalogue of [en,es])for(const key of ['access.more','ui.authors','ui.shown'])for(const category of Object.keys(catalogue[key]||{}))catalogue[key][category]=catalogue[key][category].replaceAll('{count}','{countLabel}');
const freezeCatalog = catalog => Object.freeze(Object.fromEntries(Object.entries(catalog).map(([key,value])=>[key,typeof value==='object'?Object.freeze({...value}):value])));
export const citationLocales=Object.freeze({en:freezeCatalog(en),es:freezeCatalog(es)});
const own=(object,key)=>Object.hasOwn(object,key)?object[key]:undefined;
export function createCitationMessages({locale='en',strings={}}={}) {
  if(typeof locale!=='string'||!locale)throw new TypeError('Supply a valid language tag.');
  try{locale=Intl.getCanonicalLocales(locale)[0];}catch{throw new TypeError('Supply a valid language tag.');}
  if(!strings||typeof strings!=='object'||Array.isArray(strings))throw new TypeError('Supply message overrides as an object.');
  const overrides={};
  for(const [key,value] of Object.entries(strings)){
    if(typeof value==='string')overrides[key]=value;
    else if(value&&typeof value==='object'&&!Array.isArray(value)&&Object.values(value).every(item=>typeof item==='string'))overrides[key]={...value};
    else throw new TypeError('Messages must be strings or plural message objects.');
  }
  const catalogue=citationLocales[locale.split('-')[0]]||citationLocales.en;
  const plural=new Intl.PluralRules(locale), numbers=new Intl.NumberFormat(locale);
  return Object.freeze({locale,
    text(key,values={}){
      const category=plural.select(values.count??0);
      values={countLabel:numbers.format(values.count??0),...values};
      const choose=value=>typeof value==='string'?value:value&&(own(value,category)??own(value,'other'));
      const template=choose(own(overrides,key))??choose(own(catalogue,key))??choose(own(citationLocales.en,key))??key;
      return template.replace(/\{(\w+)\}/g,(_,name)=>Object.hasOwn(values,name)?String(values[name]??''):'');
    },
    number:value=>numbers.format(value),
    date:(value,options)=>new Intl.DateTimeFormat(locale,options).format(value)
  });
}
