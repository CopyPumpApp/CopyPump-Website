# CopyPump v51 / cinematic motion implementation

Preview branch only, based on v50 f13d3fb33. Production v49, main and PR38 are preserved. Radar records, source hashes, local-save semantics and factual project stage remain unchanged.

## Scope

- Transparent header surface with a feathered reading canopy rather than an opaque black rectangle or bottom divider. The canopy is slightly stronger after scrolling. Menu controls remain invisible 48px hit areas.
- Semantic headings have one accessible text copy; noninteractive visual words reveal with staggered masks. Static rich-gradient layers crossfade in sequence across words. No animated gradient-background-position or continuously blurred text.
- Heading entrances 1120ms, depth 1250ms, record/body 880–960ms; route entrances 760ms with bounded coordination with the menu. Existing read text is not hidden repeatedly while scrolling.
- Directional object replacement: incoming canonical artwork pushes past the outgoing artwork, with limited rotation, slight scale and a narrow light sweep. Forward/back follows selected chapter order. Overlap is capped at two objects and ends after 1160ms. Requests do not accumulate a ghost queue.
- Removed Home's mock signal-record table, numbered technical object label and repeated uppercase instruction heading. Retained the real local capital-limit illustration, a readable disclosure, honest dated status and Radar teaser.
- Brand glyphs appear in official platform links and text references, including menu, footer, partner/contributor actions and Contact. X/GitHub/Discord paths come from repository service-logos, with their original shapes and aspect ratios; email uses an envelope symbol. Icons are decorative alongside accessible text.

## Per-destination backgrounds

Seven distinct, same-family background compositions: Home, Product, Radar, Progress, Community, Security and Contact. These are derivatives of the owner's existing Earth/trading-room PNG, existing canonical objects and quiet decorative geometry. They are not seven newly generated original environments, and no extra native resolution is claimed.

The recipe keeps 1672 x 941 source resolution, applies modest contrast/color adjustments once offline, and records source/output hashes. Original files are untouched. Each destination is decoded on demand; the old scene is retained on failure. Hover previews debounce to avoid downloading a whole library on pointer fly-through; touch still navigates on the first tap. One outgoing background may overlap briefly, then is removed. Background/header DOM identities persist.

## Motion safety and verification

No pointer tilt, scroll hijacking, full-screen blur, WebGL, fake live market display, interactive-word glossary, CP rewards, wallet connection, signing or paid provider was added. Native CSS/Web Animations remain sufficient for these bounded sequences; no new animation framework dependency was necessary. Reduced Motion and Motion off retain all readable controls and functional Radar.

Local TypeScript, public/data/UI audits and production build passed before the integration commit. Local browser navigation is blocked by administrator policy, so actual browser rendering and videos are validated through authorized repository CI, not a local-policy workaround. Browser profiles are emulations, not physical-iPhone FPS guarantees.

The existing tests are updated only where intended UI contracts changed (new scene paths, multiple visual word layers, deliberate longer settling times, the expanded bounded animation count). New v51 tests additionally assert opacity-only color keyframes, one accessible heading, real directional object keyframes, no technical mock table, transparent computed header styles, matching brand glyphs and all destination backgrounds. Same-commit visual review is required before a success claim; production still needs owner acceptance.
