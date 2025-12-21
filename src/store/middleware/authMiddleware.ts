import { createListenerMiddleware } from '@reduxjs/toolkit';
import { authApi } from '../../features/auth/authApi';
import { loginSuccess, logout } from '../../features/auth/authSlice';
import { baseApi, resetRefreshState } from '../api/baseApi';

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
  effect: async (_action, listenerApi) => {


    // Инвалидируем кэш пользовательских данных
    listenerApi.dispatch(
      baseApi.util.invalidateTags(['User', 'Profile', 'Balance', 'Inventory'])
    );


  },
});

// Слушаем logout action для очистки состояния API
authMiddleware.startListening({
  actionCreator: logout,
  effect: async (_action, listenerApi) => {

    // Сбрасываем флаг обновления токена
    resetRefreshState();

    // Сбрасываем состояние RTK Query API, чтобы очистить весь кэш и остановить все активные запросы
    listenerApi.dispatch(baseApi.util.resetApiState());

  },
});
