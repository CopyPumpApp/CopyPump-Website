import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import { ErrorBoundary } from './components/ErrorBoundary'
import pkg from '../package.json'
import './styles/index.css'

export const SITE_RELEASE = pkg.version

// Locale is determined only by the URL. The root is always English.
document.documentElement.dataset.build = SITE_RELEASE
console.info(`[CopyPump] ${SITE_RELEASE} public website runtime loaded`)
ReactDOM.createRoot(document.getElementById('root')!).render(<React.StrictMode><ErrorBoundary><App/></ErrorBoundary></React.StrictMode>)
