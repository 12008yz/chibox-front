import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useLazyGetCurrentUserQuery, useUpdateProfileMutation } from '../features/auth/authApi';
import { useAppDispatch } from '../store/hooks';
import { loginSuccess, logout } from '../features/auth/authSlice';
import { baseApi } from '../store/api/baseApi';
import SteamTradeUrlModal from '../components/SteamTradeUrlModal';

const SteamAuthPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const [error, setError] = useState<string | null>(null);
  const [showTradeUrlModal, setShowTradeUrlModal] = useState(false);
  const [getCurrentUser] = useLazyGetCurrentUserQuery();
  const [updateProfile] = useUpdateProfileMutation();

  // Очищаем старое состояние при монтировании компонента
  useEffect(() => {
    console.log('SteamAuthPage mounted: Clearing old auth state...');

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
    console.log('SteamAuthPage: Processing Steam auth callback');
    const provider = searchParams.get('provider');

    console.log('SteamAuthPage: Provider:', provider);

    if (provider === 'steam') {
      // БЕЗОПАСНОСТЬ: Токен теперь в httpOnly cookie, не в URL
      // Загружаем данные пользователя напрямую через API
      console.log('SteamAuthPage: Fetching user data (token in httpOnly cookie)...');

      getCurrentUser()
        .unwrap()
        .then((data) => {
          console.log('SteamAuthPage: User data loaded:', data);

          if (data?.success && data.user) {
            // Обновляем состояние авторизации
            dispatch(loginSuccess({
              user: data.user,
              // token в httpOnly cookie, не передаем в Redux
            }));

            // Проверяем, есть ли steam_trade_url
            if (!data.user.steam_trade_url) {
              console.log('SteamAuthPage: Steam Trade URL not set, showing modal...');
              setShowTradeUrlModal(true);
            } else {
              console.log('SteamAuthPage: Steam Trade URL already set, redirecting...');
              navigate('/', { replace: true });
            }
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
      console.error('SteamAuthPage: Missing provider');
      setError('Отсутствуют данные авторизации');
      setTimeout(() => {
        navigate('/?error=missing_provider', { replace: true });
      }, 3000);
    }
  }, [searchParams, navigate, getCurrentUser, dispatch]);

  const handleTradeUrlSubmit = async (tradeUrl: string) => {
    try {
      console.log('SteamAuthPage: Saving Steam Trade URL...');
      await updateProfile({ steam_trade_url: tradeUrl }).unwrap();

      console.log('SteamAuthPage: Steam Trade URL saved successfully');
      setShowTradeUrlModal(false);
      navigate('/', { replace: true });
    } catch (err) {
      console.error('Ошибка сохранения Steam Trade URL:', err);
      // Ошибка будет показана в модальном окне
    }
  };

  const handleTradeUrlSkip = () => {
    console.log('SteamAuthPage: User skipped Steam Trade URL setup');
    setShowTradeUrlModal(false);
    navigate('/', { replace: true });
  };

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
    <>
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

      {/* Steam Trade URL Modal */}
      <SteamTradeUrlModal
        isOpen={showTradeUrlModal}
        onClose={handleTradeUrlSkip}
        onSubmit={handleTradeUrlSubmit}
        canSkip={true}
      />
    </>
  );
};

export default SteamAuthPage;
