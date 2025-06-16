import { Outlet, Link, Navigate } from 'react-router-dom';
import { useAuth, useAppDispatch } from '../../store/hooks';
import { logout } from '../../features/auth/authSlice';
import { useLogoutMutation } from '../../features/auth/authApi';
import {
  Home,
  Package,
  User,
  LogOut,
  Wallet,
  Trophy,
  Bell
} from 'lucide-react';

const Layout = () => {
  const { isAuthenticated, user } = useAuth();
  const dispatch = useAppDispatch();
  const [logoutMutation] = useLogoutMutation();

  // Если не авторизован, перенаправляем на логин
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  const handleLogout = async () => {
    try {
      await logoutMutation().unwrap();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      dispatch(logout());
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <div className="flex items-center">
              <Link to="/" className="text-2xl font-bold text-blue-600">
                ChiBox
              </Link>
            </div>

            {/* Navigation */}
            <nav className="hidden md:flex space-x-8">
              <Link
                to="/"
                className="flex items-center text-gray-600 hover:text-gray-900"
              >
                <Home className="w-4 h-4 mr-2" />
                Главная
              </Link>
              <Link
                to="/cases"
                className="flex items-center text-gray-600 hover:text-gray-900"
              >
                <Package className="w-4 h-4 mr-2" />
                Кейсы
              </Link>
              <Link
                to="/inventory"
                className="flex items-center text-gray-600 hover:text-gray-900"
              >
                <Trophy className="w-4 h-4 mr-2" />
                Инвентарь
              </Link>
            </nav>

            {/* User info */}
            <div className="flex items-center space-x-4">
              {/* Balance */}
              {user && (
                <div className="flex items-center bg-green-100 text-green-800 px-3 py-1 rounded-full">
                  <Wallet className="w-4 h-4 mr-2" />
                  <span className="font-medium">{user.balance.toFixed(2)} ₽</span>
                </div>
              )}

              {/* Notifications */}
              <button className="p-2 text-gray-600 hover:text-gray-900">
                <Bell className="w-5 h-5" />
              </button>

              {/* Profile dropdown */}
              <div className="relative">
                <Link
                  to="/profile"
                  className="flex items-center text-gray-600 hover:text-gray-900"
                >
                  <User className="w-5 h-5 mr-2" />
                  <span>{user?.username || 'Профиль'}</span>
                </Link>
              </div>

              {/* Logout */}
              <button
                onClick={handleLogout}
                className="flex items-center text-gray-600 hover:text-red-600 p-2"
                title="Выйти"
              >
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="bg-white border-t mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="text-center text-gray-500">
            <p>&copy; 2025 ChiBox Game. Все права защищены.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Layout;
