export const API_URL = import.meta.env.VITE_API_URL || 'https://chibox-game.ru/api';
export const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'https://chibox-game.ru';

/** Текст ошибки из ответа API (RTK Query / axios) */
export function getApiErrorMessage(error: unknown, fallback: string): string {
  if (error && typeof error === 'object' && 'data' in error) {
    const d = (error as { data?: { message?: string } }).data;
    if (d?.message) return d.message;
  }
  if (error && typeof error === 'object' && 'message' in error) {
    return String((error as { message: unknown }).message);
  }
  return fallback;
}

// URL для фоновых изображений
export const BACKGROUNDS = {
  home: '/images/home.jpg',
  exchange: '/images/exscange.png',
  upgrade: '/images/upgrade.png',
  leaderboard: '/images/liders.png',
};
