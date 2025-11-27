import { useAppDispatch } from '../store/hooks';
import { loginSuccess, logout } from '../features/auth/authSlice';
import { baseApi } from '../store/api/baseApi';

// Хук  для обработки результатов авторизации
export const useAuthHandlers = () => {
  const dispatch = useAppDispatch();

  // Функция для обработки успешного логина
  const handleLoginSuccess = (data: { user: any | null; token: string }) => {
    if (data?.token) {
      // ВАЖНО: Очищаем старые данные перед новым логином
      console.log('Clearing old state before new login...');

      // Сбрасываем кэш API
      dispatch(baseApi.util.resetApiState());

      // Очищаем старое состояние авторизации
      dispatch(logout());

      // Только после очистки сохраняем новые данные
      console.log('Setting new login data...');
      dispatch(loginSuccess({
        user: data.user,
        token: data.token,
      }));
    }
  };

  return {
    handleLoginSuccess,
  };
};
