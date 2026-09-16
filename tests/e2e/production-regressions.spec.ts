import {test,expect} from '@playwright/test'
test('home tells the product story once and exposes a dated status preview',async({page})=>{
 await page.goto('/')
 for(const s of ['.hero','#experience','#status','#community'])await expect(page.locator(s)).toHaveCount(1)
 for(const s of ['#journey','#product-story','#learn-more','.roadmap-section','.faq-list'])await expect(page.locator(s)).toHaveCount(0)
 await expect(page.locator('#status time')).toHaveAttribute('datetime','2026-09-14')
})
test('current state and milestones live only on Progress',async({page})=>{
 await page.goto('/progress');await expect(page.locator('.progress-gates article')).toHaveCount(4);await expect(page.locator('.roadmap-section li')).toHaveCount(3)
 await expect(page.locator('.gate-tag.locked')).toHaveText('Locked')
 await expect(page.locator('.source-record a')).toHaveAttribute('href',/PROJECT_STATUS.md$/)
 await expect(page.locator('body')).not.toContainText(/guaranteed profits|Mainnet live|externally audited/i)
})
test('only restored same-art responsive background is active',async({page,isMobile})=>{
 await page.goto('/')
 const img=page.locator('.hero-art img')
 await expect.poll(()=>img.evaluate(n=>(n as HTMLImageElement).complete&&(n as HTMLImageElement).naturalWidth>0)).toBeTruthy()
 const src=await img.evaluate(n=>(n as HTMLImageElement).currentSrc)
 expect(src).toContain(isMobile?'earth-trading-900.webp':'earth-trading-1600.webp')
 const requests=await page.evaluate(()=>performance.getEntriesByType('resource').map(x=>x.name))
 expect(requests.some(x=>x.includes('cinematic-environment-v46')||x.includes('cutout-final-v47.webp'))).toBeFalsy()
})
test('chapters mount only one canonical object at a time',async({page})=>{
 await page.goto('/')
 for(let i=0;i<4;i++){await page.locator(`#chapter-${i}`).click();await expect(page.locator('.experience-art img')).toHaveCount(1);await expect.poll(()=>page.locator('.experience-art img').evaluate(n=>(n as HTMLImageElement).naturalWidth)).toBeGreaterThan(0)}
})
test('new information architecture does not duplicate long paragraphs',async({page})=>{
 const seen=new Set<string>()
 for(const path of ['/','/project','/progress']){
  await page.goto(path)
  const text=await page.locator('main p').allTextContents()
  for(const value of text.map(x=>x.trim()).filter(x=>x.length>90)){expect(seen.has(value),value).toBeFalsy();seen.add(value)}
 }
})
test('no decorative divider lines or menu container',async({page})=>{
 await page.goto('/')
 const styles=await page.locator('.menu-button').evaluate(n=>{const s=getComputedStyle(n);return[s.borderTopWidth,s.borderRightWidth,s.borderBottomWidth,s.borderLeftWidth,s.backgroundColor,s.boxShadow]})
 expect(styles).toEqual(['0px','0px','0px','0px','rgba(0, 0, 0, 0)','none'])
 for(const s of ['.hero','.experience','.status-section','.community','.site-footer']){
  const borders=await page.locator(s).evaluate(n=>{const s=getComputedStyle(n);return[s.borderTopWidth,s.borderBottomWidth]})
  expect(borders).toEqual(['0px','0px'])
 }
})
test('responsive matrix: both languages and all primary routes',async({page,browserName,isMobile})=>{
 test.skip(browserName!=='chromium'||isMobile);test.setTimeout(90_000)
 for(const width of [320,390,768,1024,1440,1920])for(const path of ['/','/ru','/project','/ru/project','/progress','/ru/progress']){
  await page.setViewportSize({width,height:900});await page.goto(path)
  expect(await page.evaluate(()=>document.documentElement.scrollWidth-document.documentElement.clientWidth),`${path} ${width}`).toBeLessThanOrEqual(1)
 }
})
