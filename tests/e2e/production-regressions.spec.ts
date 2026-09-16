import { test, expect } from '@playwright/test'

const removedLegacyTerms = /Mizuzi|RUN_FUP_TRUMP|gameplay|runner duel|CopyCube/i

for (const path of ['/', '/project']) {
  test(`${path} has no removed game legacy`, async ({ page }) => {
    await page.goto(path)
    await expect(page.locator('body')).not.toContainText(removedLegacyTerms)
  })
  test(`${path} has no horizontal overflow`, async ({ page }) => {
    await page.goto(path)
    await expect(page.locator('main')).toBeVisible()
    await expect.poll(async () => page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth + 1)).toBeTruthy()
  })
}

test('Home stays focused and excludes extended project sections', async ({ page }) => {
  await page.goto('/')
  for (const selector of ['#product', '#why-copypump', '#community']) await expect(page.locator(selector), selector).toHaveCount(1)
  for (const selector of ['#product-story', '#decision-demo', '#journey', '#journal', '#roadmap', '#questions']) await expect(page.locator(selector), selector).toHaveCount(0)
})

test('Project page hosts all extended information destinations', async ({ page }) => {
  await page.goto('/project')
  for (const selector of ['#product-story', '#learn-more', '#decision-demo', '#journey', '#journal', '#roadmap', '#questions']) await expect(page.locator(selector), selector).toHaveCount(1)
})

test('responsive cinematic CopyPump background is active on Home and Project', async ({ page, isMobile }) => {
  await page.goto('/')
  const homeBackground = await page.locator('.site-scroll-background').evaluate(node => getComputedStyle(node, '::before').backgroundImage)
  expect(homeBackground).toContain(isMobile ? 'copypump-cinematic-environment-v46-mobile.webp' : 'copypump-cinematic-environment-v46.webp')
  await page.goto('/project')
  const projectBackground = await page.locator('.project-page').evaluate(node => getComputedStyle(node, '::before').backgroundImage)
  expect(projectBackground).toContain(isMobile ? 'copypump-cinematic-environment-v46-mobile.webp' : 'copypump-cinematic-environment-v46.webp')
})

test('workflow surfaces use the canonical uploaded v47 cutouts', async ({ page }) => {
  await page.goto('/')
  const homeSources = await page.locator('img[src*="/workflow-objects/"]').evaluateAll(nodes => nodes.map(node => (node as HTMLImageElement).getAttribute('src') || ''))
  expect(homeSources.length).toBeGreaterThanOrEqual(4)
  expect(homeSources.every(src => /(?:detect|qualify|constrain|execute-prove)-cutout-final-v47\.webp/.test(src))).toBeTruthy()
  await page.goto('/project')
  const projectSources = await page.locator('img[src*="/workflow-objects/"]').evaluateAll(nodes => nodes.map(node => (node as HTMLImageElement).getAttribute('src') || ''))
  expect(projectSources.length).toBeGreaterThanOrEqual(4)
  expect(projectSources.every(src => /(?:detect|qualify|constrain|execute-prove)-cutout-final-v47\.webp/.test(src))).toBeTruthy()
})

test('Progress navigation reaches the project journal', async ({ page, isMobile }) => {
  await page.goto('/')
  if (isMobile) {
    await page.locator('.menu-button').click()
    await page.locator('.mobile-nav nav button').filter({ hasText: /Progress|Прогресс/ }).click()
    await expect(page.locator('#mobile-navigation')).toHaveCount(0)
  } else {
    await page.locator('.desktop-nav button').filter({ hasText: /Progress|Прогресс/ }).click()
  }
  await expect(page).toHaveURL(/\/project/)
  await expect(page.locator('#journal')).toBeVisible()
  await expect.poll(async () => page.locator('#journal').evaluate(node => Math.abs(node.getBoundingClientRect().top) < window.innerHeight)).toBeTruthy()
})

test('Motion off never leaves reveal content hidden', async ({ page, isMobile }) => {
  await page.goto('/')
  let toggle = page.locator('.site-header .motion-toggle')
  if (isMobile) { await page.locator('.menu-button').click(); toggle = page.locator('.mobile-nav__footer .motion-toggle') }
  await expect(toggle).toBeVisible(); const pressed = await toggle.getAttribute('aria-pressed'); if (pressed === 'true') await toggle.click(); if (isMobile) await page.keyboard.press('Escape')
  await expect.poll(async () => page.evaluate(() => [...document.querySelectorAll<HTMLElement>('[data-reveal]')].every(node => getComputedStyle(node).opacity !== '0'))).toBeTruthy()
})

async function waitForMenuSettled(page:any){
  await page.waitForTimeout(420)
}

test('mobile menu trigger is visually containerless and overlay opens', async ({ page, isMobile }) => {
  test.skip(!isMobile)
  await page.goto('/')
  const trigger = page.locator('.menu-button')
  await expect(trigger).toBeVisible()
  const triggerStyle = await trigger.evaluate(node => { const s=getComputedStyle(node); return {background:s.backgroundColor,borderTop:s.borderTopWidth,borderRight:s.borderRightWidth,borderBottom:s.borderBottomWidth,borderLeft:s.borderLeftWidth,boxShadow:s.boxShadow} })
  expect(triggerStyle.background).toBe('rgba(0, 0, 0, 0)')
  expect([triggerStyle.borderTop,triggerStyle.borderRight,triggerStyle.borderBottom,triggerStyle.borderLeft].every(v=>v==='0px')).toBeTruthy()
  expect(triggerStyle.boxShadow).toBe('none')
  await trigger.click()
  await expect(page.locator('#mobile-navigation')).toBeVisible()
  await expect(page.locator('.mobile-nav__panel')).toBeVisible()
  await expect(page.locator('.mobile-nav nav button')).toHaveCount(8)
})

