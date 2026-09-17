import {parseIndex,parseObservation,type RadarIndex,type Observation} from '../radar/schema'
export type SiteBootstrap = {path:string; radarIndex?:RadarIndex; radarObservation?:Observation}
export function readBootstrap():SiteBootstrap|undefined {
  const node=document.getElementById('site-bootstrap')
  if(!node?.textContent)return
  try {
    const value=JSON.parse(node.textContent)
    if(typeof value.path!=='string'||!value.path.startsWith('/'))return
    return {path:value.path,radarIndex:value.radarIndex?parseIndex(value.radarIndex):undefined,radarObservation:value.radarObservation?parseObservation(value.radarObservation):undefined}
  }catch{return}
}
/** Explicit UTC formatting avoids server/browser ICU differences during hydration. */
export function publicDate(value:string,locale:'en'|'ru',withTime=false){
  const [date,time='00:00']=value.split('T'),[year,month,day]=date.split('-')
  const names=locale==='ru'?['янв.','февр.','марта','апр.','мая','июня','июля','авг.','сент.','окт.','нояб.','дек.']:['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']
  return `${Number(day)} ${names[Number(month)-1]} ${year}${locale==='ru'?' г.':''}${withTime?`, ${time.slice(0,5)}`:''}`
}
