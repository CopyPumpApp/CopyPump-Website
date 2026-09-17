import {test,expect,type Page} from '@playwright/test'
import {writeFileSync,mkdirSync} from 'node:fs'

async function stage(page:Page){
  await page.goto('/ru')
  await page.locator('.experience-art').scrollIntoViewIfNeeded()
  await page.waitForTimeout(1700)
}
async function drag(page:Page,dx:number,dy=0){
  const area=page.locator('.experience-art'),r=await area.boundingBox();expect(r).not.toBeNull()
  const x=r!.x+r!.width*.5,y=r!.y+r!.height*.4
  expect(await area.evaluate((n,p)=>n.contains(document.elementFromPoint(p.x,p.y)),{x,y})).toBeTruthy()
  await page.mouse.move(x,y);await page.mouse.down();await page.mouse.move(x+dx,y+dy,{steps:12});await page.mouse.up()
}
for(const locale of ['en','ru'])test(`automatic discovery and single contact channels: ${locale}`,async({page})=>{
  const prefix=locale==='ru'?'/ru':''
  await page.goto(prefix||'/')
  await expect(page.locator('.hero-intro')).toContainText(locale==='ru'?'сам обнаруживает успешные кошельки':'discovers successful wallets automatically')
  await expect(page.locator('.experience-story')).toContainText(locale==='ru'?'Вручную выбирать, кого копировать, не нужно':'do not choose whom to copy manually')
  await expect(page.locator('main')).not.toContainText(/wallets you choose|выбранных вами кошельков|Соберите выбранные/)
  await page.goto(prefix+'/contact')
  for(const href of ['https://x.com/CopyPumpAI','https://discord.gg/WS95eXrGB','https://github.com/CopyPumpApp/CopyPump','mailto:copypumphq@gmail.com']){
    await expect(page.locator(`a[href="${href}"]`)).toHaveCount(1)
    await expect(page.locator(`a[href="${href}"] svg`)).toHaveCount(1)
  }
  await expect(page.locator('main')).not.toContainText('DNBQtqw6R')
})
test('native pointer drag switches artwork in both directions and arrows remain usable',async({page})=>{
  await stage(page)
  await drag(page,-95);await expect(page.locator('#chapter-1')).toHaveAttribute('aria-selected','true')
  await drag(page,95);await expect(page.locator('#chapter-0')).toHaveAttribute('aria-selected','true')
  await expect(page.locator('.artwork-previous')).toBeDisabled()
  await page.locator('.artwork-next').click();await expect(page.locator('#chapter-1')).toHaveAttribute('aria-selected','true')
  await expect(page.locator('.chapter-ghost')).toHaveCount(0)
  await expect(page.locator('.chapter-art-stack picture')).toHaveCount(1)
})
test('vertical intent, short drags and cancelled pointers cannot change the chapter',async({page})=>{
  await stage(page);await drag(page,12,85);await drag(page,22,2)
  await expect(page.locator('#chapter-0')).toHaveAttribute('aria-selected','true')
  const area=page.locator('.experience-art')
  await area.dispatchEvent('pointerdown',{pointerId:700,pointerType:'touch',isPrimary:true,button:0,clientX:200,clientY:200})
  await area.dispatchEvent('pointermove',{pointerId:700,pointerType:'touch',clientX:110,clientY:202})
  await area.dispatchEvent('pointercancel',{pointerId:700,pointerType:'touch'})
  await area.dispatchEvent('pointerup',{pointerId:700,pointerType:'touch',clientX:100,clientY:202})
  await expect(page.locator('#chapter-0')).toHaveAttribute('aria-selected','true')
})
test('second touch cancels a pending horizontal gesture',async({page})=>{
  await stage(page);const a=page.locator('.experience-art')
  await a.dispatchEvent('pointerdown',{pointerId:31,pointerType:'touch',isPrimary:true,button:0,clientX:200,clientY:200})
  await a.dispatchEvent('pointermove',{pointerId:31,pointerType:'touch',clientX:100,clientY:202})
  await a.dispatchEvent('pointerdown',{pointerId:32,pointerType:'touch',isPrimary:false,button:0,clientX:230,clientY:200})
  await a.dispatchEvent('pointerup',{pointerId:31,pointerType:'touch',clientX:80,clientY:202})
  await a.dispatchEvent('pointerup',{pointerId:32,pointerType:'touch',clientX:260,clientY:202})
  await expect(page.locator('#chapter-0')).toHaveAttribute('aria-selected','true')
})
test('capital slider is outside the gesture zone and does not switch objects',async({page})=>{
  await stage(page);await page.locator('#chapter-2').click();await expect(page.locator('#capital-limit')).toBeVisible()
  expect(await page.locator('#capital-limit').evaluate(n=>!!n.closest('.experience-art'))).toBeFalsy()
  await page.locator('#capital-limit').press('End')
  await expect(page.locator('#chapter-2')).toHaveAttribute('aria-selected','true')
  await expect(page.locator('.policy-result')).toContainText('В пределах лимита')
  await page.emulateMedia({reducedMotion:'reduce'});await page.locator('.experience-art').focus();await page.keyboard.press('ArrowRight')
  await expect(page.locator('#chapter-3')).toHaveAttribute('aria-selected','true')
  await expect(page.locator('.chapter-ghost')).toHaveCount(0)
})
test('Android native touch swipe works; vertical touch still scrolls the page',async({page,context,isMobile,browserName})=>{
  test.skip(!isMobile||browserName!=='chromium','Native touch input here uses Chromium CDP; other profiles have pointer/cancel coverage.')
  await stage(page);const session=await context.newCDPSession(page)
  const touch=async(dx:number,dy:number)=>{
    const r=(await page.locator('.experience-art').boundingBox())!,x=r.x+r.width*.55,y=r.y+r.height*.40
    await session.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x,y,id:1}]})
    for(let i=1;i<=10;i++){await session.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[{x:x+dx*i/10,y:y+dy*i/10,id:1}]});await page.waitForTimeout(15)}
    await session.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]})
  }
  await touch(-115,4);await expect(page.locator('#chapter-1')).toHaveAttribute('aria-selected','true')
  const before=await page.evaluate(()=>scrollY);await touch(5,-110)
  await expect.poll(()=>page.evaluate(()=>scrollY)).toBeGreaterThan(before+25)
  await expect(page.locator('#chapter-1')).toHaveAttribute('aria-selected','true')
  await session.detach()
})
test('compact layout evidence, no horizontal overflow and updated contacts',async({page,isMobile},info)=>{
  const dir=`test-results/visual-qa/${info.project.name}`;mkdirSync(dir,{recursive:true})
  await page.goto('/ru');await page.waitForTimeout(1700);await page.screenshot({path:`${dir}/v511-home.png`})
  const stats=await page.locator('main>.section-space').evaluateAll(nodes=>nodes.map(n=>({id:n.id,top:getComputedStyle(n).paddingTop,bottom:getComputedStyle(n).paddingBottom})))
  for(const s of stats){expect(parseFloat(s.top)).toBeLessThanOrEqual(isMobile?40:80);expect(parseFloat(s.bottom)).toBeLessThanOrEqual(isMobile?40:80)}
  expect(await page.evaluate(()=>document.documentElement.scrollWidth-document.documentElement.clientWidth)).toBeLessThanOrEqual(1)
  await page.locator('.experience-art').scrollIntoViewIfNeeded();await page.waitForTimeout(1600);await page.screenshot({path:`${dir}/v511-swipe-controls.png`})
  await page.goto('/ru/contact');await page.waitForTimeout(1700);await page.screenshot({path:`${dir}/v511-contact.png`,fullPage:true})
  writeFileSync(`${dir}/v511-spacing.json`,JSON.stringify(stats,null,2))
})