test('mobile menu exposes the extended information architecture', async ({ page, isMobile }) => {
  test.skip(!isMobile)
  await page.goto('/')
  await page.locator('.menu-button').click()
  const labels = await page.locator('.mobile-nav nav button strong').allTextContents()
  for (const expected of ['How it works','Controls & safety','Decision demo','Progress','Roadmap','FAQ']) expect(labels.join(' ')).toContain(expected)
})

test('decorative horizontal stripe dividers are removed from extended content', async ({ page }) => {
  await page.goto('/project')
  const selectors=['.story-flow','.story-flow article:nth-child(2)','.story-list','.story-list>div:first-child','.story-note','.decision-section','.decision-desk','.workflow-caption','.journal-section']
  for(const selector of selectors){
    const locator=page.locator(selector).first(); await expect(locator,selector).toBeVisible()
    const borders=await locator.evaluate(node=>{const s=getComputedStyle(node);return[s.borderTopWidth,s.borderRightWidth,s.borderBottomWidth,s.borderLeftWidth]})
    expect(borders,selector).toEqual(['0px','0px','0px','0px'])
  }
})

test('mobile navigation stays inside the visual viewport', async ({ page, isMobile }) => {
  test.skip(!isMobile); await page.goto('/'); await page.locator('.menu-button').click(); const panel=page.locator('.mobile-nav__panel'),top=page.locator('.mobile-nav__top'),firstItem=page.locator('.mobile-nav nav button').first(),footer=page.locator('.mobile-nav__footer'); await expect(panel).toBeVisible(); await expect(top).toBeVisible(); await expect(firstItem).toBeVisible(); await expect(footer).toBeVisible(); await waitForMenuSettled(page)
  const geometry=await panel.evaluate(node=>{const r=node.getBoundingClientRect();return{left:r.left,top:r.top,right:r.right,bottom:r.bottom,innerWidth:window.innerWidth,innerHeight:window.innerHeight}})
  expect(geometry.left,JSON.stringify(geometry)).toBeGreaterThanOrEqual(-1); expect(geometry.top,JSON.stringify(geometry)).toBeGreaterThanOrEqual(-1); expect(geometry.right,JSON.stringify(geometry)).toBeLessThanOrEqual(geometry.innerWidth+1); expect(geometry.bottom,JSON.stringify(geometry)).toBeLessThanOrEqual(geometry.innerHeight+1)
  for(const locator of [top,firstItem,footer]){const box=await locator.boundingBox();expect(box).not.toBeNull();expect(box!.y).toBeGreaterThanOrEqual(-1);expect(box!.y+box!.height).toBeLessThanOrEqual(geometry.innerHeight+1)}
})

test('mobile navigation remains viewport-pinned after deep scroll', async ({ page, isMobile }) => {
  test.skip(!isMobile); await page.goto('/'); await page.locator('#community').scrollIntoViewIfNeeded(); const before=await page.evaluate(()=>window.scrollY); expect(before).toBeGreaterThan(100); const menuButton=page.locator('.menu-button'); await expect(menuButton).toBeVisible(); await menuButton.evaluate(node=>(node as HTMLButtonElement).click()); const panel=page.locator('.mobile-nav__panel'),firstItem=page.locator('.mobile-nav nav button').first(),footer=page.locator('.mobile-nav__footer'); await expect(panel).toBeVisible(); await waitForMenuSettled(page)
  const state=await panel.evaluate(node=>{const r=node.getBoundingClientRect();return{top:r.top,bottom:r.bottom,height:window.innerHeight,scrollY:window.scrollY}}); expect(state.top,JSON.stringify(state)).toBeGreaterThanOrEqual(-1); expect(state.top,JSON.stringify(state)).toBeLessThanOrEqual(1); expect(state.bottom,JSON.stringify(state)).toBeLessThanOrEqual(state.height+1); expect(Math.abs(state.scrollY-before)).toBeLessThanOrEqual(2)
  for(const locator of [firstItem,footer]){const box=await locator.boundingBox();expect(box).not.toBeNull();expect(box!.y).toBeGreaterThanOrEqual(0);expect(box!.y+box!.height).toBeLessThanOrEqual(state.height+1)}
  await page.keyboard.press('Escape'); await expect(page.locator('#mobile-navigation')).toHaveCount(0); await expect.poll(async()=>Math.abs((await page.evaluate(()=>window.scrollY))-before)).toBeLessThanOrEqual(2)
})

test('responsive viewport matrix has no horizontal escape', async ({ page, browserName }) => {
  test.skip(browserName!=='chromium'); const viewports=[[320,568],[360,800],[375,667],[390,844],[393,852],[412,915],[768,1024],[1024,768],[1280,720],[1440,900],[1920,1080]] as const
  for(const [width,height] of viewports){await page.setViewportSize({width,height});await page.goto('/');const geometry=await page.evaluate(()=>({scrollWidth:document.documentElement.scrollWidth,clientWidth:document.documentElement.clientWidth}));expect(geometry.scrollWidth,`${width}x${height}`).toBeLessThanOrEqual(geometry.clientWidth+1);if(width<=760){await page.locator('.menu-button').click();await waitForMenuSettled(page);const box=await page.locator('.mobile-nav__panel').boundingBox();expect(box,`${width}x${height} panel`).not.toBeNull();expect(box!.x,`${width}x${height}`).toBeGreaterThanOrEqual(-1);expect(box!.x+box!.width,`${width}x${height}`).toBeLessThanOrEqual(width+1);expect(box!.y+box!.height,`${width}x${height}`).toBeLessThanOrEqual(height+1);await page.keyboard.press('Escape')}}
})
