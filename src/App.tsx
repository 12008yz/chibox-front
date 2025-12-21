import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth, useAppDispatch, useAppSelector } from './store/hooks';
import { useGetCurrentUserQuery } from './features/auth/authApi';
import { loginSuccess, logout, checkSessionValidity } from './features/auth/authSlice';
import { cleanupExpiredData } from './utils/authUtils';
import { useEffect, lazy, Suspense } from 'react';
import './index.css';
import { soundManager } from './utils/soundManager';

// Импорты компонентов (всегда загружаемые)
import Header from './components/Header';
import Footer from './components/Footer';
import FloatingWatermark from './components/FloatingWatermark';
import SteamLoadingPage from './components/SteamLoadingPage';
import ScrollToTopOnRoute from './components/ScrollToTopOnRoute';
import { DiagnosticOverlay } from './components/DiagnosticOverlay';
import { useSocket } from './hooks/useSocket';
import CookieBanner from './components/CookieBanner';
import AuthModal from './components/AuthModal';
import { setShowAuthModal } from './store/slices/uiSlice';

// Lazy loading страниц
const HomePage = lazy(() => import('./pages/HomePage'));
const SteamAuthPage = lazy(() => import('./pages/SteamAuthPage'));
const ProfilePage = lazy(() => import('./pages/profile/ProfilePage'));
const PublicProfilePage = lazy(() => import('./pages/PublicProfilePage'));
const LeaderboardPage = lazy(() => import('./pages/LeaderboardPage'));
const ExchangePage = lazy(() => import('./pages/ExchangePage'));
const UpgradePage = lazy(() => import('./pages/UpgradePage'));
const TowerDefensePage = lazy(() => import('./pages/TowerDefensePage'));
const TermsPage = lazy(() => import('./pages/TermsPage'));
const PrivacyPage = lazy(() => import('./pages/PrivacyPage'));
const ResponsibleGamingPage = lazy(() => import('./pages/ResponsibleGamingPage'));
const AboutPage = lazy(() => import('./pages/AboutPage'));
const ContactsPage = lazy(() => import('./pages/ContactsPage'));
const FAQPage = lazy(() => import('./pages/FAQPage'));
const RequisitesPage = lazy(() => import('./pages/RequisitesPage'));
const ServicesPage = lazy(() => import('./pages/ServicesPage'));

const App: React.FC = () => {
  const auth = useAuth();
  const dispatch = useAppDispatch();
  const { onlineUsers } = useSocket();
  const soundsEnabled = useAppSelector(state => state.ui.soundsEnabled);
  const showIntroVideo = useAppSelector(state => state.ui.showIntroVideo);
  const showTradeUrlModal = useAppSelector(state => state.ui.showTradeUrlModal);
  const showOnboarding = useAppSelector(state => state.ui.showOnboarding);
  const showAuthModal = useAppSelector(state => state.ui.showAuthModal);


  // Проверяем, находимся ли мы на странице Steam авторизации
  const isSteamAuthPage = window.location.pathname === '/auth/steam-success';

  // БЕЗОПАСНОСТЬ: Токены теперь в httpOnly cookies, auth.token используется только для миграции старых сессий
  // Автоматически получаем данные пользователя если:
  // 1. Есть старый токен в Redux (для миграции) ИЛИ
  // 2. Нет данных пользователя (проверим cookies на сервере)
  // НО НЕ загружаем если мы на странице Steam авторизации (там загрузка идет отдельно)
  const shouldFetchUser = !isSteamAuthPage && (
    auth.token || // Старый токен для миграции
    !auth.user || // Нет данных пользователя (проверим httpOnly cookies)
    !auth.user.id
  );

  const {
    data: userData,
    error: userError,
    isLoading: isLoadingUser,
    isFetching: isFetchingUser
  } = useGetCurrentUserQuery(
    undefined,
    {
      skip: !shouldFetchUser, // Пропускаем только на странице Steam auth
      refetchOnMountOrArgChange: true, // Перезапрашиваем для проверки httpOnly cookies
    }
  );


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

      dispatch(loginSuccess({
        user: userData.user,
        token: auth.token
      }));
    }
  }, [userData, auth.token, dispatch]);

  // Logout ТОЛЬКО при ошибке getCurrentUser (не при других API вызовах)
  useEffect(() => {
    if (userError && auth.token && shouldFetchUser) {

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

      // Исключаем элементы, которые воспроизводят свои собственные звуки
      const hasNoClickSound = target.closest('[data-no-click-sound]');

      if (isInteractive && soundsEnabled && !hasNoClickSound) {
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

  // Компонент для защищенных маршрутов
  const ProtectedRoute: React.FC<{ children: React.ReactElement }> = ({ children }) => {
    useEffect(() => {
      if (!auth.isAuthenticated) {
        dispatch(setShowAuthModal(true));
      }
    }, []);

    if (!auth.isAuthenticated) {
      return <Navigate to="/" replace />;
    }

    return children;
  };

  return (
    <Router>
      <ScrollToTopOnRoute />
      <div className="min-h-screen relative overflow-hidden">
        <FloatingWatermark />
        <div className="relative z-10">
          <Header
            onlineUsers={onlineUsers}
            user={auth.user}
          />

          <main>
          <Suspense fallback={
            <div className="min-h-screen flex items-center justify-center">
              <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-purple-500"></div>
            </div>
          }>
            <Routes>
            <Route path="/" element={<HomePage />} />
            <Route
              path="/auth/success"
              element={<SteamAuthPage />}
            />
            <Route
              path="/auth/steam-success"
              element={<SteamAuthPage />}
            />
            <Route
              path="/steam-loading"
              element={<SteamLoadingPage />}
            />

            {/* Защищенные маршруты */}
            <Route
              path="/profile"
              element={
                <ProtectedRoute>
                  <ProfilePage />
                </ProtectedRoute>
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
                <ProtectedRoute>
                  <ExchangePage />
                </ProtectedRoute>
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
                <ProtectedRoute>
                  <UpgradePage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/tower-defense"
              element={
                <ProtectedRoute>
                  <TowerDefensePage />
                </ProtectedRoute>
              }
            />
            {/* Footer Pages */}
            <Route path="/terms" element={<TermsPage />} />
            <Route path="/privacy" element={<PrivacyPage />} />
            <Route path="/responsible-gaming" element={<ResponsibleGamingPage />} />
            <Route path="/about" element={<AboutPage />} />
            <Route path="/contacts" element={<ContactsPage />} />
            <Route path="/faq" element={<FAQPage />} />
            <Route path="/requisites" element={<RequisitesPage />} />
            <Route path="/services" element={<ServicesPage />} />

            {/* 404 */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
          </Suspense>
          <Footer />
        </main>
        </div>
      </div>
      <DiagnosticOverlay />
      {/* Скрываем cookie banner во время онбординга */}
      {!showIntroVideo && !showTradeUrlModal && !showOnboarding && <CookieBanner />}

      {/* Auth Modal */}
      <AuthModal
        isOpen={showAuthModal}
        onClose={() => dispatch(setShowAuthModal(false))}
      />
    </Router>
  );
};

export default App;
