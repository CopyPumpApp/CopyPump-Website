import { createContext, useContext, useEffect, useLayoutEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import { useI18n } from '../i18n'

const MotionContext=createContext({running:false,paused:false,reduced:false,modal:false,toggle:()=>{}})
export const useMotion=()=>useContext(MotionContext)

export function Experience({children,routeKey}:{children:ReactNode;routeKey:string}){
  const[paused,setPaused]=useState(()=>{try{return localStorage.getItem('copypump.motion')==='paused'}catch{return false}})
  const[reduced,setReduced]=useState(()=>window.matchMedia('(prefers-reduced-motion: reduce)').matches)
  const[visible,setVisible]=useState(!document.hidden)
  const[modal,setModal]=useState(()=>document.documentElement.classList.contains('nav-open'))
  const running=!paused&&!reduced&&visible&&!modal
  const runningRef=useRef(running);runningRef.current=running
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
    if(!running){
      activeAnimations.current.forEach(a=>a.cancel());activeAnimations.current.clear()
      document.querySelectorAll<HTMLElement>('[data-reveal]').forEach(node=>{node.style.opacity='1';node.style.transform='none';node.style.willChange='';node.dataset.revealed='true'})
    }
    return()=>{delete document.documentElement.dataset.motion}
  },[running])

  useLayoutEffect(()=>{
    if(!running||reduced)return
    const main=document.querySelector<HTMLElement>('.app-shell main')
    if(!main||typeof main.animate!=='function')return
    const animation=main.animate([{opacity:.72,transform:'translate3d(0,10px,0)'},{opacity:1,transform:'translate3d(0,0,0)'}],{duration:520,easing:'cubic-bezier(.22,1,.36,1)',fill:'both'})
    activeAnimations.current.add(animation)
    animation.finished.then(()=>activeAnimations.current.delete(animation),()=>activeAnimations.current.delete(animation))
    return()=>{animation.cancel();activeAnimations.current.delete(animation)}
  },[routeKey,running,reduced])

  useLayoutEffect(()=>{
    const nodes=[...document.querySelectorAll<HTMLElement>('[data-reveal]')]
    if(!nodes.length)return
    const forceVisible=()=>nodes.forEach(node=>{node.style.opacity='1';node.style.transform='none';node.style.willChange='';node.dataset.revealed='true'})
    if(paused||reduced||modal||!('IntersectionObserver'in window)){forceVisible();return forceVisible}

    type Profile={from:Keyframe;duration:number;easing:string}
    const profileFor=(target:HTMLElement):Profile=>{
      if(target.dataset.revealKind==='hero')return{from:{opacity:0,transform:'translate3d(0,24px,0) scale(.991)'},duration:940,easing:'cubic-bezier(.22,1,.36,1)'}
      if(target.dataset.revealKind==='title')return{from:{opacity:0,transform:'translate3d(0,28px,0) scale(.994)'},duration:760,easing:'cubic-bezier(.22,1,.36,1)'}
      if(target.classList.contains('problem-row'))return{from:{opacity:0,transform:'translate3d(-24px,0,0)'},duration:680,easing:'cubic-bezier(.22,1,.36,1)'}
      if(target.classList.contains('workflow-node'))return{from:{opacity:0,transform:'translate3d(0,30px,0) scale(.974)'},duration:740,easing:'cubic-bezier(.22,1,.36,1)'}
      if(target.closest('.authority-columns'))return{from:{opacity:0,transform:'translate3d(0,24px,0)'},duration:700,easing:'cubic-bezier(.22,1,.36,1)'}
      if(target.closest('.journal-entries'))return{from:{opacity:0,transform:'translate3d(24px,0,0)'},duration:700,easing:'cubic-bezier(.22,1,.36,1)'}
      if(target.closest('.project-rail-section'))return{from:{opacity:0,transform:'translate3d(0,20px,0)'},duration:660,easing:'cubic-bezier(.22,1,.36,1)'}
      return{from:{opacity:0,transform:'translate3d(0,18px,0)'},duration:560,easing:'cubic-bezier(.22,1,.36,1)'}
    }

    const animations=new WeakMap<HTMLElement,Animation>(),profiles=new WeakMap<HTMLElement,Profile>(),played=new WeakMap<HTMLElement,boolean>()
    const delayFor=(target:HTMLElement)=>{const raw=Number(target.dataset.reveal||0);return Number.isFinite(raw)?Math.min(300,Math.max(0,raw)):0}
    const setHidden=(target:HTMLElement)=>{const profile=profiles.get(target)||profileFor(target);profiles.set(target,profile);target.style.opacity='0';target.style.transform=String(profile.from.transform||'none');target.style.willChange='opacity, transform';target.dataset.revealed='false'}
    const setVisible=(target:HTMLElement)=>{target.style.opacity='1';target.style.transform='none';target.style.willChange='';target.dataset.revealed='true'}
    const cancel=(target:HTMLElement)=>{const a=animations.get(target);if(!a)return;a.cancel();activeAnimations.current.delete(a);animations.delete(target)}
    const reveal=(target:HTMLElement)=>{if(played.get(target))return;played.set(target,true);cancel(target);const profile=profiles.get(target)||profileFor(target);profiles.set(target,profile);if(!runningRef.current||typeof target.animate!=='function'){setVisible(target);return}const animation=target.animate([profile.from,{opacity:1,transform:'translate3d(0,0,0) scale(1)'}],{duration:profile.duration,delay:delayFor(target),easing:profile.easing,fill:'forwards'});animations.set(target,animation);activeAnimations.current.add(animation);animation.finished.then(()=>{activeAnimations.current.delete(animation);if(animations.get(target)===animation)animations.delete(target);setVisible(target)},()=>activeAnimations.current.delete(animation))}
    const reset=(target:HTMLElement)=>{if(!played.get(target)||target.contains(document.activeElement))return;cancel(target);played.set(target,false);runningRef.current?setHidden(target):setVisible(target)}

    nodes.forEach(node=>{profiles.set(node,profileFor(node));played.set(node,false);const rect=node.getBoundingClientRect();if(rect.top>window.innerHeight*.92||rect.bottom<0)setHidden(node);else setVisible(node)})
    const enterObserver=new IntersectionObserver(entries=>entries.forEach(entry=>{if(entry.isIntersecting&&entry.intersectionRatio>=.08)reveal(entry.target as HTMLElement)}),{threshold:[0,.08,.22],rootMargin:'0px 0px -6% 0px'})
    const resetObserver=new IntersectionObserver(entries=>entries.forEach(entry=>{if(!entry.isIntersecting)reset(entry.target as HTMLElement)}),{threshold:0,rootMargin:'260px 0px 260px 0px'})
    nodes.forEach(node=>{enterObserver.observe(node);resetObserver.observe(node)})
    const focus=(event:FocusEvent)=>{const node=(event.target as Element|null)?.closest<HTMLElement>('[data-reveal]');if(!node)return;cancel(node);played.set(node,true);setVisible(node)}
    document.addEventListener('focusin',focus)
    return()=>{enterObserver.disconnect();resetObserver.disconnect();nodes.forEach(node=>{cancel(node);setVisible(node)});document.removeEventListener('focusin',focus)}
  },[routeKey,paused,reduced,modal])

  useEffect(()=>{
    if(!running||reduced)return
    const root=document.querySelector<HTMLElement>('.cinematic-v47'),hero=document.querySelector<HTMLElement>('.hero'),decision=document.querySelector<HTMLElement>('.decision-section')
    if(!root)return
    let raf=0,mx=0,my=0,scrollDirty=true
    const commit=()=>{raf=0;const heroRect=hero?hero.getBoundingClientRect():null,decisionRect=decision&&scrollDirty?decision.getBoundingClientRect():null,viewportHeight=window.innerHeight;if(hero&&heroRect){const p=Math.max(0,Math.min(1,-heroRect.top/Math.max(1,heroRect.height)));hero.style.setProperty('--pointer-x-small',`${(mx*5).toFixed(2)}px`);hero.style.setProperty('--pointer-y-small',`${(my*4).toFixed(2)}px`);hero.style.setProperty('--hero-aura-scale',(1+p*.035).toFixed(4));hero.style.setProperty('--hero-object-scale',(1+p*.045).toFixed(4))}if(decision&&decisionRect){const span=Math.max(1,decisionRect.height+viewportHeight),p=Math.max(0,Math.min(1,(viewportHeight-decisionRect.top)/span));decision.style.setProperty('--story-y',`${((.5-p)*10).toFixed(2)}px`);decision.style.setProperty('--story-scale',(0.985+p*.035).toFixed(4))}scrollDirty=false}
    const queue=()=>{if(!raf)raf=requestAnimationFrame(commit)},pointer=(e:PointerEvent)=>{if(e.pointerType!=='mouse'||innerWidth<900)return;mx=(e.clientX/innerWidth-.5)*2;my=(e.clientY/innerHeight-.5)*2;queue()},scroll=()=>{scrollDirty=true;queue()}
    window.addEventListener('pointermove',pointer,{passive:true});window.addEventListener('scroll',scroll,{passive:true});window.addEventListener('resize',scroll,{passive:true});queue()
    const cards=[...document.querySelectorAll<HTMLElement>('[data-tilt]')],cleanups:Array<()=>void>=[]
    for(const card of cards){let cr=0,x=0,y=0;const draw=()=>{cr=0;card.style.setProperty('--tilt-x',`${y*-3.5}deg`);card.style.setProperty('--tilt-y',`${x*3.5}deg`)},move=(e:PointerEvent)=>{if(e.pointerType!=='mouse')return;const b=card.getBoundingClientRect();x=Math.max(-1,Math.min(1,((e.clientX-b.left)/b.width-.5)*2));y=Math.max(-1,Math.min(1,((e.clientY-b.top)/b.height-.5)*2));if(!cr)cr=requestAnimationFrame(draw)},leave=()=>{if(cr)cancelAnimationFrame(cr);cr=0;card.style.setProperty('--tilt-x','0deg');card.style.setProperty('--tilt-y','0deg')};card.addEventListener('pointermove',move,{passive:true});card.addEventListener('pointerleave',leave);cleanups.push(()=>{if(cr)cancelAnimationFrame(cr);card.removeEventListener('pointermove',move);card.removeEventListener('pointerleave',leave)})}
    return()=>{if(raf)cancelAnimationFrame(raf);window.removeEventListener('pointermove',pointer);window.removeEventListener('scroll',scroll);window.removeEventListener('resize',scroll);cleanups.forEach(fn=>fn());for(const k of ['--pointer-x-small','--pointer-y-small','--hero-aura-scale','--hero-object-scale'])hero?.style.removeProperty(k);decision?.style.removeProperty('--story-y');decision?.style.removeProperty('--story-scale')}
  },[running,reduced,routeKey])

  const value=useMemo(()=>({running,paused,reduced,modal,toggle:()=>setPaused(old=>{const next=!old;try{localStorage.setItem('copypump.motion',next?'paused':'playing')}catch{}return next})}),[running,paused,reduced,modal])
  return <MotionContext.Provider value={value}>{children}<CopyGuard/></MotionContext.Provider>
}

