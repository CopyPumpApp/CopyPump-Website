import { useCallback, useEffect, useLayoutEffect, useRef, useState, type MouseEvent, type ReactNode, type CSSProperties } from 'react'
import { createPortal } from 'react-dom'
import { useI18n } from '../i18n'
import { useMotion } from '../components/Experience'
import { Seo } from '../components/Seo'
import officialMark from '../imports/CopyPump_Official_Mark.webp'
import { navigateLocal } from '../lib/motion'
import { ART, CHANNELS, STATUS, premiumCopy } from './content'
import { SceneBackdrop } from './SceneBackdrop'
import { KineticHeading } from './KineticHeading'
import { useAnimatedMenu } from './useAnimatedMenu'
import {RadarTeaser,RadarIndicator} from '../radar/RadarTeaser'
import {radarCopy} from '../radar/copy'
import {ChapterArtwork} from './ChapterArtwork'
import {BrandIcon,BrandText,brandForUrl} from './BrandIcon'
import {previewScene} from './sceneThemes'
import {usePageEntrance} from './usePageEntrance'
import {useArtworkSwipe} from './useArtworkSwipe'
import {HomeValueStrip,HomeControlStory,HomePipelineStory,HomeProductMap} from './HomePublicationContent'

const useCopy = () => { const { locale } = useI18n(); return premiumCopy[locale] }
function Arrow({ diagonal = false }: { diagonal?: boolean }) { return <svg className="arrow" width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d={diagonal?'M6 18 18 6M6 6h12v12':'M4 12h15m-6-6 6 6-6 6'} stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg> }
export function Link({ to, children, className = '', onNavigate, ...rest }: {to:string;children:ReactNode;className?:string;onNavigate?:()=>void;[key:string]:unknown}) {
  const { pathFor } = useI18n()
  const click=(event:MouseEvent<HTMLAnchorElement>)=>{if(event.button!==0||event.metaKey||event.ctrlKey||event.shiftKey||event.altKey)return;event.preventDefault();onNavigate?.();navigateLocal(to)}
  return <a {...rest} href={pathFor(to)} onClick={click} className={className}>{children}</a>
}
function External({href,children,className=''}:{href:string;children:ReactNode;className?:string}) {
  const brand=brandForUrl(href)
  return <a href={href} className={`${className} ${brand?'external-brand':''}`} {...(!href.startsWith('mailto:')?{target:'_blank',rel:'noopener noreferrer'}:{})}>{brand&&<BrandIcon brand={brand}/>}<span className="external-label">{children}</span></a>
}
function Mark({onNavigate}:{onNavigate?:()=>void}) {
  const c=useCopy()
  return <Link to="/" className="brand" aria-label={`CopyPump — ${c.nav.home}`} onNavigate={onNavigate}>
    <img src={officialMark} width="38" height="38" alt=""/>
    <span className="brand-wordmark" aria-hidden="true"><span className="brand-copy">Copy</span><span className="brand-pump">Pump</span></span>
  </Link>
}
function LocaleSwitch(){const {locale,setLocale}=useI18n();return <div className="locale-switch" role="group" aria-label={locale==='ru'?'Язык':'Language'}>{(['en','ru'] as const).map(l=><button type="button" key={l} aria-pressed={locale===l} onClick={()=>setLocale(l)}>{l.toUpperCase()}</button>)}</div>}
export function PremiumMotionToggle(){const m=useMotion(),c=useCopy().nav;return <button type="button" className="motion-toggle" onClick={m.toggle} aria-pressed={!m.paused&&!m.reduced} disabled={m.reduced} aria-label={m.reduced?c.reduced:m.paused?c.play:c.pause}><svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M3 12h3l3-7 5 14 3-7h4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg><span>{c.motion}</span><i/></button>}

