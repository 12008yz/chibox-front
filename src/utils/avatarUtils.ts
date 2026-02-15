/**
 * Утилиты для работы с аватарами пользователей
 */
import { BACKEND_URL } from './config';

/**
 * Получает полный URL аватара
 */
export function getAvatarUrl(avatarPath: string | null | undefined): string | null {
  if (!avatarPath) return null;

  // Если это уже полный URL
  if (avatarPath.startsWith('http://') || avatarPath.startsWith('https://')) {
    return avatarPath;
  }

  // Если это относительный путь (/avatars/...)
  if (avatarPath.startsWith('/')) {
    const url = `${BACKEND_URL}${avatarPath}`;
    return url;
  }

  // Если путь не начинается со слеша, добавляем его
  const url = `${BACKEND_URL}/${avatarPath}`;
  return url;
}

/**
 * Получает приоритетный аватар (пользовательский > Steam > fallback)
 */
export function getPreferredAvatar(
  customAvatar?: string | null,
  steamAvatar?: string | null,
  userId?: string
): string {
  // Приоритет 1: пользовательский аватар
  if (customAvatar) {
    const url = getAvatarUrl(customAvatar);
    if (url) {
      return url;
    }
  }

  // Приоритет 2: Steam аватар
  if (steamAvatar) {
    return steamAvatar;
  }

  // Приоритет 3: fallback аватар
  const fallback = generateFallbackAvatar(userId || 'user');
  return fallback;
}

/**
 * Генерирует fallback аватар на основе ID пользователя
 */
export function generateFallbackAvatar(userId: string): string {
  const colors = [
    '6366f1', '8b5cf6', 'a855f7', 'c084fc', 'ec4899',
    'ef4444', 'f97316', 'f59e0b', 'eab308', '84cc16',
    '22c55e', '10b981', '06b6d4', '0ea5e9', '3b82f6'
  ];

  const colorIndex = userId.length % colors.length;
  const color = colors[colorIndex];
  const letter = userId.charAt(0).toUpperCase();

  return `https://ui-avatars.com/api/?name=${letter}&background=${color}&color=fff&size=256&font-size=0.6&bold=true`;
}

/**
 * Проверяет доступность изображения по URL
 */
export async function checkImageAvailability(url: string): Promise<boolean> {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => resolve(true);
    img.onerror = () => resolve(false);
    img.src = url;

    // Таймаут 5 секунд
    setTimeout(() => resolve(false), 5000);
  });
}
