import {test,expect} from '@playwright/test'

test('Home carries publication-level product context without duplicate long-form pages',async({page})=>{
  await page.goto('/ru')
  for(const selector of ['.home-value','.experience','.home-control','.home-pipeline','.radar-teaser','.status-section','.home-map','#community']){
    await expect(page.locator(selector)).toHaveCount(1)
  }
  await expect(page.locator('.home-value')).toContainText('Автоматизация ищет')
  await expect(page.locator('.home-control')).toContainText('У автономности есть границы')
  await expect(page.locator('.home-pipeline')).toContainText('Движения кошелька')
  await expect(page.locator('.home-map')).toContainText('Mainnet торговля')
  await expect(page.locator('.home-map')).toContainText('Закрыта')
  await expect(page.locator('body')).not.toContainText('Вы выбираете кошельки вручную')
  await expect(page.locator('.home-control a[href="/ru/project"]')).toHaveCount(1)
  await expect(page.locator('.home-map a[href="/ru/progress"]')).toHaveCount(1)
})

test('new Home editorial sections stay open rather than card-heavy',async({page})=>{
  await page.goto('/')
  for(const selector of ['.home-value','.home-control','.home-pipeline','.home-map']){
    const surface=page.locator(selector)
    const style=await surface.evaluate(node=>{const s=getComputedStyle(node);return{background:s.backgroundColor,image:s.backgroundImage,borderTop:s.borderTopWidth,borderBottom:s.borderBottomWidth,shadow:s.boxShadow}})
    expect(style.background,selector).toBe('rgba(0, 0, 0, 0)')
    expect(style.image,selector).toBe('none')
    expect(style.borderTop,selector).toBe('0px')
    expect(style.borderBottom,selector).toBe('0px')
    expect(style.shadow,selector).toBe('none')
  }
})

test('mobile Home has useful density without horizontal overflow',async({page,browserName,isMobile})=>{
  test.skip(browserName!=='chromium'||isMobile)
  await page.setViewportSize({width:390,height:844})
  await page.goto('/ru')
  await expect.poll(()=>page.evaluate(()=>document.documentElement.scrollWidth-document.documentElement.clientWidth)).toBeLessThanOrEqual(1)
  const sections=['.home-value','.experience','.home-control','.home-pipeline','.radar-teaser','.status-section','.home-map','#community']
  for(const selector of sections)await expect(page.locator(selector)).toBeVisible()
  const paddings=await page.locator('.home-value,.home-control,.home-pipeline,.home-map').evaluateAll(nodes=>nodes.map(node=>({top:parseFloat(getComputedStyle(node).paddingTop),bottom:parseFloat(getComputedStyle(node).paddingBottom)})))
  for(const p of paddings){expect(p.top).toBeLessThanOrEqual(50);expect(p.bottom).toBeLessThanOrEqual(50)}
})

test('publication context stays conservative about current readiness',async({page})=>{
  await page.goto('/')
  await expect(page.locator('.home-map')).toContainText('In verification')
  await expect(page.locator('.home-map')).toContainText('Locked')
  await expect(page.locator('.home-map')).not.toContainText(/Mainnet live|production ready|guaranteed profit/i)
  await expect(page.locator('.status-section time')).toHaveAttribute('datetime','2026-09-14')
})
