import {test,expect,type Page} from '@playwright/test'

const selected=(page:Page,index:number)=>expect(page.locator(`#chapter-${index}`)).toHaveAttribute('aria-selected','true')
const stage=async(page:Page)=>{await page.goto('/ru');await page.locator('.experience-art').scrollIntoViewIfNeeded();await page.waitForTimeout(1300)}

test('reveals replay down and up without leaving clipped words or artwork hidden',async({page})=>{
  await page.goto('/ru')
  const word=page.locator('#experience-title .heading-motion').first()
  const enter=async()=>{
    await word.evaluate(n=>n.closest('section')!.scrollIntoView({block:'start',behavior:'instant'}))
    await expect.poll(()=>word.evaluate(n=>n.getAnimations().some(a=>a.playState==='running'))).toBeTruthy()
    await expect(word).toHaveCSS('opacity','1')
    await expect.poll(()=>word.evaluate(n=>n.getAnimations().length)).toBe(0)
  }
  await enter()
  await page.locator('#community').evaluate(n=>n.scrollIntoView({behavior:'instant'}))
  await expect(word).toHaveAttribute('data-revealed','false')
  await enter() // upward
  await page.evaluate(()=>scrollTo({top:0,behavior:'instant'}))
  await expect(word).toHaveAttribute('data-revealed','false')
  await enter() // downward
  await page.locator('.experience-art').scrollIntoViewIfNeeded()
  for(const selector of ['.experience-art','.chapter-current','.chapter-current img'])await expect(page.locator(selector)).toBeVisible()
  expect(await page.locator('.experience-art').evaluate(n=>getComputedStyle(n).opacity)).toBe('1')
})

test('clock cycles all objects and matching text, wraps, resumes after manual input and ignores hover',async({page,isMobile})=>{
  await page.clock.install();await stage(page)
  if(!isMobile)await page.locator('.experience-art').hover()
  for(const index of [1,2,3,0]){
    await page.clock.fastForward(7300);await selected(page,index)
    await expect(page.locator('.experience-story')).toHaveCount(1)
    await expect(page.locator('.experience-story')).toHaveAttribute('data-active','true')
    const names=['detect','qualify','constrain','execute-prove']
    await expect(page.locator('.chapter-current img')).toHaveAttribute('src',new RegExp(names[index]+'-800'))
    await expect(page.locator('.experience-story h3')).toBeVisible()
  }
  await page.locator('#chapter-2').click();await selected(page,2)
  await page.locator('#capital-limit').press('End')
  await page.clock.fastForward(7300);await selected(page,3)
  await page.locator('.artwork-previous').click();await selected(page,2)
  await page.clock.fastForward(7300);await selected(page,3)
  await page.locator('.experience-cycle').click()
  await page.clock.fastForward(16000);await selected(page,3)
  await page.locator('.experience-cycle').click()
  await page.clock.fastForward(7300);await selected(page,0)
  const art=page.locator('.experience-art')
  await art.dispatchEvent('pointerdown',{pointerId:77,pointerType:'touch',isPrimary:true,button:0,clientX:200,clientY:200})
  await art.dispatchEvent('pointermove',{pointerId:77,pointerType:'touch',clientX:95,clientY:202})
  await art.dispatchEvent('pointerup',{pointerId:77,pointerType:'touch',clientX:95,clientY:202})
  await selected(page,1)
  await page.clock.fastForward(7300);await selected(page,2)
})

test('automatic changes preserve section geometry and respect reduced motion',async({page})=>{
  await page.clock.install();await stage(page)
  const dimensions=()=>page.locator('#experience').evaluate(n=>({height:n.getBoundingClientRect().height,next:n.nextElementSibling!.getBoundingClientRect().top+scrollY}))
  const baseline=await dimensions()
  for(const index of [1,2,3,0]){
    await page.clock.fastForward(7400);await selected(page,index)
    const next=await dimensions()
    expect(Math.abs(next.height-baseline.height)).toBeLessThan(2)
    expect(Math.abs(next.next-baseline.next)).toBeLessThan(2)
  }
  await page.emulateMedia({reducedMotion:'reduce'})
  await expect(page.locator('#experience-panel')).toHaveAttribute('data-cycling','false')
  await page.clock.fastForward(22000);await selected(page,0)
  await page.locator('#chapter-3').click();await selected(page,3)
  await expect(page.locator('.chapter-ghost')).toHaveCount(0)
  expect(await page.locator('[data-reveal]').evaluateAll(nodes=>nodes.every(n=>getComputedStyle(n).opacity==='1'))).toBeTruthy()
})

