import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

export const BANNER_IMAGES = [
  '/images/banners/tma.jpg',
  '/images/banners/календарь.png',
  '/images/banners/Карта.png',
  '/images/banners/линия.png',
];

/** Иконки соцсетей (как в подвале) */
const IconTelegram = () => (
  <svg width="22" height="22" viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg" fill="currentColor" className="shrink-0">
    <path d="M16 8A8 8 0 1 1 0 8a8 8 0 0 1 16 0zM8.287 5.906c-.778.324-2.334.994-4.666 2.01-.378.15-.577.298-.595.442-.03.243.275.339.69.47l.175.055c.408.133.958.288 1.243.294.26.006.549-.1.868-.32 2.179-1.471 3.304-2.214 3.374-2.23.05-.012.12-.026.166.016.047.041.042.12.037.141-.03.129-1.227 1.241-1.846 1.817-.193.18-.33.307-.358.336a8.154 8.154 0 0 1-.188.186c-.38.366-.664.64.015 1.088.327.216.589.393.85.571.284.194.568.387.936.629.093.06.183.125.27.187.331.236.63.448.997.414.214-.02.435-.22.547-.82.265-1.417.786-4.486.906-5.751a1.426 1.426 0 0 0-.013-.315.337.337 0 0 0-.114-.217.526.526 0 0 0-.31-.093c-.3.005-.763.166-2.984 1.09z" />
  </svg>
);
const IconVK = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" width="22" height="22" viewBox="-2.5 0 32 32" className="shrink-0">
    <path d="M16.563 15.75c-0.5-0.188-0.5-0.906-0.531-1.406-0.125-1.781 0.5-4.5-0.25-5.656-0.531-0.688-3.094-0.625-4.656-0.531-0.438 0.063-0.969 0.156-1.344 0.344s-0.75 0.5-0.75 0.781c0 0.406 0.938 0.344 1.281 0.875 0.375 0.563 0.375 1.781 0.375 2.781 0 1.156-0.188 2.688-0.656 2.75-0.719 0.031-1.125-0.688-1.5-1.219-0.75-1.031-1.5-2.313-2.063-3.563-0.281-0.656-0.438-1.375-0.844-1.656-0.625-0.438-1.75-0.469-2.844-0.438-1 0.031-2.438-0.094-2.719 0.5-0.219 0.656 0.25 1.281 0.5 1.813 1.281 2.781 2.656 5.219 4.344 7.531 1.563 2.156 3.031 3.875 5.906 4.781 0.813 0.25 4.375 0.969 5.094 0 0.25-0.375 0.188-1.219 0.313-1.844s0.281-1.25 0.875-1.281c0.5-0.031 0.781 0.406 1.094 0.719 0.344 0.344 0.625 0.625 0.875 0.938 0.594 0.594 1.219 1.406 1.969 1.719 1.031 0.438 2.625 0.313 4.125 0.25 1.219-0.031 2.094-0.281 2.188-1 0.063-0.563-0.563-1.375-0.938-1.844-0.938-1.156-1.375-1.5-2.438-2.563-0.469-0.469-1.063-0.969-1.063-1.531-0.031-0.344 0.25-0.656 0.5-1 1.094-1.625 2.188-2.781 3.188-4.469 0.281-0.5 0.938-1.656 0.688-2.219-0.281-0.625-1.844-0.438-2.813-0.438-1.25 0-2.875-0.094-3.188 0.156-0.594 0.406-0.844 1.063-1.125 1.688-0.625 1.438-1.469 2.906-2.344 4-0.313 0.375-0.906 1.156-1.25 1.031z" />
  </svg>
);

/** Контент поверх слайда: заголовок слева сверху, подпись справа внизу, опционально links или cta */
export const BANNER_SLIDE_CONTENT: Record<
  number,
  {
    title: string;
    subtitle?: string;
    links?: { label: string; url: string; icon: 'vk' | 'telegram' }[];
    cta?: { label: string; url: string };
  }
