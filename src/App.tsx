import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useAuth, useAppDispatch, useAppSelector } from './store/hooks';
import { useGetCurrentUserQuery } from './features/auth/authApi';
import { loginSuccess, logout, checkSessionValidity } from './features/auth/authSlice';
import { cleanupExpiredData } from './utils/authUtils';
import { useEffect, useLayoutEffect, Suspense, useCallback, useState } from 'react';
import './index.css';
import { soundManager } from './utils/soundManager';
import { lazyWithChunkError } from './utils/lazyWithChunkError';

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
import ReferralModal from './components/ReferralModal';
import PaymentSuccessModal from './components/PaymentSuccessModal';
import { setShowAuthModal } from './store/slices/uiSlice';
import { setReferralCookie, wasReferralModalShownForCode, setReferralModalShownForCode } from './utils/referralUtils';
import { API_URL } from './utils/config';
import { isDemoMode } from './utils/demoMode';
import { HAD_USER_ACCOUNT_KEY, setPostAuthRedirect } from './utils/postAuthRedirect';

// Главная без lazy: иначе Suspense блокирует весь HomePage (баннер, разметка) пока грузится отдельный чанк — в инкогнито без кеша виден «пустой экран + спиннер».
import HomePage from './pages/HomePage';

// Lazy loading страниц: при 404 чанка после деплоя — авто-перезагрузка
const SteamAuthPage = lazyWithChunkError(() => import('./pages/SteamAuthPage'));
const ProfilePage = lazyWithChunkError(() => import('./pages/profile/ProfilePage'));
const PublicProfilePage = lazyWithChunkError(() => import('./pages/PublicProfilePage'));
const LeaderboardPage = lazyWithChunkError(() => import('./pages/LeaderboardPage'));
const ExchangePage = lazyWithChunkError(() => import('./pages/ExchangePage'));
const UpgradePage = lazyWithChunkError(() => import('./pages/UpgradePage'));
const TermsPage = lazyWithChunkError(() => import('./pages/TermsPage'));
const PrivacyPage = lazyWithChunkError(() => import('./pages/PrivacyPage'));
const ResponsibleGamingPage = lazyWithChunkError(() => import('./pages/ResponsibleGamingPage'));
const AboutPage = lazyWithChunkError(() => import('./pages/AboutPage'));
const ContactsPage = lazyWithChunkError(() => import('./pages/ContactsPage'));
const FAQPage = lazyWithChunkError(() => import('./pages/FAQPage'));
const RequisitesPage = lazyWithChunkError(() => import('./pages/RequisitesPage'));
const ServicesPage = lazyWithChunkError(() => import('./pages/ServicesPage'));
const StreamerCabinetPage = lazyWithChunkError(() => import('./pages/StreamerCabinetPage'));
const NotFoundPage = lazyWithChunkError(() => import('./pages/NotFoundPage'));

function RouteSuspenseFallback() {
  return (
    <div className="flex justify-center py-16 md:py-24" aria-busy>
      <div
        className="h-10 w-10 animate-spin rounded-full border-2 border-purple-500/80 border-t-transparent"
        aria-hidden
      />
    </div>
  );
}

const ProtectedRoute: React.FC<{
  children: React.ReactElement;
  isAuthenticated: boolean;
  onShowAuthModal: () => void;
}> = ({ children, isAuthenticated, onShowAuthModal }) => {
  const location = useLocation();

  useLayoutEffect(() => {
    if (!isAuthenticated) {
      setPostAuthRedirect(`${location.pathname}${location.search}`);
    }
  }, [isAuthenticated, location.pathname, location.search]);

  useEffect(() => {
    if (!isAuthenticated) onShowAuthModal();
  }, [isAuthenticated, onShowAuthModal]);

  if (!isAuthenticated) return <Navigate to="/" replace />;
  return children;
};

const STREAMER_SUBDOMAIN_PREFIX = 'streamer.';

