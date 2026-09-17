# V52 static rendering correction

The first public-preview HTTP checks passed while the actual direct Radar route remained hidden. The React static stream emitted a hidden Suspense segment and executable inline instructions to move it into place. The site's strict script-src policy correctly refused those inline instructions. Finding the text in HTML alone did not prove it was readable.

The static build now injects an already-resolved Radar component and uses synchronous renderToString with fully supplied local data. No component is allowed to suspend in that build: fallback markers, hidden streaming segments and inline executable scripts fail the build audit. The browser retains its lazy Radar chunk and hydrates complete Suspense boundaries. This is not renderToStaticMarkup and does not abandon hydration.

The CSP was not weakened. Source-backed text, buttons and the article history are in their final visible document location before JavaScript. Existing no-JS reading and browser-interaction tests are retained. The actual deployment verifier captures console/page errors and a failure screenshot before reporting failure.

The first review also confirms denser desktop content and the new evidence section. All final readiness claims require a successful new exact-head browser and deployment run; the earlier HTTP-only success is not sufficient.

Primary API references: https://react.dev/reference/react-dom/server/renderToString and https://react.dev/reference/react-dom/client/hydrateRoot. SSR imports are restricted to the build entry; the browser bundle does not include react-dom/server.
