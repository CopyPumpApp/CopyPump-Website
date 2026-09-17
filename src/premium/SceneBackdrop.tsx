import { useLayoutEffect, useRef, useState } from 'react'
import { useMotion } from '../components/Experience'
import { ART } from './content'

/** One persistent image, outside all moving page/overlay ancestors. */
export function SceneBackdrop({ routeKey }: { routeKey: string }) {
  const { modal } = useMotion()
  const layer = useRef<HTMLDivElement>(null)
  const [ready, setReady] = useState(false)
  useLayoutEffect(() => {
    const node = layer.current
    if (!node) return
    const defaults = routeKey.endsWith(':/') ? 'hero' : 'document'
    node.dataset.scene = defaults
    const scenes = [...document.querySelectorAll<HTMLElement>('main [data-scene]')]
    if (!scenes.length || !('IntersectionObserver' in window)) return
    // A narrow viewport band chooses one scene. No per-scroll frame loop.
    let observer: IntersectionObserver | undefined
    let resizeFrame = 0
    const chooseScene = () => {
      const y = innerHeight * .43
      const nearest = scenes.reduce<HTMLElement | null>((best, item) => {
        const a = item.getBoundingClientRect()
        const distance = Math.max(a.top - y, y - a.bottom, 0)
        if (!best) return item
        const b = best.getBoundingClientRect()
        return distance < Math.max(b.top - y, y - b.bottom, 0) ? item : best
      }, null)
      if (nearest) node.dataset.scene = nearest.dataset.scene || defaults
    }
    const observe = () => {
      resizeFrame = 0
      observer?.disconnect()
      // IntersectionObserver resolves percentages against WIDTH, including vertical
      // margins. Use height-derived pixels so the band also works in landscape.
      const top = Math.round(innerHeight * .38), bottom = Math.round(innerHeight * .52)
      observer = new IntersectionObserver(chooseScene, {
        threshold: 0, rootMargin: `-${top}px 0px -${bottom}px 0px`,
      })
      scenes.forEach(item => observer!.observe(item))
      chooseScene()
    }
    const resize = () => { if (!resizeFrame) resizeFrame = requestAnimationFrame(observe) }
    observe()
    addEventListener('resize', resize, { passive: true })
    return () => { observer?.disconnect(); removeEventListener('resize', resize); cancelAnimationFrame(resizeFrame) }
  }, [routeKey])
  return <div ref={layer} className="scene-backdrop" data-menu={modal ? 'true' : 'false'}
    data-ready={ready ? 'true' : 'false'} aria-hidden="true">
    <picture className="scene-art">
      <source media="(max-width:760px)" srcSet={ART.backgroundSmall}/>
      <img src={ART.background} width="1600" height="900" fetchPriority="high"
        decoding="async" onLoad={() => setReady(true)} alt=""/>
    </picture>
    <div className="scene-scrim"/>
    <div className="scene-reading-veil"/>
    <div className="scene-light scene-light--cyan"/>
    <div className="scene-light scene-light--violet"/>
  </div>
}
