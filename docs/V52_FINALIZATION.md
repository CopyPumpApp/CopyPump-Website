# V52 continuation: honest first-interaction readiness

Base for this continuation: `768254928459c46390b0b987f5cfc395d7295f61`. The content-rich v52 and prerender implementation are retained, not restarted.

## Real deployed-preview failure

Full browser CI passed at this base, but deployed-preview verification run 35288759515 failed in desktop Chromium: a Save click followed immediately by reload lost the selection. Initial complete HTML made the save control visible before the route module attached its handler. This is not fixed by sleeping in the test or hiding the initial document.

Radar now renders its imperative controls disabled until hydration and local-state restoration have completed. A storage error still completes readiness with an explicit session-only state; a previously saved selection is restored before the control enables. Reading, citations and ordinary links remain usable while scripts load. Read-version marking also waits for local readiness. The static menu, language/motion controls and product selectors follow the same principle; their enabled state appears after hydration, without delaying content.

Regression tests hold the initial Radar chunk, verify that published text is visible and controls are disabled, release the chunk, immediately perform the first enabled Save, reload, and check persistence. They cover EN/RU index and direct article routes. No forced clicks, artificial success mocks or fixed post-click sleeps are used. Separate no-JavaScript coverage confirms readable linked materials and honest disabled controls. Existing saved-state and actual-preview tests are retained.

## Contact verification

Actual-preview evidence from that same run checked both Discord invite codes used by site/public README. Both WS95eXrGB and DNBQtqw6R returned HTTP 200 and resolved to guild 1546942786194907268 (Сервер CopyPump). Different strings were not evidence of an invalid destination. No invite was replaced, no server was joined, and no account/message action was taken. The website continues to use its canonical single contact link.

## Scope and remaining release gates

No changes to the approved artwork, swipe physics, headline styling, factual Radar records, public product stage or production branch. Main remains v51.1. Source/checkpoint export is allowlisted, read-only and on an isolated unscheduled ops branch.

Local TypeScript, source/data checks, compilation and 26-document prerender passed after these changes. Remote browser and exact-deployment results must be recorded only after completion. Physical phone acceptance, field performance metrics, extended device soak and owner visual approval remain separate from CI. No generated private-product screenshot or trading-readiness claim substitutes for missing evidence.
