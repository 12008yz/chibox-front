// Утилита для получения полного URL изображения
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';
// Убираем /api из конца, чтобы получить базовый URL сервера
const SERVER_BASE_URL = API_BASE_URL.replace(/\/api\/?$/, '');

export const getImageUrl = (path: string | null | undefined): string => {
  console.log('🔧 getImageUrl called with:', path);

  if (!path) {
    console.log('⚠️ Path is empty, returning empty string');
    return '';
  }

  // Если путь уже полный URL (начинается с http:// или https://), возвращаем как есть
  if (path.startsWith('http://') || path.startsWith('https://')) {
    console.log('✅ Full URL detected, returning as is:', path);
    return path;
  }

  // Очищаем неправильные пути, если они остались
  let cleanPath = path;
  let cleaned = false;

  if (cleanPath.includes('../public/')) {
    console.log('🧹 Cleaning "../public/" from path');
    cleanPath = cleanPath.replace('../public', '');
    cleaned = true;
  }
  if (cleanPath.includes('public/')) {
    console.log('🧹 Cleaning "public/" from path');
    cleanPath = cleanPath.replace('public/', '');
    cleaned = true;
  }

  if (cleaned) {
    console.log('🧹 Path after cleaning:', cleanPath);
  }

  // Если путь начинается с /, добавляем базовый URL сервера
  if (cleanPath.startsWith('/')) {
    const fullUrl = `${SERVER_BASE_URL}${cleanPath}`;
    console.log('✅ Generated URL (absolute path):', {
      serverBaseUrl: SERVER_BASE_URL,
      cleanPath,
      fullUrl
    });
    return fullUrl;
  }

  // Если путь относительный, добавляем базовый URL и /
  const fullUrl = `${SERVER_BASE_URL}/${cleanPath}`;
  console.log('✅ Generated URL (relative path):', {
    serverBaseUrl: SERVER_BASE_URL,
    cleanPath,
    fullUrl
  });
  return fullUrl;
};
