import {useI18n} from '../i18n'
import {Link} from '../premium/Site'
import {KineticHeading} from '../premium/KineticHeading'
import {useRadar,hasUpdate} from './store'
import {radarCopy} from './copy'
import {publicationCopy} from '../premium/publication'
export function RadarIndicator(){const {index,local}=useRadar();const n=index?.items.filter(x=>local.saved.includes(x.id)&&hasUpdate(x,local.read)).length||0;return n>0?<span className="radar-count">{n}</span>:null}
export function RadarTeaser(){
  const {locale}=useI18n(),c=radarCopy[locale],p=publicationCopy[locale].radar,s=useRadar(),item=s.index?.items[0]
  return <section className="radar-teaser wrap section-space" id="radar-preview" data-scene="radar" aria-labelledby="radar-teaser-title">
    <div><p className="eyebrow" data-reveal="label">COPYPUMP RADAR</p><KineticHeading id="radar-teaser-title" lines={[{text:c.teaserTitle},{text:c.teaserAccent,accent:true}]}/><p className="radar-teaser-note">{c.edition}</p></div>
    <div className="radar-teaser-story" data-reveal="record">{s.error&&<p className="radar-notice" role="status">{c.error} {item&&c.last}</p>}
      {item?<><p className="eyebrow">{item.category[locale]} · {item.observedAt.slice(0,10)}</p><h3><Link to={`/radar/${item.id}`}>{item.title[locale]}</Link></h3><p>{item.summary[locale]}</p><Link to={`/radar/${item.id}`} className="text-link">{c.open}<span aria-hidden="true">↗</span></Link></>:<p role="status">{s.loading?c.loading:s.error?c.detailError:c.nothing}</p>}
      <Link to="/radar" className="text-link radar-all-link">{c.more} →</Link>
    </div>
    {s.index&&s.index.items.length>1&&<div className="radar-other-notes"><p className="eyebrow">{p.more}</p><div>{s.index.items.slice(1,3).map(note=><article key={note.id}><Link to={`/radar/${note.id}`}>{note.title[locale]} ↗</Link><time dateTime={note.observedAt}>{note.observedAt.slice(0,10)}</time></article>)}</div><p>{p.note}</p></div>}
  </section>
}
