import type { CSSProperties } from 'react'

/** One accessible text copy; the extra color layer is purely visual. */
export function KineticHeading({ as: Tag = 'h2', lines, id, className = '' }: {
  as?: 'h1' | 'h2' | 'h3'
  lines: Array<{ text: string; accent?: boolean }>
  id?: string
  className?: string
}) {
  return <Tag id={id} className={`kinetic-heading ${className}`}>
    {lines.map((line, i) => <span className="heading-mask" key={i}>
      <span className="heading-motion" data-reveal="heading" data-delay={i * 70}>
        <span className={line.accent ? 'heading-ink gradient-ink' : 'heading-ink'}
          data-gradient={line.accent ? '' : undefined}
          style={{ '--ink-delay': `${i * -2}s` } as CSSProperties}>{line.accent ? <><span className="gradient-base">{line.text}</span><span className="gradient-shift" aria-hidden="true">{line.text}</span></> : line.text}</span>
      </span>
    </span>)}
  </Tag>
}
