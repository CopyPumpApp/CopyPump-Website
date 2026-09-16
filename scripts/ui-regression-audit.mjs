import {readFileSync,statSync} from 'node:fs'
const read=p=>readFileSync(p,'utf8')
const site=read('src/premium/Site.tsx'),css=read('src/premium/premium.css'),motion=read('src/components/Experience.tsx')
const failures=[]
const must=(v,msg)=>{if(!v)failures.push(msg)}
must(site.includes('createPortal')&&site.includes('document.body'),'Navigation must escape page stacking contexts.')
must(site.includes('app.inert=true')&&site.includes("e.key!=='Tab'"),'Modal focus and background interaction containment required.')
must(css.includes('prefers-reduced-motion'),'Reduced-motion support required.')
must(!css.includes('!important'),'The v48 stylesheet must not become a second override stack.')
must(!css.includes('backdrop-filter')&&!css.includes('filter:'),'No live full-scene blur/filter repaint cost.')
must(!motion.includes('pointermove')&&!motion.includes('scrollY'),'No pointer/scroll-driven scene transform loop.')
must(!css.includes('animation-play-state:paused'),'Never freeze the menu on a hidden entrance frame.')
must(statSync('src/premium/premium.css').size<40000,'Presentation CSS must stay within the 40KB source budget.')
must(site.includes('aria-selected')&&site.includes('policy-result'),'Interactive chapters and policy illustration must remain functional.')
if(failures.length){console.error(failures.join('\n'));process.exit(1)}
console.log('Stable motion, modal behavior and UI budget audit passed.')
