# Media records

Artwork and image support is available in version 0.1.4. Use `type: "artwork"` for an art object and `type: "image"` for a photograph, still, or screenshot.

## Record fields

```js
{
  id: "museum-object",
  type: "artwork",
  state: "resolved",
  title: "Study of a harbor",
  authors: [{ family: "Example", given: "Artist" }],
  creatorAttribution: "Attributed to",
  displayDate: "1830/34",
  medium: "Oil on canvas",
  dimensions: "60 × 90 cm",
  holdingInstitution: "Example museum",
  accession: "1920.4",
  license: {
    name: "CC BY-SA 4.0",
    url: "https://creativecommons.org/licenses/by-sa/4.0/"
  },
  rightsHolder: "Example rights holder",
  contributors: [{ name: "Example uploader", role: "uploader" }],
  provenance: [{
    provider: "Example museum",
    checksums: [
      { role: "source", algorithm: "sha256", value: sourceDigest },
      { role: "served", algorithm: "sha256", value: servedDigest }
    ]
  }]
}
```

Put the creator or photographer in `authors`. A file uploader belongs in `contributors` with an explicit role. The inspector displays those roles separately. For an unknown creator, leave `authors` empty. `creatorAttribution` retains wording such as **Attributed to**.

`displayDate` holds an authored range or approximation such as `1830/34` or `c. 1500`. Retain numeric `issued` date parts when known. The display date appears verbatim in citations and CSL’s `issued.literal`. `platform` can name a photograph’s host.

The inspector shows the license and rights holder below the title. The license name can be **Public domain**, **CC0**, **CC BY**, **CC BY-SA**, or other supplied wording. A valid HTTPS license URL becomes a link. Records should distinguish rights in the art object from rights in a photograph when they differ.

Checksums can use `provenance[].checksum` or an array `provenance[].checksums`. Each digest retains its role. The inspector shows a shortened digest and a copy action for the full value. Supported names are `md5`, `sha1`, `sha256`, `sha384`, and `sha512`, including forms such as `SHA-256`. Hex digest lengths are validated. The library retains supplied values and performs no file download or checksum verification.

## Formatting support

| Field or behavior | Chicago author–date | APA, default, MLA, Harvard, Vancouver |
| --- | --- | --- |
| Creator, unknown creator, attributed creator | Authored attribution, inverted first personal name | Generic creator-first fallback |
| Title | Italic | Italic |
| Date range or approximation | Verbatim display date | Verbatim display date |
| Medium, dimensions, institution, accession, platform | Included | Included in generic fallback |
| DOI or canonical URL | Linked when supplied | Linked when supplied |
| Rights and contributors | Inspector fields | Inspector fields |
| Source and served checksums | Separate inspector copy actions | Separate inspector copy actions |

Chicago is the initial media formatting target. Other presets preserve fields through a generic media reference. Use curated `citationParts` for exact house or venue formatting.

CSL export uses `type: "graphic"`. Creators remain in `author`, medium in `medium`, dimensions in `dimensions`, institution in `archive`, and accession in `archive_location`. CSL’s `note` preserves creator attribution and contributor roles. An uploader is never promoted to `author`. The normalized cache retains rights, contributor, and checksum metadata.

## Compact inspect actions

```js
compileCitations(source, cache, {
  inspectAppearance: "icon",
  inspectPlacement: "before",
  inspectIcon: "/assets/inspect.svg",
  inspectIconMode: "mask"
});
```

`inspectAppearance` accepts `text` or `icon`. `inspectPlacement` accepts `before` or `after`. Defaults retain the reading list’s text action after its reference. The icon/before settings also enable inspection on endnotes. The default icon is a book. `inspectIcon` accepts a safe image URL. Set `inspectIconMode: "mask"` to render the image’s silhouette with `currentColor`, so it follows the link’s text colour in light and dark themes. The default mode, `image`, retains the supplied image’s colours. Both modes keep the full accessible name **Inspect reference** followed by the title.

Mask mode uses a generated SVG alpha mask with unique IDs. Serve the image from the same origin and allow it through `img-src 'self'` in a restrictive CSP. A transparent SVG or PNG silhouette works well. The generated icon needs no inline CSS. [SVG alpha masks](https://developer.mozilla.org/en-US/docs/Web/SVG/Reference/Attribute/mask-type)

With a leading inspect control and no destination or return actions, the compiler omits the trailing action container. Reader-access enhancement can still add meaningful access or settings controls when configured.
