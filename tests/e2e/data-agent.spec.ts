import {test,expect} from '@playwright/test'

test('Radar exposes a compact data-only agent line in the existing editorial style',async({page})=>{
  await page.goto('/radar')
  const status=page.locator('.radar-agent-status')
  await expect(status).toContainText('DATA AGENT')
  await expect(status).toContainText('RADAR')
  await expect(status).toContainText('DATA-ONLY')
  await expect(status).not.toHaveCSS('background-color','rgb(7, 19, 31)')
})

test('Russian Radar exposes the same compact autonomous boundary',async({page})=>{
  await page.goto('/ru/radar')
  const status=page.locator('.radar-agent-status')
  await expect(status).toContainText('АГЕНТ ДАННЫХ')
  await expect(status).toContainText('ТОЛЬКО ДАННЫЕ')
})

test('home surfaces the latest verified engineering update',async({page})=>{
  await page.goto('/ru')
  await expect(page.locator('.status-current .eyebrow')).toContainText('ПОСЛЕДНЕЕ ПОДТВЕРЖДЁННОЕ ОБНОВЛЕНИЕ')
  await expect(page.locator('.status-current')).toContainText('Контур хранения прошёл ещё один этап')
})
