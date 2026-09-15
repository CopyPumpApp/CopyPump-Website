import { useEffect, useRef, type ReactNode } from 'react'
import { useMotion } from './Experience'

/**
 * CopyPump v47 rail
 * - compositor-only WAAPI autoplay (no per-frame React state / scrollLeft writes)
 * - hover never pauses
 * - offscreen/tab-hidden rails sleep
 * - drag/wheel/keyboard temporarily take control and autoplay resumes at the same phase
 */
export function AutoRail({ id, label, hint, speed = 20, children }: {
  id: string; label: string; hint: string; speed?: number; children: ReactNode
}) {
  const motion = useMotion()
  const viewport = useRef<HTMLDivElement>(null)
  const track = useRef<HTMLDivElement>(null)
  const settings = useRef({ running: motion.running, speed })
  settings.current = { running: motion.running, speed }

  useEffect(() => {
    const el = viewport.current
    const rail = track.current
    if (!el || !rail) return

    let disposed = false
    let unit = 0
    let animation: Animation | null = null
    let inView = !('IntersectionObserver' in window)
    let focused = false
    let dragging = false
    let pointerId = -1
    let dragStartX = 0
    let manualOffset = 0
    let resumeTimer = 0

    const wrap = (value: number) => {
      if (!unit) return value
      const local = ((value - unit) % unit + unit) % unit
      return unit + local
    }

    const duration = () => unit && settings.current.speed > 0 ? Math.max(8000, unit / settings.current.speed * 1000) : 60000

    const offsetFromAnimation = () => {
      if (!animation || !unit) return manualOffset || unit
      const d = duration()
      const time = Number(animation.currentTime || 0)
      const phase = ((time % d) + d) % d / d
      return unit + phase * unit
    }

    const paintManual = (offset: number) => {
      manualOffset = wrap(offset)
      rail.style.transform = `translate3d(${-manualOffset}px,0,0)`
    }

    const autoplayAllowed = () => settings.current.running && inView && !focused && !dragging && !motion.modal && !document.hidden

    const syncPlayback = () => {
      if (!animation) return
      if (autoplayAllowed()) {
        rail.style.transform = ''
        animation.play()
        el.dataset.railState = 'moving'
      } else {
        animation.pause()
        if (!dragging && !focused) el.dataset.railState = inView ? 'reading' : 'sleeping'
      }
    }

    const buildAnimation = (preserveOffset?: number) => {
      if (!unit || disposed) return
      const existingOffset = preserveOffset ?? (animation ? offsetFromAnimation() : unit)
      animation?.cancel()
      const d = duration()
      animation = rail.animate([
        { transform: `translate3d(${-unit}px,0,0)` },
        { transform: `translate3d(${-2 * unit}px,0,0)` },
      ], { duration: d, iterations: Infinity, easing: 'linear' })
      const phase = ((wrap(existingOffset) - unit) / unit)
      animation.currentTime = phase * d
      animation.pause()
      manualOffset = wrap(existingOffset)
      rail.style.transform = ''
      syncPlayback()
    }

    const measure = () => {
      const copies = el.querySelectorAll<HTMLElement>('.rail-copy')
      if (copies.length !== 3) return
      const next = copies[1].offsetLeft - copies[0].offsetLeft
      if (!Number.isFinite(next) || next <= 0) return
      const oldOffset = unit ? offsetFromAnimation() : next
      const oldUnit = unit || next
      const phase = oldUnit ? ((oldOffset - oldUnit) % oldUnit + oldUnit) % oldUnit / oldUnit : 0
      unit = next
      buildAnimation(unit + phase * unit)
    }

    const pauseForManual = () => {
      if (!unit) return
      window.clearTimeout(resumeTimer)
      const current = offsetFromAnimation()
      animation?.cancel()
      animation = null
      paintManual(current)
    }

    const scheduleResume = (delay = 420) => {
      window.clearTimeout(resumeTimer)
      resumeTimer = window.setTimeout(() => {
        if (disposed || !unit) return
        buildAnimation(manualOffset)
      }, delay)
    }

    const onFocusIn = (event: FocusEvent) => {
      const target = event.target as HTMLElement | null
      // Mouse/touch focus must not pause autoplay. Keyboard focus-visible does.
      if (!target?.matches(':focus-visible')) return
      focused = true; pauseForManual(); el.dataset.railState = 'reading'
    }
    const onFocusOut = (event: FocusEvent) => {
      if (el.contains(event.relatedTarget as Node | null)) return
      focused = false
      scheduleResume(120)
    }

    const onPointerDown = (event: PointerEvent) => {
      if (event.button !== 0) return
      if ((event.target as Element).closest('a,button,input,textarea,summary')) return
      dragging = true
      pointerId = event.pointerId
      dragStartX = event.clientX
      pauseForManual()
      el.dataset.dragging = 'true'
      el.dataset.railState = 'dragging'
      try { el.setPointerCapture(event.pointerId) } catch {}
    }

    const onPointerMove = (event: PointerEvent) => {
      if (!dragging || event.pointerId !== pointerId || !unit) return
      const dx = dragStartX - event.clientX
      dragStartX = event.clientX
      paintManual(manualOffset + dx)
    }

    const releasePointer = (event: PointerEvent) => {
      if (!dragging || (pointerId >= 0 && event.pointerId !== pointerId)) return
      dragging = false
      pointerId = -1
      delete el.dataset.dragging
      try { if (el.hasPointerCapture(event.pointerId)) el.releasePointerCapture(event.pointerId) } catch {}
      scheduleResume(280)
    }

    const onWheel = (event: WheelEvent) => {
      if (event.ctrlKey || !unit) return
      const horizontal = Math.abs(event.deltaX) > Math.abs(event.deltaY) || event.shiftKey
      if (!horizontal) return
      const delta = event.deltaX || event.deltaY
      if (!delta) return
      event.preventDefault()
      pauseForManual()
      paintManual(manualOffset + delta)
      scheduleResume(320)
    }

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.target !== el || !unit) return
      if (!['ArrowRight', 'ArrowLeft', 'Home', 'End'].includes(event.key)) return
      event.preventDefault()
      pauseForManual()
      const card = el.querySelector<HTMLElement>('.rail-copy:nth-child(2) > *')
      const step = card ? card.offsetWidth + 20 : el.clientWidth * .72
      if (event.key === 'ArrowRight') paintManual(manualOffset + step)
      else if (event.key === 'ArrowLeft') paintManual(manualOffset - step)
      else if (event.key === 'Home') paintManual(unit)
      else paintManual(unit * 2 - Math.min(step, unit * .25))
      scheduleResume(420)
    }

    const io = 'IntersectionObserver' in window
      ? new IntersectionObserver(([entry]) => {
          inView = entry.isIntersecting
          syncPlayback()
        }, { threshold: 0, rootMargin: '60px 0px' })
      : null
    io?.observe(el)

    let measureRaf = 0
    const queueMeasure = () => {
      cancelAnimationFrame(measureRaf)
      measureRaf = requestAnimationFrame(measure)
    }
    const ro = 'ResizeObserver' in window ? new ResizeObserver(queueMeasure) : null
    ro?.observe(el)
    const middleCopy = el.querySelector<HTMLElement>('.rail-copy:nth-child(2)')
    if (middleCopy) ro?.observe(middleCopy)

    const onVisibility = () => syncPlayback()
    document.addEventListener('visibilitychange', onVisibility)
    el.addEventListener('focusin', onFocusIn)
    el.addEventListener('focusout', onFocusOut)
    el.addEventListener('pointerdown', onPointerDown)
    el.addEventListener('pointermove', onPointerMove)
    el.addEventListener('pointerup', releasePointer)
    el.addEventListener('pointercancel', releasePointer)
    el.addEventListener('lostpointercapture', releasePointer)
    el.addEventListener('wheel', onWheel, { passive: false })
    el.addEventListener('keydown', onKeyDown)

    queueMeasure()

    return () => {
      disposed = true
      window.clearTimeout(resumeTimer)
      cancelAnimationFrame(measureRaf)
      animation?.cancel()
      io?.disconnect()
      ro?.disconnect()
      document.removeEventListener('visibilitychange', onVisibility)
      rail.style.transform = ''
      el.removeEventListener('focusin', onFocusIn)
      el.removeEventListener('focusout', onFocusOut)
      el.removeEventListener('pointerdown', onPointerDown)
      el.removeEventListener('pointermove', onPointerMove)
      el.removeEventListener('pointerup', releasePointer)
      el.removeEventListener('pointercancel', releasePointer)
      el.removeEventListener('lostpointercapture', releasePointer)
      el.removeEventListener('wheel', onWheel)
      el.removeEventListener('keydown', onKeyDown)
    }
  }, [id, motion.running, motion.modal, speed])

  return <div className="auto-rail" data-rail={id}>
    <div className="rail-viewport" ref={viewport} role="region" tabIndex={0} aria-label={label} aria-describedby={`${id}-help`}>
      <div className="rail-track" ref={track}>
        <div className="rail-copy" aria-hidden="true" inert>{children}</div>
        <div className="rail-copy" role="list">{children}</div>
        <div className="rail-copy" aria-hidden="true" inert>{children}</div>
      </div>
    </div>
    <p className="rail-help" id={`${id}-help`}><span aria-hidden="true">↔</span>{hint}</p>
  </div>
}
