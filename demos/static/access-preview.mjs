import { initializeCitationInspector, getAccessProfile } from "../../dist/citation-inspector.mjs";
const cache = {
  "schema": "citation-inator.cache.v1",
  "records": [
    {
      "id": "harbor-handbook",
      "type": "book",
      "state": "resolved",
      "title": "Harbor field handbook",
      "authors": [
        {
          "literal": "Example archive"
        }
      ],
      "identifiers": [],
      "locations": [
        {
          "kind": "pdf",
          "url": "https://example.org/handbook.pdf",
          "provider": "Example archive",
          "verifiedAt": "2026-11-01T00:00:00.000Z",
          "version": null,
          "service": null,
          "access": "open"
        },
        {
          "kind": "library",
          "url": "https://example.org/jstor-handbook",
          "provider": "JSTOR",
          "verifiedAt": null,
          "version": null,
          "service": "jstor",
          "access": "subscription"
        },
        {
          "kind": "library",
          "url": "https://example.org/worldcat-handbook",
          "provider": "WorldCat",
          "verifiedAt": null,
          "version": null,
          "service": "worldcat",
          "access": "unknown"
        }
      ],
      "provenance": [],
      "citationParts": [],
      "issued": [
        2024
      ],
      "online": null,
      "print": null,
      "retrievedAt": null,
      "version": null,
      "integrity": null,
      "abstract": null,
      "containerTitle": "",
      "publisher": "",
      "volume": "",
      "issue": "",
      "pages": "",
      "articleNumber": "",
      "edition": "",
      "publisherPlace": "",
      "containerAbbreviation": "",
      "apaTitle": "",
      "original": "",
      "note": "",
      "citationText": "",
      "medium": "",
      "dimensions": "",
      "holdingInstitution": "",
      "accession": "",
      "platform": "",
      "rightsHolder": "",
      "creatorAttribution": "",
      "displayDate": ""
    },
    {
      "id": "harbor-index",
      "type": "webpage",
      "state": "resolved",
      "title": "Harbor collection index",
      "authors": [
        {
          "literal": "Example archive"
        }
      ],
      "identifiers": [],
      "locations": [
        {
          "kind": "publisher",
          "url": "https://example.org/collection",
          "provider": "Example archive",
          "verifiedAt": null,
          "version": null,
          "service": null,
          "access": "unknown"
        }
      ],
      "provenance": [],
      "citationParts": [],
      "issued": [
        2024
      ],
      "online": null,
      "print": null,
      "retrievedAt": null,
      "version": null,
      "integrity": null,
      "abstract": null,
      "containerTitle": "",
      "publisher": "",
      "volume": "",
      "issue": "",
      "pages": "",
      "articleNumber": "",
      "edition": "",
      "publisherPlace": "",
      "containerAbbreviation": "",
      "apaTitle": "",
      "original": "",
      "note": "",
      "citationText": "",
      "medium": "",
      "dimensions": "",
      "holdingInstitution": "",
      "accession": "",
      "platform": "",
      "rightsHolder": "",
      "creatorAttribution": "",
      "displayDate": ""
    },
    {
      "id": "harbor-artwork",
      "type": "artwork",
      "state": "resolved",
      "license": {
        "name": "CC BY-SA 4.0",
        "url": "https://creativecommons.org/licenses/by-sa/4.0/"
      },
      "contributors": [
        {
          "name": "Example uploader",
          "role": "uploader"
        }
      ],
      "title": "A study of the harbor",
      "authors": [
        {
          "literal": "Example artist"
        }
      ],
      "identifiers": [],
      "locations": [],
      "provenance": [
        {
          "provider": "Example archive",
          "url": "",
          "retrievedAt": null,
          "note": "",
          "checksums": [
            {
              "algorithm": "sha256",
              "value": "aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa",
              "role": "source"
            },
            {
              "algorithm": "sha256",
              "value": "bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb",
              "role": "served"
            }
          ]
        }
      ],
      "citationParts": [],
      "issued": null,
      "online": null,
      "print": null,
      "retrievedAt": null,
      "version": null,
      "integrity": null,
      "abstract": null,
      "containerTitle": "",
      "publisher": "",
      "volume": "",
      "issue": "",
      "pages": "",
      "articleNumber": "",
      "edition": "",
      "publisherPlace": "",
      "containerAbbreviation": "",
      "apaTitle": "",
      "original": "",
      "note": "",
      "citationText": "",
      "medium": "Oil on canvas",
      "dimensions": "60 × 90 cm",
      "holdingInstitution": "Example archive",
      "accession": "DEMO-42",
      "platform": "",
      "rightsHolder": "Example artist",
      "creatorAttribution": "Attributed to",
      "displayDate": "1830/34"
    }
  ]
};
for (const id of ["access-demo-reader", "media-demo-reader"]) {
  initializeCitationInspector(document.getElementById(id), { cache, accessLayout: "grouped", staleAfterDays: 30 });
}
const status = document.getElementById("access-profile-state");
function show(profile) {
  status.textContent = profile === null ? "Not set" : profile.services.length ? profile.services.join(", ") : profile.library ? "Library configured" : "None chosen";
}
show(getAccessProfile());
document.addEventListener("access-profile-changed", event => show(event.detail.profile));
