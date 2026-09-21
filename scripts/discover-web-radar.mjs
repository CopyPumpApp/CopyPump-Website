import fs from 'node:fs/promises'
import crypto from 'node:crypto'
import { callKimiJson, fetchWebPage, searchPro } from './kimi-web.mjs'

const ROOT = 'public/radar'
const STATUS_PATH = '.content-agent/radar-discovery.json'
const DAILY_CAP = 4
const MIN_INTERVAL_MS = 5.5 * 3600_000
const IMPORTANCE_THRESHOLD = 72
const MAX_WEB_AGE_MS = 4 * 24 * 3600_000
const SEARCH_LIMIT = 6
const FETCH_LIMIT = 6
const now = new Date()
const nowIso = now.toISOString()
const API_KEY = String(process.env.KIMI_API_KEY || process.env.MOONSHOT_API_KEY || '').trim()

await fs.mkdir('.content-agent', { recursive: true })
const writeStatus = (value) => fs.writeFile(STATUS_PATH, JSON.stringify({
  schemaVersion: 1,
  checkedAt: nowIso,
  source: 'Kimi Web Search Pro + Web Fetch',
  importanceThreshold: IMPORTANCE_THRESHOLD,
  ...value,
}, null, 2) + '\n')

const localized = (en, ru) => ({ en, ru })
const dateOnly = (date) => date.toISOString().slice(0, 10)
const startDate = new Date(now.getTime() - 2 * 24 * 3600_000)

function safeHttpsUrl(input) {
  try {
    const url = new URL(String(input || ''))
    if (url.protocol !== 'https:' || url.username || url.password) return null
    const host = url.hostname.toLowerCase()
    if (!host || host === 'localhost' || host.endsWith('.local')) return null
    if (/^(?:10|127|169\.254|192\.168)\./.test(host)) return null
    if (/^172\.(?:1[6-9]|2\d|3[01])\./.test(host)) return null
    if (host === '::1' || host.startsWith('fc') || host.startsWith('fd') || host.startsWith('fe80:')) return null
    url.hash = ''
    for (const key of [...url.searchParams.keys()]) {
      if (/^(utm_|ref$|source$|campaign$|mc_)/i.test(key)) url.searchParams.delete(key)
    }
    return url.toString()
  } catch {
    return null
  }
}

const blockedHosts = new Set([
  'x.com', 'twitter.com', 'www.reddit.com', 'reddit.com', 'youtube.com', 'www.youtube.com',
  't.me', 'telegram.me', 'medium.com',
])
const preferredHosts = new Set([
  'solana.com', 'anza.xyz', 'jito.network', 'jup.ag', 'raydium.io', 'pump.fun',
  'circle.com', 'www.circle.com', 'visa.com', 'www.visa.com', 'stripe.com', 'www.stripe.com',
  'coinbase.com', 'www.coinbase.com', 'sec.gov', 'www.sec.gov', 'cftc.gov', 'www.cftc.gov',
  'reuters.com', 'www.reuters.com', 'bloomberg.com', 'www.bloomberg.com',
  'coindesk.com', 'www.coindesk.com', 'theblock.co', 'www.theblock.co',
  'blockworks.co', 'www.blockworks.co', 'github.com',
])

function authorityScore(value) {
  if (typeof value === 'number' && Number.isFinite(value)) {
    return value <= 1 ? Math.max(0, Math.min(20, value * 20)) : Math.max(0, Math.min(20, value))
  }
  const text = String(value || '').toLowerCase()
  if (/very.?high|highest|authoritative|official/.test(text)) return 20
  if (/high|strong/.test(text)) return 16
  if (/medium|moderate/.test(text)) return 10
  if (/low|weak/.test(text)) return 3
  return 7
}

function freshnessScore(date) {
  const at = Date.parse(String(date || ''))
  if (!Number.isFinite(at)) return 5
  const age = Math.max(0, Date.now() - at)
  if (age <= 12 * 3600_000) return 25
  if (age <= 24 * 3600_000) return 21
  if (age <= 48 * 3600_000) return 16
  if (age <= 72 * 3600_000) return 10
  return 3
}

