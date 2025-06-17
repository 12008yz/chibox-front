import { useDispatch, useSelector } from 'react-redux';
import type { TypedUseSelectorHook } from 'react-redux';
import { createSelector } from 'reselect';
import type { RootState, AppDispatch } from './index';

// Типизированные версии стандартных хуков Redux
export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;

// Базовые селекторы с проверкой типов
const selectAuth = (state: RootState) => {
  return state.auth || {
    user: null,
    token: null,
    isAuthenticated: false,
    isLoading: false,
    error: null,
    lastLoginAttempt: null,
    sessionExpiry: null
  };
};

const selectUI = (state: RootState) => {
  return state.ui || {
    isGlobalLoading: false,
    loadingTasks: [],
    modals: [],
    notifications: [],
    isSidebarOpen: true,
    isMobileMenuOpen: false,
    theme: 'dark' as const,
    language: 'ru' as const,
    animationsEnabled: true,
    soundsEnabled: true,
  };
};

const selectError = (state: RootState) => {
  return state.error || {
    globalErrors: [],
    lastCriticalError: null,
    networkErrors: [],
    validationErrors: [],
    hasUnreadErrors: false,
    isErrorBoundaryTriggered: false,
    errorCount: 0,
    sessionErrorCount: 0,
  };
};

// Мемоизированные селекторы для Auth
export const selectAuthInfo = createSelector(
  [selectAuth],
  (auth) => ({
    isAuthenticated: auth.isAuthenticated,
    isLoading: auth.isLoading,
    error: auth.error,
    user: auth.user,
  })
);

export const selectUserInfo = createSelector(
  [selectAuth],
  (auth) => auth.user && {
    id: auth.user.id,
    username: auth.user.username,
    email: auth.user.email,
    balance: auth.user.balance,
    level: auth.user.level,
    xp: auth.user.xp,
  }
);

export const selectUserBalance = createSelector(
  [selectAuth],
  (auth) => auth.user?.balance ?? 0
);

export const selectUserLevel = createSelector(
  [selectAuth],
  (auth) => auth.user?.level ?? 1
);

// Мемоизированные селекторы для UI
export const selectUIState = createSelector(
  [selectUI],
  (ui) => ({
    isGlobalLoading: ui.isGlobalLoading,
    loadingTasks: ui.loadingTasks,
    theme: ui.theme,
    language: ui.language,
    isSidebarOpen: ui.isSidebarOpen,
    isMobileMenuOpen: ui.isMobileMenuOpen,
  })
);

export const selectModals = createSelector(
  [selectUI],
  (ui) => ui.modals
);

export const selectNotifications = createSelector(
  [selectUI],
  (ui) => ui.notifications
);

export const selectHasLoadingTasks = createSelector(
  [selectUI],
  (ui) => ui.loadingTasks.length > 0
);

// Мемоизированные селекторы для Errors
export const selectErrorState = createSelector(
  [selectError],
  (error) => ({
    hasErrors: error.globalErrors.length > 0,
    hasUnreadErrors: error.hasUnreadErrors,
    errorCount: error.errorCount,
    lastCriticalError: error.lastCriticalError,
  })
);

export const selectNetworkErrors = createSelector(
  [selectError],
  (error) => error.networkErrors
);

export const selectValidationErrors = createSelector(
  [selectError],
  (error) => error.validationErrors
);

// Хуки для удобного доступа к состоянию авторизации
export const useAuth = () => {
  return useAppSelector(selectAuth);
};

export const useAuthInfo = () => {
  return useAppSelector(selectAuthInfo);
};

export const useIsAuthenticated = () => {
  return useAppSelector((state) => state.auth.isAuthenticated);
};

export const useCurrentUser = () => {
  return useAppSelector((state) => state.auth.user);
};

export const useUserInfo = () => {
  return useAppSelector(selectUserInfo);
};

export const useUserBalance = () => {
  return useAppSelector(selectUserBalance);
};

export const useUserLevel = () => {
  return useAppSelector(selectUserLevel);
};

// UI хуки
export const useUIState = () => {
  return useAppSelector(selectUIState);
};

export const useModals = () => {
  return useAppSelector(selectModals);
};

export const useNotifications = () => {
  return useAppSelector(selectNotifications);
};

export const useIsLoading = () => {
  return useAppSelector(selectHasLoadingTasks);
};

export const useTheme = () => {
  return useAppSelector((state) => state.ui.theme);
};

export const useLanguage = () => {
  return useAppSelector((state) => state.ui.language);
};

// Error хуки
export const useErrorState = () => {
  return useAppSelector(selectErrorState);
};

export const useNetworkErrors = () => {
  return useAppSelector(selectNetworkErrors);
};

export const useValidationErrors = () => {
  return useAppSelector(selectValidationErrors);
};
