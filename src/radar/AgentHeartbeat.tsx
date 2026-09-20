import {useEffect,useState} from 'react'
import {useI18n} from '../i18n'

type State='ok'|'attention'|'unavailable'|'pending'
type Status={
  schemaVersion:1
  updatedAt:string
  mode:'AUTONOMOUS_DATA_ONLY'
  project:{state:State;checkedAt:string}
  radar:{state:State;checkedAt:string;checkedObservations?:number;verifiedObservations?:number}
  guard:{coreUiFrozen:boolean}
}
const copy={
  en:{title:'Data agent',scope:'Updates + Radar only',project:'Project updates',radar:'Radar verification',last:'Last autonomous check',guard:'Core site UI and primary content are locked from autonomous edits.',ok:'OK',attention:'Needs review',unavailable:'Unavailable',pending:'Pending'},
  ru:{title:'Агент данных',scope:'Только обновления + Radar',project:'Обновления проекта',radar:'Проверка Radar',last:'Последняя автопроверка',guard:'Основной UI и базовый контент сайта закрыты для автономных изменений.',ok:'OK',attention:'Нужна проверка',unavailable:'Недоступно',pending:'Ожидание'},
} as const

export function AgentHeartbeat(){
  const {locale}=useI18n()
  const c=copy[locale]
  const [status,setStatus]=useState<Status|null>(null)
  useEffect(()=>{
    const abort=new AbortController()
    fetch('/agent-status.json',{cache:'no-cache',signal:abort.signal})
      .then(async r=>{if(!r.ok)throw new Error('status unavailable');setStatus(await r.json())})
      .catch(()=>{})
    return()=>abort.abort()
  },[])
  if(!status)return null
  const label=(state:State)=>state==='ok'?c.ok:state==='attention'?c.attention:state==='pending'?c.pending:c.unavailable
  const stamp=new Intl.DateTimeFormat(locale==='ru'?'ru-RU':'en-GB',{dateStyle:'medium',timeStyle:'short',timeZone:'UTC'}).format(new Date(status.updatedAt))
  return <aside className="radar-agent-status" data-agent-state={status.radar.state} aria-label={c.title}>
    <div className="radar-agent-status__head"><i aria-hidden="true"/><strong>{c.title}</strong><span>{c.scope}</span></div>
    <dl>
      <div><dt>{c.project}</dt><dd>{label(status.project.state)}</dd></div>
      <div><dt>{c.radar}</dt><dd>{label(status.radar.state)}</dd></div>
      <div><dt>{c.last}</dt><dd>{stamp} UTC</dd></div>
    </dl>
    {status.guard.coreUiFrozen&&<p>{c.guard}</p>}
  </aside>
}