function candidateScore(result, rank) {
  const url = safeHttpsUrl(result?.url)
  if (!url) return -Infinity
  const host = new URL(url).hostname.toLowerCase()
  if (blockedHosts.has(host)) return -Infinity
  const chunks = Array.isArray(result?.chunks) ? result.chunks.filter(x => typeof x?.text === 'string' && x.text.trim()) : []
  const sourceBoost = preferredHosts.has(host) ? 22 : 8
  const contentBoost = chunks.length ? 12 : result?.snippet ? 6 : 0
  const rankBoost = Math.max(0, 12 - rank * 2)
  return sourceBoost + contentBoost + rankBoost + authorityScore(result?.authority) + freshnessScore(result?.date)
}

function compactText(value, max = 1800) {
  return String(value || '').replace(/\s+/g, ' ').trim().slice(0, max)
}

function titleTokens(value) {
  return new Set(String(value || '').toLowerCase().replace(/[^a-z0-9а-яё]+/gi, ' ').split(/\s+/).filter(x => x.length > 3))
}

function titleSimilarity(a, b) {
  const A = titleTokens(a), B = titleTokens(b)
  if (!A.size || !B.size) return 0
  let same = 0
  for (const token of A) if (B.has(token)) same += 1
  return same / Math.min(A.size, B.size)
}

function slug(value) {
  const base = String(value || '').toLowerCase().normalize('NFKD')
    .replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 52)
  return base || 'ecosystem-update'
}

function isLocalized(value) {
  return value && typeof value.en === 'string' && value.en.trim() && typeof value.ru === 'string' && value.ru.trim()
}

function cleanLocalized(value, max = 1400) {
  return {
    en: compactText(value?.en, max),
    ru: compactText(value?.ru, max),
  }
}

function eventIso(value, candidates) {
  const direct = Date.parse(String(value || ''))
  if (Number.isFinite(direct)) return new Date(direct).toISOString()
  const dates = candidates.map(x => Date.parse(String(x.date || ''))).filter(Number.isFinite)
  return dates.length ? new Date(Math.max(...dates)).toISOString() : nowIso
}

