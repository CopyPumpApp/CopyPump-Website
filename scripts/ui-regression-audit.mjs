import fs from 'node:fs'

const read = p => fs.readFileSync(p, 'utf8')
const header = read('src/components/Header.tsx')
const experience = read('src/components/Experience.tsx')
const autoRail = read('src/components/AutoRail.tsx')
const details = read('src/components/ProjectDetails.tsx')
const indexCss = read('src/styles/index.css')
const uiCleanup = read('src/styles/ui-cleanup.css')
const css = read('src/styles/app.css') + read('src/styles/responsive-navigation.css') + read('src/styles/project-page.css')
const failures = []
const must = (ok, msg) => { if (!ok) failures.push(msg) }

must(!header.includes('<dialog'), 'mobile navigation must not use native dialog')
must(header.includes('mobile-nav__backdrop') && header.includes('mobile-nav__panel'), 'mobile navigation overlay layers missing')
must(!experience.includes("querySelector('.mobile-nav"), 'global Motion must not depend on mobile nav DOM presence')
must(!autoRail.includes('useMotion') && !autoRail.includes('motion.running') && !autoRail.includes('motion.modal'), 'auto rail runtime must not rebuild from global motion context state')
must(autoRail.includes('MutationObserver(sync)'), 'auto rail must observe global motion state without rebuilding its runtime')
must(uiCleanup.includes('.cinematic-v47 .rail-viewport{overflow-x:hidden;touch-action:pan-y pinch-zoom}'), 'horizontal rails must not combine native horizontal scrolling with custom drag motion')
must(!details.includes('project-detail__index'), 'decorative Project disclosure numbering must stay removed')
must(indexCss.includes("@import './responsive-navigation.css';"), 'canonical responsive navigation stylesheet must stay imported')
must(!indexCss.includes('mobile-nav-hotfix.css'), 'obsolete mobile navigation hotfix must stay removed')
must(css.includes('prefers-reduced-motion'), 'reduced-motion fallback missing')

if (failures.length) {
  console.error(failures.map(x => 'FAIL: ' + x).join('\n'))
  process.exit(1)
}
console.log('UI regression audit passed')
