import {useI18n} from '../i18n'
import {Link} from '../premium/Site'
import {KineticHeading} from '../premium/KineticHeading'
import {useRadar,hasUpdate} from './store'
import {radarCopy} from './copy'
const splitTeaserSummary=(text:string,locale:'en'|'ru')=>{
  const marker=locale==='ru'?'Почему это важно для CopyPump:':'Why it matters for CopyPump:'
  const at=text.indexOf(marker)
  return at<0?{short:text.trim(),why:''}:{short:text.slice(0,at).trim(),why:text.slice(at+marker.length).trim()}
}
export function RadarIndicator(){const {index,local}=useRadar();const n=index?.items.filter(x=>local.saved.includes(x.id)&&hasUpdate(x,local.read)).length||0;return n>0?<span className="radar-count">{n}</span>:null}
export function RadarTeaser(){
  const {locale}=useI18n(),c=radarCopy[locale],s=useRadar(),items=s.index?.items.slice(0,3)||[]
  return <section className="radar-teaser radar-teaser--expanded wrap section-space" id="radar-preview" data-scene="radar" aria-labelledby="radar-teaser-title">
    <div className="radar-teaser-heading"><p className="eyebrow" data-reveal="label">COPYPUMP RADAR</p><KineticHeading id="radar-teaser-title" lines={[{text:c.teaserTitle},{text:c.teaserAccent,accent:true}]}/><p className="radar-teaser-note">{c.edition}</p><p className="radar-teaser-context">{locale==='ru'?'Короткие разборы публичной активности Solana с источниками, ограничениями выводов и историей дополнений.':'Short reviews of public Solana activity with sources, limits on interpretation and editorial follow-ups.'}</p><Link to="/radar" className="text-link">{c.more} →</Link></div>
    <div className="radar-teaser-list">
      {s.error&&<p className="radar-notice" role="status">{c.error} {items.length>0&&c.last}</p>}
      {items.length?items.map((item,i)=>{const summary=splitTeaserSummary(item.summary[locale],locale);return <article className="radar-teaser-item" key={item.id} data-reveal="record" data-delay={i*70}>
        <div className="radar-teaser-meta"><span>0{i+1}</span><p className="eyebrow">{item.category[locale]} · {item.observedAt.slice(0,10)}</p></div>
        <h3><Link to={`/radar/${item.id}`}>{item.title[locale]}</Link></h3>
        <div className="radar-summary radar-summary--teaser"><p className="radar-summary__label">{c.short}</p><p className="radar-summary__text">{summary.short}</p>{summary.why&&<p className="radar-summary__why"><strong>{c.whyShort}</strong> {summary.why}</p>}</div>
        <Link to={`/radar/${item.id}`} className="text-link">{c.open}<span aria-hidden="true">↗</span></Link>
      </article>}):<p role="status">{s.loading?c.loading:s.error?c.detailError:c.nothing}</p>}
    </div>
  </section>
}
