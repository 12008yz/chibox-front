import { createListenerMiddleware } from '@reduxjs/toolkit';
import { authApi } from '../../features/auth/authApi';
import { loginSuccess, logout } from '../../features/auth/authSlice';
import { baseApi, resetRefreshState } from '../api/baseApi';
import { HAD_USER_ACCOUNT_KEY } from '../../utils/postAuthRedirect';

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
  effect: async (_action, _listenerApi) => {
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
    if (action.payload.user?.id && typeof window !== 'undefined') {
      try {
        localStorage.setItem(HAD_USER_ACCOUNT_KEY, '1');
      } catch {
        /* ignore */
      }
    }

    listenerApi.dispatch(
      baseApi.util.invalidateTags(['User', 'Profile', 'Balance', 'Inventory'])
    );
  },
});

// Слушаем logout action для очистки состояния API
authMiddleware.startListening({
  actionCreator: logout,
  effect: async (_action, listenerApi) => {
    if (typeof window !== 'undefined') {
      try {
        localStorage.removeItem(HAD_USER_ACCOUNT_KEY);
      } catch {
        /* ignore */
      }
    }

    resetRefreshState();

    listenerApi.dispatch(baseApi.util.resetApiState());
  },
});
