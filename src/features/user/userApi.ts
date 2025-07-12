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
      query: () => 'v1/balance',
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
        return `v1/inventory?${params.toString()}`;
      },
      providesTags: ['Inventory'],
    }),

    // Продажа предмета
    sellItem: builder.mutation<
      ApiResponse<{ new_balance: number }>,
      SellItemRequest
    >({
      query: (sellData) => ({
        url: 'v1/sell-item',
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
        url: 'v1/withdraw-item',
        method: 'POST',
        body: withdrawData,
      }),
      invalidatesTags: ['Inventory'],
    }),

    // Получение достижений
    getUserAchievements: builder.query<ApiResponse<Achievement[]>, void>({
      query: () => 'v1/achievements',
      providesTags: ['Achievements'],
    }),

    // Получение прогресса достижений
    getAchievementsProgress: builder.query<
      ApiResponse<any[]>,
      void
    >({
      query: () => 'v1/achievements/progress',
      providesTags: ['Achievements'],
    }),

    // Получение миссий
    getUserMissions: builder.query<ApiResponse<Mission[]>, void>({
      query: () => 'v1/missions',
      providesTags: ['Missions'],
    }),

    // Получение уведомлений
    getUserNotifications: builder.query<
      PaginatedResponse<Notification>,
      { page?: number; limit?: number; unread_only?: boolean }
    >({
      query: ({ page = 1, limit = 20, unread_only } = {}) => {
        const params = new URLSearchParams({
          page: page.toString(),
          limit: limit.toString(),
        });
        if (unread_only) params.append('unread_only', 'true');
        return `v1/notifications?${params.toString()}`;
      },
      providesTags: ['Notifications'],
    }),

    // Получение количества непрочитанных уведомлений
    getUnreadNotificationsCount: builder.query<
      ApiResponse<{ count: number }>,
      void
    >({
      query: () => 'v1/notifications/unread-count',
      providesTags: ['Notifications'],
    }),

    // Отметить уведомление как прочитанное
    markNotificationAsRead: builder.mutation<
      ApiResponse<null>,
      string
    >({
      query: (notificationId) => ({
        url: `v1/notifications/${notificationId}/read`,
        method: 'PUT',
      }),
      invalidatesTags: ['Notifications'],
    }),

    // Отметить все уведомления как прочитанные
    markAllNotificationsAsRead: builder.mutation<
      ApiResponse<{ updated_count: number }>,
      void
    >({
      query: () => ({
        url: 'v1/notifications/mark-all-read',
        method: 'PUT',
      }),
      invalidatesTags: ['Notifications'],
    }),

    // Удалить уведомление
    deleteNotification: builder.mutation<
      ApiResponse<null>,
      string
    >({
      query: (notificationId) => ({
        url: `v1/notifications/${notificationId}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Notifications'],
    }),

    // Получение транзакций
    getUserTransactions: builder.query<
      PaginatedResponse<Transaction>,
      { page?: number; limit?: number }
    >({
      query: ({ page = 1, limit = 20 } = {}) =>
        `v1/transactions?page=${page}&limit=${limit}`,
      providesTags: ['Transactions'],
    }),

    // Получение статистики пользователя
    getUserStatistics: builder.query<ApiResponse<any>, void>({
      query: () => 'v1/statistics',
    }),

    // Получение информации о подписке
    getUserSubscription: builder.query<ApiResponse<any>, void>({
      query: () => 'v1/subscription',
      providesTags: ['User'],
    }),

    // Применение промокода
    applyPromoCode: builder.mutation<
      ApiResponse<{ reward_type: string; reward_value: number }>,
      ApplyPromoRequest
    >({
      query: (promoData) => ({
        url: 'v1/promo',
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
        url: 'v1/deposit',
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
        url: 'v1/withdraw-balance',
        method: 'POST',
        body: withdrawData,
      }),
      invalidatesTags: ['Balance', 'User'],
    }),

    // Получение таблицы лидеров
    getLeaderboard: builder.query<
      ApiResponse<{
        type: string;
        leaderboard: Array<{
          rank: number;
          user_id: string;
          username: string;
          level: number;
          subscription_tier: number;
          subscription_days_left: number;
          cases_opened?: number;
          max_item_value?: number;
          most_expensive_item_name?: string;
          total_xp_earned?: number;
        }>;
        totalItems: number;
        limit: number;
      }>,
      { type?: 'level' | 'cases_opened' | 'most_expensive_item'; limit?: number }
    >({
      query: ({ type = 'level', limit = 10 } = {}) =>
        `v1/leaderboard?type=${type}&limit=${limit}`,
      providesTags: ['User'],
    }),

    // Получение бонусного статуса
    getBonusStatus: builder.query<ApiResponse<any>, void>({
      query: () => 'v1/bonus/status',
    }),

    // Игра в бонусные квадраты
    playBonusSquares: builder.mutation<
      { message: string; next_time: string },
      { chosenCell: number }
    >({
      query: (gameData) => ({
        url: 'v1/bonus/play-squares',
        method: 'POST',
        body: gameData,
      }),
      invalidatesTags: ['Balance', 'User', 'Inventory'],
    }),

    // Сброс кулдауна бонуса
    resetBonusCooldown: builder.mutation<
      { message: string; user_id: string; previous_next_bonus_time?: string; current_next_bonus_time?: string },
      void
    >({
      query: () => ({
        url: 'v1/bonus/reset-cooldown',
        method: 'POST',
      }),
      invalidatesTags: ['User'],
    }),

    // Покупка подписки
    buySubscription: builder.mutation<
      ApiResponse<{ subscription_tier: string; expires_at: string }>,
      { tier: string; duration_days: number }
    >({
      query: (subscriptionData) => ({
        url: 'v1/subscription/buy',
        method: 'POST',
        body: subscriptionData,
      }),
      invalidatesTags: ['User', 'Balance'],
    }),

    // Обмен предмета на подписку
    exchangeItemForSubscription: builder.mutation<
      ApiResponse<{ subscription_days_added: number }>,
      { user_inventory_item_id: string }
    >({
      query: (exchangeData) => ({
        url: 'v1/items/exchange-for-subscription',
        method: 'POST',
        body: exchangeData,
      }),
      invalidatesTags: ['User', 'Inventory'],
    }),

    // Получение информации о бонусах
    getBonusInfo: builder.query<ApiResponse<any>, void>({
      query: () => 'v1/bonus-info',
    }),

    // Steam Bot API
    steamBotLogin: builder.mutation<
      ApiResponse<{ status: string }>,
      void
    >({
      query: () => ({
        url: 'v1/steambot/login',
        method: 'POST',
      }),
    }),

    sendSteamTrade: builder.mutation<
      ApiResponse<{ trade_id: string }>,
      { user_inventory_item_ids: string[]; steam_trade_url: string }
    >({
      query: (tradeData) => ({
        url: 'v1/steambot/send-trade',
        method: 'POST',
        body: tradeData,
      }),
    }),

    getSteamInventory: builder.query<
      ApiResponse<any[]>,
      void
    >({
      query: () => 'v1/steambot/inventory',
    }),

    // Получение публичного профиля пользователя
    getPublicProfile: builder.query<
      ApiResponse<any>,
      string
    >({
      query: (userId) => `v1/users/${userId}`,
    }),

    // Получение статуса вывода предмета
    getWithdrawalStatus: builder.query<
      ApiResponse<any>,
      string
    >({
      query: (withdrawalId) => `v1/withdraw-item/${withdrawalId}`,
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
  useGetUnreadNotificationsCountQuery,
  useMarkNotificationAsReadMutation,
  useMarkAllNotificationsAsReadMutation,
  useDeleteNotificationMutation,
  useGetUserTransactionsQuery,
  useGetUserStatisticsQuery,
  useGetUserSubscriptionQuery,
  useApplyPromoCodeMutation,
  useDepositBalanceMutation,
  useWithdrawBalanceMutation,
  useGetLeaderboardQuery,
  useGetBonusStatusQuery,
  usePlayBonusSquaresMutation,
  useResetBonusCooldownMutation,
  useBuySubscriptionMutation,
  useExchangeItemForSubscriptionMutation,
  useGetBonusInfoQuery,
  useSteamBotLoginMutation,
  useSendSteamTradeMutation,
  useGetSteamInventoryQuery,
  useGetPublicProfileQuery,
  useGetWithdrawalStatusQuery,
} = userApi;
