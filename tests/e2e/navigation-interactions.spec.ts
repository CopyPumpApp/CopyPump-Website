import { test, expect, type Locator, type Page } from '@playwright/test'

// Use browser pointer input, not HTMLElement.click() or force:true.
// Coordinates avoid Playwright scrolling a sticky header before the input.
async function pressVisible(page:Page, locator:Locator, touch:boolean){
  await expect(locator).toBeVisible()
  const box=await locator.boundingBox()
  expect(box).not.toBeNull()
  const x=box!.x+box!.width/2,y=box!.y+box!.height/2
  const hit=await locator.evaluate((node,point)=>{
    const target=document.elementFromPoint(point.x,point.y)
    return !!target&&(target===node||node.contains(target))
  },{x,y})
  expect(hit,'the control must actually receive the pointer, without forced clicks').toBeTruthy()
  if(touch)await page.touchscreen.tap(x,y)
  else await page.mouse.click(x,y)
}

async function assertOpen(page:Page){
  await expect(page.locator('#mobile-navigation')).toHaveCount(1)
  await expect.poll(()=>page.locator('.mobile-nav__panel').evaluate(node=>{
    let opacity=1
    for(let parent:Element|null=node;parent;parent=parent.parentElement)opacity*=Number(getComputedStyle(parent).opacity)
    return opacity
  })).toBeGreaterThan(.99)
  await expect(page.locator('.mobile-nav nav button')).toHaveCount(8)
}

async function assertUnlocked(page:Page){
  await expect(page.locator('#mobile-navigation')).toHaveCount(0)
  await expect(page.locator('html')).not.toHaveClass(/nav-open/)
  await expect.poll(()=>page.evaluate(()=>{
    const shell=document.querySelector<HTMLElement>('.app-shell')
    return !shell?.inert&&document.documentElement.style.overflow!=='hidden'&&document.body.style.overflow!=='hidden'
  })).toBeTruthy()
}

test('real touch: menu survives 16 deep-scroll open/close cycles',async({page,isMobile},testInfo)=>{
  test.skip(!isMobile)
  test.setTimeout(90_000)
  const errors:string[]=[]
  page.on('pageerror',error=>errors.push(error.message))
  await page.goto('/')
  await page.locator('#community').scrollIntoViewIfNeeded()
  await page.waitForTimeout(1800)
  for(let cycle=0;cycle<16;cycle++){
    const before=await page.evaluate(()=>window.scrollY)
    expect(before).toBeGreaterThan(100)
    await pressVisible(page,page.locator('.menu-button'),true)
    await assertOpen(page)
    expect(Math.abs(await page.evaluate(()=>window.scrollY)-before)).toBeLessThanOrEqual(2)
    if(cycle%4===0)await pressVisible(page,page.locator('.mobile-nav__footer .motion-toggle'),true)
    if(cycle===15)await page.screenshot({path:`test-results/visual-qa/${testInfo.project.name}/feedback-menu-after-16-cycles.png`})
    await pressVisible(page,page.locator('.mobile-nav__top .icon-button'),true)
    await assertUnlocked(page)
    expect(Math.abs(await page.evaluate(()=>window.scrollY)-before)).toBeLessThanOrEqual(2)
  }
  expect(errors).toEqual([])
})

test('real touch: every extended destination is reachable from the menu',async({page,isMobile})=>{
  test.skip(!isMobile)
  test.setTimeout(90_000)
  await page.goto('/')
  const destinations=[['How it works','product-story'],['Controls & safety','learn-more'],['Decision demo','decision-demo'],['Signal journey','journey'],['Progress','journal'],['Roadmap','roadmap'],['FAQ','questions']]
  for(const[label,id]of destinations){
    await pressVisible(page,page.locator('.menu-button'),true)
    await assertOpen(page)
    const item=page.locator('.mobile-nav nav button').filter({hasText:label})
    await item.scrollIntoViewIfNeeded()
    await pressVisible(page,item,true)
    await assertUnlocked(page)
    await expect(page).toHaveURL(/\/project$/)
    await expect.poll(()=>page.locator(`#${id}`).evaluate(node=>{
      const rect=node.getBoundingClientRect()
      return rect.top<innerHeight-50&&rect.bottom>100
    })).toBeTruthy()
    // Do not let the next tap intentionally interrupt this destination's scroll.
    await page.waitForTimeout(900)
  }
})

