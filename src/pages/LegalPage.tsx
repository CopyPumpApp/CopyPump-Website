import { Seo } from '../components/Seo'
import { navigateLocal } from '../lib/motion'
import { useI18n } from '../i18n'

export type LegalPageKind = 'privacy' | 'terms' | 'security' | 'contact'
type LegalSection = { heading: string; paragraphs: string[]; bullets?: string[] }
export function LegalPage({ kind }: { kind: LegalPageKind }) {
  const { dict, locale } = useI18n()
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
          {kind === 'privacy' && <section className="legal-section">
            <h2>{locale === 'ru' ? 'Сохранённые наблюдения Radar' : 'Saved Radar observations'}</h2>
            <p>{locale === 'ru'
              ? 'По вашему выбору браузер сохраняет идентификаторы избранных наблюдений и номера прочитанных редакций. Эти данные не отправляются на сервер CopyPump и не синхронизируются между устройствами. Вкладки одного браузера могут разделять подборку.'
              : 'Your browser stores saved observation IDs and read revision numbers to support your selections. These values are not sent to a CopyPump server and are not synchronized across devices. Tabs in the same browser may share this selection.'}</p>
            <p>{locale === 'ru'
              ? 'Наблюдение можно убрать из сохранённого его кнопкой. Удаление данных этого сайта в настройках браузера очищает подборку и отметки прочтения; закрытие приватного сеанса также может удалить их. Если хранилище недоступно, сайт показывает предупреждение и сохраняет выбор только на время текущей сессии.'
              : 'Use an observation’s save button to remove it. Clearing this site’s browser storage removes both saved selections and read markers; private-session data may also disappear when that session closes. If storage is unavailable, the website displays a notice and keeps the selection only for the current session.'}</p>
          </section>}
          {page.sections.map((section: LegalSection) => <section className="legal-section" key={section.heading}>
            <h2>{section.heading}</h2>
            {section.paragraphs.map(p => <p key={p}>{p}</p>)}
            {section.bullets && <ul>{section.bullets.map(item => <li key={item}>{item}</li>)}</ul>}
          </section>)}
        </div>
        <p className="legal-updated">{kind === 'privacy' ? (locale === 'ru' ? 'Последнее обновление: 17 сентября 2026 года.' : 'Last updated: 17 September 2026.') : meta.updated}</p>
      </div>
    </main>
  </div>
}
