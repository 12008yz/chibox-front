import { useEffect } from 'react';
import { useAppDispatch } from '../store/hooks';
import { updateUser } from '../features/auth/authSlice';
import { useGetCurrentUserQuery } from '../features/auth/authApi';

/**
 * Кастомный хук для автоматического обновления данных пользователя
 * Можно использовать на любой странице где нужны актуальные данные
 */
export const useUserData = (options: {
  autoRefresh?: boolean;
  refetchOnMount?: boolean
} = {}) => {
  const { autoRefresh = false, refetchOnMount = true } = options;
  const dispatch = useAppDispatch();

  const {
    data: currentUserData,
    isLoading: userLoading,
    error: userError,
    refetch: refetchUser
  } = useGetCurrentUserQuery(undefined, {
    refetchOnMountOrArgChange: refetchOnMount,
    // Периодическое обновление каждые 5 минут если autoRefresh включен
    pollingInterval: autoRefresh ? 5 * 60 * 1000 : 0,
  });

  // Обновляем данные пользователя в store при получении новых данных
  useEffect(() => {
    if (currentUserData?.success && currentUserData.user) {
      dispatch(updateUser(currentUserData.user));
    }
  }, [currentUserData, dispatch]);

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
      console.error('Failed to refresh user data:', error);
      throw error;
    }
  };

  return { refreshUser };
};
