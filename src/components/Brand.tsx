import officialMark from '../imports/CopyPump_Official_Mark.webp'
import { navigateLocal } from '../lib/motion'
import { useI18n } from '../i18n'

export function Brand({ compact = false }: { compact?: boolean }) {
  const { dict, pathFor } = useI18n()
  return (
    <a className={`brand ${compact ? 'brand--compact' : ''}`} href={pathFor('/')} aria-label={dict.common.home} onClick={(event) => { event.preventDefault(); navigateLocal('/') }}>
      <span className="brand__mark-wrap" aria-hidden="true">
        <img className="brand__mark" src={officialMark} alt="" />
      </span>
      <span className="brand__word"><strong>Copy</strong><em>Pump</em></span>
    </a>
  )
}
