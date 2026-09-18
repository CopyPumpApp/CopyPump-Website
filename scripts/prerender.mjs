/** Deterministic SSG: React renders the same routes that hydrate in the browser. */
import {readFileSync,writeFileSync,mkdirSync,readdirSync} from 'node:fs'
import {dirname} from 'node:path'
import {createHash} from 'node:crypto'
import {render,metadata,PUBLIC_ORIGIN} from '../.ssr/entry-server.js'
const template=readFileSync('dist/index.html','utf8')
const index=JSON.parse(readFileSync('public/radar/index.json','utf8'))
const observations=index.items.map(x=>JSON.parse(readFileSync(`public/radar/observations/${x.id}.json`,'utf8')))
const branch=process.env.WORKERS_CI_BRANCH||process.env.GITHUB_HEAD_REF||process.env.GITHUB_REF_NAME||''
const preview=process.env.COPYPUMP_BUILD_TARGET?process.env.COPYPUMP_BUILD_TARGET!=='production':branch!=='main'
const routes=['/','/project','/progress','/radar','/privacy','/terms','/security','/contact',...observations.map(x=>`/radar/${x.id}`)]
const escape=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]))
const json=value=>JSON.stringify(value).replace(/</g,'\\u003c').replace(/\u2028/g,'\\u2028').replace(/\u2029/g,'\\u2029')
const metas=[]
for(const route of [...routes,...routes.map(x=>x==='/'?'/ru':'/ru'+x),'/404','/ru/404','/radar/404','/ru/radar/404']){
 const base=route.replace(/^\/ru(?=\/|$)/,'')||'/'
 const observation=observations.find(x=>base===`/radar/${x.id}`)
 const bootstrap={path:route,radarIndex:index,...(observation?{radarObservation:observation}:{})}
 const m=metadata(route,observation),app=await render(bootstrap)
 if(!app.includes('id="main-content"')||!app.includes('<h1'))throw new Error('Empty prerender '+route)
 let html=template.replace('<html lang="en">',`<html lang="${m.locale}" data-motion="off" data-motion-preference="off" data-initial-path="${escape(base)}">`)
 html=html.replace(/<title>.*?<\/title>/s,`<title>${escape(m.title)}</title>`)
 const values={'description':m.description,'robots':preview||m.noIndex?'noindex,follow':'index,follow','og:title':m.title,'og:description':m.description,'og:image':m.image,'og:image:alt':m.title,'twitter:title':m.title,'twitter:description':m.description,'twitter:image':m.image}
 for(const [key,value] of Object.entries(values))html=html.replace(new RegExp(`(<meta (?:name|property)="${key}" content=")[^"]*("[^>]*>)`),`$1${escape(value)}$2`)
 const alts=['en','ru','x-default'].map(lang=>{const p=lang==='ru'?(base==='/'?'/ru':'/ru'+base):base;return `<link rel="alternate" hreflang="${lang}" href="${PUBLIC_ORIGIN}${escape(p)}" />`}).join('')
 const head=`<link rel="canonical" href="${escape(m.canonical)}" /><meta property="og:url" content="${escape(m.canonical)}" /><meta property="og:locale" content="${m.locale==='ru'?'ru_RU':'en_US'}" />${m.noIndex?'':alts}`
 // Radar has route-split CSS; include it in initial HTML, not after the text is painted.
 const css=base.startsWith('/radar')?readdirSync('dist/assets').filter(x=>/^Radar-.*\.css$/.test(x)).map(x=>`<link rel="stylesheet" href="/assets/${x}" />`).join(''):''
 html=html.replace('</head>',head+css+'</head>')
 html=html.replace('<div id="root"></div>',`<div id="root" data-prerendered="true">${app}</div><script id="site-bootstrap" type="application/json">${json(bootstrap)}</script>`)
 html=html.replace(/<noscript>[\s\S]*?<\/noscript>/,'<noscript><p class="no-script-note">EN / RU: JavaScript enables menu, filters and swipe controls. Navigation links and the published information remain available.</p></noscript>')
 const file='dist'+(route==='/'?'/index':route)+'.html';mkdirSync(dirname(file),{recursive:true});writeFileSync(file,html)
 metas.push({route,file:file.slice(5),title:m.title,description:m.description,canonical:m.canonical,indexable:!m.noIndex,sha256:createHash('sha256').update(html).digest('hex')})
}
writeFileSync('dist/sitemap.xml','<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n'+metas.filter(m=>m.indexable).map(m=>`<url><loc>${m.canonical}</loc></url>`).join('\n')+'\n</urlset>\n')
writeFileSync('dist/robots.txt',`User-agent: *\nAllow: /\nDisallow: /api/\n${preview?'':`Sitemap: ${PUBLIC_ORIGIN}/sitemap.xml\n`}`)
const csp="default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; font-src 'self' data:; connect-src 'self'; object-src 'none'; base-uri 'self'; frame-ancestors 'none'; form-action 'none'"
const headers={'Content-Security-Policy':csp,'X-Content-Type-Options':'nosniff','X-Frame-Options':'DENY','Referrer-Policy':'strict-origin-when-cross-origin','Permissions-Policy':'camera=(), microphone=(), geolocation=(), payment=()','Cache-Control':'public, max-age=0, must-revalidate',...(preview?{'X-Robots-Tag':'noindex, follow'}:{})}
writeFileSync('dist/_headers','/*\n'+Object.entries(headers).map(([k,v])=>`  ${k}: ${v}`).join('\n')+'\n/assets/*\n  Cache-Control: public, max-age=31536000, immutable\n/radar/evidence/*\n  X-Robots-Tag: noindex\n/404\n  X-Robots-Tag: noindex\n/ru/404\n  X-Robots-Tag: noindex\n')
writeFileSync('dist/publication-manifest.json',JSON.stringify({release:'52.0.0-preview',branch:branch||'local',preview,origin:PUBLIC_ORIGIN,headers,routes:metas},null,2)+'\n')
console.log(`Generated ${metas.length} complete EN/RU documents. Target: ${preview?'preview / noindex':'production'}. No network calls.`)
