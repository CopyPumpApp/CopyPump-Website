import { test, expect } from '@playwright/test'

const shot = (project:string, name:string) => `test-results/visual-qa/${project}/${name}.png`

test('capture Home, Project and mobile menu recovery surfaces', async ({ page, isMobile }, testInfo) => {
  const project = testInfo.project.name

  await page.goto('/')
  await expect(page.locator('#main-content')).toBeVisible()
  await page.screenshot({ path: shot(project, 'home-full'), fullPage: true })

  await page.locator('#journal').scrollIntoViewIfNeeded()
  await page.screenshot({ path: shot(project, 'home-progress'), fullPage: false })

  if (isMobile) {
    await page.locator('.menu-button').click()
    await expect(page.locator('.mobile-nav__panel')).toBeVisible()
    await page.screenshot({ path: shot(project, 'mobile-menu'), fullPage: false })
    await page.keyboard.press('Escape')
  }

  await page.goto('/project')
  await expect(page.locator('.project-page')).toBeVisible()
  await page.screenshot({ path: shot(project, 'project-full'), fullPage: true })

  const faq = page.locator('.project-faq__item').first()
  if (await faq.count()) {
    await faq.scrollIntoViewIfNeeded()
    await faq.locator('summary').click()
    await page.screenshot({ path: shot(project, 'project-faq-open'), fullPage: false })
  }
})
