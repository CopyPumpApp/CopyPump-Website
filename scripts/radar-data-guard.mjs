import fs from 'node:fs/promises'
import crypto from 'node:crypto'
import {execFileSync} from 'node:child_process'
import assert from 'node:assert/strict'

const changed=[...new Set([execFileSync('git',['diff','--name-only'],{encoding:'utf8'}),execFileSync('git',['ls-files','--others','--exclude-standard'],{encoding:'utf8'})].join('\n').split(/\r?\n/).map(x=>x.trim()).filter(x=>x&&!x.startsWith('.content-agent/')))]
const show=path=>{try{return execFileSync('git',['show','HEAD:'+path],{encoding:'utf8'})}catch{return null}}
const json=path=>JSON.parse(execFileSync('git',['show','HEAD:'+path],{encoding:'utf8'}))
const strip=value=>{const copy=structuredClone(value);delete copy.lastCheckedAt;return copy}
const obsPattern=/^public\/radar\/observations\/[a-z0-9-]+\.json$/
const evidencePattern=/^public\/radar\/evidence\/auto-transaction-[a-z0-9-]+\.json$/
const newObservations=[]
const localized=x=>x&&typeof x.en==='string'&&x.en.trim()&&typeof x.ru==='string'&&x.ru.trim()
const safeText=value=>!/(guaranteed|profit promise|buy now|sell now|financial advice|mainnet ready)/i.test(JSON.stringify(value))

for(const path of changed.filter(x=>obsPattern.test(x))){
  const prior=show(path),after=JSON.parse(await fs.readFile(path,'utf8'))
  if(prior){
    const before=JSON.parse(prior)
    assert.deepEqual(strip(after),strip(before),path+': existing autonomous Radar records may change lastCheckedAt only')
    assert.ok(Number.isFinite(Date.parse(after.lastCheckedAt))&&Date.parse(after.lastCheckedAt)>=Date.parse(before.lastCheckedAt),path+': invalid lastCheckedAt')
  }else{
    newObservations.push({path,after})
    assert.match(after.id,/^[a-z0-9][a-z0-9-]{0,79}$/)
    assert.equal(path,'public/radar/observations/'+after.id+'.json')
    assert.equal(after.version,1);assert.equal(after.followUps,0);assert.equal(after.cluster,'mainnet-beta')
    assert.ok(localized(after.title)&&localized(after.summary)&&localized(after.category)&&localized(after.interpretation))
    assert.ok(Array.isArray(after.facts)&&after.facts.length>=2&&after.facts.every(localized))
    assert.ok(Array.isArray(after.unknowns)&&after.unknowns.length>=2&&after.unknowns.every(localized))
    assert.ok(Array.isArray(after.revisions)&&after.revisions.length===1&&after.revisions[0].kind==='initial')
    assert.ok(safeText(after))
    for(const field of ['publishedAt','updatedAt','observedAt','lastCheckedAt'])assert.ok(Number.isFinite(Date.parse(after[field])))
    assert.ok(Date.now()-Date.parse(after.publishedAt)<20*60_000)
    assert.match(after.signature,/^[1-9A-HJ-NP-Za-km-z]{80,90}$/)
    const tx=after.sources.find(x=>x.id==='transaction')
    assert.ok(tx&&evidencePattern.test('public'+tx.url),'new observation requires generated transaction evidence')
    const rawText=await fs.readFile('public'+tx.url,'utf8')
    assert.equal(tx.sha256,crypto.createHash('sha256').update(rawText).digest('hex'))
    const raw=JSON.parse(rawText).result
    assert.equal(raw.transaction.signatures[0],after.signature)
    assert.equal(new Date(raw.blockTime*1000).toISOString(),new Date(after.observedAt).toISOString())
    assert.equal(raw.meta.err,null)
  }
}
assert.ok(newObservations.length<=1,'at most one new Radar observation per run')

for(const path of changed.filter(x=>evidencePattern.test(x))){
  assert.equal(show(path),null,'generated evidence is append-only')
  const raw=JSON.parse(await fs.readFile(path,'utf8'))
  assert.ok(raw?.result?.transaction?.signatures?.[0]&&raw?.result?.meta)
}
assert.ok(changed.filter(x=>evidencePattern.test(x)).length<=1,'at most one new evidence file per run')

if(changed.includes('public/radar/index.json')){
  const before=json('public/radar/index.json'),after=JSON.parse(await fs.readFile('public/radar/index.json','utf8'))
  const beforeById=new Map(before.items.map(x=>[x.id,x]))
  const newItems=after.items.filter(x=>!beforeById.has(x.id))
  assert.equal(newItems.length,newObservations.length)
  for(const old of before.items){
    const next=after.items.find(x=>x.id===old.id);assert.ok(next,'existing Radar item removed')
    assert.deepEqual(strip(next),strip(old),'existing Radar index records may change lastCheckedAt only')
  }
  for(const {after:doc} of newObservations){
    const item=after.items.find(x=>x.id===doc.id);assert.ok(item,'new observation missing from index')
    for(const field of ['id','version','publishedAt','updatedAt','observedAt','lastCheckedAt','cluster','title','summary','category','followUps'])assert.deepEqual(item[field],doc[field])
  }
  if(newItems.length){
    assert.equal(Number(after.edition),Number(before.edition)+1)
    assert.equal(after.publishedAt,newItems[0].publishedAt)
    assert.equal(after.items[0].id,newItems[0].id)
  }else{
    assert.equal(after.edition,before.edition);assert.equal(after.publishedAt,before.publishedAt)
  }
}

if(changed.includes('public/agent-status.json')){
  const status=JSON.parse(await fs.readFile('public/agent-status.json','utf8'))
  assert.equal(status.schemaVersion,1);assert.equal(status.mode,'AUTONOMOUS_DATA_ONLY');assert.equal(status.guard?.coreUiFrozen,true)
  assert.ok(Number.isFinite(Date.parse(status.updatedAt)))
  assert.ok(['ok','unavailable','attention','pending'].includes(status.project?.state))
  assert.ok(['ok','unavailable','attention','pending'].includes(status.radar?.state))
}
console.log('RADAR_DATA_GUARD_OK new='+newObservations.length)
