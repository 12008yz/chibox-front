import { configureStore } from '@reduxjs/toolkit';
import { baseApi } from './api/baseApi';
import authReducer from '../features/auth/authSlice';

// Настройка Redux Store
export const store = configureStore({
  reducer: {
    // API reducer от RTK Query
    [baseApi.reducerPath]: baseApi.reducer,
    // Auth slice
    auth: authReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        // Игнорируем action types от RTK Query
        ignoredActions: [
          'persist/PERSIST',
          'persist/REHYDRATE',
          'persist/PURGE',
        ],
      },
    }).concat(baseApi.middleware),
  devTools: process.env.NODE_ENV !== 'production',
});

// Типы для использования в хуках
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

// Экспортируем store по умолчанию
export default store;
