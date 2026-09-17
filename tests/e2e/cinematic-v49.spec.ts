import { test, expect, devices, type Page } from '@playwright/test'
import { mkdirSync, writeFileSync } from 'node:fs'

async function tap(page:Page,selector:string,touch:boolean) {
  const control=page.locator(selector);await expect(control).toBeVisible()
  const r=await control.boundingBox();expect(r).not.toBeNull()
  const point={x:r!.x+r!.width/2,y:r!.y+r!.height/2}
  expect(await control.evaluate((node,p)=>node.contains(document.elementFromPoint(p.x,p.y)),point)).toBeTruthy()
  if(touch)await page.touchscreen.tap(point.x,point.y);else await page.mouse.click(point.x,point.y)
}

test('scene and header retain DOM identity through routes, menu and language changes',async({page,isMobile})=>{
  await page.goto('/');await page.waitForTimeout(1100)
  const scene=await page.locator('.scene-backdrop img').elementHandle(),header=await page.locator('.site-header').elementHandle()
  for(const path of ['/project','/progress','/contact','/']) {
    await tap(page,'.menu-button',isMobile)
    await expect(page.locator('.mobile-nav')).toHaveAttribute('data-phase','open')
    await page.locator(`.mobile-nav nav a[href="${path}"]`).click()
    await expect(page.locator('.mobile-nav')).toHaveCount(0)
    expect(await scene!.evaluate(n=>n.isConnected)).toBeTruthy()
    expect(await header!.evaluate(n=>n.isConnected)).toBeTruthy()
    await expect(page.locator('.scene-backdrop')).toHaveCount(1)
    await expect(page.locator('.hero-art')).toHaveCount(0)
  }
  await page.locator('#community').scrollIntoViewIfNeeded()
  await tap(page,'.menu-button',isMobile)
  await expect(page.locator('.mobile-nav')).toHaveAttribute('data-phase','open')
  await page.locator('.mobile-nav .locale-switch button').filter({hasText:'RU'}).click()
  await expect(page).toHaveURL(/\/ru/)
  expect(await scene!.evaluate(n=>n.isConnected)).toBeTruthy()
  await expect(page.locator('.mobile-nav img')).toHaveCount(1) // Brand only, no second scene.
  await page.keyboard.press('Escape');await expect(page.locator('.mobile-nav')).toHaveCount(0)
})

test('20 interrupted opening/closing sequences do not queue or strand scroll lock',async({page,isMobile})=>{
  test.setTimeout(60_000);await page.goto('/');await page.locator('#community').scrollIntoViewIfNeeded();await page.waitForTimeout(1100)
  for(let i=0;i<20;i++) {
    await tap(page,'.menu-button',isMobile)
    await page.waitForTimeout(60)
    await tap(page,'.icon-button',isMobile)
    await expect(page.locator('.mobile-nav')).toHaveAttribute('data-phase','closing')
    if(i%4===0) {await tap(page,'.icon-button',isMobile);await expect(page.locator('.mobile-nav')).toHaveAttribute('data-phase','opening');await page.keyboard.press('Escape')}
    await expect(page.locator('.mobile-nav')).toHaveCount(0)
    expect(await page.locator('#root').evaluate(n=>(n as HTMLElement).inert)).toBeFalsy()
    await expect(page.locator('html')).not.toHaveClass(/nav-open/)
  }
  await page.evaluate(()=>scrollTo(0,0));await expect.poll(()=>page.evaluate(()=>scrollY)).toBeLessThanOrEqual(1)
})

test('open compositions and functional policy surface have the intended boundaries',async({page})=>{
  await page.goto('/')
  for(const selector of ['.hero','.experience-stage','.status-card','.community','.site-footer']) {
    const style=await page.locator(selector).evaluate(n=>{const s=getComputedStyle(n);return{color:s.backgroundColor,image:s.backgroundImage,border:s.borderTopWidth}})
    expect(style.color,selector).toBe('rgba(0, 0, 0, 0)');expect(style.image,selector).toBe('none');expect(style.border).toBe('0px')
  }
  await page.locator('#chapter-2').click();await expect(page.locator('.instrument--policy')).toBeVisible()
  await page.locator('#capital-limit').press('End');await expect(page.locator('.policy-result')).toContainText('Within this limit')
  await page.goto('/project')
  for(const selector of ['.document-panel','.control-grid article']) {
    const colors=await page.locator(selector).evaluateAll(ns=>ns.map(n=>getComputedStyle(n).backgroundColor))
    expect(colors.every(c=>c==='rgba(0, 0, 0, 0)')).toBeTruthy()
  }
})

