import {useEffect} from 'react'
import {localizedPath,useI18n} from '../i18n'
import {PUBLIC_ORIGIN} from '../site/metadata'
type SeoProps={title:string;description:string;path?:string;noIndex?:boolean}
function setMeta(key:string,value:string,property=false){let node=document.querySelector<HTMLMetaElement>(`meta[${property?'property':'name'}="${key}"]`);if(!node){node=document.createElement('meta');node.setAttribute(property?'property':'name',key);document.head.appendChild(node)}node.content=value}
function link(rel:string,href:string,lang?:string){let n=document.querySelector<HTMLLinkElement>(`link[rel="${rel}"]${lang?`[hreflang="${lang}"]`:''}`);if(!n){n=document.createElement('link');n.rel=rel;if(lang)n.hreflang=lang;document.head.appendChild(n)}n.href=href}
export function Seo({title,description,path='/',noIndex=false}:SeoProps){
 const {locale}=useI18n()
 useEffect(()=>{
  const base=path.replace(/^\/ru(?=\/|$)/,'')||'/',canonical=PUBLIC_ORIGIN+localizedPath(base,locale)
  document.title=title;setMeta('description',description)
  setMeta('robots',noIndex||location.origin!==PUBLIC_ORIGIN?'noindex,follow':'index,follow')
  for(const prefix of ['og:','twitter:']){setMeta(prefix+'title',title,prefix==='og:');setMeta(prefix+'description',description,prefix==='og:');setMeta(prefix+'image',PUBLIC_ORIGIN+'/og-card.webp',prefix==='og:')}
  setMeta('og:url',canonical,true);setMeta('og:locale',locale==='ru'?'ru_RU':'en_US',true);link('canonical',canonical)
  for(const l of ['en','ru','x-default'] as const)link('alternate',PUBLIC_ORIGIN+localizedPath(base,l==='ru'?'ru':'en'),l)
 },[title,description,path,noIndex,locale])
 return null
}
