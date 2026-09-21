import fs from 'node:fs/promises'
import crypto from 'node:crypto'

const ROOT='public/radar'
const ENDPOINT='https://api.mainnet-beta.solana.com'
const ADDRESS='TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA'
const now=new Date()
const nowIso=now.toISOString()
await fs.mkdir('.content-agent',{recursive:true})
const statusPath='.content-agent/radar-discovery.json'
const writeStatus=(value)=>fs.writeFile(statusPath,JSON.stringify({schemaVersion:1,checkedAt:nowIso,source:'Solana public RPC',...value},null,2)+'\n')
const rpc=async(method,params)=>{
  const response=await fetch(ENDPOINT,{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({jsonrpc:'2.0',id:1,method,params}),signal:AbortSignal.timeout(18000)})
  if(!response.ok)throw new Error('RPC_HTTP_'+response.status)
  const body=await response.json()
  if(body.error)throw new Error('RPC_'+String(body.error?.code||'ERROR'))
  return body
}
const amountMap=(rows=[])=>new Map(rows.map(x=>[`${x.accountIndex}:${x.mint}`,BigInt(x.uiTokenAmount?.amount||'0')]))
const tokenDeltaStats=(meta)=>{
  const pre=amountMap(meta?.preTokenBalances),post=amountMap(meta?.postTokenBalances),keys=new Set([...pre.keys(),...post.keys()])
  let changed=0;const mints=new Set()
  for(const key of keys)if((pre.get(key)||0n)!==(post.get(key)||0n)){changed++;mints.add(key.split(':').slice(1).join(':'))}
  return {changed,mints:mints.size}
}
const allInstructions=(result)=>[
  ...(result?.transaction?.message?.instructions||[]),
  ...((result?.meta?.innerInstructions||[]).flatMap(x=>x.instructions||[])),
]
const transferStats=(result)=>{
  let count=0,total=0n
  for(const ix of allInstructions(result)){
    if(ix?.program==='system'&&ix?.parsed?.type==='transfer'&&Number.isFinite(Number(ix.parsed?.info?.lamports))){
      count++;total+=BigInt(String(ix.parsed.info.lamports))
    }
  }
  return {count,total}
}
const localized=(en,ru)=>({en,ru})

