import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

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

// Определение языка пользователя
const getDefaultLanguage = () => {
  // Проверяем сохраненный язык в localStorage
  const savedLanguage = localStorage.getItem('chibox-language');
  if (savedLanguage && Object.keys(resources).includes(savedLanguage)) {
    return savedLanguage;
  }

  // Определяем по браузеру
  const browserLanguage = navigator.language.toLowerCase();

  // Маппинг языков
  if (browserLanguage.startsWith('ru')) return 'ru';
  if (browserLanguage.startsWith('en')) return 'en';
  if (browserLanguage.startsWith('zh')) return 'zh';
  if (browserLanguage.startsWith('es')) return 'es';
  if (browserLanguage.startsWith('fr')) return 'fr';
  if (browserLanguage.startsWith('de')) return 'de';
  if (browserLanguage.startsWith('ja')) return 'ja';
  if (browserLanguage.startsWith('ko')) return 'ko';

  // По умолчанию английский
  return 'en';
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    lng: getDefaultLanguage(),
    fallbackLng: ['en', 'ru'],
    debug: false,

    interpolation: {
      escapeValue: false,
    },

    detection: {
      order: ['localStorage', 'navigator', 'htmlTag'],
      caches: ['localStorage'],
      lookupLocalStorage: 'chibox-language',
    },

    // Настройки для обработки отсутствующих переводов
    returnNull: false,
    returnEmptyString: false,
    returnObjects: false,
    joinArrays: ' ',

    // Настройки для лучшего fallback
    load: 'languageOnly',
    cleanCode: true,
  });

export default i18n;
