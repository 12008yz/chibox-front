import { createApi, fetchBaseQuery, retry } from '@reduxjs/toolkit/query/react';
import type { RootState } from '../index';

// Базовый URL для API (подстраивается под ваш backend)
const BASE_URL = '/api';

// Базовый query с таймаутом
const baseQuery = fetchBaseQuery({
  baseUrl: BASE_URL,
  timeout: 30000, // 30 секунд таймаут
  prepareHeaders: (headers, { getState }) => {
    // Добавляем токен авторизации из состояния
    const state = getState() as RootState;
    const token = state.auth.token;

    if (token) {
      headers.set('authorization', `Bearer ${token}`);
    }

    headers.set('content-type', 'application/json');
    return headers;
  },
});

// Базовый query с retry логикой (упрощенная версия)
const baseQueryWithRetry = retry(baseQuery, {
  maxRetries: 2,
});

// Обертка для обработки ошибок авторизации
const baseQueryWithErrorHandling = async (args: any, api: any, extraOptions: any) => {
  const result = await baseQueryWithRetry(args, api, extraOptions);
  
  // Обработка ошибок авторизации
  if (result.error?.status === 401) {
    // Диспатчим logout при 401 ошибке
    api.dispatch({ type: 'auth/logout' });
    
    // Диспатчим уведомление об истечении сессии
    api.dispatch({
      type: 'ui/addNotification',
      payload: {
        type: 'warning',
        title: 'Сессия истекла',
        message: 'Пожалуйста, войдите в систему снова',
        duration: 5000,
      },
    });
  }
  
  // Обработка сетевых ошибок
  if (result.error?.status === 'FETCH_ERROR' || result.error?.status === 'TIMEOUT_ERROR') {
    api.dispatch({
      type: 'error/addNetworkError',
      payload: {
        message: 'Ошибка соединения с сервером',
        severity: 'medium',
        isRetryable: true,
        source: 'api',
        endpoint: typeof args === 'string' ? args : args.url,
        method: typeof args === 'object' ? args.method : 'GET',
      },
    });
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
    'Subscription'
  ],
  endpoints: () => ({}),
});

// Экспортируем хук для использования в компонентах
export const { middleware: apiMiddleware } = baseApi;