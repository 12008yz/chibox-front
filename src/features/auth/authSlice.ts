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
    loginSuccess: (state, action: PayloadAction<{ user: User; token: string }>) => {
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
        state.user = { ...state.user, ...action.payload };
      }
    },

    // Обновление баланса пользователя
    updateBalance: (state, action: PayloadAction<number>) => {
      if (state.user) {
        state.user.balance = action.payload;
      }
    },

    // Выход из системы
    logout: (state) => {
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
      state.isLoading = false;

      // Удаляем токен из localStorage
      if (typeof window !== 'undefined') {
        localStorage.removeItem('auth_token');
      }
    },

    // Ошибка авторизации
    authError: (state) => {
      state.isLoading = false;
      // Не очищаем состояние автоматически, чтобы пользователь мог повторить попытку
    },
  },
});

export const {
  setLoading,
  loginSuccess,
  updateUser,
  updateBalance,
  logout,
  authError,
} = authSlice.actions;

export default authSlice.reducer;
