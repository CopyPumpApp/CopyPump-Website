import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { MotionToggle } from './Experience'
import { Brand } from './Brand'
import { useI18n } from '../i18n'
import { navigateLocal, smoothScrollToId } from '../lib/motion'

export function Header({simple=false}:{simple?:boolean}){
  const {dict,locale,setLocale}=useI18n(),c=dict.studio.nav
  const [open,setOpen]=useState(false)
  const trigger=useRef<HTMLButtonElement>(null)
  const lockedScrollY=useRef(0)
  const close=()=>setOpen(false)
  const toggle=()=>setOpen(current=>{if(!current)lockedScrollY.current=window.scrollY;return!current})
  const ru=locale==='ru'
  const detailLinks=[
    {label:ru?'Главная':'Home',path:'/'},
    {label:ru?'Как работает':'How it works',path:'/project',id:'product-story'},
    {label:ru?'Контроль и безопасность':'Controls & safety',path:'/project',id:'learn-more'},
    {label:ru?'Демо решения':'Decision demo',path:'/project',id:'decision-demo'},
    {label:ru?'Путь сигнала':'Signal journey',path:'/project',id:'journey'},
    {label:ru?'Прогресс':'Progress',path:'/project',id:'journal'},
    {label:ru?'Roadmap':'Roadmap',path:'/project',id:'roadmap'},
    {label:ru?'Вопросы':'FAQ',path:'/project',id:'questions'},
  ]
  const go=(path:string,id?:string)=>{close();navigateLocal(path);if(id)window.setTimeout(()=>smoothScrollToId(id),100)}

  useLayoutEffect(()=>{
    if(!open)return
    const root=document.documentElement,body=document.body,targetY=lockedScrollY.current
    const previous={rootOverflow:root.style.overflow,rootOverscroll:root.style.overscrollBehavior,bodyOverflow:body.style.overflow}
    const onKey=(event:KeyboardEvent)=>{if(event.key==='Escape')close()}
    root.classList.add('nav-open');root.style.overflow='hidden';root.style.overscrollBehavior='none';body.style.overflow='hidden'
    window.addEventListener('keydown',onKey)
    return()=>{
      window.removeEventListener('keydown',onKey);root.classList.remove('nav-open');root.style.overflow=previous.rootOverflow;root.style.overscrollBehavior=previous.rootOverscroll;body.style.overflow=previous.bodyOverflow
      if(Math.abs(window.scrollY-targetY)>2)window.scrollTo({top:targetY,left:0,behavior:'auto'})
    }
  },[open])

  useEffect(()=>{
    const root=document.documentElement
    const onPageShow=(event:PageTransitionEvent)=>{if(event.persisted)close()}
    const onVisibility=()=>{if(document.visibilityState==='visible'&&!document.getElementById('mobile-navigation'))root.classList.remove('nav-open')}
    window.addEventListener('pageshow',onPageShow);document.addEventListener('visibilitychange',onVisibility)
    if(!open)requestAnimationFrame(()=>trigger.current?.focus({preventScroll:true}))
    return()=>{window.removeEventListener('pageshow',onPageShow);document.removeEventListener('visibilitychange',onVisibility)}
  },[open])

  const desktopLinks:Array<[string,string,string?]>=simple?[[ru?'Главная':'Home','/'],[ru?'Прогресс':'Progress','/project','journal']]:[[c.product,'/','why-copypump'],[ru?'О проекте':'Project','/project'],[c.progress,'/project','journal']]
  const overlay=open&&typeof document!=='undefined'?createPortal(<div id="mobile-navigation" className="mobile-nav is-open" role="dialog" aria-modal="true" aria-label={dict.header.navLabel}><button type="button" className="mobile-nav__backdrop" aria-label={c.close} onClick={close}/><div className="mobile-nav__panel"><div className="mobile-nav__ambient" aria-hidden="true"/><div className="mobile-nav__top"><Brand/><button type="button" className="icon-button is-open" aria-label={c.close} onClick={close}><span/><span/></button></div><div className="mobile-nav__body"><p className="mobile-nav__eyebrow">{ru?'РАЗДЕЛЫ':'SECTIONS'}</p><nav>{detailLinks.map(item=><button type="button" key={`${item.path}-${item.id||'top'}`} onClick={()=>go(item.path,item.id)}><strong>{item.label}</strong></button>)}</nav></div><div className="mobile-nav__footer"><div className="locale-switch" role="group" aria-label={dict.common.language}><button type="button" className={locale==='en'?'active':''} onClick={()=>setLocale('en')}>EN</button><span>/</span><button type="button" className={locale==='ru'?'active':''} onClick={()=>setLocale('ru')}>RU</button></div><div className="mobile-nav__external"><a href="https://github.com/CopyPumpApp/CopyPump" target="_blank" rel="noopener noreferrer">GitHub</a><a href="https://discord.gg/WS95eXrGB" target="_blank" rel="noopener noreferrer">Discord</a><a href="https://x.com/CopyPumpAI" target="_blank" rel="noopener noreferrer">X</a></div><MotionToggle/></div></div></div>,document.body):null
  return <><header className="site-header"><a className="skip-link" href="#main-content">{dict.common.skip}</a><div className="site-header__inner"><Brand compact/><nav className="desktop-nav" aria-label={dict.header.navLabel}>{desktopLinks.map(([label,path,id])=><button type="button" key={`${path}-${id||'top'}`} onClick={()=>go(path,id)}>{label}</button>)}</nav><div className="header-actions"><MotionToggle/><div className="locale-switch" role="group" aria-label={dict.common.language}><button type="button" className={locale==='en'?'active':''} onClick={()=>setLocale('en')}>EN</button><span>/</span><button type="button" className={locale==='ru'?'active':''} onClick={()=>setLocale('ru')}>RU</button></div><button type="button" ref={trigger} className={`menu-button ${open?'is-open':''}`} aria-expanded={open} aria-haspopup="dialog" aria-controls="mobile-navigation" aria-label={open?c.close:c.menu} onClick={toggle}><span/><span/></button></div></div></header>{overlay}</>
}
