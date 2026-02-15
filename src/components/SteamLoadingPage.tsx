import { useEffect } from 'react';
import { API_URL } from '../utils/config';

const SteamLoadingPage: React.FC = () => {
  useEffect(() => {
    const serverUrl = API_URL;
    const steamUrl = `${serverUrl}/v1/auth/steam`;

    // Минимальная задержка только для показа экрана
    const timer = setTimeout(() => {
      window.location.href = steamUrl;
    }, 100);

    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#1b2838] to-[#2a475e]">
      <div className="text-center max-w-md px-6">
        {/* Steam logo animation */}
        <div className="mb-8 flex justify-center">
          <div className="relative">
            <svg
              width="80"
              height="80"
              viewBox="0 0 24 24"
              fill="currentColor"
              className="text-white animate-pulse"
            >
              <path d="M12 0a12 12 0 0 0-8.2 20.8l4.4-1.8a3.4 3.4 0 0 0 6.4-1.8 3.4 3.4 0 0 0-3.3-3.4h-.2l-4.5-6.6a4.5 4.5 0 0 1 8.8 1.2v.3l6.6 4.5a3.4 3.4 0 0 0 1.8-6.4A12 12 0 0 0 12 0zm-4.6 16.6l-3.6 1.5a2.6 2.6 0 0 0 4.8.9l-1.2-2.4zm7.9-5.4a2.3 2.3 0 1 1-4.6 0 2.3 2.3 0 0 1 4.6 0z"/>
            </svg>

            {/* Spinning border */}
            <div className="absolute inset-0 border-4 border-t-white border-r-transparent border-b-transparent border-l-transparent rounded-full animate-spin"></div>
          </div>
        </div>

        {/* Loading text */}
        <h2 className="text-white text-2xl font-bold mb-3">
          Переход на Steam
        </h2>
        <p className="text-gray-300 mb-6">
          Перенаправление на страницу авторизации Steam...
        </p>

        {/* Progress dots */}
        <div className="flex justify-center gap-2">
          <div className="w-2 h-2 bg-white rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
          <div className="w-2 h-2 bg-white rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
          <div className="w-2 h-2 bg-white rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
        </div>

        {/* Warning text */}
        <div className="mt-8 p-4 bg-yellow-900/20 border border-yellow-700/30 rounded-lg">
          <p className="text-yellow-400 text-sm font-medium">
            ⚠️ Страница Steam может загружаться до 2 минут
          </p>
          <p className="text-gray-400 text-xs mt-1">
            Это нормально, пожалуйста подождите...
          </p>
        </div>
      </div>
    </div>
  );
};

export default SteamLoadingPage;
