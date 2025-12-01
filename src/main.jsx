import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import './index.css'
import App from './App.jsx'
import { I18nextProvider } from 'react-i18next'


import i18next from 'i18next'
import enTranslation from './translations/en/global.json'
import ruTranslation from './translations/ru/global.json'
import uzTranslation from './translations/uz/global.json'


// Retrieve the current language from localStorage or use 'uz' as the default
const currentLang = localStorage.getItem('currentLang') || 'uz'

i18next.init({
  interpolation: { escapeValue: false }, // Corrected the typo `intorpalation`
  lng: currentLang,
  resources: {
    en: {
      global: enTranslation,
    },
    ru: {
      global: ruTranslation,
    },
    uz: {
      global: uzTranslation,
    },
  },
})

createRoot(document.getElementById('root')).render(
  <StrictMode>
  <BrowserRouter>
    <I18nextProvider i18n={i18next}>
    <App />
    </I18nextProvider>
  </BrowserRouter>
  </StrictMode>,
)
