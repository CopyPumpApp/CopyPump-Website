import fs from 'node:fs/promises'
const exactAllowed=new Set(['src/content/project-status.generated.ts','public/public-status.json','public/agent-status.json','public/radar/index.json'])
const observation=/^public\/radar\/observations\/[a-z0-9-]+\.json$/
const changed=(process.env.CHANGED_FILES||'').split('\n').map(x=>x.trim()).filter(Boolean)
const violations=changed.filter(file=>!exactAllowed.has(file)&&!observation.test(file))
if(violations.length){console.error('CONTENT_ONLY_GUARD_BLOCKED');for(const file of violations)console.error(file);process.exit(1)}
const frozen=[/^src\/premium\//,/^src\/styles\//,/^src\/components\//,/^src\/pages\//,/^src\/i18n\//,/^src\/radar\/.*\.(css|tsx|ts)$/,/^public\/media\//,/^public\/fonts\//,/^src\/imports\//,/^public\/radar\/evidence\//]
for(const file of changed)if(frozen.some(pattern=>pattern.test(file))){console.error('CONTENT_ONLY_GUARD_CORE_UI_FREEZE_VIOLATION',file);process.exit(1)}
const generated=await fs.readFile('src/content/project-status.generated.ts','utf8')
for(const required of ['mainnetLocked: true','realDevnetTradingAccepted: false','sourceDate:','noteEn:','noteRu:','progressTitleEn:','progressCopyEn:','communityEn:','communityRu:','roadmapEn:','roadmapRu:'])if(!generated.includes(required)){console.error('CONTENT_ONLY_GUARD_MISSING_REQUIRED_SAFETY_FIELD',required);process.exit(1)}
for(const forbidden of [/guaranteed? profit/i,/mainnet (?:is )?(?:live|open|ready)/i,/real devnet trading (?:is )?(?:accepted|live|ready)/i,/join (?:our )?(?:beta|waitlist)/i])if(forbidden.test(generated)){console.error('CONTENT_ONLY_GUARD_UNSAFE_CLAIM',String(forbidden));process.exit(1)}
console.log('CONTENT_ONLY_GUARD_OK')
