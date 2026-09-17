import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react'
import { useMotion } from '../components/Experience'

type Phase = 'closed' | 'opening' | 'open' | 'closing'

/** Bounded, reversible state machine. Modal lifetime is independent of animation. */
export function useAnimatedMenu() {
  const { paused, reduced, setModal } = useMotion()
  const [phase, setPhase] = useState<Phase>('closed')
  const [shown, setShown] = useState(false)
  const mounted = phase !== 'closed'
  const trigger = useRef<HTMLButtonElement>(null)
  const sheet = useRef<HTMLDivElement>(null)
  const closeButton = useRef<HTMLButtonElement>(null)
  const restore = useRef(true)
  const close = useCallback(() => setPhase(old => old === 'closed' ? old : 'closing'), [])
  const open = useCallback(() => { restore.current = true; setPhase('opening') }, [])
  const destination = useCallback(() => { restore.current = false; close() }, [close])
  const reverse = useCallback(() => setPhase(old => old === 'closing' ? 'opening' : 'closing'), [])

  useLayoutEffect(() => {
    if (!mounted) return
    const root = document.documentElement, body = document.body, app = document.getElementById('root')
    const before = { root: root.style.overflow, body: body.style.overflow, inert: app?.inert ?? false, y: scrollY, path: location.pathname }
    setModal(true); root.classList.add('nav-open'); root.style.overflow = 'hidden'; body.style.overflow = 'hidden'
    closeButton.current?.focus({ preventScroll: true }); if (app) app.inert = true
    const keys = (e:KeyboardEvent) => {
      if (e.key === 'Escape') { e.preventDefault(); close(); return }
      if (e.key !== 'Tab') return
      const nodes = [...sheet.current!.querySelectorAll<HTMLElement>('a[href],button:not(:disabled)')].filter(x => x.getClientRects().length > 0)
      const first = nodes[0], last = nodes[nodes.length - 1]
      if (e.shiftKey && (document.activeElement === first || !sheet.current?.contains(document.activeElement))) { e.preventDefault(); last?.focus({ preventScroll: true }) }
      else if (!e.shiftKey && (document.activeElement === last || !sheet.current?.contains(document.activeElement))) { e.preventDefault(); first?.focus({ preventScroll: true }) }
    }
    const focus = (e:FocusEvent) => { if (!sheet.current?.contains(e.target as Node)) closeButton.current?.focus({ preventScroll: true }) }
    const pop = () => {
      if (location.pathname.replace(/^\/ru(?=\/|$)/,'') !== before.path.replace(/^\/ru(?=\/|$)/,'')) destination()
    }
    document.addEventListener('keydown', keys); document.addEventListener('focusin', focus); window.addEventListener('popstate', pop)
    return () => {
      document.removeEventListener('keydown', keys); document.removeEventListener('focusin', focus); window.removeEventListener('popstate', pop)
      if (app) app.inert = before.inert
      root.style.overflow = before.root; body.style.overflow = before.body; root.classList.remove('nav-open'); setModal(false)
      if (restore.current) {
        if (location.pathname === before.path && Math.abs(scrollY - before.y) > 2) scrollTo({ top: before.y, behavior: 'auto' })
        trigger.current?.focus({ preventScroll: true })
      } else document.getElementById('main-content')?.focus({ preventScroll: true })
    }
  }, [mounted, close, destination, setModal])

  useLayoutEffect(() => {
    let raf = 0, timer = 0
    if (phase === 'closed') { setShown(false); return }
    if (paused || reduced) {
      setShown(phase !== 'closing')
      if (phase === 'closing') setPhase('closed')
      else if (phase === 'opening') setPhase('open')
      return
    }
    if (phase === 'opening') {
      // Paint the initial mask once; reversing an exit uses current CSS interpolation.
      raf = requestAnimationFrame(() => { raf = requestAnimationFrame(() => setShown(true)) })
      timer = window.setTimeout(() => setPhase(old => old === 'opening' ? 'open' : old), 680)
    } else if (phase === 'closing') {
      setShown(false)
      timer = window.setTimeout(() => setPhase(old => old === 'closing' ? 'closed' : old), 260)
    }
    return () => { cancelAnimationFrame(raf); clearTimeout(timer) }
  }, [phase, paused, reduced])

  useEffect(() => {
    const hide = (event:PageTransitionEvent) => { if (event.persisted) setPhase('closed') }
    window.addEventListener('pageshow', hide)
    return () => window.removeEventListener('pageshow', hide)
  }, [])
  return { phase, shown, mounted, trigger, sheet, closeButton, open, close, reverse, destination }
}
