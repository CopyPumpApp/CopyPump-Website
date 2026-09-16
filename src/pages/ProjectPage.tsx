import { Header } from '../components/Header'
import { SiteFooter } from '../components/SiteFooter'
import { Seo } from '../components/Seo'
import { ProductStory } from '../components/ProductStory'
import { ProjectDetails } from '../components/ProjectDetails'
import { useI18n } from '../i18n'

export function ProjectPage(){
 const{dict,locale}=useI18n(),c=dict.studio
 const faq=c.faq.items
 const ru=locale==='ru'
 return <div className="app-shell cinematic-v47 project-page"><Seo title={ru?'О проекте — CopyPump':'Project — CopyPump'} description={ru?'Как работает CopyPump, что контролирует пользователь и где находится разработка.':'How CopyPump works, what the user controls and where development stands.'}/><Header simple/><main id="main-content"><section className="project-page-hero section-shell"><span className="eyebrow">{ru?'COPYPUMP / ПРОЕКТ':'COPYPUMP / PROJECT'}</span><h1>{ru?'Как работает CopyPump.':'How CopyPump works.'}</h1><p>{ru?'Коротко о продукте, принципах контроля и текущем статусе разработки. Подробности раскрываются только когда они нужны.':'A clear view of the product, its control model and current development status. Details stay collapsed until you need them.'}</p></section><ProductStory/><ProjectDetails/><section id="questions" className="project-faq section-shell" aria-labelledby="project-faq-title"><div className="project-faq__head"><span className="eyebrow">{c.faq.eyebrow}</span><h2 id="project-faq-title">{c.faq.title}</h2></div><div className="project-faq__grid">{faq.map(item=><details className="project-faq__item" key={item.q}><summary><strong>{item.q}</strong><i aria-hidden="true">+</i></summary><div><p>{item.a}</p></div></details>)}</div></section></main><SiteFooter/></div>
}
