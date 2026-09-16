import { createContext, useContext, useEffect, useLayoutEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import { useI18n } from '../i18n'

const MotionContext=createContext({running:false,paused:false,reduced:false,modal:false,toggle:()=>{}})
export const useMotion=()=>useContext(MotionContext)

type RevealProfile={from:Keyframe;duration:number;easing:string}
function revealProfile(target:HTMLElement):RevealProfile{
  if(target.dataset.revealKind==='hero')return{from:{opacity:0,transform:'translate3d(0,20px,0) scale(.994)'},duration:980,easing:'cubic-bezier(.22,1,.36,1)'}
  if(target.dataset.revealKind==='title')return{from:{opacity:0,transform:'translate3d(0,22px,0)'},duration:860,easing:'cubic-bezier(.22,1,.36,1)'}
  if(target.classList.contains('problem-row'))return{from:{opacity:0,transform:'translate3d(-18px,0,0)'},duration:780,easing:'cubic-bezier(.22,1,.36,1)'}
  if(target.classList.contains('workflow-node'))return{from:{opacity:0,transform:'translate3d(0,22px,0) scale(.985)'},duration:820,easing:'cubic-bezier(.22,1,.36,1)'}
  return{from:{opacity:0,transform:'translate3d(0,14px,0)'},duration:700,easing:'cubic-bezier(.22,1,.36,1)'}
}
function makeVisible(node:HTMLElement){node.style.opacity='1';node.style.transform='none';node.style.willChange='';node.dataset.revealed='true'}

export function Experience({children,routeKey}:{children:ReactNode;routeKey:string}){
  const[paused,setPaused]=useState(()=>{try{return localStorage.getItem('copypump.motion')==='paused'}catch{return false}})
  const[reduced,setReduced]=useState(()=>window.matchMedia('(prefers-reduced-motion: reduce)').matches)
  const[visible,setVisible]=useState(!document.hidden)
  const[modal,setModal]=useState(()=>document.documentElement.classList.contains('nav-open'))
  const running=!paused&&!reduced&&visible&&!modal
  const activeAnimations=useRef(new Set<Animation>())

  useEffect(()=>{
    const media=window.matchMedia('(prefers-reduced-motion: reduce)')
    const change=()=>setReduced(media.matches),visibility=()=>setVisible(!document.hidden),overlay=()=>setModal(document.documentElement.classList.contains('nav-open'))
    const modalObserver=new MutationObserver(overlay)
    modalObserver.observe(document.documentElement,{attributes:true,attributeFilter:['class']})
    overlay();media.addEventListener('change',change);document.addEventListener('visibilitychange',visibility)
    return()=>{modalObserver.disconnect();media.removeEventListener('change',change);document.removeEventListener('visibilitychange',visibility)}
  },[])

  useEffect(()=>{
    document.documentElement.dataset.motion=running?'on':'off'
    if(!running){activeAnimations.current.forEach(a=>a.cancel());activeAnimations.current.clear();document.querySelectorAll<HTMLElement>('[data-reveal]').forEach(makeVisible)}
    return()=>{delete document.documentElement.dataset.motion}
  },[running])

  useLayoutEffect(()=>{
    if(!running||reduced)return
    const main=document.querySelector<HTMLElement>('.app-shell main')
    if(!main||typeof main.animate!=='function')return
    const animation=main.animate([{opacity:.84,transform:'translate3d(0,7px,0)'},{opacity:1,transform:'none'}],{duration:520,easing:'cubic-bezier(.22,1,.36,1)',fill:'both'})
    activeAnimations.current.add(animation)
    animation.finished.finally(()=>activeAnimations.current.delete(animation)).catch(()=>{})
    return()=>{animation.cancel();activeAnimations.current.delete(animation)}
  },[routeKey,running,reduced])

  useLayoutEffect(()=>{
    const nodes=[...document.querySelectorAll<HTMLElement>('[data-reveal]')]
    if(!nodes.length)return
    const animations=new Map<HTMLElement,Animation>()
    const forceVisible=()=>nodes.forEach(makeVisible)
    if(!running||reduced||!('IntersectionObserver'in window)){forceVisible();return}
    const observer=new IntersectionObserver(entries=>{
      for(const entry of entries){
        if(!entry.isIntersecting||entry.intersectionRatio<.06)continue
        const node=entry.target as HTMLElement
        observer.unobserve(node)
        if(node.dataset.revealed==='true'){makeVisible(node);continue}
        const profile=revealProfile(node),raw=Number(node.dataset.reveal||0),delay=Number.isFinite(raw)?Math.min(260,Math.max(0,raw)):0
        if(typeof node.animate!=='function'){makeVisible(node);continue}
        node.style.opacity='1';node.style.transform='none';node.style.willChange='opacity, transform'
        const animation=node.animate([profile.from,{opacity:1,transform:'none'}],{duration:profile.duration,delay,easing:profile.easing,fill:'both'})
        animations.set(node,animation);activeAnimations.current.add(animation)
        animation.finished.then(()=>makeVisible(node),()=>makeVisible(node)).finally(()=>{animations.delete(node);activeAnimations.current.delete(animation)})
      }
    },{threshold:[0,.06,.2],rootMargin:'0px 0px -5% 0px'})
    for(const node of nodes){
      const rect=node.getBoundingClientRect()
      if(rect.bottom>=0&&rect.top<=innerHeight*.94){makeVisible(node);node.dataset.revealed='true'}
      else{const profile=revealProfile(node);node.style.opacity='0';node.style.transform=String(profile.from.transform||'none');node.style.willChange='opacity, transform';node.dataset.revealed='false';observer.observe(node)}
    }
    const focus=(event:FocusEvent)=>{const node=(event.target as Element|null)?.closest<HTMLElement>('[data-reveal]');if(!node)return;observer.unobserve(node);animations.get(node)?.cancel();makeVisible(node)}
    document.addEventListener('focusin',focus)
    return()=>{observer.disconnect();animations.forEach(animation=>{animation.cancel();activeAnimations.current.delete(animation)});animations.clear();forceVisible();document.removeEventListener('focusin',focus)}
  },[routeKey,running,reduced])

  useEffect(()=>{
    if(!running||reduced||innerWidth<900||!matchMedia('(pointer:fine)').matches)return
    const hero=document.querySelector<HTMLElement>('.hero'),decision=document.querySelector<HTMLElement>('.decision-section')
    if(!hero&&!decision)return
    let raf=0,mx=0,my=0,dirty=true
    const draw=()=>{raf=0;if(!dirty)return;dirty=false;const vh=innerHeight;if(hero){const r=hero.getBoundingClientRect(),p=Math.max(0,Math.min(1,-r.top/Math.max(1,r.height)));hero.style.setProperty('--pointer-x-small',`${(mx*4).toFixed(2)}px`);hero.style.setProperty('--pointer-y-small',`${(my*3).toFixed(2)}px`);hero.style.setProperty('--hero-aura-scale',(1+p*.025).toFixed(4));hero.style.setProperty('--hero-object-scale',(1+p*.032).toFixed(4))}if(decision){const r=decision.getBoundingClientRect(),span=Math.max(1,r.height+vh),p=Math.max(0,Math.min(1,(vh-r.top)/span));decision.style.setProperty('--story-y',`${((.5-p)*7).toFixed(2)}px`);decision.style.setProperty('--story-scale',(0.992+p*.018).toFixed(4))}}
    const queue=()=>{dirty=true;if(!raf)raf=requestAnimationFrame(draw)},pointer=(e:PointerEvent)=>{mx=(e.clientX/innerWidth-.5)*2;my=(e.clientY/innerHeight-.5)*2;queue()}
    addEventListener('pointermove',pointer,{passive:true});addEventListener('scroll',queue,{passive:true});addEventListener('resize',queue,{passive:true});queue()
    return()=>{if(raf)cancelAnimationFrame(raf);removeEventListener('pointermove',pointer);removeEventListener('scroll',queue);removeEventListener('resize',queue);for(const k of ['--pointer-x-small','--pointer-y-small','--hero-aura-scale','--hero-object-scale'])hero?.style.removeProperty(k);decision?.style.removeProperty('--story-y');decision?.style.removeProperty('--story-scale')}
  },[running,reduced,routeKey])

  const value=useMemo(()=>({running,paused,reduced,modal,toggle:()=>setPaused(old=>{const next=!old;try{localStorage.setItem('copypump.motion',next?'paused':'playing')}catch{}return next})}),[running,paused,reduced,modal])
  return <MotionContext.Provider value={value}>{children}<CopyGuard/></MotionContext.Provider>
}

export function MotionToggle(){const{dict}=useI18n(),c=dict.cinema.motion,motion=useMotion();return <button className="motion-toggle" onClick={motion.toggle} disabled={motion.reduced} aria-pressed={!motion.paused&&!motion.reduced} aria-label={motion.reduced?c.reduced:motion.paused?c.play:c.pause} title={motion.reduced?c.reduced:motion.paused?c.play:c.pause}><svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true"><path d="M3 12h2l3-7 4 14 4-12 3 5h2" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/></svg><span>{c.label}</span><i aria-hidden="true"/></button>}
const COPY_ALLOWED='input,textarea,[contenteditable="true"],[data-copy-allowed],code,pre,.legal-main,.notice,.wallet-help,a[href^="mailto:"]';function elementOf(node:Node|null):Element|null{return node instanceof Element?node:node?.parentElement||null}export function copySelectionAllowed(selection:Selection|null):boolean{if(!selection||selection.isCollapsed)return false;const start=elementOf(selection.anchorNode)?.closest(COPY_ALLOWED);return!!start&&start.contains(selection.focusNode)}
function CopyGuard(){const{dict}=useI18n(),[notice,setNotice]=useState(false),timer=useRef<ReturnType<typeof setTimeout>|undefined>(undefined);useEffect(()=>{const allowTarget=(e:Event)=>elementOf(e.target as Node)?.closest(COPY_ALLOWED),notify=()=>{setNotice(true);clearTimeout(timer.current);timer.current=setTimeout(()=>setNotice(false),2800)},copy=(e:ClipboardEvent)=>{if(elementOf(e.target as Node)?.closest('input,textarea,[contenteditable="true"]'))return;if(copySelectionAllowed(getSelection()))return;if(allowTarget(e)&&!getSelection()?.toString())return;if(!document.querySelector('.app-shell'))return;e.preventDefault();e.clipboardData?.setData('text/plain','');notify()},context=(e:MouseEvent)=>{if(allowTarget(e)||elementOf(e.target as Node)?.closest('a,button,summary'))return;if(elementOf(e.target as Node)?.closest('.app-shell')){e.preventDefault();notify()}};document.addEventListener('copy',copy);document.addEventListener('contextmenu',context);return()=>{document.removeEventListener('copy',copy);document.removeEventListener('contextmenu',context);clearTimeout(timer.current)}},[]);return <div className={`copy-notice ${notice?'visible':''}`} role="status" aria-live="polite">{notice?dict.cinema.guard.notice:''}</div>}
export function Atmosphere(){return <div className="cinematic-atmosphere" aria-hidden="true"><i/><i/><div/></div>}
