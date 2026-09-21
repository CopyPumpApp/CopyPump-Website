export type Localized = { en:string; ru:string }
export type ObservationSummary = {
  id:string; version:number; publishedAt:string; updatedAt:string; observedAt:string;
  lastCheckedAt:string; sourceKind?:'onchain'|'web'; sourceLabel?:Localized;
  cluster?:'mainnet-beta'|'devnet'; title:Localized; summary:Localized;
  category:Localized; followUps:number
}
export type RadarIndex = {schemaVersion:1; edition:string; publishedAt:string; items:ObservationSummary[]}
export type Source = {id:string; label:Localized; url:string; checkedAt:string; sha256?:string}
export type Observation = ObservationSummary & {
  facts:Localized[]; interpretation:Localized; unknowns:Localized[];
  signature?:string; sources:Source[];
  revisions:{version:number; at:string; kind:'initial'|'addendum'|'correction'; title:Localized; text:Localized; sourceIds:string[]}[]
}
const record=(v:unknown):v is Record<string,unknown>=>!!v&&typeof v==='object'&&!Array.isArray(v)
const text=(v:unknown)=>typeof v==='string'&&v.trim().length>0&&v.length<12000
const date=(v:unknown)=>typeof v==='string'&&Number.isFinite(Date.parse(v))
const localized=(v:unknown):v is Localized=>record(v)&&text(v.en)&&text(v.ru)
const sourceKind=(v:Record<string,unknown>)=>v.sourceKind==='web'?'web':'onchain'
export const validId=(v:unknown):v is string=>typeof v==='string'&&/^[a-z0-9][a-z0-9-]{0,79}$/.test(v)
export function validSummary(v:unknown):v is ObservationSummary{
  if(!record(v)||!validId(v.id)||!Number.isInteger(v.version)||Number(v.version)<=0||
    !['publishedAt','updatedAt','observedAt','lastCheckedAt'].every(k=>date(v[k]))||
    !['title','summary','category'].every(k=>localized(v[k]))||
    !Number.isInteger(v.followUps)||Number(v.followUps)<0)return false
  if(sourceKind(v)==='web')return v.sourceKind==='web'&&localized(v.sourceLabel)
  return (v.sourceKind===undefined||v.sourceKind==='onchain')&&['mainnet-beta','devnet'].includes(String(v.cluster))
}
export function parseIndex(value:unknown):RadarIndex{
  if(!record(value)||value.schemaVersion!==1||!text(value.edition)||!date(value.publishedAt)||!Array.isArray(value.items)||value.items.length>500||!value.items.every(validSummary)||new Set(value.items.map(x=>x.id)).size!==value.items.length)throw new Error('Invalid Radar index')
  return value as RadarIndex
}
export function safeSource(url:unknown):url is string{
  return typeof url==='string'&&(/^https:\/\//.test(url)||/^\/radar\/evidence\/[a-z0-9-]+\.json$/.test(url))
}
export function parseObservation(value:unknown):Observation{
  if(!validSummary(value))throw new Error('Invalid observation')
  const v=value as unknown as Record<string,unknown>
  if(!Array.isArray(v.facts)||!v.facts.length||!v.facts.every(localized)||!localized(v.interpretation)||!Array.isArray(v.unknowns)||!v.unknowns.length||!v.unknowns.every(localized))throw new Error('Invalid editorial sections')
  if(sourceKind(v)==='onchain'&&!text(v.signature))throw new Error('Invalid on-chain signature')
  const sources=v.sources
  if(!Array.isArray(sources)||!sources.length||!sources.every(s=>record(s)&&text(s.id)&&localized(s.label)&&safeSource(s.url)&&date(s.checkedAt)))throw new Error('Invalid sources')
  if(sourceKind(v)==='web'){
    const webSources=sources.filter(s=>record(s)&&typeof s.url==='string'&&/^https:\/\//.test(s.url))
    if(webSources.length<2||new Set(webSources.map(s=>{try{return new URL(String(s.url)).hostname.toLowerCase()}catch{return''}}).filter(Boolean)).size<2)throw new Error('Web observations require independent sources')
  }
  if(!Array.isArray(v.revisions)||!v.revisions.length||!v.revisions.every(r=>record(r)&&Number.isInteger(r.version)&&date(r.at)&&['initial','addendum','correction'].includes(String(r.kind))&&localized(r.title)&&localized(r.text)&&Array.isArray(r.sourceIds)&&r.sourceIds.every(id=>sources.some(s=>s.id===id))))throw new Error('Invalid history')
  return value as unknown as Observation
}
