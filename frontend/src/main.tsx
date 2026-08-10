import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './styles/index.css'
import { initializeApp } from './services/healthService'
import { initializeGA } from './services/analytics'

// Wake up the backend server (non-blocking)
// This helps with cold starts on services like Render, Railway, etc.
initializeApp();

// Initialize Google Analytics (respects cookie consent)
initializeGA();

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)