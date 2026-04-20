import type { FetchArgs } from '@reduxjs/toolkit/query';
import type { Item, UserCaseItem, UserInventoryItem } from '../types/api';
import {
  fetchCaseTemplateItemsFromProd,
  fetchCaseTemplatesFromProd,
  pickRandomDropFromProdItems,
  resolveCaseTemplateByIdFromProd,
} from './demoCatalogFetch';
import {
  DEMO_CASE_TEMPLATES,
  DEMO_DROP_POOL,
  buildDemoAchievementsProgress,
  buildDemoProfileUser,
  buildDemoUserAchievements,
  pickRandomDemoDrop,
} from './demoData';
import {
  addDemoCasePurchased,
  addDemoItem,
  getDemoBalance,
  getDemoInventory,
  getDemoTotalCasesOpened,
  incrementDemoCasesOpened,
  removeDemoCase,
  removeDemoItem,
  setDemoBalance,
} from './demoState';

function parseRequest(args: string | FetchArgs): { path: string; method: string; body: unknown } {
  if (typeof args === 'string') {
    return { path: args.split('?')[0], method: 'GET', body: undefined };
  }
  const url = args.url || '';
  return {
    path: url.split('?')[0],
    method: (args.method || 'GET').toUpperCase(),
    body: args.body,
  };
}

function caseTemplateById(id: string) {
  return DEMO_CASE_TEMPLATES.find((c) => c.id === id) || DEMO_CASE_TEMPLATES[0];
}

function parseJsonBody(body: unknown): Record<string, unknown> {
  if (!body || typeof body !== 'object') return {};
  return body as Record<string, unknown>;
}

