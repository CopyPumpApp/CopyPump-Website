import { createContext, useCallback, useContext, useEffect, useLayoutEffect, useMemo, useRef, useState, type ReactNode } from 'react'

const MotionContext = createContext({running:false,paused:false,reduced:false,modal:false,toggle:()=>{},setModal:(_open:boolean)=>{}})
export const useMotion = () => useContext(MotionContext)

/** Single reveal owner. Menu state never tears down or re-arms page reveals. */
export function Experience({children,routeKey}:{children:ReactNode;routeKey:string}){
  const [paused,setPaused]=useState(()=>{try{return localStorage.getItem('copypump.motion')==='paused'}catch{return false}})
  const [reduced,setReduced]=useState(()=>matchMedia('(prefers-reduced-motion: reduce)').matches)
  const [visible,setVisible]=useState(!document.hidden)
  const [modal,setModal]=useState(false)
  const revealEnabled=useRef(!paused&&!reduced)
  const running=!paused&&!reduced&&visible&&!modal
  const active=useRef(new Map<HTMLElement,Animation>())
  const revealAll=useCallback(()=>{
    active.current.forEach((animation,node)=>{animation.cancel();node.style.opacity='1';node.style.transform='';node.style.willChange='';node.dataset.revealed='true'})
    active.current.clear()
    document.querySelectorAll<HTMLElement>('[data-reveal]').forEach(node=>{node.style.opacity='1';node.style.transform='';node.style.willChange='';node.dataset.revealed='true'})
  },[])
  useEffect(()=>{
    const media=matchMedia('(prefers-reduced-motion: reduce)')
    const change=()=>setReduced(media.matches),visibility=()=>setVisible(!document.hidden)
    media.addEventListener('change',change);document.addEventListener('visibilitychange',visibility)
    return()=>{media.removeEventListener('change',change);document.removeEventListener('visibilitychange',visibility)}
  },[])
  useLayoutEffect(()=>{document.documentElement.dataset.motion=running?'on':'off'},[running])
  useLayoutEffect(()=>{revealEnabled.current=!paused&&!reduced;if(paused||reduced)revealAll()},[paused,reduced,revealAll])
  useEffect(()=>{if(!visible)revealAll()},[visible,revealAll])
  useLayoutEffect(()=>{
    const nodes=[...document.querySelectorAll<HTMLElement>('[data-reveal]')]
    const show=(node:HTMLElement)=>{node.dataset.revealed='true';node.style.opacity='1';node.style.transform='';node.style.willChange=''}
    if(!revealEnabled.current||!('IntersectionObserver'in window)){nodes.forEach(show);return}
    let disposed=false
    const io=new IntersectionObserver(entries=>{
      for(const e of entries){
        if(!e.isIntersecting)continue
        const node=e.target as HTMLElement
        io.unobserve(node)
        if(!revealEnabled.current||node.dataset.revealed==='true'||typeof node.animate!=='function'){show(node);continue}
        node.dataset.revealed='true';node.style.opacity='1';node.style.willChange='opacity,transform'
        const animation=node.animate([{opacity:0,transform:'translate3d(0,16px,0)'},{opacity:1,transform:'translate3d(0,0,0)'}],{duration:680,easing:'cubic-bezier(.2,.8,.2,1)',fill:'both'})
        active.current.set(node,animation)
        animation.finished.then(()=>{if(!disposed){show(node);animation.cancel();active.current.delete(node)}},()=>{if(!disposed)show(node)})
      }
    },{threshold:0,rootMargin:'60px 0px'})
    nodes.forEach(node=>{const r=node.getBoundingClientRect();if(r.top<innerHeight&&r.bottom>0)show(node);else{node.style.opacity='0';node.dataset.revealed='false';io.observe(node)}})
    return()=>{disposed=true;io.disconnect();active.current.forEach(animation=>animation.cancel());active.current.clear();nodes.forEach(show)}
  },[routeKey])
  const toggle=useCallback(()=>setPaused(old=>{const next=!old;try{localStorage.setItem('copypump.motion',next?'paused':'playing')}catch{}return next}),[])
  const value=useMemo(()=>({running,paused,reduced,modal,toggle,setModal}),[running,paused,reduced,modal,toggle])
  return <MotionContext.Provider value={value}>{children}</MotionContext.Provider>
}
/** Kept for unmounted legacy components; v48 uses the localized premium control. */
export function MotionToggle(){const m=useMotion();return <button type="button" className="motion-toggle" onClick={m.toggle} disabled={m.reduced} aria-pressed={!m.paused&&!m.reduced}>Motion</button>}
export function Atmosphere(){return null}
