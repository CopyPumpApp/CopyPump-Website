import { test, expect } from '@playwright/test'

test('section lighting follows the viewport-height band after resize and navigation',async({page})=>{
  for(const viewport of [{width:1440,height:900},{width:390,height:844}]) {
    await page.setViewportSize(viewport);await page.goto('/')
    for(const id of ['experience','status','community']) {
      await page.locator(`#${id}`).evaluate(node=>node.scrollIntoView({block:'start',behavior:'auto'}))
      await expect(page.locator('.scene-backdrop')).toHaveAttribute('data-scene',id)
    }
    await page.evaluate(()=>scrollTo({top:0,behavior:'auto'}))
    await expect(page.locator('.scene-backdrop')).toHaveAttribute('data-scene','hero')
  }
})