test('menu Home and logo close the sheet even on the same page',async({page,isMobile})=>{
  test.skip(!isMobile)
  await page.goto('/')
  for(const selector of ['.mobile-nav nav button:first-child','.mobile-nav__top .brand']){
    await page.locator('#community').scrollIntoViewIfNeeded()
    await pressVisible(page,page.locator('.menu-button'),true)
    await assertOpen(page)
    await pressVisible(page,page.locator(selector),true)
    await assertUnlocked(page)
    await expect.poll(()=>page.evaluate(()=>window.scrollY)).toBeLessThanOrEqual(2)
  }
})

test('modal focus stays in the sheet and returns after Escape',async({page,isMobile})=>{
  await page.setViewportSize({width:820,height:950})
  await page.goto('/')
  await pressVisible(page,page.locator('.menu-button'),isMobile)
  await assertOpen(page)
  await expect(page.locator('.mobile-nav__top .icon-button')).toBeFocused()
  for(let step=0;step<22;step++){
    await page.keyboard.press(step<16?'Tab':'Shift+Tab')
    expect(await page.evaluate(()=>!!document.getElementById('mobile-navigation')?.contains(document.activeElement))).toBeTruthy()
  }
  await page.keyboard.press('Escape')
  await assertUnlocked(page)
  await expect(page.locator('.menu-button')).toBeFocused()
})

test('tablet trigger has no container and resizing cannot leave a hidden modal lock',async({page,isMobile})=>{
  for(const width of [375,820,1000]){
    await page.setViewportSize({width,height:900})
    await page.goto('/')
    const trigger=page.locator('.menu-button')
    const styles=await trigger.evaluate(node=>{
      const s=getComputedStyle(node)
      return {border:[s.borderTopWidth,s.borderRightWidth,s.borderBottomWidth,s.borderLeftWidth],background:s.backgroundColor,shadow:s.boxShadow,width:node.getBoundingClientRect().width,height:node.getBoundingClientRect().height}
    })
    expect(styles.border).toEqual(['0px','0px','0px','0px'])
    expect(styles.background).toBe('rgba(0, 0, 0, 0)')
    expect(styles.shadow).toBe('none')
    expect(styles.width).toBeGreaterThanOrEqual(44)
    expect(styles.height).toBeGreaterThanOrEqual(44)
    await pressVisible(page,trigger,isMobile)
    await assertOpen(page)
    await page.setViewportSize({width:1280,height:900})
    await assertUnlocked(page)
  }
})

test('Russian menu works on a short 320px viewport with reduced motion',async({page,isMobile},testInfo)=>{
  await page.setViewportSize({width:320,height:568})
  await page.emulateMedia({reducedMotion:'reduce'})
  await page.goto('/ru')
  await pressVisible(page,page.locator('.menu-button'),isMobile)
  await assertOpen(page)
  const faq=page.locator('.mobile-nav nav button').filter({hasText:'Вопросы'})
  await faq.scrollIntoViewIfNeeded()
  await page.screenshot({path:`test-results/visual-qa/${testInfo.project.name}/feedback-menu-ru-320.png`})
  await pressVisible(page,faq,isMobile)
  await assertUnlocked(page)
  await expect(page).toHaveURL(/\/ru\/project$/)
  await expect.poll(()=>page.locator('#questions').evaluate(node=>node.getBoundingClientRect().top<innerHeight)).toBeTruthy()
})

test('actual decorative borders and pseudo dividers stay removed',async({page})=>{
  await page.goto('/project')
  for(const selector of ['.product-story','.story-flow article','.story-list>div','.workflow-node','.example-amount','.decision-trace>div','.rail-item-outcome','.site-footer']){
    const borders=await page.locator(selector).evaluateAll(nodes=>nodes.map(node=>{
      const s=getComputedStyle(node)
      return [s.borderTopWidth,s.borderRightWidth,s.borderBottomWidth,s.borderLeftWidth]
    }))
    expect(borders.length,selector).toBeGreaterThan(0)
    for(const border of borders)expect(border,selector).toEqual(['0px','0px','0px','0px'])
  }
  for(const selector of ['.product-story','.project-details','.project-faq','.decision-outcome']){
    const display=await page.locator(selector).first().evaluate(node=>getComputedStyle(node,'::before').display)
    expect(display,`${selector}::before`).toBe('none')
  }
})
