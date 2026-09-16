import { readFile } from 'node:fs/promises'

const landing = await readFile(new URL('../src/pages/LandingPage.tsx', import.meta.url), 'utf8')
const rails = await readFile(new URL('../src/components/ProjectRails.tsx', import.meta.url), 'utf8')
const hero = await readFile(new URL('../src/components/HeroScene.tsx', import.meta.url), 'utf8')
const en = await readFile(new URL('../src/i18n/en.json', import.meta.url), 'utf8')
const ru = await readFile(new URL('../src/i18n/ru.json', import.meta.url), 'utf8')
const appCss = await readFile(new URL('../src/styles/app.css', import.meta.url), 'utf8')
const indexCss = await readFile(new URL('../src/styles/index.css', import.meta.url), 'utf8')
const uiCleanup = await readFile(new URL('../src/styles/ui-cleanup.css', import.meta.url), 'utf8')
const projectCss = await readFile(new URL('../src/styles/project-page.css', import.meta.url), 'utf8')
const mobileNav = await readFile(new URL('../src/styles/mobile-nav-hotfix.css', import.meta.url), 'utf8')
const failures = []

const requireText = (source, text, message) => { if (!source.includes(text)) failures.push(message) }
const forbidText = (source, text, message) => { if (source.includes(text)) failures.push(message) }

requireText(landing, 'https://discord.gg/WS95eXrGB', 'Landing page must use the current official Discord invite.')
requireText(landing, "navigateLocal('/project')", 'Landing page must link to the dedicated Project page.')
requireText(landing, 'decision-demo', 'Landing page must retain the interactive decision demo.')
requireText(landing, '<ProductStory/>', 'Recovered Product Story section must stay on Home.')
requireText(landing, 'ProjectRail variant="journey"', 'Recovered signal journey rail must stay on Home.')
requireText(landing, 'id="journal"', 'Recovered public Progress journal must stay on Home.')
requireText(landing, 'ProjectRail variant="roadmap"', 'Public roadmap rail must stay on Home.')
requireText(hero, 'detect-cutout-final-v47', 'Canonical uploaded Detect cutout must remain active.')
requireText(hero, 'qualify-cutout-final-v47', 'Canonical uploaded Qualify cutout must remain active.')
requireText(hero, 'constrain-cutout-final-v47', 'Canonical uploaded Constrain cutout must remain active.')
requireText(hero, 'execute-prove-cutout-final-v47', 'Canonical uploaded Execute/Prove cutout must remain active.')
requireText(appCss, 'copypump-global-market-background.png', 'Core cinematic canvas must keep the current CopyPump background asset until background forensics completes.')
requireText(uiCleanup, 'copypump-global-market-background.png', 'Home must keep the current CopyPump background asset until background forensics completes.')
requireText(projectCss, 'copypump-global-market-background.png', 'Project must keep the current CopyPump background asset until background forensics completes.')
requireText(indexCss, "@import './mobile-nav-hotfix.css';", 'Responsive navigation source of truth must remain imported until CSS consolidation phase.')
requireText(mobileNav, 'backdrop-filter:blur(10px) saturate(118%)', 'Mobile header must keep the light crystal blur until header reconstruction.')
requireText(mobileNav, 'backdrop-filter:blur(7px) saturate(112%)', 'Mobile menu must keep the light glass blur until menu visual reconstruction.')

forbidText(landing, 'Change the capital limit, signal age or emergency stop.', 'Decision demo must not render redundant operating instructions.')
forbidText(landing, 'Измените лимит капитала', 'Decision demo must not render redundant operating instructions.')
forbidText(landing, 'DNBQtqw6R', 'Stale Discord invite is still rendered.')
forbidText(landing, 'useSystem', 'Developer-facing website API status hook is still wired into the landing page.')
forbidText(landing, 'c.journal.updateTitle', 'Non-CopyPump ecosystem update is still rendered in public progress.')
forbidText(landing, 'PROJECT_STATUS.md', 'Developer source controls should not be rendered in the marketing flow.')
forbidText(landing, 'SECURITY_MODEL.md', 'Developer source controls should not be rendered in the marketing flow.')
forbidText(rails, 'github.com/CopyPumpApp/CopyPump/blob/main/docs/', 'Roadmap rail must not expose developer documentation controls in the marketing flow.')
forbidText(rails, 'ROADMAP.md', 'Roadmap rail must not expose a developer-document link.')
forbidText(rails, 'ARCHITECTURE.md', 'Roadmap rail must not expose a developer-document link.')
forbidText(`${en}\n${ru}`, 'CopyCube', 'CopyCube must remain completely absent from public EN/RU content.')
forbidText(appCss, 'copypump-cinematic-environment-v46', 'Stale v46 background references must never return to the active CSS cascade.')
forbidText(indexCss, 'premium-navigation.css', 'Superseded navigation stylesheet must not return to the CSS import graph.')

if (failures.length) {
  console.error('Public-site audit failed:')
  failures.forEach(item => console.error(`- ${item}`))
  process.exit(1)
}

console.log('Public-site audit passed.')
