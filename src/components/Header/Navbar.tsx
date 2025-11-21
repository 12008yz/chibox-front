import { Link } from "react-router-dom";
import React, { useState, useEffect } from "react";
import { useTranslation } from 'react-i18next';
import { MdOutlineSell } from "react-icons/md";
import { GiUpgrade } from 'react-icons/gi';
import { FaDice } from "react-icons/fa";
import { FaBars, FaTimes } from 'react-icons/fa';
import { IoMdTrophy } from 'react-icons/io';
import { ImConnection } from "react-icons/im";
import { HiSparkles } from 'react-icons/hi';
import RightContent from "./Navbar/RightContent";

interface NavbarProps {
  openNotifications: boolean;
  setOpenNotifications: React.Dispatch<React.SetStateAction<boolean>>;
  openSidebar: boolean;
  setOpenSidebar: (open: boolean) => void;
  user?: any;
  authModalOpen?: boolean;
  setAuthModalOpen?: React.Dispatch<React.SetStateAction<boolean>>;
  authModalTab?: 'login' | 'register';
  setAuthModalTab?: React.Dispatch<React.SetStateAction<'login' | 'register'>>;
  onlineUsers?: number;
}

const Navbar: React.FC<NavbarProps> = ({
  openNotifications,
  setOpenNotifications,
  openSidebar,
  setOpenSidebar,
  user,
  authModalOpen,
  setAuthModalOpen,
  authModalTab,
  setAuthModalTab,
  onlineUsers = 0
}) => {
  const { t } = useTranslation();
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Отслеживание скролла для изменения стиля навбара
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  const links = [
    {
      to: "/exchange",
      icon: <MdOutlineSell className="text-lg" />,
      label: t('header.exchange_items'),
    },
    {
      to: "/upgrade",
      icon: <GiUpgrade className="text-lg" />,
      label: t('header.upgrade'),
    },
    {
      to: "/slot",
      icon: <FaDice className="text-lg" />,
      label: t('header.slot'),
    },
    {
      to: "/leaderboard",
      icon: <IoMdTrophy className="text-lg" />,
      label: t('header.leaderboard_table'),
    }
  ];

  return (
    <>
      {/* Основной навбар */}
      <nav
        className={`fixed top-0 left-0 right-0 z-[100] transition-all duration-300 ${
          isScrolled
            ? 'bg-[#0a0e1a]/95 backdrop-blur-lg shadow-lg shadow-black/20'
            : 'bg-gradient-to-b from-[#0a0e1a] to-transparent'
        }`}
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
                  src="/images/logo.png"
                  alt="ChiBox Logo"
                  className="w-8 h-8 md:w-10 md:h-10 xl:w-12 xl:h-12 object-contain transition-transform duration-300 group-hover:scale-110 drop-shadow-[0_0_15px_rgba(251,146,60,0.5)]"
                  onError={(e) => {
                    e.currentTarget.src = '/vite.svg';
                  }}
                />
              </div>
              <div className="hidden sm:flex flex-col">
                <span className="text-lg md:text-xl xl:text-2xl font-bold text-white tracking-tight">
                  Chi<span className="text-orange-400">Box</span>
                </span>
                <div className="text-[10px] md:text-xs text-orange-300/70 tracking-widest uppercase flex items-center gap-1">
                  GAME
                  <HiSparkles className="text-orange-400 animate-spin-slow" />
                </div>
              </div>
            </Link>

            {/* Центр - Навигационные ссылки (Desktop) */}
            <div className="hidden lg:flex items-center gap-1">
              {links.map((link, index) => (
                <Link
                  key={index}
                  to={link.to}
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
              ))}
            </div>

            {/* Правая часть - Онлайн счетчик и авторизация */}
            <div className="flex items-center gap-3 lg:gap-6">

              {/* Онлайн пользователи (Desktop) */}
              <div className="hidden md:flex items-center gap-1 lg:gap-2 px-2 lg:px-3 xl:px-4 py-1.5 lg:py-2 bg-gradient-to-r from-gray-800/50 to-gray-900/50 rounded-lg border border-gray-700/30">
                <ImConnection className="text-green-400 animate-pulse text-sm lg:text-base" />
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
                  authModalOpen={authModalOpen}
                  setAuthModalOpen={setAuthModalOpen}
                  authModalTab={authModalTab}
                  setAuthModalTab={setAuthModalTab}
                />
              </div>

              {/* Мобильное меню (Mobile) */}
              <button
                onClick={toggleMobileMenu}
                className="lg:hidden p-2 text-gray-300 hover:text-white transition-colors"
              >
                {mobileMenuOpen ? (
                  <FaTimes className="text-2xl" />
                ) : (
                  <FaBars className="text-2xl" />
                )}
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Мобильное меню */}
      <div
        className={`fixed inset-0 z-[99] lg:hidden transition-all duration-300 ${
          mobileMenuOpen
            ? 'opacity-100 pointer-events-auto'
            : 'opacity-0 pointer-events-none'
        }`}
      >
        {/* Затемнение */}
        <div
          className="absolute inset-0 bg-black/80 backdrop-blur-sm"
          onClick={toggleMobileMenu}
        ></div>

        {/* Меню */}
        <div
          className={`absolute top-16 left-0 right-0 bg-[#0a0e1a] border-b border-gray-800 shadow-2xl transition-transform duration-300 ${
            mobileMenuOpen ? 'translate-y-0' : '-translate-y-full'
          }`}
        >
          <div className="px-4 py-6 space-y-4">

            {/* Навигационные ссылки */}
            <div className="space-y-2">
              {links.map((link, index) => (
                <Link
                  key={index}
                  to={link.to}
                  onClick={toggleMobileMenu}
                  className="flex items-center gap-3 px-4 py-3 rounded-lg bg-gradient-to-r from-gray-800/50 to-gray-900/50 border border-gray-700/30 hover:border-orange-500/50 transition-all"
                >
                  <span className="text-orange-400">
                    {link.icon}
                  </span>
                  <span className="text-white font-medium">
                    {link.label}
                  </span>
                </Link>
              ))}
            </div>

            {/* Онлайн счетчик (Mobile) */}
            <div className="flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-gray-800/50 to-gray-900/50 rounded-lg border border-gray-700/30">
              <ImConnection className="text-green-400 animate-pulse" />
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
                authModalOpen={authModalOpen}
                setAuthModalOpen={setAuthModalOpen}
                authModalTab={authModalTab}
                setAuthModalTab={setAuthModalTab}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Spacer для контента под фиксированным навбаром */}
      <div className="h-16 lg:h-20"></div>
    </>
  );
};

export default Navbar;
