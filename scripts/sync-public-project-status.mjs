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

const clean = (value, max = 900) => String(value || '').replace(/\s+/g, ' ').trim().slice(0, max)
const esc = (value) => clean(value).replace(/\\/g, '\\\\').replace(/'/g, "\\'")
const summary = clean(m.summary)
const title = clean(m.title, 180)
if (summary.length < 40 || title.length < 8) throw new Error('PUBLIC_MILESTONE_COPY_TOO_THIN')

const lower = (title + ' ' + summary).toLowerCase()
const storageMilestone = /storage|receipt|archiv|price alert/.test(lower)
const progressTitleEn = storageMilestone ? 'Storage hardening cleared another gate.' : title
const progressTitleRu = storageMilestone ? 'Контур хранения прошёл ещё один этап.' : 'Публичное инженерное обновление CopyPump'
const communityEn = 'Follow the build, inspect the public record, and join the discussion if you care about bounded authority, execution safety or testing the assumptions behind CopyPump.'
const communityRu = 'Следите за разработкой, проверяйте публичные материалы и подключайтесь к обсуждению, если вам важны ограниченные полномочия, безопасность исполнения и проверка продуктовых гипотез CopyPump.'
const roadmapEn = storageMilestone
  ? [
      ['NEXT', 'Close the remaining Devnet execution-safety gates', 'Storage hardening moved forward. Real Devnet trading acceptance still depends on the remaining durable execution, recovery and verification gates.'],
      ['PROVE', 'Publish reviewable Devnet evidence', 'Release transaction, reconciliation and accounting evidence only after the relevant acceptance checks pass.'],
      ['AFTER THE GATES', 'Evaluate limited production readiness', 'Mainnet remains locked. Production preparation is conditional on separate evidence and approval.'],
    ]
  : [
      ['NEXT', 'Continue the verified engineering path', 'Use the latest public milestone as the current checkpoint and keep unresolved acceptance gates explicit.'],
      ['PROVE', 'Publish reviewable evidence', 'Release evidence and selected tests only after security, privacy and licensing review.'],
      ['AFTER THE GATES', 'Evaluate limited production readiness', 'Mainnet remains locked until the required verification gates pass.'],
    ]
const roadmapRu = storageMilestone
  ? [
      ['ДАЛЬШЕ', 'Закрыть оставшиеся контуры безопасности Devnet', 'Контур хранения продвинулся. Принятие реальной торговли в Devnet всё ещё зависит от оставшихся проверок долговечного исполнения, восстановления и верификации.'],
      ['ДОКАЗАТЬ', 'Опубликовать проверяемые данные Devnet', 'Публиковать данные транзакций, сверки и учёта только после прохождения соответствующих приёмочных проверок.'],
      ['ПОСЛЕ ПРОВЕРОК', 'Оценить ограниченную готовность к production', 'Mainnet остаётся заблокированным. Подготовка к production возможна только после отдельных подтверждений и решения.'],
    ]
  : [
      ['ДАЛЬШЕ', 'Продолжить проверяемый инженерный путь', 'Использовать последний публичный milestone как текущую точку и явно сохранять все незакрытые проверки.'],
      ['ДОКАЗАТЬ', 'Опубликовать проверяемые данные', 'Публиковать evidence и выбранные тесты только после проверки безопасности, приватности и лицензий.'],
      ['ПОСЛЕ ПРОВЕРОК', 'Оценить ограниченную готовность к production', 'Mainnet остаётся заблокированным до прохождения обязательных проверок.'],
    ]

const generated = `/**
 * AUTO-GENERATED PUBLIC-SAFE PROJECT CONTENT.
 * Content-only surface. Do not put layout, styling, animation or component logic here.
 */
export const PROJECT_STATUS_UPDATE = {
  sourceDate: '${esc(m.date)}',
  sourceUrl: 'https://github.com/CopyPumpApp/CopyPump',
  milestoneId: '${esc(m.id)}',
  titleEn: '${esc(title)}',
  titleRu: 'Публичное инженерное обновление CopyPump',
  noteEn: '${esc(summary)}',
  noteRu: 'Публичный инженерный статус обновлён по проверенному milestone. Это инженерный прогресс, а не заявление о готовности Mainnet. Реальная торговля в Devnet и LIVE_MAINNET меняются только при отдельном явном подтверждении.',
  progressTitleEn: '${esc(progressTitleEn)}',
  progressTitleRu: '${esc(progressTitleRu)}',
  progressCopyEn: '${esc(summary)}',
  progressCopyRu: 'Последний проверенный milestone отражён в публичном статусе. Это инженерный прогресс; реальная торговля в Devnet ещё не принята, а Mainnet остаётся заблокированным.',
  communityEn: '${esc(communityEn)}',
  communityRu: '${esc(communityRu)}',
  roadmapEn: ${JSON.stringify(roadmapEn)},
  roadmapRu: ${JSON.stringify(roadmapRu)},
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
status.community = {
  mode: 'BUILD_IN_PUBLIC',
  callToAction: communityEn,
  audience: ['testers', 'builders', 'researchers', 'crypto enthusiasts'],
}
status.roadmap = roadmapEn.map(([label, title, copy], index) => ({
  label, title, copy, phase: String(index + 1).padStart(2, '0'), state: index === 0 ? 'active' : 'future',
}))
await fs.writeFile('public/public-status.json', JSON.stringify(status, null, 2) + '\n')
console.log('PUBLIC_CONTENT_SYNCED', m.id)
