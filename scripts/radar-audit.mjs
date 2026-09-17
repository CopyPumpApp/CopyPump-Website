import {readFileSync,statSync} from 'node:fs'
import {createHash} from 'node:crypto'
import assert from 'node:assert/strict'
const root='public/radar/',load=p=>JSON.parse(readFileSync(root+p,'utf8')),index=load('index.json'),provenance=load('evidence/provenance.json')
assert.equal(index.schemaVersion,1);assert.ok(index.items.length>=3);assert.ok(statSync(root+'index.json').size<128000)
const ids=new Set()
for(const call of provenance.calls){assert.equal(call.ok,true);assert.equal(createHash('sha256').update(readFileSync(root+'evidence/'+call.file)).digest('hex'),call.sha256)}
const loc=x=>assert.ok(x&&typeof x.en==='string'&&x.en.trim()&&typeof x.ru==='string'&&x.ru.trim())
for(const item of index.items){
 assert.match(item.id,/^[a-z0-9][a-z0-9-]{0,79}$/);assert.ok(!ids.has(item.id));ids.add(item.id)
 const doc=load('observations/'+item.id+'.json')
 for(const field of Object.keys(item))assert.deepEqual(doc[field],item[field],item.id+': '+field)
 for(const field of ['title','summary','category'])loc(doc[field]);doc.facts.forEach(loc);doc.unknowns.forEach(loc);loc(doc.interpretation)
 for(const field of ['publishedAt','updatedAt','observedAt','lastCheckedAt'])assert.ok(Number.isFinite(Date.parse(doc[field]))&&Date.parse(doc[field])<=Date.now()+60000)
 assert.ok(['mainnet-beta','devnet'].includes(doc.cluster));assert.match(doc.signature,/^[1-9A-HJ-NP-Za-km-z]{80,90}$/)
 assert.equal(doc.version,Math.max(...doc.revisions.map(r=>r.version)));assert.equal(doc.followUps,doc.revisions.filter(r=>r.kind!=='initial').length)
 let prior=0;for(const r of doc.revisions){assert.ok(r.version>prior);prior=r.version;loc(r.title);loc(r.text);for(const id of r.sourceIds)assert.ok(doc.sources.some(s=>s.id===id))}
 const source=doc.sources.find(s=>s.id==='transaction'),file=source.url.split('/').pop(),raw=load('evidence/'+file).result
 assert.equal(raw.transaction.signatures[0],doc.signature);assert.equal(new Date(raw.blockTime*1000).toISOString(),new Date(doc.observedAt).toISOString())
 assert.equal(createHash('sha256').update(readFileSync(root+'evidence/'+file)).digest('hex'),source.sha256)
 for(const src of doc.sources){assert.ok(/^https:\/\//.test(src.url)||/^\/radar\/evidence\/[a-z0-9-]+\.json$/.test(src.url));if(src.sha256&&src.url.startsWith('/radar/evidence/'))assert.equal(createHash('sha256').update(readFileSync('public'+src.url)).digest('hex'),src.sha256)}
 const i=provenance.selected.findIndex(s=>s.signature===doc.signature)
 if(i>=0){const status=load('evidence/follow-up-statuses.json').result.value[i];assert.equal(status.confirmationStatus,'finalized');assert.deepEqual(status.err,raw.meta.err)}
}
// Protect the exact numeric seed claims, not just valid JSON.
const failed=load('evidence/transaction-1.json').result,success=load('evidence/transaction-2.json').result,gross=load('evidence/transaction-3.json').result
const unchanged=t=>t.meta.preTokenBalances.every(a=>t.meta.postTokenBalances.some(b=>a.accountIndex===b.accountIndex&&a.mint===b.mint&&a.uiTokenAmount.amount===b.uiTokenAmount.amount))
assert.equal(failed.meta.fee,5001);assert.equal(failed.meta.postBalances[0]-failed.meta.preBalances[0],-5001);assert.deepEqual(failed.meta.err,{InstructionError:[6,{Custom:5000}]});assert.equal(failed.meta.preTokenBalances.length,11);assert.ok(unchanged(failed))
assert.equal(success.meta.err,null);assert.equal(success.meta.fee,5002);assert.equal(success.transaction.message.accountKeys.length,41);assert.equal(success.meta.preTokenBalances.length,10);assert.ok(unchanged(success));assert.equal(success.meta.innerInstructions.length,0)
assert.equal(gross.meta.err,null);assert.equal(gross.meta.fee,5601);assert.equal(gross.meta.postBalances[0]-gross.meta.preBalances[0],-55897338)
assert.ok(gross.transaction.message.instructions.some(x=>x.parsed?.type==='transfer'&&x.parsed.info.lamports===5384061455))
assert.equal(BigInt(gross.meta.postTokenBalances.find(x=>x.accountIndex===3).uiTokenAmount.amount)-BigInt(gross.meta.preTokenBalances.find(x=>x.accountIndex===3).uiTokenAmount.amount),243974449436n)
console.log('Radar: bilingual records, versions, source hashes and every numeric seed claim verified.')
