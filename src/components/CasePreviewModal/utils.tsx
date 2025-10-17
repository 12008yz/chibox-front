import React from 'react';
import { DEFAULT_CASE_IMAGES } from './constants';

export const getRarityColor = (rarity: string): string => {
  switch (rarity?.toLowerCase()) {
    case 'mil-spec':
    case 'consumer':
      return 'text-blue-400 border-blue-400';
    case 'restricted':
      return 'text-purple-400 border-purple-400';
    case 'classified':
      return 'text-pink-400 border-pink-400';
    case 'covert':
      return 'text-red-400 border-red-400';
    case 'special':
    case 'extraordinary':
      return 'text-yellow-400 border-yellow-400';
    default:
      return 'text-gray-400 border-gray-400';
  }
};

// Оптимизированная генерация золотых искр с мемоизацией
const sparkCache = new Map<number, React.ReactNode[]>();

export const generateGoldenSparks = (seed: number = 0): React.ReactNode[] => {
  // Используем кеш для одинаковых наборов искр
  if (sparkCache.has(seed)) {
    return sparkCache.get(seed)!;
  }

  const sparks: React.ReactNode[] = [];
  const sparkCount = 6;

  for (let i = 0; i < sparkCount; i++) {
    const angle = (i * 360) / sparkCount;
    const distance = 40 + (seed % 15); // Детерминированное расстояние
    const dx = Math.cos(angle * Math.PI / 180) * distance;
    const dy = Math.sin(angle * Math.PI / 180) * distance;

    sparks.push(
      <div
        key={i}
        className="golden-spark"
        style={{
          ['--dx' as any]: `${dx}px`,
          ['--dy' as any]: `${dy}px`,
          animationDelay: `${i * 0.1}s`,
          left: '50%',
          top: '50%',
          transform: 'translate3d(-50%, -50%, 0)',
          willChange: 'transform, opacity'
        } as React.CSSProperties}
      />
    );
  }

  // Сохраняем в кеш, но ограничиваем размер кеша
  if (sparkCache.size > 10) {
    const firstKey = sparkCache.keys().next().value;
    if (firstKey !== undefined) {
      sparkCache.delete(firstKey);
    }
  }
  sparkCache.set(seed, sparks);

  return sparks;
};

export const getDefaultCaseImage = (caseName: string): string => {
  const hash = caseName.split('').reduce((a, b) => {
    a = ((a << 5) - a) + b.charCodeAt(0);
    return a & a;
  }, 0);
  return DEFAULT_CASE_IMAGES[Math.abs(hash) % DEFAULT_CASE_IMAGES.length];
};
