import { Seo } from '../components/Seo'
import { useI18n } from '../i18n'
import { navigateLocal } from '../lib/motion'

export function NotFoundPage() {
  const { dict } = useI18n()
  const c = dict.common
  return (
    <div className="app-shell not-found-page">
      <Seo title={c.notFoundSeoTitle} description={c.notFoundSeoDescription} path={window.location.pathname} noIndex />
      
      <main id="main-content" tabIndex={-1} className="not-found-main">
        <div className="section-shell not-found-shell">
          <span className="micro-label">404 · COPY PUMP</span>
          <h1>{c.notFoundTitle}</h1>
          <p>{c.notFoundCopy}</p>
          <button className="button button--primary" type="button" onClick={() => navigateLocal('/')}>{c.backHome} →</button>
        </div>
      </main>
    </div>
  )
}
