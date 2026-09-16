import {test,expect} from '@playwright/test'
test('capture the premium design and actual active states',async({page,isMobile},info)=>{
 test.setTimeout(80_000)
 const dir=`test-results/visual-qa/${info.project.name}`
 for(const path of ['/','/ru','/project','/ru/project','/progress']){
  await page.goto(path);await page.waitForTimeout(1000)
  await page.screenshot({path:`${dir}/${path==='/'?'home':path.slice(1).replaceAll('/','-')}-top.png`})
 }
 await page.goto('/');await page.waitForTimeout(800)
 await page.locator('.menu-button').click();await expect(page.locator('.mobile-nav nav a')).toHaveCount(6);await page.screenshot({path:`dir/menu.png`.replace('dir',dir)});await page.locator('.icon-button').click()
 for(const id of ['experience','status','community']){await page.locator(`#${id}`).scrollIntoViewIfNeeded();await page.waitForTimeout(1100);await page.screenshot({path:`${dir}/home-${id}.png`})}
 await page.locator('#chapter-2').click();await page.locator('#capital-limit').scrollIntoViewIfNeeded();await page.waitForTimeout(500);await page.screenshot({path:`${dir}/policy-blocked.png`});await page.locator('#capital-limit').press('End');await page.screenshot({path:`${dir}/policy-allowed.png`})
 await page.goto('/project');await page.locator('#product-tab-2').click();await page.locator('.faq-item').first().locator('summary').click();await page.waitForTimeout(300);await page.screenshot({path:`${dir}/faq-open.png`})
})
