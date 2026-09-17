import {prerenderToNodeStream} from 'react-dom/static'
import App from './App'
import {ErrorBoundary} from './components/ErrorBoundary'
import type {SiteBootstrap} from './site/bootstrap'
export {metadata,PUBLIC_ORIGIN} from './site/metadata'
export async function render(bootstrap:SiteBootstrap){
  let error:unknown
  const {prelude,postponed}=await prerenderToNodeStream(<ErrorBoundary><App bootstrap={bootstrap}/></ErrorBoundary>,{onError:e=>{error=e},signal:AbortSignal.timeout(15000)})
  let html='';for await(const chunk of prelude)html+=chunk
  if(error||postponed)throw error||new Error('Incomplete prerender')
  return html
}
