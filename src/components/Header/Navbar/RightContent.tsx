import React, { useState } from "react";
import { useTranslation } from 'react-i18next';
import Avatar from "../../Avatar";
import { FaRegBell, FaBell, FaCoins, FaSignOutAlt, FaPlus } from "react-icons/fa";
import { RiVipCrownFill } from "react-icons/ri";
import { MdLocalFireDepartment } from "react-icons/md";
import Monetary from "../../Monetary";
import { useNavigate } from "react-router-dom";
import { useAppDispatch } from "../../../store/hooks";
import { useLogoutMutation } from "../../../features/auth/authApi";
import { performFullLogout } from "../../../utils/authUtils";
import { useGetUnreadNotificationsCountQuery, useGetBonusStatusQuery } from "../../../features/user/userApi";
import Notifications from './Notifications';
import RouletteGame from '../../RouletteGame';
import PurchaseModal from '../../PurchaseModal';
import DepositModal from '../../DepositModal';
import LanguageSwitcher from '../../LanguageSwitcher';

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
  const [showBonusGame, setShowBonusGame] = useState(false);
  const [isPurchaseModalOpen, setIsPurchaseModalOpen] = useState(false);
  const [purchaseModalTab, setPurchaseModalTab] = useState<'balance' | 'subscription'>('balance');
  const [isDepositModalOpen, setIsDepositModalOpen] = useState(false);

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
      {/* Бонус игра */}
      <div className="relative">
        <button
          className="gaming-bonus-button group"
          onClick={() => setShowBonusGame(!showBonusGame)}
          disabled={(bonusStatus?.time_until_next_seconds || 0) > 0}
        >
          <div className="flex items-center space-x-2">
            <MdLocalFireDepartment className="text-lg gaming-icon-fire" />
            <span className="font-bold text-sm">{t('header.bonus')}</span>
          </div>
          {bonusStatus && (bonusStatus.time_until_next_seconds || 0) > 0 && (
            <div className="absolute -top-1 -right-1 bg-red-500 text-white text-xs px-1 py-0.5 rounded-full">
              {Math.ceil((bonusStatus.time_until_next_seconds || 0) / 60)}м
            </div>
          )}
        </button>
        {showBonusGame && (
          <RouletteGame
            isOpen={showBonusGame}
            onClose={() => setShowBonusGame(false)}
          />
        )}
      </div>

      {/* Баланс */}
      <div className="gaming-balance-container">
        <div className="flex items-center space-x-2">
          <div className="gaming-coin-icon">
            <FaCoins className="text-lg" />
          </div>
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
              image={user.profilePicture}
              steamAvatar={user.steam_avatar}
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

      {/* Purchase Modal */}
      <PurchaseModal
        isOpen={isPurchaseModalOpen}
        onClose={() => setIsPurchaseModalOpen(false)}
        initialTab={purchaseModalTab}
      />

      {/* Deposit Modal */}
      <DepositModal
        isOpen={isDepositModalOpen}
        onClose={() => setIsDepositModalOpen(false)}
      />
    </div>
  );
};

export default RightContent;
