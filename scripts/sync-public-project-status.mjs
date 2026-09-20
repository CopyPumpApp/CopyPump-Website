import fs from 'node:fs/promises'

const input = process.argv[2]
if (!input) throw new Error('SOURCE_FILE_REQUIRED')
const envelope = JSON.parse(await fs.readFile(input, 'utf8'))
const raw = Buffer.from(String(envelope.content || '').replace(/\n/g, ''), 'base64').toString('utf8')
const feed = JSON.parse(raw)
if (!Array.isArray(feed.milestones)) throw new Error('INVALID_MILESTONE_FEED')

const candidates = feed.milestones
  .filter((m) => m && m.status === 'verified' && m.publicSafe === true && m.announce === true && Number(m.importance || 0) >= 8)
  .sort((a, b) => String(b.date || '').localeCompare(String(a.date || '')))
const m = candidates[0]
if (!m) {
  console.log('NO_VERIFIED_PUBLIC_STATUS_UPDATE')
  process.exit(0)
}
if (!Array.isArray(m.constraints) || !m.constraints.some((x) => /Mainnet|mainnet/.test(String(x)))) {
  throw new Error('PUBLIC_MILESTONE_MISSING_MAINNET_CONSTRAINT')
}

const esc = (value) => String(value || '').replace(/\\/g, '\\\\').replace(/'/g, "\\'").replace(/\r?\n/g, ' ')
const summary = esc(m.summary)
const title = esc(m.title)
const ruNote = 'Публичный инженерный статус обновлён по проверенному milestone. ' +
  'Это инженерный прогресс, а не заявление о готовности Mainnet. Реальная торговля в Devnet и LIVE_MAINNET меняются только при отдельном явном подтверждении.'

const generated = `/**
 * AUTO-GENERATED PUBLIC-SAFE PROJECT STATUS.
 * Content-only surface. Do not put layout, styling, animation or component logic here.
 */
export const PROJECT_STATUS_UPDATE = {
  sourceDate: '${esc(m.date)}',
  sourceUrl: 'https://github.com/CopyPumpApp/CopyPump',
  milestoneId: '${esc(m.id)}',
  titleEn: '${title}',
  titleRu: 'Публичное инженерное обновление CopyPump',
  noteEn: '${summary}',
  noteRu: '${esc(ruNote)}',
  mainnetLocked: true,
  realDevnetTradingAccepted: false,
} as const
`
await fs.mkdir('src/content', { recursive: true })
await fs.writeFile('src/content/project-status.generated.ts', generated)

const status = JSON.parse(await fs.readFile('public/public-status.json', 'utf8'))
status.sourceUpdatedAt = String(m.date)
status.mainnetLocked = true
status.latestMilestone = {
  id: String(m.id),
  title: String(m.title),
  summary: String(m.summary),
  status: 'VERIFIED_ENGINEERING_PROGRESS',
  realDevnetTradingAccepted: false,
  mainnetLocked: true,
}
await fs.writeFile('public/public-status.json', JSON.stringify(status, null, 2) + '\n')
console.log('PUBLIC_STATUS_SYNCED', m.id)
