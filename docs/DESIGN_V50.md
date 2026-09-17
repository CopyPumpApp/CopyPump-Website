# CopyPump v50 / Radar and cinematic refinement

Base: accepted production v49 `9a75a0b96305fe91b1370607866d195dbddc4c35`. Work stays on `feat/premium-v50-radar`; do not merge without owner acceptance of the preview.

## Scope

The revised v50 plan replaces interactive words, hidden glossary controls, changing text conditions and role selectors with CopyPump Radar. Those withdrawn interactions are NOT implemented. Existing capital-limit illustration remains explicit, local and separate from the editorial data. No wallet connection, signing, order submission, paid provider, external subscription, rewards or CP tasks are added.

Home retains its narrative and shared Earth/trading-room scene. One open editorial teaser follows the product experience. Radar has permanent EN/RU routes, an archive, locally saved observations, revision history and sources. Product and Progress retain their distinct editorial ownership.

## First edition and provenance

A bounded read-only GitHub Actions job (`35174119134`) called the official Solana Mainnet RPC. It collected 12 finalized signatures referencing the Token Program, then selected the first failed transaction, first successful transaction and first remaining entry, without selecting for prices or identity. Three transaction responses and a subsequent status lookup were captured on 2026-09-17 at 02:21:57–02:22:24 UTC. All three events have blockTime 02:21:46 UTC / slot 447680207.

Original responses and their SHA-256 hashes are preserved in `public/radar/evidence`. `radar-audit.mjs` asserts the raw numeric claims, selected signatures, outcome/fee fields, unchanged balance counts and the additional reconciliation before a build passes. Solana Explorer links are provided for independent inspection; they are not represented as a second source that was independently queried. The official RPC is the source of the snapshot.

Edition 01 contains:
- Finalized-but-failed execution, 5,001-lamport fee, with nonce/account-data caveats.
- Successful execution without changes to the ten reported token amounts; no claim about all possible account-data changes.
- A 5.384061455 SOL gross transfer viewed in the context of wrapping, closure and net balances.

The last record includes an editorial reconciliation addendum prepared **within the first edition**. It is not fabricated as a new event occurring on a later day or as a previously public story. Its SOL delta is not called PnL or a loss. No wallet owner is identified, and these are NOT CopyPump transactions or readiness evidence.

## Retention behavior

Only saved IDs and read versions are stored under `copypump.radar.v1`. A meaningful version increase relative to a previously read version generates an update indicator. A recheck timestamp alone never does. Home/index visits and the Save button do not consume unread updates. A detail version is marked read by an explicit button or after its end is visible for 1.4 seconds in an active tab. Cross-tab storage events synchronize the selection. Unavailable/corrupt storage produces an explicit session-only notice; no user selections are sent to a server.

The browser loads the small index once per session or manual refresh; detailed observations are requested only on their pages. A failed refresh keeps the last loaded edition and reports failure, never "no activity". Empty, invalid, missing and mismatched data have explicit states. Radar code/CSS is lazy-loaded. The index and article data are validated before rendering; no raw HTML is injected.

## Motion refinement

Original scene and header persist. Page entry is eased over 360ms; chapter text over 440ms. Selected artwork is decoded first; at most one outgoing visual overlaps the new object, then it is removed after 460ms. Rapid changes replace transitions instead of queuing. Motion off removes the outgoing visual immediately. Heading copy and accent cadence are refined; the existing lightweight static-gradient crossfade is retained, rather than restoring animated full-text background-position. Asynchronously loaded headings are discovered by the same reveal/gradient owner without rearming previously shown page elements.

## Editorial operations (not a scheduled service)

This implements an initial editorial edition and its publishing contract, NOT an automatic market monitor or a completed seven-day pilot. There is no timer, daily cron, external provider key, autonomous publishing or email notification. A regular cadence and useful future follow-ups still require source review and publication. No retention lift has been measured.

For each new material, supply real primary evidence, current event/check/revision dates, EN/RU text, limits and chronological revisions. Increment version only for a substantive addition or correction. Do not silently remove corrections, equate RPC failure with inactivity, or promote wallet activity as advice. Run the data audit and browser suite before review. The owner-approved publication process remains separate from the collection job.

## Verification boundaries

Local TypeScript, source/data audits and production build are run. Local browser navigation is unavailable in this execution environment (administrator policy); visual and browser validation must use the repository CI and downloaded same-build evidence. Browser profiles are emulations, not physical iPhone FPS measurements. A headless walkthrough is not the full extended device soak.

Production v49 must be unchanged throughout this preview review. No redesign of the approved background, ownership, custody, repository visibility or deployment settings is authorized by this work.
