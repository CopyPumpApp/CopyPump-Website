/* Runtime contract for the public project status rendered by the site. */
type Obj = Record<string, unknown>
const record = (v: unknown): v is Obj => Boolean(v) && typeof v === 'object' && !Array.isArray(v)
const strings = (o: Obj, keys: string[]) => keys.every(k => typeof o[k] === 'string')
const flags = (o: Obj, keys: string[]) => keys.every(k => typeof o[k] === 'boolean')
const optionalString = (v: unknown) => v == null || typeof v === 'string'
export function validatePayload(endpoint: string, value: unknown): boolean {
  if (!record(value)) return false
  if (endpoint === '/api/public/system') return flags(value,['ok','mainnetLocked']) && value.ok === true && strings(value,['product','stage','network','headline','summary']) && record(value.build) && strings(value.build,['fingerprint','responseGeneratedAt']) && /^[a-f0-9]{64}$/.test(String(value.build.fingerprint)) && optionalString(value.build.builtAt) && record(value.runtime) && strings(value.runtime,['service']) && Array.isArray(value.gates) && value.gates.every(g => record(g) && strings(g,['id','label','detail','status','tone'])) && Array.isArray(value.roadmap) && value.roadmap.every(r=>record(r) && strings(r,['phase','label','title','copy','state']))
  return false
}
