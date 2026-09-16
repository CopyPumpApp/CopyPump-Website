import { useEffect, useRef, useState } from 'react'
import { MotionToggle } from './Experience'
import { Brand } from './Brand'
import { useI18n } from '../i18n'
import { navigateLocal, smoothScrollToId } from '../lib/motion'

export function Header({simple=false}:{simple?:boolean}){
  const {dict,locale,setLocale}=useI18n(), c=dict.studio.nav
  const [open,setOpen]=useState(false)
  const trigger=useRef<HTMLButtonElement>(null)
  useEffect(()=>{
    document.documentElement.classList.toggle('nav-open',open)
    if(!open) trigger.current?.focus()
    const onKey=(event:KeyboardEvent)=>{if(event.key==='Escape')setOpen(false)}
    if(open) window.addEventListener('keydown',onKey)
    return()=>{document.documentElement.classList.remove('nav-open');window.removeEventListener('keydown',onKey)}
  },[open])
  const homeLinks=[['why-copypump',c.product],['authority',c.controls],['journal',c.progress]]
  const projectLabel=locale==='ru'?'О проекте':'Project'
  const go=(id:string)=>{setOpen(false);if(simple){navigateLocal('/');setTimeout(()=>smoothScrollToId(id),60)}else smoothScrollToId(id)}
  const project=()=>{setOpen(false);navigateLocal('/project')}
  return <header className="site-header"><a className="skip-link" href="#main-content">{dict.common.skip}</a><div className="site-header__inner"><Brand compact/><nav className="desktop-nav" aria-label={dict.header.navLabel}>{!simple&&homeLinks.map(([id,label])=><button key={id} onClick={()=>go(id)}>{label}</button>)}<button onClick={project}>{projectLabel}</button>{simple&&<button onClick={()=>navigateLocal('/')}>{locale==='ru'?'Главная':'Home'}</button>}</nav><div className="header-actions"><MotionToggle/><div className="locale-switch" role="group" aria-label={dict.common.language}><button className={locale==='en'?'active':''} onClick={()=>setLocale('en')}>EN</button><span>/</span><button className={locale==='ru'?'active':''} onClick={()=>setLocale('ru')}>RU</button></div><button ref={trigger} className="menu-button" aria-expanded={open} aria-controls="mobile-navigation" aria-label={c.menu} onClick={()=>setOpen(true)}><span/><span/></button></div></div>{open&&<div id="mobile-navigation" className="mobile-nav" role="dialog" aria-modal="true" aria-label={dict.header.navLabel}><button className="mobile-nav__backdrop" aria-label={c.close} onClick={()=>setOpen(false)}/><div className="mobile-nav__panel"><div className="mobile-nav__ambient" aria-hidden="true"/><div className="mobile-nav__top"><Brand/><button className="icon-button" aria-label={c.close} onClick={()=>setOpen(false)}><span/><span/></button></div><div className="mobile-nav__body"><p className="mobile-nav__eyebrow">{locale==='ru'?'НАВИГАЦИЯ':'NAVIGATION'}</p><nav>{!simple&&homeLinks.map(([id,label])=><button key={id} onClick={()=>go(id)}><strong>{label}</strong></button>)}<button onClick={project}><strong>{projectLabel}</strong></button>{simple&&<button onClick={()=>{setOpen(false);navigateLocal('/')}}><strong>{locale==='ru'?'Главная':'Home'}</strong></button>}</nav></div><div className="mobile-nav__footer"><div className="locale-switch" role="group" aria-label={dict.common.language}><button className={locale==='en'?'active':''} onClick={()=>setLocale('en')}>EN</button><span>/</span><button className={locale==='ru'?'active':''} onClick={()=>setLocale('ru')}>RU</button></div><MotionToggle/></div></div></div>}</header>
}
