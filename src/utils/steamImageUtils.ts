// Утилита для работы с изображениями Steam Market

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
   // Создаем базовую ссылку на изображение Steam
   // Это приблизительная ссылка, так как точный hash нужно получать с сервера
   const encodedName = encodeURIComponent(marketHashName);
 
   // Используем стандартный формат Steam изображений
   // В реальности нужен точный hash, но это fallback
   return `https://community.fastly.steamstatic.com/economy/image/${encodedName}/${size}`;
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
 
   // Если это уже прямая ссылка на изображение
   if (isSteamImageUrl(imageUrl)) {
     return imageUrl;
   }
 
   // Если это ссылка на страницу Steam Market
   if (isSteamMarketPageUrl(imageUrl)) {
     const steamImageUrl = getSteamImageFromMarketUrl(imageUrl);
     return steamImageUrl || getDefaultItemImage(fallbackName);
   }
 
   // Возвращаем как есть или fallback
   return imageUrl || getDefaultItemImage(fallbackName);
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
 