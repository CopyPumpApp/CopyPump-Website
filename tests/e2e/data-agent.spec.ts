import {test,expect} from '@playwright/test'
test('Radar shows a public data-agent heartbeat and frozen-core notice',async({page})=>{
  await page.goto('/radar')
  await expect(page.locator('.radar-agent-status')).toContainText('Data agent')
  await expect(page.locator('.radar-agent-status')).toContainText('Updates + Radar only')
  await expect(page.locator('.radar-agent-status')).toContainText('Core site UI')
})
test('Russian Radar shows the same autonomous boundary',async({page})=>{
  await page.goto('/ru/radar')
  await expect(page.locator('.radar-agent-status')).toContainText('Агент данных')
  await expect(page.locator('.radar-agent-status')).toContainText('Только обновления + Radar')
})
