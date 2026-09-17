# CopyPump v49 / implementation record

Isolated preview from v48 commit bba85ac2. Main and the v48 branch are preserved. Content architecture, source-dated public state (2026-09-14), EN/RU, official channels and legal text remain unchanged.

## Shared scene, not a content image

SceneBackdrop is mounted once in PremiumShell, outside moving page content and the body-level menu portal. The same Earth/trading-room source supplies desktop and mobile; all original assets and their provenance manifest are unchanged. There is no hero-art image block. Header DOM identity also persists across routes. Section lighting uses IntersectionObserver and a small set of opacity-only layers, not per-frame scroll state. Observer margins use viewport-height-derived pixels, rebuilt on resize, rather than width-relative percentages. Mobile uses a fixed large-viewport-height canvas to avoid resizing the crop with every browser chrome movement. Actual Safari/address-bar behavior still needs physical-device acceptance.

## Open composition

Removed enclosing backgrounds from the experience stage, status record, product panel, controls list, FAQ, progress stage, engineering note, community and footer. A compact translucent surface is retained only around the actual capital-limit input. Removed the repeated community CP monogram and live-like status orb. Important descriptions and status values have been increased rather than styled as tiny decoration. The header scrim was strengthened after screenshot review exposed scrolled text behind the brand.

## Motion

Semantic headings expose one accessible text copy. A stationary mask contains a moving inner span; one controller owns each reveal. Heading, depth and record profiles use bounded opacity/transform animations. Completed animations cancel fill effects and release will-change. One visible accent may animate color; mobile uses one finite sweep. After short timing samples exposed first-run WebKit stalls, moving text-background gradients were replaced with an opacity crossfade of two static, aligned gradient text layers. The extra visual layer is aria-hidden. See GRADIENT_V49.md for the change and its limitations.

No pointer tilt, full-screen blur, simulated trading tape or scroll hijacking. Menu has closed/opening/open/closing states, reversible CSS transitions, a 260ms bounded exit, cleanup timers, focus containment and background inert state. The shared scene remains visible while page content is dimmed. Animation preferences are distinct from modal pause so menu opening never freezes its own entrance. Reduced Motion/Motion off show readable states immediately.

## Evidence / limitations

Source audits and TypeScript/build are checked locally. Browser regression results and screenshots/videos must be recorded from the exact candidate commit before any success claim. The cinematic suite adds persistent-DOM assertions, transparent-surface assertions, 20 interrupted menu cycles, mask/gradient fallbacks, a recorded walkthrough, and warm motion-on/off rAF diagnostics. Separate tests cover height-based lighting after resize and accessible text/opacity-only gradient keyframes.

The timing test uses 3 x 6-second headless samples per mode. It is a short diagnostic, NOT the full 3 x 3-minute release soak, a GPU trace, physical iPhone FPS or proof that every device is smooth. The normal browser suite runs concurrently and its timing samples are not isolated lab benchmarks. Physical iPhone/Safari and in-app browser acceptance, extended soak and owner visual approval remain release gates. No production merge is authorized by a green CI result alone.
