import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import { ErrorBoundary } from './components/ErrorBoundary'
import './styles/index.css'

export const SITE_RELEASE = '47.4.0-review'

// Locale is determined only by the URL. The root is always English.
document.documentElement.dataset.build = SITE_RELEASE
console.info(`[CopyPump] ${SITE_RELEASE} premium stabilization runtime loaded`)
ReactDOM.createRoot(document.getElementById('root')!).render(<React.StrictMode><ErrorBoundary><App/></ErrorBoundary></React.StrictMode>)
