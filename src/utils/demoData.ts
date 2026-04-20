import type { CaseTemplate, Item, User, UserAchievement, UserInventoryItem, UserCaseItem } from '../types/api';

/** Шаблоны кейсов (UUID — как в проде, для превью и маршрутов). */
export const DEMO_CASE_TEMPLATES: CaseTemplate[] = [
  {
    id: '11111111-1111-1111-1111-111111111111',
    name: 'Daily Case',
    price: '0',
    image_url: '/images/cases/daily.webp',
    description: 'Ежедневный кейс',
    type: 'daily',
    min_subscription_tier: 0,
    is_active: true,
    sort_order: 1,
    color_scheme: 'purple',
  },
  {
    id: '22222222-2222-2222-2222-222222222222',
    name: 'Starter Case',
    price: '0',
    image_url: '/images/cases/starter.webp',
    description: 'Стартовый набор',
    type: 'free',
    min_subscription_tier: 0,
    is_active: true,
    sort_order: 2,
    color_scheme: 'blue',
  },
  {
    id: '33333333-3333-3333-3333-333333333333',
    name: 'Chi Prime',
    price: '249',
    image_url: '/images/cases/prime.webp',
    description: 'Премиум дроп',
    type: 'paid',
    min_subscription_tier: 0,
    is_active: true,
    sort_order: 3,
    color_scheme: 'gold',
  },
  {
    id: '44444444-4444-4444-4444-444444444444',
    name: 'Status++ Vault',
    price: '599',
    image_url: '/images/cases/vault.webp',
    description: 'Эксклюзив для подписчиков',
    type: 'paid',
    min_subscription_tier: 3,
    is_active: true,
    sort_order: 4,
    color_scheme: 'red',
  },
];

export const DEMO_DROP_POOL: Item[] = [
  {
    id: 'd1a1a1a1-a1a1-a1a1-a1a1-a1a1a1a1a1a1',
    name: 'AK-47 | Redline (Field-Tested)',
    image_url: 'https://community.fastly.steamstatic.com/economy/image/6TMcQ7eX6E0EZl2byXi7vaVtMyCbg7JT9Nj26yLB0uiTHKECVqCQJYPQOiKc1A9hdeGdqRmPbEbD8Q_VfQ/256fx256f',
    price: '1842.50',
    rarity: 'classified',
    weapon_type: 'Rifle',
  },
  {
    id: 'd2b2b2b2-b2b2-b2b2-b2b2-b2b2b2b2b2b2',
    name: 'M4A1-S | Hyper Beast (Minimal Wear)',
    image_url: 'https://community.fastly.steamstatic.com/economy/image/6TMcQ7eX6E0EZl2byXi7vaVtMyCbg7JT9Nj26yLB0uiTHKECVqCQJYPQOiKc1A9hdeGdqRmPbEbD8Q_VfQ/256fx256f',
    price: '5620.00',
    rarity: 'covert',
    weapon_type: 'Rifle',
  },
  {
    id: 'd3c3c3c3-c3c3-c3c3-c3c3-c3c3c3c3c3c3',
    name: 'USP-S | Kill Confirmed (Field-Tested)',
    image_url: 'https://community.fastly.steamstatic.com/economy/image/6TMcQ7eX6E0EZl2byXi7vaVtMyCbg7JT9Nj26yLB0uiTHKECVqCQJYPQOiKc1A9hdeGdqRmPbEbD8Q_VfQ/256fx256f',
    price: '3210.75',
    rarity: 'covert',
    weapon_type: 'Pistol',
  },
  {
    id: 'd4d4d4d4-d4d4-d4d4-d4d4-d4d4d4d4d4d4',
    name: 'Glock-18 | Fade (Factory New)',
    image_url: 'https://community.fastly.steamstatic.com/economy/image/6TMcQ7eX6E0EZl2byXi7vaVtMyCbg7JT9Nj26yLB0uiTHKECVqCQJYPQOiKc1A9hdeGdqRmPbEbD8Q_VfQ/256fx256f',
    price: '892.20',
    rarity: 'restricted',
    weapon_type: 'Pistol',
  },
];

