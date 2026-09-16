import { useI18n } from '../i18n'

export function ProjectProgress(){
  const{dict}=useI18n(),c=dict.studio
  const entries=[[c.journal.currentLabel,c.journal.currentTitle,c.journal.currentText],[c.journal.nextLabel,c.journal.nextTitle,c.journal.nextText],[c.journal.lockedLabel,c.journal.lockedTitle,c.journal.lockedText]]
  return <section id="journal" className="journal-section" aria-labelledby="journal-title"><div className="section-shell journal-layout"><div className="journal-heading" data-reveal="0" data-reveal-kind="title"><span className="eyebrow">{c.journal.eyebrow}</span><h2 id="journal-title">{c.journal.title}<br/><em>{c.journal.accent}</em></h2><p>{c.journal.intro}</p><div className="journal-date"><time dateTime={c.journal.dateIso}>{c.journal.date}</time><small>{c.journal.dated}</small></div></div><div className="journal-entries">{entries.map(([label,title,copy],i)=><article key={label} data-reveal={String(i*90)}><span className={`journal-dot dot-${i}`} aria-hidden="true"/><span className="eyebrow">{label}</span><h3>{title}</h3><p>{copy}</p></article>)}</div></div></section>
}
