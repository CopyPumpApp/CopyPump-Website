import { readFile } from 'node:fs/promises'

const landing = await readFile(new URL('../src/pages/LandingPage.tsx', import.meta.url), 'utf8')
const project = await readFile(new URL('../src/pages/ProjectPage.tsx', import.meta.url), 'utf8')
const header = await readFile(new URL('../src/components/Header.tsx', import.meta.url), 'utf8')
const rails = await readFile(new URL('../src/components/ProjectRails.tsx', import.meta.url), 'utf8')
const hero = await readFile(new URL('../src/components/HeroScene.tsx', import.meta.url), 'utf8')
const en = await readFile(new URL('../src/i18n/en.json', import.meta.url), 'utf8')
const ru = await readFile(new URL('../src/i18n/ru.json', import.meta.url), 'utf8')
const indexCss = await readFile(new URL('../src/styles/index.css', import.meta.url), 'utf8')
const uiCleanup = await readFile(new URL('../src/styles/ui-cleanup.css', import.meta.url), 'utf8')
const responsiveNav = await readFile(new URL('../src/styles/responsive-navigation.css', import.meta.url), 'utf8')
const failures = []
const requireText = (source, text, message) => { if (!source.includes(text)) failures.push(message) }
const forbidText = (source, text, message) => { if (source.includes(text)) failures.push(message) }

requireText(landing, 'https://discord.gg/WS95eXrGB', 'Landing page must use the current official Discord invite.')
requireText(landing, "navigateLocal('/project')", 'Landing page must link to the dedicated Project page.')
requireText(landing, 'home-summary', 'Landing page must retain the concise project summary.')
requireText(landing, "points:['You keep custody.'", 'Landing page must use the intentionally compact product summary.')
forbidText(landing, '<ProductStory/>', 'Extended Product Story must not render on Home.')
forbidText(landing, '<DecisionExample/>', 'Extended decision demo must not render on Home.')
forbidText(landing, 'ProjectRail variant="journey"', 'Extended signal journey must not render on Home.')
forbidText(landing, 'ProjectRail variant="roadmap"', 'Extended roadmap must not render on Home.')
forbidText(landing, '<ProjectProgress/>', 'Extended progress section must not render on Home.')
forbidText(landing, 'project-availability', 'Extended availability copy must not return to Home.')

requireText(project, '<ProductStory/>', 'Project page must host the expanded Product Story.')
requireText(project, '<ProjectDetails/>', 'Project page must host expanded control details.')
requireText(project, '<DecisionExample/>', 'Project page must host the interactive decision demo.')
requireText(project, 'ProjectRail variant="journey"', 'Project page must host the signal journey.')
requireText(project, '<ProjectProgress/>', 'Project page must host public progress.')
requireText(project, 'ProjectRail variant="roadmap"', 'Project page must host the roadmap.')
requireText(project, 'id="questions"', 'Project page must host FAQ details.')

for (const anchor of ['product-story','learn-more','decision-demo','journey','journal','roadmap','questions']) requireText(header, anchor, `Menu must expose ${anchor}.`)

requireText(hero, 'detect-cutout-final-v47', 'Canonical uploaded Detect cutout must remain active.')
requireText(hero, 'qualify-cutout-final-v47', 'Canonical uploaded Qualify cutout must remain active.')
requireText(hero, 'constrain-cutout-final-v47', 'Canonical uploaded Constrain cutout must remain active.')
requireText(hero, 'execute-prove-cutout-final-v47', 'Canonical uploaded Execute/Prove cutout must remain active.')
forbidText(hero, 'requestIdleCallback', 'Hero must not eagerly prefetch the full heavy workflow asset set during idle time.')

requireText(uiCleanup, 'copypump-cinematic-environment-v46.webp', 'Desktop must use the responsive cinematic environment baseline.')
requireText(uiCleanup, 'copypump-cinematic-environment-v46-mobile.webp', 'Mobile must use its responsive cinematic environment baseline.')
requireText(uiCleanup, 'No decorative stripe dividers', 'Stripe-divider removal must remain explicit in the presentation layer.')
forbidText(uiCleanup, 'copypump-global-market-background.png', 'Legacy 3MB market background must not return to the active presentation layer.')

requireText(indexCss, "@import './responsive-navigation.css';", 'Canonical responsive navigation stylesheet must remain imported.')
forbidText(indexCss, 'mobile-nav-hotfix.css', 'Obsolete mobile navigation hotfix must not return to the CSS import graph.')
forbidText(indexCss, 'premium-navigation.css', 'Superseded navigation stylesheet must not return to the CSS import graph.')
requireText(responsiveNav, '.site-header .menu-button{display:block', 'Mobile menu trigger styles must remain explicit.')
requireText(responsiveNav, 'border:0!important;outline:0!important;border-radius:0!important;background:transparent!important;box-shadow:none!important', 'Mobile menu trigger must remain visually containerless, including focus outline.')
requireText(responsiveNav, 'html.nav-open .cinematic-v47 .site-header{visibility:hidden!important', 'Underlying header must be hidden while the full-screen menu is open.')
requireText(responsiveNav, '.mobile-nav nav{display:grid!important', 'Expanded menu destinations must remain visibly laid out.')
requireText(responsiveNav, 'html[data-motion="off"] .mobile-nav__backdrop', 'Opening the menu must not freeze its entrance animation on an invisible frame.')
requireText(responsiveNav, 'html[data-motion="off"] .mobile-nav__panel', 'Full-screen menu panel must stay visible while cinematic motion is paused.')
requireText(responsiveNav, '.menu-button.is-open span:first-child', 'Mobile menu trigger must keep the animated menu-to-X morph.')
requireText(responsiveNav, '.icon-button.is-open span:first-child', 'Mobile close control must keep the animated X state.')

forbidText(landing, 'DNBQtqw6R', 'Stale Discord invite is still rendered.')
forbidText(landing, 'useSystem', 'Developer-facing website API status hook is still wired into the landing page.')
forbidText(landing, 'PROJECT_STATUS.md', 'Developer source controls should not be rendered in the marketing flow.')
forbidText(landing, 'SECURITY_MODEL.md', 'Developer source controls should not be rendered in the marketing flow.')
forbidText(rails, 'github.com/CopyPumpApp/CopyPump/blob/main/docs/', 'Roadmap rail must not expose developer documentation controls in the marketing flow.')
forbidText(rails, 'ROADMAP.md', 'Roadmap rail must not expose a developer-document link.')
forbidText(rails, 'ARCHITECTURE.md', 'Roadmap rail must not expose a developer-document link.')
forbidText(`${en}\n${ru}`, 'CopyCube', 'CopyCube must remain completely absent from public EN/RU content.')

if (failures.length) {
  console.error('Public-site audit failed:')
  failures.forEach(item => console.error(`- ${item}`))
  process.exit(1)
}
console.log('Public-site audit passed.')
