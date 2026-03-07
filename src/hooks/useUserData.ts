import { useEffect, useRef } from 'react';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { updateUser } from '../features/auth/authSlice';
import { useGetCurrentUserQuery } from '../features/auth/authApi';

/**
 * Кастомный хук для автоматического обновления данных пользователя
 * Можно использовать на любой странице где нужны актуальные данные.
 * Для гостей запрос /profile не выполняется (skip), чтобы не получать 401.
 */
export const useUserData = (options: {
  autoRefresh?: boolean;
  refetchOnMount?: boolean
} = {}) => {
  const { autoRefresh = false, refetchOnMount = true } = options;
  const dispatch = useAppDispatch();
  const authUser = useAppSelector(state => state.auth.user);
  const lastUserIdRef = useRef<string | null>(null);

  const {
    data: currentUserData,
    isLoading: userLoading,
    error: userError,
    refetch: refetchUser
  } = useGetCurrentUserQuery(undefined, {
    skip: !authUser, // Не дергать /profile для гостей — только для уже авторизованных (обновление данных)
    refetchOnMountOrArgChange: refetchOnMount,
    pollingInterval: autoRefresh ? 5 * 60 * 1000 : 0,
  });

  // Обновляем данные пользователя в store при получении новых данных
  // Используем ref для предотвращения бесконечного цикла
  useEffect(() => {
    if (currentUserData?.success && currentUserData.user) {
      // Обновляем только если данные действительно изменились
      if (lastUserIdRef.current !== currentUserData.user.id) {
        lastUserIdRef.current = currentUserData.user.id;
        dispatch(updateUser(currentUserData.user));
      }
    }
  }, [currentUserData?.user?.id, dispatch]);

  return {
    userData: currentUserData?.user,
    isLoading: userLoading,
    error: userError,
    refetch: refetchUser,
    isSuccess: currentUserData?.success,
  };
};

/**
 * Простой хук для ручного обновления данных пользователя
 */
export const useRefreshUser = () => {
  const dispatch = useAppDispatch();
  const { refetch } = useGetCurrentUserQuery(undefined, { skip: true });

  const refreshUser = async () => {
    try {
      const result = await refetch();
      if (result.data?.success && result.data.user) {
        dispatch(updateUser(result.data.user));
      }
      return result;
    } catch (error) {

      throw error;
    }
  };

  return { refreshUser };
};
