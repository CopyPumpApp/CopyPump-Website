/** Rebuild summaries from reviewed observations. No network calls or automatic timestamps. */
import {readFileSync,writeFileSync,readdirSync} from 'node:fs'
const root='public/radar/',previous=JSON.parse(readFileSync(root+'index.json','utf8'))
const args=process.argv.slice(2),edition=args[0]||previous.edition,publishedAt=args[1]||previous.publishedAt
if(!edition.trim()||!Number.isFinite(Date.parse(publishedAt)))throw new Error('Usage: node scripts/build-radar-index.mjs [edition] [explicit ISO publication time]')
const fields=['id','version','publishedAt','updatedAt','observedAt','lastCheckedAt','cluster','title','summary','category','followUps']
const order=new Map(previous.items.map((item,i)=>[item.id,i]))
const items=readdirSync(root+'observations').filter(x=>x.endsWith('.json')).map(file=>{
 const doc=JSON.parse(readFileSync(root+'observations/'+file,'utf8'))
 if(file!==`${doc.id}.json`)throw new Error('Observation ID/file mismatch: '+file)
 return Object.fromEntries(fields.map(field=>[field,doc[field]]))
}).sort((a,b)=>Date.parse(b.updatedAt)-Date.parse(a.updatedAt)||(order.get(a.id)??999)-(order.get(b.id)??999)||a.id.localeCompare(b.id))
writeFileSync(root+'index.json',JSON.stringify({schemaVersion:1,edition,publishedAt,items},null,2)+'\n')
await import('./radar-audit.mjs')
console.log('Index rebuilt; publication dates and versions were not invented. Review the diff before committing.')
