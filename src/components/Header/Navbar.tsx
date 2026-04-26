import { Link, useLocation } from "react-router-dom";
import React, { useState, useEffect, useCallback } from "react";
import { useTranslation } from 'react-i18next';
import { ShoppingBag, TrendingUp, Menu, X, Trophy, Radio, Crosshair, Settings } from 'lucide-react';
import RightContent from "./Navbar/RightContent";
import DepositModal from "../DepositModal";
import { useAppDispatch } from '../../store/hooks';
import { setShowAuthModal } from '../../store/slices/uiSlice';
import { prefetchRoute, prefetchMainNavRoutesIdle } from '../../utils/routePrefetch';
import { setPostAuthRedirect } from '../../utils/postAuthRedirect';
import { isDemoMode } from '../../utils/demoMode';
import type { User } from '../../types/api';

interface NavbarProps {
  openNotifications: boolean;
  setOpenNotifications: React.Dispatch<React.SetStateAction<boolean>>;
  user?: User | null;
  onlineUsers?: number;
}

const Navbar: React.FC<NavbarProps> = ({
  openNotifications,
  setOpenNotifications,
  user,
  onlineUsers = 0
}) => {
  const { t } = useTranslation();
  const location = useLocation();
  const dispatch = useAppDispatch();
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const mobileMenuRef = React.useRef<HTMLDivElement>(null);

  const [isDepositModalOpen, setIsDepositModalOpen] = useState(false);
  const [depositModalInitialTab, setDepositModalInitialTab] = useState<'balance' | 'subscription'>('balance');
  const [depositModalSelectedSubscription, setDepositModalSelectedSubscription] = useState<number | undefined>(undefined);

  // Один общий слушатель openDepositModal — модалка рендерится только здесь, иначе два RightContent открывали бы две модалки
  useEffect(() => {
    const handler = (e: CustomEvent<{ tab?: 'balance' | 'subscription'; subscriptionId?: number }>) => {
      setDepositModalInitialTab(e.detail?.tab || 'balance');
      setDepositModalSelectedSubscription(e.detail?.subscriptionId);
      setIsDepositModalOpen(true);
    };
    window.addEventListener('openDepositModal', handler as EventListener);
    return () => window.removeEventListener('openDepositModal', handler as EventListener);
  }, []);

  const openDepositModal = useCallback((tab: 'balance' | 'subscription' = 'balance') => {
    setDepositModalInitialTab(tab);
    setDepositModalSelectedSubscription(undefined);
    setIsDepositModalOpen(true);
  }, []);

  // Отслеживание скролла для изменения стиля навбара
  useEffect(() => {
    let rafId: number | null = null;
    let lastIsScrolled = window.scrollY > 20;
    setIsScrolled(lastIsScrolled);

    const handleScroll = () => {
      if (rafId !== null) return;
      rafId = requestAnimationFrame(() => {
        const nextIsScrolled = window.scrollY > 20;
        if (nextIsScrolled !== lastIsScrolled) {
          lastIsScrolled = nextIsScrolled;
          setIsScrolled(nextIsScrolled);
        }
        rafId = null;
      });
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', handleScroll);
      if (rafId !== null) cancelAnimationFrame(rafId);
    };
  }, []);

  // Закрываем мобильное меню при изменении маршрута
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  // На главной после idle подгружаем чанки «Апгрейд» и «Таблица лидеров» — первый клик быстрее.
  useEffect(() => {
    if (location.pathname !== '/') return;
    return prefetchMainNavRoutesIdle();
  }, [location.pathname]);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setMobileMenuOpen(false);
        return;
      }

      if (event.key !== 'Tab' || !mobileMenuRef.current) return;

      const focusableElements = mobileMenuRef.current.querySelectorAll<HTMLElement>(
        'a[href], button:not([disabled]), textarea, input, select, [tabindex]:not([tabindex="-1"])'
      );
      if (focusableElements.length === 0) return;

      const first = focusableElements[0];
      const last = focusableElements[focusableElements.length - 1];
      const active = document.activeElement as HTMLElement | null;

      if (event.shiftKey && active === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && active === last) {
        event.preventDefault();
        first.focus();
      }
    };

    if (mobileMenuOpen) {
      window.addEventListener('keydown', onKeyDown);
    }

    return () => {
      window.removeEventListener('keydown', onKeyDown);
    };
  }, [mobileMenuOpen]);

  useEffect(() => {
    if (!mobileMenuOpen || !mobileMenuRef.current) return;
    const firstFocusable = mobileMenuRef.current.querySelector<HTMLElement>(
      'a[href], button:not([disabled]), textarea, input, select, [tabindex]:not([tabindex="-1"])'
    );
    firstFocusable?.focus();
  }, [mobileMenuOpen]);

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  // Показываем модалку входа только для защищённых маршрутов; на остальные (upgrade, leaderboard) пускаем без авторизации
  type NavLinkItem = { to: string; icon: React.ReactNode; label: string; inDevelopment?: boolean };
  const PROTECTED_PATHS = ['/exchange', '/profile', '/streamer-cabinet'];
  const handleLinkClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (!user) {
      const href = e.currentTarget.getAttribute('href') ?? '';
      const path = href.replace(window.location.origin, '').split('?')[0];
      if (PROTECTED_PATHS.some((p) => path === p || path.startsWith(p + '/'))) {
        e.preventDefault();
        setPostAuthRedirect(path);
        dispatch(setShowAuthModal(true));
      }
    }
  };

  const links: NavLinkItem[] = [
    {
      to: "/exchange",
      icon: <ShoppingBag className="text-lg" />,
      label: t('header.exchange_items'),
    },
    {
      to: "/upgrade",
      icon: <TrendingUp className="text-lg" />,
      label: t('header.upgrade'),
    },
    {
      to: "/leaderboard",
      icon: <Trophy className="text-lg" />,
      label: t('header.leaderboard_table'),
    },
  ];

  return (
    <>
      {/* Основной навбар */}
      <nav
        className={`fixed top-0 left-0 right-0 z-[100] transition-[background-color,box-shadow] duration-300 will-change-[background-color] ${
          isScrolled
            ? 'bg-gradient-to-b from-[#0a0e1a] to-transparent lg:bg-[#0a0e1a]/98 lg:shadow-lg lg:shadow-black/20'
            : 'bg-gradient-to-b from-[#0a0e1a] to-transparent'
        }`}
        style={{ transform: 'translateZ(0)', contain: 'layout style paint' }}
      >
        <div className="max-w-[1920px] mx-auto">
          {/* Контейнер навбара */}
          <div className="flex items-center justify-between px-2 md:px-4 lg:px-6 xl:px-8 h-16 lg:h-20">

            {/* Левая часть - Лого */}
            <Link
              to="/"
              className="flex items-center gap-2 lg:gap-3 group relative z-10 flex-shrink-0"
            >
              <div className="relative">
                <img
                  src="/images/logo.webp"
                  alt="ChiBox Logo"
                  width="48"
                  height="48"
                  className="w-8 h-8 md:w-10 md:h-10 xl:w-12 xl:h-12 object-contain"
                  loading="eager"
                  decoding="async"
                  fetchPriority="high"
                  sizes="(max-width: 768px) 32px, (max-width: 1280px) 40px, 48px"
                  onError={(e) => {
                    e.currentTarget.src = '/vite.svg';
                  }}
                />
              </div>
              <div className="flex flex-col">
                <span className="text-base md:text-lg lg:text-xl xl:text-2xl font-bold text-white tracking-tight flex items-center gap-2 flex-wrap">
                  <span>Chi<span className="text-orange-400">Box</span></span>
                  {isDemoMode() && (
                    <span
                      className="text-[10px] md:text-xs font-semibold px-2 py-0.5 rounded-md bg-amber-500/20 text-amber-100 border border-amber-400/40 uppercase tracking-wide"
                      title="Портфолио: без реального API и платежей"
                    >
                      Демо
                    </span>
                  )}
                </span>
                <div className="text-[9px] md:text-[10px] lg:text-xs text-orange-300/70 tracking-widest uppercase flex items-center gap-1">
                  GAME
                  <Crosshair className="text-orange-400 animate-spin-fast w-3 h-3" />
                </div>
              </div>
            </Link>

            {/* Центр - Навигационные ссылки (Desktop) */}
            <div className="hidden lg:flex items-center gap-1">
              {links.map((link, index) =>
                link.inDevelopment ? (
                  <span
                    key={index}
                    className="group relative flex items-center gap-1.5 xl:gap-2 px-3 xl:px-4 2xl:px-5 py-2 xl:py-2.5 rounded-lg text-gray-500 cursor-not-allowed select-none overflow-hidden"
                  >
                    {/* Фоновый эффект при наведении (такой же, как у обычных ссылок, но более слабый) */}
                    <div className="absolute inset-0 bg-gradient-to-r from-red-500/5 to-orange-500/5 opacity-100 rounded-lg" />

                    <span className="relative z-10 text-orange-400 text-sm xl:text-base">
                      {link.icon}
                    </span>
                    <span className="relative z-10 flex flex-col leading-tight">
                      <span className="font-medium text-xs xl:text-sm whitespace-nowrap text-gray-300">
                        {link.label}
                      </span>
                      <span className="flex items-center gap-1 text-[10px] xl:text-xs text-red-400 mt-0.5">
                        <Settings className="w-3 h-3 xl:w-3.5 xl:h-3.5 animate-spin-fast" />
                        <span>В разработке</span>
                      </span>
                    </span>
                  </span>
                ) : (
                  <Link
                    key={index}
                    to={link.to}
                    onClick={handleLinkClick}
                    onMouseEnter={() => prefetchRoute(link.to)}
                    onFocus={() => prefetchRoute(link.to)}
                    data-play-click-sound-mobile
                    className="group relative flex items-center gap-1.5 xl:gap-2 px-3 xl:px-4 2xl:px-5 py-2 xl:py-2.5 rounded-lg text-gray-300 hover:text-white transition-all duration-200 overflow-hidden"
                  >
                    {/* Фоновый эффект при наведении */}
                    <div className="absolute inset-0 bg-gradient-to-r from-orange-500/10 to-amber-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-200 rounded-lg"></div>

                    {/* Нижняя граница при наведении */}
                    <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-0 h-0.5 bg-gradient-to-r from-orange-500 to-amber-500 group-hover:w-3/4 transition-all duration-300"></div>

                    <span className="relative z-10 text-orange-400 group-hover:scale-110 transition-transform duration-200 text-sm xl:text-base">
                      {link.icon}
                    </span>
                    <span className="relative z-10 font-medium text-xs xl:text-sm whitespace-nowrap">
                      {link.label}
                    </span>
                  </Link>
                )
              )}
            </div>

            {/* Правая часть - Онлайн счетчик и авторизация */}
            <div className="flex items-center gap-3 lg:gap-6">

              {/* Онлайн пользователи (Desktop) */}
              <div className="hidden md:flex items-center gap-1 lg:gap-2 px-2 lg:px-3 xl:px-4 py-1.5 lg:py-2 bg-gradient-to-r from-gray-800/50 to-gray-900/50 rounded-lg border border-gray-700/30">
                <Radio className="text-green-400 animate-pulse w-4 h-4 lg:w-5 lg:h-5" />
                <span className="text-xs lg:text-sm text-gray-300 font-medium">
                  <span className="text-white font-bold">{onlineUsers.toLocaleString()}</span> <span className="hidden xl:inline">{t('header.online') || 'Online'}</span>
                </span>
              </div>

              {/* RightContent - Уведомления и профиль */}
              <div className="hidden lg:block">
                <RightContent
                  openNotifications={openNotifications}
                  setOpenNotifications={setOpenNotifications}
                  user={user}
                  onOpenDepositModal={openDepositModal}
                />
              </div>

              {/* Мобильное меню (Mobile) */}
              <button
                onClick={toggleMobileMenu}
                className="lg:hidden min-w-[44px] min-h-[44px] p-2 text-gray-300 hover:text-white transition-colors"
                aria-label={mobileMenuOpen ? t('common.close') : t('header.menu')}
                aria-expanded={mobileMenuOpen}
                aria-controls="mobile-navigation-menu"
              >
                {mobileMenuOpen ? (
                  <X className="w-6 h-6" />
                ) : (
                  <Menu className="w-6 h-6" />
                )}
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Мобильное меню */}
      <div
        id="mobile-navigation-menu"
        className={`fixed inset-0 z-[99] lg:hidden transition-all duration-300 ${
          mobileMenuOpen
            ? 'opacity-100 pointer-events-auto'
            : 'opacity-0 pointer-events-none'
        }`}
        role="dialog"
        aria-modal="true"
        aria-label={t('header.menu')}
      >
        {/* Затемнение */}
        <div
          className="absolute inset-0 bg-black/90"
          onClick={toggleMobileMenu}
        ></div>

        {/* Меню */}
        <div
          ref={mobileMenuRef}
          className={`absolute top-16 left-0 right-0 bg-[#0a0e1a] border-b border-gray-800 shadow-2xl transition-transform duration-300 ${
            mobileMenuOpen ? 'translate-y-0' : '-translate-y-full'
          }`}
        >
          <div className="px-4 py-6 space-y-4">

            {/* Навигационные ссылки */}
            <div className="space-y-2">
              {links.map((link, index) =>
                link.inDevelopment ? (
                  <span
                    key={index}
                    className="flex items-center gap-3 px-4 py-3 rounded-lg bg-gray-800/50 border border-gray-700/30 text-gray-500 cursor-not-allowed select-none"
                  >
                    <span className="text-orange-400">
                      {link.icon}
                    </span>
                    <span className="flex flex-col">
                      <span className="text-white font-medium">
                        {link.label}
                      </span>
                      <span className="flex items-center gap-1 text-xs text-red-400 mt-0.5">
                        <Settings className="w-4 h-4 animate-spin-fast" />
                        <span>В разработке</span>
                      </span>
                    </span>
                  </span>
                ) : (
                  <Link
                    key={index}
                    to={link.to}
                    onClick={(e) => {
                      handleLinkClick(e);
                      if (user) {
                        toggleMobileMenu();
                      }
                    }}
                    onMouseEnter={() => prefetchRoute(link.to)}
                    onFocus={() => prefetchRoute(link.to)}
                    data-play-click-sound-mobile
                    className="flex items-center gap-3 px-4 py-3 rounded-lg bg-gradient-to-r from-gray-800/50 to-gray-900/50 border border-gray-700/30 hover:border-orange-500/50 transition-all"
                  >
                    <span className="text-orange-400">
                      {link.icon}
                    </span>
                    <span className="text-white font-medium">
                      {link.label}
                    </span>
                  </Link>
                )
              )}
            </div>

            {/* Онлайн счетчик (Mobile) */}
            <div className="flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-gray-800/50 to-gray-900/50 rounded-lg border border-gray-700/30">
              <Radio className="text-green-400 animate-pulse w-4 h-4" />
              <span className="text-sm text-gray-300 font-medium">
                <span className="text-white font-bold">{onlineUsers.toLocaleString()}</span> {t('header.online') || 'онлайн'}
              </span>
            </div>

            {/* RightContent для мобильных */}
            <div className="pt-4 border-t border-gray-700/30">
              <RightContent
                openNotifications={openNotifications}
                setOpenNotifications={setOpenNotifications}
                user={user}
                onOpenDepositModal={openDepositModal}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Одна модалка пополнения на всё приложение (из баннера, кейса, хедера) */}
      <DepositModal
        isOpen={isDepositModalOpen}
        onClose={() => {
          setIsDepositModalOpen(false);
          setDepositModalSelectedSubscription(undefined);
        }}
        initialTab={depositModalInitialTab}
        initialSelectedSubscription={depositModalSelectedSubscription}
      />

      {/* Spacer для контента под фиксированным навбаром */}
      <div className="h-16 lg:h-20"></div>
    </>
  );
};

export default Navbar;
