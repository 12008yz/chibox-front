import { baseApi } from '../../store/api/baseApi';
import type {
  LoginRequest,
  RegisterRequest,
  User,
  ApiResponse
} from '../../types/api';

// Моковые данные пользователя для fallback
const mockUser: User = {
  id: 'user_123',
  username: 'TestUser',
  email: 'test@chibox.com',
  balance: 1250.75,
  level: 15,
  xp: 2450,
  profilePicture: 'https://via.placeholder.com/128/6366f1/ffffff?text=U',
  steamId: null,
  steamUsername: null,
  steamAvatar: null,
  createdAt: new Date().toISOString(),
  lastLogin: new Date().toISOString(),
  isVerified: true,
  preferences: {
    notifications: true,
    sounds: true,
    language: 'ru'
  }
};

const mockToken = 'mock_jwt_token_for_testing_123';

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

    // Вход в систему - сначала пробуем реальный API, потом fallback
    login: builder.mutation<
      ApiResponse<{ user: User; token: string }>,
      LoginRequest
    >({
      queryFn: async (credentials, _queryApi, _extraOptions, baseQuery) => {
        try {
          // Сначала пробуем реальный API
          const result = await baseQuery({
            url: 'v1/login',
            method: 'POST',
            body: credentials,
          });

          if (result.data) {
            // Трансформируем ответ бэкенда к ожидаемому формату
            const response = result.data as any;
            if (response.success && response.token && response.user) {
              return {
                data: {
                  success: response.success,
                  data: {
                    user: response.user,
                    token: response.token
                  },
                  message: response.message
                }
              };
            }
            return { data: response };
          }

          // Если реальный API недоступен и это тестовые данные, используем mock
          if (credentials.email === 'test@test.com' && credentials.password === 'password') {
            return {
              data: {
                success: true,
                data: {
                  user: mockUser,
                  token: mockToken
                },
                message: 'Успешный вход в систему (mock data)'
              }
            };
          }

          // Возвращаем ошибку если ни реальный API ни mock не подошли
          return {
            error: {
              status: 401,
              data: { message: 'Неверные учетные данные' }
            }
          };

        } catch (error) {
          // Fallback на mock данные для тестовых учетных данных
          if (credentials.email === 'test@test.com' && credentials.password === 'password') {
            return {
              data: {
                success: true,
                data: {
                  user: mockUser,
                  token: mockToken
                },
                message: 'Успешный вход в систему (mock data)'
              }
            };
          }
          return { error: { status: 500, data: 'Ошибка сервера' } };
        }
      },
      invalidatesTags: ['User', 'Profile'],
    }),

    // Регистрация - реальный API с fallback
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
      queryFn: async (_arg, _queryApi, _extraOptions, baseQuery) => {
        try {
          // Пробуем реальный API
          const result = await baseQuery({
            url: 'v1/logout',
            method: 'POST',
          });

          if (result.data) {
            return { data: result.data };
          }

          // Если API недоступен, просто возвращаем успех
          return {
            data: {
              success: true,
              data: null,
              message: 'Успешный выход из системы'
            }
          };

        } catch (error) {
          // В случае ошибки все равно считаем logout успешным
          return {
            data: {
              success: true,
              data: null,
              message: 'Успешный выход из системы'
            }
          };
        }
      },
      invalidatesTags: ['User', 'Profile', 'Inventory', 'Balance'],
    }),

    // Получение текущего пользователя - пробуем разные эндпоинты
    getCurrentUser: builder.query<ApiResponse<User>, void>({
      queryFn: async (_arg, { getState }, _extraOptions, baseQuery) => {
        try {
          // Проверяем наличие токена в состоянии
          const state = getState() as any;
          const token = state.auth.token;

          if (!token) {
            return { error: { status: 401, data: 'Токен отсутствует' } };
          }

          // Если это наш mock токен, сразу возвращаем mock данные
          if (token === mockToken) {
            return {
              data: {
                success: true,
                data: mockUser,
                message: 'Пользователь найден (mock data)'
              }
            };
          }

          // Список возможных эндпоинтов для получения профиля
          const profileEndpoints = [
            'v1/user/profile',
            'v1/user/me',
            'v1/me',
            'v1/auth/me',
            'v1/users/me',
            'v1/profile'
          ];

          // Пробуем разные эндпоинты
          for (const endpoint of profileEndpoints) {
            try {
              const result = await baseQuery(endpoint);

              if (result.data && !result.error) {
                console.log(`Success with endpoint: ${endpoint}`, result.data);
                return { data: result.data };
              }

              // Если получили 403 или 404, пробуем следующий эндпоинт
              if (result.error && (result.error.status === 403 || result.error.status === 404)) {
                console.log(`Endpoint ${endpoint} failed with:`, result.error);
                continue;
              }

              // Если другая ошибка, тоже пробуем следующий
              if (result.error) {
                console.log(`Endpoint ${endpoint} failed with:`, result.error);
                continue;
              }

            } catch (endpointError) {
              console.log(`Endpoint ${endpoint} threw error:`, endpointError);
              continue;
            }
          }

          // Если все эндпоинты не сработали, возвращаем ошибку
          console.log('All profile endpoints failed');
          return { error: { status: 401, data: 'Не удалось получить данные пользователя' } };

        } catch (error) {
          console.error('getCurrentUser error:', error);
          return { error: { status: 500, data: 'Ошибка сервера' } };
        }
      },
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
