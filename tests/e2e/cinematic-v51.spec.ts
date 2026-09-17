import {test,expect,devices,type Page} from '@playwright/test'
import {mkdirSync,writeFileSync} from 'node:fs'

async function tap(page:Page,selector:string,touch:boolean) {
 const target=page.locator(selector);await expect(target).toBeVisible()
 const r=await target.boundingBox();expect(r).not.toBeNull();const p={x:r!.x+r!.width/2,y:r!.y+r!.height/2}
 expect(await target.evaluate((n,p)=>n.contains(document.elementFromPoint(p.x,p.y)),p)).toBeTruthy()
 if(touch)await page.touchscreen.tap(p.x,p.y);else await page.mouse.click(p.x,p.y)
}

test('transparent header, legible brand and icon-only controls without a frame',async({page,isMobile})=>{
 await page.goto('/ru');await page.waitForTimeout(1900)
 for(const after of [false,true]) {
  if(after)await page.locator('#experience').scrollIntoViewIfNeeded()
  const style=await page.locator('.site-header').evaluate(n=>{const s=getComputedStyle(n);return[s.backgroundColor,s.backgroundImage,s.borderBottomWidth]})
  expect(style).toEqual(['rgba(0, 0, 0, 0)','none','0px'])
  await tap(page,'.menu-button',isMobile);await expect(page.locator('.mobile-nav')).toHaveAttribute('data-phase','open')
  await tap(page,'.icon-button',isMobile);await expect(page.locator('.mobile-nav')).toHaveCount(0)
 }
})

test('every main destination has a distinct, decoded route background; previews are not touch blockers',async({page,isMobile})=>{
 test.setTimeout(90_000);await page.goto('/ru')
 const expected=[['/ru/project','product'],['/ru/progress','progress'],['/ru/radar','radar'],['/ru/#community','community'],['/ru/security','security'],['/ru/contact','contact']]
 for(const [href,theme] of expected){
  await tap(page,'.menu-button',isMobile);await expect(page.locator('.mobile-nav')).toHaveAttribute('data-phase','open')
  if(!isMobile){await page.locator(`.mobile-nav nav a[href="${href}"]`).hover();await expect(page.locator('.scene-backdrop')).toHaveAttribute('data-theme',theme)}
  await page.locator(`.mobile-nav nav a[href="${href}"]`).click()
  await expect(page.locator('.mobile-nav')).toHaveCount(0);await expect(page.locator('.scene-backdrop')).toHaveAttribute('data-theme',theme)
  await expect.poll(()=>page.locator('.scene-art img').evaluate(n=>(n as HTMLImageElement).naturalWidth)).toBe(1672)
  await expect(page.locator('.scene-art-previous')).toHaveCount(0)
 }
})

test('object replacement contains real directional motion and ends with one object',async({page})=>{
 await page.goto('/');await page.locator('#experience').scrollIntoViewIfNeeded();await page.waitForTimeout(1800)
 await page.locator('#chapter-1').click();await expect(page.locator('.chapter-art-stack')).toHaveAttribute('data-direction','forward')
 await expect(page.locator('.chapter-ghost')).toHaveCount(1)
 const frames=await page.locator('.chapter-ghost').evaluate(n=>n.getAnimations().flatMap(a=>(a.effect as KeyframeEffect).getKeyframes()).map(f=>f.transform))
 expect(frames.some(t=>String(t).includes('translate3d'))).toBeTruthy()
 await expect(page.locator('.chapter-ghost')).toHaveCount(0)
 await page.locator('#chapter-0').click();await expect(page.locator('.chapter-art-stack')).toHaveAttribute('data-direction','back');await expect(page.locator('.chapter-ghost')).toHaveCount(0)
 for(const i of [3,1,2,0,3,2])await page.locator(`#chapter-${i}`).click()
 await expect(page.locator('#chapter-2')).toHaveAttribute('aria-selected','true');await expect(page.locator('.chapter-ghost')).toHaveCount(0);await expect(page.locator('.chapter-current')).toHaveCount(1)
 await page.locator('#capital-limit').press('End');await expect(page.locator('.policy-result')).toContainText('Within this limit')
})

