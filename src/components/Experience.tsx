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
    const nodes=[...document.querySelectorAll<HTMLElement>('main [data-reveal]')]
    if(!allowed.current||!('IntersectionObserver'in window)||document.documentElement.classList.contains('nav-open')) {
      nodes.forEach(visible);return
    }
    let disposed=false
    const enter=(node:HTMLElement)=>{
      if(node.dataset.revealed==='true'||!allowed.current||typeof node.animate!=='function'){visible(node);return}
      node.dataset.revealed='true';node.style.opacity='1';node.style.willChange='opacity, transform'
      const kind=node.dataset.reveal
      const from = kind==='heading'?{opacity:.25,transform:'translate3d(0,108%,0)'}:
        kind==='depth'?{opacity:0,transform:'translate3d(0,20px,0) scale(.985)'}:
          {opacity:0,transform:'translate3d(0,16px,0)'}
      const duration=kind==='heading'?880:kind==='depth'?820:680
      const delay=Math.min(210,Math.max(0,Number(node.dataset.delay)||0))
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
    nodes.forEach(node=>{
      const r=node.getBoundingClientRect()
      if(r.bottom<0){visible(node);return}
      node.dataset.revealed='false'
      // Hide only when the observer/animation API can reliably reveal again.
      if(typeof node.animate==='function')node.style.opacity='0'
      io.observe(node)
    })
    const focus=(event:FocusEvent)=>{
      const target=event.target as Element|null
      const node=target?.closest<HTMLElement>('[data-reveal]')
      if(node){io.unobserve(node);active.current.get(node)?.cancel();active.current.delete(node);visible(node)}
    }
    document.addEventListener('focusin',focus)
    return()=>{disposed=true;io.disconnect();document.removeEventListener('focusin',focus);active.current.forEach(a=>a.cancel());active.current.clear();nodes.forEach(visible)}
  },[routeKey])

  // A single visible accent may run. Mobile uses one finite sweep, not a loop.
  useLayoutEffect(()=>{
    const inks=[...document.querySelectorAll<HTMLElement>('main [data-gradient]')]
    if(!inks.length)return
    const select=()=>{
      let selected:HTMLElement|undefined,score=Infinity
      for(const ink of inks){const r=ink.getBoundingClientRect();if(r.bottom>70&&r.top<innerHeight){const d=Math.abs(r.top-innerHeight*.35);if(d<score){score=d;selected=ink}}}
      inks.forEach(ink=>{ink.dataset.gradientRunning=ink===selected?'true':'false'})
    }
    if(!('IntersectionObserver'in window))return
    const io=new IntersectionObserver(select,{threshold:[0,.1,.5,1]})
    inks.forEach(ink=>io.observe(ink));select()
    return()=>{io.disconnect();inks.forEach(ink=>delete ink.dataset.gradientRunning)}
  },[routeKey])
  const toggle=useCallback(()=>setPaused(old=>{const next=!old;try{localStorage.setItem('copypump.motion',next?'paused':'playing')}catch{}return next}),[])
  const value=useMemo(()=>({running,paused,reduced,modal,toggle,setModal}),[running,paused,reduced,modal,toggle])
  return <MotionContext.Provider value={value}>{children}</MotionContext.Provider>
}
export function MotionToggle(){const m=useMotion();return <button type="button" className="motion-toggle" onClick={m.toggle} disabled={m.reduced} aria-pressed={!m.paused&&!m.reduced}>Motion</button>}
export function Atmosphere(){return null}
