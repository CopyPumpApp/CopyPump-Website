import {readFileSync,statSync} from 'node:fs'
const read=p=>readFileSync(p,'utf8')
const site=read('src/premium/Site.tsx'),css=read('src/premium/premium.css'),motion=read('src/components/Experience.tsx'),menu=read('src/premium/useAnimatedMenu.ts'),scene=read('src/premium/SceneBackdrop.tsx')
const failures=[]
const must=(v,msg)=>{if(!v)failures.push(msg)}
must(site.includes('createPortal')&&site.includes('document.body'),'Navigation must escape page stacking contexts.')
must(menu.includes('app.inert = true')&&menu.includes("e.key !== 'Tab'"),'Modal focus and background interaction containment required.')
must(css.includes('prefers-reduced-motion'),'Reduced-motion support required.')
must(!css.includes('!important'),'The v51 stylesheet must not become a second override stack.')
// A fixed 12px backdrop blur is confined to the feathered scrolled header.
// Keep every other scene, menu and text layer free of filter/blur effects.
const withoutCanopy = css
  .replace(/\.site-header\[data-scrolled=true\]::before\{[^}]*\}/g,'')
  .replace(/@supports not \(\(backdrop-filter:blur\(1px\)\) or \(-webkit-backdrop-filter:blur\(1px\)\)\)/g,'')
must(!withoutCanopy.includes('filter:'),'Only the scrolled header canopy may apply a backdrop filter.')
must(css.includes('backdrop-filter:blur(12px)'),'Header text bleed requires the bounded readability canopy.')
must(!motion.includes('pointermove')&&!motion.includes('scrollY'),'No pointer/scroll-driven scene transform loop.')
must(!css.includes('animation-play-state:paused'),'Never freeze the menu on a hidden entrance frame.')
must(statSync('src/premium/premium.css').size<52000,'V52 adds six content layouts; presentation CSS must remain below 52KB source.')
must(site.includes('aria-selected')&&site.includes('policy-result'),'Interactive chapters and policy illustration must remain functional.')
must(!site.includes('hero-art')&&site.includes('<SceneBackdrop routeKey='),'Artwork must be persistent environment, not a Hero illustration.')
must(scene.includes('scene-backdrop')&&!site.includes('community-monogram'),'No repeated background or decorative CP monogram.')
must(menu.includes("'closing'")&&menu.includes('clearTimeout(timer)'), 'Closing must have a bounded, cancellable lifetime.')
if(failures.length){console.error(failures.join('\n'));process.exit(1)}
console.log('Stable motion, modal behavior and UI budget audit passed.')
