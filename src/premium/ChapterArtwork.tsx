import {useEffect,useLayoutEffect,useRef,useState} from 'react'
import {ART} from './content'

/** Directional sweep, not a crossfade: last selection wins and no ghost queue. */
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
  const picture=(asset:string,ghost:boolean)=><picture key={`${asset}-${ghost?'old':turn}`} className={ghost?'chapter-ghost':'chapter-current'} aria-hidden="true"><source media="(max-width:600px)" srcSet={`/media/v48/${asset}-480.webp`}/><img src={`/media/v48/${asset}-800.webp`} width="800" height="1019" decoding="async" loading="lazy" alt=""/></picture>
  return <div ref={root} className="chapter-art-stack" data-direction={direction===1?'forward':'back'} data-sweeping={old?'true':'false'}>
    {old&&old!==shown&&picture(old,true)}{picture(shown,false)}
    {old&&running&&<i className="object-sweep-light" key={`light-${turn}`} aria-hidden="true"/>}
  </div>
}
