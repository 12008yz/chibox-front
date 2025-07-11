import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";

interface User {
  id: number;
  name: string;
  profilePicture: string;
}

interface BasicItem {
  id: string;
  name: string;
  image: string;
  rarity: string;
  price: number;
}

interface CaseOpenedNotificationProps {
  user: User;
  item: BasicItem;
  caseImage: string;
  onClose?: () => void;
}

const CaseOpenedNotification: React.FC<CaseOpenedNotificationProps> = ({
  user,
  item,
  caseImage,
  onClose
}) => {
  const [transition, setTransition] = useState<boolean>(false);
  const [isHovering, setIsHovering] = useState<boolean>(false);

  useEffect(() => {
    setTransition(true);

    // Автоматически скрыть уведомление через 5 секунд
    const timer = setTimeout(() => {
      if (onClose) onClose();
    }, 5000);

    return () => clearTimeout(timer);
  }, [onClose]);

  const getRarityColor = (rarity: string): string => {
    const rarityColors: { [key: string]: string } = {
      'common': '#9ca3af',      // серый
      'uncommon': '#22c55e',    // зеленый
      'rare': '#3b82f6',        // синий
      'epic': '#a855f7',        // фиолетовый
      'legendary': '#f59e0b',   // оранжевый
      'mythical': '#ef4444',    // красный
      'immortal': '#ec4899',    // розовый
    };

    return rarityColors[rarity.toLowerCase()] || '#9ca3af';
  };

  const getRarityName = (rarity: string): string => {
    const rarityNames: { [key: string]: string } = {
      'common': 'Обычный',
      'uncommon': 'Необычный',
      'rare': 'Редкий',
      'epic': 'Эпический',
      'legendary': 'Легендарный',
      'mythical': 'Мифический',
      'immortal': 'Бессмертный',
    };

    return rarityNames[rarity.toLowerCase()] || rarity;
  };

  return (
    <div
      className={`fixed top-4 right-4 bg-gray-900 border-2 rounded-lg p-4 shadow-xl z-50 max-w-sm transition-all duration-500 ${
        transition ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'
      }`}
      style={{
        borderColor: getRarityColor(item.rarity),
        boxShadow: `0 0 20px ${getRarityColor(item.rarity)}30`
      }}
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
    >
      {/* Кнопка закрытия */}
      <button
        onClick={onClose}
        className="absolute top-2 right-2 text-gray-400 hover:text-white transition-colors"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>

      {/* Заголовок */}
      <div className="mb-3">
        <h3 className="text-sm font-medium text-gray-300">Кейс открыт!</h3>
      </div>

      {/* Информация о пользователе */}
      <div className="flex items-center space-x-2 mb-3">
        <img
          src={user.profilePicture || '/images/default-avatar.png'}
          alt={user.name}
          className="w-8 h-8 rounded-full"
         //  onError={(e) => {
         //    e.currentTarget.src = '/favicon.ico';
         //  }}
        />
        <Link
          to={`/profile/${user.id}`}
          className="text-blue-400 hover:text-blue-300 text-sm font-medium"
        >
          {user.name}
        </Link>
        <span className="text-gray-400 text-sm">открыл</span>
      </div>

      {/* Изображение кейса */}
      <div className="flex justify-center mb-3">
        <img
          src={caseImage}
          alt="Case"
          className="w-16 h-16 object-contain"
          onError={(e) => {
            e.currentTarget.src = '/images/default-case.png';
          }}
        />
      </div>

      {/* Информация о предмете */}
      <div className="text-center">
        <div
          className="inline-block px-2 py-1 rounded text-xs font-medium mb-2"
          style={{ backgroundColor: `${getRarityColor(item.rarity)}20`, color: getRarityColor(item.rarity) }}
        >
          {getRarityName(item.rarity)}
        </div>

        <div className="flex items-center justify-center space-x-2 mb-2">
          <img
            src={item.image}
            alt={item.name}
            className="w-12 h-12 object-contain"
            onError={(e) => {
              e.currentTarget.src = '/images/default-item.png';
            }}
          />
          <div>
            <p className="text-white text-sm font-medium">{item.name}</p>
            <p className="text-green-400 text-sm">${item.price.toFixed(2)}</p>
          </div>
        </div>
      </div>

      {/* Анимация блика при наведении */}
      {isHovering && (
        <div
          className="absolute inset-0 rounded-lg opacity-20 pointer-events-none"
          style={{
            background: `linear-gradient(45deg, transparent 30%, ${getRarityColor(item.rarity)} 50%, transparent 70%)`,
            animation: 'shine 1s ease-in-out infinite'
          }}
        />
      )}
    </div>
  );
};

export default CaseOpenedNotification;
