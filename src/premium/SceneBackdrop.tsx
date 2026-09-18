import {useEffect,useLayoutEffect,useRef,useState} from 'react'
import {useMotion} from '../components/Experience'
import {themeForPath,sceneSource,SCENE_THEMES,type SceneTheme} from './sceneThemes'
import {HeaderSceneCanopy} from './HeaderSceneCanopy'

/** Native-resolution route art; at most one outgoing background during a handoff. */
export function SceneBackdrop({routeKey}:{routeKey:string}) {
  const motion=useMotion(),routeTheme=themeForPath(routeKey.slice(routeKey.indexOf(':')+1))
  const [theme,setTheme]=useState<SceneTheme>(routeTheme),[previous,setPrevious]=useState<SceneTheme|null>(null)
  const [wanted,setWanted]=useState<SceneTheme>(routeTheme),[ready,setReady]=useState(false)
  const layer=useRef<HTMLDivElement>(null),loaded=useRef(new Set<SceneTheme>()),current=useRef(theme),request=useRef(0),sectionTheme=useRef<SceneTheme>(routeTheme)
  const canAnimate=!motion.paused&&!motion.reduced
  useLayoutEffect(()=>{const img=layer.current?.querySelector<HTMLImageElement>('.scene-art img');if(img?.complete&&img.naturalWidth){setReady(true);loaded.current.add(theme)}},[theme])
  useEffect(()=>{
    const fn=(e:Event)=>{const path=(e as CustomEvent<string|null>).detail;setWanted(path?themeForPath(path):sectionTheme.current)}
    addEventListener('copypump:scene-preview',fn);setWanted(routeTheme)
    return()=>removeEventListener('copypump:scene-preview',fn)
  },[routeTheme])
  useEffect(()=>{if(!motion.modal)setWanted(sectionTheme.current)},[motion.modal,routeTheme])
  useEffect(()=>{
    if(wanted===current.current)return
    const token=++request.current
    const delay=window.setTimeout(async()=>{
      try {
        if(!loaded.current.has(wanted)){const img=new Image();img.src=sceneSource(wanted);await img.decode();loaded.current.add(wanted)}
        if(request.current!==token)return
        setPrevious(canAnimate?current.current:null);current.current=wanted;setTheme(wanted)
      }catch{/* The last decoded scene remains visible. Navigation is not blocked. */}
    },motion.modal?100:0)
    return()=>{clearTimeout(delay);request.current++}
  },[wanted,canAnimate,motion.modal])
  useEffect(()=>{
    if(!canAnimate){setPrevious(null);return}
    if(!previous)return
    const timer=setTimeout(()=>setPrevious(null),1050);return()=>clearTimeout(timer)
  },[previous,theme,canAnimate])
  useLayoutEffect(()=>{
    const node=layer.current;if(!node)return
    sectionTheme.current=routeTheme;node.dataset.scene=routeTheme==='home'?'hero':'document'
    let observer:IntersectionObserver|undefined,frame=0,sections:HTMLElement[]=[]
    const choose=()=>{
      if(!sections.length)return
      const y=innerHeight*.46
      let best=sections[0],distance=Infinity
      for(const section of sections){const r=section.getBoundingClientRect(),d=Math.max(r.top-y,y-r.bottom,0);if(d<distance){distance=d;best=section}}
      node.dataset.scene=best.dataset.scene||'document'
      if(routeTheme==='home'){sectionTheme.current=best.id==='community'?'community':'home';if(!document.documentElement.classList.contains('nav-open'))setWanted(sectionTheme.current)}
    }
    const discover=()=>{
      frame=0;observer?.disconnect();sections=[...document.querySelectorAll<HTMLElement>('main [data-scene]')]
      if(!('IntersectionObserver'in window))return
      observer=new IntersectionObserver(choose,{threshold:0,rootMargin:`-${Math.round(innerHeight*.38)}px 0px -${Math.round(innerHeight*.5)}px 0px`})
      sections.forEach(s=>observer?.observe(s));choose()
    }
    const resize=()=>{if(!frame)frame=requestAnimationFrame(discover)}
    discover();addEventListener('resize',resize,{passive:true});addEventListener('copypump:content-ready',discover)
    return()=>{observer?.disconnect();cancelAnimationFrame(frame);removeEventListener('resize',resize);removeEventListener('copypump:content-ready',discover)}
  },[routeKey,routeTheme])
  return <><div ref={layer} className="scene-backdrop" data-theme={theme} data-menu={motion.modal?'true':'false'} data-ready={ready?'true':'false'} aria-hidden="true">
    <picture className="scene-art"><img data-art-theme={theme} src={sceneSource(theme)} width="1672" height="941" fetchPriority="high" decoding="async" alt="" onLoad={()=>{setReady(true);loaded.current.add(theme)}}/></picture>
    {previous&&previous!==theme&&<img className="scene-art-previous" key={`${previous}-${theme}`} data-art-theme={previous} src={sceneSource(previous)} width="1672" height="941" alt=""/>}
    <div className="scene-scrim"/><div className="scene-reading-veil"/>
    <div className="scene-light scene-light--cyan"/><div className="scene-light scene-light--violet"/>
    <div className="scene-atmosphere"/>
  </div><HeaderSceneCanopy theme={theme} previous={previous} sceneRef={layer}/></>
}
