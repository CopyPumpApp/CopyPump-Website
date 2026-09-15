import { useEffect, useState } from 'react'
import { LandingPage } from './pages/LandingPage'
import { LegalPage, type LegalPageKind } from './pages/LegalPage'
import { NotFoundPage } from './pages/NotFoundPage'
import { I18nProvider, localeFromPath, type Locale } from './i18n'
import { Experience } from './components/Experience'

const LEGAL_ROUTES = new Set(['/privacy','/terms','/security','/contact'])
type AppRoute = '/' | `/${LegalPageKind}` | '/404'

function stripLocale(pathname: string) {
  if (pathname === '/ru') return '/'
  if (pathname.startsWith('/ru/')) return pathname.slice(3) || '/'
  return pathname || '/'
}
function normalizePath(pathname: string): AppRoute {
  const raw=stripLocale(pathname).replace(/\/+$/, '') || '/'
  if(raw==='/') return '/'
  if(LEGAL_ROUTES.has(raw)) return raw as AppRoute
  return '/404'
}
function readLocation(){return{locale:localeFromPath(window.location.pathname),path:normalizePath(window.location.pathname)}}

export default function App(){
  const [location,setLocation]=useState(readLocation)
  useEffect(()=>{const onPop=()=>setLocation(readLocation());window.addEventListener('popstate',onPop);return()=>window.removeEventListener('popstate',onPop)},[])
  useEffect(()=>{document.documentElement.dataset.route=location.path==='/'?'landing':location.path.slice(1);document.documentElement.lang=location.locale},[location])
  useEffect(()=>{const onVisibility=()=>{document.documentElement.dataset.pageVisibility=document.hidden?'hidden':'visible'};onVisibility();document.addEventListener('visibilitychange',onVisibility);return()=>document.removeEventListener('visibilitychange',onVisibility)},[])

  return <I18nProvider locale={location.locale as Locale}><Experience routeKey={location.path}>{location.path==='/404'?<NotFoundPage/>:location.path!=='/'?<LegalPage kind={location.path.slice(1) as LegalPageKind}/>:<LandingPage/>}</Experience></I18nProvider>
}
