import {test,expect,type Page} from '@playwright/test'
async function press(page:Page,selector:string,touch:boolean){const n=page.locator(selector);await expect(n).toBeVisible();const r=await n.boundingBox();expect(r).not.toBeNull();const x=r!.x+r!.width/2,y=r!.y+r!.height/2;expect(await n.evaluate((n,p)=>n.contains(document.elementFromPoint(p.x,p.y)),{x,y})).toBeTruthy();if(touch)await page.touchscreen.tap(x,y);else await page.mouse.click(x,y)}
async function unlocked(page:Page){await expect(page.locator('#mobile-navigation')).toHaveCount(0);await expect(page.locator('html')).not.toHaveClass(/nav-open/);expect(await page.locator('#root').evaluate(n=>(n as HTMLElement).inert)).toBeFalsy()}
test('16 deep-scroll menu interactions are stable',async({page,isMobile})=>{
 test.setTimeout(60_000);await page.goto('/');await page.locator('#community').scrollIntoViewIfNeeded();await page.waitForTimeout(1000)
 for(let i=0;i<16;i++){
  const y=await page.evaluate(()=>scrollY);await press(page,'.menu-button',isMobile)
  await expect(page.locator('.mobile-nav__panel')).toBeVisible();await expect(page.locator('.mobile-nav nav a')).toHaveCount(7)
  expect(await page.locator('.mobile-nav').evaluate(n=>getComputedStyle(n).opacity)).toBe('1')
  await press(page,'.icon-button',isMobile);await unlocked(page);expect(Math.abs(await page.evaluate(()=>scrollY)-y)).toBeLessThanOrEqual(2)
 }
})
test('menu supports focus, all destinations and same-page Home',async({page,isMobile})=>{
 await page.goto('/');await press(page,'.menu-button',isMobile);await expect(page.locator('.icon-button')).toBeFocused()
 for(let i=0;i<22;i++){await page.keyboard.press('Tab');expect(await page.locator('.mobile-nav').evaluate(n=>n.contains(document.activeElement))).toBeTruthy()}
 await page.keyboard.press('Escape');await unlocked(page);await expect(page.locator('.menu-button')).toBeFocused()
 for(const path of ['/project','/progress','/security','/contact','/']){
  await press(page,'.menu-button',isMobile);await page.locator(`.mobile-nav nav a[href="${path}"]`).click();await unlocked(page);await expect(page).toHaveURL(new RegExp(`${path.replace('/','\\/')}$`))
 }
 await page.locator('#community').scrollIntoViewIfNeeded();await press(page,'.menu-button',isMobile);await page.locator('.mobile-nav .brand').click();await unlocked(page);await expect.poll(()=>page.evaluate(()=>scrollY)).toBeLessThanOrEqual(2)
})
test('RU short viewport, menu resize and explicit Motion off never hide content',async({page,isMobile})=>{
 await page.setViewportSize({width:320,height:568});await page.goto('/ru');await press(page,'.menu-button',isMobile)
 await page.locator('.mobile-nav__footer .motion-toggle').click();await page.locator('.icon-button').click();await unlocked(page)
 await expect.poll(()=>page.locator('[data-reveal]').evaluateAll(ns=>ns.every(n=>getComputedStyle(n).opacity==='1'))).toBeTruthy()
 await press(page,'.menu-button',isMobile);await page.setViewportSize({width:1200,height:720});await expect(page.locator('.mobile-nav')).toBeVisible();await page.keyboard.press('Escape');await unlocked(page)
})
test('reduced motion stops ambience while keeping the demonstration functional',async({page})=>{
 await page.emulateMedia({reducedMotion:'reduce'});await page.goto('/');await page.locator('#experience').scrollIntoViewIfNeeded();await page.locator('#chapter-2').click()
 // Chapter changes await image decoding and replace the keyed picture element.
 // Assert the selected, settled chapter before querying its computed styles.
 await expect(page.locator('#chapter-2')).toHaveAttribute('aria-selected','true')
 await expect(page.locator('#experience-panel')).toHaveAttribute('aria-busy','false')
 await expect(page.locator('.experience-art img')).toHaveAttribute('src',/constrain-800\.webp$/)
 await expect(page.locator('.chapter-current')).toHaveCSS('animation-name','none')
 await page.locator('#capital-limit').press('End');await expect(page.locator('.policy-result')).toContainText('Within this limit')
})
test('animation lifecycle stays bounded after scrolling and menu use',async({page,isMobile},info)=>{
 await page.goto('/');await page.locator('#experience').scrollIntoViewIfNeeded();await page.waitForTimeout(2000)
 const active=await page.evaluate(()=>document.getAnimations().filter(a=>a.playState==='running').length);expect(active).toBeLessThanOrEqual(10)
 await page.locator('#community').scrollIntoViewIfNeeded();await page.waitForTimeout(2000)
 const idle=await page.evaluate(()=>({running:document.getAnimations().filter(a=>a.playState==='running').length,willChange:[...document.querySelectorAll('*')].filter(n=>getComputedStyle(n).willChange!=='auto').length}))
 expect(idle.running).toBeLessThanOrEqual(8);expect(idle.willChange).toBe(0)
 await info.attach('animation-budget',{body:JSON.stringify({active,idle}),contentType:'application/json'})
})
