export const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';
export const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3000';

// URL для фоновых изображений
export const BACKGROUNDS = {
  home: '/images/home.jpg',
  exchange: '/images/exscange.png',
  upgrade: '/images/upgrade.png',
  leaderboard: '/images/liders.png',
};

// Для отладки
console.log('Config loaded:', {
  API_URL,
  BACKEND_URL,
  BACKGROUNDS
});
