export type Localized = { en:string; ru:string }
export type ObservationSummary = {
  id:string; version:number; publishedAt:string; updatedAt:string; observedAt:string;
  lastCheckedAt:string; cluster:'mainnet-beta'|'devnet'; title:Localized; summary:Localized;
  category:Localized; followUps:number
}
export type RadarIndex = {schemaVersion:1; edition:string; publishedAt:string; items:ObservationSummary[]}
export type Source = {id:string; label:Localized; url:string; checkedAt:string; sha256?:string}
export type Observation = ObservationSummary & {
  facts:Localized[]; interpretation:Localized; unknowns:Localized[];
  signature:string; sources:Source[];
  revisions:{version:number; at:string; kind:'initial'|'addendum'|'correction'; title:Localized; text:Localized; sourceIds:string[]}[]
}
const record=(v:unknown):v is Record<string,unknown>=>!!v&&typeof v==='object'&&!Array.isArray(v)
const text=(v:unknown)=>typeof v==='string'&&v.trim().length>0&&v.length<12000
const date=(v:unknown)=>typeof v==='string'&&Number.isFinite(Date.parse(v))
const localized=(v:unknown):v is Localized=>record(v)&&text(v.en)&&text(v.ru)
export const validId=(v:unknown):v is string=>typeof v==='string'&&/^[a-z0-9][a-z0-9-]{0,79}$/.test(v)
export function validSummary(v:unknown):v is ObservationSummary{
  return record(v)&&validId(v.id)&&Number.isInteger(v.version)&&Number(v.version)>0&&
    ['publishedAt','updatedAt','observedAt','lastCheckedAt'].every(k=>date(v[k]))&&
    ['title','summary','category'].every(k=>localized(v[k]))&&['mainnet-beta','devnet'].includes(String(v.cluster))&&
    Number.isInteger(v.followUps)&&Number(v.followUps)>=0
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
  if(!Array.isArray(v.facts)||!v.facts.length||!v.facts.every(localized)||!localized(v.interpretation)||!Array.isArray(v.unknowns)||!v.unknowns.length||!v.unknowns.every(localized)||!text(v.signature))throw new Error('Invalid editorial sections')
  const sources=v.sources
  if(!Array.isArray(sources)||!sources.length||!sources.every(s=>record(s)&&text(s.id)&&localized(s.label)&&safeSource(s.url)&&date(s.checkedAt)))throw new Error('Invalid sources')
  if(!Array.isArray(v.revisions)||!v.revisions.length||!v.revisions.every(r=>record(r)&&Number.isInteger(r.version)&&date(r.at)&&['initial','addendum','correction'].includes(String(r.kind))&&localized(r.title)&&localized(r.text)&&Array.isArray(r.sourceIds)&&r.sourceIds.every(id=>sources.some(s=>s.id===id))))throw new Error('Invalid history')
  return value as unknown as Observation
}
