import { createApi, fetchBaseQuery, retry } from '@reduxjs/toolkit/query/react';
import type { RootState } from '../index';

// Базовый URL для API (подстраивается под ваш backend)
const BASE_URL = import.meta.env.VITE_API_URL || 'https://chibox-game.ru/api';

// Базовый query с таймаутом
const baseQuery = fetchBaseQuery({
  baseUrl: BASE_URL,
  timeout: 60000, // 60 секунд таймаут (увеличен для медленных операций)
  credentials: 'include', // Включаем отправку cookies для session-based аутентификации
  prepareHeaders: (headers, { getState }) => {
    // Добавляем токен авторизации из состояния
    const state = getState() as RootState;
    const token = state.auth.token;

    if (token) {
      headers.set('authorization', `Bearer ${token}`);
    }

    // НЕ устанавливаем Content-Type здесь!
    // Для JSON fetchBaseQuery установит автоматически
    // Для FormData браузер установит с правильным boundary
    // Если тело запроса - это JSON (не FormData), fetchBaseQuery автоматически установит Content-Type

    return headers;
  },
});

// Базовый query с retry логикой (упрощенная версия)
const baseQueryWithRetry = retry(baseQuery, {
  maxRetries: 2,
});

// Обертка для обработки ошибок авторизации и обновления токенов
const baseQueryWithErrorHandling = async (args: any, api: any, extraOptions: any) => {
  let result = await baseQueryWithRetry(args, api, extraOptions);

  // Если в ответе есть новый токен, обновляем его в localStorage и Redux
  if (result.data && typeof result.data === 'object' && 'token' in result.data && typeof (result.data as any).token === 'string') {
    console.log('Получен новый токен от сервера, обновляем...');
    localStorage.setItem('auth_token', (result.data as any).token);

    // Обновляем токен в Redux store
    api.dispatch({
      type: 'auth/setToken',
      payload: (result.data as any).token
    });
  }

  // Обработка 401 ошибок - пытаемся обновить токен
  if (result.error?.status === 401) {
    console.log('401 Unauthorized error, trying to refresh token...');

    try {
      // Пытаемся обновить токен через refresh endpoint
      const refreshResult = await baseQuery(
        { url: '/v1/auth/refresh', method: 'POST' },
        api,
        extraOptions
      );

      if (refreshResult.data && typeof refreshResult.data === 'object' && 'token' in refreshResult.data) {
        const newToken = (refreshResult.data as any).token;
        console.log('✅ Токен успешно обновлен');

        // Сохраняем новый токен
        localStorage.setItem('auth_token', newToken);
        api.dispatch({
          type: 'auth/setToken',
          payload: newToken
        });

        // Повторяем оригинальный запрос с новым токеном
        result = await baseQueryWithRetry(args, api, extraOptions);
      } else {
        // Не удалось обновить токен - выходим
        console.log('❌ Не удалось обновить токен, делаем logout');
        api.dispatch({ type: 'auth/logout' });
      }
    } catch (refreshError) {
      console.error('Ошибка при обновлении токена:', refreshError);
      api.dispatch({ type: 'auth/logout' });
    }
  }

  // Логируем сетевые ошибки
  if (result.error?.status === 'FETCH_ERROR' || result.error?.status === 'TIMEOUT_ERROR') {
    console.error('Network error:', result.error);
  }

  return result;
};

// Базовая конфигурация для всех API запросов
export const baseApi = createApi({
  reducerPath: 'api',
  baseQuery: baseQueryWithErrorHandling,
  // Тэги для инвалидации кеша
  tagTypes: [
    'User',
    'Cases',
    'CaseTemplates',
    'Inventory',
    'Achievements',
    'Missions',
    'Notifications',
    'Transactions',
    'Balance',
    'Profile',
    'Subscription',
    'TicTacToe',
    'SlotItems',
    'TowerDefense'
  ],
  endpoints: () => ({}),
  // extractRehydrationInfo(action, { reducerPath }) {
  //   if (action.type === 'persist/REHYDRATE') {
  //     return action.payload?.[reducerPath];
  //   }
  // },
});

// Экспортируем хук для использования в компонентах
export const { middleware: apiMiddleware } = baseApi;
