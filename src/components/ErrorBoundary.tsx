import React from 'react'
import en from '../i18n/en.json'
import ru from '../i18n/ru.json'

type State = { error: Error | null }

export class ErrorBoundary extends React.Component<React.PropsWithChildren, State> {
  state: State = { error: null }

  static getDerivedStateFromError(error: Error): State { return { error } }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error('[CopyPump] UI error boundary', error, info.componentStack)
  }

  render() {
    if (!this.state.error) return this.props.children
    const isRu = window.location.pathname === '/ru' || window.location.pathname.startsWith('/ru/')
    const copy = (isRu ? ru : en).common
    return (
      <main className="fatal-error" role="alert">
        <div className="fatal-error__card">
          <span className="micro-label">COPY PUMP · UI RECOVERY</span>
          <h1>{copy.fatalTitle}</h1>
          <p>{copy.fatalCopy}</p>
          <div className="fatal-error__actions">
            <button className="button button--primary" type="button" onClick={() => window.location.reload()}>{copy.reload}</button>
            <a className="button button--ghost" href={isRu ? '/ru/contact' : '/contact'}>{copy.contactAction}</a>
          </div>
        </div>
      </main>
    )
  }
}
