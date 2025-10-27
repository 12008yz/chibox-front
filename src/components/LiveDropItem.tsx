import React from 'react';
import { Link } from 'react-router-dom';
import { LiveDropData } from '../types/socket';
import Monetary from './Monetary';

interface LiveDropItemProps {
  drop: LiveDropData;
}

const getRarityColor = (rarity: string) => {
  if (!rarity) return 'border-gray-400 shadow-gray-400/30 bg-gray-400/5';
  switch (rarity.toLowerCase()) {
    case 'contraband':
      return 'border-orange-500 shadow-orange-500/30 bg-orange-500/5';
    case 'covert':
      return 'border-red-500 shadow-red-500/30 bg-red-500/5';
    case 'classified':
      return 'border-pink-500 shadow-pink-500/30 bg-pink-500/5';
    case 'restricted':
      return 'border-purple-500 shadow-purple-500/30 bg-purple-500/5';
    case 'mil-spec':
      return 'border-blue-500 shadow-blue-500/30 bg-blue-500/5';
    case 'industrial':
      return 'border-cyan-500 shadow-cyan-500/30 bg-cyan-500/5';
    case 'consumer':
      return 'border-gray-500 shadow-gray-500/30 bg-gray-500/5';
    default:
      return 'border-gray-400 shadow-gray-400/30 bg-gray-400/5';
  }
};

