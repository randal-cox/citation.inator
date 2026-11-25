# Adversarial testing

This review is part of the [milestone check-in procedure](checkin-procedure.md). The current milestone record and roadmap are reviewed before every check-in.

Run this review at every milestone and whenever a change warrants it. Start from an identified commit or working-tree candidate and share the expected behavior, artifacts and commands with reviewers. Ask each reviewer to challenge the work independently and give an explicit verdict, with reproduction steps for any issue.

| Reviewer | What to challenge |
| --- | --- |
| Distribution and deployment | Build the npm tarball and standalone assets. Check public exports, package contents, minimum Node, clean consumer install, copied assets on a separate origin, and documented deployment steps. |
| UX and accessibility | Use the demo and hostile host. Check pointer, keyboard and touch, narrow viewports and zoom, focus, panel movement, endnote returns, and the no-JavaScript path. Use the [UX scenarios](ux-adversaries.md). |
| Testing | Look for regressions the suite would miss. Try the documented compiler, CLI and browser entry points and verify failures as well as normal results. Distinguish simulated, live and physical-device evidence. |
| Documentation | Follow the README and Guide from a clean download. Check examples against the installed package and copied assets. |
| Versioning | Compare the manifest, lockfile, generated assets, software citation, changelog and archive names. Keep published artifacts immutable and choose version changes deliberately. |
| Roadmap | Check that planned, implemented and unverified work is identified accurately. Use observed gaps to choose the next milestones. |
| Citation and authorship | Check source identity, edition and version distinctions, citation examples, attribution, provenance and software credit. |
| Reader copy and non sequitur | Review the whole UI, including statuses, tooltips and disclosures, for commentary addressed to developers/maintainers, self-justification, repeated instructions and unnecessary reassurance. Keep useful labels, state, consent, provenance and actionable errors. Check docs/comments for unexplained personal references, internal logistics, stale instructions and fixture text taken out of context. Do not move unnecessary prose into accessibility-only text. |

Run `npm test`, `npm run build`, and `npm run test:browser` as the baseline. Reviewers may combine related roles, but each role gets a recorded verdict. Record the candidate, environment, checks run, remaining coverage gaps and reviewer verdicts with the milestone evidence. Fix blocking findings and return the changes to the reviewer for another pass. Record deferred items in the [roadmap](../ROADMAP.md) with the evidence needed to close them.

## Author versus site configuration

Every milestone review must ask: **Does this make an article author use JavaScript for something they should be able to express in citation notation?** Authors describe the source and its use; site configuration controls shared behavior. Flag misplaced author work as an authoring defect, even when a JavaScript workaround exists. Check dates, formatted references, attribution, copy links and identifier discovery against this boundary. Integration APIs may still accept structured metadata; that must not become the required path for ordinary authors. Verify demos and Guide show the simplest supported author workflow and do not advertise unimplemented notation.
