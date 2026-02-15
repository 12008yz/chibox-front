import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import type { BaseQueryFn, FetchArgs, FetchBaseQueryError } from '@reduxjs/toolkit/query/react';
import { API_URL } from '../../utils/config';

const BASE_URL = API_URL;

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

// Базовый query с retry логикой (не применяется к 401 и 403 ошибкам)
const baseQueryWithRetry: BaseQueryFn<string | FetchArgs, unknown, FetchBaseQueryError> = async (
  args,
  api,
  extraOptions
) => {
  let result = await baseQuery(args, api, extraOptions);

  // Retry только для сетевых ошибок, не для ошибок авторизации
  if (result.error && result.error.status !== 401 && result.error.status !== 403) {
    let retries = 0;
    const maxRetries = 2;

    while (retries < maxRetries && (result.error.status === 'FETCH_ERROR' || result.error.status === 'TIMEOUT_ERROR')) {
      retries++;
      await new Promise(resolve => setTimeout(resolve, 1000 * retries)); // Exponential backoff
      result = await baseQuery(args, api, extraOptions);

      if (!result.error) break;
    }
  }

  return result;
};

// Флаг для предотвращения множественных попыток обновления токена одновременно
let isRefreshing = false;
let refreshPromise: Promise<any> | null = null;

// Функция для сброса состояния обновления (вызывается при logout)
export const resetRefreshState = () => {
  isRefreshing = false;
  refreshPromise = null;
};

// Обертка для обработки ошибок авторизации и обновления токенов
const baseQueryWithErrorHandling = async (args: any, api: any, extraOptions: any) => {
  // Проверяем, не является ли это запросом logout или refresh
  const isLogoutRequest = typeof args === 'object' && args.url?.includes('/logout');
  const isRefreshRequest = typeof args === 'object' && args.url?.includes('/refresh');

  let result = await baseQueryWithRetry(args, api, extraOptions);

  // БЕЗОПАСНОСТЬ: Токены ТОЛЬКО в httpOnly cookies, НЕ в теле ответа
  // Браузер автоматически отправляет и получает cookies
  // JavaScript НЕ имеет доступа к токенам - защита от XSS

  // Обработка 401 ошибок - пытаемся обновить токен
  if (result.error?.status === 401 && !isLogoutRequest && !isRefreshRequest) {
    // Проверяем, авторизован ли пользователь в Redux
    const state = api.getState();
    const isAuthenticated = state.auth?.isAuthenticated;

    // Если пользователь не авторизован, не пытаемся обновить токен
    if (!isAuthenticated) {
      return result;
    }

    // Если уже происходит обновление токена, ждем его завершения
    if (isRefreshing && refreshPromise) {
      try {
        await refreshPromise;
        // Повторяем оригинальный запрос после обновления токена
        result = await baseQueryWithRetry(args, api, extraOptions);
      } catch {
        // Обновление не удалось, возвращаем оригинальную ошибку
        return result;
      }
      return result;
    }

    // Начинаем процесс обновления токена
    isRefreshing = true;
    refreshPromise = (async () => {
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
          api.dispatch({ type: 'auth/logout' });
        }
      } catch {
        api.dispatch({ type: 'auth/logout' });
      } finally {
        isRefreshing = false;
        refreshPromise = null;
      }
    })();

    await refreshPromise;
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
  extractRehydrationInfo(action) {
    if (action.type === 'persist/REHYDRATE') {
      // Не восстанавливаем кэш API из персиста, чтобы избежать устаревших данных
      // Вместо этого дадим API самостоятельно загрузить свежие данные
      return undefined;
    }
  },
});

// Экспортируем хук для использования в компонентах
export const { middleware: apiMiddleware } = baseApi;
