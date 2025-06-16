import { baseApi } from '../../store/api/baseApi';
import type {
  UserInventoryItem,
  Achievement,
  Mission,
  Notification,
  Transaction,
  SellItemRequest,
  WithdrawItemRequest,
  ApplyPromoRequest,
  DepositRequest,
  ApiResponse,
  PaginatedResponse
} from '../../types/api';

// Расширяем базовый API для работы с пользователем
export const userApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // Получение баланса пользователя
    getUserBalance: builder.query<ApiResponse<{ balance: number }>, void>({
      query: () => '/user/balance',
      providesTags: ['Balance'],
    }),

    // Получение инвентаря пользователя
    getUserInventory: builder.query<
      PaginatedResponse<UserInventoryItem>,
      { page?: number; limit?: number; status?: string }
    >({
      query: ({ page = 1, limit = 20, status } = {}) => {
        const params = new URLSearchParams({
          page: page.toString(),
          limit: limit.toString(),
        });
        if (status) params.append('status', status);
        return `/user/inventory?${params.toString()}`;
      },
      providesTags: ['Inventory'],
    }),

    // Продажа предмета
    sellItem: builder.mutation<
      ApiResponse<{ new_balance: number }>,
      SellItemRequest
    >({
      query: (sellData) => ({
        url: '/user/sell-item',
        method: 'POST',
        body: sellData,
      }),
      invalidatesTags: ['Inventory', 'Balance', 'User'],
      // Оптимистичное обновление баланса
      async onQueryStarted(arg, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          if (data.success && data.data.new_balance !== undefined) {
            dispatch({
              type: 'auth/updateBalance',
              payload: data.data.new_balance,
            });
          }
        } catch {
          // Обработка ошибок
        }
      },
    }),

    // Вывод предмета
    withdrawItem: builder.mutation<
      ApiResponse<{ withdrawal_id: string }>,
      WithdrawItemRequest
    >({
      query: (withdrawData) => ({
        url: '/user/withdraw-item',
        method: 'POST',
        body: withdrawData,
      }),
      invalidatesTags: ['Inventory'],
    }),

    // Получение достижений
    getUserAchievements: builder.query<ApiResponse<Achievement[]>, void>({
      query: () => '/user/achievements',
      providesTags: ['Achievements'],
    }),

    // Получение прогресса достижений
    getAchievementsProgress: builder.query<
      ApiResponse<any[]>,
      void
    >({
      query: () => '/user/achievements-progress',
      providesTags: ['Achievements'],
    }),

    // Получение миссий
    getUserMissions: builder.query<ApiResponse<Mission[]>, void>({
      query: () => '/user/missions',
      providesTags: ['Missions'],
    }),

    // Получение уведомлений
    getUserNotifications: builder.query<
      PaginatedResponse<Notification>,
      { page?: number; limit?: number }
    >({
      query: ({ page = 1, limit = 10 } = {}) =>
        `/user/notifications?page=${page}&limit=${limit}`,
      providesTags: ['Notifications'],
    }),

    // Получение транзакций
    getUserTransactions: builder.query<
      PaginatedResponse<Transaction>,
      { page?: number; limit?: number }
    >({
      query: ({ page = 1, limit = 20 } = {}) =>
        `/user/transactions?page=${page}&limit=${limit}`,
      providesTags: ['Transactions'],
    }),

    // Получение статистики пользователя
    getUserStatistics: builder.query<ApiResponse<any>, void>({
      query: () => '/user/statistics',
    }),

    // Получение информации о подписке
    getUserSubscription: builder.query<ApiResponse<any>, void>({
      query: () => '/user/subscription',
      providesTags: ['User'],
    }),

    // Применение промокода
    applyPromoCode: builder.mutation<
      ApiResponse<{ reward_type: string; reward_value: number }>,
      ApplyPromoRequest
    >({
      query: (promoData) => ({
        url: '/user/apply-promo',
        method: 'POST',
        body: promoData,
      }),
      invalidatesTags: ['User', 'Balance'],
    }),

    // Пополнение баланса
    depositBalance: builder.mutation<
      ApiResponse<{ payment_url: string; payment_id: string }>,
      DepositRequest
    >({
      query: (depositData) => ({
        url: '/user/deposit',
        method: 'POST',
        body: depositData,
      }),
    }),

    // Вывод баланса
    withdrawBalance: builder.mutation<
      ApiResponse<{ withdrawal_id: string }>,
      { amount: number; method: string }
    >({
      query: (withdrawData) => ({
        url: '/user/withdraw-balance',
        method: 'POST',
        body: withdrawData,
      }),
      invalidatesTags: ['Balance', 'User'],
    }),

    // Получение таблицы лидеров
    getLeaderboard: builder.query<
      ApiResponse<any[]>,
      { type?: string; limit?: number }
    >({
      query: ({ type = 'weekly', limit = 10 } = {}) =>
        `/user/leaderboard?type=${type}&limit=${limit}`,
    }),

    // Получение бонусного статуса
    getBonusStatus: builder.query<ApiResponse<any>, void>({
      query: () => '/user/bonus-status',
    }),

    // Игра в бонусные квадраты
    playBonusSquares: builder.mutation<
      ApiResponse<{ reward: number; new_balance: number }>,
      { square_id: number }
    >({
      query: (gameData) => ({
        url: '/user/play-bonus-squares',
        method: 'POST',
        body: gameData,
      }),
      invalidatesTags: ['Balance', 'User'],
    }),
  }),
});

// Экспортируем хуки для использования в компонентах
export const {
  useGetUserBalanceQuery,
  useGetUserInventoryQuery,
  useSellItemMutation,
  useWithdrawItemMutation,
  useGetUserAchievementsQuery,
  useGetAchievementsProgressQuery,
  useGetUserMissionsQuery,
  useGetUserNotificationsQuery,
  useGetUserTransactionsQuery,
  useGetUserStatisticsQuery,
  useGetUserSubscriptionQuery,
  useApplyPromoCodeMutation,
  useDepositBalanceMutation,
  useWithdrawBalanceMutation,
  useGetLeaderboardQuery,
  useGetBonusStatusQuery,
  usePlayBonusSquaresMutation,
} = userApi;
