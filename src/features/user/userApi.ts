import { baseApi } from '../../store/api/baseApi';
import type {
  Achievement,
  Mission,
  Notification,
  Transaction,
  SellItemRequest,
  ExchangeItemForSubscriptionRequest,
  ExchangeItemForSubscriptionResponse,
  WithdrawItemRequest,
  ApplyPromoRequest,
  ApiResponse,
  PaginatedResponse,
  InventoryResponse,
  BonusStatus,
  TicTacToeCurrentGameResponse,
  TicTacToeCreateGameResponse,
  TicTacToeMakeMoveResponse,
  PlaySlotResponse
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
      InventoryResponse,
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
      invalidatesTags: ['Balance', 'User', 'Inventory'], // Инвалидируем все кэши инвентаря
      // Оптимистичное обновление инвентаря и баланса
      async onQueryStarted(arg, { dispatch, queryFulfilled }) {
        // Оптимистичное обновление активного инвентаря (удаляем предмет)
        const activePatchResult = dispatch(
          userApi.util.updateQueryData('getUserInventory', { page: 1, limit: 100, status: 'inventory' }, (draft) => {
            if (draft.data?.items) {
              // Находим и УДАЛЯЕМ проданный предмет из списка активного инвентаря
              const itemIndex = draft.data.items.findIndex(item => item.id === arg.itemId);
              if (itemIndex !== -1) {
                console.log('Optimistically removing sold item from active inventory:', draft.data.items[itemIndex]);
                // Сохраняем данные предмета для добавления в "проданные"
                const soldItem = { ...draft.data.items[itemIndex], status: 'sold' as const, transaction_date: new Date().toISOString() };

                // Удаляем предмет из активного инвентаря
                draft.data.items.splice(itemIndex, 1);
                // Обновляем общее количество, если нужно
                if (draft.data.totalItems) {
                  draft.data.totalItems -= 1;
                }

                // Оптимистично добавляем предмет в кэш "проданных" предметов
                dispatch(
                  userApi.util.updateQueryData('getUserInventory', { page: 1, limit: 1000 }, (allDraft) => {
                    if (allDraft.data?.items) {
                      // Добавляем проданный предмет в общий список
                      allDraft.data.items.push(soldItem);
                      if (allDraft.data.totalItems) {
                        allDraft.data.totalItems += 1;
                      }
                    }
                  })
                );
              }
            }
          })
        );

        try {
          const { data } = await queryFulfilled;
          if (data.success && data.data.new_balance !== undefined) {
            dispatch({
              type: 'auth/updateBalance',
              payload: data.data.new_balance,
            });
          }
        } catch {
          // Откатываем оптимистичное обновление при ошибке
          activePatchResult.undo();
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
      invalidatesTags: ['Inventory', 'Balance', 'User'],
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
    getBonusStatus: builder.query<BonusStatus & { debug_info?: any }, void>({
      query: () => 'v1/bonus/status',
    }),


    // Игра в рулетку
    playRoulette: builder.mutation<
      {
        success: boolean;
        message: string;
        next_time: string;
        winner_index: number;
        prize_type: 'sub_1_day' | 'sub_2_days' | 'empty';
        prize_value: number;
        rotation_angle: number;
      },
      void
    >({
      query: () => ({
        url: 'v1/bonus/play-roulette',
        method: 'POST',
      }),
      invalidatesTags: ['Balance', 'User', 'Inventory'],
    }),

    // Игра в слот
    playSlot: builder.mutation<PlaySlotResponse, void>({
      query: () => ({
        url: 'v1/games/play-slot',
        method: 'POST',
      }),
      invalidatesTags: ['Balance', 'User', 'Inventory'],
    }),

    // Получение предметов для слота
    getSlotItems: builder.query<
      {
        success: boolean;
        data: {
          items: Array<{
            id: string;
            name: string;
            image_url: string;
            price: number;
            rarity: string;
            weapon_type?: string;
            skin_name?: string;
          }>;
          total_count: number;
          rarity_distribution: Record<string, number>;
        };
      },
      void
    >({
      query: () => 'v1/games/slot-items',
      providesTags: ['SlotItems'],
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



    // Обмен предмета на подписку
    exchangeItemForSubscription: builder.mutation<
      ExchangeItemForSubscriptionResponse,
      ExchangeItemForSubscriptionRequest
    >({
      query: (exchangeData) => ({
        url: 'v1/items/exchange-for-subscription',
        method: 'POST',
        body: exchangeData,
      }),
      invalidatesTags: ['User', 'Inventory', 'Subscription', 'CaseTemplates'], // Инвалидируем все кэши инвентаря
      // Оптимистичное обновление инвентаря и подписки
      async onQueryStarted(arg, { dispatch, queryFulfilled }) {
        // Оптимистичное обновление инвентаря - удаляем обмененный предмет из активного инвентаря
        const inventoryPatch = dispatch(
          userApi.util.updateQueryData('getUserInventory', { page: 1, limit: 100, status: 'inventory' }, (draft) => {
            if (draft.data?.items) {
              // Находим предмет по ID экземпляра инвентаря
              const itemIndex = draft.data.items.findIndex(item => item.id === arg.itemId && item.status === 'inventory');
              if (itemIndex !== -1) {
                console.log('Optimistically removing exchanged item:', draft.data.items[itemIndex]);
                // Сохраняем данные предмета для добавления в "обмененные"
                const exchangedItem = { ...draft.data.items[itemIndex], status: 'used' as const, transaction_date: new Date().toISOString() };

                // Удаляем предмет из активного инвентаря
                draft.data.items.splice(itemIndex, 1);
                // Обновляем общее количество
                if (draft.data.totalItems) {
                  draft.data.totalItems -= 1;
                }

                // Оптимистично добавляем предмет в кэш всех предметов как "обмененный"
                dispatch(
                  userApi.util.updateQueryData('getUserInventory', { page: 1, limit: 1000 }, (allDraft) => {
                    if (allDraft.data?.items) {
                      // Добавляем обмененный предмет в общий список
                      allDraft.data.items.push(exchangedItem);
                      if (allDraft.data.totalItems) {
                        allDraft.data.totalItems += 1;
                      }
                    }
                  })
                );
              }
            }
          })
        );

        try {
          // Ждем ответ от сервера
          const response = await queryFulfilled;

          // Оптимистичное обновление данных подписки
          if (response.data.success && response.data.data) {
            dispatch(
              userApi.util.updateQueryData('getUserSubscription', undefined, (draft) => {
                if (draft.data) {
                  // Обновляем дни подписки из ответа сервера (оба поля для совместимости)
                  draft.data.days_left = response.data.data.subscription_days_left;
                  draft.data.subscription_days_left = response.data.data.subscription_days_left;
                  draft.data.expiry_date = response.data.data.subscription_expiry_date;
                  draft.data.subscription_expiry_date = response.data.data.subscription_expiry_date;
                  console.log('Updated subscription days optimistically:', response.data.data.subscription_days_left);
                }
              })
            );
          }
        } catch (error) {
          // Откатываем оптимистичное обновление при ошибке
          inventoryPatch.undo();
          console.error('Exchange failed, rolled back optimistic update:', error);
        }
      },
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
      {
        user: {
          id: string;
          username: string;
          createdAt: string;
          level: number;
          subscriptionTier?: number;
          subscriptionStatus?: string;
          totalCasesOpened: number;
          bestItemValue?: number;
          totalItemsValue?: number;
          dailyStreak?: number;
          maxDailyStreak?: number;
          inventory: Array<{
            id: string;
            item: {
              id: string;
              name: string;
              rarity: string;
              price: string;
              weapon_type?: string;
              skin_name?: string;
              image_url?: string;
            };
            source?: string;
            status?: string;
            acquisition_date?: string;
          }>;
          bestWeapon?: {
            id: string;
            name: string;
            rarity: string;
            price: string;
            weapon_type?: string;
            skin_name?: string;
            image_url?: string;
          };
          achievements?: Array<{
            id: string;
            name: string;
            description: string;
            icon_url?: string;
            bonus_percentage: number;
            category: string;
            completion_date: string;
          }>;
          dropBonuses?: {
            achievements: number;
            subscription: number;
            level: number;
            total: number;
          };
          steam_avatar?: string;
          steam_profile?: {
            personaname?: string;
            profileurl?: string;
            avatar?: string;
            avatarmedium?: string;
            avatarfull?: string;
          };
        };
      },
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

    // Повторная отправка кода подтверждения email
    resendVerificationCode: builder.mutation<
      ApiResponse<{ codeExpires: string }>,
      { email: string }
    >({
      query: (data) => ({
        url: 'v1/resend-verification-code',
        method: 'POST',
        body: data,
      }),
    }),

    // Подтверждение email
    verifyEmail: builder.mutation<
      ApiResponse<any>,
      { email: string; verificationCode: string }
    >({
      query: (data) => ({
        url: 'v1/verify-email',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['User'],
    }),

    // Обновление профиля пользователя (для сохранения Trade URL)
    updateUserProfile: builder.mutation<
      ApiResponse<any> & { token?: string },
      { steam_trade_url?: string; [key: string]: any }
    >({
      query: (data) => ({
        url: 'v1/profile',
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: ['User'],
    }),

    // Крестики-нолики API
    createTicTacToeGame: builder.mutation<
      TicTacToeCreateGameResponse,
      void
    >({
      query: () => ({
        url: 'v1/tic-tac-toe/new-game',
        method: 'POST',
      }),
      invalidatesTags: ['TicTacToe'],
    }),

    getCurrentTicTacToeGame: builder.query<
      TicTacToeCurrentGameResponse,
      void
    >({
      query: () => 'v1/tic-tac-toe/current-game',
      providesTags: ['TicTacToe'],
    }),

    makeTicTacToeMove: builder.mutation<
      TicTacToeMakeMoveResponse,
      { position: number }
    >({
      query: (data) => ({
        url: 'v1/tic-tac-toe/move',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['TicTacToe'],
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
  useWithdrawBalanceMutation,
  useGetLeaderboardQuery,
  useGetBonusStatusQuery,
  usePlayRouletteMutation,
  usePlaySlotMutation,
  useGetSlotItemsQuery,
  useResetBonusCooldownMutation,

  useExchangeItemForSubscriptionMutation,
  useGetBonusInfoQuery,
  useSteamBotLoginMutation,
  useSendSteamTradeMutation,
  useGetSteamInventoryQuery,
  useGetPublicProfileQuery,
  useGetWithdrawalStatusQuery,
  useResendVerificationCodeMutation,
  useVerifyEmailMutation,
  useUpdateUserProfileMutation,

  // Крестики-нолики хуки
  useCreateTicTacToeGameMutation,
  useGetCurrentTicTacToeGameQuery,
  useMakeTicTacToeMoveMutation,
} = userApi;
