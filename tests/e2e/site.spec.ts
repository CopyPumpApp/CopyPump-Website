import { test, expect } from '@playwright/test'

test('home renders without horizontal overflow',async({page})=>{
 await page.goto('/'); await expect(page.locator('main')).toBeVisible();
 const overflow=await page.evaluate(()=>document.documentElement.scrollWidth>document.documentElement.clientWidth+1)
 expect(overflow).toBeFalsy()
})

test('mobile menu opens, renders, closes and cleans root lock',async({page,isMobile})=>{
 test.skip(!isMobile)
 await page.goto('/'); const trigger=page.locator('.menu-button'); await trigger.click()
 await expect(page.locator('#mobile-navigation')).toBeVisible(); await expect(page.locator('.mobile-nav__panel')).toBeVisible()
 await page.locator('.mobile-nav__top .icon-button').click(); await expect(page.locator('#mobile-navigation')).toHaveCount(0)
 await expect(page.locator('html')).not.toHaveClass(/nav-open/)
})

test('project disclosures open and close',async({page})=>{
 await page.goto('/project'); const item=page.locator('.project-detail').first(); await expect(item).toBeVisible()
 await item.locator('summary').click(); await expect(item).toHaveAttribute('open','')
 await item.locator('summary').click(); await expect(item).not.toHaveAttribute('open','')
})

test('motion toggle never hides reveal content',async({page,isMobile})=>{
 await page.goto('/')
 let toggle=page.locator('.header-actions .motion-toggle')
 if(isMobile){
   await page.locator('.menu-button').click()
   await expect(page.locator('#mobile-navigation')).toBeVisible()
   toggle=page.locator('.mobile-nav__footer .motion-toggle')
 }
 await expect(toggle).toBeVisible(); await toggle.click()
 const hidden=await page.locator('[data-reveal]').evaluateAll(nodes=>nodes.some(n=>getComputedStyle(n).opacity==='0'))
 expect(hidden).toBeFalsy()
})
