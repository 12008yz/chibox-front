import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth, useAppDispatch } from '../../store/hooks';
import { logout } from '../../features/auth/authSlice';
import NotificationsDropdown from './NotificationsDropdown';
import UserProfileDropdown from './UserProfileDropdown';

const Header = () => {
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const [isGamesOpen, setIsGamesOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  const gameNavItems = [
    { name: 'Кейсы', path: '/cases', icon: '🎁', color: 'text-yellow-400' },
    { name: 'Crash', path: '/crash', icon: '📈', color: 'text-green-400' },
    { name: 'Mines', path: '/mines', icon: '💣', color: 'text-red-400' },
    { name: 'Tower', path: '/tower', icon: '🏗️', color: 'text-purple-400' },
    { name: 'Dice', path: '/dice', icon: '🎲', color: 'text-blue-400' },
    { name: 'Double', path: '/double', icon: '🔄', color: 'text-orange-400' },
  ];

  const navItems = [
    { name: 'Инвентарь', path: '/inventory', icon: '🎒' },
    { name: 'Таблица лидеров', path: '/leaderboard', icon: '🏆' },
    { name: 'Профиль', path: '/profile', icon: '👤' },
    { name: 'Баланс', path: '/balance', icon: '💳' },
  ];

  return (
    <header className="bg-gray-900/95 backdrop-blur-sm border-b border-gray-700 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-3 group">
            <div className="w-10 h-10 bg-gradient-gold rounded-lg flex items-center justify-center text-xl font-bold text-black group-hover:scale-110 transition-transform">
              ⚡
            </div>
            <span className="text-xl font-bold text-gambling">ChiBox</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-6">
            {/* Games Dropdown */}
            <div className="relative group">
              <button
                onClick={() => setIsGamesOpen(!isGamesOpen)}
                className="flex items-center space-x-1 px-3 py-2 rounded-lg text-gray-300 hover:text-white hover:bg-gray-800 transition-all"
              >
                <span>🎮</span>
                <span className="font-medium">Игры</span>
                <svg className={`w-4 h-4 transition-transform ${isGamesOpen ? 'rotate-180' : ''}`} fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>

              {/* Games Dropdown Menu */}
              {isGamesOpen && (
                <div className="absolute top-full left-0 mt-2 w-56 bg-gray-800 border border-gray-600 rounded-xl shadow-2xl py-2 z-50">
                  {gameNavItems.map((item) => (
                    <Link
                      key={item.path}
                      to={item.path}
                      onClick={() => setIsGamesOpen(false)}
                      className="flex items-center space-x-3 px-4 py-3 hover:bg-gray-700 transition-colors group"
                    >
                      <span className="text-lg">{item.icon}</span>
                      <span className={`font-medium group-hover:${item.color} transition-colors`}>
                        {item.name}
                      </span>
                    </Link>
                  ))}
                </div>
              )}
            </div>

            {/* Main Navigation Links */}
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className="flex items-center space-x-2 px-3 py-2 rounded-lg text-gray-300 hover:text-white hover:bg-gray-800 transition-all"
              >
                <span>{item.icon}</span>
                <span className="font-medium">{item.name}</span>
              </Link>
            ))}
          </nav>

          {/* Right side */}
          <div className="flex items-center space-x-4">
            {isAuthenticated ? (
              <>
                {/* Balance Display */}
                <div className="hidden md:flex items-center space-x-2 px-4 py-2 bg-gradient-gold rounded-lg text-black font-bold glow-gold">
                  <span>💰</span>
                  <span>$1,337.42</span>
                </div>

                {/* Notifications */}
                <NotificationsDropdown />

                {/* User Profile Dropdown */}
              </>
            ) : (
              <div className="flex items-center space-x-3">
                <Link
                  to="/login"
                  className="btn-secondary px-4 py-2 text-sm"
                >
                  Войти
                </Link>
                <Link
                  to="/register"
                  className="btn-gambling px-4 py-2 text-sm"
                >
                  Регистрация
                </Link>
              </div>
            )}

            {/* Mobile menu button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden p-2 rounded-lg text-gray-300 hover:text-white hover:bg-gray-800 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Navigation Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-gray-700 mt-2">
            {/* Balance for mobile */}
            {isAuthenticated && (
              <div className="flex items-center justify-center space-x-2 px-4 py-3 bg-gradient-gold rounded-lg text-black font-bold mb-4 mx-4">
                <span>💰</span>
                <span>$1,337.42</span>
              </div>
            )}

            {/* Games Section */}
            <div className="px-4 py-2">
              <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3">Игры</h3>
              <div className="grid grid-cols-2 gap-2">
                {gameNavItems.map((item) => (
                  <Link
                    key={item.path}
                    to={item.path}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="flex items-center space-x-2 px-3 py-2 rounded-lg hover:bg-gray-800 transition-colors"
                  >
                    <span>{item.icon}</span>
                    <span className="text-sm font-medium">{item.name}</span>
                  </Link>
                ))}
              </div>
            </div>

            {/* Main Navigation for mobile */}
            <div className="px-4 py-2">
              <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3">Меню</h3>
              <div className="space-y-1">
                {navItems.map((item) => (
                  <Link
                    key={item.path}
                    to={item.path}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="flex items-center space-x-2 px-3 py-2 rounded-lg hover:bg-gray-800 transition-colors block"
                  >
                    <span>{item.icon}</span>
                    <span className="font-medium">{item.name}</span>
                  </Link>
                ))}
              </div>
            </div>

            {/* Auth buttons for mobile */}
            {!isAuthenticated && (
              <div className="px-4 py-4 space-y-2">
                <Link
                  to="/login"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="btn-secondary w-full text-center block"
                >
                  Войти
                </Link>
                <Link
                  to="/register"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="btn-gambling w-full text-center block"
                >
                  Регистрация
                </Link>
              </div>
            )}

            {/* Logout for mobile */}
            {isAuthenticated && (
              <div className="px-4 py-2">
                <button
                  onClick={() => {
                    handleLogout();
                    setIsMobileMenuOpen(false);
                  }}
                  className="btn-danger w-full"
                >
                  Выйти
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Click outside to close dropdowns */}
      {(isGamesOpen || isMobileMenuOpen) && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => {
            setIsGamesOpen(false);
            setIsMobileMenuOpen(false);
          }}
        />
      )}
    </header>
  );
};

export default Header;
