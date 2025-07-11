import React, { useEffect, useState } from "react";
import Avatar from "../../Avatar";
import { FaRegBell, FaRegBellSlash } from "react-icons/fa";
import { IoMdExit } from "react-icons/io";
import { BiWallet } from "react-icons/bi";
import Monetary from "../../Monetary";
import { useNavigate } from "react-router-dom";
import Notifications from './Notifications';

interface RightContentProps {
  openNotifications: boolean;
  setOpenNotifications: React.Dispatch<React.SetStateAction<boolean>>;
  user?: any; // TODO: заменить на правильный тип
}

const RightContent: React.FC<RightContentProps> = ({
  openNotifications,
  setOpenNotifications,
  user
}) => {
  const navigate = useNavigate();
  const [notificationCount, setNotificationCount] = useState(0);

  const handleLogout = () => {
    // TODO: Implement logout logic
    console.log('Logout');
    navigate('/login');
  };

  const handleProfileClick = () => {
    navigate('/profile');
  };

  const toggleNotifications = () => {
    setOpenNotifications(!openNotifications);
  };

  if (!user) {
    // Если пользователь не авторизован, показываем кнопки входа
    return (
      <div className="flex items-center space-x-2">
        <button
          onClick={() => navigate('/login')}
          className="bg-transparent border border-blue-500 text-blue-500 hover:bg-blue-500 hover:text-white px-4 py-2 rounded-lg transition-colors text-sm"
        >
          Войти
        </button>
        <button
          onClick={() => navigate('/register')}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors text-sm"
        >
          Регистрация
        </button>
      </div>
    );
  }

  return (
    <div className="flex items-center space-x-4 relative">
      {/* Баланс */}
      <div className="flex items-center space-x-2 text-green-400">
        <BiWallet className="text-lg" />
        <Monetary value={user?.walletBalance ?? 0} />
      </div>

      {/* Уведомления */}
      <div className="relative">
        <button
          onClick={toggleNotifications}
          className="relative p-2 text-gray-400 hover:text-white transition-colors"
        >
          {notificationCount > 0 ? (
            <FaRegBell className="text-xl" />
          ) : (
            <FaRegBellSlash className="text-xl" />
          )}
          {notificationCount > 0 && (
            <span className="notification-badge">
              {notificationCount > 99 ? '99+' : notificationCount}
            </span>
          )}
        </button>

        {openNotifications && (
          <Notifications
            openNotifications={openNotifications}
            setOpenNotifications={setOpenNotifications}
          />
        )}
      </div>

      {/* Аватар и профиль */}
      <div
        className="flex items-center space-x-2 cursor-pointer hover:opacity-80 transition-opacity"
        onClick={handleProfileClick}
      >
        <Avatar
          src={user.profilePicture}
          alt={user.username}
          size="sm"
        />
        <span className="text-white text-sm hidden md:block">{user.username}</span>
      </div>

      {/* Кнопка выхода */}
      <button
        onClick={handleLogout}
        className="p-2 text-gray-400 hover:text-red-400 transition-colors"
        title="Выйти"
      >
        <IoMdExit className="text-xl" />
      </button>
    </div>
  );
};

export default RightContent;
