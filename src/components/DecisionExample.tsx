import { useState } from 'react'
import { useI18n } from '../i18n'
import { evaluateExample } from '../lib/decision'
import { workflowObjects } from './HeroScene'

const workflowAsset=(name:string)=>`/workflow-objects/${name}.webp?v=20260916-light`

export function DecisionExample(){
  const{dict,locale}=useI18n(),c=dict.studio.demo
  const[limit,setLimit]=useState(.35),[age,setAge]=useState(12),[stopped,setStopped]=useState(false)
  const amount=.5,result=evaluateExample({amount,limit,age,stopped})
  const format=(v:number)=>v.toLocaleString(locale,{minimumFractionDigits:2,maximumFractionDigits:2})
  const statuses=[true,result.fresh,result.capital&&!stopped,result.allowed]
  const reason=result.reason==='stop'?c.stopReason:result.reason==='age'?c.ageReason:result.reason==='limit'?c.limitReason:c.allowReason
  return <section id="decision-demo" className="decision-section" aria-labelledby="decision-title" tabIndex={-1} data-motion-scene>
    <div className="section-shell">
      <div className="section-intro" data-reveal="0" data-reveal-kind="title"><span className="eyebrow">{c.eyebrow}</span><div><h2 id="decision-title">{c.title}</h2><p>{c.intro}</p></div></div>
      <div className="workflow-scene" aria-label={c.trace} data-pinned-story>{workflowObjects.map((name,i)=><div className={`workflow-node ${statuses[i]?'passed':'stopped'}`} key={name} data-reveal={String(i*70)}><div className="workflow-image"><img src={workflowAsset(name)} width="440" height="560" loading="lazy" decoding="async" alt=""/></div><div className="workflow-caption"><span>{String(i+1).padStart(2,'0')}</span><h3>{c.steps[i]}</h3><i aria-hidden="true"/></div><p>{c.stepNotes[i]}</p></div>)}</div>
      <div className="decision-desk" data-reveal="160"><div className="decision-controls"><div className="example-amount"><span>{c.amount}</span><strong>{format(amount)} <small>SOL</small></strong></div><label className="range-control" htmlFor="capital-limit"><span>{c.limit}</span><output htmlFor="capital-limit">{format(limit)} SOL</output><input id="capital-limit" type="range" min="0.1" max="1" step="0.05" value={limit} onChange={e=>setLimit(Number(e.target.value))}/><small>0.10 SOL</small><small>1.00 SOL</small></label><label className="range-control" htmlFor="signal-age"><span>{c.age}</span><output htmlFor="signal-age">{age} {c.ageUnit}</output><input id="signal-age" type="range" min="5" max="90" step="1" value={age} onChange={e=>setAge(Number(e.target.value))}/><small>5 {c.ageUnit}</small><small>90 {c.ageUnit}</small></label><label className="stop-control"><span><strong>{c.stop}</strong></span><input type="checkbox" checked={stopped} onChange={e=>setStopped(e.target.checked)}/><span className="toggle" aria-hidden="true"/></label><button type="button" className="text-link" onClick={()=>{setLimit(.35);setAge(12);setStopped(false)}}>{c.reset}</button></div><div className={`decision-outcome ${result.allowed?'is-allowed':'is-blocked'}`}><div className="outcome-heading"><span className="eyebrow">{c.statusLabel}</span><span className="status-dot" aria-hidden="true"/></div><div role="status" aria-live="polite"><h3>{result.allowed?c.allowed:c.blocked}</h3><p>{reason}</p></div><dl className="decision-trace"><div><dt>{c.fresh}</dt><dd>{result.fresh?c.pass:c.fail}</dd></div><div><dt>{c.capital}</dt><dd>{result.capital?c.pass:c.fail}</dd></div><div><dt>{c.authority}</dt><dd>{stopped?c.paused:c.pass}</dd></div></dl><small>{c.notTrade}</small></div></div>
      <p className="demo-disclaimer"><span aria-hidden="true">◌</span>{c.disclaimer}</p>
    </div>
  </section>
}
