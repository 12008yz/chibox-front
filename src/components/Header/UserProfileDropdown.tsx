import { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { User, Settings, LogOut, Crown, Trophy, Gift, Wallet, Coins, Star } from 'lucide-react';
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
      description: 'Настройки профиля',
      iconColor: 'text-blue-400'
    },
    {
      name: 'Инвентарь',
      href: '/inventory',
      icon: Gift,
      description: 'Ваши предметы',
      iconColor: 'text-green-400'
    },
    {
      name: 'Достижения',
      href: '/achievements',
      icon: Trophy,
      description: 'Прогресс и награды',
      iconColor: 'text-yellow-400'
    },
    {
      name: 'Подписка',
      href: '/subscription',
      icon: Crown,
      description: 'Управление подпиской',
      iconColor: 'text-purple-400'
    },
    {
      name: 'Баланс',
      href: '/balance',
      icon: Wallet,
      description: 'Пополнение и вывод',
      iconColor: 'text-orange-400'
    },
    {
      name: 'Настройки',
      href: '/settings',
      icon: Settings,
      description: 'Настройки аккаунта',
      iconColor: 'text-gray-400'
    },
  ];

  const getSubscriptionStatus = () => {
    if (!user?.subscription_tier || !user?.subscription_expiry_date) {
      return { text: 'Нет подписки', color: 'text-gray-400' };
    }

    const expiryDate = new Date(user.subscription_expiry_date);
    const now = new Date();
    const daysLeft = Math.ceil((expiryDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

    if (daysLeft <= 0) {
      return { text: 'Подписка истекла', color: 'text-red-400' };
    }

    if (daysLeft <= 3) {
      return { text: `${daysLeft} дн. до окончания`, color: 'text-orange-400' };
    }

    return { text: `${daysLeft} дн. осталось`, color: 'text-green-400' };
  };

  const subscriptionStatus = getSubscriptionStatus();

  return (
    <div
      ref={dropdownRef}
      className="absolute right-0 mt-2 w-80 bg-[#232832] rounded-xl shadow-2xl border border-[#374151] z-50 backdrop-blur-sm overflow-hidden"
    >
      {/* Gradient header */}
      <div className="absolute inset-x-0 top-0 h-24 bg-gradient-to-r from-yellow-400/20 via-orange-500/20 to-red-500/20"></div>

      {/* Заголовок с информацией о пользователе */}
      <div className="relative px-6 py-6 border-b border-[#374151]">
        <div className="flex items-center space-x-4">
          {user?.steam_avatar ? (
            <img
              src={user.steam_avatar}
              alt="Avatar"
              className="w-14 h-14 rounded-full border-2 border-yellow-400/30"
            />
          ) : (
            <div className="w-14 h-14 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center">
              <User className="w-7 h-7 text-black" />
            </div>
          )}
          <div className="flex-1 min-w-0">
            <p className="text-lg font-bold text-white truncate">
              {user?.username || user?.email}
            </p>
            <p className="text-sm text-gray-400 truncate">
              {user?.email}
            </p>
          </div>
        </div>

        {/* Информация о балансе и подписке */}
        <div className="mt-4 grid grid-cols-2 gap-4">
          <div className="bg-[#1a1d23] rounded-lg p-3 border border-[#374151]">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Coins className="w-4 h-4 text-yellow-400" />
                <span className="text-sm text-gray-400">Баланс</span>
              </div>
            </div>
            <div className="mt-1">
              <span className="text-lg font-bold text-yellow-400">
                {user?.balance?.toLocaleString() || '0'} ₽
              </span>
            </div>
          </div>

          <div className="bg-[#1a1d23] rounded-lg p-3 border border-[#374151]">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Star className="w-4 h-4 text-blue-400" />
                <span className="text-sm text-gray-400">Уровень</span>
              </div>
            </div>
            <div className="mt-1">
              <span className="text-lg font-bold text-blue-400">
                {user?.level || 1} lvl
              </span>
            </div>
          </div>
        </div>

        {/* Подписка */}
        <div className="mt-4 bg-[#1a1d23] rounded-lg p-3 border border-[#374151]">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Crown className="w-4 h-4 text-purple-400" />
              <span className="text-sm text-gray-400">Подписка</span>
            </div>
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
              className="flex items-center px-6 py-3 text-gray-300 hover:bg-[#2a303a] hover:text-yellow-400 transition-all group"
            >
              <Icon className={`w-5 h-5 mr-4 ${item.iconColor} group-hover:text-yellow-400 transition-colors`} />
              <div className="flex-1">
                <div className="font-medium">{item.name}</div>
                <div className="text-xs text-gray-500">{item.description}</div>
              </div>
            </Link>
          );
        })}
      </div>

      {/* Кнопка выхода */}
      <div className="border-t border-[#374151] py-2">
        <button
          onClick={onLogout}
          className="flex items-center w-full px-6 py-3 text-red-400 hover:bg-red-500/20 transition-all group"
        >
          <LogOut className="w-5 h-5 mr-4 group-hover:text-red-300 transition-colors" />
          <span className="font-medium">Выйти</span>
        </button>
      </div>
    </div>
  );
};

export default UserProfileDropdown;
