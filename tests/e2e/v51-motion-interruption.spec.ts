import {test,expect,type Page} from '@playwright/test'
async function tap(page:Page,touch:boolean){const node=page.locator('.menu-button'),r=await node.boundingBox();expect(r).not.toBeNull();const x=r!.x+r!.width/2,y=r!.y+r!.height/2;if(touch)await page.touchscreen.tap(x,y);else await page.mouse.click(x,y)}
const hasEntry=(page:Page)=>page.locator('.page-outlet').evaluate(node=>node.getAnimations().some(a=>(a.effect as KeyframeEffect).getKeyframes().some(f=>f.transform!==undefined)))

test('reopening navigation during page arrival cancels the page transform, not the menu',async({page,isMobile})=>{
 await page.goto('/ru');await tap(page,isMobile);await expect(page.locator('.mobile-nav')).toHaveAttribute('data-phase','open')
 await page.locator('.mobile-nav nav a[href="/ru/project"]').click();await expect(page.locator('.mobile-nav')).toHaveCount(0)
 await expect.poll(()=>hasEntry(page)).toBeTruthy()
 await tap(page,isMobile);await expect.poll(()=>hasEntry(page)).toBeFalsy()
 await expect(page.locator('.mobile-nav')).toHaveAttribute('data-phase','open')
 await expect(page.locator('.page-outlet')).toHaveCSS('opacity','0')
 await page.keyboard.press('Escape');await expect(page.locator('.mobile-nav')).toHaveCount(0)
 await expect(page.locator('.page-outlet')).toHaveCSS('opacity','1')
 expect(await page.locator('#root').evaluate(n=>(n as HTMLElement).inert)).toBeFalsy()
})
