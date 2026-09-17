import {readFileSync,readdirSync} from 'node:fs'
import assert from 'node:assert/strict'
const manifest=JSON.parse(readFileSync('dist/publication-manifest.json','utf8'))
assert.equal(manifest.routes.length,26)
for(const route of manifest.routes){
 const html=readFileSync('dist/'+route.file,'utf8')
 assert.ok(html.includes('data-prerendered="true"'),route.route)
 assert.equal((html.match(/<h1(?:\s|>)/g)||[]).length,1,route.route+' must have one h1')
 assert.ok(html.includes('rel="canonical" href="'+route.canonical+'"'))
 assert.ok(html.includes('content="'+(manifest.preview||!route.indexable?'noindex,follow':'index,follow')+'"'))
 assert.ok(!html.includes('<!--$!-->'),'No server bailout '+route.route)
 assert.ok(html.includes('site-bootstrap'))
 if(route.route==='/ru')for(const phrase of ['публичный валидатор','Задачи системы','Сверка','Devnet'])assert.ok(html.includes(phrase),phrase)
 if(route.route.includes('/radar/')&&route.indexable)assert.ok(html.includes('radar-narrative'),'Radar articles must be in raw HTML')
}
const css=readdirSync('dist/assets').filter(x=>x.endsWith('.css')).map(x=>readFileSync('dist/assets/'+x)).reduce((n,b)=>n+b.length,0)
assert.ok(css<90000,'Combined compiled CSS budget')
assert.ok(readFileSync('dist/_headers','utf8').includes("frame-ancestors 'none'"))
assert.ok(readFileSync('dist/sitemap.xml','utf8').includes('/ru/contact'))
console.log('Publication: complete 26-route HTML, both locales, Radar evidence text, canonical metadata and header plan verified.')
