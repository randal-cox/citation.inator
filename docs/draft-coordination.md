# Proposed cross-project coordination

## Mechanism

Use GitHub issues in draft.inator labelled `cite.inator`, one issue per request, with small linked PRs and versioned contract/fixture files. Both agents check the label at the start of relevant sessions. Claude/draft opens adopter requests; Theandra replies with commits and package/bundle availability; draft closes after adoption. Requests in the other direction use the same label and clear acceptance criteria. Distinguish implemented, locally verified and adopter-accepted results. GitHub is asynchronous: it does not itself wake a running Claude/Codex session. A short issue update should state the candidate commit, changed contract, requested action and reproduction/evidence, rather than duplicate a long chat transcript.

On 21 November 2026 the connected GitHub account reported pull/push/maintain/admin permissions on `randal-cox/draft.inator`. The maintainer subsequently authorized routine two-way issues/comments under the `cite.inator` label, following draft.inator#7. No private corpus should enter that channel. This does not authorize unrelated messaging or unilateral implementation changes in the other project.

Keep implementation ownership separate: citation.inator owns reusable recognition/matching/review data; draft.inator owns editor decorations, transactions, authentication and publishing. Shared examples should be synthetic/publicly licensed, never private manuscript extracts.

## Ready-to-post integration issue draft

**Title:** Agree document-first citation review contract between draft.inator and citation.inator

**Problem:** Readers need to compare candidate references in the document, with the bibliography visible. A title/ID dropdown does not explain which records are being searched, why several fit, or whether a choice is actually determinable.

**Prototype:** citation.inator's development checkout shows the document and supplied bibliography, marks citation spans, and opens review controls on hover/click or keyboard. Candidates include readable references and matching reasons. The Avery example intentionally cannot be resolved from author/year alone. The Node review protocol retains uncertain source spans until separate span acceptance and keeps source/reference/style context changes stale.

**Contract questions:**

1. Editor decoration/selection APIs and source-range to editor-position mapping.
2. Revision and reference-data tokens, transaction/undo/cancel semantics.
3. Candidate data: full reference, identifiers, source/provenance, field agreements/conflicts, unknown metadata and source-span uncertainty.
4. Equivalent mouse, keyboard, touch and screen-reader paths; no automatic acceptance on hover.
5. Grouped citations, original/edition dates, inline markers/aliases and accepted-but-needing-adapter states.
6. A small shared synthetic round-trip fixture that both projects run, plus pinned candidate commit IDs and explicit acceptance results.

**Ownership/sequence:** Keep the current local prototype expendable. Deliver stable editor integration/reader polish in 0.3.0, reviewed import in 0.4.0, comprehensive developer learning/live demos in 0.5.0 and external bibliography connections in 0.6.0.
