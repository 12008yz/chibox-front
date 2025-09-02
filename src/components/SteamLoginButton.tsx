import React from 'react';
import { useTranslation } from 'react-i18next';

interface SteamLoginButtonProps {
  isLoading?: boolean;
  disabled?: boolean;
}

const SteamLoginButton: React.FC<SteamLoginButtonProps> = ({
  isLoading = false,
  disabled = false
}) => {
  const { t } = useTranslation();
  const handleSteamLogin = () => {
    if (disabled || isLoading) return;

    // Перенаправляем на серверный endpoint для Steam авторизации
    const serverUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';
    console.log('VITE_API_URL:', import.meta.env.VITE_API_URL);
    console.log('Final serverUrl:', serverUrl);
    console.log('Redirecting to:', `${serverUrl}/v1/auth/steam`);
    window.location.href = `${serverUrl}/v1/auth/steam`;
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