try {
  if (!API_KEY) {
    await writeStatus({ state: 'unavailable', reason: 'KIMI_API_KEY_MISSING', published: false })
    console.warn('RADAR_WEB_UNAVAILABLE KIMI_API_KEY_MISSING')
    process.exit(0)
  }

  const index = JSON.parse(await fs.readFile(ROOT + '/index.json', 'utf8'))
  const webItems = (index.items || []).filter(x => x.sourceKind === 'web')
  const webPublishTimes = webItems.map(x => Date.parse(x.publishedAt)).filter(Number.isFinite)
  const webLast24h = webPublishTimes.filter(x => Date.now() - x < 24 * 3600_000).length
  const lastWeb = Math.max(0, ...webPublishTimes)

  if (webLast24h >= DAILY_CAP) {
    await writeStatus({ state: 'held', reason: 'DAILY_CAP_4', published: false, publishedLast24h: webLast24h })
    console.log('RADAR_WEB_HELD daily-cap=4')
    process.exit(0)
  }
  if (lastWeb && Date.now() - lastWeb < MIN_INTERVAL_MS) {
    await writeStatus({ state: 'held', reason: 'CADENCE_6H', published: false, publishedLast24h: webLast24h })
    console.log('RADAR_WEB_HELD cadence=6h')
    process.exit(0)
  }

  const knownUrls = new Set()
  const knownTitles = []
  for (const item of webItems) {
    knownTitles.push(item.title?.en || '')
    try {
      const doc = JSON.parse(await fs.readFile(`${ROOT}/observations/${item.id}.json`, 'utf8'))
      for (const source of doc.sources || []) {
        const canonical = safeHttpsUrl(source.url)
        if (canonical) knownUrls.add(canonical)
      }
    } catch {}
  }

  const today = dateOnly(now)
  const yesterday = dateOnly(new Date(now.getTime() - 24 * 3600_000))
  const queries = [
    `${yesterday} ${today} Solana network validator client infrastructure upgrade outage official announcement`,
    `${yesterday} ${today} Solana DeFi Jupiter Raydium Pump.fun trading launch infrastructure official announcement`,
    `${yesterday} ${today} Solana security exploit vulnerability incident wallet protocol official update`,
    `${yesterday} ${today} Solana payments stablecoin institutional adoption regulation official announcement`,
  ]

  const collected = []
  const regions = new Set()
  for (const query of queries) {
    try {
      const response = await searchPro(API_KEY, {
        text_query: query,
        limit: SEARCH_LIMIT,
        timeout_seconds: 30,
        time_window: { start: dateOnly(startDate), end: today },
      })
      regions.add(response.apiRegion)
      response.results.forEach((result, rank) => {
        const url = safeHttpsUrl(result?.url)
        const score = candidateScore(result, rank)
        if (!url || !Number.isFinite(score) || knownUrls.has(url)) return
        if (knownTitles.some(title => titleSimilarity(title, result?.title) >= 0.72)) return
        collected.push({
          url,
          title: compactText(result?.title, 300),
          site: compactText(result?.site_name || new URL(url).hostname, 120),
          date: compactText(result?.date, 40),
          authority: result?.authority ?? null,
          snippet: compactText(result?.snippet, 1200),
          chunks: (Array.isArray(result?.chunks) ? result.chunks : []).slice(0, 3).map(chunk => ({
            text: compactText(chunk?.text, 1600),
            score: Number.isFinite(Number(chunk?.score)) ? Number(chunk.score) : null,
          })).filter(chunk => chunk.text),
          discoveryScore: Math.round(score),
          query,
        })
      })
    } catch (error) {
      console.warn('RADAR_WEB_SEARCH_QUERY_FAILED', compactText(error?.message || error, 220))
    }
  }

  const unique = []
  const byUrl = new Map()
  for (const candidate of collected) {
    const prior = byUrl.get(candidate.url)
    if (!prior || candidate.discoveryScore > prior.discoveryScore) byUrl.set(candidate.url, candidate)
  }
  unique.push(...byUrl.values())
  unique.sort((a, b) => b.discoveryScore - a.discoveryScore)

  if (!unique.length) {
    await writeStatus({ state: 'ok', reason: 'NO_FRESH_SEARCH_RESULTS', published: false, publishedLast24h: webLast24h, apiRegions: [...regions] })
    console.log('RADAR_WEB_NO_FRESH_SEARCH_RESULTS')
    process.exit(0)
  }

  const shortlist = unique.slice(0, 12)
  for (const candidate of shortlist.slice(0, FETCH_LIMIT)) {
    try {
      const fetched = await fetchWebPage(API_KEY, candidate.url)
      regions.add(fetched.apiRegion)
      candidate.fetchedTitle = compactText(fetched.title, 300)
      candidate.fetchedMarkdown = compactText(fetched.markdown, 6500)
    } catch (error) {
      candidate.fetchError = compactText(error?.message || error, 180)
    }
  }

  const evidence = shortlist.map((candidate, index) => ({
    index: index + 1,
    title: candidate.title,
    url: candidate.url,
    site: candidate.site,
    date: candidate.date,
    authority: candidate.authority,
    discoveryScore: candidate.discoveryScore,
    snippet: candidate.snippet,
    chunks: candidate.chunks,
    fetchedTitle: candidate.fetchedTitle || '',
    fetchedMarkdown: candidate.fetchedMarkdown || '',
  }))

  const prompt = `You are the evidence editor for CopyPump Radar, a Solana automation infrastructure project.

Choose at most ONE genuinely important, fresh story from the supplied Search Pro and Web Fetch evidence. This is a public website update for non-specialist visitors.

Publication rules:
- The event must materially affect Solana infrastructure, DeFi/trading infrastructure, security, payments/stablecoins, ecosystem access, or regulation with a clear Solana connection.
- Prefer primary/official sources and high-authority reporting.
- A normal product promotion, token-price move, opinion post, rumor, influencer claim, or recycled old story is NOT enough.
- Require corroboration from at least two different source hostnames in the supplied evidence. If that is not possible, set publish=false.
- Use only facts directly supported by the supplied evidence. Do not infer motives, wallet ownership, profitability, investment returns, or future price direction.
- importanceScore is 0-100. Set publish=true only if importanceScore is at least ${IMPORTANCE_THRESHOLD}.
- Write for a normal visitor: lead with what happened, then why it matters. Avoid raw transaction jargon unless essential.
- English summary MUST contain the exact marker "Why it matters for CopyPump:".
- Russian summary MUST contain the exact marker "Почему это важно для CopyPump:".
- sourceUrls must contain 2-4 exact URLs copied from the evidence, ordered primary source first when possible.
- topic must be exactly one of NETWORK, SECURITY, DEFI, PAYMENTS, ECOSYSTEM, REGULATION.
- eventDate must be an ISO date/time or YYYY-MM-DD supported by the evidence.

Return exactly this JSON shape:
{
  "publish": true,
  "importanceScore": 0,
  "topic": "ECOSYSTEM",
  "eventDate": "2026-09-21",
  "sourceUrls": ["https://...", "https://..."],
  "title": {"en": "...", "ru": "..."},
  "summary": {"en": "... Why it matters for CopyPump: ...", "ru": "... Почему это важно для CopyPump: ..."},
  "facts": [
    {"en": "...", "ru": "..."},
    {"en": "...", "ru": "..."}
  ],
  "interpretation": {"en": "...", "ru": "..."},
  "unknowns": [
    {"en": "...", "ru": "..."},
    {"en": "...", "ru": "..."}
  ],
  "reason": "short internal selection reason"
}

Current UTC time: ${nowIso}
Evidence:
${JSON.stringify(evidence)}
`

  const editorial = await callKimiJson(API_KEY, prompt, { maxOutputTokens: 2400 })
  regions.add(editorial.apiRegion)
  const selected = editorial.result || {}

  if (selected.publish !== true || Number(selected.importanceScore) < IMPORTANCE_THRESHOLD) {
    await writeStatus({
      state: 'ok',
      reason: 'NO_STORY_ABOVE_THRESHOLD',
      published: false,
      importanceScore: Number(selected.importanceScore) || 0,
      candidates: shortlist.length,
      publishedLast24h: webLast24h,
      apiRegions: [...regions],
    })
    console.log('RADAR_WEB_NO_STORY_ABOVE_THRESHOLD score=' + (Number(selected.importanceScore) || 0))
    process.exit(0)
  }

  if (!isLocalized(selected.title) || !isLocalized(selected.summary) || !isLocalized(selected.interpretation)) throw new Error('EDITORIAL_LOCALIZED_FIELDS_INVALID')
  if (!Array.isArray(selected.facts) || selected.facts.length < 2 || !selected.facts.every(isLocalized)) throw new Error('EDITORIAL_FACTS_INVALID')
  if (!Array.isArray(selected.unknowns) || selected.unknowns.length < 2 || !selected.unknowns.every(isLocalized)) throw new Error('EDITORIAL_LIMITS_INVALID')
  if (!selected.summary.en.includes('Why it matters for CopyPump:') || !selected.summary.ru.includes('Почему это важно для CopyPump:')) throw new Error('EDITORIAL_SUMMARY_MARKER_MISSING')

  const topics = new Set(['NETWORK', 'SECURITY', 'DEFI', 'PAYMENTS', 'ECOSYSTEM', 'REGULATION'])
  const topic = topics.has(selected.topic) ? selected.topic : 'ECOSYSTEM'
  const candidateByUrl = new Map(shortlist.map(candidate => [candidate.url, candidate]))
  const selectedUrls = [...new Set((Array.isArray(selected.sourceUrls) ? selected.sourceUrls : []).map(safeHttpsUrl).filter(Boolean))]
    .filter(url => candidateByUrl.has(url))
    .slice(0, 4)
  const selectedHosts = new Set(selectedUrls.map(url => new URL(url).hostname.toLowerCase()))
  if (selectedUrls.length < 2 || selectedHosts.size < 2) throw new Error('EDITORIAL_REQUIRES_TWO_INDEPENDENT_SOURCE_HOSTS')

  const observedAt = eventIso(selected.eventDate, selectedUrls.map(url => candidateByUrl.get(url)))
  const observedMs = Date.parse(observedAt)
  if (!Number.isFinite(observedMs) || observedMs > Date.now() + 24 * 3600_000 || Date.now() - observedMs > MAX_WEB_AGE_MS) {
    throw new Error('EDITORIAL_EVENT_DATE_OUTSIDE_FRESHNESS_WINDOW')
  }

  const sourceKey = selectedUrls.join('|')
  const suffix = crypto.createHash('sha256').update(sourceKey).digest('hex').slice(0, 8)
  const id = `web-${slug(selected.title.en)}-${suffix}`.slice(0, 80).replace(/-+$/g, '')
  if ((index.items || []).some(item => item.id === id)) {
    await writeStatus({ state: 'held', reason: 'DUPLICATE_STORY_ID', published: false, id, publishedLast24h: webLast24h })
    console.log('RADAR_WEB_DUPLICATE', id)
    process.exit(0)
  }

  const ordinal = String((index.items || []).length + 1).padStart(2, '0')
  const topicRu = {
    NETWORK: 'СЕТЬ', SECURITY: 'БЕЗОПАСНОСТЬ', DEFI: 'DEFI',
    PAYMENTS: 'ПЛАТЕЖИ', ECOSYSTEM: 'ЭКОСИСТЕМА', REGULATION: 'РЕГУЛИРОВАНИЕ',
  }[topic]
  const sources = selectedUrls.map((url, index) => {
    const candidate = candidateByUrl.get(url)
    const label = candidate?.title || candidate?.site || new URL(url).hostname
    return {
      id: `web-${index + 1}`,
      label: localized(label, label),
      url,
      checkedAt: nowIso,
    }
  })
  const sourceIds = sources.map(source => source.id)
  const observation = {
    id,
    version: 1,
    sourceKind: 'web',
    sourceLabel: localized('WEB / VERIFIED SOURCES', 'WEB / ПРОВЕРЕННЫЕ ИСТОЧНИКИ'),
    category: localized(`${topic} UPDATE / ${ordinal}`, `${topicRu} / ${ordinal}`),
    title: cleanLocalized(selected.title, 320),
    summary: cleanLocalized(selected.summary, 1500),
    facts: selected.facts.slice(0, 5).map(value => cleanLocalized(value, 1400)),
    interpretation: cleanLocalized(selected.interpretation, 1800),
    unknowns: selected.unknowns.slice(0, 4).map(value => cleanLocalized(value, 1200)),
    publishedAt: nowIso,
    updatedAt: nowIso,
    observedAt,
    lastCheckedAt: nowIso,
    followUps: 0,
    sources,
    revisions: [{
      version: 1,
      at: nowIso,
      kind: 'initial',
      title: localized('Verified web update', 'Проверенное веб-обновление'),
      text: localized(
        `Selected from fresh Search Pro results and checked against ${sources.length} independent source hosts before publication. Importance score: ${Math.round(Number(selected.importanceScore))}/100.`,
        `Материал выбран из свежих результатов Search Pro и перед публикацией сверен по ${sources.length} независимым источникам. Оценка значимости: ${Math.round(Number(selected.importanceScore))}/100.`,
      ),
      sourceIds,
    }],
  }

  const observationPath = `${ROOT}/observations/${id}.json`
  await fs.writeFile(observationPath, JSON.stringify(observation, null, 2) + '\n', { flag: 'wx' })
  const summaryFields = ['id', 'version', 'sourceKind', 'sourceLabel', 'publishedAt', 'updatedAt', 'observedAt', 'lastCheckedAt', 'title', 'summary', 'category', 'followUps']
  const item = Object.fromEntries(summaryFields.map(field => [field, observation[field]]))
  index.edition = String((Number(index.edition) || 0) + 1).padStart(2, '0')
  index.publishedAt = nowIso
  index.items = [item, ...(index.items || [])]
  await fs.writeFile(ROOT + '/index.json', JSON.stringify(index, null, 2) + '\n')

  await writeStatus({
    state: 'ok',
    published: true,
    id,
    importanceScore: Math.round(Number(selected.importanceScore)),
    topic,
    sourceCount: sources.length,
    sourceHosts: [...selectedHosts],
    candidates: shortlist.length,
    publishedLast24h: webLast24h,
    apiRegions: [...regions],
    model: editorial.model,
  })
  console.log('RADAR_WEB_PUBLISHED', id, 'score=' + Math.round(Number(selected.importanceScore)), 'sources=' + sources.length)
} catch (error) {
  await writeStatus({ state: 'unavailable', published: false, detail: compactText(error?.message || error, 240) })
  console.warn('RADAR_WEB_UNAVAILABLE', compactText(error?.message || error, 240))
}
