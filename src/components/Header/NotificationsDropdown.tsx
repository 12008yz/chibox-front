import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Bell, User, Menu, X, Coins, Crown, Package, Home, Gift, Trophy, Settings, Plus } from 'lucide-react';
import { useAuth, useAppDispatch } from '../../store/hooks';
import { logout } from '../../features/auth/authSlice';
import { useGetUnreadCountQuery } from '../../features/notifications/notificationsApi';
import NotificationsDropdown from './NotificationsDropdown';
import UserProfileDropdown from './UserProfileDropdown';

const Header = () => {
  const { isAuthenticated, user } = useAuth();
  const dispatch = useAppDispatch();
  const location = useLocation();

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  // Получаем количество непрочитанных уведомлений
  const { data: unreadData } = useGetUnreadCountQuery(undefined, {
    skip: !isAuthenticated,
    pollingInterval: 30000,
  });

  const unreadCount = unreadData?.data?.count || 0;

  // Навигационные элементы
  const navigationItems = [
    { name: 'Главная', href: '/', icon: Home },
    { name: 'Кейсы', href: '/cases', icon: Package },
    { name: 'Инвентарь', href: '/inventory', icon: Gift },
    { name: 'Достижения', href: '/achievements', icon: Trophy },
    { name: 'Подписка', href: '/subscription', icon: Crown },
  ];

  const handleLogout = () => {
    dispatch(logout());
    setIsProfileOpen(false);
  };

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  return (
    <header className="bg-[#1a1d23] border-b border-[#374151] sticky top-0 z-50 backdrop-blur-sm">
      <div className="max-w-[1400px] mx-auto px-6">
        <div className="flex items-center justify-between h-16">

          {/* Логотип слева */}
          <div className="flex items-center">
            <Link to="/" className="flex items-center space-x-3">
              <div className="w-10 h-10 gradient-gold rounded-lg flex items-center justify-center glow-effect">
                <span className="text-black font-bold text-lg">CB</span>
              </div>
              <span className="text-2xl font-bold text-white hidden sm:block">ChiBox</span>
            </Link>
          </div>

          {/* Центральная навигация - только на desktop */}
          <nav className="hidden lg:flex items-center space-x-1">
            {navigationItems.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium transition-all hover-scale ${
                    isActive(item.href)
                      ? 'text-yellow-400 bg-[#2a303a] border border-yellow-400/30'
                      : 'text-gray-300 hover:text-yellow-400 hover:bg-[#2a303a]'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </nav>

          {/* Правая часть - пользовательская информация */}
          <div className="flex items-center space-x-4">
            {isAuthenticated ? (
              <>
                {/* Баланс */}
                <div className="hidden sm:flex items-center bg-[#232832] border border-[#374151] rounded-lg px-4 py-2 hover:border-yellow-400/30 transition-all">
                  <Coins className="w-4 h-4 text-yellow-400 mr-2" />
                  <span className="text-sm font-semibold text-yellow-400">
                    {user?.balance?.toLocaleString() || '0'} ₽
                  </span>
                </div>

                {/* Кнопка пополнения */}
                <Link
                  to="/balance"
                  className="hidden sm:flex items-center space-x-2 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white px-4 py-2 rounded-lg font-medium transition-all hover-scale"
                >
                  <Plus className="w-4 h-4" />
                  <span>Пополнить</span>
                </Link>

                {/* Уведомления */}
                <div className="relative">
                  <button
                    onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
                    className="p-2 text-gray-300 hover:text-yellow-400 hover:bg-[#2a303a] rounded-lg transition-all relative"
                  >
                    <Bell className="w-5 h-5" />
                    {unreadCount > 0 && (
                      <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center animate-pulse">
                        {unreadCount > 99 ? '99+' : unreadCount}
                      </span>
                    )}
                  </button>

                  {isNotificationsOpen && (
                    <NotificationsDropdown
                      onClose={() => setIsNotificationsOpen(false)}
                    />
                  )}
                </div>

                {/* Профиль пользователя */}
                <div className="relative">
                  <button
                    onClick={() => setIsProfileOpen(!isProfileOpen)}
                    className="flex items-center space-x-3 p-2 text-gray-300 hover:text-yellow-400 hover:bg-[#2a303a] rounded-lg transition-all"
                  >
                    {user?.steam_avatar ? (
                      <img
                        src={user.steam_avatar}
                        alt="Avatar"
                        className="w-8 h-8 rounded-full border-2 border-yellow-400/30"
                      />
                    ) : (
                      <div className="w-8 h-8 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center">
                        <User className="w-4 h-4 text-black" />
                      </div>
                    )}
                    <div className="hidden md:block text-left">
                      <div className="text-sm font-medium text-white">
                        {user?.username || user?.email}
                      </div>
                      <div className="text-xs text-gray-400">
                        Уровень {user?.level || 1}
                      </div>
                    </div>
                  </button>

                  {isProfileOpen && (
                    <UserProfileDropdown
                      user={user}
                      onClose={() => setIsProfileOpen(false)}
                      onLogout={handleLogout}
                    />
                  )}
                </div>
              </>
            ) : (
              /* Кнопки входа/регистрации для неавторизованных */
              <div className="flex items-center space-x-3">
                <Link
                  to="/login"
                  className="px-4 py-2 text-sm font-medium text-gray-300 hover:text-yellow-400 transition-colors"
                >
                  Войти
                </Link>
                <Link
                  to="/register"
                  className="btn-primary text-sm px-4 py-2"
                >
                  Регистрация
                </Link>
              </div>
            )}

            {/* Мобильное меню - только на мобильных */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="lg:hidden p-2 text-gray-300 hover:text-yellow-400 hover:bg-[#2a303a] rounded-lg transition-all"
            >
              {isMobileMenuOpen ? (
                <X className="w-5 h-5" />
              ) : (
                <Menu className="w-5 h-5" />
              )}
            </button>
          </div>
        </div>

        {/* Мобильное меню */}
        {isMobileMenuOpen && (
          <div className="lg:hidden border-t border-[#374151] py-4">
            <nav className="space-y-2">
              {navigationItems.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.name}
                    to={item.href}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={`flex items-center space-x-3 px-4 py-3 rounded-lg text-base font-medium transition-all ${
                      isActive(item.href)
                        ? 'text-yellow-400 bg-[#2a303a] border border-yellow-400/30'
                        : 'text-gray-300 hover:text-yellow-400 hover:bg-[#2a303a]'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    <span>{item.name}</span>
                  </Link>
                );
              })}

              {/* Мобильная информация о пользователе */}
              {isAuthenticated && user && (
                <>
                  <div className="border-t border-[#374151] pt-4 mt-4">
                    {/* Баланс в мобильном меню */}
                    <div className="px-4 py-3">
                      <div className="flex items-center justify-between bg-[#232832] border border-[#374151] rounded-lg p-3">
                        <div className="flex items-center space-x-2">
                          <Coins className="w-4 h-4 text-yellow-400" />
                          <span className="text-sm text-gray-400">Баланс</span>
                        </div>
                        <span className="text-lg font-semibold text-yellow-400">
                          {user.balance?.toLocaleString() || '0'} ₽
                        </span>
                      </div>
                    </div>

                    {/* Кнопка пополнения в мобильном меню */}
                    <div className="px-4 py-2">
                      <Link
                        to="/balance"
                        onClick={() => setIsMobileMenuOpen(false)}
                        className="flex items-center justify-center space-x-2 bg-gradient-to-r from-green-500 to-emerald-600 text-white px-4 py-3 rounded-lg font-medium w-full"
                      >
                        <Plus className="w-4 h-4" />
                        <span>Пополнить баланс</span>
                      </Link>
                    </div>
                  </div>
                </>
              )}
            </nav>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
