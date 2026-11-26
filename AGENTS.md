# Repository workflow

Read [the check-in procedure](docs/checkin-procedure.md) before preparing a commit.

Browser checks use a dedicated Playwright browser. Do not automatically launch the maintainer's everyday Chrome. Use a browser-capable execution context; if a sandbox launch aborts or returns EPERM, stop and change context instead of retrying it. Reviewers should reuse the parent browser evidence when source-only review is sufficient.

Before every check-in, review the current milestone record, ROADMAP.md, CHANGELOG.md and documentation affected by the change. Update delivered scope, status, evidence, limitations and follow-up work where the change affects them. Preserve the distinction between planned work, implemented work, verified behavior and adopter-reported results.

Run appropriate checks for the change and run `npm run checkin:check` after staging. Keep generated assets and standalone guides synchronized with their sources.

Final milestone publication requires explicit maintainer approval as well as any required adopter approval. Passing tests, preview check-ins and adopter sign-off do not substitute for maintainer acceptance.

For milestone check-ins, follow the full procedure, run `npm run milestone:check`, and complete the independent reviews in [the adversarial plan](docs/adversarial-testing.md). Record explicit verdicts and any pending checks in the milestone record. Apply the user's existing authorization when deciding release steps.

Use the optional Commons-backed [code-quality inventory](docs/quality.md) for meaningful maintenance slices. Keep scanner findings and semantic review separate; do not impose code-size quotas or turn diagnostic counts into a quality score. Preserve raw critic reports and independently retest confirmed repairs.

Keep version changes deliberate. Choose the milestone version with the maintainer, use distinct prerelease versions for shared preview packages, and retain published artifacts as the record of their release.

## Cross-project coordination

The maintainer authorized routine two-way coordination through GitHub issues in `randal-cox/draft.inator` labelled `cite.inator`. Check that queue at the start of relevant sessions. Use one issue per request; follow #7's reproducible example/acceptance format. Reply with exact commits, artifact availability and verification evidence. Distinguish implemented, locally verified and adopter-verified; draft closes its requests after adoption. Do not post private corpus material. This authorization covers routine labelled issues/comments, not unrelated messages or unilateral edits to the other project's implementation.

## Reader-facing copy

Run a reader-copy pass before delivering UI changes. “Remove the talking-to-me copy” means sweep the whole interface, including statuses, tooltips and disclosures: remove development narration, self-justification and repeated instructions; retain useful labels, state, consent, essential provenance and actionable errors. Put implementation and scope explanations in the docs. For substantial cleanup or repeated misses, use an independent agent reader-copy review and resolve its findings. Do not transfer unnecessary prose into accessibility-only text.

## Authoring boundary

Authors describe the source and its use; site configuration controls shared behavior. Put article-specific reference text, dates, attribution and copy links in citation notation. Reserve JavaScript/configuration for site-wide presentation, interaction and integrations. Generated metadata should come from resolvers or import tools where possible; do not require authors to hand-maintain identifier aliases. Review examples and new APIs against this boundary.
