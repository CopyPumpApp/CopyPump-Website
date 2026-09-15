export type SystemGate = {
  id: string
  label: string
  detail: string
  status: string
  tone: 'good' | 'warn' | 'locked' | string
}

export type RoadmapItem = {
  phase: string
  label: string
  title: string
  copy: string
  state: 'active' | 'next' | 'future' | string
}

export type PublicSystemPayload = {
  ok: boolean
  product: string
  stage: string
  network: string
  headline: string
  summary: string
  mainnetLocked: boolean
  websiteStatus?: string
  build: {
    fingerprint: string
    commit: string | null
    commitShort: string | null
    builtAt: string | null
    responseGeneratedAt: string
    generatedAt?: string | null
    release?: string
  }
  runtime: {
    service: string
  }
  gates: SystemGate[]
  roadmap: RoadmapItem[]
}
