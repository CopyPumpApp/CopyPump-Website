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
  const fits = await panel.evaluate((node) => {
    const r = node.getBoundingClientRect()
    return r.left >= -1 && r.top >= -1 && r.right <= window.innerWidth + 1 && r.bottom <= window.innerHeight + 1
  })
  expect(fits).toBeTruthy()
})
