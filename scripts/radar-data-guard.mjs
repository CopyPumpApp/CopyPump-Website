import fs from 'node:fs/promises'
import {execFileSync} from 'node:child_process'
import assert from 'node:assert/strict'
const changed=execFileSync('git',['diff','--name-only'],{encoding:'utf8'}).split(/\r?\n/).map(x=>x.trim()).filter(Boolean)
const fromHead=path=>JSON.parse(execFileSync('git',['show','HEAD:'+path],{encoding:'utf8'}))
const strip=value=>{const copy=structuredClone(value);delete copy.lastCheckedAt;return copy}
for(const path of changed.filter(x=>/^public\/radar\/observations\/[a-z0-9-]+\.json$/.test(x))){
  const before=fromHead(path),after=JSON.parse(await fs.readFile(path,'utf8'))
  assert.deepEqual(strip(after),strip(before),path+': autonomous Radar may change lastCheckedAt only')
  assert.ok(Number.isFinite(Date.parse(after.lastCheckedAt))&&Date.parse(after.lastCheckedAt)>=Date.parse(before.lastCheckedAt),path+': invalid lastCheckedAt')
}
if(changed.includes('public/radar/index.json')){
  const before=fromHead('public/radar/index.json'),after=JSON.parse(await fs.readFile('public/radar/index.json','utf8'))
  const normalize=index=>({...index,items:index.items.map(item=>strip(item))})
  assert.deepEqual(normalize(after),normalize(before),'Radar index: autonomous changes are limited to lastCheckedAt')
  assert.equal(after.items.length,before.items.length)
}
if(changed.includes('public/agent-status.json')){
  const status=JSON.parse(await fs.readFile('public/agent-status.json','utf8'))
  assert.equal(status.schemaVersion,1);assert.equal(status.mode,'AUTONOMOUS_DATA_ONLY');assert.equal(status.guard?.coreUiFrozen,true)
  assert.ok(Number.isFinite(Date.parse(status.updatedAt)))
  assert.ok(['ok','unavailable','attention','pending'].includes(status.project?.state))
  assert.ok(['ok','unavailable','attention','pending'].includes(status.radar?.state))
}
console.log('RADAR_DATA_GUARD_OK')
