import React, { useState, useEffect } from "react";
import { useTranslation } from 'react-i18next';
import Avatar from "../../Avatar";
import { Bell, BellRing, Plus, Crown } from "lucide-react";
// import { MdLocalFireDepartment } from "react-icons/md";
import Monetary from "../../Monetary";
import { useNavigate } from "react-router-dom";
import { useGetUnreadNotificationsCountQuery } from "../../../features/user/userApi";
import Notifications from './Notifications';
import DepositModal from '../../DepositModal';
import LanguageSwitcher from '../../LanguageSwitcher';
import SafeCrackerButton from '../SafeCrackerButton';
import { useAppDispatch } from '../../../store/hooks';
import { setShowAuthModal } from '../../../store/slices/uiSlice';

interface RightContentProps {
  openNotifications: boolean;
  setOpenNotifications: React.Dispatch<React.SetStateAction<boolean>>;
  user?: any; // TODO: заменить на правильный тип
  isMobileMenu?: boolean;
}

const RightContent: React.FC<RightContentProps> = ({
  openNotifications,
  setOpenNotifications,
  user,
  isMobileMenu = false
}) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const [isDepositModalOpen, setIsDepositModalOpen] = useState(false);

  // Получаем количество непрочитанных уведомлений
  // Polling отключен, т.к. обновления приходят через WebSocket в реальном времени
  const { data: unreadCountData, refetch: refetchUnreadCount } = useGetUnreadNotificationsCountQuery(undefined, {
    skip: !user,
    refetchOnMountOrArgChange: true,
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
      <div className="flex items-center gap-2">
        <LanguageSwitcher />
        <button
          onClick={() => dispatch(setShowAuthModal(true))}
          className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-cyan-600 to-cyan-500 hover:from-cyan-700 hover:to-cyan-600 text-white font-semibold rounded-lg transition-all duration-200 shadow-lg shadow-cyan-500/20 hover:shadow-cyan-500/40"
        >
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="currentColor"
            className="text-white"
          >
            <path d="M12 0a12 12 0 0 0-8.2 20.8l4.4-1.8a3.4 3.4 0 0 0 6.4-1.8 3.4 3.4 0 0 0-3.3-3.4h-.2l-4.5-6.6a4.5 4.5 0 0 1 8.8 1.2v.3l6.6 4.5a3.4 3.4 0 0 0 1.8-6.4A12 12 0 0 0 12 0zm-4.6 16.6l-3.6 1.5a2.6 2.6 0 0 0 4.8.9l-1.2-2.4zm7.9-5.4a2.3 2.3 0 1 1-4.6 0 2.3 2.3 0 0 1 4.6 0z"/>
          </svg>
          <span className="hidden sm:inline">{t('header.login')}</span>
        </button>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-1 md:gap-2 xl:gap-1.5 2xl:gap-2 relative overflow-visible">
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
            <Plus className="text-[8px] sm:text-xs lg:text-sm group-hover:scale-110 transition-transform duration-200 w-3 h-3 lg:w-4 lg:h-4" />
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
              <BellRing className="gaming-notification-icon gaming-notification-active w-4 h-4 lg:w-5 lg:h-5 xl:w-6 xl:h-6" />
            ) : (
              <Bell className="gaming-notification-icon w-4 h-4 lg:w-5 lg:h-5 xl:w-6 xl:h-6" />
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

      {/* Бонус Safe Cracker - показываем на всех размерах экрана */}
      <div className="block">
        <SafeCrackerButton />
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
              steamAvatar={user.steam_avatar_url || user.steam_avatar || user.steam_profile?.avatarfull}
              id={user.id || user.username}
              size="small"
            />
          </div>
          <div className="hidden xl:flex flex-col min-w-[80px]">
            <span className="gaming-username truncate max-w-[120px]">{user.username}</span>
            <div className="flex items-center space-x-1">
              <Crown className="text-yellow-400 w-3 h-3 flex-shrink-0 fill-yellow-400" />
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
