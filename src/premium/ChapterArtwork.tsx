import {useEffect,useRef,useState} from 'react'
/** At most one outgoing visual; rapid selections replace, never queue ghosts. */
export function ChapterArtwork({name,running}:{name:string;running:boolean}){
 const [shown,setShown]=useState(name),[old,setOld]=useState<string|null>(null),current=useRef(name)
 useEffect(()=>{if(current.current===name)return;setOld(running?current.current:null);setShown(name);current.current=name},[name,running])
 useEffect(()=>{if(!running){setOld(null);return}if(!old)return;const timer=setTimeout(()=>setOld(null),460);return()=>clearTimeout(timer)},[old,shown,running])
 const picture=(asset:string,ghost=false)=><picture key={asset} className={ghost?'chapter-ghost':'chapter-current'} aria-hidden="true"><source media="(max-width:600px)" srcSet={`/media/v48/${asset}-480.webp`}/><img src={`/media/v48/${asset}-800.webp`} width="800" height="1019" decoding="async" loading="lazy" alt=""/></picture>
 return <div className="chapter-art-stack">{old&&old!==shown&&picture(old,true)}{picture(shown)}</div>
}
