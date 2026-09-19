# Premium scroll and product scenes

Base: `145c520` on `CopyPumpApp/CopyPump-Website/main` (v52). The older local RC_v44 copy was not edited.

## Audit before changes

- Reviewed all eight screenshots attached to the referenced conversation, then compared the current GitHub implementation at desktop and mobile sizes.
- Images in `/media/v48` returned successfully and had nonzero intrinsic dimensions. The persistent background was below the site frame; there was no reproduced 404 or permanently occluding background layer. The precise disappearance shown in the reference could not be reproduced consistently.
- The reveal controller hid elements with an inline `opacity:0` before observation, observed the moving text inside overflow masks, and permanently unobserved each entered element. This made content dependent on a successful first observer/animation handoff and prevented replay. The artwork inherited that same hide gate.
- Consecutive desktop sections each contributed 80px of padding: 160px total. The product map reused a column gap of up to 100px for its CTA row. The expanded Radar alignment also lost to a later base stylesheet rule.
- Product chapters only changed through manual selection. There was no auto-cycle timer. Menu numbers were real `small` nodes, rather than part of the labels.

## Changes

- Observe stationary word masks and keep observers connected. Re-arm after complete exit with a 32px margin. Animate masks, opacity and translation with bounded stagger; settle cancellation through the current animation owner. Readable content is the fallback, including delayed observation and disabled motion.
- Keep the artwork surface visible independently of reveal animations. Retain the existing responsive assets, decode-before-swap behavior, current image on failed download, and bounded outgoing image transition. Use an explicit local artwork stacking context; do not change the background assets or background filters.
- Cycle four product scenes and their matching copy every 7.2 seconds while visible. Manual tabs, arrows, swipe and keyboard controls restart the timer. Hover does not pause it. A local pause button is available; global pause, reduced motion, an open menu and a hidden page stop cycling. Active dragging/slider presses defer a swap; completed interaction does not disable cycling.
- Share one grid row across accessible/current and inert/hidden chapter panels so automatic transitions do not change section height. Keep the original capital-limit illustration and disclosures.
- Reduce desktop section padding to 36–52px, mobile to 26px; reduce the hero's unused height, give the map CTA a 24px row gap, correct Radar alignment, and tighten mobile list gaps. Slightly strengthen body/secondary text colors. No decorative grids, dividers, new dependencies, new images, copy claims or readiness changes.
- Remove the seven menu index nodes and their unused styles. Preserve routes, localization, focus containment and existing brand assets.

## Verification

- `npm run check`: TypeScript, public-content audit, UI audit and production build pass.
- `npm audit --omit=dev --audit-level=high`: zero production dependency vulnerabilities. The pre-existing development dependency audit is outside this visual change.
- New browser coverage exercises downward/upward replay, all four timed scenes and wrap, manual controls followed by auto-resume, hover behavior, pause/resume, reduced motion, failures/races in image decoding, menu interruptions, stable section geometry, compact spacing and overflow.
- Real-time desktop Chromium cycle: four scene transitions with identical section height (933.78px); measured CLS 0, no failed requests/page errors, no stranded invisible reveal nodes. Local headless measurement, not a field Core Web Vitals claim.
- iPhone WebKit emulation: four timed changes with identical section height (1177px), working controls, no failed requests/page errors or horizontal overflow. WebKit geometry checks are used instead of claiming unsupported Layout Instability API metrics.
- EN/RU layout matrix: 320, 390, 768, 1024, 1440 and 1920px, with no positive horizontal overflow.
- Visually reviewed Home, product artwork, limit illustration, control, pipeline, Radar, status, product map, community and menu. Desktop RU Home at 1440×900 decreased from 6777px to 6079px while retaining its content. The chapter row reserves the tallest scene to avoid automatic layout jumps.

Local full suite (4 workers): 256 passed, 8 skipped, 2 flaky, 1 failed. The failure was the existing 20-interruption navigation stress test in WebKit; retry passes were that test on Chromium and a frame-sampling test on WebKit. A single-worker rerun of all new scenarios plus both timing-sensitive tests passed 27/27 without changing legacy tests.

The final menu/reveal ordering change was checked with all new scenarios and existing navigation/reduced-motion regressions: 39/39 passed (2 workers). GitHub CI status is recorded on the PR. The initial full local run was not entirely green.

Production publication still requires merging the pull request through the normal repository process.

## Banner wordmark refinement

The supplied banner uses equally bold white `Copy` and saturated mint `Pump`. The old shared `Mark` used system typography with weights 650/400 and no separate color, explaining the mismatch. Header, full-screen menu and footer all render this shared component; the unused legacy `components/Brand.tsx` is outside the active route graph.

- Use self-hosted Manrope ExtraBold (800), scoped to the wordmark: 24px desktop / 22px mobile, with tight tracking. `Copy` is white; `Pump` is `#02e9a9`, sampled from the banner. Keep the established official emblem and align it with the type as one link.
- The WOFF2 subset contains only `CopyPump` characters and weighs 1,360 bytes. It is preloaded locally, carries its OFL license/provenance, and makes no external font request. Body typography and site artwork stay unchanged.
- Reserve the wordmark's width and line height, including room for the fallback, so late font arrival cannot move the logo container or header controls. The home link retains its localized accessible name.
- Production checks pass. Existing header, navigation, scene-failure and reduced-motion regressions pass 12/12 across desktop Chromium, Android Chromium and iPhone WebKit.
- Final brand review covers 16 engine/locale/width combinations (Chromium: EN/RU at 320, 390, 768, 1024, 1440, 1920px; WebKit: EN/RU at 320, 390px), with no horizontal overflow, clipped wordmark or overlapping controls. Header, menu and footer were visually inspected on desktop and mobile.
- Artificially delayed font loading at 320/1440px preserves the exact brand and action-container rectangles. Tiny internal glyph swaps produce measured CLS 0.0000504 / 0.0000089 respectively. A blocked font remains readable within its reserved space; the menu's home link still works. These are local measurements, not field Web Vitals claims.
