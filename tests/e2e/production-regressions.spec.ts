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

test('Home keeps the recovered premium information sections', async ({ page }) => {
  await page.goto('/')
  for (const selector of ['#why-copypump', '.product-story', '#decision-demo', '#authority', '#journey', '#journal', '#roadmap', '#community']) {
    await expect(page.locator(selector), selector).toHaveCount(1)
  }
})

test('approved CopyPump background is active on Home and Project', async ({ page }) => {
  await page.goto('/')
  const homeBackground = await page.locator('.site-scroll-background').evaluate(node => getComputedStyle(node, '::before').backgroundImage)
  expect(homeBackground).toContain('copypump-global-market-background.png')
  await page.goto('/project')
  const projectBackground = await page.locator('.project-page').evaluate(node => getComputedStyle(node, '::before').backgroundImage)
  expect(projectBackground).toContain('copypump-global-market-background.png')
})

test('workflow surfaces use the approved lightweight cutouts', async ({ page }) => {
  await page.goto('/')
  await expect(page.locator('img[src*="/workflow-objects/"]')).toHaveCount(8)
  const sources = await page.locator('img[src*="/workflow-objects/"]').evaluateAll(nodes => nodes.map(node => (node as HTMLImageElement).getAttribute('src') || ''))
  expect(sources.every(src => !src.includes('-v47'))).toBeTruthy()
  expect(sources.every(src => /(?:detect|qualify|constrain|execute-prove)-cutout-final\.webp/.test(src))).toBeTruthy()
})

test('Progress navigation reaches the restored journal', async ({ page, isMobile }) => {
  await page.goto('/')
  if (isMobile) {
    await page.locator('.menu-button').click()
    await page.locator('.mobile-nav nav button').filter({ hasText: /Progress|Прогресс/ }).click()
    await expect(page.locator('#mobile-navigation')).toHaveCount(0)
  } else {
    await page.locator('.desktop-nav button').filter({ hasText: /Progress|Прогресс/ }).click()
  }
  await expect(page.locator('#journal')).toBeVisible()
  await expect.poll(async () => page.locator('#journal').evaluate(node => Math.abs(node.getBoundingClientRect().top) < window.innerHeight)).toBeTruthy()
})

test('Motion off never leaves reveal content hidden', async ({ page, isMobile }) => {
  await page.goto('/')
  let toggle = page.locator('.site-header .motion-toggle')
  if (isMobile) {
    await page.locator('.menu-button').click()
    toggle = page.locator('.mobile-nav__footer .motion-toggle')
  }
  await expect(toggle).toBeVisible()
  const pressed = await toggle.getAttribute('aria-pressed')
  if (pressed === 'true') await toggle.click()
  if (isMobile) await page.keyboard.press('Escape')
  await expect.poll(async () => page.evaluate(() => [...document.querySelectorAll<HTMLElement>('[data-reveal]')].every(node => getComputedStyle(node).opacity !== '0'))).toBeTruthy()
})

test('mobile header and menu keep the crystal glass treatment', async ({ page, isMobile }) => {
  test.skip(!isMobile)
  await page.goto('/')
  const header = await page.locator('.site-header').evaluate(node => {
    const style = getComputedStyle(node)
    const webkit = (style as CSSStyleDeclaration & { webkitBackdropFilter?: string }).webkitBackdropFilter || ''
    return { backgroundImage:style.backgroundImage, backgroundColor:style.backgroundColor, backdrop:`${style.backdropFilter || ''} ${webkit}` }
  })
  expect(header.backgroundImage).toContain('linear-gradient')
  expect(header.backdrop).toContain('blur(')
  expect(header.backgroundColor).not.toContain('0.985')

  await page.locator('.menu-button').click()
  const firstItem = page.locator('.mobile-nav nav button').first()
  await expect(page.locator('.mobile-nav__top')).toBeVisible()
  await expect(firstItem).toBeVisible()
  await expect(page.locator('.mobile-nav__footer')).toBeVisible()
  await page.waitForTimeout(700)
  const glassBackground = await page.locator('.mobile-nav__backdrop').evaluate(node => getComputedStyle(node).backgroundColor)
  const panelBackground = await page.locator('.mobile-nav__panel').evaluate(node => getComputedStyle(node).backgroundImage)
  const itemOpacity = await firstItem.evaluate(node => Number(getComputedStyle(node).opacity))
  expect(glassBackground).not.toBe('rgb(1, 4, 10)')
  expect(glassBackground).not.toBe('rgba(1, 4, 10, 0.96)')
  expect(panelBackground).toContain('linear-gradient')
  expect(itemOpacity).toBeGreaterThan(.95)
})

