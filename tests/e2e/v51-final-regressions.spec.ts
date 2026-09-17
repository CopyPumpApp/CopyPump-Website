import {test,expect,type Page} from '@playwright/test'

async function tap(page:Page,selector:string,touch:boolean){
  const node=page.locator(selector),r=await node.boundingBox()
  expect(r).not.toBeNull()
  const p={x:r!.x+r!.width/2,y:r!.y+r!.height/2}
  expect(await node.evaluate((n,p)=>n.contains(document.elementFromPoint(p.x,p.y)),p)).toBeTruthy()
  if(touch)await page.touchscreen.tap(p.x,p.y);else await page.mouse.click(p.x,p.y)
}

test('transparent header preserves the scene and completely occludes overlapping body text',async({page},info)=>{
  await page.emulateMedia({reducedMotion:'reduce'})
  await page.goto('/ru');await page.waitForTimeout(700)
  const header=page.locator('.site-header'),canopy=page.locator('.header-scene-canopy')
  await expect(header).toHaveCSS('background-color','rgba(0, 0, 0, 0)')
  await expect(canopy).toHaveCSS('opacity','0')
  const copy=page.locator('.hero-bottom p')
  await copy.evaluate(n=>window.scrollTo({top:n.getBoundingClientRect().top+scrollY-28,behavior:'auto'}))
  await expect(header).toHaveAttribute('data-scrolled','true');await expect(canopy).toHaveCSS('opacity','1')
  await expect.poll(()=>page.locator('.header-scene-canopy__art').evaluate(n=>(n as HTMLImageElement).complete&&(n as HTMLImageElement).naturalWidth>0)).toBeTruthy()
  await page.waitForTimeout(300)
  const box=await header.boundingBox();expect(box).not.toBeNull()
  const clip={x:Math.ceil(box!.x),y:Math.ceil(box!.y),width:Math.floor(box!.width),height:Math.floor(box!.height)-1}
  const withCopy=await page.screenshot({clip})
  await copy.evaluate(n=>(n as HTMLElement).style.visibility='hidden')
  const withoutCopy=await page.screenshot({clip})
  // A visual assertion: the rendered navigation must not change when the body
  // text directly underneath is removed. A computed blur declaration cannot pass this.
  expect(withCopy.equals(withoutCopy),'scrolling copy must not paint through the navigation').toBeTruthy()
  await copy.evaluate(n=>(n as HTMLElement).style.visibility='')
  await page.screenshot({path:`test-results/visual-qa/${info.project.name}/v51-header-scrolled-fixed.png`})
  const source=await page.locator('.scene-art img').getAttribute('src')
  await expect(page.locator('.header-scene-canopy__art')).toHaveAttribute('src',source!)
  expect(await canopy.evaluate(n=>n.getBoundingClientRect().height)).toBeLessThan(165)
  for(const selector of ['.scene-backdrop','.page-outlet','.scene-art','.header-scene-canopy'])await expect(page.locator(selector)).toHaveCSS('filter','none')
  await page.evaluate(()=>scrollTo({top:0,behavior:'auto'}));await expect(header).toHaveAttribute('data-scrolled','false')
  await expect(canopy).toHaveCSS('opacity','0')
})

test('destination waits for menu exit, then reveals without overlapping navigation text',async({page,isMobile},info)=>{
  await page.goto('/ru');await tap(page,'.menu-button',isMobile)
  await expect(page.locator('.mobile-nav')).toHaveAttribute('data-phase','open')
  await page.locator('.mobile-nav nav a[href="/ru/project"]').click()
  await expect(page.locator('.mobile-nav')).toHaveAttribute('data-phase','closing')
  await page.waitForTimeout(100)
  expect(await page.locator('.page-outlet').evaluate(n=>Number(getComputedStyle(n).opacity))).toBeLessThan(.01)
  await page.screenshot({path:`test-results/visual-qa/${info.project.name}/v51-menu-exit-overlap-check.png`})
  await expect(page.locator('.mobile-nav')).toHaveCount(0)
  await expect(page).toHaveURL(/\/ru\/project$/)
  await page.waitForTimeout(1900)
  expect(await page.locator('h1 .heading-motion').evaluateAll(ns=>ns.every(n=>getComputedStyle(n).opacity==='1'))).toBeTruthy()
  await expect(page.locator('.page-outlet')).toHaveCSS('opacity','1')
  await page.screenshot({path:`test-results/visual-qa/${info.project.name}/v51-destination-revealed.png`})
})

test('failed scene download preserves the decoded scene and working navigation',async({page,isMobile})=>{
  await page.route('**/media/v51/scene-product.webp',r=>r.abort('failed'))
  await page.goto('/');await expect(page.locator('.scene-backdrop')).toHaveAttribute('data-ready','true')
  await tap(page,'.menu-button',isMobile);await expect(page.locator('.mobile-nav')).toHaveAttribute('data-phase','open')
  await page.locator('.mobile-nav nav a[href="/project"]').click()
  await expect(page).toHaveURL(/\/project$/);await expect(page.locator('.mobile-nav')).toHaveCount(0)
  await expect(page.locator('.scene-backdrop')).toHaveAttribute('data-theme','home')
  expect(await page.locator('.scene-art img').evaluate(n=>(n as HTMLImageElement).naturalWidth)).toBeGreaterThan(0)
  await page.locator('#product-tab-2').click();await page.locator('.faq-item summary').first().click()
  await expect(page.locator('.faq-item').first()).toHaveAttribute('open','')
})

test('late reveal nodes remain visible with reduced motion and later route changes',async({page,isMobile})=>{
  await page.emulateMedia({reducedMotion:'reduce'})
  await page.goto('/ru/radar');await expect(page.locator('.radar-row')).toHaveCount(3)
  await page.locator('.radar-row h2 a').first().click();await expect(page.locator('.radar-narrative')).toBeVisible()
  expect(await page.locator('h1 .heading-motion').evaluateAll(ns=>ns.every(n=>getComputedStyle(n).opacity==='1'))).toBeTruthy()
  await tap(page,'.menu-button',isMobile);await expect(page.locator('.mobile-nav')).toHaveAttribute('data-phase','open')
  await page.locator('.mobile-nav nav a[href="/ru/progress"]').click();await expect(page.locator('.mobile-nav')).toHaveCount(0)
  await expect(page.locator('.page-outlet')).toHaveCSS('opacity','1')
  expect(await page.locator('.page-outlet').evaluate(n=>n.getAnimations().filter(a=>a.playState==='running').length)).toBe(0)
})
