import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import { ErrorBoundary } from './components/ErrorBoundary'
import './styles/index.css'

// Locale is determined only by the URL. The root is always English.
document.documentElement.dataset.build = 'v47.4-runtime'
console.info('[CopyPump] v47.4 premium-motion runtime loaded')
ReactDOM.createRoot(document.getElementById('root')!).render(<React.StrictMode><ErrorBoundary><App/></ErrorBoundary></React.StrictMode>)
