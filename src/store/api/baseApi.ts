import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import type { RootState } from '../index';

// Базовый URL для API (подстраивается под ваш backend)
const BASE_URL = '/api';

// Базовая конфигурация для всех API запросов
export const baseApi = createApi({
  reducerPath: 'api',
  baseQuery: fetchBaseQuery({
    baseUrl: BASE_URL,
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
  }),
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
    'Profile'
  ],
  endpoints: () => ({}),
});

// Экспортируем хук для использования в компонентах
export const { middleware: apiMiddleware } = baseApi;
