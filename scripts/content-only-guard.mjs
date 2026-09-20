import fs from 'node:fs/promises'

const allowed = new Set([
  'src/content/project-status.generated.ts',
  'public/public-status.json',
])

const changed = (process.env.CHANGED_FILES || '')
  .split('\n')
  .map((x) => x.trim())
  .filter(Boolean)

const forbiddenPatterns = [
  /^src\/premium\/.*\.(css|tsx)$/,
  /^src\/styles\//,
  /^public\/media\//,
  /^public\/fonts\//,
  /^src\/imports\//,
]

const violations = changed.filter((file) =>
  !allowed.has(file) || forbiddenPatterns.some((pattern) => pattern.test(file)),
)

if (violations.length) {
  console.error('CONTENT_ONLY_GUARD_BLOCKED')
  for (const file of violations) console.error(file)
  process.exit(1)
}

const generated = await fs.readFile('src/content/project-status.generated.ts', 'utf8')
for (const required of ['mainnetLocked: true', 'realDevnetTradingAccepted: false', 'sourceDate:', 'noteEn:', 'noteRu:']) {
  if (!generated.includes(required)) {
    console.error('CONTENT_ONLY_GUARD_MISSING_REQUIRED_SAFETY_FIELD', required)
    process.exit(1)
  }
}

console.log('CONTENT_ONLY_GUARD_OK')
