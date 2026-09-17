import React from 'react'
import {createRoot,hydrateRoot} from 'react-dom/client'
import App from './App'
import {ErrorBoundary} from './components/ErrorBoundary'
import {readBootstrap} from './site/bootstrap'
import pkg from '../package.json'
import './styles/index.css'
export const SITE_RELEASE=pkg.version
const root=document.getElementById('root')!,bootstrap=readBootstrap()
document.documentElement.dataset.build=SITE_RELEASE
const app=<React.StrictMode><ErrorBoundary><App bootstrap={bootstrap}/></ErrorBoundary></React.StrictMode>
if(root.dataset.prerendered==='true'&&bootstrap){
  hydrateRoot(root,app,{onRecoverableError:error=>console.error('[CopyPump] hydration recovery',error)})
}else createRoot(root).render(app)
