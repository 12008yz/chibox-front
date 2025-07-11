import { createListenerMiddleware } from '@reduxjs/toolkit';
import { authApi } from '../../features/auth/authApi';
import { loginSuccess } from '../../features/auth/authSlice';

// Создаем middleware для обработки авторизации
export const authMiddleware = createListenerMiddleware();

// Слушаем успешные результаты логина
authMiddleware.startListening({
  matcher: authApi.endpoints.login.matchFulfilled,
  effect: async (action, listenerApi) => {
    const result = action.payload;

    if (result.success && result.data) {
      // Автоматически обновляем состояние Redux
      listenerApi.dispatch(loginSuccess(result.data));
    }
  },
});

// Слушаем успешные результаты регистрации
authMiddleware.startListening({
  matcher: authApi.endpoints.register.matchFulfilled,
  effect: async (action, listenerApi) => {
    const result = action.payload;

    if (result.success && result.data) {
      // Автоматически обновляем состояние Redux
      listenerApi.dispatch(loginSuccess(result.data));
    }
  },
});
