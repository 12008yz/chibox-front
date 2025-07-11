import React, { useState } from "react";
import Avatar from "../Avatar";
import { FaRegBell, FaRegBellSlash } from "react-icons/fa";
import { IoMdExit } from "react-icons/io";
import { BiWallet } from "react-icons/bi";
import Monetary from "../Monetary";
import { useNavigate } from "react-router-dom";
import { useAppDispatch } from "../../store/hooks";
import { useLogoutMutation } from "../../features/auth/authApi";
import { performFullLogout } from "../../utils/authUtils";
import Notifications from '../Header/Navbar/Notifications';

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
  const dispatch = useAppDispatch();
  const [logoutApi, { isLoading: isLoggingOut }] = useLogoutMutation();
  const [notificationCount] = useState(0);

  const handleLogout = async () => {
    try {
      // Сначала вызываем API logout для уведомления сервера
      await logoutApi().unwrap();
    } catch (error) {
      // Даже если API недоступен, продолжаем logout
      console.log('Logout API error (continuing with logout):', error);
    } finally {
      // Выполняем полную очистку состояния приложения
      performFullLogout(dispatch);
      // Перенаправляем на главную страницу
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
    // Если пользователь не авторизован, показываем кнопки входа
    return (
      <div className="flex items-center space-x-3">
        <button
          onClick={() => navigate('/login')}
          className="bg-transparent border border-indigo-500 text-indigo-400 hover:bg-indigo-500 hover:text-white px-4 py-2 rounded-lg transition-colors text-sm font-medium"
        >
          Войти
        </button>
        <button
          onClick={() => navigate('/register')}
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg transition-colors text-sm font-medium"
        >
          Регистрация
        </button>
      </div>
    );
  }

  return (
    <div className="flex items-center space-x-4 relative">
      {/* Получение бонуса */}
      <button
        className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded text-xs font-medium transition-colors"
        onClick={() => console.log('Claiming bonus...')}
      >
        Получить
      </button>

      {/* Баланс */}
      <div className="flex items-center space-x-2 text-green-400">
        <BiWallet className="text-lg" />
        <Monetary value={user?.balance ?? 0} />
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
          image={user.profilePicture}
          steamAvatar={user.steam_avatar}
          id={user.id || user.username}
          size="small"
        />
        <span className="text-white text-sm hidden md:block">
          {user.steam_profile?.personaname || user.username}
        </span>
      </div>

      {/* Кнопка выхода */}
      <button
        onClick={handleLogout}
        disabled={isLoggingOut}
        className={`p-2 text-gray-400 hover:text-red-400 transition-colors ${isLoggingOut ? 'opacity-50 cursor-not-allowed' : ''}`}
        title="Выйти"
      >
        <IoMdExit className="text-xl" />
      </button>
    </div>
  );
};

export default RightContent;