export function MotionToggle(){const{dict}=useI18n(),c=dict.cinema.motion,motion=useMotion();return <button className="motion-toggle" onClick={motion.toggle} disabled={motion.reduced} aria-pressed={!motion.paused&&!motion.reduced} aria-label={motion.reduced?c.reduced:motion.paused?c.play:c.pause} title={motion.reduced?c.reduced:motion.paused?c.play:c.pause}><svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true"><path d="M3 12h2l3-7 4 14 4-12 3 5h2" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/></svg><span>{c.label}</span><i aria-hidden="true"/></button>}
const COPY_ALLOWED='input,textarea,[contenteditable="true"],[data-copy-allowed],code,pre,.legal-main,.notice,.wallet-help,a[href^="mailto:"]';function elementOf(node:Node|null):Element|null{return node instanceof Element?node:node?.parentElement||null}export function copySelectionAllowed(selection:Selection|null):boolean{if(!selection||selection.isCollapsed)return false;const start=elementOf(selection.anchorNode)?.closest(COPY_ALLOWED);return!!start&&start.contains(selection.focusNode)}
function CopyGuard(){const{dict}=useI18n(),[notice,setNotice]=useState(false),timer=useRef<ReturnType<typeof setTimeout>|undefined>(undefined);useEffect(()=>{const allowTarget=(e:Event)=>elementOf(e.target as Node)?.closest(COPY_ALLOWED),notify=()=>{setNotice(true);clearTimeout(timer.current);timer.current=setTimeout(()=>setNotice(false),2800)},copy=(e:ClipboardEvent)=>{if(elementOf(e.target as Node)?.closest('input,textarea,[contenteditable="true"]'))return;if(copySelectionAllowed(getSelection()))return;if(allowTarget(e)&&!getSelection()?.toString())return;if(!document.querySelector('.app-shell'))return;e.preventDefault();e.clipboardData?.setData('text/plain','');notify()},context=(e:MouseEvent)=>{if(allowTarget(e)||elementOf(e.target as Node)?.closest('a,button,summary'))return;if(elementOf(e.target as Node)?.closest('.app-shell')){e.preventDefault();notify()}};document.addEventListener('copy',copy);document.addEventListener('contextmenu',context);return()=>{document.removeEventListener('copy',copy);document.removeEventListener('contextmenu',context);clearTimeout(timer.current)}},[]);return <div className={`copy-notice ${notice?'visible':''}`} role="status" aria-live="polite">{notice?dict.cinema.guard.notice:''}</div>}
export function Atmosphere(){return <div className="cinematic-atmosphere" aria-hidden="true"><i/><i/><div/></div>}
