# CopyPump v52 — content and publication candidate

Base: production v51.1 d5f61ce700ac9ce3f0c4a2d9bb051a2b4e16db35. Preview branch: feat/v52-publication-ready. Production remains unchanged until visual acceptance. No new wallet, trade, account, reward, tracking or subscription functionality.

## Content and layout

Six editorial scenes: product introduction, existing four-stage illustration with concrete explanations, system/user responsibilities, public evidence and the dated development stage, Radar with three first-edition cases, and specific ways to contribute. Product adds four architectural layers and an explicit AI authority boundary before the existing policy/authority/FAQ tabs. Available public tools do not certify an on-chain lifecycle.

Automatic wallet discovery remains system-owned; users do not manually select wallets to copy. Product claims describe a technical-alpha architecture, not guaranteed profitability or Mainnet functionality. The status source remains dated 2026-09-14; reviewing it on September 18 is not a new milestone. Original Radar evidence and dates are unchanged.

Approved art, theme changes, word gradients, transparent header, stable object-sweep keys, isolated native swipe and unique Contact links are retained. Mobile and wide-screen density are addressed separately. No verified current private-product screenshot was available in the reviewed public evidence, so no synthetic terminal/result is substituted.

## Static publishing

React prerenders at build time using installed React/Vite; no new package or production runtime server is introduced. Main pages and reviewed Radar observations have complete initial HTML and EN/RU metadata. The same components hydrate the HTML. Preferences/saves restore after hydration; deterministic UTC text avoids locale formatting mismatches. Initially visible server-rendered content does not become invisible when motion boots.

Bootstrap data is validated. A failed index refresh keeps the last verified edition with an error message. Unbootstrapped article navigation still exercises JSON loading and failure handling. Tests distinguish retained prerendered content from network success.

The build emits 26 documents: 22 indexable routes and four localized generic/Radar 404s. Canonical and hreflang use the production origin. Preview defaults to noindex; only main or explicit COPYPUMP_BUILD_TARGET=production enables indexing. Cloudflare assets use extensionless paths and 404-page routing. Generated headers provide a site-local CSP, no embedding, no MIME sniffing, a bounded referrer policy and restricted permissions. Inline React styles remain allowed; executable inline scripts do not. No private data enters bootstrap JSON.

publication-manifest.json records route hashes and response policy. The local static preview mirrors the built contract, but real Cloudflare HTTP responses require a separate check. Files on disk do not prove deployed headers.

## Source register

Reviewed 2026-09-18:
- CopyPumpApp/CopyPump/docs/PROJECT_STATUS.md: technical alpha, Devnet target, Mainnet locked; source dated September 14.
- docs/ARCHITECTURE.md: intended product layers, AI/signing limits.
- tools/README.md: runnable public validator and explicit non-proof limitations.
- README.md: contributor paths and public collaboration scope.

Implementation sources:
- https://react.dev/reference/react-dom/static/prerenderToNodeStream
- https://react.dev/reference/react-dom/client/hydrateRoot
- https://vite.dev/guide/ssr
- https://developers.cloudflare.com/workers/static-assets/headers/
- https://developers.cloudflare.com/workers/static-assets/routing/static-site-generation/
- https://developers.cloudflare.com/changelog/post/2025-06-10-default-env-vars/

## Verification and open gates

Local TypeScript, source/data audits, compilation and prerender checks pass. Local browser navigation is administrator-blocked and was not bypassed. Browser validation uses repository CI, then same-commit artifacts and real preview verification. New coverage includes initial HTML, no-JS reading, hydration, retained data after failed refresh, content ownership, responsive layouts and source/header assertions. The header occlusion test now places the new Hero context paragraph behind the logo instead of the removed decorative footer line; its pixel assertion is unchanged.

Approved website invite WS95eXrGB remains. The product README has another invite; confirm destinations before claiming cross-project consistency. No external repository documentation is silently overwritten.

Remaining release gates: owner visual approval, physical iPhone/Android and sustained-device motion checks, confirmed contact destinations, accepted-commit publication and rollback. No field Core Web Vitals, retention lift, universal FPS or completed seven-day Radar pilot is claimed. Announcement drafts are not posted automatically.
