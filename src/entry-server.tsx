import {renderToString} from 'react-dom/server'
import App from './App'
import StaticRadar from './radar/Radar'
import {ErrorBoundary} from './components/ErrorBoundary'
import type {SiteBootstrap} from './site/bootstrap'
export {metadata,PUBLIC_ORIGIN} from './site/metadata'
/** All data and the static route component are resolved before this synchronous render. */
export async function render(bootstrap:SiteBootstrap){
  const html=renderToString(<ErrorBoundary><App bootstrap={bootstrap} staticRadar={StaticRadar}/></ErrorBoundary>)
  // Do not ship a suspended fallback or executable inline reveal bridge under the strict CSP.
  if(/<!--\$[?!]-->|<div hidden|<script(?![^>]*type="application\/json")/.test(html))throw new Error('Prerender contains deferred executable segments: '+bootstrap.path)
  return html
}
