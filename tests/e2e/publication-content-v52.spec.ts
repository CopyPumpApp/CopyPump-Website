import {test,expect} from '@playwright/test'

test('Home has meaningful publication density without restoring card clutter',async({page})=>{
  await page.goto('/')
  await expect(page.locator('.home-value-grid article')).toHaveCount(3)
  await expect(page.locator('.home-control-list article')).toHaveCount(4)
  await expect(page.locator('.home-pipeline-flow li')).toHaveCount(5)
  await expect(page.locator('.home-map-list article')).toHaveCount(6)
  await expect(page.locator('.radar-teaser-item')).toHaveCount(3)
  await expect(page.locator('.status-current')).toContainText('Close the Devnet loop')
  await expect(page.locator('.home-control')).not.toHaveCSS('background-color','rgb(16, 29, 40)')
})

test('Home copy stays distinct from detailed Product copy',async({page})=>{
  await page.goto('/')
  const home=(await page.locator('main').innerText()).replace(/\s+/g,' ')
  await page.goto('/project')
  const product=(await page.locator('main').innerText()).replace(/\s+/g,' ')
  const detailed=[
    'Set the maximum capital an individual action may use.',
    'Bound acceptable execution conditions.',
    'Constrain the position and portfolio exposure',
    'Recovery must respect the current user policy',
  ]
  for(const phrase of detailed){
    expect(product).toContain(phrase)
    expect(home).not.toContain(phrase)
  }
})

test('Russian Home explains automatic discovery and current public state',async({page})=>{
  await page.goto('/ru')
  await expect(page.locator('.home-value')).toContainText('Автоматическое обнаружение')
  await expect(page.locator('.home-pipeline')).toContainText('Движения кошелька')
  await expect(page.locator('.home-map')).toContainText('Mainnet торговля')
  await expect(page.locator('.home-map')).toContainText('Закрыта')
  await expect(page.locator('.status-current')).toContainText('Замкнуть цикл в Devnet')
})

test('publication Home remains compact and overflow-free across mobile widths',async({page,browserName,isMobile})=>{
  test.skip(browserName!=='chromium'||isMobile)
  for(const width of [320,375,390,430,768]){
    await page.setViewportSize({width,height:844})
    await page.goto('/ru')
    expect(await page.evaluate(()=>document.documentElement.scrollWidth-innerWidth),String(width)).toBeLessThanOrEqual(1)
    for(const selector of ['.home-value','.home-control','.home-pipeline','.radar-teaser--expanded','.status-section','.home-map','.community']){
      const box=await page.locator(selector).boundingBox()
      expect(box,selector+' '+width).not.toBeNull()
      expect(box!.height,selector+' '+width).toBeLessThan(1800)
    }
  }
})

test('expanded Radar digest does not fetch detailed observations on Home',async({page})=>{
  const urls:string[]=[]
  page.on('request',r=>urls.push(r.url()))
  await page.goto('/')
  await expect(page.locator('.radar-teaser-item')).toHaveCount(3)
  expect(urls.some(url=>url.includes('/radar/observations/'))).toBeFalsy()
})

test('current interaction and disclosure remain available after content expansion',async({page,isMobile})=>{
  await page.goto('/ru')
  await page.locator('#experience').scrollIntoViewIfNeeded()
  await expect(page.locator('.artwork-step-controls')).toBeVisible()
  await page.locator('#chapter-2').click()
  await expect(page.locator('#capital-limit')).toBeVisible()
  await page.locator('#capital-limit').press('End')
  await expect(page.locator('.policy-result')).toContainText('В пределах лимита')
  await expect(page.locator('.experience-disclosure')).toContainText('Без подключения кошелька')
})

test('capture v52 publication scenes in desktop and mobile profiles',async({page},testInfo)=>{
  test.setTimeout(60_000)
  await page.goto('/ru')
  const dir='test-results/visual-qa/'+testInfo.project.name
  for(const [name,selector] of [
    ['v52-why','.home-value'],
    ['v52-control','.home-control'],
    ['v52-pipeline','.home-pipeline'],
    ['v52-radar','.radar-teaser--expanded'],
    ['v52-status','.status-section'],
    ['v52-product-map','.home-map'],
    ['v52-community','.community'],
  ] as const){
    const node=page.locator(selector)
    await node.scrollIntoViewIfNeeded()
    await page.waitForTimeout(1350)
    await page.screenshot({path:dir+'/'+name+'.png'})
  }
})
