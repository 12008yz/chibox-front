import { Link } from "react-router-dom";
import React from "react";
import { MdOutlineSell } from "react-icons/md";
import { BsCoin } from "react-icons/bs";
import { SlPlane } from "react-icons/sl";
import { GiUpgrade } from 'react-icons/gi';
import { TbCat } from "react-icons/tb";
import { FaBars } from 'react-icons/fa';
import { HiSparkles } from 'react-icons/hi';
import RightContent from "./Navbar/RightContent";

interface NavbarProps {
  openNotifications: boolean;
  setOpenNotifications: React.Dispatch<React.SetStateAction<boolean>>;
  openSidebar: boolean;
  setOpenSidebar: (open: boolean) => void;
  user?: any;
}

const Navbar: React.FC<NavbarProps> = ({
  openNotifications,
  setOpenNotifications,
  openSidebar,
  setOpenSidebar,
  user
}) => {
  const toggleSidebar = () => {
    setOpenSidebar(!openSidebar);
  };

  const links = [
    {
      to: "/marketplace",
      icon: <MdOutlineSell className="text-xl" />,
      label: "Market",
      color: "from-pink-500 to-violet-500"
    },
    {
      to: "/coinflip",
      icon: <BsCoin className="text-xl" />,
      label: "Coin Flip",
      color: "from-yellow-400 to-orange-500"
    },
    {
      to: "/crash",
      icon: <SlPlane className="text-xl" />,
      label: "Crash",
      color: "from-red-500 to-pink-500"
    },
    {
      to: "/upgrade",
      icon: <GiUpgrade className="text-xl" />,
      label: "Upgrade",
      color: "from-cyan-400 to-blue-500"
    },
    {
      to: "/slot",
      icon: <TbCat className="text-xl" />,
      label: "Slots",
      color: "from-green-400 to-emerald-500"
    }
  ];

  return (
    <div className="w-full flex justify-center relative z-[999999]">
      <nav className="modern-navbar group">
        {/* Animated Border */}
        <div className="navbar-border"></div>

        <div className="relative flex items-center justify-between w-full min-h-[64px] px-8 py-4">
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
          <div className="hidden md:flex items-center">
            {/* Logo */}
            <Link to="/" className="gaming-logo group mr-8">
              <div className="logo-container">
                <img
                  src="/vite.svg"
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
          <div className="md:hidden flex items-center">
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
            />
          </div>
        </div>
      </nav>
    </div>
  );
};

export default Navbar;
