import React from 'react';
import { Link } from 'react-router-dom';
import { LiveDropData } from '../types/socket';

interface LiveDropItemProps {
  drop: LiveDropData;
}

const getRarityColor = (rarity: string) => {
  switch (rarity.toLowerCase()) {
    case 'contraband':
      return 'border-orange-500 shadow-orange-500/20';
    case 'covert':
      return 'border-red-500 shadow-red-500/20';
    case 'classified':
      return 'border-pink-500 shadow-pink-500/20';
    case 'restricted':
      return 'border-purple-500 shadow-purple-500/20';
    case 'mil-spec':
      return 'border-blue-500 shadow-blue-500/20';
    case 'industrial':
      return 'border-cyan-500 shadow-cyan-500/20';
    case 'consumer':
      return 'border-gray-500 shadow-gray-500/20';
    default:
      return 'border-gray-400 shadow-gray-400/20';
  }
};

const LiveDropItem: React.FC<LiveDropItemProps> = ({ drop }) => {
  const rarityColor = getRarityColor(drop.item.rarity);
  const isHighValue = drop.item.price >= 100;

  return (
    <div
      className={`
        flex items-center space-x-3 p-2.5 rounded-lg bg-[#19172D] border
        ${drop.isHighlighted ? 'border-yellow-400 shadow-yellow-400/30 shadow-lg' : rarityColor}
        transition-all duration-300 hover:scale-[1.02]
        ${isHighValue ? 'animate-pulse' : ''}
      `}
    >
      {/* Аватар пользователя */}
      <div className="flex-shrink-0">
        {drop.user.avatar ? (
          <img
            src={drop.user.avatar}
            alt={drop.user.username}
            className="w-7 h-7 rounded-full"
          />
        ) : (
          <div className="w-7 h-7 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
            <span className="text-white text-xs font-bold">
              {drop.user.username.charAt(0).toUpperCase()}
            </span>
          </div>
        )}
      </div>

      {/* Информация о пользователе */}
      <div className="flex-shrink-0 min-w-0">
        <Link
          to={`/user/${drop.user.id}`}
          className="text-sm text-white font-medium truncate hover:text-blue-400 transition-colors cursor-pointer block"
          title={`Посмотреть профиль ${drop.user.username}`}
        >
          {drop.user.username}
        </Link>
        <div className="text-xs text-gray-400">
          Ур. {drop.user.level}
        </div>
      </div>

      {/* Стрелка */}
      <div className="flex-shrink-0 text-gray-400">
        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </div>

      {/* Изображение предмета */}
      <div className="flex-shrink-0">
        <img
          src={drop.item.image}
          alt={drop.item.name}
          className="w-10 h-10 object-contain rounded"
        />
      </div>

      {/* Информация о предмете */}
      <div className="flex-1 min-w-0">
        <div className="text-sm text-white font-medium truncate">
          {drop.item.name}
        </div>
        <div className="flex items-center space-x-2">
          <span className="text-sm font-bold text-green-400">
            {drop.item.price.toFixed(2)}₽
          </span>
          {drop.isRare && (
            <span className="text-xs bg-orange-500 text-white px-1.5 py-0.5 rounded">
              РЕДКИЙ
            </span>
          )}
          {drop.isHighlighted && (
            <span className="text-xs bg-yellow-500 text-black px-1.5 py-0.5 rounded font-bold">
              ТОП
            </span>
          )}
        </div>
      </div>

      {/* Время */}
      <div className="flex-shrink-0 text-xs text-gray-400">
        {new Date(drop.dropTime).toLocaleTimeString('ru-RU', {
          hour: '2-digit',
          minute: '2-digit'
        })}
      </div>
    </div>
  );
};

export default LiveDropItem;
