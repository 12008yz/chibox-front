import type { FetchArgs } from '@reduxjs/toolkit/query';
import type { CaseTemplate, Item, UserCaseItem } from '../types/api';
import { DEMO_DROP_POOL } from './demoData';
import { getDemoInventory } from './demoState';

/** База API с боевыми данными каталога (кейсы, предметы в кейсе). Для демо-сборки на другом домене задайте явный URL. */
export function getDemoCatalogApiUrl(): string {
  const explicit = import.meta.env.VITE_DEMO_CATALOG_API_URL;
  if (explicit) return explicit;
  const api = import.meta.env.VITE_API_URL || '';
  if (/^https?:\/\//i.test(api)) return api;
  if (api.startsWith('/') && typeof window !== 'undefined') {
    return `${window.location.origin}${api}`;
  }
  return 'https://chibox-game.ru/api';
}

export function parseDemoRequestPath(args: string | FetchArgs): { path: string; method: string } {
  if (typeof args === 'string') {
    return { path: args.split('?')[0], method: 'GET' };
  }
  const url = args.url || '';
  return {
    path: url.split('?')[0],
    method: (args.method || 'GET').toUpperCase(),
  };
}

/** GET с прода: каталог кейсов, состав кейса, публичная статистика и т.д. (без cookies). */
export function shouldDemoFetchCatalogFromProduction(args: string | FetchArgs): boolean {
  const { path, method } = parseDemoRequestPath(args);
  if (method !== 'GET') return false;
  if (path === 'v1/cases' || path === 'v1/cases/available') return true;
  if (/^v1\/case-templates\/[^/]+\/items$/.test(path)) return true;
  if (/^v1\/case-templates\/[^/]+\/status$/.test(path)) return true;
  if (path.startsWith('v1/live-drops')) return true;
  if (path === 'v1/statistics/global') return true;
  if (path.startsWith('v1/leaderboard')) return true;
  if (path === 'v1/subscription/tiers') return true;
  if (path === 'v1/currency') return true;
  if (path === 'v1/avatars') return true;
  return false;
}

export function mergeDemoCasesResponse(prodBody: Record<string, unknown>) {
  const inv = getDemoInventory();
  const user_cases = inv.cases.map((c: UserCaseItem) => ({
    id: c.id,
    inventory_case_id: c.id,
    name: c.case_template?.name || 'Case',
    acquisition_date: c.acquisition_date,
    expires_at: c.expires_at,
    case_template: c.case_template,
    source: c.source,
    is_paid: c.source === 'purchase',
  }));
  return {
    ...prodBody,
    user_cases,
    user_subscription_tier: 3,
    next_case_available_time: null,
    pagination: prodBody.pagination ?? { limit: 50, offset: 0 },
  };
}

export function mergeDemoCasesAvailableResponse(prodBody: Record<string, unknown>) {
  return {
    ...prodBody,
    user_info: {
      max_daily_cases: 5,
      cases_opened_today: 1,
      cases_available: 3,
      next_case_available_time: null,
    },
  };
}

function pickImageUrl(row: Record<string, unknown>): string | null {
  const variants = [
    row.image_url,
    row.image,
    row.icon_url,
    row.icon,
    row.market_image,
    row.preview_image,
  ];
  const hit = variants.find((v) => typeof v === 'string' && v.trim() !== '');
  return typeof hit === 'string' ? hit : null;
}

function pickString(row: Record<string, unknown>, keys: string[], fallback = ''): string {
  for (const key of keys) {
    const value = row[key];
    if (typeof value === 'string' && value.trim() !== '') return value;
  }
  return fallback;
}

function pickOptionalString(row: Record<string, unknown>, keys: string[]): string | undefined {
  for (const key of keys) {
    const value = row[key];
    if (typeof value === 'string' && value.trim() !== '') return value;
  }
  return undefined;
}

function pickNumberishAsString(row: Record<string, unknown>, keys: string[], fallback = '0'): string {
  for (const key of keys) {
    const value = row[key];
    if (typeof value === 'number' || typeof value === 'string') return String(value);
  }
  return fallback;
}

/** Нормализует состав кейса из прода под контракт фронта в demo-сборке. */
export function normalizeDemoCaseItemsResponse(prodBody: Record<string, unknown>) {
  const data = (prodBody.data ?? {}) as Record<string, unknown>;
  const rawItems = Array.isArray(data.items) ? data.items : [];
  const items = rawItems
    .filter((x): x is Record<string, unknown> => x !== null && typeof x === 'object')
    .map((row) => ({
      ...row,
      id: String(row.id ?? ''),
      name: pickString(row, ['name', 'market_hash_name', 'title'], 'Unknown Item'),
      image_url: pickImageUrl(row),
      price: pickNumberishAsString(row, ['price', 'price_value', 'steam_price'], '0'),
      rarity: pickString(row, ['rarity'], 'common'),
      weapon_type: pickOptionalString(row, ['weapon_type']),
      drop_chance_percent:
        typeof row.drop_chance_percent === 'number'
          ? row.drop_chance_percent
          : typeof row.drop_chance === 'number'
            ? row.drop_chance
            : 0,
      is_excluded: Boolean(row.is_excluded),
      is_already_dropped: Boolean(row.is_already_dropped),
    }));

  return {
    ...prodBody,
    data: {
      ...data,
      items,
    },
  };
}

export async function fetchCaseTemplatesFromProd(): Promise<CaseTemplate[]> {
  const base = getDemoCatalogApiUrl();
  const r = await fetch(`${base}/v1/cases/available`, { credentials: 'omit' });
  if (!r.ok) return [];
  const j = (await r.json()) as { data?: CaseTemplate[] };
  return Array.isArray(j.data) ? j.data : [];
}

export async function resolveCaseTemplateByIdFromProd(id: string): Promise<CaseTemplate | null> {
  const all = await fetchCaseTemplatesFromProd();
  return all.find((c) => c.id === id) || null;
}

export async function fetchCaseTemplateItemsFromProd(templateId: string): Promise<unknown[]> {
  const base = getDemoCatalogApiUrl();
  const r = await fetch(`${base}/v1/case-templates/${templateId}/items`, { credentials: 'omit' });
  if (!r.ok) return [];
  const j = (await r.json()) as { data?: { items?: unknown[] } };
  return j.data?.items && Array.isArray(j.data.items) ? j.data.items : [];
}

/** Превращает ответ API в поле `item` для инвентаря после открытия кейса. */
export function prodDropRowToItem(row: Record<string, unknown>): Item {
  const price = row.price;
  const img = row.image_url;
  return {
    id: String(row.id ?? ''),
    name: String(row.name ?? ''),
    image_url: img != null && img !== '' ? String(img) : null,
    price: typeof price === 'number' || typeof price === 'string' ? String(price) : '0',
    rarity: typeof row.rarity === 'string' ? row.rarity : 'common',
    weapon_type: row.weapon_type != null ? String(row.weapon_type) : undefined,
  };
}

export function pickRandomDropFromProdItems(items: unknown[]): Item {
  const rows = items.filter((x): x is Record<string, unknown> => x !== null && typeof x === 'object');
  const eligible = rows.filter((i) => !i.is_excluded);
  const pool = eligible.length > 0 ? eligible : rows;
  if (pool.length === 0) {
    const fallback = DEMO_DROP_POOL[0];
    return { ...fallback, id: `drop-${Date.now()}-${Math.random().toString(36).slice(2, 9)}` };
  }
  const withW = pool.map((i) => {
    const w = typeof i.drop_chance_percent === 'number' ? i.drop_chance_percent : 1;
    return { i, w: w > 0 ? w : 0.0001 };
  });
  const sum = withW.reduce((s, x) => s + x.w, 0);
  let r = Math.random() * sum;
  for (const { i, w } of withW) {
    r -= w;
    if (r <= 0) {
      const it = prodDropRowToItem(i);
      return { ...it, id: `${it.id}-drop-${Date.now()}-${Math.random().toString(36).slice(2, 7)}` };
    }
  }
  const it = prodDropRowToItem(withW[0].i);
  return { ...it, id: `${it.id}-drop-${Date.now()}-${Math.random().toString(36).slice(2, 7)}` };
}