export function PremiumHeader({simple=false,hideChannels=false}:{simple?:boolean;hideChannels?:boolean}) {
  const c=useCopy(), menu=useAnimatedMenu(), {locale}=useI18n()
  const header=useRef<HTMLElement>(null),sentinel=useRef<HTMLSpanElement>(null)
  useEffect(()=>{if(!sentinel.current||!('IntersectionObserver'in window))return;const observer=new IntersectionObserver(([entry])=>{if(header.current)header.current.dataset.scrolled=entry.isIntersecting?'false':'true'});observer.observe(sentinel.current);return()=>observer.disconnect()},[])
  const items=[['/',c.nav.home],['/project',c.nav.product],['/progress',c.nav.progress],['/radar',radarCopy[locale].name],['/#community',c.nav.community],['/security',c.nav.security],['/contact',c.nav.contact]]
  return <><span className="header-sentinel" ref={sentinel} aria-hidden="true"/><header className="site-header" ref={header}><a className="skip-link" href="#main-content">{c.nav.skip}</a>
    <div className="site-header__inner wrap"><Mark/>
      <nav className="desktop-nav" aria-label={c.nav.label}><Link to="/project">{c.nav.product}</Link><Link to="/progress">{c.nav.progress}<i className="tiny-dot"/></Link><Link to="/radar">{radarCopy[locale].name}<RadarIndicator/></Link>{!simple&&<Link to="/#community">{c.nav.community}</Link>}</nav>
      <div className="header-actions"><LocaleSwitch/><PremiumMotionToggle/>
        <button ref={menu.trigger} type="button" className="menu-button" aria-label={c.nav.menu} aria-expanded={menu.mounted} aria-haspopup="dialog" aria-controls="mobile-navigation" onClick={menu.open}><span/><span/></button>
      </div>
    </div>
  </header>
  {menu.mounted&&createPortal(<div className="mobile-nav" id="mobile-navigation" role="dialog" aria-modal="true" aria-label={c.nav.label} data-phase={menu.phase} data-shown={menu.shown?'true':'false'}>
    <div className="mobile-nav__panel" ref={menu.sheet}>
      <div className="mobile-nav__top wrap"><Mark onNavigate={menu.destination}/><button ref={menu.closeButton} type="button" className="icon-button" aria-label={c.nav.close} onClick={menu.reverse}><span/><span/></button></div>
      <div className="mobile-nav__body wrap"><p className="eyebrow">{c.nav.explore}</p><nav onPointerLeave={()=>previewScene(null)}>{items.map(([to,label],i)=><Link key={to} to={to} onNavigate={menu.destination} onPointerEnter={(event:React.PointerEvent<HTMLAnchorElement>)=>{if(event.pointerType==='mouse')previewScene(to)}} onFocus={()=>previewScene(to)} style={{'--item-delay':`${110+i*65}ms`} as CSSProperties}><span className="nav-label-mask"><strong>{label}{to==='/radar'&&<RadarIndicator/>}</strong></span><Arrow diagonal/></Link>)}</nav></div>
      <div className="mobile-nav__footer wrap"><LocaleSwitch/>{!hideChannels&&<div className="mobile-nav__external"><External href={CHANNELS.github}>GitHub</External><External href={CHANNELS.discord}>Discord</External><External href={CHANNELS.x}>X</External></div>}<PremiumMotionToggle/></div>
    </div>
  </div>,document.body)}
  </>
}
/** Header and scene retain their DOM identity across all routes, including legal pages. */
export function PremiumShell({children,routeKey}:{children:ReactNode;routeKey:string}) {
  const outlet=useRef<HTMLDivElement>(null)
  usePageEntrance(routeKey,outlet)
  const contactRoute=routeKey.endsWith(':/contact')
  return <><SceneBackdrop routeKey={routeKey}/><div className="site-frame"><PremiumHeader hideChannels={contactRoute}/><div ref={outlet} className="page-outlet">{children}</div><PremiumFooter hideChannels={contactRoute}/></div></>
}
export function PremiumFooter({hideChannels=false}:{hideChannels?:boolean}){const c=useCopy();return <footer className="site-footer wrap"><div className="footer-brand"><Mark/><p>{c.footer.line}</p><small>© 2026 CopyPump</small></div><div className="footer-links">{!hideChannels&&<nav aria-label="CopyPump"><External href={CHANNELS.x}>X <Arrow diagonal/></External><External href={CHANNELS.discord}>Discord <Arrow diagonal/></External><External href={CHANNELS.github}>GitHub <Arrow diagonal/></External><External href={CHANNELS.email}>Email <Arrow diagonal/></External></nav>}<nav aria-label="Legal"><Link to="/privacy">{c.footer.privacy}</Link><Link to="/terms">{c.footer.terms}</Link><Link to="/security">{c.footer.security}</Link><Link to="/contact">{c.footer.contact}</Link></nav><p>{c.footer.disclaimer}</p></div></footer>}
function Layout({children,title,description,path}:{children:ReactNode;title:string;description:string;path:string}){return <div className="app-shell premium-v51" data-release="52.0-publication-preview"><Seo title={title} description={description} path={path}/><main id="main-content" tabIndex={-1}>{children}</main></div>}
function DateLabel(){const {locale}=useI18n();return <time dateTime={STATUS.sourceDate}>{new Intl.DateTimeFormat(locale==='ru'?'ru-RU':'en-GB',{day:'numeric',month:'short',year:'numeric',timeZone:'UTC'}).format(new Date(`${STATUS.sourceDate}T12:00:00Z`))}</time>}
function StatusBadge(){const c=useCopy();return <Link to="/progress" className="status-badge"><i/>{c.hero.label}<Arrow diagonal/></Link>}

