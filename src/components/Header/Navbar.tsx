import { Link } from "react-router-dom";
import React from "react";
import { useTranslation } from 'react-i18next';
import { MdOutlineSell } from "react-icons/md";
// import { SlPlane } from "react-icons/sl";
import { GiUpgrade } from 'react-icons/gi';
// import { TbCat } from "react-icons/tb";
import { FaDice } from "react-icons/fa";
import { FaBars } from 'react-icons/fa';
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
  setAuthModalTab
}) => {
  const { t } = useTranslation();

  const toggleSidebar = () => {
    setOpenSidebar(!openSidebar);
  };

  const links = [
    {
      to: "/exchange",
      icon: <MdOutlineSell className="text-xl" />,
      label: t('header.exchange_items'),
      color: "from-pink-500 to-violet-500"
    },
    {
      to: "/upgrade",
      icon: <GiUpgrade className="text-xl" />,
      label: t('header.upgrade'),
      color: "from-cyan-500 to-blue-500"
    },
    {
      to: "/slot",
      icon: <FaDice className="text-xl" />,
      label: t('header.slot'),
      color: "from-green-400 to-emerald-500"
    },
    {
      to: "/leaderboard",
      label: t('header.leaderboard_table'),
      color: "from-yellow-400 to-orange-500"
    }
  ];

  return (
    <div className="w-full relative z-[9999]" style={{ background: 'transparent' }}>
      <nav className="modern-navbar group w-full" style={{ background: 'transparent' }}>
        <div className="relative flex items-center justify-between w-full min-h-[64px] px-8 py-4" style={{ background: 'transparent' }}>
          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <button
              onClick={toggleSidebar}
              className="mobile-menu-btn group"
            >
              <FaBars className="text-xl text-white transition-transform group-hover:rotate-90" />
              <div className="btn-glow"></div>
            </button>
          </div>

          {/* Logo and Desktop Navigation */}
          <div className="hidden md:flex items-center flex-1">
            {/* Logo */}
            <Link to="/" className="gaming-logo group mr-8">
              <div className="logo-container">
                <img
                  src="/images/logo.png"
                  alt="ChiBox Logo"
                  className="w-12 h-12 object-contain transition-transform group-hover:scale-110"
                  onError={(e) => {
                    e.currentTarget.src = '/vite.svg';
                  }}
                />
                <div className="logo-glow"></div>
              </div>
              <div className="logo-text">
                <div className="font-bold text-xl text-white gaming-font">
                  Chi<span className="text-cyan-400">Box</span>
                </div>
                <div className="text-xs text-cyan-300/70 tracking-widest uppercase flex items-center gap-1">
                  GAME
                  <HiSparkles className="logo-star text-cyan-400" />
                </div>
              </div>
            </Link>

            {/* Navigation Links */}
            <div className="flex items-center gap-2">
              {links.map((link, index) => (
                <Link
                  key={index}
                  to={link.to}
                  id={link.to === '/slot' ? 'onboarding-slot-button' : undefined}
                  className="gaming-nav-item group"
                >
                  <div className="nav-item-content">
                    <div className="nav-icon">
                      {link.icon}
                    </div>
                    <span className="nav-label gaming-font">{link.label}</span>
                  </div>
                  <div className={`nav-item-glow bg-gradient-to-r ${link.color}`}></div>
                  <div className="nav-item-border"></div>
                </Link>
              ))}
            </div>
          </div>

          {/* Mobile Logo */}
          <div className="md:hidden flex items-center flex-1">
            <Link to="/" className="mobile-logo group">
              <img
                src="/vite.svg"
                alt="ChiBox Logo"
                className="w-8 h-8 object-contain transition-transform group-hover:scale-110"
                onError={(e) => {
                  e.currentTarget.src = '/vite.svg';
                }}
              />
              <div className="font-bold text-lg text-white ml-2 flex items-center gap-1">
                Chi<span className="text-cyan-400">Box</span>
                <HiSparkles className="logo-star-mobile text-cyan-400" />
              </div>
            </Link>
          </div>

          {/* Right Content - User Actions */}
          <div className="flex-shrink-0">
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
      </nav>
    </div>
  );
};

export default Navbar;
