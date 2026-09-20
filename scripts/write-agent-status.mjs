import fs from 'node:fs/promises'
import {execFileSync} from 'node:child_process'
const read=async(path,fallback)=>{try{return JSON.parse(await fs.readFile(path,'utf8'))}catch{return fallback}}
const now=new Date().toISOString()
const project=await read('.content-agent/project-status.json',{state:'unavailable',checkedAt:now,source:'Garbuz7/CopyPump-Eternal/docs/PUBLIC_MILESTONES.json',detail:'project step did not report'})
const radar=await read('.content-agent/radar-status.json',{state:'unavailable',checkedAt:now,source:'Solana getSignatureStatuses',detail:'radar step did not report'})
let changed=[];try{changed=execFileSync('git',['diff','--name-only'],{encoding:'utf8'}).split(/\r?\n/).filter(Boolean)}catch{}
const status={schemaVersion:1,updatedAt:now,mode:'AUTONOMOUS_DATA_ONLY',
 project:{...project,changed:changed.includes('src/content/project-status.generated.ts')||changed.includes('public/public-status.json')},
 radar:{...radar,changed:changed.includes('public/radar/index.json')||changed.some(x=>/^public\/radar\/observations\/.+\.json$/.test(x))},
 guard:{coreUiFrozen:true,autonomousWriteScope:['src/content/project-status.generated.ts','public/public-status.json','public/agent-status.json','public/radar/index.json','public/radar/observations/*.json:lastCheckedAt-only']}}
await fs.writeFile('public/agent-status.json',JSON.stringify(status,null,2)+'\n')
console.log('AGENT_STATUS_WRITTEN',status.project.state,status.radar.state)
