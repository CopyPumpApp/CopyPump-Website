import {test,expect} from '@playwright/test'
for(const path of ['/','/project','/progress','/ru','/ru/project','/ru/progress','/privacy','/contact','/404']){
 test(`${path}: page renders, no console errors or horizontal overflow`,async({page})=>{
  const errors:string[]=[];page.on('pageerror',e=>errors.push(e.message))
  await page.goto(path);await expect(page.locator('main')).toBeVisible();await expect(page.locator('h1')).toHaveCount(1)
  await expect.poll(()=>page.evaluate(()=>document.documentElement.scrollWidth-document.documentElement.clientWidth)).toBeLessThanOrEqual(1)
  expect(errors).toEqual([])
 })
}
test('policy illustration responds without wallet or transaction calls',async({page})=>{
 const external:string[]=[]
 page.on('request',r=>{if(/solana|jupiter|rpc/i.test(r.url())&&!r.url().includes('127.0.0.1'))external.push(r.url())})
 await page.goto('/');await page.locator('#chapter-2').click()
 await expect(page.locator('.policy-result')).toContainText('Blocked by your limit')
 await page.locator('#capital-limit').press('End');await expect(page.locator('.policy-result')).toContainText('Within this limit')
 await expect(page.locator('.policy-result')).toContainText('Every other required check')
 await page.locator('#capital-limit').press('Home');await expect(page.locator('.policy-result')).toContainText('Blocked by your limit')
 expect(external).toEqual([])
})
test('product tabs and FAQ are usable, no repeated workflow on the product page',async({page})=>{
 await page.goto('/project');await expect(page.locator('.control-grid article')).toHaveCount(4)
 await page.locator('#product-tab-1').click();await expect(page.locator('.authority-records article')).toHaveCount(3)
 await page.locator('#product-tab-2').click();const item=page.locator('.faq-item').first();await item.locator('summary').click();await expect(item).toHaveAttribute('open','')
 await expect(page.locator('#experience')).toHaveCount(0)
})
