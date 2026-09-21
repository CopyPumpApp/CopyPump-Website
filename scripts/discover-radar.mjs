import fs from 'node:fs/promises'
import crypto from 'node:crypto'

const ROOT='public/radar'
const ENDPOINT='https://api.mainnet-beta.solana.com'
const ADDRESS='TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA'
const MAX_SOURCE_AGE_MS=6.5*3600_000
const MIN_INTERVAL_MS=5.5*3600_000
const DAILY_CAP=4
const IMPORTANCE_THRESHOLD=6
const now=new Date()
const nowIso=now.toISOString()
await fs.mkdir('.content-agent',{recursive:true})
const statusPath='.content-agent/radar-discovery.json'
const writeStatus=(value)=>fs.writeFile(statusPath,JSON.stringify({schemaVersion:1,checkedAt:nowIso,source:'Solana public RPC',importanceThreshold:IMPORTANCE_THRESHOLD,...value},null,2)+'\n')

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
const importance=(result,delta,transfers)=>{
  const meta=result.meta||{},fee=Number(meta.fee||0)
  const accountCount=result?.transaction?.message?.accountKeys?.length||0
  const instructionCount=allInstructions(result).length
  const failed=meta.err!==null
  let score=0
  const reasons=[]
  if(failed){score+=3;reasons.push('execution-error')}
  if(delta.changed>=8){score+=4;reasons.push('8+-token-balance-deltas')}
  else if(delta.changed>=4){score+=3;reasons.push('4+-token-balance-deltas')}
  else if(delta.changed>=2){score+=2;reasons.push('2+-token-balance-deltas')}
  else if(delta.changed===1){score+=1;reasons.push('token-balance-delta')}
  if(delta.mints>=3){score+=3;reasons.push('3+-mints')}
  else if(delta.mints>=2){score+=2;reasons.push('multi-mint')}
  if(transfers.total>=5_000_000_000n){score+=3;reasons.push('5+-sol-system-transfers')}
  else if(transfers.total>=1_000_000_000n){score+=2;reasons.push('1+-sol-system-transfers')}
  else if(transfers.total>=250_000_000n){score+=1;reasons.push('0.25+-sol-system-transfers')}
  if(fee>=100_000){score+=2;reasons.push('high-fee')}
  else if(fee>=25_000){score+=1;reasons.push('elevated-fee')}
  if(accountCount>=35){score+=2;reasons.push('35+-accounts')}
  else if(accountCount>=20){score+=1;reasons.push('20+-accounts')}
  if(instructionCount>=15){score+=2;reasons.push('15+-instructions')}
  else if(instructionCount>=8){score+=1;reasons.push('8+-instructions')}
  return {score,reasons,fee,accountCount,instructionCount,failed}
}
const formatSol=(lamports)=>Number(lamports)/1_000_000_000