const LiveDropItem: React.FC<LiveDropItemProps> = ({ drop }) => {
  const rarityColor = getRarityColor(drop.item.rarity);
  const isHighValue = drop.item.price >= 100;

  return (
    <Link
      to={`/user/${drop.user.id}`}
      className="block"
      title={`Перейти к профилю ${drop.user.username}`}
    >
      <div
        className={`
          relative w-40 h-44 rounded-lg border-2 p-4
          ${drop.isHighlighted ? 'border-yellow-400 shadow-yellow-400/40 bg-yellow-400/10 shadow-lg' : rarityColor}
          transition-all duration-300 hover:scale-105 hover:shadow-xl cursor-pointer
          ${isHighValue ? 'animate-pulse' : ''}
          backdrop-blur-sm overflow-visible
        `}
        style={{
          margin: '4px' // Добавляем отступ чтобы shadow и border не обрезались
        }}
      >
        {/* Спец эффекты для редких предметов */}
        {drop.isRare && (
          <div className="absolute -top-2 -right-2 z-20">
            <div className="bg-orange-500 text-white text-xs font-bold px-2 py-1 rounded-full shadow-lg">
              🔥
            </div>
          </div>
        )}

        {drop.isHighlighted && (
          <div className="absolute -top-2 -left-2 z-20">
            <div className="bg-yellow-500 text-black text-xs font-bold px-2 py-1 rounded-full shadow-lg">
              ⭐
            </div>
          </div>
        )}

        {/* Аватар пользователя (сверху слева) */}
        <div className="absolute top-3 left-3 z-10">
          <div className="block" title={`${drop.user.username} (Ур. ${drop.user.level})`}>
            {drop.user.avatar ? (
              <img
                src={drop.user.avatar}
                alt={drop.user.username}
                className="w-7 h-7 rounded-full border-2 border-gray-600 hover:border-white transition-colors"
              />
            ) : (
              <div className="w-7 h-7 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center border-2 border-gray-600 hover:border-white transition-colors">
                <span className="text-white text-xs font-bold">
                  {drop.user.username.charAt(0).toUpperCase()}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Время (сверху справа) */}
        <div className="absolute top-3 right-3 text-xs text-gray-400 font-mono">
          {new Date(drop.dropTime).toLocaleTimeString('ru-RU', {
            hour: '2-digit',
            minute: '2-digit'
          })}
        </div>

        {/* Изображение предмета (центр) */}
        <div className="flex items-center justify-center mt-6 mb-3">
          <div
            className="w-20 h-20 flex items-center justify-center bg-gray-800/30 rounded-lg border border-gray-700/20 live-drop-image-container"
            style={{
              filter: 'none',
              mixBlendMode: 'normal',
              colorScheme: 'light',
              isolation: 'isolate'
            }}
          >
            <img
              src={drop.item.image}
              alt={drop.item.name}
              className="max-w-18 max-h-18 object-contain live-drop-item"
              style={{
                filter: 'none !important',
                backgroundColor: 'transparent !important',
                imageRendering: 'auto',
                mixBlendMode: 'normal',
                opacity: 1,
                colorScheme: 'normal'
              }}
              onError={(e) => {
                // Если изображение не загружается, заменяем на иконку
                const target = e.target as HTMLImageElement;
                target.style.display = 'none';
                const parent = target.parentElement;
                if (parent && !parent.querySelector('.fallback-icon')) {
                  const fallbackIcon = document.createElement('div');
                  fallbackIcon.className = 'fallback-icon text-gray-400 text-2xl flex items-center justify-center';
                  fallbackIcon.innerHTML = '📦';
                  parent.appendChild(fallbackIcon);
                }
              }}
              onLoad={(e) => {
                // Убеждаемся что изображение отображается корректно
                const target = e.target as HTMLImageElement;
                target.style.display = 'block';

                // Принудительно убираем любые фильтры и эффекты
                target.style.setProperty('filter', 'none', 'important');
                target.style.setProperty('-webkit-filter', 'none', 'important');
                target.style.setProperty('mix-blend-mode', 'normal', 'important');
                target.style.setProperty('opacity', '1', 'important');
                target.style.setProperty('background-color', 'transparent', 'important');
                target.style.setProperty('background', 'transparent', 'important');
                target.style.setProperty('color-scheme', 'light', 'important');
                target.style.setProperty('forced-color-adjust', 'none', 'important');
                target.style.setProperty('image-rendering', 'auto', 'important');
                target.style.setProperty('isolation', 'auto', 'important');

                // Отладочная информация - можно убрать после исправления
                const computedStyle = getComputedStyle(target);
                const parentStyle = target.parentElement ? getComputedStyle(target.parentElement) : null;

                console.log('LiveDrop image loaded:', {
                  src: target.src,
                  filter: computedStyle.filter,
                  mixBlendMode: computedStyle.mixBlendMode,
                  colorScheme: computedStyle.colorScheme,
                  opacity: computedStyle.opacity,
                  transform: computedStyle.transform,
                  imageRendering: computedStyle.imageRendering,
                  // Проверяем родительские стили
                  parentFilter: parentStyle?.filter,
                  parentMixBlendMode: parentStyle?.mixBlendMode,
                  parentColorScheme: parentStyle?.colorScheme,
                  // Проверяем HTML атрибуты
                  htmlColorScheme: document.documentElement.style.colorScheme,
                  bodyColorScheme: document.body.style.colorScheme,
                  // Проверяем CSS переменные
                  rootComputedStyle: getComputedStyle(document.documentElement).colorScheme
                });

                // Дополнительная проверка через небольшую задержку
                setTimeout(() => {
                  if (target && target.style) {
                    target.style.setProperty('filter', 'none', 'important');
                    target.style.setProperty('mix-blend-mode', 'normal', 'important');

                    // Дополнительная отладка
                    const computedStyle = getComputedStyle(target);
                    if (computedStyle.filter !== 'none') {
                      console.warn('Filter still applied after timeout:', computedStyle.filter);
                    }
                    if (computedStyle.mixBlendMode !== 'normal') {
                      console.warn('Mix-blend-mode still applied:', computedStyle.mixBlendMode);
                    }
                  }
                }, 100);
              }}
            />
          </div>
        </div>

        {/* Информация о предмете (низ) */}
        <div className="absolute bottom-0 left-0 right-0 p-3">
          <div className="text-xs text-white font-medium truncate mb-2" title={drop.item.name}>
            {drop.item.name}
          </div>

          {/* Цена */}
          <div className="flex items-center justify-center">
            <span className="text-sm font-bold text-green-400">
              <Monetary value={drop.item.price} iconSize="xs" />
            </span>
          </div>
        </div>

        {/* Эффект свечения для дорогих предметов */}
        {isHighValue && (
          <div className="absolute inset-0 rounded-lg bg-gradient-to-t from-green-500/10 to-transparent pointer-events-none"></div>
        )}
      </div>
    </Link>
  );
};

export default LiveDropItem;