const App: React.FC = () => {
  const auth = useAuth();
  const dispatch = useAppDispatch();
  const { onlineUsers } = useSocket();
  const soundsEnabled = useAppSelector(state => state.ui.soundsEnabled);
  const showIntroVideo = useAppSelector(state => state.ui.showIntroVideo);
  const showTradeUrlModal = useAppSelector(state => state.ui.showTradeUrlModal);
  const showOnboarding = useAppSelector(state => state.ui.showOnboarding);
  const showAuthModal = useAppSelector(state => state.ui.showAuthModal);
  const onShowAuthModal = useCallback(() => dispatch(setShowAuthModal(true)), [dispatch]);
  const [referralModalCode, setReferralModalCode] = useState<string | null>(null);

  // Не дергаем /profile на колбэке Steam (ручная загрузка в SteamAuthPage), на обоих путях возврата.
  const isSteamAuthPage =
    window.location.pathname === '/auth/steam-success' ||
    window.location.pathname === '/auth/success';
  const hadAccountHint =
    typeof window !== 'undefined' && localStorage.getItem(HAD_USER_ACCOUNT_KEY) === '1';
  // Профиль: при известной сессии в Redux/cookie-миграции; либо одна попытка восстановления после сброса persist при «подсказке» из localStorage.
  const shouldFetchUser =
    !isSteamAuthPage &&
    (Boolean(auth.token) ||
      Boolean(auth.user?.id) ||
      auth.isAuthenticated ||
      (hadAccountHint && !auth.token && !auth.user?.id && !auth.isAuthenticated));

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

  // Обновляем данные пользователя когда получаем ответ от API (в т.ч. после сохранения профиля / Trade URL)
  useEffect(() => {
    if (userData?.success && userData.user) {
      dispatch(loginSuccess({
        user: userData.user,
        token: auth.token ?? undefined
      }));
    }
  }, [userData, auth.token, dispatch]);

  // Ошибка getCurrentUser: сброс «подсказки» при тихой проверке без сессии; иначе — полный logout при признаках залогиненного стора.
  useEffect(() => {
    if (!userError || !shouldFetchUser) return;

    const status = (userError as { status?: number }).status;
    const unauthorized = status === 401 || status === 403;
    let hinted = false;
    try {
      hinted = localStorage.getItem(HAD_USER_ACCOUNT_KEY) === '1';
    } catch {
      /* noop */
    }

    if (unauthorized && hinted && !auth.isAuthenticated && !auth.user?.id) {
      try {
        localStorage.removeItem(HAD_USER_ACCOUNT_KEY);
      } catch {
        /* noop */
      }
      return;
    }

    if (auth.token || auth.isAuthenticated) {
      dispatch(logout());
    }
  }, [userError, shouldFetchUser, auth.token, auth.isAuthenticated, auth.user?.id, dispatch]);

  // Синхронизация настройки звука с soundManager
  useEffect(() => {
    soundManager.setSoundsEnabled(soundsEnabled);
  }, [soundsEnabled]);

  // Реферальная программа: с поддомена streamer.*/CODE — сразу переход на бэкенд (учёт на сервере + редирект на main)
  useEffect(() => {
    const host = window.location.hostname;
    const path = window.location.pathname;
    if (host.startsWith(STREAMER_SUBDOMAIN_PREFIX) && path.length > 1) {
      const code = path.slice(1).replace(/\/.*$/, '');
      if (code) {
        const redirectUrl = `${API_URL}/v1/referral/redirect/${encodeURIComponent(code)}`;
        window.location.replace(redirectUrl);
      }
    }
  }, []);

  // Реферальная программа: при заходе с ?ref= — сохранить ref в cookie, показать модалку один раз.
  // Учёт перехода уже сделан на бэкенде при редиректе (streamer.site/r/CODE → redirect).
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const refFromUrl = params.get('ref')?.trim();
    if (!refFromUrl) return;
    setReferralCookie(refFromUrl);
    if (!wasReferralModalShownForCode(refFromUrl)) {
      setReferralModalShownForCode(refFromUrl);
      setReferralModalCode(refFromUrl);
    }
    window.history.replaceState({}, '', window.location.pathname + (window.location.hash || ''));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Глобальный звук клика (на мобильных — только в зонах с data-play-click-sound-mobile)
  useEffect(() => {
    const handleGlobalClick = (event: MouseEvent) => {
      // В demo-режиме игнорируем синтетические клики (скрипты/автофокус), чтобы убрать "вечный клик" в профиле.
      if (isDemoMode() && !event.isTrusted) return;

      const target = event.target as HTMLElement;
      const isInteractive = target.closest('button, a, input, select, textarea, [role="button"], [onclick]');

      const hasNoClickSound = target.closest('[data-no-click-sound]');
      if (!isInteractive || !soundsEnabled || hasNoClickSound) return;

      const isMobile = typeof window !== 'undefined' && window.innerWidth < 1024;
      if (isMobile && !target.closest('[data-play-click-sound-mobile]')) return;

      soundManager.play('uiClick');
    };

    document.addEventListener('click', handleGlobalClick);

    return () => {
      document.removeEventListener('click', handleGlobalClick);
    };
  }, [soundsEnabled]);

  // Показываем загрузку только при первичной проверке токена
  if (auth.token && (isLoadingUser || isFetchingUser) && (!auth.user || !auth.user.id)) {

    return (
      <div className="min-h-screen flex items-center justify-center relative overflow-hidden bg-[#0d0b14]">
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
      <div className="app-bg" aria-hidden="true" />
      <ScrollToTopOnRoute />
      {/* overflow-x-hidden: горизонтальный клип без обрезания скролла по вертикали (иначе подвал мог «теряться» под длинными страницами) */}
      <div className="min-h-screen relative overflow-x-hidden">
        <FloatingWatermark />
        <div className="relative z-10">
          <Header
            onlineUsers={onlineUsers}
            user={auth.user}
          />

          {referralModalCode && (
            <ReferralModal
              isOpen={!!referralModalCode}
              onClose={() => setReferralModalCode(null)}
              referralCode={referralModalCode}
            />
          )}
          <PaymentSuccessModal />
          <main>
          <Suspense fallback={<RouteSuspenseFallback />}>
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
                <ProtectedRoute isAuthenticated={auth.isAuthenticated} onShowAuthModal={onShowAuthModal}>
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
                <ProtectedRoute isAuthenticated={auth.isAuthenticated} onShowAuthModal={onShowAuthModal}>
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
            <Route path="/coinflip" element={<Navigate to="/leaderboard" replace />} />
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
            <Route path="/upgrade" element={<UpgradePage />} />
            {/* Footer Pages */}
            <Route path="/terms" element={<TermsPage />} />
            <Route path="/privacy" element={<PrivacyPage />} />
            <Route path="/responsible-gaming" element={<ResponsibleGamingPage />} />
            <Route path="/about" element={<AboutPage />} />
            <Route path="/contacts" element={<ContactsPage />} />
            <Route path="/faq" element={<FAQPage />} />
            <Route path="/requisites" element={<RequisitesPage />} />
            <Route path="/services" element={<ServicesPage />} />
            <Route
              path="/streamer-cabinet"
              element={
                <ProtectedRoute isAuthenticated={auth.isAuthenticated} onShowAuthModal={onShowAuthModal}>
                  <StreamerCabinetPage />
                </ProtectedRoute>
              }
            />

            <Route path="*" element={<NotFoundPage />} />
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
