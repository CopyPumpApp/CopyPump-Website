import { useEffect, useRef, useState } from 'react'
import { MotionToggle } from './Experience'
import { Brand } from './Brand'
import { useI18n } from '../i18n'
import { navigateLocal, smoothScrollToId } from '../lib/motion'
export function Header({ simple = false }: { simple?: boolean }) {
  const {dict,locale,setLocale}=useI18n(), c=dict.studio.nav
  const [open,setOpen]=useState(false), menu=useRef<HTMLDialogElement>(null), trigger=useRef<HTMLButtonElement>(null)
  useEffect(()=>{const d=menu.current;if(!d)return;if(open)d.showModal();else if(d.open){d.close();trigger.current?.focus()}},[open])
  const links=[['why-copypump',c.product],['authority',c.controls],['journal',c.progress]]
  const go=(id:string)=>{setOpen(false);if(simple){navigateLocal('/');setTimeout(()=>smoothScrollToId(id),60)}else smoothScrollToId(id)}
  return <header className="site-header"><a className="skip-link" href="#main-content">{dict.common.skip}</a><div className="site-header__inner"><Brand compact/>
    <nav className="desktop-nav" aria-label={dict.header.navLabel}>{links.map(([id,label])=><button key={id} onClick={()=>go(id)}>{label}</button>)}</nav>
    <div className="header-actions"><MotionToggle/><div className="locale-switch" role="group" aria-label={dict.common.language}><button className={locale==='en'?'active':''} onClick={()=>setLocale('en')} aria-label={dict.common.switchToEnglish}>EN</button><span>/</span><button className={locale==='ru'?'active':''} onClick={()=>setLocale('ru')} aria-label={dict.common.switchToRussian}>RU</button></div><button ref={trigger} className="menu-button" aria-expanded={open} aria-label={c.menu} onClick={()=>setOpen(true)}><span/><span/></button></div>
    </div><dialog ref={menu} className="mobile-nav" onCancel={()=>setOpen(false)} aria-label={dict.header.navLabel}><div className="mobile-nav__top"><Brand/><button className="icon-button" aria-label={c.close} onClick={()=>setOpen(false)}>×</button></div><nav>{links.map(([id,label],i)=><button key={id} onClick={()=>go(id)}><small>0{i+1}</small>{label}<span>↗</span></button>)}</nav></dialog></header>
}
