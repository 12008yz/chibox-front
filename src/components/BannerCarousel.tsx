import React, { useState, useEffect, useCallback } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export const BANNER_IMAGES = [
  '/images/banners/tma.png',
  '/images/banners/календарь.png',
  '/images/banners/Карта.png',
  '/images/banners/линия.png',
];

const CAROUSEL_GLOW_STYLE = {
  boxShadow: '0 0 20px rgba(99, 102, 241, 0.3), 0 0 32px rgba(251, 146, 60, 0.2)',
};

interface BannerCarouselProps {
  /** Пути к изображениям (из public). По умолчанию — BANNER_IMAGES */
  images?: string[];
  /** Интервал автопрокрутки в мс. 0 = без автопрокрутки */
  autoPlayInterval?: number;
  /** Высота карусели (Tailwind класс или число в px) */
  height?: string;
}

const BannerCarousel: React.FC<BannerCarouselProps> = ({
  images = BANNER_IMAGES,
  autoPlayInterval = 5000,
  height = 'h-[280px] md:h-[380px]',
}) => {
  const [current, setCurrent] = useState(0);
  const items = images.filter(Boolean);

  const goTo = useCallback(
    (index: number) => {
      setCurrent((index + items.length) % items.length);
    },
    [items.length]
  );

  const next = useCallback(() => goTo(current + 1), [current, goTo]);
  const prev = useCallback(() => goTo(current - 1), [current, goTo]);

  useEffect(() => {
    if (items.length <= 1 || autoPlayInterval <= 0) return;
    const id = setInterval(next, autoPlayInterval);
    return () => clearInterval(id);
  }, [items.length, autoPlayInterval, current, next]);

  if (items.length === 0) return null;

  return (
    <div
      className={`w-full overflow-hidden rounded-xl ${height} relative bg-dark-800 border border-white/5`}
      style={CAROUSEL_GLOW_STYLE}
    >
      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={current}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.4 }}
          className="absolute inset-0"
        >
          <img
            src={items[current]}
            alt=""
            className="w-full h-full object-cover"
            loading={current === 0 ? 'eager' : 'lazy'}
            onError={(e) => {
              e.currentTarget.style.display = 'none';
            }}
          />
          {/* Градиент снизу для читаемости точек и плавного перехода в фон */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background: 'linear-gradient(to top, rgba(13, 11, 20, 0.85) 0%, transparent 35%, transparent 100%)',
            }}
          />
        </motion.div>
      </AnimatePresence>

      {items.length > 1 && (
        <>
          <button
            type="button"
            onClick={prev}
            className="absolute left-3 top-1/2 -translate-y-1/2 z-10 w-11 h-11 rounded-full bg-dark-800/90 border border-white/10 flex items-center justify-center text-white transition-all duration-300 hover:border-indigo-500/50 hover:bg-dark-700/95"
            style={{ boxShadow: '0 4px 20px rgba(0,0,0,0.4)' }}
            aria-label="Предыдущий баннер"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
          <button
            type="button"
            onClick={next}
            className="absolute right-3 top-1/2 -translate-y-1/2 z-10 w-11 h-11 rounded-full bg-dark-800/90 border border-white/10 flex items-center justify-center text-white transition-all duration-300 hover:border-orange-400/50 hover:bg-dark-700/95"
            style={{ boxShadow: '0 4px 20px rgba(0,0,0,0.4)' }}
            aria-label="Следующий баннер"
          >
            <ChevronRight className="w-6 h-6" />
          </button>

          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-10 flex gap-2">
            {items.map((_, i) => (
              <button
                key={i}
                type="button"
                onClick={() => goTo(i)}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  i === current
                    ? 'w-6 bg-gradient-to-r from-indigo-500 via-orange-400 to-amber-500'
                    : 'w-1.5 bg-white/40 hover:bg-white/60'
                }`}
                style={i === current ? { boxShadow: '0 0 12px rgba(99, 102, 241, 0.5), 0 0 16px rgba(251, 146, 60, 0.3)' } : undefined}
                aria-label={`Баннер ${i + 1}`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default BannerCarousel;
