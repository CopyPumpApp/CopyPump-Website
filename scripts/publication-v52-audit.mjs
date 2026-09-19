import {readFileSync,existsSync} from 'node:fs'
const read=p=>readFileSync(p,'utf8')
const site=read('src/premium/Site.tsx')
const home=read('src/premium/HomePublicationContent.tsx')
const seo=read('src/components/Seo.tsx')
const robots=read('public/robots.txt')
const sitemap=read('public/sitemap.xml')
const marker=read('public/release-marker.txt')
const failures=[]
const must=(condition,message)=>{if(!condition)failures.push(message)}
const full=site+'\n'+home

for(const name of ['HomeValueStrip','HomeControlStory','HomePipelineStory','HomeProductMap'])must(site.includes('<'+name),'Home publication scene missing: '+name)
for(const phrase of ['Automatic discovery','Qualification before capital','User-defined boundaries','Emergency stop','Discover','Reconcile','Mainnet trading'])must(home.includes(phrase),'Publication content missing: '+phrase)
must(site.includes('<RadarTeaser/>'),'Radar digest must remain on Home.')
must(site.includes('status-current'),'Current verification target must remain visible on Home.')
must(marker.includes('v52 preview'),'Release marker must identify the v52 preview.')

const detailed=[
  'Set the maximum capital an individual action may use.',
  'Bound acceptable execution conditions.',
  'Constrain the position and portfolio exposure',
  'Recovery must respect the current user policy',
]
for(const phrase of detailed)must(!home.includes(phrase),'Detailed Product copy duplicated into Home: '+phrase)

for(const forbidden of ['lorem ipsum','example.com','localhost:','TODO','COMING SOON','guaranteed profit','guaranteed income','risk-free returns','Mainnet live'])must(!full.toLowerCase().includes(forbidden.toLowerCase()),'Placeholder/unsupported publication text found: '+forbidden)

must(seo.includes('link[rel="canonical"]'),'Canonical SEO handling missing.')
must(seo.includes('hreflang'),'Hreflang handling missing.')
must(seo.includes('og:image')&&seo.includes('twitter:image'),'Share image metadata missing.')
must(existsSync('public/og-card.webp'),'OG share card missing.')
must(robots.includes('Sitemap:'),'robots.txt must declare sitemap.')
for(const route of ['/','/ru','/project','/ru/project','/progress','/ru/progress','/privacy','/ru/privacy','/terms','/ru/terms','/security','/ru/security','/contact','/ru/contact','/radar','/ru/radar']){
  const url='https://copypump-website.copypumphq.workers.dev'+(route==='/'?'/':route)
  must(sitemap.includes('<loc>'+url+'</loc>'),'Sitemap route missing: '+route)
}

if(failures.length){console.error(failures.join('\n'));process.exit(1)}
console.log('V52 publication content, SEO/share and placeholder audit passed.')
