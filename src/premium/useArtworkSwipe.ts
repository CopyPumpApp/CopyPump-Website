import {useEffect,useRef,type PointerEvent as ReactPointerEvent,type MouseEvent as ReactMouseEvent} from 'react'

type Gesture={id:number;x:number;y:number;axis:'pending'|'x'|'y';threshold:number}
/** Gestures belong ONLY to the artwork, never to the capital slider or prose. */
export function useArtworkSwipe(onStep:(direction:1|-1)=>void){
  const action=useRef(onStep),gesture=useRef<Gesture|null>(null)
  const touches=useRef(new Set<number>()),suppressClick=useRef(false)
  action.current=onStep
  useEffect(()=>{const reset=()=>{gesture.current=null;touches.current.clear()};
    window.addEventListener('blur',reset);document.addEventListener('visibilitychange',reset)
    return()=>{reset();window.removeEventListener('blur',reset);document.removeEventListener('visibilitychange',reset)}
  },[])
  const classify=(state:Gesture,x:number,y:number)=>{
    const dx=x-state.x,dy=y-state.y,ax=Math.abs(dx),ay=Math.abs(dy)
    if(state.axis==='pending'&&Math.max(ax,ay)>=12){
      if(ax>=ay*1.5)state.axis='x'
      else if(ay>=ax)state.axis='y'
    }
    return {dx,dy}
  }
  const reset=(node:HTMLDivElement,id:number)=>{
    gesture.current=null;delete node.dataset.dragging
    try{if(node.hasPointerCapture(id))node.releasePointerCapture(id)}catch{/* Pointer was cancelled by the browser. */}
  }
  return {
    onPointerDown:(event:ReactPointerEvent<HTMLDivElement>)=>{
      if(event.pointerType==='touch'){
        touches.current.add(event.pointerId)
        if(touches.current.size>1||!event.isPrimary){gesture.current=null;delete event.currentTarget.dataset.dragging;return}
      }
      if(event.button!==0||(event.target as Element).closest('a,button,input,select,textarea,[contenteditable="true"]'))return
      suppressClick.current=false
      gesture.current={id:event.pointerId,x:event.clientX,y:event.clientY,axis:'pending',threshold:Math.min(68,Math.max(44,event.currentTarget.clientWidth*.12))}
      // Capture doesn't disable pan-y/pinch zoom; native scroll sends pointercancel.
      try{event.currentTarget.setPointerCapture(event.pointerId)}catch{/* Synthetic test event or released pointer. */}
    },
    onPointerMove:(event:ReactPointerEvent<HTMLDivElement>)=>{
      const state=gesture.current;if(!state||state.id!==event.pointerId)return
      classify(state,event.clientX,event.clientY)
      if(state.axis==='x'){event.currentTarget.dataset.dragging='true';if(event.cancelable)event.preventDefault()}
    },
    onPointerUp:(event:ReactPointerEvent<HTMLDivElement>)=>{
      touches.current.delete(event.pointerId)
      const state=gesture.current;if(!state||state.id!==event.pointerId)return
      const {dx,dy}=classify(state,event.clientX,event.clientY)
      const commit=state.axis==='x'&&Math.abs(dx)>=state.threshold&&Math.abs(dx)>=Math.abs(dy)*1.5
      reset(event.currentTarget,event.pointerId)
      if(commit){suppressClick.current=true;action.current(dx<0?1:-1)}
    },
    onPointerCancel:(event:ReactPointerEvent<HTMLDivElement>)=>{
      touches.current.delete(event.pointerId)
      if(gesture.current?.id===event.pointerId)reset(event.currentTarget,event.pointerId)
    },
    onLostPointerCapture:(event:ReactPointerEvent<HTMLDivElement>)=>{
      if(gesture.current?.id===event.pointerId){gesture.current=null;delete event.currentTarget.dataset.dragging}
    },
    onDragStart:(event:React.DragEvent<HTMLDivElement>)=>event.preventDefault(),
    onClickCapture:(event:ReactMouseEvent<HTMLDivElement>)=>{
      if(suppressClick.current){suppressClick.current=false;event.preventDefault();event.stopPropagation()}
    },
  }
}
