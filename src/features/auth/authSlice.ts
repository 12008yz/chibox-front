import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import type { User, AuthState } from '../../types/api';

// Получаем токен из localStorage при инициализации
const getInitialToken = (): string | null => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('auth_token');
  }
  return null;
};

const initialState: AuthState = {
  user: null,
  token: getInitialToken(),
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
    loginSuccess: (state, action: PayloadAction<{ user: User | null; token: string }>) => {
      state.user = action.payload.user;
      state.token = action.payload.token;
      state.isAuthenticated = true;
      state.isLoading = false;

      // Сохраняем токен в localStorage
      if (typeof window !== 'undefined') {
        localStorage.setItem('auth_token', action.payload.token);
      }
    },

    // Обновление данных пользователя
    updateUser: (state, action: PayloadAction<Partial<User>>) => {
      if (state.user) {
        // Глубокое слияние для сложных объектов
        state.user = {
          ...state.user,
          ...action.payload,
          // Специальная обработка для массивов - полная замена если есть новые данные
          inventory: action.payload.inventory || state.user.inventory,
          achievements: action.payload.achievements || state.user.achievements,
        };
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
      state.token = action.payload;
      state.isAuthenticated = true;

      // Сохраняем новый токен в localStorage
      if (typeof window !== 'undefined') {
        localStorage.setItem('auth_token', action.payload);
      }
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

      // Очищаем localStorage полностью или только связанные с auth ключи
      if (typeof window !== 'undefined') {
        // Удаляем основной токен авторизации
        localStorage.removeItem('auth_token');

        // Удаляем другие возможные ключи связанные с пользователем
        localStorage.removeItem('user_data');
        localStorage.removeItem('remember_me');
        localStorage.removeItem('last_login');

        // Можно также очистить весь localStorage если нужно:
        // localStorage.clear();
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

        // Удаляем токен из localStorage
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
