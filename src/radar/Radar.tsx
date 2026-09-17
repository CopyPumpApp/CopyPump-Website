import {useEffect,useLayoutEffect,useRef,useState} from 'react'
import {useI18n} from '../i18n'
import {Seo} from '../components/Seo'
import {Link} from '../premium/Site'
import {KineticHeading} from '../premium/KineticHeading'
import {hasUpdate,useRadar} from './store'
import {parseObservation,validId,type Observation,type ObservationSummary} from './schema'
import {radarCopy} from './copy'
import './radar.css'
import {publicDate} from '../site/bootstrap'
const announceReady=()=>{window.dispatchEvent(new Event('copypump:content-ready'))}
function Stamp({value}:{value:string}){const {locale}=useI18n();return <time dateTime={value}>{publicDate(value,locale,true)} UTC</time>}
function Save({id}:{id:string}){const {locale}=useI18n(),s=useRadar(),c=radarCopy[locale],saved=s.local.saved.includes(id);return <button type="button" className="radar-save" aria-pressed={saved} onClick={()=>s.toggleSave(id)}><svg aria-hidden="true" width="17" height="20" viewBox="0 0 20 24" fill={saved?'currentColor':'none'}><path d="M4 3h12v18l-6-4-6 4V3Z" stroke="currentColor" strokeWidth="1.4"/></svg>{saved?c.remove:c.save}</button>}
function LocalNotice(){const {locale}=useI18n(),{persistent}=useRadar(),c=radarCopy[locale];return <p className={`radar-local ${persistent?'':'radar-warning'}`} role={persistent?undefined:'status'}>{persistent?c.local:c.temporary}</p>}
function Row({item,ordinal}:{item:ObservationSummary;ordinal:number}){
  const {locale}=useI18n(),{local}=useRadar(),c=radarCopy[locale],updated=hasUpdate(item,local.read)
  return <article className="radar-row"><span className="radar-ordinal" aria-hidden="true">{String(ordinal+1).padStart(2,'0')}</span><div className="radar-row-body"><div className="radar-row-meta"><p className="eyebrow">{item.category[locale]} · {item.cluster==='mainnet-beta'?'SOLANA MAINNET':'SOLANA DEVNET'}</p>{updated?<span className="radar-update">{c.changed}</span>:!local.read[item.id]?<span className="radar-unread">{c.new}</span>:null}</div><h2><Link to={`/radar/${item.id}`}>{item.title[locale]}</Link></h2><p>{item.summary[locale]}</p><div className="radar-row-actions"><Link to={`/radar/${item.id}`} className="text-link">{c.open} ↗</Link>{updated&&<Link to={`/radar/${item.id}#editorial-history`} className="text-link">{c.show} ↓</Link>}<Save id={item.id}/></div><p className="radar-date">{c.event}: <Stamp value={item.observedAt}/></p></div></article>
}
export default function RadarPage({id}:{id?:string}){
  const {locale}=useI18n(),s=useRadar(),c=radarCopy[locale]
  const [filter,setFilter]=useState('all')
  useLayoutEffect(announceReady,[id,locale,s.index])
  if(id)return <RadarArticle key={id} id={id}/>
  const items=s.index?.items||[],updates=items.filter(x=>hasUpdate(x,s.local.read)),saved=items.filter(x=>s.local.saved.includes(x.id))
  const shown=filter==='saved'?saved:filter==='updates'?updates:filter==='archive'?[...items].reverse():items
  const updatedSaved=updates.filter(x=>s.local.saved.includes(x.id)).length
  return <div className="app-shell premium-v50 radar-page" data-release="50.0-radar"><Seo title="CopyPump Radar" description={c.intro} path="/radar"/><main id="main-content" tabIndex={-1}>
    <header className="document-hero wrap" data-scene="document"><p className="eyebrow">{c.eyebrow}</p><KineticHeading as="h1" lines={[{text:c.title},{text:c.accent,accent:true}]}/><p>{c.intro}</p><p className="radar-edition">{c.edition}{s.index&&<> · {s.index.edition} · {s.index.publishedAt.slice(0,10)}</>}</p></header>
    <section className="radar-library wrap" aria-label={c.all}><div className="radar-toolbar"><div className="radar-filters" role="group" aria-label={c.name}>{(['all','saved','updates','archive'] as const).map(f=><button key={f} type="button" aria-pressed={filter===f} onClick={()=>setFilter(f)}>{c[f]}{f==='saved'&&saved.length>0&&<span>{saved.length}</span>}{f==='updates'&&updates.length>0&&<span>{updates.length}</span>}</button>)}</div><button type="button" className="text-link" disabled={s.loading} onClick={s.reload}>{c.retry} ↻</button></div>
      <LocalNotice/>{updatedSaved>0&&<p className="radar-notice">{updatedSaved} {updatedSaved===1?c.updateSaved:c.updatedSaved}.</p>}
      {s.error&&<p role="status" className="radar-notice">{c.error} {s.index&&c.last}</p>}
      {s.loading&&!s.index?<p role="status" className="radar-empty">{c.loading}</p>:!s.index&&s.error?null:shown.length?shown.map((item,i)=><Row key={item.id} item={item} ordinal={i}/>):<p role="status" className="radar-empty">{filter==='updates'?c.noUpdates:c.none}</p>}
      <p className="radar-disclaimer">{c.disclaimer}</p>
    </section>
  </main></div>
}
function RadarArticle({id}:{id:string}){
  const {locale}=useI18n(),c=radarCopy[locale],s=useRadar(),[entry,setEntry]=useState<Observation|null>(()=>s.initialObservation?.id===id?s.initialObservation:null),[state,setState]=useState<'loading'|'ready'|'error'|'missing'>(()=>s.initialObservation?.id===id?'ready':'loading'),[attempt,setAttempt]=useState(0)
  const summary=s.index?.items.find(x=>x.id===id),sentinel=useRef<HTMLDivElement>(null),prior=useRef<number|null>(null)
  useEffect(()=>{
    if(!validId(id)){setState('missing');return}
    if(attempt===0&&s.initialObservation?.id===id)return
    const abort=new AbortController(),timeout=window.setTimeout(()=>abort.abort(),10000);let live=true
    setState('loading');setEntry(null)
    fetch(`/radar/observations/${id}.json`,{signal:abort.signal,cache:'no-cache'}).then(async response=>{
      if(response.status===404){if(live)setState('missing');return}
      if(!response.ok)throw new Error('Unavailable')
      const item=parseObservation(await response.json());if(item.id!==id)throw new Error('Wrong observation')
      if(live){setEntry(item);setState('ready')}
    }).catch(()=>{if(live)setState('error')}).finally(()=>clearTimeout(timeout))
    return()=>{live=false;abort.abort();clearTimeout(timeout)}
  },[id,attempt])
  useLayoutEffect(()=>{if(state==='ready'){announceReady();if(location.hash==='#editorial-history')requestAnimationFrame(()=>document.getElementById('editorial-history')?.scrollIntoView({block:'start'}))}},[state,locale])
  const mismatch=!!(entry&&summary&&summary.version!==entry.version)
  const absent=!!s.index&&!summary
  useEffect(()=>{
    if(!entry||mismatch||absent||!sentinel.current)return
    if(prior.current===null)prior.current=s.local.read[id]||0
    if(!('IntersectionObserver'in window))return
    let timer=0,inView=false
    const check=()=>{clearTimeout(timer);if(inView&&!document.hidden)timer=window.setTimeout(()=>s.markRead(id,entry.version),1400)}
    const io=new IntersectionObserver(([e])=>{inView=e.isIntersecting&&e.intersectionRatio>=.5;check()},{threshold:.5});io.observe(sentinel.current)
    document.addEventListener('visibilitychange',check)
    return()=>{clearTimeout(timer);io.disconnect();document.removeEventListener('visibilitychange',check)}
  },[id,entry,mismatch,absent,s.markRead])
  const missing=state==='missing'||absent
  if(!entry||state!=='ready'||missing)return <div className="app-shell radar-page"><Seo title={`${missing?c.notFound:c.name} — CopyPump`} description={c.intro} path={`/radar/${id}`} noIndex={missing}/><main id="main-content" tabIndex={-1} className="wrap radar-fallback"><Link to="/radar" className="text-link">← {c.back}</Link><h1>{missing?c.notFound:c.name}</h1><p role="status">{missing?c.notFoundText:state==='loading'?c.loading:c.detailError}</p>{state==='error'&&!missing&&<button type="button" className="text-link" onClick={()=>setAttempt(x=>x+1)}>{c.retry} ↻</button>}</main></div>
  const changed=hasUpdate(entry,s.local.read),baseline=prior.current||s.local.read[id]||0
  return <div className="app-shell premium-v50 radar-page"><Seo title={`${entry.title[locale]} — CopyPump Radar`} description={entry.summary[locale]} path={`/radar/${id}`}/><main id="main-content" tabIndex={-1}>
    <header className="document-hero wrap radar-article-hero" data-scene="document"><Link to="/radar" className="text-link">← {c.back}</Link><p className="eyebrow">{entry.category[locale]} · {entry.cluster==='mainnet-beta'?'SOLANA MAINNET':'SOLANA DEVNET'}</p><KineticHeading as="h1" lines={[{text:entry.title[locale],accent:true}]}/><p>{entry.summary[locale]}</p><div className="radar-article-actions"><Save id={id}/>{changed&&<Link to={`/radar/${id}#editorial-history`} className="text-link">{c.show} ↓</Link>}</div><LocalNotice/>{mismatch&&<p role="status" className="radar-notice">{c.mismatch}<button type="button" className="text-link" onClick={()=>{s.reload();setAttempt(x=>x+1)}}>{c.retry} ↻</button></p>}</header>
    <article className="radar-article wrap"><aside className="radar-provenance"><p className="eyebrow">{c.network}</p><dl>{([[c.event,entry.observedAt],[c.published,entry.publishedAt],[c.checked,entry.lastCheckedAt]]).map(([k,v])=><div key={k}><dt>{k}</dt><dd><Stamp value={v}/></dd></div>)}</dl><p className="radar-signature">{c.signature}<code>{entry.signature}</code></p></aside>
      <div className="radar-narrative"><section aria-labelledby="radar-facts"><p className="eyebrow">01 / EVIDENCE</p><h2 id="radar-facts">{c.facts}</h2>{entry.facts.map((f,i)=><p key={i}>{f[locale]}</p>)}</section><section><p className="eyebrow">02 / INTERPRETATION</p><h2>{c.context}</h2><p>{entry.interpretation[locale]}</p></section><section><p className="eyebrow">03 / LIMITS</p><h2>{c.limits}</h2>{entry.unknowns.map((x,i)=><p key={i}>{x[locale]}</p>)}</section>
      <section id="editorial-history"><p className="eyebrow">04 / RECORD</p><h2>{c.history}</h2>{entry.revisions.map(r=><div className={`radar-revision ${baseline>0&&r.version>baseline?'is-new':''}`} key={r.version}><p className="radar-revision-meta">V{r.version} · {c[r.kind]} · <Stamp value={r.at}/></p><h3>{r.title[locale]}</h3><p>{r.text[locale]}</p><div className="radar-source-refs">{r.sourceIds.map(ref=>{const source=entry.sources.find(x=>x.id===ref)!;return <a href={source.url} key={ref} target="_blank" rel="noopener noreferrer">{source.label[locale]} ↗</a>})}</div></div>)}</section>
      <section id="radar-sources"><p className="eyebrow">05 / SOURCES</p><h2>{c.source}</h2><ol className="radar-sources">{entry.sources.map(x=><li key={x.id}><a href={x.url} target="_blank" rel="noopener noreferrer">{x.label[locale]} ↗</a>{x.sha256&&<code>SHA-256 {x.sha256}</code>}</li>)}</ol></section><div ref={sentinel} className="radar-read-sentinel"><button type="button" className="text-link" disabled={mismatch||s.local.read[id]>=entry.version} onClick={()=>s.markRead(id,entry.version)}>{s.local.read[id]>=entry.version?c.done:c.read} ✓</button><p>{c.disclaimer}</p></div></div>
    </article>
  </main></div>
}
