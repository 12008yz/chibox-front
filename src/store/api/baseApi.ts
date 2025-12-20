import { createApi, fetchBaseQuery, retry } from '@reduxjs/toolkit/query/react';

// Базовый URL для API (подстраивается под ваш backend)
const BASE_URL = import.meta.env.VITE_API_URL || 'https://chibox-game.ru/api';

// Базовый query с таймаутом
const baseQuery = fetchBaseQuery({
  baseUrl: BASE_URL,
  timeout: 60000, // 60 секунд таймаут (увеличен для медленных операций)
  credentials: 'include', // КРИТИЧЕСКИ ВАЖНО: отправляем httpOnly cookies с каждым запросом
  prepareHeaders: (headers) => {
    // БЕЗОПАСНОСТЬ: Токены теперь в httpOnly cookies, недоступны для JavaScript
    // Браузер автоматически отправит cookies с каждым запросом благодаря credentials: 'include'

    // НЕ добавляем токен в заголовки - он автоматически отправляется в cookies
    // Это защищает от XSS атак

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

  // БЕЗОПАСНОСТЬ: Токены ТОЛЬКО в httpOnly cookies, НЕ в теле ответа
  // Браузер автоматически отправляет и получает cookies
  // JavaScript НЕ имеет доступа к токенам - защита от XSS

  // НЕ сохраняем токены из ответа - их там больше нет

  // Обработка 401 ошибок - пытаемся обновить токен
  if (result.error?.status === 401) {

    try {
      // Пытаемся обновить токен через refresh endpoint
      // Refresh token автоматически отправится из httpOnly cookie
      const refreshResult = await baseQuery(
        { url: '/v1/auth/refresh', method: 'POST' },
        api,
        extraOptions
      );

      if (refreshResult.data && typeof refreshResult.data === 'object' && 'success' in refreshResult.data && (refreshResult.data as any).success) {

        // НЕ обновляем токен в Redux - его там нет и не должно быть
        // Токены ТОЛЬКО в httpOnly cookies

        // Повторяем оригинальный запрос с новым токеном (из cookie)
        result = await baseQueryWithRetry(args, api, extraOptions);
      } else {
        // Не удалось обновить токен - выходим
        api.dispatch({ type: 'auth/logout' });
      }
    } catch (refreshError) {
      api.dispatch({ type: 'auth/logout' });
    }
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
