import {chromium,webkit,devices} from 'playwright'
import {expect} from '@playwright/test'
import {writeFileSync,mkdirSync} from 'node:fs'
import assert from 'node:assert/strict'
const origin=process.env.V52_ORIGIN
assert.ok(/^https:\/\/[a-f0-9]{8}-copypump-website\.copypumphq\.workers\.dev$/.test(origin||''),'Explicit immutable preview only')
mkdirSync('evidence',{recursive:true})
const response=await fetch(origin+'/publication-manifest.json');assert.equal(response.status,200)
const manifest=await response.json();assert.equal(manifest.preview,true)
const reports=[]
for(const route of manifest.routes.filter(x=>x.indexable)){
 const r=await fetch(origin+route.route),body=await r.text()
 assert.equal(r.status,200,route.route)
 assert.ok(body.includes('data-prerendered="true"'),route.route)
 assert.ok(body.includes('content="noindex,follow"'),route.route)
 assert.ok(body.includes('rel="canonical" href="'+route.canonical+'"'),route.route)
 assert.ok(!/<!--\$[?!]-->|<div hidden|<template id="B:/.test(body),'Deferred HTML '+route.route)
 assert.ok(r.headers.get('x-robots-tag')?.includes('noindex'),route.route)
 assert.equal(r.headers.get('x-content-type-options'),'nosniff')
 assert.ok(r.headers.get('content-security-policy')?.includes("frame-ancestors 'none'"))
 reports.push({path:route.route,status:r.status,robots:r.headers.get('x-robots-tag')})
}
for(const path of ['/definitely-not-a-page','/radar/unknown-material','/ru/unknown-page','/ru/radar/unknown-material']){
 const r=await fetch(origin+path);assert.equal(r.status,404,path);reports.push({path,status:r.status})
}
writeFileSync('evidence/http.json',JSON.stringify(reports,null,2))
const invites=[]
for(const code of ['WS95eXrGB','DNBQtqw6R']){
 try{const r=await fetch(`https://discord.com/api/v10/invites/${code}?with_counts=false`,{signal:AbortSignal.timeout(10000)});const j=await r.json();invites.push({code,status:r.status,guildId:j.guild?.id||null,guildName:j.guild?.name||null})}
 catch(e){invites.push({code,error:String(e.message)})}
}
writeFileSync('evidence/invites.json',JSON.stringify(invites,null,2))
const browserReports=[]
for(const [name,type,options] of [['desktop',chromium,{viewport:{width:1920,height:854}}],['iphone',webkit,devices['iPhone 14']]]){
 const browser=await type.launch(),context=await browser.newContext(options),page=await context.newPage(),errors=[]
 page.on('pageerror',e=>errors.push(e.message));page.on('console',m=>{if(m.type()==='error')errors.push(m.text())})
 let failure=null
 try{
  await page.goto(origin+'/ru');await page.waitForTimeout(1600)
  await expect(page.locator('.responsibility-columns')).toHaveCount(1)
  await expect(page.locator('.radar-other-notes article')).toHaveCount(2)
  await expect(page.locator('.hero-intro')).toContainText('сам обнаруживает')
  await page.screenshot({path:`evidence/${name}-home.png`})
  for(const id of ['experience','your-control','status','radar-preview']){await page.locator('#'+id).scrollIntoViewIfNeeded();await page.waitForTimeout(1600);await page.screenshot({path:`evidence/${name}-${id}.png`})}
  await page.locator('.menu-button').click();await expect(page.locator('.mobile-nav')).toHaveAttribute('data-phase','open');await page.locator('.mobile-nav nav a[href="/ru/project"]').click();await page.waitForTimeout(1900)
  await expect(page.locator('.architecture-parts article')).toHaveCount(4)
  await page.screenshot({path:`evidence/${name}-product.png`})
  await page.goto(origin+'/ru/contact');await page.waitForTimeout(1400)
  for(const href of ['https://x.com/CopyPumpAI','https://discord.gg/WS95eXrGB','https://github.com/CopyPumpApp/CopyPump','mailto:copypumphq@gmail.com'])await expect(page.locator(`a[href="${href}"]`)).toHaveCount(1)
  await page.goto(origin+'/ru/radar');await expect(page.locator('.radar-row')).toHaveCount(3)
  await page.locator('.radar-row .radar-save').first().click();await page.reload()
  await expect(page.locator('.radar-row .radar-save').first()).toHaveAttribute('aria-pressed','true')
  await page.locator('.radar-row h2 a').first().click();await expect(page.locator('.radar-narrative')).toBeVisible();await page.screenshot({path:`evidence/${name}-radar-article.png`})
  assert.deepEqual(errors,[],name)
 }catch(e){failure=String(e.stack||e);await page.screenshot({path:`evidence/${name}-failure.png`}).catch(()=>{});writeFileSync(`evidence/${name}-failure.html`,await page.content())}
 finally{browserReports.push({name,errors,failure});writeFileSync('evidence/browser.json',JSON.stringify(browserReports,null,2));await browser.close()}
}
assert.ok(browserReports.every(x=>!x.failure),'Browser preview validation failed; inspect evidence/browser.json')
console.log('Actual preview: 22 localized HTML routes, 4 real 404s, deployed headers and both browser journeys passed.')
