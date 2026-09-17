/** Source declarations can be lost by minification; test the actual shipped CSS. */
import {readFileSync, readdirSync} from 'node:fs'
import assert from 'node:assert/strict'
const files=readdirSync('dist/assets').filter(name=>name.endsWith('.css'))
assert.ok(files.length, 'No built stylesheets found')
const css=files.map(name=>readFileSync(`dist/assets/${name}`,'utf8')).join('\n')
const rules=[...css.matchAll(/([^{}]+)\{([^{}]*)\}/g)]
const canopy=rules.filter(([,selector])=>/\.site-header\[data-scrolled=(?:true|"true"|'true')\]::?before/.test(selector))
assert.ok(canopy.some(([, ,body])=>/(?:^|;)\s*backdrop-filter:\s*blur\(12px\)(?:;|$)/.test(body)), 'Built header lost its standard backdrop-filter declaration')
assert.ok(canopy.some(([, ,body])=>/(?:^|;)\s*-webkit-backdrop-filter:\s*blur\(12px\)(?:;|$)/.test(body)), 'Built header lost its WebKit backdrop-filter declaration')
console.log('Built CSS: standard and WebKit header blur declarations preserved.')
