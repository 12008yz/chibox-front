/**
 * Клиентские ключи пути возврата после входа. Без .env — только браузерный storage.
 * Пустые catch: при недоступном storage (инкогнито, квота, политика) тихо откатываемся к «/» или null.
 */
/** Куда вернуть пользователя после входа (если заходил с защищённой страницы). */
export const POST_AUTH_PATH_KEY = 'chibox_post_auth_path';

/** Подсказка «раньше уже входили» — один тихий /profile при восстановлении сессии по cookie после сброса persist. */
export const HAD_USER_ACCOUNT_KEY = 'chibox_had_user_account';

/** Отложенный переход после интро/онбординга на главной (не чистить в SteamAuth при сбросе sessionStorage). */
export const NAV_AFTER_INTRO_KEY = 'chibox_nav_after_intro';

export function setPostAuthRedirect(path: string): void {
  if (typeof window === 'undefined') return;
  if (!path.startsWith('/') || path.startsWith('//')) return;
  const deny = ['/auth/', '/steam-loading'];
  if (deny.some((p) => path.startsWith(p))) return;
  try {
    localStorage.setItem(POST_AUTH_PATH_KEY, path);
  } catch {
    /* ignore */
  }
}

/** Прочитать путь возврата и удалить из localStorage. */
export function consumePostAuthRedirect(): string {
  if (typeof window === 'undefined') return '/';
  try {
    const v = localStorage.getItem(POST_AUTH_PATH_KEY);
    localStorage.removeItem(POST_AUTH_PATH_KEY);
    if (v && v.startsWith('/') && !v.startsWith('//')) return v;
  } catch {
    /* ignore */
  }
  return '/';
}

export function setDeferredPostIntroNav(path: string): void {
  if (typeof window === 'undefined') return;
  if (!path.startsWith('/') || path.startsWith('//') || path === '/') return;
  try {
    sessionStorage.setItem(NAV_AFTER_INTRO_KEY, path);
  } catch {
    /* ignore */
  }
}

export function consumeDeferredPostIntroNav(): string | null {
  if (typeof window === 'undefined') return null;
  try {
    const v = sessionStorage.getItem(NAV_AFTER_INTRO_KEY);
    sessionStorage.removeItem(NAV_AFTER_INTRO_KEY);
    if (v && v.startsWith('/') && !v.startsWith('//')) return v;
  } catch {
    /* ignore */
  }
  return null;
}
