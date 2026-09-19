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

Full regression result is recorded in the pull request after the run completes. Production publication still requires merging the pull request through the repository's normal process.
