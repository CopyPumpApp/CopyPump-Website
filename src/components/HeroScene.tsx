import { useEffect, useRef, useState } from 'react'
import { useI18n } from '../i18n'
import { useMotion } from './Experience'
export const workflowObjects = ['detect-cutout-final-v47', 'qualify-cutout-final-v47', 'constrain-cutout-final-v47', 'execute-prove-cutout-final-v47']
const workflowAsset = (name:string) => `/workflow-objects/${name}.webp?v=20260916-clean`
export function HeroScene() {
  const { dict } = useI18n(), c = dict.cinema.hero, motion = useMotion()
  const [stage, setStage] = useState(0), [held, setHeld] = useState(false), [inView, setInView] = useState(true), [assetsReady, setAssetsReady] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  useEffect(() => {
    if (!ref.current || !('IntersectionObserver' in window)) return
    const io = new IntersectionObserver(([e]) => setInView(e.isIntersecting), { threshold: .12, rootMargin: '120px 0px' })
    io.observe(ref.current); return () => io.disconnect()
  }, [])
  useEffect(() => {
    let cancelled = false
    const preload = workflowObjects.map(name => new Promise<void>(resolve => {
      const image = new Image()
      image.src = workflowAsset(name)
      const done = () => resolve()
      if (typeof image.decode === 'function') image.decode().then(done, done)
      else { image.onload = done; image.onerror = done }
    }))
    Promise.all(preload).then(() => { if (!cancelled) setAssetsReady(true) })
    return () => { cancelled = true }
  }, [])
  const cycling = motion.running && inView && !held && assetsReady
  useEffect(() => { if (!cycling) return; const id = setInterval(() => setStage(n => (n + 1) % 4), 5200); return () => clearInterval(id) }, [cycling])
  return <div ref={ref} className={`hero-scene phase-${stage}`} data-reveal="0" data-reveal-kind="hero" data-cycling={cycling ? 'true' : 'false'}>
    <div className="scene-topline"><span>{c.scene}</span><span className="scene-phase">0{stage+1} / 04</span></div>
    <div className="scene-space">
      <div className="scene-aura" aria-hidden="true"/>
      <div className="scene-objects">{workflowObjects.map((name, i) => <div className={`scene-object ${stage === i ? 'active' : ''}`} key={name} aria-hidden="true"><img src={workflowAsset(name)} width="440" height="560" loading="eager" fetchPriority={i === 0 ? 'high' : 'auto'} decoding="async" alt="" draggable={false}/></div>)}</div>
    </div>
    <div className="scene-caption"><div><strong>{c.stages[stage]}</strong><p>{c.notes[stage]}</p></div><button className="scene-play" onClick={() => setHeld(v => !v)} disabled={!motion.running} aria-label={held ? c.loop : c.hold}>{held ? '▶' : 'Ⅱ'}</button></div>
    <div className="scene-steps" role="group" aria-label={c.scene}>{c.stages.map((s, i) => <button key={s} onClick={() => { setStage(i); setHeld(true) }} aria-pressed={stage === i}><span>0{i+1}</span><i aria-hidden="true"/>{s}</button>)}</div>
    <p className="scene-disclaimer">{c.sceneNote}</p>
  </div>
}
