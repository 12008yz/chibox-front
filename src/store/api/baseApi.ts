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

  // Логируем ошибки авторизации, но НЕ делаем автоматический logout
  if (result.error?.status === 401) {
    console.log('401 Unauthorized error for:', args);
    // Автоматический logout теперь будет только в App.tsx для getCurrentUser
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
    'Subscription'
  ],
  endpoints: () => ({}),
});

// Экспортируем хук для использования в компонентах
export const { middleware: apiMiddleware } = baseApi;
