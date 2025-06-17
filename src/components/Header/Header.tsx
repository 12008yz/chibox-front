import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Bell, User, Menu, X, LogOut, Settings, Gift, Trophy, Package, Home, Crown } from 'lucide-react';
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
    pollingInterval: 30000, // Обновляем каждые 30 секунд
  });

  const unreadCount = unreadData?.data?.count || 0;

  // Навигационные элементы
  const navigationItems = [
    { name: 'Главная', href: '/', icon: Home },
    { name: 'Кейсы', href: '/cases', icon: Package },
    { name: 'Инвентарь', href: '/inventory', icon: Gift },
    { name: 'Профиль', href: '/profile', icon: User },
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
    <header className="bg-white shadow-md border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Логотип */}
          <div className="flex items-center">
            <Link to="/" className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">CB</span>
              </div>
              <span className="text-xl font-bold text-gray-900">ChiBox</span>
            </Link>
          </div>

          {/* Десктопная навигация */}
          <nav className="hidden md:flex space-x-8">
            {navigationItems.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`flex items-center space-x-1 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    isActive(item.href)
                      ? 'text-blue-600 bg-blue-50'
                      : 'text-gray-700 hover:text-gray-900 hover:bg-gray-50'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </nav>

          {/* Правая часть хедера */}
          <div className="flex items-center space-x-4">
            {isAuthenticated ? (
              <>
                {/* Баланс пользователя */}
                <div className="hidden sm:flex items-center bg-gray-100 rounded-lg px-3 py-1">
                  <span className="text-sm font-medium text-gray-700">
                    {user?.balance?.toLocaleString() || '0'} ₽
                  </span>
                </div>

                {/* Уведомления */}
                <div className="relative">
                  <button
                    onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
                    className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors relative"
                  >
                    <Bell className="w-5 h-5" />
                    {unreadCount > 0 && (
                      <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
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
                    className="flex items-center space-x-2 p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    {user?.steam_avatar ? (
                      <img
                        src={user.steam_avatar}
                        alt="Avatar"
                        className="w-6 h-6 rounded-full"
                      />
                    ) : (
                      <User className="w-5 h-5" />
                    )}
                    <span className="hidden sm:block text-sm font-medium">
                      {user?.username || user?.email}
                    </span>
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
              <div className="flex items-center space-x-2">
                <Link
                  to="/login"
                  className="px-3 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 transition-colors"
                >
                  Войти
                </Link>
                <Link
                  to="/register"
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
                >
                  Регистрация
                </Link>
              </div>
            )}

            {/* Мобильное меню */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
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
          <div className="md:hidden border-t border-gray-200 py-4">
            <nav className="space-y-2">
              {navigationItems.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.name}
                    to={item.href}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={`flex items-center space-x-3 px-3 py-2 rounded-md text-base font-medium transition-colors ${
                      isActive(item.href)
                        ? 'text-blue-600 bg-blue-50'
                        : 'text-gray-700 hover:text-gray-900 hover:bg-gray-50'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    <span>{item.name}</span>
                  </Link>
                );
              })}

              {/* Баланс в мобильном меню */}
              {isAuthenticated && user && (
                <div className="px-3 py-2 mt-4 pt-4 border-t border-gray-200">
                  <div className="text-sm text-gray-500">Баланс</div>
                  <div className="text-lg font-semibold text-gray-900">
                    {user.balance?.toLocaleString() || '0'} ₽
                  </div>
                </div>
              )}
            </nav>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
