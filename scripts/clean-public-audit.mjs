import { readFileSync, existsSync, statSync } from 'node:fs'

const read = p => readFileSync(p, 'utf8')
const app = read('src/App.tsx')
const site = read('src/premium/Site.tsx')
const home = read('src/premium/HomePublicationContent.tsx')
const copy = read('src/premium/content.ts')
const generatedStatus = read('src/content/project-status.generated.ts')
const css = read('src/premium/premium.css')
const seo = read('src/components/Seo.tsx')
const robots = read('public/robots.txt')
const sitemap = read('public/sitemap.xml')
const securityTxt = read('public/.well-known/security.txt')
const failures = []
const must = (condition, message) => { if (!condition) failures.push(message) }

must(app.includes('PremiumLanding') && app.includes('PremiumProject') && app.includes('PremiumProgress'), 'Three explicit content destinations must remain active.')
must(!app.includes("from './pages/LandingPage'") && !app.includes("from './pages/ProjectPage'"), 'Legacy duplicate marketing sections must not return to the active graph.')
must(read('src/styles/index.css').trim() === "@import '../premium/premium.css';", 'Only one presentation system may be imported.')

for (const phrase of ['Technical alpha', 'Solana Devnet', "mainnet: 'locked'", 'PROJECT_STATUS.md', 'WS95eXrGB']) {
  must(copy.includes(phrase), `Public fact/source missing: ${phrase}`)
}
must(/sourceDate:\s*'20\\d{2}-\\d{2}-\\d{2}'/.test(generatedStatus), 'Generated public status must contain a dated sourceDate.')
must(generatedStatus.includes('mainnetLocked: true'), 'Generated public status must preserve the Mainnet lock.')
must(generatedStatus.includes('realDevnetTradingAccepted: false'), 'Generated public status must not imply accepted real Devnet trading.')
for (const term of ['CopyCube', 'RUN_FUP_TRUMP', 'Mizuzi', 'DNBQtqw6R']) {
  must(!`${site}\n${copy}`.includes(term), `Removed content returned: ${term}`)
}

const productAssets = [
  'earth-trading-900.webp',
  'earth-trading-1600.webp',
  ...['detect', 'qualify', 'constrain', 'execute-prove'].flatMap(name => [`${name}-480.webp`, `${name}-800.webp`]),
]
for (const asset of productAssets) must(existsSync(`public/media/v48/${asset}`), `Responsive asset missing: ${asset}`)

const sceneThemes = ['home', 'product', 'radar', 'progress', 'community', 'security', 'contact']
for (const theme of sceneThemes) {
  const path = `public/media/v51/scene-${theme}.webp`
  must(existsSync(path), `Scene asset missing: ${theme}`)
  if (existsSync(path)) must(statSync(path).size < 450000, `Scene asset exceeds 450 KB: ${theme}`)
}

must(copy.includes('earth-trading-1600.webp') && !copy.includes('cinematic-environment-v46'), 'Only the active Earth/trading-room artwork may be used.')
must(site.includes('experience-disclosure') && site.includes('policy-result') && site.includes('RadarTeaser'), 'Core production experience boundaries are missing.')
must(site.includes('BrandIcon') && site.includes('brandForUrl') && site.includes('previewScene'), 'Current branded navigation/runtime behavior is missing.')
must(css.includes('object-sweep-in') && css.includes('object-sweep-out') && css.includes('ink-wave'), 'Current directional motion primitives are missing.')
must(!css.replace(/backdrop-filter:[^;]+;/g, '').includes('filter:'), 'Unexpected CSS filter reintroduced into the production surface.')
must(site.includes('ILLUSTRATIVE') || copy.includes('ILLUSTRATIVE DATA'), 'The product illustration must not imply live trading.')

for (const name of ['HomeValueStrip', 'HomeControlStory', 'HomePipelineStory', 'HomeProductMap']) {
  must(site.includes('<' + name), `Home publication section missing: ${name}`)
}
for (const forbidden of ['lorem ipsum', 'example.com', 'localhost:', 'TODO', 'COMING SOON', 'guaranteed profit', 'guaranteed income', 'risk-free returns', 'Mainnet live']) {
  must(!`${site}\n${home}`.toLowerCase().includes(forbidden.toLowerCase()), `Placeholder/unsupported publication text found: ${forbidden}`)
}

must(seo.includes('link[rel="canonical"]'), 'Canonical SEO handling missing.')
must(seo.includes('hreflang'), 'Hreflang handling missing.')
must(seo.includes('og:image') && seo.includes('twitter:image'), 'Share image metadata missing.')
must(existsSync('public/og-card.webp'), 'OG share card missing.')
must(robots.includes('Sitemap:'), 'robots.txt must declare sitemap.')
must(securityTxt.includes('Contact: mailto:copypumphq@gmail.com'), 'security.txt contact is missing.')

for (const route of ['/', '/ru', '/project', '/ru/project', '/progress', '/ru/progress', '/privacy', '/ru/privacy', '/terms', '/ru/terms', '/security', '/ru/security', '/contact', '/ru/contact', '/radar', '/ru/radar']) {
  const url = 'https://copypump-website.copypumphq.workers.dev' + (route === '/' ? '/' : route)
  must(sitemap.includes('<loc>' + url + '</loc>'), `Sitemap route missing: ${route}`)
}

if (failures.length) {
  console.error(failures.join('\n'))
  process.exit(1)
}

console.log('Public claims, active assets, content architecture and publication audit passed.')
await import('./radar-audit.mjs')
