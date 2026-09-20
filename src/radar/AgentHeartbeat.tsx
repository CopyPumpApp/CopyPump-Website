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
  en:{agent:'DATA AGENT',radar:'RADAR',project:'PROJECT',dataOnly:'DATA-ONLY',ok:'OK',attention:'REVIEW',unavailable:'UNAVAILABLE',pending:'PENDING'},
  ru:{agent:'АГЕНТ ДАННЫХ',radar:'RADAR',project:'ПРОЕКТ',dataOnly:'ТОЛЬКО ДАННЫЕ',ok:'OK',attention:'ПРОВЕРИТЬ',unavailable:'НЕДОСТУПЕН',pending:'ОЖИДАНИЕ'},
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
  const stamp=new Intl.DateTimeFormat(locale==='ru'?'ru-RU':'en-GB',{day:'2-digit',month:'short',hour:'2-digit',minute:'2-digit',timeZone:'UTC'}).format(new Date(status.updatedAt))
  return <p className="radar-agent-status" data-agent-state={status.radar.state} title={status.guard.coreUiFrozen?(locale==='ru'?'Основной интерфейс закрыт для автономных изменений.':'Core UI is locked from autonomous edits.'):undefined}>
    <i aria-hidden="true"/>
    <span>{c.agent}</span>
    <b>·</b><span>{c.radar} {label(status.radar.state)}</span>
    <b>·</b><span className={status.project.state==='ok'?'':'is-warning'}>{c.project} {label(status.project.state)}</span>
    <b>·</b><span>{c.dataOnly}</span>
    <b>·</b><time dateTime={status.updatedAt}>{stamp} UTC</time>
  </p>
}
