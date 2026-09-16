import { Header } from '../components/Header'
import { SiteFooter } from '../components/SiteFooter'
import { Seo } from '../components/Seo'
import { useI18n } from '../i18n'
import { HeroScene } from '../components/HeroScene'
import { ServiceLogo } from '../components/ServiceLogo'
import { Atmosphere } from '../components/Experience'
import { navigateLocal, smoothScrollToId } from '../lib/motion'

export function LandingPage(){
  const{dict,locale}=useI18n(),c=dict.studio,v=dict.cinema
  const openProject=(id?:string)=>{navigateLocal('/project');if(id)window.setTimeout(()=>smoothScrollToId(id),90)}
  const summary=locale==='ru'?{
    eyebrow:'ЗАЧЕМ COPYPUMP',title:'Следуйте за сигналами. Сохраняйте контроль.',intro:'CopyPump отслеживает выбранные smart-money кошельки, но каждое действие проходит через ваши правила до исполнения.',
    points:['Средства остаются у вас.','Лимиты проверяются до исполнения.','Каждое решение можно проследить.'],details:'Открыть подробности'
  }:{
    eyebrow:'WHY COPYPUMP',title:'Follow signals. Keep control.',intro:'CopyPump follows selected smart-money wallets, while every action must pass your rules before execution.',
    points:['You keep custody.','Limits apply before execution.','Every decision stays traceable.'],details:'Open details'
  }
  return <div className="app-shell cinematic-v47" data-release="47.11-focused-home"><Seo title={dict.landing.seo.title} description={dict.landing.seo.description}/><Header/><div className="site-scroll-background" aria-hidden="true"/><Atmosphere/><main id="main-content">
    <section className="hero" id="product" aria-labelledby="hero-title" data-motion-scene><div className="section-shell hero-shell"><div className="hero-kicker"><span className="eyebrow"><i/>{v.hero.eyebrow}</span><span className="stage">{c.hero.stage}</span></div><div className="hero-composition"><div className="hero-type" data-reveal="0" data-reveal-kind="title"><h1 id="hero-title"><span>{v.hero.lead}</span><span className="hero-focus">{v.hero.focus}</span><span className="hero-ending">{v.hero.end}</span></h1><p className="hero-description">{v.hero.intro}</p><div className="hero-actions"><button type="button" className="button button--primary" onClick={()=>openProject('decision-demo')}>{v.hero.primary}</button><button type="button" className="text-link" onClick={()=>openProject()}>{locale==='ru'?'О проекте':'Project'}</button></div><div className="hero-trust"><span><i/> {c.boundary.labels[0]}</span><span><i/> {c.boundary.labels[1]}</span><span><i/> {c.boundary.labels[2]}</span></div></div><HeroScene/></div></div></section>
    <section id="why-copypump" className="section-shell home-summary" aria-labelledby="summary-title"><div className="home-summary__heading" data-reveal="0" data-reveal-kind="title"><span className="eyebrow">01 / {summary.eyebrow}</span><h2 id="summary-title">{summary.title}</h2><p>{summary.intro}</p></div><div className="home-summary__points">{summary.points.map((point,i)=><article key={point} data-reveal={String(i*70)}><span className="problem-index">{String(i+1).padStart(2,'0')}</span><h3>{point}</h3></article>)}</div><button type="button" className="text-link home-summary__details" onClick={()=>openProject('product-story')}>{summary.details}</button></section>
    <section id="community" className="community-section section-shell home-community" data-motion-scene><div className="home-community__heading" data-reveal="0" data-reveal-kind="title"><span className="eyebrow">{c.community.eyebrow}</span><h2>{c.community.title} <em>{c.community.accent}</em></h2><p>{c.community.description}</p></div><div className="community-bottom" data-reveal="120"><nav><a href="https://x.com/CopyPumpAI" target="_blank" rel="noopener noreferrer"><ServiceLogo name="x" size={22}/>{c.community.x}</a><a href="https://discord.gg/WS95eXrGB" target="_blank" rel="noopener noreferrer"><ServiceLogo name="discord"/>{c.community.discord}</a><a href="https://github.com/CopyPumpApp/CopyPump" target="_blank" rel="noopener noreferrer"><ServiceLogo name="github"/>{c.community.github}</a><a href="mailto:copypumphq@gmail.com"><span className="mail-icon">@</span>{c.community.email}</a></nav></div></section>
  </main><SiteFooter/></div>
}
