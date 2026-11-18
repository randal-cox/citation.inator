# Check-in and milestone procedure

This procedure applies to citation.inator commits and milestone releases. The current milestone record and roadmap are part of every check-in review.

## Before every check-in

1. Inspect the change and the staged diff. Keep the commit focused.
2. Review the current record under `docs/milestones/` and `ROADMAP.md`. Update scope, status, evidence, known limits and follow-up work affected by the change. A review can confirm that an existing entry already describes the change accurately.
3. Update `CHANGELOG.md` for changes adopters need to know about. Update the README, integration guide, generated Guide, feature guides and demos where behavior, configuration or usage changes.
4. Run checks appropriate to the change. Documentation-only work needs link and consistency checks. Runtime changes need the relevant unit and browser regressions. Run `npm run build` when source changes affect generated assets or standalone guides, then inspect and stage the output.
5. Stage the intended files and run `npm run checkin:check`. Inspect the staged diff again before committing.

The fast check reads the staged snapshot. It checks whitespace, version consistency, copied assets, the current milestone record's structure and local documentation file links. It can detect a missing record or broken link. The author still reviews whether the prose and evidence accurately describe the work.

## Install the local hook

From the repository root, run:

```sh
npm run hooks:install
```

This sets this checkout's Git hooks directory to `.githooks`. Its pre-commit hook runs the fast staged check. If the checkout already has a hook arrangement, add `node scripts/checkin.mjs --staged` to that pre-commit flow. Hook installation is a one-time checkout setup.

## Open and maintain a milestone

Choose the scope and version with the maintainer. Start `docs/milestones/VERSION.md` using [the record template](milestones/TEMPLATE.md), and link it from the roadmap. Preview package versions use that milestone's base version, for example `0.1.5-access.0` uses `docs/milestones/0.1.5.md`.

Record the state as work progresses. Delivered scope describes implementation. Acceptance and evidence identify the candidate, environment, commands, outcomes and reviewer verdicts. Known limits and follow-up carry unresolved work into the roadmap.

A pending test or reviewer result stays pending until evidence arrives. Attribute host-site results to the adopter who reported them. Keep older verification records dated and versioned, with a link to the current milestone.

## Before closing a milestone

1. Compare the delivered implementation, demos and documentation against the agreed scope. Reconcile the milestone record, roadmap and changelog.
2. Identify the candidate being reviewed. Run:

   ```sh
   npm run milestone:check
   ```

   This runs unit/integration tests, rebuilds assets, runs the browser suite and checks working-tree consistency. The browser suite needs a supported local Chromium installation. Record its actual browser and Node versions. Stage any generated output and run the fast staged check again.
3. Complete the [independent adversarial review](adversarial-testing.md). Related roles can be combined, but record each role's verdict. Fix blockers and return the fixes for review. Describe remaining platform checks and accepted nonblocking findings in the milestone record.
4. Collect adopter acceptance when it is part of the agreed milestone. Record the tested candidate and what the adopter actually checked.
5. Check the package in a clean consumer and the copied standalone distribution. Confirm public exports, installed guides, fallback links and the version shown in metadata and generated assets.
6. Resolve the release decision using the maintainer's instructions. Record the agreed version and title. Create the final archives and checksums from the accepted tree.
7. Commit, merge, tag, push and publish the authorized release artifacts. Verify the remote commit, tag and downloadable assets. Record the release date, tag, commit, artifact links and remaining follow-ups in the milestone record.

Version bumps follow the agreed milestone and release decisions. Multiple fixes can belong to the same milestone. Shared preview packages receive distinct prerelease identifiers so an adopting site can identify its installed candidate.

## Documentation follow-ups after release

Keep published artifacts and tags as the record of the release. A documentation correction can be committed on the current branch and linked from the milestone record. Documentation-only corrections do not require a version bump by themselves.
