export const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';
export const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3000';

// URL для фоновых изображений
export const BACKGROUNDS = {
  home: `${BACKEND_URL}/images/backgrounds/background.jpg`,
  exchange: `${BACKEND_URL}/images/backgrounds/exchange-bg.png`,
  upgrade: `${BACKEND_URL}/images/backgrounds/upgrade-bg.png`,
  leaderboard: `${BACKEND_URL}/images/backgrounds/leaderboard-img.png`,
};

// Для отладки
console.log('Config loaded:', {
  API_URL,
  BACKEND_URL,
  BACKGROUNDS
});
