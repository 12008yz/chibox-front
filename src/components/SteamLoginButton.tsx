import React from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch } from '../store/hooks';
import { logout } from '../features/auth/authSlice';
import { baseApi } from '../store/api/baseApi';
import { toastWithSound } from '../utils/toastWithSound';

interface SteamLoginButtonProps {
  isLoading?: boolean;
  disabled?: boolean;
}

const SteamLoginButton: React.FC<SteamLoginButtonProps> = ({
  isLoading = false,
  disabled = false
}) => {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const handleSteamLogin = () => {
    if (disabled || isLoading) return;

    // Показываем предупреждение о загрузке
    toastWithSound.warning('⏱️ Загрузка страницы может занять около 2 минут. Пожалуйста, подождите...', {
      duration: 5000,
      style: {
        background: '#1a1829',
        color: '#fff',
        border: '1px solid rgba(251, 191, 36, 0.3)',
      },
    });

    // Очищаем старое состояние ПЕРЕД редиректом на Steam
    console.log('Clearing state before Steam login...');

    // Сначала очищаем localStorage вручную
    const keysToKeep = ['theme', 'language', 'cookieConsent'];
    const allKeys = Object.keys(localStorage);
    allKeys.forEach(key => {
      if (!keysToKeep.includes(key)) {
        localStorage.removeItem(key);
      }
    });
    sessionStorage.clear();

    // Потом очищаем Redux
    dispatch(baseApi.util.resetApiState());
    dispatch(logout());

    // Переходим на промежуточную страницу загрузки
    console.log('Navigating to Steam loading page...');
    navigate('/steam-loading');
  };

  return (
    <button
      onClick={handleSteamLogin}
      disabled={disabled || isLoading}
      className="w-full flex items-center justify-center gap-3 px-4 py-3 bg-[#171a21] hover:bg-[#2a2d35] disabled:bg-gray-600 disabled:cursor-not-allowed border border-gray-600 rounded-md transition-colors text-white font-medium"
    >
      {isLoading ? (
        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
      ) : (
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="currentColor"
          className="text-white"
        >
          <path d="M12 0a12 12 0 0 0-8.2 20.8l4.4-1.8a3.4 3.4 0 0 0 6.4-1.8 3.4 3.4 0 0 0-3.3-3.4h-.2l-4.5-6.6a4.5 4.5 0 0 1 8.8 1.2v.3l6.6 4.5a3.4 3.4 0 0 0 1.8-6.4A12 12 0 0 0 12 0zm-4.6 16.6l-3.6 1.5a2.6 2.6 0 0 0 4.8.9l-1.2-2.4zm7.9-5.4a2.3 2.3 0 1 1-4.6 0 2.3 2.3 0 0 1 4.6 0z"/>
        </svg>
      )}

      <span>
        {isLoading ? t('auth.connecting_steam') : t('auth.steam_login_button')}
      </span>
    </button>
  );
};

export default SteamLoginButton;
