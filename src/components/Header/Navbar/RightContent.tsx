import React, { useState, useEffect } from "react";
import { useTranslation } from 'react-i18next';
import Avatar from "../../Avatar";
import { FaRegBell, FaBell, FaCoins, FaSignOutAlt, FaPlus } from "react-icons/fa";
import { RiVipCrownFill } from "react-icons/ri";
// import { MdLocalFireDepartment } from "react-icons/md";
import Monetary from "../../Monetary";
import { useNavigate } from "react-router-dom";
import { useAppDispatch } from "../../../store/hooks";
import { useLogoutMutation } from "../../../features/auth/authApi";
import { performFullLogout } from "../../../utils/authUtils";
import { useGetUnreadNotificationsCountQuery } from "../../../features/user/userApi";
import Notifications from './Notifications';
import DepositModal from '../../DepositModal';
import LanguageSwitcher from '../../LanguageSwitcher';
import SafeCrackerButton from '../SafeCrackerButton';
import AuthModal from '../../AuthModal';

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
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalTab, setAuthModalTab] = useState<'login' | 'register'>('login');

  // Получаем количество непрочитанных уведомлений
  const { data: unreadCountData, refetch: refetchUnreadCount } = useGetUnreadNotificationsCountQuery(undefined, {
    skip: !user,
    pollingInterval: 5000, // Проверяем каждые 5 секунд
    refetchOnMountOrArgChange: true,
    refetchOnFocus: true,
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

  // Обновляем счетчик непрочитанных при закрытии панели уведомлений
  useEffect(() => {
    if (!openNotifications && user) {
      // Обновляем счетчик после закрытия панели с небольшой задержкой
      const timer = setTimeout(() => {
        refetchUnreadCount();
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [openNotifications, user, refetchUnreadCount]);

  if (!user) {
    return (
      <>
        <div className="flex items-center space-x-3">
          <button
            onClick={() => {
              setAuthModalTab('login');
              setIsAuthModalOpen(true);
            }}
            className="gaming-button gaming-button-secondary"
          >
            {t('header.login')}
          </button>
          <button
            onClick={() => {
              setAuthModalTab('register');
              setIsAuthModalOpen(true);
            }}
            className="gaming-button gaming-button-primary"
          >
            {t('header.register')}
          </button>
        </div>

        <AuthModal
          isOpen={isAuthModalOpen}
          onClose={() => setIsAuthModalOpen(false)}
          defaultTab={authModalTab}
        />
      </>
    );
  }

  return (
    <div className="flex items-center space-x-4 relative overflow-visible">
      {/* Бонус Safe Cracker */}
      <SafeCrackerButton />

      {/* Баланс */}
      <div id="onboarding-balance" className="gaming-balance-container">
        <div className="flex items-center space-x-2">
          <FaCoins className="text-yellow-400 text-xl animate-pulse mr-3" />
          <div className="flex flex-col">
            <div className="gaming-balance-value">
              <Monetary value={user?.balance ?? 0} />
            </div>
            <div className="gaming-balance-label">{t('header.balance')}</div>
          </div>
          <button
            id="onboarding-deposit-button"
            onClick={() => {
              setIsDepositModalOpen(true);
            }}
            className="gaming-balance-add-button group"
            title={t('header.top_up_balance')}
          >
            <FaPlus className="text-sm group-hover:scale-110 transition-transform duration-200" />
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
            {notificationCount > 0 ? (
              <FaBell className="gaming-notification-icon gaming-notification-active" />
            ) : (
              <FaRegBell className="gaming-notification-icon" />
            )}
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
              steamAvatar={user.steam_avatar_url}
              id={user.id || user.username}
              size="small"
            />
            <div className="gaming-avatar-border"></div>
          </div>
          <div className="hidden md:flex flex-col">
            <span className="gaming-username">{user.username}</span>
            <div className="flex items-center space-x-1">
              <RiVipCrownFill className="text-yellow-400 text-xs" />
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
        <FaSignOutAlt className="text-lg" />
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
