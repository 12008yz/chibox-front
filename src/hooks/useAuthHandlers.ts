import { useAppDispatch } from '../store/hooks';
import { loginSuccess, logout } from '../features/auth/authSlice';
import { baseApi } from '../store/api/baseApi';

// Хук  для обработки результатов авторизации
export const useAuthHandlers = () => {
  const dispatch = useAppDispatch();

  // Функция для обработки успешного логина
  const handleLoginSuccess = (data: { user: any | null; token?: string }) => {
    // БЕЗОПАСНОСТЬ: Токены теперь в httpOnly cookies, не в теле ответа
    if (data?.user) {
      // ВАЖНО: Очищаем старые данные перед новым логином


      // Сбрасываем кэш API
      dispatch(baseApi.util.resetApiState());

      // Очищаем старое состояние авторизации
      dispatch(logout());

      // Только после очистки сохраняем новые данные

      dispatch(loginSuccess({
        user: data.user,
        // token больше не передается - он в httpOnly cookie
      }));
    }
  };

  return {
    handleLoginSuccess,
  };
};
