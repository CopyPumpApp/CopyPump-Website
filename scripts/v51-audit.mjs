import {readFileSync,statSync} from 'node:fs'
import {createHash} from 'node:crypto'
import assert from 'node:assert/strict'
const read=p=>readFileSync(p,'utf8'),site=read('src/premium/Site.tsx'),css=read('src/premium/premium.css')
const manifest=JSON.parse(read('public/media/v51/manifest.json'))
assert.equal(createHash('sha256').update(readFileSync('public/'+manifest.source)).digest('hex'),manifest.sourceSha256)
assert.deepEqual(manifest.scenes.map(s=>s.theme),['home','product','radar','progress','community','security','contact'])
assert.equal(new Set(manifest.scenes.map(s=>s.sha256)).size,7)
for(const scene of manifest.scenes){const bytes=readFileSync('public/media/v51/'+scene.file);assert.equal(createHash('sha256').update(bytes).digest('hex'),scene.sha256);assert.equal(scene.width,1672);assert.equal(scene.height,941);assert.ok(bytes.length<450000)}
assert.ok(!site.includes('signal-record')&&!site.includes('art-coordinate')&&!site.includes('instrument-heading'))
assert.ok(site.includes('experience-disclosure')&&site.includes('policy-result')&&site.includes('RadarTeaser'))
assert.ok(site.includes('BrandIcon')&&site.includes('brandForUrl')&&site.includes('previewScene'))
assert.ok(css.includes('object-sweep-in')&&css.includes('object-sweep-out')&&css.includes('ink-wave'))
assert.ok(css.includes('z-index:100;background:transparent;'))
assert.ok(!css.includes('backdrop-filter')&&!css.includes('filter:blur'))
console.log('V51: all seven same-source scenes, directional motion, transparency and simplified Home checked.')
