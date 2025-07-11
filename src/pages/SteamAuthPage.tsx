import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuthHandlers } from '../hooks/useAuthHandlers';

const SteamAuthPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { handleLoginSuccess } = useAuthHandlers();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const token = searchParams.get('token');
    const provider = searchParams.get('provider');

    if (token && provider === 'steam') {
      try {
        // Декодируем токен, чтобы получить информацию о пользователе
        const tokenParts = token.split('.');
        if (tokenParts.length === 3) {
          const payload = JSON.parse(atob(tokenParts[1]));

          // Создаем объект пользователя из токена
          const userData = {
            user: {
              id: payload.id,
              username: payload.username,
              auth_provider: payload.auth_provider,
              // Остальные поля будут загружены через API
            },
            token
          };

          // Обновляем состояние авторизации
          handleLoginSuccess(userData);

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
      setError('Отсутствуют данные авторизации');
      setTimeout(() => {
        navigate('/login?error=missing_token', { replace: true });
      }, 3000);
    }
  }, [searchParams, navigate, handleLoginSuccess]);

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
