import { test, expect, type Page } from '@playwright/test'

const shot = (project:string, name:string) => `test-results/visual-qa/${project}/${name}.png`

async function settle(page:Page, ms=350){
  await page.waitForTimeout(ms)
  // A non-empty bounding box is not proof that a reveal is visible.
  // Wait for the rendered opacity, including the heading's ancestors.
  await expect.poll(()=>page.evaluate(()=>{
    return Array.from(document.querySelectorAll<HTMLElement>('h1,h2')).filter(node=>{
      const r=node.getBoundingClientRect()
      if(!r.width||!r.height||r.bottom<=70||r.top>=innerHeight)return false
      let opacity=1
      for(let parent:Element|null=node;parent;parent=parent.parentElement)opacity*=Number(getComputedStyle(parent).opacity)
      return opacity<.99
    }).map(node=>node.textContent)
  }),{timeout:7000,message:'in-view headings must finish revealing before visual capture'}).toEqual([])
}
async function captureViewport(page:Page, project:string, name:string){
  await page.screenshot({ path: shot(project, name), fullPage:false })
}
async function captureSection(page:Page, project:string, id:string, name:string){
  await page.locator(`#${id}`).evaluate(node=>{
    const header=document.querySelector('.site-header')?.getBoundingClientRect().height||60
    window.scrollTo({top:node.getBoundingClientRect().top+window.scrollY-header-18,behavior:'auto'})
  })
  await settle(page)
  await captureViewport(page,project,name)
}
async function captureMenu(page:Page, project:string, name:string){
  const trigger=page.locator('.menu-button')
  await expect(trigger).toBeVisible()
  const box=await trigger.boundingBox()
  expect(box).not.toBeNull()
  await page.touchscreen.tap(box!.x+box!.width/2,box!.y+box!.height/2)
  const panel=page.locator('.mobile-nav__panel')
  await expect(panel).toBeVisible()
  await expect.poll(()=>panel.evaluate(node=>Number(getComputedStyle(node).opacity))).toBe(1)
  await expect(page.locator('.mobile-nav nav button').first()).toBeVisible()
  await expect(page.locator('.mobile-nav__footer')).toBeVisible()
  await page.waitForTimeout(350)
  await captureViewport(page, project, name)
  await page.keyboard.press('Escape')
  await expect(page.locator('#mobile-navigation')).toHaveCount(0)
}

test('capture focused Home, expanded Project and mobile menu surfaces', async ({ page, isMobile }, testInfo) => {
  test.setTimeout(60_000)
  const project = testInfo.project.name
  await page.goto('/')
  await expect(page.locator('#main-content')).toBeVisible()
  await settle(page)
  await captureViewport(page, project, 'home-top')
  if(isMobile) await captureMenu(page, project, 'mobile-menu-top')
  await captureSection(page,project,'why-copypump','home-summary')
  await captureSection(page,project,'community','home-community')
  if(isMobile) await captureMenu(page, project, 'mobile-menu-scrolled')

  await page.goto('/project')
  await expect(page.locator('.project-page')).toBeVisible()
  await settle(page)
  await captureViewport(page, project, 'project-top')
  await captureSection(page,project,'product-story','project-product-story')
  await captureSection(page,project,'decision-demo','project-decision')
  await captureSection(page,project,'journal','project-progress')
  const faq = page.locator('.project-faq__item').first()
  await faq.scrollIntoViewIfNeeded()
  await faq.locator('summary').click()
  await settle(page,450)
  await captureViewport(page, project, 'project-faq-open')
})
