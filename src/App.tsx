import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth, useAppDispatch, useAppSelector } from './store/hooks';
import { useGetCurrentUserQuery } from './features/auth/authApi';
import { loginSuccess, logout, checkSessionValidity } from './features/auth/authSlice';
import { cleanupExpiredData } from './utils/authUtils';
import { useEffect } from 'react';
import './index.css';
import { soundManager } from './utils/soundManager';

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
  const soundsEnabled = useAppSelector(state => state.ui.soundsEnabled);


  // Проверяем, находимся ли мы на странице Steam авторизации
  const isSteamAuthPage = window.location.pathname === '/steam-auth';

  // Автоматически получаем данные пользователя если есть токен
  // И либо нет полных данных пользователя, либо нет Steam данных
  // НО НЕ загружаем если мы на странице Steam авторизации (там будет новый токен)
  const shouldFetchUser = !isSteamAuthPage && auth.token && (
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

  // Синхронизация настройки звука с soundManager
  useEffect(() => {
    soundManager.setSoundsEnabled(soundsEnabled);
  }, [soundsEnabled]);

  // Глобальный звук клика
  useEffect(() => {
    const handleGlobalClick = (event: MouseEvent) => {
      // Проверяем, что клик был по интерактивному элементу
      const target = event.target as HTMLElement;
      const isInteractive = target.closest('button, a, input, select, textarea, [role="button"], [onclick]');

      if (isInteractive && soundsEnabled) {
        soundManager.play('uiClick');
      }
    };

    document.addEventListener('click', handleGlobalClick);

    return () => {
      document.removeEventListener('click', handleGlobalClick);
    };
  }, [soundsEnabled]);

  // Показываем загрузку только при первичной проверке токена
  if (auth.token && (isLoadingUser || isFetchingUser) && (!auth.user || !auth.user.id)) {
    console.log('Showing loading screen - fetching user data...');
    return (
      <div className="min-h-screen flex items-center justify-center relative overflow-hidden bg-[#151225]">
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
      <div className="min-h-screen relative overflow-hidden">
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
