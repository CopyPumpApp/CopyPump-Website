import {test,expect} from '@playwright/test'
import fs from 'node:fs'
const index=JSON.parse(fs.readFileSync('public/radar/index.json','utf8')),id='gross-transfer-net-change',key='copypump.radar.v1'
for(const path of ['/radar','/ru/radar','/radar/'+id,'/ru/radar/'+id])test(`Radar direct route ${path}`,async({page})=>{
 const errors:string[]=[];page.on('pageerror',e=>errors.push(e.message));await page.goto(path)
 await expect(page.locator('h1')).toHaveCount(1);await expect(page.locator(path.endsWith('/radar')?'.radar-row':'.radar-narrative').first()).toBeVisible()
 expect(await page.evaluate(()=>document.documentElement.scrollWidth-innerWidth)).toBeLessThanOrEqual(1);expect(errors).toEqual([])
})
test('saved observations persist without marking all cases read',async({page})=>{
 await page.goto('/radar');const save=page.locator('.radar-row').first().locator('.radar-save');await save.click();await expect(save).toHaveAttribute('aria-pressed','true')
 expect(await page.evaluate(k=>JSON.parse(localStorage.getItem(k)!).read,key)).toEqual({})
 await page.reload();await expect(page.locator('.radar-row').first().locator('.radar-save')).toHaveAttribute('aria-pressed','true')
 await page.locator('.radar-filters button').filter({hasText:/^Saved/}).click();await expect(page.locator('.radar-row')).toHaveCount(1)
 await page.locator('.radar-save').click();await expect(page.locator('.radar-row')).toHaveCount(0)
})
test('an actual newer revision is signalled; opening Home or index does not consume it',async({page})=>{
 await page.addInitScript(({key,id})=>localStorage.setItem(key,JSON.stringify({saved:[id],read:{[id]:1}})),{key,id})
 await page.goto('/');await expect(page.locator('.radar-count').first()).toHaveText('1')
 await page.goto('/radar');await expect(page.locator('.radar-update')).toHaveCount(1)
 await page.getByRole('button',{name:'Updated since reading'}).click();await expect(page.locator('.radar-row')).toHaveCount(1)
 await page.locator('.radar-row h2 a').click();await expect(page.locator('.radar-narrative')).toBeVisible();expect(await page.evaluate(({key,id})=>JSON.parse(localStorage.getItem(key)!).read[id],{key,id})).toBe(1)
 await page.locator('.radar-read-sentinel').scrollIntoViewIfNeeded();await expect.poll(()=>page.evaluate(({key,id})=>JSON.parse(localStorage.getItem(key)!).read[id],{key,id})).toBe(2)
})
test('changing only source-check time does not fabricate an update',async({page})=>{
 const next=structuredClone(index);next.items.forEach((x:any)=>x.lastCheckedAt='2026-09-17T03:00:00Z')
 await page.addInitScript(({key,items})=>localStorage.setItem(key,JSON.stringify({saved:items.map((x:any)=>x.id),read:Object.fromEntries(items.map((x:any)=>[x.id,x.version]))})),{key,items:index.items})
 await page.route('**/radar/index.json',r=>r.fulfill({json:next}));await page.goto('/radar');await page.getByRole('button',{name:'Updated since reading'}).click();await expect(page.locator('.radar-row')).toHaveCount(0);await expect(page.locator('.radar-empty')).toContainText('No published additions')
})
test('storage denial keeps reading usable and clearly labels session-only saves',async({page})=>{
 await page.addInitScript(()=>{Storage.prototype.setItem=function(){throw new DOMException('Blocked','SecurityError')};Storage.prototype.getItem=function(){throw new DOMException('Blocked','SecurityError')}})
 await page.goto('/ru/radar');await page.locator('.radar-row').first().locator('.radar-save').click();await expect(page.locator('.radar-warning')).toContainText('этой сессии');await expect(page.locator('.radar-row').first().locator('.radar-save')).toHaveAttribute('aria-pressed','true')
 await page.locator('.radar-row h2 a').first().click();await expect(page.locator('.radar-narrative')).toBeVisible()
})
test('a refresh failure retains the last loaded edition and does not claim no activity',async({page})=>{
 await page.goto('/radar');await expect(page.locator('.radar-row')).toHaveCount(3)
 await page.route('**/radar/index.json',r=>r.fulfill({status:503,body:'Unavailable'}));await page.getByRole('button',{name:'Refresh edition'}).click();await expect(page.locator('.radar-notice')).toContainText('not evidence of no new activity');await expect(page.locator('.radar-row')).toHaveCount(3)
})
test('invalid JSON, absent record and missing evidence remain explicit',async({page})=>{
 await page.route('**/radar/index.json',r=>r.fulfill({contentType:'application/json',body:'{"schemaVersion":1,"items":[{"id":"bad"}]}'}));await page.goto('/radar');await expect(page.locator('.radar-notice')).toBeVisible();await expect(page.locator('.radar-row')).toHaveCount(0)
 await page.unroute('**/radar/index.json');await page.route('**/radar/observations/not-found.json',r=>r.fulfill({status:404}));await page.goto('/radar/not-found');await expect(page.locator('h1')).toHaveText('Observation not found')
 await page.route('**/radar/observations/'+id+'.json',r=>r.fulfill({status:503}));await page.goto('/radar/'+id);await expect(page.locator('.radar-fallback')).toContainText('could not be loaded')
})
test('Home requests the index only; no RPC, transaction calls or detail payload',async({page})=>{
 const requests:string[]=[];page.on('request',r=>requests.push(r.url()));await page.goto('/');await expect(page.locator('.radar-teaser-list h3')).toBeVisible()
 expect(requests.some(x=>x.includes('/radar/observations/'))).toBeFalsy();expect(requests.some(x=>/api\.mainnet|api\.devnet|getTransaction|walletconnect/.test(x))).toBeFalsy()
})
test('cross-tab storage state updates without a server',async({page,context})=>{
 await page.goto('/radar');await expect(page.locator('.radar-row')).toHaveCount(3);const other=await context.newPage();await other.goto('/radar');await other.locator('.radar-row').first().locator('.radar-save').click();await expect(page.locator('.radar-row').first().locator('.radar-save')).toHaveAttribute('aria-pressed','true');await other.close()
})
test('v50 screenshots: Radar, source-backed article, saved state and existing shared scene',async({page},info)=>{
 const dir=`test-results/visual-qa/${info.project.name}`
 for(const [name,path] of [['v50-radar','/ru/radar'],['v50-observation','/ru/radar/'+id]]){await page.goto(path);await page.waitForTimeout(1600);await page.screenshot({path:`${dir}/${name}.png`})}
 await page.locator('#editorial-history').scrollIntoViewIfNeeded();await page.screenshot({path:`dir/v50-followup.png`.replace('dir',dir)})
 await page.goto('/ru');await page.locator('#radar-preview').scrollIntoViewIfNeeded();await page.waitForTimeout(1300);await page.screenshot({path:`${dir}/v50-home-radar.png`})
 await page.locator('.menu-button').click();await expect(page.locator('.mobile-nav')).toHaveAttribute('data-phase','open');await page.screenshot({path:`${dir}/v50-menu.png`})
})
