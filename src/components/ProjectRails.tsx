import { useI18n } from '../i18n'
import { AutoRail } from './AutoRail'

export function ProjectRail({ variant }: { variant: 'journey' | 'roadmap' }) {
  const { dict, locale } = useI18n(), c = dict.explore[variant]
  const titleId = `${variant}-title`
  return <section id={variant} className={`project-rail-section project-rail-section--${variant}`} aria-labelledby={titleId}>
    <div className="section-shell">
      <div className="rail-section-heading" data-reveal="0" data-reveal-kind="title"><div><span className="eyebrow">{c.eyebrow}</span><h2 id={titleId}>{c.title}<br/><em>{c.accent}</em></h2></div><p>{c.intro}</p></div>
      <AutoRail id={`${variant}-rail`} label={c.label} hint={dict.explore.hint} speed={locale === 'ru' ? 16 : variant === 'journey' ? 22 : 18}>
        {c.items.map((item, i) => <article className={`rail-item rail-item--${variant}`} key={i} role="listitem">
          <div className="rail-item-top"><span className="rail-item-number" aria-hidden="true">0{i + 1}</span><span className="eyebrow">{item.tag}</span></div>
          <h3>{item.title}</h3><p>{item.text}</p>
          <div className="rail-item-outcome"><span>{item.output}</span><small>{item.detail}</small></div>
        </article>)}
      </AutoRail>
      <div className="rail-source-row"><p>{c.note}</p></div>
    </div>
  </section>
}
