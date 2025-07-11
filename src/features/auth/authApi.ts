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
    // Тестовые эндпоинты для диагностики
    testConnection: builder.query<any, void>({
      query: () => 'v1/test',
    }),

    testPost: builder.mutation<any, { testData: string }>({
      query: (data) => ({
        url: 'v1/test-post',
        method: 'POST',
        body: data,
      }),
    }),

    // Вход в систему
    login: builder.mutation<
      ApiResponse<{ user: User; token: string }>,
      LoginRequest
    >({
      query: (credentials) => ({
        url: 'v1/login',
        method: 'POST',
        body: credentials,
      }),
      transformResponse: (response: any) => {
        // Трансформируем ответ бэкенда к ожидаемому формату
        if (response.success && response.token && response.user) {
          return {
            success: response.success,
            data: {
              user: response.user,
              token: response.token
            },
            message: response.message
          };
        }
        return response;
      },
      invalidatesTags: ['User', 'Profile'],
    }),

    // Регистрация
    register: builder.mutation<
      ApiResponse<{ user: User; token: string }>,
      RegisterRequest
    >({
      query: (userData) => ({
        url: 'v1/register',
        method: 'POST',
        body: userData,
      }),
      transformResponse: (response: any) => {
        // Трансформируем ответ бэкенда к ожидаемому формату
        if (response.success && response.token && response.user) {
          return {
            success: response.success,
            data: {
              user: response.user,
              token: response.token
            },
            message: response.message
          };
        }
        return response;
      },
      invalidatesTags: ['User', 'Profile'],
    }),

    // Выход из системы
    logout: builder.mutation<ApiResponse<null>, void>({
      query: () => ({
        url: 'v1/logout',
        method: 'POST',
      }),
      invalidatesTags: ['User', 'Profile', 'Inventory', 'Balance'],
    }),

    // Получение текущего пользователя
    getCurrentUser: builder.query<{ success: boolean; user: User }, void>({
      query: () => 'v1/profile',
      providesTags: ['User', 'Profile'],
    }),

    // Steam авторизация
    steamAuth: builder.query<
      ApiResponse<{ redirectUrl: string }>,
      void
    >({
      query: () => 'v1/auth/steam',
    }),

    // Проверка статуса авторизации
    getAuthStatus: builder.query<
      ApiResponse<{ authenticated: boolean; user: any }>,
      void
    >({
      query: () => 'v1/auth/status',
      providesTags: ['User', 'Profile'],
    }),

    // Привязка Steam аккаунта
    linkSteamAccount: builder.query<
      ApiResponse<{ redirectUrl: string }>,
      void
    >({
      query: () => 'v1/auth/link-steam',
    }),

    // Обновление профиля
    updateProfile: builder.mutation<
      ApiResponse<User>,
      Partial<Pick<User, 'username' | 'email'>>
    >({
      query: (updateData) => ({
        url: 'v1/profile',
        method: 'PUT',
        body: updateData,
      }),
      invalidatesTags: ['User', 'Profile'],
    }),
  }),
});

// Экспортируем хуки для использования в компонентах
export const {
  useTestConnectionQuery,
  useTestPostMutation,
  useLoginMutation,
  useRegisterMutation,
  useLogoutMutation,
  useGetCurrentUserQuery,
  useLazyGetCurrentUserQuery,
  useSteamAuthQuery,
  useGetAuthStatusQuery,
  useLinkSteamAccountQuery,
  useUpdateProfileMutation,
} = authApi;
