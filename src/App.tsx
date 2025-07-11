import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth, useAppDispatch } from './store/hooks';
import { useGetCurrentUserQuery } from './features/auth/authApi';
import { loginSuccess, logout, checkSessionValidity } from './features/auth/authSlice';
import { useEffect } from 'react';
import './index.css'

// Импорты компонентов
import Header from './components/Header';
import HomePage from './pages/HomePage';
import LoginPage from './pages/loginPage';
import RegisterPage from './pages/RegisterPage';

const App: React.FC = () => {
  const auth = useAuth();
  const dispatch = useAppDispatch();

  console.log('App render - auth state:', {
    isAuthenticated: auth.isAuthenticated,
    hasUser: !!auth.user,
    hasToken: !!auth.token,
    username: auth.user?.username
  });

  // Автоматически получаем данные пользователя только если есть токен но нет данных пользователя
  const shouldFetchUser = auth.token && !auth.user;

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

  // Проверяем валидность сессии при загрузке
  useEffect(() => {
    dispatch(checkSessionValidity());
  }, [dispatch]);

  // Обновляем данные пользователя когда получаем ответ от API
  useEffect(() => {
    if (userData?.success && userData.data && auth.token) {
      console.log('Updating user data from getCurrentUser:', userData.data);
      dispatch(loginSuccess({
        user: userData.data,
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
  if (auth.token && (isLoadingUser || isFetchingUser) && !auth.user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#151225]">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-purple-500"></div>
        <div className="text-white mt-4">Загрузка данных пользователя...</div>
      </div>
    );
  }

  return (
    <Router>
      <div className="min-h-screen bg-[#151225]">
        <Header
          onlineUsers={1337}
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
              element={
                auth.isAuthenticated ? <Navigate to="/" replace /> : <RegisterPage />
              }
            />

            {/* Защищенные маршруты */}
            <Route
              path="/profile"
              element={
                auth.isAuthenticated ? (
                  <div className="min-h-screen bg-[#151225] text-white p-8">
                    <div className="container mx-auto">
                      <h1 className="text-3xl font-bold mb-4">Профиль пользователя</h1>
                      {auth.user && (
                        <div className="bg-[#19172D] rounded-lg p-6 border border-gray-700/50">
                          <p><strong>ID:</strong> {auth.user.id}</p>
                          <p><strong>Имя:</strong> {auth.user.username}</p>
                          <p><strong>Email:</strong> {auth.user.email}</p>
                          <p><strong>Баланс:</strong> ${auth.user.balance}</p>
                          <p><strong>Уровень:</strong> {auth.user.level}</p>
                          <p><strong>Опыт:</strong> {auth.user.xp}</p>
                        </div>
                      )}
                    </div>
                  </div>
                ) : <Navigate to="/login" replace />
              }
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
    </Router>
  );
};

export default App;
