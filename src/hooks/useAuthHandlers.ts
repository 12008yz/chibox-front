import { useAppDispatch } from '../store/hooks';
import { loginSuccess } from '../features/auth/authSlice';

// Хук для обработки результатов авторизации
export const useAuthHandlers = () => {
  const dispatch = useAppDispatch();

  // Функция для обработки успешного логина
  const handleLoginSuccess = (data: { user: any; token: string }) => {
    if (data?.user && data?.token) {
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