function ProductExperience(){
  const {locale}=useI18n(), c=useCopy().experience,m=useMotion()
  const [active,setActive]=useState(0),[limit,setLimit]=useState(.35),[inView,setInView]=useState(false),[requested,setRequested]=useState(0),[failed,setFailed]=useState(false),[cycleHeld,setCycleHeld]=useState(false),[interaction,setInteraction]=useState(0)
  const requestId=useRef(0),root=useRef<HTMLDivElement>(null),buttons=useRef<(HTMLButtonElement|null)[]>([])
  const selectChapter=useCallback(async(index:number)=>{
    const request=++requestId.current;setRequested(index);setFailed(false)
    const img=new Image();img.src=`/media/v48/${ART.objects[index]}-${matchMedia('(max-width:600px)').matches?480:800}.webp`
    try {
      await img.decode()
      if(request===requestId.current)setActive(index)
    }catch{if(request===requestId.current){setRequested(active);setFailed(true)}}
  },[active])
  useEffect(()=>()=>{requestId.current++},[])
  useEffect(()=>{if(!root.current)return;if(!('IntersectionObserver'in window)){setInView(true);return}const io=new IntersectionObserver(([e])=>setInView(e.isIntersecting));io.observe(root.current);return()=>io.disconnect()},[])
  useLayoutEffect(()=>{window.dispatchEvent(new Event('copypump:content-ready'))},[active,locale])
  const pending=useRef(requested);pending.current=requested
  const stepChapter=(direction:1|-1)=>{
    const next=Math.max(0,Math.min(ART.objects.length-1,pending.current+direction))
    if(next===pending.current)return
    pending.current=next;void selectChapter(next)
  }
  const swipe=useArtworkSwipe(stepChapter)
  // One timer, renewed after every selection or input. Hover never pauses it.
  const cycling=m.running&&inView&&!cycleHeld&&requested===active
  useEffect(()=>{
    if(!cycling)return
    const timer=window.setTimeout(()=>{
      // Recheck real browser state as well as React state at the timer boundary.
      if(document.hidden||document.documentElement.classList.contains('nav-open')||matchMedia('(prefers-reduced-motion: reduce)').matches)return
      // Never replace a form or gesture while it is being operated.
      if(root.current?.querySelector('[data-dragging=true],input:active')){setInteraction(n=>n+1);return}
      void selectChapter((active+1)%ART.objects.length)
    },7200)
    return()=>clearTimeout(timer)
  },[cycling,active,requested,interaction,selectChapter])
  const allowed=limit>=.5
  return <section className="experience wrap section-space" id="experience" data-scene="experience" aria-labelledby="experience-title">
    <div className="section-heading"><div><p className="eyebrow" data-reveal="label">{c.eyebrow}</p><KineticHeading id="experience-title" lines={[{text:c.title},{text:c.accent,accent:true}]}/></div><p data-reveal>{locale==='ru'?'Четыре этапа — от наблюдения до проверяемого результата. Переключайте сцены, чтобы познакомиться с подходом CopyPump.':'Four stages—from an observation to a reviewable outcome. Explore each scene to discover the CopyPump approach.'}</p></div>
    <div className="experience-navigation" data-reveal="record"><div className="experience-tabs" role="tablist" aria-label={c.eyebrow}>{c.chapters.map((item,i)=><button key={i} type="button" role="tab" id={`chapter-${i}`} aria-controls="experience-panel" aria-selected={active===i} tabIndex={active===i?0:-1} ref={el=>{buttons.current[i]=el}} onClick={()=>{setInteraction(n=>n+1);void selectChapter(i)}} onKeyDown={e=>{let next=i;if(e.key==='ArrowRight')next=(i+1)%4;else if(e.key==='ArrowLeft')next=(i+3)%4;else if(e.key==='Home')next=0;else if(e.key==='End')next=3;else return;e.preventDefault();void selectChapter(next);buttons.current[next]?.focus()}}>{item.name}<i aria-hidden="true"/></button>)}</div><button type="button" className="experience-cycle" aria-pressed={cycleHeld} disabled={!m.running} onClick={()=>setCycleHeld(v=>!v)} aria-label={locale==='ru'?(cycleHeld?'Продолжить смену сцен':'Приостановить смену сцен'):(cycleHeld?'Resume scene cycle':'Pause scene cycle')}>{cycleHeld?'▶':'Ⅱ'}</button></div>
    <div className="experience-stage" ref={root} onPointerDownCapture={()=>setInteraction(n=>n+1)} onPointerUpCapture={()=>setInteraction(n=>n+1)} onKeyDownCapture={()=>setInteraction(n=>n+1)} data-cycling={cycling?'true':'false'} id="experience-panel" aria-busy={requested!==active} role="tabpanel" aria-labelledby={`chapter-${active}`} tabIndex={0} data-ambient={m.running&&inView?'on':'off'}>
      <div className="experience-art" {...swipe} role="group" aria-label={locale==='ru'?'Переключение сцен продукта':'Product scene controls'} aria-describedby="artwork-swipe-hint" tabIndex={0} onKeyDown={event=>{if(event.target!==event.currentTarget)return;if(event.key==='ArrowLeft'||event.key==='ArrowRight'){event.preventDefault();stepChapter(event.key==='ArrowRight'?1:-1)}}}>
        <div className="art-orbit" aria-hidden="true"/><ChapterArtwork name={ART.objects[active]} running={m.running&&inView}/>
        <div className="artwork-step-controls"><button type="button" className="artwork-previous" disabled={requested===0} aria-label={locale==='ru'?'Предыдущий объект':'Previous object'} onClick={()=>stepChapter(-1)}>‹</button><span id="artwork-swipe-hint">{locale==='ru'?'Листайте объекты свайпом':'Swipe to explore'}</span><button type="button" className="artwork-next" disabled={requested===ART.objects.length-1} aria-label={locale==='ru'?'Следующий объект':'Next object'} onClick={()=>stepChapter(1)}>›</button></div>
      </div>
      <div className="experience-stories">
        {c.chapters.map((chapter,i)=><div className={'chapter-panel '+(active===i?'experience-story chapter-enter':'')} key={i} inert={active!==i} aria-hidden={active!==i} data-active={active===i?'true':'false'}>
          <KineticHeading as="h3" lines={[{text:chapter.title,accent:true}]}/><p data-reveal data-delay="100">{chapter.copy}</p>
          {i===2&&<div className="instrument instrument--policy"><div className="policy-readout"><span>{c.test}</span><b>0.50 <small>SOL</small></b></div><label className="policy-range" htmlFor="capital-limit"><span>{c.limit}</span><output htmlFor="capital-limit">{limit.toFixed(2)} SOL</output><input id="capital-limit" type="range" min="0.1" max="1" step="0.05" value={limit} onChange={e=>{setLimit(Number(e.target.value));setInteraction(n=>n+1)}}/><small>0.10 SOL</small><small>1.00 SOL</small></label><div className={'policy-result '+(allowed?'allowed':'blocked')} role="status" aria-live={active===2?'polite':'off'}><strong><i/>{allowed?c.allowed:c.blocked}</strong><p>{allowed?c.allowedNote:c.blockedNote}</p></div></div>}
          <Link to="/project" className="text-link" data-reveal data-delay="180">{i===2?c.policyLink:c.detail}<Arrow/></Link>
        </div>)}
      </div>
    </div>
    <p className="experience-disclosure" data-reveal>{locale==='ru'?'Иллюстрация продукта. Без подключения кошелька и реальных сделок.':'Product illustration. No wallet connection or real trades.'}</p>
    {failed&&<p role="status">{locale==='ru'?'Изображение не загрузилось. Предыдущая сцена сохранена; попробуйте ещё раз.':'The image could not load. Your previous scene is preserved; please try again.'}</p>}
  </section>
}
export function PremiumLanding(){const c=useCopy(),{locale}=useI18n();const proofTarget=locale==='ru'?{label:'ТЕКУЩАЯ ЦЕЛЬ ПРОВЕРКИ',title:'Замкнуть цикл в Devnet.',copy:'Следующее публичное подтверждение — не ещё один экран, а проверенные данные полного цикла: исполнение, подтверждение, сверка, комиссии и учёт PnL.'}:{label:'CURRENT PROOF TARGET',title:'Close the Devnet loop.',copy:'The next public proof is not another screen: it is reviewed evidence covering execution, confirmation, reconciliation, fees and PnL accounting.'};return <Layout title="CopyPump — Smart money. Your rules." description={c.hero.intro} path="/">
  <section className="hero" data-scene="hero" aria-labelledby="hero-title"><div className="hero-content wrap"><div className="hero-topline"><p className="eyebrow" data-reveal="label">{c.hero.eyebrow}</p><StatusBadge/></div><div className="hero-type"><KineticHeading as="h1" id="hero-title" lines={[{text:c.hero.line1},{text:c.hero.line2,accent:true}]}/><p className="hero-intro" data-reveal data-delay="140">{c.hero.intro}</p><div className="hero-actions" data-reveal data-delay="210"><Link to="/#experience" className="button button-primary">{c.hero.primary}<Arrow/></Link><Link to="/progress" className="text-link">{c.hero.secondary}<Arrow diagonal/></Link></div></div><div className="hero-bottom" data-reveal="record"><p>{c.hero.bottom}</p><span className="hero-discover" aria-hidden="true">↓</span></div></div></section>
  <HomeValueStrip/>
  <ProductExperience/>
  <HomeControlStory/>
  <HomePipelineStory/>
  <RadarTeaser/>
  <section className="status-section wrap section-space" id="status" data-scene="status" aria-labelledby="status-title"><div className="status-copy"><p className="eyebrow" data-reveal="label">{c.status.eyebrow}</p><KineticHeading id="status-title" lines={[{text:c.status.title},{text:c.status.accent,accent:true}]}/><p data-reveal>{c.status.intro}</p><Link to="/progress" className="text-link" data-reveal data-delay="160">{c.status.link}<Arrow/></Link></div><div className="status-card"><h3 data-reveal>{c.status.now}</h3><dl><div data-reveal data-delay="70"><dt>{c.status.network}</dt><dd>Solana Devnet</dd></div><div data-reveal data-delay="140"><dt>{c.status.mainnet}</dt><dd className="locked-label">{c.status.locked}</dd></div></dl><div className="status-current" data-reveal data-delay="180"><p className="eyebrow">{proofTarget.label}</p><strong>{proofTarget.title}</strong><p>{proofTarget.copy}</p></div><p className="status-source" data-reveal data-delay="210">{c.status.source} <DateLabel/></p><p className="fine-print">{c.status.note}</p></div></section>
  <HomeProductMap/>
  <section className="community wrap section-space" id="community" data-scene="community" aria-labelledby="community-title"><div><p className="eyebrow" data-reveal="label">{c.cta.eyebrow}</p><KineticHeading id="community-title" lines={[{text:c.cta.title,accent:true}]}/><p data-reveal>{c.cta.copy}</p><div className="community-actions" data-reveal data-delay="140"><External href={CHANNELS.discord} className="button button-primary">{c.cta.community}<Arrow diagonal/></External><External href={CHANNELS.github} className="text-link">{c.cta.builder}<Arrow diagonal/></External></div><External href={CHANNELS.email} className="partner-link">{c.cta.partners} ↗</External></div></section>
  </Layout>}
