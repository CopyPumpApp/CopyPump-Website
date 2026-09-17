import type { CSSProperties } from 'react'

/** Semantic text once; the mask is stationary and only its inner layer moves. */
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
          style={{ '--ink-delay': `${i * -2}s` } as CSSProperties}>{line.text}</span>
      </span>
    </span>)}
  </Tag>
}
