import { API_URL, BACKEND_URL } from './config';

const API_BASE_URL = API_URL;
const SERVER_BASE_URL = BACKEND_URL;

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

  if (cleanPath.includes('../public/')) {
    cleanPath = cleanPath.replace('../public', '');
  }
  if (cleanPath.includes('public/')) {
    cleanPath = cleanPath.replace('public/', '');
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