try{
  const index=JSON.parse(await fs.readFile(ROOT+'/index.json','utf8'))
  const mostRecent=Math.max(0,...index.items.map(x=>Date.parse(x.publishedAt)||0))
  if(mostRecent&&Date.now()-mostRecent<24*3600_000){
    await writeStatus({state:'held',reason:'CADENCE_24H',published:false})
    console.log('RADAR_DISCOVERY_HELD cadence=24h')
    process.exit(0)
  }

  const known=new Set()
  for(const item of index.items){
    const doc=JSON.parse(await fs.readFile(`${ROOT}/observations/${item.id}.json`,'utf8'))
    known.add(doc.signature)
  }

  const signatures=(await rpc('getSignaturesForAddress',[ADDRESS,{limit:20,commitment:'finalized'}])).result||[]
  let candidate=null
  for(const row of signatures){
    if(!row?.signature||known.has(row.signature)||row.err)continue
    const envelope=await rpc('getTransaction',[row.signature,{encoding:'jsonParsed',commitment:'finalized',maxSupportedTransactionVersion:0}])
    const result=envelope.result
    if(!result?.meta||result.meta.err!==null||!Number.isFinite(result.blockTime))continue
    const delta=tokenDeltaStats(result.meta)
    if(delta.changed<1)continue
    candidate={row,envelope,result,delta,transfers:transferStats(result)}
    break
  }

  if(!candidate){
    await writeStatus({state:'ok',reason:'NO_DISTINCT_PUBLISHABLE_OBSERVATION',published:false})
    console.log('RADAR_DISCOVERY_NO_PUBLISHABLE_OBSERVATION')
    process.exit(0)
  }

  const {row,envelope,result,delta,transfers}=candidate
  const sig=row.signature
  const suffix=sig.slice(0,10).toLowerCase()
  const id='one-signature-several-deltas-'+suffix
  const evidenceFile='auto-transaction-'+suffix+'.json'
  const evidencePath=ROOT+'/evidence/'+evidenceFile
  const evidenceText=JSON.stringify(envelope,null,2)+'\n'
  const sha256=crypto.createHash('sha256').update(evidenceText).digest('hex')
  const observedAt=new Date(result.blockTime*1000).toISOString()
  const fee=Number(result.meta.fee||0)
  const ordinal=String(index.items.length+1).padStart(2,'0')
  const title=localized(`A Solana transaction changed ${delta.changed} token-balance entr${delta.changed===1?'y':'ies'}.`,`В одной Solana-транзакции изменились ${delta.changed} записей токен-балансов.`)
  const summary=localized(
    `The transaction finished successfully, changed ${delta.changed} token-balance entr${delta.changed===1?'y':'ies'} across ${delta.mints} mint${delta.mints===1?'':'s'} and paid a ${fee.toLocaleString('en-US')}-lamport fee. Why it matters for CopyPump: automation should verify the real balance changes and fee before recording the result.`,
    `Транзакция завершилась успешно, изменила ${delta.changed} записей токен-балансов по ${delta.mints} mint-адресам и списала комиссию ${fee.toLocaleString('ru-RU')} лампорт. Почему это важно для CopyPump: автоматизация должна проверить реальные изменения балансов и комиссию перед фиксацией результата.`
  )
  const facts=[
    localized(
      `At slot ${result.slot}, the transaction is finalized with a successful execution result and a fee of ${fee.toLocaleString('en-US')} lamports.`,
      `В слоте ${result.slot} транзакция финализирована с успешным результатом исполнения и комиссией ${fee.toLocaleString('ru-RU')} лампорт.`
    ),
    localized(
      `Comparing reported pre/post token balances finds ${delta.changed} changed token-balance entr${delta.changed===1?'y':'ies'} across ${delta.mints} mint${delta.mints===1?'':'s'}.`,
      `Сравнение указанных токен-балансов до и после находит ${delta.changed} изменённых записей по ${delta.mints} mint-адресам.`
    )
  ]
  if(transfers.count>0)facts.push(localized(
    `The parsed instruction set also contains ${transfers.count} system transfer leg${transfers.count===1?'':'s'} totaling ${transfers.total.toString()} lamports.`,
    `В разобранном наборе инструкций также есть системные переводы: ${transfers.count}, суммарно ${transfers.total.toString()} лампорт.`
  ))

  const observation={
    id,version:1,
    category:localized(`TRANSACTION CHECK / ${ordinal}`,`РАЗБОР ТРАНЗАКЦИИ / ${ordinal}`),
    title,summary,facts,
    interpretation:localized(
      'For CopyPump, the lesson is simple: a status flag is not a complete execution result. Reconcile the actual balance changes and fee before recording what happened.',
      'Для CopyPump вывод простой: одного статуса недостаточно. Сначала нужно сверить реальные изменения балансов и комиссию, и только потом фиксировать результат.'
    ),
    unknowns:[
      localized('We do not identify the account owners, infer their strategy, cost basis or profitability.','Мы не устанавливаем владельцев аккаунтов и не выводим их стратегию, себестоимость или прибыльность.'),
      localized('Reported token-balance deltas do not describe every possible account-data or program-state change inside the transaction.','Изменения токен-балансов не описывают все возможные изменения данных аккаунтов или состояния программ внутри транзакции.')
    ],
    publishedAt:nowIso,updatedAt:nowIso,observedAt,lastCheckedAt:nowIso,cluster:'mainnet-beta',signature:sig,followUps:0,
    sources:[
      {id:'transaction',label:localized('Archived RPC transaction response','Сохранённый ответ RPC: транзакция'),url:'/radar/evidence/'+evidenceFile,checkedAt:nowIso,sha256},
      {id:'explorer',label:localized('Open transaction in Solana Explorer','Транзакция в Solana Explorer'),url:'https://explorer.solana.com/tx/'+sig+'?cluster=mainnet-beta',checkedAt:nowIso},
      {id:'docs',label:localized('Solana RPC response fields','Поля ответа Solana RPC'),url:'https://solana.com/docs/rpc/json-structures',checkedAt:nowIso}
    ],
    revisions:[{version:1,at:nowIso,kind:'initial',title:localized('Live evidence review','Проверка свежего публичного источника'),text:localized('Initial read-only review of the finalized transaction response. The note is limited to fields directly present in the archived RPC evidence.','Первичная read-only проверка ответа о финализированной транзакции. Вывод ограничен полями, которые непосредственно присутствуют в сохранённом RPC-ответе.'),sourceIds:['transaction']}]
  }

  await fs.writeFile(evidencePath,evidenceText,{flag:'wx'})
  await fs.writeFile(ROOT+'/observations/'+id+'.json',JSON.stringify(observation,null,2)+'\n',{flag:'wx'})
  const summaryFields=['id','version','publishedAt','updatedAt','observedAt','lastCheckedAt','cluster','title','summary','category','followUps']
  const item=Object.fromEntries(summaryFields.map(field=>[field,observation[field]]))
  const edition=String((Number(index.edition)||0)+1).padStart(2,'0')
  index.edition=edition
  index.publishedAt=nowIso
  index.items=[item,...index.items]
  await fs.writeFile(ROOT+'/index.json',JSON.stringify(index,null,2)+'\n')
  await writeStatus({state:'ok',published:true,id,signature:sig,evidence:'/radar/evidence/'+evidenceFile})
  console.log('RADAR_DISCOVERY_PUBLISHED',id,sig)
}catch(error){
  await writeStatus({state:'unavailable',published:false,detail:String(error?.message||error).slice(0,180)})
  console.warn('RADAR_DISCOVERY_UNAVAILABLE',String(error?.message||error))
}
