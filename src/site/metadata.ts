import {premiumCopy} from '../premium/content'
import {localeFromPath,localizedPath} from '../i18n'
import en from '../i18n/en.json'
import ru from '../i18n/ru.json'
import {radarCopy} from '../radar/copy'
import type {Observation} from '../radar/schema'
export const PUBLIC_ORIGIN='https://copypump-website.copypumphq.workers.dev'
export function metadata(path:string,observation?:Observation){
  const locale=localeFromPath(path),base=path.replace(/^\/ru(?=\/|$)/,'')||'/',c=premiumCopy[locale],legal=(locale==='ru'?ru:en).legal
  let title=locale==='ru'?'CopyPump — Умные деньги. Ваши правила.':'CopyPump — Smart money. Your rules.',description=c.hero.intro
  if(base==='/project'){title=`${c.nav.product} — CopyPump`;description=c.product.intro}
  if(base==='/progress'){title=`${c.nav.progress} — CopyPump`;description=c.progress.intro}
  if(base.startsWith('/radar')){title=observation?`${observation.title[locale]} — CopyPump Radar`:'CopyPump Radar';description=observation?.summary[locale]||radarCopy[locale].intro}
  if(['/privacy','/terms','/security','/contact'].includes(base)){const page=legal[base.slice(1) as 'privacy'|'terms'|'security'|'contact'];title=`${page.title} — CopyPump`;description=page.description}
  if(base==='/404'){title=locale==='ru'?'Страница не найдена — CopyPump':'Page not found — CopyPump';description=title}
  return {title,description,locale,base,canonical:PUBLIC_ORIGIN+localizedPath(base,locale),image:PUBLIC_ORIGIN+'/og-card.webp',noIndex:base.endsWith('/404')}
}
