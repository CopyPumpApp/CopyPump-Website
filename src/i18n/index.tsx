import { createContext, useContext, useEffect, useMemo, useRef, type ReactNode } from 'react'
import en from './en.json'
import ru from './ru.json'

export type Locale = 'en' | 'ru'
export type Dictionary = typeof en

const dictionaries: Record<Locale, Dictionary> = { en, ru }

function stripLocalePrefix(pathname: string) {
  if (pathname === '/ru') return '/'
  if (pathname.startsWith('/ru/')) return pathname.slice(3) || '/'
  return pathname || '/'
}

export function localizedPath(path: string, locale: Locale) {
  const normalized = path.startsWith('/') ? path : `/${path}`
  const base = stripLocalePrefix(normalized)
  return locale === 'ru' ? (base === '/' ? '/ru' : `/ru${base}`) : base
}

export function localeFromPath(pathname: string): Locale {
  return pathname === '/ru' || pathname.startsWith('/ru/') ? 'ru' : 'en'
}

const I18nContext = createContext<{
  locale: Locale
  dict: Dictionary
  setLocale: (locale: Locale) => void
  pathFor: (path: string) => string
} | null>(null)

export function I18nProvider({ locale, children }: { locale: Locale; children: ReactNode }) {
  const previousLocale = useRef<Locale | null>(null)
  useEffect(() => {
    if (previousLocale.current && previousLocale.current !== locale) {
      document.documentElement.classList.add('locale-changing')
      const timer = window.setTimeout(() => document.documentElement.classList.remove('locale-changing'), 280)
      previousLocale.current = locale
      return () => { window.clearTimeout(timer);document.documentElement.classList.remove('locale-changing') }
    }
    previousLocale.current = locale
  }, [locale])

  useEffect(() => {
    document.documentElement.lang = locale
    document.documentElement.dataset.locale = locale
    try { localStorage.setItem('copypump.locale', locale) } catch {}
  }, [locale])

  const value = useMemo(() => ({
    locale,
    dict: dictionaries[locale],
    setLocale: (next: Locale) => {
      if (next === locale) return
      const scrollY = window.scrollY
      const visible = Array.from(document.querySelectorAll<HTMLElement>('main section[id]')).find(node => {
        const bounds=node.getBoundingClientRect()
        return bounds.bottom > 120 && bounds.top < window.innerHeight
      })
      const anchorId=visible?.id
      const fraction=visible? (scrollY-(visible.getBoundingClientRect().top+scrollY))/Math.max(1,visible.offsetHeight):0
      const nextPath = localizedPath(window.location.pathname, next)
      try { localStorage.setItem('copypump.locale', next) } catch {}
      window.history.pushState({}, '', `${nextPath}${window.location.search}${window.location.hash}`)
      window.dispatchEvent(new PopStateEvent('popstate'))
      window.requestAnimationFrame(() => window.requestAnimationFrame(() => {
        const target=anchorId?document.getElementById(anchorId):null
        const top=target?target.getBoundingClientRect().top+window.scrollY+fraction*target.offsetHeight:scrollY
        const root=document.documentElement
        const old=root.style.scrollBehavior;root.style.scrollBehavior='auto'
        window.scrollTo({top,behavior:'auto'});root.style.scrollBehavior=old
      }))
    },
    pathFor: (path: string) => localizedPath(path, locale),
  }), [locale])

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>
}

export function useI18n() {
  const value = useContext(I18nContext)
  if (!value) throw new Error('useI18n must be used within I18nProvider')
  return value
}