test('failed artwork decode retains visible current layer; latest manual choice wins',async({page})=>{
  await page.route('**/media/v48/qualify-*.webp',route=>route.abort())
  await stage(page)
  await page.locator('#chapter-1').click()
  await selected(page,0)
  await expect(page.locator('#experience')).toContainText('Изображение не загрузилось')
  await expect(page.locator('.chapter-current img')).toBeVisible()
  expect(await page.locator('.chapter-current img').evaluate(n=>(n as HTMLImageElement).naturalWidth)).toBeGreaterThan(0)
  await page.locator('#chapter-2').click();await page.locator('#chapter-3').click()
  await selected(page,3)
  await expect(page.locator('.chapter-current img')).toHaveAttribute('src',/execute-prove/)
})

test('clean menu and compact section rhythm on both locales',async({page,isMobile})=>{
  for(const path of ['/','/ru']){
    await page.goto(path);await page.locator('.menu-button').click()
    await expect(page.locator('.mobile-nav')).toHaveAttribute('data-phase','open')
    await expect(page.locator('.mobile-nav nav small')).toHaveCount(0)
    await expect(page.locator('.mobile-nav nav a')).toHaveCount(7)
    if(path==='/')expect(await page.locator('.mobile-nav nav strong').allTextContents()).toEqual(['Home','Product','Progress','Radar','Community','Security','Contact'])
    await page.keyboard.press('Escape')
    await expect(page.locator('.mobile-nav')).toHaveCount(0)
    const spacing=await page.locator('main>.section-space').evaluateAll(nodes=>nodes.map(n=>({top:parseFloat(getComputedStyle(n).paddingTop),bottom:parseFloat(getComputedStyle(n).paddingBottom)})))
    for(const s of spacing){expect(s.top).toBeLessThanOrEqual(isMobile?30:52);expect(s.bottom).toBeLessThanOrEqual(isMobile?30:52)}
    expect(await page.evaluate(()=>document.documentElement.scrollWidth-document.documentElement.clientWidth)).toBeLessThanOrEqual(1)
  }
})

test('interruptions never strand a reveal and cycling sleeps outside the viewport',async({page})=>{
  await page.clock.install();await stage(page)
  await page.locator('#community').scrollIntoViewIfNeeded()
  await expect(page.locator('#experience-panel')).toHaveAttribute('data-cycling','false')
  await page.clock.fastForward(22000);await selected(page,0)
  await page.locator('.experience-art').scrollIntoViewIfNeeded()
  await page.locator('.menu-button').click()
  await expect(page.locator('#experience-panel')).toHaveAttribute('data-cycling','false')
  await page.clock.fastForward(22000);await selected(page,0)
  await page.keyboard.press('Escape');await expect(page.locator('.mobile-nav')).toHaveCount(0)
  await page.clock.fastForward(7400);await selected(page,1)
  await page.emulateMedia({reducedMotion:'reduce'})
  for(const selector of ['.chapter-current img','.experience-story','.experience-story h3'])await expect(page.locator(selector)).toBeVisible()
  await expect(page.locator('.scene-art img')).toHaveAttribute('src',/scene-home.webp/)
})


test('delayed observer delivery cannot leave the asset or text layer invisible',async({page})=>{
  await page.addInitScript(()=>{
    window.IntersectionObserver=class {
      readonly root=null;readonly rootMargin='0px';readonly thresholds=[0]
      observe(){} unobserve(){} disconnect(){} takeRecords(){return []}
    } as unknown as typeof IntersectionObserver
  })
  await page.goto('/ru')
  await page.locator('.experience-art').scrollIntoViewIfNeeded()
  await expect(page.locator('.chapter-current img')).toBeVisible()
  await expect(page.locator('.experience-art')).toHaveCSS('opacity','1')
  await expect(page.locator('.experience-story h3')).toBeVisible()
  expect(await page.locator('main [data-reveal]').evaluateAll(nodes=>nodes.every(n=>getComputedStyle(n).opacity==='1'))).toBeTruthy()
})

