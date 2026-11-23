# Public bibliography audit application: initial research

Research checked 23 November 2026. This is a product direction and documentation review, not a shipped application, provider integration, competitor benchmark or addition to the 0.4.0 release gates. The existing library/importer remains the implementation foundation. No manuscript was uploaded to competitors or AI providers for this research.

## Existing products

| Product | Relevant documented scope |
| --- | --- |
| [Recite](https://reciteworks.com/faq) | Closest overlap: matches author/date citations to references and checks selected style rules, including APA, Chicago author-date and Harvard. Its FAQ explicitly describes a rules-based approach without AI/ML and paid Crossref integration. It does not verify a quotation or claim against the cited text. |
| [Edifix](https://www.edifix.com/help) | Parses references, applies editorial styles, corrects bibliographic data using PubMed/Crossref and adds identifiers; exports structured bibliographic formats. |
| [Penelope](https://www.penelope.ai/faq) | Broader manuscript-readiness checks, including citations with no reference, references not cited and referencing-system checks. |
| [scite Reference Check](https://scite.ai/blog/how-do-i-use-the-scite-reference-check) | Examines references for editorial notices and citation context, including retractions/corrections. Its existence does not imply support for every formatting/identity check. |

These are vendor documentation claims. No comparative accuracy or usability ranking is established. The category already exists; a proposed product should be evaluated against it rather than marketed as the first bibliography checker.

## Product hypothesis

A public application powered by citation.inator could make manuscript review useful independently of notation conversion. Its possible strengths are a local-first document workflow, inspectable evidence, original-preserving decisions, explicit edition/reprint handling and open-source integration with editors. Whether those differences are distinctive and valuable requires comparative trials.

Keep different findings distinct:

1. Mechanical consistency: missing or uncited references, author/year mismatches, suffixes and duplicates.
2. Bibliographic identity: DOI/ISBN identity, author/title/date disagreement, editions and review-versus-book confusion.
3. Formatting: named, versioned rules for the selected citation style, with explicit unsupported cases.
4. Scholarly interpretation: optional analysis of whether a source supports a claim, using supplied/retrievable source evidence and human judgment.

A resolved DOI does not prove a claim. Provider metadata disagreement does not prove an author error. Import/extraction uncertainty must remain separate from manuscript errors, as the BEST and public-PDF checks demonstrated. Optional LLM analysis should propose findings with evidence, not invent missing references or silently repair the manuscript.

A first public application could retain a useful no-account, no-LLM core: select a document, review findings in place and download a report/accepted changes. A structured report plus a prompt that a person takes to their existing AI chat is also a viable manual starting point for optional interpretation. No new hosted AI service is required to evaluate that workflow.

## Who pays for optional model use?

| Route | Verified documentation and constraint |
| --- | --- |
| OpenAI: ChatGPT plan usage | [Sign in with ChatGPT](https://developers.openai.com/siwc/quickstart) supports eligible users authorizing app inference against their plan. The [open-source guide](https://developers.openai.com/cookbook/articles/sign-in-with-chatgpt) expressly includes research tools and eligible Plus/Pro accounts. The [scope overview](https://developers.openai.com/siwc/token-sharing-open-source) covers open-source/local-hosted clients; paid/remotely hosted apps use the interest/partner path. This is not universal authorization for an arbitrary public SaaS. |
| Anthropic: linked billing | [Claude Platform OAuth](https://platform.claude.com/docs/en/manage-claude/oauth-apps/overview) is a beta that bills the customer's API organization. Requests marked for customer billing reject if they cannot be charged to that customer. [Eligibility](https://support.claude.com/en/articles/18467148-use-your-claude-platform-account-in-a-third-party-app) requires direct API billing and Admin/Billing authorization; consumer Pro/Max/etc. subscriptions cannot be linked. Some included/promotional credits cannot pay linked usage. Backend identity/setup is required; this is not a browser-only subscription switch. |
| Google: user API project/key | [Google AI plans](https://aistudio.google.com/docs/google-ai-plans) distinguish AI Studio subscription quota from API usage. Eligible Pro/Ultra subscribers can claim monthly Cloud credits usable by their paid API keys in external apps. An app should use the user's API project/key, not assume a general OAuth permission to spend AI Studio chat quota. |
| xAI/Grok: user API account/key | [API billing documentation](https://docs.x.ai/developers/faq/billing) describes team prepaid/invoiced usage. This research did not establish a public general-purpose app-consent/delegated subscription billing flow comparable to OpenAI/Anthropic. Consumer/shared-plan documentation alone does not establish eligibility for our app; confirm before offering it. |
| OpenRouter | [OAuth PKCE](https://openrouter.ai/docs/guides/overview/auth/oauth) explicitly supports user-controlled API keys and charges the user's OpenRouter credits. The flow supports credit-limit/expiry preferences. It uses a gateway account rather than transferring a ChatGPT/Claude subscription. |
| Puter | Its [User-Pays documentation](https://docs.puter.com/user-pays-model/) describes per-user AI allowance/overage billing through Puter accounts. This is another gateway/account relationship; billing, privacy and practical fit have not been tested for this project. |

OpenAI and OpenRouter both document protected credential storage rather than browser persistence: [OpenAI accounts/security](https://developers.openai.com/siwc/token-sharing-open-source/profiles-and-sessions), [OpenRouter OAuth](https://openrouter.ai/docs/guides/overview/auth/oauth). A static algorithmic site and the optional AI credential/runtime path can have different deployment requirements. A local companion or authenticated backend is a product choice, not an implicit dependency for the checker.

Recommended spending rule: optional inference requires an explicit user-funded route. If consent, quota or funds are unavailable, stop that inference and leave algorithmic checking usable. Never silently switch to a developer-owned billing key. Provider integration remains unimplemented; permission, retention, supported models and actual billing behavior must be verified for the selected deployment before offering it.

## Next bounded investigation

**Priority: revisit soon.** The maintainer confirmed on 23 November that building a competing product is optional. First determine whether existing products already meet the need. Free access is a potentially sufficient contribution, even without unique features, provided its usefulness and operating costs are understood.

The next pass must be a hands-on deep dive, not another documentation-only survey:

- Verify prices, free allowances, word/page/file caps, trial expiry, account requirements and export restrictions.
- Compare both citation consistency and bibliographic identity/formatting checks, including supported styles and editions.
- Measure missed errors, false alarms, time to review/correct, and preservation of intentional exceptions and source text.
- Check manuscript handling/privacy and what works without paid AI or an account.
- Decide whether to recommend an existing tool, offer a free focused checker, or build a broader application. Any of these is an acceptable result; no novelty claim is assumed.


Compare the same small, rights-cleared synthetic challenge set across our checker, Recite and Edifix: missing references, real book editions, a review DOI that resembles a book, year letters, institutional authors, intentional reprints and malformed references. Inspect false positives, missed errors, recovery effort and report transparency. Use public/synthetic material or obtain explicit consent before any unpublished manuscript leaves the local application.

Then choose the public product's support floor and one optional user-funded AI path. Keep this product decision separate from completion/adoption of the existing draft.inator integration. No implementation or new milestone assignment is implied by this note.
