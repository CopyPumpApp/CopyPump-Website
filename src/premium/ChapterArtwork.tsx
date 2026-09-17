import {useEffect,useLayoutEffect,useRef,useState} from 'react'
import {ART} from './content'

/** Directional sweep: retain the already painted outgoing DOM/image; no ghost queue. */
export function ChapterArtwork({name,running}:{name:string;running:boolean}) {
  const [shown,setShown]=useState(name),[old,setOld]=useState<string|null>(null),[turn,setTurn]=useState(0)
  const [direction,setDirection]=useState(1),current=useRef(name),root=useRef<HTMLDivElement>(null)
  useLayoutEffect(()=>{
    if(current.current===name)return
    setDirection(ART.objects.indexOf(name as typeof ART.objects[number])>=ART.objects.indexOf(current.current as typeof ART.objects[number])?1:-1)
    setOld(running?current.current:null);current.current=name;setShown(name);setTurn(t=>t+1)
  },[name,running])
  useEffect(()=>{
    if(!running){setOld(null);return}
    if(!old)return
    const timer=setTimeout(()=>setOld(null),1160);return()=>clearTimeout(timer)
  },[old,turn,running])
  // The parent's selection handler has already decoded the chosen source. These
  // two tiny, bounded transition layers must not use viewport-based lazy loading:
  // the incoming layer intentionally starts outside the clipped stage.
  // Key by artwork identity, never by its outgoing/current role or transition ID.
  const picture=(asset:string,ghost:boolean)=><picture key={asset} className={ghost?'chapter-ghost':'chapter-current'} aria-hidden="true"><source media="(max-width:600px)" srcSet={`/media/v48/${asset}-480.webp`}/><img src={`/media/v48/${asset}-800.webp`} width="800" height="1019" decoding="sync" loading="eager" alt=""/></picture>
  return <div ref={root} className="chapter-art-stack" data-direction={direction===1?'forward':'back'} data-sweeping={old?'true':'false'}>
    {old&&old!==shown&&picture(old,true)}{picture(shown,false)}
    {old&&running&&<i className="object-sweep-light" key={`light-${turn}`} aria-hidden="true"/>}
  </div>
}
