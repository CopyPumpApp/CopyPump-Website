import { test, expect, type Page } from '@playwright/test'

const shot = (project:string, name:string) => `test-results/visual-qa/${project}/${name}.png`

async function settle(page:Page, ms=850){ await page.waitForTimeout(ms) }
async function captureViewport(page:Page, project:string, name:string){
  await page.screenshot({ path: shot(project, name), fullPage:false })
}
async function captureMenu(page:Page, project:string, name:string){
  await page.locator('.menu-button').click()
  await expect(page.locator('.mobile-nav__panel')).toBeVisible()
  await expect(page.locator('.mobile-nav__top')).toBeVisible()
  await expect(page.locator('.mobile-nav nav button').first()).toBeVisible()
  await expect(page.locator('.mobile-nav__footer')).toBeVisible()
  await settle(page,500)
  await captureViewport(page, project, name)
  await page.keyboard.press('Escape')
  await expect(page.locator('#mobile-navigation')).toHaveCount(0)
}

test('capture focused Home, expanded Project and mobile menu surfaces', async ({ page, isMobile }, testInfo) => {
  const project = testInfo.project.name

  await page.goto('/')
  await expect(page.locator('#main-content')).toBeVisible()
  await settle(page)
  await captureViewport(page, project, 'home-top')
  if(isMobile) await captureMenu(page, project, 'mobile-menu-top')

  await page.locator('#why-copypump').scrollIntoViewIfNeeded()
  await settle(page)
  await captureViewport(page, project, 'home-summary')

  await page.locator('#community').scrollIntoViewIfNeeded()
  await settle(page)
  await captureViewport(page, project, 'home-community')
  if(isMobile) await captureMenu(page, project, 'mobile-menu-scrolled')

  await page.goto('/project')
  await expect(page.locator('.project-page')).toBeVisible()
  await settle(page)
  await captureViewport(page, project, 'project-top')

  await page.locator('#product-story').scrollIntoViewIfNeeded()
  await settle(page)
  await captureViewport(page, project, 'project-product-story')

  await page.locator('#decision-demo').scrollIntoViewIfNeeded()
  await settle(page)
  await captureViewport(page, project, 'project-decision')

  await page.locator('#journal').scrollIntoViewIfNeeded()
  await settle(page)
  await captureViewport(page, project, 'project-progress')

  const faq = page.locator('.project-faq__item').first()
  if (await faq.count()) {
    await faq.scrollIntoViewIfNeeded()
    await faq.locator('summary').click()
    await settle(page,450)
    await captureViewport(page, project, 'project-faq-open')
  }
})