export function PremiumProject(){const c=useCopy(),[tab,setTab]=useState(0),tabs=useRef<(HTMLButtonElement|null)[]>([]);useLayoutEffect(()=>{window.dispatchEvent(new Event('copypump:content-ready'))},[tab]);return <Layout title={`${c.nav.product} — CopyPump`} description={c.product.intro} path="/project"><section className="document-hero wrap" data-scene="document"><p className="eyebrow">{c.product.eyebrow}</p><KineticHeading as="h1" lines={[{text:c.product.title},{text:c.product.accent,accent:true}]}/><p>{c.product.intro}</p></section><section className="product-document wrap" aria-label={c.nav.product}><div className="document-tabs" role="tablist" aria-label={c.nav.product}>{c.product.tabs.map((label,i)=><button key={label} ref={el=>{tabs.current[i]=el}} type="button" role="tab" id={`product-tab-${i}`} aria-selected={tab===i} aria-controls="product-panel" tabIndex={tab===i?0:-1} onClick={()=>setTab(i)} onKeyDown={e=>{let n=i;if(e.key==='ArrowRight')n=(i+1)%3;else if(e.key==='ArrowLeft')n=(i+2)%3;else if(e.key==='Home')n=0;else if(e.key==='End')n=2;else return;e.preventDefault();setTab(n);tabs.current[n]?.focus()}}>{label}</button>)}</div><div role="tabpanel" id="product-panel" aria-labelledby={`product-tab-${tab}`} tabIndex={0} className="document-panel"><div className="document-tab-content" key={tab}>
    {tab===0?<><header><h2>{c.product.policyTitle}</h2><p>{c.product.policyIntro}</p></header><div className="control-grid">{c.product.controls.map((x,i)=><article key={x.name} data-reveal="record"><div className="control-label"><span>0{i+1}</span><p className="eyebrow">{x.tag}</p></div><h3>{x.name}</h3><p>{x.detail}</p></article>)}</div></>:tab===1?<><header><h2>{c.product.authorityTitle}</h2><p>{c.product.authorityIntro}</p></header><div className="authority-records">{c.product.authority.map((x,i)=><article key={x.title} data-reveal="record"><span className="record-number">0{i+1}</span><div><h3>{x.title}</h3><p>{x.copy}</p></div></article>)}</div></>:<><header><h2>{c.product.faqTitle}</h2></header><div className="faq-list">{c.product.faq.map(x=><details className="faq-item" key={x.q}><summary>{x.q}<span aria-hidden="true">+</span></summary><p><BrandText text={x.a}/></p></details>)}</div></>}
    <Link to="/progress" className="text-link document-source">{c.product.evidence}<Arrow/></Link></div></div></section></Layout>}