/** Моки для демо; каталог кейсов/предметов подгружается с прода через baseApi (см. shouldDemoFetchCatalogFromProduction). */
export async function getDemoApiResponse(args: string | FetchArgs): Promise<unknown> {
  const { path, method, body } = parseRequest(args);

  // ——— Профиль ———
  if (path === 'v1/login' && method === 'POST') {
    const inv = getDemoInventory();
    return {
      success: true,
      user: buildDemoProfileUser(getDemoBalance(), inv, getDemoTotalCasesOpened()),
      achievements: buildDemoUserAchievements(),
      inventory: [...inv.items, ...inv.cases],
    };
  }

  if (path === 'v1/profile' && method === 'GET') {
    const inv = getDemoInventory();
    return {
      success: true,
      user: buildDemoProfileUser(getDemoBalance(), inv, getDemoTotalCasesOpened()),
    };
  }

  if (path === 'v1/profile' && method === 'PUT') {
    const b = parseJsonBody(body);
    const inv = getDemoInventory();
    const base = buildDemoProfileUser(getDemoBalance(), inv, getDemoTotalCasesOpened());
    if (typeof b.username === 'string') base.username = b.username;
    if (typeof b.steam_trade_url === 'string') base.steam_trade_url = b.steam_trade_url;
    return { success: true, user: base };
  }

  if (path === 'v1/balance' && method === 'GET') {
    return { success: true, data: { balance: getDemoBalance() } };
  }

  if (path === 'v1/logout' && method === 'POST') {
    return { success: true, message: 'ok' };
  }

  // ——— Инвентарь ———
  if (path.startsWith('v1/inventory') && method === 'GET') {
    const inv = getDemoInventory();
    const all = inv.items.length + inv.cases.length;
    return {
      success: true,
      data: {
        items: inv.items,
        cases: inv.cases,
        totalItems: inv.items.filter((i) => i.status === 'inventory' || i.status === 'available').length,
        totalCases: inv.cases.filter((c) => c.status === 'inventory').length,
        allItems: inv.items.length,
        allCases: inv.cases.length,
        currentPage: 1,
        totalPages: 1,
        pagination: {
          page: 1,
          limit: 1000,
          total: all,
          totalPages: 1,
          hasMore: false,
        },
      },
    };
  }

  if (path === 'v1/achievements' && method === 'GET') {
    return {
      success: true,
      data: buildDemoUserAchievements(),
    };
  }

  if (path === 'v1/achievements/progress' && method === 'GET') {
    return {
      success: true,
      data: buildDemoAchievementsProgress(),
    };
  }

  if (path === 'v1/missions' && method === 'GET') {
    return {
      success: true,
      data: [
        {
          id: 'm1',
          name: 'Ежедневный вход',
          description: 'Зайдите на сайт сегодня',
          requirement_type: 'login',
          requirement_value: 1,
          reward_type: 'xp',
          reward_value: 25,
        },
      ],
    };
  }

  if (path.startsWith('v1/notifications') && method === 'GET') {
    return {
      success: true,
      data: {
        items: [
          {
            id: 'n1',
            user_id: 'demo',
            title: 'Добро пожаловать в демо',
            message: 'Это мок: платежи и вывод не выполняются.',
            type: 'info',
            category: 'general',
            read: false,
            created_at: new Date().toISOString(),
          },
        ],
        total: 1,
        page: 1,
        limit: 20,
        totalPages: 1,
      },
    };
  }

  if (path === 'v1/notifications/unread-count' && method === 'GET') {
    return { success: true, data: { count: 1 } };
  }

  if (path === 'v1/subscription' && method === 'GET') {
    return {
      success: true,
      data: {
        tier: { id: 3, name: 'Статус++', expiry_date: new Date(Date.now() + 14 * 86400000).toISOString(), bonus: 5, max_daily_cases: 5 },
        isActive: true,
        daysLeft: 14,
        subscription_tier: 3,
        subscription_days_left: 14,
        id: 3,
        expiry_date: new Date(Date.now() + 14 * 86400000).toISOString(),
        days_left: 14,
      },
    };
  }

  if (path === 'v1/subscription/claim-case' && method === 'POST') {
    return {
      success: true,
      data: {
        cases_claimed: 0,
        next_available_time: new Date(Date.now() + 86400000).toISOString(),
        user_cases: [],
        message: 'Демо: кейс уже в инвентаре или недоступен.',
      },
    };
  }

  if (path === 'v1/subscription/case-status' && method === 'GET') {
    return {
      success: true,
      data: {
        has_active_subscription: true,
        can_claim: false,
        has_subscription_case_in_inventory: true,
        subscription_tier: 3,
        next_available_time: null,
        time_remaining: null,
        subscription_expiry_date: new Date(Date.now() + 14 * 86400000).toISOString(),
      },
    };
  }

  if (path === 'v1/cases/purchase-info' && method === 'GET') {
    return { success: true, data: {} };
  }

  if (path === 'v1/free-case/status' && method === 'GET') {
    const list = await fetchCaseTemplatesFromProd();
    const hint = list.find((c) => c.type === 'daily' || c.type === 'free') || list[0] || DEMO_CASE_TEMPLATES[0];
    return {
      success: true,
      data: {
        canClaim: true,
        reason: '',
        nextAvailableTime: null,
        claimCount: 0,
        maxClaims: 2,
        firstClaimDate: null,
        lastClaimDate: null,
        caseTemplateId: hint.id,
      },
    };
  }

  if (path === 'v1/bonus/status' && method === 'GET') {
    return {
      is_available: false,
      has_active_subscription: true,
      cooldown_hours: 24,
      lifetime_bonuses_claimed: 12,
      last_bonus_date: new Date().toISOString(),
    };
  }

  if (path === 'v1/bonus-info' && method === 'GET') {
    return { success: true, data: { tiers: [] } };
  }

  if (path === 'v1/statistics' && method === 'GET') {
    return {
      success: true,
      data: {
        total_cases_opened: getDemoTotalCasesOpened(),
        total_items_value: 125000,
        account_age_days: 365,
      },
    };
  }

  if (path === 'v1/balance/payment-history' && method === 'GET') {
    return { success: true, data: { items: [], total: 0 } };
  }

  if (path === 'v1/upgrade/items' && method === 'GET') {
    const inv = getDemoInventory();
    const grouped = new Map<string, { item: Item; instances: { id: string; status: string }[]; count: number }>();
    for (const row of inv.items) {
      if (!row.item || row.status !== 'inventory') continue;
      const id = row.item.id;
      if (!grouped.has(id)) {
        grouped.set(id, {
          item: {
            id: row.item.id,
            name: row.item.name,
            image_url: row.item.image_url || '',
            price: String(row.item.price ?? '0'),
            rarity: row.item.rarity,
            weapon_type: row.item.weapon_type,
          },
          instances: [],
          count: 0,
        });
      }
      const g = grouped.get(id)!;
      g.instances.push({ id: row.id, status: row.status });
      g.count += 1;
    }
    return {
      success: true,
      data: {
        items: Array.from(grouped.values()),
      },
    };
  }

  if (path.startsWith('v1/upgrade/options') && method === 'GET') {
    const target = DEMO_DROP_POOL[0];
    return {
      success: true,
      data: {
        source_items: [],
        total_source_price: 0,
        upgrade_options: [
          {
            id: target.id,
            name: target.name,
            image_url: target.image_url || '',
            price: parseFloat(target.price),
            rarity: target.rarity,
            weapon_type: target.weapon_type,
            upgrade_chance: 35,
            price_ratio: 1.2,
            base_chance: 35,
            cheap_target_bonus: 0,
            expected_value: 5000,
            isProfitable: true,
          },
        ],
      },
    };
  }

  if (path === 'v1/upgrade/perform' && method === 'POST') {
    return {
      success: true,
      upgrade_success: false,
      message: 'Демо: апгрейд не выполняется.',
      data: {
        source_items: [],
        success_chance: 0,
        rolled_value: 0.5,
        total_source_price: 0,
        cheap_target_bonus: 0,
      },
    };
  }

  if (path === 'v1/games/play-safe-cracker' && method === 'POST') {
    return {
      success: true,
      message: 'Демо: игра недоступна.',
      reward: null,
    };
  }

  if (path === 'v1/tic-tac-toe/current-game' && method === 'GET') {
    return {
      success: true,
      game: null,
      canPlay: true,
      has_subscription: true,
      has_won_today: false,
      attempts_left: 3,
      free_attempts_remaining: 1,
    };
  }

  if (path === 'v1/tic-tac-toe/new-game' && method === 'POST') {
    return {
      success: true,
      game: {
        id: 'ttt-demo',
        user_id: 'demo',
        game_state: {
          board: [null, null, null, null, null, null, null, null, null],
          currentPlayer: 'player',
          winner: null,
          status: 'playing',
        },
        attempts_left: 2,
        bot_goes_first: false,
        result: 'ongoing',
        reward_given: false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
    };
  }

  if (path === 'v1/tic-tac-toe/move' && method === 'POST') {
    return {
      success: true,
      message: 'Демо: ход засчитан локально.',
      game: {
        id: 'ttt-demo',
        user_id: 'demo',
        game_state: {
          board: ['X', 'O', null, null, null, null, null, null, null],
          currentPlayer: 'player',
          winner: null,
          status: 'playing',
        },
        attempts_left: 2,
        bot_goes_first: false,
        result: 'ongoing',
        reward_given: false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
    };
  }

  if (path === 'v1/games/safe-cracker-status' && method === 'GET') {
    return {
      success: true,
      remaining_attempts: 5,
      free_attempts_remaining: 1,
      free_attempts_info: { can_use: true, reason: '', next_available: null, claim_count: 0, first_claim_date: null, last_claim_date: null },
    };
  }

  // ——— Мутации кейсов ———
  if (path === 'v1/cases/buy' && method === 'POST') {
    const b = parseJsonBody(body);
    const tid = String(b.case_template_id || b.caseTemplateId || '');
    const ct = (await resolveCaseTemplateByIdFromProd(tid)) || caseTemplateById(tid);
    const price = parseFloat(String(ct.price || '0')) || 0;
    const bal = getDemoBalance();
    if (price > 0 && bal < price) {
      return { success: false, message: 'Недостаточно ChiCoins (демо).' };
    }
    if (price > 0) setDemoBalance(bal - price);
    const newId = `inv-case-${Date.now()}`;
    const caseRow: UserCaseItem = {
      id: newId,
      item_type: 'case',
      case_template_id: ct.id,
      case_template: ct,
      acquisition_date: new Date().toISOString(),
      source: 'purchase',
      status: 'inventory',
    };
    addDemoCasePurchased(caseRow);
    return {
      success: true,
      message: 'Куплено (демо)',
      data: {
        inventory_cases: [
          {
            id: newId,
            case_template_id: ct.id,
            template_name: ct.name,
            template_image: ct.image_url,
            purchase_price: price,
            acquisition_date: caseRow.acquisition_date,
            expires_at: null,
            item_type: 'case',
          },
        ],
        new_balance: getDemoBalance(),
        balance: getDemoBalance(),
      },
    };
  }

  if (path === 'v1/open-case' && method === 'POST') {
    const b = parseJsonBody(body);
    const inventoryItemId = b.inventoryItemId as string | undefined;
    const templateId = b.template_id as string | undefined;

    let resolveTemplateId = templateId;
    if (inventoryItemId) {
      const inv = getDemoInventory();
      const caseRow = inv.cases.find((c) => c.id === inventoryItemId);
      if (caseRow?.case_template_id) resolveTemplateId = caseRow.case_template_id;
    }

    let dropped: Item;
    if (resolveTemplateId) {
      const items = await fetchCaseTemplateItemsFromProd(resolveTemplateId);
      dropped = items.length > 0 ? pickRandomDropFromProdItems(items) : pickRandomDemoDrop();
    } else {
      dropped = pickRandomDemoDrop();
    }

    if (inventoryItemId) {
      const removed = removeDemoCase(inventoryItemId);
      if (!removed) {
        return { success: false, message: 'Кейс не найден (демо).' };
      }
      incrementDemoCasesOpened();
    } else if (templateId) {
      incrementDemoCasesOpened();
    } else {
      incrementDemoCasesOpened();
    }

    const row: UserInventoryItem = {
      id: `inv-drop-${Date.now()}`,
      item_type: 'item',
      item_id: dropped.id,
      item: dropped,
      acquisition_date: new Date().toISOString(),
      source: 'case_open',
      status: 'inventory',
    };
    addDemoItem(row);

    return {
      success: true,
      data: {
        item: dropped,
        new_balance: getDemoBalance(),
        animation_data: {},
      },
    };
  }

  if (path === 'v1/sell-item' && method === 'POST') {
    const b = parseJsonBody(body);
    const itemId = String(b.itemId || '');
    const inv = getDemoInventory();
    const found = inv.items.find((i) => i.id === itemId);
    if (!found?.item) {
      return { success: false, message: 'Предмет не найден' };
    }
    removeDemoItem(itemId);
    const gain = parseFloat(String(found.item.price)) * 0.85;
    setDemoBalance(getDemoBalance() + gain);
    return { success: true, data: { new_balance: getDemoBalance(), sold_for: gain } };
  }

  if (path === 'v1/promo' && method === 'POST') {
    setDemoBalance(getDemoBalance() + 1000);
    return { success: true, data: { newBalance: getDemoBalance(), addedAmount: 1000 } };
  }

  if (path === 'v1/balance/top-up' && method === 'POST') {
    return {
      success: true,
      paymentUrl: null,
      message: 'Демо: пополнение отключено.',
    };
  }

  if (path === 'v1/items/exchange-for-subscription' && method === 'POST') {
    return { success: false, message: 'В демо обмен недоступен.' };
  }

  if (path.startsWith('v1/withdraw')) {
    return { success: false, message: 'В демо вывод отключён.' };
  }

  if (path === 'v1/streamer/me' && method === 'GET') {
    return { success: false, message: 'Демо: кабинет стримера скрыт.' };
  }

  if (path.startsWith('v1/streamer')) {
    return { success: false, message: 'Демо' };
  }

  // Уведомления: read/delete — ок
  if (path.includes('notifications') && (method === 'PUT' || method === 'DELETE')) {
    return { success: true };
  }

  if (path === 'v1/auth/refresh' && method === 'POST') {
    return { success: true };
  }

  return {
    success: true,
    data: null,
    message: `Демо: заглушка для ${method} ${path}`,
  };
}
