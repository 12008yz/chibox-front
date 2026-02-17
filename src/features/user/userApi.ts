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
  TowerDefenseStatusResponse,
  TowerDefenseCreateGameResponse,
  TowerDefenseCompleteGameRequest,
  TowerDefenseCompleteGameResponse,
  TowerDefenseStatisticsResponse,
  TopUpBalanceRequest,
  TopUpBalanceResponse
} from '../../types/api';
import type { ExchangeRates } from '../../utils/currencyUtils';

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
        // Оптимистичное обновление основного инвентаря (обновляем статус предмета на sold)
        const mainPatchResult = dispatch(
          userApi.util.updateQueryData('getUserInventory', { page: 1, limit: 1000 }, (draft) => {
            if (draft.data?.items) {
              // Находим проданный предмет и меняем его статус
              const itemIndex = draft.data.items.findIndex(item => item.id === arg.itemId);
              if (itemIndex !== -1) {
                // Меняем статус на sold
                draft.data.items[itemIndex].status = 'sold';
                draft.data.items[itemIndex].transaction_date = new Date().toISOString();
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
          mainPatchResult.undo();
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
      // Оптимистичное обновление инвентаря
      async onQueryStarted(arg, { dispatch, queryFulfilled }) {
        // Оптимистичное обновление основного инвентаря - меняем статус предмета
        const mainPatchResult = dispatch(
          userApi.util.updateQueryData('getUserInventory', { page: 1, limit: 1000 }, (draft) => {
            if (draft.data?.items) {
              // Находим предмет по inventoryItemId
              const itemIndex = draft.data.items.findIndex(item => item.id === arg.inventoryItemId);
              if (itemIndex !== -1) {
                // Меняем статус на pending_withdrawal
                draft.data.items[itemIndex].status = 'pending_withdrawal';
                draft.data.items[itemIndex].transaction_date = new Date().toISOString();
              }
            }
          })
        );

        try {
          await queryFulfilled;
        } catch {
          // Откатываем оптимистичное обновление при ошибке
          mainPatchResult.undo();
        }
      },
    }),

    // Проверка статусов отправленных выводов (принят ли трейд в Steam) — обновляет заявки без ожидания крона
    checkWithdrawalStatuses: builder.mutation<
      ApiResponse<{ updated: number }>,
      void
    >({
      query: () => ({
        url: 'v1/withdrawals/check-status',
        method: 'POST',
      }),
      invalidatesTags: ['Inventory', 'User'],
    }),

    // Отмена вывода предмета
    cancelWithdrawal: builder.mutation<
      ApiResponse<{ withdrawal_id: string; status: string }>,
      { withdrawalId: string }
    >({
      query: ({ withdrawalId }) => ({
        url: `v1/withdraw-item/${withdrawalId}/cancel`,
        method: 'POST',
      }),
      invalidatesTags: ['Inventory', 'User'],
      // Оптимистичное обновление инвентаря
      async onQueryStarted(_, { queryFulfilled }) {
        try {
          await queryFulfilled;
        } catch {
          // rollback via invalidatesTags
        }
      },
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

    // История пополнений и покупок статусов
    getPaymentHistory: builder.query<
      ApiResponse<{ items: Array<{ id: string; purpose: 'deposit' | 'subscription'; amount: number; description: string; completed_at: string | null }> }>,
      { limit?: number }
    >({
      query: ({ limit = 15 } = {}) =>
        `v1/balance/payment-history?limit=${limit}`,
      providesTags: ['Transactions', 'Balance'],
    }),

    // Получение статистики пользователя
    getUserStatistics: builder.query<ApiResponse<any>, void>({
      query: () => 'v1/statistics',
    }),

    // Получение глобальной статистики сайта
    getGlobalStatistics: builder.query<ApiResponse<{
      totalUsers: number;
      totalCasesOpened: number;
      totalUpgrades: number;
      totalGamesPlayed: number;
    }>, void>({
      query: () => 'v1/statistics/global',
      // Обновляем каждые 10 секунд для актуальности данных
      keepUnusedDataFor: 10,
    }),

    // Получение информации о подписке
    getUserSubscription: builder.query<ApiResponse<any>, void>({
      query: () => 'v1/subscription',
      providesTags: ['User'],
    }),

    // Применение промокода
    applyPromoCode: builder.mutation<
      ApiResponse<{ newBalance: number; addedAmount: number }>,
      ApplyPromoRequest
    >({
      query: (promoData) => ({
        url: 'v1/promo',
        method: 'POST',
        body: promoData,
      }),
      invalidatesTags: ['User', 'Balance'],
      async onQueryStarted(_arg, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          if (data.success && data.data?.newBalance !== undefined) {
            // Обновляем баланс в Redux store
            dispatch({
              type: 'auth/updateBalance',
              payload: data.data.newBalance,
            });
          }
        } catch {
          // Ошибка уже обработана в компоненте
        }
      },
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


    // Получить статус игры Safe Cracker
    getSafeCrackerStatus: builder.query<
      {
        success: boolean;
        remaining_attempts: number;
        free_attempts_remaining: number;
        free_attempts_info: {
          can_use: boolean;
          reason: string;
          next_available: string | null;
          claim_count: number;
          first_claim_date: string | null;
          last_claim_date: string | null;
        };
        subscription_days: number;
        subscription_tier: number;
        max_attempts: number;
        has_won: boolean;
        can_play: boolean;
      },
      void
    >({
      query: () => 'v1/games/safe-cracker-status',
      providesTags: ['User'],
    }),

    // Игра в Safe Cracker
    playSafeCracker: builder.mutation<
      {
        success: boolean;
        message: string;
        secret_code: number[];
        user_code: number[];
        matches: number;
        prize_type: 'money' | 'item' | 'subscription' | 'none';
        prize_value: number;
        won_item?: {
          id: string;
          name: string;
          image_url: string;
          price: number;
          rarity: string;
        };
        new_balance: number;
        remaining_attempts: number;
      },
      void
    >({
      query: () => ({
        url: 'v1/games/play-safe-cracker',
        method: 'POST',
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
        // Оптимистичное обновление основного инвентаря - меняем статус предмета на used
        const inventoryPatch = dispatch(
          userApi.util.updateQueryData('getUserInventory', { page: 1, limit: 1000 }, (draft) => {
            if (draft.data?.items) {
              // Находим предмет по ID экземпляра инвентаря
              const itemIndex = draft.data.items.findIndex(item => item.id === arg.itemId);
              if (itemIndex !== -1) {
                // Меняем статус на used
                draft.data.items[itemIndex].status = 'used';
                draft.data.items[itemIndex].transaction_date = new Date().toISOString();
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
                }
              })
            );
          }
        } catch {
          inventoryPatch.undo();
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
          avatar_url?: string;
          subscriptionTier?: number;
          subscriptionStatus?: string;
          totalCasesOpened: number;
          bestItemValue?: number;
          totalItemsValue?: number;
          dailyStreak?: number;
          maxDailyStreak?: number;
          inventory: Array<{
            id: string;
            item_type?: string;
            item?: {
              id: string;
              name: string;
              rarity: string;
              price: string;
              weapon_type?: string;
              skin_name?: string;
              image_url?: string;
            };
            case_template?: {
              id: string;
              name: string;
              description?: string;
              image_url?: string;
              price?: string;
            };
            source?: string;
            status?: string;
            acquisition_date?: string;
            case_template_id?: string;
            item_id?: string;
            case_id?: string;
            transaction_date?: string;
            expires_at?: string;
          }>;
          inventoryPagination?: {
            total: number;
            page: number;
            limit: number;
            totalPages: number;
            hasMore: boolean;
          };
          caseItems?: Array<{
            id: string;
            item_type?: string;
            item?: {
              id: string;
              name: string;
              rarity: string;
              price: string;
              weapon_type?: string;
              skin_name?: string;
              image_url?: string;
            };
            case_template?: {
              id: string;
              name: string;
              description?: string;
              image_url?: string;
              price?: string;
            };
            source?: string;
            status?: string;
            acquisition_date?: string;
            case_template_id?: string;
            item_id?: string;
            case_id?: string;
            transaction_date?: string;
            expires_at?: string;
          }>;
          caseItemsPagination?: {
            total: number;
            page: number;
            limit: number;
            totalPages: number;
            hasMore: boolean;
          };
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
          steam_avatar_url?: string;
          steam_profile?: {
            personaname?: string;
            profileurl?: string;
            avatar?: string;
            avatarmedium?: string;
            avatarfull?: string;
          };
        };
      },
      { userId: string; page?: number; limit?: number; tab?: 'active' | 'opened' }
    >({
      query: ({ userId, page = 1, limit = 12, tab = 'active' }) => {
        const params = new URLSearchParams({
          page: page.toString(),
          limit: limit.toString(),
          tab: tab,
        });
        return `v1/users/${userId}?${params.toString()}`;
      },
    }),

    // Получение статуса вывода предмета
    getWithdrawalStatus: builder.query<
      ApiResponse<any>,
      string
    >({
      query: (withdrawalId) => `v1/withdraw-item/${withdrawalId}`,
    }),

    // Разрешение ситуации "предмет не у бота": ChiCoins или ожидание
    resolveWithdrawalNoStock: builder.mutation<
      ApiResponse<{ withdrawal_id: string; balance_added?: number; new_balance?: number; status?: string }>,
      { withdrawalId: string; action: 'chicoins' | 'wait' }
    >({
      query: ({ withdrawalId, action }) => ({
        url: `v1/withdraw-item/${withdrawalId}/resolve-no-stock`,
        method: 'POST',
        body: { action },
      }),
      invalidatesTags: ['Notifications', 'Inventory', 'Balance', 'User'],
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
      invalidatesTags: ['TicTacToe', 'Inventory', 'Cases'],
    }),

    // Tower Defense API
    getTowerDefenseStatus: builder.query<
      TowerDefenseStatusResponse,
      void
    >({
      query: () => 'v1/tower-defense/status',
      providesTags: ['TicTacToe'], // Используем тот же тег для инвалидации
    }),

    createTowerDefenseGame: builder.mutation<
      TowerDefenseCreateGameResponse,
      { inventoryItemId?: string }
    >({
      query: (data) => ({
        url: 'v1/tower-defense/new-game',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['TicTacToe', 'Inventory'],
    }),

    completeTowerDefenseGame: builder.mutation<
      TowerDefenseCompleteGameResponse,
      TowerDefenseCompleteGameRequest
    >({
      query: (data) => ({
        url: 'v1/tower-defense/complete',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['TicTacToe', 'Inventory', 'Balance'],
    }),

    getTowerDefenseStatistics: builder.query<
      TowerDefenseStatisticsResponse,
      void
    >({
      query: () => 'v1/tower-defense/statistics',
      providesTags: ['TicTacToe'],
    }),

    // Upgrade API
    getUserUpgradeableItems: builder.query<
      ApiResponse<{
        items: Array<{
          item: {
            id: string;
            name: string;
            image_url: string;
            price: number;
            rarity: string;
            weapon_type?: string;
          };
          instances: Array<{
            id: string;
            status: string;
          }>;
          count: number;
        }>;
      }>,
      void
    >({
      query: () => 'v1/upgrade/items',
      providesTags: ['Inventory'],
    }),

    getUpgradeOptions: builder.query<
      ApiResponse<{
        source_items: Array<{
          id: string;
          name: string;
          image_url: string;
          price: number;
          rarity: string;
          weapon_type?: string;
        }>;
        total_source_price: number;
        upgrade_options: Array<{
          id: string;
          name: string;
          image_url: string;
          price: number;
          rarity: string;
          weapon_type?: string;
          upgrade_chance: number;
          price_ratio: number;
          base_chance: number;
          cheap_target_bonus: number;
          expected_value?: number;
          isProfitable?: boolean;
        }>;
      }>,
      string | string[]
    >({
      query: (inventoryIds) => {
        // ИСПРАВЛЕНО: Теперь отправляем inventoryIds вместо itemIds
        if (Array.isArray(inventoryIds)) {
          return `v1/upgrade/options?inventoryIds=${inventoryIds.join(',')}`;
        }
        return `v1/upgrade/options?inventoryIds=${inventoryIds}`;
      },
      providesTags: ['Inventory'],
    }),

    performUpgrade: builder.mutation<
      ApiResponse<{
        source_items: Array<{
          id: string;
          name: string;
          image_url: string;
          price: number;
          rarity: string;
          weapon_type?: string;
        }>;
        result_item?: {
          id: string;
          name: string;
          image_url: string;
          price: number;
          rarity: string;
          weapon_type?: string;
        };
        target_item?: {
          id: string;
          name: string;
          image_url: string;
          price: number;
          rarity: string;
          weapon_type?: string;
        };
        success_chance: number;
        rolled_value: number;
        total_source_price: number;
        cheap_target_bonus: number;
      }> & {
        upgrade_success: boolean;
      },
      { sourceInventoryIds: string[]; targetItemId: string }
    >({
      query: (data) => ({
        url: 'v1/upgrade/perform',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Inventory'],
    }),

    // Добавляем мутацию для пополнения баланса
    topUpBalance: builder.mutation<TopUpBalanceResponse, TopUpBalanceRequest>({
      query: (body) => ({
        url: 'v1/balance/top-up',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['User'],
    }),

    // Получение информации о валютах и курсах
    getCurrency: builder.query<
      ApiResponse<{
        currentCurrency: string;
        currencySymbol: string;
        chicoinsSymbol: string;
        exchangeRates: ExchangeRates;
        lastUpdated: string | null;
        supportedCurrencies: string[];
        topUpPackages: Array<{
          id: string;
          chicoins: number;
          bonus: number;
          totalChicoins: number;
          price: number;
          currency: string;
          currencySymbol: string;
          popular?: boolean;
        }>;
        conversionInfo: {
          base: string;
          formula: string;
          note: string;
        };
      }>,
      { currency?: string } | void
    >({
      query: (params) => {
        const currency = params && 'currency' in params ? params.currency : undefined;
        return currency ? `v1/currency?currency=${currency}` : 'v1/currency';
      },
    }),

    // DISABLED - Avatar upload/delete (only Steam avatars allowed)
    // uploadAvatar: builder.mutation<
    //   ApiResponse<{ avatar_url: string }>,
    //   FormData
    // >({
    //   query: (formData) => ({
    //     url: 'v1/profile/avatar',
    //     method: 'POST',
    //     body: formData,
    //     // Не устанавливаем Content-Type - браузер автоматически установит multipart/form-data с boundary для FormData
    //   }),
    //   invalidatesTags: ['User'],
    //   // Обновляем данные пользователя в authSlice после успешной загрузки
    //   async onQueryStarted(_, { dispatch, queryFulfilled }) {
    //     try {
    //       const { data } = await queryFulfilled;
    //       if (data.success && data.data?.avatar_url) {
    //         // Импортируем updateUser action из authSlice
    //         const { updateUser } = await import('../auth/authSlice');
    //         dispatch(updateUser({ avatar_url: data.data.avatar_url }));
    //       }
    //     } catch (error) {
    //       console.error('Error updating avatar in authSlice:', error);
    //     }
    //   },
    // }),

    // deleteAvatar: builder.mutation<ApiResponse<null>, void>({
    //   query: () => ({
    //     url: 'v1/profile/avatar',
    //     method: 'DELETE',
    //   }),
    //   invalidatesTags: ['User'],
    //   // Обновляем данные пользователя в authSlice после успешного удаления
    //   async onQueryStarted(_, { dispatch, queryFulfilled }) {
    //     try {
    //       await queryFulfilled;
    //       // Импортируем updateUser action из authSlice
    //       const { updateUser } = await import('../auth/authSlice');
    //       dispatch(updateUser({ avatar_url: undefined }));
    //     } catch (error) {
    //       console.error('Error updating avatar in authSlice after delete:', error);
    //     }
    //   },
    // }),

    // Получение списка доступных аватаров
    getAvatars: builder.query<ApiResponse<{ avatars: Array<{ filename: string; url: string; fullUrl: string }> }>, void>({
      query: () => 'v1/avatars',
    }),

    // Обновление аватара пользователя
    updateAvatar: builder.mutation<ApiResponse<{ avatar_url: string; fullUrl: string }>, { avatar_url: string }>({
      query: (body) => ({
        url: 'v1/avatar',
        method: 'PUT',
        body,
      }),
      invalidatesTags: ['User'],
      // Обновляем данные пользователя в authSlice после успешного обновления
      async onQueryStarted(_, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          if (data.success && data.data?.avatar_url) {
            // Импортируем updateUser action из authSlice
            const { updateUser } = await import('../auth/authSlice');
            dispatch(updateUser({ avatar_url: data.data.avatar_url }));
          }
        } catch {
          // invalidatesTags обновит данные
        }
      },
    }),
  }),
});

// Экспортируем хуки для использования в компонентах
export const {
  useGetUserBalanceQuery,
  useGetUserInventoryQuery,
  useSellItemMutation,
  useWithdrawItemMutation,
  useCancelWithdrawalMutation,
  useCheckWithdrawalStatusesMutation,
  useGetUserAchievementsQuery,
  useGetAchievementsProgressQuery,
  useGetUserMissionsQuery,
  useGetUserNotificationsQuery,
  useGetUnreadNotificationsCountQuery,
  useMarkNotificationAsReadMutation,
  useMarkAllNotificationsAsReadMutation,
  useGetUserTransactionsQuery,
  useGetPaymentHistoryQuery,
  useGetUserStatisticsQuery,
  useGetGlobalStatisticsQuery,
  useGetUserSubscriptionQuery,
  useApplyPromoCodeMutation,
  useGetLeaderboardQuery,
  useGetBonusStatusQuery,
  useGetSafeCrackerStatusQuery,
  usePlaySafeCrackerMutation,
  useResetBonusCooldownMutation,

  useExchangeItemForSubscriptionMutation,
  useGetBonusInfoQuery,
  useSteamBotLoginMutation,
  useSendSteamTradeMutation,
  useGetSteamInventoryQuery,
  useGetPublicProfileQuery,
  useGetWithdrawalStatusQuery,
  useResolveWithdrawalNoStockMutation,
  useResendVerificationCodeMutation,
  useVerifyEmailMutation,
  useUpdateUserProfileMutation,

  // Крестики-нолики хуки
  useCreateTicTacToeGameMutation,
  useGetCurrentTicTacToeGameQuery,
  useMakeTicTacToeMoveMutation,

  // Tower Defense hooks
  useGetTowerDefenseStatusQuery,
  useCreateTowerDefenseGameMutation,
  useCompleteTowerDefenseGameMutation,
  useGetTowerDefenseStatisticsQuery,

  // Upgrade хуки
  useGetUserUpgradeableItemsQuery,
  useGetUpgradeOptionsQuery,
  usePerformUpgradeMutation,

  // Пополнение баланса хук
  useTopUpBalanceMutation,

  // Валюты хук
  useGetCurrencyQuery,

  // DISABLED - Аватар хуки (only Steam avatars allowed)
  // useUploadAvatarMutation,
  // useDeleteAvatarMutation,

  // Аватар хуки (выбор из предустановленных)
  useGetAvatarsQuery,
  useUpdateAvatarMutation,
} = userApi;