try{
  const index=JSON.parse(await fs.readFile(ROOT+'/index.json','utf8'))
  const publishedTimes=index.items.map(x=>Date.parse(x.publishedAt)||0).filter(Boolean)
  const mostRecent=Math.max(0,...publishedTimes)
  const publishedLast24h=publishedTimes.filter(t=>Date.now()-t<24*3600_000).length
  if(publishedLast24h>=DAILY_CAP){
    await writeStatus({state:'held',reason:'DAILY_CAP_4',published:false,publishedLast24h})
    console.log('RADAR_DISCOVERY_HELD daily-cap=4')
    process.exit(0)
  }
  if(mostRecent&&Date.now()-mostRecent<MIN_INTERVAL_MS){
    await writeStatus({state:'held',reason:'CADENCE_6H',published:false,publishedLast24h})
    console.log('RADAR_DISCOVERY_HELD cadence=6h')
    process.exit(0)
  }

  const known=new Set()
  for(const item of index.items){
    const doc=JSON.parse(await fs.readFile(`${ROOT}/observations/${item.id}.json`,'utf8'))
    known.add(doc.signature)
  }

  const signatures=(await rpc('getSignaturesForAddress',[ADDRESS,{limit:40,commitment:'finalized'}])).result||[]
  const candidates=[]
  let inspected=0
  for(const row of signatures){
    if(!row?.signature||known.has(row.signature))continue
    if(!Number.isFinite(row.blockTime)||Date.now()-row.blockTime*1000>MAX_SOURCE_AGE_MS)continue
    if(inspected>=16)break
    inspected++
    const envelope=await rpc('getTransaction',[row.signature,{encoding:'jsonParsed',commitment:'finalized',maxSupportedTransactionVersion:0}])
    const result=envelope.result
    if(!result?.meta||!Number.isFinite(result.blockTime))continue
    if(Date.now()-result.blockTime*1000>MAX_SOURCE_AGE_MS)continue
    const delta=tokenDeltaStats(result.meta)
    const transfers=transferStats(result)
    const rank=importance(result,delta,transfers)
    if(rank.score<IMPORTANCE_THRESHOLD)continue
    candidates.push({row,envelope,result,delta,transfers,rank})
  }
  candidates.sort((a,b)=>b.rank.score-a.rank.score||b.result.blockTime-a.result.blockTime)
  const candidate=candidates[0]

  if(!candidate){
    await writeStatus({state:'ok',reason:'NO_FRESH_IMPORTANT_EVENT',published:false,inspected,candidatesAboveThreshold:0,publishedLast24h})
    console.log('RADAR_DISCOVERY_NO_FRESH_IMPORTANT_EVENT inspected='+inspected)
    process.exit(0)
  }

  const {row,envelope,result,delta,transfers,rank}=candidate
  const sig=row.signature
  const suffix=sig.slice(0,10).toLowerCase()
  const id=(rank.failed?'finalized-execution-failed-':'important-transaction-')+suffix
  const evidenceFile='auto-transaction-'+suffix+'.json'
  const evidencePath=ROOT+'/evidence/'+evidenceFile
  const evidenceText=JSON.stringify(envelope,null,2)+'\n'
  const sha256=crypto.createHash('sha256').update(evidenceText).digest('hex')
  const observedAt=new Date(result.blockTime*1000).toISOString()
  const fee=rank.fee
  const ordinal=String(index.items.length+1).padStart(2,'0')

  let title,summary,interpretation,category
  if(rank.failed){
    title=localized('Solana finalized a transaction that still failed.','Solana финализировала транзакцию, которая всё равно завершилась ошибкой.')
    summary=localized(
      `The transaction reached finality but execution failed, while a ${fee.toLocaleString('en-US')}-lamport fee was still charged. Why it matters for CopyPump: finality must never be confused with successful execution.`,
      `Транзакция дошла до финальности, но исполнение завершилось ошибкой, а комиссия ${fee.toLocaleString('ru-RU')} лампорт всё равно была списана. Почему это важно для CopyPump: финальность нельзя путать с успешным исполнением.`
    )
    interpretation=localized(
      'For CopyPump, a finalized signature is not enough. The execution result, fee and expected postconditions must be verified before an operation is recorded as complete.',
      'Для CopyPump одной финализированной подписи недостаточно. Перед фиксацией результата нужно проверить исполнение, комиссию и ожидаемое итоговое состояние.'
    )
    category=localized(`FAILED EXECUTION / ${ordinal}`,`ОШИБКА ИСПОЛНЕНИЯ / ${ordinal}`)
  }else{
    const movement=delta.changed>0?`${delta.changed} token-balance entr${delta.changed===1?'y':'ies'}`:'multiple account states'
    title=localized(`A fresh Solana transaction changed ${movement}.`,`Свежая Solana-транзакция изменила ${delta.changed} записей токен-балансов.`)
    summary=localized(
      `This finalized transaction changed ${movement} across ${delta.mints} mint${delta.mints===1?'':'s'}, paid a ${fee.toLocaleString('en-US')}-lamport fee${transfers.total>=250_000_000n?` and contains system transfers totaling about ${formatSol(transfers.total).toFixed(3)} SOL`:''}. Why it matters for CopyPump: the result should be reconstructed from the full end state, not one status or transfer.`,
      `Эта финализированная транзакция изменила ${delta.changed} записей токен-балансов по ${delta.mints} mint-адресам, списала комиссию ${fee.toLocaleString('ru-RU')} лампорт${transfers.total>=250_000_000n?` и содержит системные переводы суммарно примерно на ${formatSol(transfers.total).toFixed(3)} SOL`:''}. Почему это важно для CopyPump: итог нужно восстанавливать по полному конечному состоянию, а не по одному статусу или переводу.`
    )
    interpretation=localized(
      'For CopyPump, a transaction result should be reconstructed from the actual balance changes, fees and postconditions. This reduces false positives when a transaction is technically successful but economically different from the intended outcome.',
      'Для CopyPump результат транзакции нужно восстанавливать по реальным изменениям балансов, комиссиям и итоговым условиям. Это снижает риск ложного успеха, когда транзакция технически прошла, но экономический результат отличается от ожидаемого.'
    )
    category=localized(`IMPORTANT TRANSACTION / ${ordinal}`,`ВАЖНАЯ ТРАНЗАКЦИЯ / ${ordinal}`)
  }

  const facts=[
    localized(
      `The event occurred at slot ${result.slot}. Execution status: ${rank.failed?'failed':'successful'}; network fee: ${fee.toLocaleString('en-US')} lamports.`,
      `Событие произошло в слоте ${result.slot}. Результат исполнения: ${rank.failed?'ошибка':'успех'}; сетевая комиссия: ${fee.toLocaleString('ru-RU')} лампорт.`
    ),
    localized(
      `Reported pre/post token balances contain ${delta.changed} changed entr${delta.changed===1?'y':'ies'} across ${delta.mints} mint${delta.mints===1?'':'s'}.`,
      `В указанных токен-балансах до и после операции изменились ${delta.changed} записей по ${delta.mints} mint-адресам.`
    )
  ]
  if(transfers.count>0)facts.push(localized(
    `The parsed instruction set contains ${transfers.count} system transfer leg${transfers.count===1?'':'s'} totaling ${formatSol(transfers.total).toFixed(6)} SOL.`,
    `В разобранном наборе инструкций есть ${transfers.count} системных переводов суммарно на ${formatSol(transfers.total).toFixed(6)} SOL.`
  ))

  const observation={
    id,version:1,category,title,summary,facts,interpretation,
    unknowns:[
      localized('We do not identify account owners, infer intent, cost basis or profitability.','Мы не устанавливаем владельцев аккаунтов и не выводим намерения, себестоимость или прибыльность.'),
      localized('This one event is selected because it is structurally notable, not because it predicts price direction or represents the whole Solana market.','Это событие выбрано из-за заметной структуры транзакции, а не как прогноз цены или представление всего рынка Solana.')
    ],
    publishedAt:nowIso,updatedAt:nowIso,observedAt,lastCheckedAt:nowIso,cluster:'mainnet-beta',signature:sig,followUps:0,
    sources:[
      {id:'transaction',label:localized('Archived RPC transaction response','Сохранённый ответ RPC: транзакция'),url:'/radar/evidence/'+evidenceFile,checkedAt:nowIso,sha256},
      {id:'explorer',label:localized('Open transaction in Solana Explorer','Транзакция в Solana Explorer'),url:'https://explorer.solana.com/tx/'+sig+'?cluster=mainnet-beta',checkedAt:nowIso},
      {id:'docs',label:localized('Solana RPC response fields','Поля ответа Solana RPC'),url:'https://solana.com/docs/rpc/json-structures',checkedAt:nowIso}
    ],
    revisions:[{version:1,at:nowIso,kind:'initial',title:localized('Important-event review','Разбор важного события'),text:localized(`Selected automatically from fresh public activity after scoring ${rank.score}/${IMPORTANCE_THRESHOLD} or higher for structural significance. The editorial claims are limited to the archived RPC evidence.`,`Событие автоматически выбрано из свежей публичной активности после оценки значимости ${rank.score}/${IMPORTANCE_THRESHOLD} или выше. Все выводы ограничены сохранёнными RPC-доказательствами.`),sourceIds:['transaction']}]
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
  await writeStatus({state:'ok',published:true,id,signature:sig,evidence:'/radar/evidence/'+evidenceFile,importanceScore:rank.score,importanceReasons:rank.reasons,inspected,candidatesAboveThreshold:candidates.length,publishedLast24h})
  console.log('RADAR_DISCOVERY_PUBLISHED',id,'score='+rank.score,'reasons='+rank.reasons.join(','))
}catch(error){
  await writeStatus({state:'unavailable',published:false,detail:String(error?.message||error).slice(0,180)})
  console.warn('RADAR_DISCOVERY_UNAVAILABLE',String(error?.message||error))
}
