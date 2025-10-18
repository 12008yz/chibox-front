import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth, useAppDispatch } from './store/hooks';
import { useGetCurrentUserQuery } from './features/auth/authApi';
import { loginSuccess, logout, checkSessionValidity } from './features/auth/authSlice';
import { cleanupExpiredData } from './utils/authUtils';
import { useEffect } from 'react';
import './index.css'

// Импорты компонентов
import Header from './components/Header';
import FloatingWatermark from './components/FloatingWatermark';
import HomePage from './pages/HomePage';
import LoginPage from './pages/loginPage';
import RegisterPage from './pages/RegisterPage';
import SteamAuthPage from './pages/SteamAuthPage';
import ProfilePage from './pages/profile/ProfilePage';
import PublicProfilePage from './pages/PublicProfilePage';
import LeaderboardPage from './pages/LeaderboardPage';
import ExchangePage from './pages/ExchangePage';
import UpgradePage from './pages/UpgradePage';
import SlotPage from './pages/SlotPage';
import { useSocket } from './hooks/useSocket';

const App: React.FC = () => {
  const auth = useAuth();
  const dispatch = useAppDispatch();
  const { onlineUsers, isConnected } = useSocket();

  console.log('App render - auth state:', {
    isAuthenticated: auth.isAuthenticated,
    hasUser: !!auth.user,
    hasToken: !!auth.token,
    username: auth.user?.username
  });

  // Автоматически получаем данные пользователя если есть токен
  // И либо нет полных данных пользователя, либо нет Steam данных
  const shouldFetchUser = auth.token && (
    !auth.user ||
    !auth.user.id ||
    (auth.user.auth_provider === 'steam' && !auth.user.steam_avatar_url && !auth.user.steam_avatar)
  );

  const {
    data: userData,
    error: userError,
    isLoading: isLoadingUser,
    isFetching: isFetchingUser
  } = useGetCurrentUserQuery(
    undefined,
    {
      skip: !shouldFetchUser, // Пропускаем запрос если нет токена или уже есть данные пользователя
      refetchOnMountOrArgChange: false, // Не перезапрашиваем при повторном монтировании
    }
  );

  console.log('getCurrentUser query state:', {
    shouldFetchUser,
    isLoading: isLoadingUser,
    isFetching: isFetchingUser,
    hasData: !!userData,
    hasError: !!userError,
    error: userError
  });

  // Проверяем валидность сессии и очищаем устаревшие данные при загрузке
  useEffect(() => {
    // Очищаем устаревшие данные из localStorage
    cleanupExpiredData();

    // Проверяем валидность текущей сессии
    dispatch(checkSessionValidity());
  }, [dispatch]);

  // Обновляем данные пользователя когда получаем ответ от API
  useEffect(() => {
    if (userData?.success && userData.user && auth.token) {
      console.log('Updating user data from getCurrentUser:', userData.user);
      dispatch(loginSuccess({
        user: userData.user,
        token: auth.token
      }));
    }
  }, [userData, auth.token, dispatch]);

  // Logout ТОЛЬКО при ошибке getCurrentUser (не при других API вызовах)
  useEffect(() => {
    if (userError && auth.token && shouldFetchUser) {
      console.log('getCurrentUser failed, logging out:', userError);
      dispatch(logout());
    }
  }, [userError, auth.token, shouldFetchUser, dispatch]);

  // Показываем загрузку только при первичной проверке токена
  if (auth.token && (isLoadingUser || isFetchingUser) && (!auth.user || !auth.user.id)) {
    console.log('Showing loading screen - fetching user data...');
    return (
      <div className="min-h-screen flex items-center justify-center relative overflow-hidden" style={{
        background: 'linear-gradient(135deg, #151225 0%, #1a1630 100%)',
      }}>
        {/* Gaming Background Pattern for Loading */}
        <div className="fixed inset-0 pointer-events-none z-0">
          <div
            className="absolute inset-0 opacity-[0.03]"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='52' viewBox='0 0 60 52' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cpath d='M30 26L45 35.32V43.68L30 53L15 43.68V35.32L30 26z' stroke='%236366f1' stroke-opacity='0.8' stroke-width='1'/%3E%3Cpath d='M30 0L45 9.32V17.68L30 27L15 17.68V9.32L30 0z' stroke='%238b5cf6' stroke-opacity='0.6' stroke-width='1'/%3E%3C/g%3E%3C/svg%3E")`,
              backgroundSize: '60px 52px',
              animation: 'float 20s ease-in-out infinite',
            }}
          />
        </div>

        <FloatingWatermark />
        <div className="relative z-10 flex flex-col items-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-purple-500"></div>
          <div className="text-white mt-4">Загрузка данных пользователя...</div>
        </div>
      </div>
    );
  }

  return (
    <Router>
      <div className="min-h-screen relative overflow-hidden" style={{
        background: 'linear-gradient(135deg, #151225 0%, #1a1630 100%)',
      }}>
        {/* Gaming Background Pattern */}
        <div className="fixed inset-0 pointer-events-none z-0">
          {/* Hexagonal Pattern */}
          <div
            className="absolute inset-0 opacity-[0.03]"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='52' viewBox='0 0 60 52' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cpath d='M30 26L45 35.32V43.68L30 53L15 43.68V35.32L30 26z' stroke='%236366f1' stroke-opacity='0.8' stroke-width='1'/%3E%3Cpath d='M30 0L45 9.32V17.68L30 27L15 17.68V9.32L30 0z' stroke='%238b5cf6' stroke-opacity='0.6' stroke-width='1'/%3E%3C/g%3E%3C/svg%3E")`,
              backgroundSize: '60px 52px',
              animation: 'float 20s ease-in-out infinite',
            }}
          />

          {/* Circuit-like Grid */}
          <div
            className="absolute inset-0 opacity-[0.02]"
            style={{
              backgroundImage: `
                linear-gradient(rgba(99, 102, 241, 0.5) 1px, transparent 1px),
                linear-gradient(90deg, rgba(139, 92, 246, 0.5) 1px, transparent 1px)
              `,
              backgroundSize: '40px 40px',
            }}
          />

          {/* Убраны анимированные частицы для оптимизации производительности */}
        </div>

        <FloatingWatermark />
        <div className="relative z-10">
          <Header
            onlineUsers={onlineUsers}
            user={auth.user}
          />

          <main>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route
              path="/login"
              element={
                auth.isAuthenticated ? <Navigate to="/" replace /> : <LoginPage />
              }
            />
            <Route
              path="/register"
              element={<RegisterPage />}
            />
            <Route
              path="/auth/success"
              element={<SteamAuthPage />}
            />

            {/* Защищенные маршруты */}
            <Route
              path="/profile"
              element={
                auth.isAuthenticated ? <ProfilePage /> : <Navigate to="/login" replace />
              }
            />

            {/* Публичный профиль пользователя */}
            <Route
              path="/user/:id"
              element={<PublicProfilePage />}
            />

            {/* Страница обмена предметов */}
            <Route
              path="/exchange"
              element={
                auth.isAuthenticated ? <ExchangePage /> : <Navigate to="/login" replace />
              }
            />

            <Route
              path="/marketplace"
              element={
                <div className="min-h-screen text-white p-8">
                  <div className="container mx-auto">
                    <h1 className="text-3xl font-bold">Marketplace</h1>
                    <p>Coming soon...</p>
                  </div>
                </div>
              }
            />
            <Route
              path="/coinflip"
              element={<LeaderboardPage />}
            />
            <Route
              path="/leaderboard"
              element={<LeaderboardPage />}
            />
            <Route
              path="/crash"
              element={
                <div className="min-h-screen text-white p-8">
                  <div className="container mx-auto">
                    <h1 className="text-3xl font-bold">Crash</h1>
                    <p>Coming soon...</p>
                  </div>
                </div>
              }
            />
            <Route
              path="/upgrade"
              element={
                auth.isAuthenticated ? <UpgradePage /> : <Navigate to="/login" replace />
              }
            />
            <Route
              path="/slot"
              element={
                auth.isAuthenticated ? <SlotPage /> : <Navigate to="/login" replace />
              }
            />

            {/* 404 */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
        </div>
      </div>
    </Router>
  );
};

export default App;
