# Reader access and media preview verification

The 0.1.4-access.0 working preview consolidates the structured-occurrence and host-integration candidates with reader access and media features. The public baseline for this work was 0.1.3 at c3cd258. This record describes the preview checks on 18 November 2026.

## Automated checks

- Node 22.23.3 passed all 50 unit and integration tests. Cases include unknown versus none profiles, unavailable storage, canonical identifiers, explicit copy access, catalogue customization, chapter OpenURL metadata, creator attribution, literal dates, APA suffixes and source/served checksums.
- Chrome 157.0.8103.78 passed the complete browser suite. The copied standalone folder was exercised on its own origin with a restrictive CSP and with JavaScript disabled.
- The reader access scenario exercised settings save and clear, restoration after reload, cross-inspector updates, host-settings events, translated labels and plural counts, two open PDFs, hiding/showing services by ID, preferred title links, and focus after settings opened from an endnote.
- The same-organization/title case linked the title while preserving the byline. Copied citations retained canonical reference text. A configured library link carried the available OpenURL metadata.
- Media checks covered rights links, a separate uploader role, shortened source/served digests, and full checksum copying.
- The combined suite retained the existing focus, keyboard, pointer, touch emulation, viewport movement, nested-overlay Escape, dynamic resolver, stale-cache, outage, race, offline, remount, print and no-JavaScript checks.
- The npm tarball contains the compiler, browser assets, pure access API, and reader/media guides. An isolated consumer exercised the public compiler, records, structured planner and access exports on Node 22.

## Independent adversarial review

The review followed [the recurring milestone plan](adversarial-testing.md). Three independent reviewers combined related roles.

| Review role | Verdict and scope |
| --- | --- |
| Distribution and deployment | Passed for the preview. Package exports, copied assets, clean consumer and included documentation were checked. |
| Versioning | Passed. Manifest, lockfile, CFF, README and generated banners agree on the preview version. |
| Testing | Passed the scoped review. Multiple-copy, hidden-service, catalogue-label and chapter-resolver findings were corrected and covered by regression checks. |
| UX and accessibility | Passed the scoped review. Focus after saving from endnotes, title versus byline selection, menu layout and settings dismissal were corrected. Native assistive-technology checks remain open. |
| Documentation | Passed. README, integration guide, generated Guide and feature guides link to the examples and describe configuration. Feature guides are included in the package. |
| Roadmap | Passed. Implemented preview features, generic media formatting outside Chicago and unverified platform checks are identified. |
| Citation and authorship | Passed for the documented coverage. Attribution uncertainty and uploader roles survive export notes. Canonical URLs, date suffixes and curated references retain their behavior. |
| Non sequitur | Passed. Public documentation and code remain host-neutral. |

## Remaining checks and limits

Native Safari, VoiceOver and physical-phone interaction remain unverified for this preview. Chromium touch emulation and forced-colors checks provide narrower evidence.

Chicago is the initial artwork/image formatting target. Other presets use the generic media fallback documented in the [support matrix](media-support.md). Exact venue formatting can use curated reference parts.

Link verification dates and checksums describe supplied metadata. The library performs no automatic destination checks or file verification. The synthetic access and media examples use example.org URLs and illustrative hashes.

Stable release and package publication remain separate from this preview verification.
