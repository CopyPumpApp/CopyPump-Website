import {test,expect} from '@playwright/test'

test('capture publication-content scenes in EN and RU',async({page},info)=>{
  test.setTimeout(90_000)
  const dir=`test-results/visual-qa/${info.project.name}`
  for(const locale of ['','/ru']){
    await page.goto(locale||'/')
    for(const [selector,name] of [
      ['.home-value','why'],
      ['.home-control','control'],
      ['.home-pipeline','pipeline'],
      ['.home-map','map'],
    ] as const){
      const node=page.locator(selector)
      await node.scrollIntoViewIfNeeded()
      await page.waitForTimeout(1400)
      await expect(node).toBeVisible()
      await page.screenshot({path:`${dir}/v52-${locale?'ru':'en'}-${name}.png`})
    }
  }
})
