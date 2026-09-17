import { test, expect } from '@playwright/test'

test('color layers preserve one accessible heading and animate opacity only',async({page,browserName})=>{
  await page.goto('/')
  await expect(page.locator('h1')).toHaveAccessibleName(/^Smart money\.\s*Your rules\.$/)
  await expect(page.locator('h1 .gradient-shift')).toHaveAttribute('aria-hidden','true')
  await expect.poll(()=>page.locator('h1 .gradient-shift').evaluate(node=>node.getAnimations().length)).toBeGreaterThan(0)
  const frames=await page.locator('h1 .gradient-shift').evaluate(node=>node.getAnimations().flatMap(a=>(a.effect as KeyframeEffect).getKeyframes()).map(frame=>({opacity:frame.opacity,position:frame.backgroundPosition,positionX:frame.backgroundPositionX,positionY:frame.backgroundPositionY})))
  expect(frames.length).toBeGreaterThan(0)
  for(const frame of frames){expect(frame.opacity).toBeDefined();expect(frame.position).toBeUndefined();expect(frame.positionX).toBeUndefined();expect(frame.positionY).toBeUndefined()}
  await page.emulateMedia({reducedMotion:'reduce'})
  await expect(page.locator('h1 .gradient-shift')).toHaveCSS('opacity','0')
  if(browserName==='chromium') {
    await page.emulateMedia({forcedColors:'active'})
    await expect(page.locator('h1 .gradient-shift')).toHaveCSS('display','none')
  }
})
