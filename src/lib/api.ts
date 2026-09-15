import type { PublicSystemPayload } from './types'
import { validatePayload } from './contracts'

export class ApiError extends Error {
  constructor(readonly code: string, readonly status = 0) { super(code); this.name = code === 'request_timeout' ? 'TimeoutError' : 'ApiError' }
}
const DEFAULT_TIMEOUT_MS = 10_000
type RequestOptions = RequestInit & { timeoutMs?: number; retry?: number }

export async function requestJson<T>(url: string, options: RequestOptions = {}): Promise<T> {
  const { timeoutMs = DEFAULT_TIMEOUT_MS, retry = 0, signal, ...init } = options
  if (!Number.isFinite(timeoutMs) || timeoutMs < 1 || timeoutMs > 120000 || !Number.isFinite(retry) || retry < 0) throw new ApiError('invalid_request_options')
  for (let attempt = 0; ; attempt++) {
    const controller = new AbortController()
    const abort = () => controller.abort()
    signal?.addEventListener('abort', abort, { once: true })
    if (signal?.aborted) controller.abort()
    const timer = setTimeout(abort, timeoutMs)
    let retryable = false
    try {
      const response = await fetch(url, { credentials: 'include', ...init, signal: controller.signal })
      retryable = response.status >= 500
      if (!/\bapplication\/(?:[\w.+-]+\+)?json\b/i.test(response.headers.get('content-type') || '')) throw new ApiError('invalid_response', response.status)
      let payload: unknown
      try {
        if (!response.body) throw new ApiError('invalid_response', response.status)
        const reader=response.body.getReader(), chunks: Uint8Array[]=[];let size=0
        try {
          while (true) { const part=await reader.read();if (part.done) break;size+=part.value.length;if(size>2000000) throw new ApiError('response_too_large',response.status);chunks.push(part.value) }
        } finally { await reader.cancel().catch(()=>{});reader.releaseLock() }
        const bytes=new Uint8Array(size);let offset=0
        for(const chunk of chunks){bytes.set(chunk,offset);offset+=chunk.length}
        payload=JSON.parse(new TextDecoder().decode(bytes))
      } catch (e) { if (controller.signal.aborted || e instanceof ApiError) throw e;throw new ApiError('invalid_response', response.status) }
      if (!response.ok) {
        const code = typeof payload === 'object' && payload !== null && 'code' in payload ? String(payload.code) : `http_${response.status}`
        throw new ApiError(code, response.status)
      }
      if (!validatePayload(url.split('?')[0], payload)) throw new ApiError('invalid_response', response.status)
      return payload as T
    } catch (error) {
      if (signal?.aborted) throw new ApiError('request_cancelled')
      const timedOut = controller.signal.aborted
      const canRetry = attempt < Math.min(retry, 1) && (!init.method || init.method === 'GET') && (retryable || timedOut || error instanceof TypeError)
      if (!canRetry) throw timedOut ? new ApiError('request_timeout') : error
    } finally {
      clearTimeout(timer)
      signal?.removeEventListener('abort', abort)
    }
    await new Promise(resolve => setTimeout(resolve, 250 * (attempt + 1)))
  }
}
export async function getPublicSystem() { return requestJson<PublicSystemPayload>('/api/public/system', { retry: 1 }) }
