/**
 * Визуальные near-miss для рулетки: соседние слоты у выигрыша показывают
 * дорогие предметы из пула. Результат с сервера не меняется.
 */

export type RoulettePoolItem = {
  id: string;
  name: string;
  image_url: string | null;
  price?: string | number;
  rarity?: string;
  isExcluded?: boolean;
};

function parsePrice(item: RoulettePoolItem): number {
  const raw = typeof item.price === 'string' ? parseFloat(item.price) : Number(item.price);
  return Number.isFinite(raw) ? raw : 0;
}

/**
 * Выбирает 1–2 «дорогих» предмета для соседних ячеек у выигрыша.
 */
export function pickNearMissTeasers(
  pool: RoulettePoolItem[],
  wonItemId: string,
  count: number,
  casePrice = 0
): RoulettePoolItem[] {
  const eligible = pool.filter((item) => !item.isExcluded && item.id !== wonItemId);
  if (!eligible.length || count <= 0) return [];

  const won = pool.find((item) => item.id === wonItemId);
  const wonPrice = won ? parsePrice(won) : 0;

  const byPriceDesc = [...eligible].sort((a, b) => parsePrice(b) - parsePrice(a));

  const premium = byPriceDesc.filter((item) => {
    const price = parsePrice(item);
    if (wonPrice > 0) return price >= wonPrice * 1.08;
    if (casePrice > 0) return price >= casePrice * 1.15;
    return price > 0;
  });

  const source = premium.length > 0 ? premium : byPriceDesc;
  const picked: RoulettePoolItem[] = [];
  const used = new Set<string>();

  for (const item of source) {
    if (picked.length >= count) break;
    if (used.has(item.id)) continue;
    picked.push(item);
    used.add(item.id);
  }

  for (const item of byPriceDesc) {
    if (picked.length >= count) break;
    if (!used.has(item.id)) {
      picked.push(item);
      used.add(item.id);
    }
  }

  return picked;
}

export function isRouletteNearMissEnabled(): boolean {
  if (typeof window !== 'undefined') {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return false;
  }
  const flag = import.meta.env.VITE_ROULETTE_NEAR_MISS;
  return flag !== 'false' && flag !== '0';
}

/**
 * Подменяет предметы в соседних слотах у targetIndex (только отображение).
 */
export function injectNearMissIntoStrip<T extends RoulettePoolItem>(
  strip: T[],
  targetIndex: number,
  wonItemId: string,
  pool: T[],
  options: { casePrice?: number; enabled?: boolean } = {}
): T[] {
  const enabled = options.enabled ?? isRouletteNearMissEnabled();
  if (!enabled || targetIndex < 0 || targetIndex >= strip.length) {
    return strip;
  }

  const teasers = pickNearMissTeasers(pool, wonItemId, 2, options.casePrice ?? 0);
  if (!teasers.length) return strip;

  const result = strip.slice();
  const neighbors = [targetIndex - 1, targetIndex + 1].filter(
    (slotIndex) => slotIndex >= 0 && slotIndex < result.length
  );
  if (!neighbors.length) return result;

  const won = pool.find((item) => item.id === wonItemId);
  const wonPrice = won ? parsePrice(won) : 0;
  const primary = teasers[0];
  const primaryPrice = parsePrice(primary);
  const minTeaserPrice = Math.max(wonPrice * 1.05, primaryPrice * 0.95, (options.casePrice ?? 0) * 1.1);
  const secondary =
    teasers[1] && parsePrice(teasers[1]) >= minTeaserPrice ? teasers[1] : primary;

  const assignments =
    neighbors.length >= 2 ? [primary, secondary] : [primary];

  neighbors.forEach((slotIndex, i) => {
    const teaser = assignments[i] ?? primary;
    result[slotIndex] = { ...result[slotIndex], ...teaser };
  });

  return result;
}
