import React from 'react';
import { Link } from 'react-router-dom';
import { LiveDropData } from '../types/socket';
import Monetary from './Monetary';
import { Flame, Star } from 'lucide-react';

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
          ${drop.isHighlighted ? 'border-yellow-400 bg-yellow-400/10 highlight-glow' : rarityColor}
          transition-transform duration-300 hover:scale-105 cursor-pointer
          ${isHighValue ? 'high-value-item' : ''}
        `}
        style={{
          margin: '4px',
          minWidth: '160px',
          maxWidth: '160px',
          minHeight: '176px',
          maxHeight: '176px',
          overflow: 'hidden',
          willChange: 'transform'
        }}
      >
        {/* Спец эффекты для редких предметов */}
        {drop.isRare && (
          <div className="absolute -top-2 -right-2 z-20">
            <div className="bg-orange-500 text-white text-xs font-bold px-2 py-1 rounded-full shadow-lg flex items-center justify-center">
              <Flame className="w-3.5 h-3.5" />
            </div>
          </div>
        )}

        {drop.isHighlighted && (
          <div className="absolute -top-2 -left-2 z-20">
            <div className="bg-yellow-500 text-black text-xs font-bold px-2 py-1 rounded-full shadow-lg flex items-center justify-center">
              <Star className="w-3.5 h-3.5" />
            </div>
          </div>
        )}

        {/* Аватар пользователя (сверху слева) */}
        <div className="absolute top-3 left-3 z-10 w-7 h-7 flex-shrink-0">
          <div className="w-7 h-7" title={`${drop.user.username} (Ур. ${drop.user.level})`}>
            {drop.user.avatar ? (
              <img
                src={drop.user.avatar}
                alt={drop.user.username}
                className="user-avatar-live-drop w-7 h-7 rounded-full border-2 border-gray-600 hover:border-white transition-colors object-cover"
                style={{
                  minWidth: '28px',
                  maxWidth: '28px',
                  minHeight: '28px',
                  maxHeight: '28px',
                  width: '28px !important',
                  height: '28px !important'
                }}
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
        <div className="flex items-center justify-center mt-6 mb-3 relative z-0">
          <div
            className="w-20 h-20 flex items-center justify-center bg-gray-800/30 rounded-lg border border-gray-700/20 live-drop-image-container overflow-hidden"
            style={{
              filter: 'none',
              mixBlendMode: 'normal',
              colorScheme: 'light',
              isolation: 'isolate',
              minWidth: '80px',
              maxWidth: '80px',
              minHeight: '80px',
              maxHeight: '80px'
            }}
          >
            <img
              src={drop.item.image}
              alt={drop.item.name}
              className="live-drop-item"
              style={{
                filter: 'none',
                backgroundColor: 'transparent',
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
                  fallbackIcon.className = 'fallback-icon text-gray-400 flex items-center justify-center';
                  fallbackIcon.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path><polyline points="3.29 7 12 12 20.71 7"></polyline><line x1="12" y1="22" x2="12" y2="12"></line></svg>';
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

                // Дополнительная проверка через небольшую задержку
                setTimeout(() => {
                  if (target && target.style) {
                    target.style.setProperty('filter', 'none', 'important');
                    target.style.setProperty('mix-blend-mode', 'normal', 'important');

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
              <Monetary value={drop.item.price} iconSize="xxxs" />
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
