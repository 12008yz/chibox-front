import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

// В initial bundle держим только базовую локаль.
import ru from './locales/ru.json';

const resources = {
  ru: { translation: ru },
};

type LocaleLoader = () => Promise<{ default: Record<string, unknown> }>;

const localeLoaders: Record<string, LocaleLoader> = {
  en: () => import('./locales/en.json'),
  zh: () => import('./locales/zh.json'),
  es: () => import('./locales/es.json'),
  fr: () => import('./locales/fr.json'),
  de: () => import('./locales/de.json'),
  ja: () => import('./locales/ja.json'),
  ko: () => import('./locales/ko.json'),
};

const loadingLocales = new Map<string, Promise<void>>();

async function ensureLocaleLoaded(lang: string): Promise<void> {
  const code = (lang || 'ru').toLowerCase().split('-')[0];
  if (!code || code === 'ru' || i18n.hasResourceBundle(code, 'translation')) return;
  if (loadingLocales.has(code)) {
    await loadingLocales.get(code);
    return;
  }

  const loader = localeLoaders[code];
  if (!loader) return;

  const loadPromise = loader()
    .then((module) => {
      i18n.addResourceBundle(code, 'translation', module.default, true, true);
    })
    .catch(() => {
      // silent fallback to ru
    })
    .finally(() => {
      loadingLocales.delete(code);
    });
  loadingLocales.set(code, loadPromise);
  await loadPromise;
}

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

i18n.on('languageChanged', (lng) => {
  void ensureLocaleLoaded(lng);
});

export default i18n;
