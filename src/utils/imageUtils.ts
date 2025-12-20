// Утилита для получения полного URL изображения
const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://chibox-game.ru/api';
// Убираем /api из конца, чтобы получить базовый URL сервера
const SERVER_BASE_URL = API_BASE_URL.replace(/\/api\/?$/, '');

export const getImageUrl = (path: string | null | undefined): string => {

  if (!path) {
    return '';
  }

  // Если путь уже полный URL (начинается с http:// или https://), возвращаем как есть
  if (path.startsWith('http://') || path.startsWith('https://')) {
    return path;
  }

  // Очищаем неправильные пути, если они остались
  let cleanPath = path;
  let cleaned = false;

  if (cleanPath.includes('../public/')) {
    cleanPath = cleanPath.replace('../public', '');
    cleaned = true;
  }
  if (cleanPath.includes('public/')) {
    cleanPath = cleanPath.replace('public/', '');
    cleaned = true;
  }


  // Если путь начинается с /, добавляем базовый URL сервера
  if (cleanPath.startsWith('/')) {
    const fullUrl = `${SERVER_BASE_URL}${cleanPath}`;
    return fullUrl;
  }

  // Если путь относительный, добавляем базовый URL и /
  const fullUrl = `${SERVER_BASE_URL}/${cleanPath}`;
  return fullUrl;
};
