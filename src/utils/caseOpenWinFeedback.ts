import { soundManager } from './soundManager';

export type CaseWinTier = 'normal' | 'good' | 'rare' | 'jackpot';

const JACKPOT_RARITIES = new Set(['contraband', 'covert']);
const RARE_RARITIES = new Set([
  'restricted',
  'classified',
  'covert',
  'contraband',
  'rare',
  'legendary',
  'epic',
  'mythical',
]);

/**
 * Уровень «ощущения» выигрыша для звуков и FX рулетки.
 */
export function getCaseWinTier(
  itemPrice: number,
  casePrice: number,
  rarity?: string | null
): CaseWinTier {
  const price = Number.isFinite(itemPrice) ? itemPrice : 0;
  const caseCost = Number.isFinite(casePrice) ? casePrice : 0;
  const r = (rarity || '').toLowerCase();

  if (JACKPOT_RARITIES.has(r) || price >= Math.max(1000, caseCost * 2.5)) {
    return 'jackpot';
  }
  if (RARE_RARITIES.has(r) || (caseCost > 0 && price >= caseCost * 1.2)) {
    return 'rare';
  }
  if (caseCost > 0 && price >= caseCost * 0.85) {
    return 'good';
  }
  return 'normal';
}

export function shouldShowGoldenSparks(tier: CaseWinTier): boolean {
  return tier === 'rare' || tier === 'jackpot';
}

export function shouldShowWinEffects(tier: CaseWinTier): boolean {
  return tier !== 'normal';
}

/**
 * Доп. звук поверх endProcess (рулетка).
 */
export function playCaseWinTierSound(tier: CaseWinTier): void {
  switch (tier) {
    case 'jackpot':
      soundManager.play('win', false, true);
      break;
    case 'rare':
      soundManager.play('upgrade', false, true);
      break;
    case 'good':
      soundManager.play('upgrade', false, false);
      break;
    default:
      break;
  }
}
