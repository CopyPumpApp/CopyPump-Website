import { createContext, useCallback, useContext, useEffect, useLayoutEffect, useMemo, useRef, useState, type ReactNode } from 'react'

const MotionContext = createContext({running:false,paused:false,reduced:false,modal:false,toggle:()=>{},setModal:(_open:boolean)=>{}})
export const useMotion = () => useContext(MotionContext)
const visible = (node:HTMLElement) => {
  node.style.opacity = '1'; node.style.transform = ''; node.style.willChange = ''
  node.dataset.revealed = 'true'
}

/** One transform owner per element. Menu state never re-arms page entrances. */
export function Experience({children,routeKey}:{children:ReactNode;routeKey:string}) {
  const [paused,setPaused] = useState(()=>{try{return localStorage.getItem('copypump.motion')==='paused'}catch{return false}})
  const [reduced,setReduced] = useState(()=>matchMedia('(prefers-reduced-motion: reduce)').matches)
  const [pageVisible,setPageVisible] = useState(!document.hidden)
  const [modal,setModal] = useState(false)
  const running = !paused && !reduced && pageVisible && !modal
  const allowed = useRef(!paused && !reduced)
  const active = useRef(new Map<HTMLElement,Animation>())
  const revealAll = useCallback(()=>{
    active.current.forEach((a,node)=>{a.cancel();visible(node)})
    active.current.clear()
    document.querySelectorAll<HTMLElement>('[data-reveal]').forEach(visible)
  },[])
  useEffect(()=>{
    const media=matchMedia('(prefers-reduced-motion: reduce)')
    const change=()=>setReduced(media.matches),visibility=()=>setPageVisible(!document.hidden)
    media.addEventListener('change',change);document.addEventListener('visibilitychange',visibility)
    return()=>{media.removeEventListener('change',change);document.removeEventListener('visibilitychange',visibility)}
  },[])
  useLayoutEffect(()=>{document.documentElement.dataset.motion=running?'on':'off'},[running])
  useLayoutEffect(()=>{allowed.current=!paused&&!reduced;document.documentElement.dataset.motionPreference=allowed.current?'on':'off';if(paused||reduced)revealAll()},[paused,reduced,revealAll])
  useEffect(()=>{if(!pageVisible)revealAll()},[pageVisible,revealAll])

  useLayoutEffect(()=>{
    const nodes=new Set<HTMLElement>()
    if(!allowed.current||!('IntersectionObserver'in window)) {
      document.querySelectorAll<HTMLElement>('main [data-reveal]').forEach(visible);return
    }
    let disposed=false
    const waitingForMenu=new Set<HTMLElement>()
    const enter=(node:HTMLElement)=>{
      if(!node.isConnected)return
      if(document.documentElement.classList.contains('nav-open')){waitingForMenu.add(node);return}
      if(node.dataset.revealed==='true'||!allowed.current||typeof node.animate!=='function'){visible(node);return}
      node.dataset.revealed='true';node.style.opacity='1';node.style.willChange='opacity, transform';const section=node.closest<HTMLElement>('section,.document-hero');if(section)section.dataset.entered='true'
      const kind=node.dataset.reveal
      const from = kind==='heading'?{opacity:.08,transform:'translate3d(0,116%,0) rotate(2deg)'}:
        kind==='depth'?{opacity:0,transform:'translate3d(0,38px,0) scale(.92)'}:
          {opacity:0,transform:'translate3d(0,16px,0)'}
      const duration=kind==='heading'?1120:kind==='depth'?1250:kind==='label'?650:kind==='record'?960:880
      const delay=Math.min(360,Math.max(0,Number(node.dataset.delay)||0))
      const animation=node.animate([from,{opacity:1,transform:'translate3d(0,0,0) scale(1)'}],
        {duration,delay,easing:'cubic-bezier(.22,1,.36,1)',fill:'both'})
      active.current.set(node,animation)
      animation.finished.then(()=>{
        if(!disposed&&active.current.get(node)===animation){visible(node);active.current.delete(node);animation.cancel()}
      },()=>{if(!disposed)visible(node)})
    }
    const io=new IntersectionObserver(entries=>{
      entries.forEach(e=>{if(e.isIntersecting){io.unobserve(e.target);enter(e.target as HTMLElement)}})
    },{threshold:0,rootMargin:'70px 0px'})
    const discover=()=>{nodes.forEach(node=>{if(!node.isConnected){io.unobserve(node);active.current.get(node)?.cancel();active.current.delete(node);nodes.delete(node)}});document.querySelectorAll<HTMLElement>('main [data-reveal]').forEach(node=>{
      if(nodes.has(node))return
      nodes.add(node)
      const r=node.getBoundingClientRect()
      if(r.bottom<0||node.dataset.revealed==='true'){visible(node);return}
      node.dataset.revealed='false'
      if(typeof node.animate==='function')node.style.opacity='0'
      io.observe(node)
    })}
    const afterMenu=()=>{waitingForMenu.forEach(enter);waitingForMenu.clear()}
    window.addEventListener('copypump:menu-settled',afterMenu)
    discover();window.addEventListener('copypump:content-ready',discover)
    const focus=(event:FocusEvent)=>{
      const target=event.target as Element|null
      const node=target?.closest<HTMLElement>('[data-reveal]')
      if(node){io.unobserve(node);active.current.get(node)?.cancel();active.current.delete(node);visible(node)}
    }
    document.addEventListener('focusin',focus)
    return()=>{disposed=true;waitingForMenu.clear();window.removeEventListener('copypump:menu-settled',afterMenu);io.disconnect();window.removeEventListener('copypump:content-ready',discover);document.removeEventListener('focusin',focus);active.current.forEach(a=>a.cancel());active.current.clear();nodes.forEach(visible)}
  },[routeKey])

  // A single visible accent may run. Mobile uses one finite sweep, not a loop.
  useLayoutEffect(()=>{
    let inks:HTMLElement[]=[]
    const select=()=>{
      let selected:HTMLElement|undefined,score=Infinity
      for(const ink of inks){const r=ink.getBoundingClientRect();if(r.bottom>70&&r.top<innerHeight){const d=Math.abs(r.top-innerHeight*.35);if(d<score){score=d;selected=ink}}}
      inks.forEach(ink=>{ink.dataset.gradientRunning=ink===selected?'true':'false'})
    }
    if(!('IntersectionObserver'in window))return
    const io=new IntersectionObserver(select,{threshold:[0,.1,.5,1]})
    const discover=()=>{io.disconnect();inks=[...document.querySelectorAll<HTMLElement>('main [data-gradient]')];inks.forEach(ink=>io.observe(ink));select()}
    discover();window.addEventListener('copypump:content-ready',discover)
    return()=>{io.disconnect();window.removeEventListener('copypump:content-ready',discover);inks.forEach(ink=>delete ink.dataset.gradientRunning)}
  },[routeKey])
  const toggle=useCallback(()=>setPaused(old=>{const next=!old;try{localStorage.setItem('copypump.motion',next?'paused':'playing')}catch{}return next}),[])
  const value=useMemo(()=>({running,paused,reduced,modal,toggle,setModal}),[running,paused,reduced,modal,toggle])
  return <MotionContext.Provider value={value}>{children}</MotionContext.Provider>
}
export function MotionToggle(){const m=useMotion();return <button type="button" className="motion-toggle" onClick={m.toggle} disabled={m.reduced} aria-pressed={!m.paused&&!m.reduced}>Motion</button>}
export function Atmosphere(){return null}
