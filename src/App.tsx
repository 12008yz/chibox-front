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
import ProfilePage from './pages/ProfilePage';
import PublicProfilePage from './pages/PublicProfilePage';
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
    (auth.user.auth_provider === 'steam' && !auth.user.steam_avatar)
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
      <div className="min-h-screen flex items-center justify-center bg-[#151225] relative">
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
      <div className="min-h-screen bg-[#151225] relative">
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
            <Route
              path="/marketplace"
              element={
                <div className="min-h-screen bg-[#151225] text-white p-8">
                  <div className="container mx-auto">
                    <h1 className="text-3xl font-bold">Marketplace</h1>
                    <p>Coming soon...</p>
                  </div>
                </div>
              }
            />
            <Route
              path="/coinflip"
              element={
                <div className="min-h-screen bg-[#151225] text-white p-8">
                  <div className="container mx-auto">
                    <h1 className="text-3xl font-bold">Coin Flip</h1>
                    <p>Coming soon...</p>
                  </div>
                </div>
              }
            />
            <Route
              path="/crash"
              element={
                <div className="min-h-screen bg-[#151225] text-white p-8">
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
                <div className="min-h-screen bg-[#151225] text-white p-8">
                  <div className="container mx-auto">
                    <h1 className="text-3xl font-bold">Upgrade</h1>
                    <p>Coming soon...</p>
                  </div>
                </div>
              }
            />
            <Route
              path="/slot"
              element={
                <div className="min-h-screen bg-[#151225] text-white p-8">
                  <div className="container mx-auto">
                    <h1 className="text-3xl font-bold">Slots</h1>
                    <p>Coming soon...</p>
                  </div>
                </div>
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
