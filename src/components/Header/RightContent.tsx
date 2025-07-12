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
import BonusSquaresGame from '../BonusSquaresGame';
import { useGetBonusStatusQuery } from "../../features/user/userApi";

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
  const [showBonusGame, setShowBonusGame] = useState(false);

  const { data: bonusStatus } = useGetBonusStatusQuery(undefined, {
    pollingInterval: 30000,
  });

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

  const handleBonusClick = () => {
    setShowBonusGame(true);
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

  const isAvailable = bonusStatus?.data?.is_available;
  const timeUntilNext = bonusStatus?.data?.time_until_next_seconds;

  const formatTimeLeft = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `${hours}:${minutes.toString().padStart(2, '0')}`;
  };

  return (
    <div className="flex items-center space-x-4 relative">
      {/* Получение бонуса */}
      <button
        onClick={handleBonusClick}
        disabled={!bonusStatus}
        className={`
          relative px-3 py-2 rounded-lg text-sm font-medium transition-all duration-300 flex items-center gap-2
          ${isAvailable
            ? 'bg-gradient-to-r from-yellow-600 to-orange-600 hover:from-yellow-500 hover:to-orange-500 text-white transform hover:scale-105 shadow-lg animate-pulse'
            : 'bg-gray-700 text-gray-400 cursor-not-allowed'
          }
        `}
        title={isAvailable ? "Играть в кубики удачи!" : timeUntilNext ? `Следующий бонус через ${formatTimeLeft(timeUntilNext)}` : "Загрузка..."}
      >
        <span className="text-lg">🎲</span>
        <span className="hidden sm:inline">
          {isAvailable ? 'Играть' : timeUntilNext ? formatTimeLeft(timeUntilNext) : '...'}
        </span>

        {/* Эффект свечения для доступного бонуса */}
        {isAvailable && (
          <div className="absolute inset-0 bg-gradient-to-r from-yellow-400 to-orange-400 rounded-lg blur-md opacity-30 animate-pulse" />
        )}
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

      {/* Модальное окно бонусной игры */}
      <BonusSquaresGame
        isOpen={showBonusGame}
        onClose={() => setShowBonusGame(false)}
      />
    </div>
  );
};

export default RightContent;
