import {test,expect} from '@playwright/test'

test('sweep retains the outgoing image node and eagerly paints the predecoded successor',async({page},info)=>{
  await page.goto('/')
  await page.locator('#chapter-0').scrollIntoViewIfNeeded()
  await page.locator('.experience-art').scrollIntoViewIfNeeded()
  await page.waitForTimeout(1600)
  const original=await page.locator('.chapter-current img').elementHandle()
  expect(original).not.toBeNull()
  await expect.poll(()=>original!.evaluate(n=>(n as HTMLImageElement).complete&&(n as HTMLImageElement).naturalWidth>0)).toBeTruthy()
  // Use keyboard focus without moving the viewport away from the artwork.
  await page.locator('#chapter-1').evaluate(n=>(n as HTMLElement).focus({preventScroll:true}))
  await page.keyboard.press('Enter')
  await expect(page.locator('#chapter-1')).toHaveAttribute('aria-selected','true')
  await expect(page.locator('.chapter-art-stack')).toHaveAttribute('data-sweeping','true')
  expect(await original!.evaluate(n=>n.isConnected&&n.closest('picture')?.classList.contains('chapter-ghost'))).toBeTruthy()
  const samples=await page.locator('.experience-art').evaluate(async(stage)=>{
    const results:{layers:number;painted:boolean;area:number}[]=[]
    const until=performance.now()+1050
    do {
      const s=stage.getBoundingClientRect()
      let maxArea=0,painted=false
      const pictures=[...stage.querySelectorAll<HTMLImageElement>('.chapter-art-stack>picture img')]
      for(const img of pictures){
        const r=img.getBoundingClientRect(),p=img.closest('picture')!,style=getComputedStyle(p)
        const width=Math.max(0,Math.min(r.right,s.right,innerWidth)-Math.max(r.left,s.left,0))
        const height=Math.max(0,Math.min(r.bottom,s.bottom,innerHeight)-Math.max(r.top,s.top,0))
        const area=width*height*Number(style.opacity)
        maxArea=Math.max(maxArea,area)
        if(img.complete&&img.naturalWidth>0&&img.loading==='eager'&&img.decoding==='sync'&&area>500)painted=true
      }
      results.push({layers:pictures.length,painted,area:maxArea})
      await new Promise<void>(r=>requestAnimationFrame(()=>r()))
    }while(performance.now()<until)
    return results
  })
  expect(samples.length).toBeGreaterThan(5)
  expect(samples.every(x=>x.layers<=2)).toBeTruthy()
  expect(samples.every(x=>x.painted),'there must always be a decoded object intersecting the visible stage').toBeTruthy()
  await expect(page.locator('.chapter-ghost')).toHaveCount(0)
  await info.attach('sweep-paint-samples',{body:JSON.stringify(samples),contentType:'application/json'})
  await page.screenshot({path:`test-results/visual-qa/${info.project.name}/v51-sweep-painted.png`})
})

test('rapid reverse selections settle to one eager object without remounting its role',async({page})=>{
  await page.goto('/')
  for(const index of [1,2,1,3,0]){
    await page.locator(`#chapter-${index}`).click()
    await expect(page.locator(`#chapter-${index}`)).toHaveAttribute('aria-selected','true')
    expect(await page.locator('.chapter-art-stack img').count()).toBeLessThanOrEqual(2)
  }
  await expect(page.locator('.chapter-ghost')).toHaveCount(0)
  await expect(page.locator('.chapter-current img')).toHaveAttribute('src',/detect-800\.webp$/)
  await expect(page.locator('.chapter-current img')).toHaveAttribute('loading','eager')
})
