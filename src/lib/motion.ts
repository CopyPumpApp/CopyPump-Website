let scrollAnimationId = 0

function cancelSmoothScroll() {
  scrollAnimationId += 1
}

export function smoothScrollToId(id: string, offset = 92) {
  const target = document.getElementById(id)
  if (!target) return

  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  const start = window.scrollY
  const end = Math.max(0, target.getBoundingClientRect().top + start - offset)
  const distance = end - start

  cancelSmoothScroll()
  const animationId = scrollAnimationId

  if (reduce || Math.abs(distance) < 8) {
    window.scrollTo(0, end)
    return
  }

  const duration = Math.min(700, Math.max(430, Math.abs(distance) * 0.24))
  const began = performance.now()
  const ease = (t: number) => 1 - Math.pow(1 - t, 3)

  const cancelEvents: Array<keyof WindowEventMap> = ['wheel', 'touchstart', 'pointerdown', 'keydown']
  const cancel = () => cancelSmoothScroll()
  cancelEvents.forEach(eventName => window.addEventListener(eventName, cancel, { passive: true, once: true }))

  const cleanup = () => {
    cancelEvents.forEach(eventName => window.removeEventListener(eventName, cancel))
  }

  const tick = (now: number) => {
    if (animationId !== scrollAnimationId) {
      cleanup()
      return
    }
    const t = Math.min(1, (now - began) / duration)
    window.scrollTo(0, start + distance * ease(t))
    if (t < 1) requestAnimationFrame(tick)
    else cleanup()
  }

  requestAnimationFrame(tick)
}

export function navigateLocal(path: string) {
  cancelSmoothScroll()
  const locale = document.documentElement.lang === 'ru' ? 'ru' : 'en'
  const raw = path === '/ru' ? '/' : path.startsWith('/ru/') ? path.slice(3) : path
  const localized = locale === 'ru' ? (raw === '/' ? '/ru' : `/ru${raw}`) : raw
  if (window.location.pathname === localized) return
  window.history.pushState({}, '', localized)
  window.dispatchEvent(new PopStateEvent('popstate'))
  window.scrollTo({ top: 0, behavior: 'auto' })
}
