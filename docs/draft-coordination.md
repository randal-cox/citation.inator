# Proposed cross-project coordination

## Mechanism

Use GitHub issues in draft.inator labelled `cite.inator`, one issue per request, with small linked PRs and versioned contract/fixture files. Both agents check the label at the start of relevant sessions. Claude/draft opens adopter requests; Theandra replies with commits and package/bundle availability; draft closes after adoption. Requests in the other direction use the same label and clear acceptance criteria. Distinguish implemented, locally verified and adopter-accepted results. GitHub is asynchronous: it does not itself wake a running Claude/Codex session. A short issue update should state the candidate commit, changed contract, requested action and reproduction/evidence, rather than duplicate a long chat transcript.

On 21 November 2026 the connected GitHub account reported pull/push/maintain/admin permissions on `randal-cox/draft.inator`. The maintainer subsequently authorized routine two-way issues/comments under the `cite.inator` label, following draft.inator#7. No private corpus should enter that channel. This does not authorize unrelated messaging or unilateral implementation changes in the other project.

Keep implementation ownership separate: citation.inator owns reusable recognition/matching/review data; draft.inator owns editor decorations, transactions, authentication and publishing. Shared examples should be synthetic/publicly licensed, never private manuscript extracts.

## Current import discussion

[Draft.inator#16](https://github.com/randal-cox/draft.inator/issues/16) contains the 0.4.0 host appearance/interaction proposal and exact `0.4.0-preview.0` source/bundle commit `dbdb4d502c4f4bc00d5d406aac0e0564112826a4`. It asks for agreement on headless ownership, any required shared review policy/UI hooks, styles/names, source revision and undo mapping, equivalent input paths and the 0.5.0 i18n seam. The full-page demo is an example host, not a mandated editor layout. A response/agreement is pending; final release waits for it.

## First handoff

The maintainer explicitly authorized this channel on 21 November 2026. The first labelled adoption request is [draft.inator#8](https://github.com/randal-cox/draft.inator/issues/8), with the immutable 0.3.0 release commit/artifact links, completed checks and requested adoption criteria. Draft reported final-artifact verification and closed it after adoption in `865c11c`; its 39 tests and repeated note cycles passed. Reader rendering was outside draft's adoption check and remains citation.inator's responsibility.
