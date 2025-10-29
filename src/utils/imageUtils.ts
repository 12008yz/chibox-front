// Утилита для получения полного URL изображения
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';
// Убираем /api из конца, чтобы получить базовый URL сервера
const SERVER_BASE_URL = API_BASE_URL.replace(/\/api\/?$/, '');

export const getImageUrl = (path: string | null | undefined): string => {
  if (!path) return '';

  // Если путь уже полный URL (начинается с http:// или https://), возвращаем как есть
  if (path.startsWith('http://') || path.startsWith('https://')) {
    return path;
  }

  // Если путь начинается с /, добавляем базовый URL сервера
  if (path.startsWith('/')) {
    const fullUrl = `${SERVER_BASE_URL}${path}`;
    console.log('Achievement image URL:', path, '->', fullUrl);
    return fullUrl;
  }

  // Если путь относительный, добавляем базовый URL и /
  const fullUrl = `${SERVER_BASE_URL}/${path}`;
  console.log('Achievement image URL (relative):', path, '->', fullUrl);
  return fullUrl;
};
