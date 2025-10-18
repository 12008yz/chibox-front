import React, { useState } from "react";
import Avatar from "../Avatar";
import { FaRegBell } from "react-icons/fa";
import { IoMdExit } from "react-icons/io";
import { BiWallet } from "react-icons/bi";
import { HiGift } from "react-icons/hi";
import Monetary from "../Monetary";
import { useNavigate } from "react-router-dom";
import { useAppDispatch } from "../../store/hooks";
import { useLogoutMutation } from "../../features/auth/authApi";
import { performFullLogout } from "../../utils/authUtils";
import { useGetUnreadNotificationsCountQuery, useGetBonusStatusQuery } from "../../features/user/userApi";
import Notifications from '../Header/Navbar/Notifications';

interface RightContentProps {
  openNotifications: boolean;
  setOpenNotifications: React.Dispatch<React.SetStateAction<boolean>>;
  user?: any;
}

const RightContent: React.FC<RightContentProps> = ({
  openNotifications,
  setOpenNotifications,
  user
}) => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const [logoutApi, { isLoading: isLoggingOut }] = useLogoutMutation();
  const [showBonusGame, setShowBonusGame] = useState(false);

  // Получаем количество непрочитанных уведомлений
  const { data: unreadCountData } = useGetUnreadNotificationsCountQuery(undefined, {
    skip: !user,
    pollingInterval: 30000,
  });

  // Получаем статус бонуса
  const { data: bonusStatus } = useGetBonusStatusQuery(undefined, {
    skip: !user,
    pollingInterval: 30000,
  });

  const notificationCount = unreadCountData?.data?.count || 0;

  const handleLogout = async () => {
    try {
      await logoutApi().unwrap();
    } catch (error) {
      console.log('Logout API error (continuing with logout):', error);
    } finally {
      performFullLogout(dispatch);
      navigate('/');
    }
  };

  const handleProfileClick = () => {
    navigate('/profile');
  };

  const toggleNotifications = () => {
    setOpenNotifications(!openNotifications);
  };

  if (!user) {
    // Кнопки для неавторизованных пользователей
    return (
      <div className="flex items-center space-x-3">
        <button
          onClick={() => navigate('/login')}
          className="gaming-btn gaming-btn-outline group"
        >
          <span className="btn-text">Войти</span>
          <div className="btn-glow bg-gradient-to-r from-cyan-400 to-blue-500"></div>
        </button>
        <button
          onClick={() => navigate('/register')}
          className="gaming-btn gaming-btn-primary group"
        >
          <span className="btn-text">Регистрация</span>
          <div className="btn-glow bg-gradient-to-r from-purple-500 to-pink-500"></div>
        </button>
      </div>
    );
  }

  return (
    <div className="flex items-center space-x-4 relative">
      {/* Bonus Button */}
      <button
        className="gaming-btn gaming-btn-bonus group"
        onClick={() => setShowBonusGame(!showBonusGame)}
      >
        <HiGift className="text-lg mr-2" />
        <span className="btn-text">Бонус</span>
        <div className="btn-glow bg-gradient-to-r from-green-400 to-emerald-500"></div>
        <div className="bonus-sparkle"></div>
      </button>


      {/* Balance Display */}
      <div className="balance-display group">
        <div className="balance-content">
          <BiWallet className="text-lg text-cyan-400" />
          <Monetary value={user?.balance ?? 0} />
        </div>
        <div className="balance-glow"></div>
      </div>

      {/* Notifications */}
      <div className="relative" style={{ zIndex: 999999 }}>
        <button
          onClick={toggleNotifications}
          className="gaming-btn gaming-btn-icon group"
        >
          <FaRegBell className="text-lg" />
          {notificationCount > 0 && (
            <span className="notification-badge gaming-badge">
              {notificationCount > 99 ? '99+' : notificationCount}
            </span>
          )}
          <div className="btn-glow bg-gradient-to-r from-yellow-400 to-orange-500"></div>
        </button>

        {openNotifications && (
          <Notifications
            openNotifications={openNotifications}
            setOpenNotifications={setOpenNotifications}
          />
        )}
      </div>

      {/* User Profile */}
      <div
        className="user-profile group cursor-pointer"
        onClick={handleProfileClick}
      >
        <div className="profile-content">
          <Avatar
            image={user.profilePicture}
            steamAvatar={user.steam_avatar_url || user.steam_avatar}
            id={user.id || user.username}
            size="small"
          />
          <span className="username gaming-font hidden md:block">{user.username}</span>
        </div>
        <div className="profile-glow"></div>
      </div>

      {/* Logout Button */}
      <button
        onClick={handleLogout}
        disabled={isLoggingOut}
        className={`gaming-btn gaming-btn-icon gaming-btn-danger group ${isLoggingOut ? 'opacity-50 cursor-not-allowed' : ''}`}
        title="Выйти"
      >
        <IoMdExit className="text-lg" />
        <div className="btn-glow bg-gradient-to-r from-red-500 to-pink-500"></div>
      </button>
    </div>
  );
};

export default RightContent;
