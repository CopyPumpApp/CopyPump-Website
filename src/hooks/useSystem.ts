import { useCallback, useEffect, useState } from 'react'
import { getPublicSystem } from '../lib/api'
import type { PublicSystemPayload } from '../lib/types'
import { useI18n } from '../i18n'

type StaticPublicStatus = Pick<PublicSystemPayload, 'stage' | 'network' | 'headline' | 'summary' | 'mainnetLocked' | 'websiteStatus' | 'gates' | 'roadmap'>

async function getStaticPublicSystem(): Promise<PublicSystemPayload> {
  const response = await fetch('/public-status.json', { cache: 'no-store' })
  if (!response.ok) throw new Error(`static_status_${response.status}`)
  const status = await response.json() as StaticPublicStatus
  return {
    ok: true,
    product: 'CopyPump',
    stage: status.stage,
    network: status.network,
    headline: status.headline,
    summary: status.summary,
    mainnetLocked: status.mainnetLocked !== false,
    websiteStatus: status.websiteStatus || 'PUBLIC',
    build: {
      fingerprint: '0'.repeat(64),
      commit: null,
      commitShort: null,
      builtAt: null,
      responseGeneratedAt: new Date().toISOString(),
      generatedAt: null,
      release: 'v47.1-publication-candidate-static',
    },
    runtime: { service: 'copypump-static-site' },
    gates: Array.isArray(status.gates) ? status.gates : [],
    roadmap: Array.isArray(status.roadmap) ? status.roadmap : [],
  }
}

export function useSystem() {
  const [data, setData] = useState<PublicSystemPayload | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [attempt, setAttempt] = useState(0)
  const { locale } = useI18n()
  const retry = useCallback(() => setAttempt(value => value + 1), [])
  useEffect(() => {
    let alive = true
    setLoading(true)
    setError(null)
    getPublicSystem()
      .catch(() => getStaticPublicSystem())
      .then(payload => { if (alive) { setData(payload); setError(null) } })
      .catch(err => { if (alive) { setData(null); setError(err instanceof Error ? err.message : String(err)) } })
      .finally(() => { if (alive) setLoading(false) })
    return () => { alive = false }
  }, [attempt, locale])
  return { data, loading, error, retry }
}
