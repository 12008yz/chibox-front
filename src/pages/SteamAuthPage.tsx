import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useLazyGetCurrentUserQuery } from '../features/auth/authApi';
import { useAppDispatch } from '../store/hooks';
import { loginSuccess, logout } from '../features/auth/authSlice';
import { baseApi } from '../store/api/baseApi';
import { setShowIntroVideo, setShowTradeUrlModal } from '../store/slices/uiSlice';

const SteamAuthPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const [error, setError] = useState<string | null>(null);
  const [getCurrentUser] = useLazyGetCurrentUserQuery();

  // Очищаем старое состояние при монтировании компонента
  useEffect(() => {

    // Полная очистка
    const keysToKeep = ['theme', 'language', 'cookieConsent'];
    const allKeys = Object.keys(localStorage);
    allKeys.forEach(key => {
      if (!keysToKeep.includes(key)) {
        localStorage.removeItem(key);
      }
    });
    sessionStorage.clear();

    dispatch(baseApi.util.resetApiState());
    dispatch(logout());
  }, []); // Выполняется только при монтировании

  useEffect(() => {
    // Обрабатываем Steam auth callback
    const provider = searchParams.get('provider');


    if (provider === 'steam') {
      // БЕЗОПАСНОСТЬ: Токен теперь в httpOnly cookie, не в URL
      // Загружаем данные пользователя напрямую через API

      getCurrentUser()
        .unwrap()
        .then((data) => {

          if (data?.success && data.user) {
            // Обновляем состояние авторизации
            dispatch(loginSuccess({
              user: data.user,
              // token в httpOnly cookie, не передаем в Redux
            }));

            // Устанавливаем флаги для показа видео и модалки
            dispatch(setShowIntroVideo(true));

            // Проверяем, есть ли steam_trade_url
            if (!data.user.steam_trade_url) {
              dispatch(setShowTradeUrlModal(true));
            }

            // Перенаправляем на главную
            navigate('/', { replace: true });
          } else {
            throw new Error('Не удалось загрузить данные пользователя');
          }
        })
        .catch(() => {
          setError('Ошибка загрузки данных пользователя');
          setTimeout(() => {
            navigate('/?error=steam_auth_failed', { replace: true });
          }, 3000);
        });
    } else {
      // Если нет провайдера, перенаправляем на страницу входа
      setError('Отсутствуют данные авторизации');
      setTimeout(() => {
        navigate('/?error=missing_provider', { replace: true });
      }, 3000);
    }
  }, [searchParams, navigate, getCurrentUser, dispatch]);

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#151225]">
        <div className="text-center max-w-md">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <h2 className="text-white text-xl font-semibold mb-2">
            Ошибка авторизации
          </h2>
          <p className="text-red-400 mb-4">
            {error}
          </p>
          <p className="text-gray-400">
            Перенаправление на страницу входа...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#151225]">
      <div className="text-center">
        <div className="inline-block w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-4"></div>
        <h2 className="text-white text-xl font-semibold mb-2">
          Завершение авторизации Steam...
        </h2>
        <p className="text-gray-400">
          Пожалуйста, подождите
        </p>
      </div>
    </div>
  );
};

export default SteamAuthPage;
