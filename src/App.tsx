import { useEffect, useState } from 'react'
import { LandingPage } from './pages/LandingPage'
import { ProjectPage } from './pages/ProjectPage'
import { LegalPage, type LegalPageKind } from './pages/LegalPage'
import { NotFoundPage } from './pages/NotFoundPage'
import { I18nProvider, localeFromPath, type Locale } from './i18n'
import { Experience } from './components/Experience'
const LEGAL_ROUTES=new Set(['/privacy','/terms','/security','/contact'])
type AppRoute='/'|'/project'|`/${LegalPageKind}`|'/404'
function stripLocale(pathname:string){if(pathname==='/ru')return'/';if(pathname.startsWith('/ru/'))return pathname.slice(3)||'/';return pathname||'/'}
function normalizePath(pathname:string):AppRoute{const raw=stripLocale(pathname).replace(/\/+$/,'')||'/';if(raw==='/'||raw==='/project')return raw as AppRoute;if(LEGAL_ROUTES.has(raw))return raw as AppRoute;return'/404'}
function readLocation(){return{locale:localeFromPath(location.pathname),path:normalizePath(location.pathname)}}
export default function App(){const[loc,setLoc]=useState(readLocation);useEffect(()=>{const onPop=()=>setLoc(readLocation());addEventListener('popstate',onPop);return()=>removeEventListener('popstate',onPop)},[]);useEffect(()=>{document.documentElement.dataset.route=loc.path==='/'?'landing':loc.path.slice(1);document.documentElement.lang=loc.locale},[loc]);useEffect(()=>{const v=()=>document.documentElement.dataset.pageVisibility=document.hidden?'hidden':'visible';v();document.addEventListener('visibilitychange',v);return()=>document.removeEventListener('visibilitychange',v)},[]);const page=loc.path==='/404'?<NotFoundPage/>:loc.path==='/project'?<ProjectPage/>:loc.path!=='/'?<LegalPage kind={loc.path.slice(1) as LegalPageKind}/>:<LandingPage/>;return <I18nProvider locale={loc.locale as Locale}><Experience routeKey={loc.path}>{page}</Experience></I18nProvider>}
