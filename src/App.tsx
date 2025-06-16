import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { useAuth, useAppDispatch } from './store/hooks';
import { useGetCurrentUserQuery } from './features/auth/authApi';
import { loginSuccess, logout } from './features/auth/authSlice';
import { useEffect } from 'react';
import './index.css'

// Импорты страниц (создадим далее)
import Layout from './components/Layout/Layout';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
// import CasesPage from './pages/CasesPage';
// import InventoryPage from './pages/InventoryPage';
// import ProfilePage from './pages/ProfilePage';

function App() {
  const { isAuthenticated, token } = useAuth();
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

    if (error && token) {
      // Если токен недействителен, выходим
      dispatch(logout());
    }
  }, [currentUserData, error, token, dispatch]);

  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        <Routes>
          {/* Публичные маршруты */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />

          {/* Защищенные маршруты */}
          <Route path="/" element={<Layout />}>
            <Route index element={<HomePage />} />
           
          </Route>
        </Routes>
      </div>
    </Router>
  );
}

export default App;
