import fs from 'node:fs/promises'

const root='public/radar'
const checkedAt=new Date().toISOString()
await fs.mkdir('.content-agent',{recursive:true})
const statusPath='.content-agent/radar-status.json'
const writeStatus=(value)=>fs.writeFile(statusPath,JSON.stringify({schemaVersion:1,checkedAt,source:'Solana getSignatureStatuses',...value},null,2)+'\n')
const same=(a,b)=>JSON.stringify(a??null)===JSON.stringify(b??null)

try{
  const index=JSON.parse(await fs.readFile(root+'/index.json','utf8'))
  const observations=[]
  for(const item of index.items||[]){
    const path=root+'/observations/'+item.id+'.json'
    observations.push({path,doc:JSON.parse(await fs.readFile(path,'utf8'))})
  }
  const groups=new Map()
  for(const entry of observations){
    if(!['mainnet-beta','devnet'].includes(entry.doc.cluster))throw new Error('UNSUPPORTED_CLUSTER:'+entry.doc.cluster)
    const list=groups.get(entry.doc.cluster)||[];list.push(entry);groups.set(entry.doc.cluster,list)
  }
  const mismatches=[],providers=[]
  for(const [cluster,entries] of groups){
    const endpoint=cluster==='devnet'?'https://api.devnet.solana.com':'https://api.mainnet-beta.solana.com'
    const response=await fetch(endpoint,{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({jsonrpc:'2.0',id:1,method:'getSignatureStatuses',params:[entries.map(x=>x.doc.signature),{searchTransactionHistory:true}]}),signal:AbortSignal.timeout(15000)})
    if(!response.ok)throw new Error('RPC_HTTP_'+response.status)
    const payload=await response.json(),values=payload?.result?.value
    if(!Array.isArray(values)||values.length!==entries.length)throw new Error('RPC_STATUS_SHAPE_INVALID')
    providers.push({cluster,endpoint,ok:true,count:entries.length})
    for(let i=0;i<entries.length;i++){
      const doc=entries[i].doc,live=values[i]
      const source=(doc.sources||[]).find(s=>s.id==='transaction'&&/^\/radar\/evidence\/[a-z0-9-]+\.json$/.test(s.url))
      if(!source||!live){mismatches.push({id:doc.id,reason:!source?'ARCHIVED_TRANSACTION_SOURCE_MISSING':'LIVE_STATUS_MISSING'});continue}
      const archived=JSON.parse(await fs.readFile('public'+source.url,'utf8')).result
      if(live.confirmationStatus!=='finalized'||live.slot!==archived?.slot||!same(live.err,archived?.meta?.err)){
        mismatches.push({id:doc.id,reason:'LIVE_STATUS_DIFFERS_FROM_ARCHIVED_EVIDENCE',expectedSlot:archived?.slot??null,observedSlot:live.slot??null})
      }
    }
  }
  if(mismatches.length){
    await writeStatus({state:'attention',checkedObservations:observations.length,verifiedObservations:observations.length-mismatches.length,mismatches,providers})
    console.warn('RADAR_AGENT_ATTENTION mismatches='+mismatches.length)
  }else{
    for(const entry of observations){entry.doc.lastCheckedAt=checkedAt;await fs.writeFile(entry.path,JSON.stringify(entry.doc,null,2)+'\n')}
    for(const item of index.items)item.lastCheckedAt=checkedAt
    await fs.writeFile(root+'/index.json',JSON.stringify(index,null,2)+'\n')
    await writeStatus({state:'ok',checkedObservations:observations.length,verifiedObservations:observations.length,mismatches:[],providers})
    console.log('RADAR_AGENT_OK observations='+observations.length)
  }
}catch(error){
  await writeStatus({state:'unavailable',checkedObservations:0,verifiedObservations:0,mismatches:[],detail:String(error?.message||error).slice(0,180)})
  console.warn('RADAR_AGENT_UNAVAILABLE',String(error?.message||error))
}
