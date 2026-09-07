import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { registerSW } from 'virtual:pwa-register'
import '@ios27_design_system/react/styles.css'
import '@ios27_design_system/tokens/css'
import '@ios27_design_system/tokens/css/materials'
import '@ios27_design_system/tokens/css/typography'
import App from './App.tsx'
import './index.css'

registerSW({ immediate: true })

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
