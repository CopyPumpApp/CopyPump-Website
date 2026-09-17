import { lazy, Suspense, useEffect, useState } from 'react'
import { RadarProvider } from './radar/store'
const RadarPage=lazy(()=>import('./radar/Radar'))
import { PremiumLanding, PremiumProject, PremiumProgress, PremiumShell } from './premium/Site'
import { LegalPage, type LegalPageKind } from './pages/LegalPage'
import { NotFoundPage } from './pages/NotFoundPage'
import { I18nProvider, localeFromPath } from './i18n'
import { Experience } from './components/Experience'
const LEGAL_ROUTES=new Set(['/privacy','/terms','/security','/contact'])
function readLocation(){const raw=location.pathname.replace(/^\/ru(?=\/|$)/,'').replace(/\/+$/,'')||'/';return{locale:localeFromPath(location.pathname),path:['/','/project','/progress','/radar'].includes(raw)||/^\/radar\/[a-z0-9][a-z0-9-]{0,79}$/.test(raw)||LEGAL_ROUTES.has(raw)?raw:'/404'}}
export default function App(){
  const[loc,setLoc]=useState(readLocation)
  useEffect(()=>{const onPop=()=>setLoc(readLocation());addEventListener('popstate',onPop);return()=>removeEventListener('popstate',onPop)},[])
  useEffect(()=>{
    document.documentElement.dataset.route=loc.path==='/'?'landing':loc.path.slice(1)
    document.documentElement.lang=loc.locale
    if(location.hash){const id=decodeURIComponent(location.hash.slice(1));requestAnimationFrame(()=>document.getElementById(id)?.scrollIntoView({block:'start',behavior:'auto'}))}
  },[loc.path,loc.locale])
  const page=loc.path==='/'?<PremiumLanding/>:loc.path==='/project'?<PremiumProject/>:loc.path==='/progress'?<PremiumProgress/>:(loc.path==='/radar'||loc.path.startsWith('/radar/'))?<Suspense fallback={<main id="main-content" tabIndex={-1} className="wrap" style={{minHeight:'65vh',paddingTop:80}}><p role="status">{loc.locale==='ru'?'Загружаем Radar…':'Loading Radar…'}</p></main>}><RadarPage id={loc.path.split('/')[2]}/></Suspense>:loc.path==='/404'?<NotFoundPage/>:<LegalPage kind={loc.path.slice(1) as LegalPageKind}/>
  return <I18nProvider locale={loc.locale}><RadarProvider><Experience routeKey={`${loc.locale}:${loc.path}`}><PremiumShell routeKey={`${loc.locale}:${loc.path}`}>{page}</PremiumShell></Experience></RadarProvider></I18nProvider>
}
