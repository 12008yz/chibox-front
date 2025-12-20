import React, { useState } from "react";
import { useTranslation } from 'react-i18next';
import Avatar from "../Avatar";
import { Bell, LogOut, Plus, Crown } from "lucide-react";
// import { MdLocalFireDepartment } from "react-icons/md";
import Monetary from "../Monetary";
import { useNavigate } from "react-router-dom";
import { useAppDispatch } from "../../store/hooks";
import { useLogoutMutation } from "../../features/auth/authApi";
import { performFullLogout } from "../../utils/authUtils";
import { useGetUnreadNotificationsCountQuery } from "../../features/user/userApi";
import Notifications from './Navbar/Notifications';
import DepositModal from '../DepositModal';
import LanguageSwitcher from '../LanguageSwitcher';

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
  const { t } = useTranslation();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const [logoutApi, { isLoading: isLoggingOut }] = useLogoutMutation();
  const [isDepositModalOpen, setIsDepositModalOpen] = useState(false);

  // Получаем количество непрочитанных уведомлений
  // Polling отключен, т.к. обновления приходят через WebSocket в реальном времени
  const { data: unreadCountData } = useGetUnreadNotificationsCountQuery(undefined, {
    skip: !user,
  });

  const notificationCount = unreadCountData?.data?.count || 0;

  const handleLogout = async () => {
    try {
      await logoutApi().unwrap();
    } catch {
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
    return (
      <div className="flex items-center space-x-3">
        <button
          onClick={() => navigate('/login')}
          className="gaming-button gaming-button-secondary"
        >
          {t('header.login')}
        </button>
        <button
          onClick={() => navigate('/register')}
          className="gaming-button gaming-button-primary"
        >
          {t('header.register')}
        </button>
      </div>
    );
  }

  return (
    <div className="flex items-center space-x-4 relative overflow-visible">
      {/* Баланс */}
      <div className="gaming-balance-container">
        <div className="flex items-center space-x-2">
          <div className="flex flex-col">
            <div className="gaming-balance-value">
              <Monetary value={user?.balance ?? 0} />
            </div>
            <div className="gaming-balance-label">{t('header.balance')}</div>
          </div>
          <button
            onClick={() => {
              setIsDepositModalOpen(true);
            }}
            className="gaming-balance-add-button group"
            title={t('header.top_up_balance')}
          >
            <Plus className="w-3.5 h-3.5 group-hover:scale-110 transition-transform duration-200" />
          </button>
        </div>
      </div>

      {/* Уведомления */}
      <div className="relative">
        <button
          onClick={toggleNotifications}
          className="gaming-notification-button"
        >
          <div className="relative">
            <Bell className={`gaming-notification-icon ${notificationCount > 0 ? 'gaming-notification-active' : ''}`} />
            {notificationCount > 0 && (
              <div className="gaming-notification-badge">
                <div className="gaming-notification-pulse"></div>
                <span className={`gaming-notification-count ${notificationCount > 99 ? 'gaming-notification-count-large' : ''}`}>
                  {notificationCount > 99 ? '99+' : notificationCount}
                </span>
              </div>
            )}
          </div>
        </button>

        {openNotifications && (
          <Notifications
            openNotifications={openNotifications}
            setOpenNotifications={setOpenNotifications}
          />
        )}
      </div>

      {/* Переключатель языков */}
      <LanguageSwitcher />

      {/* Профиль пользователя */}
      <div
        className="gaming-profile-container"
        onClick={handleProfileClick}
      >
        <div className="flex items-center space-x-3">
          <div className="gaming-avatar-wrapper">
            <Avatar
              image={user.avatar_url}
              steamAvatar={user.steam_avatar_url || user.steam_avatar || user.steam_profile?.avatarfull}
              id={user.id || user.username}
              size="small"
            />
          </div>
          <div className="hidden md:flex flex-col">
            <span className="gaming-username">{user.username}</span>
            <div className="flex items-center space-x-1">
              <Crown className="text-yellow-400 w-3 h-3 fill-yellow-400" />
              <span className="gaming-level">LVL {user.level || 1}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Кнопка выхода */}
      <button
        onClick={handleLogout}
        disabled={isLoggingOut}
        className="gaming-logout-button"
        title={t('header.sign_out')}
      >
        <LogOut className="w-5 h-5" />
      </button>

      {/* Deposit Modal */}
      <DepositModal
        isOpen={isDepositModalOpen}
        onClose={() => setIsDepositModalOpen(false)}
      />
    </div>
  );
};

export default RightContent;
