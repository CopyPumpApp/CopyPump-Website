import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import { ErrorBoundary } from './components/ErrorBoundary'
import './styles/index.css'

export const SITE_RELEASE = '48.0.0'

// Locale is determined only by the URL. The root is always English.
document.documentElement.dataset.build = `v${SITE_RELEASE}`
console.info(`[CopyPump] v${SITE_RELEASE} premium runtime loaded`)
ReactDOM.createRoot(document.getElementById('root')!).render(<React.StrictMode><ErrorBoundary><App/></ErrorBoundary></React.StrictMode>)
