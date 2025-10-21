import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

import translationFR from './locales/fr.json';
import translationEN from './locales/en.json';
import translationES from './locales/es.json';
import translationIT from './locales/it.json';
import translationPT from './locales/pt.json';
import translationDE from './locales/de.json';
import translationZH from './locales/zh.json';
import translationJA from './locales/ja.json';

const resources = {
  fr: { translation: translationFR },
  en: { translation: translationEN },
  es: { translation: translationES },
  it: { translation: translationIT },
  pt: { translation: translationPT },
  de: { translation: translationDE },
  zh: { translation: translationZH },
  ja: { translation: translationJA },
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'fr',
    debug: false,

    interpolation: {
      escapeValue: false,
    },

    detection: {
      order: ['localStorage', 'navigator', 'htmlTag'],
      caches: ['localStorage'],
      lookupLocalStorage: 'i18nextLng',
    },
  });

export default i18n;