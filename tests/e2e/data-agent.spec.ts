import {test,expect} from '@playwright/test'

test('Radar does not expose operator-only agent telemetry in the public interface',async({page})=>{
  await page.goto('/radar')
  await expect(page.locator('.radar-agent-status')).toHaveCount(0)
  const status=await page.request.get('/agent-status.json')
  expect(status.ok()).toBeTruthy()
  const data=await status.json()
  expect(data.mode).toBe('AUTONOMOUS_DATA_ONLY')
  expect(data.guard.coreUiFrozen).toBe(true)
})

test('home surfaces the latest verified engineering update',async({page})=>{
  await page.goto('/ru')
  await expect(page.locator('.status-current .eyebrow')).toContainText('ПОСЛЕДНЕЕ ПОДТВЕРЖДЁННОЕ ОБНОВЛЕНИЕ')
  await expect(page.locator('.status-current')).toContainText('Контур хранения прошёл ещё один этап')
})
