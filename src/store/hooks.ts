import { useDispatch, useSelector } from 'react-redux';
import type { TypedUseSelectorHook } from 'react-redux';
import type { RootState, AppDispatch } from './index';

// Типизированные версии стандартных хуков Redux
export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;

// Хуки для удобного доступа к состоянию авторизации
export const useAuth = () => {
  return useAppSelector((state) => state.auth);
};

export const useIsAuthenticated = () => {
  return useAppSelector((state) => state.auth.isAuthenticated);
};

export const useCurrentUser = () => {
  return useAppSelector((state) => state.auth.user);
};

export const useUserBalance = () => {
  return useAppSelector((state) => state.auth.user?.balance ?? 0);
};
