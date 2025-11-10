import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuthHandlers } from '../hooks/useAuthHandlers';
import { useAppDispatch } from '../store/hooks';
import { logout } from '../features/auth/authSlice';
import { baseApi } from '../store/api/baseApi';

const SteamAuthPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { handleLoginSuccess } = useAuthHandlers();
  const [error, setError] = useState<string | null>(null);

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
    // Обрабатываем Steam auth callback сразу после очистки состояния
    console.log('SteamAuthPage: Processing Steam auth callback');
    const token = searchParams.get('token');
    const provider = searchParams.get('provider');

    console.log('SteamAuthPage: Token present:', !!token);
    console.log('SteamAuthPage: Provider:', provider);

    if (token && provider === 'steam') {
      try {
        // Проверяем что токен валидный (базовая проверка формата)
        const tokenParts = token.split('.');
        if (tokenParts.length === 3) {
          console.log('SteamAuthPage: Valid JWT token format, processing...');

          // Сохраняем только токен, данные пользователя загрузятся через getCurrentUser API
          const userData = {
            user: null, // Не извлекаем данные из токена, пусть API их загрузит
            token
          };

          console.log('SteamAuthPage: Calling handleLoginSuccess with token');
          // Обновляем состояние авторизации
          handleLoginSuccess(userData);

          console.log('SteamAuthPage: Redirecting to home page...');
          // Перенаправляем на главную страницу
          navigate('/', { replace: true });
        } else {
          throw new Error('Неверный формат токена');
        }
      } catch (error) {
        console.error('Ошибка обработки Steam токена:', error);
        setError('Ошибка обработки данных авторизации');
        setTimeout(() => {
          navigate('/login?error=steam_auth_failed', { replace: true });
        }, 3000);
      }
    } else {
      // Если нет токена или провайдера, перенаправляем на страницу входа
      console.error('SteamAuthPage: Missing token or provider');
      setError('Отсутствуют данные авторизации');
      setTimeout(() => {
        navigate('/login?error=missing_token', { replace: true });
      }, 3000);
    }
  }, [searchParams, navigate, handleLoginSuccess, dispatch]);

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
