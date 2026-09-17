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
assert.ok(rules.some(([,selector,body])=>/\.site-header::?before/.test(selector)&&/(?:^|;)z-index:0(?:;|$)/.test(body)), 'Readability canopy must paint above the page, not in a negative stack')
assert.ok(rules.some(([,selector,body])=>selector.includes('.site-header__inner')&&/(?:^|;)z-index:1(?:;|$)/.test(body)), 'Header controls must remain above the canopy')
console.log('Built CSS: both header blur declarations and explicit foreground stacking verified.')