> = {
  0: {
    title: 'Мы там, где всё происходит.',
    subtitle: 'Подписывайся — не отставай',
    links: [
      { label: 'ВКонтакте', url: 'https://vk.com/chibox_game', icon: 'vk' },
      { label: 'Telegram', url: 'https://t.me/chibox_official', icon: 'telegram' },
    ],
  },
  1: {
    title: 'Один статус — все привилегии сервиса.',
    subtitle: 'Ты в плюсе.',
    cta: { label: 'Оформить статус', url: '/upgrade' },
  },
  2: {
    title: 'Собери сеты. Апгрейдни. Забирай топ-дроп.',
    cta: { label: 'В апгрейд', url: '/upgrade' },
  },
  3: {
    title: 'Забрал дроп — решай сам',
    subtitle: 'в инвентарь, в обмен или на вывод.',
  },
};

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
  height = 'h-[42vh] min-h-[220px] md:h-[380px]',
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

  useEffect(() => {
    if (items.length <= 1 || autoPlayInterval <= 0) return;
    const id = setInterval(next, autoPlayInterval);
    return () => clearInterval(id);
  }, [items.length, autoPlayInterval, current, next]);

  if (items.length === 0) return null;

  return (
    <div
      className={`w-full overflow-hidden rounded-none md:rounded-xl ${height} relative bg-dark-800 border-0 md:border border-white/5`}
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
          {/* Текст и кнопки для слайда (индекс из BANNER_SLIDE_CONTENT) */}
          {BANNER_SLIDE_CONTENT[current] && (
            <>
              {/* Слайд с cta: текст слева внизу, кнопка справа внизу, косые углы у кнопки */}
              {BANNER_SLIDE_CONTENT[current].cta ? (
                <div
                  className="absolute left-4 right-4 md:left-10 md:right-10 z-10 flex flex-wrap items-center justify-between gap-2 md:gap-3 pointer-events-none"
                  style={{ bottom: 40 }}
                >
                  <div className="pointer-events-auto flex flex-wrap items-center gap-1.5 md:gap-3">
                    <span
                      className="text-white text-sm md:text-xl lg:text-2xl font-bold drop-shadow-[0_2px_8px_rgba(0,0,0,0.8)]"
                      style={{ textShadow: '0 0 24px rgba(0,0,0,0.6)' }}
                    >
                      {BANNER_SLIDE_CONTENT[current].title}
                    </span>
                    {BANNER_SLIDE_CONTENT[current].subtitle && (
                      <>
                        <span className="text-white/90 text-sm md:text-xl lg:text-2xl font-semibold">—</span>
                        <span
                          className="text-white text-sm md:text-xl lg:text-2xl font-semibold drop-shadow-[0_2px_8px_rgba(0,0,0,0.8)]"
                          style={{ textShadow: '0 0 24px rgba(0,0,0,0.6)' }}
                        >
                          {BANNER_SLIDE_CONTENT[current].subtitle}
                        </span>
                      </>
                    )}
                  </div>
                  <Link
                    to={BANNER_SLIDE_CONTENT[current].cta!.url}
                    className="pointer-events-auto inline-flex items-center justify-center px-3 py-2 md:px-5 md:py-2.5 text-xs md:text-sm font-semibold text-white bg-white/15 border border-white/25 hover:bg-white/25 hover:border-white/40 transition-all duration-300 shrink-0"
                    style={{ clipPath: 'polygon(8px 0%, 100% 0%, calc(100% - 8px) 100%, 0% 100%)' }}
                  >
                    {BANNER_SLIDE_CONTENT[current].cta!.label}
                  </Link>
                </div>
              ) : (
                <>
                  {/* Заголовок и иконки — слева сверху, иконки под первым слоганом */}
                  <div className="absolute top-4 md:top-8 lg:top-10 left-4 md:left-10 z-10 pointer-events-none">
                    <div className="pointer-events-auto">
                      <p
                        className="text-white text-base md:text-2xl lg:text-3xl font-bold leading-tight drop-shadow-[0_2px_8px_rgba(0,0,0,0.8)]"
                        style={{ textShadow: '0 0 24px rgba(0,0,0,0.6)' }}
                      >
                        {BANNER_SLIDE_CONTENT[current].title}
                      </p>
                      {BANNER_SLIDE_CONTENT[current].links && BANNER_SLIDE_CONTENT[current].links!.length > 0 && (
                        <div className="mt-2 md:mt-3 flex flex-wrap gap-2 md:gap-3">
                          {BANNER_SLIDE_CONTENT[current].links!.map((link, i) => (
                            <a
                              key={i}
                              href={link.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1.5 md:gap-2 px-3 py-2 md:px-5 md:py-2.5 rounded-full text-xs md:text-sm font-semibold text-white bg-white/15 border border-white/25 hover:bg-white/25 hover:border-white/40 transition-all duration-300"
                            >
                              {link.icon === 'telegram' && <IconTelegram />}
                              {link.icon === 'vk' && <IconVK />}
                              {link.label}
                            </a>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                  {/* Второй слоган — справа внизу, 40px от низа */}
                  {BANNER_SLIDE_CONTENT[current].subtitle && (
                    <div
                      className="absolute right-4 md:right-10 z-10 text-right pointer-events-none"
                      style={{ bottom: 40 }}
                    >
                      <p
                        className="text-white text-sm md:text-xl lg:text-2xl font-semibold leading-tight drop-shadow-[0_2px_8px_rgba(0,0,0,0.8)]"
                        style={{ textShadow: '0 0 24px rgba(0,0,0,0.6)' }}
                      >
                        {BANNER_SLIDE_CONTENT[current].subtitle}
                      </p>
                    </div>
                  )}
                </>
              )}
            </>
          )}
        </motion.div>
      </AnimatePresence>

      {items.length > 1 && (
        <>
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
