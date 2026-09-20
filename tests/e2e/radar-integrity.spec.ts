import {test,expect} from '@playwright/test'
import fs from 'node:fs'
const id='gross-transfer-net-change',key='copypump.radar.v1',index=JSON.parse(fs.readFileSync('public/radar/index.json','utf8'))
test('material revisions are not consumed while the page end is offscreen',async({page})=>{
 await page.addInitScript(({id,key})=>localStorage.setItem(key,JSON.stringify({saved:[id],read:{[id]:1}})),{id,key})
 await page.goto('/radar/'+id);await expect(page.locator('.radar-narrative')).toBeVisible();await page.waitForTimeout(1700)
 expect(await page.evaluate(({id,key})=>JSON.parse(localStorage.getItem(key)!).read[id],{id,key})).toBe(1)
 await page.locator('.radar-read-sentinel').scrollIntoViewIfNeeded();await expect.poll(()=>page.evaluate(({id,key})=>JSON.parse(localStorage.getItem(key)!).read[id],{id,key})).toBe(2)
})
test('mismatched edition warns and cannot mark a different revision read',async({page})=>{
 const newer=structuredClone(index);newer.items.find((x:any)=>x.id===id).version=3
 await page.route('**/radar/index.json',route=>route.fulfill({json:newer}));await page.goto('/radar/'+id)
 await expect(page.locator('.radar-notice')).toContainText('edition changed');await page.locator('.radar-read-sentinel').scrollIntoViewIfNeeded();await page.waitForTimeout(1700)
 await expect(page.locator('.radar-read-sentinel button')).toBeDisabled()
 expect(await page.evaluate(key=>JSON.parse(localStorage.getItem(key)||'{"read":{}}').read,key)).toEqual({})
})
test('locale changes keep the Home menu open, including the new Radar destination',async({page})=>{
 await page.goto('/');await page.locator('.menu-button').click();await expect(page.locator('.mobile-nav')).toHaveAttribute('data-phase','open')
 await page.locator('.mobile-nav .locale-switch button').filter({hasText:'RU'}).click();await expect(page).toHaveURL(/\/ru$/)
 await expect(page.locator('.mobile-nav')).toHaveAttribute('data-phase','open');await expect(page.locator('.mobile-nav nav a')).toHaveCount(7)
 await page.locator('.mobile-nav nav a[href="/ru/radar"]').click();await expect(page.locator('.mobile-nav')).toHaveCount(0);await expect.poll(()=>page.locator('.radar-row').count()).toBeGreaterThanOrEqual(3)
})
test('unknown observation has a clear not-found state even with SPA fallback HTML',async({page})=>{
 await page.route('**/radar/observations/unknown-case.json',r=>r.fulfill({contentType:'text/html',body:'<!doctype html><div id="root"></div>'}));await page.goto('/radar/unknown-case')
 await expect(page.locator('h1')).toHaveText('Observation not found');await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content',/noindex/)
})
test('privacy explains browser-only saves and deletion',async({page})=>{
 await page.goto('/privacy');await expect(page.locator('main')).toContainText('Saved Radar observations');await expect(page.locator('main')).toContainText('not sent to a CopyPump server')
 await page.goto('/ru/privacy');await expect(page.locator('main')).toContainText('Сохранённые наблюдения Radar')
})
