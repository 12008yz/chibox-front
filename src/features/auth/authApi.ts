import { baseApi } from '../../store/api/baseApi';
import type {
  LoginRequest,
  RegisterRequest,
  User,
  ApiResponse
} from '../../types/api';

// Расширяем базовый API для авторизации
export const authApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // Вход в систему
    login: builder.mutation<
      ApiResponse<{ user: User; token: string }>,
      LoginRequest
    >({
      query: (credentials) => ({
        url: '/auth/login',
        method: 'POST',
        body: credentials,
      }),
      invalidatesTags: ['User', 'Profile'],
    }),

    // Регистрация
    register: builder.mutation<
      ApiResponse<{ user: User; token: string }>,
      RegisterRequest
    >({
      query: (userData) => ({
        url: '/auth/register',
        method: 'POST',
        body: userData,
      }),
      invalidatesTags: ['User', 'Profile'],
    }),

    // Выход из системы
    logout: builder.mutation<ApiResponse<null>, void>({
      query: () => ({
        url: '/auth/logout',
        method: 'POST',
      }),
      invalidatesTags: ['User', 'Profile', 'Inventory', 'Balance'],
    }),

    // Получение текущего пользователя (проверка токена)
    getCurrentUser: builder.query<ApiResponse<User>, void>({
      query: () => '/user/profile',
      providesTags: ['User', 'Profile'],
    }),

    // Steam авторизация (если используется)
    steamAuth: builder.query<
      ApiResponse<{ redirectUrl: string }>,
      void
    >({
      query: () => '/auth/steam',
    }),

    // Обновление профиля
    updateProfile: builder.mutation<
      ApiResponse<User>,
      Partial<Pick<User, 'username' | 'email'>>
    >({
      query: (updateData) => ({
        url: '/user/profile',
        method: 'PUT',
        body: updateData,
      }),
      invalidatesTags: ['User', 'Profile'],
    }),
  }),
});

// Экспортируем хуки для использования в компонентах
export const {
  useLoginMutation,
  useRegisterMutation,
  useLogoutMutation,
  useGetCurrentUserQuery,
  useLazyGetCurrentUserQuery,
  useSteamAuthQuery,
  useUpdateProfileMutation,
} = authApi;
