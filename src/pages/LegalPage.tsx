import { Seo } from '../components/Seo'
import { navigateLocal } from '../lib/motion'
import { useI18n } from '../i18n'

export type LegalPageKind = 'privacy' | 'terms' | 'security' | 'contact'
type LegalSection = { heading: string; paragraphs: string[]; bullets?: string[] }
export function LegalPage({ kind }: { kind: LegalPageKind }) {
  const { dict } = useI18n()
  const page = dict.legal[kind]
  const meta = dict.legal._meta
  return <div className="app-shell legal-page">
    <Seo title={`${page.title} — CopyPump`} description={page.description} path={`/${kind}`} />
    
    <main id="main-content" tabIndex={-1} className="legal-main">
      <div className="section-shell legal-shell">
        <button className="text-link legal-back" onClick={() => navigateLocal('/')}>← {meta.back}</button>
        <div className="eyebrow">{page.eyebrow}</div>
        <h1>{page.title}</h1>
        <p className="legal-intro">{page.intro}</p>
        <div className="legal-sections">
          {page.sections.map((section: LegalSection) => <section className="legal-section" key={section.heading}>
            <h2>{section.heading}</h2>
            {section.paragraphs.map(p => <p key={p}>{p}</p>)}
            {section.bullets && <ul>{section.bullets.map(item => <li key={item}>{item}</li>)}</ul>}
          </section>)}
        </div>
        <p className="legal-updated">{meta.updated}</p>
      </div>
    </main>
    
  </div>
}
