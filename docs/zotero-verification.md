# Zotero adapter verification history

Maintainer evidence, separate from the [consumer API](zotero.md).

## Reproduce bounded evidence

```sh
node scripts/probe-zotero.mjs https://korazonresearch.org/
node --test test/zotero.test.mjs
node test/zotero-browser.mjs
node scripts/check-zotero-library.mjs /private/path/selected-items.json
```

The connection probe reads only a public item template and local service root, uses a dedicated managed browser and tests a deliberately invalid key. It never accepts credentials or reads library items. Its two fresh browser contexts establish public CORS/error behavior, not authenticated daily-use acceptance.

The library probe reads a caller-supplied response containing selected bibliographic items and prints aggregate counts only. Its transient `probe-*` IDs are measurement IDs, not persistent work identities. Keep private input files outside the repository and web-served paths.

On 25 November 2026, the authorized BEST collection supplied 34 items: 26 articles, 7 books and 1 software item. All rendered individually in Chicago/APA; 3 editor arrays matched their CSL source after normalization/export. Eight records required review: 7 unsupported URLs and 2 formatted titles (one overlap). One shared-identifier group prevents an unreviewed aggregate cache. This is a mapping/field-preservation rehearsal, not a claim that the library is bibliographically correct, all formatting is faithful or draft has adopted the adapter. Real data and identifiers were not committed.

Sources: [Zotero API basics](https://www.zotero.org/support/dev/web_api/v3/basics), [local API](https://www.zotero.org/support/dev/web_api/v3/local_api). The installed 9.0.4 server implementation and actual browser requests were also inspected; newer local versions may behave differently.