test('mask text settles, offscreen color stops and disabled animation APIs stay readable',async({page})=>{
  await page.goto('/');await page.waitForTimeout(1800)
  expect(await page.locator('h1 .heading-motion').evaluateAll(ns=>ns.every(n=>Number(getComputedStyle(n).opacity)===1))).toBeTruthy()
  await expect(page.locator('h1 .gradient-ink').first()).toHaveCSS('background-image',/linear-gradient/)
  expect(await page.locator('main [data-gradient-running=true]').count()).toBeLessThanOrEqual(1)
  await page.emulateMedia({reducedMotion:'reduce'})
  await expect(page.locator('html')).toHaveAttribute('data-motion','off')
  await page.waitForTimeout(50)
  expect(await page.evaluate(()=>document.getAnimations().filter(a=>a.playState==='running').length)).toBe(0)
  await page.addInitScript(()=>{Object.defineProperty(Element.prototype,'animate',{value:undefined,configurable:true})})
  await page.goto('/');await page.locator('#community').scrollIntoViewIfNeeded()
  expect(await page.locator('[data-reveal]').evaluateAll(ns=>ns.every(n=>getComputedStyle(n).opacity==='1'))).toBeTruthy()
})

test('record actual v49 navigation and section transitions',async({browser,isMobile},info)=>{
  test.setTimeout(90_000)
  const dir=`test-results/visual-qa/${info.project.name}`;mkdirSync(dir,{recursive:true})
  const device=info.project.name==='iphone-webkit'?devices['iPhone 14']:info.project.name==='android-chromium'?devices['Pixel 7']:devices['Desktop Chrome']
  const viewport=isMobile?device.viewport:{width:1440,height:1000}
  const ctx=await browser.newContext({...device,viewport,baseURL:'http://127.0.0.1:4173',recordVideo:{dir:`${dir}/raw`,size:viewport}})
  const page=await ctx.newPage(),video=page.video()!
  await page.goto('/ru');await page.waitForTimeout(1500)
  await page.screenshot({path:`${dir}/v49-hero-ru.png`})
  await tap(page,'.menu-button',isMobile);await page.waitForTimeout(1100)
  await page.screenshot({path:`${dir}/v49-menu-ru.png`})
  await tap(page,'.icon-button',isMobile);await page.waitForTimeout(550)
  for(const id of ['experience','status','community']) {
    await page.locator(`#${id}`).evaluate(n=>n.scrollIntoView({behavior:'smooth',block:'start'}));await page.waitForTimeout(1700)
    await page.screenshot({path:`${dir}/v49-${id}-ru.png`})
  }
  await tap(page,'.menu-button',isMobile);await page.waitForTimeout(900)
  await page.locator('.mobile-nav nav a[href="/ru/project"]').click();await page.waitForTimeout(1800)
  await page.screenshot({path:`${dir}/v49-product-ru.png`})
  await page.locator('#product-tab-1').click();await page.waitForTimeout(700)
  await tap(page,'.menu-button',isMobile);await page.waitForTimeout(850)
  await page.locator('.mobile-nav nav a[href="/ru/progress"]').click();await page.waitForTimeout(1800)
  await page.screenshot({path:`${dir}/v49-progress-ru.png`})
  await page.close();await video.saveAs(`${dir}/v49-walkthrough.webm`);await ctx.close()
})

// Diagnostic only: headless rAF cadence is NOT physical device FPS or a GPU trace.
test('record warm motion-on/off frame-interval diagnostics',async({page,isMobile,browserName},info)=>{
  test.setTimeout(100_000)
  const dir=`test-results/visual-qa/${info.project.name}`;mkdirSync(dir,{recursive:true})
  await page.goto('/');await page.waitForTimeout(1500)
  const samples:unknown[]=[]
  for(const mode of ['on','off']) {
    if(mode==='off'){await page.locator('.menu-button').click();await expect(page.locator('.mobile-nav')).toHaveAttribute('data-phase','open');await page.locator('.mobile-nav__footer .motion-toggle').click();await page.keyboard.press('Escape');await expect(page.locator('.mobile-nav')).toHaveCount(0)}
    for(let run=0;run<3;run++) {
      await page.locator('#experience').scrollIntoViewIfNeeded();await page.waitForTimeout(1000)
      const measurement=await page.evaluate(async()=>{
        const intervals:number[]=[],longTasks:number[]=[]
        let observer:PerformanceObserver|undefined
        if(PerformanceObserver.supportedEntryTypes?.includes('longtask')){observer=new PerformanceObserver(list=>list.getEntries().forEach(e=>longTasks.push(e.duration)));observer.observe({type:'longtask',buffered:false})}
        let last=performance.now(),frames=0;const start=last
        await new Promise<void>(resolve=>{
          const frame=(now:number)=>{intervals.push(now-last);last=now;frames++;if(now-start>=6000)resolve();else requestAnimationFrame(frame)}
          requestAnimationFrame(frame)
        })
        observer?.disconnect();const sorted=intervals.slice(1).sort((a,b)=>a-b)
        return{durationMs:last-start,frames,p50Ms:sorted[Math.floor(sorted.length*.5)],p95Ms:sorted[Math.floor(sorted.length*.95)],maxMs:sorted[sorted.length-1],over50ms:sorted.filter(x=>x>50).length,longTasksSupported:!!observer,longTasks}
      })
      samples.push({mode,run:run+1,...measurement})
    }
  }
  writeFileSync(`${dir}/v49-motion-diagnostics.json`,JSON.stringify({method:'Warm 3 x 6-second rAF samples per mode, headless emulation; not physical FPS; does not replace the 3 x 3-minute release soak.',browserName,isMobile,viewport:page.viewportSize(),samples},null,2))
})
