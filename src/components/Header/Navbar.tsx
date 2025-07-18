import { Link } from "react-router-dom";
import React from "react";
import { MdOutlineSell } from "react-icons/md";
import { BsCoin } from "react-icons/bs";
import { SlPlane } from "react-icons/sl";
import { GiUpgrade } from 'react-icons/gi';
import { TbCat } from "react-icons/tb";
import { FaBars } from 'react-icons/fa';
import RightContent from "./Navbar/RightContent";

interface NavbarProps {
  openNotifications: boolean;
  setOpenNotifications: React.Dispatch<React.SetStateAction<boolean>>;
  openSidebar: boolean;
  setOpenSidebar: (open: boolean) => void;
  user?: any; // TODO: заменить на правильный тип
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
      icon: <MdOutlineSell className="text-2xl" />,
      label: "Market"
    },
    {
      to: "/coinflip",
      icon: <BsCoin className="text-2xl" />,
      label: "Coin Flip"
    },
    {
      to: "/crash",
      icon: <SlPlane className="text-2xl" />,
      label: "Crash"
    },
    {
      to: "/upgrade",
      icon: <GiUpgrade className="text-2xl" />,
      label: "Upgrade"
    },
    {
      to: "/slot",
      icon: <TbCat className="text-2xl" />,
      label: "Slots"
    }
  ];

  return (
    <div className="w-full flex justify-center relative z-[999999]">
      <nav className="py-4 px-8 bg-[#19172D] w-[calc(100vw-2rem)] max-w-[1920px] flex justify-center rounded-lg border border-gray-700/50 relative z-[999999]">
        <div className="flex items-center justify-between w-full min-h-[48px]">

          {/* Мобильное меню кнопка */}
          <div className="md:hidden">
            <FaBars
              onClick={toggleSidebar}
              className="text-2xl cursor-pointer text-white hover:text-gray-300 transition-colors"
            />
          </div>

          {/* Логотип и навигация для десктопа */}
          <div className="hidden md:flex items-center">
            <Link to="/" className="flex items-center gap-2 mr-8">
              <img
                src="/public/vite.svg"
                alt="ChiBox Logo"
                className="w-12 h-12 object-contain"
                onError={(e) => {
                  e.currentTarget.src = '/vite.svg';
                }}
              />
              <div className="flex flex-col justify-center">
                <div className="font-normal text-xl text-white">ChiBox</div>
                <div className="text-xs text-gray-400">Casino</div>
              </div>
            </Link>

            {/* Навигационные ссылки */}
            <div className="flex items-center gap-6">
              {links.map((link, index) => (
                <Link
                  key={index}
                  to={link.to}
                  className="navbar-item flex items-center gap-2 font-normal text-xs 2xl:text-lg"
                >
                  {link.icon}
                  <span>{link.label}</span>
                </Link>
              ))}
            </div>
          </div>

          {/* Мобильный логотип */}
          <div className="md:hidden flex items-center">
            <Link to="/" className="flex items-center gap-2">
              <img
                src="/vite.svg"
                alt="ChiBox Logo"
                className="w-8 h-8 object-contain"
                onError={(e) => {
                  e.currentTarget.src = '/vite.svg';
                }}
              />
              <div className="font-normal text-lg text-white">ChiBox</div>
            </Link>
          </div>

          {/* Правая часть - аватар, уведомления, баланс */}
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
