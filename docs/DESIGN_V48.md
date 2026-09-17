# CopyPump / Premium v48

## Scope and source of truth

Preview-only redesign, forked from `bd87013f`. Main and the older v4 preview are preserved. No custody, wallet, trading, repository-visibility or ownership settings change.

The site is a product narrative, not an operational trading terminal. Public stage claims are grounded in `CopyPumpApp/CopyPump/docs/PROJECT_STATUS.md`, dated 2026-09-14. The source does not establish Mainnet readiness, completed Devnet proof, external audit, funding or returns.

## Audit findings

1. The old canvas selected v46 fantasy-rocks artwork even though the Earth/trading-room PNG was still in the repository. Responsive optimization had become an unintended artwork substitution.
2. Product Story, Decision Example, Signal Journey and Project Details repeatedly explained the same four-step process. Their names looked like different subjects while the content overlapped.
3. Home had been reduced to a headline and general principles, with no compelling interactive explanation or dated state summary.
4. The CSS graph imported a large historical `app.css` plus six additional sheets. Repeated overrides, nested reveal transforms, background treatments and global animation-pause rules made the final presentation difficult to reason about.
5. Motion effects rebuilt on unrelated global state changes; existing code retained whole-scene/pointer transformations, hidden animated layers and sustained `will-change` on content waiting to enter the viewport.
6. Four canonical full-size workflow objects total 9,724,728 bytes. Both the original source and artistic identity should be preserved, but they need not be downloaded together to display a single small object.
7. The previous footer still contained a stale Discord invite despite a corrected invitation elsewhere.

## Editorial ownership / no duplicate sections

| Route | Job | Canonical content |
| --- | --- | --- |
| `/` | Generate understanding and qualified interest | Value proposition; one interactive four-chapter product experience; short dated status preview; community/contributor calls to action |
| `/project` | Explain configuration and trust boundaries | Capital/slippage/exposure/stop controls; wallet and scoped authority; practical FAQ |
| `/progress` | Explain verified public state | Dated stage snapshot; evidence gates; engineering note; conditional next milestones; source attribution |
| Legal routes | Preserve public policies | Existing policy text, with the same new navigation and visual system |

Workflow descriptions exist once, in the Home experience. There is no second Signal Journey rail, no second Product Story, and no repeated roadmap on Home. Progress is a distinct destination rather than another marketing-feature list. Shared navigation, concise stage badges and a dated status teaser are intentional orientation, not duplicated long-form content. One bilingual `src/premium/content.ts` owns the new copy and channel URLs.

## Visual system

Near-black blue canvas, restrained mint accent, large editorial type, a consistent 1512px outer grid, 48px invisible menu hit areas, and surfaces reserved for actual interaction or status. Decorative horizontal dividers, oversized glow shadows, full-screen blur and pointer tilt are absent.

The Earth/trading-room image is bounded to the Hero with static edge gradients. It is not a fixed animated viewport canvas. Mobile receives a readable text-first composition and a full-width image with blended edges. Original V47 objects appear one at a time in the product experience. No generated substitute artwork is used.

## Motion contract

- A single one-shot reveal owner, translating at most 16px over 680ms.
- No nested CSS reveal implementation, percentage intersection thresholds, scroll-hijacking, pointer-driven loops or full-page transition.
- Completed reveal animations are cancelled and `will-change` is released.
- Menu and visibility changes cannot re-arm completed page reveals.
- One bounded 12-second transform-only object animation, only when the experience is visible; no continuous floating on mobile.
- OS reduced-motion and explicit Motion preferences leave text and controls visible.
- Menu uses a body-level portal with focus containment and inert background; it never depends on a global CSS pause rule.

## Asset provenance

`scripts/prepare-premium-assets.py` derives responsive images from `copypump-global-market-background.png` and the canonical `*-cutout-final-v47.webp` files. Output manifest records every source SHA-256, size and dimensions. Original files remain untouched. The asset-generation workflow may write only to the design branch and stages only `public/media/v48`.

## Verification

The production build and source audits run before browser tests. Playwright tests check content ownership, restored image sources, actual image decoding, the policy slider, all navigation destinations, focus, same-page dismissal, 16 deep-scroll menu cycles, reduced motion, bounded active animations and a both-language viewport matrix. Visual evidence is captured from the same build in desktop Chromium, iPhone/WebKit and Android/Chromium profiles.

Browser profiles are emulations, not physical-device or real-network performance evidence. CSS/asset byte comparisons are not FPS measurements. Owner review of the actual deployed preview remains the production gate.
