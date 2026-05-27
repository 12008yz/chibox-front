import type { LiveDropData } from '../types/socket';

export type LiveDropTier = 'normal' | 'high' | 'rare' | 'jackpot';

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

export function getLiveDropTier(drop: LiveDropData): LiveDropTier {
  if (drop.isHighlighted) return 'jackpot';
  if (drop.isRare) return 'rare';
  if (drop.item.price >= 100) return 'high';
  return 'normal';
}

export function getLiveDropTierClass(tier: LiveDropTier): string {
  switch (tier) {
    case 'jackpot':
      return 'live-drop-tier-jackpot';
    case 'rare':
      return 'live-drop-tier-rare';
    case 'high':
      return 'live-drop-tier-high';
    default:
      return '';
  }
}

export function getLiveDropEnterAnimation(tier: LiveDropTier): string {
  switch (tier) {
    case 'jackpot':
      return 'animate-live-drop-jackpot';
    case 'rare':
      return 'animate-live-drop-rare';
    default:
      return 'animate-slideInLeft';
  }
}

export function isRareRarity(rarity?: string | null): boolean {
  return RARE_RARITIES.has((rarity || '').toLowerCase());
}
