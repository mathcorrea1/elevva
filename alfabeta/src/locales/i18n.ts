import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

import ptBR from './pt-BR.json';

void i18n.use(initReactI18next).init({
  compatibilityJSON: 'v4',
  lng: 'pt-BR',
  fallbackLng: 'pt-BR',
  resources: {
    'pt-BR': {
      translation: ptBR,
    },
  },
  interpolation: {
    escapeValue: false,
  },
});

export default i18n;
