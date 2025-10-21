import React, { memo, useState, useMemo, useCallback } from 'react';
import { LazyLoadImage } from 'react-lazy-load-image-component';
import { useInView } from 'react-intersection-observer';
import Monetary from '../../Monetary';
import { CaseItemProps } from '../types';
import 'react-lazy-load-image-component/src/effects/opacity.css';

export const CaseItem = memo(({
  item,
  index,
  animationIndex,
  showOpeningAnimation,
  sliderPosition,
  sliderOffset = 0,
  openingResult,
  animationPhase,
  caseData,
  showStrikeThrough,
  showGoldenSparks,
  showWinEffects,
  getRarityColor,
  generateGoldenSparks,
  t,
  isVisible = true
}: CaseItemProps) => {
  const [imageError, setImageError] = useState(false);

  // Intersection Observer для оптимизации рендеринга
  const { ref: inViewRef, inView } = useInView({
    threshold: 0,
    triggerOnce: false,
    rootMargin: '200px', // Загружаем элементы за 200px до появления
    skip: showOpeningAnimation // Отключаем во время анимации
  });

  // Рассчитываем состояния предмета
  const isCurrentSliderPosition = showOpeningAnimation && sliderPosition === animationIndex;
  const isNextSliderPosition = showOpeningAnimation && sliderPosition + 1 === animationIndex;
  const isBetweenItems = (animationPhase === 'wobbling' || animationPhase === 'falling') &&
                         (isCurrentSliderPosition || isNextSliderPosition);
  const isWinningItem = showOpeningAnimation && openingResult && openingResult.item.id === item.id;
  const isWinningItemStopped = animationPhase === 'stopped' && openingResult && openingResult.item.id === item.id;
  const isDailyCase = caseData.id === '44444444-4444-4444-4444-444444444444';

  // Оптимизированный обработчик ошибки изображения
  const handleImageError = useCallback(() => {
    setImageError(true);
  }, []);

  // Определяем, нужно ли применять GPU acceleration
  const shouldUseGPU = isCurrentSliderPosition || isWinningItemStopped;

  // Предвычисляем все классы CSS с мемоизацией
  const itemClasses = useMemo(() => {
    const baseClasses = `item-container bg-gray-800 rounded-lg p-2 border-2 relative ${getRarityColor(item.rarity)}`;
    const animationClasses = !showOpeningAnimation ? 'hover:scale-105 transition-transform duration-200' : '';
    const highlightClasses = isCurrentSliderPosition && animationPhase !== 'wobbling' ? 'ring-2 ring-yellow-400 z-10 border-yellow-400' : '';
    const betweenClasses = isBetweenItems ? 'ring-4 ring-orange-500 z-10 border-orange-500 shadow-2xl shadow-orange-500/50' : '';
    const winningClasses = isWinningItemStopped ? `ring-2 ring-green-400 z-20 border-green-400 ${showGoldenSparks ? 'victory-glow' : ''}` : '';
    const glowClasses = isWinningItemStopped && showStrikeThrough && isDailyCase ? 'animate-item-glow' : '';
    const excludedClasses = (item.isExcluded && !isWinningItem) || (isWinningItemStopped && showStrikeThrough && isDailyCase) ? 'opacity-50 grayscale' : '';
    const performanceClass = shouldUseGPU ? 'gpu-layer' : 'no-gpu-layer';
    const winEffectClass = isWinningItemStopped && showWinEffects ? 'item-pop-animation' : '';

    return `${baseClasses} ${animationClasses} ${highlightClasses} ${betweenClasses} ${winningClasses} ${glowClasses} ${excludedClasses} ${performanceClass} ${winEffectClass}`;
  }, [
    item.rarity, item.isExcluded, isCurrentSliderPosition, isBetweenItems, isWinningItem, isWinningItemStopped,
    showOpeningAnimation, showGoldenSparks, showStrikeThrough, isDailyCase, getRarityColor, shouldUseGPU, showWinEffects, animationPhase
  ]);

  // Динамические стили для визуальных эффектов в зависимости от фазы анимации
  const dynamicStyles = useMemo(() => {
    if (!showOpeningAnimation) return {};

    const styles: React.CSSProperties = {};

    switch (animationPhase) {
      case 'spinning':
      case 'speeding-up':
        // Легкий blur эффект при быстром вращении
        if (!isCurrentSliderPosition && !isWinningItemStopped) {
          styles.filter = 'blur(1px)';
          styles.transition = 'filter 0.15s ease-out';
        }
        break;
      case 'fake-slowing':
        // Пульсация во время fake slowdown
        if (!isWinningItemStopped) {
          styles.animation = 'fake-slow-pulse 0.6s ease-in-out';
        }
        break;
      case 'slowing':
        // Плавное убирание blur при замедлении
        styles.filter = 'blur(0px)';
        styles.transition = 'filter 0.3s ease-out';
        break;
      case 'wobbling':
        // Эффект перекатывания между предметами
        if (isCurrentSliderPosition) {
          // Текущий предмет: уменьшаем яркость и масштаб, как будто уходим от него
          const progress = sliderOffset / 0.3; // 0 -> 1
          // Начинаем с нормальных значений (1.0) и плавно переходим
          const brightness = 1 + (0.3 * (1 - progress)) - (0.5 * progress); // 1.3 -> 0.8
          const scale = 1 + (0.15 * (1 - progress)) - (0.1 * progress); // 1.15 -> 0.9
          const opacity = 1 - (0.3 * progress); // 1 -> 0.7
          const rotation = -3 * progress; // 0 -> -3
          styles.filter = `brightness(${brightness})`;
          styles.transform = `scale(${scale}) rotate(${rotation}deg)`;
          styles.opacity = opacity;
          styles.transition = 'filter 0.05s ease-out, transform 0.05s ease-out, opacity 0.05s ease-out';
        } else if (isNextSliderPosition) {
          // Следующий предмет: увеличиваем яркость и масштаб, как будто приближаемся к нему
          const progress = sliderOffset / 0.3; // 0 -> 1
          // Начинаем с нормальных значений и плавно увеличиваем
          const brightness = 1 - (0.2 * (1 - progress)) + (0.3 * progress); // 0.8 -> 1.3
          const scale = 1 - (0.1 * (1 - progress)) + (0.15 * progress); // 0.9 -> 1.15
          const opacity = 1 - (0.3 * (1 - progress)); // 0.7 -> 1
          const rotation = 3 * progress; // 0 -> 3
          styles.filter = `brightness(${brightness})`;
          styles.transform = `scale(${scale}) rotate(${rotation}deg)`;
          styles.opacity = opacity;
          styles.transition = 'filter 0.05s ease-out, transform 0.05s ease-out, opacity 0.05s ease-out';
        }
        break;
      case 'falling':
        // Во время падения
        if (isCurrentSliderPosition) {
          styles.filter = 'brightness(1.1)';
          styles.transform = 'scale(1.05)';
          styles.transition = 'filter 0.2s ease-out, transform 0.2s ease-out';
        }
        break;
      default:
        break;
    }

    return styles;
  }, [showOpeningAnimation, animationPhase, isCurrentSliderPosition, isNextSliderPosition, isWinningItemStopped, sliderOffset]);

  // Рендерим заглушку для невидимых элементов
  if (!isVisible) {
    return <div className="bg-gray-800 rounded-lg p-2 border-2 border-gray-400 opacity-0" style={{ height: '200px' }} />;
  }

  // Рендерим упрощенную версию для элементов вне области видимости (если не в анимации)
  const shouldRenderSimplified = !inView && !showOpeningAnimation && !isCurrentSliderPosition && !isWinningItemStopped;

  return (
    <div
      ref={inViewRef}
      key={item.id || index}
      data-item-index={animationIndex}
      className={itemClasses}
      style={dynamicStyles}
    >
      {shouldRenderSimplified ? (
        // Упрощенная версия для элементов вне области видимости
        <div className="aspect-square mb-2 bg-gray-900 rounded" style={{ minHeight: '150px' }} />
      ) : (
        <div className="aspect-square mb-2 bg-gray-900 rounded flex items-center justify-center relative">
          {item.image_url && !imageError ? (
            <LazyLoadImage
              src={item.image_url}
              alt={item.name}
              effect="opacity"
              className={`max-w-full max-h-full object-contain optimized-image ${
                item.isExcluded ? 'opacity-70' : ''
              }`}
              threshold={100}
              placeholder={
                <div className="w-full h-full bg-gray-900 animate-pulse" />
              }
              onError={handleImageError}
              wrapperClassName="w-full h-full flex items-center justify-center"
            />
          ) : (
            <div className="text-gray-500 text-xs text-center">
              {t('case_preview_modal.no_image')}
            </div>
          )}

          {/* Оптимизированное перечеркивание */}
          {!shouldRenderSimplified && ((item.isExcluded && !(showOpeningAnimation && isWinningItem)) || (isWinningItemStopped && showStrikeThrough && isDailyCase)) && (
            <div className="absolute inset-0 z-20">
              <div className={`absolute inset-0 bg-black bg-opacity-40 ${
                isWinningItemStopped && showStrikeThrough ? 'animate-overlay-fade' : ''
              }`} />

              <div className="absolute inset-0 flex items-center justify-center">
                <div className={`absolute bg-red-500 rounded-full ${
                  isWinningItemStopped && showStrikeThrough ? 'animate-cross-line-1' : 'w-0 h-0 opacity-0'
                }`} style={{ transform: 'rotate(45deg)' }} />

                <div className={`absolute bg-red-500 rounded-full ${
                  isWinningItemStopped && showStrikeThrough ? 'animate-cross-line-2' : 'w-0 h-0 opacity-0'
                }`} style={{ transform: 'rotate(-45deg)' }} />
              </div>

              {isWinningItemStopped && showStrikeThrough && (
                <div className="absolute top-1 right-1 animate-checkmark-bounce">
                  <div className="bg-green-500 text-white text-xs px-1 py-0.5 rounded font-bold">
                    ✓
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Эффект золотых искр только для выигранного предмета */}
          {!shouldRenderSimplified && showGoldenSparks && isWinningItemStopped && (
            <div className="absolute inset-0 pointer-events-none z-50">
              {generateGoldenSparks()}
            </div>
          )}

          {/* КРУТЫЕ ЭФФЕКТЫ ПОБЕДЫ */}
          {!shouldRenderSimplified && showWinEffects && isWinningItemStopped && (
            <>
              {/* Расходящиеся кольца */}
              <div className="expanding-ring" />
              <div className="expanding-ring" />
              <div className="expanding-ring" />

              {/* Световые лучи */}
              <div className="light-ray" style={{ animationDelay: '0s' }} />
              <div className="light-ray" style={{ animationDelay: '0.3s', transform: 'rotate(45deg)' }} />
              <div className="light-ray" style={{ animationDelay: '0.6s', transform: 'rotate(90deg)' }} />

              {/* Particle burst эффект */}
              {Array.from({ length: 12 }).map((_, i) => {
                const angle = (i * 30) * Math.PI / 180;
                const distance = 60 + Math.random() * 40;
                const tx = Math.cos(angle) * distance;
                const ty = Math.sin(angle) * distance;
                const colors = ['#FFD700', '#FFA500', '#FF6B6B', '#4ECDC4', '#A78BFA', '#F472B6'];
                const color = colors[i % colors.length];

                return (
                  <div
                    key={i}
                    className="particle-burst"
                    style={{
                      '--tx': `${tx}px`,
                      '--ty': `${ty}px`,
                      background: color,
                      animationDelay: `${i * 0.05}s`,
                      left: '50%',
                      top: '50%',
                      boxShadow: `0 0 10px ${color}`,
                    } as React.CSSProperties}
                  />
                );
              })}
            </>
          )}
        </div>
      )}

      {!shouldRenderSimplified && (
        <div className="text-center">
          <h3 className="text-white font-semibold text-sm mb-1 overflow-hidden"
              style={{
                display: '-webkit-box',
                WebkitLineClamp: 2,
                WebkitBoxOrient: 'vertical',
                lineHeight: '1.2em',
                maxHeight: '2.4em'
              }}>
            {item.name}
          </h3>

          {item.rarity && (
            <p className={`text-xs mb-2 ${getRarityColor(item.rarity).split(' ')[0]}`}>
              {item.rarity}
            </p>
          )}

          <p className="text-green-400 font-bold text-sm">
            <Monetary value={parseFloat(item.price || '0')} />
          </p>

          {!showOpeningAnimation && (
            <div className="text-xs mt-1">
              {item.isExcluded ? (
                <p className="text-red-400 font-bold">
                  {t('case_preview_modal.already_received')}
                </p>
              ) : (
                <p className="text-gray-400">
                  {t('case_preview_modal.chance')} {item.drop_chance_percent ? `${item.drop_chance_percent < 0.01 ? item.drop_chance_percent.toFixed(6) : item.drop_chance_percent.toFixed(2)}%` : '0%'}
                  {item.bonusApplied > 0 && parseFloat(item.price || '0') >= 100 && (
                    <span className="text-yellow-400 ml-1">
                      (+{(item.bonusApplied * 100).toFixed(2)}% {t('case_preview_modal.bonus')})
                    </span>
                  )}
                </p>
              )}
            </div>
          )}

          {showOpeningAnimation && isWinningItemStopped && showStrikeThrough && isDailyCase && (
            <div className="text-xs mt-1">
              <p className="text-red-400 font-bold">
                {t('case_preview_modal.received')}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
});

CaseItem.displayName = 'CaseItem';
