import { useEffect, useRef, type ReactNode } from 'react'
import { useMotion } from './Experience'

export function AutoRail({id,label,speed=20,children}:{id:string;label:string;hint?:string;speed?:number;children:ReactNode}){
  const motion=useMotion(),viewport=useRef<HTMLDivElement>(null),track=useRef<HTMLDivElement>(null)
  useEffect(()=>{
    const el=viewport.current,rail=track.current
    if(!el||!rail)return
    let disposed=false,unit=0,animation:Animation|null=null,inView=!("IntersectionObserver"in window),focused=false,dragging=false,pointerId=-1,dragStartX=0,manualOffset=0,resizeRaf=0,resumeTimer=0
    const wrap=(value:number)=>{if(!unit)return value;return unit+(((value-unit)%unit)+unit)%unit}
    const duration=()=>unit&&speed>0?Math.max(8000,unit/speed*1000):60000
    const currentOffset=()=>{if(!animation||!unit)return manualOffset||unit;const d=duration(),time=Number(animation.currentTime||0),phase=((time%d)+d)%d/d;return unit+phase*unit}
    const paint=(value:number)=>{manualOffset=wrap(value);rail.style.transform=`translate3d(${-manualOffset}px,0,0)`}
    const canRun=()=>motion.running&&inView&&!focused&&!dragging&&!motion.modal&&!document.hidden
    const sync=()=>{if(!animation)return;if(canRun()){rail.style.transform='';animation.play();el.dataset.railState='moving'}else{animation.pause();el.dataset.railState=inView?'reading':'sleeping'}}
    const build=()=>{if(disposed||!unit||animation)return;const d=duration();animation=rail.animate([{transform:`translate3d(${-unit}px,0,0)`},{transform:`translate3d(${-2*unit}px,0,0)`}],{duration:d,iterations:Infinity,easing:'linear'});animation.currentTime=((wrap(manualOffset||unit)-unit)/unit)*d;animation.pause();rail.style.transform='';sync()}
    const destroy=()=>{if(!animation)return;manualOffset=currentOffset();animation.cancel();animation=null;paint(manualOffset)}
    const measure=()=>{resizeRaf=0;const copies=el.querySelectorAll<HTMLElement>('.rail-copy');if(copies.length!==3)return;const next=copies[1].offsetLeft-copies[0].offsetLeft;if(!Number.isFinite(next)||next<=0)return;if(unit&&Math.abs(next-unit)<1)return;const oldUnit=unit||next,oldOffset=unit?currentOffset():next,phase=oldUnit?(((oldOffset-oldUnit)%oldUnit)+oldUnit)%oldUnit/oldUnit:0;destroy();unit=next;manualOffset=unit+phase*unit;build()}
    const queueMeasure=()=>{if(resizeRaf)return;resizeRaf=requestAnimationFrame(measure)}
    const pauseForInput=()=>{clearTimeout(resumeTimer);destroy()}
    const resume=(delay=260)=>{clearTimeout(resumeTimer);resumeTimer=window.setTimeout(()=>{if(!disposed)build()},delay)}
    const focusIn=(event:FocusEvent)=>{const target=event.target as HTMLElement|null;if(!target?.matches(':focus-visible'))return;focused=true;pauseForInput();el.dataset.railState='reading'}
    const focusOut=(event:FocusEvent)=>{if(el.contains(event.relatedTarget as Node|null))return;focused=false;resume(100)}
    const down=(event:PointerEvent)=>{if(event.button!==0||(event.target as Element).closest('a,button,input,textarea,summary'))return;dragging=true;pointerId=event.pointerId;dragStartX=event.clientX;pauseForInput();el.dataset.dragging='true';try{el.setPointerCapture(event.pointerId)}catch{}}
    const move=(event:PointerEvent)=>{if(!dragging||event.pointerId!==pointerId||!unit)return;const dx=dragStartX-event.clientX;dragStartX=event.clientX;paint(manualOffset+dx)}
    const release=(event:PointerEvent)=>{if(!dragging||(pointerId>=0&&event.pointerId!==pointerId))return;dragging=false;pointerId=-1;delete el.dataset.dragging;resume()}
    const wheel=(event:WheelEvent)=>{if(event.ctrlKey||!unit)return;const horizontal=Math.abs(event.deltaX)>Math.abs(event.deltaY)||event.shiftKey;if(!horizontal)return;event.preventDefault();pauseForInput();paint(manualOffset+(event.deltaX||event.deltaY));resume()}
    const key=(event:KeyboardEvent)=>{if(event.target!==el||!unit||!['ArrowRight','ArrowLeft','Home','End'].includes(event.key))return;event.preventDefault();pauseForInput();const card=el.querySelector<HTMLElement>('.rail-copy:nth-child(2) > *'),step=card?card.offsetWidth+20:el.clientWidth*.72;if(event.key==='ArrowRight')paint(manualOffset+step);else if(event.key==='ArrowLeft')paint(manualOffset-step);else if(event.key==='Home')paint(unit);else paint(unit*2-Math.min(step,unit*.25));resume()}
    const io='IntersectionObserver'in window?new IntersectionObserver(([entry])=>{inView=entry.isIntersecting;if(inView){build();sync()}else{destroy();el.dataset.railState='sleeping'}},{threshold:0,rootMargin:'120px 0px'}):null
    io?.observe(el)
    const ro='ResizeObserver'in window?new ResizeObserver(queueMeasure):null
    ro?.observe(el)
    document.addEventListener('visibilitychange',sync);el.addEventListener('focusin',focusIn);el.addEventListener('focusout',focusOut);el.addEventListener('pointerdown',down);el.addEventListener('pointermove',move);el.addEventListener('pointerup',release);el.addEventListener('pointercancel',release);el.addEventListener('wheel',wheel,{passive:false});el.addEventListener('keydown',key)
    queueMeasure()
    return()=>{disposed=true;clearTimeout(resumeTimer);if(resizeRaf)cancelAnimationFrame(resizeRaf);animation?.cancel();io?.disconnect();ro?.disconnect();document.removeEventListener('visibilitychange',sync);el.removeEventListener('focusin',focusIn);el.removeEventListener('focusout',focusOut);el.removeEventListener('pointerdown',down);el.removeEventListener('pointermove',move);el.removeEventListener('pointerup',release);el.removeEventListener('pointercancel',release);el.removeEventListener('wheel',wheel);el.removeEventListener('keydown',key)}
  },[id,motion.running,motion.modal,speed])
  return <div className="auto-rail" data-rail={id}><div className="rail-viewport" ref={viewport} role="region" tabIndex={0} aria-label={label}><div className="rail-track" ref={track}><div className="rail-copy" aria-hidden="true" inert>{children}</div><div className="rail-copy" role="list">{children}</div><div className="rail-copy" aria-hidden="true" inert>{children}</div></div></div></div>
}
