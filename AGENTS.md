# Repository workflow

Read [the check-in procedure](docs/checkin-procedure.md) before preparing a commit.

Before every check-in, review the current milestone record, ROADMAP.md, CHANGELOG.md and documentation affected by the change. Update delivered scope, status, evidence, limitations and follow-up work where the change affects them. Preserve the distinction between planned work, implemented work, verified behavior and adopter-reported results.

Run appropriate checks for the change and run `npm run checkin:check` after staging. Keep generated assets and standalone guides synchronized with their sources.

For milestone check-ins, follow the full procedure, run `npm run milestone:check`, and complete the independent reviews in [the adversarial plan](docs/adversarial-testing.md). Record explicit verdicts and any pending checks in the milestone record. Apply the user's existing authorization when deciding release steps.

Keep version changes deliberate. Choose the milestone version with the maintainer, use distinct prerelease versions for shared preview packages, and retain published artifacts as the record of their release.

## Cross-project coordination

The maintainer authorized routine two-way coordination through GitHub issues in `randal-cox/draft.inator` labelled `cite.inator`. Check that queue at the start of relevant sessions. Use one issue per request; follow #7's reproducible example/acceptance format. Reply with exact commits, artifact availability and verification evidence. Distinguish implemented, locally verified and adopter-verified; draft closes its requests after adoption. Do not post private corpus material. This authorization covers routine labelled issues/comments, not unrelated messages or unilateral edits to the other project's implementation.
