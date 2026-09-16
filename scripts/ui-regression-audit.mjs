import fs from 'node:fs'
const read=p=>fs.readFileSync(p,'utf8')
const header=read('src/components/Header.tsx')
const experience=read('src/components/Experience.tsx')
const details=read('src/components/ProjectDetails.tsx')
const css=read('src/styles/app.css')+read('src/styles/mobile-nav-hotfix.css')+read('src/styles/project-page.css')
const failures=[]
const must=(ok,msg)=>{if(!ok)failures.push(msg)}
must(!header.includes('<dialog'),'mobile navigation must not use native dialog')
must(header.includes('mobile-nav__backdrop')&&header.includes('mobile-nav__panel'),'mobile navigation overlay layers missing')
must(!experience.includes("querySelector('.mobile-nav"),'global Motion must not depend on mobile nav DOM presence')
must(!details.includes('project-detail__index'),'decorative Project disclosure numbering must stay removed')
must(css.includes('prefers-reduced-motion'),'reduced-motion fallback missing')
if(failures.length){console.error(failures.map(x=>'FAIL: '+x).join('\n'));process.exit(1)}
console.log('UI regression audit passed')
