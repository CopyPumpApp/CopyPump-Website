import { test, expect, type Page } from '@playwright/test'

const shot = (project:string, name:string) => `test-results/visual-qa/${project}/${name}.png`

async function settle(page:Page, ms=850){ await page.waitForTimeout(ms) }
async function captureViewport(page:Page, project:string, name:string){
  await page.screenshot({ path: shot(project, name), fullPage:false })
}

test('capture Home, Project and mobile menu recovery surfaces', async ({ page, isMobile }, testInfo) => {
  const project = testInfo.project.name

  await page.goto('/')
  await expect(page.locator('#main-content')).toBeVisible()
  await settle(page)
  await captureViewport(page, project, 'home-top')

  await page.locator('.product-story').scrollIntoViewIfNeeded()
  await settle(page)
  await captureViewport(page, project, 'home-product-story')

  await page.locator('#journey').scrollIntoViewIfNeeded()
  await settle(page)
  await captureViewport(page, project, 'home-journey')

  await page.locator('#journal').scrollIntoViewIfNeeded()
  await settle(page)
  await captureViewport(page, project, 'home-progress')

  if (isMobile) {
    await page.locator('.menu-button').click()
    await expect(page.locator('.mobile-nav__panel')).toBeVisible()
    await expect(page.locator('.mobile-nav__top')).toBeVisible()
    await expect(page.locator('.mobile-nav nav button').first()).toBeVisible()
    await expect(page.locator('.mobile-nav__footer')).toBeVisible()
    await settle(page,650)
    await captureViewport(page, project, 'mobile-menu')
    await page.keyboard.press('Escape')
  }

  await page.goto('/project')
  await expect(page.locator('.project-page')).toBeVisible()
  await settle(page)
  await captureViewport(page, project, 'project-top')

  await page.locator('.project-details').scrollIntoViewIfNeeded()
  await settle(page)
  await captureViewport(page, project, 'project-details')

  const faq = page.locator('.project-faq__item').first()
  if (await faq.count()) {
    await faq.scrollIntoViewIfNeeded()
    await faq.locator('summary').click()
    await settle(page,450)
    await captureViewport(page, project, 'project-faq-open')
  }
})
