import { readFile } from 'node:fs/promises'

const landing = await readFile(new URL('../src/pages/LandingPage.tsx', import.meta.url), 'utf8')
const rails = await readFile(new URL('../src/components/ProjectRails.tsx', import.meta.url), 'utf8')
const failures = []

const requireText = (source, text, message) => {
  if (!source.includes(text)) failures.push(message)
}
const forbidText = (source, text, message) => {
  if (source.includes(text)) failures.push(message)
}

requireText(landing, 'https://discord.gg/WS95eXrGB', 'Landing page must use the current official Discord invite.')
requireText(landing, 'faqItems', 'Landing page must apply the public FAQ filter.')
requireText(landing, 'Change the capital limit, signal age or emergency stop.', 'Decision demo must explain how to interact with it.')
forbidText(landing, 'DNBQtqw6R', 'Stale Discord invite is still rendered.')
forbidText(landing, 'useSystem', 'Developer-facing website API status hook is still wired into the landing page.')
forbidText(landing, 'c.journal.updateTitle', 'Non-CopyPump ecosystem update is still rendered in public progress.')
forbidText(landing, 'PROJECT_STATUS.md', 'Developer source controls should not be rendered in the marketing flow.')
forbidText(landing, 'SECURITY_MODEL.md', 'Developer source controls should not be rendered in the marketing flow.')
forbidText(rails, 'github.com/CopyPumpApp/CopyPump/blob/main/docs/', 'Roadmap rail must not expose developer documentation controls in the marketing flow.')

if (failures.length) {
  console.error('Public-site audit failed:')
  failures.forEach(item => console.error(`- ${item}`))
  process.exit(1)
}

console.log('Public-site audit passed.')
