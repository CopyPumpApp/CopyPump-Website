const MODEL = process.env.KIMI_MODEL || 'kimi-k2.6'
const EXPLICIT_API_BASE = String(process.env.KIMI_API_BASE || '').trim().replace(/\/$/, '')
const API_BASES = EXPLICIT_API_BASE
  ? [EXPLICIT_API_BASE]
  : ['https://api.moonshot.ai/v1', 'https://api.moonshot.cn/v1']
const MAX_ATTEMPTS = Math.max(1, Math.min(4, Number(process.env.KIMI_MAX_ATTEMPTS || 2)))
const REQUEST_TIMEOUT_MS = Math.max(5000, Math.min(60000, Number(process.env.KIMI_REQUEST_TIMEOUT_MS || 45000)))
const RETRYABLE = new Set([408, 409, 425, 429, 500, 502, 503, 504])

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms))
const region = (base) => base.includes('.ai') ? 'international' : base.includes('.cn') ? 'china' : 'custom'

function retryDelay(attempt, response) {
  const retryAfter = Number(response?.headers?.get?.('retry-after'))
  if (Number.isFinite(retryAfter) && retryAfter > 0) return Math.min(15000, retryAfter * 1000)
  return Math.min(12000, 1200 * (2 ** Math.max(0, attempt - 1)))
}

function parseMaybeJson(text) {
  try { return JSON.parse(text) } catch { return null }
}

async function postOnBase(apiBase, path, apiKey, body) {
  let lastError
  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt += 1) {
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS)
    let response
    try {
      response = await fetch(`${apiBase}${path}`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
        signal: controller.signal,
      })
      const rawText = await response.text()
      const payload = parseMaybeJson(rawText)
      if (!response.ok) {
        const error = new Error(`Kimi ${path} HTTP ${response.status}: ${String(rawText).slice(0, 500)}`)
        error.status = response.status
        error.transient = RETRYABLE.has(response.status)
        error.apiBase = apiBase
        lastError = error
        if (!error.transient || attempt === MAX_ATTEMPTS) throw error
        await sleep(retryDelay(attempt, response))
        continue
      }
      return { payload: payload ?? rawText, rawText, apiBase, apiRegion: region(apiBase) }
    } catch (error) {
      if (error?.name === 'AbortError') {
        lastError = Object.assign(new Error(`Kimi ${path} timed out after ${REQUEST_TIMEOUT_MS}ms`), { transient: true, apiBase })
      } else {
        lastError = error
        if (typeof lastError?.transient !== 'boolean') lastError.transient = error instanceof TypeError
      }
      if (!lastError?.transient || attempt === MAX_ATTEMPTS) throw lastError
      await sleep(retryDelay(attempt, response))
    } finally {
      clearTimeout(timeout)
    }
  }
  throw lastError || new Error(`Kimi ${path} failed`)
}

async function requestAcrossRegions(path, apiKey, body) {
  if (!apiKey) throw new Error('KIMI_API_KEY is missing.')
  let lastError
  for (const apiBase of API_BASES) {
    try {
      return await postOnBase(apiBase, path, apiKey, body)
    } catch (error) {
      lastError = error
      if (!EXPLICIT_API_BASE && (error?.status === 401 || error?.status === 403 || error?.status === 404)) continue
      if (!EXPLICIT_API_BASE && error?.transient) continue
      throw error
    }
  }
  throw lastError || new Error(`Kimi ${path} failed on all configured API regions`)
}

export async function searchPro(apiKey, request) {
  const response = await requestAcrossRegions('/tools/search_pro', apiKey, request)
  const payload = response.payload
  const results = Array.isArray(payload?.search_results)
    ? payload.search_results
    : Array.isArray(payload?.data?.search_results)
      ? payload.data.search_results
      : Array.isArray(payload?.results)
        ? payload.results
        : []
  return { results, apiRegion: response.apiRegion }
}

function firstText(...values) {
  for (const value of values) if (typeof value === 'string' && value.trim()) return value.trim()
  return ''
}

export async function fetchWebPage(apiKey, url) {
  const response = await requestAcrossRegions('/tools/fetch', apiKey, { url })
  const p = response.payload
  if (typeof p === 'string') {
    return { title: '', markdown: p.trim(), apiRegion: response.apiRegion }
  }
  const data = p?.data && typeof p.data === 'object' ? p.data : {}
  const result = p?.result && typeof p.result === 'object' ? p.result : {}
  const title = firstText(p?.title, data?.title, result?.title)
  const markdown = firstText(
    p?.markdown, p?.content, p?.text, p?.body,
    data?.markdown, data?.content, data?.text, data?.body,
    result?.markdown, result?.content, result?.text, result?.body,
  )
  if (!markdown) throw new Error('Kimi Web Fetch returned no readable page body.')
  return { title, markdown, apiRegion: response.apiRegion }
}

function extractJson(text) {
  const cleaned = String(text || '').replace(/\`\`\`json/gi, '').replace(/\`\`\`/g, '').trim()
  const start = cleaned.indexOf('{')
  const end = cleaned.lastIndexOf('}')
  if (start < 0 || end <= start) throw new Error(`Kimi did not return JSON: ${cleaned.slice(0, 500)}`)
  return JSON.parse(cleaned.slice(start, end + 1))
}

export async function callKimiJson(apiKey, prompt, { maxOutputTokens = 2200 } = {}) {
  const response = await requestAcrossRegions('/chat/completions', apiKey, {
    model: MODEL,
    messages: [
      {
        role: 'system',
        content: 'Return exactly one valid JSON object. Do not use Markdown fences. Never invent facts or sources. If evidence is insufficient, set publish to false.',
      },
      { role: 'user', content: prompt },
    ],
    thinking: { type: 'disabled' },
    max_tokens: maxOutputTokens,
    stream: false,
  })
  const payload = response.payload
  const rawText = String(payload?.choices?.[0]?.message?.content || '').trim()
  return {
    result: extractJson(rawText),
    rawText,
    model: payload?.model || MODEL,
    apiRegion: response.apiRegion,
  }
}
