import { configureStore } from '@reduxjs/toolkit';
import { persistStore, persistReducer, FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER } from 'redux-persist';
import storage from 'redux-persist/lib/storage';
import { baseApi } from './api/baseApi';
import authReducer from '../features/auth/authSlice';
import uiReducer from './slices/uiSlice';
import errorReducer from './slices/errorSlice';
import { authMiddleware } from '../store/middleware/authMiddleware';

// Конфигурация для persist только для auth
const authPersistConfig = {
  key: 'auth',
  storage,
  whitelist: ['user', 'token', 'isAuthenticated'], // Сохраняем только нужные поля
};

// Создаем persisted reducer для auth
const persistedAuthReducer = persistReducer(authPersistConfig, authReducer);

// Настройка Redux Store
export const store = configureStore({
  reducer: {
    // API reducer от RTK Query
    [baseApi.reducerPath]: baseApi.reducer,
    // Persisted auth slice
    auth: persistedAuthReducer,
    // UI состояние
    ui: uiReducer,
    // Глобальные ошибки
    error: errorReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        // Игнорируем action types от RTK Query и Redux Persist
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
        ignoredActionsPaths: ['meta.arg', 'payload.timestamp'],
      },
    }).concat(
      baseApi.middleware,
      authMiddleware.middleware
    ),
  devTools: process.env.NODE_ENV !== 'production',
});

// Создаем persistor
export const persistor = persistStore(store);

// Типы для использования в хуках
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

// Типы для persist
export type PersistedRootState = RootState;

// Экспортируем store по умолчанию
export default store;
