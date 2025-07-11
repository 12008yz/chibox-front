import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth, useAppDispatch } from './store/hooks';
import { useGetCurrentUserQuery } from './features/auth/authApi';
import { loginSuccess, logout } from './features/auth/authSlice';
import { useEffect } from 'react';
import './index.css'

// Импорты компонентов
import Header from './components/Header';
import LoginPage from './pages/loginPage';
import RegisterPage from './pages/RegisterPage';
// import HomePage from './pages/HomePage';
// import SubscriptionsPage from './pages/SubscriptionsPage';
// import LeaderboardPage from './pages/LeaderboardPage';
// import TestPage from './pages/testPage';

// Компонент для отображения страниц с Header
const PageWithHeader = ({ children }: { children: React.ReactNode }) => {
  const { user } = useAuth();

  // Временный фиктивный пользователь для демонстрации
  const mockUser = user || {
    id: '1',
    username: 'TestUser',
    balance: 1250.50,
    walletBalance: 1250.50,
    profilePicture: 'https://avatars.githubusercontent.com/u/1?v=4'
  };

  return (
    <div>
      <Header onlineUsers={1547} user={mockUser} />
      {children}
    </div>
  );
};

function App() {
  const { isAuthenticated, token, user } = useAuth();
  const dispatch = useAppDispatch();

  // Проверяем токен при загрузке приложения (временно отключено для демо)
  const { data: currentUserData, error } = useGetCurrentUserQuery(undefined, {
    skip: true, // Отключаем API запросы для демонстрации
  });

  useEffect(() => {
    if (currentUserData?.success && currentUserData.data && token) {
      // Обновляем пользователя в store
      dispatch(loginSuccess({
        user: currentUserData.data,
        token: token,
      }));
    }
    // Ошибки 401 обрабатываются автоматически в baseApi.ts
  }, [currentUserData, token, dispatch]);

  return (
    <Router>
      <div className="min-h-screen bg-[#151225]">
        <Routes>
          {/* Страницы без header */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />

          {/* Страницы с header */}
          <Route path="/*" element={
            <PageWithHeader>
              <Routes>
                <Route path="/" element={<div className="p-8 text-center">
                  <h1 className="text-4xl font-bold mb-4">Добро пожаловать в ChiBox!</h1>
                  <p className="text-gray-300">Header успешно интегрирован с вашим Redux store.</p>
                  {isAuthenticated && user && (
                    <div className="mt-6 p-4 bg-green-900/20 rounded-lg">
                      <p className="text-green-400">Вы вошли как: <span className="font-bold">{user.username}</span></p>
                      <p className="text-green-400">Баланс: {user.balance} РУБ</p>
                    </div>
                  )}
                </div>} />
                <Route path="/marketplace" element={<div className="p-8 text-center">
                  <h1 className="text-3xl font-bold">Marketplace</h1>
                </div>} />
                <Route path="/coinflip" element={<div className="p-8 text-center">
                  <h1 className="text-3xl font-bold">Coin Flip</h1>
                </div>} />
                <Route path="/crash" element={<div className="p-8 text-center">
                  <h1 className="text-3xl font-bold">Crash</h1>
                </div>} />
                <Route path="/upgrade" element={<div className="p-8 text-center">
                  <h1 className="text-3xl font-bold">Upgrade</h1>
                </div>} />
                <Route path="/slot" element={<div className="p-8 text-center">
                  <h1 className="text-3xl font-bold">Slots</h1>
                </div>} />
              </Routes>
            </PageWithHeader>
          } />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
