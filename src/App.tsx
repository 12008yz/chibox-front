import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth, useAppDispatch } from './store/hooks';
import { useGetCurrentUserQuery } from './features/auth/authApi';
import { loginSuccess, logout } from './features/auth/authSlice';
import { useEffect } from 'react';
import './index.css'

// Импорты компонентов
// import Header from './components/Header/Header';
// import HomePage from './pages/HomePage';
// import LoginPage from './pages/LoginPage';
// import RegisterPage from './pages/RegisterPage';
// import SubscriptionsPage from './pages/SubscriptionsPage';
// import LeaderboardPage from './pages/LeaderboardPage';
// import TestPage from './pages/testPage';

// Компонент для отображения страниц с Header
const PageWithHeader = ({ children }: { children: React.ReactNode }) => {
  return (
    <div></div>
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
   <div></div>
  );
}

export default App;
