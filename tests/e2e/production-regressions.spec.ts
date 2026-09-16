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
  const toggle = isMobile ? page.locator('.site-header .motion-toggle') : page.locator('.site-header .motion-toggle')
  await expect(toggle).toBeVisible()
  const pressed = await toggle.getAttribute('aria-pressed')
  if (pressed === 'true') await toggle.click()
  await expect.poll(async () => page.evaluate(() => [...document.querySelectorAll<HTMLElement>('[data-reveal]')].every(node => getComputedStyle(node).opacity !== '0'))).toBeTruthy()
})

test('mobile navigation stays inside the visual viewport', async ({ page, isMobile }) => {
  test.skip(!isMobile)
  await page.goto('/')
  await page.locator('.menu-button').click()
  const panel = page.locator('.mobile-nav__panel')
  await expect(panel).toBeVisible()
  const geometry = await panel.evaluate((node) => {
    const r = node.getBoundingClientRect()
    return {
      left: r.left,
      top: r.top,
      right: r.right,
      bottom: r.bottom,
      width: r.width,
      height: r.height,
      innerWidth: window.innerWidth,
      innerHeight: window.innerHeight,
      visualWidth: window.visualViewport?.width ?? null,
      visualHeight: window.visualViewport?.height ?? null,
      visualOffsetLeft: window.visualViewport?.offsetLeft ?? null,
      visualOffsetTop: window.visualViewport?.offsetTop ?? null,
    }
  })
  expect(geometry.left, JSON.stringify(geometry)).toBeGreaterThanOrEqual(-1)
  expect(geometry.top, JSON.stringify(geometry)).toBeGreaterThanOrEqual(-1)
  expect(geometry.right, JSON.stringify(geometry)).toBeLessThanOrEqual(geometry.innerWidth + 1)
  expect(geometry.bottom, JSON.stringify(geometry)).toBeLessThanOrEqual(geometry.innerHeight + 1)
})
