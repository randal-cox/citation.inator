# Independent draft Zotero rehearsal — 25 November 2026

Verdict: **needs fixes before integrated acceptance**. The ordinary insertion loop works in the synthetic demo, but an identity-conflict bypass and a failed-stage partial update remain open in draft. This report is evidence for the current milestone, not adopter sign-off or final release approval.

Candidate: [draft PR52](https://github.com/randal-cox/draft.inator/pull/52), commit `449a45aa6d9939955f63174f4fb5ecc091f22586`, with its pinned cite manager `0.6.0-preview.1`. The current cite preview.3 adapter also reports the tested stale-binding identity as `id-collision`; the host ignores that state. No cite runtime fix was needed for this finding.

The draft branch was cloned into a temporary directory. Its implementation and the maintainer's working checkout were left unchanged. Tests used only the documented synthetic Zotero library and key, a fresh browser context and Playwright-managed Chromium159.0.8154.6. No real Zotero library writes, API credentials, KR policy changes, merges or releases occurred.

## Original demo results

| Scenario | Observed result |
| --- | --- |
| Close after selecting a new work | Source and works unchanged |
| Insert new Okafor work with locator44 | Correct marker, work registered and preview updated |
| Text Undo | Prior source restored |
| Existing Bell site candidate | Requires explicit radio choice; Insert without a choice reports an error |
| Synthetic key storage | Present in sessionStorage; absent from article source and localStorage |
| Forget the key | Removes the session credential |
| Stale Okafor→Bell binding | **Fails**: Bell automatically selected and inserted as Okafor, no conflict warning |

Draft's original141 tests pass on Node26.13.1 and minimum22.13.0. The new browser cases expose behavior those tests do not cover. These are observations from cite's independent rehearsal, not results reported by draft.

## Identity conflict

[Request53](https://github.com/randal-cox/draft.inator/issues/53) records the exact reproduction and acceptance criteria. In the demo origin:

```js
localStorage.setItem('draft-inator-zotero-bindings', JSON.stringify({
  'user:1000001:OKAF2019':'bell-1992-ritual'
}));
```

Choose Okafor. `prepare()` receives an explicit `proposal.state:'id-collision'` and no matching candidates, but the picker preselects the stale binding because the record ID exists. Inserting then writes Bell's marker. The dialog title says Okafor while its sole radio says Bell.

Browser bindings are disposable acceleration state. Their presence cannot establish identity or override a reconciliation conflict. The issue requests visible resolution and a real-picker regression while retaining safe same-item reuse. Multiple datasets on one origin, restored caches and reused work IDs are reasons a mapping can become stale; no assumption of malicious storage is needed.

## Public-hook persistence fixture

A separate temporary host mounted the same editor with the public options, the same synthetic `sampleFetch`, real manager/compiler modules and synchronous `onRecords` staging into a Map. Save compiled against initial+staged records and persisted the source with `compiled.cache.records`. This host-specific save implementation is a test fixture, not code delivered by draft or proof of KR integration.

| Scenario | Observed result |
| --- | --- |
| Close before insertion | Neither source nor staged records change |
| Undo successful insertion | Source restored; record remains staged and in available works |
| Save after Undo through used-record filtering | No unused record saved |
| Save successful insertion | Source and one portable record saved together; synthetic key/item key excluded |
| Reload with binding and session key removed, Zotero unavailable | Saved citation renders from its record and is available in the ordinary Citation picker |
| Throw from host staging callback | **Fails**: work already added, source unchanged, dialog remains, alert empty, browser receives unhandled error |

The disconnected test means Zotero was unavailable while the host's local HTTP assets remained available. It does not establish full browser-offline hosting, cross-device recovery or authenticated Web API onboarding.

## Staging failure

[Request54](https://github.com/randal-cox/draft.inator/issues/54) records the synchronous failure reproduction and acceptance criteria. Supply:

```js
onRecords() { throw new Error('STAGING_FAILURE_CANARY'); }
```

Select a new Rivera work and Insert. `addWorks()` has already mutated the picker/preview cache when `onRecords()` throws, so the source edit never occurs. The browser error is expected in this injected-failure case; the ordinary demo checks produce no browser errors. Cancel cannot undo the already-added work.

The request asks for a bounded failure-safe update and an actionable error, with the callback's sync/async contract stated clearly. It does not prescribe a new transaction framework. Successful source Undo currently retains staged works, so hosts must filter unused records at save or explicitly coordinate a rollback; they cannot equate staging with a committed article reference.

## Remaining acceptance

Fix53/54 and rerun their focused browser cases. Reuse the passing ordinary-flow evidence where the implementation remains unchanged. Authenticated private Zotero access, actual Zotero import of bibliography files, the separate KR CSP decision and host deployment/adopter approval remain separate checks. The core cite metadata/export evidence is unaffected by these draft integration findings.
