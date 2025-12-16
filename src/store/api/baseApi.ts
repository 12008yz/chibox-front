import { createApi, fetchBaseQuery, retry } from '@reduxjs/toolkit/query/react';
import type { RootState } from '../index';

// Базовый URL для API (подстраивается под ваш backend)
const BASE_URL = import.meta.env.VITE_API_URL || 'https://chibox-game.ru/api';

// Базовый query с таймаутом
const baseQuery = fetchBaseQuery({
  baseUrl: BASE_URL,
  timeout: 60000, // 60 секунд таймаут (увеличен для медленных операций)
  credentials: 'include', // КРИТИЧЕСКИ ВАЖНО: отправляем httpOnly cookies с каждым запросом
  prepareHeaders: (headers, { getState }) => {
    // БЕЗОПАСНОСТЬ: Токены теперь в httpOnly cookies, недоступны для JavaScript
    // Браузер автоматически отправит cookies с каждым запросом благодаря credentials: 'include'

    // Для обратной совместимости: если токен есть в Redux (старые сессии)
    const state = getState() as RootState;
    const token = state.auth.token;

    if (token) {
      headers.set('authorization', `Bearer ${token}`);
    }

    // НЕ устанавливаем Content-Type здесь!
    // Для JSON fetchBaseQuery установит автоматически
    // Для FormData браузер установит с правильным boundary

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

  // БЕЗОПАСНОСТЬ: Токены теперь в httpOnly cookies
  // Если в ответе есть токен (для обратной совместимости), сохраняем только в Redux
  if (result.data && typeof result.data === 'object' && 'token' in result.data && typeof (result.data as any).token === 'string') {
    console.log('🔒 Получен токен от сервера (уже в httpOnly cookie)');

    // Обновляем токен в Redux store только для обратной совместимости
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
      // Refresh token автоматически отправится из httpOnly cookie
      const refreshResult = await baseQuery(
        { url: '/v1/auth/refresh', method: 'POST' },
        api,
        extraOptions
      );

      if (refreshResult.data && typeof refreshResult.data === 'object' && 'success' in refreshResult.data && (refreshResult.data as any).success) {
        console.log('✅ Токен успешно обновлен (новые токены в httpOnly cookies)');

        // Обновляем токен в Redux только для обратной совместимости
        if ('token' in refreshResult.data) {
          api.dispatch({
            type: 'auth/setToken',
            payload: (refreshResult.data as any).token
          });
        }

        // Повторяем оригинальный запрос с новым токеном (из cookie)
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