export function PremiumProgress(){const c=useCopy();return <Layout title={`${c.nav.progress} — CopyPump`} description={c.progress.intro} path="/progress"><section className="document-hero wrap" data-scene="document"><p className="eyebrow">{c.progress.eyebrow}</p><KineticHeading as="h1" lines={[{text:c.progress.title},{text:c.progress.accent,accent:true}]}/><p>{c.progress.intro}</p><p className="dated-source">{c.progress.date} <DateLabel/></p></section><section className="progress-overview wrap" aria-labelledby="progress-stage"><div className="progress-stage" data-reveal><span className="eyebrow">SOLANA / DEVNET</span><h2 id="progress-stage">{c.progress.summaryTitle}</h2><p>{c.progress.summaryCopy}</p></div><div className="progress-gates" data-reveal>{c.progress.gates.map(x=><article key={x.name}><div><h3>{x.name}</h3><span className={`gate-tag ${x.tone}`}><i/>{x.state}</span></div><p>{x.copy}</p></article>)}</div></section><section className="milestone-section wrap section-space"><div><p className="eyebrow">{c.progress.currentLabel}</p><KineticHeading lines={[{text:c.progress.currentTitle,accent:true}]}/><p>{c.progress.currentCopy}</p></div><details className="engineering-note"><summary>{c.progress.noteTitle}<span>+</span></summary><p>{c.progress.note}</p></details></section><section className="roadmap-section wrap section-space" id="roadmap"><div><p className="eyebrow">{c.progress.roadmapLabel}</p><KineticHeading lines={[{text:c.progress.roadmapTitle,accent:true}]}/></div><ol>{c.progress.roadmap.map((x,i)=><li key={x.title} data-reveal><span>0{i+1}</span><h3>{x.title}</h3><p>{x.copy}</p></li>)}</ol><div className="source-record"><External href={STATUS.source} className="text-link">{c.progress.source}<Arrow diagonal/></External><p>{c.progress.update}</p></div></section></Layout>}
