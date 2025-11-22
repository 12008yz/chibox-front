import React, { useState, useEffect } from "react";
import { useTranslation } from 'react-i18next';
import Avatar from "../../Avatar";
import { FaRegBell, FaBell, FaCoins, FaPlus } from "react-icons/fa";
import { RiVipCrownFill } from "react-icons/ri";
// import { MdLocalFireDepartment } from "react-icons/md";
import Monetary from "../../Monetary";
import { useNavigate } from "react-router-dom";
import { useGetUnreadNotificationsCountQuery } from "../../../features/user/userApi";
import Notifications from './Notifications';
import DepositModal from '../../DepositModal';
import LanguageSwitcher from '../../LanguageSwitcher';
import SafeCrackerButton from '../SafeCrackerButton';

interface RightContentProps {
  openNotifications: boolean;
  setOpenNotifications: React.Dispatch<React.SetStateAction<boolean>>;
  user?: any; // TODO: заменить на правильный тип
  authModalOpen?: boolean;
  setAuthModalOpen?: React.Dispatch<React.SetStateAction<boolean>>;
  authModalTab?: 'login' | 'register';
  setAuthModalTab?: React.Dispatch<React.SetStateAction<'login' | 'register'>>;
  isMobileMenu?: boolean;
}

const RightContent: React.FC<RightContentProps> = ({
  openNotifications,
  setOpenNotifications,
  user,
  authModalOpen,
  setAuthModalOpen,
  authModalTab,
  setAuthModalTab,
  isMobileMenu = false
}) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [isDepositModalOpen, setIsDepositModalOpen] = useState(false);

  // Получаем количество непрочитанных уведомлений
  const { data: unreadCountData, refetch: refetchUnreadCount } = useGetUnreadNotificationsCountQuery(undefined, {
    skip: !user,
    pollingInterval: 5000, // Проверяем каждые 5 секунд
    refetchOnMountOrArgChange: true,
    refetchOnFocus: true,
  });

  const notificationCount = unreadCountData?.data?.count || 0;

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
      <div className="flex items-center space-x-3">
        <button
          onClick={() => {
            setAuthModalTab?.('login');
            setAuthModalOpen?.(true);
          }}
          className="gaming-button gaming-button-secondary"
        >
          {t('header.login')}
        </button>
        <button
          onClick={() => {
            setAuthModalTab?.('register');
            setAuthModalOpen?.(true);
          }}
          className="gaming-button gaming-button-primary"
        >
          {t('header.register')}
        </button>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-1 md:gap-2 xl:gap-3 2xl:gap-4 relative overflow-visible">
      {/* Бонус Safe Cracker - скрываем на средних экранах */}
      <div className="hidden 2xl:block">
        <SafeCrackerButton />
      </div>

      {/* Баланс */}
      <div id="onboarding-balance" className="gaming-balance-container">
        <div className="flex items-center space-x-1 lg:space-x-2">
          <div className="flex flex-col">
            <div className="gaming-balance-value text-[10px] sm:text-xs lg:text-sm xl:text-base">
              <Monetary value={user?.balance ?? 0} />
            </div>
            <div className="gaming-balance-label text-xs hidden xl:block">{t('header.balance')}</div>
          </div>
          <button
            id="onboarding-deposit-button"
            onClick={() => {
              setIsDepositModalOpen(true);
            }}
            className="gaming-balance-add-button group"
            title={t('header.top_up_balance')}
          >
            <FaPlus className="text-[8px] sm:text-xs lg:text-sm group-hover:scale-110 transition-transform duration-200" />
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
              <FaBell className="gaming-notification-icon gaming-notification-active text-sm lg:text-base xl:text-lg" />
            ) : (
              <FaRegBell className="gaming-notification-icon text-sm lg:text-base xl:text-lg" />
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
      <div className={isMobileMenu ? "block" : "hidden md:block"}>
        <LanguageSwitcher />
      </div>

      {/* Профиль пользователя */}
      <div
        className="gaming-profile-container cursor-pointer flex-shrink-0"
        onClick={handleProfileClick}
      >
        <div className="flex items-center gap-1 md:gap-2 xl:gap-3">
          <div className="gaming-avatar-wrapper">
            <Avatar
              image={user.avatar_url}
              steamAvatar={user.steam_avatar_url}
              id={user.id || user.username}
              size="small"
            />
          </div>
          <div className="hidden xl:flex flex-col min-w-[80px]">
            <span className="gaming-username truncate max-w-[120px]">{user.username}</span>
            <div className="flex items-center space-x-1">
              <RiVipCrownFill className="text-yellow-400 text-xs flex-shrink-0" />
              <span className="gaming-level whitespace-nowrap">LVL {user.level || 1}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Deposit Modal */}
      <DepositModal
        isOpen={isDepositModalOpen}
        onClose={() => setIsDepositModalOpen(false)}
      />
    </div>
  );
};

export default RightContent;
