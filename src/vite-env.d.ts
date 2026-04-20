/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_DEMO_MODE?: string;
  /** Абсолютный URL боевого API для каталога в демо (кейсы, состав кейса). По умолчанию https://chibox-game.ru/api */
  readonly VITE_DEMO_CATALOG_API_URL?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