test('mobile navigation stays inside the visual viewport', async ({ page, isMobile }) => {
  test.skip(!isMobile)
  await page.goto('/')
  await page.locator('.menu-button').click()
  const panel = page.locator('.mobile-nav__panel')
  const top = page.locator('.mobile-nav__top')
  const firstItem = page.locator('.mobile-nav nav button').first()
  const footer = page.locator('.mobile-nav__footer')
  await expect(panel).toBeVisible()
  await expect(top).toBeVisible()
  await expect(firstItem).toBeVisible()
  await expect(footer).toBeVisible()
  const geometry = await panel.evaluate((node) => {
    const r = node.getBoundingClientRect()
    return { left:r.left, top:r.top, right:r.right, bottom:r.bottom, innerWidth:window.innerWidth, innerHeight:window.innerHeight }
  })
  expect(geometry.left, JSON.stringify(geometry)).toBeGreaterThanOrEqual(-1)
  expect(geometry.top, JSON.stringify(geometry)).toBeGreaterThanOrEqual(-1)
  expect(geometry.right, JSON.stringify(geometry)).toBeLessThanOrEqual(geometry.innerWidth + 1)
  expect(geometry.bottom, JSON.stringify(geometry)).toBeLessThanOrEqual(geometry.innerHeight + 1)
  for (const locator of [top, firstItem, footer]) {
    const box = await locator.boundingBox()
    expect(box).not.toBeNull()
    expect(box!.y).toBeGreaterThanOrEqual(-1)
    expect(box!.y + box!.height).toBeLessThanOrEqual(geometry.innerHeight + 1)
  }
})

test('mobile navigation remains viewport-pinned after deep scroll', async ({ page, isMobile }) => {
  test.skip(!isMobile)
  await page.goto('/')
  await page.locator('#journal').scrollIntoViewIfNeeded()
  const before = await page.evaluate(() => window.scrollY)
  expect(before).toBeGreaterThan(100)

  const menuButton = page.locator('.menu-button')
  await expect(menuButton).toBeVisible()
  const buttonBox = await menuButton.boundingBox()
  const viewportHeight = await page.evaluate(() => window.innerHeight)
  expect(buttonBox).not.toBeNull()
  expect(buttonBox!.y).toBeGreaterThanOrEqual(-1)
  expect(buttonBox!.y + buttonBox!.height).toBeLessThanOrEqual(viewportHeight + 1)

  // Use the already-visible sticky control directly. Playwright's locator.click()
  // may scroll sticky controls before dispatching the click; that driver-induced
  // scroll is not an application regression and would pollute this strict lock test.
  await menuButton.evaluate(node => (node as HTMLButtonElement).click())

  const panel = page.locator('.mobile-nav__panel')
  const firstItem = page.locator('.mobile-nav nav button').first()
  const footer = page.locator('.mobile-nav__footer')
  await expect(panel).toBeVisible()
  const state = await panel.evaluate((node) => {
    const r = node.getBoundingClientRect()
    return {top:r.top,bottom:r.bottom,height:window.innerHeight,scrollY:window.scrollY}
  })
  expect(state.top, JSON.stringify(state)).toBeGreaterThanOrEqual(-1)
  expect(state.top, JSON.stringify(state)).toBeLessThanOrEqual(1)
  expect(state.bottom, JSON.stringify(state)).toBeLessThanOrEqual(state.height + 1)
  expect(Math.abs(state.scrollY-before)).toBeLessThanOrEqual(2)
  const firstBox = await firstItem.boundingBox()
  const footerBox = await footer.boundingBox()
  expect(firstBox).not.toBeNull()
  expect(footerBox).not.toBeNull()
  expect(firstBox!.y).toBeGreaterThanOrEqual(0)
  expect(firstBox!.y + firstBox!.height).toBeLessThanOrEqual(state.height + 1)
  expect(footerBox!.y).toBeGreaterThanOrEqual(0)
  expect(footerBox!.y + footerBox!.height).toBeLessThanOrEqual(state.height + 1)
  await page.keyboard.press('Escape')
  await expect(page.locator('#mobile-navigation')).toHaveCount(0)
  await expect.poll(async () => Math.abs((await page.evaluate(() => window.scrollY)) - before)).toBeLessThanOrEqual(2)
})

test('responsive viewport matrix has no horizontal escape', async ({ page, browserName }) => {
  test.skip(browserName !== 'chromium')
  const viewports = [[320,568],[360,800],[375,667],[390,844],[393,852],[412,915],[768,1024],[1024,768],[1280,720],[1440,900],[1920,1080]] as const
  for (const [width,height] of viewports) {
    await page.setViewportSize({ width, height })
    await page.goto('/')
    const geometry = await page.evaluate(() => ({ scrollWidth:document.documentElement.scrollWidth, clientWidth:document.documentElement.clientWidth }))
    expect(geometry.scrollWidth, `${width}x${height}`).toBeLessThanOrEqual(geometry.clientWidth + 1)
    if (width <= 760) {
      await page.locator('.menu-button').click()
      const box = await page.locator('.mobile-nav__panel').boundingBox()
      expect(box, `${width}x${height} panel`).not.toBeNull()
      expect(box!.x, `${width}x${height}`).toBeGreaterThanOrEqual(-1)
      expect(box!.x + box!.width, `${width}x${height}`).toBeLessThanOrEqual(width + 1)
      expect(box!.y + box!.height, `${width}x${height}`).toBeLessThanOrEqual(height + 1)
      await page.keyboard.press('Escape')
    }
  }
})
