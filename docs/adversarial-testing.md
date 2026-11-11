# Adversarial testing

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
| Non sequitur | Review public docs, demos and comments for unexplained personal references, internal logistics, stale instructions and fixture text taken out of context. |

Run `npm test`, `npm run build`, and `npm run test:browser` as the baseline. Reviewers may combine related roles, but each role gets a recorded verdict. Record the candidate, environment, checks run, remaining coverage gaps and reviewer verdicts with the milestone evidence. Fix blocking findings and return the changes to the reviewer for another pass. Record deferred items in the [roadmap](../ROADMAP.md) with the evidence needed to close them.
