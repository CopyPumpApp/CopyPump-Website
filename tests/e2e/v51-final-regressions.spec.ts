import {test,expect,type Page} from '@playwright/test'

async function tap(page:Page,selector:string,touch:boolean){
  const node=page.locator(selector),r=await node.boundingBox()
  expect(r).not.toBeNull()
  const p={x:r!.x+r!.width/2,y:r!.y+r!.height/2}
  expect(await node.evaluate((n,p)=>n.contains(document.elementFromPoint(p.x,p.y)),p)).toBeTruthy()
  if(touch)await page.touchscreen.tap(p.x,p.y);else await page.mouse.click(p.x,p.y)
}

test('transparent header softens overlapping copy without adding a black bar',async({page},info)=>{
  await page.goto('/ru');await page.waitForTimeout(1800)
  const header=page.locator('.site-header')
  await expect(header).toHaveCSS('background-color','rgba(0, 0, 0, 0)')
  // Precisely recreate the reported composition: page text behind the logo.
  await page.locator('.hero-bottom p').evaluate(n=>window.scrollTo({top:n.getBoundingClientRect().top+scrollY-28,behavior:'auto'}))
  await expect(header).toHaveAttribute('data-scrolled','true');await page.waitForTimeout(650)
  const canopy=await header.evaluate(n=>{
    const s=getComputedStyle(n,'::before'),r=n.getBoundingClientRect()
    return{blur:s.backdropFilter||s.getPropertyValue('-webkit-backdrop-filter'),mask:s.maskImage||s.getPropertyValue('-webkit-mask-image'),extension:parseFloat(s.bottom),height:r.height,background:getComputedStyle(n).backgroundColor}
  })
  expect(canopy.blur).toBe('blur(12px)');expect(canopy.mask).toContain('linear-gradient')
  expect(canopy.extension).toBeGreaterThanOrEqual(-32);expect(canopy.height).toBeLessThan(130)
  expect(canopy.background).toBe('rgba(0, 0, 0, 0)')
  for(const selector of ['.scene-backdrop','.page-outlet','.scene-art'])await expect(page.locator(selector)).toHaveCSS('filter','none')
  await page.screenshot({path:`test-results/visual-qa/${info.project.name}/v51-header-scrolled-fixed.png`})
  await page.evaluate(()=>scrollTo({top:0,behavior:'auto'}));await page.waitForTimeout(550)
  await expect(header).toHaveAttribute('data-scrolled','false')
  expect(await header.evaluate(n=>getComputedStyle(n,'::before').opacity)).toBe('0')
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
