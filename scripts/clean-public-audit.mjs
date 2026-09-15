import { readFile } from 'node:fs/promises'

const landing = await readFile(new URL('../src/pages/LandingPage.tsx', import.meta.url), 'utf8')
const failures = []

const requireText = (text, message) => {
  if (!landing.includes(text)) failures.push(message)
}
const forbidText = (text, message) => {
  if (landing.includes(text)) failures.push(message)
}

requireText('https://discord.gg/WS95eXrGB', 'Landing page must use the current official Discord invite.')
requireText('faqItems', 'Landing page must apply the public FAQ filter.')
requireText('Change the capital limit, signal age or emergency stop.', 'Decision demo must explain how to interact with it.')
forbidText('DNBQtqw6R', 'Stale Discord invite is still rendered.')
forbidText('useSystem', 'Developer-facing website API status hook is still wired into the landing page.')
forbidText('c.journal.updateTitle', 'Non-CopyPump ecosystem update is still rendered in public progress.')
forbidText('PROJECT_STATUS.md', 'Developer source controls should not be rendered in the marketing flow.')
forbidText('SECURITY_MODEL.md', 'Developer source controls should not be rendered in the marketing flow.')

if (failures.length) {
  console.error('Public-site audit failed:')
  failures.forEach(item => console.error(`- ${item}`))
  process.exit(1)
}

console.log('Public-site audit passed.')
