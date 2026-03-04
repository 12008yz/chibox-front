import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

// Импорт переводов
import ru from './locales/ru.json';
import en from './locales/en.json';
import zh from './locales/zh.json';
import es from './locales/es.json';
import fr from './locales/fr.json';
import de from './locales/de.json';
import ja from './locales/ja.json';
import ko from './locales/ko.json';

const resources = {
  ru: { translation: ru },
  en: { translation: en },
  zh: { translation: zh },
  es: { translation: es },
  fr: { translation: fr },
  de: { translation: de },
  ja: { translation: ja },
  ko: { translation: ko },
};

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: 'ru',
    fallbackLng: 'ru',
    debug: false,

    interpolation: {
      escapeValue: false,
    },

    // Настройки для обработки отсутствующих переводов
    returnNull: false,
    returnEmptyString: false,
    returnObjects: false,
    joinArrays: ' ',

    load: 'languageOnly',
    cleanCode: true,
  });

export default i18n;
