/**
 * Те же динамические import(), что в App.tsx — Vite отдаёт один чанк на страницу.
 * Вызывать при hover/focus/touch на <Link> и после idle на главной.
 */
const prefetched = new Set<string>();

const loaders: Record<string, () => Promise<unknown>> = {
  '/exchange': () => import('../pages/ExchangePage'),
  '/upgrade': () => import('../pages/UpgradePage'),
  '/leaderboard': () => import('../pages/LeaderboardPage'),
  '/coinflip': () => import('../pages/LeaderboardPage'),
  '/profile': () => import('../pages/profile/ProfilePage'),
  '/tower-defense': () => import('../pages/TowerDefensePage'),
  '/streamer-cabinet': () => import('../pages/StreamerCabinetPage'),
  '/terms': () => import('../pages/TermsPage'),
  '/privacy': () => import('../pages/PrivacyPage'),
  '/responsible-gaming': () => import('../pages/ResponsibleGamingPage'),
  '/about': () => import('../pages/AboutPage'),
  '/contacts': () => import('../pages/ContactsPage'),
  '/faq': () => import('../pages/FAQPage'),
  '/requisites': () => import('../pages/RequisitesPage'),
  '/services': () => import('../pages/ServicesPage'),
};

function runOnce(key: string, fn: () => Promise<unknown>): void {
  if (prefetched.has(key)) return;
  prefetched.add(key);
  void fn().catch(() => {});
}

export function prefetchRoute(path: string): void {
  const p = path.split('?')[0] || '/';
  if (p.startsWith('/user/')) {
    runOnce('public-profile', () => import('../pages/PublicProfilePage'));
    return;
  }
  if (p === '/profile' || p.startsWith('/profile/')) {
    runOnce('/profile', loaders['/profile']);
    return;
  }
  const loader = loaders[p];
  if (!loader) return;
  runOnce(p, loader);
}

/** После загрузки главной — подгружаем частые маршруты, когда браузер простаивает. */
export function prefetchMainNavRoutesIdle(): () => void {
  const w = typeof globalThis !== 'undefined' ? globalThis : null;
  if (!w) return () => {};
  const run = () => {
    prefetchRoute('/upgrade');
    prefetchRoute('/leaderboard');
  };
  if ('requestIdleCallback' in w && typeof w.requestIdleCallback === 'function') {
    const id = w.requestIdleCallback(run, { timeout: 5000 });
    return () => w.cancelIdleCallback(id);
  }
  const t = w.setTimeout(run, 200);
  return () => w.clearTimeout(t);
}
