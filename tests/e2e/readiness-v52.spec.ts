import {test,expect} from '@playwright/test'

const KEY='copypump.radar.v1'
const id='gross-transfer-net-change'

for(const path of ['/radar','/ru/radar',`/ru/radar/${id}`]){
  test(`delayed initial controls retain the first Save after hydration: ${path}`,async({page})=>{
    const errors:string[]=[]
    page.on('pageerror',error=>errors.push(error.message))
    page.on('console',message=>{if(message.type()==='error')errors.push(message.text())})
    let release!:()=>void,requested!:()=>void
    const gate=new Promise<void>(resolve=>{release=resolve})
    const seen=new Promise<void>(resolve=>{requested=resolve})
    await page.route('**/assets/Radar-*.js',async route=>{requested();await gate;await route.continue()})
    try{
      await page.goto(path,{waitUntil:'domcontentloaded'})
      await seen
      const save=page.locator('.radar-save').first()
      // Inspect the real published HTML while its handler module is deliberately
      // unavailable. Never force a click through the disabled control.
      await expect(save).toBeVisible()
      await expect(save).toBeDisabled()
      await expect(page.locator('.menu-button')).toBeDisabled()
      await expect(page.locator('h1')).toBeVisible()
      expect(await page.evaluate(key=>localStorage.getItem(key),KEY)).toBeNull()
      release()
      await expect(save).toBeEnabled()
      await save.click()
      // No delay between the first enabled click and a full page reload.
      await page.reload()
      await expect(page.locator('.radar-save').first()).toBeEnabled()
      await expect(page.locator('.radar-save').first()).toHaveAttribute('aria-pressed','true')
      expect(await page.evaluate(key=>JSON.parse(localStorage.getItem(key)!).saved,KEY)).toContain(id)
      expect(errors).toEqual([])
    }finally{release();await page.unroute('**/assets/Radar-*.js')}
  })
}

test('server HTML does not offer functioning-looking imperative controls without JavaScript',async({browser})=>{
  const context=await browser.newContext({baseURL:'http://127.0.0.1:4173',javaScriptEnabled:false})
  try{
    const page=await context.newPage()
    await page.goto('/ru')
    for(const selector of ['.menu-button','#chapter-1','.artwork-next'])await expect(page.locator(selector)).toBeDisabled()
    await expect(page.locator('.hero-intro')).toContainText('сам обнаруживает')
    await page.goto('/ru/project')
    await expect(page.locator('#product-tab-1')).toBeDisabled()
    await expect(page.locator('.architecture-parts')).toBeVisible()
    await page.goto('/ru/radar')
    await expect(page.locator('.radar-save').first()).toBeDisabled()
    await expect(page.locator('.radar-filters button').first()).toBeDisabled()
    await page.locator('.radar-row h2 a').first().click()
    await expect(page.locator('.radar-narrative')).toBeVisible()
    await expect(page.locator('.radar-read-sentinel button')).toBeDisabled()
  }finally{await context.close()}
})
