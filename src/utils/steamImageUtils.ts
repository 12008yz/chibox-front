// Утилита для работы с изображениями Steam Market

// Базовый URL бэкенда для получения изображений
const BACKEND_URL = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:3000';

// Функция для получения полного URL изображения с бэкенда
export function getBackendImageUrl(imagePath: string | null | undefined): string | null {
  if (!imagePath) return null;

  // Если это уже полный URL (начинается с http:// или https://)
  if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
    return imagePath;
  }

  // Если это относительный путь, добавляем базовый URL
  const cleanPath = imagePath.startsWith('/') ? imagePath : `/${imagePath}`;
  return `${BACKEND_URL}${cleanPath}`;
}

// Функция для извлечения market_hash_name из URL страницы Steam Market
export function extractMarketHashName(marketUrl: string): string | null {
  try {
    const match = marketUrl.match(/\/market\/listings\/730\/(.+)$/);
    if (match) {
      return decodeURIComponent(match[1]);
    }
    return null;
  } catch (error) {
    console.error('Ошибка извлечения имени из URL:', marketUrl, error);
    return null;
  }
}

// Функция для создания прямой ссылки на изображение Steam
export function createSteamImageUrl(marketHashName: string, size: string = '256fx256f'): string {
  // Используем дефолтное изображение CS2 предмета, так как для создания правильной ссылки
  // нужен точный hash изображения, который можно получить только через парсинг страницы
  console.warn('Использование fallback изображения для:', marketHashName);
  return `https://community.fastly.steamstatic.com/economy/image/6TMcQ7eX6E0EZl2byXi7vaVtMyCbg7JT9Nj26yLB0uiTHKECVqCQJYPQOiKc1A9hdeGdqRmPbEbD8Q_VfQ/${size}`;
}

// Функция для получения изображения из URL страницы Steam Market
export function getSteamImageFromMarketUrl(marketUrl: string, size: string = '256fx256f'): string | null {
  // Проверяем, это ли ссылка на страницу Steam Market
  if (!marketUrl || !marketUrl.includes('steamcommunity.com/market/listings/730/')) {
    return marketUrl; // Возвращаем как есть, если это не ссылка на страницу
  }

  const marketHashName = extractMarketHashName(marketUrl);
  if (!marketHashName) {
    return null;
  }

  // Создаем приблизительную ссылку на изображение
  return createSteamImageUrl(marketHashName, size);
}

// Функция для проверки, является ли URL ссылкой на страницу Steam Market
export function isSteamMarketPageUrl(url: string): boolean {
  if (!url || typeof url !== 'string') return false;
  return url.includes('steamcommunity.com/market/listings/730/');
}

// Функция для проверки, является ли URL прямой ссылкой на изображение Steam
export function isSteamImageUrl(url: string): boolean {
  if (!url || typeof url !== 'string') return false;
  return url.includes('steamstatic.com/economy/image/');
}

// Основная функция для получения корректной ссылки на изображение
export function getItemImageUrl(imageUrl: string | null | undefined, fallbackName?: string): string {
  // Если URL пустой
  if (!imageUrl) {
    return getDefaultItemImage(fallbackName);
  }

  // Если это уже прямая ссылка на изображение Steam
  if (isSteamImageUrl(imageUrl)) {
    return imageUrl;
  }

  // Если это ссылка на страницу Steam Market (для старых записей)
  if (isSteamMarketPageUrl(imageUrl)) {
    console.warn('Обнаружена ссылка на страницу Steam Market вместо изображения:', imageUrl);
    // Возвращаем дефолтное изображение, так как правильное изображение должно быть получено на бэкенде
    return getDefaultItemImage(fallbackName);
  }

  // Если это другая ссылка на изображение
  if (imageUrl.startsWith('http')) {
    return imageUrl;
  }

  // Если это относительный путь (например /images/cases/free.png), получаем с бэкенда
  if (imageUrl.startsWith('/')) {
    const backendUrl = getBackendImageUrl(imageUrl);
    if (backendUrl) {
      return backendUrl;
    }
  }

  // Возвращаем дефолтное изображение
  return getDefaultItemImage(fallbackName);
}

// Функция для получения изображения кейса (всегда с бэкенда)
export function getCaseImageUrl(imageUrl: string | null | undefined): string {
  if (!imageUrl) {
    // Дефолтное изображение для кейса
    return getBackendImageUrl('/images/cases/free.png') || '/images/cases/free.png';
  }

  // Если это полный URL, возвращаем как есть
  if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) {
    return imageUrl;
  }

  // Если это относительный путь, получаем с бэкенда
  const backendUrl = getBackendImageUrl(imageUrl);
  return backendUrl || imageUrl;
}

// Функция для получения дефолтного изображения предмета
export function getDefaultItemImage(itemName?: string): string {
  // Дефолтные изображения предметов CS2
  const defaultImages = [
    'https://community.fastly.steamstatic.com/economy/image/6TMcQ7eX6E0EZl2byXi7vaVtMyCbg7JT9Nj26yLB0uiTHKECVqCQJYPQOiKc1A9hdeGdqRmPbEbD8Q_VfQ/256fx256f',
    'https://community.fastly.steamstatic.com/economy/image/Hu4RHnD4UwWsXUfwqCKGpN8kBfebXgKq6HqlcIzg9oj1pKi8rZRG8QW5VBa4tBmfUbxpnbw7q8P4/256fx256f',
  ];

  // Выбираем изображение на основе названия для стабильности
  if (itemName) {
    const hash = itemName.split('').reduce((a, b) => {
      a = ((a << 5) - a) + b.charCodeAt(0);
      return a & a;
    }, 0);
    return defaultImages[Math.abs(hash) % defaultImages.length];
  }

  return defaultImages[0];
}
