import { test, expect } from '@playwright/test'

const shot = (project:string, name:string) => `test-results/visual-qa/${project}/${name}.png`

async function captureViewport(page: Parameters<typeof test>[0] extends never ? never : any, project:string, name:string){
  await page.screenshot({ path: shot(project, name), fullPage:false })
}

test('capture Home, Project and mobile menu recovery surfaces', async ({ page, isMobile }, testInfo) => {
  const project = testInfo.project.name

  await page.goto('/')
  await expect(page.locator('#main-content')).toBeVisible()
  await captureViewport(page, project, 'home-top')

  await page.locator('.product-story').scrollIntoViewIfNeeded()
  await captureViewport(page, project, 'home-product-story')

  await page.locator('#journey').scrollIntoViewIfNeeded()
  await captureViewport(page, project, 'home-journey')

  await page.locator('#journal').scrollIntoViewIfNeeded()
  await captureViewport(page, project, 'home-progress')

  if (isMobile) {
    await page.locator('.menu-button').click()
    await expect(page.locator('.mobile-nav__panel')).toBeVisible()
    await captureViewport(page, project, 'mobile-menu')
    await page.keyboard.press('Escape')
  }

  await page.goto('/project')
  await expect(page.locator('.project-page')).toBeVisible()
  await captureViewport(page, project, 'project-top')

  await page.locator('.project-details').scrollIntoViewIfNeeded()
  await captureViewport(page, project, 'project-details')

  const faq = page.locator('.project-faq__item').first()
  if (await faq.count()) {
    await faq.scrollIntoViewIfNeeded()
    await faq.locator('summary').click()
    await captureViewport(page, project, 'project-faq-open')
  }
})
