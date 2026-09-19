import { useEffect } from 'react'
import { localizedPath, useI18n } from '../i18n'

type SeoProps = { title: string; description: string; path?: string; noIndex?: boolean }
function setMeta(selector: string, value: string) { const node=document.querySelector<HTMLMetaElement>(selector); if(node) node.content=value }
function setAlternate(lang: string, href: string) { let node=document.querySelector<HTMLLinkElement>(`link[rel="alternate"][hreflang="${lang}"]`); if(!node){node=document.createElement('link');node.rel='alternate';node.hreflang=lang;document.head.appendChild(node)} node.href=href }

export function Seo({ title, description, path = window.location.pathname, noIndex = false }: SeoProps) {
  const { locale } = useI18n()
  useEffect(() => {
    document.title=title
    setMeta('meta[name="description"]',description)
    setMeta('meta[name="robots"]', noIndex ? 'noindex,nofollow' : 'index,follow')
    setMeta('meta[property="og:title"]',title); setMeta('meta[property="og:description"]',description); setMeta('meta[property="og:locale"]',locale==='ru'?'ru_RU':'en_US'); setMeta('meta[property="og:locale:alternate"]',locale==='ru'?'en_US':'ru_RU'); setMeta('meta[name="twitter:title"]',title); setMeta('meta[name="twitter:description"]',description)
    const base = path === '/ru' ? '/' : path.startsWith('/ru/') ? path.slice(3) : path
    const canonicalUrl=`${window.location.origin}${localizedPath(base,locale)}`
    const socialImage = `${window.location.origin}/og-card.webp`
    setMeta('meta[property="og:image"]', socialImage)
    setMeta('meta[name="twitter:image"]', socialImage)
    let canonical=document.querySelector<HTMLLinkElement>('link[rel="canonical"]'); if(!canonical){canonical=document.createElement('link');canonical.rel='canonical';document.head.appendChild(canonical)} canonical.href=canonicalUrl
    let ogUrl=document.querySelector<HTMLMetaElement>('meta[property="og:url"]'); if(!ogUrl){ogUrl=document.createElement('meta');ogUrl.setAttribute('property','og:url');document.head.appendChild(ogUrl)} ogUrl.content=canonicalUrl
    setAlternate('en',`${window.location.origin}${localizedPath(base,'en')}`); setAlternate('ru',`${window.location.origin}${localizedPath(base,'ru')}`); setAlternate('x-default',`${window.location.origin}${localizedPath(base,'en')}`)
  },[description,locale,noIndex,path,title])
  return null
}
