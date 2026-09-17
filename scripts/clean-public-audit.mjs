import { readFileSync, existsSync } from 'node:fs'
const read=p=>readFileSync(p,'utf8')
const app=read('src/App.tsx'),site=read('src/premium/Site.tsx'),copy=read('src/premium/content.ts'),css=read('src/styles/index.css')
const failures=[]
const must=(condition,message)=>{if(!condition)failures.push(message)}
must(app.includes('PremiumLanding')&&app.includes('PremiumProject')&&app.includes('PremiumProgress'),'Three explicit content destinations must remain active.')
must(!app.includes("from './pages/LandingPage'")&&!app.includes("from './pages/ProjectPage'"),'Legacy duplicate marketing sections must not return to the active graph.')
must(css.trim()==="@import '../premium/premium.css';",'Only one presentation system may be imported.')
for(const phrase of ['Technical alpha','Solana Devnet',"mainnet: 'locked'",'2026-09-14','PROJECT_STATUS.md','WS95eXrGB'])must(copy.includes(phrase),`Public fact/source missing: ${phrase}`)
for(const term of ['CopyCube','RUN_FUP_TRUMP','Mizuzi','DNBQtqw6R'])must(!`${site}\n${copy}`.includes(term),`Removed content returned: ${term}`)
must(copy.includes('earth-trading-1600.webp')&&!copy.includes('cinematic-environment-v46'),'Only the restored Earth/trading-room artwork may be active.')
for(const asset of ['earth-trading-900','earth-trading-1600',...['detect','qualify','constrain','execute-prove'].flatMap(x=>[`${x}-480`,`${x}-800`])])must(existsSync(`public/media/v48/${asset}.webp`),`Responsive asset missing: ${asset}`)
must(site.includes('ILLUSTRATIVE')||copy.includes('ILLUSTRATIVE DATA'),'The product illustration must not imply live trading.')
if(failures.length){console.error(failures.join('\n'));process.exit(1)}
console.log('Public claims, content architecture and artwork audit passed.')

await import('./radar-audit.mjs')
