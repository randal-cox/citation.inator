# Reader access

These features are available in version 0.1.4. Run `npm start` and open **Reader access and artwork** in the Reading room or Plain HTML.

Direct reading/download actions remain visible. The inspector shows labelled **Read online** and **Download PDF** controls when it has those destinations; catalogue and optional service links may be collapsed. A DOI provides an online destination, not a guarantee of free access. The settings prompt names the library/services configuration and is omitted where there are no source links.

## Load and configure

Load the browser module and its adjacent CSS using the [integration guide](integration.md#load-and-initialize). Access settings work with compiled markup and structured occurrences.

```js
import {
  initializeCitationInspector, getAccessProfile, setAccessProfile
} from "./citation-inspector.mjs";

initializeCitationInspector(reader, {
  cache,
  accessLayout: "grouped",
  accessSettings: "builtin",
  accessStorageKey: "citation-inator.access.v1",
  accessCatalog: [{ id: "hathi-trust", label: "Hathi Trust", kind: "library" }],
  locale: "en",
  strings: {
    "access.help.unknown": "Choose your library or reading services",
    "access.more": { one: "{count} other place", other: "{count} other places" }
  }
});
```

The default catalogue includes open copies, author preprints, JSTOR, Project MUSE, Perlego, WorldCat, Internet Archive, Open Library, Bookshare, and Google Scholar. A catalogue describes a service that may have a work. Record locations supply actual destinations. Service IDs associate locations with reader preferences. Provider names from older caches are matched against catalogue labels. Unrecognized providers are treated as publishers.

Add catalogue entries with `id`, `label` and `kind`. Relabel an entry with `{ id: "jstor", label: "Institutional JSTOR" }`. Remove one with `{ id: "perlego", remove: true }`. Kinds are `free`, `publisher`, `subscription`, `library`, `lending`, `accessibility`, and `discovery`. Removing an entry removes it from settings. Locations supplied by a record remain available as other destinations.

## Mark individual copies

```json
{
  "kind": "pdf",
  "provider": "Example repository",
  "service": "open-access",
  "access": "open",
  "url": "https://example.org/work.pdf",
  "verifiedAt": "2026-11-01T00:00:00Z"
}
```

`access` accepts `open`, `subscription`, `purchase`, `loan`, or `unknown`. Missing values become `unknown`. A PDF, full-text location, or free catalogue entry needs `access: "open"` on the location to enter **Read free**. PDF and preprint locations require a verification timestamp.

The grouped layout shows open copies first, selected services next, and remaining destinations behind a count disclosure. `accessCollapseAfter` sets how many remaining destinations appear before the disclosure, with a default of zero. `accessLayout: "flat"` keeps links visible. `access-layout` is the corresponding element attribute. Existing hidden-provider preferences apply.

## Profile and events

```js
setAccessProfile({
  services: ["jstor", "perlego"],
  preferred: "jstor",
  library: { kind: "openurl", base: "https://resolver.example.edu/openurl?" }
});
const profile = getAccessProfile();

reader.addEventListener("access-profile-changed", event => {
  const { profile, state } = event.detail;
  // state is "unknown", "none", or an array of selected service IDs.
});

setAccessProfile(null); // Clear settings and restore unknown.
```

A missing profile is `null`, meaning unknown. A profile with `services: []` is explicitly none. A library setting can coexist with an empty service list. `updatedAt` records the time settings were saved. Each mounted inspector emits the bubbling, composed `access-profile-changed` event when shared settings change. The event includes the complete profile and its state.

One storage key is shared by all inspectors on the origin by default. The in-memory value updates every inspector if storage is blocked. Available local storage persists it across pages, and storage events synchronize tabs. For an overridden key, pass `{ accessStorageKey: "essay.access" }` as the second argument of the get/set functions and use the same key at initialization.

The built-in sheet has service checkboxes, preferred-service radio buttons, and optional library configuration. **Clear settings** restores unknown. Escape, Cancel, and a click on its backdrop close it. The module sends no profile to a server and makes no destination checks during settings changes or inspector activation. Opening a destination follows its link.

## Use host settings

```html
<citation-inspector access-settings="host"></citation-inspector>
```

```js
reader.addEventListener("access-settings-request", event => {
  event.preventDefault();
  openSiteSettings();
});
```

Host mode emits a cancellable, bubbling, composed event. The host updates settings with `setAccessProfile`. Use `accessSettings: "off"` or `access-settings="off"` to remove the settings command and help line.

## Library and preferred destinations

A profile library can be an HTTPS OpenURL resolver or proxy prefix. OpenURL uses KEV parameters for available DOI, ISBN, ISSN, title, author and year. Proxy links append an encoded DOI URL, canonical URL identifier, or publisher URL. The existing `reader.institutionalURL(record)` hook overrides the profile library link.

After enhancement, titles in compiled endnotes and reading lists open an explicit open copy first, then a matching preferred service. A visible **at service** label and accessible name identify the destination. With no such destination, the original title is preserved. Copied citations, exports, and canonical reference URLs retain their bibliographic identity. Without JavaScript, supplied destinations and normal endnote links remain available.

## Dates and wording

The panel shows a location’s supplied verification date. `staleAfterDays` adds **May have moved** after that age and defaults off. This describes stored evidence, without a live link check.

`strings` replaces the following keys. Count templates use `Intl.PluralRules(locale)` and accept category objects with an `other` fallback.

| Keys | Purpose |
| --- | --- |
| `access.links`, `access.free`, `access.selected`, `access.other`, `access.more` | Groups and count disclosure |
| `access.help.unknown`, `access.help.none`, `access.help.match` | Contextual help |
| `access.settings`, `access.services`, `access.preferred`, `access.noPreference` | Settings labels |
| `access.library`, `access.library.kind`, `access.library.none`, `access.library.proxy`, `access.library.openurl`, `access.library.address`, `access.library.help` | Library controls |
| `access.privacy`, `access.save`, `access.clear`, `access.cancel`, `access.invalid` | Form text |
| `access.action.pdf`, `access.action.publisher`, `access.action.repository`, `access.action.preprint`, `access.action.library`, `access.action.full-text`, `access.version` | Source controls using `{service}`, `{label}`, `{version}` |
| `access.at`, `access.destination` | Destination labels using `{service}` |
| `access.checked`, `access.stale` | Verification notes using `{date}` |
| `access.kind.free`, `access.kind.publisher`, `access.kind.subscription`, `access.kind.library`, `access.kind.lending`, `access.kind.accessibility`, `access.kind.discovery` | Catalogue groups |

Translate service catalogue labels through `accessCatalog`. In the 0.5.0 preview, these access messages share the English/Spanish library UI catalogue, including locale-formatted counts and per-category fallback. See [UI language configuration](i18n.md).

OpenURL field mapping follows the [OCLC reference](https://help.oclc.org/Resource_Sharing/Tipasa/Reference/Configure_OpenURL). Chapters use the book format with a chapter title and collection title.

## Once-per-list access prompts (0.3.0)

When the reader has not configured an access profile, the 0.3.0 browser build shows one settings prompt after each owned reading/reference list, rather than repeating it in every item. Each inspector panel keeps its settings prompt. The list prompt is outside the numbered items, so filtering items does not hide the only prompt or change reference numbering. Lists outside the component are never modified; standalone reference items retain local help. Saving/clearing settings updates these controls and restores focus when a replacement helper survives. Disabling access settings removes the prompts; it does not guarantee a surviving prompt to focus.
