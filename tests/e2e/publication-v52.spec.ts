import {test,expect,type Page} from '@playwright/test'
import {readFileSync,mkdirSync} from 'node:fs'
const manifest=JSON.parse(readFileSync('dist/publication-manifest.json','utf8'))
const origin='https://copypump-website.copypumphq.workers.dev'

test('initial HTML contains real localized content, metadata and no hidden loading shell',async({request})=>{
 for(const path of ['/','/ru','/project','/ru/project','/progress','/ru/radar','/ru/radar/gross-transfer-net-change','/ru/contact']){
  const response=await request.get(path);expect(response.status()).toBe(200)
  const html=await response.text()
  expect(html).toContain('data-prerendered="true"')
  expect(html).toContain(`href="${origin}${path==='/'?'/':path}"`)
  expect(html).toContain('site-bootstrap');expect(html).not.toContain('<!--$!-->')
  expect(response.headers()['x-content-type-options']).toBe('nosniff')
  expect(response.headers()['content-security-policy']).toContain("frame-ancestors 'none'")
 }
 const ru=await (await request.get('/ru')).text()
 for(const text of ['Задачи системы','публичный валидатор','Ключи остаются у вас','2026-09-14'])expect(ru).toContain(text)
 const bad=await request.get('/a-nonexistent-page');expect(bad.status()).toBe(404)
 const badRadar=await request.get('/radar/a-nonexistent-case');expect(badRadar.status()).toBe(404)
 if(manifest.preview)expect((await request.get('/')).headers()['x-robots-tag']).toContain('noindex')
})

test('no JavaScript: Home, Product and source-backed Radar remain readable',async({browser})=>{
 const context=await browser.newContext({javaScriptEnabled:false,baseURL:'http://127.0.0.1:4173'})
 const page=await context.newPage()
 await page.goto('/ru');await expect(page.locator('.hero-intro')).toContainText('сам обнаруживает')
 await expect(page.locator('.responsibility-columns')).toContainText('Задачи системы')
 await expect(page.locator('a[href$="/tools/README.md"]')).toBeVisible()
 await page.goto('/ru/project');await expect(page.locator('.architecture-parts article')).toHaveCount(4)
 await page.goto('/ru/radar/gross-transfer-net-change');await expect(page.locator('.radar-narrative')).toContainText('Сверка')
 await expect(page.locator('.radar-sources a').first()).toHaveAttribute('href',/evidence/)
 await context.close()
})

test('hydration is stable with stored language/motion/saves and no recovery errors',async({page})=>{
 const errors:string[]=[];page.on('pageerror',e=>errors.push(e.message));page.on('console',m=>{if(m.type()==='error')errors.push(m.text())})
 await page.addInitScript(()=>{localStorage.setItem('copypump.motion','paused');localStorage.setItem('copypump.radar.v1',JSON.stringify({saved:['gross-transfer-net-change'],read:{'gross-transfer-net-change':1}}))})
 for(const path of ['/ru','/ru/project','/radar','/ru/radar/gross-transfer-net-change','/ru/progress','/ru/contact']){
  await page.goto(path);await page.waitForTimeout(300);await expect(page.locator('main h1')).toHaveCount(1)
  await expect(page.locator('html')).toHaveAttribute('data-motion','off')
 }
 expect(errors).toEqual([])
})

test('first-screen copy stays visible while JavaScript downloads and after hydration',async({page})=>{
 await page.route('**/assets/*.js',async route=>{await new Promise(r=>setTimeout(r,800));await route.continue()})
 await page.goto('/ru',{waitUntil:'commit'});await expect(page.locator('.hero-intro')).toBeVisible()
 await expect.poll(()=>page.locator('.hero-intro').evaluate(n=>getComputedStyle(n).opacity)).toBe('1')
 await page.waitForLoadState('load');await expect(page.locator('.hero-intro')).toHaveCSS('opacity','1')
})

test('content has six distinct scenes with real evidence, not repeated marketing panels',async({page})=>{
 await page.goto('/ru');await page.emulateMedia({reducedMotion:'reduce'})
 expect(await page.locator('main > section').evaluateAll(ns=>ns.map(n=>n.id||n.className))).toHaveLength(6)
 await expect(page.locator('.chapter-explanations dt')).toHaveCount(2)
 await expect(page.locator('.evidence-links')).toContainText('не доказывает')
 await expect(page.locator('.radar-other-notes article')).toHaveCount(2)
 await page.locator('#chapter-2').click();await page.locator('#capital-limit').press('End');await expect(page.locator('.policy-result')).toContainText('В пределах лимита')
 const descriptions=await page.locator('main p').allTextContents()
 const substantive=descriptions.filter(x=>x.length>100);expect(new Set(substantive).size).toBe(substantive.length)
})

test('wide and narrow publication compositions',async({page,browserName,isMobile},info)=>{
 test.skip(browserName!=='chromium'||isMobile);test.setTimeout(90_000)
 const dir=`test-results/visual-qa/${info.project.name}`;mkdirSync(dir,{recursive:true})
 for(const width of [320,390,768,1440,1920,2560]){
  await page.setViewportSize({width,height:width===1920?854:1000});await page.goto('/ru');await page.emulateMedia({reducedMotion:'reduce'})
  expect(await page.evaluate(()=>document.documentElement.scrollWidth-document.documentElement.clientWidth),`${width}px`).toBeLessThanOrEqual(1)
  await page.screenshot({path:`${dir}/v52-home-${width}.png`,fullPage:true})
 }
})

test('record representative v52 reading and navigation states',async({page},info)=>{
 const dir=`test-results/visual-qa/${info.project.name}`;mkdirSync(dir,{recursive:true})
 for(const path of ['/ru','/ru/project','/ru/progress','/ru/radar']){
  await page.goto(path);await page.waitForTimeout(1700);await page.screenshot({path:`${dir}/v52-${path.slice(1).replaceAll('/','-')}.png`})
 }
 await page.goto('/ru')
 for(const id of ['experience','your-control','status','radar-preview','community']){
  await page.locator('#'+id).evaluate(n=>n.scrollIntoView({block:'start',behavior:'auto'}));await page.waitForTimeout(1800)
  await page.screenshot({path:`${dir}/v52-${id}.png`})
 }
})
