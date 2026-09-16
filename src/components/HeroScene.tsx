import { useEffect, useRef, useState } from 'react'
import { useI18n } from '../i18n'
import { useMotion } from './Experience'
export const workflowObjects = ['detect-cutout-final', 'qualify-cutout-final', 'constrain-cutout-final', 'execute-prove-cutout-final']
const workflowAsset = (name:string) => `/workflow-objects/${name}.webp?v=20260916-light`
export function HeroScene() {
  const { dict } = useI18n(), c = dict.cinema.hero, motion = useMotion()
  const [stage, setStage] = useState(0), [held, setHeld] = useState(false), [inView, setInView] = useState(true), [firstReady, setFirstReady] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  useEffect(() => {
    if (!ref.current || !('IntersectionObserver' in window)) return
    const io = new IntersectionObserver(([e]) => setInView(e.isIntersecting), { threshold: .12, rootMargin: '120px 0px' })
    io.observe(ref.current); return () => io.disconnect()
  }, [])
  useEffect(() => {
    let cancelled = false
    const first = new Image()
    first.src = workflowAsset(workflowObjects[0])
    const ready = () => { if (!cancelled) setFirstReady(true) }
    if (typeof first.decode === 'function') first.decode().then(ready, ready)
    else { first.onload = ready; first.onerror = ready }
    const warmRest = () => workflowObjects.slice(1).forEach(name => { const image = new Image(); image.src = workflowAsset(name); image.decoding = 'async' })
    const win = window as Window & typeof globalThis & { requestIdleCallback?: (cb: IdleRequestCallback, options?: IdleRequestOptions) => number; cancelIdleCallback?: (id:number) => void }
    let idleId: number | undefined
    let timeoutId: number | undefined
    if (win.requestIdleCallback) idleId = win.requestIdleCallback(warmRest, { timeout: 1800 })
    else timeoutId = globalThis.setTimeout(warmRest, 700) as unknown as number
    return () => { cancelled = true; if (idleId !== undefined) win.cancelIdleCallback?.(idleId); if (timeoutId !== undefined) globalThis.clearTimeout(timeoutId) }
  }, [])
  const cycling = motion.running && inView && !held && firstReady
  useEffect(() => { if (!cycling) return; const id = setInterval(() => setStage(n => (n + 1) % 4), 5200); return () => clearInterval(id) }, [cycling])
  return <div ref={ref} className={`hero-scene phase-${stage}`} data-reveal="0" data-reveal-kind="hero" data-cycling={cycling ? 'true' : 'false'}>
    <div className="scene-topline"><span>{c.scene}</span><span className="scene-phase">0{stage+1} / 04</span></div>
    <div className="scene-space">
      <div className="scene-aura" aria-hidden="true"/>
      <div className="scene-objects">{workflowObjects.map((name, i) => <div className={`scene-object ${stage === i ? 'active' : ''}`} key={name} aria-hidden="true"><img src={workflowAsset(name)} width="440" height="560" loading={i === 0 ? 'eager' : 'lazy'} fetchPriority={i === 0 ? 'high' : 'low'} decoding="async" alt="" draggable={false}/></div>)}</div>
    </div>
    <div className="scene-caption"><div><strong>{c.stages[stage]}</strong><p>{c.notes[stage]}</p></div><button className="scene-play" onClick={() => setHeld(v => !v)} disabled={!motion.running} aria-label={held ? c.loop : c.hold}>{held ? '▶' : 'Ⅱ'}</button></div>
    <div className="scene-steps" role="group" aria-label={c.scene}>{c.stages.map((s, i) => <button key={s} onClick={() => { setStage(i); setHeld(true) }} aria-pressed={stage === i}><span>0{i+1}</span><i aria-hidden="true"/>{s}</button>)}</div>
    <p className="scene-disclaimer">{c.sceneNote}</p>
  </div>
}