export function pickRandomDemoDrop(): Item {
  const pool = DEMO_DROP_POOL;
  return {
    ...pool[Math.floor(Math.random() * pool.length)],
    id: `drop-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
  };
}

const achievementDefs = [
  { id: 'a1', name: 'Первый шаг', description: 'Откройте первый кейс', xp_reward: 50, target: 1, requirement_type: 'cases_opened', category: 'regular', badge_color: '#22c55e' },
  { id: 'a2', name: 'Коллекционер', description: 'Соберите 10 предметов', xp_reward: 100, target: 10, requirement_type: 'inventory_items', category: 'regular', badge_color: '#a855f7' },
  { id: 'a3', name: 'Серия побед', description: '7 дней подряд заходите на сайт', xp_reward: 200, target: 7, requirement_type: 'streak', category: 'regular', badge_color: '#f97316' },
  { id: 'a4', name: 'Высокая ставка', description: 'Выведите предмет дороже 5000 ₽', xp_reward: 150, target: 5000, requirement_type: 'withdraw_value', category: 'hard', badge_color: '#ef4444' },
  { id: 'a5', name: 'Сообщество', description: 'Пригласите друга по реферальной ссылке', xp_reward: 300, target: 1, requirement_type: 'referral', category: 'regular', badge_color: '#3b82f6' },
];

export function buildDemoAchievementsProgress(): Array<Record<string, unknown>> {
  return achievementDefs.map((def, i) => ({
    id: def.id,
    name: def.name,
    description: def.description,
    icon_url: '/images/achievements/badge.webp',
    xp_reward: def.xp_reward,
    badge_color: def.badge_color,
    completed: i < 4,
    progress: i < 3 ? def.target : i === 3 ? 3200 : 0,
    target: def.target,
    requirement_type: def.requirement_type,
    bonus_percentage: 0.5,
    category: def.category,
  }));
}

export function buildDemoUserAchievements(): UserAchievement[] {
  return achievementDefs.slice(0, 4).map((def, idx) => ({
    id: `ua-${def.id}`,
    user_id: '00000000-0000-0000-0000-00000000d3m0',
    achievement_id: def.id,
    current_progress: def.target,
    is_completed: true,
    completion_date: new Date(Date.now() - idx * 86400000).toISOString(),
    notified: true,
    bonus_applied: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    achievement: {
      id: def.id,
      name: def.name,
      description: def.description,
      requirement_type: def.requirement_type,
      requirement_value: def.target,
      reward_type: 'xp',
      reward_value: def.xp_reward,
      image_url: '/images/achievements/badge.webp',
    },
  }));
}

export function initialDemoInventory(): { items: UserInventoryItem[]; cases: UserCaseItem[] } {
  const now = new Date().toISOString();
  const items: UserInventoryItem[] = [
    {
      id: 'inv-item-1',
      item_type: 'item',
      item_id: DEMO_DROP_POOL[0].id,
      item: { ...DEMO_DROP_POOL[0] },
      acquisition_date: now,
      source: 'case_open',
      status: 'inventory',
    },
    {
      id: 'inv-item-2',
      item_type: 'item',
      item_id: DEMO_DROP_POOL[1].id,
      item: { ...DEMO_DROP_POOL[1] },
      acquisition_date: now,
      source: 'case_open',
      status: 'inventory',
    },
  ];
  const cases: UserCaseItem[] = [
    {
      id: 'inv-case-1',
      item_type: 'case',
      case_template_id: DEMO_CASE_TEMPLATES[2].id,
      case_template: DEMO_CASE_TEMPLATES[2],
      acquisition_date: now,
      source: 'purchase',
      status: 'inventory',
    },
  ];
  return { items, cases };
}

export function computeTotalItemsValue(items: UserInventoryItem[]): number {
  return items.reduce((sum, row) => {
    const p = row.item ? parseFloat(String(row.item.price)) || 0 : 0;
    return sum + p;
  }, 0);
}

export function buildDemoProfileUser(
  balance: number,
  inv: { items: UserInventoryItem[]; cases: UserCaseItem[] },
  totalCasesOpened: number
): User {
  const totalVal = computeTotalItemsValue(inv.items);
  const best = inv.items.reduce<{ price: number; item: Item | null }>(
    (acc, row) => {
      const p = row.item ? parseFloat(String(row.item.price)) || 0 : 0;
      if (p > acc.price && row.item) return { price: p, item: row.item };
      return acc;
    },
    { price: 0, item: null }
  );

  const achievements = buildDemoUserAchievements();

  return {
    id: '00000000-0000-0000-0000-00000000d3m0',
    username: 'DemoPlayer',
    email: 'demo@chibox.local',
    balance,
    level: 42,
    xp: 12800,
    xp_to_next_level: 20000,
    total_xp_earned: 450000,
    subscription_tier: '3',
    subscription_days_left: 14,
    subscription_expiry_date: new Date(Date.now() + 14 * 86400000).toISOString(),
    subscription_purchase_date: new Date(Date.now() - 30 * 86400000).toISOString(),
    cases_available: 3,
    cases_opened_today: 1,
    total_cases_opened: totalCasesOpened,
    total_items_value: totalVal,
    max_daily_cases: 5,
    is_email_verified: true,
    auth_provider: 'local',
    role: 'user',
    achievements_bonus_percentage: 2.5,
    subscription_bonus_percentage: 5,
    total_drop_bonus_percentage: 12.5,
    achievements,
    inventory: [...inv.items, ...inv.cases] as User['inventory'],
    bestWeapon: best.item
      ? {
          id: best.item.id,
          name: best.item.name,
          image_url: best.item.image_url || '',
          price: parseFloat(String(best.item.price)) || 0,
          rarity: best.item.rarity,
          weapon_type: best.item.weapon_type,
        }
      : undefined,
    steam_profile_url: undefined,
    steam_trade_url: 'https://steamcommunity.com/tradeoffer/new/?partner=0&token=demo',
    avatar_url: undefined,
    created_at: new Date(Date.now() - 365 * 86400000).toISOString(),
  };
}
