import { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { User, Settings, LogOut, Crown, Trophy, Gift, Wallet } from 'lucide-react';
import type { User as UserType } from '../../types/api';

interface UserProfileDropdownProps {
  user: UserType | null;
  onClose: () => void;
  onLogout: () => void;
}

const UserProfileDropdown = ({ user, onClose, onLogout }: UserProfileDropdownProps) => {
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Закрытие при клике вне компонента
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [onClose]);

  const menuItems = [
    {
      name: 'Профиль',
      href: '/profile',
      icon: User,
      description: 'Настройки профиля'
    },
    {
      name: 'Инвентарь',
      href: '/inventory',
      icon: Gift,
      description: 'Ваши предметы'
    },
    {
      name: 'Достижения',
      href: '/achievements',
      icon: Trophy,
      description: 'Прогресс и награды'
    },
    {
      name: 'Подписка',
      href: '/subscription',
      icon: Crown,
      description: 'Управление подпиской'
    },
    {
      name: 'Баланс',
      href: '/balance',
      icon: Wallet,
      description: 'Пополнение и вывод'
    },
    {
      name: 'Настройки',
      href: '/settings',
      icon: Settings,
      description: 'Настройки аккаунта'
    },
  ];

  const getSubscriptionStatus = () => {
    if (!user?.subscription_tier || !user?.subscription_expiry_date) {
      return { text: 'Нет подписки', color: 'text-gray-500' };
    }

    const expiryDate = new Date(user.subscription_expiry_date);
    const now = new Date();
    const daysLeft = Math.ceil((expiryDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

    if (daysLeft <= 0) {
      return { text: 'Подписка истекла', color: 'text-red-500' };
    }

    if (daysLeft <= 3) {
      return { text: `${daysLeft} дн. до окончания`, color: 'text-orange-500' };
    }

    return { text: `${daysLeft} дн. осталось`, color: 'text-green-500' };
  };

  const subscriptionStatus = getSubscriptionStatus();

  return (
    <div
      ref={dropdownRef}
      className="absolute right-0 mt-2 w-72 bg-white rounded-lg shadow-lg border border-gray-200 z-50"
    >
      {/* Заголовок с информацией о пользователе */}
      <div className="px-4 py-4 border-b border-gray-200">
        <div className="flex items-center space-x-3">
          {user?.steam_avatar ? (
            <img
              src={user.steam_avatar}
              alt="Avatar"
              className="w-12 h-12 rounded-full"
            />
          ) : (
            <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center">
              <User className="w-6 h-6 text-gray-500" />
            </div>
          )}
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900 truncate">
              {user?.username || user?.email}
            </p>
            <p className="text-xs text-gray-500 truncate">
              {user?.email}
            </p>
          </div>
        </div>

        {/* Информация о балансе и подписке */}
        <div className="mt-3 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">Баланс:</span>
            <span className="text-sm font-semibold text-gray-900">
              {user?.balance?.toLocaleString() || '0'} ₽
            </span>
          </div>

          {user?.level && (
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Уровень:</span>
              <span className="text-sm font-semibold text-blue-600">
                {user.level} lvl
              </span>
            </div>
          )}

          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">Подписка:</span>
            <span className={`text-sm font-medium ${subscriptionStatus.color}`}>
              {subscriptionStatus.text}
            </span>
          </div>
        </div>
      </div>

      {/* Меню действий */}
      <div className="py-2">
        {menuItems.map((item) => {
          const Icon = item.icon;
          return (
            <Link
              key={item.name}
              to={item.href}
              onClick={onClose}
              className="flex items-center px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
            >
              <Icon className="w-5 h-5 mr-3 text-gray-400" />
              <div className="flex-1">
                <div className="font-medium">{item.name}</div>
                <div className="text-xs text-gray-500">{item.description}</div>
              </div>
            </Link>
          );
        })}
      </div>

      {/* Кнопка выхода */}
      <div className="border-t border-gray-200 py-2">
        <button
          onClick={onLogout}
          className="flex items-center w-full px-4 py-3 text-sm text-red-600 hover:bg-red-50 transition-colors"
        >
          <LogOut className="w-5 h-5 mr-3" />
          <span className="font-medium">Выйти</span>
        </button>
      </div>
    </div>
  );
};

export default UserProfileDropdown;
