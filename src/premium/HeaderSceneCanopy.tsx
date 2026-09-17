import {useLayoutEffect,useState,type RefObject} from 'react'
import {createPortal} from 'react-dom'
import {sceneSource,type SceneTheme} from './sceneThemes'
import './header-canopy.css'

/** Show the current scene, rather than scrolling copy, underneath navigation.
 * This is an explicitly clipped second rendering of the already loaded image,
 * not a second artwork request or a dependency on platform backdrop filtering.
 */
export function HeaderSceneCanopy({theme,previous,sceneRef}:{
  theme:SceneTheme;previous:SceneTheme|null;sceneRef:RefObject<HTMLDivElement|null>
}){
  const [target,setTarget]=useState<HTMLElement|null>(null)
  const [scene,setScene]=useState('hero')
  useLayoutEffect(()=>{
    setTarget(document.querySelector<HTMLElement>('.site-header'))
    const root=sceneRef.current
    if(!root)return
    const sync=()=>setScene(root.dataset.scene||'document')
    sync()
    const observer=new MutationObserver(sync)
    observer.observe(root,{attributes:true,attributeFilter:['data-scene']})
    return()=>observer.disconnect()
  },[sceneRef])
  if(!target)return null
  return createPortal(<div className="header-scene-canopy" aria-hidden="true">
    <div className="header-scene-canopy__viewport" data-scene={scene} data-theme={theme}>
      <img className="header-scene-canopy__art" data-canopy-theme={theme} src={sceneSource(theme)} width="1672" height="941" decoding="async" alt=""/>
      {previous&&previous!==theme&&<img className="header-scene-canopy__previous" key={`${previous}-${theme}`} data-canopy-theme={previous} src={sceneSource(previous)} width="1672" height="941" alt=""/>}
      <div className="scene-scrim"/><div className="scene-reading-veil"/>
      <div className="scene-light scene-light--cyan"/><div className="scene-light scene-light--violet"/>
    </div>
  </div>,target)
}
