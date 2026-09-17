import React, {type ComponentType} from 'react'
import {createRoot,hydrateRoot} from 'react-dom/client'
import App from './App'
import {ErrorBoundary} from './components/ErrorBoundary'
import {readBootstrap} from './site/bootstrap'
import pkg from '../package.json'
import './styles/index.css'
export const SITE_RELEASE=pkg.version
const root=document.getElementById('root')!,bootstrap=readBootstrap()
document.documentElement.dataset.build=SITE_RELEASE
function mount(staticRadar?:ComponentType<{id?:string}>){
  const app=<React.StrictMode><ErrorBoundary><App bootstrap={bootstrap} staticRadar={staticRadar}/></ErrorBoundary></React.StrictMode>
  if(root.dataset.prerendered==='true'&&bootstrap){
    hydrateRoot(root,app,{onRecoverableError:(error,info)=>console.error('[CopyPump] hydration recovery',error,{path:location.pathname,componentStack:info.componentStack})})
  }else createRoot(root).render(app)
}
const initialPath=bootstrap?.path.replace(/^\/ru(?=\/|$)/,'')||'/'
if(root.dataset.prerendered==='true'&&bootstrap&&(initialPath==='/radar'||initialPath.startsWith('/radar/'))){
  // Resolve this already-rendered route before the first root commit. Otherwise
  // local saved/read state may update outside a still-dehydrated lazy boundary.
  // The complete initial HTML stays visible while this small route chunk loads.
  import('./radar/Radar').then(module=>mount(module.default)).catch(()=>{
    const note=document.createElement('p');note.className='no-script-note';note.setAttribute('role','status')
    note.textContent=bootstrap.path.startsWith('/ru')?'Не удалось загрузить управление страницей. Материал доступен для чтения. Обновите страницу, чтобы повторить попытку.':'Page controls could not load. The published material remains readable. Reload the page to retry.'
    root.after(note)
  })
}else mount()
