import {test,expect} from '@playwright/test'

for(const path of ['/radar','/ru/radar','/ru/radar/gross-transfer-net-change'])test(`direct Radar hydration retains local state without recovery: ${path}`,async({page})=>{
 const errors:string[]=[]
 page.on('pageerror',e=>errors.push(e.message))
 page.on('console',m=>{if(m.type()==='error')errors.push(`${page.url()}: ${m.text()}`)})
 await page.addInitScript(()=>{localStorage.setItem('copypump.motion','paused');localStorage.setItem('copypump.radar.v1',JSON.stringify({saved:['gross-transfer-net-change'],read:{'gross-transfer-net-change':1}}))})
 for(let run=0;run<3;run++){
  await page.goto(path)
  await expect(page.locator('html')).toHaveAttribute('data-motion','off')
  if(path.endsWith('/radar')){await expect(page.locator('.radar-update')).toHaveCount(1);await expect(page.locator('.radar-row .radar-save').first()).toHaveAttribute('aria-pressed','true')}
  else{await expect(page.locator('.radar-article-actions .radar-save')).toHaveAttribute('aria-pressed','true');await expect(page.locator('.radar-narrative')).toBeVisible()}
  await page.waitForTimeout(300)
  expect(errors).toEqual([])
 }
})

test('delayed initial Radar chunk never replaces the published article with a loading shell',async({page})=>{
 const errors:string[]=[];page.on('console',m=>{if(m.type()==='error')errors.push(m.text())})
 await page.route('**/assets/Radar-*.js',async route=>{await new Promise(r=>setTimeout(r,900));await route.continue()})
 await page.goto('/ru/radar/gross-transfer-net-change',{waitUntil:'commit'})
 await expect(page.locator('.radar-narrative')).toBeVisible()
 await expect(page.locator('.radar-narrative')).toHaveCSS('opacity','1')
 await page.waitForLoadState('networkidle')
 await page.locator('.radar-article-actions .radar-save').click()
 await expect(page.locator('.radar-article-actions .radar-save')).toHaveAttribute('aria-pressed','true')
 expect(errors).toEqual([])
})
