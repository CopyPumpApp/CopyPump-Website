import { test, expect } from '@playwright/test'

const removedLegacyTerms = /Mizuzi|RUN_FUP_TRUMP|gameplay|runner duel/i

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
  console.log('mobile-nav-geometry', JSON.stringify(geometry))
  expect(geometry.left, JSON.stringify(geometry)).toBeGreaterThanOrEqual(-1)
  expect(geometry.top, JSON.stringify(geometry)).toBeGreaterThanOrEqual(-1)
  expect(geometry.right, JSON.stringify(geometry)).toBeLessThanOrEqual(geometry.innerWidth + 1)
  expect(geometry.bottom, JSON.stringify(geometry)).toBeLessThanOrEqual(geometry.innerHeight + 1)
})