test('Home has no demonstration field table and every platform link carries its brand',async({page})=>{
 for(const path of ['/','/project','/contact','/ru/contact']){
  await page.goto(path)
  const platformLinks=page.locator('a[href^="https://x.com"],a[href^="https://github.com"],a[href^="https://discord.gg"],a[href^="mailto:"]')
  expect(await platformLinks.count()).toBeGreaterThanOrEqual(4)
  for(const link of await platformLinks.all())await expect(link.locator('[data-brand]')).toHaveCount(1)
 }
 await page.goto('/');await expect(page.locator('.signal-record,.art-coordinate,.instrument-heading')).toHaveCount(0)
 await expect(page.locator('.experience-disclosure')).toContainText('No wallet connection')
 await expect(page.locator('#status time')).toHaveAttribute('datetime','2026-09-14')
})

test('word masks have one spoken heading, bounded color motion and no hidden text after disabling motion',async({page})=>{
 await page.goto('/');await page.waitForTimeout(2100)
 await expect(page.locator('h1')).toHaveAccessibleName('Smart money. Your rules.')
 const shifts=page.locator('h1 .gradient-shift');expect(await shifts.count()).toBeGreaterThanOrEqual(2)
 expect(await page.locator('main [data-gradient-running=true]').count()).toBeLessThanOrEqual(1)
 const frames=await shifts.evaluateAll(ns=>ns.flatMap(n=>n.getAnimations().flatMap(a=>(a.effect as KeyframeEffect).getKeyframes())))
 expect(frames.length).toBeGreaterThan(0);for(const frame of frames){expect(frame.backgroundPosition).toBeUndefined();expect(frame.opacity).toBeDefined()}
 await page.emulateMedia({reducedMotion:'reduce'});await page.waitForTimeout(100)
 expect(await page.evaluate(()=>document.getAnimations().filter(a=>a.playState==='running').length)).toBe(0)
 expect(await page.locator('[data-reveal]').evaluateAll(ns=>ns.every(n=>getComputedStyle(n).opacity==='1'))).toBeTruthy()
})

test('v51 actual walkthrough, object sweep frames and seven themed menu scenes',async({browser,isMobile},info)=>{
 test.setTimeout(100_000)
 const dir=`test-results/visual-qa/${info.project.name}`;mkdirSync(dir,{recursive:true})
 const device=isMobile?(info.project.name==='iphone-webkit'?devices['iPhone 14']:devices['Pixel 7']):{...devices['Desktop Chrome'],viewport:{width:1440,height:1000}}
 const ctx=await browser.newContext({...device,baseURL:'http://127.0.0.1:4173',recordVideo:{dir:`${dir}/v51-raw`,size:device.viewport}})
 const page=await ctx.newPage(),video=page.video()!,errors:string[]=[];page.on('pageerror',e=>errors.push(e.message))
 await page.goto('/ru');await page.waitForTimeout(2100);await page.screenshot({path:`${dir}/v51-home.png`})
 await page.locator('#experience').evaluate(n=>n.scrollIntoView({block:'start',behavior:'smooth'}));await page.waitForTimeout(2100);await page.screenshot({path:`${dir}/v51-experience.png`})
 if(isMobile)await page.locator('.experience-art').evaluate(n=>n.scrollIntoView({block:'center',behavior:'smooth'}));await page.waitForTimeout(700)
 await page.locator('#chapter-1').click();await page.waitForTimeout(360);await page.screenshot({path:`${dir}/v51-sweep.png`});await page.waitForTimeout(1350)
 await page.locator('#chapter-2').click();await page.waitForTimeout(1600);await page.locator('#capital-limit').press('End');await page.screenshot({path:`${dir}/v51-policy.png`})
 await tap(page,'.menu-button',isMobile);await page.waitForTimeout(1400)
 for(const [href,name] of [['/ru/','home'],['/ru/project','product'],['/ru/progress','progress'],['/ru/radar','radar'],['/ru/#community','community'],['/ru/security','security'],['/ru/contact','contact']]){
  const exact=href==='/ru/'?'/ru':href
  await page.locator(`.mobile-nav nav a[href="${exact}"]`).focus();await page.waitForTimeout(1300);await page.screenshot({path:`${dir}/v51-menu-${name}.png`})
 }
 await page.locator('.mobile-nav nav a[href="/ru/radar"]').click();await page.waitForTimeout(2000);await page.screenshot({path:`${dir}/v51-radar.png`})
 await tap(page,'.menu-button',isMobile);await page.waitForTimeout(1250);await page.locator('.mobile-nav nav a[href="/ru/progress"]').click();await page.waitForTimeout(2000);await page.screenshot({path:`${dir}/v51-progress.png`})
 expect(errors).toEqual([]);await page.close();await video.saveAs(`${dir}/v51-walkthrough.webm`);await ctx.close()
})
