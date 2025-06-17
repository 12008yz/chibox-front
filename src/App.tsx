import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth, useAppDispatch } from './store/hooks';
import { useGetCurrentUserQuery } from './features/auth/authApi';
import { loginSuccess, logout } from './features/auth/authSlice';
import { useEffect } from 'react';
import './index.css'

// Импорты компонентов
import Header from './components/Header/Header';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import SubscriptionsPage from './pages/SubscriptionsPage';
import TestPage from './pages/testPage';

// Компонент для отображения страниц с Header
const PageWithHeader = ({ children }: { children: React.ReactNode }) => {
  return (
    <>
      <Header />
      <main className="min-h-screen bg-gray-50">
        {children}
      </main>
    </>
  );
};

function App() {
  const { isAuthenticated, token, user } = useAuth();
  const dispatch = useAppDispatch();

  // Проверяем токен при загрузке приложения
  const { data: currentUserData, error } = useGetCurrentUserQuery(undefined, {
    skip: !token || !isAuthenticated,
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
      <div className="min-h-screen bg-gray-50">
        <Routes>
          {/* Главная страница - показываем регистрацию для неавторизованных */}
          <Route
            path="/"
            element={
              <PageWithHeader>
                {isAuthenticated ? <HomePage /> : <RegisterPage />}
              </PageWithHeader>
            }
          />

          {/* Страницы авторизации без Header */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />

          {/* Страницы с Header - доступны всем */}
          <Route
            path="/cases"
            element={
              <PageWithHeader>
                <div className="p-8 text-center">
                  <h1 className="text-3xl font-bold">Кейсы</h1>
                  <p className="text-gray-600 mt-4">Страница кейсов - в разработке</p>
                </div>
              </PageWithHeader>
            }
          />

          <Route
            path="/inventory"
            element={
              <PageWithHeader>
                <div className="p-8 text-center">
                  <h1 className="text-3xl font-bold">Инвентарь</h1>
                  <p className="text-gray-600 mt-4">Ваш инвентарь - в разработке</p>
                </div>
              </PageWithHeader>
            }
          />

          <Route
            path="/profile"
            element={
              <PageWithHeader>
                <div className="p-8 text-center">
                  <h1 className="text-3xl font-bold">Профиль</h1>
                  <p className="text-gray-600 mt-4">Профиль пользователя - в разработке</p>
                </div>
              </PageWithHeader>
            }
          />

          <Route
            path="/achievements"
            element={
              <PageWithHeader>
                <div className="p-8 text-center">
                  <h1 className="text-3xl font-bold">Достижения</h1>
                  <p className="text-gray-600 mt-4">Ваши достижения - в разработке</p>
                </div>
              </PageWithHeader>
            }
          />

          {/* Страница подписок */}
          <Route
            path="/subscription"
            element={
              <PageWithHeader>
                <SubscriptionsPage />
              </PageWithHeader>
            }
          />

          <Route
            path="/balance"
            element={
              <PageWithHeader>
                <div className="p-8 text-center">
                  <h1 className="text-3xl font-bold">Баланс</h1>
                  <p className="text-gray-600 mt-4">Управление балансом - в разработке</p>
                </div>
              </PageWithHeader>
            }
          />

          <Route
            path="/settings"
            element={
              <PageWithHeader>
                <div className="p-8 text-center">
                  <h1 className="text-3xl font-bold">Настройки</h1>
                  <p className="text-gray-600 mt-4">Настройки аккаунта - в разработке</p>
                </div>
              </PageWithHeader>
            }
          />

          <Route
            path="/notifications"
            element={
              <PageWithHeader>
                <div className="p-8 text-center">
                  <h1 className="text-3xl font-bold">Уведомления</h1>
                  <p className="text-gray-600 mt-4">Все уведомления - в разработке</p>
                </div>
              </PageWithHeader>
            }
          />

          {/* После успешной регистрации перенаправляем на подписки */}
          <Route
            path="/welcome"
            element={
              isAuthenticated ? (
                <PageWithHeader>
                  <SubscriptionsPage />
                </PageWithHeader>
              ) : (
                <Navigate to="/register" replace />
              )
            }
          />

          {/* Тестовая страница */}
          <Route
            path="/test"
            element={
              <PageWithHeader>
                <TestPage />
              </PageWithHeader>
            }
          />

          {/* Защищенные маршруты (пример) */}
          <Route
            path="/admin"
            element={
              isAuthenticated && user?.role === 'admin' ? (
                <PageWithHeader>
                  <div className="p-8 text-center">
                    <h1 className="text-3xl font-bold">Панель администратора</h1>
                    <p className="text-gray-600 mt-4">Админ панель - в разработке</p>
                  </div>
                </PageWithHeader>
              ) : (
                <Navigate to="/" replace />
              )
            }
          />

          {/* 404 страница */}
          <Route
            path="*"
            element={
              <PageWithHeader>
                <div className="p-8 text-center">
                  <h1 className="text-3xl font-bold">404</h1>
                  <p className="text-gray-600 mt-4">Страница не найдена</p>
                </div>
              </PageWithHeader>
            }
          />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
