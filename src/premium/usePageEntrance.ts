import {useLayoutEffect, useRef, type RefObject} from 'react'
import {useMotion} from '../components/Experience'

/** The destination never paints over the outgoing navigation labels. */
export function usePageEntrance(routeKey:string, outlet:RefObject<HTMLDivElement|null>) {
  const {paused,reduced,modal}=useMotion()
  const previous=useRef(routeKey),allowed=useRef(!paused&&!reduced)
  const active=useRef<Animation|null>(null)
  useLayoutEffect(()=>{
    allowed.current=!paused&&!reduced
    if(!allowed.current||modal){active.current?.cancel();active.current=null}
  },[paused,reduced,modal])
  useLayoutEffect(()=>{
    if(previous.current===routeKey)return
    previous.current=routeKey
    let frame=0,disposed=false
    const begin=()=>{
      window.removeEventListener('copypump:menu-settled',begin)
      frame=requestAnimationFrame(()=>{
        frame=0
        if(disposed||!allowed.current||document.documentElement.classList.contains('nav-open')||!outlet.current?.animate)return
        active.current?.cancel()
        const animation=outlet.current.animate(
          [{opacity:0,transform:'translate3d(0,18px,0)'},{opacity:1,transform:'none'}],
          {duration:760,easing:'cubic-bezier(.22,1,.36,1)',fill:'backwards'},
        )
        active.current=animation
        animation.finished.then(()=>{
          if(active.current===animation){active.current=null;animation.cancel()}
        },()=>{})
      })
    }
    if(document.documentElement.classList.contains('nav-open'))window.addEventListener('copypump:menu-settled',begin)
    else begin()
    return()=>{disposed=true;cancelAnimationFrame(frame);window.removeEventListener('copypump:menu-settled',begin);active.current?.cancel();active.current=null}
  },[routeKey,outlet])
}
