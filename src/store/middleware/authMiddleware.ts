import { createListenerMiddleware } from '@reduxjs/toolkit';
import { authApi } from '../../features/auth/authApi';
import { loginSuccess } from '../../features/auth/authSlice';
import { baseApi } from '../api/baseApi';

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

    // if (result.success && result.data) {
    //   // Автоматически обновляем состояние Redux
    //   listenerApi.dispatch(loginSuccess(result.data));
    // }
  },
});

// Слушаем loginSuccess action (в том числе от Steam авторизации)
authMiddleware.startListening({
  actionCreator: loginSuccess,
  effect: async (action, listenerApi) => {
    console.log('🔄 LoginSuccess detected, invalidating cache...');

    // Инвалидируем кэш пользовательских данных
    listenerApi.dispatch(
      baseApi.util.invalidateTags(['User', 'Profile', 'Balance', 'Inventory'])
    );

    console.log('✅ Cache invalidated after login');
  },
});
