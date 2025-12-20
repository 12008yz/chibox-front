import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import type { User, AuthState } from '../../types/api';

// БЕЗОПАСНОСТЬ: Токены теперь в httpOnly cookies, недоступны для JavaScript
// Не используем localStorage для токенов - это уязвимость XSS
// Сохраняем только для обратной совместимости с существующими сессиями
const getInitialToken = (): string | null => {
  if (typeof window !== 'undefined') {
    const oldToken = localStorage.getItem('auth_token');
    if (oldToken) {

      // Удаляем старый токен для безопасности
      localStorage.removeItem('auth_token');
    }
    return oldToken;
  }
  return null;
};

const initialState: AuthState = {
  user: null,
  token: getInitialToken(), // Только для миграции старых сессий
  isAuthenticated: !!getInitialToken(),
  isLoading: false,
  error: null,
  lastLoginAttempt: null,
  sessionExpiry: null,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    // Начало загрузки
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },

    // Успешная авторизация
    loginSuccess: (state, action: PayloadAction<{ user: User | null; token?: string }>) => {

      state.user = action.payload.user;
      // БЕЗОПАСНОСТЬ: НЕ сохраняем токен ни в Redux, ни в localStorage
      // Токены ТОЛЬКО в httpOnly cookies на стороне сервера
      // token больше не передается от сервера
      state.token = null;
      state.isAuthenticated = true;
      state.isLoading = false;


    },

    // Обновление данных пользователя
    updateUser: (state, action: PayloadAction<Partial<User>>) => {
      if (state.user) {
        // Проверяем, нужно ли обновление (сравниваем ID и основные поля)
        const needsUpdate =
          action.payload.id !== state.user.id ||
          action.payload.username !== state.user.username ||
          action.payload.balance !== state.user.balance ||
          action.payload.email !== state.user.email ||
          JSON.stringify(action.payload.inventory) !== JSON.stringify(state.user.inventory);

        if (needsUpdate) {
          // Глубокое слияние для сложных объектов
          state.user = {
            ...state.user,
            ...action.payload,
            // Специальная обработка для массивов - полная замена если есть новые данные
            inventory: action.payload.inventory || state.user.inventory,
            achievements: action.payload.achievements || state.user.achievements,
          };
        }
      }
    },

    // Обновление баланса пользователя
    updateBalance: (state, action: PayloadAction<number>) => {
      if (state.user) {
        state.user.balance = action.payload;
      }
    },

    // Обновление токена
    setToken: (state, action: PayloadAction<string>) => {
      state.token = action.payload; // Храним только в Redux для обратной совместимости
      state.isAuthenticated = true;

      // БЕЗОПАСНОСТЬ: НЕ сохраняем токен в localStorage
      // Токены теперь в httpOnly cookies на стороне сервера

    },

    // Выход из системы
    logout: (state) => {
      // Полностью очищаем состояние авторизации
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
      state.isLoading = false;
      state.error = null;
      state.lastLoginAttempt = null;
      state.sessionExpiry = null;

      // БЕЗОПАСНОСТЬ: Очищаем только пользовательские данные из localStorage
      // Токены в httpOnly cookies будут очищены сервером при вызове /logout endpoint
      if (typeof window !== 'undefined') {
        // Удаляем старые токены если они были (для миграции)
        localStorage.removeItem('auth_token');

        // Удаляем другие пользовательские данные
        localStorage.removeItem('user_data');
        localStorage.removeItem('remember_me');
        localStorage.removeItem('last_login');
      }


    },

    // Ошибка авторизации
    authError: (state, action: PayloadAction<string>) => {
      state.isLoading = false;
      state.error = action.payload;
      state.lastLoginAttempt = Date.now();
      // Не очищаем состояние автоматически, чтобы пользователь мог повторить попытку
    },

    // Очистить ошибку
    clearError: (state) => {
      state.error = null;
    },

    // Установить время истечения сессии
    setSessionExpiry: (state, action: PayloadAction<number>) => {
      state.sessionExpiry = action.payload;
    },

    // Проверить валидность сессии
    checkSessionValidity: (state) => {
      if (state.sessionExpiry && Date.now() > state.sessionExpiry) {
        // Сессия истекла
        state.user = null;
        state.token = null;
        state.isAuthenticated = false;
        state.sessionExpiry = null;

        // БЕЗОПАСНОСТЬ: Токены в httpOnly cookies автоматически истекут
        // Удаляем только старые токены если они были (для миграции)
        if (typeof window !== 'undefined') {
          localStorage.removeItem('auth_token');
        }


      }
    },
  },
});

export const {
  setLoading,
  loginSuccess,
  updateUser,
  updateBalance,
  setToken,
  logout,
  authError,
  clearError,
  setSessionExpiry,
  checkSessionValidity,
} = authSlice.actions;

export default authSlice.reducer;
