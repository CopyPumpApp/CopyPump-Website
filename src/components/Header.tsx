import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { MotionToggle } from './Experience'
import { Brand } from './Brand'
import { useI18n } from '../i18n'
import { navigateLocal, smoothScrollToId } from '../lib/motion'

const routeWithoutLocale = (path:string) => path.replace(/^\/ru(?=\/|$)/,'') || '/'

export function Header({simple=false}:{simple?:boolean}){
  const {dict,locale,setLocale}=useI18n(),c=dict.studio.nav
  const [open,setOpen]=useState(false)
  const trigger=useRef<HTMLButtonElement>(null)
  const panel=useRef<HTMLDivElement>(null)
  const closeButton=useRef<HTMLButtonElement>(null)
  const lockedScrollY=useRef(0)
  const lockedPathname=useRef('')
  const restoreOnClose=useRef(true)
  const close=useCallback(()=>setOpen(false),[])
  const toggle=()=>{
    if(open){close();return}
    lockedScrollY.current=window.scrollY
    lockedPathname.current=window.location.pathname
    restoreOnClose.current=true
    setOpen(true)
  }
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
  const go=(path:string,id?:string)=>{
    // A destination owns the new scroll position; closing the sheet must not undo it.
    restoreOnClose.current=false
    close()
    navigateLocal(path)
    if(id)window.setTimeout(()=>smoothScrollToId(id),100)
    else window.requestAnimationFrame(()=>window.scrollTo({top:0,left:0,behavior:'auto'}))
  }

  useLayoutEffect(()=>{
    if(!open)return
    const root=document.documentElement,body=document.body,targetY=lockedScrollY.current,targetPath=lockedPathname.current
    const shell=trigger.current?.closest<HTMLElement>('.app-shell')
    const previous={rootOverflow:root.style.overflow,rootOverscroll:root.style.overscrollBehavior,bodyOverflow:body.style.overflow,inert:shell?.inert??false}
    root.classList.add('nav-open')
    root.style.overflow='hidden';root.style.overscrollBehavior='none';body.style.overflow='hidden'
    closeButton.current?.focus({preventScroll:true})
    if(shell)shell.inert=true
    const focusables=()=>Array.from(panel.current?.querySelectorAll<HTMLElement>('a[href],button:not(:disabled),[tabindex="0"]')||[]).filter(node=>node.getClientRects().length>0&&getComputedStyle(node).visibility!=='hidden')
    const onKey=(event:KeyboardEvent)=>{
      if(event.key==='Escape'){event.preventDefault();close();return}
      if(event.key!=='Tab')return
      const nodes=focusables(),first=nodes[0],last=nodes[nodes.length-1]
      if(!first){event.preventDefault();closeButton.current?.focus({preventScroll:true});return}
      const outside=!panel.current?.contains(document.activeElement)
      if(event.shiftKey&&(document.activeElement===first||outside)){event.preventDefault();last.focus({preventScroll:true})}
      else if(!event.shiftKey&&(document.activeElement===last||outside)){event.preventDefault();first.focus({preventScroll:true})}
    }
    const onFocus=(event:FocusEvent)=>{
      if(!panel.current?.contains(event.target as Node))closeButton.current?.focus({preventScroll:true})
    }
    const desktop=window.matchMedia('(min-width:1001px)')
    const onResize=()=>{if(desktop.matches)close()}
    window.addEventListener('keydown',onKey)
    document.addEventListener('focusin',onFocus)
    desktop.addEventListener('change',onResize)
    return()=>{
      window.removeEventListener('keydown',onKey)
      document.removeEventListener('focusin',onFocus)
      desktop.removeEventListener('change',onResize)
      if(shell)shell.inert=previous.inert
      root.classList.remove('nav-open')
      root.style.overflow=previous.rootOverflow;root.style.overscrollBehavior=previous.rootOverscroll;body.style.overflow=previous.bodyOverflow
      if(restoreOnClose.current&&window.location.pathname===targetPath&&Math.abs(window.scrollY-targetY)>2)window.scrollTo({top:targetY,left:0,behavior:'auto'})
      // Restore focus only after a real dismissal, never on the initial page load.
      if(restoreOnClose.current&&trigger.current?.isConnected&&trigger.current.getClientRects().length)trigger.current.focus({preventScroll:true})
    }
  },[open,close])

  useEffect(()=>{
    const onPageShow=(event:PageTransitionEvent)=>{if(event.persisted)close()}
    const onLocation=()=>{
      if(routeWithoutLocale(window.location.pathname)!==routeWithoutLocale(lockedPathname.current)){
        restoreOnClose.current=false
        close()
      }
    }
    window.addEventListener('pageshow',onPageShow)
    window.addEventListener('popstate',onLocation)
    return()=>{window.removeEventListener('pageshow',onPageShow);window.removeEventListener('popstate',onLocation)}
  },[close])

  const desktopLinks:Array<[string,string,string?]>=simple?[[ru?'Главная':'Home','/'],[ru?'Прогресс':'Progress','/project','journal']]:[[c.product,'/','why-copypump'],[ru?'О проекте':'Project','/project'],[c.progress,'/project','journal']]
  const overlay=open?createPortal(<div id="mobile-navigation" className="mobile-nav is-open" role="dialog" aria-modal="true" aria-label={dict.header.navLabel}>
    <div className="mobile-nav__backdrop" aria-hidden="true"/>
    <div ref={panel} className="mobile-nav__panel">
      <div className="mobile-nav__ambient" aria-hidden="true"/>
      <div className="mobile-nav__top">
        <div onClickCapture={event=>{if((event.target as Element).closest('a'))go('/')}}><Brand/></div>
        <button type="button" ref={closeButton} className="icon-button is-open" aria-label={c.close} onClick={close}><span/><span/></button>
      </div>
      <div className="mobile-nav__body"><p className="mobile-nav__eyebrow">{ru?'РАЗДЕЛЫ':'SECTIONS'}</p><nav>{detailLinks.map(item=><button type="button" key={`${item.path}-${item.id||'top'}`} onClick={()=>go(item.path,item.id)}><strong>{item.label}</strong></button>)}</nav></div>
      <div className="mobile-nav__footer">
        <div className="locale-switch" role="group" aria-label={dict.common.language}><button type="button" className={locale==='en'?'active':''} onClick={()=>setLocale('en')}>EN</button><span>/</span><button type="button" className={locale==='ru'?'active':''} onClick={()=>setLocale('ru')}>RU</button></div>
        <div className="mobile-nav__external"><a href="https://github.com/CopyPumpApp/CopyPump" target="_blank" rel="noopener noreferrer">GitHub</a><a href="https://discord.gg/WS95eXrGB" target="_blank" rel="noopener noreferrer">Discord</a><a href="https://x.com/CopyPumpAI" target="_blank" rel="noopener noreferrer">X</a></div>
        <MotionToggle/>
      </div>
    </div>
  </div>,document.body):null
  return <><header className="site-header"><a className="skip-link" href="#main-content">{dict.common.skip}</a><div className="site-header__inner"><Brand compact/><nav className="desktop-nav" aria-label={dict.header.navLabel}>{desktopLinks.map(([label,path,id])=><button type="button" key={`${path}-${id||'top'}`} onClick={()=>go(path,id)}>{label}</button>)}</nav><div className="header-actions"><MotionToggle/><div className="locale-switch" role="group" aria-label={dict.common.language}><button type="button" className={locale==='en'?'active':''} onClick={()=>setLocale('en')}>EN</button><span>/</span><button type="button" className={locale==='ru'?'active':''} onClick={()=>setLocale('ru')}>RU</button></div><button type="button" ref={trigger} className={`menu-button ${open?'is-open':''}`} aria-expanded={open} aria-haspopup="dialog" aria-controls="mobile-navigation" aria-label={open?c.close:c.menu} onClick={toggle}><span/><span/></button></div></div></header>{overlay}</>
}
