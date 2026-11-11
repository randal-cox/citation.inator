# citation.inator UX adversaries

Launch supplement, 2026-11-10. These are acceptance scenarios, not claims that testing has passed. Apply them to the actual standalone distribution as well as the development demo. Prioritize the first eight in the first usable slice; exercise the rest before sharing the distribution with adopters. Drag/resize scenarios apply only if those features ship.

| Adversary | Deliberate challenge | Required behavior / evidence |
| --- | --- | --- |
| The vanishing preview | Move slowly from the citation into its preview; cross a small gap; select text. | Content stays reachable while hovered or focused, and is dismissible. The click-open inspector persists until deliberately dismissed. Record the pointer journey, not just a screenshot. |
| The keyboard prisoner | Open with Enter, navigate forward/backward, close with Escape, reopen. | Visible focus; meaningful accessible name; focus returns to the initiating citation. Modal sheets contain focus; nonmodal desktop panes do not trap the reader. No keyboard-only dead end. |
| The thumb reader | Use a 390px viewport, touch, rotate, and open near the screen bottom. | All content and actions remain reachable; scrolling stays predictable; close is visible and usable. No hover prerequisite, off-screen controls, or accidental background activation. |
| The magnifier | Test 200% and 400% zoom and a 320 CSS-pixel-wide layout. | Text reflows without horizontal reading scroll; long identifiers wrap; the action row wraps without losing labels or close controls. |
| The hostile host stylesheet | Embed in an unrelated page with aggressive button styles, sticky navigation, clipping containers and dialogs. | Widget styles stay scoped; host styles and keyboard shortcuts survive. Correct stacking and anchoring do not require an arbitrary giant z-index. Verify the copied distribution outside the repository. |
| The impatient reader | Open A, request refresh, open B; let A finish last. Then close while loading. | A's response never populates B or reopens a closed pane. Cache updates preserve identity. Loading completion does not steal focus or unexpectedly move controls. |
| The misleading button | Supply a record with no PDF, a PubMed record without full text, and an institutional link without known entitlement. | Show only destinations supplied for the work. Label a catalog or subscription service by name and reserve full-text labels for verified destinations. |
| The disconnected scholar | Disable APIs, go offline, block enhancement scripts, and simulate a failed refresh. | Pre-rendered citations, endnotes and links remain useful. A failed refresh retains last-known-good metadata and shows its age/status honestly; offline UI never claims a new verification. |
| The exhaustive metadata record | Use 100 authors, a long title, no abstract, non-Latin names, and bidirectional text. | Readable hierarchy and bounded scrolling; author expansion is explicit and accessible; missing data is honest. No silent truncation of copied/exported citations or corrupted identifiers. |
| The screen-reader scholar | Read inline prose, open the inspector, move among actions, and close using VoiceOver. | The citation remains intelligible in its sentence; pane name and structure are clear; no duplicate reading of the entire abstract on open or noisy repeated live announcements. Record actual assistive-technology coverage and any untested gap. |
| The endnote boomerang | Cite one work in several places, include a multi-cite and narrative citation, jump to endnotes and back. | Unique stable anchors; return goes to the selected occurrence, not always the first. Document-wide author/year disambiguation agrees in prose, pane, and bibliography. |
| The reluctant animator | Enable reduced motion, forced colors or high contrast, and enlarged text. | No motion required to understand state, no color-only meaning, visible focus and boundaries. Transitions do not hide reading content. |
| The accidental dragger | Select an abstract, click a link, resize, then reopen a moved pane. | Dragging starts from noninteractive space. Text selection and links still work. Tap-to-place and arrow-key movement keep the pane within the viewport. Reopening resets it to the trigger. |
| The print-and-share reader | Print the page or save it with JavaScript unavailable. | Full readable bibliography and citations remain, without overlay chrome, clipped abstracts, or meaningless icon-only actions. |
| The skeptical deployer | Load copied assets under a restrictive host CSP; mount twice; navigate away and back; inspect network activity. | Document required host configuration honestly; no hidden CDN, telemetry, font, or hover-time provider request. Initialization is idempotent and cleanup removes listeners/observers. |
| The untrusted metadata source | Supply literal markup in titles/abstracts, dangerous URL schemes, and a deceptive destination label. | Metadata is rendered safely; external destinations are validated; visible labels accurately describe the destination. Sanitization must not erase ordinary scientific notation. |

## Evidence and triage

Use this set as the UX portion of the [milestone adversarial review](adversarial-testing.md).

For each exercised scenario record the artifact/version, browser, input method, fixture, expected outcome, observed outcome, and evidence location. Mark untested cases as untested. Automated accessibility checks supplement keyboard, touch, visual and screen-reader journeys; they do not replace them.

Maintain a small reproducible adversarial demo page with controls for delay, failure, long metadata, missing destinations, and offline cached records. Keep developer controls out of the reader-facing widget. Fix loss of content, focus, identity, or host functionality before visual polish. Retain useful failures as regression fixtures.

The delightful result is mundane to operate: a reader follows a claim to its source without losing their place, their context, or trust in what the buttons promise.
